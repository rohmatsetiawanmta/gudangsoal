// src/lib/analytics.js
// Helper terpusat buat GA4 (gtag.js): UTM persistence lintas-navigasi SPA + custom events.
// Catatan: `window.gtag` selalu ada sejak awal (stub di index.html, sebelum React mount),
// jadi aman dipanggil langsung tanpa feature-detect — pemanggilan sebelum script GA
// benar-benar load cuma masuk queue `dataLayer` dan diproses begitu gtag.js siap.

const UTM_STORAGE_KEY = "gs_utm_params";
const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign"];
const FIRST_ANSWER_KEY = "gs_first_answer_sent";

// Dipanggil sekali di main.jsx, SEBELUM render React — capture UTM dari query string
// sebelum SPA routing/navigasi sempat strip-nya. Disimpan ke sessionStorage (per-sesi,
// bukan localStorage, karena UTM cuma relevan buat kunjungan ini).
export function captureUtmParams() {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    let has = false;
    UTM_PARAMS.forEach((key) => {
      const val = params.get(key);
      if (val) {
        utm[key] = val;
        has = true;
      }
    });
    if (has) {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
    }
  } catch {
    // sessionStorage bisa gak tersedia (mode privat dsb) — abaikan senyap
  }
}

function getStoredUtm() {
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Dipanggil setelah script GA selesai dimuat (onload) — kirim campaign params yang
// tersimpan di sessionStorage sebagai page_view event, supaya UTM gak hilang walau
// user baru klik "Terima"/GA baru sempat load setelah beberapa kali navigasi SPA.
export function sendStoredUtmEvent() {
  const utm = getStoredUtm();
  if (!utm) return;
  window.gtag("event", "page_view", {
    campaign_source: utm.utm_source,
    campaign_medium: utm.utm_medium,
    campaign_name: utm.utm_campaign,
  });
}

export function trackSignUp() {
  window.gtag("event", "sign_up");
}

export function trackContinueAsGuest() {
  window.gtag("event", "continue_as_guest");
}

// "Pertama" = sekali seumur akun, bukan per sesi. Best-effort "once ever" per device
// lewat localStorage (bukan round-trip backend) — cukup akurat buat kebutuhan analytics.
export function trackFirstQuestionAnswered() {
  try {
    if (localStorage.getItem(FIRST_ANSWER_KEY)) return;
    localStorage.setItem(FIRST_ANSWER_KEY, "1");
  } catch {
    // localStorage gak bisa diakses — tetap lanjut kirim event (best-effort)
  }
  window.gtag("event", "first_question_answered");
}
