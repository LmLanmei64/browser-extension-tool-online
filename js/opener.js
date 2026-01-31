// opener.js

export function openLinks(extensions, options = {}) {
  const {
    delay = 0,
    confirmOpen = true
  } = options;

  const urls = [];

  extensions.forEach(ext => {
    (ext.links || []).forEach(link => {
      urls.push(link.url);
    });
  });

  if (!urls.length) return;

  if (confirmOpen) {
    const ok = confirm(`Open ${urls.length} links in new tabs?`);
    if (!ok) return;
  }

  urls.forEach((url, index) => {
    if (delay > 0) {
      setTimeout(() => window.open(url, "_blank"), index * delay);
    } else {
      window.open(url, "_blank");
    }
  });
}
