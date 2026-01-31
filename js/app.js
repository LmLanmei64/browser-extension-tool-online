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
        "检测到加密分享文本，该格式不受支持。请使用 JSON 或 Markdown 导出。";
      return;
    }

    const parsed = parseExtensions(text);

    // 异步解析 UUID（slug）
    const resolved = await resolveUUIDs(parsed);

    // 排除系统扩展
    const filtered = resolved.filter(e => !isSystemExtension(e));

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

/* ================= 基础检测 ================= */

function isEncryptedShareText(text) {
  return /-{4,}\s*BEGIN\s*-{4,}/i.test(text);
}

/* ================= 主解析逻辑 ================= */

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

  // Firefox slug@domain
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

  // AMO 链接
  (text.match(/addons\.mozilla\.org\/[^/]+\/addon\/([a-z0-9-]+)/gi) || []).forEach(
    m => add({ browser: "firefox", slug: m.split("/").pop() })
  );

  return results;
}

/* ================= UUID → slug 查询 ================= */

async function resolveUUIDs(list) {
  for (const ext of list) {
    if (ext.browser === "firefox" && ext.needsResolve && ext.uuid) {
      // 跳过系统扩展
      if (isSystemUUID(ext.uuid)) {
        ext.unresolvable = true;
        ext.reason = "System extension (builtin)";
        continue;
      }

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

/* ================= 调用官方 AMO API ================= */

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

/* ================= 系统扩展识别 ================= */

// 判断是否系统扩展
function isSystemExtension(ext) {
  if (ext.slug) {
    // 常见 Firefox 内置扩展前缀
    const sys = [
      "fxa", "webcompat", "screenshots", "formautofill",
      "pdfjs", "pocket", "readerview", "cookies", "icons", "ads"
    ];
    return sys.includes(ext.slug.toLowerCase());
  }
  if (ext.uuid) return isSystemUUID(ext.uuid);
  return false;
}

// 判断是否系统 UUID（有些 Firefox 内置扩展用 UUID 标识）
function isSystemUUID(uuid) {
  const systemUUIDs = [
    "{f10c197e-c2a4-43b6-a982-7e186f7c63d9}",
    "{32af1358-428a-446d-873e-5f8eb5f2a72e}",
    "{972ce4c6-7e08-4474-a285-3208198ce6fd}"
  ];
  return systemUUIDs.includes(uuid.toLowerCase());
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
