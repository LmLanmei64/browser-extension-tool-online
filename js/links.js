import { getFirefoxLinks } from "./firefox.js";

export async function buildLinksForExtension(ext) {
  const links = [];

  const { id, homepageUrl, webStoreUrl, browser } = ext;

  /* Homepage */
  if (homepageUrl) {
    links.push({ type: "homepage", url: homepageUrl });
  }

  /* Official store */
  if (webStoreUrl) {
    links.push({ type: "official", url: webStoreUrl });
  }

  /* 🔥 Direct download */
  if (browser === "chrome" || browser === "edge" || browser === "chromium") {
    links.push({
      type: "download",
      url: buildChromeDownloadUrl(id)
    });
  }

  if (browser === "firefox") {
    const firefoxLinks = await getFirefoxLinks(id);
    links.push(...firefoxLinks);
  }

  /* CRX 搜搜 */
  if (id && (browser === "chrome" || browser === "edge" || browser === "chromium")) {
    links.push({
      type: "crxsoso",
      url: `https://www.crxsoso.com/webstore/detail/${id}`
    });
  }

  return links;
}

function buildChromeDownloadUrl(id) {
  return (
    "https://clients2.google.com/service/update2/crx" +
    "?response=redirect" +
    "&prodversion=114.0" +
    "&acceptformat=crx3" +
    "&x=id%3D" + id + "%26uc"
  );
}
