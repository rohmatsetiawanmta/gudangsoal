// src/features/feedback/FeedbackPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquarePlus, ChevronDown, ChevronLeft, CheckCircle } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";
import { submitFeedback } from "./feedbackApi";

const KATEGORI = [
  { value: "saran_fitur",     label: "Saran Fitur",    desc: "Ide fitur baru yang ingin kamu lihat" },
  { value: "bug",             label: "Laporan Bug",    desc: "Fitur tidak berfungsi atau aplikasi error" },
  { value: "minta_topik",     label: "Request Topik",  desc: "Topik atau materi yang belum tersedia" },
  { value: "kualitas_konten", label: "Kualitas Soal",  desc: "Soal atau pembahasan yang dirasa kurang" },
  { value: "lainnya",         label: "Lainnya",        desc: "Pertanyaan atau masukan lain" },
];

const PLACEHOLDER_JUDUL = {
  bug:             "Contoh: Tombol submit tidak berfungsi di Safari",
  saran_fitur:     "Contoh: Fitur dark mode",
  minta_topik:     "Contoh: Soal Trigonometri SMA",
  kualitas_konten: "Contoh: Pembahasan soal BPZ03Q kurang lengkap",
};

const PLACEHOLDER_DESC = {
  bug:             "Ceritakan apa yang terjadi, langkah yang kamu lakukan, dan device/browser yang dipakai...",
  saran_fitur:     "Jelaskan fitur yang kamu inginkan dan kenapa fitur ini berguna...",
  minta_topik:     "Topik apa yang ingin kamu pelajari? Untuk jenjang apa?",
  kualitas_konten: "Jelaskan masalah yang kamu temukan pada soal atau pembahasan...",
};

