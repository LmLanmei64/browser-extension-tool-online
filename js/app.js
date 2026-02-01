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

    const needsDetect = document.getElementById("detect_other_store").checked;

    let parsed = parseFromChannel(raw);

    if (needsDetect) {
      parsed = await detectOtherStoreExistence(parsed);
    }

    finalData = buildLinks(parsed);
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
  return list.map(item => {
    const channel = (item.channel || "").toLowerCase();
    const ext = { raw: item };

    if (channel === "edge" || channel === "chrome") {
      ext.family = "chromium";
      ext.platform = channel;
      ext.id = item.id;
      ext.name = item.name;
      ext.officialUrl = item.webStoreUrl;
    }

    if (channel === "firefox") {
      ext.family = "firefox";
      ext.platform = "firefox";
      ext.uuid = item.id;
    }

    return ext;
  });
}

/* ================= 检测另一个商店是否存在 ================= */
async function detectOtherStoreExistence(list) {
  const timeout = ms => new Promise(res => setTimeout(res, ms));

  for (const ext of list) {
    if (ext.family === "chromium") {
      // detect chrome store if this is edge
      if (ext.platform === "edge") {
        const chromeUrl = `https://chrome.google.com/webstore/detail/${ext.id}`;
        ext.existsInChrome = await checkExist(chromeUrl);
      }
      if (ext.platform === "chrome") {
        const edgeUrl = `https://microsoftedge.microsoft.com/addons/detail/${ext.id}`;
        ext.existsInEdge = await checkExist(edgeUrl);
      }
      await timeout(200); // 不要太快
    }
    // firefox skip
  }

  return list;
}

async function checkExist(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

/* ================= 构建链接集合 ================= */
function buildLinks(list) {
  return list.map(ext => {
    const links = [];
    const status = {};

    if (ext.family === "chromium") {
      // 官方商店
      links.push({
        source: "official",
        platform: ext.platform,
        browser: ext.platform,
        url: ext.officialUrl
      });

      // CRXSoso
      const crxPath =
        ext.platform === "edge"
          ? `https://www.crxsoso.com/addon/detail/${ext.id}`
          : `https://www.crxsoso.com/webstore/detail/${ext.id}`;

      links.push({
        source: "crxsoso",
        platform: ext.platform,
        url: crxPath
      });

      // 平台状态
      if (ext.platform === "edge") {
        if (ext.existsInChrome) status.platformStatus = "dual";
        else status.platformStatus = "edge-only";
      }
      if (ext.platform === "chrome") {
        if (ext.existsInEdge) status.platformStatus = "dual";
        else status.platformStatus = "chrome-only";
      }
      ext.platformStatus = status.platformStatus;
      ext.existsInChrome = !!ext.existsInChrome;
      ext.existsInEdge = !!ext.existsInEdge;
    }

    if (ext.family === "firefox") {
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
      ext.platformStatus = "firefox";
    }

    return { ...ext, links };
  });
}

/* ================= 打开链接 ================= */
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
      // CRXSoso 只判断来源和 platform
      if (
        link.source === "crxsoso" &&
        selectedSource.crxsoso &&
        selectedBrowser[link.platform]
      ) {
        urls.push(link.url);
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
