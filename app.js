// === 設定區 ===
// 1) 換上你的 LIFF ID
const LIFF_ID = "2007902888-jO3BK106";
// 2) 換上你的 Google Apps Script 部署網址（Web App）
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwQs4I5HeQQcSJ6Ev56SXdqJK5l8krv2afuM1S12OvKBF4Bm6F6SD3mnLPia1jSGJSY7A/exec";

// === 主要流程 ===
document.addEventListener("DOMContentLoaded", async () => {
  setDefaultDate();
  bindButtons();
  await initLIFF();
});

function setDefaultDate() {
  const d = new Date();
  const iso = d.toISOString().slice(0,10);
  document.getElementById("date").value = iso;
}

function bindButtons() {
  document.getElementById("submitBtn").addEventListener("click", submitDiary);
  document.getElementById("cancelBtn").addEventListener("click", () => {
    try { liff.closeWindow(); } catch(e) { window.history.back(); }
  });
}

async function initLIFF() {
  try {
    await liff.init({ liffId: LIFF_ID });
    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }
    const profile = await liff.getProfile();
    document.getElementById("displayName").innerText = profile.displayName;
    document.getElementById("userId").value = profile.userId;
  } catch (err) {
    console.error(err);
    setStatus("LIFF 初始化失敗，請稍後再試");
  }
}

async function submitDiary() {
  const btn = document.getElementById("submitBtn");
  btn.disabled = true;
  setStatus("送出中…");

  const payload = {
    userId: document.getElementById("userId").value,
    date: document.getElementById("date").value,
    mood: parseInt(document.getElementById("mood").value, 10),
    tags: document.getElementById("tags").value.split(",").map(s => s.trim()).filter(Boolean),
    text: document.getElementById("text").value,
    source: "liff-v2"
  };

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json().catch(()=>({ok:true}));
    setStatus("已記錄完成，感謝書寫！");
    alert("日記已送出，祝有個美好的一天！");
    try { liff.closeWindow(); } catch(e) {/* ignore */}
  } catch (err) {
    console.error(err);
    setStatus("送出失敗，請稍後重試");
    alert("送出失敗，請檢查網路或稍後再試。");
  } finally {
    btn.disabled = false;
  }
}

function setStatus(msg){ document.getElementById("status").innerText = msg; }
