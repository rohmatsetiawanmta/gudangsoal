// src/features/admin/AdminQuiz.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Pencil, Trash2, BookOpen, ChevronRight,
  Clock, Star, RefreshCw, Globe, EyeOff,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import useWindowWidth from "../../hooks/useWindowWidth";
import {
  adminGetQuizSets,
  adminDeleteQuizSet,
  adminTogglePublish,
} from "../quiz/quizApi";
import ToggleSwitch from "../../components/ToggleSwitch";

const DURASI_LABEL = (menit) => {
  if (menit < 60) return `${menit}m`;
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;
  return sisa ? `${jam}j ${sisa}m` : `${jam}j`;
};

function MetaPill({ icon: Icon, label, color }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      fontSize: "11px", fontWeight: "500", color: color || "#6b6860",
      background: "#f2efe8", borderRadius: "99px",
      padding: "3px 8px",
    }}>
      {Icon && <Icon size={11} />}
      {label}
    </span>
  );
}

export default function AdminQuiz() {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, judul }
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState({});

  useEffect(() => {
    adminGetQuizSets()
      .then((d) => setSets(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminDeleteQuizSet(deleteTarget.id);
      setSets((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      alert("Gagal menghapus");
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (id, current) => {
    setToggling((t) => ({ ...t, [id]: true }));
    try {
      await adminTogglePublish(id);
      setSets((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, is_published: current == 1 ? 0 : 1 } : s
        )
      );
    } catch {
      alert("Gagal mengubah status");
    } finally {
      setToggling((t) => ({ ...t, [id]: false }));
    }
  };

  const published = sets.filter((s) => s.is_published == 1).length;
  const draft = sets.length - published;

  return (
    <div>
      <Helmet>
        <title>Kelola Latihan | Admin Gudang Soal</title>
      </Helmet>

      {/* ── Hero header ── */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #0d2210 100%)",
        padding: isMobile ? "24px 20px" : "28px 32px",
        marginBottom: "28px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* watermark */}
        <div style={{
          position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%",
          transform: "translateY(-50%)",
          fontSize: isMobile ? "72px" : "100px",
          fontWeight: "900", color: "rgba(255,255,255,.03)",
          letterSpacing: "-4px", userSelect: "none", lineHeight: 1,
          pointerEvents: "none",
        }}>QUIZ</div>

        <div style={{
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: "16px",
          position: "relative", zIndex: 1,
        }}>
          <div>
            <div style={{
              fontSize: "11px", fontWeight: "600",
              color: "rgba(255,255,255,.45)",
              textTransform: "uppercase", letterSpacing: ".08em",
              marginBottom: "6px",
            }}>Kelola Latihan</div>
            <h1 style={{
              fontSize: isMobile ? "22px" : "26px",
              fontWeight: "800", color: "white",
              letterSpacing: "-0.5px", margin: "0 0 12px",
            }}>Set Soal Latihan</h1>

            {/* stat chips */}
            {!loading && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  { label: `${sets.length} Total`, color: "rgba(255,255,255,.8)", bg: "rgba(255,255,255,.1)" },
                  { label: `${published} Published`, color: "#6ee7b7", bg: "rgba(110,231,183,.12)" },
                  { label: `${draft} Draft`, color: "#fcd34d", bg: "rgba(252,211,77,.12)" },
                ].map((c) => (
                  <span key={c.label} style={{
                    fontSize: "12px", fontWeight: "700",
                    padding: "4px 12px", borderRadius: "99px",
                    color: c.color, background: c.bg,
                    backdropFilter: "blur(4px)",
                  }}>{c.label}</span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/admin/latihan/tambah")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "8px",
              background: "#e84c2b", color: "white",
              border: "none", borderRadius: "12px",
              padding: "12px 22px",
              fontSize: "14px", fontWeight: "700",
              cursor: "pointer", fontFamily: "inherit",
              width: isMobile ? "100%" : "auto",
              flexShrink: 0,
              boxShadow: "0 4px 16px rgba(232,76,43,.35)",
              transition: "opacity .15s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = ".88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <Plus size={16} /> Buat Set Soal
          </button>
        </div>
      </div>

      {/* ── List ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{
              height: "88px", borderRadius: "14px",
              background: "#e2ddd5", opacity: 0.5,
              animation: "pulse 1.5s infinite",
            }} />
          ))}

        {!loading && sets.length === 0 && (
          <div style={{
            background: "white", borderRadius: "16px",
            border: "1px solid #e2ddd5", padding: "60px 48px",
            textAlign: "center",
          }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px",
              background: "#fff3f0", display: "flex",
              alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <BookOpen size={26} color="#e84c2b" />
            </div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f0e17", marginBottom: "6px" }}>
              Belum ada set soal
            </div>
            <p style={{ fontSize: "13px", color: "#6b6860", marginBottom: "20px" }}>
              Buat set soal latihan pertama untuk mulai mengelola latihan.
            </p>
            <button
              onClick={() => navigate("/admin/latihan/tambah")}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "10px 20px", borderRadius: "10px",
                border: "none", background: "#e84c2b", color: "white",
                fontSize: "14px", fontWeight: "600",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <Plus size={15} /> Buat Set Soal
            </button>
          </div>
        )}

        {!loading && sets.map((s) => {
          const isPublished = s.is_published == 1;
          return (
            <div key={s.id} style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              borderLeft: `3px solid ${isPublished ? "#1a8a6e" : "#f5a623"}`,
              padding: isMobile ? "14px 16px" : "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              transition: "box-shadow .15s",
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.06)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              {/* Icon */}
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: isPublished ? "#e4f5f0" : "#fef9ee",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <BookOpen size={20} color={isPublished ? "#1a8a6e" : "#f5a623"} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  marginBottom: "6px", flexWrap: "wrap",
                }}>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}>
                    {s.judul}
                  </span>
                  <span style={{
                    fontSize: "10px", fontWeight: "700",
                    padding: "2px 7px", borderRadius: "99px",
                    background: isPublished ? "#e4f5f0" : "#fef9ee",
                    color: isPublished ? "#1a8a6e" : "#b45309",
                    textTransform: "uppercase", letterSpacing: ".04em",
                  }}>
                    {isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <MetaPill icon={BookOpen} label={`${s.jumlah_soal} soal`} />
                  <MetaPill icon={Clock} label={DURASI_LABEL(s.durasi)} />
                  <MetaPill icon={Star} label={`${s.max_xp} XP`} />
                  <MetaPill icon={RefreshCw} label={`${s.max_attempt}×`} />
                  {s.jenjang_nama && <MetaPill label={s.jenjang_nama} />}
                </div>
              </div>

              {/* Aksi */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <ToggleSwitch
                  checked={isPublished}
                  onChange={() => handleTogglePublish(s.id, s.is_published)}
                  loading={toggling[s.id]}
                />

                <button
                  onClick={() => navigate(`/admin/latihan/${s.id}`)}
                  title="Kelola soal"
                  style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    border: "1px solid #e2ddd5", background: "white",
                    cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "#6b6860", transition: "all .15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#f2efe8"; e.currentTarget.style.borderColor = "#0f0e17"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2ddd5"; }}
                >
                  <ChevronRight size={15} />
                </button>

                <button
                  onClick={() => navigate(`/admin/latihan/${s.id}/edit`)}
                  title="Edit set soal"
                  style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    border: "1px solid #e2ddd5", background: "white",
                    cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "#6b6860", transition: "all .15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#f2efe8"; e.currentTarget.style.borderColor = "#0f0e17"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2ddd5"; }}
                >
                  <Pencil size={14} />
                </button>

                <button
                  onClick={() => setDeleteTarget({ id: s.id, judul: s.judul })}
                  title="Hapus set soal"
                  style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    border: "1px solid #fca5a5", background: "#fff3f0",
                    cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "#e84c2b", transition: "all .15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fff3f0"; }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Delete modal ── */}
      {deleteTarget && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 300, padding: "16px",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}
        >
          <div style={{
            background: "white", borderRadius: "18px",
            padding: "28px", maxWidth: "400px", width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,.2)",
          }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "14px",
              background: "#fff3f0",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "16px",
            }}>
              <Trash2 size={22} color="#e84c2b" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f0e17", marginBottom: "8px" }}>
              Hapus Set Soal?
            </h3>
            <p style={{ fontSize: "14px", color: "#6b6860", marginBottom: "12px", lineHeight: "1.6" }}>
              Set soal dan semua soal di dalamnya akan dihapus permanen.
            </p>
            {/* confirmation pill */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "6px 12px", borderRadius: "8px",
              background: "#fff3f0", border: "1px solid #fca5a5",
              fontSize: "13px", fontWeight: "600", color: "#b91c1c",
              marginBottom: "20px",
            }}>
              <BookOpen size={13} /> {deleteTarget.judul}
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  padding: "10px 20px", borderRadius: "10px",
                  border: "1px solid #e2ddd5", background: "white",
                  fontSize: "14px", fontWeight: "600",
                  cursor: "pointer", fontFamily: "inherit", color: "#0f0e17",
                }}
              >Batal</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: "10px 20px", borderRadius: "10px",
                  border: "none", background: "#e84c2b", color: "white",
                  fontSize: "14px", fontWeight: "600",
                  cursor: deleting ? "not-allowed" : "pointer",
                  fontFamily: "inherit", opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
