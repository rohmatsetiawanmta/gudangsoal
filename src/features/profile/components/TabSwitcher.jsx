// src/features/profile/components/TabSwitcher.jsx
import { Zap, BookOpen, Bookmark, MessageSquare, Flag, FileQuestion } from "lucide-react";

export const TABS = [
  { key: "xp",       label: "Riwayat XP",   short: "XP",      icon: Zap },
  { key: "riwayat",  label: "Riwayat Soal", short: "Soal",    icon: BookOpen },
  { key: "bookmark", label: "Bookmark",     short: "Simpan",  icon: Bookmark },
  { key: "request",  label: "Request Soal", short: "Request", icon: FileQuestion },
  { key: "masukan",  label: "Masukan",      short: "Masukan", icon: MessageSquare },
  { key: "laporan",  label: "Laporan",      short: "Laporan", icon: Flag },
];

export default function TabSwitcher({ activeTab, onChange, isMobile }) {
  return (
    <div style={{
      display: "flex", gap: "4px",
      background: "var(--gs-surface)",
      border: "1px solid var(--gs-border)",
      padding: "4px", borderRadius: "14px",
      marginBottom: "16px",
      overflowX: "auto",
    }}>
      {TABS.map(({ key, label, short, icon: Icon }) => {
        const active = activeTab === key;
        return (
          <button key={key} onClick={() => onChange(key)} style={{
            flex: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "5px",
            padding: isMobile ? "8px 6px" : "9px 10px",
            borderRadius: "10px", border: "none",
            background: active ? "var(--gs-text)" : "transparent",
            color: active ? "var(--gs-bg)" : "var(--gs-text-muted)",
            fontSize: isMobile ? "11px" : "13px",
            fontWeight: active ? "700" : "500",
            cursor: "pointer", fontFamily: "inherit",
            transition: "all .15s",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--gs-hover)"; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
          >
            <Icon size={13} />
            {isMobile ? short : label}
          </button>
        );
      })}
    </div>
  );
}
