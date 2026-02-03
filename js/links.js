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

