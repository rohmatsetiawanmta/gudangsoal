// Difficulty bands: level 1-4 = easy, 5-9 = medium, 10+ = hard

export function getDifficultyBand(level) {
  if (level <= 4) return "easy";
  if (level <= 9) return "medium";
  return "hard";
}

// Timer per level: starts at 20s, decreases by 1 every 2 levels, min 8s
export function getTimerMax(level) {
  return Math.max(8, 20 - Math.floor(level / 2));
}

export function formatRp(n) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

// Format answer based on unit type
export function formatChoice(v, unit) {
  if (unit === "persen") return `${v}%/tahun`;
  if (unit === "tahun") return `${v} tahun`;
  if (unit === "bulan") return `${v} bulan`;
  return formatRp(v);
}

function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build 4 unique positive Rupiah choices with step-based fallback
function makeChoices(correct, ...wrongs) {
  const seen = new Set([correct]);
  const out = [correct];
  for (const w of wrongs) {
    const rw = Math.round(w);
    if (rw > 0 && !seen.has(rw)) { seen.add(rw); out.push(rw); }
  }
  const step = Math.max(25_000, Math.round(correct * 0.1 / 25_000) * 25_000);
  let m = 1;
  while (out.length < 4) {
    for (const delta of [step * m, -step * m]) {
      const c = correct + delta;
      if (out.length < 4 && c > 0 && !seen.has(c)) { seen.add(c); out.push(c); }
    }
    m++;
  }
  return shuffle(out.slice(0, 4));
}

// Standard rate pool for percentage questions
const RATE_POOL = [3, 4, 5, 6, 8, 10, 12, 15, 18, 20];
function makeRateChoices(correct) {
  const wrongs = shuffle(RATE_POOL.filter(r => r !== correct)).slice(0, 3);
  return shuffle([correct, ...wrongs]);
}

// ── Bunga Tunggal — find B or M_akhir ─────────────────────────────────────────
// Uses pUnit × 100.000 so bunga = pUnit × r × t × 1000 (always clean integer)

function generateBungaTunggal(band) {
  const cfgs = {
    easy:   { pUnits: [10,15,20,25,30,50],      rates: [5,10,20],         times: [1,2,3] },
    medium: { pUnits: [20,30,40,50,80,100],     rates: [5,8,10,12,15],    times: [1,2,3,4] },
    hard:   { pUnits: [50,80,100,150,200,500],  rates: [8,10,12,15,18,20],times: [2,3,4,5] },
  }[band];

  const pUnit  = randChoice(cfgs.pUnits);
  const r      = randChoice(cfgs.rates);
  const t      = randChoice(cfgs.times);
  const P      = pUnit * 100_000;
  const bunga1 = pUnit * r * 1_000;   // interest for 1 year
  const bunga  = bunga1 * t;
  const total  = P + bunga;

  const askTotal = band !== "easy" && t > 1 && Math.random() < 0.4;
  const correct  = askTotal ? total : bunga;

  let w1, w2, w3;
  if (askTotal) {
    w1 = P + bunga1;
    w2 = P + bunga + bunga1;
    w3 = P;
  } else {
    w1 = t > 1 ? bunga1 : bunga * 2;
    w2 = bunga + bunga1;
    w3 = bunga - bunga1 > 0 ? bunga - bunga1 : total;
  }

  return {
    type: "bunga_tunggal",
    typeLabel: "Bunga Tunggal",
    unit: "rp",
    question: askTotal
      ? `Modal ${formatRp(P)} disimpan ${t} tahun dengan bunga tunggal ${r}%/tahun. Berapa nilai akhirnya?`
      : `Modal ${formatRp(P)} disimpan ${t} tahun dengan bunga tunggal ${r}%/tahun. Berapa total bunganya?`,
    correct,
    choices: makeChoices(correct, w1, w2, w3),
    formula: askTotal
      ? `A = P(1 + rt) = ${formatRp(P)} × (1 + ${r/100}×${t}) = ${formatRp(total)}`
      : `I = P × r × t = ${formatRp(P)} × ${r/100} × ${t} = ${formatRp(bunga)}`,
    hint: "I = P × r × t",
  };
}

