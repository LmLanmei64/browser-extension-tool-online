# 浏览器扩展信息提取工具

[English](README.md) | [中文](README.zh-CN.md)

这是一个轻量级、纯前端的工具，用于从各种**明文导出内容**
中提取浏览器扩展的标识信息。

本项目强调 **透明性、安全性和长期可维护性**，
仅支持可检查、非加密的文本格式。

---

## 功能特性

- 🧩 从混合、非结构化文本中提取扩展信息
- 🌐 支持 Chromium 系浏览器与 Firefox
- 🔍 自动识别扩展 ID / Slug
- 🛡️ 不执行代码、不解密、不发起网络请求
- 🌍 支持中英文界面
- 📄 纯前端运行，适合 GitHub Pages

---

## 支持的浏览器

### Chromium 系浏览器
- Google Chrome
- Microsoft Edge
- Brave
- Vivaldi
- 其他 Chromium 变体

### Firefox
- Mozilla Firefox（桌面版）

---

## 支持的输入格式

### Chromium 系浏览器

- `chrome://extensions-internals/`  
  复制页面内容或相关部分。
- Extension List Exporter
  - JSON
  - CSV
- 第三方扩展管理器
  - JSON
  - Markdown（`.md`）

### Firefox

- `about:support`  
  复制其中的 **扩展（Extensions）** 部分。
- Extension List Exporter
  - JSON
  - CSV
- Firefox Add-ons（AMO）页面链接  
  - 示例：  
    `https://addons.mozilla.org/firefox/addon/ublock-origin/`

---

## ❌ 不支持的格式（重要）

本工具 **不支持任何加密或私有协议的分享格式**，包括但不限于：

### auto-extension-manager 的加密分享文本

不支持示例：

```
--------BEGIN--------
QWxuWmZxUjRkQXlVbW1GQkZQeWNYbHh2S3FqM2hEVjY5
QnRBeEtmSkpZQ0JzUVl6U2VLa1FhZ0JHT1VhPQ==
--------END--------
```

- 该格式是  
  https://github.com/JasonGrass/auto-extension-manager  
  使用的**私有协议**
- 仅用于其自身的导入功能
- 不属于通用、可审计的数据交换格式

👉 **请改用以下受支持的方式：**

- auto-extension-manager 导出的：
  - ✅ JSON
  - ✅ Markdown（`.md`）
- 其他任意受支持的明文格式

---

## 输出格式说明

工具输出统一的 JSON 结构，例如：

```json
[
  {
    "browser": "chromium",
    "id": "cjpalhdlnbpafiamejdnhcphjbkeiagm"
  },
  {
    "browser": "firefox",
    "slug": "ublock-origin"
  }
]
```

字段说明：

- `browser`
  - `chromium` 或 `firefox`
- `id`
  - Chromium 扩展 ID（32 位，小写 a–p）
- `slug`
  - Firefox 扩展的 AMO 标识

---

## 设计原则

- 🔍 仅处理明文数据，不解析隐藏内容
- 🔐 不解密第三方私有格式
- 🛡️ 不执行任何外部代码
- 🧩 仅关注扩展识别，不尝试还原完整状态

这些原则确保了工具的可预测性、安全性和长期可维护性。

---

## 许可证

MIT License