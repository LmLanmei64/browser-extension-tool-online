import { parseExtensions } from "./parser.js";
import { attachLinks } from "./links.js";
import { openLinks } from "./opener.js";

let finalData = [];

const inputBox = document.getElementById("inputBox");
const fileInput = document.getElementById("fileInput");
const outputBox = document.getElementById("outputBox");

/* =========================
   文件导入
========================= */

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    inputBox.value = e.target.result;
  };
  reader.readAsText(file);
});

/* =========================
   解析
========================= */

document.getElementById("parseBtn").onclick = async () => {
  const parsed = parseExtensions(inputBox.value);
  if (!parsed.length) {
    outputBox.textContent = "未识别到任何扩展";
    return;
  }

  finalData = await attachLinks(parsed);

  // ✅ 修正后的存在性检测
  await detectExistence(finalData);

  outputBox.textContent = JSON.stringify(finalData, null, 2);
};

/* =========================
   打开链接
========================= */

document.getElementById("openBtn").onclick = () => {
  const urls = collectUrls();
  if (!urls) return;
  openLinks(urls);
};

/* =========================
   存在性检测（修正版）
========================= */

async function detectExistence(data) {
  for (const ext of data) {
    ext.existence = {
      edge: { official: false, crxsoso: false },
      chrome: { official: false, crxsoso: false },
      firefox: { official: false, crxsoso: false }
    };

    const links = ext.links || [];

    /* ===== Chromium：Edge 优先 ===== */
    if (ext.browser === "chromium") {
      // 1️⃣ Edge 官方
      const edgeOfficial = links.find(
        l => l.browser === "edge" && l.type === "official-page"
      );

      if (edgeOfficial && await weakExists(edgeOfficial.url)) {
        ext.existence.edge.official = true;
        // ⚠️ Edge 存在 → 不再判断 Chrome
      } else {
        // 2️⃣ Chrome 官方（仅当 Edge 不存在）
        const chromeOfficial = links.find(
          l => l.browser === "chrome" && l.type === "official-page"
        );

        if (chromeOfficial && await weakExists(chromeOfficial.url)) {
          ext.existence.chrome.official = true;
        }
      }

      // 3️⃣ CRXSoso（兜底）
      for (const browser of ["edge", "chrome"]) {
        const crx = links.find(
          l => l.browser === browser && l.type === "crxsoso"
        );
        if (crx && await weakExists(crx.url)) {
          ext.existence[browser].crxsoso = true;
        }
      }
    }

    /* ===== Firefox：官方 → CRXSoso ===== */
    if (ext.browser === "firefox") {
      const official = links.find(
        l => l.browser === "firefox" && l.type === "official-page"
      );

      if (official && await weakExists(official.url)) {
        ext.existence.firefox.official = true;
      } else {
        const crx = links.find(
          l => l.browser === "firefox" && l.type === "crxsoso"
        );
        if (crx && await weakExists(crx.url)) {
          ext.existence.firefox.crxsoso = true;
        }
      }
    }
  }
}

/* =========================
   弱检测（前端极限）
========================= */

function weakExists(url) {
  return fetch(url, { mode: "no-cors" })
    .then(() => true)
    .catch(() => false);
}

/* =========================
   收集要打开的 URL
========================= */

function collectUrls() {
  const browsers = {
    edge: browser_edge.checked,
    chrome: browser_chrome.checked,
    firefox: browser_firefox.checked
  };

  const sources = {
    official: source_official.checked,
    crxsoso: source_crxsoso.checked
  };

  if (!Object.values(browsers).some(Boolean)) {
    alert("请至少选择一个浏览器");
    return null;
  }

  if (!Object.values(sources).some(Boolean)) {
    alert("请至少选择一个来源");
    return null;
  }

  const urls = [];

  finalData.forEach(ext => {
    const ex = ext.existence || {};
    const links = ext.links || [];

    for (const browser of Object.keys(browsers)) {
      if (!browsers[browser]) continue;

      if (sources.official && ex[browser]?.official) {
        const official = links.find(
          l => l.browser === browser && l.type === "official-page"
        );
        if (official) urls.push(official.url);
        continue;
      }

      if (sources.crxsoso && ex[browser]?.crxsoso) {
        const crx = links.find(
          l => l.browser === browser && l.type === "crxsoso"
        );
        if (crx) urls.push(crx.url);
      }
    }
  });

  if (!urls.length) {
    alert("没有符合当前条件的链接");
    return null;
  }

  return urls;
}
