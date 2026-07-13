// src/features/profile/components/TabMasukan.jsx
import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import Pagination from "./Pagination";

const PER_PAGE = 10;

const KATEGORI_LABEL = {
  saran_fitur: "Saran Fitur",
  bug: "Laporan Bug",
  minta_topik: "Request Topik",
  kualitas_konten: "Kualitas Soal",
  lainnya: "Lainnya",
};

const STATUS_CONFIG = {
  pending:         { label: "Menunggu",        color: "#854F0B", bg: "#faeeda" },
  dibaca:          { label: "Dibaca",           color: "#2563eb", bg: "#eff6ff" },
  ditindaklanjuti: { label: "Ditindaklanjuti",  color: "#1a8a6e", bg: "#e4f5f0" },
};

const KATEGORI_CONFIG = {
  saran_fitur:     { color: "#7c3aed", bg: "#f5f3ff" },
  bug:             { color: "#e84c2b", bg: "#fff3f0" },
  minta_topik:     { color: "#2563eb", bg: "#eff6ff" },
  kualitas_konten: { color: "#854F0B", bg: "#faeeda" },
  lainnya:         { color: "var(--gs-text-muted)", bg: "var(--gs-hover)" },
};

export default function TabMasukan({ masukan, loading, onKirim, isMobile }) {
  const [page, setPage] = useState(1);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ height: "80px", borderRadius: "14px", background: "var(--gs-border)", opacity: 0.5, animation: "pulse 1.5s infinite" }} />
        ))}
      </div>
    );
  }

  if (!masukan.length) {
    return (
      <div style={{
        background: "var(--gs-surface)", borderRadius: "14px",
        border: "1px solid var(--gs-border)", padding: "48px",
        textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
      }}>
        <MessageSquarePlus size={32} color="var(--gs-border)" />
        <div style={{ fontSize: "14px", color: "var(--gs-text-muted)" }}>Belum ada masukan yang dikirim.</div>
        <button onClick={onKirim} style={{ marginTop: "4px", padding: "9px 20px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
          Kirim Masukan Pertama
        </button>
      </div>
    );
  }

  const totalPages = Math.ceil(masukan.length / PER_PAGE);
  const slice = masukan.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        <button
          onClick={onKirim}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--gs-border)", background: "var(--gs-surface)", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "var(--gs-text)", transition: "all .15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--gs-hover)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--gs-surface)"}
        >
          <MessageSquarePlus size={14} /> Kirim Masukan Baru
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {slice.map((m) => {
          const status   = STATUS_CONFIG[m.status]   || STATUS_CONFIG.pending;
          const kategori = KATEGORI_CONFIG[m.kategori] || KATEGORI_CONFIG.lainnya;
          return (
            <div key={m.id} style={{ background: "var(--gs-surface)", borderRadius: "14px", border: "1px solid var(--gs-border)", padding: isMobile ? "14px 16px" : "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px", background: kategori.bg, color: kategori.color }}>
                  {KATEGORI_LABEL[m.kategori] || m.kategori}
                </span>
                <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px", background: status.bg, color: status.color }}>
                  {status.label}
                </span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: "12px", color: "var(--gs-text-hint)", flexShrink: 0 }}>
                  {new Date(m.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--gs-text)" }}>{m.judul}</div>
              <div style={{ fontSize: "13px", color: "var(--gs-text-muted)", lineHeight: "1.6" }}>{m.deskripsi}</div>
              {m.catatan && (
                <div style={{ background: m.status === "ditindaklanjuti" ? "#e4f5f0" : "var(--gs-hover)", borderRadius: "10px", padding: "10px 14px", borderLeft: `3px solid ${m.status === "ditindaklanjuti" ? "#1a8a6e" : "var(--gs-text-hint)"}` }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: m.status === "ditindaklanjuti" ? "#1a8a6e" : "var(--gs-text-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "4px" }}>Catatan Tim</div>
                  <div style={{ fontSize: "13px", color: "var(--gs-text)", lineHeight: "1.6" }}>{m.catatan}</div>
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
