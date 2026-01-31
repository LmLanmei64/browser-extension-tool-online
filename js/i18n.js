const I18N_MESSAGES = {
  en: {
    title: "Browser Extension Extractor",
    paste_label: "Paste extension export content:",
    paste_placeholder: "Paste about:support, extensions list, JSON, Markdown…",

    result_title: "Extracted Result",

    btn_parse: "Parse Extensions",
    btn_open: "Open Links",
    btn_open_delay: "Open With Delay",

    delay_label: "Delay between tabs:",

    source_title: "Link sources to include:",
    source_official: "Official store",
    source_crxsoso: "CRX Soso"
  },

  zh: {
    title: "浏览器扩展提取工具",
    paste_label: "粘贴扩展导出内容：",
    paste_placeholder: "可粘贴 about:support、扩展列表、JSON、Markdown…",

    result_title: "提取结果",

    btn_parse: "解析扩展",
    btn_open: "打开链接",
    btn_open_delay: "延迟打开",

    delay_label: "标签页延迟：",

    source_title: "选择要生成的链接来源：",
    source_official: "官方商店",
    source_crxsoso: "CRX 搜搜"
  }
};

let currentLang = "en";

function setLanguage(lang) {
  if (I18N_MESSAGES[lang]) {
    currentLang = lang;
    applyTranslations();
  }
}

function t(key) {
  return I18N_MESSAGES[currentLang][key] || key;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}

function initI18n() {
  currentLang = navigator.language.startsWith("zh") ? "zh" : "en";
  applyTranslations();
}