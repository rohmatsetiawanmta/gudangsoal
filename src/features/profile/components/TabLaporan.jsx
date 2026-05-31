// src/features/profile/components/TabLaporan.jsx
import { useNavigate } from "react-router-dom";
import { Flag } from "lucide-react";

const KATEGORI_LABEL = {
  soal_salah: "Soal salah / ambigu",
  jawaban_salah: "Jawaban salah",
  pembahasan_salah: "Pembahasan salah",
  typo: "Typo / salah ketik",
  latex_error: "Rumus LaTeX error",
  duplikat: "Soal duplikat",
  lainnya: "Lainnya",
};

const STATUS_CONFIG = {
  pending: { label: "Menunggu", color: "#854F0B", bg: "#faeeda" },
  resolved: { label: "Ditindaklanjuti", color: "#1a8a6e", bg: "#e4f5f0" },
  dismissed: { label: "Ditutup", color: "#6b6860", bg: "#f2efe8" },
};

export default function TabLaporan({ laporan, loading, isMobile }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: "80px",
              borderRadius: "14px",
              background: "#e2ddd5",
              opacity: 0.5,
              animation: "pulse 1.5s infinite",
            }}
          />
        ))}
      </div>
    );
  }

  if (!laporan.length) {
    return (
      <div
        style={{
          background: "white",
          borderRadius: "14px",
          border: "1px solid #e2ddd5",
          padding: "48px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Flag size={32} color="#e2ddd5" />
        <div style={{ fontSize: "14px", color: "#6b6860" }}>
          Belum ada laporan yang dikirim.
        </div>
        <div style={{ fontSize: "13px", color: "#b4b2a9" }}>
          Tap ikon laporan di halaman soal untuk melaporkan soal yang
          bermasalah.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {laporan.map((r) => {
        const status = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
        return (
          <div
            key={r.id}
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: isMobile ? "14px 16px" : "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {/* Baris 1: kode + kategori + status + tanggal */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => navigate(`/soal/${r.soal_kode}`)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#e84c2b",
                  fontFamily: "monospace",
                  padding: 0,
                }}
              >
                #{r.soal_kode}
              </button>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  background: status.bg,
                  color: status.color,
                }}
              >
                {status.label}
              </span>
              <div style={{ flex: 1 }} />
              <span
                style={{ fontSize: "11px", color: "#b4b2a9", flexShrink: 0 }}
              >
                {new Date(r.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Baris 2: kategori + deskripsi */}
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f0e17",
                  marginBottom: "2px",
                }}
              >
                {KATEGORI_LABEL[r.kategori] || r.kategori}
              </div>
              {r.deskripsi && (
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b6860",
                    lineHeight: "1.5",
                  }}
                >
                  "{r.deskripsi}"
                </div>
              )}
            </div>

            {/* Soal preview */}
            {r.soal_body && (
              <div
                onClick={() => navigate(`/soal/${r.soal_kode}`)}
                style={{
                  fontSize: "12px",
                  color: "#b4b2a9",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  padding: "8px 12px",
                  background: "#f2efe8",
                  borderRadius: "8px",
                }}
              >
                {r.soal_body
                  .replace(/\$\$?[^$]+\$\$?/g, "[math]")
                  .replace(/[*_~`#]/g, "")}
              </div>
            )}

            {/* Catatan admin */}
            {r.admin_notes && (
              <div
                style={{
                  background: r.status === "resolved" ? "#e4f5f0" : "#f2efe8",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  borderLeft: `3px solid ${
                    r.status === "resolved" ? "#1a8a6e" : "#b4b2a9"
                  }`,
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: r.status === "resolved" ? "#1a8a6e" : "#6b6860",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: "4px",
                  }}
                >
                  Catatan Admin
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#0f0e17",
                    lineHeight: "1.6",
                  }}
                >
                  {r.admin_notes}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
