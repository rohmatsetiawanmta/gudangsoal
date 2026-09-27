// src/features/materi/MateriDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  BookOpen, Sigma, AlignLeft, ChevronLeft, ChevronRight, BookMarked, Lightbulb,
  AlertTriangle, Eye, Share2, Flag, Check, X, Lock, UserPlus, Brain, Mail, Pencil,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import MathRenderer from "../../components/MathRenderer";
import Breadcrumb from "../../components/Breadcrumb";
import useWindowWidth from "../../hooks/useWindowWidth";
import { usePresence } from "../../hooks/usePresence";
import api from "../../lib/api";
import { useAuthStore } from "../../features/auth/authStore";

// ── Brand share icons ─────────────────────────────────────────────────────────

const WhatsAppIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.622 5.905-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const ThreadsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 192 192" fill="currentColor">
    <path d="M141.537 88.988a66.667 66.667 0 00-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.741C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.038.473 97.07.252h-.114C69.037.473 47.255 9.643 32.687 27.252 19.79 43.006 13.168 65.16 12.886 96c.282 30.84 6.904 52.994 19.801 68.748 14.568 17.609 36.35 26.78 63.319 27h.114c23.585-.188 41.744-6.92 55.3-20.465 18.007-18.006 17.699-40.556 11.74-54.44-4.254-9.92-12.374-17.985-21.623-23.855z"/>
    <path d="M96.546 128c-6.854 0-12.458-3.431-12.875-8.654-.32-3.969 2.095-6.693 3.388-7.741 2.316-1.853 5.437-2.896 9.143-3.109 3.63-.206 6.786-.012 9.468.568-.734 10.608-4.413 18.936-9.124 18.936z"/>
  </svg>
);
const TelegramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

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

// ── Content gate (shown to guest users) ───────────────────────────────────────

