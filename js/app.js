import { parseExtensions } from "./parser.js";
import { attachLinks } from "./links.js";
import { openLinks } from "./opener.js";

let finalData = [];

const inputBox = document.getElementById("inputBox");
const fileInput = document.getElementById("fileInput");
const outputBox = document.getElementById("outputBox");

/* 文件导入 */
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => inputBox.value = e.target.result;
  reader.readAsText(file);
});

/* 解析 */
document.getElementById("parseBtn").onclick = async () => {
  const parsed = parseExtensions(inputBox.value);
  if (!parsed.length) {
    outputBox.textContent = "未识别到任何扩展";
    return;
  }

  finalData = await attachLinks(parsed);

  await detectExistence(finalData);

  outputBox.textContent = JSON.stringify(finalData, null, 2);
};

/* 打开链接 */
document.getElementById("openBtn").onclick = () => {
  const urls = collectUrls();
  if (!urls) return;
  openLinks(urls);
};

/* =========================
   存在性检测（改进版）
========================= */

async function detectExistence(data) {
  for (const ext of data) {
    ext.existence = {};
    ext.availableLinks = [];

    const links = ext.links || [];

    for (const link of links) {
      const result = await weakExistsSafe(link.url);

      if (result === true) {
        ext.availableLinks.push(link);
        if (!ext.existence[link.browser]) ext.existence[link.browser] = {};
        ext.existence[link.browser][link.type] = true;
      }
    }
  }
}

/* 更安全的弱检测 */
async function weakExistsSafe(url) {
  try {
    await fetch(url, { mode: "no-cors" });
    return true;
  } catch {
    return "unknown"; // 不再当 false
  }
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
    (ext.availableLinks || []).forEach(link => {
      if (!browsers[link.browser]) return;

      if (sources.official && link.type.startsWith("official"))
        urls.push(link.url);

      if (sources.crxsoso && link.type === "crxsoso")
        urls.push(link.url);
    });
  });

  if (!urls.length) {
    alert("没有检测到存在的链接");
    return null;
  }

  return urls;
}
