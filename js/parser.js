// parser.js

const CHROMIUM_ID_REGEX = /\b[a-p]{32}\b/g;
const FIREFOX_SLUG_REGEX = /addons\.mozilla\.org\/[^/]+\/addon\/([a-z0-9\-]+)/gi;
const FIREFOX_UUID_REGEX = /\{[0-9a-fA-F\-]{36}\}/g;  // 增加对 UUID 的匹配

export function parseExtensions(text) {
  const results = [];
  const seen = new Set();

  // 解析 Chromium ID
  const chromiumMatches = text.match(CHROMIUM_ID_REGEX) || [];
  chromiumMatches.forEach(id => {
    const key = `chromium:${id}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ browser: "chromium", id });
    }
  });

  // 解析 Firefox AMO URL 中的 slug
  let match;
  while ((match = FIREFOX_SLUG_REGEX.exec(text)) !== null) {
    const slug = match[1];
    const key = `firefox:slug:${slug}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ browser: "firefox", slug });
    }
  }

  // 解析 Firefox about:support 表格中的 UUID
  const uuidMatches = text.match(FIREFOX_UUID_REGEX) || [];
  uuidMatches.forEach(uuid => {
    const key = `firefox:uuid:${uuid}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ browser: "firefox", uuid });  // 保存 UUID 以便后续 API 请求
    }
  });

  return results;
}
