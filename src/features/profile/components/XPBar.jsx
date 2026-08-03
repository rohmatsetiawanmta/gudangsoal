// src/features/profile/components/XPBar.jsx
export default function XPBar({ xp, isMobile }) {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const prevXP = Math.pow(level - 1, 2) * 100;
  const nextXP = Math.pow(level, 2) * 100;
  const percent = ((xp - prevXP) / (nextXP - prevXP)) * 100;

  return (
    <div
      style={{
        background: "var(--gs-surface)",
        borderRadius: "14px",
        border: "1px solid var(--gs-border)",
        padding: isMobile ? "16px" : "20px 24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "#faeeda",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "800",
            fontSize: "16px",
            color: "#854F0B",
            flexShrink: 0,
          }}
        >
          {level}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span
              style={{ fontSize: "14px", fontWeight: "700", color: "var(--gs-text)" }}
            >
              Level {level}
            </span>
            <span style={{ fontSize: "13px", color: "var(--gs-text-muted)" }}>
              {xp.toLocaleString()} XP
            </span>
          </div>
          <div
            style={{
              height: "8px",
              background: "var(--gs-hover)",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${percent}%`,
                background: "linear-gradient(90deg, #f5a623, #e84c2b)",
                borderRadius: "4px",
                transition: "width 1s ease",
              }}
            />
          </div>
          <div style={{ fontSize: "12px", color: "var(--gs-text-hint)", marginTop: "4px" }}>
            {(nextXP - xp).toLocaleString()} XP lagi ke Level {level + 1}
          </div>
        </div>
      </div>
    </div>
  );
}
