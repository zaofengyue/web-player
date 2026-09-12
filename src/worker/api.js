function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

function parseCookies(request) {
  const header = request.headers.get('cookie') || '';
  const map = {};
  header.split(';').forEach(function(part) {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) map[k] = decodeURIComponent(v);
  });
  return map;
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(function(b) {
    return b.toString(16).padStart(2, '0');
  }).join('');
}

function genToken() {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
}

const SESSION_TTL_SECONDS = 7 * 24 * 3600;

async function isAdminRequest(request, env) {
  if (!env || !env.PLAYER_KV) return false;
  const cookies = parseCookies(request);
  const token = cookies['admin_session'];
  if (!token) return false;
  const val = await env.PLAYER_KV.get('session:' + token);
  return val === '1';
}

function adminCookieHeader(token, maxAgeSeconds) {
  return 'admin_session=' + token + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=' + maxAgeSeconds;
}

function clearAdminCookieHeader() {
  return 'admin_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
}

async function getSourcesFromKV(env) {
  if (!env || !env.PLAYER_KV) return [];
  try {
    const raw = await env.PLAYER_KV.get('sources');
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

async function saveSourcesToKV(env, list) {
  await env.PLAYER_KV.put('sources', JSON.stringify(list));
}

async function handleApiRequest(request, env, url) {
  const path = url.pathname;
  const method = request.method;

  if (path === '/api/sources' && method === 'GET') {
    const list = await getSourcesFromKV(env);
    return jsonResponse(list);
  }

  if (path === '/api/favorites' && method === 'GET') {
    const sync = url.searchParams.get('sync') || '';
    if (!sync || !env || !env.PLAYER_KV) return jsonResponse({ favorites: [] });
    const hash = await sha256Hex('fav:' + sync);
    const raw = await env.PLAYER_KV.get('fav:' + hash);
    let favorites = [];
    try { favorites = raw ? JSON.parse(raw) : []; } catch (e) { favorites = []; }
    return jsonResponse({ favorites: favorites });
  }

  if (path === '/api/favorites' && method === 'POST') {
    if (!env || !env.PLAYER_KV) return jsonResponse({ error: 'KV 未绑定' }, 500);
    let body;
    try { body = await request.json(); } catch (e) { return jsonResponse({ error: '请求体不是有效 JSON' }, 400); }
    const sync = (body && typeof body.sync === 'string') ? body.sync.trim() : '';
    if (!sync) return jsonResponse({ error: '缺少同步码' }, 400);
    const favorites = Array.isArray(body.favorites) ? body.favorites : [];
    const hash = await sha256Hex('fav:' + sync);
    await env.PLAYER_KV.put('fav:' + hash, JSON.stringify(favorites));
    return jsonResponse({ ok: true, count: favorites.length });
  }

  if (path === '/api/admin/login' && method === 'POST') {
    if (!env || !env.PLAYER_KV) return jsonResponse({ error: 'KV 未绑定' }, 500);
    if (!env.ADMIN_PASSWORD) return jsonResponse({ error: '后台未配置管理员密码(ADMIN_PASSWORD)' }, 500);
    let body;
    try { body = await request.json(); } catch (e) { return jsonResponse({ error: '请求体不是有效 JSON' }, 400); }
    const password = (body && typeof body.password === 'string') ? body.password : '';
    const isPasswordCorrect = await timingSafeEqualStr(password, env.ADMIN_PASSWORD);
    if (!isPasswordCorrect) {
      return jsonResponse({ error: '密码错误' }, 401);
    }
    const token = genToken();
    await env.PLAYER_KV.put('session:' + token, '1', { expirationTtl: SESSION_TTL_SECONDS });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'set-cookie': adminCookieHeader(token, SESSION_TTL_SECONDS)
      }
    });
  }

  if (path === '/api/admin/logout' && method === 'POST') {
    const cookies = parseCookies(request);
    const token = cookies['admin_session'];
    if (token && env && env.PLAYER_KV) {
      await env.PLAYER_KV.delete('session:' + token);
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'set-cookie': clearAdminCookieHeader()
      }
    });
  }

  if (path === '/api/admin/check' && method === 'GET') {
    const ok = await isAdminRequest(request, env);
    return jsonResponse({ ok: ok });
  }

  if (path === '/api/admin/sources') {
    const ok = await isAdminRequest(request, env);
    if (!ok) return jsonResponse({ error: '未登录或登录已过期' }, 401);

    if (method === 'GET') {
      const list = await getSourcesFromKV(env);
      return jsonResponse(list);
    }

    if (method === 'POST') {
      let body;
      try { body = await request.json(); } catch (e) { return jsonResponse({ error: '请求体不是有效 JSON' }, 400); }
      const name = (body && typeof body.name === 'string' && body.name.trim()) ? body.name.trim() : '未命名源';
      const raw = (body && typeof body.raw === 'string') ? body.raw.trim() : '';
      if (!raw) return jsonResponse({ error: '源内容不能为空' }, 400);
      const list = await getSourcesFromKV(env);
      const item = { id: crypto.randomUUID(), name: name, raw: raw };
      list.push(item);
      await saveSourcesToKV(env, list);
      return jsonResponse(item, 201);
    }

    if (method === 'PUT') {
      let body;
      try { body = await request.json(); } catch (e) { return jsonResponse({ error: '请求体不是有效 JSON' }, 400); }
      const id = body && body.id;
      if (!id) return jsonResponse({ error: '缺少 id' }, 400);
      const list = await getSourcesFromKV(env);
      const idx = list.findIndex(function(s) { return s.id === id; });
      if (idx === -1) return jsonResponse({ error: '未找到该源' }, 404);
      if (typeof body.name === 'string' && body.name.trim()) list[idx].name = body.name.trim();
      if (typeof body.raw === 'string' && body.raw.trim()) list[idx].raw = body.raw.trim();
      await saveSourcesToKV(env, list);
      return jsonResponse(list[idx]);
    }

    if (method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) return jsonResponse({ error: '缺少 id' }, 400);
      const list = await getSourcesFromKV(env);
      const next = list.filter(function(s) { return s.id !== id; });
      await saveSourcesToKV(env, next);
      return jsonResponse({ ok: true });
    }
  }

  return jsonResponse({ error: 'not found' }, 404);
}
