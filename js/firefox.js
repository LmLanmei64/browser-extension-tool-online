export async function getFirefoxLinks(uuid) {
  const links = [];

  // 去掉大括号
  const cleanId = uuid.replace(/^\{|\}$/g, "");

  const apiUrl = `https://addons.mozilla.org/api/v5/addons/addon/${cleanId}/`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("AMO lookup failed");
    const data = await res.json();

    const slug = data.slug;
    const detailUrl = `https://addons.mozilla.org/firefox/addon/${slug}/`;
    const downloadUrl = data.current_version?.file?.url;

    if (detailUrl) links.push({ type: "official", url: detailUrl });
    if (downloadUrl) links.push({ type: "download", url: downloadUrl });

  } catch (e) {
    // fallback：至少给一个搜索页
    links.push({
      type: "official",
      url: `https://addons.mozilla.org/firefox/search/?q=${encodeURIComponent(cleanId)}`
    });
  }

  return links;
}
