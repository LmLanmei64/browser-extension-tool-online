// app.js

import { parseExtensions } from "./parser.js";
import { attachLinks } from "./links.js";
import { openLinks } from "./opener.js";

// Global variable to store parsed data
let finalData = [];

document.addEventListener("DOMContentLoaded", () => {
  const inputBox = document.getElementById("inputBox");
  const outputBox = document.getElementById("outputBox");
  const errorBox = document.getElementById("errorBox");
  const parseBtn = document.getElementById("parseBtn");
  const openBtn = document.getElementById("openBtn");
  const openDelayBtn = document.getElementById("openDelayBtn");
  const delayInput = document.getElementById("delayInput");

  // Parse button logic
  parseBtn.onclick = () => {
    const text = inputBox.value.trim();
    if (!text) return;

    // Clear previous output and errors
    errorBox.textContent = "";
    outputBox.textContent = "";

    // Check for unsupported formats (BEGIN/END encrypted text)
    if (isEncryptedShareText(text)) {
      errorBox.textContent =
        currentLang === "zh"
          ? "检测到加密分享文本。该格式不受支持，请使用 JSON 或 Markdown 导出。"
          : "Encrypted share text detected. This format is not supported. Please use JSON or Markdown exports.";
      return;
    }

    // Parse and generate links
    const parsed = parseExtensions(text);
    finalData = attachLinks(parsed);
    outputBox.textContent = JSON.stringify(finalData, null, 2);
    alert(`Parsed ${finalData.length} extensions`);
  };

  // Open links button (no delay)
  openBtn.onclick = () => {
    openLinks(finalData);
  };

  // Open links button (with delay)
  openDelayBtn.onclick = () => {
    const delay = Number(delayInput.value) || 500;
    openLinks(finalData, { delay });
  };
});

/**
 * Check if the input text is encrypted share text (BEGIN / END format)
 * @param {string} text - The input text to check
 * @returns {boolean} - True if the text matches the encrypted format
 */
function isEncryptedShareText(text) {
  return (
    /-{4,}\s*BEGIN\s*-{4,}/i.test(text) &&
    /-{4,}\s*END\s*-{4,}/i.test(text) &&
    /[A-Za-z0-9+/=]{40,}/.test(text)
  );
}
