import { parseExtensions } from "./parser.js";
import { attachLinks } from "./links.js";
import { openLinks } from "./opener.js";

let finalData = [];

const inputBox = document.getElementById("inputBox");
const fileInput = document.getElementById("fileInput");
const outputBox = document.getElementById("outputBox");

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    inputBox.value = e.target.result;
  };
  reader.readAsText(file);
});

document.getElementById("parseBtn").onclick = async () => {
  const parsed = parseExtensions(inputBox.value);
  if (!parsed.length) {
    outputBox.textContent = "未识别到任何扩展";
    return;
  }
  finalData = await attachLinks(parsed);
  outputBox.textContent = JSON.stringify(finalData, null, 2);
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

    if (sources.official) {
      const chosen = links.find(l =>
        browsers[l.browser] &&
        (officialMode === "download"
          ? l.type === "official-download"
          : l.type === "official-page")
      );
      if (chosen) urls.push(chosen.url);
    }

    if (sources.crxsoso) {
      links.forEach(l => {
        if (l.type === "crxsoso" && browsers[l.browser]) {
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
