// parser.js

const CHROMIUM_ID_REGEX = /\b[a-p]{32}\b/g;
const FIREFOX_SLUG_REGEX = /addons\.mozilla\.org\/[^/]+\/addon\/([a-z0-9\-]+)/gi;

export function parseExtensions(text) {
  const results = [];
  const seen = new Set();

  // Chromium IDs
  const chromiumMatches = text.match(CHROMIUM_ID_REGEX) || [];
  chromiumMatches.forEach(id => {
    const key = `chromium:${id}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ browser: "chromium", id });
    }
  });

  // Firefox slugs from AMO URLs
  let match;
  while ((match = FIREFOX_SLUG_REGEX.exec(text)) !== null) {
    const slug = match[1];
    const key = `firefox:${slug}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({ browser: "firefox", slug });
    }
  }

  return results;
}
