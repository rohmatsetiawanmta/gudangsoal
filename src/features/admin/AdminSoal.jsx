// src/features/admin/AdminSoal.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, Pencil, Trash2,
  ChevronLeft, ChevronRight, Eye, Copy, Loader2, FileJson,
  MoreHorizontal, X, BookOpen, Filter,
} from "lucide-react";
import api from "../../lib/api";
import ToggleSwitch from "../../components/ToggleSwitch";
import useWindowWidth from "../../hooks/useWindowWidth";
import { Helmet } from "react-helmet-async";
import SoalPreviewModal from "./SoalPreviewModal";

// ── Constants ─────────────────────────────────────────────────────────────────

const DIFFICULTY = {
  1: { label: "Easy",   color: "#1a8a6e", bg: "#e4f5f0" },
  2: { label: "Medium", color: "#854F0B", bg: "#faeeda" },
  3: { label: "Hard",   color: "#e84c2b", bg: "#fff3f0" },
};

const TIPE_MAP = {
  pilihan_ganda:        { label: "PG",      color: "#2563eb", bg: "#eff6ff" },
  isian_singkat:        { label: "Isian",   color: "#1a8a6e", bg: "#e4f5f0" },
  isian_numerik:        { label: "Numerik", color: "#0891b2", bg: "#ecfeff" },
  checklist:            { label: "Check",   color: "#7c3aed", bg: "#f5f3ff" },
  multiple_choice_table:{ label: "MCT",     color: "#b45309", bg: "#fffbeb" },
  menjodohkan:          { label: "Jodoh",   color: "#be185d", bg: "#fdf2f8" },
  isian_multi:          { label: "Multi",   color: "#ea580c", bg: "#fff7ed" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function DifficultyBadge({ level }) {
  const d = DIFFICULTY[level] || DIFFICULTY[1];
  return (
    <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px", background: d.bg, color: d.color, flexShrink: 0, whiteSpace: "nowrap" }}>
      {d.label}
    </span>
  );
}

function TipeBadge({ tipe }) {
  const t = TIPE_MAP[tipe];
  if (!t) return null;
  return (
    <span style={{ fontSize: "10.5px", fontWeight: "700", padding: "2px 7px", borderRadius: "5px", background: t.bg, color: t.color, flexShrink: 0, whiteSpace: "nowrap" }}>
      {t.label}
    </span>
  );
}

function Checkbox({ checked, indeterminate, onChange, size = 16 }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate; }, [indeterminate]);
  return (
    <input ref={ref} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
      style={{ width: size, height: size, accentColor: "#e84c2b", cursor: "pointer", flexShrink: 0 }} />
  );
}

// ── ActionMenu ───────────────────────────────────────────────────────────────

function ActionMenu({ onPreview, onSalin, onEdit, onDelete, copying }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const items = [
    { label: "Preview",    icon: Eye,    onClick: () => { onPreview(); setOpen(false); } },
    { label: "Salin Soal", icon: Copy,   onClick: () => { onSalin();  setOpen(false); }, disabled: copying },
    { label: "Edit",       icon: Pencil, onClick: () => { onEdit();   setOpen(false); } },
    { label: "Hapus",      icon: Trash2, onClick: () => { onDelete(); setOpen(false); }, danger: true },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1px solid #e8e6e0", background: open ? "#f2efe8" : "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b6860", transition: "all .12s" }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = "#f2efe8"; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = "white"; }}>
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "white", border: "1px solid #e8e6e0", borderRadius: "12px", padding: "5px", boxShadow: "0 8px 24px rgba(0,0,0,.1)", zIndex: 50, minWidth: "148px" }}>
          {items.map(({ label, icon: Icon, onClick, danger, disabled }) => (
            <button key={label} onClick={onClick} disabled={disabled}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "8px", border: "none", background: "none", cursor: disabled ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: "500", color: danger ? "#e84c2b" : "#0f0e17", fontFamily: "inherit", textAlign: "left", opacity: disabled ? 0.5 : 1 }}
              onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = danger ? "#fff3f0" : "#f2efe8"; }}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── BulkBar ───────────────────────────────────────────────────────────────────

