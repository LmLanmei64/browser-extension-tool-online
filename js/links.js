// parser.js

const CHROMIUM_ID_REGEX = /\b[a-p]{32}\b/g;
const FIREFOX_SLUG_REGEX =
  /addons\.mozilla\.org\/[^/]+\/addon\/([a-z0-9\-]+)/gi;
const FIREFOX_UUID_REGEX =
  /\{[0-9a-fA-F\-]{36}\}/g;

export function parseExtensions(text) {
  const results = [];
  const seen = new Set();

  // Chromium 扩展
  const chromiumMatches = text.match(CHROMIUM_ID_REGEX) || [];
  chromiumMatches.forEach(id => {
    const key = `chromium:${id}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ browser: "chromium", id });
    }
  });

  // Firefox slug（AMO URL）
  let match;
  while ((match = FIREFOX_SLUG_REGEX.exec(text)) !== null) {
    const slug = match[1];
    const key = `firefox:slug:${slug}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ browser: "firefox", slug });
    }
  }

  // Firefox UUID（about:support）
  const uuidMatches = text.match(FIREFOX_UUID_REGEX) || [];
  uuidMatches.forEach(uuid => {
    const key = `firefox:uuid:${uuid}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ browser: "firefox", uuid });
    }
  });

  return results;
}
