import { parseExtensions } from "./parser.js";
import { buildLinksForExtension } from "./links.js";
import { openLinks } from "./opener.js";

const inputBox = document.getElementById("inputBox");
const outputBox = document.getElementById("outputBox");

let finalData = [];

document.getElementById("parseBtn").onclick = async () => {
  finalData = [];
  const parsed = parseExtensions(inputBox.value);

  for (const ext of parsed) {
    const links = await buildLinksForExtension(ext);
    finalData.push({ ...ext, availableLinks: links });
  }

  outputBox.textContent = JSON.stringify(finalData, null, 2);
};

document.getElementById("openBtn").onclick = () => {
  const urls = [];

  const firefoxMode =
    document.querySelector("input[name='firefox_source']:checked").value;

  for (const ext of finalData) {
    for (const link of ext.availableLinks) {
      if (ext.browser === "firefox") {
        if (link.type === firefoxMode) urls.push(link.url);
      } else {
        if (
          link.type === "official" &&
          ((ext.browser === "chrome" && show("show_chrome_official")) ||
           (ext.browser === "edge" && show("show_edge_official")))
        ) {
          urls.push(link.url);
        }

        if (link.type === "crxsoso" && show("show_crxsoso_chrome")) {
          urls.push(link.url);
        }
      }
    }
  }

  openLinks(urls, { delay: 200, confirmOpen: true });
};

function show(id) {
  return document.getElementById(id)?.checked;
}
