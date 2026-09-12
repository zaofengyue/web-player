(function(){
  function debugWarn(tag, err) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[风月Player:' + tag + ']', err);
    }
  }

  const video = document.getElementById('video');
  const imagePreview = document.getElementById('imagePreview');
  const audioCover = document.getElementById('audioCover');
  const audioCoverTitle = document.getElementById('audioCoverTitle');
  const overlay = document.getElementById('overlay');
  const urlInput = document.getElementById('urlInput');
  const playBtn = document.getElementById('playBtn');
  const clearBtn = document.getElementById('clearBtn');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const typePill = document.getElementById('typePill');
  const channelList = document.getElementById('channelList');
  const channelSearch = document.getElementById('channelSearch');
  const m3uCount = document.getElementById('m3uCount');
  const sourceList = document.getElementById('sourceList');
  const sourceCount = document.getElementById('sourceCount');
  const videoWrap = document.getElementById('videoWrap');
  const mediaRotator = document.getElementById('mediaRotator');
  const rotateBtn = document.getElementById('rotateBtn');
  const flipHBtn = document.getElementById('flipHBtn');
  const flipVBtn = document.getElementById('flipVBtn');
  const resetTransformBtn = document.getElementById('resetTransformBtn');
  const landscapeBtn = document.getElementById('landscapeBtn');
  const castBtn = document.getElementById('castBtn');
  const pipBtn = document.getElementById('pipBtn');
  const prevSourceBtn = document.getElementById('prevSourceBtn');
  const nextSourceBtn = document.getElementById('nextSourceBtn');
  const swipeToast = document.getElementById('swipeToast');
  const fullscreenHint = document.getElementById('fullscreenHint');
  const sidebarPanel = document.getElementById('sidebarPanel');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const menuFab = document.getElementById('menuFab');
  const menuFabBadge = document.getElementById('menuFabBadge');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  const mainContainer = document.querySelector('.container');
  const favoriteList = document.getElementById('favoriteList');
  const favCount = document.getElementById('favCount');
  const exportSourcesBtn = document.getElementById('exportSourcesBtn');
  const importSourcesBtn = document.getElementById('importSourcesBtn');
  const importFileInput = document.getElementById('importFileInput');
  const syncCodeInput = document.getElementById('syncCodeInput');
  const syncPullBtn = document.getElementById('syncPullBtn');
  const syncPushBtn = document.getElementById('syncPushBtn');
  const MOBILE_QUERY = window.matchMedia('(max-width: 860px)');

  function openDrawer(){
    if (!MOBILE_QUERY.matches) return;
    sidebarPanel.classList.add('open');
    sidebarBackdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer(){
    sidebarPanel.classList.remove('open');
    sidebarBackdrop.classList.remove('show');
    document.body.style.overflow = '';
  }
  function toggleDrawer(){
    if (sidebarPanel.classList.contains('open')) closeDrawer();
    else openDrawer();
  }
  function updateFabBadge(count){
    if (count > 0) {
      menuFabBadge.textContent = count > 99 ? '99+' : String(count);
      menuFabBadge.style.display = 'flex';
    } else {
      menuFabBadge.style.display = 'none';
    }
  }

  function setSidebarCollapsed(collapsed){
    mainContainer.classList.toggle('sidebar-collapsed', collapsed);
    sidebarToggleBtn.classList.toggle('active', collapsed);
    sidebarToggleBtn.title = collapsed ? '显示侧边栏' : '隐藏侧边栏';
    try { localStorage.setItem('sidebarCollapsed', collapsed ? '1' : '0'); } catch(e){}
  }
  function toggleSidebarPanel(){
    if (MOBILE_QUERY.matches) {
      toggleDrawer();
    } else {
      setSidebarCollapsed(!mainContainer.classList.contains('sidebar-collapsed'));
    }
  }
  try {
    if (!MOBILE_QUERY.matches && localStorage.getItem('sidebarCollapsed') === '1') {
      setSidebarCollapsed(true);
    }
  } catch(e){}

  menuFab.addEventListener('click', toggleDrawer);
  sidebarToggleBtn.addEventListener('click', toggleSidebarPanel);
  sidebarCloseBtn.addEventListener('click', closeDrawer);
  sidebarBackdrop.addEventListener('click', closeDrawer);
  MOBILE_QUERY.addEventListener('change', function(e){
    if (!e.matches) closeDrawer();
  });

  [syncCodeInput].forEach(function(el){
    el.addEventListener('focus', function(){
      setTimeout(function(){
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 300);
    });
  });

  let hls = null;
  let flvPlayer = null;
  let tsPlayer = null;
  let dashPlayer = null;
  let channels = [];
  let filteredIdx = [];
  let activeIndex = -1;
  let activeLineIdx = 0;
  let sources = [];
  let currentSourceId = null;
  let favorites = [];
  let rotateDeg = 0;
  let flipH = false;
  let flipV = false;
  let landscapeForced = false;
  let hintTimer = null;
  let pyodideInstance = null;
  let pyodideLoadingPromise = null;

  function showAudioCover(title){
    audioCoverTitle.textContent = title || '音频播放中';
    audioCover.style.display = 'flex';
  }
  function hideAudioCover(){
    audioCover.style.display = 'none';
    audioCover.classList.remove('playing');
  }

  const STORAGE_CURRENT = 'm3u_current_v1';
  const STORAGE_FAVORITES = 'm3u_favorites_v1';
  const STORAGE_SOURCE_FAV = 'm3u_source_fav_ids_v1';
  const STORAGE_SYNC_CODE = 'm3u_sync_code_v1';

  let sourceFavIds = [];
  let syncCode = '';

  function loadCurrentSourceId(){
    currentSourceId = localStorage.getItem(STORAGE_CURRENT) || null;
  }

  function saveCurrentSourceId(){
    try {
      if (currentSourceId) localStorage.setItem(STORAGE_CURRENT, currentSourceId);
      else localStorage.removeItem(STORAGE_CURRENT);
    } catch(e) {}
  }

  function loadSourceFavIds(){
    try {
      const raw = localStorage.getItem(STORAGE_SOURCE_FAV);
      sourceFavIds = raw ? JSON.parse(raw) : [];
    } catch(e) { sourceFavIds = []; }
  }

  function saveSourceFavIds(){
    try { localStorage.setItem(STORAGE_SOURCE_FAV, JSON.stringify(sourceFavIds)); } catch(e) {}
  }

  function toggleSourceFav(id){
    const idx = sourceFavIds.indexOf(id);
    if (idx !== -1) sourceFavIds.splice(idx, 1);
    else sourceFavIds.push(id);
    saveSourceFavIds();
  }

  async function fetchSourcesFromServer(){
    try {
      const res = await fetch('/api/sources');
      if (!res.ok) throw new Error('状态码 ' + res.status);
      const data = await res.json();
      sources = Array.isArray(data) ? data.map(function(s){
        return { id: s.id, name: s.name, raw: s.raw, format: '' };
      }) : [];
      if (currentSourceId && !sources.some(function(s){ return s.id === currentSourceId; })) {
        currentSourceId = null;
      }
    } catch(e) {
      sources = [];
      setStatus('加载源列表失败: ' + e.message, 'err');
    }
  }

  function loadFavoritesFromStorage(){
    try {
      const raw = localStorage.getItem(STORAGE_FAVORITES);
      favorites = raw ? JSON.parse(raw) : [];
    } catch(e) { favorites = []; }
  }

  function saveFavoritesToStorage(){
    try {
      localStorage.setItem(STORAGE_FAVORITES, JSON.stringify(favorites));
    } catch(e) {}
  }

  function loadSyncCode(){
    syncCode = localStorage.getItem(STORAGE_SYNC_CODE) || '';
  }

  function saveSyncCode(code){
    syncCode = code;
    try {
      if (code) localStorage.setItem(STORAGE_SYNC_CODE, code);
      else localStorage.removeItem(STORAGE_SYNC_CODE);
    } catch(e) {}
  }

  async function pullFavoritesFromCloud(silent){
    if (!syncCode) { if (!silent) setStatus('请先输入同步码', 'err'); return; }
    try {
      const res = await fetch('/api/favorites?sync=' + encodeURIComponent(syncCode));
      if (!res.ok) throw new Error('状态码 ' + res.status);
      const data = await res.json();
      favorites = sanitizeImportedFavorites(data.favorites || []);
      saveFavoritesToStorage();
      renderFavorites();
      renderChannels();
      if (!silent) setStatus('已从云端拉取 ' + favorites.length + ' 个收藏', 'live');
    } catch(e) {
      if (!silent) setStatus('拉取失败: ' + e.message, 'err');
    }
  }

  async function pushFavoritesToCloud(silent){
    if (!syncCode) { if (!silent) setStatus('请先输入同步码', 'err'); return; }
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sync: syncCode, favorites: favorites })
      });
      if (!res.ok) throw new Error('状态码 ' + res.status);
      if (!silent) setStatus('已推送 ' + favorites.length + ' 个收藏到云端', 'live');
    } catch(e) {
      if (!silent) setStatus('推送失败: ' + e.message, 'err');
    }
  }


  function favKeyOf(ch){
    const firstUrl = (ch && ch.urls && ch.urls[0]) ? ch.urls[0] : '';
    return (ch && ch.name ? ch.name : '') + '||' + firstUrl;
  }

  function isFavorited(ch){
    const key = favKeyOf(ch);
    return favorites.some(function(f){ return favKeyOf(f) === key; });
  }

  function toggleFavoriteChannel(ch){
    const key = favKeyOf(ch);
    const idx = favorites.findIndex(function(f){ return favKeyOf(f) === key; });
    if (idx !== -1) {
      favorites.splice(idx, 1);
    } else {
      favorites.push({
        name: ch.name,
        logo: ch.logo || '',
        group: ch.group || '',
        urls: dedupUrls(ch.urls || [])
      });
    }
    saveFavoritesToStorage();
    renderFavorites();
    renderChannels();
    if (syncCode) pushFavoritesToCloud(true);
  }

  function playFavoriteChannel(fav){
    if (!fav || !fav.urls || !fav.urls.length) return;
    activeIndex = -1;
    activeLineIdx = 0;
    const idxInChannels = channels.findIndex(function(c){ return favKeyOf(c) === favKeyOf(fav); });
    if (idxInChannels !== -1) {
      selectChannel(idxInChannels);
      return;
    }
    urlInput.value = fav.urls[0];
    renderChannels();
    playUrl(fav.urls[0]);
    showSwipeToast(fav.name);
    closeDrawer();
  }

  function renderFavorites(){
    favCount.textContent = favorites.length;
    if (favorites.length === 0) {
      favoriteList.innerHTML = '<div class="empty-tip">暂无收藏，点击频道旁的 ☆ 即可收藏</div>';
      return;
    }
    favoriteList.innerHTML = '';
    favorites.forEach(function(fav){
      const item = document.createElement('div');
      item.className = 'channel-item';
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      if (fav.logo) {
        let triedRelay = false;
        img.onerror = function(){
          if (!triedRelay) {
            triedRelay = true;
            this.src = '/relay?url=' + encodeURIComponent(fav.logo);
          } else {
            this.onerror = null;
            this.src = PLACEHOLDER_LOGO;
          }
        };
        img.src = fav.logo;
      } else {
        img.src = PLACEHOLDER_LOGO;
      }
      const name = document.createElement('div');
      name.className = 'ch-name';
      name.textContent = fav.name;
      item.appendChild(img);
      item.appendChild(name);
      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn star fav';
      delBtn.title = '取消收藏';
      delBtn.textContent = '★';
      delBtn.addEventListener('click', function(e){
        e.stopPropagation();
        toggleFavoriteChannel(fav);
      });
      item.appendChild(delBtn);
      if (fav.urls && fav.urls.length > 1) {
        const lines = document.createElement('span');
        lines.className = 'ch-lines';
        lines.textContent = fav.urls.length + '线';
        item.appendChild(lines);
      }
      item.addEventListener('click', function(){
        playFavoriteChannel(fav);
      });
      favoriteList.appendChild(item);
    });
  }

  function pad2(n){ return n < 10 ? '0' + n : String(n); }

  function buildBackupPayload(){
    const now = new Date();
    return {
      app: '风月 Player',
      backupVersion: 2,
      exportedAt: now.toISOString(),
      favorites: favorites
    };
  }

  function downloadBackupFile(){
    const payload = buildBackupPayload();
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const now = new Date();
    const stamp = now.getFullYear() + pad2(now.getMonth() + 1) + pad2(now.getDate()) +
      '-' + pad2(now.getHours()) + pad2(now.getMinutes());
    const filename = '收藏备份-' + stamp + '.json';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    setStatus('已导出备份文件「' + filename + '」，共 ' + favorites.length + ' 个收藏频道', 'live');
  }

  function sanitizeImportedFavorites(list){
    if (!Array.isArray(list)) return [];
    return list.filter(function(f){ return f && typeof f === 'object' && Array.isArray(f.urls) && f.urls.length; })
      .map(function(f){
        return {
          name: (typeof f.name === 'string' && f.name.trim()) ? f.name.trim() : '收藏频道',
          logo: typeof f.logo === 'string' ? f.logo : '',
          group: typeof f.group === 'string' ? f.group : '',
          urls: dedupUrls(f.urls.filter(function(u){ return typeof u === 'string'; }))
        };
      });
  }

  function mergeImportedFavorites(importedFavorites){
    const existingKeys = new Set(favorites.map(favKeyOf));
    let addedCount = 0;
    importedFavorites.forEach(function(f){
      const key = favKeyOf(f);
      if (existingKeys.has(key)) return;
      favorites.push(f);
      existingKeys.add(key);
      addedCount++;
    });
    return addedCount;
  }

  function handleImportFile(file){
    const reader = new FileReader();
    reader.onload = function(){
      let data;
      try {
        data = JSON.parse(String(reader.result || ''));
      } catch(e) {
        setStatus('导入失败：所选文件不是有效的 JSON 备份文件', 'err');
        return;
      }
      const importedFavorites = sanitizeImportedFavorites(data.favorites);
      if (!importedFavorites.length) {
        setStatus('导入失败：备份文件中未找到可用的收藏频道数据', 'err');
        return;
      }
      const hasExistingData = favorites.length > 0;
      let overwrite = false;
      if (hasExistingData) {
        overwrite = window.confirm(
          '检测到备份文件包含 ' + importedFavorites.length + ' 个收藏频道。\n' +
          '点击"确定"将覆盖替换当前收藏；点击"取消"将与现有收藏合并（不会删除任何现有内容）。'
        );
      }
      if (overwrite) {
        favorites = importedFavorites;
        saveFavoritesToStorage();
        renderFavorites();
        renderChannels();
        if (syncCode) pushFavoritesToCloud(true);
        setStatus('已覆盖导入：' + importedFavorites.length + ' 个收藏频道', 'live');
      } else {
        const addedFav = mergeImportedFavorites(importedFavorites);
        saveFavoritesToStorage();
        renderFavorites();
        if (syncCode) pushFavoritesToCloud(true);
        setStatus('已合并导入：新增 ' + addedFav + ' 个收藏频道(重复项已跳过)', 'live');
      }
    };
    reader.onerror = function(){
      setStatus('导入失败：文件读取出错', 'err');
    };
    reader.readAsText(file, 'utf-8');
  }

  exportSourcesBtn.addEventListener('click', function(){
    if (favorites.length === 0) {
      setStatus('暂无可导出的收藏频道', 'err');
      return;
    }
    downloadBackupFile();
  });
  importSourcesBtn.addEventListener('click', function(){
    importFileInput.value = '';
    importFileInput.click();
  });
  importFileInput.addEventListener('change', function(){
    const file = importFileInput.files && importFileInput.files[0];
    if (file) handleImportFile(file);
  });

  function setStatus(text, mode){
    statusText.textContent = text;
    statusDot.className = 'dot' + (mode === 'live' ? ' live' : mode === 'err' ? ' err' : '');
  }

  function destroyPlayers(){
    if (hls) { try{ hls.destroy(); }catch(e){} hls = null; }
    if (flvPlayer) { try{ flvPlayer.destroy(); }catch(e){} flvPlayer = null; }
    if (tsPlayer) { try{ tsPlayer.destroy(); }catch(e){} tsPlayer = null; }
    if (dashPlayer) { try{ dashPlayer.reset(); }catch(e){} dashPlayer = null; }
    hideAudioCover();
    video.removeAttribute('src');
    video.load();
    video.style.display = '';
    imagePreview.removeAttribute('src');
    imagePreview.style.display = 'none';
  }
  function applyImageAspect(){
    const iw = imagePreview.naturalWidth, ih = imagePreview.naturalHeight;
    if (!iw || !ih) return;
    let ratio = iw / ih;
    const MIN_RATIO = 9 / 18;
    const MAX_RATIO = 21 / 9;
    if (ratio < MIN_RATIO) ratio = MIN_RATIO;
    if (ratio > MAX_RATIO) ratio = MAX_RATIO;
    videoWrap.style.aspectRatio = ratio;
  }

  function applyVideoAspect(){
    const vw = video.videoWidth, vh = video.videoHeight;
    if (!vw || !vh) return;
    let ratio = vw / vh;
    const MIN_RATIO = 9 / 18;
    const MAX_RATIO = 21 / 9;
    if (ratio < MIN_RATIO) ratio = MIN_RATIO;
    if (ratio > MAX_RATIO) ratio = MAX_RATIO;
    videoWrap.style.aspectRatio = ratio;
  }
  video.addEventListener('loadedmetadata', applyVideoAspect);
  video.addEventListener('resize', applyVideoAspect);

  function applyTransform(){
    const rect = videoWrap.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    if (!w || !h) return;
    const swapped = (rotateDeg % 180) !== 0;
    const boxW = swapped ? h : w;
    const boxH = swapped ? w : h;
    mediaRotator.style.width = boxW + 'px';
    mediaRotator.style.height = boxH + 'px';
    mediaRotator.style.transform =
      'translate(-50%,-50%) rotate(' + rotateDeg + 'deg) scaleX(' + (flipH ? -1 : 1) + ') scaleY(' + (flipV ? -1 : 1) + ')';
  }
  window.addEventListener('resize', function(){ requestAnimationFrame(applyTransform); });
  window.addEventListener('orientationchange', function(){ setTimeout(applyTransform, 200); });
  if (window.ResizeObserver) {
    new ResizeObserver(function(){ requestAnimationFrame(applyTransform); }).observe(videoWrap);
  }
  if (window.screen && screen.orientation && screen.orientation.addEventListener) {
    screen.orientation.addEventListener('change', function(){ requestAnimationFrame(applyTransform); });
  }
  video.addEventListener('loadedmetadata', function(){ requestAnimationFrame(applyTransform); });

  rotateBtn.addEventListener('click', function(){
    rotateDeg = (rotateDeg + 90) % 360;
    applyTransform();
    showSwipeToast('旋转 ' + rotateDeg + '°');
  });
  flipHBtn.addEventListener('click', function(){
    flipH = !flipH;
    flipHBtn.classList.toggle('active', flipH);
    applyTransform();
    showSwipeToast(flipH ? '已开启水平翻转' : '已关闭水平翻转');
  });
  flipVBtn.addEventListener('click', function(){
    flipV = !flipV;
    flipVBtn.classList.toggle('active', flipV);
    applyTransform();
    showSwipeToast(flipV ? '已开启垂直翻转' : '已关闭垂直翻转');
  });
  resetTransformBtn.addEventListener('click', function(){
    rotateDeg = 0; flipH = false; flipV = false;
    flipHBtn.classList.remove('active');
    flipVBtn.classList.remove('active');
    applyTransform();
    showSwipeToast('已恢复默认画面');
  });

  function showFullscreenHint(){
    if (!MOBILE_QUERY.matches) return;
    if (channels.length === 0) return;
    fullscreenHint.classList.add('show');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(function(){
      fullscreenHint.classList.remove('show');
    }, 3200);
  }
  function hideFullscreenHint(){
    fullscreenHint.classList.remove('show');
    clearTimeout(hintTimer);
  }
  video.addEventListener('webkitbeginfullscreen', showFullscreenHint);
  video.addEventListener('webkitendfullscreen', hideFullscreenHint);

  async function toggleLandscape(){
    if (!landscapeForced) {
      landscapeForced = true;
      landscapeBtn.classList.add('active');
      try {
        if (videoWrap.requestFullscreen) await videoWrap.requestFullscreen();
        else if (videoWrap.webkitRequestFullscreen) videoWrap.webkitRequestFullscreen();
      } catch(e) {}
      let locked = false;
      try {
        if (window.screen && screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('landscape');
          locked = true;
        }
      } catch(e) { locked = false; }
      if (!locked) {
        videoWrap.classList.add('force-landscape');
      }
      showSwipeToast('已切换到横屏');
    } else {
      landscapeForced = false;
      landscapeBtn.classList.remove('active');
      videoWrap.classList.remove('force-landscape');
      try {
        if (window.screen && screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
      } catch(e) {}
      if (document.fullscreenElement) {
        try { await document.exitFullscreen(); } catch(e) {}
      } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
        try { document.webkitExitFullscreen(); } catch(e) {}
      }
      showSwipeToast('已切换到竖屏');
    }
    setTimeout(applyTransform, 280);
  }
  landscapeBtn.addEventListener('click', toggleLandscape);
  document.addEventListener('fullscreenchange', function(){
    if (document.fullscreenElement) {
      showFullscreenHint();
    } else if (landscapeForced) {
      landscapeForced = false;
      landscapeBtn.classList.remove('active');
      videoWrap.classList.remove('force-landscape');
      try {
        if (window.screen && screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
      } catch(e) {}
      setTimeout(applyTransform, 280);
      hideFullscreenHint();
    }
  });

  if ('remote' in video) {
    try {
      video.remote.addEventListener('connecting', function(){ setStatus('正在连接投屏设备...', ''); });
      video.remote.addEventListener('connect', function(){ setStatus('投屏中', 'live'); });
      video.remote.addEventListener('disconnect', function(){ setStatus('投屏已断开', ''); });
    } catch(e) {}
  }
  async function castStream(){
    const currentUrl = normalizeUrl(
      urlInput.value.trim() || (activeIndex >= 0 && channels[activeIndex] ? channels[activeIndex].urls[activeLineIdx] : '')
    );
    if (!currentUrl) { setStatus('请先播放一个视频再投屏', 'err'); return; }

    if ('remote' in video && typeof video.remote.prompt === 'function') {
      try {
        const type = detectType(currentUrl);
        if (type === 'm3u8' || type === 'flv' || type === 'ts') {
          if (hls) { try { hls.destroy(); } catch(e){} hls = null; }
          if (flvPlayer) { try { flvPlayer.destroy(); } catch(e){} flvPlayer = null; }
          if (tsPlayer) { try { tsPlayer.destroy(); } catch(e){} tsPlayer = null; }
          video.src = currentUrl;
        }
        setStatus('正在呼出投屏设备选择器...', '');
        await video.remote.prompt();
        setStatus('已连接投屏设备', 'live');
        return;
      } catch(e) {
        if (e && e.name === 'NotFoundError') {
          setStatus('未找到可用的投屏设备(请确认电视与本设备在同一网络)', 'err');
        } else if (e && e.name === 'AbortError') {
          setStatus('已取消投屏', '');
        } else if (e) {
          setStatus('投屏失败: ' + (e.message || e.name), 'err');
        }
        playUrl(currentUrl);
        return;
      }
    }

    if (typeof video.webkitShowPlaybackTargetPicker === 'function') {
      try {
        video.webkitShowPlaybackTargetPicker();
        setStatus('已呼出 AirPlay 选择器', 'live');
        return;
      } catch(e) {
        setStatus('AirPlay 投屏失败: ' + e.message, 'err');
        return;
      }
    }

    setStatus('当前浏览器不支持投屏，请使用最新版 Chrome / Edge / Safari 尝试', 'err');
  }
  castBtn.addEventListener('click', castStream);

  function pipSupported(){
    return (document.pictureInPictureEnabled && typeof video.requestPictureInPicture === 'function') ||
           (typeof video.webkitSupportsPresentationMode === 'function' &&
            video.webkitSupportsPresentationMode('picture-in-picture'));
  }

  async function togglePiP(){
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        return;
      }
      if (document.pictureInPictureEnabled && typeof video.requestPictureInPicture === 'function') {
        if (video.readyState === 0) {
          setStatus('请先播放视频后再开启画中画', 'err');
          return;
        }
        await video.requestPictureInPicture();
        return;
      }
      if (typeof video.webkitSupportsPresentationMode === 'function' &&
          video.webkitSupportsPresentationMode('picture-in-picture')) {
        const next = video.webkitPresentationMode === 'picture-in-picture' ? 'inline' : 'picture-in-picture';
        video.webkitSetPresentationMode(next);
        return;
      }
      setStatus('当前浏览器不支持画中画', 'err');
    } catch(e) {
      setStatus('画中画切换失败: ' + (e.message || e.name), 'err');
    }
  }
  pipBtn.addEventListener('click', togglePiP);
  video.addEventListener('enterpictureinpicture', function(){
    pipBtn.classList.add('active');
    showSwipeToast('已进入画中画');
  });
  video.addEventListener('leavepictureinpicture', function(){
    pipBtn.classList.remove('active');
    showSwipeToast('已退出画中画');
  });
  video.addEventListener('webkitpresentationmodechanged', function(){
    const inPiP = video.webkitPresentationMode === 'picture-in-picture';
    pipBtn.classList.toggle('active', inPiP);
    showSwipeToast(inPiP ? '已进入画中画' : '已退出画中画');
  });
  if (!pipSupported()) {
    pipBtn.disabled = true;
    pipBtn.title = '当前浏览器不支持画中画';
  }

  prevSourceBtn.addEventListener('click', function(){
    selectRelative(-1);
  });
  nextSourceBtn.addEventListener('click', function(){
    selectRelative(1);
  });

  function detectType(url){
    if (/^rtmp/i.test(url)) return 'rtmp';
    if (/^rtsp/i.test(url)) return 'rtsp';
    if (/^(udp|rtp):\/\//i.test(url)) return 'udp';
    if (/^mms/i.test(url)) return 'mms';
    if (/^srt:\/\//i.test(url)) return 'srt';
    const clean = url.split('?')[0].split('#')[0].toLowerCase();
    if (clean.endsWith('.m3u8')) return 'm3u8';
    if (clean.endsWith('.mpd')) return 'dash';
    if (clean.endsWith('.flv')) return 'flv';
    if (clean.endsWith('.ts')) return 'ts';
    if (clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.ogv') ||
        clean.endsWith('.mkv') || clean.endsWith('.mov') || clean.endsWith('.m4v') ||
        clean.endsWith('.3gp') || clean.endsWith('.avi')) return 'mp4';
    if (clean.endsWith('.mp3') || clean.endsWith('.m4a') || clean.endsWith('.aac') ||
        clean.endsWith('.wav') || clean.endsWith('.flac') || clean.endsWith('.ogg') ||
        clean.endsWith('.oga') || clean.endsWith('.opus') || clean.endsWith('.wma') ||
        clean.endsWith('.ape') || clean.endsWith('.aif') || clean.endsWith('.aiff')) return 'audio';
    if (clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.png') || clean.endsWith('.gif') ||
        clean.endsWith('.webp') || clean.endsWith('.bmp') || clean.endsWith('.svg') || clean.endsWith('.avif')) return 'image';
    if (/\.m3u8(\?|$)/i.test(url) || /format=m3u8|type=m3u8|hls/i.test(url)) return 'm3u8';
    if (/\.mpd(\?|$)/i.test(url) || /format=mpd|type=dash|(^|[?&])dash(=|&|$)/i.test(url)) return 'dash';
    if (/\.flv(\?|$)/i.test(url) || /format=flv|type=flv/i.test(url)) return 'flv';
    if (/\.ts(\?|$)/i.test(url) || /format=ts|type=ts|mpegts/i.test(url)) return 'ts';
    if (/\.(mp3|m4a|aac|wav|flac|ogg|oga|opus|wma|ape)(\?|$)/i.test(url) ||
        /type=audio|format=(mp3|aac|audio)/i.test(url)) return 'audio';
    if (/\/(udp|rtp|igmp)\//i.test(url)) return 'ts';
    return 'auto';
  }
  function normalizeUrl(url){
    let u = url.trim();
    let guard = 0;
    while (/%[0-9A-Fa-f]{2}/.test(u) && guard < 3) {
      let decoded;
      try { decoded = decodeURIComponent(u); } catch(e) { break; }
      if (decoded === u) break;
      if (!/^https?:\/\//i.test(decoded)) break;
      u = decoded;
      guard++;
    }
    return u;
  }
  function makeLoaderStats(){
    return {
      aborted: false, loaded: 0, retry: 0, total: 0, chunkCount: 0, bwEstimate: 0,
      loading: { start: 0, first: 0, end: 0 },
      parsing: { start: 0, end: 0 },
      buffering: { start: 0, first: 0, end: 0 }
    };
  }

  function RelayFallbackLoader(config){
    this.config = config;
    this.stats = makeLoaderStats();
    this.controller = null;
  }
  RelayFallbackLoader.prototype.destroy = function(){
    this.abort();
  };
  RelayFallbackLoader.prototype.abort = function(){
    this.stats.aborted = true;
    if (this.controller) { try { this.controller.abort(); } catch(e){} }
  };
  RelayFallbackLoader.prototype.load = function(context, config, callbacks){
    const stats = this.stats;
    const self_ = this;
    const now = function(){ return (window.performance && performance.now) ? performance.now() : Date.now(); };
    stats.loading.start = now();

    function doFetch(fetchUrl){
      self_.controller = new AbortController();
      const timeoutMs = (context.timeout) || (config && config.timeout) || 20000;
      const timer = setTimeout(function(){ try { self_.controller.abort(); } catch(e){} }, timeoutMs);
      const headers = Object.assign({}, context.headers || {});
      if (typeof context.rangeStart === 'number' && typeof context.rangeEnd === 'number') {
        headers['Range'] = 'bytes=' + context.rangeStart + '-' + (context.rangeEnd - 1);
      }
      return fetch(fetchUrl, { signal: self_.controller.signal, headers: headers })
        .then(function(resp){
          clearTimeout(timer);
          return resp;
        })
        .catch(function(e){ clearTimeout(timer); throw e; });
    }

    function readOk(resp){
      if (resp.ok || resp.status === 206) return resp;
      const err = new Error('HTTP ' + resp.status);
      err.status = resp.status;
      throw err;
    }

    function finish(resp){
      const t = now();
      stats.loading.first = t;
      stats.loading.end = t;
      const readPromise = (context.responseType === 'arraybuffer') ? resp.arrayBuffer() : resp.text();
      return readPromise.then(function(data){
        stats.loaded = stats.total = (data && data.byteLength) || (data && data.length) || 0;
        callbacks.onSuccess({ url: context.url, data: data }, stats, context, resp);
      });
    }

    doFetch(context.url).then(readOk).catch(function(){
      const relayUrl = '/relay?url=' + encodeURIComponent(context.url);
      return doFetch(relayUrl).then(function(resp){
        if (resp.ok || resp.status === 206) return resp;
        return resp.text().then(function(bodyText){
          const is403 = resp.status === 403 || /upstream returned 403/i.test(bodyText || '');
          if (is403) {
            return doFetch(context.url).then(readOk);
          }
          const err = new Error('中继失败: HTTP ' + resp.status + (bodyText ? ' (' + bodyText.slice(0,120) + ')' : ''));
          err.status = resp.status;
          throw err;
        });
      });
    }).then(finish).catch(function(e){
      if (self_.stats.aborted) return;
      stats.loading.end = now();
      callbacks.onError({ code: (e && e.status) || 0, text: (e && e.message) || '加载失败' }, context, null, stats);
    });
  };

  async function probeRedirectAndType(url){
    async function probeOnce(target, viaRelay){
      const resp = await fetch(target, { method: 'GET', redirect: 'follow', headers: { 'Range': 'bytes=0-256' } });
      if (!resp.ok && resp.status !== 206) throw new Error('HTTP ' + resp.status);
      const finalUrl = viaRelay ? (resp.headers.get('x-final-url') || url) : (resp.url || url);
      const ct = (resp.headers.get('content-type') || '').toLowerCase();
      try { if (resp.body && resp.body.cancel) resp.body.cancel(); } catch(e){}
      return { finalUrl: finalUrl, ct: ct };
    }
    let info = null;
    try { info = await probeOnce(url, false); } catch(e) { info = null; }
    if (!info) {
      try { info = await probeOnce('/relay?url=' + encodeURIComponent(url), true); } catch(e) { info = null; }
    }
    if (!info) return { type: 'auto', resolvedUrl: url };
    let type = detectType(info.finalUrl);
    if (type === 'auto') {
      if (info.ct.indexOf('mpegurl') !== -1 || info.ct.indexOf('m3u8') !== -1) type = 'm3u8';
      else if (info.ct.indexOf('dash+xml') !== -1) type = 'dash';
      else if (info.ct.indexOf('x-flv') !== -1) type = 'flv';
      else if (info.ct.indexOf('mp2t') !== -1) type = 'ts';
      else if (info.ct.indexOf('audio/') !== -1) type = 'audio';
      else if (info.ct.indexOf('mp4') !== -1 || info.ct.indexOf('webm') !== -1 || info.ct.indexOf('ogg') !== -1) type = 'mp4';
    }
    return { type: type, resolvedUrl: info.finalUrl };
  }

  function playUrl(rawUrl){
    if (!rawUrl) return;
    const url = normalizeUrl(rawUrl);
    destroyPlayers();
    videoWrap.style.aspectRatio = '';
    overlay.style.display = 'none';
    const type = detectType(url);
    typePill.textContent = type.toUpperCase();
    setStatus('正在加载...', '');
    try {
      dispatchPlay(type, url);
    } catch(e) {
      setStatus('播放出错: ' + e.message, 'err');
    }
  }

  function dispatchPlay(type, url){
    if (['rtmp','rtsp','udp','mms','srt'].indexOf(type) !== -1) {
      setStatus('该频道为 ' + type.toUpperCase() + ' 协议，浏览器无法直接播放，需服务端转码为 HTTP-FLV/HLS 后才能播放（可正常显示在列表中，仅播放受限）', 'err');
    } else if (type === 'm3u8') {
      if (window.Hls && Hls.isSupported()) {
        hls = new Hls({ maxBufferLength: 30, loader: RelayFallbackLoader });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function(){
          setStatus('播放中', 'live');
          video.play().catch(()=>{});
        });
        hls.on(Hls.Events.ERROR, function(evt, data){
          console.warn('[hls.js error]', data);
          if (data.fatal) {
            if (tryNextLine()) return;
            const detail = data.details || '未知错误';
            const reason = data.reason || (data.response && data.response.data) || '';
            setStatus('加载失败: ' + detail + (reason ? ' (' + String(reason).slice(0, 120) + ')' : ''), 'err');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', function(){
          setStatus('播放中', 'live');
          video.play().catch(()=>{});
        }, { once:true });
        video.addEventListener('error', function(){
          if (!tryNextLine()) setStatus('加载失败，请检查地址是否有效', 'err');
        }, { once:true });
      } else {
        setStatus('当前浏览器不支持 HLS 播放', 'err');
      }
    } else if (type === 'dash') {
      if (window.dashjs) {
        startDash(url, false);
      } else {
        setStatus('DASH(dash.js) 库加载失败，尝试作为普通视频播放', '');
        startMp4(url, false);
      }
    } else if (type === 'flv') {
      if (window.flvjs && flvjs.isSupported()) {
        startFlv(url, false);
      } else {
        setStatus('当前浏览器不支持 FLV 播放', 'err');
      }
    } else if (type === 'ts') {
      if (window.mpegts && mpegts.isSupported()) {
        startTs(url, false);
      } else {
        setStatus('当前浏览器不支持 TS 播放', 'err');
      }
    } else if (type === 'audio') {
      startAudio(url, false);
    } else if (type === 'image') {
      startImage(url, false);
    } else if (type === 'auto') {
      setStatus('正在探测跳转地址与真实格式...', '');
      probeRedirectAndType(url).then(function(result){
        if (result.type !== 'auto') {
          typePill.textContent = result.type.toUpperCase() + (result.resolvedUrl !== url ? '(跳转)' : '');
          dispatchPlay(result.type, result.resolvedUrl);
        } else {
          startAuto(url, false);
        }
      }).catch(function(){
        startAuto(url, false);
      });
    } else {
      startMp4(url, false);
    }
  }

  function startImage(url, viaRelay){
    const realUrl = viaRelay ? ('/relay?url=' + encodeURIComponent(url)) : url;
    video.style.display = 'none';
    imagePreview.style.display = 'block';
    imagePreview.onload = function(){
      applyImageAspect();
      requestAnimationFrame(applyTransform);
      setStatus('已加载', 'live');
    };
    imagePreview.onerror = function(){
      if (!viaRelay) {
        setStatus('直连失败，尝试通过转发重连...', '');
        startImage(url, true);
      } else if (!tryNextLine()) {
        setStatus('图片加载失败，请检查地址是否有效', 'err');
      }
    };
    imagePreview.src = realUrl;
  }

  function startFlv(url, viaRelay){
    if (flvPlayer) { try{ flvPlayer.destroy(); }catch(e){} flvPlayer = null; }
    const realUrl = viaRelay ? ('/relay?url=' + encodeURIComponent(url)) : url;
    flvPlayer = flvjs.createPlayer({ type: 'flv', url: realUrl, isLive: true, cors: true, withCredentials: false });
    flvPlayer.attachMediaElement(video);
    flvPlayer.load();
    flvPlayer.play().then(()=> setStatus('播放中','live')).catch(()=>{});
    flvPlayer.on(flvjs.Events.ERROR, function(errType, errDetail){
      if (!viaRelay) {
        setStatus('直连失败，尝试通过转发重连...', '');
        startFlv(url, true);
      } else if (!tryNextLine()) {
        setStatus('FLV 加载失败 (' + errType + (errDetail ? ': ' + errDetail : '') + ')，请检查地址是否有效或已过期', 'err');
      }
    });
  }

  function startTs(url, viaRelay){
    if (tsPlayer) { try{ tsPlayer.destroy(); }catch(e){} tsPlayer = null; }
    const realUrl = viaRelay ? ('/relay?url=' + encodeURIComponent(url)) : url;
    tsPlayer = mpegts.createPlayer({ type: 'mpegts', url: realUrl, isLive: true, cors: true, withCredentials: false });
    tsPlayer.attachMediaElement(video);
    tsPlayer.load();
    tsPlayer.play().then(()=> setStatus('播放中','live')).catch(()=>{});
    tsPlayer.on(mpegts.Events.ERROR, function(errType, errDetail){
      if (!viaRelay) {
        setStatus('直连失败，尝试通过转发重连...', '');
        startTs(url, true);
      } else if (!tryNextLine()) {
        setStatus('TS 加载失败 (' + errType + (errDetail ? ': ' + errDetail : '') + ')，请检查地址是否有效或已过期', 'err');
      }
    });
  }

  function startDash(url, viaRelay){
    if (dashPlayer) { try{ dashPlayer.reset(); }catch(e){} dashPlayer = null; }
    video.style.display = '';
    imagePreview.style.display = 'none';
    hideAudioCover();
    const realUrl = viaRelay ? ('/relay?url=' + encodeURIComponent(url)) : url;
    dashPlayer = dashjs.MediaPlayer().create();
    try { dashPlayer.updateSettings({ streaming: { retryAttempts: { MPD: 2 } } }); } catch(e) {}
    dashPlayer.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, function(){
      setStatus('播放中', 'live');
    });
    dashPlayer.on(dashjs.MediaPlayer.events.ERROR, function(e){
      console.warn('[dash.js error]', e);
      if (!viaRelay) {
        setStatus('直连失败，尝试通过转发重连...', '');
        startDash(url, true);
      } else if (!tryNextLine()) {
        setStatus('DASH 加载失败: ' + ((e && e.error && e.error.message) || (e && e.error) || '未知错误'), 'err');
      }
    });
    dashPlayer.initialize(video, realUrl, true);
  }

  function startAudio(url, viaRelay){
    const realUrl = viaRelay ? ('/relay?url=' + encodeURIComponent(url)) : url;
    video.style.display = '';
    imagePreview.style.display = 'none';
    videoWrap.style.aspectRatio = '16/9';
    const label = (activeIndex >= 0 && channels[activeIndex])
      ? channels[activeIndex].name
      : decodeURIComponent((url.split('/').pop() || '音频流').split('?')[0]);
    showAudioCover(label);
    video.src = realUrl;
    video.addEventListener('playing', function(){ audioCover.classList.add('playing'); }, { once:true });
    video.addEventListener('pause', function(){ audioCover.classList.remove('playing'); });
    video.addEventListener('loadedmetadata', function(){
      setStatus('播放中(音频)', 'live');
      video.play().catch(()=>{});
    }, { once:true });
    video.addEventListener('error', function(){
      if (!viaRelay) {
        setStatus('直连失败，尝试通过转发重连...', '');
        startAudio(url, true);
      } else if (!tryNextLine()) {
        setStatus('音频加载失败，请检查地址是否有效', 'err');
      }
    }, { once:true });
  }

  function startMp4(url, viaRelay){
    const realUrl = viaRelay ? ('/relay?url=' + encodeURIComponent(url)) : url;
    video.src = realUrl;
    video.addEventListener('loadedmetadata', function(){
      setStatus('播放中', 'live');
      video.play().catch(()=>{});
    }, { once:true });
    video.addEventListener('error', function(){
      if (!viaRelay) {
        setStatus('直连失败，尝试通过转发重连...', '');
        startMp4(url, true);
      } else if (!tryNextLine()) {
        setStatus('加载失败，请检查地址是否有效', 'err');
      }
    }, { once:true });
  }

  function startAuto(url, viaRelay){
    if (window.mpegts && mpegts.isSupported()) {
      if (tsPlayer) { try{ tsPlayer.destroy(); }catch(e){} tsPlayer = null; }
      const realUrl = viaRelay ? ('/relay?url=' + encodeURIComponent(url)) : url;
      tsPlayer = mpegts.createPlayer({ type: 'mpegts', url: realUrl, isLive: true, cors: true, withCredentials: false });
      tsPlayer.attachMediaElement(video);
      tsPlayer.load();
      tsPlayer.play().then(()=> setStatus('播放中(自动识别为 TS 流)','live')).catch(()=>{});
      tsPlayer.on(mpegts.Events.ERROR, function(errType, errDetail){
        if (!viaRelay) {
          setStatus('直连失败，尝试通过转发重连...', '');
          startAuto(url, true);
        } else {
          if (tsPlayer) { try{ tsPlayer.destroy(); }catch(e){} tsPlayer = null; }
          setStatus('自动识别为 TS 播放失败，尝试作为普通视频文件播放...', '');
          startMp4(url, false);
        }
      });
    } else {
      startMp4(url, false);
    }
  }
  function tryNextLine(){
    if (activeIndex < 0) return false;
    const ch = channels[activeIndex];
    if (!ch || !ch.urls || ch.urls.length <= 1) return false;
    if (activeLineIdx >= ch.urls.length - 1) return false;
    activeLineIdx++;
    setStatus('线路' + (activeLineIdx) + '失败，切换到线路' + (activeLineIdx + 1) + '...', '');
    playUrl(ch.urls[activeLineIdx]);
    return true;
  }

  playBtn.addEventListener('click', function(){
    const url = urlInput.value.trim();
    if (!url) { setStatus('请输入有效地址', 'err'); return; }
    activeIndex = -1;
    activeLineIdx = 0;
    renderChannels();
    playUrl(url);
  });

  urlInput.addEventListener('keydown', function(e){
    if (e.key === 'Enter') playBtn.click();
  });

  clearBtn.addEventListener('click', function(){
    urlInput.value = '';
    destroyPlayers();
    overlay.style.display = 'flex';
    setStatus('等待播放', '');
    typePill.textContent = '--';
  });
  function dedupUrls(urls){
    const seen = new Set();
    const out = [];
    urls.forEach(function(u){
      const t = (u || '').trim();
      if (!t || seen.has(t)) return;
      seen.add(t);
      out.push(t);
    });
    return out;
  }

  function isValidStreamUrl(u){
    return /^(https?|rtmp|rtmps|rtsp|udp|rtp|mms|mmsh|srt|ftp):\/\//i.test(String(u || '').trim());
  }

  function parseM3U(text){
    const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
    const raw = [];
    let currentName = '';
    let currentLogo = '';
    let currentGroup = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (line.startsWith('#EXTINF')) {
        const nameMatch = line.match(/,([^,]*)$/);
        currentName = nameMatch ? nameMatch[1].trim() : '未命名频道';
        const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
        currentLogo = logoMatch ? logoMatch[1] : '';
        const groupMatch = line.match(/group-title="([^"]*)"/i);
        currentGroup = groupMatch ? groupMatch[1] : '';
      } else if (line.startsWith('#EXTGRP:')) {
        currentGroup = line.slice(8).trim() || currentGroup;
      } else if (line.startsWith('#')) {
        continue;
      } else {
        if (isValidStreamUrl(line)) {
          raw.push({
            name: currentName || ('频道 ' + (raw.length + 1)),
            logo: currentLogo,
            group: currentGroup,
            url: line
          });
        }
        currentName = '';
        currentLogo = '';
        currentGroup = '';
      }
    }
    return mergeByName(raw);
  }

  function mergeByName(raw){
    const map = new Map();
    const order = [];
    raw.forEach(function(item){
      const key = (item.group || '') + '|' + item.name;
      if (!map.has(key)) {
        map.set(key, { name: item.name, logo: item.logo, group: item.group, urls: [] });
        order.push(key);
      }
      const ch = map.get(key);
      if (!ch.logo && item.logo) ch.logo = item.logo;
      ch.urls.push(item.url);
    });
    return order.map(function(key){
      const ch = map.get(key);
      ch.urls = dedupUrls(ch.urls);
      return ch;
    }).filter(function(ch){ return ch.urls.length > 0; });
  }

  function parseTXT(text){
    const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
    const raw = [];
    let currentGroup = '';
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;
      if (/,\s*#genre#\s*$/i.test(line)) {
        currentGroup = line.split(',')[0].trim();
        continue;
      }
      let sepIdx = -1, sepLen = 1;
      const commaIdx = line.indexOf(',');
      const cnCommaIdx = line.indexOf('，');
      const tabIdx = line.indexOf('\t');
      [ [commaIdx,1], [cnCommaIdx,1], [tabIdx,1] ].forEach(function(pair){
        if (pair[0] !== -1 && (sepIdx === -1 || pair[0] < sepIdx)) { sepIdx = pair[0]; sepLen = pair[1]; }
      });
      if (sepIdx === -1) continue;
      const name = line.slice(0, sepIdx).trim();
      let rest = line.slice(sepIdx + sepLen).trim();
      if (!rest) continue;
      const urlParts = rest.split('#').map(function(s){ return s.trim(); }).filter(isValidStreamUrl);
      if (!urlParts.length) continue;
      raw.push({
        name: name || ('频道 ' + (raw.length + 1)),
        logo: '',
        group: currentGroup,
        urls: dedupUrls(urlParts)
      });
    }
    return mergeChannelObjs(raw);
  }

  function mergeChannelObjs(raw){
    const map = new Map();
    const order = [];
    raw.forEach(function(item){
      const key = (item.group || '') + '|' + item.name;
      if (!map.has(key)) {
        map.set(key, { name: item.name, logo: item.logo, group: item.group, urls: [] });
        order.push(key);
      }
      const ch = map.get(key);
      if (!ch.logo && item.logo) ch.logo = item.logo;
      ch.urls = ch.urls.concat(item.urls);
    });
    return order.map(function(key){
      const ch = map.get(key);
      ch.urls = dedupUrls(ch.urls);
      return ch;
    }).filter(function(ch){ return ch.urls.length > 0; });
  }

  const JSON_ARRAY_KEYS = ['channels', 'list', 'items', 'data', 'results', 'streams', 'urls', 'epg', 'tvchannels', 'playlist'];
  const JSON_GROUP_KEYS = ['groups', 'categories', 'classes', 'lives', 'sort'];
  const JSON_CHILD_KEYS = ['channels', 'list', 'items', 'streams', 'children', 'playlist'];
  const JSON_URL_KEYS = ['url', 'link', 'stream', 'src', 'playurl', 'durl', 'address', 'm3u8', 'file', 'stream_url', 'streamUrl', 'stream_addr', 'play_url', 'playUrl', 'tvg-url', 'source', 'video_url', 'videoUrl'];
  const JSON_NAME_KEYS = ['name', 'title', 'tvg-name', 'channelName', 'chName', 'text'];
  const JSON_LOGO_KEYS = ['logo', 'tvg-logo', 'icon', 'pic', 'logourl', 'pic_url', 'image'];
  const JSON_GROUP_NAME_KEYS = ['group', 'category', 'group-title', 'className', 'type_name', 'groupName'];
  const JSON_IGNORE_KEYS = ['spider', 'sites', 'parses', 'ads', 'ijk', 'flags', 'wallpaper'];

  function splitUrlString(s){
    return String(s).split(/[#|]|\s*\n\s*/).map(function(u){ return u.trim(); }).filter(Boolean);
  }
  function extractUrlsFromValue(v){
    if (v === undefined || v === null) return [];
    if (Array.isArray(v)) {
      let out = [];
      v.forEach(function(u){
        if (typeof u === 'string' || typeof u === 'number') {
          out = out.concat(splitUrlString(u));
        } else if (u && typeof u === 'object') {
          for (let i = 0; i < JSON_URL_KEYS.length; i++) {
            if (u[JSON_URL_KEYS[i]]) { out = out.concat(splitUrlString(u[JSON_URL_KEYS[i]])); break; }
          }
        }
      });
      return out;
    }
    if (typeof v === 'string' || typeof v === 'number') return splitUrlString(v);
    return [];
  }
  function pickField(item, keys){
    for (let i = 0; i < keys.length; i++) {
      const v = item[keys[i]];
      if (v !== undefined && v !== null && v !== '') return v;
    }
    return null;
  }
  function findChildArray(obj){
    for (let i = 0; i < JSON_CHILD_KEYS.length; i++) {
      if (Array.isArray(obj[JSON_CHILD_KEYS[i]])) return obj[JSON_CHILD_KEYS[i]];
    }
    return null;
  }

  function channelFromObj(item, fallbackIdx, inheritedGroup){
    if (!item || typeof item !== 'object') return null;
    let urls = [];
    if (item.urls !== undefined) urls = urls.concat(extractUrlsFromValue(item.urls));
    for (let i = 0; i < JSON_URL_KEYS.length && !urls.length; i++) {
      if (item[JSON_URL_KEYS[i]] !== undefined) urls = urls.concat(extractUrlsFromValue(item[JSON_URL_KEYS[i]]));
    }
    urls = urls.map(function(u){ return String(u).trim(); }).filter(isValidStreamUrl);
    if (!urls.length) return null;
    const name = pickField(item, JSON_NAME_KEYS) || ('频道 ' + (fallbackIdx + 1));
    const logo = pickField(item, JSON_LOGO_KEYS) || '';
    const group = pickField(item, JSON_GROUP_NAME_KEYS) || inheritedGroup || '';
    return {
      name: String(name),
      logo: logo ? String(logo) : '',
      group: group ? String(group) : '',
      urls: dedupUrls(urls)
    };
  }

  function deepScanChannels(node, inheritedGroup, depth, out, seen){
    if (depth > 6 || node === null || node === undefined) return;
    if (Array.isArray(node)) {
      let hits = 0, objCount = 0;
      node.forEach(function(item){
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          objCount++;
          if (channelFromObj(item, 0, inheritedGroup)) hits++;
        }
      });
      if (objCount > 0 && hits / objCount >= 0.5) {
        node.forEach(function(item){
          const ch = channelFromObj(item, out.length, inheritedGroup);
          if (ch) out.push(ch);
        });
        return;
      }
      node.forEach(function(item){ deepScanChannels(item, inheritedGroup, depth + 1, out, seen); });
      return;
    }
    if (typeof node === 'object') {
      if (seen.has(node)) return;
      seen.add(node);
      const groupName = pickField(node, JSON_GROUP_NAME_KEYS) || pickField(node, JSON_NAME_KEYS) || inheritedGroup;
      const child = findChildArray(node);
      if (Array.isArray(child)) deepScanChannels(child, groupName, depth + 1, out, seen);
      for (const k in node) {
        if (JSON_IGNORE_KEYS.indexOf(k) !== -1) continue;
        const v = node[k];
        if (child && v === child) continue;
        if (v && typeof v === 'object') deepScanChannels(v, groupName, depth + 1, out, seen);
      }
    }
  }

  function extractChannelsFromJSON(data){
    const result = [];

    if (Array.isArray(data)) {
      data.forEach(function(item){
        const ch = channelFromObj(item, result.length, '');
        if (ch) result.push(ch);
      });
      if (result.length) return result;
    }

    if (!data || typeof data !== 'object') return null;

    for (let g = 0; g < JSON_GROUP_KEYS.length; g++) {
      const gk = JSON_GROUP_KEYS[g];
      if (Array.isArray(data[gk])) {
        data[gk].forEach(function(grp){
          if (!grp || typeof grp !== 'object') return;
          const groupName = pickField(grp, JSON_GROUP_NAME_KEYS) || pickField(grp, JSON_NAME_KEYS) || '';
          const inner = findChildArray(grp);
          if (Array.isArray(inner)) {
            inner.forEach(function(item){
              const ch = channelFromObj(item, result.length, groupName);
              if (ch) result.push(ch);
            });
          } else {
            const ch = channelFromObj(grp, result.length, '');
            if (ch) result.push(ch);
          }
        });
        if (result.length) return result;
      }
    }

    for (let i = 0; i < JSON_ARRAY_KEYS.length; i++) {
      const k = JSON_ARRAY_KEYS[i];
      if (Array.isArray(data[k])) {
        data[k].forEach(function(item){
          const ch = channelFromObj(item, result.length, '');
          if (ch) result.push(ch);
        });
        if (result.length) return result;
      }
    }

    for (const k in data) {
      if (JSON_IGNORE_KEYS.indexOf(k) !== -1) continue;
      const v = data[k];
      if (Array.isArray(v) && v.length && typeof v[0] === 'object' && v[0] &&
          (v[0].url || v[0].link || v[0].stream || v[0].src || v[0].playurl || v[0].urls)) {
        v.forEach(function(item){
          const ch = channelFromObj(item, result.length, '');
          if (ch) result.push(ch);
        });
        if (result.length) return result;
      }
    }

    if (!result.length) {
      deepScanChannels(data, '', 0, result, new Set());
    }

    return result.length ? result : null;
  }

  function getAppleCMSList(data){
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      if (Array.isArray(data.list)) return data.list;
      if (Array.isArray(data.video)) return data.video;
    }
    return null;
  }

  function isAppleCMSResponse(data){
    const list = getAppleCMSList(data);
    if (!list || !list.length) return false;
    let hits = 0, objCount = 0;
    list.forEach(function(item){
      if (item && typeof item === 'object') {
        objCount++;
        if (item.vod_play_url !== undefined || item.vod_down_url !== undefined || item.play_url !== undefined) hits++;
      }
    });
    return objCount > 0 && (hits / objCount) >= 0.5;
  }

  const APPLECMS_NAME_KEYS  = ['vod_name', 'name'];
  const APPLECMS_PIC_KEYS   = ['vod_pic', 'pic'];
  const APPLECMS_NOTE_KEYS  = ['vod_remarks', 'remarks', 'note'];
  const APPLECMS_GROUP_KEYS = ['type_name', 'class', 'vod_class', 'type'];
  const APPLECMS_PLAY_PAIRS = [
    ['vod_play_from', 'vod_play_url'],
    ['vod_down_from', 'vod_down_url'],
    ['play_from', 'play_url']
  ];

  function pickAppleCMSField(item, keys){
    for (let i = 0; i < keys.length; i++) {
      const v = item[keys[i]];
      if (v !== undefined && v !== null && v !== '') return String(v).trim();
    }
    return '';
  }

  function parseAppleCMSVod(vod){
    const group = pickAppleCMSField(vod, APPLECMS_GROUP_KEYS);
    const title = pickAppleCMSField(vod, APPLECMS_NAME_KEYS) || '未命名';
    const logo = pickAppleCMSField(vod, APPLECMS_PIC_KEYS);
    const remarks = pickAppleCMSField(vod, APPLECMS_NOTE_KEYS);

    let fromRaw = '', urlRaw = '';
    for (let i = 0; i < APPLECMS_PLAY_PAIRS.length; i++) {
      const fk = APPLECMS_PLAY_PAIRS[i][0], uk = APPLECMS_PLAY_PAIRS[i][1];
      if (vod[uk]) { fromRaw = String(vod[fk] || '').trim(); urlRaw = String(vod[uk]).trim(); break; }
    }
    if (!urlRaw) return [];

    const urlGroups = urlRaw.split('$$$');

    const episodesMap = new Map();
    const episodesOrder = [];
    urlGroups.forEach(function(lineStr){
      const eps = lineStr.split('#').map(function(s){ return s.trim(); }).filter(Boolean);
      eps.forEach(function(epStr, epIdx){
        const sepAt = epStr.indexOf('$');
        let epName, epUrl;
        if (sepAt !== -1) {
          epName = epStr.slice(0, sepAt).trim() || ('第' + (epIdx + 1) + '集');
          epUrl = epStr.slice(sepAt + 1).trim();
        } else {
          epName = '第' + (epIdx + 1) + '集';
          epUrl = epStr.trim();
        }
        if (!isValidStreamUrl(epUrl)) return;
        const key = epIdx + '|' + epName;
        if (!episodesMap.has(key)) {
          episodesMap.set(key, { name: epName, urls: [] });
          episodesOrder.push(key);
        }
        episodesMap.get(key).urls.push(epUrl);
      });
    });

    const multiEpisode = episodesOrder.length > 1;
    const channels = [];
    episodesOrder.forEach(function(key){
      const ep = episodesMap.get(key);
      const urls = dedupUrls(ep.urls);
      if (!urls.length) return;
      const chName = multiEpisode ? (title + ' ' + ep.name) : (title + (remarks ? '(' + remarks + ')' : ''));
      channels.push({ name: chName, logo: logo, group: group, urls: urls });
    });
    return channels;
  }

  function parseAppleCMSJSON(data){
    const list = getAppleCMSList(data) || [];
    let out = [];
    list.forEach(function(vod){
      out = out.concat(parseAppleCMSVod(vod));
    });
    return out;
  }

  function isAppleCMSUrl(u){
    return /\/api\.php\/provide\/vod/i.test(u) ||
           /\/provide\/vod/i.test(u) ||
           /\/inc\/apibak?\.php/i.test(u) ||
           /[?&]ac=(videolist|list|detail)/i.test(u);
  }

  function isAppleCMSXML(doc){
    const root = doc && doc.documentElement;
    if (!root) return false;
    const tag = root.tagName ? root.tagName.toLowerCase() : '';
    if (tag !== 'rss') return false;
    return !!(root.querySelector && root.querySelector('list > video, video'));
  }

  function parseAppleCMSXMLVideo(videoEl){
    function childText(selectors){
      for (let i = 0; i < selectors.length; i++) {
        const el = videoEl.querySelector(selectors[i]);
        if (el && el.textContent && el.textContent.trim()) return el.textContent.trim();
      }
      return '';
    }
    const title = childText(['name']) || '未命名';
    const group = childText(['type', 'class', 'type_name']);
    const logo = childText(['pic']);
    const remarks = childText(['note', 'remarks']);

    const ddList = videoEl.querySelectorAll ? videoEl.querySelectorAll('dl > dd, dd') : [];
    const episodesMap = new Map();
    const episodesOrder = [];
    ddList.forEach(function(dd){
      const lineStr = (dd.textContent || '').trim();
      if (!lineStr) return;
      const eps = lineStr.split('#').map(function(s){ return s.trim(); }).filter(Boolean);
      eps.forEach(function(epStr, epIdx){
        const sepAt = epStr.indexOf('$');
        let epName, epUrl;
        if (sepAt !== -1) {
          epName = epStr.slice(0, sepAt).trim() || ('第' + (epIdx + 1) + '集');
          epUrl = epStr.slice(sepAt + 1).trim();
        } else {
          epName = '第' + (epIdx + 1) + '集';
          epUrl = epStr.trim();
        }
        if (!isValidStreamUrl(epUrl)) return;
        const key = epIdx + '|' + epName;
        if (!episodesMap.has(key)) {
          episodesMap.set(key, { name: epName, urls: [] });
          episodesOrder.push(key);
        }
        episodesMap.get(key).urls.push(epUrl);
      });
    });

    const multiEpisode = episodesOrder.length > 1;
    const out = [];
    episodesOrder.forEach(function(key){
      const ep = episodesMap.get(key);
      const urls = dedupUrls(ep.urls);
      if (!urls.length) return;
      const chName = multiEpisode ? (title + ' ' + ep.name) : (title + (remarks ? '(' + remarks + ')' : ''));
      out.push({ name: chName, logo: logo, group: group, urls: urls });
    });
    return out;
  }

  function parseAppleCMSXMLDoc(doc){
    const videos = doc.querySelectorAll ? doc.querySelectorAll('list > video, video') : [];
    let out = [];
    videos.forEach(function(v){ out = out.concat(parseAppleCMSXMLVideo(v)); });
    return out;
  }

  async function fetchJSONWithRelay(url){
    try {
      const resp = await fetch(url, { headers: { 'Accept': 'application/json,*/*' } });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return await resp.json();
    } catch(directErr) {
      const relayResp = await fetch('/relay?url=' + encodeURIComponent(url), { headers: { 'Accept': 'application/json,*/*' } });
      if (!relayResp.ok) throw new Error('HTTP ' + relayResp.status);
      return await relayResp.json();
    }
  }

  async function fetchTextWithRelay(url){
    try {
      const resp = await fetch(url, { headers: { 'Accept': 'application/xml,text/xml,*/*' } });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return await resp.text();
    } catch(directErr) {
      const relayResp = await fetch('/relay?url=' + encodeURIComponent(url), { headers: { 'Accept': 'application/xml,text/xml,*/*' } });
      if (!relayResp.ok) throw new Error('HTTP ' + relayResp.status);
      return await relayResp.text();
    }
  }

  async function fetchAppleCMSAll(rawUrl){
    let u;
    try { u = new URL(rawUrl.trim()); } catch(e) { throw new Error('无效的 AppleCMS API 地址'); }
    if (!/[?&]ac=/i.test(u.search)) {
      u.searchParams.set('ac', 'videolist');
    }
    u.searchParams.delete('pg');
    u.searchParams.set('at', 'json');
    const firstUrl = u.toString();
    setStatus('正在拉取 AppleCMS 视频列表(第 1 页)...', '');

    let firstData = null;
    let firstList = null;
    try {
      firstData = await fetchJSONWithRelay(firstUrl);
      firstList = getAppleCMSList(firstData);
    } catch(e) {
      firstList = null;
    }

    if (!firstList) {
      u.searchParams.delete('at');
      const xmlUrl = u.toString();
      const text = await fetchTextWithRelay(xmlUrl);
      let doc;
      try { doc = new DOMParser().parseFromString(text, 'application/xml'); } catch(e) { doc = null; }
      if (!doc || doc.getElementsByTagName('parsererror').length || !isAppleCMSXML(doc)) {
        throw new Error('未识别到 AppleCMS 返回的视频列表(既非有效 JSON 也非有效 XML，请确认地址或版本)');
      }
      let allChannels = parseAppleCMSXMLDoc(doc);

      const pageCountEl = doc.querySelector('pagecount');
      const totalEl = doc.querySelector('total');
      const pageSizeEl = doc.querySelector('pagesize') || doc.querySelector('limit');
      let pagecount = pageCountEl ? parseInt(pageCountEl.textContent, 10) : 0;
      if (!pagecount && totalEl && pageSizeEl) {
        const total = parseInt(totalEl.textContent, 10) || 0;
        const pageSize = parseInt(pageSizeEl.textContent, 10) || 20;
        pagecount = pageSize ? Math.ceil(total / pageSize) : 1;
      }
      pagecount = pagecount || 1;
      const MAX_PAGES = 30;
      const totalPages = Math.min(pagecount, MAX_PAGES);
      for (let p = 2; p <= totalPages; p++) {
        const pu = new URL(xmlUrl);
        pu.searchParams.set('pg', String(p));
        setStatus('正在拉取 AppleCMS 视频列表(第 ' + p + ' / ' + totalPages + ' 页, XML)...', '');
        try {
          const pageText = await fetchTextWithRelay(pu.toString());
          const pageDoc = new DOMParser().parseFromString(pageText, 'application/xml');
          if (pageDoc && !pageDoc.getElementsByTagName('parsererror').length) {
            allChannels = allChannels.concat(parseAppleCMSXMLDoc(pageDoc));
          } else break;
        } catch(e) { break; }
      }
      return JSON.stringify({ list: [], __prescanned: mergeChannelObjs(allChannels) });
    }

    let allList = firstList.slice();
    let pagecount = parseInt(firstData.pagecount, 10) || 0;
    if (!pagecount) {
      const total = parseInt(firstData.total, 10) || 0;
      const pageSize = parseInt(firstData.pagesize || firstData.limit, 10) || (firstList.length || 20);
      pagecount = (total && pageSize) ? Math.ceil(total / pageSize) : 1;
    }
    pagecount = pagecount || 1;
    const MAX_PAGES = 30;
    const totalPages = Math.min(pagecount, MAX_PAGES);
    for (let p = 2; p <= totalPages; p++) {
      const pu = new URL(firstUrl);
      pu.searchParams.set('pg', String(p));
      setStatus('正在拉取 AppleCMS 视频列表(第 ' + p + ' / ' + totalPages + ' 页)...', '');
      try {
        const pageData = await fetchJSONWithRelay(pu.toString());
        const pageList = getAppleCMSList(pageData);
        if (pageList) allList = allList.concat(pageList);
        else break;
      } catch(e) {
        break;
      }
    }
    return JSON.stringify({ list: allList });
  }

  function parseJSON(text){
    let data;
    try { data = JSON.parse(text); } catch(e) { return null; }
    if (data && data.__prescanned) return data.__prescanned;
    if (isAppleCMSResponse(data)) {
      const chs = parseAppleCMSJSON(data);
      return chs;
    }
    const chs = extractChannelsFromJSON(data);
    return chs && chs.length ? mergeChannelObjs(chs) : chs;
  }

  function convertPyLiteralToJSON(text){
    let out = '';
    let i = 0;
    const n = text.length;
    let inStr = false;
    let quoteChar = '';
    while (i < n) {
      const c = text[i];
      if (inStr) {
        if (c === '\\' && i + 1 < n) {
          const next = text[i + 1];
          if (quoteChar === "'" && next === "'") { out += "'"; i += 2; continue; }
          if (next === '"') { out += '\\"'; i += 2; continue; }
          out += c + next;
          i += 2;
          continue;
        }
        if (c === quoteChar) { out += '"'; inStr = false; i++; continue; }
        if (c === '"' && quoteChar === "'") { out += '\\"'; i++; continue; }
        out += c;
        i++;
        continue;
      }
      if (c === "'" || c === '"') { inStr = true; quoteChar = c; out += '"'; i++; continue; }
      if (c === '#') { while (i < n && text[i] !== '\n') i++; continue; }
      if (/[A-Za-z_]/.test(c)) {
        let j = i;
        while (j < n && /[A-Za-z0-9_]/.test(text[j])) j++;
        const word = text.slice(i, j);
        if (word === 'True') out += 'true';
        else if (word === 'False') out += 'false';
        else if (word === 'None') out += 'null';
        else out += word;
        i = j;
        continue;
      }
      out += c;
      i++;
    }
    out = out.replace(/,(\s*[\]\}])/g, '$1');
    return out;
  }

  function tryParsePythonLiteral(text){
    const trimmed = text.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return null;
    const looksPython = /\bTrue\b|\bFalse\b|\bNone\b/.test(trimmed) ||
      /'[^'\n]*'\s*:/.test(trimmed) || /:\s*'[^'\n]*'/.test(trimmed) || /(^|\n)\s*#/.test(trimmed);
    if (!looksPython) return null;
    try { JSON.parse(trimmed); return null; } catch(e) { }
    try {
      const converted = convertPyLiteralToJSON(trimmed);
      return JSON.parse(converted);
    } catch(e) {
      return null;
    }
  }

  function parsePyLiteralChannels(data){
    if (isAppleCMSResponse(data)) return parseAppleCMSJSON(data);
    const chs = extractChannelsFromJSON(data);
    return chs && chs.length ? mergeChannelObjs(chs) : chs;
  }

  const CSP_ENTRY_CANDIDATES = ['get_channels', 'getlist', 'get_list', 'main', 'run'];
  const PYODIDE_CDN_BASE = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

  const BASE_SPIDER_STUB_PY =
    "import sys as __csp_sys__, types as __csp_types__\n" +
    "\n" +
    "class __CspHttpResponse__:\n" +
    "    def __init__(self, text, status):\n" +
    "        self.text = text\n" +
    "        self.status_code = status\n" +
    "        self.content = text\n" +
    "\n" +
    "class Spider:\n" +
    "    def __init__(self):\n" +
    "        self.headers = {}\n" +
    "        self.ext = SPIDER_EXT\n" +
    "\n" +
    "    def getName(self): return ''\n" +
    "    def init(self, extend=''): return self\n" +
    "    def homeContent(self, filter): return {}\n" +
    "    def homeVideoContent(self): return {}\n" +
    "    def categoryContent(self, tid, pg, filter, extend): return {'list': []}\n" +
    "    def detailContent(self, ids): return {'list': []}\n" +
    "    def searchContent(self, key, quick, pg='1'): return {'list': []}\n" +
    "    def playerContent(self, flag, id, vipFlags): return {'parse': 0, 'url': id, 'header': self.headers}\n" +
    "    def isVideoFormat(self, url): return False\n" +
    "    def manualVideoCheck(self): return False\n" +
    "    def destroy(self): pass\n" +
    "\n" +
    "    def fetch(self, url, headers=None, params=None, data=None, method='GET', timeout=None):\n" +
    "        res = csp_sync_fetch(url, headers, params, method, data)\n" +
    "        try:\n" +
    "            res_text = res.text\n" +
    "        except AttributeError:\n" +
    "            res_text = res['text'] if hasattr(res, '__getitem__') else ''\n" +
    "        try:\n" +
    "            res_status = res.status\n" +
    "        except AttributeError:\n" +
    "            res_status = res['status'] if hasattr(res, '__getitem__') else 0\n" +
    "        return __CspHttpResponse__(res_text, res_status)\n" +
    "\n" +
    "    def post(self, url, headers=None, params=None, data=None):\n" +
    "        return self.fetch(url, headers=headers, params=params, data=data, method='POST')\n" +
    "\n" +
    "__csp_base_mod__ = __csp_types__.ModuleType('base')\n" +
    "__csp_spider_mod__ = __csp_types__.ModuleType('base.spider')\n" +
    "__csp_spider_mod__.Spider = Spider\n" +
    "__csp_base_mod__.spider = __csp_spider_mod__\n" +
    "__csp_sys__.modules['base'] = __csp_base_mod__\n" +
    "__csp_sys__.modules['base.spider'] = __csp_spider_mod__\n" +
    "\n" +
    "class __CspRequestsResponse__:\n" +
    "    def __init__(self, text, status_code):\n" +
    "        self.text = text\n" +
    "        self.status_code = status_code\n" +
    "        self.ok = 200 <= status_code < 300\n" +
    "        self.content = text.encode('utf-8', 'ignore') if isinstance(text, str) else text\n" +
    "        self.encoding = 'utf-8'\n" +
    "        self.headers = {}\n" +
    "    def json(self):\n" +
    "        import json as __j__\n" +
    "        return __j__.loads(self.text)\n" +
    "    def raise_for_status(self):\n" +
    "        if not self.ok: raise Exception('HTTP ' + str(self.status_code))\n" +
    "\n" +
    "def __csp_requests_request__(method, url, params=None, data=None, json=None, headers=None, timeout=None, **kw):\n" +
    "    import json as __jm__\n" +
    "    full_url = url\n" +
    "    send_headers = dict(headers or {})\n" +
    "    body = data\n" +
    "    if json is not None:\n" +
    "        send_headers.setdefault('Content-Type', 'application/json')\n" +
    "        body = __jm__.dumps(json)\n" +
    "    res = csp_sync_fetch(full_url, send_headers, params, (method or 'GET').upper(), body)\n" +
    "    try:\n" +
    "        text, status = res.text, res.status\n" +
    "    except AttributeError:\n" +
    "        text, status = res['text'], res['status']\n" +
    "    return __CspRequestsResponse__(text, status)\n" +
    "\n" +
    "class __CspRequestsModule__:\n" +
    "    @staticmethod\n" +
    "    def get(url, **kw): return __csp_requests_request__('GET', url, **kw)\n" +
    "    @staticmethod\n" +
    "    def post(url, **kw): return __csp_requests_request__('POST', url, **kw)\n" +
    "    @staticmethod\n" +
    "    def put(url, **kw): return __csp_requests_request__('PUT', url, **kw)\n" +
    "    @staticmethod\n" +
    "    def request(method, url, **kw): return __csp_requests_request__(method, url, **kw)\n" +
    "    class Session:\n" +
    "        def get(self, url, **kw): return __csp_requests_request__('GET', url, **kw)\n" +
    "        def post(self, url, **kw): return __csp_requests_request__('POST', url, **kw)\n" +
    "        def request(self, method, url, **kw): return __csp_requests_request__(method, url, **kw)\n" +
    "\n" +
    "__csp_requests_mod__ = __csp_types__.ModuleType('requests')\n" +
    "__csp_requests_mod__.__path__ = []\n" +
    "__csp_requests_mod__.get = __CspRequestsModule__.get\n" +
    "__csp_requests_mod__.post = __CspRequestsModule__.post\n" +
    "__csp_requests_mod__.put = __CspRequestsModule__.put\n" +
    "__csp_requests_mod__.request = __CspRequestsModule__.request\n" +
    "__csp_requests_mod__.Session = __CspRequestsModule__.Session\n" +
    "__csp_sys__.modules['requests'] = __csp_requests_mod__\n" +
    "\n" +
    "class RequestException(Exception): pass\n" +
    "class HTTPError(RequestException): pass\n" +
    "class ConnectionError(RequestException): pass\n" +
    "class Timeout(RequestException): pass\n" +
    "class ReadTimeout(Timeout): pass\n" +
    "class ConnectTimeout(ConnectionError, Timeout): pass\n" +
    "class TooManyRedirects(RequestException): pass\n" +
    "class URLRequired(RequestException): pass\n" +
    "class InvalidURL(RequestException): pass\n" +
    "class InvalidSchema(RequestException): pass\n" +
    "class ChunkedEncodingError(RequestException): pass\n" +
    "class ContentDecodingError(RequestException): pass\n" +
    "class StreamConsumedError(RequestException): pass\n" +
    "class JSONDecodeError(RequestException): pass\n" +
    "\n" +
    "__csp_exc_names__ = ['RequestException','HTTPError','ConnectionError','Timeout','ReadTimeout',\n" +
    "    'ConnectTimeout','TooManyRedirects','URLRequired','InvalidURL','InvalidSchema',\n" +
    "    'ChunkedEncodingError','ContentDecodingError','StreamConsumedError','JSONDecodeError']\n" +
    "__csp_req_exceptions_mod__ = __csp_types__.ModuleType('requests.exceptions')\n" +
    "for __n in __csp_exc_names__:\n" +
    "    _cls = eval(__n)\n" +
    "    setattr(__csp_requests_mod__, __n, _cls)\n" +
    "    setattr(__csp_req_exceptions_mod__, __n, _cls)\n" +
    "__csp_sys__.modules['requests.exceptions'] = __csp_req_exceptions_mod__\n" +
    "__csp_requests_mod__.exceptions = __csp_req_exceptions_mod__\n" +
    "\n" +
    "class HTTPAdapter:\n" +
    "    def __init__(self, *a, **kw): pass\n" +
    "    def mount(self, *a, **kw): pass\n" +
    "    def send(self, *a, **kw):\n" +
    "        raise NotImplementedError('requests.adapters.HTTPAdapter 在当前浏览器沙箱中不可用，请改用 self.fetch()/requests.get() 等封装方法发起请求')\n" +
    "\n" +
    "__csp_req_adapters_mod__ = __csp_types__.ModuleType('requests.adapters')\n" +
    "__csp_req_adapters_mod__.HTTPAdapter = HTTPAdapter\n" +
    "__csp_sys__.modules['requests.adapters'] = __csp_req_adapters_mod__\n" +
    "__csp_requests_mod__.adapters = __csp_req_adapters_mod__\n" +
    "\n" +
    "class __CspRequestsSubmoduleFinder__:\n" +
    "    def find_module(self, fullname, path=None):\n" +
    "        if fullname == 'requests' or (fullname.startswith('requests.') and fullname not in __csp_sys__.modules):\n" +
    "            return self\n" +
    "        return None\n" +
    "    def load_module(self, fullname):\n" +
    "        if fullname in __csp_sys__.modules:\n" +
    "            return __csp_sys__.modules[fullname]\n" +
    "        _mod = __csp_types__.ModuleType(fullname)\n" +
    "        _mod.__path__ = []\n" +
    "        __csp_sys__.modules[fullname] = _mod\n" +
    "        return _mod\n" +
    "\n" +
    "__csp_sys__.meta_path.insert(0, __CspRequestsSubmoduleFinder__())\n";

  const TVBOX_DRIVER_PY =
    "def __csp_is_url__(s):\n" +
    "    if not isinstance(s, str): return False\n" +
    "    return s.startswith('http://') or s.startswith('https://') or s.startswith('rtmp://') or s.startswith('rtsp://')\n" +
    "\n" +
    "def __csp_split_episodes__(group_str):\n" +
    "    out = []\n" +
    "    for idx, ep in enumerate(str(group_str).split('#')):\n" +
    "        ep = ep.strip()\n" +
    "        if not ep: continue\n" +
    "        if '$' in ep:\n" +
    "            epname, epval = ep.split('$', 1)\n" +
    "            epname = epname.strip() or ('第' + str(idx+1) + '集')\n" +
    "            epval = epval.strip()\n" +
    "        else:\n" +
    "            epname, epval = ('第' + str(idx+1) + '集'), ep\n" +
    "        if epval:\n" +
    "            out.append((epname, epval))\n" +
    "    return out\n" +
    "\n" +
    "def __csp_extract_play_groups__(vd):\n" +
    "    purl = vd.get('vod_play_url', '') or ''\n" +
    "    pfrom = vd.get('vod_play_from', '') or ''\n" +
    "    url_groups = str(purl).split('$$$')\n" +
    "    flag_names = str(pfrom).split('$$$') if pfrom else []\n" +
    "    out = []\n" +
    "    for i, grp in enumerate(url_groups):\n" +
    "        flag = flag_names[i].strip() if i < len(flag_names) and flag_names[i].strip() else ('线路' + str(i+1))\n" +
    "        eps = __csp_split_episodes__(grp)\n" +
    "        if eps:\n" +
    "            out.append((flag, eps))\n" +
    "    return out\n" +
    "\n" +
    "async def __tvbox_driver__():\n" +
    "    sp = Spider()\n" +
    "    ext = SPIDER_EXT or ''\n" +
    "    errors = []\n" +
    "    try: sp.init(ext)\n" +
    "    except Exception as e: errors.append('init: ' + str(e))\n" +
    "\n" +
    "    out = []\n" +
    "    MAX_CATEGORIES, MAX_PAGES = 12, 3\n" +
    "    MAX_FLAGS_PER_VIDEO, MAX_EPISODES_PER_FLAG = 4, 60\n" +
    "\n" +
    "    try:\n" +
    "        home = sp.homeContent(False)\n" +
    "    except Exception as e:\n" +
    "        home = {}\n" +
    "        errors.append('homeContent: ' + str(e))\n" +
    "    classes = (home.get('class') if isinstance(home, dict) else None) or [{'type_id': '', 'type_name': ''}]\n" +
    "\n" +
    "    for cls in classes[:MAX_CATEGORIES]:\n" +
    "        tid = cls.get('type_id', '') if isinstance(cls, dict) else ''\n" +
    "        gname = (cls.get('type_name') if isinstance(cls, dict) else '') or str(tid)\n" +
    "        for pg in range(1, MAX_PAGES + 1):\n" +
    "            try:\n" +
    "                cat = sp.categoryContent(tid, str(pg), {}, ext)\n" +
    "            except Exception as e:\n" +
    "                errors.append(gname + ' 第' + str(pg) + '页: ' + str(e))\n" +
    "                break\n" +
    "            if not isinstance(cat, dict):\n" +
    "                errors.append(gname + ' 第' + str(pg) + '页: categoryContent 未返回字典结构(' + str(type(cat)) + ')')\n" +
    "                break\n" +
    "            vlist = cat.get('list') or []\n" +
    "            if not vlist: break\n" +
    "            for v in vlist:\n" +
    "                if not isinstance(v, dict): continue\n" +
    "                vid = v.get('vod_id')\n" +
    "                name = v.get('vod_name') or v.get('name') or ''\n" +
    "                pic = v.get('vod_pic') or v.get('pic') or ''\n" +
    "                note = v.get('vod_remarks') or v.get('remarks') or ''\n" +
    "\n" +
    "                if isinstance(vid, str) and __csp_is_url__(vid):\n" +
    "                    out.append({'name': name or ('频道 ' + str(len(out)+1)), 'group': gname, 'logo': pic, 'urls': [vid]})\n" +
    "                    continue\n" +
    "\n" +
    "                try:\n" +
    "                    det = sp.detailContent([vid])\n" +
    "                except Exception as e:\n" +
    "                    errors.append(gname + ' detailContent(' + str(vid) + '): ' + str(e))\n" +
    "                    continue\n" +
    "                dlist = (det or {}).get('list') or []\n" +
    "                if not dlist:\n" +
    "                    errors.append(gname + ' detailContent(' + str(vid) + '): 空列表')\n" +
    "                    continue\n" +
    "                vd = dlist[0]\n" +
    "                if not pic:\n" +
    "                    pic = vd.get('vod_pic') or vd.get('pic') or pic\n" +
    "                if not note:\n" +
    "                    note = vd.get('vod_remarks') or vd.get('remarks') or note\n" +
    "\n" +
    "                groups = __csp_extract_play_groups__(vd)\n" +
    "                if not groups:\n" +
    "                    errors.append(gname + ' ' + str(name) + ': 未解析到播放线路(vod_play_url 为空或格式不识别)')\n" +
    "                    continue\n" +
    "\n" +
    "                max_eps = max(len(eps) for _flag, eps in groups)\n" +
    "                is_series = max_eps > 1\n" +
    "\n" +
    "                if not is_series:\n" +
    "                    resolved_urls = []\n" +
    "                    for flag, eps in groups[:MAX_FLAGS_PER_VIDEO]:\n" +
    "                        if not eps: continue\n" +
    "                        epname, epval = eps[0]\n" +
    "                        real_url = None\n" +
    "                        if __csp_is_url__(epval):\n" +
    "                            real_url = epval\n" +
    "                        else:\n" +
    "                            try:\n" +
    "                                pc = sp.playerContent(flag, epval, [])\n" +
    "                                pu = (pc or {}).get('url', '') if isinstance(pc, dict) else ''\n" +
    "                                if __csp_is_url__(pu): real_url = pu\n" +
    "                            except Exception as e:\n" +
    "                                errors.append(gname + ' ' + str(name) + ' playerContent(' + flag + '): ' + str(e))\n" +
    "                        if real_url and real_url not in resolved_urls:\n" +
    "                            resolved_urls.append(real_url)\n" +
    "                    if resolved_urls:\n" +
    "                        out.append({'name': name or ('频道 ' + str(len(out)+1)), 'group': gname, 'logo': pic, 'urls': resolved_urls})\n" +
    "                    else:\n" +
    "                        errors.append(gname + ' ' + str(name) + ': 所有线路 playerContent 均未解析出可播放地址')\n" +
    "                else:\n" +
    "                    flag, eps = groups[0]\n" +
    "                    for epname, epval in eps[:MAX_EPISODES_PER_FLAG]:\n" +
    "                        real_url = None\n" +
    "                        if __csp_is_url__(epval):\n" +
    "                            real_url = epval\n" +
    "                        else:\n" +
    "                            try:\n" +
    "                                pc = sp.playerContent(flag, epval, [])\n" +
    "                                pu = (pc or {}).get('url', '') if isinstance(pc, dict) else ''\n" +
    "                                if __csp_is_url__(pu): real_url = pu\n" +
    "                            except Exception as e:\n" +
    "                                errors.append(gname + ' ' + str(name) + ' ' + epname + ': ' + str(e))\n" +
    "                        if real_url:\n" +
    "                            out.append({\n" +
    "                                'name': (name or '未命名') + ' ' + epname,\n" +
    "                                'group': gname,\n" +
    "                                'logo': pic,\n" +
    "                                'urls': [real_url]\n" +
    "                            })\n" +
    "            try:\n" +
    "                if int(cat.get('pagecount', 1)) <= pg: break\n" +
    "            except Exception:\n" +
    "                break\n" +
    "    return {'channels': out, 'errors': errors}\n" +
    "\n" +
    "await __tvbox_driver__()\n";

  function looksLikeTvboxClassSpider(scriptText){
    const t = scriptText || '';
    return /from\s+base\.spider\s+import\s+Spider/.test(t) ||
           /class\s+Spider\s*\(\s*Spider\s*\)/.test(t) ||
           (/def\s+categoryContent\s*\(/.test(t) && /def\s+homeContent\s*\(/.test(t));
  }

  function cspSyncFetch(url, headers, params, method, data){
    let fullUrl = String(url || '');
    if (params) {
      try {
        const obj = (params instanceof Map) ? Object.fromEntries(params) : params;
        const usp = new URLSearchParams();
        Object.keys(obj || {}).forEach(function(k){ if (obj[k] !== undefined && obj[k] !== null) usp.append(k, obj[k]); });
        const qs = usp.toString();
        if (qs) fullUrl += (fullUrl.indexOf('?') === -1 ? '?' : '&') + qs;
      } catch(e) {}
    }
    function normHeaders(h){
      if (!h) return {};
      try { return (h instanceof Map) ? Object.fromEntries(h) : h; } catch(e) { return {}; }
    }
    const hdrs = normHeaders(headers);
    const upperMethod = (method || 'GET').toUpperCase();
    let sendBody = null;
    if (upperMethod !== 'GET' && upperMethod !== 'HEAD' && data !== undefined && data !== null) {
      if (typeof data === 'string') {
        sendBody = data;
      } else {
        try {
          const obj = (data instanceof Map) ? Object.fromEntries(data) : data;
          const usp = new URLSearchParams();
          Object.keys(obj || {}).forEach(function(k){ if (obj[k] !== undefined && obj[k] !== null) usp.append(k, obj[k]); });
          sendBody = usp.toString();
        } catch(e) { sendBody = String(data); }
      }
    }
    function attempt(u){
      const xhr = new XMLHttpRequest();
      xhr.open(upperMethod, u, false);
      Object.keys(hdrs).forEach(function(k){
        try { xhr.setRequestHeader(k, hdrs[k]); } catch(e){}
      });
      xhr.send(sendBody);
      if (xhr.status < 200 || xhr.status >= 400) {
        const err = new Error('HTTP ' + xhr.status);
        err.status = xhr.status;
        throw err;
      }
      return xhr;
    }
    try {
      const xhr = attempt(fullUrl);
      return { text: xhr.responseText, status: xhr.status };
    } catch(e) {
      const xhr2 = attempt('/relay?url=' + encodeURIComponent(fullUrl));
      return { text: xhr2.responseText, status: xhr2.status };
    }
  }

  async function ensureMicropip(pyodide){
    if (!pyodide.__micropipLoaded) {
      await pyodide.loadPackage('micropip');
      pyodide.__micropipLoaded = true;
    }
  }

  async function autoInstallAndRun(pyodide, runCodeFn, onStatus){
    const MAX_RETRIES = 5;
    const tried = new Set();
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await runCodeFn();
      } catch(e) {
        const msg = (e && e.message) || String(e);
        const m = msg.match(/ModuleNotFoundError: No module named '([^']+)'/);
        if (!m || attempt === MAX_RETRIES) throw e;
        const fullModName = m[1];
        const installName = fullModName.split('.')[0];
        if (tried.has(installName)) throw e;
        tried.add(installName);
        await ensureMicropip(pyodide);
        const micropip = pyodide.pyimport('micropip');
        if (onStatus) onStatus('检测到缺少 Python 模块 "' + fullModName + '"，正在自动安装 "' + installName + '"...');
        let tickTimer = null;
        try {
          if (onStatus) {
            const startedAt = Date.now();
            const dotsFrames = ['   ', '.  ', '.. ', '...'];
            let frame = 0;
            tickTimer = setInterval(function(){
              const elapsedSec = Math.floor((Date.now() - startedAt) / 1000);
              const dots = dotsFrames[frame % dotsFrames.length];
              frame++;
              onStatus('正在安装 Python 模块 "' + installName + '"' + dots + ' (已耗时 ' + elapsedSec + ' 秒，未卡顿，请稍候)');
            }, 700);
          }
          await micropip.install(installName);
        } catch(installErr) {
          throw new Error('脚本依赖模块 "' + installName + '" 无法在 Pyodide 环境中自动安装: ' +
            (installErr && installErr.message ? installErr.message : installErr));
        } finally {
          if (tickTimer) clearInterval(tickTimer);
        }
        if (onStatus) onStatus('模块 "' + installName + '" 安装完成，正在重新执行脚本...');
      }
    }
  }

  async function runTvboxClassSpider(spec, scriptText){
    setStatus('正在加载 Python 运行时(首次使用可能较慢)...', '');
    const pyodide = await withTimeout(loadPyodideRuntime(), 60000, 'Python 运行时加载超时，请检查网络后重试');

    setStatus('正在初始化 TVBox Spider 沙箱(' + spec.key + ')...', '');
    pyodide.globals.set('csp_sync_fetch', cspSyncFetch);
    pyodide.globals.set('SPIDER_EXT', spec.ext || null);
    await pyodide.runPythonAsync(BASE_SPIDER_STUB_PY);

    setStatus('正在执行 TVBox Spider 脚本(' + spec.key + ')...', '');
    let pyResult;
    try {
      pyResult = await withTimeout(
        autoInstallAndRun(
          pyodide,
          () => pyodide.runPythonAsync(scriptText + '\n\n' + TVBOX_DRIVER_PY),
          (msg) => setStatus(msg, '')
        ),
        45000,
        'TVBox Spider 脚本执行超时(分类/分页过多)'
      );
    } catch(e) {
      throw new Error('TVBox Spider 脚本执行出错: ' + (e && e.message ? e.message : String(e)));
    }

    let jsResult;
    if (pyResult && typeof pyResult.toJs === 'function') {
      try { jsResult = pyResult.toJs({ dict_converter: Object.fromEntries }); }
      finally { try { pyResult.destroy(); } catch(e) {} }
    } else {
      jsResult = pyResult;
    }

    let channelList = null;
    let errorList = [];
    if (Array.isArray(jsResult)) {
      channelList = jsResult;
    } else if (jsResult && typeof jsResult === 'object') {
      if (Array.isArray(jsResult.channels)) channelList = jsResult.channels;
      if (Array.isArray(jsResult.errors)) errorList = jsResult.errors;
    }

    if (!Array.isArray(channelList)) {
      throw new Error('TVBox Spider 脚本未能提取出任何频道(homeContent/categoryContent 返回结构无法识别)');
    }

    const out = [];
    channelList.forEach(function(item){
      const ch = channelFromObj(item, out.length, '');
      if (ch) out.push(ch);
    });

    if (out.length === 0) {
      const detail = errorList.length ? ('；具体错误: ' + errorList.slice(0, 3).join(' | ') + (errorList.length > 3 ? ' 等' : '')) : '(该 Spider 分类/分页可能确实为空，或播放地址提取逻辑与该脚本返回结构不匹配)';
      throw new Error('TVBox Spider(' + spec.key + ') 未提取到任何可播放频道' + detail);
    }

    return mergeChannelObjs(out);
  }

  function isCspSpiderInput(line){
    const t = (line || '').trim();
    if (!t) return false;
    if (/^csp_[A-Za-z0-9_]+\s*,\s*https?:\/\/\S+/i.test(t)) return true;
    if (/^\{[\s\S]*\}$/.test(t) && /"api"\s*:\s*"csp_[A-Za-z0-9_]+/i.test(t)) return true;
    if (/^https?:\/\/\S+\.py(\?\S*)?$/i.test(t)) return true;
    return false;
  }

  function parseCspSpiderSpec(line){
    const t = line.trim();
    const simpleMatch = t.match(/^csp_([A-Za-z0-9_]+)\s*,\s*(https?:\/\/\S+?)(?:\s*,\s*([\s\S]*))?$/i);
    if (simpleMatch) {
      return { key: simpleMatch[1], scriptUrl: simpleMatch[2].trim(), ext: (simpleMatch[3] || '').trim() };
    }
    const bareMatch = t.match(/^https?:\/\/\S+\.py(\?\S*)?$/i);
    if (bareMatch) {
      let key = 'spider';
      try {
        const u = new URL(t);
        const fname = (u.pathname.split('/').pop() || '').replace(/\.py$/i, '');
        if (fname) key = fname;
      } catch(e) {}
      return { key: key, scriptUrl: t, ext: '' };
    }
    try {
      const obj = JSON.parse(t);
      const apiVal = String((obj && (obj.api || obj.Api)) || '');
      const apiMatch = apiVal.match(/^csp_([A-Za-z0-9_]+)\s*(?:,\s*(https?:\/\/\S+))?/i);
      if (apiMatch) {
        let scriptUrl = apiMatch[2] || '';
        if (!scriptUrl && typeof obj.ext === 'string' && /^https?:\/\//i.test(obj.ext.trim())) {
          scriptUrl = obj.ext.trim();
        }
        if (/^https?:\/\//i.test(scriptUrl)) {
          const extVal = (typeof obj.ext === 'string' && obj.ext.trim() !== scriptUrl) ? obj.ext : '';
          return { key: apiMatch[1], scriptUrl: scriptUrl, ext: extVal };
        }
      }
    } catch(e) { }
    return null;
  }

  function withTimeout(promise, ms, timeoutMsg){
    return Promise.race([
      promise,
      new Promise(function(_, reject){
        setTimeout(function(){ reject(new Error(timeoutMsg || '操作超时')); }, ms);
      })
    ]);
  }

  async function cspHttpGet(url, headers){
    const h = headers || {};
    try {
      const resp = await fetch(url, { headers: h });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return await resp.text();
    } catch(e) {
      const relayResp = await fetch('/relay?url=' + encodeURIComponent(url));
      if (!relayResp.ok) throw new Error('HTTP ' + relayResp.status);
      return await relayResp.text();
    }
  }
  async function cspHttpGetBytes(url, headers){
    const h = headers || {};
    try {
      const resp = await fetch(url, { headers: h });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const buf = await resp.arrayBuffer();
      return new Uint8Array(buf);
    } catch(e) {
      const relayResp = await fetch('/relay?url=' + encodeURIComponent(url));
      if (!relayResp.ok) throw new Error('HTTP ' + relayResp.status);
      const buf = await relayResp.arrayBuffer();
      return new Uint8Array(buf);
    }
  }

  function loadPyodideRuntime(){
    if (pyodideInstance) return Promise.resolve(pyodideInstance);
    if (pyodideLoadingPromise) return pyodideLoadingPromise;
    pyodideLoadingPromise = (async function(){
      if (!window.loadPyodide) {
        await new Promise(function(resolve, reject){
          const s = document.createElement('script');
          s.src = PYODIDE_CDN_BASE + 'pyodide.js';
          s.onload = resolve;
          s.onerror = function(){ reject(new Error('Pyodide 运行时脚本加载失败，请检查网络')); };
          document.head.appendChild(s);
        });
      }
      const inst = await window.loadPyodide({ indexURL: PYODIDE_CDN_BASE });
      pyodideInstance = inst;
      return inst;
    })();
    return pyodideLoadingPromise;
  }

  function looksLikePythonScript(scriptUrl, scriptText){
    if (/\.py(\?|#|$)/i.test(scriptUrl)) return true;
    return /^\s*(import\s|from\s.+\simport\s|def\s|async\s+def\s|#\s*!.*python)/m.test(scriptText || '');
  }

  async function runCspPythonSpider(spec, scriptText){
    setStatus('正在加载 Python 运行时(首次使用可能较慢)...', '');
    const pyodide = await withTimeout(loadPyodideRuntime(), 60000, 'Python 运行时加载超时，请检查网络后重试');

    setStatus('正在执行 CSP Spider 脚本(' + spec.key + ')...', '');
    pyodide.globals.set('http_get', cspHttpGet);
    pyodide.globals.set('http_get_bytes', cspHttpGetBytes);
    pyodide.globals.set('SPIDER_EXT', spec.ext || null);

    const entryNamesLiteral = CSP_ENTRY_CANDIDATES.map(function(n){ return "'" + n + "'"; }).join(', ');
    const wrapped = scriptText + '\n\n' +
      'import asyncio as __csp_asyncio__\n' +
      'async def __csp_entry__():\n' +
      '    _fn = None\n' +
      '    for _n in (' + entryNamesLiteral + '):\n' +
      '        if _n in globals():\n' +
      '            _fn = globals()[_n]\n' +
      '            break\n' +
      '    if _fn is None:\n' +
      '        raise RuntimeError("未在脚本中找到入口函数: get_channels()/getlist()/get_list()/main()/run()")\n' +
      '    _res = _fn()\n' +
      '    if __csp_asyncio__.iscoroutine(_res):\n' +
      '        _res = await _res\n' +
      '    return _res\n' +
      'await __csp_entry__()\n';

    let pyResult;
    try {
      pyResult = await withTimeout(
        autoInstallAndRun(
          pyodide,
          () => pyodide.runPythonAsync(wrapped),
          (msg) => setStatus(msg, '')
        ),
        30000,
        'CSP Spider 脚本执行超时(超过30秒)'
      );
    } catch(e) {
      throw new Error('CSP Spider 脚本执行出错: ' + (e && e.message ? e.message : String(e)));
    }

    let jsResult;
    if (pyResult && typeof pyResult.toJs === 'function') {
      try {
        jsResult = pyResult.toJs({ dict_converter: Object.fromEntries });
      } finally {
        try { pyResult.destroy(); } catch(e) {}
      }
    } else {
      jsResult = pyResult;
    }

    if (!Array.isArray(jsResult)) {
      throw new Error('CSP Spider 脚本返回的数据格式不正确，期望返回一个频道列表数组');
    }

    const out = [];
    jsResult.forEach(function(item){
      const ch = channelFromObj(item, out.length, '');
      if (ch) out.push(ch);
    });
    return mergeChannelObjs(out);
  }

  async function runCspSpider(line){
    const spec = parseCspSpiderSpec(line);
    if (!spec) throw new Error('无法识别 csp_XXX Spider 源格式，应为 "csp_名称,脚本地址"、包含 api 字段的 JSON，或以 .py 结尾的脚本地址');
    setStatus('正在拉取 CSP Spider 脚本(' + spec.key + ')...', '');
    const scriptText = await fetchTextWithRelay(spec.scriptUrl);
    if (!looksLikePythonScript(spec.scriptUrl, scriptText)) {
      throw new Error('CSP Spider 脚本(' + spec.key + ')暂不支持该语言类型，目前仅支持 Python(.py)脚本');
    }
    if (looksLikeTvboxClassSpider(scriptText)) {
      return await runTvboxClassSpider(spec, scriptText);
    }
    return await runCspPythonSpider(spec, scriptText);
  }

  function looksLikeBase64(s){
    if (!s || s.length < 16) return false;
    const compact = s.replace(/\s+/g, '');
    if (compact.length < 16 || compact.length % 4 !== 0 && !/^[A-Za-z0-9+/_-]+=*$/.test(compact)) {
    }
    return /^[A-Za-z0-9+/_-]+={0,2}$/.test(compact) && /[A-Za-z]/.test(compact);
  }

  function base64UrlToStandard(s){
    return s.replace(/-/g, '+').replace(/_/g, '/');
  }

  function decodeBase64Utf8(b64){
    try {
      const std = base64UrlToStandard(b64.replace(/\s+/g, ''));
      const padded = std + '='.repeat((4 - (std.length % 4)) % 4);
      const binStr = atob(padded);
      const bytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
      return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    } catch(e) {
      return null;
    }
  }

  function tryDecodeSubscription(text){
    let t = text.trim();
    const dataUriMatch = t.match(/^data:[^,]*;base64,([\s\S]+)$/i);
    if (dataUriMatch) {
      t = dataUriMatch[1].trim();
    } else {
      const prefixMatch = t.match(/^base64,([\s\S]+)$/i);
      if (prefixMatch) t = prefixMatch[1].trim();
    }
    if (!looksLikeBase64(t)) return null;
    const decoded = decodeBase64Utf8(t);
    if (!decoded) return null;
    const dtrim = decoded.trim();
    if (/#EXTM3U|#EXTINF/i.test(dtrim) || /^[\{\[]/.test(dtrim) || /https?:\/\//i.test(dtrim)) {
      return decoded;
    }
    return null;
  }

  const XML_URL_TAGS = ['url', 'link', 'stream', 'src', 'address', 'playurl', 'durl', 'm3u8', 'file'];
  const XML_URL_ATTRS = ['url', 'link', 'src', 'href', 'stream', 'address', 'playurl', 'durl'];
  const XML_URL_CONTAINER_TAGS = ['urls', 'streams', 'lines'];
  const XML_NAME_ATTRS = ['name', 'title', 'text', 'tvg-name'];
  const XML_NAME_TAGS = ['name', 'title', 'display-name', 'text'];
  const XML_LOGO_ATTRS = ['logo', 'icon', 'pic', 'tvg-logo', 'image'];
  const XML_LOGO_TAGS = ['logo', 'icon', 'pic', 'image'];
  const XML_GROUP_ATTRS = ['group', 'category', 'class', 'type', 'group-title'];
  const XML_GROUP_TAGS = ['group', 'category', 'class', 'type'];
  const XML_SKIP_TAGS = ['programme'];

  function xmlGetAttr(el, names){
    for (let i = 0; i < names.length; i++) {
      const v = el.getAttribute && el.getAttribute(names[i]);
      if (v && v.trim()) return v.trim();
    }
    return '';
  }
  function xmlFindChildrenByNames(el, names){
    const out = [];
    if (!el.children) return out;
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i];
      const tag = child.tagName ? child.tagName.toLowerCase() : '';
      if (names.indexOf(tag) !== -1) out.push(child);
    }
    return out;
  }
  function xmlFindChildByNames(el, names){
    const found = xmlFindChildrenByNames(el, names);
    return found.length ? found[0] : null;
  }
  function extractXmlUrls(el){
    let urls = [];
    const attrUrl = xmlGetAttr(el, XML_URL_ATTRS);
    if (attrUrl) urls = urls.concat(splitUrlString(attrUrl));
    xmlFindChildrenByNames(el, XML_URL_TAGS).forEach(function(c){
      if (c.textContent && c.textContent.trim()) urls = urls.concat(splitUrlString(c.textContent));
    });
    xmlFindChildrenByNames(el, XML_URL_CONTAINER_TAGS).forEach(function(container){
      if (container.children && container.children.length) {
        for (let i = 0; i < container.children.length; i++) {
          const gc = container.children[i];
          if (gc.textContent && gc.textContent.trim()) urls = urls.concat(splitUrlString(gc.textContent));
        }
      } else if (container.textContent && container.textContent.trim()) {
        urls = urls.concat(splitUrlString(container.textContent));
      }
    });
    if (!urls.length) {
      const tag = el.tagName ? el.tagName.toLowerCase() : '';
      if (XML_URL_TAGS.indexOf(tag) !== -1 && el.textContent) urls = urls.concat(splitUrlString(el.textContent));
    }
    return urls.map(function(u){ return u.trim(); }).filter(isValidStreamUrl);
  }
  function xmlChannelFromEl(el, fallbackIdx, inheritedGroup){
    const urls = dedupUrls(extractXmlUrls(el));
    if (!urls.length) return null;
    let name = xmlGetAttr(el, XML_NAME_ATTRS);
    if (!name) { const nc = xmlFindChildByNames(el, XML_NAME_TAGS); if (nc && nc.textContent) name = nc.textContent.trim(); }
    if (!name) name = '频道 ' + (fallbackIdx + 1);
    let logo = xmlGetAttr(el, XML_LOGO_ATTRS);
    if (!logo) { const lc = xmlFindChildByNames(el, XML_LOGO_TAGS); if (lc && lc.textContent) logo = lc.textContent.trim(); }
    let group = xmlGetAttr(el, XML_GROUP_ATTRS);
    if (!group) { const gc = xmlFindChildByNames(el, XML_GROUP_TAGS); if (gc && gc.textContent) group = gc.textContent.trim(); }
    if (!group) group = inheritedGroup || '';
    return { name: name, logo: logo || '', group: group, urls: urls };
  }
  function deepScanXml(el, inheritedGroup, depth, out, seen){
    if (!el || depth > 8 || el.nodeType !== 1) return;
    if (seen.has(el)) return;
    seen.add(el);
    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    if (XML_SKIP_TAGS.indexOf(tag) !== -1) return;
    const ch = xmlChannelFromEl(el, out.length, inheritedGroup);
    if (ch) { out.push(ch); return; }
    let nextGroup = inheritedGroup;
    const g = xmlGetAttr(el, XML_GROUP_ATTRS);
    if (g) {
      nextGroup = g;
    } else if (XML_GROUP_TAGS.indexOf(tag) !== -1) {
      const gn = xmlGetAttr(el, XML_NAME_ATTRS) || ((!el.children || !el.children.length) && el.textContent ? el.textContent.trim() : '');
      if (gn) nextGroup = gn;
    }
    if (el.children) {
      for (let i = 0; i < el.children.length; i++) {
        deepScanXml(el.children[i], nextGroup, depth + 1, out, seen);
      }
    }
  }
  function parseXML(text){
    let doc;
    try {
      doc = new DOMParser().parseFromString(text, 'application/xml');
    } catch(e) { return null; }
    if (!doc || !doc.documentElement) return null;
    if (doc.getElementsByTagName('parsererror').length) return null;
    const out = [];
    deepScanXml(doc.documentElement, '', 0, out, new Set());
    return out.length ? mergeChannelObjs(out) : [];
  }

  function parsePlaylistCore(text, _skipBase64){
    const trimmed = text.replace(/^\uFEFF/, '').trim();

    if (!_skipBase64) {
      const decoded = tryDecodeSubscription(trimmed);
      if (decoded) {
        const inner = parsePlaylistCore(decoded, true);
        return { type: inner.type + '(Base64)', channels: inner.channels };
      }
    }

    if (trimmed.startsWith('#EXTM3U') || /#EXTINF/i.test(trimmed)) {
      return { type: 'M3U', channels: parseM3U(text) };
    }
    if (trimmed.startsWith('<')) {
      let cmsDoc;
      try { cmsDoc = new DOMParser().parseFromString(trimmed, 'application/xml'); } catch(e) { cmsDoc = null; }
      if (cmsDoc && !cmsDoc.getElementsByTagName('parsererror').length && isAppleCMSXML(cmsDoc)) {
        const cmsChannels = mergeChannelObjs(parseAppleCMSXMLDoc(cmsDoc));
        return { type: 'AppleCMS(XML)', channels: cmsChannels };
      }
      const xmlResult = parseXML(trimmed);
      if (xmlResult && xmlResult.length) return { type: 'XML', channels: xmlResult };
      if (xmlResult !== null) return { type: 'XML', channels: [] };
    }
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      const jsonResult = parseJSON(trimmed);
      if (jsonResult && jsonResult.length) {
        let isCms = false;
        let isCsp = false;
        try {
          const d = JSON.parse(trimmed);
          isCms = !!(d && d.__prescanned) || isAppleCMSResponse(d);
          isCsp = !!(d && d.__cspSpider);
        } catch(e) {}
        return { type: isCsp ? 'CSP-Spider(PY)' : (isCms ? 'AppleCMS' : 'JSON'), channels: jsonResult };
      }
      const pyData = tryParsePythonLiteral(trimmed);
      if (pyData !== null) {
        const pyChannels = parsePyLiteralChannels(pyData);
        if (pyChannels && pyChannels.length) {
          return { type: isAppleCMSResponse(pyData) ? 'AppleCMS(PY)' : 'JSON(PY)', channels: pyChannels };
        }
      }
      try { JSON.parse(trimmed); return { type: 'JSON', channels: [] }; } catch(e) { }
    }
    if (/#genre#/i.test(trimmed) || /^[^,\t\n]+[,\t]\s*https?:\/\//im.test(trimmed)) {
      return { type: 'TXT', channels: parseTXT(text) };
    }
    return { type: 'M3U', channels: parseM3U(text) };
  }

  function genericUrlFallbackScan(text){
    const re = /(https?|rtmp|rtmps|rtsp|udp|rtp|mms|mmsh|srt|ftp):\/\/[^\s"'<>#]+/gi;
    const matches = text.match(re) || [];
    const urls = dedupUrls(matches.map(function(u){ return u.trim(); }));
    return urls.map(function(u, i){
      return { name: '频道 ' + (i + 1), logo: '', group: '', urls: [u] };
    });
  }

  function parsePlaylist(text, _skipBase64){
    const result = parsePlaylistCore(text, _skipBase64);
    if (!result.channels || result.channels.length === 0) {
      const fallback = genericUrlFallbackScan(text);
      if (fallback.length) {
        return { type: (result.type || '未知格式') + '+通用扫描', channels: fallback };
      }
    }
    return result;
  }

  function isGzipBytes(bytes){
    return bytes && bytes.length > 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
  }
  async function maybeGunzip(buf){
    const bytes = new Uint8Array(buf);
    if (!isGzipBytes(bytes)) return bytes;
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('当前浏览器不支持 gzip 解压(缺少 DecompressionStream)，请更换最新版 Chrome/Edge/Safari');
    }
    const ds = new DecompressionStream('gzip');
    const stream = new Blob([bytes]).stream().pipeThrough(ds);
    const decompressedBuf = await new Response(stream).arrayBuffer();
    return new Uint8Array(decompressedBuf);
  }
  function bytesToText(bytes){
    const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    const badCount = (utf8.match(/\uFFFD/g) || []).length;
    if (badCount > 0 && badCount > bytes.length * 0.005) {
      try {
        const gbk = new TextDecoder('gbk', { fatal: false }).decode(bytes);
        const gbkBad = (gbk.match(/\uFFFD/g) || []).length;
        if (gbkBad < badCount) return gbk;
      } catch(e) { }
    }
    return utf8;
  }

  async function resolveContent(raw){
    const trimmed = raw.trim();

    if (isCspSpiderInput(trimmed)) {
      const cspChannels = await runCspSpider(trimmed);
      return JSON.stringify({ list: [], __prescanned: cspChannels, __cspSpider: true });
    }

    const isSingleUrlLine = /^https?:\/\//i.test(trimmed) && !trimmed.includes('#EXTM3U') && !/#genre#/i.test(trimmed) && !trimmed.includes('\n');

    if (isSingleUrlLine && isAppleCMSUrl(trimmed)) {
      return await fetchAppleCMSAll(trimmed);
    }

    if (!isSingleUrlLine) {
      return raw;
    }
    try {
      const resp = await fetch(trimmed, { headers: { 'Accept': 'text/plain,application/json,application/xml,application/gzip,*/*' } });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const buf = await resp.arrayBuffer();
      const bytes = await maybeGunzip(buf);
      return bytesToText(bytes);
    } catch(directErr) {
      try {
        setStatus('直连拉取失败，尝试通过服务端转发...', '');
        const relayResp = await fetch('/relay?url=' + encodeURIComponent(trimmed), {
          headers: { 'Accept': 'text/plain,application/json,application/xml,application/gzip,*/*' }
        });
        if (!relayResp.ok) throw new Error('HTTP ' + relayResp.status);
        const buf = await relayResp.arrayBuffer();
        const bytes = await maybeGunzip(buf);
        return bytesToText(bytes);
      } catch(relayErr) {
        throw new Error('直连失败(' + directErr.message + ')，转发也失败(' + relayErr.message + ')');
      }
    }
  }

  function splitRawLines(raw){
    return raw.replace(/^\uFEFF/, '').split(/\r?\n/).map(function(l){ return l.trim(); }).filter(Boolean);
  }

  function isMultiUrlInput(raw){
    const lines = splitRawLines(raw);
    if (lines.length < 2) return false;
    return lines.every(function(l){ return isValidStreamUrl(l) || isCspSpiderInput(l); });
  }

  async function resolveAndParse(raw){
    if (!isMultiUrlInput(raw)) {
      const text = await resolveContent(raw);
      return parsePlaylist(text);
    }

    const lines = splitRawLines(raw);
    let allChannels = [];
    const typesSeen = [];
    let okCount = 0, failCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      setStatus('正在解析第 ' + (i + 1) + ' / ' + lines.length + ' 个源...', '');
      try {
        const text = await resolveContent(line);
        const parsed = parsePlaylist(text);
        if (parsed.channels && parsed.channels.length) {
          allChannels = allChannels.concat(parsed.channels);
          if (typesSeen.indexOf(parsed.type) === -1) typesSeen.push(parsed.type);
          okCount++;
        } else {
          failCount++;
        }
      } catch(e) {
        failCount++;
        console.warn('[多源解析] 第 ' + (i + 1) + ' 个源失败: ' + line, e);
      }
    }

    const merged = mergeChannelObjs(allChannels);
    const typeLabel = (typesSeen.length ? typesSeen.join('+') : 'MIX') + '(' + okCount + '/' + lines.length + ' 源)';
    if (failCount > 0) {
      setStatus(failCount + ' 个源解析失败，已忽略并合并其余 ' + okCount + ' 个源', okCount ? '' : 'err');
    }
    return { type: typeLabel, channels: merged };
  }

  function renderSources(){
    sourceCount.textContent = sources.length;
    if (sources.length === 0) {
      sourceList.innerHTML = '<div class="empty-tip">暂无源，请联系管理员在后台添加</div>';
      return;
    }
    const sorted = sources.slice().sort(function(a, b){
      const af = sourceFavIds.indexOf(a.id) !== -1;
      const bf = sourceFavIds.indexOf(b.id) !== -1;
      if (bf !== af) return (bf ? 1 : 0) - (af ? 1 : 0);
      return 0;
    });
    sourceList.innerHTML = '';
    sorted.forEach(function(src){
      const isFav = sourceFavIds.indexOf(src.id) !== -1;
      const item = document.createElement('div');
      item.className = 'source-item' + (src.id === currentSourceId ? ' active' : '');

      const typePill2 = document.createElement('span');
      typePill2.className = 'src-type';
      typePill2.textContent = src.format || '?';
      item.appendChild(typePill2);

      const name = document.createElement('div');
      name.className = 'src-name';
      name.textContent = src.name;
      item.appendChild(name);

      const actions = document.createElement('div');
      actions.className = 'src-actions';

      const starBtn = document.createElement('button');
      starBtn.className = 'icon-btn star' + (isFav ? ' fav' : '');
      starBtn.title = isFav ? '取消置顶' : '置顶';
      starBtn.textContent = isFav ? '★' : '☆';
      starBtn.addEventListener('click', function(e){
        e.stopPropagation();
        toggleSourceFav(src.id);
        renderSources();
      });

      actions.appendChild(starBtn);
      item.appendChild(actions);

      item.addEventListener('click', function(){
        loadAndApplySource(src);
      });

      sourceList.appendChild(item);
    });
  }

  async function loadAndApplySource(src){
    currentSourceId = src.id;
    saveCurrentSourceId();
    renderSources();
    setStatus('正在加载「' + src.name + '」...', '');
    try {
      const parsed = await resolveAndParse(src.raw);
      channels = parsed.channels;
      src.format = parsed.type;
      renderSources();
      activeIndex = -1;
      activeLineIdx = 0;
      channelSearch.value = '';
      renderChannels();
      setStatus('已加载「' + src.name + '」(' + parsed.type + ')，共 ' + channels.length + ' 个频道', channels.length ? 'live' : 'err');
      if (channels.length) {
        setCardCollapsed('sources', true);
        setCardCollapsed('channels', false);
      }
    } catch(e) {
      setStatus('源拉取失败(可能不支持跨域 CORS，或 CSP Spider 脚本执行出错): ' + e.message, 'err');
    }
  }

  function getFilteredIndices(){
    const q = (channelSearch.value || '').trim().toLowerCase();
    const idxs = [];
    channels.forEach(function(ch, idx){
      if (!q || ch.name.toLowerCase().indexOf(q) !== -1) idxs.push(idx);
    });
    return idxs;
  }

  const PLACEHOLDER_LOGO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"><rect width="30" height="30" fill="%23333"/></svg>';

  function renderChannels(){
    m3uCount.textContent = channels.length;
    updateFabBadge(channels.length);
    prevSourceBtn.disabled = nextSourceBtn.disabled = channels.length === 0;
    filteredIdx = getFilteredIndices();
    if (channels.length === 0) {
      channelList.innerHTML = '<div class="empty-tip">暂无频道，添加并选择一个源后显示</div>';
      return;
    }
    if (filteredIdx.length === 0) {
      channelList.innerHTML = '<div class="empty-tip">未找到匹配的频道</div>';
      return;
    }
    channelList.innerHTML = '';
    let lastGroup = null;
    filteredIdx.forEach(function(idx){
      const ch = channels[idx];
      if (ch.group && ch.group !== lastGroup) {
        const groupEl = document.createElement('div');
        groupEl.className = 'channel-group';
        groupEl.textContent = ch.group;
        channelList.appendChild(groupEl);
        lastGroup = ch.group;
      }
      const item = document.createElement('div');
      item.className = 'channel-item' + (idx === activeIndex ? ' active' : '');
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      if (ch.logo) {
        let triedRelay = false;
        img.onerror = function(){
          if (!triedRelay) {
            triedRelay = true;
            this.src = '/relay?url=' + encodeURIComponent(ch.logo);
          } else {
            this.onerror = null;
            this.src = PLACEHOLDER_LOGO;
          }
        };
        img.src = ch.logo;
      } else {
        img.src = PLACEHOLDER_LOGO;
      }
      const name = document.createElement('div');
      name.className = 'ch-name';
      name.textContent = ch.name;
      item.appendChild(img);
      item.appendChild(name);
      const starBtn = document.createElement('button');
      const favedNow = isFavorited(ch);
      starBtn.className = 'icon-btn star-ch' + (favedNow ? ' fav' : '');
      starBtn.title = favedNow ? '取消收藏该频道' : '收藏该频道';
      starBtn.textContent = favedNow ? '★' : '☆';
      starBtn.addEventListener('click', function(e){
        e.stopPropagation();
        toggleFavoriteChannel(ch);
      });
      item.appendChild(starBtn);
      if (ch.urls && ch.urls.length > 1) {
        const lines = document.createElement('span');
        lines.className = 'ch-lines';
        lines.textContent = ch.urls.length + '线';
        item.appendChild(lines);
      }
      item.addEventListener('click', function(){
        selectChannel(idx);
      });
      channelList.appendChild(item);
    });
  }

  channelSearch.addEventListener('input', renderChannels);

  function selectChannel(idx, silent){
    if (channels.length === 0) return;
    activeIndex = ((idx % channels.length) + channels.length) % channels.length;
    activeLineIdx = 0;
    const ch = channels[activeIndex];
    urlInput.value = ch.urls[0];
    renderChannels();
    playUrl(ch.urls[0]);
    if (!silent) showSwipeToast(ch.name);
    const activeEl = channelList.querySelector('.channel-item.active');
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    closeDrawer();
  }
  function selectRelative(step){
    if (filteredIdx.length === 0) return;
    let pos = filteredIdx.indexOf(activeIndex);
    if (pos === -1) pos = 0;
    else pos = ((pos + step) % filteredIdx.length + filteredIdx.length) % filteredIdx.length;
    selectChannel(filteredIdx[pos]);
  }

  let toastTimer = null;
  function showSwipeToast(text){
    swipeToast.textContent = text;
    swipeToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){
      swipeToast.classList.remove('show');
    }, 1100);
  }
  (function initSwipeGesture(){
    let startX = 0, startY = 0, startTime = 0, tracking = false;
    const THRESHOLD = 50;
    const MAX_X_DRIFT = 60;
    const MAX_DURATION = 700;

    videoWrap.addEventListener('touchstart', function(e){
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      startX = t.clientX; startY = t.clientY; startTime = Date.now();
      tracking = true;
      hideFullscreenHint();
    }, { passive: true });

    videoWrap.addEventListener('touchend', function(e){
      if (!tracking) return;
      tracking = false;
      if (channels.length === 0) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const dt = Date.now() - startTime;
      if (dt > MAX_DURATION) return;
      if (Math.abs(dx) > MAX_X_DRIFT) return;
      if (Math.abs(dy) < THRESHOLD) return;
      if (dy < 0) {
        selectRelative(1);
      } else {
        selectRelative(-1);
      }
    }, { passive: true });
  })();

  const STORAGE_CARD_COLLAPSE = 'm3u_card_collapse_v1';

  function loadCardCollapseState(){
    let state = {};
    try {
      const raw = localStorage.getItem(STORAGE_CARD_COLLAPSE);
      state = raw ? JSON.parse(raw) : {};
    } catch(e) { state = {}; }
    document.querySelectorAll('.card.collapsible').forEach(function(card){
      const id = card.getAttribute('data-card-id');
      if (!id || !(id in state)) return;
      card.classList.toggle('collapsed', !!state[id]);
    });
  }

  function saveCardCollapseState(){
    const state = {};
    document.querySelectorAll('.card.collapsible').forEach(function(card){
      const id = card.getAttribute('data-card-id');
      if (!id) return;
      state[id] = card.classList.contains('collapsed');
    });
    try { localStorage.setItem(STORAGE_CARD_COLLAPSE, JSON.stringify(state)); } catch(e) {}
  }

  function setCardCollapsed(id, collapsed){
    const card = document.querySelector('.card.collapsible[data-card-id="' + id + '"]');
    if (!card) return;
    card.classList.toggle('collapsed', !!collapsed);
    saveCardCollapseState();
  }

  document.querySelectorAll('.card.collapsible .card-toggle').forEach(function(toggle){
    toggle.addEventListener('click', function(){
      const card = toggle.closest('.card');
      card.classList.toggle('collapsed');
      saveCardCollapseState();
    });
  });

  loadCardCollapseState();

  syncCodeInput.addEventListener('change', function(){
    saveSyncCode(syncCodeInput.value.trim());
  });
  syncPullBtn.addEventListener('click', function(){
    saveSyncCode(syncCodeInput.value.trim());
    pullFavoritesFromCloud();
  });
  syncPushBtn.addEventListener('click', function(){
    saveSyncCode(syncCodeInput.value.trim());
    pushFavoritesToCloud();
  });

  loadCurrentSourceId();
  loadSourceFavIds();
  loadFavoritesFromStorage();
  loadSyncCode();
  syncCodeInput.value = syncCode;
  renderFavorites();
  fetchSourcesFromServer().then(function(){
    renderSources();
  });
  if (syncCode) pullFavoritesFromCloud(true);
  applyTransform();

})();
