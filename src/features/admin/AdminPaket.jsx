// src/features/admin/AdminPaket.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Package, ChevronRight, Globe, EyeOff } from "lucide-react";
import { Helmet } from "react-helmet-async";
import useWindowWidth from "../../hooks/useWindowWidth";
import api from "../../lib/api";
import ToggleSwitch from "../../components/ToggleSwitch";

const JENIS_LABEL = {
  olimpiade:    "Olimpiade",
  un:           "Ujian Nasional",
  utbk:         "UTBK/SNBT",
  seleksi:      "Seleksi",
  ujian_sekolah:"Ujian Sekolah",
  lainnya:      "Lainnya",
};
const JENIS_COLOR = {
  olimpiade:    { color: "#7c3aed", bg: "rgba(124,58,237,.1)" },
  un:           { color: "#2563eb", bg: "rgba(37,99,235,.1)" },
  utbk:         { color: "#f5a623", bg: "rgba(245,166,35,.1)" },
  seleksi:      { color: "#e84c2b", bg: "rgba(232,76,43,.1)" },
  ujian_sekolah:{ color: "#1a8a6e", bg: "rgba(26,138,110,.1)" },
  lainnya:      { color: "#6b6860", bg: "rgba(107,104,96,.1)" },
};

export default function AdminPaket() {
  const navigate  = useNavigate();
  const width     = useWindowWidth();
  const isMobile  = width <= 480;

  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [toggling,     setToggling]     = useState({});

  useEffect(() => {
    api.get("/admin/paket")
      .then((d) => setList(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/paket/${deleteTarget.id}`);
      setList((l) => l.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch { alert("Gagal menghapus paket"); }
    finally { setDeleting(false); }
  };

  const handleToggle = async (paket, val) => {
    setToggling((t) => ({ ...t, [paket.id]: true }));
    try {
      await api.patch(`/admin/paket/${paket.id}/publish`, { is_published: val ? 1 : 0 });
      setList((l) => l.map((p) => p.id === paket.id ? { ...p, is_published: val ? 1 : 0 } : p));
    } catch { alert("Gagal mengubah status"); }
    finally { setToggling((t) => ({ ...t, [paket.id]: false })); }
  };

  const published = list.filter((p) => p.is_published == 1).length;
  const draft     = list.filter((p) => p.is_published == 0).length;

  return (
    <div style={{ padding: isMobile ? "16px" : "24px 28px", maxWidth: "860px" }}>
      <Helmet><title>Kelola Paket Soal — Admin</title></Helmet>

      {/* Hero header */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #1a0a2e 100%)",
        padding: isMobile ? "24px 20px" : "28px 32px",
        marginBottom: "24px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%",
          transform: "translateY(-50%)",
          opacity: 0.06, userSelect: "none", lineHeight: 1, pointerEvents: "none", color: "white",
        }}>
          <Package size={isMobile ? 80 : 110} />
        </div>
        <div style={{
          display: "flex", alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row", gap: "16px", position: "relative", zIndex: 1,
        }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "6px" }}>
              Kelola Konten
            </div>
            <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 12px" }}>
              Paket Soal
            </h1>
            {!loading && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "rgba(255,255,255,.8)", background: "rgba(255,255,255,.1)" }}>
                  {list.length} Total
                </span>
                {published > 0 && (
                  <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "#6ee7b7", background: "rgba(110,231,183,.12)" }}>
                    {published} Published
                  </span>
                )}
                {draft > 0 && (
                  <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "#fcd34d", background: "rgba(252,211,77,.12)" }}>
                    {draft} Draft
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => navigate("/admin/paket/tambah")}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "#e84c2b", color: "white", border: "none",
              borderRadius: "10px", padding: "10px 18px",
              fontSize: "13.5px", fontWeight: "700", cursor: "pointer",
              fontFamily: "inherit", boxShadow: "0 4px 16px rgba(232,76,43,.35)",
              width: isMobile ? "100%" : "auto", justifyContent: "center",
            }}
          >
            <Plus size={16} /> Buat Paket
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: "76px", borderRadius: "14px", background: "#e2ddd5", opacity: 0.5 }} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2ddd5", padding: "60px 48px", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#f3f0ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Package size={26} color="#7c3aed" />
          </div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f0e17", marginBottom: "6px" }}>Belum ada paket soal</div>
          <p style={{ fontSize: "13px", color: "#6b6860", marginBottom: "20px" }}>Buat paket pertama seperti OSK 2025, UTBK 2024, dll.</p>
          <button onClick={() => navigate("/admin/paket/tambah")} style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "10px 20px", borderRadius: "10px", border: "none",
            background: "#e84c2b", color: "white", fontSize: "14px",
            fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
          }}>
            <Plus size={15} /> Buat Paket
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {list.map((p) => {
            const jc = JENIS_COLOR[p.jenis] || JENIS_COLOR.lainnya;
            const isPublished = p.is_published == 1;
            return (
              <div
                key={p.id}
                style={{
                  background: "white", borderRadius: "14px",
                  border: "1px solid #e2ddd5",
                  borderLeft: `3px solid ${isPublished ? "#1a8a6e" : "#f5a623"}`,
                  padding: isMobile ? "14px 16px" : "16px 20px",
                  display: "flex", alignItems: "center", gap: "14px",
                  transition: "box-shadow .15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.06)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: "700", fontSize: "14px", color: "#0f0e17" }}>{p.nama}</span>
                    {p.tahun && (
                      <span style={{ fontSize: "11px", fontWeight: "600", color: "#6b6860" }}>{p.tahun}</span>
                    )}
                    <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px", color: jc.color, background: jc.bg }}>
                      {JENIS_LABEL[p.jenis] || p.jenis}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#b4b2a9" }}>
                    {p.jumlah_soal} soal
                  </div>
                </div>

                <ToggleSwitch
                  checked={isPublished}
                  disabled={!!toggling[p.id]}
                  onChange={(val) => handleToggle(p, val)}
                />

                <button
                  onClick={() => navigate(`/admin/paket/${p.id}`)}
                  title="Kelola soal"
                  style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    border: "1px solid #e2ddd5", background: "white",
                    cursor: "pointer", display: "flex", alignItems: "center",
                    justifyContent: "center", color: "#6b6860", transition: "all .15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f2efe8"; e.currentTarget.style.borderColor = "#0f0e17"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2ddd5"; }}
                >
                  <ChevronRight size={15} />
                </button>
                <button
                  onClick={() => navigate(`/admin/paket/${p.id}/edit`)}
                  title="Edit info"
                  style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    border: "1px solid #e2ddd5", background: "white",
                    cursor: "pointer", display: "flex", alignItems: "center",
                    justifyContent: "center", color: "#6b6860", transition: "all .15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f2efe8"; e.currentTarget.style.borderColor = "#0f0e17"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2ddd5"; }}
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeleteTarget(p)}
                  title="Hapus"
                  style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    border: "1px solid #fca5a5", background: "#fff3f0",
                    cursor: "pointer", display: "flex", alignItems: "center",
                    justifyContent: "center", color: "#e84c2b", transition: "all .15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#fee2e2"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#fff3f0"}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "16px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}
        >
          <div style={{ background: "white", borderRadius: "18px", padding: "28px", maxWidth: "400px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <Trash2 size={22} color="#e84c2b" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f0e17", marginBottom: "8px" }}>Hapus Paket?</h3>
            <p style={{ fontSize: "14px", color: "#6b6860", marginBottom: "12px", lineHeight: "1.6" }}>
              Paket akan dihapus permanen. Soal-soal di dalamnya tidak ikut terhapus.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", background: "#fff3f0", border: "1px solid #fca5a5", fontSize: "13px", fontWeight: "600", color: "#b91c1c", marginBottom: "20px" }}>
              <Package size={13} /> {deleteTarget.nama}
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#0f0e17" }}>Batal</button>
              <button onClick={handleDelete} disabled={deleting} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "14px", fontWeight: "600", cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: deleting ? 0.7 : 1 }}>
                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
