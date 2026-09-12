/**
 * 风月 Player - Cloudflare Workers / Pages 边缘部署单文件
 * 由 build.js 自动生成，请勿直接手动修改此文件。
 * 源码开发请编辑 src/ 目录下的对应模块文件。
 */

const HTML_PAGE = String.raw`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>风月 Player</title>
<link rel="icon" type="image/png" href="https://image.yzfy.dpdns.org/2026/07/dbeedf4faea83981fdcdafe7b2ad1554.png">
<script src="https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/flv.js@1/dist/flv.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mpegts.js@1/dist/mpegts.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dashjs@4/dist/dash.all.min.js"></script>
<style>
:root{
    --bg-1:#0f1020;
    --bg-2:#1a1c34;
    --accent:#7c5cff;
    --accent-2:#37e2c8;
    --card:rgba(255,255,255,0.06);
    --card-border:rgba(255,255,255,0.12);
    --text:#eef0ff;
    --text-dim:#9a9cc0;
  }
  *{box-sizing:border-box;}
  html,body{height:100%;margin:0;}
  body{
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;
    background:
      radial-gradient(1200px 600px at 10% -10%, rgba(124,92,255,.35), transparent 60%),
      radial-gradient(1000px 500px at 110% 10%, rgba(55,226,200,.25), transparent 55%),
      linear-gradient(160deg, var(--bg-1), var(--bg-2));
    color:var(--text);
    min-height:100%;
    display:flex;
    flex-direction:column;
    padding-top:env(safe-area-inset-top);
    padding-bottom:env(safe-area-inset-bottom);
    -webkit-tap-highlight-color:transparent;
  }
  html{-webkit-text-size-adjust:100%;}
  header{
    padding:18px 24px 8px;
    display:flex;
    align-items:center;
    gap:12px;
    flex-wrap:wrap;
  }
  header .logo{
    width:34px;height:34px;border-radius:10px;
    background:linear-gradient(135deg,var(--accent),var(--accent-2));
    display:flex;align-items:center;justify-content:center;
    font-weight:700;font-size:16px;color:#0f1020;
    box-shadow:0 6px 18px rgba(124,92,255,.35);
  }
  header h1{
    font-size:18px;margin:0;font-weight:600;letter-spacing:.3px;
  }
  header span.tag{
    font-size:11px;color:var(--text-dim);
    border:1px solid var(--card-border);
    padding:3px 8px;border-radius:999px;
    margin-left:6px;
  }
  .header-toggle-btn{
    width:34px;height:34px;min-height:34px;
    margin-left:auto;
    flex-shrink:0;
    border:1px solid var(--card-border);
    background:rgba(255,255,255,.04);
    border-radius:10px;
  }
  .header-toggle-btn:hover{background:rgba(255,255,255,.1);color:var(--text);}
  .header-toggle-btn.active{
    color:#fff;
    border-color:transparent;
    background:linear-gradient(135deg,var(--accent),var(--accent-2));
  }
  .container{
    flex:1;
    display:flex;
    gap:18px;
    padding:8px 24px 24px;
    max-width:1400px;
    margin:0 auto;
    width:100%;
    transition:gap .25s ease;
  }
  @media (min-width: 861px){
    .sidebar{
      transition:width .25s ease, opacity .2s ease, margin .25s ease;
      overflow:hidden;
    }
    .container.sidebar-collapsed{
      gap:0;
    }
    .container.sidebar-collapsed .sidebar{
      width:0;
      min-width:0;
      opacity:0;
      pointer-events:none;
    }
  }
  .sidebar-drawer-head{ display:none; }
  .sidebar-backdrop{ display:none; }
  .menu-fab{ display:none; }
  @media (max-width: 1024px){
    .sidebar{width:300px;}
  }
  @media (max-width: 860px){
    .container{flex-direction:column;padding:8px 16px 20px;}

    .header-toggle-btn{display:none;}

    .sidebar{
      position:fixed;
      top:0;
      right:-100%;
      width:min(86vw, 380px);
      height:100%;
      height:100dvh;
      z-index:60;
      margin:0;
      padding:14px 14px calc(14px + env(safe-area-inset-bottom));
      padding-top:calc(14px + env(safe-area-inset-top));
      background:linear-gradient(160deg, #181a30, #14152a);
      border-left:1px solid var(--card-border);
      box-shadow:-20px 0 50px rgba(0,0,0,.45);
      overflow-y:auto;
      -webkit-overflow-scrolling:touch;
      transition:right .28s cubic-bezier(.32,.72,0,1);
    }
    .sidebar.open{
      right:0;
    }
    .sidebar-drawer-head{
      display:flex;
      align-items:center;
      justify-content:space-between;
      font-size:15px;
      font-weight:700;
      color:var(--text);
      padding-bottom:4px;
    }
    .sidebar-drawer-head .icon-btn{
      width:32px;height:32px;min-height:32px;
      background:rgba(255,255,255,.08);
      font-size:16px;
    }
    .sidebar-backdrop{
      display:block;
      position:fixed;
      inset:0;
      background:rgba(5,6,16,.55);
      backdrop-filter:blur(2px);
      z-index:55;
      opacity:0;
      pointer-events:none;
      transition:opacity .25s;
    }
    .sidebar-backdrop.show{
      opacity:1;
      pointer-events:auto;
    }
    .menu-fab{
      display:flex;
      align-items:center;
      justify-content:center;
      gap:0;
      position:fixed;
      right:18px;
      bottom:calc(18px + env(safe-area-inset-bottom));
      width:54px;height:54px;
      border-radius:50%;
      background:linear-gradient(135deg,var(--accent),#9b7bff);
      color:#fff;
      border:none;
      box-shadow:0 10px 26px rgba(124,92,255,.5);
      z-index:50;
      cursor:pointer;
    }
    .menu-fab-badge{
      position:absolute;
      top:-2px;right:-2px;
      min-width:18px;height:18px;
      border-radius:999px;
      background:var(--accent-2);
      color:#0f1020;
      font-size:11px;
      font-weight:800;
      display:flex;align-items:center;justify-content:center;
      padding:0 4px;
      box-shadow:0 0 0 2px #181a30;
    }
    .video-wrap{max-height:75vh;}

    #urlInput, #channelSearch, #syncCodeInput{
      font-size:16px;
    }
  }
  @media (max-width: 480px){
    header{padding:14px 16px 6px;}
    header h1{font-size:16px;}
    header span.tag{display:none;}
    .container{padding:6px 12px 16px;gap:14px;}
    .input-bar{padding:12px;}
    .meta-row{padding:0 12px 12px;}
    .card{padding:12px;}
    .player-card,.card{border-radius:14px;}
    .video-wrap{aspect-ratio:16/9;}
    button{padding:12px 16px;}
    .input-bar input[type=text]{min-width:100%;}
    .input-bar button{flex:1;}
    .icon-btn{width:34px;height:34px;min-height:34px;font-size:16px;}
    .source-item{padding:10px 8px;}
    .player-toolbar{padding:10px 12px 0;gap:6px;}
    .toolbar-btn{padding:8px 10px;font-size:11px;min-height:34px;}
  }
  @media (orientation: landscape) and (max-height: 480px){
    header{display:none;}
    .container{padding:6px;gap:10px;}
    .video-wrap{aspect-ratio:auto;height:88vh;}
    .sidebar .card:first-child h3{font-size:12px;}
  }
  .main{
    flex:1;
    min-width:0;
    display:flex;
    flex-direction:column;
    gap:16px;
  }
  .player-card{
    background:var(--card);
    border:1px solid var(--card-border);
    border-radius:18px;
    overflow:hidden;
    backdrop-filter:blur(10px);
    box-shadow:0 20px 50px rgba(0,0,0,.35);
  }
  .video-wrap{
    position:relative;
    width:100%;
    aspect-ratio:16/9;
    max-height:80vh;
    margin:0 auto;
    background:#000;
    overflow:hidden;
  }
  .video-wrap.force-landscape{
    position:fixed !important;
    top:0;left:0;
    width:100vh;
    height:100vw;
    max-height:none;
    aspect-ratio:auto;
    transform-origin:top left;
    transform:rotate(90deg) translateY(-100%);
    z-index:500;
    margin:0;
    border-radius:0;
    background:#000;
  }
  #mediaRotator{
    position:absolute;
    top:50%;left:50%;
    width:100%;
    height:100%;
    transform:translate(-50%,-50%);
    transform-origin:center center;
    transition:transform .25s ease, width .25s ease, height .25s ease;
    will-change:transform;
  }
  video{
    width:100%;height:100%;
    display:block;
    background:#000;
    object-fit:contain;
  }
  #imagePreview{
    width:100%;height:100%;
    display:none;
    background:#000;
    object-fit:contain;
  }
  .audio-cover{
    position:absolute;inset:0;
    display:none;
    flex-direction:column;
    align-items:center;justify-content:center;
    gap:14px;
    background:linear-gradient(160deg, rgba(124,92,255,.25), rgba(15,16,32,.9));
    color:var(--text);
    pointer-events:none;
    z-index:4;
    text-align:center;
    padding:20px;
  }
  .audio-cover .audio-icon{
    width:84px;height:84px;border-radius:50%;
    background:linear-gradient(135deg,var(--accent),var(--accent-2));
    display:flex;align-items:center;justify-content:center;
    font-size:34px;
    box-shadow:0 12px 30px rgba(124,92,255,.4);
    animation:audioSpin 6s linear infinite paused;
  }
  .audio-cover.playing .audio-icon{animation-play-state:running;}
  @keyframes audioSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  .audio-cover .audio-title{font-size:14px;font-weight:600;max-width:80%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .audio-cover .audio-sub{font-size:11px;color:var(--text-dim);}
  .video-overlay{
    position:absolute;inset:0;
    display:flex;align-items:center;justify-content:center;
    flex-direction:column;
    gap:10px;
    color:var(--text-dim);
    font-size:14px;
    pointer-events:none;
    background:linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.15));
  }
  .video-overlay svg{opacity:.5;}
  .swipe-toast{
    position:absolute;
    left:50%;top:50%;
    transform:translate(-50%,-50%) scale(.9);
    background:rgba(20,20,35,.78);
    backdrop-filter:blur(6px);
    border:1px solid rgba(255,255,255,.15);
    color:var(--text);
    padding:10px 18px;
    border-radius:14px;
    font-size:14px;
    font-weight:600;
    display:flex;
    align-items:center;
    gap:8px;
    pointer-events:none;
    opacity:0;
    transition:opacity .18s, transform .18s;
    max-width:80%;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
    z-index:5;
  }
  .swipe-toast.show{opacity:1;transform:translate(-50%,-50%) scale(1);}
  .swipe-toast .arrow{font-size:16px;color:var(--accent-2);}
  .fullscreen-hint{
    position:absolute;
    top:16px;left:50%;
    transform:translate(-50%,-8px);
    background:rgba(10,10,20,.55);
    backdrop-filter:blur(6px);
    border:1px solid rgba(255,255,255,.18);
    color:var(--text);
    font-size:13px;
    font-weight:600;
    padding:8px 16px;
    border-radius:999px;
    display:flex;
    align-items:center;
    gap:7px;
    pointer-events:none;
    opacity:0;
    transition:opacity .35s ease, transform .35s ease;
    z-index:6;
    white-space:nowrap;
  }
  .fullscreen-hint.show{opacity:1;transform:translate(-50%,0);}
  .fullscreen-hint .ico{font-size:16px;color:var(--accent-2);}
  .player-toolbar{
    display:flex;
    flex-wrap:wrap;
    gap:8px;
    padding:12px 16px 0;
  }
  .toolbar-btn{
    display:inline-flex;
    align-items:center;
    gap:6px;
    background:rgba(255,255,255,.06);
    border:1px solid var(--card-border);
    color:var(--text-dim);
    font-size:12px;
    font-weight:600;
    padding:8px 12px;
    min-height:38px;
    border-radius:10px;
    cursor:pointer;
    transition:.15s;
    white-space:nowrap;
  }
  .toolbar-btn:hover{background:rgba(255,255,255,.1);color:var(--text);}
  .toolbar-btn.active{
    background:rgba(124,92,255,.22);
    border-color:rgba(124,92,255,.5);
    color:#c7b9ff;
  }
  .toolbar-btn:disabled{opacity:.4;cursor:not-allowed;}
  .toolbar-btn:disabled:hover{background:rgba(255,255,255,.06);color:var(--text-dim);}
  @media (min-width: 861px){
    .toolbar-btn.mobile-only{display:none;}
  }
  .input-bar{
    display:flex;
    gap:10px;
    padding:16px;
    flex-wrap:wrap;
  }
  .input-bar input[type=text]{
    flex:1;
    min-width:220px;
    min-height:44px;
    background:rgba(255,255,255,.05);
    border:1px solid var(--card-border);
    color:var(--text);
    padding:11px 14px;
    border-radius:12px;
    font-size:14px;
    outline:none;
    transition:.2s;
  }
  .input-bar input[type=text]:focus{
    border-color:var(--accent);
    box-shadow:0 0 0 3px rgba(124,92,255,.2);
  }
  .input-bar input[type=text]::placeholder{color:var(--text-dim);}
  button{
    border:none;
    cursor:pointer;
    font-size:14px;
    font-weight:600;
    border-radius:12px;
    padding:11px 18px;
    min-height:44px;
    transition:.2s;
    -webkit-tap-highlight-color:transparent;
  }
  .btn-primary{
    background:linear-gradient(135deg,var(--accent),#9b7bff);
    color:#fff;
    box-shadow:0 8px 20px rgba(124,92,255,.35);
  }
  .btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(124,92,255,.45);}
  .btn-ghost{
    background:rgba(255,255,255,.06);
    color:var(--text);
    border:1px solid var(--card-border);
  }
  .btn-ghost:hover{background:rgba(255,255,255,.1);}
  .meta-row{
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:0 16px 16px;
    flex-wrap:wrap;
    gap:8px;
  }
  .status{
    font-size:13px;
    color:var(--text-dim);
    display:flex;
    align-items:center;
    gap:8px;
  }
  .dot{
    width:8px;height:8px;border-radius:50%;
    background:#666;
    box-shadow:0 0 0 0 rgba(255,255,255,.4);
  }
  .dot.live{background:var(--accent-2);box-shadow:0 0 0 4px rgba(55,226,200,.18);animation:pulse 1.6s infinite;}
  .dot.err{background:#ff5c7a;}
  @keyframes pulse{
    0%{box-shadow:0 0 0 0 rgba(55,226,200,.35);}
    70%{box-shadow:0 0 0 8px rgba(55,226,200,0);}
    100%{box-shadow:0 0 0 0 rgba(55,226,200,0);}
  }
  .type-pill{
    font-size:11px;
    padding:3px 9px;
    border-radius:999px;
    background:rgba(124,92,255,.18);
    color:#c7b9ff;
    border:1px solid rgba(124,92,255,.35);
  }
  .sidebar{
    width:340px;
    flex-shrink:0;
    display:flex;
    flex-direction:column;
    gap:14px;
  }
  .card{
    background:var(--card);
    border:1px solid var(--card-border);
    border-radius:18px;
    padding:16px;
    backdrop-filter:blur(10px);
  }
  .card h3{
    margin:0 0 12px;
    font-size:14px;
    color:var(--text-dim);
    font-weight:600;
    display:flex;
    align-items:center;
    justify-content:space-between;
  }
  .card h3 .count{
    font-size:11px;
    color:var(--text-dim);
    background:rgba(255,255,255,.06);
    padding:2px 8px;
    border-radius:999px;
  }
  .card h3.card-toggle{
    cursor:pointer;
    user-select:none;
    margin:0;
    padding:2px 0;
  }
  .card h3.card-toggle .chevron{
    margin-left:auto;
    color:var(--text-dim);
    font-size:12px;
    transition:transform .2s ease;
    flex-shrink:0;
  }
  .card h3.card-toggle .count + .chevron{
    margin-left:8px;
  }
  .card.collapsed h3.card-toggle{
    margin-bottom:0;
  }
  .card.collapsed h3.card-toggle .chevron{
    transform:rotate(-90deg);
  }
  .card .card-body{
    overflow:hidden;
    max-height:2000px;
    opacity:1;
    transition:max-height .25s ease, opacity .2s ease, margin-top .2s ease;
    margin-top:12px;
  }
  .card.collapsed .card-body{
    max-height:0;
    opacity:0;
    margin-top:0;
  }
  textarea{
    width:100%;
    min-height:84px;
    resize:vertical;
    background:rgba(255,255,255,.05);
    border:1px solid var(--card-border);
    color:var(--text);
    border-radius:12px;
    padding:10px 12px;
    font-size:13px;
    outline:none;
    font-family:inherit;
  }
  textarea:focus{border-color:var(--accent);}
  .channel-list{
    max-height:min(480px, 50vh);
    overflow-y:auto;
    display:flex;
    flex-direction:column;
    gap:6px;
    margin-top:10px;
    padding-right:4px;
    -webkit-overflow-scrolling:touch;
  }
  .channel-list::-webkit-scrollbar{width:6px;}
  .channel-list::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:6px;}
  .channel-item{
    display:flex;
    align-items:center;
    gap:10px;
    padding:10px 10px;
    min-height:48px;
    border-radius:10px;
    cursor:pointer;
    border:1px solid transparent;
    transition:.15s;
  }
  .channel-item:hover{background:rgba(255,255,255,.06);}
  .channel-item.active{
    background:rgba(124,92,255,.18);
    border-color:rgba(124,92,255,.4);
  }
  .channel-item img{
    width:30px;height:30px;border-radius:7px;object-fit:cover;background:#222;flex-shrink:0;
  }
  .channel-item .ch-name{
    font-size:13px;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    flex:1;
    min-width:0;
  }
  .channel-item .ch-lines{
    font-size:10px;
    color:var(--text-dim);
    background:rgba(255,255,255,.06);
    padding:1px 6px;
    border-radius:999px;
    flex-shrink:0;
  }
  .channel-group{
    font-size:11px;
    color:var(--text-dim);
    text-transform:uppercase;
    letter-spacing:.4px;
    padding:10px 4px 2px;
  }
  .empty-tip{
    font-size:12px;
    color:var(--text-dim);
    text-align:center;
    padding:30px 10px;
  }
  .search-box{
    margin-top:10px;
  }
  .search-box input{
    width:100%;
    min-height:38px;
    background:rgba(255,255,255,.05);
    border:1px solid var(--card-border);
    color:var(--text);
    padding:8px 12px;
    border-radius:10px;
    font-size:13px;
    outline:none;
  }
  .search-box input:focus{border-color:var(--accent);}
  .source-list{
    display:flex;
    flex-direction:column;
    gap:6px;
    max-height:260px;
    overflow-y:auto;
    padding-right:2px;
  }
  .source-list::-webkit-scrollbar{width:6px;}
  .source-list::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:6px;}
  .source-item{
    display:flex;
    align-items:center;
    gap:8px;
    padding:9px 10px;
    border-radius:10px;
    cursor:pointer;
    border:1px solid transparent;
    background:rgba(255,255,255,.03);
    transition:.15s;
  }
  .source-item:hover{background:rgba(255,255,255,.07);}
  .source-item.active{
    background:rgba(124,92,255,.18);
    border-color:rgba(124,92,255,.4);
  }
  .source-item .src-name{
    flex:1;
    min-width:0;
    font-size:13px;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }
  .source-item .src-type{
    font-size:10px;
    color:var(--text-dim);
    background:rgba(255,255,255,.06);
    padding:1px 6px;
    border-radius:999px;
    flex-shrink:0;
  }
  .source-item .src-actions{
    display:flex;
    align-items:center;
    gap:2px;
    flex-shrink:0;
  }
  .icon-btn{
    width:30px;height:30px;
    min-height:30px;
    display:flex;align-items:center;justify-content:center;
    background:transparent;
    border:none;
    border-radius:8px;
    padding:0;
    font-size:15px;
    color:var(--text-dim);
    cursor:pointer;
    transition:.15s;
  }
  .icon-btn:hover{background:rgba(255,255,255,.1);color:var(--text);}
  .icon-btn.star.fav{color:#ffc94d;}
  .icon-btn.del:hover{color:#ff5c7a;background:rgba(255,92,122,.12);}
  footer{
    text-align:center;
    color:var(--text-dim);
    font-size:12px;
    padding:10px 0 24px;
  }
  ::selection{background:rgba(124,92,255,.4);}
</style>
</head>
<body>

<header>
  <div class="logo" style="background:none;box-shadow:none;padding:0;overflow:hidden;">
    <img src="https://image.yzfy.dpdns.org/2026/07/dbeedf4faea83981fdcdafe7b2ad1554.png" alt="风月 Player" style="width:100%;height:100%;object-fit:cover;display:block;">
  </div>
  <h1>风月 Player</h1>
  <button class="icon-btn header-toggle-btn" id="sidebarToggleBtn" title="显示/隐藏侧边栏" aria-label="显示/隐藏侧边栏">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
  </button>
</header>

<div class="container">
  <div class="main">
    <div class="player-card">
      <div class="video-wrap" id="videoWrap">
        <div id="mediaRotator">
          <video id="video" controls playsinline webkit-playsinline></video>
          <img id="imagePreview" alt="预览图片">
          <div class="audio-cover" id="audioCover">
            <div class="audio-icon">🎵</div>
            <div class="audio-title" id="audioCoverTitle">音频播放中</div>
            <div class="audio-sub">当前源为音频格式</div>
          </div>
        </div>
        <div class="video-overlay" id="overlay">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><path d="M10 8l6 4-6 4V8z" fill="currentColor"/></svg>
          <span>粘贴地址或选择频道开始播放</span>
        </div>
        <div class="swipe-toast" id="swipeToast"></div>
        <div class="fullscreen-hint" id="fullscreenHint"><span class="ico">⇅</span><span>上下滑动切换源</span></div>
      </div>
      <div class="player-toolbar">
        <button class="toolbar-btn" id="rotateBtn" title="旋转画面(每次 90°)">⟳ 旋转</button>
        <button class="toolbar-btn" id="flipHBtn" title="水平翻转(镜像)">⇋ 水平翻转</button>
        <button class="toolbar-btn" id="flipVBtn" title="垂直翻转">⇕ 垂直翻转</button>
        <button class="toolbar-btn" id="resetTransformBtn" title="恢复默认画面">↺ 复位</button>
        <button class="toolbar-btn mobile-only" id="landscapeBtn" title="横竖屏切换">⛶ 横竖屏</button>
        <button class="toolbar-btn" id="castBtn" title="投屏到电视/设备">📺 投屏</button>
        <button class="toolbar-btn" id="pipBtn" title="画中画播放">⧉ 画中画</button>
        <button class="toolbar-btn" id="prevSourceBtn" title="切换到上一个频道/源">⬆ 切换源上</button>
        <button class="toolbar-btn" id="nextSourceBtn" title="切换到下一个频道/源">⬇ 切换源下</button>
      </div>
      <div class="input-bar">
        <input type="text" id="urlInput" placeholder="输入视频/音频地址 (.mp4 / .flv / .ts / .m3u8 / .mpd / .mp3 ...)" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" inputmode="url">
        <button class="btn-primary" id="playBtn">播放</button>
        <button class="btn-ghost" id="clearBtn">清空</button>
      </div>
      <div class="meta-row">
        <div class="status"><span class="dot" id="statusDot"></span><span id="statusText">等待播放</span></div>
        <div class="type-pill" id="typePill">--</div>
      </div>
    </div>
  </div>

  <div class="sidebar" id="sidebarPanel">
    <div class="sidebar-drawer-head">
      <span>源管理</span>
      <button class="icon-btn" id="sidebarCloseBtn" title="关闭">✕</button>
    </div>
    <div class="card collapsible" data-card-id="sources">
      <h3 class="card-toggle"><span>我的源</span> <span class="count" id="sourceCount">0</span><span class="chevron">⌄</span></h3>
      <div class="card-body">
        <div class="source-list" id="sourceList">
          <div class="empty-tip">暂无源，请联系管理员在后台添加</div>
        </div>
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button class="btn-ghost" id="exportSourcesBtn" style="flex:1;" title="将收藏频道导出为 JSON 备份文件">⭳ 导出收藏</button>
          <button class="btn-ghost" id="importSourcesBtn" style="flex:1;" title="从 JSON 备份文件导入收藏频道">⭱ 导入收藏</button>
          <input type="file" id="importFileInput" accept="application/json,.json" style="display:none;">
        </div>
      </div>
    </div>

    <div class="card collapsible collapsed" data-card-id="sync">
      <h3 class="card-toggle"><span>收藏同步</span><span class="chevron">⌄</span></h3>
      <div class="card-body">
        <input type="text" id="syncCodeInput" placeholder="设置/输入同步码，跨设备同步收藏" style="margin-bottom:8px;" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
        <div style="display:flex;gap:8px;">
          <button class="btn-ghost" id="syncPullBtn" style="flex:1;">↓ 拉取云端</button>
          <button class="btn-primary" id="syncPushBtn" style="flex:1;">↑ 推送云端</button>
        </div>
      </div>
    </div>

    <div class="card collapsible collapsed" data-card-id="favorites">
      <h3 class="card-toggle"><span>收藏频道</span> <span class="count" id="favCount">0</span><span class="chevron">⌄</span></h3>
      <div class="card-body">
        <div class="channel-list" id="favoriteList">
          <div class="empty-tip">暂无收藏，点击频道旁的 ☆ 即可收藏</div>
        </div>
      </div>
    </div>

    <div class="card collapsible" data-card-id="channels">
      <h3 class="card-toggle"><span>频道列表</span> <span class="count" id="m3uCount">0</span><span class="chevron">⌄</span></h3>
      <div class="card-body">
        <div class="search-box"><input type="text" id="channelSearch" placeholder="搜索频道名称..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></div>
        <div class="channel-list" id="channelList">
          <div class="empty-tip">暂无频道，添加并选择一个源后显示</div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="sidebar-backdrop" id="sidebarBackdrop"></div>
<button class="menu-fab" id="menuFab" title="频道与源">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
  <span id="menuFabBadge" class="menu-fab-badge" style="display:none;">0</span>
</button>



<script>
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

    const urlGroups = urlRaw.split('$
</body>
</html>
);

    const episodesMap = new Map();
    const episodesOrder = [];
    urlGroups.forEach(function(lineStr){
      const eps = lineStr.split('#').map(function(s){ return s.trim(); }).filter(Boolean);
      eps.forEach(function(epStr, epIdx){
        const sepAt = epStr.indexOf('
</body>
</html>
);
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
        const sepAt = epStr.indexOf('
</body>
</html>
);
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
    "        if '
</body>
</html>
 in ep:\n" +
    "            epname, epval = ep.split('
</body>
</html>
, 1)\n" +
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
    "    url_groups = str(purl).split('$
</body>
</html>
)\n" +
    "    flag_names = str(pfrom).split('$
</body>
</html>
) if pfrom else []\n" +
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
</script>
</body>
</html>`;

