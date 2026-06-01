// src/features/admin/AdminQuiz.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, BookOpen, ChevronRight } from "lucide-react";
import { Helmet } from "react-helmet-async";
import useWindowWidth from "../../hooks/useWindowWidth";
import {
  adminGetQuizSets,
  adminDeleteQuizSet,
  adminTogglePublish,
} from "../quiz/quizApi";
import ToggleSwitch from "../../components/ToggleSwitch";

const DURASI_LABEL = (menit) => {
  if (menit < 60) return `${menit} menit`;
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;
  return sisa ? `${jam} jam ${sisa} menit` : `${jam} jam`;
};

export default function AdminQuiz() {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState({});

  useEffect(() => {
    adminGetQuizSets()
      .then((d) => setSets(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminDeleteQuizSet(deleteId);
      setSets((prev) => prev.filter((s) => s.id !== deleteId));
      setDeleteId(null);
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

  return (
    <div>
      <Helmet>
        <title>Kelola Latihan | Admin Gudang Soal</title>
      </Helmet>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "14px" : "0",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: isMobile ? "22px" : "24px",
              fontWeight: "800",
              color: "#0f0e17",
              letterSpacing: "-0.5px",
              marginBottom: "4px",
            }}
          >
            Kelola Latihan
          </h1>
          <p style={{ fontSize: "14px", color: "#6b6860" }}>
            {sets.length} set soal
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/latihan/tambah")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#e84c2b",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "10px 18px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            fontFamily: "inherit",
            width: isMobile ? "100%" : "auto",
            justifyContent: "center",
          }}
        >
          <Plus size={16} /> Buat Set Soal
        </button>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: "88px",
                borderRadius: "14px",
                background: "#e2ddd5",
                opacity: 0.5,
                animation: "pulse 1.5s infinite",
              }}
            />
          ))}

        {!loading && sets.length === 0 && (
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: "48px",
              textAlign: "center",
              color: "#6b6860",
              fontSize: "14px",
            }}
          >
            Belum ada set soal. Buat yang pertama!
          </div>
        )}

        {!loading &&
          sets.map((s) => (
            <div
              key={s.id}
              style={{
                background: "white",
                borderRadius: "14px",
                border: `1px solid ${
                  s.is_published == 1 ? "#e2ddd5" : "#f5a623"
                }`,
                padding: isMobile ? "14px 16px" : "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "#fff3f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <BookOpen size={20} color="#e84c2b" />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#0f0e17",
                    }}
                  >
                    {s.judul}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#b4b2a9",
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <span>{s.jumlah_soal} soal</span>
                  <span>{DURASI_LABEL(s.durasi)}</span>
                  <span>{s.max_xp} XP</span>
                  <span>Max {s.max_attempt}x</span>
                  {s.jenjang_nama && <span>{s.jenjang_nama}</span>}
                </div>
              </div>

              {/* Aksi */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexShrink: 0,
                }}
              >
                {/* Toggle publish */}
                <ToggleSwitch
                  checked={s.is_published == 1}
                  onChange={() => handleTogglePublish(s.id, s.is_published)}
                  loading={toggling[s.id]}
                />

                {/* Kelola soal */}
                <button
                  onClick={() => navigate(`/admin/latihan/${s.id}`)}
                  title="Kelola soal"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    border: "1px solid #e2ddd5",
                    background: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6b6860",
                  }}
                >
                  <ChevronRight size={15} />
                </button>

                {/* Edit */}
                <button
                  onClick={() => navigate(`/admin/latihan/${s.id}/edit`)}
                  title="Edit set soal"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    border: "1px solid #e2ddd5",
                    background: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6b6860",
                  }}
                >
                  <Pencil size={14} />
                </button>

                {/* Hapus */}
                <button
                  onClick={() => setDeleteId(s.id)}
                  title="Hapus set soal"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    border: "1px solid #fca5a5",
                    background: "#fff3f0",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#e84c2b",
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Delete modal */}
      {deleteId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "400px",
              width: "100%",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "800",
                color: "#0f0e17",
                marginBottom: "8px",
              }}
            >
              Hapus Set Soal?
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6b6860",
                marginBottom: "24px",
                lineHeight: "1.6",
              }}
            >
              Set soal dan semua soal di dalamnya akan dihapus permanen.
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setDeleteId(null)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "1px solid #e2ddd5",
                  background: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: "#0f0e17",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#e84c2b",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: deleting ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: deleting ? 0.7 : 1,
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
