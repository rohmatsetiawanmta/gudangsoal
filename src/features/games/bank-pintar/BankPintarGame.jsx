import { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Zap, Trophy, ChevronLeft, ChevronRight, TrendingUp, Check, X } from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import SEO from "../../../components/SEO";
import useWindowWidth from "../../../hooks/useWindowWidth";
import { generateScenario, getDifficultyBand, getTimerMax, formatRp, formatChoice } from "./scenarioGenerator";

const MAX_LIVES    = 3;
const SCORE_CORRECT    = 150;
const SCORE_SPEED_MAX  = 50;

const TYPE_COLORS = {
  bunga_tunggal:    { color: "#1a8a6e", bg: "#e4f5f0" },
  bunga_majemuk:    { color: "#2563eb", bg: "#eff6ff" },
  pinjaman_majemuk: { color: "#e84c2b", bg: "#fff3f0" },
  cicilan:          { color: "#f5a623", bg: "#fef9ee" },
};

export default function BankPintarGame() {
  const width    = useWindowWidth();
  const isMobile = width <= 480;

  const [phase, setPhase]               = useState("idle");
  const [scenario, setScenario]         = useState(null);
  const [selectedChoice, setSelected]   = useState(null); // null = unanswered
  const [feedback, setFeedback]         = useState(null); // { type, points }
  const [lives, setLives]               = useState(MAX_LIVES);
  const [score, setScore]               = useState(0);
  const [level, setLevel]               = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft]         = useState(20);
  const [bestScore, setBestScore]       = useState(0);

  const timerRef         = useRef(null);
  const timerMaxRef      = useRef(20);
  const questionStartRef = useRef(null);

  const loadNextQuestion = useCallback((lvl) => {
    const tMax = getTimerMax(lvl);
    timerMaxRef.current = tMax;
    setScenario(generateScenario(lvl));
    setSelected(null);
    setFeedback(null);
    setTimeLeft(tMax);
    questionStartRef.current = Date.now();
  }, []);

  const handleTimeout = useCallback(() => {
    clearTimeout(timerRef.current);
    setFeedback({ type: "timeout", points: 0 });
    setSelected(null);
    setLives((prev) => {
      const next = prev - 1;
      if (next <= 0) setTimeout(() => setPhase("gameover"), 1500);
      return next;
    });
    setTimeout(() => {
      setLevel((lvl) => { loadNextQuestion(lvl); return lvl; });
    }, 1500);
  }, [loadNextQuestion]);

  // Countdown timer
  useEffect(() => {
    if (phase !== "playing" || feedback) return;
    if (timeLeft <= 0) { handleTimeout(); return; }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [phase, timeLeft, feedback, handleTimeout]);

  useEffect(() => {
    if (phase === "gameover") setBestScore((b) => Math.max(b, score));
  }, [phase, score]);

  function startGame() {
    setLives(MAX_LIVES);
    setScore(0);
    setLevel(1);
    setCorrectCount(0);
    setPhase("playing");
    loadNextQuestion(1);
  }

  function handleChoice(v) {
    if (feedback || phase !== "playing") return;
    clearTimeout(timerRef.current);

    const elapsed   = (Date.now() - questionStartRef.current) / 1000;
    const remaining = Math.max(0, timerMaxRef.current - elapsed);
    const isCorrect = v === scenario.correct;

    setSelected(v);

    if (isCorrect) {
      const speedBonus = Math.floor((remaining / timerMaxRef.current) * SCORE_SPEED_MAX);
      const points = SCORE_CORRECT + speedBonus;
      setScore((s) => s + points);
      setFeedback({ type: "correct", points });
      const nextCorrect = correctCount + 1;
      setCorrectCount(nextCorrect);
      const nextLevel = 1 + Math.floor(nextCorrect / 3);
      setTimeout(() => { setLevel(nextLevel); loadNextQuestion(nextLevel); }, 1500);
    } else {
      setFeedback({ type: "wrong", points: 0 });
      setLives((prev) => {
        const next = prev - 1;
        if (next <= 0) setTimeout(() => setPhase("gameover"), 1500);
        return next;
      });
      setTimeout(() => {
        setLevel((lvl) => { loadNextQuestion(lvl); return lvl; });
      }, 1500);
    }
  }

  const timerMax   = getTimerMax(level);
  const timerPct   = (timeLeft / timerMax) * 100;
  const timerColor = timeLeft <= 3 ? "#e84c2b" : timeLeft <= Math.floor(timerMax * 0.4) ? "#f5a623" : "#1a8a6e";
  const band       = getDifficultyBand(level);

  // ── Idle ─────────────────────────────────────────────────────────────────────
  if (phase === "idle") {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gs-bg)" }}>
        <SEO title="Bank Pintar" description="Hitung bunga dan cicilan dengan cepat." url="/games/bank-pintar" />
        <Navbar />
        <main style={{ flex: 1, maxWidth: "600px", margin: "0 auto", padding: isMobile ? "32px 20px" : "56px 40px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "24px" }}>

          {/* Icon */}
          <div style={{ width: isMobile ? "64px" : "80px", height: isMobile ? "64px" : "80px", borderRadius: "22px", background: "linear-gradient(135deg, #1a8a6e, #0d5c49)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(26,138,110,.3)" }}>
            <TrendingUp size={isMobile ? 32 : 40} color="white" />
          </div>

          <div>
            <h1 style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: "800", color: "var(--gs-text)", marginBottom: "8px", letterSpacing: "-0.5px" }}>
              Bank Pintar
            </h1>
            <p style={{ fontSize: "15px", color: "var(--gs-text-muted)", lineHeight: "1.6" }}>
              Hitung bunga dan cicilan dengan cepat.<br />
              Pilih jawaban yang benar sebelum waktu habis!
            </p>
          </div>

          {/* Tipe soal */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { label: "Bunga Tunggal", ...TYPE_COLORS.bunga_tunggal },
              { label: "Bunga Majemuk", ...TYPE_COLORS.bunga_majemuk },
              { label: "Pinjaman Majemuk", ...TYPE_COLORS.pinjaman_majemuk },
              { label: "Cicilan", ...TYPE_COLORS.cicilan },
            ].map(({ label, color, bg }) => (
              <span key={label} style={{ fontSize: "12px", fontWeight: "700", padding: "5px 12px", borderRadius: "99px", color, background: bg }}>
                {label}
              </span>
            ))}
          </div>

          {/* Info cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", width: "100%" }}>
            {[
              { value: "+150", label: "jawaban benar", color: "#1a8a6e", bg: "#e4f5f0" },
              { value: "+50",  label: "bonus kecepatan", color: "#2563eb", bg: "#eff6ff" },
              { value: "3",    label: "nyawa", color: "#e84c2b", bg: "#fff3f0" },
            ].map(({ value, label, color, bg }) => (
              <div key={label} style={{ background: bg, borderRadius: "12px", padding: "14px 10px" }}>
                <div style={{ fontSize: isMobile ? "20px" : "24px", fontWeight: "800", color }}>{value}</div>
                <div style={{ fontSize: "11px", color: "var(--gs-text-muted)", marginTop: "4px" }}>{label}</div>
              </div>
            ))}
          </div>

          {bestScore > 0 && (
            <div style={{ fontSize: "13px", color: "var(--gs-text-muted)", background: "var(--gs-hover)", borderRadius: "10px", padding: "10px 20px" }}>
              Skor terbaik sesi ini: <strong style={{ color: "var(--gs-text)" }}>{bestScore}</strong>
            </div>
          )}

          <button onClick={startGame}
            style={{ background: "#1a8a6e", color: "white", border: "none", borderRadius: "12px", padding: "14px 40px", fontSize: "16px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "8px" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#156b56")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1a8a6e")}
          >
            Mulai Game <ChevronRight size={18} />
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Game Over ─────────────────────────────────────────────────────────────────
  if (phase === "gameover") {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gs-bg)" }}>
        <SEO title="Game Over — Bank Pintar" description="" url="/games/bank-pintar" />
        <Navbar />
        <main style={{ flex: 1, maxWidth: "600px", margin: "0 auto", padding: isMobile ? "32px 20px" : "56px 40px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "24px" }}>

          <div style={{ width: "72px", height: "72px", borderRadius: "20px", background: "#faeeda", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trophy size={36} color="#f5a623" />
          </div>

          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--gs-text)", marginBottom: "4px" }}>Game Over!</h1>
            <p style={{ fontSize: "14px", color: "var(--gs-text-muted)" }}>Level tertinggi: {level}</p>
          </div>

          <div style={{ background: "var(--gs-surface)", borderRadius: "16px", border: "1px solid var(--gs-border)", padding: "28px 40px", width: "100%" }}>
            <div style={{ fontSize: "13px", color: "var(--gs-text-muted)", marginBottom: "6px" }}>Skor akhir</div>
            <div style={{ fontSize: isMobile ? "48px" : "60px", fontWeight: "800", color: "var(--gs-text)", letterSpacing: "-2px" }}>{score}</div>
            {bestScore > score && (
              <div style={{ fontSize: "13px", color: "var(--gs-text-muted)", marginTop: "8px" }}>
                Terbaik: <strong style={{ color: "var(--gs-text)" }}>{bestScore}</strong>
              </div>
            )}
            {score >= bestScore && bestScore > 0 && (
              <div style={{ marginTop: "10px", display: "inline-block", fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "6px", background: "#e4f5f0", color: "#1a8a6e" }}>
                🏆 Skor Terbaik Baru!
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", width: "100%" }}>
            <button onClick={() => setPhase("idle")}
              style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid var(--gs-border)", background: "var(--gs-surface)", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "var(--gs-text)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gs-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              <ChevronLeft size={16} /> Kembali
            </button>
            <button onClick={startGame}
              style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: "#1a8a6e", color: "white", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#156b56")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1a8a6e")}
            >
              Main Lagi <ChevronRight size={16} />
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Playing ───────────────────────────────────────────────────────────────────
  const typeColor = scenario ? TYPE_COLORS[scenario.type] : TYPE_COLORS.bunga_tunggal;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gs-bg)" }}>
      <SEO title="Bank Pintar" description="" url="/games/bank-pintar" />
      <Navbar />

      <main style={{ flex: 1, maxWidth: "560px", margin: "0 auto", padding: isMobile ? "20px 16px" : "36px 40px", width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>

        {/* Header: nyawa, skor, level */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "4px" }}>
            {Array.from({ length: MAX_LIVES }, (_, i) => (
              <Heart key={i} size={22} color={i < lives ? "#e84c2b" : "var(--gs-border)"} fill={i < lives ? "#e84c2b" : "none"} />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "18px", fontWeight: "800", color: "var(--gs-text)" }}>
            <Zap size={16} color="#f5a623" fill="#f5a623" />
            {score}
          </div>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--gs-text-muted)", background: "var(--gs-hover)", borderRadius: "20px", padding: "5px 12px" }}>
            Level {level}
            {band !== "easy" && (
              <span style={{ marginLeft: "6px", color: band === "hard" ? "#e84c2b" : "#f5a623" }}>
                {band === "hard" ? "●●●" : "●●"}
              </span>
            )}
          </div>
        </div>

        {/* Timer bar */}
        <div style={{ width: "100%", height: "6px", background: "var(--gs-border)", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, borderRadius: "3px", transition: "width 1s linear, background .3s" }} />
        </div>

        {/* Scenario card */}
        {scenario && (
          <div style={{ background: "var(--gs-surface)", borderRadius: "16px", border: "1px solid var(--gs-border)", padding: isMobile ? "18px" : "24px", display: "flex", flexDirection: "column", gap: "18px" }}>

            {/* Type badge + timer */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "99px", color: typeColor.color, background: typeColor.bg }}>
                {scenario.typeLabel}
              </span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: timerColor, fontFamily: "monospace" }}>
                {timeLeft}s
              </span>
            </div>

            {/* Question */}
            <p style={{ fontSize: isMobile ? "14px" : "15px", color: "var(--gs-text)", lineHeight: "1.65", fontWeight: "500", margin: 0 }}>
              {scenario.question}
            </p>

            {/* Choices 2×2 grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {scenario.choices.map((v) => {
                let bg = "var(--gs-surface)", border = "1px solid var(--gs-border)", color = "var(--gs-text)", icon = null;

                if (feedback) {
                  if (v === scenario.correct) {
                    bg = "#e4f5f0"; border = "1.5px solid #1a8a6e"; color = "#1a8a6e";
                    icon = <Check size={14} />;
                  } else if (feedback.type !== "timeout" && v === selectedChoice) {
                    bg = "#fff3f0"; border = "1.5px solid #e84c2b"; color = "#e84c2b";
                    icon = <X size={14} />;
                  } else {
                    bg = "var(--gs-surface-subtle)"; color = "var(--gs-text-hint)"; border = "1px solid var(--gs-border)";
                  }
                }

                return (
                  <button key={v} onClick={() => handleChoice(v)} disabled={!!feedback}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "14px 10px", borderRadius: "12px", border, background: bg, color, fontSize: isMobile ? "13px" : "14px", fontWeight: "700", cursor: feedback ? "default" : "pointer", fontFamily: "monospace", transition: "all .12s", lineHeight: 1 }}
                    onMouseEnter={(e) => { if (!feedback) e.currentTarget.style.background = "var(--gs-hover)"; }}
                    onMouseLeave={(e) => { if (!feedback) e.currentTarget.style.background = "white"; }}
                  >
                    {icon}{formatChoice(v, scenario?.unit)}
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {feedback && (
              <div style={{ borderRadius: "10px", padding: "12px 14px", background: feedback.type === "correct" ? "#e4f5f0" : "#fff3f0", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: feedback.type === "correct" ? "#1a8a6e" : "#e84c2b" }}>
                  {feedback.type === "correct"
                    ? `✓ Benar! +${feedback.points} poin`
                    : feedback.type === "timeout"
                    ? `⏱ Waktu habis!`
                    : `✗ Salah!`}
                </div>
                <div style={{ fontSize: "12px", color: "var(--gs-text-muted)", fontFamily: "monospace", lineHeight: 1.5 }}>
                  {scenario.formula}
                </div>
              </div>
            )}
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: "12px", color: "var(--gs-text-hint)" }}>
          Pilih jawaban sebelum waktu habis · {scenario?.hint}
        </p>
      </main>

      <Footer />
    </div>
  );
}
