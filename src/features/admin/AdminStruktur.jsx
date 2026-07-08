// src/features/admin/AdminStruktur.jsx
import { useState, useEffect } from "react";
import {
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  X,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  FolderTree,
  BookOpen,
  Layers,
  Tag,
  Hash,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import api from "../../lib/api";
import ToggleSwitch from "../../components/ToggleSwitch";
import useWindowWidth from "../../hooks/useWindowWidth";

// ── Constants ─────────────────────────────────────────────────────────────────

const LEVELS = [
  { key: "jenjang",   label: "Jenjang",    parentKey: null,        parentIdCol: null,          color: "#e84c2b", icon: FolderTree },
  { key: "subjenjang",label: "Subjenjang", parentKey: "jenjang",   parentIdCol: "jenjang_id",  color: "#f5a623", icon: Layers },
  { key: "mapel",     label: "Mapel",      parentKey: "subjenjang",parentIdCol: "subjenjang_id",color: "#2563eb", icon: BookOpen },
  { key: "topik",     label: "Topik",      parentKey: "mapel",     parentIdCol: "mapel_id",    color: "#1a8a6e", icon: Hash },
  { key: "subtopik",  label: "Subtopik",   parentKey: "topik",     parentIdCol: "topik_id",    color: "#7c3aed", icon: Tag },
];

// ── Modal ─────────────────────────────────────────────────────────────────────

function Modal({ title, subtitle, onClose, onSubmit, loading, error, submitLabel = "Simpan", submitColor = "#e84c2b", children }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "16px" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "white", borderRadius: "20px", padding: "28px", maxWidth: "420px", width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: subtitle ? "4px" : "24px" }}>
          <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f0e17", margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#b4b2a9", display: "flex", padding: "2px", borderRadius: "6px" }}>
            <X size={18} />
          </button>
        </div>
        {subtitle && (
          <p style={{ fontSize: "13px", color: "#6b6860", marginBottom: "20px", lineHeight: 1.5 }}>{subtitle}</p>
        )}
        {error && (
          <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "13px", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px" }}>
            {error}
          </div>
        )}
        {children}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
          <button onClick={onClose}
            style={{ padding: "9px 20px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", fontSize: "13.5px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#0f0e17" }}>
            Batal
          </button>
          <button onClick={onSubmit} disabled={loading}
            style={{ padding: "9px 20px", borderRadius: "10px", border: "none", background: loading ? submitColor + "99" : submitColor, color: "white", fontSize: "13.5px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", minWidth: "90px" }}>
            {loading ? "Menyimpan..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FormInput ─────────────────────────────────────────────────────────────────

function FormInput({ label, hint, value, onChange, placeholder, type = "text", autoFocus }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>
        {label}{hint && <span style={{ fontWeight: "400", color: "#6b6860" }}> {hint}</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          padding: "10px 14px",
          borderRadius: "10px",
          border: `1.5px solid ${focused ? "#e84c2b" : "#e2ddd5"}`,
          fontSize: "14px",
          outline: "none",
          fontFamily: "inherit",
          color: "#0f0e17",
          transition: "border-color .15s",
          background: "white",
        }}
      />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

// ── Bulk Topik+Subtopik ───────────────────────────────────────────────────────

function parseBulkText(text) {
  const items = [];
  let current = null;
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const isIndented = /^[ \t]/.test(line);
    const name = line.trim();
    if (isIndented) {
      if (current) current.subtopik.push(name);
    } else {
      current = { topik: name, subtopik: [] };
      items.push(current);
    }
  }
  return items;
}

