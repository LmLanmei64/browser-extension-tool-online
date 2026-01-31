let finalData = [];

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("parseBtn").onclick = parseAll;
  document.getElementById("openBtn").onclick = openSelectedLinks;
});

async function parseAll() {
  const text = document.getElementById("inputBox").value;
  const parsed = parseExtensions(text);
  const resolved = await resolveUUIDs(parsed);
  finalData = buildLinks(resolved);
  document.getElementById("outputBox").textContent =
    JSON.stringify(finalData, null, 2);
}

/* ================= 解析插件 ================= */

function parseExtensions(text) {
  const list = [];

  // Chromium
  (text.match(/\b[a-p]{32}\b/g) || []).forEach(id => {
    list.push({ family: "chromium", id });
  });

  // Firefox slug@domain
  (text.match(/\b([a-z0-9-]+)@[a-z0-9.-]+\b/gi) || []).forEach(m => {
    if (!m.endsWith("@mozac.org")) {
      list.push({ family: "firefox", slug: m.split("@")[0] });
    }
  });

  // Firefox UUID
  (text.match(/\{[0-9a-fA-F-]{36}\}/g) || []).forEach(uuid => {
    list.push({ family: "firefox", uuid, needsResolve: true });
  });

  return list;
}

/* ================= UUID → slug ================= */

async function resolveUUIDs(list) {
  for (const ext of list) {
    if (ext.needsResolve) {
      const data = await fetch(
        `https://addons.mozilla.org/api/v5/addons/addon/${ext.uuid.replace(/[{}]/g,"")}/`
      ).then(r => r.ok ? r.json() : null);

      if (data?.slug) ext.slug = data.slug;
      else if (data?.url)
        ext.slug = data.url.split("/addon/")[1]?.replace("/", "");
    }
  }
  return list;
}

/* ================= 构建链接（按浏览器分类） ================= */

function buildLinks(list) {
  return list.map(ext => {
    const links = [];

    if (ext.family === "chromium") {
      links.push(
        { browser: "chrome", url: `https://chrome.google.com/webstore/detail/${ext.id}` },
        { browser: "edge", url: `https://microsoftedge.microsoft.com/addons/detail/${ext.id}` },
        { browser: "chrome", url: `https://www.crxsoso.com/webstore/detail/${ext.id}` },
        { browser: "edge", url: `https://www.crxsoso.com/addon/detail/${ext.id}` }
      );
    }

    if (ext.family === "firefox" && ext.slug) {
      links.push(
        { browser: "firefox", url: `https://addons.mozilla.org/firefox/addon/${ext.slug}/` },
        { browser: "firefox", url: `https://www.crxsoso.com/firefox/detail/${ext.slug}` }
      );
    }

    return { ...ext, links };
  });
}

/* ================= 打开符合用户选择的链接 ================= */

function openSelectedLinks() {
  const use = {
    chrome: document.getElementById("brChrome").checked,
    edge: document.getElementById("brEdge").checked,
    firefox: document.getElementById("brFirefox").checked,
    official: document.getElementById("srcOfficial").checked,
    crx: document.getElementById("srcCrx").checked
  };

  const urls = [];

  finalData.forEach(ext => {
    ext.links.forEach(l => {
      if (!use[l.browser]) return;
      if (!use.official && l.url.includes("google.com")) return;
      if (!use.crx && l.url.includes("crxsoso")) return;
      urls.push(l.url);
    });
  });

  urls.forEach(u => window.open(u, "_blank"));
}