// ── Bunga Tunggal — find p% ───────────────────────────────────────────────────
// Given B, M, n → find r = B/(M×n)

function generateBungaTunggalRate(band) {
  const cfgs = {
    medium: { pUnits: [20,30,40,50,80,100], rates: [5,8,10,12,15],    times: [2,3,4] },
    hard:   { pUnits: [50,100,150,200,500], rates: [8,10,12,15,18,20], times: [2,3,4,5] },
  }[band] || { pUnits: [10,20,30], rates: [5,10,20], times: [2,3] };

  const pUnit = randChoice(cfgs.pUnits);
  const r     = randChoice(cfgs.rates);
  const t     = randChoice(cfgs.times);
  const P     = pUnit * 100_000;
  const bunga = pUnit * r * t * 1_000;

  return {
    type: "bunga_tunggal",
    typeLabel: "Bunga Tunggal",
    unit: "persen",
    question: `Modal ${formatRp(P)} menghasilkan bunga ${formatRp(bunga)} dalam ${t} tahun (bunga tunggal). Suku bunganya per tahun?`,
    correct: r,
    choices: makeRateChoices(r),
    formula: `p% = B ÷ (M×n) = ${formatRp(bunga)} ÷ (${formatRp(P)} × ${t}) = ${r}%/tahun`,
    hint: "p% = B ÷ (M × n)",
  };
}

// ── Bunga Majemuk — find M_n (final value) ───────────────────────────────────
// Predefine configs that produce clean-ish results (rounded to nearest 1000)

const MAJEMUK_CONFIGS = {
  medium: [
    { pUnit: 10, r: 10, t: 2 },   // 1jt → 1.210.000
    { pUnit: 10, r: 10, t: 3 },   // 1jt → 1.331.000
    { pUnit: 20, r: 10, t: 2 },   // 2jt → 2.420.000
    { pUnit: 10, r: 20, t: 2 },   // 1jt → 1.440.000
    { pUnit: 50, r: 10, t: 2 },   // 5jt → 6.050.000
    { pUnit: 20, r: 20, t: 2 },   // 2jt → 2.880.000
    { pUnit: 40, r: 10, t: 2 },   // 4jt → 4.840.000
    { pUnit: 10, r: 20, t: 3 },   // 1jt → 1.728.000
    { pUnit: 30, r: 10, t: 2 },   // 3jt → 3.630.000
    { pUnit: 60, r: 10, t: 2 },   // 6jt → 7.260.000
  ],
  hard: [
    { pUnit: 50,  r: 10, t: 3 },  // 5jt → 6.655.000
    { pUnit: 100, r: 10, t: 2 },  // 10jt → 12.100.000
    { pUnit: 50,  r: 20, t: 3 },  // 5jt → 8.640.000
    { pUnit: 100, r: 15, t: 2 },  // 10jt → 13.225.000
    { pUnit: 80,  r: 10, t: 3 },  // 8jt → 10.648.000
    { pUnit: 100, r: 20, t: 2 },  // 10jt → 14.400.000
    { pUnit: 60,  r: 10, t: 2 },  // 6jt → 7.260.000
    { pUnit: 50,  r: 20, t: 2 },  // 5jt → 7.200.000
    { pUnit: 200, r: 10, t: 2 },  // 20jt → 24.200.000
    { pUnit: 100, r: 10, t: 3 },  // 10jt → 13.310.000
  ],
};

