// js/opener.js

export function openLinks(urls, options = {}) {
  const {
    confirmOpen = true
  } = options;

  if (!urls.length) return;

  if (confirmOpen) {
    const ok = confirm(`将打开 ${urls.length} 个链接，是否继续？`);
    if (!ok) return;
  }

  // ✅ 关键：同步创建窗口
  const tabs = urls.map(() => window.open("about:blank", "_blank"));

  // 如果被浏览器拦截
  if (tabs.some(t => !t)) {
    alert("浏览器拦截了弹窗，请允许弹窗后再试");
    return;
  }

  // 再填充真实 URL
  urls.forEach((url, i) => {
    tabs[i].location.href = url;
  });
}
