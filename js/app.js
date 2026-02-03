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
  reader.onload = e => inputBox.value = e.target.result;
  reader.readAsText(file);
});

document.getElementById("parseBtn").onclick = () => {
  const parsed = parseExtensions(inputBox.value);
  finalData = attachLinks(parsed);
  outputBox.textContent = JSON.stringify(finalData, null, 2);
};

document.getElementById("openBtn").onclick = () => {
  const urls = collectUrls();
  if (urls.length) openLinks(urls);
};

function collectUrls() {
  const show = {
    homepage: document.getElementById("show_homepage").checked,
    official: document.getElementById("show_official").checked,
    crxsoso: document.getElementById("show_crxsoso").checked
  };

  const urls = [];

  finalData.forEach(ext => {
    if (!ext.exists) return;

    ext.availableLinks.forEach(link => {
      if (link.type === "homepage" && show.homepage) urls.push(link.url);
      if (link.type === "official-store" && show.official) urls.push(link.url);
      if (link.type === "crxsoso" && show.crxsoso) urls.push(link.url);
    });
  });

  return urls;
}