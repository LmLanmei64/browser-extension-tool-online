let finalData = [];

document.getElementById("parseBtn").onclick = async () => {
  const input = document.getElementById("inputBox").value;
  const detect = document.getElementById("detect_other_store").checked;
  const output = document.getElementById("outputBox");

  let raw;
  try {
    raw = JSON.parse(input);
  } catch {
    output.textContent = "JSON 解析失败";
    return;
  }

  const parsed = parseFromChannel(raw);
  if (detect) weakDetectOtherStore(parsed);
  finalData = await buildLinks(parsed);  // 需要改成异步处理

  output.textContent = JSON.stringify(finalData, null, 2);
};

document.getElementById("openBtn").onclick = () => openLinks(finalData);

function parseFromChannel(list) {
  return list
    .filter(item => item.type !== "app-builtin")  // 排除系统插件
    .map(item => ({
      id: item.id,
      name: item.name,
      platform: item.channel.toLowerCase(),
      officialUrl: item.webStoreUrl,
      existsInEdge: false,
      existsInChrome: false,
      existsInFirefox: false  // Firefox 支持
    }));
}

// 弱检测（不阻塞）
function weakDetectOtherStore(list) {
  list.forEach(ext => {
    if (ext.platform === "edge") {
      fetch(`https://chrome.google.com/webstore/detail/${ext.id}`, { mode: "no-cors" })
        .then(() => ext.existsInChrome = true)
        .catch(() => {});
    }
    if (ext.platform === "chrome") {
      fetch(`https://microsoftedge.microsoft.com/addons/detail/${ext.id}`, { mode: "no-cors" })
        .then(() => ext.existsInEdge = true)
        .catch(() => {});
    }
  });
}

async function resolveFirefoxDownloadLink(uuid) {
  const url = `https://addons.mozilla.org/api/v5/addons/addon/${encodeURIComponent(uuid)}/`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.slug ? `https://addons.mozilla.org/firefox/downloads/file/${data.current_version.file.id}` : null;
  } catch {
    return null;
  }
}

async function buildLinks(list) {
  return Promise.all(
    list.map(async (ext) => {
      let status = "unknown";
      if (ext.platform === "edge") {
        status = ext.existsInChrome ? "dual" : "edge-only";
      }
      if (ext.platform === "chrome") {
        status = ext.existsInEdge ? "dual" : "chrome-only";
      }

      const links = [];

      links.push({
        source: "official",
        platform: ext.platform,
        url: ext.officialUrl,
      });

      links.push({
        source: "crxsoso",
        platform: ext.platform,
        url:
          ext.platform === "edge"
            ? `https://www.crxsoso.com/addon/detail/${ext.id}`
            : `https://www.crxsoso.com/webstore/detail/${ext.id}`,
      });

      if (ext.platform === "firefox") {
        const firefoxDownloadLink = await resolveFirefoxDownloadLink(ext.id);
        if (firefoxDownloadLink) {
          links.push({
            source: "official",
            platform: "firefox",
            url: firefoxDownloadLink,
          });
        }
      }

      return {
        id: ext.id,
        name: ext.name,
        platform: ext.platform,
        platformStatus: status,
        links,
      };
    })
  );
}

function openLinks(data) {
  const sb = {
    edge: document.getElementById("browser_edge").checked,
    chrome: document.getElementById("browser_chrome").checked,
    firefox: document.getElementById("browser_firefox").checked
  };
  const ss = {
    official: document.getElementById("source_official").checked,
    crxsoso: document.getElementById("source_crxsoso").checked
  };

  data.forEach(ext => {
    ext.links.forEach(link => {
      if (sb[link.platform] && ss[link.source]) {
        window.open(link.url, "_blank");
      }
    });
  });
}
