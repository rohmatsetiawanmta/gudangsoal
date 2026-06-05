// src/features/admin/AdminQuizDetail.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ChevronLeft,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Eye,
  ToggleLeft,
  ToggleRight,
  Copy,
} from "lucide-react";
import useWindowWidth from "../../hooks/useWindowWidth";
import {
  adminGetQuizSets,
  adminGetQuizSoal,
  adminDeleteQuizSoal,
  adminUpdateUrutan,
  adminTogglePublish,
} from "../quiz/quizApi";
import SoalPreviewModal from "./SoalPreviewModal";
import api from "../../lib/api";
import { adminLinkQuizSoal } from "../quiz/quizApi";

function DifficultyBadge({ level }) {
  const map = {
    1: { label: "Easy", color: "#1a8a6e", bg: "#e4f5f0" },
    2: { label: "Medium", color: "#854F0B", bg: "#faeeda" },
    3: { label: "Hard", color: "#e84c2b", bg: "#fff3f0" },
  };
  const d = map[level] || map[1];
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: "700",
        padding: "3px 8px",
        borderRadius: "6px",
        background: d.bg,
        color: d.color,
        flexShrink: 0,
      }}
    >
      {d.label}
    </span>
  );
}

const DURASI_LABEL = (menit) => {
  if (menit < 60) return `${menit} menit`;
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;
  return sisa ? `${jam} jam ${sisa} menit` : `${jam} jam`;
};

