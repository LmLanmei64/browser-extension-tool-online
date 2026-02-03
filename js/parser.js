export function parseExtensions(text) {
  text = text.trim();

  /* 1️⃣ JSON（你之前的格式） */
  if (text.startsWith("[") || text.startsWith("{")) {
    try {
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : [data];
      return arr.map(normalizeJson);
    } catch {}
  }

  /* 2️⃣ Markdown（## + key: value） */
  if (text.includes("\n## ")) {
    return parseMarkdown(text);
  }

  /* 3️⃣ Firefox about:support（桌面 / Android 通吃） */
  const firefox = parseFirefoxUUIDs(text);
  if (firefox.length) return firefox;

  return [];
}

/* ---------- helpers ---------- */

function normalizeJson(item) {
  return {
    id: item.id || "",
    name: item.name || "",
    browser: normalizeChannel(item.channel),
    homepageUrl: item.homepageUrl || "",
    webStoreUrl: item.webStoreUrl || ""
  };
}

function parseMarkdown(text) {
  const blocks = text.split("\n## ").slice(1);
  return blocks.map(b => {
    const lines = b.split("\n");
    const obj = {};
    lines.forEach(l => {
      const m = l.match(/^(\w+):\s*(.*)$/);
      if (!m) return;
      const k = m[1];
      const v = m[2].trim();
      if (k === "id") obj.id = v;
      if (k === "name") obj.name = v;
      if (k === "homepage") obj.homepageUrl = v;
      if (k === "url") obj.webStoreUrl = v;
      if (k === "channel") obj.browser = normalizeChannel(v);
    });
    return obj;
  });
}

/* 🔥 关键：Firefox UUID 提取（Android / Desktop 通用） */
function parseFirefoxUUIDs(text) {
  const uuidRegex =
    /\{[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}/g;

  const matches = text.match(uuidRegex);
  if (!matches) return [];

  // 去重
  const unique = [...new Set(matches)];

  return unique.map(id => ({
    id,
    name: "",        // about:support Android 通常没法稳定拿到
    browser: "firefox"
  }));
}

function normalizeChannel(channel = "") {
  const c = channel.toLowerCase();
  if (c.includes("edge")) return "edge";
  if (c.includes("chrome")) return "chrome";
  if (c.includes("firefox")) return "firefox";
  return "chromium";
}
