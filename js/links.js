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

      // Chromium
      if (ext.browser === "chromium") {
        links.push(
          {
            type: "official",
            browser: "chromium",
            url: `https://chrome.google.com/webstore/detail/${ext.id}`
          },
          {
            type: "crxsoso",
            browser: "chrome",
            url: `https://www.crxsoso.com/webstore/detail/${ext.id}`
          },
          {
            type: "crxsoso",
            browser: "edge",
            url: `https://www.crxsoso.com/addon/detail/${ext.id}`
          }
        );
      }

      // Firefox slug
      if (ext.browser === "firefox" && ext.slug) {
        links.push(
          {
            type: "official",
            browser: "firefox",
            url: `https://addons.mozilla.org/firefox/addon/${ext.slug}/`
          },
          {
            type: "crxsoso",
            browser: "firefox",
            url: `https://www.crxsoso.com/firefox/detail/${ext.slug}`
          }
        );
      }

      // Firefox UUID → v5
      if (ext.browser === "firefox" && ext.uuid) {
        const r = await resolveFirefoxByUUID(ext.uuid);
        if (r) {
          links.push(
            {
              type: "official",
              browser: "firefox",
              url: `https://addons.mozilla.org/firefox/addon/${r.slug}/`
            },
            {
              type: "crxsoso",
              browser: "firefox",
              url: `https://www.crxsoso.com/firefox/detail/${r.slug}`
            }
          );

          if (r.download) {
            links.push({
              type: "download",
              browser: "firefox",
              url: r.download
            });
          }
        }
      }

      return { ...ext, links };
    })
  );
}