const ADMIN_HTML = String.raw`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>风月 Player · 后台管理</title>
<link rel="icon" type="image/png" href="https://image.yzfy.dpdns.org/2026/07/dbeedf4faea83981fdcdafe7b2ad1554.png">
<style>
  :root{
    --bg-1:#0f1020; --bg-2:#1a1c34; --accent:#7c5cff; --accent-2:#37e2c8;
    --card:rgba(255,255,255,0.06); --card-border:rgba(255,255,255,0.12);
    --text:#eef0ff; --text-dim:#9a9cc0; --danger:#ff6b6b;
  }
  *{box-sizing:border-box;}
  html,body{height:100%;margin:0;}
  body{
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif;
    background:linear-gradient(160deg, var(--bg-1), var(--bg-2));
    color:var(--text); min-height:100%; padding:24px;
  }
  .wrap{max-width:760px;margin:0 auto;}
  header{display:flex;align-items:center;gap:12px;margin-bottom:24px;}
  header img{width:36px;height:36px;border-radius:10px;object-fit:cover;}
  header h1{font-size:18px;margin:0;font-weight:600;}
  .card{
    background:var(--card); border:1px solid var(--card-border); border-radius:16px;
    padding:18px; margin-bottom:18px; backdrop-filter:blur(10px);
  }
  .card h3{margin:0 0 12px;font-size:15px;font-weight:600;}
  input[type=text],input[type=password],textarea{
    width:100%; background:rgba(255,255,255,0.05); border:1px solid var(--card-border);
    border-radius:10px; color:var(--text); padding:10px 12px; font-size:14px; margin-bottom:10px;
    font-family:inherit;
  }
  textarea{min-height:120px;resize:vertical;}
  button{
    border:none; border-radius:10px; padding:10px 16px; font-size:14px; cursor:pointer;
    font-family:inherit;
  }
  .btn-primary{background:linear-gradient(135deg,var(--accent),#9b7bff);color:#fff;font-weight:600;}
  .btn-ghost{background:rgba(255,255,255,0.08);color:var(--text);}
  .btn-danger{background:rgba(255,107,107,0.15);color:var(--danger);}
  .row{display:flex;gap:8px;flex-wrap:wrap;}
  .row > *{flex:1;}
  .source-item{
    display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px;
    background:rgba(255,255,255,0.03); margin-bottom:8px;
  }
  .source-item .name{flex:1;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .source-item .raw-preview{font-size:11px;color:var(--text-dim);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .source-item .btns{display:flex;gap:6px;flex-shrink:0;}
  .source-item .btns button{padding:6px 10px;font-size:12px;}
  .empty-tip{color:var(--text-dim);font-size:13px;padding:12px 0;text-align:center;}
  .status{font-size:13px;color:var(--text-dim);min-height:18px;margin-top:8px;}
  .status.err{color:var(--danger);}
  .status.ok{color:var(--accent-2);}
  #loginView{max-width:360px;margin:60px auto;}
  .top-actions{display:flex;justify-content:flex-end;margin-bottom:12px;}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <img src="https://image.yzfy.dpdns.org/2026/07/dbeedf4faea83981fdcdafe7b2ad1554.png" alt="logo">
    <h1>风月 Player · 后台管理</h1>
  </header>

  <div id="loginView" class="card" style="display:none;">
    <h3>管理员登录</h3>
    <input type="password" id="passwordInput" placeholder="请输入管理员密码" autocomplete="current-password">
    <button class="btn-primary" id="loginBtn" style="width:100%;">登录</button>
    <div class="status" id="loginStatus"></div>
  </div>

  <div id="panelView" style="display:none;">
    <div class="top-actions">
      <button class="btn-ghost" id="logoutBtn">退出登录</button>
    </div>

    <div class="card">
      <h3 id="formTitle">添加源</h3>
      <input type="text" id="nameInput" placeholder="源名称，如：央视频道">
      <textarea id="rawInput" placeholder="粘贴 M3U/M3U8/TXT/JSON/XML/AppleCMS/Python字典或列表 API 地址或内容，也支持 csp_XXX Spider 脚本，可多行"></textarea>
      <div class="row">
        <button class="btn-primary" id="submitBtn">保存</button>
        <button class="btn-ghost" id="cancelEditBtn" style="display:none;">取消编辑</button>
      </div>
      <div class="status" id="formStatus"></div>
    </div>

    <div class="card">
      <h3>已添加的源 <span id="sourceCount" style="color:var(--text-dim);font-weight:400;"></span></h3>
      <div id="sourceList"><div class="empty-tip">加载中...</div></div>
    </div>
  </div>
</div>

<script>
(function(){
  const loginView = document.getElementById('loginView');
  const panelView = document.getElementById('panelView');
  const passwordInput = document.getElementById('passwordInput');
  const loginBtn = document.getElementById('loginBtn');
  const loginStatus = document.getElementById('loginStatus');
  const logoutBtn = document.getElementById('logoutBtn');
  const nameInput = document.getElementById('nameInput');
  const rawInput = document.getElementById('rawInput');
  const submitBtn = document.getElementById('submitBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const formTitle = document.getElementById('formTitle');
  const formStatus = document.getElementById('formStatus');
  const sourceList = document.getElementById('sourceList');
  const sourceCount = document.getElementById('sourceCount');

  let editingId = null;

  function setFormStatus(text, mode){
    formStatus.textContent = text || '';
    formStatus.className = 'status' + (mode ? ' ' + mode : '');
  }

  function setLoginStatus(text, mode){
    loginStatus.textContent = text || '';
    loginStatus.className = 'status' + (mode ? ' ' + mode : '');
  }

  function resetForm(){
    editingId = null;
    nameInput.value = '';
    rawInput.value = '';
    formTitle.textContent = '添加源';
    submitBtn.textContent = '保存';
    cancelEditBtn.style.display = 'none';
  }

  async function loadSources(){
    sourceList.innerHTML = '<div class="empty-tip">加载中...</div>';
    try {
      const res = await fetch('/api/admin/sources');
      if (res.status === 401) { showLogin(); return; }
      const list = await res.json();
      sourceCount.textContent = '(' + list.length + ')';
      if (!list.length) {
        sourceList.innerHTML = '<div class="empty-tip">暂无源，在上方添加</div>';
        return;
      }
      sourceList.innerHTML = '';
      list.forEach(function(src){
        const item = document.createElement('div');
        item.className = 'source-item';
        const info = document.createElement('div');
        info.style.flex = '1';
        info.style.minWidth = '0';
        const name = document.createElement('div');
        name.className = 'name';
        name.textContent = src.name;
        const preview = document.createElement('div');
        preview.className = 'raw-preview';
        preview.textContent = src.raw;
        info.appendChild(name);
        info.appendChild(preview);
        const btns = document.createElement('div');
        btns.className = 'btns';
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-ghost';
        editBtn.textContent = '编辑';
        editBtn.addEventListener('click', function(){
          editingId = src.id;
          nameInput.value = src.name;
          rawInput.value = src.raw;
          formTitle.textContent = '编辑源';
          submitBtn.textContent = '保存修改';
          cancelEditBtn.style.display = '';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        const delBtn = document.createElement('button');
        delBtn.className = 'btn-danger';
        delBtn.textContent = '删除';
        delBtn.addEventListener('click', async function(){
          if (!window.confirm('确定删除源「' + src.name + '」？')) return;
          try {
            const res = await fetch('/api/admin/sources?id=' + encodeURIComponent(src.id), { method: 'DELETE' });
            if (!res.ok) throw new Error('删除失败');
            loadSources();
          } catch(e) {
            window.alert('删除失败: ' + e.message);
          }
        });
        btns.appendChild(editBtn);
        btns.appendChild(delBtn);
        item.appendChild(info);
        item.appendChild(btns);
        sourceList.appendChild(item);
      });
    } catch(e) {
      sourceList.innerHTML = '<div class="empty-tip">加载失败: ' + e.message + '</div>';
    }
  }

  submitBtn.addEventListener('click', async function(){
    const name = nameInput.value.trim();
    const raw = rawInput.value.trim();
    if (!raw) { setFormStatus('请输入源内容', 'err'); return; }
    setFormStatus('保存中...', '');
    try {
      let res;
      if (editingId) {
        res = await fetch('/api/admin/sources', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id: editingId, name: name, raw: raw })
        });
      } else {
        res = await fetch('/api/admin/sources', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name: name, raw: raw })
        });
      }
      if (res.status === 401) { showLogin(); return; }
      if (!res.ok) {
        const err = await res.json().catch(function(){ return {}; });
        throw new Error(err.error || '保存失败');
      }
      setFormStatus(editingId ? '已更新' : '已添加', 'ok');
      resetForm();
      loadSources();
    } catch(e) {
      setFormStatus('保存失败: ' + e.message, 'err');
    }
  });

  cancelEditBtn.addEventListener('click', resetForm);

  async function doLogin(){
    const password = passwordInput.value;
    if (!password) { setLoginStatus('请输入密码', 'err'); return; }
    setLoginStatus('登录中...', '');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password: password })
      });
      if (!res.ok) {
        const err = await res.json().catch(function(){ return {}; });
        throw new Error(err.error || '登录失败');
      }
      passwordInput.value = '';
      showPanel();
    } catch(e) {
      setLoginStatus(e.message, 'err');
    }
  }

  loginBtn.addEventListener('click', doLogin);
  passwordInput.addEventListener('keydown', function(e){
    if (e.key === 'Enter') doLogin();
  });

  logoutBtn.addEventListener('click', async function(){
    try { await fetch('/api/admin/logout', { method: 'POST' }); } catch(e) {}
    showLogin();
  });

  function showLogin(){
    loginView.style.display = '';
    panelView.style.display = 'none';
  }

  function showPanel(){
    loginView.style.display = 'none';
    panelView.style.display = '';
    resetForm();
    loadSources();
  }

  (async function init(){
    try {
      const res = await fetch('/api/admin/check');
      const data = await res.json();
      if (data.ok) showPanel(); else showLogin();
    } catch(e) {
      showLogin();
    }
  })();
})();
</script>
</body>
</html>`;

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
