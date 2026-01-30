function isEncryptedShareText(text) {
  return (
    /-{4,}\s*BEGIN\s*-{4,}/i.test(text) &&
    /-{4,}\s*END\s*-{4,}/i.test(text) &&
    /[A-Za-z0-9+/=]{40,}/.test(text)
  );
}

function parseExtensions(text) {
  const results = [];
  const seen = new Set();

  function add(item) {
    const key = item.browser + ":" + (item.id || item.slug);
    if (!seen.has(key)) {
      seen.add(key);
      results.push(item);
    }
  }

  // Chromium extension IDs
  const chromeIds = text.match(/[a-p]{32}/g) || [];
  chromeIds.forEach(id => {
    add({ browser: "chromium", id });
  });

  // Firefox IDs (slug@domain)
  const firefoxIds = text.match(/([a-z0-9-]+)@/gi) || [];
  firefoxIds.forEach(m => {
    add({ browser: "firefox", slug: m.replace("@", "") });
  });

  // AMO URLs
  const amo = text.match(/addon\/([a-z0-9-]+)/gi) || [];
  amo.forEach(m => {
    add({ browser: "firefox", slug: m.split("/").pop() });
  });

  return results;
}

document.addEventListener("DOMContentLoaded", () => {
  const inputBox = document.getElementById("inputBox");
  const outputBox = document.getElementById("outputBox");
  const errorBox = document.getElementById("errorBox");

  inputBox.addEventListener("input", () => {
    const text = inputBox.value.trim();
    errorBox.textContent = "";
    outputBox.textContent = "";

    if (!text) return;

    if (isEncryptedShareText(text)) {
      errorBox.textContent =
        currentLang === "zh"
          ? "检测到加密分享文本。该格式不受支持，请使用 JSON 或 Markdown 导出。"
          : "Encrypted share text detected. This format is not supported. Please use JSON or Markdown exports.";
      return;
    }

    const result = parseExtensions(text);
    outputBox.textContent = JSON.stringify(result, null, 2);
  });
});
