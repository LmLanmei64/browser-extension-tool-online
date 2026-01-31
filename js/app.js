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
          ? "检测到加密分享文本。该格式不受支持，请使用 JSON 或 Markdown 导出。"
          : "Encrypted share text detected. This format is not supported.";
      return;
    }

    const parsed = parseExtensions(text);

    // 🔑 UUID → slug（异步）
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

/* ================= 工具函数 ================= */

function isEncryptedShareText(text) {
  return (
    /-{4,}\s*BEGIN\s*-{4,}/i.test(text) &&
    /-{4,}\s*END\s*-{4,}/i.test(text)
  );
}

/* ================= 解析扩展 ================= */

function parseExtensions(text) {
  const results = [];
  const seen = new Set();

  function add(ext) {
    // 排除系统自带插件
    if (
      ext.browser === "firefox" &&
      ext.type === "extension" &&
      ext.id.includes("@mozac.org")
    ) {
      return; // 跳过系统自带插件
    }

    const key = ext.browser + ":" + (ext.id || ext.slug || ext.uuid);
    if (!seen.has(key)) {
      seen.add(key);
      results.push(ext);
    }
  }

  /* Chromium ID */
  (text.match(/\b[a-p]{32}\b/g) || []).forEach(id => {
    add({ browser: "chromium", id });
  });

  /* Firefox slug@domain（桌面 + Android 表格） */
  (text.match(/\b([a-z0-9-]+)@[a-z0-9.-]+\b/gi) || []).forEach(m => {
    const slug = m.split("@")[0];
    if (/^[a-z0-9-]+$/.test(slug)) {
      add({ browser: "firefox", slug });
    }
  });

  /* Firefox UUID */
  (text.match(/\{[0-9a-fA-F-]{36}\}/g) || []).forEach(uuid => {
    add({
      browser: "firefox",
      uuid,
      needsResolve: true
    });
  });

  /* AMO URL */
  (text.match(/addons\.mozilla\.org\/[^/]+\/addon\/([a-z0-9-]+)/gi) || []).forEach(
    m => {
      add({ browser: "firefox", slug: m.split("/").pop() });
    }
  );

  return results;
}

/* ================= UUID → slug（官方 v5 API） ================= */

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
    const res = await fetch(url, {
      headers: { Accept: "application/json" }
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (data.slug) return data.slug;

    // URL 兜底：如果没有 slug，则使用 URL 中的 slug
    if (data.url) {
      return data.url.split("/addon/")[1]?.replace("/", "");
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
    links.push({
      type: "official",
      url: `https://chrome.google.com/webstore/detail/${ext.id}`
    });
    links.push({
      type: "crxsoso",
      url: `https://www.crxsoso.com/webstore/detail/${ext.id}`
    });
    links.push({
      type: "crxsoso",
      url: `https://www.crxsoso.com/addon/detail/${ext.id}`
    });
  }

  if (ext.browser === "firefox" && ext.slug) {
    links.push({
      type: "official",
      url: `https://addons.mozilla.org/firefox/addon/${ext.slug}/`
    });
    links.push({
      type: "crxsoso",
      url: `https://www.crxsoso.com/firefox/detail/${ext.slug}`
    });
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
