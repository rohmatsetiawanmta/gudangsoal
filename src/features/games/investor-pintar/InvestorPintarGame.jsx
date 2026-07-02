import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import SEO from "../../../components/SEO";
import useWindowWidth from "../../../hooks/useWindowWidth";
import {
  STARTING_CAPITAL, TOTAL_ROUNDS, ROUND_YEARS,
  formatRp, generateRoundConfig, computeRoundProducts,
  computeBaseline, getGrade, simYear,
} from "./gameEngine";

export default function InvestorPintarGame() {
  const width    = useWindowWidth();
  const isMobile = width <= 480;

  const [phase, setPhase]                     = useState("idle");
  const [roundConfigs, setRoundConfigs]       = useState([]);
  const [roundIdx, setRoundIdx]               = useState(0);
  const [capital, setCapital]                 = useState(STARTING_CAPITAL);
  const [history, setHistory]                 = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);

  const currentConfig = roundConfigs[roundIdx];
  const lastEntry     = history[history.length - 1];

  function startGame() {
    const configs  = Array.from({ length: TOTAL_ROUNDS }, (_, i) => generateRoundConfig(i + 1));
    const products = computeRoundProducts(STARTING_CAPITAL, configs[0]);
    setRoundConfigs(configs);
    setRoundIdx(0);
    setCapital(STARTING_CAPITAL);
    setHistory([]);
    setDisplayProducts(products);
    setPhase("selecting");
  }

  function handlePick(product) {
    const config   = currentConfig;
    const startCap = capital + (config.event?.capitalBonus || 0);
    const chosen   = displayProducts.find(p => p.id === product.id);

    const entry = {
      roundNum:      config.roundNum,
      event:         config.event,
      chosen,
      others:        displayProducts.filter(p => p.id !== product.id),
      capitalBefore: startCap,
      capitalAfter:  chosen.result.finalValue,
    };

    setHistory(prev => [...prev, entry]);
    setCapital(chosen.result.finalValue);
    setPhase("result");
  }

  function handleNext() {
    const nextIdx    = roundIdx + 1;
    const newCapital = history[history.length - 1]?.capitalAfter ?? capital;
    if (nextIdx >= TOTAL_ROUNDS) {
      setPhase("final");
      return;
    }
    const products = computeRoundProducts(newCapital, roundConfigs[nextIdx]);
    setRoundIdx(nextIdx);
    setDisplayProducts(products);
    setPhase("selecting");
  }

  // ── IDLE ─────────────────────────────────────────────────────────────────────
  if (phase === "idle") {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#faf9f6" }}>
        <SEO title="Investor Pintar" description="Simulasi investasi 10 tahun." url="/games/investor-pintar" />
        <Navbar />
        <main style={{ flex: 1, maxWidth: "600px", margin: "0 auto", padding: isMobile ? "32px 20px" : "56px 40px", width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: isMobile ? "64px" : "80px", height: isMobile ? "64px" : "80px", borderRadius: "22px", background: "linear-gradient(135deg, #2563eb, #1a1a8a)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(37,99,235,.3)", fontSize: isMobile ? "32px" : "40px" }}>
              💼
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: "800", color: "#0f0e17", marginBottom: "8px", letterSpacing: "-0.5px" }}>
              Investor Pintar
            </h1>
            <p style={{ fontSize: "15px", color: "#6b6860", lineHeight: "1.6" }}>
              Mulai dengan <strong>Rp 10.000.000</strong>.<br />
              Buat 5 keputusan investasi selama 10 tahun simulasi.
            </p>
          </div>

          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f0e17", marginBottom: "4px" }}>📋 Cara main</div>
            {[
              "Tiap ronde, pilih 1 dari 3 produk investasi",
              "Modal kamu tumbuh sesuai rumus yang berlaku",
              "Ada event acak yang mempengaruhi return tiap ronde",
              "Setelah 5 ronde, lihat hasil vs strategi konservatif & agresif",
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px", color: "#6b6860" }}>
                <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#e4f5f0", color: "#1a8a6e", fontWeight: "800", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                {s}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { label: "Bunga Tunggal · A = M(1+rt)", color: "#1a8a6e", bg: "#e4f5f0" },
              { label: "Bunga Majemuk · A = M(1+r)ⁿ", color: "#2563eb", bg: "#eff6ff" },
            ].map(({ label, color, bg }) => (
              <span key={label} style={{ fontSize: "12px", fontWeight: "700", padding: "5px 12px", borderRadius: "99px", color, background: bg, fontFamily: "monospace" }}>
                {label}
              </span>
            ))}
          </div>

          <button
            onClick={startGame}
            style={{ background: "#2563eb", color: "white", border: "none", borderRadius: "12px", padding: "14px 40px", fontSize: "16px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "8px", alignSelf: "center" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#1d4ed8")}
            onMouseLeave={e => (e.currentTarget.style.background = "#2563eb")}
          >
            Mulai Investasi <ChevronRight size={18} />
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  // ── SELECTING ────────────────────────────────────────────────────────────────
  if (phase === "selecting" && currentConfig) {
    const { event, roundNum } = currentConfig;
    const startCap = capital + (event?.capitalBonus || 0);

    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#faf9f6" }}>
        <SEO title="Investor Pintar" description="" url="/games/investor-pintar" />
        <Navbar />
        <main style={{ flex: 1, maxWidth: "600px", margin: "0 auto", padding: isMobile ? "20px 16px" : "36px 40px", width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#6b6860" }}>
              Ronde {roundNum} / {TOTAL_ROUNDS}
            </span>
            <span style={{ fontSize: "12px", color: "#b4b2a9", background: "#f2efe8", padding: "4px 10px", borderRadius: "20px" }}>
              Tahun {simYear(roundNum)}–{simYear(roundNum) + ROUND_YEARS - 1}
            </span>
          </div>

          <div style={{ width: "100%", height: "4px", background: "#e2ddd5", borderRadius: "2px" }}>
            <div style={{ height: "100%", width: `${((roundNum - 1) / TOTAL_ROUNDS) * 100}%`, background: "#2563eb", borderRadius: "2px", transition: "width .4s" }} />
          </div>

          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", padding: "16px 20px" }}>
            <div style={{ fontSize: "11px", color: "#b4b2a9", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "4px" }}>
              Modal kamu
            </div>
            <div style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: "800", color: "#0f0e17", letterSpacing: "-1px" }}>
              {formatRp(capital)}
            </div>
            {capital > STARTING_CAPITAL && (
              <div style={{ fontSize: "12px", color: "#1a8a6e", fontWeight: "600", marginTop: "2px" }}>
                +{((capital / STARTING_CAPITAL - 1) * 100).toFixed(1)}% dari awal
              </div>
            )}
            {event?.capitalBonus && (
              <div style={{ marginTop: "8px", fontSize: "13px", fontWeight: "600", color: "#f5a623" }}>
                {event.emoji} +{formatRp(event.capitalBonus)} → investasikan {formatRp(startCap)}
              </div>
            )}
          </div>

          {event && (
            <div style={{ background: event.bg, border: `1px solid ${event.color}40`, borderRadius: "12px", padding: "12px 16px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "22px", flexShrink: 0, lineHeight: 1.2 }}>{event.emoji}</span>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "800", color: event.color, marginBottom: "2px" }}>{event.title}</div>
                <div style={{ fontSize: "12px", color: "#6b6860", lineHeight: 1.5 }}>{event.desc}</div>
              </div>
            </div>
          )}

          <div style={{ fontSize: "12px", fontWeight: "600", color: "#b4b2a9", textTransform: "uppercase", letterSpacing: ".06em" }}>
            Pilih investasimu
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {displayProducts.map(p => (
              <ProductCard key={p.id} product={p} onPick={handlePick} isMobile={isMobile} />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── RESULT ───────────────────────────────────────────────────────────────────
  if (phase === "result" && lastEntry) {
    const { chosen, others, capitalBefore, capitalAfter, event, roundNum } = lastEntry;
    const isProfit = chosen.result.profit >= 0;
    const isLast   = roundIdx + 1 >= TOTAL_ROUNDS;

    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#faf9f6" }}>
        <SEO title="Investor Pintar" description="" url="/games/investor-pintar" />
        <Navbar />
        <main style={{ flex: 1, maxWidth: "600px", margin: "0 auto", padding: isMobile ? "20px 16px" : "36px 40px", width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#6b6860" }}>Ronde {roundNum} selesai</span>
            <span style={{ fontSize: "12px", color: "#b4b2a9", background: "#f2efe8", padding: "4px 10px", borderRadius: "20px" }}>
              {simYear(roundNum)}–{simYear(roundNum) + ROUND_YEARS - 1}
            </span>
          </div>

          {/* Chosen product result */}
          <div style={{ background: "white", borderRadius: "16px", border: `2px solid ${isProfit ? "#1a8a6e" : "#e84c2b"}`, padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px", background: isProfit ? "#e4f5f0" : "#fff3f0", color: isProfit ? "#1a8a6e" : "#e84c2b" }}>
                ✓ Kamu pilih
              </span>
              <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px", background: chosen.typeBg, color: chosen.typeColor }}>
                {chosen.typeLabel}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "32px" }}>{chosen.emoji}</span>
              <div>
                <div style={{ fontWeight: "800", fontSize: "16px", color: "#0f0e17" }}>{chosen.name}</div>
                <div style={{ fontSize: "13px", color: "#6b6860" }}>{chosen.effectiveRate}%/tahun × {ROUND_YEARS} tahun</div>
              </div>
            </div>

            <div style={{ background: isProfit ? "#e4f5f0" : "#fff3f0", borderRadius: "10px", padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "14px", color: "#6b6860" }}>{formatRp(capitalBefore)}</span>
                <span style={{ color: "#b4b2a9", fontWeight: "700" }}>→</span>
                <span style={{ fontSize: isMobile ? "20px" : "22px", fontWeight: "800", color: "#0f0e17", letterSpacing: "-0.5px" }}>{formatRp(capitalAfter)}</span>
              </div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: isProfit ? "#1a8a6e" : "#e84c2b", marginTop: "4px" }}>
                {isProfit ? "+" : ""}{formatRp(chosen.result.profit)}
              </div>
            </div>

            <div style={{ background: "#0f0e17", borderRadius: "8px", padding: "12px 14px", fontFamily: "monospace", fontSize: "12px", color: "#e2ddd5", lineHeight: 1.8, whiteSpace: "pre" }}>
              {chosen.result.formula}
            </div>
          </div>

          {/* Other options */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#b4b2a9", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" }}>
              Pilihan lain
            </div>
            {others.map(p => {
              const diff = p.result.finalValue - capitalAfter;
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", borderRadius: "10px", border: "1px solid #e2ddd5", padding: "11px 14px", marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "18px" }}>{p.emoji}</span>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>{p.name}</div>
                      <span style={{ fontSize: "11px", padding: "1px 6px", borderRadius: "4px", background: p.typeBg, color: p.typeColor, fontWeight: "700" }}>
                        {p.typeLabel} {p.effectiveRate}%
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}>{formatRp(p.result.finalValue)}</div>
                    {diff !== 0 && (
                      <div style={{ fontSize: "11px", fontWeight: "600", color: diff > 0 ? "#e84c2b" : "#1a8a6e" }}>
                        {diff > 0 ? `+${formatRp(diff)} lebih` : `${formatRp(Math.abs(diff))} kurang`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            style={{ background: "#2563eb", color: "white", border: "none", borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#1d4ed8")}
            onMouseLeave={e => (e.currentTarget.style.background = "#2563eb")}
          >
            {isLast ? "Lihat Hasil Akhir" : `Lanjut ke Ronde ${roundIdx + 2}`} <ChevronRight size={16} />
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  // ── FINAL ────────────────────────────────────────────────────────────────────
  if (phase === "final") {
    const finalCapital       = history[history.length - 1]?.capitalAfter ?? STARTING_CAPITAL;
    const conservativeResult = computeBaseline("conservative", roundConfigs);
    const aggressiveResult   = computeBaseline("aggressive",   roundConfigs);
    const grade              = getGrade(finalCapital);
    const growth             = ((finalCapital / STARTING_CAPITAL - 1) * 100).toFixed(1);
    const maxVal             = Math.max(finalCapital, conservativeResult, aggressiveResult);

    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#faf9f6" }}>
        <SEO title="Hasil Investor Pintar" description="" url="/games/investor-pintar" />
        <Navbar />
        <main style={{ flex: 1, maxWidth: "600px", margin: "0 auto", padding: isMobile ? "20px 16px" : "36px 40px", width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>

          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "20px", background: grade.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: "900", color: grade.color, border: `2px solid ${grade.color}30` }}>
              {grade.grade}
            </div>
            <div>
              <div style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "#0f0e17", letterSpacing: "-0.5px" }}>Investasi Selesai!</div>
              <div style={{ fontSize: "15px", color: grade.color, fontWeight: "700", marginTop: "2px" }}>{grade.label}</div>
            </div>
          </div>

          <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2ddd5", padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "#b4b2a9", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "6px" }}>
              Net Worth Akhir · 2025–{simYear(TOTAL_ROUNDS) + ROUND_YEARS - 1}
            </div>
            <div style={{ fontSize: isMobile ? "32px" : "40px", fontWeight: "800", color: "#0f0e17", letterSpacing: "-1.5px" }}>
              {formatRp(finalCapital)}
            </div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a8a6e", marginTop: "4px" }}>
              +{growth}% dari modal awal
            </div>
          </div>

          {/* Comparison bars */}
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f0e17" }}>Perbandingan Strategi</div>
            {[
              { label: "Kamu",                               value: finalCapital,       color: grade.color, bg: grade.bg,    emoji: "🎯" },
              { label: "Konservatif (selalu Deposito)",      value: conservativeResult, color: "#1a8a6e",   bg: "#e4f5f0",  emoji: "🏦" },
              { label: "Agresif (selalu Reksadana Saham)",   value: aggressiveResult,   color: "#e84c2b",   bg: "#fff3f0",  emoji: "🚀" },
            ].map(({ label, value, color, emoji }) => (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "12px", color: "#6b6860" }}>{emoji} {label}</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color }}>{formatRp(value)}</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#f2efe8", borderRadius: "4px" }}>
                  <div style={{ height: "100%", width: `${(value / maxVal) * 100}%`, background: color, borderRadius: "4px" }} />
                </div>
              </div>
            ))}
          </div>

          {/* History table */}
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0ede6", fontSize: "13px", fontWeight: "700", color: "#0f0e17" }}>
              Perjalanan Investasi
            </div>
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #f0ede6", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#b4b2a9" }}>
              <span>Mulai (2025)</span><span>{formatRp(STARTING_CAPITAL)}</span>
            </div>
            {history.map((h, i) => (
              <div key={i} style={{ padding: "12px 20px", borderBottom: i < history.length - 1 ? "1px solid #f0ede6" : "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                  <span style={{ fontSize: "16px", flexShrink: 0 }}>{h.chosen.emoji}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: "#0f0e17", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      R{h.roundNum} · {h.chosen.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "#b4b2a9" }}>
                      {simYear(h.roundNum)}–{simYear(h.roundNum) + ROUND_YEARS - 1}
                      {h.event ? ` · ${h.event.emoji} ${h.event.title}` : ""}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f0e17" }}>{formatRp(h.capitalAfter)}</div>
                  <div style={{ fontSize: "11px", fontWeight: "600", color: h.chosen.result.profit >= 0 ? "#1a8a6e" : "#e84c2b" }}>
                    {h.chosen.result.profit >= 0 ? "+" : ""}{formatRp(h.chosen.result.profit)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setPhase("idle")}
              style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid #e2ddd5", background: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#0f0e17", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f2efe8")}
              onMouseLeave={e => (e.currentTarget.style.background = "white")}
            >
              <ChevronLeft size={16} /> Menu
            </button>
            <button
              onClick={startGame}
              style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: "#2563eb", color: "white", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1d4ed8")}
              onMouseLeave={e => (e.currentTarget.style.background = "#2563eb")}
            >
              Main Lagi <ChevronRight size={16} />
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return null;
}

// ── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({ product: p, onPick, isMobile }) {
  const [hovered, setHovered] = useState(false);
  const isNegative = p.result.profit < 0;

  return (
    <div
      onClick={() => onPick(p)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white",
        borderRadius: "14px",
        border: `1.5px solid ${hovered ? p.typeColor : "#e2ddd5"}`,
        padding: isMobile ? "14px" : "16px",
        cursor: "pointer",
        transition: "border-color .15s, box-shadow .15s",
        boxShadow: hovered ? `0 4px 16px ${p.typeColor}22` : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <span style={{ fontSize: "26px", flexShrink: 0 }}>{p.emoji}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: "700", fontSize: "14px", color: "#0f0e17" }}>{p.name}</div>
            <div style={{ display: "flex", gap: "6px", marginTop: "3px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 7px", borderRadius: "5px", background: p.typeBg, color: p.typeColor }}>{p.typeLabel}</span>
              <span style={{ fontSize: "11px", fontWeight: "600", color: p.riskColor }}>Risiko: {p.riskLabel}</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: isMobile ? "20px" : "22px", fontWeight: "800", color: p.typeColor, letterSpacing: "-0.5px" }}>
            {p.effectiveRate}%
          </div>
          <div style={{ fontSize: "11px", color: "#b4b2a9" }}>/ tahun</div>
        </div>
      </div>

      <div style={{ fontSize: "12px", color: "#6b6860", margin: "10px 0 12px", lineHeight: 1.5 }}>{p.desc}</div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#faf9f6", borderRadius: "8px", padding: "10px 12px" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#b4b2a9", marginBottom: "2px" }}>Estimasi setelah 2 tahun</div>
          <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f0e17" }}>{formatRp(p.result.finalValue)}</div>
          <div style={{ fontSize: "12px", fontWeight: "600", color: isNegative ? "#e84c2b" : "#1a8a6e" }}>
            {isNegative ? "" : "+"}{formatRp(p.result.profit)}
          </div>
        </div>
        <div style={{ background: p.typeColor, color: "white", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
          Pilih <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
}
