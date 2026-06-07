import { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Zap, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import SEO from "../../../components/SEO";
import useWindowWidth from "../../../hooks/useWindowWidth";
import { generateQuestion } from "./sequenceGenerator";

const TIMER_MAX = 10;
const MAX_LIVES = 3;
const SCORE_CORRECT = 100;
const SCORE_SPEED_MAX = 50;

export default function NumberSequenceGame() {
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [phase, setPhase] = useState("idle"); // idle | playing | gameover
  const [question, setQuestion] = useState(null);
  const [input, setInput] = useState("");
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_MAX);
  const [feedback, setFeedback] = useState(null); // { type: 'correct'|'wrong'|'timeout', points }
  const [bestScore, setBestScore] = useState(0);

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const questionStartRef = useRef(null); // timestamp saat soal dimulai

  const loadNextQuestion = useCallback((lvl) => {
    setQuestion(generateQuestion(lvl));
    setInput("");
    setTimeLeft(TIMER_MAX);
    setFeedback(null);
    questionStartRef.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleTimeout = useCallback(() => {
    setFeedback({ type: "timeout", points: 0 });
    setLives((prev) => {
      const next = prev - 1;
      if (next <= 0) setTimeout(() => setPhase("gameover"), 900);
      return next;
    });
    setTimeout(() => {
      setLevel((lvl) => { loadNextQuestion(lvl); return lvl; });
    }, 900);
  }, [loadNextQuestion]);

  useEffect(() => {
    if (phase !== "playing" || feedback) return;
    if (timeLeft <= 0) { handleTimeout(); return; }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [phase, timeLeft, feedback, handleTimeout]);

  // update best score on gameover
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

  function handleSubmit(e) {
    e.preventDefault();
    if (!question || feedback) return;
    const val = parseInt(input, 10);
    if (isNaN(val)) return;

    clearTimeout(timerRef.current);

    // Hitung elapsed time secara presisi untuk bonus score non-kelipatan-5
    const elapsed = (Date.now() - questionStartRef.current) / 1000;
    const remaining = Math.max(0, TIMER_MAX - elapsed);

    if (val === question.answer) {
      const speedBonus = Math.floor((remaining / TIMER_MAX) * SCORE_SPEED_MAX);
      const points = SCORE_CORRECT + speedBonus;
      setScore((s) => s + points);
      setFeedback({ type: "correct", points });

      const nextCorrect = correctCount + 1;
      setCorrectCount(nextCorrect);
      const nextLevel = 1 + Math.floor(nextCorrect / 3);

      setTimeout(() => {
        setLevel(nextLevel);
        loadNextQuestion(nextLevel);
      }, 700);
    } else {
      setFeedback({ type: "wrong", points: 0 });
      setLives((prev) => {
        const next = prev - 1;
        if (next <= 0) setTimeout(() => setPhase("gameover"), 900);
        return next;
      });
      setTimeout(() => {
        setLevel((lvl) => { loadNextQuestion(lvl); return lvl; });
      }, 900);
    }
  }

  const timerPct = (timeLeft / TIMER_MAX) * 100;
  const timerColor = timeLeft <= 3 ? "#e84c2b" : timeLeft <= 6 ? "#f5a623" : "#1a8a6e";

  // ── Idle screen ──────────────────────────────────────────────
  if (phase === "idle") {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#faf9f6" }}>
        <SEO title="Number Sequence" description="Tebak angka berikutnya dari pola deret." url="/games/number-sequence" />
        <Navbar />
        <main
          style={{
            flex: 1,
            maxWidth: "600px",
            margin: "0 auto",
            padding: isMobile ? "32px 20px" : "56px 40px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: isMobile ? "40px" : "52px",
              fontWeight: "800",
              color: "#0f0e17",
              letterSpacing: "-1px",
              fontFamily: "monospace",
            }}
          >
            1, 2, 3, <span style={{ color: "#e84c2b" }}>?</span>
          </div>
          <div>
            <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "#0f0e17", marginBottom: "8px" }}>
              Number Sequence
            </h1>
            <p style={{ fontSize: "15px", color: "#6b6860", lineHeight: "1.6" }}>
              Tebak angka berikutnya dari pola deret.<br />
              Jawab cepat untuk bonus skor!
            </p>
          </div>

          {/* Info cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "10px",
              width: "100%",
            }}
          >
            {[
              { value: "+100", label: "jawaban benar", color: "#1a8a6e", bg: "#e4f5f0" },
              { value: "+50", label: "bonus kecepatan", color: "#2563eb", bg: "#eff6ff" },
              { value: "3", label: "nyawa", color: "#e84c2b", bg: "#fff3f0" },
            ].map(({ value, label, color, bg }) => (
              <div
                key={label}
                style={{
                  background: bg,
                  borderRadius: "12px",
                  padding: "14px 10px",
                }}
              >
                <div style={{ fontSize: isMobile ? "20px" : "24px", fontWeight: "800", color }}>{value}</div>
                <div style={{ fontSize: "11px", color: "#6b6860", marginTop: "4px" }}>{label}</div>
              </div>
            ))}
          </div>

          {bestScore > 0 && (
            <div
              style={{
                fontSize: "13px",
                color: "#6b6860",
                background: "#f2efe8",
                borderRadius: "10px",
                padding: "10px 20px",
              }}
            >
              Skor terbaik sesi ini: <strong style={{ color: "#0f0e17" }}>{bestScore}</strong>
            </div>
          )}

          <button
            onClick={startGame}
            style={{
              background: "#e84c2b",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "14px 40px",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#c43d20")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#e84c2b")}
          >
            Mulai Game <ChevronRight size={18} />
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Game Over screen ──────────────────────────────────────────
  if (phase === "gameover") {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#faf9f6" }}>
        <SEO title="Game Over — Number Sequence" description="" url="/games/number-sequence" />
        <Navbar />
        <main
          style={{
            flex: 1,
            maxWidth: "600px",
            margin: "0 auto",
            padding: isMobile ? "32px 20px" : "56px 40px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "#faeeda",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trophy size={36} color="#f5a623" />
          </div>

          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f0e17", marginBottom: "4px" }}>
              Game Over!
            </h1>
            <p style={{ fontSize: "14px", color: "#6b6860" }}>Level tertinggi: {level}</p>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "16px",
              border: "1px solid #e2ddd5",
              padding: "28px 40px",
              width: "100%",
            }}
          >
            <div style={{ fontSize: "13px", color: "#6b6860", marginBottom: "6px" }}>Skor akhir</div>
            <div style={{ fontSize: isMobile ? "48px" : "60px", fontWeight: "800", color: "#0f0e17", letterSpacing: "-2px" }}>
              {score}
            </div>
            {bestScore > score && (
              <div style={{ fontSize: "13px", color: "#6b6860", marginTop: "8px" }}>
                Terbaik: <strong style={{ color: "#0f0e17" }}>{bestScore}</strong>
              </div>
            )}
            {score >= bestScore && bestScore > 0 && (
              <div
                style={{
                  marginTop: "10px",
                  display: "inline-block",
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  background: "#e4f5f0",
                  color: "#1a8a6e",
                }}
              >
                🏆 Skor Terbaik Baru!
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", width: "100%" }}>
            <button
              onClick={() => setPhase("idle")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #e2ddd5",
                background: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
                color: "#0f0e17",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f2efe8")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              <ChevronLeft size={16} /> Kembali
            </button>
            <button
              onClick={startGame}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                background: "#e84c2b",
                color: "white",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#c43d20")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#e84c2b")}
            >
              Main Lagi <ChevronRight size={16} />
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Playing screen ────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#faf9f6" }}>
      <SEO title="Number Sequence" description="" url="/games/number-sequence" />
      <Navbar />

      <main
        style={{
          flex: 1,
          maxWidth: "560px",
          margin: "0 auto",
          padding: isMobile ? "20px 16px" : "36px 40px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {/* Header: nyawa, skor, level */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Nyawa */}
          <div style={{ display: "flex", gap: "4px" }}>
            {Array.from({ length: MAX_LIVES }, (_, i) => (
              <Heart
                key={i}
                size={22}
                color={i < lives ? "#e84c2b" : "#e2ddd5"}
                fill={i < lives ? "#e84c2b" : "none"}
              />
            ))}
          </div>

          {/* Skor */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "18px",
              fontWeight: "800",
              color: "#0f0e17",
            }}
          >
            <Zap size={16} color="#f5a623" fill="#f5a623" />
            {score}
          </div>

          {/* Level */}
          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#6b6860",
              background: "#f2efe8",
              borderRadius: "20px",
              padding: "5px 12px",
            }}
          >
            Level {level}
          </div>
        </div>

        {/* Timer bar */}
        <div
          style={{
            width: "100%",
            height: "6px",
            background: "#e2ddd5",
            borderRadius: "3px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${timerPct}%`,
              background: timerColor,
              borderRadius: "3px",
              transition: "width 1s linear, background .3s",
            }}
          />
        </div>

        {/* Soal card */}
        {question && (
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              border: "1px solid #e2ddd5",
              padding: isMobile ? "20px" : "28px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Tipe deret */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#b4b2a9",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Deret {question.type === "arithmetic" ? "Aritmatika" : "Geometri"}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: timerColor,
                  fontFamily: "monospace",
                }}
              >
                {timeLeft}s
              </span>
            </div>

            {/* Angka-angka */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {question.terms.map((n, i) => (
                <div
                  key={i}
                  style={{
                    background: "#eff6ff",
                    color: "#2563eb",
                    fontWeight: "800",
                    fontSize: isMobile ? "20px" : "24px",
                    borderRadius: "12px",
                    padding: isMobile ? "10px 14px" : "12px 18px",
                    fontFamily: "monospace",
                  }}
                >
                  {n}
                </div>
              ))}
              <div
                style={{
                  fontSize: isMobile ? "28px" : "36px",
                  fontWeight: "800",
                  color: "#e2ddd5",
                  padding: "0 4px",
                }}
              >
                ?
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div
                style={{
                  textAlign: "center",
                  fontWeight: "700",
                  fontSize: "15px",
                  borderRadius: "10px",
                  padding: "12px",
                  background: feedback.type === "correct" ? "#e4f5f0" : "#fff3f0",
                  color: feedback.type === "correct" ? "#1a8a6e" : "#e84c2b",
                }}
              >
                {feedback.type === "correct"
                  ? `+${feedback.points} poin!`
                  : feedback.type === "timeout"
                  ? `Waktu habis! Jawaban: ${question.answer}`
                  : `Salah! Jawaban: ${question.answer}`}
              </div>
            )}

            {/* Input */}
            {!feedback && (
              <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }}>
                <input
                  ref={inputRef}
                  type="number"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Jawaban..."
                  autoComplete="off"
                  style={{
                    flex: 1,
                    border: "1px solid #e2ddd5",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    fontSize: "18px",
                    fontWeight: "700",
                    fontFamily: "inherit",
                    color: "#0f0e17",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
                />
                <button
                  type="submit"
                  style={{
                    background: "#e84c2b",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px 20px",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#c43d20")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#e84c2b")}
                >
                  OK
                </button>
              </form>
            )}
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: "12px", color: "#b4b2a9" }}>
          Tekan Enter untuk menjawab
        </p>
      </main>

      <Footer />
    </div>
  );
}
