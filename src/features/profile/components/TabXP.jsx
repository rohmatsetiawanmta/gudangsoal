// src/features/profile/components/TabXP.jsx
import { useNavigate } from "react-router-dom";

export default function TabXP({ xpHistory, isMobile }) {
  const navigate = useNavigate();

  if (!xpHistory?.length) {
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
        Belum ada riwayat XP.
      </div>
    );
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: "14px",
        border: "1px solid #e2ddd5",
        overflow: "hidden",
      }}
    >
      {xpHistory.map((h, i) => {
        const bonusMatch = h.reason.match(/\+(\d+)% bonus streak/);
        const baseReason = h.reason
          .replace(/\s*\(\+\d+% bonus streak\)/, "")
          .trim();
        const bonusPercent = bonusMatch ? bonusMatch[1] : null;

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 16px",
              borderBottom:
                i < xpHistory.length - 1 ? "1px solid #f2efe8" : "none",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#faf9f6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            {/* XP badge */}
            <div
              style={{
                width: "40px",
                height: "28px",
                borderRadius: "7px",
                background: "linear-gradient(135deg, #f5a623, #e84c2b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{ fontSize: "12px", fontWeight: "800", color: "white" }}
              >
                +{h.xp}
              </span>
            </div>

            {/* Reason */}
            <span
              style={{
                fontSize: "13px",
                fontWeight: "500",
                color: "#0f0e17",
                flexShrink: 0,
              }}
            >
              {baseReason}
            </span>

            {/* Bonus badge */}
            {bonusPercent && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  padding: "2px 6px",
                  borderRadius: "5px",
                  background: "#e4f5f0",
                  color: "#1a8a6e",
                  flexShrink: 0,
                }}
              >
                +{bonusPercent}% streak
              </span>
            )}

            {/* Kode soal */}
            {h.soal_kode && !isMobile && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/soal/${h.soal_kode}`);
                }}
                style={{
                  fontSize: "11px",
                  color: "#b4b2a9",
                  fontFamily: "monospace",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#e84c2b")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#b4b2a9")}
              >
                #{h.soal_kode}
              </span>
            )}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Tanggal + jam */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "11px", color: "#6b6860" }}>
                {new Date(h.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              {!isMobile && (
                <span style={{ fontSize: "11px", color: "#b4b2a9" }}>
                  {new Date(h.created_at).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
