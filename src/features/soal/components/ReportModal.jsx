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
          background: "var(--gs-surface)",
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
              style={{ fontSize: "17px", fontWeight: "800", color: "var(--gs-text)" }}
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
              color: "var(--gs-text-muted)",
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
                background: "var(--gs-hover)",
                borderRadius: "10px",
                padding: "12px 14px",
                fontSize: "13px",
                color: "var(--gs-text-muted)",
              }}
            >
              Soal{" "}
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: "700",
                  color: "var(--gs-text)",
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
                  color: "var(--gs-text)",
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
                        form.kategori === k.value ? "#e84c2b" : "var(--gs-border)"
                      }`,
                      background:
                        form.kategori === k.value ? "#fff3f0" : "var(--gs-surface)",
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
                          form.kategori === k.value ? "#e84c2b" : "var(--gs-text)",
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
                  color: "var(--gs-text)",
                }}
              >
                Deskripsi{" "}
                <span style={{ fontWeight: "400", color: "var(--gs-text-muted)" }}>
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
                onClick={handleSubmit}
                disabled={loading || !form.kategori}
                style={{
                  padding: "9px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: loading || !form.kategori ? "var(--gs-border)" : "#e84c2b",
                  color: loading || !form.kategori ? "var(--gs-text-hint)" : "white",
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
