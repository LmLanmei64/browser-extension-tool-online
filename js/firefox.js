export async function resolveFirefoxAddon(uuid) {
  const api =
    `https://addons.mozilla.org/api/v5/addons/addon/${encodeURIComponent(uuid)}/`;

  const res = await fetch(api);
  if (!res.ok) return null;

  const data = await res.json();
  return {
    slug: data.slug,
    downloadUrl: data.current_version?.file?.url || ""
  };
}
