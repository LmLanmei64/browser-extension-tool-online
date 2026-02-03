import { parseExtensions } from "./parser.js";
import { attachLinks } from "./links.js";
import { openLinks } from "./opener.js";

let finalData = [];

const inputBox = document.getElementById("inputBox");
const fileInput = document.getElementById("fileInput");
const outputBox = document.getElementById("outputBox");

fileInput.addEventListener("change", () => {
  const f = fileInput.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = e => inputBox.value = e.target.result;
  r.readAsText(f);
});

document.getElementById("parseBtn").onclick = async () => {
  const parsed = parseExtensions(inputBox.value);
  finalData = await attachLinks(parsed);
  outputBox.textContent = JSON.stringify(finalData, null, 2);
};

document.getElementById("openBtn").onclick = () => {
  const urls = collectUrls();
  if (urls.length) openLinks(urls);
};

function collectUrls() {
  const show = {
    homepage: show_homepage.checked,
    official: show_official.checked,
    crxsoso: show_crxsoso.checked
  };

  const urls = [];
  finalData.forEach(ext => {
    ext.availableLinks.forEach(l => {
      if (l.type === "homepage" && show.homepage) urls.push(l.url);
      if (l.type.startsWith("official") && show.official) urls.push(l.url);
      if (l.type === "crxsoso" && show.crxsoso) urls.push(l.url);
    });
  });
  return urls;
}