export default function FeedbackPage() {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [step, setStep] = useState(1);
  const [kategori, setKategori] = useState(null);
  const [form, setForm] = useState({ judul: "", deskripsi: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!form.judul.trim())     { setError("Judul wajib diisi"); return; }
    if (!form.deskripsi.trim()) { setError("Deskripsi wajib diisi"); return; }
    setLoading(true);
    try {
      await submitFeedback({ kategori: kategori.value, judul: form.judul, deskripsi: form.deskripsi });
      setSuccess(true);
    } catch {
      setError("Gagal mengirim masukan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "10px",
    border: "1px solid var(--gs-border)", fontSize: "14px", outline: "none",
    fontFamily: "inherit", color: "var(--gs-text)", background: "var(--gs-surface)",
    boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gs-hover)" }}>
      <SEO title="Kirim Masukan" description="Kirim saran, laporan bug, atau request topik ke tim Gudang Soal." url="/masukan" />
      <Navbar />

      <main style={{ flex: 1, maxWidth: "600px", width: "100%", margin: "0 auto", padding: isMobile ? "24px 16px" : "40px 24px" }}>

        {/* Hero header */}
        <div style={{
          borderRadius: "18px",
          background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #1a0e2c 100%)",
          padding: isMobile ? "24px 20px" : "28px 32px",
          marginBottom: "24px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%", transform: "translateY(-50%)", fontSize: isMobile ? "72px" : "100px", fontWeight: "900", color: "rgba(255,255,255,.03)", letterSpacing: "-4px", userSelect: "none", lineHeight: 1, pointerEvents: "none" }}>
            KIRIM
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "6px" }}>
              Masukan & Saran
            </div>
            <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 8px" }}>
              Kirim Masukan
            </h1>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,.45)", margin: 0 }}>
              Bantu kami berkembang — saran, bug report, atau request topik semuanya diterima.
            </p>
          </div>
        </div>

        {/* Form card */}
        <div style={{ background: "var(--gs-surface)", borderRadius: "16px", border: "1px solid var(--gs-border)", overflow: "hidden" }}>
          {/* Card header */}
          <div style={{
            padding: "14px 20px", borderBottom: "1px solid var(--gs-border)",
            fontSize: "13px", fontWeight: "700", color: "var(--gs-text)",
            background: "var(--gs-surface)",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            {step === 2 && !success && (
              <button
                onClick={() => { setStep(1); setError(""); }}
                style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", color: "var(--gs-text-muted)", fontSize: "13px", fontFamily: "inherit", padding: 0, marginRight: "4px" }}
              >
                <ChevronLeft size={15} />
              </button>
            )}
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
            {success ? "Masukan Terkirim" : step === 1 ? "Pilih Kategori" : kategori?.label}
          </div>

          <div style={{ padding: isMobile ? "20px 16px" : "24px" }}>
            {/* Success */}
            {success ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#e4f5f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <CheckCircle size={26} color="#1a8a6e" />
                </div>
                <div style={{ fontSize: "17px", fontWeight: "700", color: "var(--gs-text)", marginBottom: "8px" }}>Terima kasih!</div>
                <p style={{ fontSize: "14px", color: "var(--gs-text-muted)", lineHeight: "1.6", marginBottom: "28px" }}>
                  Masukan kamu sudah kami terima. Kami akan membacanya dan terus berusaha meningkatkan platform.
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                  <button
                    onClick={() => { setSuccess(false); setStep(1); setKategori(null); setForm({ judul: "", deskripsi: "" }); }}
                    style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid var(--gs-border)", background: "var(--gs-surface)", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "var(--gs-text)" }}
                  >
                    Kirim Lagi
                  </button>
                  <button
                    onClick={() => navigate("/profile")}
                    style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Kembali ke Profil
                  </button>
                </div>
              </div>
            ) : step === 1 ? (
              /* Step 1 — pilih kategori */
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <p style={{ fontSize: "14px", color: "var(--gs-text-muted)", marginBottom: "4px" }}>Apa yang ingin kamu sampaikan?</p>
                {KATEGORI.map((k) => (
                  <button
                    key={k.value}
                    onClick={() => { setKategori(k); setStep(2); }}
                    style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--gs-border)", background: "var(--gs-surface)", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all .15s", width: "100%" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#e84c2b"; e.currentTarget.style.background = "#fff3f0"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--gs-border)"; e.currentTarget.style.background = "var(--gs-surface)"; }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--gs-text)", marginBottom: "2px" }}>{k.label}</div>
                      <div style={{ fontSize: "12px", color: "var(--gs-text-muted)" }}>{k.desc}</div>
                    </div>
                    <ChevronDown size={16} color="var(--gs-text-hint)" style={{ transform: "rotate(-90deg)", flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            ) : (
              /* Step 2 — isi form */
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {error && (
                  <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "13px", borderRadius: "10px", padding: "10px 14px" }}>
                    {error}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--gs-text)" }}>Judul</label>
                  <input
                    value={form.judul}
                    onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
                    placeholder={PLACEHOLDER_JUDUL[kategori?.value] || "Tulis judul singkat..."}
                    autoFocus
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#e84c2b"}
                    onBlur={e => e.target.style.borderColor = "var(--gs-border)"}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--gs-text)" }}>Deskripsi</label>
                  <textarea
                    value={form.deskripsi}
                    onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))}
                    placeholder={PLACEHOLDER_DESC[kategori?.value] || "Ceritakan lebih detail..."}
                    rows={5}
                    style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }}
                    onFocus={e => e.target.style.borderColor = "#e84c2b"}
                    onBlur={e => e.target.style.borderColor = "var(--gs-border)"}
                  />
                  <div style={{ fontSize: "12px", color: "var(--gs-text-hint)", textAlign: "right" }}>
                    {form.deskripsi.length} karakter
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => navigate(-1)}
                    style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid var(--gs-border)", background: "var(--gs-surface)", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "var(--gs-text)" }}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: loading ? "#f5a07a" : "#e84c2b", color: "white", fontSize: "14px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                  >
                    {loading ? "Mengirim..." : "Kirim Masukan"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
