// js/parser.js

export function parseExtensions(text) {
  text = text.trim();
  if (!text) return [];

  const results = [];

  /* 1️⃣ JSON（数组 / 单对象，混在文本里也没关系） */
  results.push(...parseJsonLoose(text));

  /* 2️⃣ Markdown（## block） */
  results.push(...parseMarkdownLoose(text));

  /* 3️⃣ Firefox about:support（桌面 + Android，UUID 扫描） */
  results.push(...parseFirefoxUUIDs(text));

  /* 4️⃣ 合并 + 去重 */
  return dedupe(results);
}

/* ---------- JSON（宽松） ---------- */
function parseJsonLoose(text) {
  try {
    const data = JSON.parse(text);
    const arr = Array.isArray(data) ? data : [data];
    return arr.map(normalizeJson);
  } catch {
    return [];
  }
}

function normalizeJson(item) {
  return {
    id: item.id || "",
    name: item.name || "",
    homepageUrl: item.homepageUrl || "",
    webStoreUrl: item.webStoreUrl || "",
    browser: normalizeChannel(item.channel)
  };
}

/* ---------- Markdown ---------- */
function parseMarkdownLoose(text) {
  if (!text.includes("\n## ")) return [];

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
  }).filter(x => x.id);
}

/* ---------- Firefox UUID（最稳） ---------- */
function parseFirefoxUUIDs(text) {
  const uuidRegex =
    /\{[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}/g;

  const matches = text.match(uuidRegex);
  if (!matches) return [];

  const unique = [...new Set(matches)];

  return unique.map(id => ({
    id,
    name: "",
    browser: "firefox"
  }));
}

/* ---------- 去重（核心） ---------- */
function dedupe(items) {
  const map = new Map();

  for (const item of items) {
    if (!item.id || !item.browser) continue;

    const key = `${item.browser}:${item.id}`;

    if (!map.has(key)) {
      map.set(key, item);
    } else {
      // 合并信息（已有的不覆盖）
      const existing = map.get(key);
      map.set(key, {
        ...existing,
        ...item,
        name: existing.name || item.name,
        homepageUrl: existing.homepageUrl || item.homepageUrl,
        webStoreUrl: existing.webStoreUrl || item.webStoreUrl
      });
    }
  }

  return [...map.values()];
}

function normalizeChannel(channel = "") {
  const c = channel.toLowerCase();
  if (c.includes("edge")) return "edge";
  if (c.includes("chrome")) return "chrome";
  if (c.includes("firefox")) return "firefox";
  return "chromium";
}