function generateBungaMajemuk(band) {
  const { pUnit, r, t } = randChoice(MAJEMUK_CONFIGS[band] || MAJEMUK_CONFIGS.medium);
  const P = pUnit * 100_000;
  const round1k = n => Math.round(n / 1_000) * 1_000;

  const total      = round1k(P * Math.pow(1 + r / 100, t));
  const totalSimple = round1k(P * (1 + r / 100 * t));
  const totalTm1   = round1k(P * Math.pow(1 + r / 100, t - 1));
  const totalTp1   = round1k(P * Math.pow(1 + r / 100, t + 1));

  return {
    type: "bunga_majemuk",
    typeLabel: "Bunga Majemuk",
    unit: "rp",
    question: `Modal ${formatRp(P)} diinvestasikan ${t} tahun dengan bunga majemuk ${r}%/tahun. Berapa nilai akhirnya?`,
    correct: total,
    choices: makeChoices(total, totalSimple, totalTm1, totalTp1),
    formula: `A = P(1+i)ⁿ = ${formatRp(P)} × ${(1 + r / 100).toFixed(2)}^${t} = ${formatRp(total)}`,
    hint: "A = P(1 + i)ⁿ",
  };
}

// ── Bunga Majemuk — find modal awal (inverse) ─────────────────────────────────
// Given M_n, i, n → find M = M_n / (1+i)^n

function generateBungaMajemukModal(band) {
  const { pUnit, r, t } = randChoice(MAJEMUK_CONFIGS[band] || MAJEMUK_CONFIGS.medium);
  const P = pUnit * 100_000;
  const round1k = n => Math.round(n / 1_000) * 1_000;
  const Mn = round1k(P * Math.pow(1 + r / 100, t));

  // Common errors
  const wrongSimple = round1k(Mn / (1 + r / 100 * t));                              // used simple interest
  const wrongTm1    = round1k(Mn / Math.pow(1 + r / 100, Math.max(1, t - 1)));      // one year fewer
  const wrongTp1    = round1k(Mn / Math.pow(1 + r / 100, t + 1));                   // one year extra

  return {
    type: "bunga_majemuk",
    typeLabel: "Bunga Majemuk",
    unit: "rp",
    question: `Nilai investasi menjadi ${formatRp(Mn)} setelah ${t} tahun dengan bunga majemuk ${r}%/tahun. Berapa modal awalnya?`,
    correct: P,
    choices: makeChoices(P, wrongSimple, wrongTm1, wrongTp1),
    formula: `M = Mₙ ÷ (1+i)ⁿ = ${formatRp(Mn)} ÷ ${(1 + r / 100).toFixed(2)}^${t} = ${formatRp(P)}`,
    hint: "M = Mₙ ÷ (1 + i)ⁿ",
  };
}

// ── Pinjaman Bunga Majemuk — find total utang ─────────────────────────────────
// FV = PV(1+i)^n in loan/debt context

function generatePinjamanMajemuk(band) {
  const { pUnit, r, t } = randChoice(MAJEMUK_CONFIGS[band] || MAJEMUK_CONFIGS.hard);
  const PV = pUnit * 100_000;
  const round1k = n => Math.round(n / 1_000) * 1_000;
  const FV = round1k(PV * Math.pow(1 + r / 100, t));

  const wrongSimple = round1k(PV + PV * (r / 100) * t);
  const wrongTm1    = round1k(PV * Math.pow(1 + r / 100, t - 1));
  const wrongTp1    = round1k(PV * Math.pow(1 + r / 100, t + 1));

  return {
    type: "pinjaman_majemuk",
    typeLabel: "Pinjaman Majemuk",
    unit: "rp",
    question: `Pinjaman ${formatRp(PV)} berbunga majemuk ${r}%/tahun tidak dibayar selama ${t} tahun. Total utangnya?`,
    correct: FV,
    choices: makeChoices(FV, wrongSimple, wrongTm1, wrongTp1),
    formula: `FV = PV(1+i)ⁿ = ${formatRp(PV)} × ${(1 + r / 100).toFixed(2)}^${t} = ${formatRp(FV)}`,
    hint: "FV = PV(1 + i)ⁿ",
  };
}

