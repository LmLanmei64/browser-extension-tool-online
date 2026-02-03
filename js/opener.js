// js/opener.js

export function openLinks(urls, options = {}) {
  const {
    delay = 0,
    confirmOpen = true
  } = options;

  if (!urls.length) return;

  if (confirmOpen) {
    const ok = confirm(`将打开 ${urls.length} 个链接，是否继续？`);
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
