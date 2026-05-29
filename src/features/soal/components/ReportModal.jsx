import { useState } from "react";
import { Flag, X } from "lucide-react";
import api from "../../../lib/api";
import { KATEGORI_REPORT } from "../soalUtils";

export default function ReportModal({ kode, onClose, isMobile }) {
  const [form, setForm] = useState({ kategori: "", deskripsi: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.kategori) {
      setError("Pilih kategori laporan");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/report", {
        soal_kode: kode,
        kategori: form.kategori,
        deskripsi: form.deskripsi || null,
      });
      setSuccess("Laporan berhasil dikirim, terima kasih!");
      setForm({ kategori: "", deskripsi: "" });
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.error || "Gagal mengirim laporan");
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
        zIndex: 300,
        padding: isMobile ? "16px" : "24px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: isMobile ? "20px" : "28px",
          maxWidth: "440px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Flag size={18} color="#e84c2b" />
            <h3
              style={{ fontSize: "17px", fontWeight: "800", color: "#0f0e17" }}
            >
              Laporkan Soal
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b6860",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div
            style={{
              background: "#e4f5f0",
              border: "1px solid #9FE1CB",
              color: "#0F6E56",
              fontSize: "14px",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
              fontWeight: "500",
            }}
          >
            {success}
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
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

            <div
              style={{
                background: "#f2efe8",
                borderRadius: "10px",
                padding: "12px 14px",
                fontSize: "13px",
                color: "#6b6860",
              }}
            >
              Soal{" "}
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: "700",
                  color: "#0f0e17",
                }}
              >
                #{kode}
              </span>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f0e17",
                }}
              >
                Kategori Laporan
              </label>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                {KATEGORI_REPORT.map((k) => (
                  <label
                    key={k.value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: `1.5px solid ${
                        form.kategori === k.value ? "#e84c2b" : "#e2ddd5"
                      }`,
                      background:
                        form.kategori === k.value ? "#fff3f0" : "white",
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                  >
                    <input
                      type="radio"
                      name="kategori"
                      value={k.value}
                      checked={form.kategori === k.value}
                      onChange={() =>
                        setForm((f) => ({ ...f, kategori: k.value }))
                      }
                      style={{ accentColor: "#e84c2b", flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: "14px",
                        color:
                          form.kategori === k.value ? "#e84c2b" : "#0f0e17",
                        fontWeight: form.kategori === k.value ? "600" : "400",
                      }}
                    >
                      {k.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f0e17",
                }}
              >
                Deskripsi{" "}
                <span style={{ fontWeight: "400", color: "#6b6860" }}>
                  (opsional)
                </span>
              </label>
              <textarea
                value={form.deskripsi}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deskripsi: e.target.value }))
                }
                placeholder="Jelaskan masalah yang kamu temukan..."
                rows={3}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #e2ddd5",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "inherit",
                  color: "#0f0e17",
                  resize: "none",
                  lineHeight: "1.6",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={onClose}
                style={{
                  padding: "9px 20px",
                  borderRadius: "10px",
                  border: "1px solid #e2ddd5",
                  background: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: "#0f0e17",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !form.kategori}
                style={{
                  padding: "9px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: loading || !form.kategori ? "#e2ddd5" : "#e84c2b",
                  color: loading || !form.kategori ? "#b4b2a9" : "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: loading || !form.kategori ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {loading ? "Mengirim..." : "Kirim Laporan"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
