// src/components/MateriTerkaitBanner.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import MathRenderer from "./MathRenderer";
import api from "../lib/api";

const COLLAPSED_LIMIT = 4;

export default function MateriTerkaitBanner({ subtopikId, subtopikSlug, style }) {
  const [list,     setList]     = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!subtopikId && !subtopikSlug) return;
    const param = subtopikId
      ? `subtopik_id=${subtopikId}`
      : `subtopik_slug=${subtopikSlug}`;
    api.get(`/browse/materi?${param}`)
      .then(data => setList(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [subtopikId, subtopikSlug]);

  if (!list.length) return null;

  const visible   = expanded ? list : list.slice(0, COLLAPSED_LIMIT);
  const remainder = list.length - COLLAPSED_LIMIT;
  const canExpand = list.length > COLLAPSED_LIMIT;

  return (
    <div style={{ ...style }}>
      {/* Header */}
      <div style={{ fontSize: "11px", fontWeight: "700", color: "#1a8a6e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
        Materi Terkait{list.length > 1 ? ` (${list.length})` : ""}
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: list.length === 1 ? "1fr" : "repeat(2, 1fr)",
        gap: "8px",
      }}>
        {visible.map(materi => (
          <Link key={materi.id} to={`/materi/${materi.id}`} style={{ textDecoration: "none", display: "block", minWidth: 0 }}>
            <div style={{
              background: "#e4f5f0",
              border: "1px solid #a7f3d0",
              borderLeft: "3px solid #1a8a6e",
              borderRadius: "12px",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "background .15s",
              height: "100%",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "#d1fae5")}
              onMouseLeave={e => (e.currentTarget.style.background = "#e4f5f0")}
            >
              <div style={{
                width: "28px", height: "28px", borderRadius: "8px",
                background: "#1a8a6e", display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
              }}>
                <GraduationCap size={14} color="white" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f0e17", lineHeight: "1.35" }}>
                  <MathRenderer text={materi.judul} />
                </div>
              </div>
              <ChevronRight size={13} color="#1a8a6e" style={{ flexShrink: 0 }} />
            </div>
          </Link>
        ))}
      </div>

      {/* Expand / Collapse button */}
      {canExpand && (
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            marginTop: "8px",
            width: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            padding: "8px",
            borderRadius: "10px",
            border: "1px solid #a7f3d0",
            background: "transparent",
            color: "#1a8a6e",
            fontSize: "12.5px", fontWeight: "600",
            cursor: "pointer", fontFamily: "inherit",
            transition: "background .15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#e4f5f0")}
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