function BulkBar({ count, onDelete, onClear }) {
  return (
    <div style={{ position: "fixed", bottom: "28px", left: "50%", transform: "translateX(-50%)", background: "#0f0e17", borderRadius: "16px", padding: "10px 10px 10px 18px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 12px 40px rgba(0,0,0,.3)", zIndex: 100, whiteSpace: "nowrap" }}>
      <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "#e84c2b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", color: "white", flexShrink: 0 }}>{count}</div>
      <span style={{ fontSize: "13.5px", fontWeight: "600", color: "white" }}>soal dipilih</span>
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

// ── Filter chip ───────────────────────────────────────────────────────────────

function FilterChip({ label, active, color = "#e84c2b", onClick, count }) {
  return (
    <button onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        padding: "5px 12px", borderRadius: "20px", border: `1.5px solid ${active ? color : "#e8e6e0"}`,
        background: active ? color + "12" : "white",
        color: active ? color : "#6b6860",
        fontSize: "12.5px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
        transition: "all .12s", whiteSpace: "nowrap",
      }}>
      {label}
      {count !== undefined && (
        <span style={{ fontSize: "11px", fontWeight: "700", opacity: 0.7 }}>{count}</span>
      )}
    </button>
  );
}

// ── DeleteModal ───────────────────────────────────────────────────────────────

