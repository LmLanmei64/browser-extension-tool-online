const CHROMIUM_ID_REGEX = /\b[a-p]{32}\b/g;
const FIREFOX_SLUG_REGEX =
  /addons\.mozilla\.org\/[^/]+\/addon\/([a-z0-9\-]+)/gi;
const FIREFOX_UUID_REGEX =
  /\{[0-9a-fA-F\-]{36}\}/g;

export function parseExtensions(text) {
  const results = [];
  const seen = new Set();

  const push = (obj, key) => {
    if (!seen.has(key)) {
      seen.add(key);
      results.push(obj);
    }
  };

  // Chromium
  (text.match(CHROMIUM_ID_REGEX) || []).forEach(id =>
    push({ browser: "chromium", id }, `c:${id}`)
  );

  // Firefox slug
  let m;
  while ((m = FIREFOX_SLUG_REGEX.exec(text))) {
    push({ browser: "firefox", slug: m[1] }, `fslug:${m[1]}`);
  }

  // Firefox UUID（about:support）
  (text.match(FIREFOX_UUID_REGEX) || []).forEach(uuid =>
    push({ browser: "firefox", uuid }, `fuuid:${uuid}`)
  );

  return results;
}
