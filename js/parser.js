// parser.js

const CHROMIUM_ID_REGEX = /\b[a-p]{32}\b/g;
const FIREFOX_SLUG_REGEX = /addons\.mozilla\.org\/[^/]+\/addon\/([a-z0-9\-]+)/gi;
const FIREFOX_UUID_REGEX = /\{[0-9a-fA-F\-]{36}\}/g;

export function parseExtensions(input) {
  const results = [];
  const seen = new Set();

  // ① 尝试 JSON（Chromium / Edge 导出）
  try {
    const json = JSON.parse(input);
    if (Array.isArray(json)) {
      json.forEach(item => {
        if (item.id && item.channel) {
          const browser = item.channel.toLowerCase();
          const key = `${browser}:${item.id}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({
              browser,
              id: item.id
            });
          }
        }
      });
      if (results.length) return results;
    }
  } catch {
    // 不是 JSON，继续走文本解析
  }

  // ② Chromium 扩展 ID（纯文本 / URL）
  const chromiumMatches = input.match(CHROMIUM_ID_REGEX) || [];
  chromiumMatches.forEach(id => {
    const key = `chromium:${id}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ browser: "chromium", id });
    }
  });

  // ③ Firefox slug（AMO URL）
  let match;
  while ((match = FIREFOX_SLUG_REGEX.exec(input)) !== null) {
    const slug = match[1];
    const key = `firefox:slug:${slug}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ browser: "firefox", slug });
    }
  }

  // ④ Firefox about:support UUID（TSV 表格）
  const uuidMatches = input.match(FIREFOX_UUID_REGEX) || [];
  uuidMatches.forEach(uuid => {
    const key = `firefox:uuid:${uuid}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({
        browser: "firefox",
        uuid
      });
    }
  });

  return results;
}
