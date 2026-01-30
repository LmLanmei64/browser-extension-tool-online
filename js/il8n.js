const I18N_MESSAGES = {
  en: {
    title: "Browser Extension Extractor",
    paste_label: "Paste your extension export content below:",
    paste_placeholder:
      "Paste JSON, Markdown, about:support content, or chrome://extensions-internals text...",
    unsupported_note:
      "Encrypted share texts (BEGIN / END format) are not supported. Please use JSON or Markdown exports.",
    unsupported_title: "Unsupported Formats",
    unsupported_example_label:
      "Example of an unsupported encrypted share text:",
    result_title: "Extracted Result"
  },

  zh: {
    title: "浏览器扩展信息提取工具",
    paste_label: "请在下方粘贴扩展导出内容：",
    paste_placeholder:
      "粘贴 JSON、Markdown、about:support 或 chrome://extensions-internals 页面内容…",
    unsupported_note:
      "不支持加密分享文本（BEGIN / END 格式），请使用 JSON 或 Markdown 导出内容。",
    unsupported_title: "不支持的格式",
    unsupported_example_label:
      "以下是一个不支持的加密分享文本示例：",
    result_title: "提取结果"
  }
};

let currentLang = "en";

function setLanguage(lang) {
  if (!I18N_MESSAGES[lang]) return;
  currentLang = lang;
  localStorage.setItem("lang", lang);
  applyTranslations();
}

function t(key) {
  return I18N_MESSAGES[currentLang][key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });
}

function initI18n() {
  const saved = localStorage.getItem("lang");
  if (saved && I18N_MESSAGES[saved]) {
    currentLang = saved;
  } else {
    currentLang = navigator.language.startsWith("zh") ? "zh" : "en";
  }
  applyTranslations();
}
