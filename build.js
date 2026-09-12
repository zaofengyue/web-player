/**
 * 风月 Player 打包构建脚本
 * 特点：纯原生 Node.js 实现，零任何第三方 npm 依赖。
 * 作用：将 src/ 中的前台、后台与 Worker 服务端模块合并构建为可供 Cloudflare 直接部署的单文件 _worker.js
 */

const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const srcDir = path.join(rootDir, 'src');

console.log('📦 开始构建风月 Player...');

// 1. 组装前台 HTML_PAGE
const clientHtmlPath = path.join(srcDir, 'client', 'index.html');
const clientCssPath = path.join(srcDir, 'client', 'style.css');
const clientJsPath = path.join(srcDir, 'client', 'app.js');

let clientHtml = fs.readFileSync(clientHtmlPath, 'utf8');
const clientCss = fs.readFileSync(clientCssPath, 'utf8');
const clientJs = fs.readFileSync(clientJsPath, 'utf8');

clientHtml = clientHtml.replace(
  '<!-- 播放器样式表 -->\n<link rel="stylesheet" href="./style.css">',
  `<style>\n${clientCss.trim()}\n</style>`
);

clientHtml = clientHtml.replace(
  '<!-- 核心播放与交互脚本 -->\n<script src="./app.js"></script>',
  `<script>\n${clientJs.trim()}\n</script>`
);

// 2. 组装后台 ADMIN_HTML
const adminHtmlPath = path.join(srcDir, 'admin', 'admin.html');
const adminJsPath = path.join(srcDir, 'admin', 'admin.js');

let adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');
const adminJs = fs.readFileSync(adminJsPath, 'utf8');

adminHtml = adminHtml.replace(
  '<!-- 后台管理脚本 -->\n<script src="./admin.js"></script>',
  `<script>\n${adminJs.trim()}\n</script>`
);

// 3. 读取服务端模块
const relayCode = fs.readFileSync(path.join(srcDir, 'worker', 'relay.js'), 'utf8');
const apiCode = fs.readFileSync(path.join(srcDir, 'worker', 'api.js'), 'utf8');
const entryCode = fs.readFileSync(path.join(srcDir, 'worker', 'index.js'), 'utf8');

// 4. 组装最终 _worker.js
const outputBanner = `/**
 * 风月 Player - Cloudflare Workers / Pages 边缘部署单文件
 * 由 build.js 自动生成，请勿直接手动修改此文件。
 * 源码开发请编辑 src/ 目录下的对应模块文件。
 */\n\n`;

const bundleContent =
  outputBanner +
  'const HTML_PAGE = String.raw`' + clientHtml.trim() + '`;\n\n' +
  'const ADMIN_HTML = String.raw`' + adminHtml.trim() + '`;\n\n' +
  relayCode.trim() + '\n\n' +
  apiCode.trim() + '\n\n' +
  entryCode.trim() + '\n';

const outputPath = path.join(rootDir, '_worker.js');
fs.writeFileSync(outputPath, bundleContent, 'utf8');

console.log(`✅ 构建成功！产物已输出至: ${outputPath} (${(bundleContent.length / 1024).toFixed(1)} KB)`);
