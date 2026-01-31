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

    // UUID → slug
    const resolved = await resolveUUIDs(parsed);

    // 过滤系统内置扩展
    const filtered = resolved.filter(ext => !ext.system);

    finalData = attachLinks(filtered);
    outputBox.textContent = JSON.stringify(finalData, null, 2);
    alert(`Parsed ${finalData.length} extensions`);
  };

  openBtn.onclick = () => openLinksSafely(finalData, 0);

  openDelayBtn.onclick = () => {
    const delay = Number(delayInput.value) || 500;
    openLinksSafely(finalData, delay);
  };
});

/* ================= 基础判断 ================= */

function isEncryptedShareText(text) {
  return /-{4,}\s*BEGIN\s*-{4,}/i.test(text);
}

/* ================= 核心解析（支持混合来源） ================= */

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

  // Chromium ID
  (text.match(/\b[a-p]{32}\b/g) || []).forEach(id => {
    add({ browser: "chromium", id });
  });

  // Firefox slug@domain（about:support 表格 / 普通文本）
  (text.match(/\b([a-z0-9-]+)@[a-z0-9.-]+\b/gi) || []).forEach(m => {
    const slug = m.split("@")[0];
    if (/^[a-z0-9-]+$/.test(slug)) {
      add({ browser: "firefox", slug });
    }
  });

  // Firefox UUID
  (text.match(/\{[0-9a-fA-F-]{36}\}/g) || []).forEach(uuid => {
    add({ browser: "firefox", uuid, needsResolve: true });
  });

  // AMO URL
  (text.match(/addons\.mozilla\.org\/[^/]+\/addon\/([a-z0-9-]+)/gi) || []).forEach(
    m => add({ browser: "firefox", slug: m.split("/").pop() })
  );

  // about:support 表格里的“位置”字段判断系统插件
  const lines = text.split("\n");
  lines.forEach(line => {
    if (line.includes("app-builtin")) {
      const match = line.match(/\b([a-z0-9-]+)@[a-z0-9.-]+\b/i);
      if (match) {
        const slug = match[1].split("@")[0];
        add({ browser: "firefox", slug, system: true });
      }
    }
  });

  return results;
}

/* ================= UUID → slug（官方 API） ================= */

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
    return data.slug || null;
  } catch {
    return null;
  }
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