function BulkTopikModal({ mapelItem, onClose, onDone }) {
  const [text, setText]         = useState("");
  const [parsed, setParsed]     = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult]     = useState(null);

  const handleParse = () => {
    const items = parseBulkText(text);
    if (!items.length) return;
    setParsed(items);
  };

  const handleImport = async () => {
    if (!parsed) return;
    setImporting(true);
    try {
      const res = await api.post("/admin/struktur/bulk-topik", {
        mapel_id: mapelItem.id,
        items: parsed,
      });
      setResult(res);
      onDone();
    } catch (e) {
      setResult({ inserted_topik: 0, inserted_subtopik: 0, errors: [e?.error || "Gagal import"] });
    } finally {
      setImporting(false);
    }
  };

  const totalSubtopik = parsed ? parsed.reduce((s, i) => s + i.subtopik.length, 0) : 0;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "16px" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "white", borderRadius: "18px", width: "100%", maxWidth: "620px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f0ede6", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f0e17", margin: "0 0 3px" }}>Import Bulk Topik & Subtopik</h3>
            <div style={{ fontSize: "12px", color: "#6b6860" }}>
              Di bawah Mapel: <span style={{ fontWeight: "700", color: "#2563eb" }}>{mapelItem.nama}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6860", display: "flex" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {result ? (
            /* Result */
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                {result.inserted_topik > 0
                  ? <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#e4f5f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><CheckCircle size={22} color="#1a8a6e" /></div>
                  : <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><AlertCircle size={22} color="#e84c2b" /></div>
                }
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f0e17" }}>
                    {result.inserted_topik} topik + {result.inserted_subtopik} subtopik berhasil disimpan
                  </div>
                  {result.errors?.length > 0 && <div style={{ fontSize: "12px", color: "#e84c2b", marginTop: "2px" }}>{result.errors.length} error</div>}
                </div>
              </div>
              {result.errors?.length > 0 && (
                <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px" }}>
                  {result.errors.map((e, i) => <div key={i} style={{ fontSize: "12px", color: "#b91c1c" }}>{e}</div>)}
                </div>
              )}
              <button onClick={onClose} style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "none", background: "#0f0e17", color: "white", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>
                Tutup
              </button>
            </div>
          ) : (
            <>
              {/* Format hint */}
              <div style={{ background: "#f2efe8", borderRadius: "10px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#b4b2a9", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: "6px" }}>Format</div>
                <pre style={{ margin: 0, fontSize: "12px", color: "#6b6860", fontFamily: "monospace", lineHeight: "1.7" }}>{`Persamaan Linear\n  Pengantar\n  Metode Substitusi\nPertidaksamaan\n  Definisi\n  Contoh Soal`}</pre>
                <div style={{ fontSize: "11px", color: "#b4b2a9", marginTop: "6px" }}>Topik = tidak indented · Subtopik = 2 spasi di depan</div>
              </div>

              {/* Textarea */}
              <textarea
                value={text}
                onChange={e => { setText(e.target.value); setParsed(null); }}
                placeholder={"Persamaan Linear\n  Pengantar\n  Metode Substitusi\nPertidaksamaan\n  Definisi"}
                rows={10}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2ddd5", fontSize: "13px", fontFamily: "monospace", color: "#0f0e17", resize: "vertical", lineHeight: "1.7", outline: "none", boxSizing: "border-box" }}
                onFocus={e => (e.target.style.borderColor = "#1a8a6e")}
                onBlur={e => (e.target.style.borderColor = "#e2ddd5")}
              />

              {/* Preview */}
              {parsed && (
                <div style={{ background: "#faf9f6", borderRadius: "12px", border: "1px solid #e2ddd5", overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", borderBottom: "1px solid #e2ddd5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f0e17" }}>Preview</span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px", background: "rgba(26,138,110,.1)", color: "#1a8a6e" }}>{parsed.length} topik</span>
                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px", background: "rgba(124,58,237,.1)", color: "#7c3aed" }}>{totalSubtopik} subtopik</span>
                    </div>
                  </div>
                  <div style={{ padding: "10px 14px", maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {parsed.map((item, i) => (
                      <div key={i}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1a8a6e", flexShrink: 0 }} />
                          <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f0e17" }}>{item.topik}</span>
                          {item.subtopik.length === 0 && <span style={{ fontSize: "10px", color: "#f5a623", fontWeight: "600" }}>tanpa subtopik</span>}
                        </div>
                        {item.subtopik.map((st, j) => (
                          <div key={j} style={{ display: "flex", alignItems: "center", gap: "6px", paddingLeft: "16px", marginBottom: "2px" }}>
                            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
                            <span style={{ fontSize: "12px", color: "#6b6860" }}>{st}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: "10px" }}>
                {!parsed ? (
                  <button onClick={handleParse} disabled={!text.trim()}
                    style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: !text.trim() ? "#e2ddd5" : "#0f0e17", color: !text.trim() ? "#b4b2a9" : "white", fontSize: "14px", fontWeight: "700", cursor: !text.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                    Parse
                  </button>
                ) : (
                  <>
                    <button onClick={() => setParsed(null)}
                      style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#0f0e17" }}>
                      Edit
                    </button>
                    <button onClick={handleImport} disabled={importing}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px", borderRadius: "10px", border: "none", background: importing ? "#e2ddd5" : "#1a8a6e", color: importing ? "#b4b2a9" : "white", fontSize: "14px", fontWeight: "700", cursor: importing ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: importing ? "none" : "0 4px 14px rgba(26,138,110,.3)" }}>
                      <Upload size={15} />
                      {importing ? "Menyimpan..." : `Simpan ${parsed.length} Topik & ${totalSubtopik} Subtopik`}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminStruktur() {
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [stack, setStack] = useState([{ level: "jenjang", item: null }]);
  const [allData, setAllData] = useState({ jenjang: [], subjenjang: [], mapel: [], topik: [], subtopik: [] });
  const [loading, setLoading]     = useState(true);
  const [publishLoading, setPublishLoading] = useState({});
  const [urutanLoading, setUrutanLoading]   = useState({});
  const [editingIndex, setEditingIndex]     = useState(null);
  const [editingValue, setEditingValue]     = useState("");
  const [modal, setModal]           = useState(null);
  const [modalForm, setModalForm]   = useState({ nama: "", urutan: "" });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [bulkOpen, setBulkOpen]     = useState(false);

  const currentStack = stack[stack.length - 1];
  const currentLevelIndex = LEVELS.findIndex((l) => l.key === currentStack.level);
  const currentLevel = LEVELS[currentLevelIndex];
  const isLastLevel  = currentLevelIndex === LEVELS.length - 1;

  const fetchAll = () => {
    setLoading(true);
    api.get("/admin/struktur")
      .then((data) => setAllData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const getCurrentItems = () => {
    const data = allData[currentStack.level] || [];
    const levelInfo = LEVELS.find((l) => l.key === currentStack.level);
    if (!levelInfo.parentKey || !currentStack.item) return data;
    return data.filter((i) => i[levelInfo.parentIdCol] == currentStack.item.id);
  };

  const currentItems = getCurrentItems();

  const handleDrillDown = (item) => {
    const nextIndex = currentLevelIndex + 1;
    if (nextIndex >= LEVELS.length) return;
    setStack([...stack, { level: LEVELS[nextIndex].key, item }]);
  };

  const handleBack   = () => { if (stack.length > 1) setStack((s) => s.slice(0, -1)); };
  const handleGoTo   = (i) => setStack((s) => s.slice(0, i + 1));

  const handleTogglePublish = async (e, item) => {
    e.stopPropagation();
    setPublishLoading((p) => ({ ...p, [item.id]: true }));
    try {
      const res = await api.put(`/admin/publish/${currentStack.level}?id=${item.id}`);
      setAllData((prev) => ({
        ...prev,
        [currentStack.level]: prev[currentStack.level].map((i) =>
          i.id === item.id ? { ...i, is_published: res.is_published ? 1 : 0 } : i
        ),
      }));
    } catch { alert("Gagal mengubah status publish"); }
    finally { setPublishLoading((p) => ({ ...p, [item.id]: false })); }
  };

  const handleUrutanChange = async (item, delta) => {
    const items = getCurrentItems();
    const index = items.findIndex((i) => i.id === item.id);
    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= items.length) return;
    const targetItem = items[newIndex];
    setUrutanLoading((u) => ({ ...u, [item.id]: true }));
    try {
      await Promise.all([
        api.put(`/admin/urutan/${currentStack.level}?id=${item.id}`, { urutan: newIndex }),
        api.put(`/admin/urutan/${currentStack.level}?id=${targetItem.id}`, { urutan: index }),
      ]);
      fetchAll();
    } catch { alert("Gagal mengubah urutan"); }
    finally { setUrutanLoading((u) => ({ ...u, [item.id]: false })); }
  };

  const handleIndexClick  = (item, i) => { setEditingIndex(item.id); setEditingValue(String(i + 1)); };
  const handleIndexSubmit = async (item, i) => {
    const items = getCurrentItems();
    const newIndex = parseInt(editingValue) - 1;
    setEditingIndex(null);
    if (isNaN(newIndex) || newIndex === i) return;
    if (newIndex < 0 || newIndex >= items.length) return;
    setUrutanLoading((u) => ({ ...u, [item.id]: true }));
    try {
      const newItems = [...items];
      newItems.splice(i, 1);
      newItems.splice(newIndex, 0, item);
      await Promise.all(newItems.map((it, idx) => api.put(`/admin/urutan/${currentStack.level}?id=${it.id}`, { urutan: idx })));
      fetchAll();
    } catch { alert("Gagal mengubah urutan"); }
    finally { setUrutanLoading((u) => ({ ...u, [item.id]: false })); }
  };

  const openTambah = () => { setModal({ type: "tambah" }); setModalForm({ nama: "", urutan: "" }); setModalError(""); };
  const openEdit   = (item) => { setModal({ type: "edit", item }); setModalForm({ nama: item.nama, urutan: item.urutan || "" }); setModalError(""); };
  const openHapus  = (item) => { setModal({ type: "hapus", item }); setModalError(""); };
  const closeModal = () => { setModal(null); setModalError(""); };

  const handleTambah = async () => {
    if (!modalForm.nama.trim()) { setModalError("Nama wajib diisi"); return; }
    setModalLoading(true);
    try {
      const payload = { nama: modalForm.nama, urutan: parseInt(modalForm.urutan) || currentItems.length };
      if (currentLevel.parentIdCol && currentStack.item) payload[currentLevel.parentIdCol] = currentStack.item.id;
      await api.post(`/admin/struktur/${currentStack.level}`, payload);
      closeModal(); fetchAll();
    } catch (err) { setModalError(err.error || "Gagal menambahkan"); }
    finally { setModalLoading(false); }
  };

  const handleEdit = async () => {
    if (!modalForm.nama.trim()) { setModalError("Nama wajib diisi"); return; }
    setModalLoading(true);
    try {
      await api.put(`/admin/struktur/${currentStack.level}?id=${modal.item.id}`, { nama: modalForm.nama });
      closeModal(); fetchAll();
    } catch (err) { setModalError(err.error || "Gagal mengupdate"); }
    finally { setModalLoading(false); }
  };

  const handleHapus = async () => {
    setModalLoading(true);
    try {
      await api.delete(`/admin/struktur/${currentStack.level}?id=${modal.item.id}`);
      closeModal(); fetchAll();
    } catch (err) { setModalError(err.error || "Gagal menghapus. Pastikan tidak ada data di bawahnya."); }
    finally { setModalLoading(false); }
  };

  const LevelIcon = currentLevel?.icon || FolderTree;

  return (
    <div>
      <Helmet>
        <title>Kelola Struktur | Admin Gudang Soal</title>
      </Helmet>

      {/* ── Hero header ── */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #1a0e2c 100%)",
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
          <Layers size={isMobile ? 80 : 110} />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 10px" }}>
            Kelola Struktur
          </h1>
          {/* Level chips */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {LEVELS.map(lvl => (
              <span key={lvl.key} style={{
                fontSize: "11px", fontWeight: "700",
                padding: "3px 10px", borderRadius: "99px",
                color: lvl.color,
                background: lvl.color + "20",
              }}>
                {loading ? "—" : allData[lvl.key].length} {lvl.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Level progress strip ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          marginBottom: "20px",
          background: "white",
          border: "1px solid #e8e6e0",
          borderRadius: "14px",
          padding: "6px",
          overflowX: "auto",
        }}
      >
        {LEVELS.map((lvl, i) => {
          const isActive  = lvl.key === currentStack.level;
          const isPast    = i < currentLevelIndex;
          const stackItem = stack[i + 1]?.item;
          const Icon = lvl.icon;
          return (
            <div key={lvl.key} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              {i > 0 && (
                <ChevronRight size={13} color={isPast || isActive ? "#c8c6be" : "#e2ddd5"} style={{ margin: "0 2px" }} />
              )}
              <button
                onClick={() => isPast && handleGoTo(i)}
                disabled={!isPast}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 12px",
                  borderRadius: "9px",
                  border: "none",
                  background: isActive ? lvl.color : isPast ? lvl.color + "15" : "transparent",
                  color: isActive ? "white" : isPast ? lvl.color : "#c8c6be",
                  fontSize: "12.5px",
                  fontWeight: "700",
                  cursor: isPast ? "pointer" : "default",
                  fontFamily: "inherit",
                  transition: "all .15s",
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={13} />
                {!isMobile || isActive ? (
                  <span>{isActive && stackItem ? stackItem.nama : lvl.label}</span>
                ) : isPast ? (
                  <span style={{ maxWidth: "60px", overflow: "hidden", textOverflow: "ellipsis", display: "inline-block" }}>
                    {stackItem ? stackItem.nama : lvl.label}
                  </span>
                ) : null}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Main card ── */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          border: "1px solid #e8e6e0",
          overflow: "hidden",
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        }}
      >
        {/* Card header */}
        <div
          style={{
            display: "flex",
            alignItems: isMobile ? "flex-start" : "center",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            gap: isMobile ? "12px" : "0",
            padding: isMobile ? "14px 16px" : "16px 20px",
            borderBottom: "1px solid #f2efe8",
            background: "linear-gradient(135deg, " + currentLevel?.color + "08 0%, transparent 60%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {stack.length > 1 && (
              <button
                onClick={handleBack}
                style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "#6b6860", padding: "4px", borderRadius: "6px" }}
              >
                <ArrowLeft size={16} />
              </button>
            )}
            {/* Level badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: currentLevel?.color + "18",
                border: `1px solid ${currentLevel?.color}30`,
                borderRadius: "8px",
                padding: "4px 10px",
              }}
            >
              <LevelIcon size={13} color={currentLevel?.color} />
              <span style={{ fontSize: "12px", fontWeight: "700", color: currentLevel?.color }}>
                {currentLevel?.label}
              </span>
            </div>
            {currentStack.item && (
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f0e17" }}>
                di <span style={{ color: currentLevel?.color }}>{currentStack.item.nama}</span>
              </span>
            )}
            <span style={{ fontSize: "12.5px", color: "#b4b2a9", fontWeight: "600" }}>
              {loading ? "..." : currentItems.length} item
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", width: isMobile ? "100%" : "auto" }}>
            {currentStack.level === "topik" && currentStack.item && (
              <button
                onClick={() => setBulkOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "9px", border: `1px solid ${currentLevel?.color}40`, background: currentLevel?.color + "12", color: currentLevel?.color, fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={e => { e.currentTarget.style.background = currentLevel?.color + "20"; }}
                onMouseLeave={e => { e.currentTarget.style.background = currentLevel?.color + "12"; }}
              >
                <Upload size={13} /> Import Bulk
              </button>
            )}
            <button
              onClick={openTambah}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                padding: "8px 16px", borderRadius: "9px", border: "none",
                background: currentLevel?.color || "#e84c2b", color: "white",
                fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
                flex: isMobile ? 1 : "none",
                boxShadow: `0 2px 8px ${currentLevel?.color}40`,
              }}
            >
              <Plus size={14} />
              Tambah {currentLevel?.label}
            </button>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: "58px", borderBottom: "1px solid #f2efe8", animation: "pulse 1.5s infinite", background: i % 2 === 0 ? "white" : "#faf9f6" }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && currentItems.length === 0 && (
          <div style={{ textAlign: "center", padding: "52px 24px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: currentLevel?.color + "15",
                border: `1px solid ${currentLevel?.color}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}
            >
              <LevelIcon size={24} color={currentLevel?.color} />
            </div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f0e17", marginBottom: "6px" }}>
              Belum ada {currentLevel?.label}
            </div>
            <p style={{ fontSize: "13px", color: "#b4b2a9", marginBottom: "20px", lineHeight: 1.5 }}>
              {currentStack.item
                ? `Tambahkan ${currentLevel?.label} pertama di ${currentStack.item.nama}`
                : `Tambahkan ${currentLevel?.label} pertama untuk mulai menyusun struktur`}
            </p>
            <button
              onClick={openTambah}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 20px",
                borderRadius: "10px",
                border: "none",
                background: currentLevel?.color,
                color: "white",
                fontSize: "13.5px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Plus size={14} />
              Tambah {currentLevel?.label}
            </button>
          </div>
        )}

        {/* Items */}
        {!loading && currentItems.map((item, i) => (
          <div
            key={item.id}
            style={{
              padding: isMobile ? "12px 16px" : "11px 20px",
              borderBottom: i < currentItems.length - 1 ? "1px solid #f5f3ef" : "none",
              cursor: !isLastLevel ? "pointer" : "default",
              transition: "background .12s",
              borderLeft: `3px solid ${item.is_published == 1 ? currentLevel?.color : "#e2ddd5"}`,
            }}
            onClick={() => !isLastLevel && handleDrillDown(item)}
            onMouseEnter={(e) => { if (!isLastLevel) e.currentTarget.style.background = "#faf9f6"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "white"; }}
          >
            {isMobile ? (
              // ── MOBILE ──
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#c8c6be", minWidth: "20px", textAlign: "center", flexShrink: 0 }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f0e17", wordBreak: "break-word" }}>{item.nama}</div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {item.jumlah_soal > 0 && (
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#1a8a6e" }}>{item.jumlah_soal} soal</span>
                    )}
                    {item.jumlah_materi > 0 && (
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb" }}>{item.jumlah_materi} materi</span>
                    )}
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                  <ToggleSwitch checked={item.is_published == 1} onChange={(e) => handleTogglePublish(e, item)} loading={publishLoading[item.id]} hideLabel />
                  <button onClick={(e) => { e.stopPropagation(); openEdit(item); }}
                    style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1px solid #e2ddd5", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b6860" }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); openHapus(item); }}
                    style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1px solid #fca5a5", background: "#fff3f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#e84c2b" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
                {!isLastLevel && <ChevronRight size={14} color="#c8c6be" style={{ flexShrink: 0 }} />}
              </div>
            ) : (
              // ── DESKTOP ──
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Order controls */}
                <div style={{ display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleUrutanChange(item, -1)}
                    disabled={i === 0 || urutanLoading[item.id]}
                    style={{ width: "22px", height: "22px", borderRadius: "6px", border: "1px solid #e8e6e0", background: "white", cursor: i === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: i === 0 ? "#e2ddd5" : "#9b9992", transition: "all .12s" }}
                  >
                    <ChevronUp size={11} />
                  </button>
                  {editingIndex === item.id ? (
                    <input
                      autoFocus
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={() => handleIndexSubmit(item, i)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleIndexSubmit(item, i); if (e.key === "Escape") setEditingIndex(null); }}
                      style={{ width: "32px", height: "22px", borderRadius: "6px", border: `1.5px solid ${currentLevel?.color}`, fontSize: "12px", fontWeight: "700", textAlign: "center", outline: "none", fontFamily: "inherit", color: "#0f0e17", padding: 0 }}
                    />
                  ) : (
                    <span
                      onClick={(e) => { e.stopPropagation(); handleIndexClick(item, i); }}
                      title="Klik untuk ubah urutan"
                      style={{ fontSize: "12px", fontWeight: "700", color: "#b4b2a9", minWidth: "24px", textAlign: "center", cursor: "text", padding: "2px 4px", borderRadius: "4px", transition: "background .12s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f2efe8")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      {urutanLoading[item.id] ? "…" : i + 1}
                    </span>
                  )}
                  <button
                    onClick={() => handleUrutanChange(item, 1)}
                    disabled={i === currentItems.length - 1 || urutanLoading[item.id]}
                    style={{ width: "22px", height: "22px", borderRadius: "6px", border: "1px solid #e8e6e0", background: "white", cursor: i === currentItems.length - 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: i === currentItems.length - 1 ? "#e2ddd5" : "#9b9992", transition: "all .12s" }}
                  >
                    <ChevronDown size={11} />
                  </button>
                </div>

                {/* Name + slug */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "500", color: "#0f0e17", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.nama}
                    </span>
                    {item.jumlah_soal > 0 ? (
                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", background: "#e4f5f0", color: "#1a8a6e", flexShrink: 0 }}>
                        {item.jumlah_soal} soal
                      </span>
                    ) : (
                      <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "6px", background: "#f2efe8", color: "#c8c6be", flexShrink: 0 }}>
                        0 soal
                      </span>
                    )}
                    {item.jumlah_materi > 0 && (
                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", background: "#eff6ff", color: "#2563eb", flexShrink: 0 }}>
                        {item.jumlah_materi} materi
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#c8c6be", marginTop: "1px", fontFamily: "monospace" }}>
                    {item.slug}
                  </div>
                </div>

                {!isLastLevel && <ChevronRight size={15} color="#c8c6be" style={{ flexShrink: 0 }} />}

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  <ToggleSwitch checked={item.is_published == 1} onChange={(e) => handleTogglePublish(e, item)} loading={publishLoading[item.id]} />
                  <button
                    onClick={() => openEdit(item)}
                    style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1px solid #e8e6e0", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b6860", transition: "all .12s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f2efe8"; e.currentTarget.style.color = "#0f0e17"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#6b6860"; }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => openHapus(item)}
                    style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1px solid #fca5a5", background: "#fff3f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#e84c2b", transition: "all .12s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#fff3f0"; }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Modal Tambah ── */}
      {modal?.type === "tambah" && (
        <Modal
          title={`Tambah ${currentLevel?.label}`}
          subtitle={currentStack.item ? `Di bawah: ${currentStack.item.nama}` : undefined}
          onClose={closeModal}
          onSubmit={handleTambah}
          loading={modalLoading}
          error={modalError}
          submitColor={currentLevel?.color}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <FormInput label="Nama" value={modalForm.nama} onChange={(v) => setModalForm((f) => ({ ...f, nama: v }))} placeholder={`Nama ${currentLevel?.label}`} autoFocus />
            <FormInput label="Urutan" hint="(opsional, default: akhir list)" value={modalForm.urutan} onChange={(v) => setModalForm((f) => ({ ...f, urutan: v }))} placeholder={String(currentItems.length + 1)} type="number" />
          </div>
        </Modal>
      )}

      {/* ── Modal Edit ── */}
      {modal?.type === "edit" && (
        <Modal
          title={`Edit ${currentLevel?.label}`}
          onClose={closeModal}
          onSubmit={handleEdit}
          loading={modalLoading}
          error={modalError}
          submitColor={currentLevel?.color}
        >
          <FormInput label="Nama" value={modalForm.nama} onChange={(v) => setModalForm((f) => ({ ...f, nama: v }))} placeholder={`Nama ${currentLevel?.label}`} autoFocus />
        </Modal>
      )}

      {/* ── Modal Hapus ── */}
      {modal?.type === "hapus" && (
        <Modal
          title={`Hapus ${currentLevel?.label}?`}
          subtitle={`"${modal.item.nama}" akan dihapus permanen beserta semua data di bawahnya. Tindakan ini tidak bisa dibatalkan.`}
          onClose={closeModal}
          onSubmit={handleHapus}
          loading={modalLoading}
          error={modalError}
          submitLabel="Hapus"
          submitColor="#e84c2b"
        >
          {/* confirmation pill */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "#fff7f7", borderRadius: "10px", border: "1px solid #fca5a5" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#e84c2b", flexShrink: 0 }} />
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#b91c1c" }}>{modal.item.nama}</span>
          </div>
        </Modal>
      )}

      {bulkOpen && currentStack.item && (
        <BulkTopikModal
          mapelItem={currentStack.item}
          onClose={() => setBulkOpen(false)}
          onDone={() => { fetchAll(); }}
        />
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}
