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

    // 检测加密分享文本
    if (isEncryptedShareText(text)) {
      errorBox.textContent =
        currentLang === "zh"
          ? "检测到加密分享文本。该格式不受支持，请使用 JSON 或 Markdown 导出。"
          : "Encrypted share text detected. This format is not supported. Please use JSON or Markdown exports.";
      return;
    }

    const parsed = parseExtensions(text);

    // 查询 UUID 对应的 slug
    const resolved = await resolveUUIDs(parsed);

    finalData = attachLinks(resolved);
    outputBox.textContent = JSON.stringify(finalData, null, 2);
    alert(`Parsed ${finalData.length} extensions`);
  };

  openBtn.onclick = () => {
    openLinksSafely(finalData, 0);
  };

  openDelayBtn.onclick = () => {
    const delay = Number(delayInput.value) || 500;
    openLinksSafely(finalData, delay);
  };
});

/* ================= 检测加密分享文本 ================= */

function isEncryptedShareText(text) {
  return (
    /-{4,}\s*BEGIN\s*-{4,}/i.test(text) &&
    /-{4,}\s*END\s*-{4,}/i.test(text) &&
    /[A-Za-z0-9+/=]{40,}/.test(text)
  );
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

  // Chromium 扩展 ID（32位 a-p）
  const chromeIds = text.match(/\b[a-p]{32}\b/g) || [];
  chromeIds.forEach(id => {
    add({ browser: "chromium", id });
  });

  // Firefox 标准 slug@domain（桌面版 + Android）
  const firefoxIds = text.match(/\b([a-z0-9-]+)@[a-z0-9.-]+\b/gi) || [];
  firefoxIds.forEach(m => {
    const slug = m.split("@")[0];

    // 排除 UUID 形式 {xxxx}
    if (!slug.startsWith("{") && /^[a-z0-9-]+$/.test(slug)) {
      add({ browser: "firefox", slug });
    }
  });

  // Firefox UUID 形式（仅识别）
  const uuidMatches = text.match(/\{[0-9a-fA-F-]{36}\}/g) || [];
  uuidMatches.forEach(uuid => {
    add({
      browser: "firefox",
      uuid,
      needsResolve: true
    });
  });

  // AMO URL
  const amo = text.match(/addon\/([a-z0-9-]+)/gi) || [];
  amo.forEach(m => {
    add({ browser: "firefox", slug: m.split("/").pop() });
  });

  return results;
}

/* ================= 解析 UUID 并查询 slug ================= */

async function resolveUUIDs(extList) {
  for (const ext of extList) {
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
  return extList;
}

async function resolveFirefoxUUID(uuid) {
  const clean = uuid.replace(/[{}]/g, "");
  const url = `https://addons.mozilla.org/api/v5/addons/search/?guid=${clean}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].slug;
    }
  } catch (e) {
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
    links.push({
      type: "official",
      browser: "chromium",
      url: `https://chrome.google.com/webstore/detail/${ext.id}`
    });

    links.push({
      type: "crxsoso",
      browser: "chrome",
      url: `https://www.crxsoso.com/webstore/detail/${ext.id}`
    });

    links.push({
      type: "crxsoso",
      browser: "edge",
      url: `https://www.crxsoso.com/addon/detail/${ext.id}`
    });
  }

  if (ext.browser === "firefox" && ext.slug) {
    links.push({
      type: "official",
      browser: "firefox",
      url: `https://addons.mozilla.org/firefox/addon/${ext.slug}/`
    });

    links.push({
      type: "crxsoso",
      browser: "firefox",
      url: `https://www.crxsoso.com/firefox/detail/${ext.slug}`
    });
  }

  return links;
}

/* ================= 批量打开 ================= */

function openLinksSafely(finalOutput, delay = 0) {
  let urls = [];

  finalOutput.forEach(ext => {
    ext.links.forEach(link => urls.push(link.url));
  });

  if (!urls.length) return;

  if (!confirm(`Open ${urls.length} links in new tabs?`)) return;

  urls.forEach((url, index) => {
    if (delay > 0) {
      setTimeout(() => window.open(url, "_blank"), index * delay);
    } else {
      window.open(url, "_blank");
    }
  });
}