function ContentGate({ isMobile }) {
  const navigate = useNavigate();
  return (
    <div style={{ background: "var(--gs-surface)", borderRadius: "16px", border: "1px solid var(--gs-border)", padding: isMobile ? "28px 20px" : "36px 40px", textAlign: "center", marginBottom: "16px" }}>
      <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Lock size={24} color="#e84c2b" />
      </div>
      <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--gs-text)", marginBottom: "8px" }}>
        Daftar untuk akses penuh
      </div>
      <p style={{ fontSize: "13px", color: "var(--gs-text-muted)", lineHeight: "1.6", marginBottom: "20px", maxWidth: "320px", margin: "0 auto 20px" }}>
        Buat akun gratis untuk membaca materi lengkap, latihan soal, dan melacak progress belajarmu.
      </p>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button onClick={() => navigate("/register")} style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>
          Daftar Gratis
        </button>
        <button onClick={() => navigate("/login")} style={{ padding: "10px 24px", borderRadius: "10px", border: "1px solid var(--gs-border)", background: "var(--gs-surface)", color: "var(--gs-text)", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
          Masuk
        </button>
      </div>
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
      } catch { /* diabaikan: best-effort, boleh gagal senyap */ }
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
            <MathRenderer text={question.teks} block />
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
  const activeCount = usePresence(`materi/${id}`);
  const navigate = useNavigate();
  const width    = useWindowWidth();
  const isMobile = width <= 480;
  const isWide   = width >= 900;
  const { isLoggedIn, user } = useAuthStore();

  const [materi, setMateri]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [copied, setCopied]       = useState(false);
  const [shareOpen, setShareOpen]   = useState(false);
  const [shareCount, setShareCount] = useState(0);
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
        setShareCount(parseInt(data.share_count || 0));
        api.post(`/materi/${id}/view`)
          .then(() => setMateri(prev => prev ? { ...prev, views: Number(prev.views || 0) + 1 } : prev))
          .catch(() => {});
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

  const trackShare = async (platform) => {
    try {
      const json = await api.post(`/materi/${id}/share`, { platform });
      if (json.share_count !== undefined) setShareCount(json.share_count);
    } catch { /* diabaikan: best-effort, boleh gagal senyap */ }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://gudangsoal.com/materi/${id}`);
    trackShare("copy");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rawUrl    = `https://gudangsoal.com/materi/${id}`;
  const shareUrl  = encodeURIComponent(rawUrl);
  const judulLabel = materi?.judul ? `"${materi.judul}"` : "ini";
  const shareMsg  = `Lagi belajar ${judulLabel} di Gudang Soal! Materinya lengkap banget, cobain deh!\n${rawUrl}`;
  const shareText = encodeURIComponent(shareMsg);
  const SHARE_OPTIONS = [
    { label: "WhatsApp",   icon: <WhatsAppIcon />,  color: "#25D366", bg: "#f0fdf4", platform: "whatsapp", url: `https://wa.me/?text=${shareText}` },
    { label: "Telegram",   icon: <TelegramIcon />,  color: "#2AABEE", bg: "#e8f4fd", platform: "telegram", url: `https://t.me/share/url?url=${shareUrl}&text=${encodeURIComponent(`Lagi belajar ${judulLabel} di Gudang Soal! Materinya lengkap banget, cobain deh!`)}` },
    { label: "Facebook",   icon: <FacebookIcon />,  color: "#1877F2", bg: "#edf3fb", platform: "facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
    { label: "Twitter / X", icon: <XIcon />,        color: "#000",    bg: "#f5f5f5", platform: "twitter",  url: `https://twitter.com/intent/tweet?text=${shareText}` },
    { label: "Threads",    icon: <ThreadsIcon />,   color: "#000",    bg: "#f5f5f5", platform: "threads",  url: `https://www.threads.net/intent/post?text=${shareText}` },
    { label: "Email",      icon: <Mail size={15} />, color: "#6b6860", bg: "#f5f3ef", platform: "email",   url: `mailto:?subject=${encodeURIComponent(`Materi ${materi?.judul || "dari Gudang Soal"}`)}&body=${shareText}` },
  ];

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

                {/* Baris 1 — info chips */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
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

                {/* Baris 2 — stats + actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "8px", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)" }}>
                    <Eye size={13} color="rgba(255,255,255,.5)" />
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,.6)" }}>
                      {parseInt(materi.views || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                  {activeCount > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "8px", background: "rgba(110,231,183,.15)", border: "1px solid rgba(110,231,183,.3)" }}>
                      <span className="presence-dot" />
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#6ee7b7" }}>
                        {isMobile ? activeCount : `${activeCount} orang sedang membaca`}
                      </span>
                    </div>
                  )}
                  <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,.12)", margin: "0 2px" }} />
                  <button
                    onClick={() => setShareOpen(true)}
                    title="Bagikan"
                    style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "8px", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", cursor: "pointer", fontFamily: "inherit" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.13)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.07)"; }}
                  >
                    <Share2 size={13} color="rgba(255,255,255,.5)" />
                    {shareCount > 0 && <span style={{ fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,.6)" }}>{shareCount.toLocaleString("id-ID")}</span>}
                  </button>
                  <ActionBtn onClick={() => setReportOpen(true)} icon={Flag} title="Laporkan materi" danger />
                  {user?.role === "admin" && (
                    <ActionBtn onClick={() => navigate(`/admin/materi/edit/${id}`)} icon={Pencil} title="Edit materi (admin)" />
                  )}
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

                {PrevNextNav()}
                {LatihanCTA()}
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
                {PrevNextNav()}
                {LatihanCTA()}
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

      {shareOpen && (
        <div onClick={e => { if (e.target === e.currentTarget) setShareOpen(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "24px", width: "300px", maxWidth: "100%", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <span style={{ fontSize: "15px", fontWeight: "700", color: "#0f0e17" }}>Bagikan</span>
              <button onClick={() => setShareOpen(false)} style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1px solid #e2ddd5", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b6860" }}><X size={14} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
              {SHARE_OPTIONS.map(opt => (
                <button key={opt.label} onClick={() => { trackShare(opt.platform); window.open(opt.url, "_blank"); }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "7px", padding: "12px 8px", borderRadius: "12px", border: "1px solid #e2ddd5", background: "white", cursor: "pointer", fontFamily: "inherit" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#faf9f6"}
                  onMouseLeave={e => e.currentTarget.style.background = "white"}
                >
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: opt.bg, display: "flex", alignItems: "center", justifyContent: "center", color: opt.color }}>{opt.icon}</div>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#0f0e17", textAlign: "center", lineHeight: "1.3" }}>{opt.label}</span>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f5f3ef", borderRadius: "10px", padding: "10px 12px" }}>
              <span style={{ flex: 1, fontSize: "12px", color: "#6b6860", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>gudangsoal.com/materi/{id}</span>
              <button onClick={handleCopy} style={{ padding: "5px 10px", borderRadius: "7px", border: "none", background: copied ? "#1a8a6e" : "#e84c2b", color: "white", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", flexShrink: 0, transition: "background .15s" }}>
                {copied ? "Tersalin!" : "Salin"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .math-content p { margin: 0 0 12px; }
        .math-content p:last-child { margin-bottom: 0; }
        .math-content h1 { font-size: 20px; font-weight: 800; color: var(--gs-text); margin: 28px 0 12px; }
        .math-content h2 { font-size: 18px; font-weight: 700; color: var(--gs-text); margin: 24px 0 10px; }
        .math-content h3 { font-size: 16px; font-weight: 700; color: var(--gs-text); margin: 20px 0 8px; }
        .math-content h4, .math-content h5, .math-content h6 { font-size: 15px; font-weight: 700; color: var(--gs-text); margin: 16px 0 8px; }
        .math-content ul, .math-content ol { margin: 0 0 12px; padding-left: 24px; }
        .math-content li { margin-bottom: 6px; line-height: 1.6; }
        .math-content strong { font-weight: 700; }
        .math-content code { background: var(--gs-hover); border-radius: 5px; padding: 2px 6px; font-size: 13px; }
        .math-content blockquote { border-left: 3px solid #e84c2b; margin: 0 0 12px; padding: 8px 16px; background: #fff3f0; border-radius: 0 8px 8px 0; }
      `}</style>
    </div>
  );
}
