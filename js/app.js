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

    if (channel === "edge" || channel === "chrome") {
      result.push({
        family: "chromium",
        platform: channel,        // 🔥 关键：edge / chrome
        id: item.id,
        name: item.name,
        officialUrl: item.webStoreUrl
      });
    }

    if (channel === "firefox") {
      result.push({
        family: "firefox",
        platform: "firefox",
        uuid: item.id
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

    /* ---------- Chromium ---------- */
    if (ext.family === "chromium") {
      // 官方链接
      links.push({
        source: "official",
        platform: ext.platform,
        browser: ext.platform,
        url: ext.officialUrl
      });

      // CRXSoso（按 platform 区分路径）
      links.push({
        source: "crxsoso",
        platform: ext.platform,
        url:
          ext.platform === "edge"
            ? `https://www.crxsoso.com/edge/detail/${ext.id}`
            : `https://www.crxsoso.com/webstore/detail/${ext.id}`
      });
    }

    /* ---------- Firefox ---------- */
    if (ext.family === "firefox" && ext.slug) {
      links.push({
        source: "official",
        platform: "firefox",
        browser: "firefox",
        url: `https://addons.mozilla.org/firefox/addon/${ext.slug}/`
      });

      links.push({
        source: "crxsoso",
        platform: "firefox",
        url: `https://www.crxsoso.com/firefox/detail/${ext.slug}`
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
      // CRXSoso：按 platform 过滤
      if (link.source === "crxsoso") {
        if (
          selectedSource.crxsoso &&
          selectedBrowser[link.platform]
        ) {
          urls.push(link.url);
        }
        return;
      }

      // 官方
      if (
        link.source === "official" &&
        selectedSource.official &&
        selectedBrowser[link.browser]
      ) {
        urls.push(link.url);
      }
    });
  });

  if (!urls.length) {
    alert("没有符合条件的链接");
    return;
  }

  if (!confirm(`将打开 ${urls.length} 个链接，是否继续？`)) return;
  urls.forEach(u => window.open(u, "_blank"));
}