export default function AdminQuizDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [quizSet, setQuizSet] = useState(null);
  const [soalList, setSoalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [previewId, setPreviewId] = useState(null);
  const [toggling, setToggling] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [savingUrutan, setSavingUrutan] = useState(false);
  const [copying, setCopying] = useState({});

  useEffect(() => {
    Promise.all([adminGetQuizSets(), adminGetQuizSoal(id)])
      .then(([sets, soal]) => {
        const set = sets.find((s) => s.id == id);
        setQuizSet(set || null);
        setSoalList(Array.isArray(soal) ? soal : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminDeleteQuizSoal(id, deleteId);
      setSoalList((prev) => prev.filter((s) => s.id !== deleteId));
      setDeleteId(null);
    } catch {
      alert("Gagal menghapus soal");
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async () => {
    setToggling(true);
    try {
      await adminTogglePublish(id);
      setQuizSet((q) => ({ ...q, is_published: q.is_published == 1 ? 0 : 1 }));
    } catch {
      alert("Gagal mengubah status");
    } finally {
      setToggling(false);
    }
  };

  // Drag & drop urutan
  const handleDragStart = (idx) => setDragIdx(idx);

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newList = [...soalList];
    const [moved] = newList.splice(dragIdx, 1);
    newList.splice(idx, 0, moved);
    setSoalList(newList);
    setDragIdx(idx);
  };

  const handleDragEnd = async () => {
    setDragIdx(null);
    setSavingUrutan(true);
    try {
      const urutan = soalList.map((s, i) => ({ soal_id: s.id, urutan: i + 1 }));
      await adminUpdateUrutan(id, urutan);
    } catch {
      alert("Gagal menyimpan urutan");
    } finally {
      setSavingUrutan(false);
    }
  };

  const handleSalin = async (soalId) => {
    setCopying((c) => ({ ...c, [soalId]: true }));
    try {
      const res = await api.post(`/admin/soal/salin?id=${soalId}`);
      await api.put(`/admin/publish/soal?id=${res.id}`);
      await adminLinkQuizSoal(id, res.id);
      const soal = await adminGetQuizSoal(id);
      setSoalList(Array.isArray(soal) ? soal : []);
    } catch {
      alert("Gagal menyalin soal");
    } finally {
      setCopying((c) => ({ ...c, [soalId]: false }));
    }
  };

  if (loading)
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#6b6860" }}>
        Memuat...
      </div>
    );
  if (!quizSet)
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#e84c2b" }}>
        Set soal tidak ditemukan.
      </div>
    );

  return (
    <div>
      <Helmet>
        <title>{`${quizSet.judul} | Admin Gudang Soal`}</title>
      </Helmet>

      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/admin/latihan")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6b6860",
            fontSize: "13px",
            fontFamily: "inherit",
            padding: 0,
            marginBottom: "12px",
          }}
        >
          <ChevronLeft size={15} /> Kelola Latihan
        </button>

        <div
          style={{
            display: "flex",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "12px" : "0",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
              }}
            >
              <h1
                style={{
                  fontSize: isMobile ? "20px" : "22px",
                  fontWeight: "800",
                  color: "#0f0e17",
                  letterSpacing: "-0.5px",
                }}
              >
                {quizSet.judul}
              </h1>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  background: quizSet.is_published == 1 ? "#e4f5f0" : "#faeeda",
                  color: quizSet.is_published == 1 ? "#1a8a6e" : "#854F0B",
                }}
              >
                {quizSet.is_published == 1 ? "Published" : "Draft"}
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
              <span>{soalList.length} soal</span>
              <span>{DURASI_LABEL(quizSet.durasi)}</span>
              <span>{quizSet.max_xp} XP</span>
              <span>Max {quizSet.max_attempt}x attempt</span>
              <span>
                {quizSet.urutan_mode === "random"
                  ? "Urutan acak"
                  : "Urutan tetap"}
              </span>
              <span>
                {quizSet.show_answer == 1
                  ? "Pembahasan tampil"
                  : "Pembahasan disembunyikan"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {/* Toggle publish */}
            <button
              onClick={handleTogglePublish}
              disabled={toggling}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                border: `1px solid ${
                  quizSet.is_published == 1 ? "#9FE1CB" : "#e2ddd5"
                }`,
                background: quizSet.is_published == 1 ? "#e4f5f0" : "white",
                color: quizSet.is_published == 1 ? "#1a8a6e" : "#6b6860",
                fontSize: "13px",
                fontWeight: "600",
                cursor: toggling ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: toggling ? 0.6 : 1,
              }}
            >
              {quizSet.is_published == 1 ? (
                <>
                  <ToggleRight size={16} /> Unpublish
                </>
              ) : (
                <>
                  <ToggleLeft size={16} /> Publish
                </>
              )}
            </button>

            {/* Edit set soal */}
            <button
              onClick={() => navigate(`/admin/latihan/${id}/edit`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #e2ddd5",
                background: "white",
                color: "#0f0e17",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Pencil size={14} /> Edit Set
            </button>

            {/* Tambah soal */}
            <button
              onClick={() => navigate(`/admin/latihan/${id}/soal/tambah`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                background: "#e84c2b",
                color: "white",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Plus size={14} /> Tambah Soal
            </button>
          </div>
        </div>
      </div>

      {/* Info urutan */}
      {savingUrutan && (
        <div
          style={{ fontSize: "12px", color: "#b4b2a9", marginBottom: "10px" }}
        >
          Menyimpan urutan...
        </div>
      )}
      {soalList.length > 1 && !isMobile && (
        <div
          style={{ fontSize: "12px", color: "#b4b2a9", marginBottom: "10px" }}
        >
          Drag baris untuk mengubah urutan soal.
        </div>
      )}

      {/* List soal */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {soalList.length === 0 && (
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: "48px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#6b6860",
                marginBottom: "14px",
              }}
            >
              Belum ada soal dalam set ini.
            </div>
            <button
              onClick={() => navigate(`/admin/latihan/${id}/soal/tambah`)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 18px",
                borderRadius: "10px",
                border: "none",
                background: "#e84c2b",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Plus size={15} /> Tambah Soal Pertama
            </button>
          </div>
        )}

        {soalList.map((s, i) => (
          <div
            key={s.id}
            draggable={!isMobile}
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragEnd={handleDragEnd}
            style={{
              background: "white",
              borderRadius: "12px",
              border: `1px solid ${dragIdx === i ? "#e84c2b" : "#e2ddd5"}`,
              padding: isMobile ? "12px 14px" : "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: isMobile ? "default" : "grab",
              opacity: dragIdx === i ? 0.7 : 1,
              transition: "border-color .15s",
            }}
          >
            {/* Drag handle — desktop only */}
            {!isMobile && (
              <div style={{ color: "#b4b2a9", flexShrink: 0, cursor: "grab" }}>
                <GripVertical size={16} />
              </div>
            )}

            {/* Nomor */}
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "#f2efe8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "700",
                color: "#6b6860",
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>

            {/* Info soal */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "13px",
                  color: "#0f0e17",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: "3px",
                }}
              >
                {s.body
                  .replace(/\$\$?[^$]+\$\$?/g, "[math]")
                  .replace(/[*_~`#]/g, "")}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#b4b2a9",
                  display: "flex",
                  gap: "8px",
                }}
              >
                <span>
                  {s.mapel} — {s.subtopik}
                </span>
                <span style={{ fontFamily: "monospace" }}>#{s.kode}</span>
              </div>
            </div>

            {/* Badge difficulty */}
            <DifficultyBadge level={s.difficulty} />

            {/* Aksi */}
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <button
                onClick={() => setPreviewId(s.id)}
                title="Preview"
                style={{
                  width: "30px",
                  height: "30px",
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
                <Eye size={13} />
              </button>

              {/* Salin — di sini, s sudah terdefinisi */}
              <button
                onClick={() => handleSalin(s.id)}
                disabled={copying[s.id]}
                title="Salin soal"
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  border: "1px solid #e2ddd5",
                  background: "white",
                  cursor: copying[s.id] ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b6860",
                  opacity: copying[s.id] ? 0.5 : 1,
                }}
              >
                <Copy size={13} />
              </button>

              <button
                onClick={() =>
                  navigate(`/admin/latihan/${id}/soal/edit/${s.id}`)
                }
                title="Edit"
                style={{
                  width: "30px",
                  height: "30px",
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
                <Pencil size={13} />
              </button>

              <button
                onClick={() => setDeleteId(s.id)}
                title="Hapus"
                style={{
                  width: "30px",
                  height: "30px",
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
                <Trash2 size={13} />
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
              Hapus Soal?
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6b6860",
                marginBottom: "24px",
                lineHeight: "1.6",
              }}
            >
              Soal ini akan dihapus dari set soal dan tidak bisa dikembalikan.
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

      {/* Preview modal */}
      {previewId && (
        <SoalPreviewModal
          soalId={previewId}
          onClose={() => setPreviewId(null)}
        />
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
