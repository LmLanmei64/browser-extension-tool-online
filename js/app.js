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

  // ⭐ 新存在性判定逻辑
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
   Chromium + Firefox 存在性检测（最终版）
========================= */
async function detectExistence(data) {
  for (const ext of data) {
    ext.existence = {
      chromium: {
        edge: false,
        crxsoso: false
      },
      firefox: {
        official: false,
        crxsoso: false
      }
    };

    const links = ext.links || [];

    /* ===== Chromium 插件 ===== */
    if (ext.browser === "chromium") {
      // 1️⃣ Edge 官方作为唯一官方依据
      const edge = links.find(
        l => l.browser === "edge" && l.type === "official-page"
      );

      if (edge && await weakExists(edge.url)) {
        ext.existence.chromium.edge = true;
        continue; // Edge 存在就不用再判断
      }

      // 2️⃣ CRXSoso 兜底
      const crx = links.find(l => l.type === "crxsoso");
      if (crx && await weakExists(crx.url)) {
        ext.existence.chromium.crxsoso = true;
      }
    }

    /* ===== Firefox 插件 ===== */
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
   弱存在检测（前端极限）
========================= */
function weakExists(url) {
  return fetch(url, { mode: "no-cors" })
    .then(() => true)
    .catch(() => false);
}

/* =========================
   根据用户选择收集要打开的链接
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

    /* ===== Chromium ===== */
    if (ext.browser === "chromium") {
      const exists = ex.chromium?.edge || ex.chromium?.crxsoso;
      if (!exists) return;

      for (const browser of ["edge", "chrome"]) {
        if (!browsers[browser]) continue;

        if (sources.official && ex.chromium.edge) {
          const official = links.find(
            l => l.browser === browser && l.type === "official-page"
          );
          if (official) urls.push(official.url);
          continue;
        }

        if (sources.crxsoso && ex.chromium.crxsoso) {
          const crx = links.find(l => l.type === "crxsoso");
          if (crx) urls.push(crx.url);
        }
      }
    }

    /* ===== Firefox ===== */
    if (ext.browser === "firefox") {
      if (browsers.firefox) {
        if (sources.official && ex.firefox?.official) {
          const official = links.find(
            l => l.browser === "firefox" && l.type === "official-page"
          );
          if (official) urls.push(official.url);
        }

        if (sources.crxsoso && ex.firefox?.crxsoso) {
          const crx = links.find(
            l => l.browser === "firefox" && l.type === "crxsoso"
          );
          if (crx) urls.push(crx.url);
        }
      }
    }
  });

  if (!urls.length) {
    alert("没有符合当前条件的链接");
    return null;
  }

  return urls;
}
