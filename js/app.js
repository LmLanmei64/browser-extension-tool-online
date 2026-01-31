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

    const parsed = parseExtensions(text);
    const resolved = await resolveUUIDs(parsed);

    finalData = attachLinks(resolved);
    outputBox.textContent = JSON.stringify(finalData, null, 2);
  };

  openBtn.onclick = () => openLinksSafely(finalData, 0);

  openDelayBtn.onclick = () => {
    const delay = Number(delayInput.value) || 500;
    openLinksSafely(finalData, delay);
  };
});

/* ================= 解析 ================= */

function parseExtensions(text) {
  const results = [];
  const seen = new Set();

  function add(ext) {
    // 过滤 Firefox 系统内置组件
    if (ext.browser === "firefox" && ext.rawId?.endsWith("@mozac.org")) return;

    const key = ext.browser + ":" + (ext.id || ext.slug || ext.uuid);
    if (!seen.has(key)) {
      seen.add(key);
      results.push(ext);
    }
  }

  // Chromium
  (text.match(/\b[a-p]{32}\b/g) || []).forEach(id => {
    add({ browser: "chromium", id });
  });

  // Firefox slug@domain
  (text.match(/\b([a-z0-9-]+)@([a-z0-9.-]+)\b/gi) || []).forEach(m => {
    const slug = m.split("@")[0];
    add({ browser: "firefox", slug, rawId: m });
  });

  // Firefox UUID
  (text.match(/\{[0-9a-fA-F-]{36}\}/g) || []).forEach(uuid => {
    add({ browser: "firefox", uuid, needsResolve: true });
  });

  return results;
}

/* ================= UUID → slug（官方 API + url 兜底） ================= */

async function resolveUUIDs(list) {
  for (const ext of list) {
    if (ext.browser === "firefox" && ext.needsResolve) {
      const data = await resolveFirefoxUUID(ext.uuid);
      if (data?.slug) {
        ext.slug = data.slug;
      } else if (data?.url) {
        ext.slug = data.url.split("/addon/")[1]?.replace("/", "");
      } else {
        ext.unresolvable = true;
      }
      delete ext.needsResolve;
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
    return await res.json();
  } catch {
    return null;
  }
}

/* ================= 构建链接（按来源选择） ================= */

function attachLinks(list) {
  const useOfficial = document.getElementById("srcOfficial").checked;
  const useCrx = document.getElementById("srcCrxSoso").checked;

  return list.map(ext => {
    const links = [];

    if (ext.browser === "chromium" && ext.id) {
      if (useOfficial) {
        links.push(`https://chrome.google.com/webstore/detail/${ext.id}`);
      }
      if (useCrx) {
        links.push(`https://www.crxsoso.com/webstore/detail/${ext.id}`);
        links.push(`https://www.crxsoso.com/addon/detail/${ext.id}`);
      }
    }

    if (ext.browser === "firefox" && ext.slug) {
      if (useOfficial) {
        links.push(`https://addons.mozilla.org/firefox/addon/${ext.slug}/`);
      }
      if (useCrx) {
        links.push(`https://www.crxsoso.com/firefox/detail/${ext.slug}`);
      }
    }

    return { ...ext, links };
  });
}

/* ================= 打开链接 ================= */

function openLinksSafely(data, delay = 0) {
  const urls = data.flatMap(e => e.links || []);
  if (!urls.length) return;

  if (!confirm(`Open ${urls.length} links?`)) return;

  urls.forEach((url, i) => {
    delay
      ? setTimeout(() => window.open(url, "_blank"), i * delay)
      : window.open(url, "_blank");
  });
}
