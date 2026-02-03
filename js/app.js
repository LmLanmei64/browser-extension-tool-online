import { parseExtensions } from "./parser.js";
import { buildLinksForExtension } from "./links.js";
import { openLinks } from "./opener.js";

const inputBox = document.getElementById("inputBox");
const outputBox = document.getElementById("outputBox");
const parseBtn = document.getElementById("parseBtn");
const openBtn = document.getElementById("openBtn");
const fileInput = document.getElementById("fileInput");

let finalData = [];

parseBtn.onclick = async () => {
  const text = inputBox.value.trim();
  if (!text) {
    outputBox.textContent = "[]";
    return;
  }

  const parsed = parseExtensions(text);
  finalData = [];

  for (const ext of parsed) {
    const links = await buildLinksForExtension(ext);
    finalData.push({
      ...ext,
      availableLinks: links
    });
  }

  outputBox.textContent = JSON.stringify(finalData, null, 2);
};

openBtn.onclick = () => {
  const showHomepage = document.getElementById("show_homepage").checked;
  const showOfficial = document.getElementById("show_official").checked;
  const showDownload = document.getElementById("show_download").checked;
  const showCrxsoso = document.getElementById("show_crxsoso").checked;

  const urls = [];

  for (const ext of finalData) {
    for (const link of ext.availableLinks) {
      if (link.type === "homepage" && showHomepage) urls.push(link.url);
      if (link.type === "official" && showOfficial) urls.push(link.url);
      if (link.type === "download" && showDownload) urls.push(link.url);
      if (link.type === "crxsoso" && showCrxsoso) urls.push(link.url);
    }
  }
  console.log(urls);
  openLinks(urls);
};

fileInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    inputBox.value = reader.result;
  };
  reader.readAsText(file);
};
