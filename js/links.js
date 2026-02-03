export function attachLinks(exts) {
  return exts.map(ext => {
    const links = [];

    if (ext.homepageUrl) {
      links.push({
        type: "homepage",
        browser: ext.browser,
        url: ext.homepageUrl
      });
    }

    if (ext.webStoreUrl) {
      links.push({
        type: "official-store",
        browser: ext.browser,
        url: ext.webStoreUrl
      });
    }

    if (ext.id) {
      links.push({
        type: "crxsoso",
        browser: ext.browser,
        url: `https://www.crxsoso.com/store/detail/${ext.id}`
      });
    }

    return {
      ...ext,
      exists: links.length > 0,
      availableLinks: links
    };
  });
}