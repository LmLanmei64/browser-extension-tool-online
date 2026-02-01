let finalData = [];
const CACHE_KEY = "other_store_detect_cache";

/* ================= 初始化 ================= */
document.addEventListener("DOMContentLoaded", () => {
  const inputBox = document.getElementById("inputBox");
  const outputBox = document.getElementById("outputBox");
  const errorBox = document.getElementById("errorBox");
  const parseBtn = document.getElementById("parseBtn");
  const openBtn = document.getElementById("openBtn");
  const fileInput = document.getElementById("fileInput");
  const clearCacheBtn = document.getElementById("clearCacheBtn");

  fileInput.addEventListener("change", handleFileUpload);

  clearCacheBtn.onclick = () => {
    localStorage.removeItem(CACHE_KEY);
    alert("检测缓存已清理");
  };

  parseBtn.onclick = async () => {
    errorBox.textContent = "";
    outputBox.textContent = "";

    let raw;
    try {
      raw = JSON.parse(inputBox.value.trim());
    } catch {
      errorBox.textContent = "无法解析输入内容（不是合法 JSON）";
      return;
    }

    const detect = document.getElementById("detect_other_store").checked;
    let parsed = parseFromChannel(raw);

    if (detect) {
      parsed = await detectOtherStoreExistence(parsed);
    }

    finalData = buildLinks(parsed);
    outputBox.textContent = JSON.stringify(finalData, null, 2);
  };

  openBtn.onclick = () => openLinksBySelection(finalData);
});

/* ================= 文件导入 ================= */
function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById("inputBox").value = ev.target.result;
  };
  reader.readAsText(file);
}

/* ================= channel 解析 ================= */
function parseFromChannel(list) {
  return list.map(item => {
    const channel = (item.channel || "").toLowerCase();
    const ext = { raw: item };

    if (channel === "edge" || channel === "chrome") {
      ext.family = "chromium";
      ext.platform = channel;
      ext.id = item.id;
      ext.name = item.name;
      ext.officialUrl = item.webStoreUrl;
    }

    if (channel === "firefox") {
      ext.family = "firefox
