export function parseExtensions(text) {
  text = text.trim();

  // JSON
  if (text.startsWith("[") || text.startsWith("{")) {
    try {
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : [data];
      return arr.map(normalizeJson);
    } catch {}
  }

  // Markdown（## + key: value）
  if (text.includes("\n## ")) {
    return parseMarkdown(text);
  }

  // about:support（Firefox）
  if (text.includes("extensions.json")) {
    return parseAboutSupport(text);
  }

  return [];
}

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

function parseAboutSupport(text) {
  try {
    const json = JSON.parse(text);
    return json.addons.map(a => ({
      id: a.id,               // UUID
      name: a.name,
      browser: "firefox"
    }));
  } catch {
    return [];
  }
}

function normalizeChannel(channel = "") {
  const c = channel.toLowerCase();
  if (c.includes("edge")) return "edge";
  if (c.includes("chrome")) return "chrome";
  if (c.includes("firefox")) return "firefox";
  return "chromium";
}
