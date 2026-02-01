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
  finalData = buildLinks(parsed);

  output.textContent = JSON.stringify(finalData, null, 2);
};

document.getElementById("openBtn").onclick = () => openLinks(finalData);

/* ===== 解析 ===== */

function parseFromChannel(list) {
  return list.map(item => ({
    id: item.id,
    name: item.name,
    platform: item.channel.toLowerCase(),
    officialUrl: item.webStoreUrl,
    existsInEdge: false,
    existsInChrome: false
  }));
}

/* ===== 弱检测（不 await，不阻塞） ===== */

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

/* ===== 构建链接 + 状态 ===== */

function buildLinks(list) {
  return list.map(ext => {
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
      url: ext.officialUrl
    });

    links.push({
      source: "crxsoso",
      platform: ext.platform,
      url:
        ext.platform === "edge"
          ? `https://www.crxsoso.com/addon/detail/${ext.id}`
          : `https://www.crxsoso.com/webstore/detail/${ext.id}`
    });

    return {
      id: ext.id,
      name: ext.name,
      platform: ext.platform,
      platformStatus: status,
      links
    };
  });
}

/* ===== 打开链接 ===== */

function openLinks(data) {
  const sb = {
    edge: browser_edge.checked,
    chrome: browser_chrome.checked,
    firefox: browser_firefox.checked
  };
  const ss = {
    official: source_official.checked,
    crxsoso: source_crxsoso.checked
  };

  data.forEach(ext => {
    ext.links.forEach(link => {
      if (sb[link.platform] && ss[link.source]) {
        window.open(link.url, "_blank");
      }
    });
  });
}
