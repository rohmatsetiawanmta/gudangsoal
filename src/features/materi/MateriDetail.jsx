// src/features/materi/MateriDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  BookOpen, Sigma, AlignLeft, ChevronLeft, ChevronRight, BookMarked, Lightbulb,
  AlertTriangle, Eye, Copy, Share2, Flag, Check, X, Lock, UserPlus, Brain,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import MathRenderer from "../../components/MathRenderer";
import Breadcrumb from "../../components/Breadcrumb";
import useWindowWidth from "../../hooks/useWindowWidth";
import api from "../../lib/api";
import { useAuthStore } from "../../features/auth/authStore";

// ── Highlight blocks ──────────────────────────────────────────────────────────

const HIGHLIGHT_STYLE = {
  definisi:  { icon: BookMarked,    color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", label: "Definisi" },
  rumus:     { icon: Sigma,         color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", label: "Rumus" },
  ringkasan: { icon: AlignLeft,     color: "#1a8a6e", bg: "#e4f5f0", border: "#6ee7b7", label: "Ringkasan" },
  contoh:    { icon: Lightbulb,     color: "#f5a623", bg: "#fef9ee", border: "#fcd34d", label: "Contoh" },
  catatan:   { icon: AlertTriangle, color: "#e84c2b", bg: "#fff3f0", border: "#fca5a5", label: "Catatan" },
};

function HighlightBlock({ item }) {
  const s = HIGHLIGHT_STYLE[item.type] || HIGHLIGHT_STYLE.rumus;
  const Icon = s.icon;
  return (
    <div style={{ borderRadius: "14px", border: `1px solid ${s.border}`, background: s.bg, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", borderBottom: `1px solid ${s.border}`, background: s.bg }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: s.color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={14} color={s.color} />
        </div>
        <div>
          <span style={{ fontSize: "10px", fontWeight: "700", color: s.color, textTransform: "uppercase", letterSpacing: ".06em" }}>
            {s.label}
          </span>
          {item.label && (
            <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--gs-text)", lineHeight: 1.2 }}>
              <MathRenderer text={item.label} />
            </div>
          )}
        </div>
      </div>
      <div style={{ padding: "14px 16px", fontSize: "14px", lineHeight: "1.7", color: "var(--gs-text)" }}>
        <MathRenderer text={item.content} block />
      </div>
    </div>
  );
}

// ── Sibling materi listing ────────────────────────────────────────────────────

function SiblingList({ siblings, currentId, onNavigate }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {siblings.map((s, i) => {
        const isCurrent = s.id === currentId;
        return (
          <button
            key={s.id}
            onClick={() => !isCurrent && onNavigate(s.id)}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "9px 12px", borderRadius: "10px",
              border: `1px solid ${isCurrent ? "#fca5a5" : "var(--gs-border)"}`,
              boxShadow: isCurrent ? "inset 3px 0 0 #e84c2b" : "none",
              background: isCurrent ? "#fff3f0" : "var(--gs-surface)",
              cursor: isCurrent ? "default" : "pointer",
              textAlign: "left", fontFamily: "inherit", transition: "all .15s",
            }}
            onMouseEnter={e => { if (!isCurrent) { e.currentTarget.style.background = "var(--gs-hover)"; e.currentTarget.style.borderColor = "var(--gs-text-hint)"; }}}
            onMouseLeave={e => { if (!isCurrent) { e.currentTarget.style.background = "var(--gs-surface)"; e.currentTarget.style.borderColor = "var(--gs-border)"; }}}
          >
            <span style={{
              width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0,
              background: isCurrent ? "#e84c2b" : "var(--gs-hover)",
              color: isCurrent ? "white" : "var(--gs-text-hint)",
              fontSize: "10px", fontWeight: "700",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{i + 1}</span>
            <span style={{
              fontSize: "13px", fontWeight: isCurrent ? "700" : "500",
              color: isCurrent ? "#b91c1c" : "var(--gs-text)",
              flex: 1, lineHeight: 1.4, textAlign: "left",
            }}>
              <MathRenderer text={s.judul} />
            </span>
            {!isCurrent && <ChevronRight size={13} color="var(--gs-text-hint)" style={{ flexShrink: 0 }} />}
          </button>
        );
      })}
    </div>
  );
}

function MateriSidebar({ siblings, currentId, onNavigate }) {
  if (!Array.isArray(siblings) || siblings.length <= 1) return null;
  return (
    <div style={{
      background: "var(--gs-surface)", borderRadius: "14px",
      border: "1px solid var(--gs-border)",
      borderLeft: "3px solid #e84c2b",
      overflow: "hidden",
      position: "sticky", top: "80px",
    }}>
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid var(--gs-border)",
        background: "linear-gradient(to right, var(--gs-surface-subtle), var(--gs-surface))",
        display: "flex", alignItems: "center", gap: "8px",
      }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#e84c2b", flexShrink: 0 }} />
        <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--gs-text)" }}>
          Materi di Subtopik Ini
        </span>
        <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "600", color: "var(--gs-text-hint)", background: "var(--gs-hover)", padding: "2px 7px", borderRadius: "99px" }}>
          {siblings.length}
        </span>
      </div>
      <div style={{ padding: "10px", maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
        <SiblingList siblings={siblings} currentId={currentId} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

function MateriNav({ siblings, currentId, onNavigate }) {
  if (!Array.isArray(siblings) || siblings.length <= 1) return null;
  return (
    <div style={{ marginTop: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--gs-text-hint)", textTransform: "uppercase", letterSpacing: ".08em", whiteSpace: "nowrap" }}>Materi lainnya</span>
        <div style={{ flex: 1, height: "1px", background: "var(--gs-border)" }} />
      </div>
      <SiblingList siblings={siblings} currentId={currentId} onNavigate={onNavigate} />
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ h = "20px", w = "100%", r = "8px", mb = "0" }) {
  return <div style={{ height: h, width: w, borderRadius: r, background: "var(--gs-border)", marginBottom: mb, animation: "pulse 1.5s infinite" }} />;
}

// ── Icon action button (lives on dark header) ─────────────────────────────────

function ActionBtn({ onClick, icon: Icon, title, active, activeColor = "#1a8a6e", activeBg = "#e4f5f0", activeBorder = "#6ee7b7", danger }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "32px", height: "32px", borderRadius: "8px",
          border: `1px solid ${active ? activeBorder : hovered ? (danger ? "#fca5a5" : "rgba(255,255,255,.35)") : "rgba(255,255,255,.15)"}`,
          background: active ? activeBg : hovered ? (danger ? "rgba(232,76,43,.15)" : "rgba(255,255,255,.12)") : "rgba(255,255,255,.07)",
          cursor: "pointer",
          color: active ? activeColor : hovered ? (danger ? "#e84c2b" : "white") : "rgba(255,255,255,.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .15s",
        }}
      >
        <Icon size={14} />
      </button>
      {hovered && (
        <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: "#0f0e17", color: "white", fontSize: "11px", fontWeight: "500", padding: "4px 8px", borderRadius: "6px", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 10 }}>
          {title}
          <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "4px solid #0f0e17" }} />
        </div>
      )}
    </div>
  );
}

