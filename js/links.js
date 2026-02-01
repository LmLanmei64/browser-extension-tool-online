// links.js

async function resolveFirefoxByUUID(uuid) {
  const url = `https://addons.mozilla.org/api/v5/addons/addon/${encodeURIComponent(uuid)}/`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    return {
      slug: data.slug,
      downloadUrl: data.current_version?.file?.url || null
    };
  } catch {
    return null;
  }
}

export async function buildDownloadLinks(ext) {
  const links = [];

  // Chromium
  if (ext.browser === "chromium" && ext.id) {
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

  // Firefox（slug 已知）
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

  // Firefox（只有 uuid）
  if (ext.browser === "firefox" && ext.uuid && !ext.slug) {
    const resolved = await resolveFirefoxByUUID(ext.uuid);
    if (resolved) {
      links.push(
        {
          type: "official",
          browser: "firefox",
          url: `https://addons.mozilla.org/firefox/addon/${resolved.slug}/`
        }
      );
      if (resolved.downloadUrl) {
        links.push({
          type: "download",
          browser: "firefox",
          url: resolved.downloadUrl
        });
      }
    }
  }

  return links;
}

export async function attachLinks(extList) {
  return Promise.all(
    extList.map(async ext => ({
      ...ext,
      links: await buildDownloadLinks(ext)
    }))
  );
}
