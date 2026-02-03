export async function getFirefoxLinks(uuid) {
  const links = [];

  // 去掉 {}
  const cleanId = uuid.replace(/^\{|\}$/g, "");

  const apiUrl = `https://addons.mozilla.org/api/v5/addons/addon/${cleanId}/`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) return [];

    const data = await res.json();

    const slug = data.slug;
    const detailUrl = `https://addons.mozilla.org/firefox/addon/${slug}/`;
    const downloadUrl = data.current_version?.file?.url;

    if (detailUrl) {
      links.push({ type: "official", url: detailUrl });
    }

    if (downloadUrl) {
      links.push({ type: "download", url: downloadUrl });
    }

  } catch {
    // 明确：查不到就什么都不给
    return [];
  }

  return links;
}
