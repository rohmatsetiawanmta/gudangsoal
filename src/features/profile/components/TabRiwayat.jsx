// src/features/profile/components/TabRiwayat.jsx
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";

export default function TabRiwayat({ riwayat, isMobile }) {
  const navigate = useNavigate();

  if (!riwayat?.length) {
    return (
      <div
        style={{
          background: "white",
          borderRadius: "14px",
          border: "1px solid #e2ddd5",
          padding: "32px",
          textAlign: "center",
          color: "#6b6860",
          fontSize: "14px",
        }}
      >
        Belum ada soal yang dikerjakan.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {riwayat.map((r, i) => (
        <div
          key={i}
          onClick={() => navigate(`/soal/${r.kode}`)}
          style={{
            background: "white",
            borderRadius: "14px",
            border: "1px solid #e2ddd5",
            padding: isMobile ? "12px 14px" : "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            transition: "transform .15s, box-shadow .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateX(4px)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateX(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {r.is_correct == 1 ? (
            <CheckCircle size={18} color="#1a8a6e" style={{ flexShrink: 0 }} />
          ) : (
            <XCircle size={18} color="#e84c2b" style={{ flexShrink: 0 }} />
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "14px",
                color: "#0f0e17",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {r.body
                .replace(/\$\$?[^$]+\$\$?/g, "[math]")
                .replace(/[*_~`#]/g, "")}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#b4b2a9",
                marginTop: "3px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {isMobile
                ? `${r.mapel} — ${r.subtopik}`
                : `${r.jenjang} — ${r.mapel} — ${r.subtopik}`}
            </div>
          </div>

          {!isMobile && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "4px",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#b4b2a9",
                  fontFamily: "monospace",
                }}
              >
                {r.kode}
              </span>
              <span style={{ fontSize: "11px", color: "#b4b2a9" }}>
                {new Date(r.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
