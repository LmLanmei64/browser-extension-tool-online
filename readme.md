# Browser Extension Extractor Online

[🇨🇳 中文说明 / Chinese Version →](./README.zh-CN.md)

A lightweight, client-side tool to extract browser extension identifiers
and installation links from **mixed, plain-text export sources**.

This project focuses on **transparency, safety, and long-term maintainability**.
Only inspectable, non-encrypted formats are supported.

---

## Features

- 🧩 Extract extensions from **mixed, unstructured text**
- 🌐 Supports Chromium-based browsers and Firefox
- 🔍 Automatic detection of extension identifiers
- 🧠 Resolves Firefox UUIDs (GUID) via the official AMO v5 API
- 🧹 Automatically filters **Firefox system / built-in extensions**
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
- Mozilla Firefox for Android

---

## Supported Input Formats

### Mixed Content (Recommended)

You can paste **multiple sources together** in one input, for example:

- Chrome exports
- Firefox `about:support`
- AMO links
- Markdown / JSON lists

The extractor will automatically detect and deduplicate extensions.

---

### Chromium-based browsers

- `chrome://extensions-internals/`  
  Copy and paste the page content (or relevant sections).
- Extension List Exporter
  - JSON
  - CSV
- Third-party extension managers
  - JSON
  - Markdown (`.md`)

---

### Firefox

- `about:support` (Desktop & Android)  
  Copy the **Extensions** section (table format supported).
- Extension List Exporter
  - JSON
  - CSV
- Firefox Add-ons (AMO) URLs  
  - Example:  
    `https://addons.mozilla.org/firefox/addon/ublock-origin/`

---

## Firefox UUID (GUID) Support

Some Firefox extensions (especially on Android) only expose a UUID, e.g.:

```
{b1b38301-9512-4201-b210-8c9d8eaef4f6}
```

This tool resolves such UUIDs via the official AMO API:

```
https://addons.mozilla.org/api/v5/addons/addon/{GUID}/
```

- ✅ If the extension is publicly listed, its slug is resolved and normal download links are generated.
- ❌ System / built-in extensions are automatically excluded.
- ❌ Private or unlisted extensions may not be resolvable.

---

## ❌ Unsupported Formats (Important)

This tool does **NOT** support encrypted or proprietary sharing formats.

### auto-extension-manager encrypted share text (unsupported)

Example:

```
--------BEGIN--------
QWxuWmZxUjRkQXlVbW1GQkZQeWNYbHh2S3FqM2hEVjY5
QnRBeEtmSkpZQ0JzUVl6U2VLa1FhZ0JHT1VhPQ==
--------END--------
```

- This is a **private, opaque protocol**
- Intended only for re-import into the original extension
- Not a transparent or standardized interchange format

👉 Please export using:

- ✅ JSON
- ✅ Markdown (`.md`)
- ✅ Any other plain-text format listed above

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

### Fields

- `browser`
  - `chromium` or `firefox`
- `id`
  - Chromium extension ID (32 characters, a–p)
- `slug`
  - Firefox add-on slug (resolved from UUID if necessary)

---

## Design Principles

- 🔍 Plain-text only — no hidden or opaque data
- 🔐 No decryption of third-party formats
- 🛡️ No code execution
- 🧩 Focused on extension identification and discovery

These constraints keep the tool predictable, safe, and easy to maintain.

---

## License

MIT License