// src/features/feedback/FeedbackModal.jsx
import { useState } from "react";
import { X, MessageSquarePlus, ChevronDown } from "lucide-react";
import { submitFeedback } from "./feedbackApi";

const KATEGORI = [
  {
    value: "saran_fitur",
    label: "Saran Fitur",
    desc: "Ide fitur baru yang ingin kamu lihat",
  },
  {
    value: "bug",
    label: "Laporan Bug",
    desc: "Fitur tidak berfungsi atau aplikasi error",
  },
  {
    value: "minta_topik",
    label: "Request Topik",
    desc: "Topik atau materi yang belum tersedia",
  },
  {
    value: "kualitas_konten",
    label: "Kualitas Soal",
    desc: "Soal atau pembahasan yang dirasa kurang",
  },
  { value: "lainnya", label: "Lainnya", desc: "Pertanyaan atau masukan lain" },
];

export default function FeedbackModal({ onClose }) {
  const [step, setStep] = useState(1); // 1: pilih kategori, 2: isi form
  const [kategori, setKategori] = useState(null);
  const [form, setForm] = useState({ judul: "", deskripsi: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!form.judul.trim()) {
      setError("Judul wajib diisi");
      return;
    }
    if (!form.deskripsi.trim()) {
      setError("Deskripsi wajib diisi");
      return;
    }
    setLoading(true);
    try {
      await submitFeedback({
        kategori: kategori.value,
        judul: form.judul,
        deskripsi: form.deskripsi,
      });
      setSuccess(true);
    } catch {
      setError("Gagal mengirim masukan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 500,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "var(--gs-surface)",
          borderRadius: "16px",
          padding: "28px",
          maxWidth: "460px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MessageSquarePlus size={20} color="#e84c2b" />
            <h3
              style={{ fontSize: "17px", fontWeight: "800", color: "var(--gs-text)" }}
            >
              Kirim Masukan
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--gs-text-muted)",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Success state */}
        {success ? (
          <div style={{ textAlign: "center", padding: "32px 16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "#e4f5f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <span style={{ fontSize: "24px" }}>✓</span>
            </div>
            <div
              style={{
                fontSize: "17px",
                fontWeight: "700",
                color: "var(--gs-text)",
                marginBottom: "8px",
              }}
            >
              Masukan terkirim!
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "var(--gs-text-muted)",
                lineHeight: "1.6",
                marginBottom: "24px",
              }}
            >
              Terima kasih sudah meluangkan waktu untuk memberikan masukan. Kami
              akan membacanya dan terus berusaha meningkatkan platform.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: "10px 28px",
                borderRadius: "10px",
                border: "none",
                background: "#e84c2b",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Tutup
            </button>
          </div>
        ) : step === 1 ? (
          /* Step 1: Pilih kategori */
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <p
              style={{
                fontSize: "14px",
                color: "var(--gs-text-muted)",
                marginBottom: "8px",
              }}
            >
              Apa yang ingin kamu sampaikan?
            </p>
            {KATEGORI.map((k) => (
              <button
                key={k.value}
                type="button"
                onClick={() => {
                  setKategori(k);
                  setStep(2);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "1px solid var(--gs-border)",
                  background: "var(--gs-surface)",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  transition: "all .15s",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = "1px solid #e84c2b";
                  e.currentTarget.style.background = "#fff3f0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid #e2ddd5";
                  e.currentTarget.style.background = "white";
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--gs-text)",
                      marginBottom: "2px",
                    }}
                  >
                    {k.label}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--gs-text-muted)" }}>
                    {k.desc}
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  color="var(--gs-text-hint)"
                  style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
                />
              </button>
            ))}
          </div>
        ) : (
          /* Step 2: Isi form */
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* Back + kategori badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--gs-text-muted)",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: 0,
                }}
              >
                ← Ganti
              </button>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  padding: "3px 10px",
                  borderRadius: "6px",
                  background: "#fff3f0",
                  color: "#e84c2b",
                }}
              >
                {kategori?.label}
              </span>
            </div>

            {error && (
              <div
                style={{
                  background: "#fff3f0",
                  border: "1px solid #fca5a5",
                  color: "#b91c1c",
                  fontSize: "13px",
                  borderRadius: "10px",
                  padding: "10px 14px",
                }}
              >
                {error}
              </div>
            )}

            {/* Judul */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--gs-text)",
                }}
              >
                Judul
              </label>
              <input
                value={form.judul}
                onChange={(e) =>
                  setForm((f) => ({ ...f, judul: e.target.value }))
                }
                placeholder={
                  kategori?.value === "bug"
                    ? "Contoh: Tombol submit tidak berfungsi di Safari"
                    : kategori?.value === "saran_fitur"
                    ? "Contoh: Fitur dark mode"
                    : kategori?.value === "minta_topik"
                    ? "Contoh: Soal Trigonometri SMA"
                    : kategori?.value === "kualitas_konten"
                    ? "Contoh: Pembahasan soal BPZ03Q kurang lengkap"
                    : "Tulis judul singkat..."
                }
                autoFocus
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid var(--gs-border)",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "inherit",
                  color: "var(--gs-text)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                onBlur={(e) => (e.target.style.borderColor = "var(--gs-border)")}
              />
            </div>

            {/* Deskripsi */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--gs-text)",
                }}
              >
                Deskripsi
              </label>
              <textarea
                value={form.deskripsi}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deskripsi: e.target.value }))
                }
                placeholder={
                  kategori?.value === "bug"
                    ? "Ceritakan apa yang terjadi, langkah yang kamu lakukan, dan device/browser yang dipakai..."
                    : kategori?.value === "saran_fitur"
                    ? "Jelaskan fitur yang kamu inginkan dan kenapa fitur ini berguna..."
                    : kategori?.value === "minta_topik"
                    ? "Topik apa yang ingin kamu pelajari? Untuk jenjang apa?"
                    : kategori?.value === "kualitas_konten"
                    ? "Jelaskan masalah yang kamu temukan pada soal atau pembahasan..."
                    : "Ceritakan lebih detail..."
                }
                rows={5}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid var(--gs-border)",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "inherit",
                  color: "var(--gs-text)",
                  resize: "none",
                  lineHeight: "1.6",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                onBlur={(e) => (e.target.style.borderColor = "var(--gs-border)")}
              />
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--gs-text-hint)",
                  textAlign: "right",
                }}
              >
                {form.deskripsi.length} karakter
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "1px solid var(--gs-border)",
                  background: "var(--gs-surface)",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: "var(--gs-text)",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: loading ? "#f5a07a" : "#e84c2b",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {loading ? "Mengirim..." : "Kirim Masukan"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
