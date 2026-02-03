import { parseExtensions } from "./parser.js";
import { buildLinksForExtension } from "./links.js";
import { openLinks } from "./opener.js";

const inputBox = document.getElementById("inputBox");
const outputBox = document.getElementById("outputBox");
const fileInput = document.getElementById("fileInput");

let finalData = [];

/* ---------- 解析 ---------- */
document.getElementById("parseBtn").onclick = async () => {
  finalData = [];
  const text = inputBox.value.trim();
  if (!text) {
    outputBox.textContent = "[]";
    return;
  }

  const parsed = parseExtensions(text);

  for (const ext of parsed) {
    const links = await buildLinksForExtension(ext);
    finalData.push({
      ...ext,
      availableLinks: links
    });
  }

  outputBox.textContent = JSON.stringify(finalData, null, 2);
};

/* ---------- 打开链接 ---------- */
document.getElementById("openBtn").onclick = () => {
  const urls = [];

  const firefoxMode =
    document.querySelector("input[name='firefox_source']:checked").value;

  for (const ext of finalData) {
    for (const link of ext.availableLinks) {
      if (ext.browser === "firefox") {
        if (link.type === firefoxMode) {
          urls.push(link.url);
        }
      } else {
        if (
          link.type === "official" &&
          (
            (ext.browser === "chrome" && isChecked("show_chrome_official")) ||
            (ext.browser === "edge" && isChecked("show_edge_official"))
          )
        ) {
          urls.push(link.url);
        }

        if (link.type === "crxsoso" && isChecked("show_crxsoso_chrome")) {
          urls.push(link.url);
        }
      }
    }
  }

  openLinks(urls, { delay: 200, confirmOpen: true });
};

/* ---------- 文件导入（关键恢复点） ---------- */
fileInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    inputBox.value = reader.result;
  };
  reader.readAsText(file);
};

function isChecked(id) {
  return document.getElementById(id)?.checked;
}
