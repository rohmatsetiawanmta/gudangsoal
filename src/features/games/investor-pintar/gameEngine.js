export const STARTING_CAPITAL = 10_000_000;
export const TOTAL_ROUNDS    = 5;
export const ROUND_YEARS     = 2;

export function formatRp(n) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Products ──────────────────────────────────────────────────────────────────

const PRODUCTS_LIST = [
  { id: "deposito",     name: "Deposito Bank",          typeLabel: "Bunga Tunggal", typeKey: "bt", baseRate: 6,  emoji: "🏦", riskLabel: "Sangat Rendah",   riskColor: "#1a8a6e", typeColor: "#1a8a6e", typeBg: "#e4f5f0", desc: "Aman & terjamin LPS. Bunga dibayar di akhir jangka." },
  { id: "sbr",          name: "Obligasi Negara (SBR)",  typeLabel: "Bunga Tunggal", typeKey: "bt", baseRate: 8,  emoji: "🏛️", riskLabel: "Rendah",           riskColor: "#1a8a6e", typeColor: "#1a8a6e", typeBg: "#e4f5f0", desc: "Dijamin penuh pemerintah. Return tetap & pasti." },
  { id: "reksadana_pm", name: "Reksadana Pasar Uang",  typeLabel: "Bunga Majemuk", typeKey: "bm", baseRate: 9,  emoji: "📈", riskLabel: "Rendah-Menengah", riskColor: "#f5a623", typeColor: "#2563eb", typeBg: "#eff6ff", desc: "Likuid & stabil. Bunga diinvestasikan ulang tiap tahun." },
  { id: "reksadana_c",  name: "Reksadana Campuran",    typeLabel: "Bunga Majemuk", typeKey: "bm", baseRate: 12, emoji: "📊", riskLabel: "Menengah",         riskColor: "#f5a623", typeColor: "#2563eb", typeBg: "#eff6ff", desc: "Mix saham & obligasi. Return menengah, risiko terkontrol." },
  { id: "reksadana_s",  name: "Reksadana Saham",       typeLabel: "Bunga Majemuk", typeKey: "bm", baseRate: 15, emoji: "🚀", riskLabel: "Menengah-Tinggi", riskColor: "#e84c2b", typeColor: "#2563eb", typeBg: "#eff6ff", desc: "Return tinggi mengikuti pasar saham. Sangat fluktuatif." },
  { id: "usaha",        name: "Modal Usaha",            typeLabel: "Bunga Majemuk", typeKey: "bm", baseRate: 22, emoji: "🏪", riskLabel: "Tinggi",           riskColor: "#e84c2b", typeColor: "#2563eb", typeBg: "#eff6ff", desc: "Potensi untung besar. Sangat sensitif kondisi ekonomi." },
];

export const PRODUCT_MAP = Object.fromEntries(PRODUCTS_LIST.map(p => [p.id, p]));

const SAFE_IDS  = ["deposito", "sbr"];
const MID_IDS   = ["reksadana_pm", "reksadana_c"];
const RISKY_IDS = ["reksadana_s", "usaha"];

// ── Events ────────────────────────────────────────────────────────────────────

const EVENTS = [
  { id: "boom",      emoji: "📈", title: "Boom Ekonomi!",         color: "#1a8a6e", bg: "#e4f5f0", desc: "Pasar bullish. Reksadana Saham & Modal Usaha dapat +5%/tahun.",              applyBonus: (id) => RISKY_IDS.includes(id) ?  5 : 0 },
  { id: "crash",     emoji: "📉", title: "Market Crash!",         color: "#e84c2b", bg: "#fff3f0", desc: "Pasar saham jatuh! Reksadana Saham & Modal Usaha terkena dampak serius.",    applyBonus: (id) => RISKY_IDS.includes(id) ? -20 : 0 },
  { id: "rate_naik", emoji: "🏦", title: "BI Naikkan Suku Bunga", color: "#2563eb", bg: "#eff6ff", desc: "Bank Indonesia naikkan bunga acuan. Deposito & Obligasi dapat +2%/tahun.",  applyBonus: (id) => SAFE_IDS.includes(id)  ?  2 : 0 },
  { id: "bonus",     emoji: "💰", title: "Dapat Bonus!",          color: "#f5a623", bg: "#fef9ee", desc: "Bonus tahunan Rp 2.000.000 ditambahkan ke modal sebelum investasi!",   capitalBonus: 2_000_000 },
  { id: "warisan",   emoji: "🎁", title: "Rezeki Nomplok!",       color: "#f5a623", bg: "#fef9ee", desc: "Dapat warisan Rp 5.000.000 dari keluarga. Modal bertambah!",            capitalBonus: 5_000_000 },
];

