// src/features/admin/AdminPaketDetail.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Search, Plus, Trash2, GripVertical,
  Package, Loader2, X, ChevronUp, ChevronDown,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import useWindowWidth from "../../hooks/useWindowWidth";
import MathRenderer from "../../components/MathRenderer";
import api from "../../lib/api";

const DIFF_LABEL = { 1: "Mudah", 2: "Sedang", 3: "Sulit" };
const DIFF_COLOR = { 1: "#1a8a6e", 2: "#854F0B", 3: "#e84c2b" };
const JENIS_LABEL = {
  olimpiade: "Olimpiade", un: "UN", utbk: "UTBK/SNBT",
  seleksi: "Seleksi", ujian_sekolah: "Ujian Sekolah", lainnya: "Lainnya",
};

export default function AdminPaketDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const width    = useWindowWidth();
  const isMobile = width <= 480;

  const [paket,        setPaket]        = useState(null);
  const [soalList,     setSoalList]     = useState([]);
  const [loadingPage,  setLoadingPage]  = useState(true);

  // Search & add
  const [searchQuery,  setSearchQuery]  = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [searching,    setSearching]    = useState(false);
  const [addingId,     setAddingId]     = useState(null);
  const [removing,     setRemoving]     = useState({});
  const debRef = useRef(null);

  // Drag state
  const dragIdx = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get(`/admin/paket/${id}`),
      api.get(`/admin/paket/${id}/soal`),
    ])
      .then(([p, s]) => { setPaket(p); setSoalList(Array.isArray(s) ? s : []); })
      .catch(() => {})
      .finally(() => setLoadingPage(false));
  }, [id]);

  // Debounced search
  useEffect(() => {
    clearTimeout(debRef.current);
    if (!searchQuery.trim()) { setSearchResult([]); return; }
    debRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/admin/soal?search=${encodeURIComponent(searchQuery)}&limit=10`);
        const existing = new Set(soalList.map((s) => s.id));
        setSearchResult((res.data ?? []).filter((s) => !existing.has(s.id)));
      } catch { setSearchResult([]); }
      finally { setSearching(false); }
    }, 350);
  }, [searchQuery, soalList]);

  const handleAdd = async (soal) => {
    setAddingId(soal.id);
    try {
      await api.post(`/admin/paket/${id}/soal`, { soal_id: soal.id });
      setSoalList((l) => [...l, { ...soal, urutan: l.length + 1 }]);
      setSearchResult((r) => r.filter((s) => s.id !== soal.id));
      if (searchResult.length === 1) setSearchQuery("");
    } catch (e) {
      alert(e?.error || "Gagal menambahkan soal");
    } finally {
      setAddingId(null);
    }
  };

  const handleRemove = async (soal) => {
    setRemoving((r) => ({ ...r, [soal.id]: true }));
    try {
      await api.delete(`/admin/paket/${id}/soal/${soal.id}`);
      setSoalList((l) => l.filter((s) => s.id !== soal.id).map((s, i) => ({ ...s, urutan: i + 1 })));
    } catch { alert("Gagal menghapus soal"); }
    finally { setRemoving((r) => ({ ...r, [soal.id]: false })); }
  };

  const moveItem = async (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= soalList.length) return;
    const newList = [...soalList];
    const [moved] = newList.splice(fromIdx, 1);
    newList.splice(toIdx, 0, moved);
    const reordered = newList.map((s, i) => ({ ...s, urutan: i + 1 }));
    setSoalList(reordered);
    try {
      await api.put(`/admin/paket/${id}/soal/reorder`, {
        items: reordered.map((s) => ({ soal_id: s.id, urutan: s.urutan })),
      });
    } catch { /* silent */ }
  };

  // Drag-and-drop handlers
  const onDragStart = (e, idx) => { dragIdx.current = idx; e.dataTransfer.effectAllowed = "move"; };
  const onDragOver  = (e, idx) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    const from = dragIdx.current;
    dragIdx.current = idx;
    const newList = [...soalList];
    const [moved] = newList.splice(from, 1);
    newList.splice(idx, 0, moved);
    setSoalList(newList.map((s, i) => ({ ...s, urutan: i + 1 })));
  };
  const onDragEnd = async () => {
    if (dragIdx.current === null) return;
    dragIdx.current = null;
    try {
      await api.put(`/admin/paket/${id}/soal/reorder`, {
        items: soalList.map((s) => ({ soal_id: s.id, urutan: s.urutan })),
      });
    } catch { /* silent */ }
  };

  if (loadingPage) return <div style={{ padding: "40px", textAlign: "center", color: "#6b6860" }}>Memuat...</div>;
  if (!paket)      return <div style={{ padding: "40px", textAlign: "center", color: "#e84c2b" }}>Paket tidak ditemukan.</div>;

  return (
    <div style={{ padding: isMobile ? "16px" : "24px 28px", maxWidth: "860px" }}>
      <Helmet><title>{paket.nama} — Admin Paket</title></Helmet>

      {/* Hero */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #1a0a2e 100%)",
        padding: isMobile ? "24px 20px" : "28px 32px",
        marginBottom: "24px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", right: "24px", top: "50%", transform: "translateY(-50%)",
          opacity: 0.06, userSelect: "none", pointerEvents: "none", color: "white",
        }}>
          <Package size={110} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <button
              onClick={() => navigate("/admin/paket")}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.08)",
                color: "rgba(255,255,255,.7)", cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.15)"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}
            >
              <ArrowLeft size={16} />
            </button>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".08em" }}>
              {JENIS_LABEL[paket.jenis] || paket.jenis}{paket.tahun ? ` · ${paket.tahun}` : ""}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", gap: "12px" }}>
            <div>
              <h1 style={{ fontSize: isMobile ? "20px" : "24px", fontWeight: "800", color: "white", margin: "0 0 10px" }}>{paket.nama}</h1>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "rgba(255,255,255,.8)", background: "rgba(255,255,255,.1)" }}>
                  {soalList.length} Soal
                </span>
                <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: paket.is_published ? "#6ee7b7" : "#fcd34d", background: paket.is_published ? "rgba(110,231,183,.12)" : "rgba(252,211,77,.12)" }}>
                  {paket.is_published ? "Published" : "Draft"}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/admin/paket/${id}/edit`)}
              style={{
                background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.85)",
                border: "1px solid rgba(255,255,255,.15)", borderRadius: "10px",
                padding: "10px 16px", fontSize: "13.5px", fontWeight: "600",
                cursor: "pointer", fontFamily: "inherit",
                width: isMobile ? "100%" : "auto",
              }}
            >
              Edit Info Paket
            </button>
          </div>
        </div>
      </div>

      {/* Search & Add */}
      <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", borderLeft: "3px solid #2563eb", overflow: "hidden", marginBottom: "16px" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0ede6", fontSize: "13px", fontWeight: "700", color: "#0f0e17", background: "linear-gradient(to right, #faf9f6, white)", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2563eb" }} />
          Tambah Soal ke Paket
        </div>
        <div style={{ padding: "16px 20px" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#b4b2a9", pointerEvents: "none" }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari soal berdasarkan isi / kode..."
              style={{
                width: "100%", paddingLeft: "36px", paddingRight: searchQuery ? "34px" : "12px",
                paddingTop: "9px", paddingBottom: "9px",
                border: "1px solid #e2ddd5", borderRadius: "10px",
                fontSize: "13px", fontFamily: "inherit", outline: "none",
                color: "#0f0e17", boxSizing: "border-box",
              }}
              onFocus={(e) => e.target.style.borderColor = "#2563eb"}
              onBlur={(e) => e.target.style.borderColor = "#e2ddd5"}
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setSearchResult([]); }} style={{ position: "absolute", right: "9px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#b4b2a9", display: "flex" }}>
                <X size={13} />
              </button>
            )}
          </div>

          {searching && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 0", color: "#b4b2a9", fontSize: "13px" }}>
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Mencari...
            </div>
          )}

          {searchResult.length > 0 && (
            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {searchResult.map((s) => (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "10px",
                  border: "1px solid #e2ddd5", background: "#faf9f6",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: "#b4b2a9", marginBottom: "2px" }}>
                      {s.kode} · {s.mapel || s.subtopik}
                      {s.difficulty && <span style={{ marginLeft: "6px", color: DIFF_COLOR[s.difficulty] }}>{DIFF_LABEL[s.difficulty]}</span>}
                    </div>
                    <div style={{ fontSize: "13px", color: "#0f0e17", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <MathRenderer text={s.body} />
                    </div>
                  </div>
                  <button
                    onClick={() => handleAdd(s)}
                    disabled={addingId === s.id}
                    style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      padding: "6px 12px", borderRadius: "8px", border: "none",
                      background: "#e84c2b", color: "white",
                      fontSize: "12px", fontWeight: "600", cursor: addingId === s.id ? "not-allowed" : "pointer",
                      fontFamily: "inherit", flexShrink: 0, opacity: addingId === s.id ? 0.6 : 1,
                    }}
                  >
                    <Plus size={12} /> Tambah
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchQuery && !searching && searchResult.length === 0 && (
            <div style={{ padding: "10px 0", fontSize: "13px", color: "#b4b2a9" }}>Tidak ada soal yang cocok (atau sudah ada di paket).</div>
          )}
        </div>
      </div>

      {/* Soal list */}
      <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", borderLeft: "3px solid #1a8a6e", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0ede6", fontSize: "13px", fontWeight: "700", color: "#0f0e17", background: "linear-gradient(to right, #faf9f6, white)", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1a8a6e" }} />
          Soal dalam Paket
          <span style={{ marginLeft: "auto", fontSize: "12px", fontWeight: "500", color: "#b4b2a9" }}>Drag untuk reorder</span>
        </div>

        {soalList.length === 0 ? (
          <div style={{ padding: "48px 32px", textAlign: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#e4f5f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Package size={22} color="#1a8a6e" />
            </div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17", marginBottom: "4px" }}>Belum ada soal</div>
            <p style={{ fontSize: "13px", color: "#6b6860", margin: 0 }}>Cari dan tambahkan soal dari kotak pencarian di atas.</p>
          </div>
        ) : (
          <div>
            {soalList.map((soal, idx) => (
              <div
                key={soal.id}
                draggable
                onDragStart={(e) => onDragStart(e, idx)}
                onDragOver={(e) => onDragOver(e, idx)}
                onDragEnd={onDragEnd}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: isMobile ? "12px 14px" : "14px 20px",
                  borderBottom: idx < soalList.length - 1 ? "1px solid #f0ede6" : "none",
                  cursor: "grab",
                }}
              >
                {/* Drag handle */}
                <GripVertical size={16} color="#d4d0c8" style={{ flexShrink: 0, cursor: "grab" }} />

                {/* Nomor */}
                <div style={{
                  width: "28px", height: "28px", borderRadius: "8px",
                  background: "#f2efe8", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "12px", fontWeight: "700",
                  color: "#6b6860", flexShrink: 0,
                }}>
                  {soal.urutan}
                </div>

                {/* Konten */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "11px", fontWeight: "600", color: "#b4b2a9", marginBottom: "2px" }}>
                    {soal.kode}
                    {soal.mapel && ` · ${soal.mapel}`}
                    {soal.subtopik && ` · ${soal.subtopik}`}
                    {soal.difficulty && (
                      <span style={{ marginLeft: "6px", color: DIFF_COLOR[soal.difficulty] }}>{DIFF_LABEL[soal.difficulty]}</span>
                    )}
                  </div>
                  <div style={{ fontSize: "13px", color: "#0f0e17", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <MathRenderer text={soal.body} />
                  </div>
                </div>

                {/* Tombol naik/turun (mobile-friendly) */}
                {!isMobile && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", flexShrink: 0 }}>
                    <button onClick={() => moveItem(idx, idx - 1)} disabled={idx === 0} style={{ width: "22px", height: "20px", border: "1px solid #e2ddd5", borderRadius: "5px", background: "white", cursor: idx === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: idx === 0 ? 0.3 : 1 }}>
                      <ChevronUp size={12} color="#6b6860" />
                    </button>
                    <button onClick={() => moveItem(idx, idx + 1)} disabled={idx === soalList.length - 1} style={{ width: "22px", height: "20px", border: "1px solid #e2ddd5", borderRadius: "5px", background: "white", cursor: idx === soalList.length - 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: idx === soalList.length - 1 ? 0.3 : 1 }}>
                      <ChevronDown size={12} color="#6b6860" />
                    </button>
                  </div>
                )}

                {/* Hapus */}
                <button
                  onClick={() => handleRemove(soal)}
                  disabled={!!removing[soal.id]}
                  style={{
                    width: "30px", height: "30px", borderRadius: "8px",
                    border: "1px solid #fca5a5", background: "#fff3f0",
                    cursor: removing[soal.id] ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#e84c2b", flexShrink: 0, opacity: removing[soal.id] ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => { if (!removing[soal.id]) e.currentTarget.style.background = "#fee2e2"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#fff3f0"; }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
