import { getFirefoxLinks } from "./firefox.js";

export async function buildLinksForExtension(ext) {
  const links = [];
  const { id, browser, webStoreUrl } = ext;

  /* 官方页面 */
  if (webStoreUrl) {
    links.push({ type: "official", url: webStoreUrl });
  }

  /* Firefox */
  if (browser === "firefox") {
    const fxLinks = await getFirefoxLinks(id);
    links.push(...fxLinks);

    // Firefox CRXSoso（⚠️ 仅当有 slug）
    const slug = fxLinks.find(l => l.type === "official")?.url
      ?.split("/addon/")[1]
      ?.replace("/", "");

    if (slug) {
      links.push({
        type: "crxsoso",
        url: `https://www.crxsoso.com/firefox/detail/${slug}`
      });
    }
  }

  /* Chrome / Edge CRXSoso */
  if (browser === "chrome") {
    links.push({
      type: "crxsoso",
      url: `https://www.crxsoso.com/webstore/detail/${id}`
    });
  }

  if (browser === "edge") {
    links.push({
      type: "crxsoso",
      url: `https://www.crxsoso.com/addon/detail/${id}`
    });
  }

  return links;
}
