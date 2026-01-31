// links.js

export function buildDownloadLinks(ext) {
  const links = [];

  if (ext.browser === "chromium" && ext.id) {
    links.push({
      type: "official",
      browser: "chromium",
      url: `https://chrome.google.com/webstore/detail/${ext.id}`
    });

    links.push({
      type: "crxsoso",
      browser: "chrome",
      url: `https://www.crxsoso.com/webstore/detail/${ext.id}`
    });

    links.push({
      type: "crxsoso",
      browser: "edge",
      url: `https://www.crxsoso.com/addon/detail/${ext.id}`
    });
  }

  if (ext.browser === "firefox" && ext.slug) {
    links.push({
      type: "official",
      browser: "firefox",
      url: `https://addons.mozilla.org/firefox/addon/${ext.slug}/`
    });

    links.push({
      type: "crxsoso",
      browser: "firefox",
      url: `https://www.crxsoso.com/firefox/detail/${ext.slug}`
    });
  }

  return links;
}

export function attachLinks(extList) {
  return extList.map(ext => ({
    ...ext,
    links: buildDownloadLinks(ext)
  }));
}
