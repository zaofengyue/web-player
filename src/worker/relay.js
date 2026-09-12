import { connect } from 'cloudflare:sockets';

const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const MOBILE_UA  = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';

function isStandardPort(u) {
  const port = u.port ? parseInt(u.port, 10) : (u.protocol === 'https:' ? 443 : 80);
  return (u.protocol === 'https:' && port === 443) || (u.protocol === 'http:' && port === 80);
}

function concatBytes(a, b) {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function findHeaderEnd(buf) {
  for (let i = 0; i < buf.length; i++) {
    // 匹配 \r\n\r\n
    if (i + 3 < buf.length && buf[i] === 13 && buf[i + 1] === 10 && buf[i + 2] === 13 && buf[i + 3] === 10) {
      return { end: i + 4, delimLen: 4 };
    }
    // 容错匹配部分非标源的 \n\n
    if (i + 1 < buf.length && buf[i] === 10 && buf[i + 1] === 10) {
      return { end: i + 2, delimLen: 2 };
    }
  }
  return null;
}

function findCRLF(buf, from) {
  for (let i = from; i < buf.length; i++) {
    if (buf[i] === 10) {
      return i; // 匹配到换行符 (\n)
    }
  }
  return -1;
}

async function fetchViaSocket(targetUrl, { ua, referer, range } = {}) {
  const port = targetUrl.port ? parseInt(targetUrl.port, 10) : (targetUrl.protocol === 'https:' ? 443 : 80);
  const useTls = targetUrl.protocol === 'https:';

  const socket = connect(
    { hostname: targetUrl.hostname, port: port },
    useTls ? { secureTransport: 'on' } : {}
  );

  let reader = null;
  let isCleanedUp = false;
  async function cleanup() {
    if (isCleanedUp) return;
    isCleanedUp = true;
    try { if (reader) await reader.cancel(); } catch (_) {}
    try { socket.close(); } catch (_) {}
  }

  try {
    const path = (targetUrl.pathname || '/') + (targetUrl.search || '');
    const lines = [
      'GET ' + path + ' HTTP/1.1',
      'Host: ' + targetUrl.hostname,
      'User-Agent: ' + (ua || DESKTOP_UA),
      'Accept: */*',
      'Connection: close'
    ];
    if (referer) lines.push('Referer: ' + referer);
    if (range) lines.push('Range: ' + range);
    lines.push('', '');

    const writer = socket.writable.getWriter();
    await writer.write(new TextEncoder().encode(lines.join('\r\n')));
    writer.releaseLock();

    reader = socket.readable.getReader();

    let buf = new Uint8Array(0);
    let headerInfo = null;
    while (!headerInfo) {
      const { value, done } = await reader.read();
      if (done) break;
      buf = concatBytes(buf, value);
      headerInfo = findHeaderEnd(buf);
      if (!headerInfo && buf.length > 131072) throw new Error('响应头过大或格式异常');
    }
    if (!headerInfo) throw new Error('未收到有效的 HTTP 响应(连接可能被拒绝或超时)');

    const headerText = new TextDecoder('utf-8').decode(buf.slice(0, headerInfo.end - headerInfo.delimLen));
    let bodyStart = buf.slice(headerInfo.end);
    const headerLines = headerText.split(/\r?\n/);
    const statusMatch = (headerLines[0] || '').match(/^HTTP\/\d\.\d\s+(\d+)/);
    const status = statusMatch ? parseInt(statusMatch[1], 10) : 502;

    const respHeaders = new Headers();
    for (let i = 1; i < headerLines.length; i++) {
      const line = headerLines[i];
      if (!line) continue;
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      respHeaders.append(line.slice(0, idx).trim().toLowerCase(), line.slice(idx + 1).trim());
    }

    const contentLength = respHeaders.has('content-length') ? parseInt(respHeaders.get('content-length'), 10) : null;
    const isChunked = (respHeaders.get('transfer-encoding') || '').toLowerCase().includes('chunked');

    const body = new ReadableStream({
      async start(controller) {
        try {
          if (isChunked) {
            let pending = bodyStart;
            async function fill(minLen) {
              while (pending.length < minLen) {
                const { value, done } = await reader.read();
                if (done) return false;
                pending = concatBytes(pending, value);
              }
              return true;
            }
            while (true) {
              let lineEnd = findCRLF(pending, 0);
              while (lineEnd === -1) {
                const { value, done } = await reader.read();
                if (done) break;
                pending = concatBytes(pending, value);
                lineEnd = findCRLF(pending, 0);
              }
              if (lineEnd === -1) break;
              const sizeLine = new TextDecoder().decode(pending.slice(0, lineEnd)).trim();
              const size = parseInt(sizeLine.split(';')[0], 16);
              if (isNaN(size) || size < 0) break;
              // 移除 sizeLine 及其后可能跟随的 \r? \n
              pending = pending.slice(lineEnd + 1);
              if (!size) break;
              const ok = await fill(size + 1);
              if (!ok && pending.length < size) break;
              controller.enqueue(pending.slice(0, size));
              pending = pending.slice(size);
              // 跳过 chunk 数据后的 CRLF
              let trail = findCRLF(pending, 0);
              if (trail !== -1 && trail <= 2) {
                pending = pending.slice(trail + 1);
              }
            }
          } else if (contentLength !== null) {
            let remaining = contentLength - bodyStart.length;
            if (bodyStart.length) controller.enqueue(bodyStart);
            while (remaining > 0) {
              const { value, done } = await reader.read();
              if (done) break;
              const take = value.length > remaining ? value.slice(0, remaining) : value;
              controller.enqueue(take);
              remaining -= take.length;
            }
          } else {
            if (bodyStart.length) controller.enqueue(bodyStart);
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          }
          controller.close();
          await cleanup();
        } catch (e) {
          controller.error(e);
          await cleanup();
        }
      },
      async cancel(reason) {
        await cleanup();
      }
    });

    return { status, headers: respHeaders, body };
  } catch (err) {
    await cleanup();
    throw err;
  }
}

function isPrivateOrReservedHost(hostname) {
  const h = (hostname || '').toLowerCase().trim();
  if (!h || h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '0.0.0.0') return true;
  if (h.endsWith('.local') || h.endsWith('.internal') || h.endsWith('.lan') || h.endsWith('.home')) return true;
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (m) {
    const a = parseInt(m[1], 10);
    const b = parseInt(m[2], 10);
    if (a === 0 || a === 127) return true;
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
  }
  return false;
}

async function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const enc = new TextEncoder();
  const aHash = await crypto.subtle.digest('SHA-256', enc.encode(a));
  const bHash = await crypto.subtle.digest('SHA-256', enc.encode(b));
  return crypto.subtle.timingSafeEqual(aHash, bHash);
}