// ── Report Modal ──────────────────────────────────────────────────────────────

const ALASAN_OPTIONS = [
  "Konten salah atau menyesatkan",
  "Rumus / formula salah",
  "Tulisan sulit dibaca / ada typo",
  "Materi tidak relevan dengan subtopik",
  "Lainnya",
];

function ReportModal({ materiId, judul, onClose, isMobile }) {
  const [alasan,    setAlasan]    = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState("");

  const handleSubmit = async () => {
    if (!alasan) { setError("Pilih alasan laporan"); return; }
    setLoading(true); setError("");
    try {
      await api.post(`/materi/${materiId}/report`, { alasan, deskripsi: deskripsi || null });
      setSuccess(true);
      setTimeout(onClose, 2200);
    } catch {
      setError("Gagal mengirim laporan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "16px" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "var(--gs-surface)", borderRadius: "18px", padding: isMobile ? "20px 18px" : "28px", maxWidth: "440px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Flag size={18} color="#e84c2b" />
            <h3 style={{ fontSize: "17px", fontWeight: "800", color: "var(--gs-text)", margin: 0 }}>Laporkan Materi</h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gs-text-muted)", display: "flex" }}>
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div style={{ background: "#e4f5f0", border: "1px solid #9FE1CB", color: "#0F6E56", fontSize: "14px", borderRadius: "12px", padding: "20px", textAlign: "center", fontWeight: "500" }}>
            Laporan berhasil dikirim, terima kasih!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ background: "var(--gs-hover)", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "var(--gs-text-muted)" }}>
              <span style={{ fontWeight: "600", color: "var(--gs-text)" }}>{judul}</span>
            </div>

            {error && (
              <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "13px", borderRadius: "10px", padding: "10px 14px" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--gs-text)" }}>Alasan Laporan</label>
              {ALASAN_OPTIONS.map(opt => (
                <label key={opt} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${alasan === opt ? "#e84c2b" : "var(--gs-border)"}`, background: alasan === opt ? "#fff3f0" : "var(--gs-surface)", cursor: "pointer", transition: "all .15s" }}>
                  <input type="radio" name="alasan" value={opt} checked={alasan === opt} onChange={() => setAlasan(opt)} style={{ accentColor: "#e84c2b", flexShrink: 0 }} />
                  <span style={{ fontSize: "14px", color: alasan === opt ? "#e84c2b" : "var(--gs-text)", fontWeight: alasan === opt ? "600" : "400" }}>{opt}</span>
                </label>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--gs-text)" }}>
                Deskripsi <span style={{ fontWeight: "400", color: "var(--gs-text-muted)" }}>(opsional)</span>
              </label>
              <textarea value={deskripsi} onChange={e => setDeskripsi(e.target.value)}
                placeholder="Jelaskan lebih lanjut..." rows={3}
                style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--gs-border)", fontSize: "14px", outline: "none", fontFamily: "inherit", color: "var(--gs-text)", background: "var(--gs-input-bg)", resize: "none", lineHeight: "1.6" }}
                onFocus={e => (e.target.style.borderColor = "#e84c2b")}
                onBlur={e => (e.target.style.borderColor = "var(--gs-border)")} />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: "10px", border: "1px solid var(--gs-border)", background: "var(--gs-surface)", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "var(--gs-text)" }}>Batal</button>
              <button onClick={handleSubmit} disabled={loading || !alasan}
                style={{ padding: "9px 20px", borderRadius: "10px", border: "none", background: loading || !alasan ? "var(--gs-border)" : "#e84c2b", color: loading || !alasan ? "var(--gs-text-hint)" : "white", fontSize: "14px", fontWeight: "600", cursor: loading || !alasan ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {loading ? "Mengirim..." : "Kirim Laporan"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Content Gate ──────────────────────────────────────────────────────────────

function ContentGate({ isMobile }) {
  return (
    <div style={{ background: "var(--gs-surface)", borderRadius: "16px", border: "1px solid var(--gs-border)", padding: isMobile ? "28px 20px" : "36px 40px", textAlign: "center", marginBottom: "16px" }}>
      <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Lock size={22} color="#e84c2b" />
      </div>
      <div style={{ fontSize: "17px", fontWeight: "800", color: "var(--gs-text)", marginBottom: "8px" }}>
        Baca materi selengkapnya
      </div>
      <p style={{ fontSize: "14px", color: "var(--gs-text-muted)", lineHeight: "1.6", maxWidth: "320px", margin: "0 auto 24px" }}>
        Daftar gratis untuk akses penuh ke semua materi, soal latihan, dan fitur belajar lainnya.
      </p>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
        <Link to="/register" style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 22px", borderRadius: "10px", background: "#e84c2b", color: "white", fontSize: "14px", fontWeight: "700", textDecoration: "none", boxShadow: "0 4px 14px rgba(232,76,43,.3)" }}>
          <UserPlus size={15} /> Daftar Gratis
        </Link>
        <Link to="/login" style={{ display: "inline-flex", alignItems: "center", padding: "10px 22px", borderRadius: "10px", background: "var(--gs-surface)", border: "1px solid var(--gs-border)", color: "var(--gs-text)", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
          Sudah punya akun? Masuk
        </Link>
      </div>
    </div>
  );
}

// ── Quiz Card ─────────────────────────────────────────────────────────────────

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

function checkAnswer(tipe, userInput, jawaban) {
  const u = String(userInput).trim();
  const j = String(jawaban).trim();
  if (tipe === "isian_numerik") {
    const norm = s => parseFloat(s.replace(",", "."));
    return norm(u) === norm(j);
  }
  if (u.toLowerCase() === j.toLowerCase()) return true;
  // toleransi koma↔titik untuk jawaban numerik teks (misal "0,2" vs "0.2")
  const norm = s => s.replace(",", ".").replace(".", ",");
  return norm(u).toLowerCase() === j.toLowerCase() || u.toLowerCase() === norm(j).toLowerCase();
}

function QuizCard({ question, index, answer, onAnswer, isMobile, materiId, isLoggedIn }) {
  const [userInput,       setUserInput]       = useState('');
  const [selectedOption,  setSelectedOption]  = useState(null);
  const [xpEarned,        setXpEarned]        = useState(null);
  const isAnswered = answer !== undefined;

  const correctLabel = (() => {
    const j = question.jawaban;
    if (!j) return null;
    if (OPTION_LABELS.includes(j)) return j;
    const idx = (question.pilihan || []).indexOf(j);
    return idx >= 0 ? OPTION_LABELS[idx] : null;
  })();

  const userAnswerLabel = (() => {
    const ua = answer?.userAnswer;
    if (!ua) return null;
    if (OPTION_LABELS.includes(ua)) return ua;
    const idx = (question.pilihan || []).indexOf(ua);
    return idx >= 0 ? OPTION_LABELS[idx] : null;
  })();

  const submitAnswer = async (userAnswer, isCorrect) => {
    onAnswer(index, userAnswer, isCorrect);
    if (isLoggedIn) {
      try {
        const res = await api.post(`/materi/${materiId}/answer`, { question_index: index, user_answer: userAnswer });
        if (res.xp_earned > 0) setXpEarned(res.xp_earned);
      } catch {}
    }
  };

  return (
    <div style={{
      background: "var(--gs-surface)", borderRadius: "16px",
      border: "1px solid var(--gs-border)",
      borderLeft: `3px solid ${isAnswered ? (answer.isCorrect ? "#1a8a6e" : "#e84c2b") : "#2563eb"}`,
      overflow: "hidden",
    }}>
      <div style={{ padding: isMobile ? "14px 16px" : "16px 20px", borderBottom: "1px solid var(--gs-divider)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--gs-text-hint)", background: "var(--gs-hover)", padding: "3px 8px", borderRadius: "6px", flexShrink: 0, marginTop: "2px" }}>
            {index + 1}
          </span>
          <div style={{ fontSize: "14px", color: "var(--gs-text)", lineHeight: "1.6", fontWeight: "500" }}>
            <MathRenderer text={question.teks} />
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? "14px 16px" : "16px 20px" }}>
        {question.tipe === "pilihan_ganda" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {(question.pilihan || []).map((p, pi) => {
              const isCorrect  = OPTION_LABELS[pi] === correctLabel;
              const isSelected = isAnswered ? userAnswerLabel === OPTION_LABELS[pi] : selectedOption === OPTION_LABELS[pi];
              let bg = "var(--gs-surface)", border = "var(--gs-border)";
              if (isAnswered) {
                if (isCorrect)       { bg = "#e4f5f0"; border = "#1a8a6e"; }
                else if (isSelected) { bg = "#fff3f0"; border = "#e84c2b"; }
              } else if (isSelected) {
                bg = "#eff6ff"; border = "#2563eb";
              }
              return (
                <button key={pi} type="button"
                  disabled={isAnswered}
                  onClick={() => !isAnswered && setSelectedOption(OPTION_LABELS[pi])}
                  style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${border}`, background: bg, cursor: isAnswered ? "default" : "pointer", textAlign: "left", fontFamily: "inherit", transition: "all .15s", width: "100%" }}
                  onMouseEnter={e => { if (!isAnswered && selectedOption !== OPTION_LABELS[pi]) { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.background = "#eff6ff"; }}}
                  onMouseLeave={e => { if (!isAnswered && selectedOption !== OPTION_LABELS[pi]) { e.currentTarget.style.borderColor = "var(--gs-border)"; e.currentTarget.style.background = "var(--gs-surface)"; }}}
                >
                  <span style={{ fontSize: "12px", fontWeight: "700", width: "24px", height: "24px", borderRadius: "6px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isAnswered && isCorrect ? "#1a8a6e" : isAnswered && isSelected ? "#e84c2b" : (!isAnswered && isSelected) ? "#2563eb" : "var(--gs-hover)", color: (isAnswered && (isCorrect || isSelected)) || (!isAnswered && isSelected) ? "white" : "var(--gs-text-muted)" }}>
                    {OPTION_LABELS[pi]}
                  </span>
                  <span style={{ fontSize: "14px", color: "var(--gs-text)", lineHeight: "1.5", flex: 1 }}>
                    <MathRenderer text={p} />
                  </span>
                  {isAnswered && isCorrect  && <Check size={15} color="#1a8a6e" style={{ flexShrink: 0 }} />}
                  {isAnswered && isSelected && !isCorrect && <X size={15} color="#e84c2b" style={{ flexShrink: 0 }} />}
                </button>
              );
            })}
            {!isAnswered && selectedOption !== null && (
              <button type="button"
                onClick={() => submitAnswer(selectedOption, selectedOption === correctLabel)}
                style={{ alignSelf: "flex-end", padding: "10px 24px", borderRadius: "10px", border: "none", background: "#2563eb", color: "white", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", marginTop: "4px" }}>
                Submit
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type={question.tipe === "isian_numerik" ? "number" : "text"}
                value={isAnswered ? answer.userAnswer : userInput}
                onChange={e => !isAnswered && setUserInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key !== "Enter" || isAnswered || !userInput.trim()) return;
                  submitAnswer(userInput.trim(), checkAnswer(question.tipe, userInput, question.jawaban));
                }}
                disabled={isAnswered}
                placeholder={question.tipe === "isian_numerik" ? "Masukkan angka..." : "Tulis jawabanmu..."}
                style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${isAnswered ? (answer.isCorrect ? "#1a8a6e" : "#e84c2b") : "var(--gs-border)"}`, background: isAnswered ? (answer.isCorrect ? "#e4f5f0" : "#fff3f0") : "var(--gs-surface)", fontSize: "14px", outline: "none", fontFamily: "inherit", color: "var(--gs-text)" }}
                onFocus={e => { if (!isAnswered) e.target.style.borderColor = "#2563eb"; }}
                onBlur={e => { if (!isAnswered) e.target.style.borderColor = "var(--gs-border)"; }}
              />
              {!isAnswered && (
                <button type="button"
                  onClick={() => {
                    if (!userInput.trim()) return;
                    submitAnswer(userInput.trim(), checkAnswer(question.tipe, userInput, question.jawaban));
                  }}
                  disabled={!userInput.trim()}
                  style={{ padding: "10px 18px", borderRadius: "10px", border: "none", background: userInput.trim() ? "#2563eb" : "var(--gs-border)", color: "white", fontSize: "13px", fontWeight: "700", cursor: userInput.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", flexShrink: 0 }}>
                  Submit
                </button>
              )}
            </div>
            {isAnswered && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: answer.isCorrect ? "#1a8a6e" : "#e84c2b" }}>
                {answer.isCorrect ? <Check size={14} /> : <X size={14} />}
                {answer.isCorrect ? "Benar!" : `Jawaban: ${correctLabel ?? question.jawaban}`}
              </div>
            )}
          </div>
        )}

        {xpEarned && (
          <div style={{ marginTop: "10px", display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "99px", background: "rgba(252,211,77,.15)", border: "1px solid rgba(252,211,77,.35)", fontSize: "13px", fontWeight: "700", color: "#92610c" }}>
            +{xpEarned} XP
          </div>
        )}

        {isAnswered && question.pembahasan && (
          <div style={{ marginTop: "12px", padding: "12px 14px", borderRadius: "10px", background: "var(--gs-hover)", border: "1px solid var(--gs-border)" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--gs-text-hint)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "6px" }}>Pembahasan</div>
            <div style={{ fontSize: "13px", color: "var(--gs-text)", lineHeight: "1.6" }}>
              <MathRenderer text={question.pembahasan} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function MateriDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const width    = useWindowWidth();
  const isMobile = width <= 480;
  const isWide   = width >= 900;
  const { isLoggedIn } = useAuthStore();

  const [materi, setMateri]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [copied, setCopied]   = useState(false);
  const [reportOpen, setReportOpen]           = useState(false);
  const [quizAnswers, setQuizAnswers]         = useState({});
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);

  const handleQuizAnswer = (qIndex, userAnswer, isCorrect) => {
    setQuizAnswers(prev => ({ ...prev, [qIndex]: { userAnswer, isCorrect } }));
  };

  useEffect(() => {
    setLoading(true);
    setQuizAnswers({});
    setActiveQuizIndex(0);
    api.get(`/materi/${id}`)
      .then(data => {
        setMateri(data);
        api.post(`/materi/${id}/view`).catch(() => {});
        if (isLoggedIn && Array.isArray(data.pertanyaan) && data.pertanyaan.length > 0) {
          api.get(`/materi/${id}/my-answers`)
            .then(prev => {
              const initial = {};
              Object.entries(prev).forEach(([qiStr, { is_correct, user_answer }]) => {
                const qi = parseInt(qiStr);
                if (data.pertanyaan[qi]) initial[qi] = { userAnswer: user_answer ?? '', isCorrect: is_correct };
              });
              if (Object.keys(initial).length > 0) {
                setQuizAnswers(initial);
                const firstUnanswered = data.pertanyaan.findIndex((_, qi) => !initial[qi]);
                setActiveQuizIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => setError("Materi tidak ditemukan atau belum dipublikasikan."))
      .finally(() => setLoading(false));
  }, [id, isLoggedIn]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://gudangsoal.com/materi/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWA = () => {
    const text = encodeURIComponent(`Baca materi ini di Gudang Soal!\nhttps://gudangsoal.com/materi/${id}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const breadcrumbItems = materi ? [
    { label: materi.jenjang,   to: `/browse/${materi.jenjang_slug}` },
    { label: materi.subjenjang },
    { label: materi.mapel },
    { label: materi.topik },
    { label: materi.subtopik },
    { label: materi.judul },
  ] : [];

  const highlights   = Array.isArray(materi?.highlights) ? materi.highlights : [];
  const pertanyaan   = Array.isArray(materi?.pertanyaan) ? materi.pertanyaan : [];
  const hasSiblings  = Array.isArray(materi?.siblings) && materi.siblings.length > 1;
  const showSidebar  = isWide && hasSiblings && !loading && !error;

  const siblings     = Array.isArray(materi?.siblings) ? materi.siblings : [];
  const currentIdx   = siblings.findIndex(s => s.id === materi?.id);
  const prevSibling  = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextSibling  = currentIdx >= 0 && currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  const PrevNextNav = () => {
    if (!prevSibling && !nextSibling) return null;
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "28px" }}>
        {prevSibling ? (
          <button onClick={() => navigate(`/materi/${prevSibling.id}`)} style={{
            display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px",
            padding: "14px 16px", borderRadius: "14px", border: "1px solid var(--gs-border)",
            background: "var(--gs-surface)", cursor: "pointer", fontFamily: "inherit",
            textAlign: "left", transition: "all .15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#e84c2b"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--gs-border)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "700", color: "var(--gs-text-hint)", textTransform: "uppercase", letterSpacing: ".06em" }}>
              <ChevronLeft size={12} /> Sebelumnya
            </span>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--gs-text)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              <MathRenderer text={prevSibling.judul} />
            </span>
          </button>
        ) : <div />}

        {nextSibling ? (
          <button onClick={() => navigate(`/materi/${nextSibling.id}`)} style={{
            display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px",
            padding: "14px 16px", borderRadius: "14px", border: "1px solid var(--gs-border)",
            background: "var(--gs-surface)", cursor: "pointer", fontFamily: "inherit",
            textAlign: "right", transition: "all .15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#e84c2b"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--gs-border)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "700", color: "var(--gs-text-hint)", textTransform: "uppercase", letterSpacing: ".06em" }}>
              Selanjutnya <ChevronRight size={12} />
            </span>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--gs-text)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              <MathRenderer text={nextSibling.judul} />
            </span>
          </button>
        ) : <div />}
      </div>
    );
  };

  const LatihanCTA = () => materi?.subtopik_slug ? (
    <div style={{ marginTop: "20px", background: "var(--gs-surface)", borderRadius: "14px", border: "1px solid var(--gs-border)", borderLeft: "3px solid #e84c2b", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
      <div>
        <div style={{ fontSize: "13px", fontWeight: "700", color: "var(--gs-text)", marginBottom: "2px" }}>Siap latihan soal?</div>
        <div style={{ fontSize: "12px", color: "var(--gs-text-muted)" }}>Kerjakan soal-soal dari subtopik <strong style={{ color: "var(--gs-text)" }}>{materi.subtopik}</strong></div>
      </div>
      <button
        onClick={() => navigate(`/browse/${materi.jenjang_slug}/${materi.subjenjang_slug}/${materi.mapel_slug}/${materi.topik_slug}/${materi.subtopik_slug}`)}
        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", flexShrink: 0, boxShadow: "0 4px 12px rgba(232,76,43,.3)" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#d4401f")}
        onMouseLeave={e => (e.currentTarget.style.background = "#e84c2b")}
      >
        Latihan Soal <ChevronRight size={14} />
      </button>
    </div>
  ) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gs-bg)" }}>
      <SEO
        title={materi?.judul}
        description={`Materi belajar: ${materi?.judul} — ${[materi?.mapel, materi?.topik, materi?.subtopik].filter(Boolean).join(", ")}`}
        url={`/materi/${id}`}
      />
      <Navbar />

      <main style={{ flex: 1, maxWidth: showSidebar ? "1120px" : "760px", width: "100%", margin: "0 auto", padding: isMobile ? "20px 16px 40px" : "32px 24px 56px" }}>
        <div style={{ display: "flex", gap: "24px" }}>

          {/* Sidebar kiri — materi lainnya */}
          {showSidebar && (
            <div style={{ width: "260px", flexShrink: 0 }}>
              <MateriSidebar
                siblings={materi.siblings}
                currentId={materi.id}
                onNavigate={id => navigate(`/materi/${id}`)}
              />
            </div>
          )}

          {/* Konten utama */}
          <div style={{ flex: 1, minWidth: 0 }}>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Skeleton h="14px" w="60%" mb="8px" />
            <Skeleton h="36px" w="80%" r="10px" mb="8px" />
            <Skeleton h="16px" w="40%" mb="24px" />
            <Skeleton h="200px" r="14px" />
          </div>
        ) : error ? (
          <div style={{ background: "var(--gs-surface)", borderRadius: "16px", border: "1px solid var(--gs-border)", padding: "60px 32px", textAlign: "center" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <BookOpen size={24} color="#e84c2b" />
            </div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--gs-text)", marginBottom: "8px" }}>Materi Tidak Ditemukan</div>
            <p style={{ fontSize: "13px", color: "var(--gs-text-muted)" }}>{error}</p>
          </div>
        ) : (
          <>
            {/* Breadcrumb */}
            <div style={{ marginBottom: "20px" }}>
              <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Header card — intentionally always dark */}
            <div style={{
              background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 60%, #0a1c1a 100%)",
              borderRadius: "18px", padding: isMobile ? "24px 20px" : "28px 32px",
              marginBottom: "20px", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%", transform: "translateY(-50%)", opacity: 0.06, pointerEvents: "none", color: "white" }}>
                <BookOpen size={isMobile ? 80 : 110} />
              </div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
                  {[materi.mapel, materi.topik, materi.subtopik].filter(Boolean).map((crumb, i, arr) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,.45)", fontWeight: "500" }}>{crumb}</span>
                      {i < arr.length - 1 && <ChevronRight size={11} color="rgba(255,255,255,.25)" />}
                    </span>
                  ))}
                </div>

                <h1 style={{ fontSize: isMobile ? "21px" : "26px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 14px", lineHeight: 1.25 }}>
                  <MathRenderer text={materi.judul} />
                </h1>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "#6ee7b7", background: "rgba(110,231,183,.12)" }}>
                      {materi.jenjang}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "rgba(255,255,255,.7)", background: "rgba(255,255,255,.1)" }}>
                      {materi.mapel}
                    </span>
                    {highlights.length > 0 && (
                      <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "#fcd34d", background: "rgba(252,211,77,.12)" }}>
                        {highlights.length} Highlight
                      </span>
                    )}
                    {pertanyaan.length > 0 && (
                      <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "#93c5fd", background: "rgba(147,197,253,.12)" }}>
                        {pertanyaan.length} Pertanyaan
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "8px", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)" }}>
                      <Eye size={13} color="rgba(255,255,255,.5)" />
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,.6)" }}>
                        {parseInt(materi.views || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <ActionBtn onClick={handleCopy} icon={copied ? Check : Copy} title={copied ? "Tersalin!" : "Salin link"} active={copied} activeColor="#1a8a6e" activeBg="rgba(110,231,183,.15)" activeBorder="rgba(110,231,183,.4)" />
                    <ActionBtn onClick={handleShareWA} icon={Share2} title="Bagikan ke WhatsApp" />
                    <ActionBtn onClick={() => setReportOpen(true)} icon={Flag} title="Laporkan materi" danger />
                  </div>
                </div>
              </div>
            </div>

            {/* Konten */}
            {isLoggedIn ? (
              <>
                {materi.konten ? (
                  <div style={{ background: "var(--gs-surface)", borderRadius: "16px", border: "1px solid var(--gs-border)", padding: isMobile ? "20px 18px" : "28px 32px", marginBottom: highlights.length > 0 ? "16px" : 0, fontSize: "15px", color: "var(--gs-text)" }}>
                    <MathRenderer text={materi.konten} block />
                  </div>
                ) : (
                  <div style={{ background: "var(--gs-surface)", borderRadius: "16px", border: "1px solid var(--gs-border)", padding: "32px", marginBottom: highlights.length > 0 ? "16px" : 0, textAlign: "center", color: "var(--gs-text-hint)", fontSize: "14px" }}>
                    Konten belum tersedia.
                  </div>
                )}

                {/* Highlights */}
                {highlights.length > 0 && (
                  <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ background: "linear-gradient(135deg, #3c1a00 0%, #b45309 100%)", borderRadius: "14px", padding: isMobile ? "16px 18px" : "18px 22px", display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Lightbulb size={18} color="white" />
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "800", color: "white", letterSpacing: "-0.2px" }}>Highlights</div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,.5)", marginTop: "2px" }}>{highlights.length} poin penting</div>
                      </div>
                    </div>
                    {highlights.map((h, i) => (
                      <HighlightBlock key={i} item={h} />
                    ))}
                  </div>
                )}

                {/* Cek Pemahaman */}
                {pertanyaan.length > 0 && (
                  <div style={{ marginTop: "24px" }}>
                    <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)", borderRadius: "14px", padding: isMobile ? "16px 18px" : "18px 22px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Brain size={18} color="white" />
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "800", color: "white", letterSpacing: "-0.2px" }}>Cek Pemahaman</div>
                          <div style={{ fontSize: "12px", color: "rgba(255,255,255,.5)", marginTop: "2px" }}>{pertanyaan.length} soal · uji pemahamanmu</div>
                        </div>
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: "700", padding: "5px 12px", borderRadius: "99px", flexShrink: 0, background: Object.keys(quizAnswers).length === pertanyaan.length ? "rgba(110,231,183,.25)" : "rgba(255,255,255,.12)", color: Object.keys(quizAnswers).length === pertanyaan.length ? "#6ee7b7" : "rgba(255,255,255,.7)" }}>
                        {Object.keys(quizAnswers).length}/{pertanyaan.length} dijawab
                      </div>
                    </div>

                    {pertanyaan.length > 1 && (
                      <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
                        {pertanyaan.map((_, qi) => {
                          const ans = quizAnswers[qi];
                          const isActive = qi === activeQuizIndex;
                          return (
                            <button key={qi} onClick={() => setActiveQuizIndex(qi)} style={{
                              width: "34px", height: "34px", borderRadius: "10px",
                              border: isActive ? "none" : "1px solid var(--gs-border)",
                              cursor: "pointer", fontSize: "13px", fontWeight: "700",
                              background: isActive ? "#2563eb" : ans ? (ans.isCorrect ? "#1a8a6e" : "#e84c2b") : "var(--gs-surface)",
                              color: isActive || ans ? "white" : "var(--gs-text-hint)",
                              transition: "all .15s", flexShrink: 0, fontFamily: "inherit",
                            }}>
                              {qi + 1}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <QuizCard
                      key={activeQuizIndex}
                      question={pertanyaan[activeQuizIndex]}
                      index={activeQuizIndex}
                      answer={quizAnswers[activeQuizIndex]}
                      onAnswer={handleQuizAnswer}
                      isMobile={isMobile}
                      materiId={id}
                      isLoggedIn={isLoggedIn}
                    />

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                      <button
                        onClick={() => setActiveQuizIndex(i => Math.max(0, i - 1))}
                        disabled={activeQuizIndex === 0}
                        style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "10px", border: "1px solid var(--gs-border)", background: "var(--gs-surface)", color: activeQuizIndex === 0 ? "var(--gs-border)" : "var(--gs-text-muted)", fontSize: "13px", fontWeight: "600", cursor: activeQuizIndex === 0 ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setActiveQuizIndex(i => Math.min(pertanyaan.length - 1, i + 1))}
                        disabled={activeQuizIndex === pertanyaan.length - 1}
                        style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "10px", border: "none", background: activeQuizIndex === pertanyaan.length - 1 ? "var(--gs-hover)" : "#2563eb", color: activeQuizIndex === pertanyaan.length - 1 ? "var(--gs-text-hint)" : "white", fontSize: "13px", fontWeight: "600", cursor: activeQuizIndex === pertanyaan.length - 1 ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                <PrevNextNav />
                <LatihanCTA />
                {!showSidebar && <MateriNav siblings={materi.siblings} currentId={materi.id} onNavigate={id => navigate(`/materi/${id}`)} />}
              </>
            ) : (
              <>
                {materi.konten && (
                  <div style={{ position: "relative", maxHeight: "220px", overflow: "hidden", borderRadius: "16px", marginBottom: "16px" }}>
                    <div style={{ background: "var(--gs-surface)", border: "1px solid var(--gs-border)", borderRadius: "16px", padding: isMobile ? "20px 18px" : "28px 32px", fontSize: "15px", color: "var(--gs-text)" }}>
                      <MathRenderer text={materi.konten} block />
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "120px", background: "linear-gradient(to bottom, transparent, var(--gs-bg))", pointerEvents: "none" }} />
                  </div>
                )}
                <ContentGate isMobile={isMobile} />
                <PrevNextNav />
                <LatihanCTA />
                {!showSidebar && <MateriNav siblings={materi.siblings} currentId={materi.id} onNavigate={id => navigate(`/materi/${id}`)} />}
              </>
            )}
          </>
        )}

          </div>{/* end konten utama */}
        </div>{/* end flex row */}
      </main>

      <Footer />

      {reportOpen && materi && (
        <ReportModal materiId={id} judul={materi.judul} onClose={() => setReportOpen(false)} isMobile={isMobile} />
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .math-content p { margin: 0 0 12px; }
        .math-content p:last-child { margin-bottom: 0; }
        .math-content h2 { font-size: 18px; font-weight: 700; color: var(--gs-text); margin: 24px 0 10px; }
        .math-content h3 { font-size: 16px; font-weight: 700; color: var(--gs-text); margin: 20px 0 8px; }
        .math-content ul, .math-content ol { margin: 0 0 12px; padding-left: 24px; }
        .math-content li { margin-bottom: 6px; line-height: 1.6; }
        .math-content strong { font-weight: 700; }
        .math-content code { background: var(--gs-hover); border-radius: 5px; padding: 2px 6px; font-size: 13px; }
        .math-content blockquote { border-left: 3px solid #e84c2b; margin: 0 0 12px; padding: 8px 16px; background: #fff3f0; border-radius: 0 8px 8px 0; }
      `}</style>
    </div>
  );
}
