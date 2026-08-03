// src/features/admin/AdminWhiteboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Plus, Trash2, X, PenTool, Layers } from "lucide-react";
import api from "../../lib/api";
import useWindowWidth from "../../hooks/useWindowWidth";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr.replace(" ", "T")).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Baru saja";
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  return `${day} hari lalu`;
}

function CreateModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const row = await api.post("/admin/whiteboard", { title: title.trim() });
      onCreated(row);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: "white", borderRadius: "18px", padding: "28px", width: "100%", maxWidth: "440px", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f0e17", margin: 0 }}>Whiteboard Baru</h3>
          <button onClick={onClose} style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1px solid #e2ddd5", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b6860" }}><X size={14} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#6b6860", display: "block", marginBottom: "5px" }}>Judul Sesi *</label>
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Sesi Bimbel Kelas 9A"
              style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #e2ddd5", fontSize: "14px", fontFamily: "inherit", color: "#0f0e17", background: "white", outline: "none", boxSizing: "border-box" }} required />
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#0f0e17" }}>Batal</button>
            <button type="submit" disabled={saving || !title.trim()} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "14px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Membuat..." : "Buat & Buka"}
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
    await api.delete(`/admin/whiteboard/${item.id}`);
    onDeleted(item.id);
  };
  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "16px" }}>
      <div style={{ background: "white", borderRadius: "18px", padding: "28px", maxWidth: "400px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
          <Trash2 size={22} color="#e84c2b" />
        </div>
        <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f0e17", marginBottom: "8px" }}>Hapus Whiteboard?</h3>
        <p style={{ fontSize: "14px", color: "#6b6860", marginBottom: "12px", lineHeight: "1.6" }}>Semua coretan di sesi ini akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", background: "#fff3f0", border: "1px solid #fca5a5", fontSize: "13px", fontWeight: "600", color: "#b91c1c", marginBottom: "20px" }}>
          <PenTool size={13} /> {item.title}
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#0f0e17" }}>Batal</button>
          <button onClick={handleDelete} disabled={deleting} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "14px", fontWeight: "600", cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: deleting ? 0.7 : 1 }}>
            {deleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminWhiteboard() {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  useEffect(() => {
    api.get("/admin/whiteboard").then((d) => setSessions(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }, []);

  const handleCreated = (row) => {
    setShowCreate(false);
    navigate(`/admin/whiteboard/${row.id}`);
  };

  const handleDeleted = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setDeleteItem(null);
  };

  return (
    <>
      <Helmet><title>Whiteboard | Admin Gudang Soal</title></Helmet>

      {/* Hero Header */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #0d2436 100%)",
        padding: isMobile ? "24px 20px" : "28px 32px",
        marginBottom: "24px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%",
          transform: "translateY(-50%)",
          fontSize: isMobile ? "72px" : "100px",
          fontWeight: "900", color: "rgba(255,255,255,.03)",
          letterSpacing: "-4px", userSelect: "none", lineHeight: 1,
          pointerEvents: "none",
        }}>BOARD</div>

        <div style={{
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: "16px", position: "relative", zIndex: 1,
        }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "6px" }}>
              Alat Bantu
            </div>
            <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 12px" }}>
              Whiteboard
            </h1>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "rgba(255,255,255,.8)", background: "rgba(255,255,255,.1)" }}>
                {sessions.length} Sesi
              </span>
            </div>
          </div>

          <button onClick={() => setShowCreate(true)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "13.5px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(232,76,43,.35)", flexShrink: 0, width: isMobile ? "100%" : "auto", justifyContent: "center" }}>
            <Plus size={15} /> Sesi Baru
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#b4b2a9", fontSize: "14px" }}>Memuat...</div>
      ) : sessions.length === 0 ? (
        <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2ddd5", padding: "60px 48px", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <PenTool size={26} color="#e84c2b" />
          </div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f0e17", marginBottom: "6px" }}>Belum ada sesi whiteboard</div>
          <p style={{ fontSize: "13px", color: "#6b6860", marginBottom: "20px" }}>Buat sesi baru untuk mulai coret-coret.</p>
          <button onClick={() => setShowCreate(true)} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
            <Plus size={15} /> Sesi Baru
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {sessions.map((s) => (
            <div key={s.id} onClick={() => navigate(`/admin/whiteboard/${s.id}`)}
              style={{
                background: "white", borderRadius: "14px",
                border: "1px solid #e2ddd5",
                borderLeft: "3px solid #0d2436",
                padding: isMobile ? "14px 16px" : "16px 20px",
                display: "flex", alignItems: "center", gap: "14px",
                cursor: "pointer",
                transition: "box-shadow .15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.06)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
            >
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#f2efe8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <PenTool size={17} color="#6b6860" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17", marginBottom: "4px" }}>{s.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: "#b4b2a9" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Layers size={11} /> {s.object_count || 1} halaman
                  </span>
                  <span>Diubah {timeAgo(s.updated_at)}</span>
                </div>
              </div>

              <button onClick={(e) => { e.stopPropagation(); setDeleteItem(s); }}
                style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #fca5a5", background: "#fff3f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#e84c2b", flexShrink: 0, transition: "all .15s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#fee2e2"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#fff3f0"}
              ><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
      {deleteItem && <DeleteModal item={deleteItem} onClose={() => setDeleteItem(null)} onDeleted={handleDeleted} />}
    </>
  );
}
