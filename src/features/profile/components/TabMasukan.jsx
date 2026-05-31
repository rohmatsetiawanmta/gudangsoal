// src/features/profile/components/TabMasukan.jsx
import { MessageSquarePlus } from "lucide-react";

const KATEGORI_LABEL = {
  saran_fitur: "Saran Fitur",
  bug: "Laporan Bug",
  minta_topik: "Request Topik",
  kualitas_konten: "Kualitas Soal",
  lainnya: "Lainnya",
};

const STATUS_CONFIG = {
  pending: { label: "Menunggu", color: "#854F0B", bg: "#faeeda" },
  dibaca: { label: "Dibaca", color: "#2563eb", bg: "#eff6ff" },
  ditindaklanjuti: {
    label: "Ditindaklanjuti",
    color: "#1a8a6e",
    bg: "#e4f5f0",
  },
};

const KATEGORI_CONFIG = {
  saran_fitur: { color: "#7c3aed", bg: "#f5f3ff" },
  bug: { color: "#e84c2b", bg: "#fff3f0" },
  minta_topik: { color: "#2563eb", bg: "#eff6ff" },
  kualitas_konten: { color: "#854F0B", bg: "#faeeda" },
  lainnya: { color: "#6b6860", bg: "#f2efe8" },
};

export default function TabMasukan({ masukan, loading, onKirim, isMobile }) {
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

  if (!masukan.length) {
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
          gap: "10px",
        }}
      >
        <MessageSquarePlus size={32} color="#e2ddd5" />
        <div style={{ fontSize: "14px", color: "#6b6860" }}>
          Belum ada masukan yang dikirim.
        </div>
        <button
          onClick={onKirim}
          style={{
            marginTop: "4px",
            padding: "9px 20px",
            borderRadius: "10px",
            border: "none",
            background: "#e84c2b",
            color: "white",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Kirim Masukan Pertama
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Tombol kirim baru */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "4px",
        }}
      >
        <button
          onClick={onKirim}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid #e2ddd5",
            background: "white",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            fontFamily: "inherit",
            color: "#0f0e17",
            transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f2efe8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
          }}
        >
          <MessageSquarePlus size={14} />
          Kirim Masukan Baru
        </button>
      </div>

      {masukan.map((m) => {
        const status = STATUS_CONFIG[m.status] || STATUS_CONFIG.pending;
        const kategori = KATEGORI_CONFIG[m.kategori] || KATEGORI_CONFIG.lainnya;
        return (
          <div
            key={m.id}
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: isMobile ? "14px 16px" : "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {/* Baris 1: kategori + status + tanggal */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  background: kategori.bg,
                  color: kategori.color,
                }}
              >
                {KATEGORI_LABEL[m.kategori] || m.kategori}
              </span>
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
                style={{ fontSize: "12px", color: "#b4b2a9", flexShrink: 0 }}
              >
                {new Date(m.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Baris 2: judul */}
            <div
              style={{ fontSize: "14px", fontWeight: "600", color: "#0f0e17" }}
            >
              {m.judul}
            </div>

            {/* Baris 3: deskripsi */}
            <div
              style={{ fontSize: "13px", color: "#6b6860", lineHeight: "1.6" }}
            >
              {m.deskripsi}
            </div>

            {/* Catatan admin — jika ada */}
            {m.catatan && (
              <div
                style={{
                  background:
                    m.status === "ditindaklanjuti" ? "#e4f5f0" : "#f2efe8",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  borderLeft: `3px solid ${
                    m.status === "ditindaklanjuti" ? "#1a8a6e" : "#b4b2a9"
                  }`,
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color:
                      m.status === "ditindaklanjuti" ? "#1a8a6e" : "#6b6860",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    marginBottom: "4px",
                  }}
                >
                  Catatan Tim
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#0f0e17",
                    lineHeight: "1.6",
                  }}
                >
                  {m.catatan}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
