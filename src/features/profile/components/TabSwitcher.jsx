// src/features/profile/components/TabSwitcher.jsx
export const TABS = [
  { key: "xp", label: "Riwayat XP" },
  { key: "riwayat", label: "Riwayat Soal" },
  { key: "bookmark", label: "Bookmark" },
  { key: "masukan", label: "Masukan" },
];

export default function TabSwitcher({ activeTab, onChange, isMobile }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        background: "#f2efe8",
        padding: "4px",
        borderRadius: "12px",
        marginBottom: "16px",
      }}
    >
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            flex: 1,
            padding: isMobile ? "8px 6px" : "9px 12px",
            borderRadius: "9px",
            border: "none",
            background: activeTab === tab.key ? "white" : "transparent",
            color: activeTab === tab.key ? "#0f0e17" : "#6b6860",
            fontSize: isMobile ? "12px" : "13px",
            fontWeight: "600",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all .15s",
            boxShadow:
              activeTab === tab.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            whiteSpace: "nowrap",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
