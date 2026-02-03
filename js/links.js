import { resolveFirefoxAddon } from "./firefox.js";

export async function attachLinks(exts) {
  const out = [];

  for (const ext of exts) {
    const links = [];

    if (ext.homepageUrl) {
      links.push({ type: "homepage", browser: ext.browser, url: ext.homepageUrl });
    }

    if (ext.webStoreUrl) {
      links.push({ type: "official-store", browser: ext.browser, url: ext.webStoreUrl });
    }

    /* Firefox */
    if (ext.browser === "firefox" && ext.id) {
      const info = await resolveFirefoxAddon(ext.id);
      if (info) {
        links.push({
          type: "official-store",
          browser: "firefox",
          url: `https://addons.mozilla.org/firefox/addon/${info.slug}/`
        });
        if (info.downloadUrl) {
          links.push({
            type: "official-download",
            browser: "firefox",
            url: info.downloadUrl
          });
        }
        links.push({
          type: "crxsoso",
          browser: "firefox",
          url: `https://www.crxsoso.com/firefox/detail/${info.slug}`
        });
      }
    }

    /* Chromium → CRXSoso */
    if (ext.browser !== "firefox" && ext.id) {
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

    out.push({
      ...ext,
      exists: links.length > 0,
      availableLinks: links
    });
  }

  return out;
}
