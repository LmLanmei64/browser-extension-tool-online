let finalData = [];

/* ================= 初始化 ================= */

document.addEventListener("DOMContentLoaded", () => {
  const inputBox = document.getElementById("inputBox");
  const outputBox = document.getElementById("outputBox");
  const errorBox = document.getElementById("errorBox");
  const parseBtn = document.getElementById("parseBtn");
  const openBtn = document.getElementById("openBtn");
  const fileInput = document.getElementById("fileInput");

  fileInput.addEventListener("change", handleFileUpload);

  parseBtn.onclick = async () => {
    errorBox.textContent = "";
    outputBox.textContent = "";

    let raw;
    try {
      raw = JSON.parse(inputBox.value.trim());
    } catch {
      errorBox.textContent = "无法解析输入内容（不是合法 JSON）";
      return;
    }

    const parsed = parseFromChannel(raw);
    const resolved = await resolveFirefoxUUIDs(parsed);
    finalData = buildLinks(resolved);

    outputBox.textContent = JSON.stringify(finalData, null, 2);
  };

  openBtn.onclick = () => openLinksBySelection(finalData);
});

/* ================= 文件导入 ================= */

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById("inputBox").value = ev.target.result;
  };
  reader.readAsText(file);
}

/* ================= 从 channel 解析 ================= */

function parseFromChannel(list) {
  const result = [];

  for (const item of list) {
    if (!item.id || !item.channel) continue;

    const channel = item.channel.toLowerCase();

    if (channel === "edge") {
      result.push({
        family: "chromium",
        primary: "edge",
        id: item.id,
        name: item.name,
        officialUrl: item.webStoreUrl,
        source: "official"
      });
    }

    if (channel === "chrome") {
      result.push({
        family: "chromium",
        primary: "chrome",
        id: item.id,
        name: item.name,
        officialUrl: item.webStoreUrl,
        source: "official"
      });
    }

    if (channel === "firefox") {
      result.push({
        family: "firefox",
        slug: item.slug,
        uuid: item.id,
        source: "official"
      });
    }
  }

  return result;
}

/* ================= Firefox UUID → slug ================= */

async function resolveFirefoxUUIDs(list) {
  for (const ext of list) {
    if (ext.family === "firefox" && ext.uuid && !ext.slug) {
      const slug = await resolveFirefoxUUID(ext.uuid);
      if (slug) ext.slug = slug;
      else ext.unresolvable = true;
    }
  }
  return list;
}

async function resolveFirefoxUUID(uuid) {
  const encoded = encodeURIComponent(uuid);
  const url = `https://addons.mozilla.org/api/v5/addons/addon/${encoded}/`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.slug || null;
  } catch {
    return null;
  }
}

/* ================= 构建链接 ================= */

function buildLinks(list) {
  return list.map(ext => {
    const links = [];

    if (ext.family === "chromium") {
      // 主来源（来自 channel）
      links.push({
        browser: ext.primary,
        url: ext.officialUrl,
        source: ext.source,
        primary: true
      });

      // 可选：另一个 Chromium 商店
      if (ext.primary === "edge") {
        links.push({
          browser: "chrome",
          url: `https://chrome.google.com/webstore/detail/${ext.id}`,
          source: "official",
          optional: true
        });
      }

      if (ext.primary === "chrome") {
        links.push({
          browser: "edge",
          url: `https://microsoftedge.microsoft.com/addons/detail/${ext.id}`,
          source: "official",
          optional: true
        });
      }

      // 国内兜底
      links.push({
        browser: "crxsoso",
        url: `https://www.crxsoso.com/webstore/detail/${ext.id}`,
        source: "crxsoso"
      });
    }

    if (ext.family === "firefox" && ext.slug) {
      links.push({
        browser: "firefox",
        url: `https://addons.mozilla.org/firefox/addon/${ext.slug}/`,
        source: ext.source,
        primary: true
      });
      links.push({
        browser: "crxsoso",
        url: `https://www.crxsoso.com/firefox/detail/${ext.slug}`,
        source: "crxsoso"
      });
    }

    return { ...ext, links };
  });
}

/* ================= 按选择打开链接 ================= */

function openLinksBySelection(data) {
  const selectedBrowser = {
    chrome: document.getElementById("browser_chrome").checked,
    edge: document.getElementById("browser_edge").checked,
    firefox: document.getElementById("browser_firefox").checked
  };

  const selectedSource = {
    official: document.getElementById("source_official").checked,
    crxsoso: document.getElementById("source_crxsoso").checked
  };

  const urls = [];

  data.forEach(ext => {
    ext.links.forEach(link => {
      if (
        selectedBrowser[link.browser] &&
        selectedSource[link.source]
      ) {
        urls.push(link.url);
      }
    });
  });

  if (!urls.length) return;

  // 延时打开链接，避免被浏览器拦截
  setTimeout(() => {
    if (!confirm(`将打开 ${urls.length} 个链接，是否继续？`)) return;
    urls.forEach(u => window.open(u, "_blank"));
  }, 100);
}
