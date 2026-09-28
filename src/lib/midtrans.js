// src/lib/midtrans.js
import api from "./api";

let snapLoadPromise = null;

/**
 * Ambil config publik (client key, mode sandbox/production) dari backend,
 * lalu muat script Snap.js Midtrans sekali saja (cache promise-nya).
 * Return `window.snap` yang siap dipakai: snap.pay(token, {...}).
 */
export function loadMidtransSnap() {
  if (window.snap) return Promise.resolve(window.snap);
  if (snapLoadPromise) return snapLoadPromise;

  snapLoadPromise = api.get("/midtrans/config").then((cfg) => {
    if (!cfg.enabled) throw new Error("Pembayaran belum dikonfigurasi di server.");
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = cfg.is_production
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";
      script.setAttribute("data-client-key", cfg.client_key);
      script.onload = () => resolve(window.snap);
      script.onerror = () => reject(new Error("Gagal memuat Midtrans Snap"));
      document.head.appendChild(script);
    });
  }).catch((err) => {
    snapLoadPromise = null; // biar bisa dicoba lagi kalau gagal
    throw err;
  });

  return snapLoadPromise;
}
