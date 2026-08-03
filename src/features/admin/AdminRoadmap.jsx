// src/features/admin/AdminRoadmap.jsx
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, Pencil, Trash2, X, Map, ChevronDown, List, Kanban } from "lucide-react";
import api from "../../lib/api";
import useWindowWidth from "../../hooks/useWindowWidth";

const STATUS_CFG = {
  discovery:   { label: "Discovery",   color: "#0891b2", bg: "#ecfeff" },
  idea:        { label: "Ide",         color: "#6b6860", bg: "#f5f3ef" },
  planned:     { label: "Direncanakan",color: "#2563eb", bg: "#eff6ff" },
  in_progress: { label: "Dikerjakan",  color: "#f5a623", bg: "#fef9ee" },
  hold:        { label: "Hold",        color: "#7c3aed", bg: "#f3f0ff" },
  done:        { label: "Selesai",     color: "#1a8a6e", bg: "#e4f5f0" },
  cancelled:   { label: "Dibatalkan",  color: "#e84c2b", bg: "#fff3f0" },
};

const PRIORITY_CFG = {
  high:   { label: "Tinggi", color: "#e84c2b", bg: "#fff3f0" },
  medium: { label: "Sedang", color: "#f5a623", bg: "#fef9ee" },
  low:    { label: "Rendah", color: "#6b6860", bg: "#f5f3ef" },
};

const CATEGORY_CFG = {
  user:    { label: "User" },
  konten:  { label: "Konten" },
  admin:   { label: "Admin" },
  teknis:  { label: "Teknis" },
  lainnya: { label: "Lainnya" },
};

const STATUS_ORDER = ["discovery", "idea", "planned", "in_progress", "hold", "done", "cancelled"];

const EMPTY_FORM = { title: "", description: "", category: "lainnya", priority: "medium", status: "idea", notes: "" };

function Badge({ cfg }) {
  return (
    <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", color: cfg.color, background: cfg.bg, whiteSpace: "nowrap" }}>
      {cfg.label}
    </span>
  );
}