// ── Core calculation ──────────────────────────────────────────────────────────

export function calcReturn(capital, productId, effectiveRate) {
  const p  = PRODUCT_MAP[productId];
  const r  = effectiveRate / 100;
  const n  = ROUND_YEARS;

  if (p.typeKey === "bt") {
    const interest   = Math.round(capital * r * n);
    const finalValue = capital + interest;
    return {
      finalValue,
      profit: interest,
      formula: `A = M × (1 + r·n)\n= ${formatRp(capital)} × (1 + ${effectiveRate/100}×${n})\n= ${formatRp(finalValue)}`,
    };
  } else {
    const finalValue = Math.round(capital * Math.pow(1 + r, n) / 1_000) * 1_000;
    return {
      finalValue,
      profit: finalValue - capital,
      formula: `A = M × (1+r)ⁿ\n= ${formatRp(capital)} × (1+${r.toFixed(2)})²\n= ${formatRp(finalValue)}`,
    };
  }
}

// ── Round config (predetermined at game start) ────────────────────────────────

export function generateRoundConfig(roundNum) {
  return {
    roundNum,
    productIds: shuffle([randChoice(SAFE_IDS), randChoice(MID_IDS), randChoice(RISKY_IDS)]),
    event: Math.random() < 0.45 ? randChoice(EVENTS) : null,
  };
}

export function computeRoundProducts(capital, config) {
  const startCap = capital + (config.event?.capitalBonus || 0);
  return config.productIds.map(id => {
    const p            = PRODUCT_MAP[id];
    const bonus        = config.event?.applyBonus?.(id) || 0;
    const effectiveRate = Math.max(-15, p.baseRate + bonus);
    return { ...p, effectiveRate, result: calcReturn(startCap, id, effectiveRate) };
  });
}

// ── Baselines ─────────────────────────────────────────────────────────────────

export function computeBaseline(strategy, roundConfigs) {
  const pid = strategy === "conservative" ? "deposito" : "reksadana_s";
  let cap   = STARTING_CAPITAL;
  for (const cfg of roundConfigs) {
    const startCap = cap + (cfg.event?.capitalBonus || 0);
    const bonus    = cfg.event?.applyBonus?.(pid) || 0;
    const rate     = Math.max(-15, PRODUCT_MAP[pid].baseRate + bonus);
    cap = calcReturn(startCap, pid, rate).finalValue;
  }
  return cap;
}

// ── Grade ─────────────────────────────────────────────────────────────────────

export function getGrade(finalCapital) {
  const x = finalCapital / STARTING_CAPITAL;
  if (x >= 3.5) return { grade: "S", label: "Legenda Investasi!",  color: "#7c3aed", bg: "#f3e8ff" };
  if (x >= 2.5) return { grade: "A", label: "Investor Andal",      color: "#1a8a6e", bg: "#e4f5f0" };
  if (x >= 1.8) return { grade: "B", label: "Investor Cerdas",     color: "#2563eb", bg: "#eff6ff" };
  if (x >= 1.3) return { grade: "C", label: "Investor Pemula",     color: "#f5a623", bg: "#fef9ee" };
  return               { grade: "D", label: "Perlu Banyak Belajar", color: "#e84c2b", bg: "#fff3f0" };
}

export function simYear(roundNum) { return 2025 + (roundNum - 1) * ROUND_YEARS; }
