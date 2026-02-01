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

document.getElementById("openBtn").onclick = () => openLinks(finalData);
