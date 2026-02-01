// app.js
let finalData = [];

document.addEventListener("DOMContentLoaded", () => {
  const inputBox = document.getElementById("inputBox");
  const outputBox = document.getElementById("outputBox");
  const errorBox = document.getElementById("errorBox");
  const parseBtn = document.getElementById("parseBtn");
  const openBtn = document.getElementById("openBtn");
  const openDelayBtn = document.getElementById("openDelayBtn");
  const delayInput = document.getElementById("delayInput");

  parseBtn.onclick = async () => {
    const text = inputBox.value.trim();
    if (!text) return;

    errorBox.textContent = "";
    outputBox.textContent = "";

    if (isEncryptedShareText(text)) {
      errorBox.textContent =
        currentLang === "zh"
          ? "检测到加密分享文本。该格式不受支持。"
          : "Encrypted share text detected. This format is not supported.";
      return;
    }

    const parsed = parseExtensions(text);
    const resolved = await resolveUUIDs(parsed);

    finalData = attachLinks(resolved);
    outputBox.textContent = JSON.stringify(finalData, null, 2);
    alert(`Parsed ${finalData.length} extensions`);
  };

  openBtn.onclick = () => openLinksSafely(finalData, 0);

  openDelayBtn.onclick = () => {
    const delay = Number(delayInput.value) || 500;
    openLinksSafely(finalData, delay);
  };
});

/* ================= 加密文本检测 ================= */

function isEncryptedShareText(text) {
  return /-{4,}\s*BEGIN\s*-{4,}/i.test(text);
}

/* ================= 解析扩展 ================= */

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

  /* ---------- Firefox about:support 表格（过滤 app-builtin） ---------- */
  const lines = text.split("\n");
  lines.forEach(line => {
    if (/app-builtin/i.test(line)) return; // 👈 关键过滤点

    // slug@domain
    const slugMatch = line.match(/\b([a-z0-9-]+)@[a-z0-9.-]+\b/i);
    if (slugMatch) {
      add({ browser: "firefox", slug: slugMatch[1] });
      return;
    }

    // UUID
    const uuidMatch = line.match(/\{[0-9a-fA-F-]{36}\}/);
    if (uuidMatch) {
      add({
        browser: "firefox",
        uuid: uuidMatch[0],
        needsResolve: true
      });
    }
  });

  /* ---------- Chromium 扩展 ID ---------- */
  (text.match(/\b[a-p]{32}\b/g) || []).forEach(id => {
    add({ browser: "chromium", id });
  });

  /* ---------- AMO URL ---------- */
  (text.match(/addons\.mozilla\.org\/[^/]+\/addon\/([a-z0-9-]+)/gi) || []).forEach(
    m => {
      add({ browser: "firefox", slug: m.split("/").pop() });
    }
  );

  return results;
}

/* ================= UUID → slug（官方 v5 detail API） ================= */

async function resolveUUIDs(list) {
  for (const ext of list) {
    if (ext.browser === "firefox" && ext.needsResolve && ext.uuid) {
      const slug = await resolveFirefoxUUID(ext.uuid);
      if (slug) {
        ext.slug = slug;
        delete ext.needsResolve;
      } else {
        ext.unresolvable = true;
        ext.reason = "UUID not found in AMO";
      }
    }
  }
  return list;
}

async function resolveFirefoxUUID(uuid) {
  const clean = uuid.replace(/[{}]/g, "");
  const url = `https://addons.mozilla.org/api/v5/addons/addon/${clean}/`;

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;

    const data = await res.json();

    // ① 首选 slug
    if (data.slug) return data.slug;

    // ② url 兜底（从 /addon/{slug}/ 反推）
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
    links.push({ type: "official", url: `https://chrome.google.com/webstore/detail/${ext.id}` });
    links.push({ type: "crxsoso", url: `https://www.crxsoso.com/webstore/detail/${ext.id}` });
    links.push({ type: "crxsoso", url: `https://www.crxsoso.com/addon/detail/${ext.id}` });
  }

  if (ext.browser === "firefox" && ext.slug) {
    links.push({ type: "official", url: `https://addons.mozilla.org/firefox/addon/${ext.slug}/` });
    links.push({ type: "crxsoso", url: `https://www.crxsoso.com/firefox/detail/${ext.slug}` });
  }

  return links;
}

/* ================= 批量打开 ================= */

function openLinksSafely(data, delay = 0) {
  const urls = [];
  data.forEach(ext => ext.links.forEach(l => urls.push(l.url)));
  if (!urls.length) return;

  if (!confirm(`Open ${urls.length} links in new tabs?`)) return;

  urls.forEach((url, i) => {
    delay
      ? setTimeout(() => window.open(url, "_blank"), i * delay)
      : window.open(url, "_blank");
  });
}
