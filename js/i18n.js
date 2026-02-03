const I18N_MESSAGES = {
  en: {
    title: "Browser Extension Extractor",
    paste_label: "Paste extension export content:",
    paste_placeholder: "Paste about:support, extensions list, JSON, Markdown…",
    btn_parse: "Parse Extensions",
    btn_open: "Open Links",
    source_title: "Link sources to include:",
    source_homepage: "Homepage",
    source_official: "Official store",
    source_download: "Direct download (Firefox only)",
    source_crxsoso: "CRX Soso",
    source_firefox_page: "Firefox Plugin Page",
    source_firefox_download: "Firefox Direct Download"
  },

  zh: {
    title: "浏览器扩展提取工具",
    paste_label: "粘贴扩展导出内容：",
    paste_placeholder: "可粘贴 about:support、扩展列表、JSON、Markdown…",
    btn_parse: "解析扩展",
    btn_open: "打开链接",
    source_title: "选择要生成的链接来源：",
    source_homepage: "主页",
    source_official: "官方商店",
    source_download: "直接下载（仅 Firefox）",
    source_crxsoso: "CRX 搜搜",
    source_firefox_page: "Firefox 插件页",
    source_firefox_download: "Firefox 直接下载"
  }
};

let currentLang = "en";

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
