// src/features/profile/components/TabXP.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Pagination from "./Pagination";

const PER_PAGE = 15;

export default function TabXP({ xpHistory, isMobile }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  if (!xpHistory?.length) {
    return (
      <div style={{
        background: "var(--gs-surface)", borderRadius: "14px",
        border: "1px solid var(--gs-border)", padding: "32px",
        textAlign: "center", color: "var(--gs-text-muted)", fontSize: "14px",
      }}>
        Belum ada riwayat XP.
      </div>
    );
  }

  const totalPages = Math.ceil(xpHistory.length / PER_PAGE);
  const slice = xpHistory.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      <div style={{ background: "var(--gs-surface)", borderRadius: "14px", border: "1px solid var(--gs-border)", overflow: "hidden" }}>
        {slice.map((h, i) => {
          const bonusMatch = h.reason.match(/\+(\d+)% bonus streak/);
          const baseReason = h.reason.replace(/\s*\(\+\d+% bonus streak\)/, "").trim();
          const bonusPercent = bonusMatch ? bonusMatch[1] : null;

          return (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 16px",
                borderBottom: i < slice.length - 1 ? "1px solid var(--gs-border)" : "none",
                transition: "background .15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--gs-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{
                width: "40px", height: "28px", borderRadius: "7px",
                background: "linear-gradient(135deg, #f5a623, #e84c2b)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "white" }}>+{h.xp}</span>
              </div>

              <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--gs-text)", flexShrink: 0 }}>
                {baseReason}
              </span>

              {bonusPercent && (
                <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "5px", background: "#e4f5f0", color: "#1a8a6e", flexShrink: 0 }}>
                  +{bonusPercent}% streak
                </span>
              )}

              {h.soal_kode && !isMobile && (
                <span
                  onClick={e => { e.stopPropagation(); navigate(`/soal/${h.soal_kode}`); }}
                  style={{ fontSize: "11px", color: "var(--gs-text-hint)", fontFamily: "monospace", cursor: "pointer", flexShrink: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#e84c2b")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--gs-text-hint)")}
                >
                  #{h.soal_kode}
                </span>
              )}

              <div style={{ flex: 1 }} />

              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                <span style={{ fontSize: "11px", color: "var(--gs-text-muted)" }}>
                  {new Date(h.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </span>
                {!isMobile && (
                  <span style={{ fontSize: "11px", color: "var(--gs-text-hint)" }}>
                    {new Date(h.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={p => { setPage(p); }} isMobile={isMobile} />
    </div>
  );
}
