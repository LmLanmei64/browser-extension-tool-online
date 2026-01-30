# Browser Extension Extractor Online

[English](README.md) | [中文](README.zh-CN.md)

A lightweight, client-side tool to extract browser extension identifiers
from various **plain-text** export sources.

This project focuses on **transparency, safety, and long-term maintainability**.
Only inspectable and non-encrypted formats are supported.

---

## Features

- 🧩 Extract extensions from mixed, unstructured text
- 🌐 Supports Chromium-based browsers and Firefox
- 🔍 Automatic detection of extension identifiers
- 🛡️ No execution, no decryption, no external requests
- 🌍 Internationalized UI (English / 中文)
- 📄 Runs entirely in the browser (GitHub Pages friendly)

---

## Supported Browsers

### Chromium-based browsers
- Google Chrome
- Microsoft Edge
- Brave
- Vivaldi
- Other Chromium variants

### Firefox
- Mozilla Firefox (Desktop)

---

## Supported Input Formats

### Chromium-based browsers

- `chrome://extensions-internals/`  
  Copy and paste the page content (or relevant sections).
- Extension List Exporter
  - JSON
  - CSV
- Third-party extension managers
  - JSON
  - Markdown (`.md`)

### Firefox

- `about:support`  
  Copy the **Extensions** section.
- Extension List Exporter
  - JSON
  - CSV
- Firefox Add-ons (AMO) URLs  
  - Example:  
    `https://addons.mozilla.org/firefox/addon/ublock-origin/`

---

## ❌ Unsupported Formats (Important)

This tool **does NOT support encrypted or proprietary sharing formats**, including:

### auto-extension-manager encrypted share text

Example (unsupported):

```
--------BEGIN--------
QWxuWmZxUjRkQXlVbW1GQkZQeWNYbHh2S3FqM2hEVjY5
QnRBeEtmSkpZQ0JzUVl6U2VLa1FhZ0JHT1VhPQ==
--------END--------
```

- This format is a **private protocol** of  
  https://github.com/JasonGrass/auto-extension-manager
- It is intended **only** for import back into that extension.
- It is not a transparent or standardized interchange format.

👉 **Please use one of the following instead:**

- auto-extension-manager exports:
  - ✅ JSON
  - ✅ Markdown (`.md`)
- Any other supported plain-text formats listed above.

---

## Output Format

The extracted result is a normalized JSON array:

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

- `browser`
  - `chromium` or `firefox`
- `id`
  - Chromium extension ID (32 characters, a–p)
- `slug`
  - Firefox add-on slug

---

## Design Principles

- 🔍 Plain text only — no hidden or opaque data
- 🔐 No decryption of third-party formats
- 🛡️ No code execution
- 🧩 Focused on extension identification, not full state restoration

These constraints keep the tool predictable, secure, and easy to maintain.

---

## License

MIT License