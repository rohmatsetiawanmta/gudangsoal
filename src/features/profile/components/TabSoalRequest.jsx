// src/features/profile/components/TabSoalRequest.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, ExternalLink, FileQuestion } from "lucide-react";
import MathRenderer from "../../../components/MathRenderer";
import Pagination from "./Pagination";

const PER_PAGE = 10;

const STATUS_CONFIG = {
  pending:  { label: "Menunggu Review", color: "#854F0B", bg: "#faeeda" },
  approved: { label: "Disetujui",       color: "#1a8a6e", bg: "#e4f5f0" },
  rejected: { label: "Ditolak",         color: "#e84c2b", bg: "#fff3f0" },
};

export default function TabSoalRequest({ requests, loading, onKirim, isMobile }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);
  const [page, setPage] = useState(1);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ height: "72px", borderRadius: "14px", background: "var(--gs-border)", opacity: 0.5, animation: "pulse 1.5s infinite" }} />
        ))}
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div style={{ background: "var(--gs-surface)", borderRadius: "14px", border: "1px solid var(--gs-border)", padding: "48px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <FileQuestion size={32} color="var(--gs-border)" />
        <div style={{ fontSize: "14px", color: "var(--gs-text-muted)" }}>Belum ada request soal.</div>
        <button onClick={onKirim} style={{ marginTop: "4px", padding: "9px 20px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
          Kirim Request Pertama
        </button>
      </div>
    );
  }

  const totalPages = Math.ceil(requests.length / PER_PAGE);
  const slice = requests.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        <button onClick={onKirim}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--gs-border)", background: "var(--gs-surface)", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "var(--gs-text)", transition: "all .15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--gs-hover)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--gs-surface)"}
        >
          Kirim Request Baru
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {slice.map((r) => {
          const s = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
          const isOpen = expanded === r.id;
          return (
            <div key={r.id} style={{ background: "var(--gs-surface)", borderRadius: "14px", border: "1px solid var(--gs-border)", borderLeft: `3px solid ${r.status === "approved" ? "#1a8a6e" : r.status === "rejected" ? "#e84c2b" : "#f5a623"}`, overflow: "hidden" }}>
              <div onClick={() => setExpanded(isOpen ? null : r.id)}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: isMobile ? "14px 16px" : "14px 18px", cursor: "pointer" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", color: "var(--gs-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "3px" }}>
                    {r.body.replace(/\$\$?[^$]+\$\$?/g, "[math]").replace(/[*_~`#]/g, "").slice(0, 80)}…
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--gs-text-hint)" }}>
                    {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px", background: s.bg, color: s.color, flexShrink: 0 }}>
                  {s.label}
                </span>
                {isOpen ? <ChevronUp size={15} color="var(--gs-text-muted)" /> : <ChevronDown size={15} color="var(--gs-text-muted)" />}
              </div>

              {isOpen && (
                <div style={{ padding: isMobile ? "0 16px 16px" : "0 18px 18px", borderTop: "1px solid var(--gs-border)" }}>
                  <div style={{ paddingTop: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".08em", color: "var(--gs-text-muted)", marginBottom: "6px" }}>Soal</div>
                      <div style={{ fontSize: "14px", color: "var(--gs-text)" }}><MathRenderer text={r.body} block /></div>
                    </div>

                    {r.foto_url && (
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".08em", color: "var(--gs-text-muted)", marginBottom: "6px" }}>Foto</div>
                        <img src={r.foto_url} alt="Foto soal" style={{ maxWidth: "100%", maxHeight: "280px", borderRadius: "10px", border: "1px solid var(--gs-border)", objectFit: "contain" }} />
                      </div>
                    )}

                    {r.catatan && (
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".08em", color: "var(--gs-text-muted)", marginBottom: "6px" }}>Catatan</div>
                        <div style={{ fontSize: "13px", color: "var(--gs-text-muted)" }}>{r.catatan}</div>
                      </div>
                    )}

                    {r.admin_notes && (
                      <div style={{ background: r.status === "approved" ? "#e4f5f0" : "#fff3f0", borderRadius: "10px", padding: "12px 14px", borderLeft: `3px solid ${r.status === "approved" ? "#1a8a6e" : "#e84c2b"}` }}>
                        <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".08em", color: r.status === "approved" ? "#1a8a6e" : "#e84c2b", marginBottom: "4px" }}>Catatan Admin</div>
                        <div style={{ fontSize: "13px", color: "var(--gs-text)", lineHeight: "1.6" }}>{r.admin_notes}</div>
                      </div>
                    )}

                    {r.status === "approved" && r.soal_kode && (
                      <button onClick={() => navigate(`/soal/${r.soal_kode}`)}
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "9px 16px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-start" }}
                      >
                        <ExternalLink size={14} /> Lihat Soal #{r.soal_kode}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} isMobile={isMobile} />
    </div>
  );
}