function DeleteModal({ title, body, onConfirm, onClose, loading }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "16px" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "white", borderRadius: "20px", padding: "28px", maxWidth: "400px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,.18)" }}>
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

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AdminSoal() {
  const navigate = useNavigate();
  const width    = useWindowWidth();
  const isMobile = width <= 480;

  const [soal, setSoal]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({ search: "", difficulty: "", published: "" });
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [counts, setCounts]   = useState({ published: 0, draft: 0 });
  const [deleteId, setDeleteId]     = useState(null);
  const [deleting, setDeleting]     = useState(false);
  const [publishLoading, setPublishLoading] = useState({});
  const [previewId, setPreviewId]   = useState(null);
  const [copying, setCopying]       = useState({});
  const [selected, setSelected]     = useState(new Set());
  const [bulkDeleting, setBulkDeleting]     = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const limit = 20;
  const currentIds = soal.map(s => s.id);
  const allOnPageSelected = currentIds.length > 0 && currentIds.every(id => selected.has(id));
  const someOnPageSelected = currentIds.some(id => selected.has(id)) && !allOnPageSelected;

  const fetchSoal = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page, limit,
      ...(filters.search     && { search:     filters.search }),
      ...(filters.difficulty && { difficulty: filters.difficulty }),
      ...(filters.published  !== "" && { published: filters.published }),
    });
    api.get(`/admin/soal?${params}`)
      .then(data => {
        setSoal(data.data);
        setTotal(data.total);
        setCounts({ published: data.published_count ?? 0, draft: data.draft_count ?? 0 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(() => { fetchSoal(); }, [fetchSoal]);
  useEffect(() => { setSelected(new Set()); }, [page, filters]);

  // debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setFilters(f => ({ ...f, search: searchInput }));
    }, 380);
    return () => clearTimeout(t);
  }, [searchInput]);

  const setFilter = (key, value) => {
    setPage(1);
    setFilters(f => ({ ...f, [key]: f[key] === value ? "" : value }));
  };

  const toggleOne = id => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleAll = checked => setSelected(prev => {
    const next = new Set(prev);
    if (checked) currentIds.forEach(id => next.add(id));
    else currentIds.forEach(id => next.delete(id));
    return next;
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/soal?id=${deleteId}`);
      setDeleteId(null);
      setSelected(prev => { const n = new Set(prev); n.delete(deleteId); return n; });
      fetchSoal();
    } catch {} finally { setDeleting(false); }
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      await api.delete("/admin/soal/bulk", { data: { ids: [...selected] } });
      setSelected(new Set());
      setConfirmBulkDelete(false);
      fetchSoal();
    } catch { alert("Gagal menghapus soal"); }
    finally { setBulkDeleting(false); }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    setPublishLoading(p => ({ ...p, [id]: true }));
    try {
      await api.put(`/admin/publish/soal?id=${id}`);
      setSoal(prev => prev.map(s => s.id === id ? { ...s, is_published: currentStatus == 1 ? "0" : "1" } : s));
    } catch { alert("Gagal mengubah status publish"); }
    finally { setPublishLoading(p => ({ ...p, [id]: false })); }
  };

  const handleSalin = async id => {
    setCopying(c => ({ ...c, [id]: true }));
    try {
      const res = await api.post(`/admin/soal/salin?id=${id}`);
      navigate(`/admin/soal/edit/${res.id}`);
    } catch { alert("Gagal menyalin soal"); }
    finally { setCopying(c => ({ ...c, [id]: false })); }
  };

  const totalPages = Math.ceil(total / limit);
  const hasFilters = filters.search || filters.difficulty || filters.published !== "";

  const clearFilters = () => {
    setSearchInput("");
    setFilters({ search: "", difficulty: "", published: "" });
    setPage(1);
  };

  // Page numbers to show
  const pageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "…", totalPages];
    if (page >= totalPages - 3) return [1, "…", totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages];
    return [1, "…", page-1, page, page+1, "…", totalPages];
  };

  return (
    <div>
      <Helmet><title>Kelola Soal | Admin Gudang Soal</title></Helmet>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* ── Hero header ── */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #0c1a2e 100%)",
        padding: isMobile ? "24px 20px" : "28px 32px",
        marginBottom: "20px",
        position: "relative", overflow: "hidden",
      }}>
        {/* watermark */}
        <div style={{
          position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%",
          transform: "translateY(-50%)",
          opacity: 0.06, userSelect: "none", lineHeight: 1,
          pointerEvents: "none", color: "white",
        }}>
          <BookOpen size={isMobile ? 80 : 110} />
        </div>

        <div style={{
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: "16px", position: "relative", zIndex: 1,
        }}>
          <div>
            <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 12px" }}>
              Kelola Soal
            </h1>
            {/* Stats pills */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { label: `${total.toLocaleString()} Total`,               color: "rgba(255,255,255,.8)",  bg: "rgba(255,255,255,.1)" },
                { label: `${counts.published.toLocaleString()} Published`, color: "#6ee7b7",              bg: "rgba(110,231,183,.12)" },
                { label: `${counts.draft.toLocaleString()} Draft`,         color: "#fcd34d",              bg: "rgba(252,211,77,.12)" },
              ].map(c => (
                <span key={c.label} style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: c.color, background: c.bg }}>
                  {c.label}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", width: isMobile ? "100%" : "auto", flexShrink: 0 }}>
            <button onClick={() => navigate("/admin/soal/bulk-import")}
              style={{ display: "flex", alignItems: "center", gap: "7px", background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.85)", border: "1px solid rgba(255,255,255,.15)", borderRadius: "10px", padding: "10px 16px", fontSize: "13.5px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", flex: isMobile ? 1 : "none", justifyContent: "center", transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.18)"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.color = "rgba(255,255,255,.85)"; }}>
              <FileJson size={15} /> Bulk Import
            </button>
            <button onClick={() => navigate("/admin/soal/tambah")}
              style={{ display: "flex", alignItems: "center", gap: "7px", background: "#e84c2b", color: "white", border: "none", borderRadius: "10px", padding: "10px 16px", fontSize: "13.5px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", flex: isMobile ? 1 : "none", justifyContent: "center", boxShadow: "0 4px 16px rgba(232,76,43,.35)", transition: "opacity .15s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = ".88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              <Plus size={15} /> Tambah Soal
            </button>
          </div>
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div style={{ marginBottom: "16px" }}>
        {/* Search bar */}
        <div style={{ position: "relative", marginBottom: "10px" }}>
          <Search size={15} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#9b9992", pointerEvents: "none" }} />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Cari soal..."
            style={{ width: "100%", paddingLeft: "38px", paddingRight: searchInput ? "36px" : "14px", paddingTop: "10px", paddingBottom: "10px", borderRadius: "10px", border: "1.5px solid #e8e6e0", fontSize: "14px", outline: "none", fontFamily: "inherit", color: "#0f0e17", background: "white", boxSizing: "border-box", transition: "border-color .15s" }}
            onFocus={e => (e.target.style.borderColor = "#e84c2b")}
            onBlur={e => (e.target.style.borderColor = "#e8e6e0")}
          />
          {searchInput && (
            <button onClick={() => setSearchInput("")}
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#b4b2a9", display: "flex" }}>
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          <Filter size={13} color="#b4b2a9" />
          {/* Published */}
          <FilterChip label="Published" active={filters.published === "1"} color="#1a8a6e" onClick={() => setFilter("published", "1")} />
          <FilterChip label="Draft"     active={filters.published === "0"} color="#6b6860" onClick={() => setFilter("published", "0")} />
          <div style={{ width: "1px", height: "16px", background: "#e8e6e0" }} />
          {/* Difficulty */}
          <FilterChip label="Easy"   active={filters.difficulty === "1"} color="#1a8a6e" onClick={() => setFilter("difficulty", "1")} />
          <FilterChip label="Medium" active={filters.difficulty === "2"} color="#854F0B" onClick={() => setFilter("difficulty", "2")} />
          <FilterChip label="Hard"   active={filters.difficulty === "3"} color="#e84c2b" onClick={() => setFilter("difficulty", "3")} />
          {/* Clear all */}
          {hasFilters && (
            <button onClick={clearFilters}
              style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "20px", border: "none", background: "none", color: "#b4b2a9", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
              <X size={11} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* ── DESKTOP: Table ── */}
      {!isMobile && (
        <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e8e6e0", overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "36px 44px 72px 52px 1fr 180px 90px 110px 44px", gap: "10px", padding: "10px 20px", background: "#f7f5f0", borderBottom: "1px solid #e8e6e0", alignItems: "center" }}>
            <Checkbox checked={allOnPageSelected} indeterminate={someOnPageSelected} onChange={toggleAll} />
            {["#", "Kode", "Tipe", "Soal", "Lokasi", "Sulit", "Status", "Aksi"].map(h => (
              <div key={h} style={{ fontSize: "11px", fontWeight: "700", color: "#9b9992", textTransform: "uppercase", letterSpacing: ".07em" }}>{h}</div>
            ))}
          </div>

          {/* Loading */}
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: "58px", borderBottom: "1px solid #f5f3ef", background: "white", animation: "pulse 1.5s infinite", opacity: 1 - i * 0.12 }} />
          ))}

          {/* Rows */}
          {!loading && soal.map((s, i) => (
            <div key={s.id}
              style={{
                display: "grid",
                gridTemplateColumns: "36px 44px 72px 52px 1fr 180px 90px 110px 44px",
                gap: "10px",
                padding: "12px 20px",
                borderBottom: i < soal.length - 1 ? "1px solid #f5f3ef" : "none",
                alignItems: "center",
                background: selected.has(s.id) ? "#fff8f7" : "white",
                borderLeft: `3px solid ${selected.has(s.id) ? "#e84c2b" : "transparent"}`,
                transition: "background .1s",
              }}>
              <Checkbox checked={selected.has(s.id)} onChange={() => toggleOne(s.id)} />
              <div style={{ fontSize: "12px", color: "#c8c6be", fontWeight: "600" }}>{(page-1)*limit+i+1}</div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#9b9992", fontFamily: "monospace", letterSpacing: ".04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.kode || "—"}
              </div>
              <TipeBadge tipe={s.tipe} />
              <div style={{ fontSize: "13.5px", color: "#0f0e17", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: "400" }}>
                {s.body.replace(/\$[^$]+\$/g, "[math]").replace(/[*_~`#]/g, "")}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "12px", color: "#6b6860", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.subtopik}</div>
                <div style={{ fontSize: "11px", color: "#c8c6be", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "1px" }}>{s.mapel}</div>
              </div>
              <DifficultyBadge level={s.difficulty} />
              <ToggleSwitch checked={s.is_published == 1} onChange={() => handleTogglePublish(s.id, s.is_published)} loading={publishLoading[s.id]} />
              <ActionMenu onPreview={() => setPreviewId(s.id)} onSalin={() => handleSalin(s.id)} onEdit={() => navigate(`/admin/soal/edit/${s.id}`)} onDelete={() => setDeleteId(s.id)} copying={copying[s.id]} />
            </div>
          ))}

          {/* Empty */}
          {!loading && soal.length === 0 && (
            <div style={{ textAlign: "center", padding: "56px 24px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#f2efe8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <BookOpen size={22} color="#b4b2a9" />
              </div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f0e17", marginBottom: "6px" }}>
                {hasFilters ? "Tidak ada soal yang cocok" : "Belum ada soal"}
              </div>
              <p style={{ fontSize: "13px", color: "#b4b2a9", marginBottom: hasFilters ? "16px" : "0" }}>
                {hasFilters ? "Coba ubah filter atau kata kunci pencarian" : "Tambah soal pertama untuk mulai"}
              </p>
              {hasFilters && (
                <button onClick={clearFilters}
                  style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #e8e6e0", background: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#0f0e17" }}>
                  Reset filter
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── MOBILE: Cards ── */}
      {isMobile && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {soal.length > 0 && !loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "white", borderRadius: "10px", border: "1px solid #e8e6e0" }}>
              <Checkbox checked={allOnPageSelected} indeterminate={someOnPageSelected} onChange={toggleAll} size={18} />
              <span style={{ fontSize: "13px", color: "#6b6860", fontWeight: "500" }}>
                {allOnPageSelected ? "Batalkan semua" : `Pilih semua (${currentIds.length})`}
              </span>
              {selected.size > 0 && (
                <span style={{ marginLeft: "auto", fontSize: "12px", fontWeight: "700", color: "#e84c2b" }}>{selected.size} dipilih</span>
              )}
            </div>
          )}

          {loading && Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ height: "88px", borderRadius: "14px", background: "#f2efe8", animation: "pulse 1.5s infinite", opacity: 1 - i*0.15 }} />
          ))}

          {!loading && soal.length === 0 && (
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e8e6e0", padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17", marginBottom: "6px" }}>
                {hasFilters ? "Tidak ada soal yang cocok" : "Belum ada soal"}
              </div>
              {hasFilters && (
                <button onClick={clearFilters} style={{ marginTop: "12px", padding: "8px 16px", borderRadius: "8px", border: "1px solid #e8e6e0", background: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>Reset filter</button>
              )}
            </div>
          )}

          {!loading && soal.map((s, i) => (
            <div key={s.id}
              style={{ background: selected.has(s.id) ? "#fff8f7" : "white", borderRadius: "14px", border: `1.5px solid ${selected.has(s.id) ? "#fca5a5" : "#e8e6e0"}`, padding: "13px 14px", display: "flex", gap: "10px", alignItems: "flex-start", transition: "all .1s" }}>
              <div style={{ paddingTop: "2px" }}>
                <Checkbox checked={selected.has(s.id)} onChange={() => toggleOne(s.id)} size={18} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "#f2efe8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", color: "#6b6860" }}>
                  {(page-1)*limit+i+1}
                </div>
                <span style={{ fontSize: "9.5px", fontWeight: "700", color: "#c8c6be", fontFamily: "monospace" }}>{s.kode || "—"}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13.5px", color: "#0f0e17", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "4px" }}>
                  {s.body.replace(/\$[^$]+\$/g, "[math]").replace(/[*_~`#]/g, "")}
                </div>
                <div style={{ fontSize: "11.5px", color: "#b4b2a9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "8px" }}>
                  {s.mapel} — {s.subtopik}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                  <TipeBadge tipe={s.tipe} />
                  <DifficultyBadge level={s.difficulty} />
                  <span style={{ fontSize: "10.5px", fontWeight: "700", padding: "2px 7px", borderRadius: "5px", background: s.is_published == 1 ? "#e4f5f0" : "#f2efe8", color: s.is_published == 1 ? "#1a8a6e" : "#9b9992" }}>
                    {s.is_published == 1 ? "Published" : "Draft"}
                  </span>
                  <div style={{ flex: 1 }} />
                  <ToggleSwitch checked={s.is_published == 1} onChange={() => handleTogglePublish(s.id, s.is_published)} loading={publishLoading[s.id]} hideLabel />
                  <ActionMenu onPreview={() => setPreviewId(s.id)} onSalin={() => handleSalin(s.id)} onEdit={() => navigate(`/admin/soal/edit/${s.id}`)} onDelete={() => setDeleteId(s.id)} copying={copying[s.id]} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "18px", marginBottom: selected.size > 0 ? "80px" : "0" }}>
          <span style={{ fontSize: "12.5px", color: "#9b9992" }}>
            {(page-1)*limit+1}–{Math.min(page*limit, total)} dari {total.toLocaleString()}
          </span>
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
              style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e8e6e0", background: "white", cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "#e2ddd5" : "#6b6860", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={14} />
            </button>
            {!isMobile && pageNumbers().map((n, i) => (
              n === "…" ? (
                <span key={`ellipsis-${i}`} style={{ width: "32px", textAlign: "center", fontSize: "13px", color: "#c8c6be" }}>…</span>
              ) : (
                <button key={n} onClick={() => setPage(n)}
                  style={{ width: "32px", height: "32px", borderRadius: "8px", border: n === page ? "none" : "1px solid #e8e6e0", background: n === page ? "#0f0e17" : "white", color: n === page ? "white" : "#6b6860", fontSize: "13px", fontWeight: n === page ? "700" : "500", cursor: "pointer", fontFamily: "inherit" }}>
                  {n}
                </button>
              )
            ))}
            {isMobile && (
              <span style={{ fontSize: "13px", color: "#6b6860", padding: "0 8px", fontWeight: "600" }}>{page} / {totalPages}</span>
            )}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
              style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e8e6e0", background: "white", cursor: page === totalPages ? "not-allowed" : "pointer", color: page === totalPages ? "#e2ddd5" : "#6b6860", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Bulk Bar ── */}
      {selected.size > 0 && (
        <BulkBar count={selected.size} onDelete={() => setConfirmBulkDelete(true)} onClear={() => setSelected(new Set())} />
      )}

      {/* ── Confirm bulk delete ── */}
      {confirmBulkDelete && (
        <DeleteModal
          title={`Hapus ${selected.size} Soal?`}
          body={`Tindakan ini tidak bisa dibatalkan. Semua ${selected.size} soal yang dipilih akan dihapus permanen beserta data terkait.`}
          onConfirm={handleBulkDelete}
          onClose={() => !bulkDeleting && setConfirmBulkDelete(false)}
          loading={bulkDeleting}
        />
      )}

      {/* ── Single delete ── */}
      {deleteId && (
        <DeleteModal
          title="Hapus Soal?"
          body="Soal ini akan dihapus permanen dan tidak bisa dikembalikan."
          onConfirm={handleDelete}
          onClose={() => !deleting && setDeleteId(null)}
          loading={deleting}
        />
      )}

      {previewId && <SoalPreviewModal soalId={previewId} onClose={() => setPreviewId(null)} />}
    </div>
  );
}
