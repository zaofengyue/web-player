# 风月 Player (Web Player)

一个轻量、现代化、模块化工程化的 Web 流媒体播放器与 IPTV 管理系统，专为 Cloudflare Workers / Cloudflare Pages 边缘计算环境打造。

---

## 🌟 核心特性

- **多流媒体协议解码**：内置 `hls.js`, `flv.js`, `mpegts.js`, `dashjs`，支持 HLS (.m3u8)、FLV、TS、MPEG-DASH 及常规 HTML5 视频流。
- **IPTV / M3U 订阅全格式解析**：支持在线解析 M3U、XML、JSON、AppleCMS 以及 Base64 订阅源，支持多线路切台。
- **云端收藏同步**：独创“同步码”机制，通过 Cloudflare KV 实现跨设备收藏夹备份与同步。
- **触屏手势与快捷控制**：支持触屏上下滑动切台（Touch Swipe）、画面旋转、镜像翻转、画面铺满与画中画。
- **后台管理系统**：访问 `/admin` 即可进入管理后台，动态增删改查全局直播源。

---

## 🛠️ v2 核心代码优化

1. **切台 Socket 泄漏彻底修复**：在底层 Socket 连接中实现了可读流的 `cancel()` 回调与连接回收，切台或页面关闭时立即释放 TCP 连接与 reader，杜绝边缘实例资源浪费。
2. **SSRF 安全防护**：在中继入口拦截私有网段（`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`）、回环地址（`127.0.0.1`）以及云主机元数据地址（`169.254.0.0/16`），限定仅允许 `http/https` 协议。
3. **时序安全密码校验**：后台登录鉴权采用 Web Crypto API 的 `crypto.subtle.timingSafeEqual` 进行常数时间比对，杜绝侧信道时序攻击。
4. **协议解析容错增强**：优化响应头解析器，宽松兼容单 `\n` 非标换行符，并增加分块传输大小的合法性校验与熔断。
5. **结构化诊断日志**：加入 `debugWarn` 机制，消除本地存储与解析时的全静默吞错。

---

## 🚀 部署指南（三种方式任选其一）

### 方式一：Cloudflare Pages 压缩包直接上传（推荐：简单免配置，无需 Git）

如果你不想关联 GitHub，可以直接通过压缩包上传部署：

1. **获取部署包**：
   - 前往 GitHub 仓库右侧的 **[Releases](https://github.com/zaofengyue/web-player/releases)** 页面，下载最新的 **`web-player-pages.zip`**；
   - *(或者将仓库下载解压后，把包含 `_worker.js` 的整个文件夹直接拖入)*；
2. **在 Cloudflare Pages 上传**：
   - 登录 Cloudflare 控制台 -> 点击左侧 **Workers 和 Pages** -> **创建应用程序** -> 切换到 **Pages** 选项卡；
   - 选择 **“上传资产” (Direct Upload)**；
   - 项目名称输入 `web-player`（或自定），点击 **创建项目**；
   - 将下载的 **`web-player-pages.zip`** 直接拖入上传区域，点击 **部署站点**；
3. **绑定 KV 与管理员密码**：
   - 部署完成后，进入该 Pages 项目的 **设置** -> **函数**：
     - 在 **KV 命名空间绑定** 中添加绑定：变量名称填 `PLAYER_KV`，选择或新建一个 KV 命名空间；
   - 进入 **设置** -> **环境变量**：
     - 添加环境变量：变量名称 `ADMIN_PASSWORD`，值为你的管理后台密码；
   - 点击保存后，重新部署一次即可生效！

---

### 方式二：Cloudflare Pages 绑定 GitHub（推荐：全自动持续部署）

适合长期使用，日常修改代码自动发布：

1. 在 Cloudflare 控制台新建 Pages 项目，选择 **“连接到 Git”** 并选择你的 `web-player` 仓库；
2. **构建命令**：留空（无需构建，仓库已内置 GitHub Actions 自动打包）；
3. **构建输出目录**：留空（直接使用根目录）；
4. 按照上述【方式一】第 3 步绑定 `PLAYER_KV` 与 `ADMIN_PASSWORD`；
5. 以后每次你在 GitHub 上修改 `src/` 下的代码并提交，**GitHub Actions 会在云端自动编译，Cloudflare Pages 会秒级自动同步上线**！

---

### 方式三：Cloudflare Workers 控制台在线粘贴

1. 登录 Cloudflare 控制台 -> **Workers 和 Pages** -> **创建 Worker**；
2. 点击 **“快速编辑”**（Quick Edit）；
3. 直接打开仓库根目录的 **`_worker.js`**，全选复制（`Ctrl + A` -> `Ctrl + C`）；
4. 粘贴覆盖到在线编辑器中，点击 **“保存并部署”**；
5. 在 Worker 的 **设置 -> 变量** 中绑定 `PLAYER_KV` 和 `ADMIN_PASSWORD` 即可。

---

## 🏗️ 模块化工程目录说明

```text
├── src/
│   ├── client/              # 前台播放器独立源码
│   │   ├── index.html       # 页面骨架与外部 CDN
│   │   ├── style.css        # 播放器样式表（支持完整 CSS 语法高亮与折叠）
│   │   └── app.js           # 核心播放、M3U 解析与手势交互逻辑
│   ├── admin/               # 后台管理独立源码
│   │   ├── admin.html       # 后台页面结构与样式
│   │   └── admin.js         # 后台鉴权与源管理逻辑
│   └── worker/              # Cloudflare Worker 服务端逻辑
│       ├── relay.js         # 流媒体中继代理、SSRF 防御与 TCP Socket 释放
│       ├── api.js           # KV 存储接口与 Timing-Safe 密码校验
│       └── index.js         # Worker 路由分发与入口
├── .github/
│   └── workflows/
│       └── build.yml        # GitHub Actions：推送时在云端自动打包并生成 Pages 部署包
├── build.js                 # 零依赖原生 Node 打包脚本（供云端自动打包调用）
├── _worker.js               # 打包生成的单文件产物（用于 Cloudflare 边缘部署）
└── README.md                # 本文档

---

## 🙏 致谢与鸣谢 (Acknowledgements)

本项目为公益性质的流媒体与 IPTV 播放器，特别感谢原项目与频道提供的灵感与基础实现：
- **原项目 / 交流频道**：[Telegram @otcfxq/27](https://t.me/otcfxq/27)
- 感谢各大流媒体解码开源社区（`hls.js`, `flv.js`, `mpegts.js`, `dash.js` 等）的贡献！

---

## 📄 免责声明 (Disclaimer)

本项目仅供个人学习、技术研究与测试使用，不提供、不存储亦不制作任何音视频流媒体内容。请遵守当地法律法规，切勿用于商业用途或侵犯他人版权。
```
