// js/parser.js

const CHROMIUM_ID_REGEX = /\b[a-p]{32}\b/g;
const FIREFOX_UUID_REGEX = /\{[0-9a-fA-F\-]{36}\}/g;
const FIREFOX_SLUG_REGEX =
  /addons\.mozilla\.org\/[^/]+\/addon\/([a-z0-9\-]+)/gi;

export function parseExtensions(text) {
  const results = [];
  const seen = new Set();

  const push = (obj, key) => {
    if (!seen.has(key)) {
      seen.add(key);
      results.push(obj);
    }
  };

  // Firefox UUID（about:support）
  (text.match(FIREFOX_UUID_REGEX) || []).forEach(uuid => {
    push({ browser: "firefox", uuid }, `firefox:${uuid}`);
  });

  // Firefox slug（URL）
  let m;
  while ((m = FIREFOX_SLUG_REGEX.exec(text))) {
    push({ browser: "firefox", slug: m[1] }, `firefox-slug:${m[1]}`);
  }

  // Chromium ID（无法判断来源，先标记为 chromium）
  (text.match(CHROMIUM_ID_REGEX) || []).forEach(id => {
    push({ browser: "chromium", id }, `chromium:${id}`);
  });

  return results;
}
