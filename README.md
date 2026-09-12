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

## 🏗️ 模块化工程架构 (路线 B)

本项目采用**源码分模块设计 + GitHub Actions 云端全自动打包**，开发体验极佳且**本地无需执行任何编译**：

```text
├── src/
│   ├── client/              # 前台播放器独立源码
│   │   ├── index.html       # 播放器页面骨架与外部 CDN
│   │   ├── style.css        # 播放器样式表（支持完整 CSS 语法高亮）
│   │   └── app.js           # 播放核心、M3U 解析与交互逻辑
│   ├── admin/               # 后台管理独立源码
│   │   ├── admin.html       # 后台页面结构与样式
│   │   └── admin.js         # 后台鉴权与源管理逻辑
│   └── worker/              # Cloudflare Worker 服务端逻辑
│       ├── relay.js         # 流媒体中继代理、SSRF 防御与 TCP Socket 释放
│       ├── api.js           # KV 存储接口与 Timing-Safe 密码校验
│       └── index.js         # Worker 路由分发与入口
├── .github/
│   └── workflows/
│       └── build.yml        # GitHub Actions 自动化工作流（推送时在云端自动打包）
├── build.js                 # 零依赖原生 Node 打包脚本（供云端自动打包）
├── _worker.js               # 打包生成的单文件产物（用于 Cloudflare 边缘部署）
└── README.md                # 项目文档
```

---

## 🛠️ 核心代码优化

1. **切台 Socket 泄漏彻底修复**：在底层 Socket 连接中实现了可读流的 `cancel()` 回调与连接回收，切台或页面关闭时立即释放 TCP 连接与 reader，杜绝边缘实例资源浪费。
2. **SSRF 安全防护**：在中继入口拦截私有网段（`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`）、回环地址（`127.0.0.1`）以及云主机元数据地址（`169.254.0.0/16`），限定仅允许 `http/https` 协议。
3. **时序安全密码校验**：后台登录鉴权采用 Web Crypto API 的 `crypto.subtle.timingSafeEqual` 进行常数时间比对，杜绝侧信道时序攻击。
4. **协议解析容错增强**：优化响应头解析器，宽松兼容单 `\n` 非标换行符，并增加分块传输大小的合法性校验与熔断。
5. **结构化诊断日志**：加入 `debugWarn` 机制，消除本地存储与解析时的全静默吞错。

---

## 🚀 部署指南

### 方式一：Cloudflare Pages 绑定 GitHub（推荐，零本地操作）

1. 在 Cloudflare 控制台新建 Pages 项目，选择连接到您的 GitHub 仓库；
2. **构建命令**：留空（无需构建）；
3. **构建输出目录**：留空（直接使用根目录）；
4. 在 **设置 -> 函数 -> KV 命名空间绑定** 中绑定：
   - 变量名称：`PLAYER_KV`
5. 在 **设置 -> 环境变量** 中添加：
   - `ADMIN_PASSWORD`：设置您的后台管理员密码；
6. 部署完成！以后每次您在 GitHub 上修改 `src/` 下的代码并提交，**GitHub Actions 会自动在云端打包，Cloudflare Pages 会自动发布上线**！
