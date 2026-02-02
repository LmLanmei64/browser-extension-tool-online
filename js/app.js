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
  const urls = collectUrls();
  if (!urls) return;
  openLinks(urls);
};

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

  const officialMode =
    document.querySelector('input[name="official_mode"]:checked')?.value
    || "download";

  const urls = [];

  finalData.forEach(ext => {
    const links = ext.links || [];

    // 官方（只选一个）
    if (sources.official) {
      const candidates = links.filter(
        l =>
          l.browser in browsers &&
          browsers[l.browser] &&
          (
            officialMode === "download"
              ? l.type === "official-download"
              : l.type === "official-page"
          )
      );

      if (candidates[0]) {
        urls.push(candidates[0].url);
      }
    }

    // CRXSoso
    if (sources.crxsoso) {
      links.forEach(l => {
        if (
          l.type === "crxsoso" &&
          browsers[l.browser]
        ) {
          urls.push(l.url);
        }
      });
    }
  });

  if (!urls.length) {
    alert("没有符合当前条件的链接");
    return null;
  }

  return urls;
}