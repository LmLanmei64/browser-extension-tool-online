// js/firefox.js

export async function getFirefoxLinks(uuid) {
  const links = [];

  // ⚠️ 重要：uuid 必须包含 {}
  const apiUrl = `https://addons.mozilla.org/api/v5/addons/addon/${uuid}/`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      // 查不到就是查不到，不做任何 fallback
      return [];
    }

    const data = await res.json();

    const slug = data.slug;
    const detailUrl = `https://addons.mozilla.org/firefox/addon/${slug}/`;
    const downloadUrl = data.current_version?.file?.url;

    if (detailUrl) {
      links.push({
        type: "official",
        url: detailUrl
      });
    }

    if (downloadUrl) {
      links.push({
        type: "download",
        url: downloadUrl
      });
    }

  } catch {
    // 明确语义：失败 = 无结果
    return [];
  }

  return links;
}
