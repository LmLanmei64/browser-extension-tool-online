const I18N_MESSAGES = {
  en: {
    title: "Browser Extension Extractor",

    paste_label: "Paste your extension export content below:",
    paste_placeholder:
      "Paste JSON, Markdown, about:support, chrome://extensions-internals text...",

    unsupported_note:
      "Encrypted share texts (BEGIN / END format) are not supported. Please use JSON or Markdown exports.",

    result_title: "Extracted Result",

    unsupported_title: "Unsupported Formats",
    unsupported_example_label:
      "Example of an unsupported encrypted share text:",

    // Buttons
    btn_parse: "Parse Extensions",
    btn_open: "Open All Links",
    btn_open_delay: "Open With Delay",

    // Delay
    delay_label: "Delay between tabs:"
  },

  zh: {
    title: "浏览器扩展信息提取工具",

    paste_label: "请在下方粘贴扩展导出内容：",
    paste_placeholder:
      "粘贴 JSON、Markdown、about:support 或 chrome://extensions-internals 页面内容…",

    unsupported_note:
      "不支持加密分享文本（BEGIN / END 格式），请使用 JSON 或 Markdown 导出内容。",

    result_title: "提取结果",

    unsupported_title: "不支持的格式",
    unsupported_example_label:
      "以下是一个不支持的加密分享文本示例：",

    // Buttons
    btn_parse: "解析扩展",
    btn_open: "批量打开链接",
    btn_open_delay: "延迟批量打开",

    // Delay
    delay_label: "标签页打开延迟："
  }
};

let currentLang = "en";

/* Switch language */
function setLanguage(lang) {
  if (!I18N_MESSAGES[lang]) return;
  currentLang = lang;
  localStorage.setItem("lang", lang);
  applyTranslations();
}

/* Translate key */
function t(key) {
  return I18N_MESSAGES[currentLang][key] || key;
}

/* Apply translations */
function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });
}

/* Init language */
function initI18n() {
  const saved = localStorage.getItem("lang");
  if (saved && I18N_MESSAGES[saved]) {
    currentLang = saved;
  } else {
    currentLang = navigator.language.startsWith("zh") ? "zh" : "en";
  }
  applyTranslations();
}
