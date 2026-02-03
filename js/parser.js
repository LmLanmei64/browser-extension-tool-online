export function parseExtensions(text) {
  text = text.trim();

  // JSON 输入
  if (text.startsWith("[") || text.startsWith("{")) {
    try {
      const data = JSON.parse(text);
      return data.map(item => ({
        id: item.id || "",
        name: item.name || "",
        browser: normalizeChannel(item.channel),
        homepageUrl: item.homepageUrl || "",
        webStoreUrl: item.webStoreUrl || ""
      }));
    } catch {
      // 继续走Markdown或表格解析
    }
  }

  // Markdown 解析
  if (text.startsWith("##")) {
    return parseMarkdown(text);
  }

  // 解析 about:support 表格（待扩展）
  return [];
}

// Markdown 格式解析
function parseMarkdown(text) {
  const lines = text.split("\n");
  const extensions = [];
  let current = {};

  lines.forEach(line => {
    if (line.startsWith("##")) {
      if (current.name) extensions.push(current);
      current = { name: line.replace("##", "").trim() };
    } else if (line.startsWith("id:")) {
      current.id = line.replace("id:", "").trim();
    } else if (line.startsWith("homepage:")) {
      current.homepageUrl = line.replace("homepage:", "").trim();
    } else if (line.startsWith("url:")) {
      current.webStoreUrl = line.replace("url:", "").trim();
    } else if (line.startsWith("channel:")) {
      current.browser = normalizeChannel(line.replace("channel:", "").trim());
    }
  });

  if (current.name) extensions.push(current);
  return extensions;
}

function normalizeChannel(channel = "") {
  const c = channel.toLowerCase();
  if (c.includes("edge")) return "edge";
  if (c.includes("chrome")) return "chrome";
  if (c.includes("firefox")) return "firefox";
  return "chromium";
}
