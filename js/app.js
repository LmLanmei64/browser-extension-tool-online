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
  reader.onload = e => (inputBox.value = e.target.result);
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

  await detectByCrxsoso(finalData);

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
   仅使用 CRXSoso 判断存在性
========================= */
async function detectByCrxsoso(data) {
  for (const ext of data) {
    ext.exists = false;
    ext.availableLinks = [];

    const crxLinks = (ext.links || []).filter(l => l.type === "crxsoso");

    // 只要任意一个 CRXSoso 页面存在，即认为插件存在
    for (const link of crxLinks) {
      const ok = await crxsosoExists(link.url);
      if (ok) {
        ext.exists = true;
        break;
      }
    }

    // 不存在 → 不标任何链接
    if (!ext.exists) continue;

    // 存在 → 所有链接都可以作为“候选展示链接”
    ext.availableLinks = ext.links || [];
  }
}

/* =========================
   CRXSoso 存在性判断
========================= */
async function crxsosoExists(url) {
  try {
    const res = await fetch(url, {
      mode: "no-cors",
      redirect: "follow"
    });

    // 跳到 ext_not_found 就视为不存在
    if (res.url && res.url.includes("/404/ext_not_found")) {
      return false;
    }

    return true;
  } catch {
    // 网络异常时：宁可当存在
    return true;
  }
}

/* =========================
   根据用户选择收集链接
========================= */
function collectUrls() {
  const browsers = {
    edge: browser_edge.checked,
    chrome: browser_chrome.checked,
    firefox: browser_firefox.checked
  };

  const show = {
    download: document.getElementById("show_download")?.checked,
    official: document.getElementById("show_official")?.checked,
    crxsoso: document.getElementById("show_crxsoso")?.checked
  };

  if (!Object.values(browsers).some(Boolean)) {
    alert("请至少选择一个浏览器");
    return null;
  }

  if (!Object.values(show).some(Boolean)) {
    alert("请至少选择一种链接类型");
    return null;
  }

  const urls = [];

  finalData.forEach(ext => {
    if (!ext.exists) return;

    (ext.availableLinks || []).forEach(link => {
      if (!browsers[link.browser]) return;

      if (show.download && link.type === "official-download")
        urls.push(link.url);

      if (show.official && link.type === "official-page")
        urls.push(link.url);

      if (show.crxsoso && link.type === "crxsoso")
        urls.push(link.url);
    });
  });

  if (!urls.length) {
    alert("没有符合条件的链接");
    return null;
  }

  return urls;
}
