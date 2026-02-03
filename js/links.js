export function attachLinks(exts) {
  return exts.map(ext => {
    const links = [];

    /* Homepage */
    if (ext.homepageUrl) {
      links.push({
        type: "homepage",
        browser: ext.browser,
        url: ext.homepageUrl
      });
    }

    /* 官方商店（直接使用已有 URL） */
    if (ext.webStoreUrl) {
      links.push({
        type: "official-store",
        browser: ext.browser,
        url: ext.webStoreUrl
      });
    }

    /* CRXSoso（⚠️ 正确路径） */
    if (ext.id) {
      if (ext.browser === "chrome" || ext.browser === "chromium") {
        links.push({
          type: "crxsoso",
          browser: "chrome",
          url: `https://www.crxsoso.com/webstore/detail/${ext.id}`
        });
      }

      if (ext.browser === "edge" || ext.browser === "chromium") {
        links.push({
          type: "crxsoso",
          browser: "edge",
          url: `https://www.crxsoso.com/addon/detail/${ext.id}`
        });
      }
    }

    return {
      ...ext,
      exists: links.length > 0,
      availableLinks: links
    };
  });
}
