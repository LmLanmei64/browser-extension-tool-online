async function resolveFirefoxByUUID(uuid) {
  const url =
    `https://addons.mozilla.org/api/v5/addons/addon/${encodeURIComponent(uuid)}/`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return {
    slug: data.slug,
    download: data.current_version?.file?.url
  };
}

export async function attachLinks(list) {
  return Promise.all(
    list.map(async ext => {
      const links = [];

      // Chromium → Chrome + Edge
      if (ext.browser === "chromium" && ext.id) {
        links.push({
          type: "official-page",
          browser: "chrome",
          url: `https://chrome.google.com/webstore/detail/${ext.id}`
        });
        links.push({
          type: "official-page",
          browser: "edge",
          url: `https://microsoftedge.microsoft.com/addons/detail/${ext.id}`
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

      // Firefox
      if (ext.browser === "firefox") {
        let slug = ext.slug;
        let download = null;

        if (ext.uuid) {
          const r = await resolveFirefoxByUUID(ext.uuid);
          if (r) {
            slug = r.slug;
            download = r.download;
          }
        }

        if (slug) {
          links.push({
            type: "official-page",
            browser: "firefox",
            url: `https://addons.mozilla.org/firefox/addon/${slug}/`
          });
          links.push({
            type: "crxsoso",
            browser: "firefox",
            url: `https://www.crxsoso.com/firefox/detail/${slug}`
          });
        }

        if (download) {
          links.push({
            type: "official-download",
            browser: "firefox",
            url: download
          });
        }
      }

      return { ...ext, links };
    })
  );
}
