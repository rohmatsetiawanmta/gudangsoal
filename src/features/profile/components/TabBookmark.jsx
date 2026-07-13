// src/features/profile/components/TabBookmark.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck } from "lucide-react";
import Pagination from "./Pagination";

const PER_PAGE = 10;

export default function TabBookmark({ bookmarks, loading, isMobile }) {
  const navigate = useNavigate();
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

  if (!bookmarks.length) {
    return (
      <div style={{
        background: "var(--gs-surface)", borderRadius: "14px",
        border: "1px solid var(--gs-border)", padding: "48px",
        textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
      }}>
        <Bookmark size={32} color="var(--gs-border)" />
        <div style={{ fontSize: "14px", color: "var(--gs-text-muted)" }}>Belum ada soal yang disimpan.</div>
        <div style={{ fontSize: "13px", color: "var(--gs-text-hint)" }}>Tap ikon bookmark di halaman soal untuk menyimpan.</div>
      </div>
    );
  }

  const totalPages = Math.ceil(bookmarks.length / PER_PAGE);
  const slice = bookmarks.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {slice.map((b) => (
          <div
            key={b.id}
            onClick={() => navigate(`/soal/${b.kode}`)}
            style={{
              background: "var(--gs-surface)", borderRadius: "14px",
              border: "1px solid var(--gs-border)",
              padding: isMobile ? "12px 14px" : "14px 20px",
              display: "flex", alignItems: "center", gap: "12px",
              cursor: "pointer", transition: "transform .15s, box-shadow .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <BookmarkCheck size={18} color="#e84c2b" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "14px", color: "var(--gs-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {b.body.replace(/\$\$?[^$]+\$\$?/g, "[math]").replace(/[*_~`#]/g, "")}
              </div>
              <div style={{ fontSize: "12px", color: "var(--gs-text-hint)", marginTop: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {isMobile ? `${b.mapel} — ${b.subtopik}` : `${b.jenjang} — ${b.mapel} — ${b.subtopik}`}
              </div>
            </div>
            {!isMobile && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--gs-text-hint)", fontFamily: "monospace" }}>{b.kode}</span>
                <span style={{ fontSize: "11px", color: "var(--gs-text-hint)" }}>
                  {new Date(b.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} isMobile={isMobile} />
    </div>
  );
}