function FormModal({ item, onClose, onSaved }) {
  const [form, setForm]     = useState(item ? { ...item } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res = item
        ? await api.put(`/admin/roadmap/${item.id}`, form)
        : await api.post('/admin/roadmap', form);
      onSaved(res, !!item);
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle = { width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #e2ddd5", fontSize: "14px", fontFamily: "inherit", color: "#0f0e17", background: "white", outline: "none", boxSizing: "border-box" };
  const labelStyle = { fontSize: "12px", fontWeight: "700", color: "#6b6860", display: "block", marginBottom: "5px" };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: "white", borderRadius: "18px", padding: "28px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f0e17", margin: 0 }}>{item ? "Edit Fitur" : "Tambah Fitur"}</h3>
          <button onClick={onClose} style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1px solid #e2ddd5", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b6860" }}><X size={14} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={labelStyle}>Nama Fitur *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Contoh: Leaderboard XP" style={fieldStyle} required />
          </div>
          <div>
            <label style={labelStyle}>Deskripsi</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} placeholder="Apa yang ingin dibangun?" style={{ ...fieldStyle, resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            <div>
              <label style={labelStyle}>Kategori</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} style={{ ...fieldStyle, cursor: "pointer" }}>
                {Object.entries(CATEGORY_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Prioritas</label>
              <select value={form.priority} onChange={e => set("priority", e.target.value)} style={{ ...fieldStyle, cursor: "pointer" }}>
                {Object.entries(PRIORITY_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} style={{ ...fieldStyle, cursor: "pointer" }}>
                {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Catatan internal</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} placeholder="Referensi, link, ide teknis..." style={{ ...fieldStyle, resize: "vertical" }} />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#0f0e17" }}>Batal</button>
            <button type="submit" disabled={saving || !form.title.trim()} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "14px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Menyimpan..." : item ? "Simpan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ item, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    await api.delete(`/admin/roadmap/${item.id}`);
    onDeleted(item.id);
  };
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "16px" }}>
      <div style={{ background: "white", borderRadius: "18px", padding: "28px", maxWidth: "400px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
          <Trash2 size={22} color="#e84c2b" />
        </div>
        <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f0e17", marginBottom: "8px" }}>Hapus fitur?</h3>
        <p style={{ fontSize: "14px", color: "#6b6860", marginBottom: "16px", lineHeight: "1.6" }}>Fitur ini akan dihapus permanen dari backlog.</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", background: "#fff3f0", border: "1px solid #fca5a5", fontSize: "13px", fontWeight: "600", color: "#b91c1c", marginBottom: "20px" }}>
          {item.title}
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#0f0e17" }}>Batal</button>
          <button onClick={handleDelete} disabled={deleting} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "14px", fontWeight: "700", cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: deleting ? 0.7 : 1 }}>
            {deleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

function KanbanCard({ item, onEdit, onDelete, onStatusChange }) {
  const pr  = PRIORITY_CFG[item.priority]  || PRIORITY_CFG.medium;
  const cat = CATEGORY_CFG[item.category]  || CATEGORY_CFG.lainnya;
  const st  = STATUS_CFG[item.status]      || STATUS_CFG.idea;

  return (
    <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2ddd5", padding: "12px 14px", transition: "box-shadow .15s", cursor: "default" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.08)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "6px", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f0e17", lineHeight: "1.4" }}>{item.title}</span>
        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
          <button onClick={() => onEdit(item)} style={{ width: "26px", height: "26px", borderRadius: "7px", border: "1px solid #e2ddd5", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b6860" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f2efe8"; e.currentTarget.style.borderColor = "#0f0e17"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2ddd5"; }}
          ><Pencil size={11} /></button>
          <button onClick={() => onDelete(item)} style={{ width: "26px", height: "26px", borderRadius: "7px", border: "1px solid #fca5a5", background: "#fff3f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#e84c2b" }}
            onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
            onMouseLeave={e => e.currentTarget.style.background = "#fff3f0"}
          ><Trash2 size={11} /></button>
        </div>
      </div>

      {item.description && (
        <p style={{ fontSize: "12px", color: "#6b6860", lineHeight: "1.5", margin: "0 0 8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.description}
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", marginTop: "6px" }}>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          <Badge cfg={pr} />
          <span style={{ fontSize: "11px", fontWeight: "600", color: "#b4b2a9", padding: "2px 6px", borderRadius: "5px", background: "#f5f3ef" }}>{cat.label}</span>
        </div>
        {/* Move to status select */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <select value={item.status} onChange={e => onStatusChange(item, e.target.value)}
            style={{ appearance: "none", padding: "3px 20px 3px 7px", borderRadius: "6px", border: `1px solid ${st.color}`, background: st.bg, color: st.color, fontSize: "10px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}
          >
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <ChevronDown size={8} style={{ position: "absolute", right: "5px", top: "50%", transform: "translateY(-50%)", color: st.color, pointerEvents: "none" }} />
        </div>
      </div>
    </div>
  );
}

export default function AdminRoadmap() {
  const width    = useWindowWidth();
  const isMobile = width <= 480;

  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [viewMode, setViewMode]     = useState("list");
  const [filterStatus, setFilterStatus]     = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [formItem, setFormItem]     = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus)   params.set("status",   filterStatus);
    if (filterCategory) params.set("category", filterCategory);
    if (filterPriority) params.set("priority", filterPriority);
    api.get(`/admin/roadmap?${params}`).then(d => setItems(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus, filterCategory, filterPriority]);

  const handleSaved = (saved, isEdit) => {
    setItems(prev => isEdit ? prev.map(i => i.id === saved.id ? saved : i) : [saved, ...prev]);
    setFormItem(null);
  };

  const handleDeleted = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setDeleteItem(null);
  };

  const handleStatusChange = async (item, newStatus) => {
    await api.patch(`/admin/roadmap/${item.id}/status`, { status: newStatus });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
  };

  const counts = Object.fromEntries(
    Object.keys(STATUS_CFG).map(s => [s, items.filter(i => i.status === s).length])
  );

  const viewToggleBtnStyle = (active) => ({
    width: "34px", height: "34px", borderRadius: "9px", border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: active ? "#0f0e17" : "transparent",
    color: active ? "white" : "#b4b2a9",
    transition: "all .15s",
  });

  return (
    <>
      <Helmet><title>Roadmap | Admin Gudang Soal</title></Helmet>

      {/* Hero */}
      <div style={{ borderRadius: "18px", background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #0d2210 100%)", padding: isMobile ? "24px 20px" : "28px 32px", marginBottom: "24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.03)", userSelect: "none", pointerEvents: "none" }}>
          <Map size={isMobile ? 90 : 120} strokeWidth={1.5} />
        </div>
        <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", gap: "16px", position: "relative", zIndex: 1 }}>
          <div>
            <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 12px" }}>Roadmap & Backlog</h1>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "rgba(255,255,255,.8)", background: "rgba(255,255,255,.1)" }}>
                {items.length} Fitur
              </span>
              {counts.in_progress > 0 && <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "#fcd34d", background: "rgba(252,211,77,.12)" }}>{counts.in_progress} Dikerjakan</span>}
              {counts.planned > 0 && <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "#93c5fd", background: "rgba(147,197,253,.12)" }}>{counts.planned} Direncanakan</span>}
              {counts.done > 0 && <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "#6ee7b7", background: "rgba(110,231,183,.12)" }}>{counts.done} Selesai</span>}
            </div>
          </div>
          <button onClick={() => setFormItem(false)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "13.5px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(232,76,43,.35)", flexShrink: 0, width: isMobile ? "100%" : "auto", justifyContent: "center" }}>
            <Plus size={15} /> Tambah Fitur
          </button>
        </div>
      </div>

      {/* Toolbar: filters + view toggle */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", alignItems: "center", flexWrap: "wrap" }}>
        {/* Filter card */}
        <div style={{ display: "flex", alignItems: "center", background: "white", border: "1px solid #e2ddd5", borderRadius: "12px", overflow: "hidden" }}>
          {[
            { label: "Status", value: filterStatus, onChange: setFilterStatus, options: [["", "Semua"], ...Object.entries(STATUS_CFG).map(([k, v]) => [k, `${v.label}${counts[k] ? ` (${counts[k]})` : ""}`])] },
            { label: "Prioritas", value: filterPriority, onChange: setFilterPriority, options: [["", "Semua"], ...Object.entries(PRIORITY_CFG).map(([k, v]) => [k, v.label])] },
            { label: "Kategori", value: filterCategory, onChange: setFilterCategory, options: [["", "Semua"], ...Object.entries(CATEGORY_CFG).map(([k, v]) => [k, v.label])] },
          ].map((f, idx) => (
            <div key={f.label} style={{ display: "flex" }}>
              {idx > 0 && <div style={{ width: "1px", background: "#e2ddd5", alignSelf: "stretch" }} />}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0 14px", height: "38px", background: f.value ? "#faf9f6" : "transparent" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#b4b2a9", whiteSpace: "nowrap" }}>{f.label}</span>
                <select value={f.value} onChange={e => f.onChange(e.target.value)}
                  style={{ border: "none", background: "transparent", color: f.value ? "#0f0e17" : "#6b6860", fontSize: "13px", fontWeight: f.value ? "700" : "500", cursor: "pointer", fontFamily: "inherit", outline: "none", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b6860' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 0px center", paddingRight: "16px" }}>
                  {f.options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>

        {(filterStatus || filterPriority || filterCategory) && (
          <button onClick={() => { setFilterStatus(""); setFilterPriority(""); setFilterCategory(""); }}
            style={{ padding: "0 14px", height: "38px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", color: "#e84c2b", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
            Reset
          </button>
        )}

        {/* View toggle */}
        <div style={{ marginLeft: "auto", display: "flex", background: "white", border: "1px solid #e2ddd5", borderRadius: "10px", padding: "2px", gap: "2px" }}>
          <button onClick={() => setViewMode("list")} style={viewToggleBtnStyle(viewMode === "list")} title="List">
            <List size={15} />
          </button>
          <button onClick={() => setViewMode("kanban")} style={viewToggleBtnStyle(viewMode === "kanban")} title="Kanban">
            <Kanban size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#b4b2a9", fontSize: "14px" }}>Memuat...</div>
      ) : items.length === 0 ? (
        <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2ddd5", padding: "60px 48px", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#e4f5f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Map size={26} color="#1a8a6e" />
          </div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f0e17", marginBottom: "6px" }}>Backlog kosong</div>
          <p style={{ fontSize: "13px", color: "#6b6860", marginBottom: "20px" }}>Tambahkan fitur yang ingin dikerjakan.</p>
          <button onClick={() => setFormItem(false)} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
            <Plus size={15} /> Tambah Fitur
          </button>
        </div>
      ) : viewMode === "list" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {items.map(item => {
            const st  = STATUS_CFG[item.status]   || STATUS_CFG.idea;
            const pr  = PRIORITY_CFG[item.priority] || PRIORITY_CFG.medium;
            const cat = CATEGORY_CFG[item.category] || CATEGORY_CFG.lainnya;
            return (
              <div key={item.id} style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", borderLeft: `3px solid ${st.color}`, padding: isMobile ? "14px 16px" : "16px 20px", display: "flex", alignItems: "flex-start", gap: "14px", transition: "box-shadow .15s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.06)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}>{item.title}</span>
                    <Badge cfg={pr} />
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#b4b2a9", padding: "2px 6px", borderRadius: "5px", background: "#f5f3ef" }}>{cat.label}</span>
                  </div>
                  {item.description && <div style={{ fontSize: "13px", color: "#6b6860", marginBottom: "6px", lineHeight: "1.5" }}>{item.description}</div>}
                  {item.notes && <div style={{ fontSize: "12px", color: "#b4b2a9", fontStyle: "italic", borderLeft: "2px solid #e2ddd5", paddingLeft: "8px" }}>{item.notes}</div>}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <div style={{ position: "relative" }}>
                    <select value={item.status} onChange={e => handleStatusChange(item, e.target.value)}
                      style={{ appearance: "none", padding: "4px 24px 4px 8px", borderRadius: "7px", border: `1px solid ${st.color}`, background: st.bg, color: st.color, fontSize: "11px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <ChevronDown size={10} style={{ position: "absolute", right: "6px", top: "50%", transform: "translateY(-50%)", color: st.color, pointerEvents: "none" }} />
                  </div>

                  <button onClick={() => setFormItem(item)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e2ddd5", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b6860", transition: "all .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#f2efe8"; e.currentTarget.style.borderColor = "#0f0e17"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2ddd5"; }}
                  ><Pencil size={13} /></button>

                  <button onClick={() => setDeleteItem(item)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #fca5a5", background: "#fff3f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#e84c2b", transition: "all .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff3f0"}
                  ><Trash2 size={13} /></button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Kanban view */
        <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "12px", alignItems: "flex-start" }}>
          {STATUS_ORDER.map(status => {
            const st       = STATUS_CFG[status];
            const colItems = items.filter(i => i.status === status);
            return (
              <div key={status} style={{ minWidth: "240px", width: "240px", flexShrink: 0, background: "#faf9f6", borderRadius: "14px", padding: "12px", border: "1px solid #e2ddd5" }}>
                {/* Column header */}
                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "10px", padding: "0 2px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: st.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", fontWeight: "700", color: st.color, flex: 1 }}>{st.label}</span>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#b4b2a9", background: "white", border: "1px solid #e2ddd5", borderRadius: "6px", padding: "1px 7px" }}>{colItems.length}</span>
                </div>

                {/* Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {colItems.map(item => (
                    <KanbanCard
                      key={item.id}
                      item={item}
                      onEdit={setFormItem}
                      onDelete={setDeleteItem}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                  {colItems.length === 0 && (
                    <div style={{ padding: "20px 0", textAlign: "center", color: "#d4d0c8", fontSize: "12px" }}>Kosong</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formItem !== null && (
        <FormModal item={formItem || null} onClose={() => setFormItem(null)} onSaved={handleSaved} />
      )}
      {deleteItem && (
        <DeleteModal item={deleteItem} onClose={() => setDeleteItem(null)} onDeleted={handleDeleted} />
      )}
    </>
  );
}
