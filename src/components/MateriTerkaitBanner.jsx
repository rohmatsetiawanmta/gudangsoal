// src/components/MateriTerkaitBanner.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import MathRenderer from "./MathRenderer";
import api from "../lib/api";

const COLLAPSED_LIMIT = 4;

export default function MateriTerkaitBanner({ subtopikId, subtopikSlug, materi, sidebar, style }) {
  const [fetched,  setFetched]  = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (materi !== undefined) return;
    if (!subtopikId && !subtopikSlug) return;
    const param = subtopikId
      ? `subtopik_id=${subtopikId}`
      : `subtopik_slug=${subtopikSlug}`;
    api.get(`/browse/materi?${param}`)
      .then(data => setFetched(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [subtopikId, subtopikSlug, materi]);

  const list      = materi !== undefined ? materi : fetched;
  if (!list.length) return null;

  const visible   = sidebar || expanded ? list : list.slice(0, COLLAPSED_LIMIT);
  const remainder = list.length - COLLAPSED_LIMIT;
  const canExpand = !sidebar && list.length > COLLAPSED_LIMIT;

  return (
    <div style={{ ...style }}>
      {/* Header */}
      <div style={{
        fontSize: "11px", fontWeight: "700",
        color: "#1a8a6e", textTransform: "uppercase",
        letterSpacing: "0.06em", marginBottom: "8px",
      }}>
        Materi Terkait{list.length > 1 ? ` (${list.length})` : ""}
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: sidebar || list.length === 1 ? "1fr" : "repeat(2, 1fr)",
        gap: "8px",
      }}>
        {visible.map(m => (
          <Link key={m.id} to={`/materi/${m.id}`} style={{ textDecoration: "none", display: "block", minWidth: 0 }}>
            <div
              style={{
                background: "var(--gs-surface)",
                border: "1px solid var(--gs-border)",
                borderLeft: "3px solid #1a8a6e",
                borderRadius: "12px",
                padding: "10px 12px",
                display: "flex", alignItems: "center", gap: "10px",
                transition: "background .15s, box-shadow .15s",
                height: "100%",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "var(--gs-hover)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,.06)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "var(--gs-surface)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{
                width: "28px", height: "28px", borderRadius: "8px",
                background: "rgba(26,138,110,.12)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <GraduationCap size={14} color="#1a8a6e" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "13px", fontWeight: "600",
                  color: "var(--gs-text)", lineHeight: "1.35",
                  overflow: "hidden", display: "-webkit-box",
                  WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                }}>
                  <MathRenderer text={m.judul} />
                </div>
              </div>
              <ChevronRight size={13} color="#1a8a6e" style={{ flexShrink: 0, opacity: 0.6 }} />
            </div>
          </Link>
        ))}
      </div>

      {/* Expand / Collapse */}
      {canExpand && (
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            marginTop: "8px", width: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            padding: "8px",
            borderRadius: "10px",
            border: "1px solid var(--gs-border)",
            background: "transparent",
            color: "#1a8a6e",
            fontSize: "12.5px", fontWeight: "600",
            cursor: "pointer", fontFamily: "inherit",
            transition: "background .15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--gs-hover)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          {expanded
            ? <><ChevronUp size={13} /> Tutup</>
            : <><ChevronDown size={13} /> Lihat {remainder} materi lainnya</>
          }
        </button>
      )}
    </div>
  );
}
