// src/features/admin/AdminMateri.jsx
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus, Search, Pencil, Trash2, BookOpen, GraduationCap,
  X, Loader2, ChevronLeft, ChevronRight, Upload, Download,
  Save, GripVertical, ExternalLink,
} from "lucide-react";
import api from "../../lib/api";
import useWindowWidth from "../../hooks/useWindowWidth";
import { Helmet } from "react-helmet-async";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// ── Checkbox ─────────────────────────────────────────────────────────────────

function Checkbox({ checked, indeterminate, onChange, size = 16 }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate; }, [indeterminate]);
  return (
    <input ref={ref} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
      style={{ width: size, height: size, accentColor: "#1a8a6e", cursor: "pointer", flexShrink: 0 }} />
  );
}

// ── BulkBar ───────────────────────────────────────────────────────────────────

function BulkBar({ count, onDelete, onClear }) {
  return (
    <div style={{ position: "fixed", bottom: "28px", left: "50%", transform: "translateX(-50%)", background: "#0f0e17", borderRadius: "16px", padding: "10px 10px 10px 18px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 12px 40px rgba(0,0,0,.3)", zIndex: 100, whiteSpace: "nowrap" }}>
      <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "#e84c2b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", color: "white", flexShrink: 0 }}>{count}</div>
      <span style={{ fontSize: "13.5px", fontWeight: "600", color: "white" }}>materi dipilih</span>
      <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,.15)" }} />
      <button onClick={onDelete}
        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "9px", border: "none", background: "#e84c2b", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
        <Trash2 size={14} /> Hapus
      </button>
      <button onClick={onClear}
        style={{ width: "30px", height: "30px", borderRadius: "9px", border: "1px solid rgba(255,255,255,.15)", background: "transparent", color: "rgba(255,255,255,.6)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <X size={14} />
      </button>
    </div>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────

function DeleteModal({ title, body, onConfirm, onClose, loading }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "16px" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "white", borderRadius: "20px", padding: "28px", maxWidth: "400px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,.18)" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
          <Trash2 size={22} color="#e84c2b" />
        </div>
        <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f0e17", marginBottom: "10px" }}>{title}</h3>
        <p style={{ fontSize: "13.5px", color: "#6b6860", lineHeight: 1.6, marginBottom: "24px" }}>{body}</p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} disabled={loading}
            style={{ padding: "9px 20px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", fontSize: "13.5px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#0f0e17" }}>
            Batal
          </button>
          <button onClick={onConfirm} disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 20px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "13.5px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? 0.7 : 1 }}>
            {loading && <Loader2 size={14} style={{ animation: "spin .7s linear infinite" }} />}
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SubtopikFilter ────────────────────────────────────────────────────────────

function SubtopikFilter({ struktur, filterSubtopikId, onChange }) {
  const [query, setQuery] = useState("");
  const [open,  setOpen]  = useState(false);
  const wrapRef  = useRef(null);
  const inputRef = useRef(null);

  const topikMap   = useMemo(() => Object.fromEntries(struktur.topik.map(t => [t.id, t])), [struktur.topik]);
  const mapelMap   = useMemo(() => Object.fromEntries(struktur.mapel.map(m => [m.id, m])), [struktur.mapel]);
  const subjMap    = useMemo(() => Object.fromEntries(struktur.subjenjang.map(s => [s.id, s])), [struktur.subjenjang]);
  const jenjangMap = useMemo(() => Object.fromEntries(struktur.jenjang.map(j => [j.id, j])), [struktur.jenjang]);

  const enriched = useMemo(() => struktur.subtopik.map(st => {
    const topik   = topikMap[st.topik_id]       || {};
    const mapel   = mapelMap[topik.mapel_id]     || {};
    const subj    = subjMap[mapel.subjenjang_id] || {};
    const jenjang = jenjangMap[subj.jenjang_id]  || {};
    return { ...st, topik, mapel, subj, jenjang, fullText: [jenjang.nama, subj.nama, mapel.nama, topik.nama, st.nama].filter(Boolean).join(" ").toLowerCase() };
  }), [struktur.subtopik, topikMap, mapelMap, subjMap, jenjangMap]);

  const results = useMemo(() => {
    if (!query.trim()) return enriched.slice(0, 60);
    return enriched.filter(s => s.fullText.includes(query.toLowerCase())).slice(0, 60);
  }, [enriched, query]);

  const selected = useMemo(() => enriched.find(s => s.id == filterSubtopikId) || null, [enriched, filterSubtopikId]);

  useEffect(() => {
    const handler = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = st => { onChange(st.id); setQuery(""); setOpen(false); };
  const handleClear  = e => { e.stopPropagation(); onChange(null); setQuery(""); };

  return (
    <div ref={wrapRef} style={{ position: "relative", minWidth: "220px", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setTimeout(() => inputRef.current?.focus(), 60); }}
        style={{
          display: "flex", alignItems: "center", gap: "7px",
          padding: "9px 12px", borderRadius: "10px", fontFamily: "inherit", cursor: "pointer",
          border: selected ? "1px solid #1a8a6e" : "1px solid #e2ddd5",
          background: selected ? "#e4f5f0" : "white",
          fontSize: "13px", fontWeight: selected ? "700" : "400",
          color: selected ? "#1a8a6e" : "#6b6860",
          transition: "all .15s", whiteSpace: "nowrap",
        }}
      >
        <Search size={13} style={{ flexShrink: 0 }} />
        {selected ? selected.nama : "Filter Subtopik"}
        {selected && (
          <span onClick={handleClear} style={{ marginLeft: "2px", display: "flex", alignItems: "center", color: "#1a8a6e", opacity: 0.7 }}>
            <X size={13} />
          </span>
        )}
        {!selected && <ChevronRight size={13} style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .15s", opacity: 0.5 }} />}
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, minWidth: "300px", background: "white", border: "1.5px solid #e2ddd5", borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,.12)", zIndex: 200, overflow: "hidden" }}>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid #f0ede6" }}>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cari subtopik..."
              style={{ width: "100%", border: "none", outline: "none", fontSize: "13px", fontFamily: "inherit", color: "#0f0e17", background: "transparent" }}
            />
          </div>
          <div style={{ maxHeight: "260px", overflowY: "auto" }}>
            {results.length === 0 ? (
              <div style={{ padding: "16px 14px", fontSize: "13px", color: "#b4b2a9", textAlign: "center" }}>Tidak ditemukan</div>
            ) : results.map(st => (
              <button key={st.id} type="button" onClick={() => handleSelect(st)}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", border: "none", background: st.id == filterSubtopikId ? "#e4f5f0" : "transparent", cursor: "pointer", fontFamily: "inherit", borderBottom: "1px solid #f0ede6" }}
                onMouseEnter={e => { if (st.id != filterSubtopikId) e.currentTarget.style.background = "#faf9f6"; }}
                onMouseLeave={e => { if (st.id != filterSubtopikId) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "3px", flexWrap: "wrap" }}>
                  {[st.mapel?.nama, st.topik?.nama].filter(Boolean).map((c, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                      <span style={{ fontSize: "11px", color: "#b4b2a9" }}>{c}</span>
                      <ChevronRight size={9} color="#d4d0c8" />
                    </span>
                  ))}
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f0e17" }}>{st.nama}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MateriRow (table row) ─────────────────────────────────────────────────────

function MateriRow({ item, selected, onToggle, onEdit, onDelete, onView, isMobile, reorderMode, isDragging, isDragOver, dragOverPos, onDragStart, onDragOver, onDrop, onDragEnd }) {
  const published = Number(item.is_published) === 1;
  const accentColor = selected ? "#1a8a6e" : published ? "#1a8a6e" : "#f5a623";
  return (
    <>
      {isDragOver && dragOverPos === "top" && (
        <tr><td colSpan={4} style={{ padding: 0, height: "2px", background: "#1a8a6e" }} /></tr>
      )}
      <tr
        draggable={reorderMode}
        onDragStart={reorderMode ? onDragStart : undefined}
        onDragOver={reorderMode ? e => { e.preventDefault(); onDragOver(e); } : undefined}
        onDrop={reorderMode ? e => { e.preventDefault(); onDrop(e); } : undefined}
        onDragEnd={reorderMode ? onDragEnd : undefined}
        style={{
          background: isDragging ? "#f0fdf8" : selected ? "#f0fdf8" : "white",
          opacity: isDragging ? 0.45 : 1,
          cursor: reorderMode ? "grab" : "default",
          transition: "background .1s",
        }}
        onMouseEnter={e => { if (!selected && !reorderMode) e.currentTarget.style.background = "#faf9f6"; }}
        onMouseLeave={e => { e.currentTarget.style.background = selected ? "#f0fdf8" : "white"; }}
      >
        {/* Accent bar + checkbox/handle */}
        <td style={{ width: "40px", padding: "0 0 0 0", borderBottom: "1px solid #f0ede6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "4px" }}>
            <div style={{ width: "3px", alignSelf: "stretch", background: accentColor, borderRadius: "2px", minHeight: "36px" }} />
            {reorderMode ? (
              <div style={{ color: "#b4b2a9", display: "flex", alignItems: "center", paddingRight: "4px" }}>
                <GripVertical size={15} />
              </div>
            ) : (
              <div style={{ paddingRight: "4px" }}>
                <Checkbox checked={selected} onChange={onToggle} />
              </div>
            )}
          </div>
        </td>

        {/* Judul + Lokasi */}
        <td style={{ padding: "10px 12px 10px 0", borderBottom: "1px solid #f0ede6", maxWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {reorderMode && (
              <div style={{ width: "20px", height: "20px", borderRadius: "5px", background: "#f2efe8", border: "1px solid #e2ddd5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "#b4b2a9", flexShrink: 0 }}>
                {item._localUrutan !== undefined ? item._localUrutan + 1 : item.urutan + 1}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.judul}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
                <div style={{ fontSize: "11px", color: "#b4b2a9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {[item.topik, item.subtopik].filter(Boolean).join(" › ")}
                </div>
                {item.jumlah_highlights > 0 && (
                  <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 6px", borderRadius: "5px", background: "#eff6ff", color: "#2563eb", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {item.jumlah_highlights} highlight
                  </span>
                )}
                {item.jumlah_pertanyaan > 0 && (
                  <span style={{ fontSize: "10px", fontWeight: "700", padding: "1px 6px", borderRadius: "5px", background: "#fef9ee", color: "#b45309", whiteSpace: "nowrap", flexShrink: 0 }}>
                    {item.jumlah_pertanyaan} soal
                  </span>
                )}
              </div>
            </div>
          </div>
        </td>

        {/* Status */}
        <td style={{ padding: "10px 12px 10px 0", borderBottom: "1px solid #f0ede6", whiteSpace: "nowrap", width: "90px" }}>
          <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "99px", color: published ? "#1a8a6e" : "#b45309", background: published ? "#e4f5f0" : "#fef9ee" }}>
            {published ? "Published" : "Draft"}
          </span>
        </td>

        {/* Actions */}
        <td style={{ padding: "10px 12px 10px 0", borderBottom: "1px solid #f0ede6", whiteSpace: "nowrap", width: "100px" }}>
          <div style={{ display: "flex", gap: "5px", justifyContent: "flex-end" }}>
            <button onClick={() => onView(item)}
              style={{ width: "28px", height: "28px", borderRadius: "7px", border: "1px solid #bfdbfe", background: "#eff6ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", transition: "all .15s" }}
              title="Lihat halaman publik"
              onMouseEnter={e => e.currentTarget.style.background = "#dbeafe"}
              onMouseLeave={e => e.currentTarget.style.background = "#eff6ff"}>
              <ExternalLink size={12} />
            </button>
            <button onClick={() => onEdit(item)}
              style={{ width: "28px", height: "28px", borderRadius: "7px", border: "1px solid #e2ddd5", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b6860", transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f2efe8"; e.currentTarget.style.borderColor = "#0f0e17"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2ddd5"; }}>
              <Pencil size={12} />
            </button>
            <button onClick={() => onDelete(item)}
              style={{ width: "28px", height: "28px", borderRadius: "7px", border: "1px solid #fca5a5", background: "#fff3f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#e84c2b", transition: "all .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
              onMouseLeave={e => e.currentTarget.style.background = "#fff3f0"}>
              <Trash2 size={12} />
            </button>
          </div>
        </td>
      </tr>
      {isDragOver && dragOverPos === "bottom" && (
        <tr><td colSpan={4} style={{ padding: 0, height: "2px", background: "#1a8a6e" }} /></tr>
      )}
    </>
  );
}

// ── StrukturTreePanel ─────────────────────────────────────────────────────────

const LEVEL_NEXT  = { root: "jenjang", jenjang: "subjenjang", subjenjang: "mapel", mapel: "topik", topik: null };
const LEVEL_LABEL = { root: "Jenjang", jenjang: "Kelas", subjenjang: "Mapel", mapel: "Topik", topik: "Subtopik" };
const LEVEL_COLOR = { root: "#e84c2b", jenjang: "#f5a623", subjenjang: "#2563eb", mapel: "#1a8a6e", topik: "#7c3aed" };

function StrukturTreePanel({ struktur, filterSubtopikId, onChange, countKey = "jumlah_soal" }) {
  const [stack, setStack] = useState([{ level: "root", item: null }]);
  const current  = stack[stack.length - 1];
  const isLeaf   = current.level === "topik";
  const color    = LEVEL_COLOR[current.level];

  useEffect(() => {
    if (!filterSubtopikId) { setStack([{ level: "root", item: null }]); return; }
    if (!struktur.subtopik.length) return;
    const st      = struktur.subtopik.find(s => s.id == filterSubtopikId); if (!st) return;
    const topik   = struktur.topik.find(t => t.id == st.topik_id);         if (!topik) return;
    const mapel   = struktur.mapel.find(m => m.id == topik.mapel_id);      if (!mapel) return;
    const subj    = struktur.subjenjang.find(s => s.id == mapel.subjenjang_id); if (!subj) return;
    const jenjang = struktur.jenjang.find(j => j.id == subj.jenjang_id);   if (!jenjang) return;
    setStack([
      { level: "root",       item: null    },
      { level: "jenjang",    item: jenjang },
      { level: "subjenjang", item: subj    },
      { level: "mapel",      item: mapel   },
      { level: "topik",      item: topik   },
    ]);
  }, [filterSubtopikId, struktur]);

  const getChildren = ({ level, item }) => {
    const pid = item?.id;
    if (level === "root")       return struktur.jenjang;
    if (level === "jenjang")    return struktur.subjenjang.filter(s => s.jenjang_id == pid);
    if (level === "subjenjang") return struktur.mapel.filter(m => m.subjenjang_id == pid);
    if (level === "mapel")      return struktur.topik.filter(t => t.mapel_id == pid);
    if (level === "topik")      return struktur.subtopik.filter(st => st.topik_id == pid);
    return [];
  };

  const items = getChildren(current);

  const handleClick = item => {
    if (isLeaf) {
      onChange(item.id === filterSubtopikId ? null : item.id);
    } else {
      setStack(s => [...s, { level: LEVEL_NEXT[current.level], item }]);
    }
  };

  return (
    <div style={{ width: "196px", flexShrink: 0, background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", overflow: "hidden", alignSelf: "flex-start", position: "sticky", top: "16px" }}>
      {/* Header */}
      <div style={{ padding: "10px 12px", borderBottom: "1px solid #f0ede6", display: "flex", alignItems: "center", gap: "6px", background: color + "08" }}>
        {stack.length > 1 && (
          <button onClick={() => setStack(s => s.slice(0, -1))}
            style={{ background: "none", border: "none", cursor: "pointer", color: color, display: "flex", padding: "2px", borderRadius: "4px", flexShrink: 0 }}>
            <ChevronLeft size={14} />
          </button>
        )}
        <span style={{ fontSize: "11px", fontWeight: "700", color: color, textTransform: "uppercase", letterSpacing: ".07em", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {current.item ? current.item.nama : LEVEL_LABEL[current.level]}
        </span>
      </div>

      {/* "Semua" row — only at leaf */}
      {isLeaf && (
        <button onClick={() => onChange(null)}
          style={{ display: "flex", alignItems: "center", width: "100%", padding: "7px 12px", border: "none", borderBottom: "1px solid #f5f3ef", background: !filterSubtopikId ? color + "12" : "white", cursor: "pointer", fontFamily: "inherit" }}
          onMouseEnter={e => { if (filterSubtopikId) e.currentTarget.style.background = "#faf9f6"; }}
          onMouseLeave={e => { if (filterSubtopikId) e.currentTarget.style.background = "white"; }}>
          <span style={{ fontSize: "12px", fontWeight: !filterSubtopikId ? "700" : "500", color: !filterSubtopikId ? color : "#6b6860" }}>Semua subtopik</span>
        </button>
      )}

      {/* Items */}
      <div style={{ maxHeight: "460px", overflowY: "auto" }}>
        {items.length === 0 ? (
          <div style={{ padding: "14px 12px", fontSize: "12px", color: "#b4b2a9", textAlign: "center" }}>Kosong</div>
        ) : items.map(item => {
          const isSelected = isLeaf && item.id == filterSubtopikId;
          const count = item[countKey] ?? 0;
          return (
            <button key={item.id} onClick={() => handleClick(item)}
              style={{ display: "flex", alignItems: "center", width: "100%", padding: "7px 12px", border: "none", borderBottom: "1px solid #f5f3ef", background: isSelected ? color + "12" : "white", cursor: "pointer", fontFamily: "inherit", gap: "6px", textAlign: "left" }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#faf9f6"; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? color + "12" : "white"; }}>
              <span style={{ flex: 1, fontSize: "12.5px", fontWeight: isSelected ? "700" : "500", color: isSelected ? color : "#0f0e17", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.nama}
              </span>
              {count > 0 && (
                <span style={{ fontSize: "10.5px", fontWeight: "700", color: isSelected ? color : "#b4b2a9", flexShrink: 0 }}>{count}</span>
              )}
              {!isLeaf && <ChevronRight size={11} color={isSelected ? color : "#d4d0c8"} style={{ flexShrink: 0 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminMateri() {
  const navigate  = useNavigate();
  const width     = useWindowWidth();
  const isMobile  = width <= 480;

  const [searchParams, setSearchParams] = useSearchParams();
  const updateParams = (updates) =>
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([k, v]) => {
        if (v == null || v === "" || v === 1) next.delete(k);
        else next.set(k, String(v));
      });
      return next;
    }, { replace: true });

  // Structure for subtopik filter
  const [struktur, setStruktur] = useState({ jenjang: [], subjenjang: [], mapel: [], topik: [], subtopik: [] });
  useEffect(() => {
    api.get("/admin/struktur").then(d => setStruktur(d)).catch(() => {});
  }, []);

  const [items, setItems]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [total, setTotal]             = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [draftCount, setDraftCount]   = useState(0);
  const page             = Number(searchParams.get("page"))    || 1;
  const filterPublished  = searchParams.get("pub")             || "";
  const filterSubtopikId = Number(searchParams.get("subtopik")) || null;
  const [search,          setSearch]          = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("q") || "");

  // Single delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  const [exporting, setExporting]   = useState(false);
  const [exportError, setExportError] = useState("");
  const handleExport = async () => {
    setExporting(true); setExportError("");
    try {
      const params = new URLSearchParams();
      if (filterSubtopikId)   params.set("subtopik_id", filterSubtopikId);
      if (debouncedSearch)    params.set("search", debouncedSearch);
      if (filterPublished !== "") params.set("is_published", filterPublished);
      const data = await api.get(`/admin/materi/export?${params}`);
      if (!Array.isArray(data) || data.length === 0) {
        setExportError("Tidak ada materi yang cocok dengan filter saat ini.");
        return;
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      const subtopikNama = struktur.subtopik.find(s => s.id == filterSubtopikId)?.nama;
      a.href     = url;
      a.download = subtopikNama ? `materi-${subtopikNama.toLowerCase().replace(/\s+/g, "-")}.json` : "materi-export.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportError(e?.error || e?.message || "Gagal export. Coba deploy API dulu.");
    } finally { setExporting(false); }
  };

  // Multi-select
  const [selected, setSelected]               = useState(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [bulkDeleting, setBulkDeleting]       = useState(false);

  // Reorder (only active when filterSubtopikId set)
  const [reorderItems, setReorderItems] = useState(null);
  const [reorderDirty, setReorderDirty] = useState(false);
  const [savingOrder, setSavingOrder]   = useState(false);
  const [dragIndex, setDragIndex]       = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dragOverPos, setDragOverPos]   = useState(null); // "top" | "bottom"

  const reorderMode = !!filterSubtopikId;
  const LIMIT = reorderMode ? 200 : 20;
  const totalPages = reorderMode ? 1 : Math.ceil(total / LIMIT);

  const displayItems = reorderMode ? (reorderItems ?? items) : items;

  const currentIds     = items.map(i => i.id);
  const allSelected    = currentIds.length > 0 && currentIds.every(id => selected.has(id));
  const someSelected   = currentIds.some(id => selected.has(id)) && !allSelected;

  const debounceRef = useRef(null);
  const handleSearchChange = useCallback(val => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(val); updateParams({ q: val, page: null }); }, 350);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (filterPublished !== "") params.set("published", filterPublished);
      if (filterSubtopikId)  params.set("subtopik_id", filterSubtopikId);
      const res = await api.get(`/admin/materi?${params}`);
      const data = res.data ?? [];
      setItems(data);
      setTotal(res.total ?? 0);
      setPublishedCount(res.published_count ?? 0);
      setDraftCount(res.draft_count ?? 0);
      if (filterSubtopikId) {
        setReorderItems(data.map((item, i) => ({ ...item, _localUrutan: i })));
        setReorderDirty(false);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filterPublished, filterSubtopikId, LIMIT]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setSelected(new Set()); }, [page, debouncedSearch, filterPublished, filterSubtopikId]);
  useEffect(() => {
    if (!filterSubtopikId) { setReorderItems(null); setReorderDirty(false); }
  }, [filterSubtopikId]);

  // Single delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/materi?id=${deleteTarget.id}`);
      setDeleteTarget(null);
      setSelected(prev => { const n = new Set(prev); n.delete(deleteTarget.id); return n; });
      fetchData();
    } catch {
    } finally {
      setDeleting(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      await api.delete("/admin/materi/bulk", { data: { ids: [...selected] } });
      setSelected(new Set());
      setConfirmBulkDelete(false);
      fetchData();
    } catch {
    } finally {
      setBulkDeleting(false);
    }
  };

  // Reorder via drag-and-drop
  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDragOver = (e, index) => {
    if (dragIndex === null || dragIndex === index) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDragOverIndex(index);
    setDragOverPos(e.clientY < midY ? "top" : "bottom");
  };

  const handleDrop = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    setReorderItems(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIndex, 1);
      const insertAt = dragOverPos === "top" ? (dragIndex < index ? index - 1 : index) : (dragIndex < index ? index : index + 1);
      arr.splice(insertAt, 0, moved);
      return arr.map((item, i) => ({ ...item, _localUrutan: i }));
    });
    setReorderDirty(true);
    setDragIndex(null);
    setDragOverIndex(null);
    setDragOverPos(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
    setDragOverPos(null);
  };

  const handleSaveOrder = async () => {
    if (!reorderItems) return;
    setSavingOrder(true);
    try {
      await api.put("/admin/materi/reorder", {
        items: reorderItems.map((item, i) => ({ id: item.id, urutan: i + 1 })),
      });
      setReorderDirty(false);
      fetchData();
    } catch {
    } finally {
      setSavingOrder(false);
    }
  };

  // Selection helpers
  const toggleOne = id => setSelected(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const toggleAll = checked => setSelected(prev => {
    const n = new Set(prev);
    currentIds.forEach(id => checked ? n.add(id) : n.delete(id));
    return n;
  });

  const chips = [
    { label: `${publishedCount + draftCount} Total`, color: "rgba(255,255,255,.8)", bg: "rgba(255,255,255,.1)" },
    { label: `${publishedCount} Published`,           color: "#6ee7b7",             bg: "rgba(110,231,183,.12)" },
    { label: `${draftCount} Draft`,                   color: "#fcd34d",             bg: "rgba(252,211,77,.12)" },
  ];

  const FILTER_OPTIONS = [
    { value: "", label: "Semua" },
    { value: "1", label: "Published" },
    { value: "0", label: "Draft" },
  ];

  return (
    <>
      <Helmet>
        <title>Kelola Materi | Admin Gudang Soal</title>
      </Helmet>

      {/* ── Hero Header ── */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #0a1c1a 100%)",
        padding: isMobile ? "24px 20px" : "28px 32px",
        marginBottom: "20px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%", transform: "translateY(-50%)", opacity: 0.06, pointerEvents: "none", color: "white" }}>
          <GraduationCap size={isMobile ? 80 : 110} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 12px" }}>
            Kelola Materi
          </h1>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {chips.map(c => (
                <span key={c.label} style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: c.color, background: c.bg }}>
                  {c.label}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              <button onClick={handleExport} disabled={exporting}
                style={{ display: "flex", alignItems: "center", gap: "7px", background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.85)", border: "1px solid rgba(255,255,255,.15)", borderRadius: "10px", padding: "10px 16px", fontSize: "13.5px", fontWeight: "600", cursor: exporting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: exporting ? 0.6 : 1 }}
                onMouseEnter={e => { if (!exporting) { e.currentTarget.style.background = "rgba(255,255,255,.18)"; e.currentTarget.style.color = "white"; }}}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.color = "rgba(255,255,255,.85)"; }}>
                <Download size={14} /> {exporting ? "Mengunduh..." : "Export JSON"}
              </button>
              <button onClick={() => navigate(filterSubtopikId ? `/admin/materi/bulk-import?subtopik=${filterSubtopikId}` : "/admin/materi/bulk-import")}
                style={{ display: "flex", alignItems: "center", gap: "7px", background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.85)", border: "1px solid rgba(255,255,255,.15)", borderRadius: "10px", padding: "10px 16px", fontSize: "13.5px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.18)"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.color = "rgba(255,255,255,.85)"; }}>
                <Upload size={14} /> Import Bulk
              </button>
              <button onClick={() => navigate("/admin/materi/tambah")}
                style={{ display: "flex", alignItems: "center", gap: "7px", background: "#e84c2b", color: "white", border: "none", borderRadius: "10px", padding: "10px 18px", fontSize: "13.5px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 16px rgba(232,76,43,.35)", fontFamily: "inherit" }}>
                <Plus size={15} /> Tambah Materi
              </button>
            </div>
          </div>
        </div>
      </div>

      {exportError && (
        <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "#b91c1c", fontWeight: "500" }}>{exportError}</span>
          <button onClick={() => setExportError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#b91c1c", display: "flex", padding: 0, flexShrink: 0 }}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── Two-column: Tree + Content ── */}
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        {!isMobile && (
          <StrukturTreePanel
            struktur={struktur}
            filterSubtopikId={filterSubtopikId}
            onChange={id => { updateParams({ subtopik: id || null, page: null }); }}
            countKey="jumlah_materi"
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>

      {/* ── Filters ── */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#b4b2a9", pointerEvents: "none" }} />
          <input type="text" placeholder="Cari judul materi..." value={search}
            onChange={e => handleSearchChange(e.target.value)}
            style={{ width: "100%", paddingLeft: "36px", paddingRight: search ? "36px" : "12px", paddingTop: "9px", paddingBottom: "9px", border: "1px solid #e2ddd5", borderRadius: "10px", fontSize: "13.5px", fontFamily: "inherit", outline: "none", background: "white", color: "#0f0e17", boxSizing: "border-box" }} />
          {search && (
            <button onClick={() => handleSearchChange("")}
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#b4b2a9", display: "flex", padding: "2px" }}>
              <X size={14} />
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {FILTER_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => { updateParams({ pub: opt.value, page: null }); }}
              style={{ padding: "9px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", transition: "all .15s", border: filterPublished === opt.value ? "1px solid #0f0e17" : "1px solid #e2ddd5", background: filterPublished === opt.value ? "#0f0e17" : "white", color: filterPublished === opt.value ? "white" : "#6b6860" }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subtopik filter (mobile only) + reorder save row */}
      {(isMobile || reorderMode) && (
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        {isMobile && (
          <SubtopikFilter
            struktur={struktur}
            filterSubtopikId={filterSubtopikId}
            onChange={id => { updateParams({ subtopik: id || null, page: null }); }}
          />
        )}
        {reorderMode && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "8px", background: "#fff8e6", border: "1px solid #fcd34d", fontSize: "12px", fontWeight: "600", color: "#b45309" }}>
              <GripVertical size={13} />
              Mode Urutan
            </div>
            {reorderDirty && (
              <button onClick={handleSaveOrder} disabled={savingOrder}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", border: "none", background: savingOrder ? "#e2ddd5" : "#1a8a6e", color: savingOrder ? "#b4b2a9" : "white", fontSize: "13px", fontWeight: "700", cursor: savingOrder ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {savingOrder ? <Loader2 size={13} style={{ animation: "spin .7s linear infinite" }} /> : <Save size={13} />}
                {savingOrder ? "Menyimpan..." : "Simpan Urutan"}
              </button>
            )}
          </div>
        )}
      </div>
      )}

      {/* ── List ── */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px", color: "#b4b2a9", gap: "10px" }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: "14px" }}>Memuat materi...</span>
        </div>
      ) : displayItems.length === 0 ? (
        <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2ddd5", padding: "60px 48px", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <BookOpen size={26} color="#e84c2b" />
          </div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f0e17", marginBottom: "6px" }}>
            {debouncedSearch || filterPublished !== "" || filterSubtopikId ? "Tidak ada materi yang cocok" : "Belum ada materi"}
          </div>
          <p style={{ fontSize: "13px", color: "#6b6860", marginBottom: "20px" }}>
            {debouncedSearch || filterPublished !== "" || filterSubtopikId ? "Coba ubah filter." : "Mulai tambahkan materi belajar untuk pelajar."}
          </p>
          {!debouncedSearch && filterPublished === "" && !filterSubtopikId && (
            <button onClick={() => navigate("/admin/materi/tambah")}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
              <Plus size={15} /> Tambah Materi
            </button>
          )}
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(to right, #faf9f6, white)" }}>
                {/* Accent bar + checkbox/grip col */}
                <th style={{ width: "40px", padding: "10px 0", borderBottom: "1px solid #e2ddd5", textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "4px" }}>
                    <div style={{ width: "3px", alignSelf: "stretch", minHeight: "20px" }} />
                    {!reorderMode && (
                      <div style={{ paddingRight: "4px" }}>
                        <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
                      </div>
                    )}
                  </div>
                </th>
                <th style={{ padding: "10px 12px 10px 0", borderBottom: "1px solid #e2ddd5", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b6860", textTransform: "uppercase", letterSpacing: ".06em" }}>
                  {selected.size > 0 && !reorderMode
                    ? <span style={{ color: "#1a8a6e" }}>{selected.size} dipilih</span>
                    : "Judul"}
                </th>
                <th style={{ padding: "10px 12px 10px 0", borderBottom: "1px solid #e2ddd5", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b6860", textTransform: "uppercase", letterSpacing: ".06em", width: "90px" }}>
                  Status
                </th>
                <th style={{ padding: "10px 12px 10px 0", borderBottom: "1px solid #e2ddd5", width: "100px" }} />
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item, idx) => (
                <MateriRow
                  key={item.id}
                  item={item}
                  selected={selected.has(item.id)}
                  onToggle={() => toggleOne(item.id)}
                  isMobile={isMobile}
                  onView={i => window.open(`/materi/${i.id}`, "_blank")}
                  onEdit={i => window.open(`/admin/materi/edit/${i.id}`, "_blank")}
                  onDelete={i => setDeleteTarget(i)}
                  reorderMode={reorderMode}
                  isDragging={dragIndex === idx}
                  isDragOver={dragOverIndex === idx}
                  dragOverPos={dragOverIndex === idx ? dragOverPos : null}
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={e => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx)}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination (hidden in reorder mode) ── */}
      {!reorderMode && totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px", padding: "12px 0", marginBottom: selected.size > 0 ? "80px" : "0" }}>
          <span style={{ fontSize: "13px", color: "#6b6860" }}>
            {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} dari {total}
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => updateParams({ page: page - 1 })} disabled={page === 1}
              style={{ width: "34px", height: "34px", borderRadius: "9px", border: "1px solid #e2ddd5", background: "white", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: page === 1 ? "#d4d0c8" : "#6b6860" }}>
              <ChevronLeft size={15} />
            </button>
            <button onClick={() => updateParams({ page: page + 1 })} disabled={page === totalPages}
              style={{ width: "34px", height: "34px", borderRadius: "9px", border: "1px solid #e2ddd5", background: "white", cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: page === totalPages ? "#d4d0c8" : "#6b6860" }}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
        </div>{/* end right column */}
      </div>{/* end two-column wrapper */}

      {/* ── Floating Bulk Bar ── */}
      {!reorderMode && selected.size > 0 && (
        <BulkBar count={selected.size} onDelete={() => setConfirmBulkDelete(true)} onClear={() => setSelected(new Set())} />
      )}

      {/* ── Bulk delete confirm ── */}
      {confirmBulkDelete && (
        <DeleteModal
          title={`Hapus ${selected.size} Materi?`}
          body={`Tindakan ini tidak bisa dibatalkan. Semua ${selected.size} materi yang dipilih akan dihapus permanen.`}
          onConfirm={handleBulkDelete}
          onClose={() => !bulkDeleting && setConfirmBulkDelete(false)}
          loading={bulkDeleting}
        />
      )}

      {/* ── Single delete confirm ── */}
      {deleteTarget && (
        <DeleteModal
          title="Hapus Materi?"
          body="Materi ini akan dihapus permanen dan tidak bisa dikembalikan."
          onConfirm={handleDelete}
          onClose={() => !deleting && setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
