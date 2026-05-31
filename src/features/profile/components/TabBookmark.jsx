// src/features/profile/components/TabBookmark.jsx
import { useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck } from "lucide-react";

export default function TabBookmark({ bookmarks, loading, isMobile }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: "72px",
              borderRadius: "14px",
              background: "#e2ddd5",
              opacity: 0.5,
              animation: "pulse 1.5s infinite",
            }}
          />
        ))}
      </div>
    );
  }

  if (!bookmarks.length) {
    return (
      <div
        style={{
          background: "white",
          borderRadius: "14px",
          border: "1px solid #e2ddd5",
          padding: "48px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Bookmark size={32} color="#e2ddd5" />
        <div style={{ fontSize: "14px", color: "#6b6860" }}>
          Belum ada soal yang disimpan.
        </div>
        <div style={{ fontSize: "13px", color: "#b4b2a9" }}>
          Tap ikon bookmark di halaman soal untuk menyimpan.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {bookmarks.map((b) => (
        <div
          key={b.id}
          onClick={() => navigate(`/soal/${b.kode}`)}
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
          <BookmarkCheck size={18} color="#e84c2b" style={{ flexShrink: 0 }} />

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
              {b.body
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
                ? `${b.mapel} — ${b.subtopik}`
                : `${b.jenjang} — ${b.mapel} — ${b.subtopik}`}
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
                {b.kode}
              </span>
              <span style={{ fontSize: "11px", color: "#b4b2a9" }}>
                {new Date(b.created_at).toLocaleDateString("id-ID", {
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
