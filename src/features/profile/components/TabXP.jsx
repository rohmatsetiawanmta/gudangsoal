// src/features/profile/components/TabXP.jsx
export default function TabXP({ xpHistory, isMobile }) {
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
      {xpHistory.map((h, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: isMobile ? "12px 16px" : "14px 20px",
            borderBottom:
              i < xpHistory.length - 1 ? "1px solid #f2efe8" : "none",
          }}
        >
          {/* XP badge */}
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "#faeeda",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{ fontSize: "11px", fontWeight: "800", color: "#854F0B" }}
            >
              +{h.xp}
            </span>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#0f0e17",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {h.reason}
            </div>
            {h.soal_kode && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#b4b2a9",
                  marginTop: "2px",
                  fontFamily: "monospace",
                }}
              >
                #{h.soal_kode}
              </div>
            )}
          </div>

          {/* Tanggal */}
          <div style={{ fontSize: "12px", color: "#b4b2a9", flexShrink: 0 }}>
            {new Date(h.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
