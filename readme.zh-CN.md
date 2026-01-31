# 浏览器扩展信息提取工具（在线）

[🇺🇸 English Version →](./README.md)

一个轻量级、纯前端的工具，用于从**混合的纯文本导出内容**中提取浏览器扩展的标识符和安装链接。

本项目强调 **透明性、安全性和长期可维护性**，  
仅支持可检查、非加密的明文格式。

---

## 功能特点

- 🧩 从**混合、无结构文本**中提取扩展信息
- 🌐 支持 Chromium 系浏览器 与 Firefox
- 🔍 自动识别扩展 ID / slug / UUID
- 🧠 通过官方 AMO v5 API 解析 Firefox UUID（GUID）
- 🧹 自动过滤 **Firefox 系统 / 内置扩展**
- 🌍 界面国际化（English / 中文）
- 📄 完全在浏览器中运行（适合 GitHub Pages）

---

## 支持的浏览器

### Chromium 系
- Google Chrome
- Microsoft Edge
- Brave
- Vivaldi
- 其他 Chromium 变种

### Firefox
- Firefox 桌面版
- Firefox Android

---

## 支持的输入格式

### 混合内容（推荐）

可以将**多个不同来源的内容直接混合粘贴**，例如：

- Chrome 扩展导出
- Firefox `about:support`
- AMO 扩展链接
- Markdown / JSON 列表

工具会自动识别并去重。

---

### Chromium 系浏览器

- `chrome://extensions-internals/`  
  复制页面内容或相关部分
- Extension List Exporter
  - JSON
  - CSV
- 第三方扩展管理器
  - JSON
  - Markdown（`.md`）

---

### Firefox

- `about:support`（桌面版 & Android）  
  复制 **附加组件 / 扩展** 表格内容
- Extension List Exporter
  - JSON
  - CSV
- Firefox 扩展商店（AMO）链接  
  - 示例：  
    `https://addons.mozilla.org/firefox/addon/ublock-origin/`

---

## Firefox UUID（GUID）支持说明

在 Firefox（尤其是 Android）中，部分扩展只显示 UUID，例如：

```
{b1b38301-9512-4201-b210-8c9d8eaef4f6}
```

本工具会通过官方 AMO API 查询：

```
https://addons.mozilla.org/api/v5/addons/addon/{GUID}/
```

- ✅ 若扩展在 AMO 公开上架，可解析出 slug 并生成下载链接
- ❌ Firefox 系统内置扩展会被自动排除
- ❌ 私有 / 未上架扩展可能无法解析

---

## ❌ 不支持的格式（重要）

本工具 **不支持任何加密或私有格式**。

### auto-extension-manager 加密分享文本（不支持）

示例：

```
--------BEGIN--------
QWxuWmZxUjRkQXlVbW1GQkZQeWNYbHh2S3FqM2hEVjY5
QnRBeEtmSkpZQ0JzUVl6U2VLa1FhZ0JHT1VhPQ==
--------END--------
```

- 这是该扩展的**私有协议**
- 仅用于原插件自身的导入
- 不属于可审计、标准化的数据格式

👉 请改用以下方式导出：

- ✅ JSON
- ✅ Markdown（`.md`）
- ✅ 其他本文档列出的纯文本格式

---

## 输出格式

解析结果为统一的 JSON 数组：

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

### 字段说明

- `browser`
  - `chromium` 或 `firefox`
- `id`
  - Chromium 扩展 ID（32 位 a–p）
- `slug`
  - Firefox 扩展 slug（必要时由 UUID 解析）

---

## 设计原则

- 🔍 仅处理纯文本，不接受不透明数据
- 🔐 不尝试解密第三方格式
- 🛡️ 不执行任何外部代码
- 🧩 专注于扩展识别与发现，而非状态还原

这些约束保证了工具的可预测性、安全性和可维护性。

---

## 许可证

MIT License