// ── Cicilan Pinjaman (flat rate) ──────────────────────────────────────────────
// cicilan = P/n + P×r/12  (r = annual rate, n = months)

const CICILAN_CONFIGS = [
  { pUnit: 12,  r: 10, n: 12 },  // 1.200.000 → 100.000 + 10.000 = 110.000
  { pUnit: 24,  r: 10, n: 12 },  // 200.000 + 20.000 = 220.000
  { pUnit: 48,  r: 10, n: 12 },  // 400.000 + 40.000 = 440.000
  { pUnit: 60,  r: 10, n: 12 },  // 500.000 + 50.000 = 550.000
  { pUnit: 36,  r: 10, n: 12 },  // 300.000 + 30.000 = 330.000
  { pUnit: 60,  r: 10, n: 24 },  // 250.000 + 50.000 = 300.000
  { pUnit: 120, r: 10, n: 24 },  // 500.000 + 100.000 = 600.000
  { pUnit: 120, r: 12, n: 12 },  // 1.000.000 + 120.000 = 1.120.000
  { pUnit: 60,  r: 12, n: 12 },  // 500.000 + 60.000 = 560.000
  { pUnit: 120, r: 15, n: 12 },  // 1.000.000 + 150.000 = 1.150.000
  { pUnit: 240, r: 12, n: 24 },  // 1.000.000 + 240.000 = 1.240.000
  { pUnit: 180, r: 10, n: 36 },  // 500.000 + 150.000 = 650.000
  { pUnit: 120, r: 18, n: 12 },  // 1.000.000 + 180.000 = 1.180.000
  { pUnit: 60,  r: 15, n: 12 },  // 500.000 + 75.000 = 575.000
];

function generateCicilan(band) {
  const filtered = band === "medium"
    ? CICILAN_CONFIGS.filter(c => c.n <= 12 && c.pUnit <= 120)
    : CICILAN_CONFIGS;

  const { pUnit, r, n } = randChoice(filtered);
  const P          = pUnit * 100_000;
  const pokok      = P / n;
  const bungaBulan = P * r / 100 / 12;
  const cicilan    = Math.round(pokok + bungaBulan);

  return {
    type: "cicilan",
    typeLabel: "Cicilan Pinjaman",
    unit: "rp",
    question: `Pinjaman ${formatRp(P)} dengan bunga flat ${r}%/tahun diangsur ${n} bulan. Cicilan per bulan?`,
    correct: cicilan,
    choices: makeChoices(
      cicilan,
      Math.round(pokok),
      Math.round(cicilan + bungaBulan),
      Math.round(P * (1 + r / 100) / n),
    ),
    formula: `Cicilan = P/n + P×r/12 = ${formatRp(pokok)} + ${formatRp(bungaBulan)} = ${formatRp(cicilan)}`,
    hint: "Cicilan = P/n + P×r/12",
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

export function generateScenario(level) {
  const band = getDifficultyBand(level);

  if (band === "easy") return generateBungaTunggal("easy");

  if (band === "medium") {
    const roll = Math.random();
    if (roll < 0.25) return generateBungaTunggal("medium");
    if (roll < 0.45) return generateBungaTunggalRate("medium");
    if (roll < 0.63) return generateBungaMajemuk("medium");
    if (roll < 0.80) return generateBungaMajemukModal("medium");
    return generateCicilan("medium");
  }

  // hard
  const roll = Math.random();
  if (roll < 0.15) return generateBungaTunggal("hard");
  if (roll < 0.28) return generateBungaTunggalRate("hard");
  if (roll < 0.43) return generateBungaMajemuk("hard");
  if (roll < 0.57) return generateBungaMajemukModal("hard");
  if (roll < 0.72) return generatePinjamanMajemuk("hard");
  return generateCicilan("hard");
}
