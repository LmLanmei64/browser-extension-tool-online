export async function attachLinks(list) {
  return list.map(ext => {
    const links = [];

    /* ========== Chromium ========== */
    if (ext.browser === "chromium" && ext.id) {
      // 官方商店页
      links.push(
        {
          type: "official-page",
          browser: "chrome",
          url: `https://chrome.google.com/webstore/detail/${ext.id}`
        },
        {
          type: "official-page",
          browser: "edge",
          url: `https://microsoftedge.microsoft.com/addons/detail/${ext.id}`
        }
      );

      // CRXSoso（用于检测存在）
      links.push(
        {
          type: "crxsoso-page",
          browser: "chrome",
          url: `https://www.crxsoso.com/webstore/detail/${ext.id}`
        },
        {
          type: "crxsoso-page",
          browser: "edge",
          url: `https://www.crxsoso.com/addon/detail/${ext.id}`
        }
      );
    }

    /* ========== Firefox ========== */
    if (ext.browser === "firefox" && ext.slug) {
      links.push(
        {
          type: "official-page",
          browser: "firefox",
          url: `https://addons.mozilla.org/firefox/addon/${ext.slug}/`
        },
        {
          type: "official-download",
          browser: "firefox",
          url: `https://addons.mozilla.org/firefox/downloads/latest/${ext.slug}/addon.xpi`
        },
        {
          type: "crxsoso-page",
          browser: "firefox",
          url: `https://www.crxsoso.com/firefox/detail/${ext.slug}`
        }
      );
    }

    return { ...ext, links };
  });
}
