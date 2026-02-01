// app.js
let finalData = [];

document.addEventListener("DOMContentLoaded", () => {
  const inputBox = document.getElementById("inputBox");
  const outputBox = document.getElementById("outputBox");
  const errorBox = document.getElementById("errorBox");
  const parseBtn = document.getElementById("parseBtn");
  const openBtn = document.getElementById("openBtn");

  parseBtn.onclick = async () => {
    const text = inputBox.value.trim();
    if (!text) return;

    errorBox.textContent = "";
    outputBox.textContent = "";

    const parsed = parseExtensions(text);
    const resolved = await resolveUUIDs(parsed);

    finalData = attachLinks(resolved);
    outputBox.textContent = JSON.stringify(finalData, null, 2);
  };

  openBtn.onclick = () => openLinksSafely(finalData);
});

/* ================= 解析 about:support 表格 ================= */

function parseExtensions(text) {
  const results = [];
  const seen = new Set();

  function add(ext) {
    const key = ext.browser + ":" + (ext.id || ext.slug || ext.uuid);
    if (!seen.has(key)) {
      seen.add(key);
      results.push(ext);
    }
  }

  const lines = text.split("\n");

  lines.forEach(line => {
    // 只处理表格行
    if (!line.includes("\t")) return;

    // 过滤系统内置扩展
    if (/app-builtin/i.test(line)) return;

    // UUID（Firefox）
    const uuidMatch = line.match(/\{[0-9a-fA-F-]{36}\}/);
    if (uuidMatch) {
      add({
        browser: "firefox",
        uuid: uuidMatch[0],
        needsResolve: true
      });
      return;
    }

    // slug@domain（Firefox）
    const slugMatch = line.match(/\b([a-z0-9-]+)@[a-z0-9.-]+\b/i);
    if (slugMatch) {
      add({
        browser: "firefox",
        slug: slugMatch[1]
      });
    }
  });

  // Chromium 扩展（无表格，允许全文扫描）
  (text.match(/\b[a-p]{32}\b/g) || []).forEach(id => {
    add({ browser: "chromium", id });
  });

  return results;
}

/* ================= UUID → slug（AMO v5，关键修复） ================= */

async function resolveUUIDs(list) {
  for (const ext of list) {
    if (ext.browser === "firefox" && ext.needsResolve && ext.uuid) {
      const slug = await resolveFirefoxUUID(ext.uuid);
      if (slug) {
        ext.slug = slug;
        delete ext.needsResolve;
      } else {
        ext.unresolvable = true;
      }
    }
  }
  return list;
}

async function resolveFirefoxUUID(uuid) {
  // ✅ 关键：保留 {} 并进行 URL 编码
  const encoded = encodeURIComponent(uuid);
  const url = `https://addons.mozilla.org/api/v5/addons/addon/${encoded}/`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" }
    });
    if (!res.ok) return null;

    const data = await res.json();

    // ① slug
    if (data.slug) return data.slug;

    // ② url 兜底
    if (data.url) {
      const m = data.url.match(/addon\/([^/]+)/);
      if (m) return m[1];
    }
  } catch {
    return null;
  }

  return null;
}

/* ================= 构建下载链接 ================= */

function attachLinks(list) {
  return list.map(ext => ({
    ...ext,
    links: buildDownloadLinks(ext)
  }));
}

function buildDownloadLinks(ext) {
  const links = [];

  if (ext.browser === "chromium" && ext.id) {
    links.push({ url: `https://chrome.google.com/webstore/detail/${ext.id}` });
    links.push({ url: `https://www.crxsoso.com/webstore/detail/${ext.id}` });
  }

  if (ext.browser === "firefox" && ext.slug) {
    links.push({ url: `https://addons.mozilla.org/firefox/addon/${ext.slug}/` });
    links.push({ url: `https://www.crxsoso.com/firefox/detail/${ext.slug}` });
  }

  return links;
}

/* ================= 批量打开 ================= */

function openLinksSafely(data) {
  const urls = [];
  data.forEach(ext => ext.links.forEach(l => urls.push(l.url)));
  if (!urls.length) return;

  if (!confirm(`Open ${urls.length} links?`)) return;
  urls.forEach(url => window.open(url, "_blank"));
}
