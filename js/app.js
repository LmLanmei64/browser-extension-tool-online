import { parseExtensions } from "./parser.js";
import { attachLinks } from "./links.js";
import { openLinks } from "./opener.js";

let finalData = [];

document.getElementById("parseBtn").onclick = async () => {
  const input = document.getElementById("inputBox").value;
  const output = document.getElementById("outputBox");

  const parsed = parseExtensions(input);
  if (!parsed.length) {
    output.textContent = "未识别到任何扩展";
    return;
  }

  finalData = await attachLinks(parsed);
  output.textContent = JSON.stringify(finalData, null, 2);
};

document.getElementById("openBtn").onclick = () => {
  const urls = collectUrlsByUserChoice(finalData);
  if (!urls) return;
  openLinks(urls);
};

/* =========================
   用户选择逻辑（核心）
========================= */

function collectUrlsByUserChoice(data) {
  const browserSelected = {
    edge: document.getElementById("browser_edge").checked,
    chrome: document.getElementById("browser_chrome").checked,
    firefox: document.getElementById("browser_firefox").checked
  };

  const sourceSelected = {
    official: document.getElementById("source_official").checked,
    crxsoso: document.getElementById("source_crxsoso").checked
  };

  // 校验：浏览器
  if (!Object.values(browserSelected).some(Boolean)) {
    alert("请至少选择一个浏览器");
    return null;
  }

  // 校验：来源
  if (!Object.values(sourceSelected).some(Boolean)) {
    alert("请至少选择一个来源");
    return null;
  }

  const urls = [];

  data.forEach(ext => {
    const links = ext.links || [];

    // === 官方：只取一个（默认下载）
    if (sourceSelected.official) {
      const officialLinks = links.filter(
        l => l.type === "official" && browserSelected[l.browser]
      );

      const download = officialLinks.find(l => l.url.includes("/downloads/"));
      const page = officialLinks.find(l => !l.url.includes("/downloads/"));

      const chosen = download || page;
      if (chosen) urls.push(chosen.url);
    }

    // === CRXSoso
    if (sourceSelected.crxsoso) {
      links.forEach(l => {
        if (
          l.type === "crxsoso" &&
          browserSelected[l.browser]
        ) {
          urls.push(l.url);
        }
      });
    }
  });

  if (!urls.length) {
    alert("没有符合当前筛选条件的链接");
    return null;
  }

  return urls;
}
