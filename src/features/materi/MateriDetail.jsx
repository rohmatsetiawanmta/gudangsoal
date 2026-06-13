// src/features/materi/MateriDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  BookOpen, Sigma, AlignLeft, ChevronLeft, ChevronRight, BookMarked, Lightbulb,
  AlertTriangle, Eye, Copy, Share2, Flag, Check, X,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import MathRenderer from "../../components/MathRenderer";
import Breadcrumb from "../../components/Breadcrumb";
import useWindowWidth from "../../hooks/useWindowWidth";
import api from "../../lib/api";

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
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f0e17", lineHeight: 1.2 }}>
              <MathRenderer text={item.label} />
            </div>
          )}
        </div>
      </div>
      <div style={{ padding: "14px 16px", fontSize: "14px", lineHeight: "1.7", color: "#0f0e17" }}>
        <MathRenderer text={item.content} block />
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ h = "20px", w = "100%", r = "8px", mb = "0" }) {
  return <div style={{ height: h, width: w, borderRadius: r, background: "#e2ddd5", marginBottom: mb, animation: "pulse 1.5s infinite" }} />;
}

// ── Icon action button ────────────────────────────────────────────────────────

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
  const [alasan, setAlasan]       = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState("");

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
      <div style={{ background: "white", borderRadius: "18px", padding: isMobile ? "20px 18px" : "28px", maxWidth: "440px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Flag size={18} color="#e84c2b" />
            <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f0e17", margin: 0 }}>Laporkan Materi</h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6860", display: "flex" }}>
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div style={{ background: "#e4f5f0", border: "1px solid #9FE1CB", color: "#0F6E56", fontSize: "14px", borderRadius: "12px", padding: "20px", textAlign: "center", fontWeight: "500" }}>
            Laporan berhasil dikirim, terima kasih!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Materi ref */}
            <div style={{ background: "#f2efe8", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#6b6860" }}>
              <span style={{ fontWeight: "600", color: "#0f0e17" }}>{judul}</span>
            </div>

            {error && (
              <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "13px", borderRadius: "10px", padding: "10px 14px" }}>
                {error}
              </div>
            )}

            {/* Alasan */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>Alasan Laporan</label>
              {ALASAN_OPTIONS.map(opt => (
                <label key={opt} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${alasan === opt ? "#e84c2b" : "#e2ddd5"}`, background: alasan === opt ? "#fff3f0" : "white", cursor: "pointer", transition: "all .15s" }}>
                  <input type="radio" name="alasan" value={opt} checked={alasan === opt} onChange={() => setAlasan(opt)} style={{ accentColor: "#e84c2b", flexShrink: 0 }} />
                  <span style={{ fontSize: "14px", color: alasan === opt ? "#e84c2b" : "#0f0e17", fontWeight: alasan === opt ? "600" : "400" }}>{opt}</span>
                </label>
              ))}
            </div>

            {/* Deskripsi */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>
                Deskripsi <span style={{ fontWeight: "400", color: "#6b6860" }}>(opsional)</span>
              </label>
              <textarea value={deskripsi} onChange={e => setDeskripsi(e.target.value)}
                placeholder="Jelaskan lebih lanjut..." rows={3}
                style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2ddd5", fontSize: "14px", outline: "none", fontFamily: "inherit", color: "#0f0e17", resize: "none", lineHeight: "1.6" }}
                onFocus={e => (e.target.style.borderColor = "#e84c2b")}
                onBlur={e => (e.target.style.borderColor = "#e2ddd5")} />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#0f0e17" }}>Batal</button>
              <button onClick={handleSubmit} disabled={loading || !alasan}
                style={{ padding: "9px 20px", borderRadius: "10px", border: "none", background: loading || !alasan ? "#e2ddd5" : "#e84c2b", color: loading || !alasan ? "#b4b2a9" : "white", fontSize: "14px", fontWeight: "600", cursor: loading || !alasan ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {loading ? "Mengirim..." : "Kirim Laporan"}
              </button>
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

  const [materi, setMateri]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [copied, setCopied]   = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/materi/${id}`)
      .then(data => {
        setMateri(data);
        api.post(`/materi/${id}/view`).catch(() => {});
      })
      .catch(() => setError("Materi tidak ditemukan atau belum dipublikasikan."))
      .finally(() => setLoading(false));
  }, [id]);

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
    { label: materi.jenjang, to: `/browse/${materi.jenjang_slug}` },
    { label: materi.subjenjang },
    { label: materi.mapel },
    { label: materi.topik },
    { label: materi.subtopik },
    { label: materi.judul },
  ] : [];

  const highlights = Array.isArray(materi?.highlights) ? materi.highlights : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f2efe8" }}>
      <SEO
        title={materi?.judul}
        description={`Materi belajar: ${materi?.judul} — ${[materi?.mapel, materi?.topik, materi?.subtopik].filter(Boolean).join(", ")}`}
        url={`/materi/${id}`}
      />
      <Navbar />

      <main style={{ flex: 1, maxWidth: "760px", width: "100%", margin: "0 auto", padding: isMobile ? "20px 16px 40px" : "32px 24px 56px" }}>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Skeleton h="14px" w="60%" mb="8px" />
            <Skeleton h="36px" w="80%" r="10px" mb="8px" />
            <Skeleton h="16px" w="40%" mb="24px" />
            <Skeleton h="200px" r="14px" />
          </div>
        ) : error ? (
          <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2ddd5", padding: "60px 32px", textAlign: "center" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <BookOpen size={24} color="#e84c2b" />
            </div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f0e17", marginBottom: "8px" }}>Materi Tidak Ditemukan</div>
            <p style={{ fontSize: "13px", color: "#6b6860" }}>{error}</p>
          </div>
        ) : (
          <>
            {/* Breadcrumb */}
            <div style={{ marginBottom: "20px" }}>
              <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Header card */}
            <div style={{
              background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 60%, #0a1c1a 100%)",
              borderRadius: "18px", padding: isMobile ? "24px 20px" : "28px 32px",
              marginBottom: "20px", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%", transform: "translateY(-50%)", opacity: 0.06, pointerEvents: "none", color: "white" }}>
                <BookOpen size={isMobile ? 80 : 110} />
              </div>
              <div style={{ position: "relative", zIndex: 1 }}>
                {/* Breadcrumb trail */}
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

                {/* Chips + actions row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                  {/* Chips */}
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
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    {/* View count */}
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
            {materi.konten ? (
              <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2ddd5", padding: isMobile ? "20px 18px" : "28px 32px", marginBottom: highlights.length > 0 ? "16px" : 0, fontSize: "15px", color: "#0f0e17" }}>
                <MathRenderer text={materi.konten} block />
              </div>
            ) : (
              <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2ddd5", padding: "32px", marginBottom: highlights.length > 0 ? "16px" : 0, textAlign: "center", color: "#b4b2a9", fontSize: "14px" }}>
                Konten belum tersedia.
              </div>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#b4b2a9", textTransform: "uppercase", letterSpacing: ".07em", padding: "4px 2px" }}>
                  Highlights
                </div>
                {highlights.map((h, i) => (
                  <HighlightBlock key={i} item={h} />
                ))}
              </div>
            )}

            {/* Prev / Next navigation */}
            {(materi.prev || materi.next) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "24px" }}>
                {/* Prev */}
                {materi.prev ? (
                  <button
                    onClick={() => navigate(`/materi/${materi.prev.id}`)}
                    style={{ background: "white", border: "1px solid #e2ddd5", borderRadius: "14px", padding: "14px 16px", cursor: "pointer", textAlign: "left", display: "flex", flexDirection: "column", gap: "4px", transition: "box-shadow .15s, border-color .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.07)"; e.currentTarget.style.borderColor = "#0f0e17"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#e2ddd5"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "700", color: "#b4b2a9", textTransform: "uppercase", letterSpacing: ".06em" }}>
                      <ChevronLeft size={13} />
                      Sebelumnya
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.4 }}>
                      {materi.prev.judul}
                    </div>
                  </button>
                ) : <div />}

                {/* Next */}
                {materi.next ? (
                  <button
                    onClick={() => navigate(`/materi/${materi.next.id}`)}
                    style={{ background: "white", border: "1px solid #e2ddd5", borderRadius: "14px", padding: "14px 16px", cursor: "pointer", textAlign: "right", display: "flex", flexDirection: "column", gap: "4px", transition: "box-shadow .15s, border-color .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.07)"; e.currentTarget.style.borderColor = "#0f0e17"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#e2ddd5"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px", fontSize: "11px", fontWeight: "700", color: "#b4b2a9", textTransform: "uppercase", letterSpacing: ".06em" }}>
                      Berikutnya
                      <ChevronRight size={13} />
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.4 }}>
                      {materi.next.judul}
                    </div>
                  </button>
                ) : <div />}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {reportOpen && materi && (
        <ReportModal materiId={id} judul={materi.judul} onClose={() => setReportOpen(false)} isMobile={isMobile} />
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .math-content p { margin: 0 0 12px; }
        .math-content p:last-child { margin-bottom: 0; }
        .math-content h2 { font-size: 18px; font-weight: 700; color: #0f0e17; margin: 24px 0 10px; }
        .math-content h3 { font-size: 16px; font-weight: 700; color: #0f0e17; margin: 20px 0 8px; }
        .math-content ul, .math-content ol { margin: 0 0 12px; padding-left: 24px; }
        .math-content li { margin-bottom: 6px; line-height: 1.6; }
        .math-content strong { font-weight: 700; }
        .math-content code { background: #f2efe8; border-radius: 5px; padding: 2px 6px; font-size: 13px; }
        .math-content blockquote { border-left: 3px solid #e84c2b; margin: 0 0 12px; padding: 8px 16px; background: #fff3f0; border-radius: 0 8px 8px 0; }
      `}</style>
    </div>
  );
}
