export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/admin') {
      return new Response(ADMIN_HTML, {
        headers: { 'content-type': 'text/html; charset=utf-8' }
      });
    }

    if (url.pathname.indexOf('/api/') === 0) {
      return handleApiRequest(request, env, url);
    }

    if (url.pathname === '/relay') {
      const referer = request.headers.get('referer') || '';
      const secFetchSite = request.headers.get('sec-fetch-site') || '';
      const isSameOrigin = referer.indexOf(url.origin) === 0
        || secFetchSite === 'same-origin'
        || secFetchSite === 'same-site';
      if (!isSameOrigin) {
        return new Response('forbidden: relay is restricted to this site', { status: 403 });
      }

      const target = url.searchParams.get('url');
      if (!target) {
        return new Response('missing url', { status: 400 });
      }
      let targetUrl;
      try {
        targetUrl = new URL(target);
      } catch (e) {
        return new Response('invalid url', { status: 400 });
      }

      if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
        return new Response('forbidden: relay only supports http and https', { status: 403 });
      }

      if (isPrivateOrReservedHost(targetUrl.hostname)) {
        return new Response('forbidden: relay does not allow private or reserved host', { status: 403 });
      }

      const range = request.headers.get('range');
      const customUa = url.searchParams.get('ua');
      const hasCustomReferer = url.searchParams.has('referer');
      const customReferer = url.searchParams.get('referer');
      const attempts = [];
      if (customUa || hasCustomReferer) {
        attempts.push({ ua: customUa || DESKTOP_UA, referer: customReferer || null });
      }
      attempts.push({ ua: DESKTOP_UA, referer: targetUrl.origin + '/' });
      attempts.push({ ua: DESKTOP_UA, referer: null });
      attempts.push({ ua: MOBILE_UA,  referer: null });

      const useSocket = !isStandardPort(targetUrl);

      try {
        let upstream = null;
        let lastErr = null;
        let lastStatus = null;

        for (const a of attempts) {
          try {
            let resp;
            if (useSocket) {
              resp = await fetchViaSocket(targetUrl, { ua: a.ua, referer: a.referer, range });
            } else {
              const h = { 'user-agent': a.ua, 'accept': '*/*' };
              if (range) h['range'] = range;
              if (a.referer) h['referer'] = a.referer;
              resp = await fetch(target, { headers: h });
            }
            if ((resp.status >= 200 && resp.status < 300) || resp.status === 206) {
              upstream = resp;
              break;
            }
            lastStatus = resp.status;
            upstream = resp;
          } catch (e) {
            lastErr = e.message;
          }
        }

        if (!upstream) {
          return new Response('relay failed: ' + (lastErr || ('upstream returned ' + lastStatus)), { status: 502 });
        }
        if (!((upstream.status >= 200 && upstream.status < 300) || upstream.status === 206)) {
          return new Response('relay failed: upstream returned ' + upstream.status, { status: 502 });
        }

        const headers = new Headers();
        headers.set('access-control-allow-origin', '*');
        headers.set('content-type', upstream.headers.get('content-type') || 'application/octet-stream');
        headers.set('x-final-url', upstream.url || target);
        const cl = upstream.headers.get('content-length');
        if (cl) headers.set('content-length', cl);
        const cr = upstream.headers.get('content-range');
        if (cr) headers.set('content-range', cr);
        headers.set('accept-ranges', upstream.headers.get('accept-ranges') || 'bytes');
        headers.set('cache-control', 'no-cache');

        return new Response(upstream.body, {
          status: upstream.status,
          headers: headers
        });
      } catch (e) {
        return new Response('relay failed: ' + e.message, { status: 502 });
      }
    }

    return new Response(HTML_PAGE, {
      headers: { 'content-type': 'text/html; charset=utf-8' }
    });
  }
};
