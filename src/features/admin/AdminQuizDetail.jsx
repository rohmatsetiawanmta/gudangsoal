// src/features/admin/AdminQuizDetail.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, Plus, Pencil, Trash2, GripVertical, Eye,
  ToggleLeft, ToggleRight, Copy, Clock, Star, RefreshCw,
  Shuffle, AlignLeft, BookOpen, CheckSquare,
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

const DIFF_META = {
  1: { label: "Easy",   color: "#1a8a6e", bg: "#e4f5f0" },
  2: { label: "Medium", color: "#854F0B", bg: "#faeeda" },
  3: { label: "Hard",   color: "#e84c2b", bg: "#fff3f0" },
};

function DifficultyBadge({ level }) {
  const d = DIFF_META[level] || DIFF_META[1];
  return (
    <span style={{
      fontSize: "11px", fontWeight: "700",
      padding: "2px 8px", borderRadius: "99px",
      background: d.bg, color: d.color, flexShrink: 0,
    }}>{d.label}</span>
  );
}

function StatChip({ icon: Icon, label, sub }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: "2px",
      padding: "10px 16px", borderRadius: "10px",
      background: "rgba(255,255,255,.08)",
      border: "1px solid rgba(255,255,255,.1)",
      minWidth: "80px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        {Icon && <Icon size={12} color="rgba(255,255,255,.5)" />}
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,.5)", fontWeight: "500" }}>{sub}</span>
      </div>
      <span style={{ fontSize: "14px", fontWeight: "700", color: "white" }}>{label}</span>
    </div>
  );
}

const DURASI_LABEL = (menit) => {
  if (menit < 60) return `${menit} menit`;
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;
  return sisa ? `${jam}j ${sisa}m` : `${jam}j`;
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

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [struktur, setStruktur] = useState({ jenjang: [], subjenjang: [], mapel: [], topik: [], subtopik: [] });
  const [bulkSel, setBulkSel] = useState({ jenjang: "", subjenjang: "", mapel: "", topik: "", subtopik_id: "" });
  const [bulkSaving, setBulkSaving] = useState(false);

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

  useEffect(() => {
    api.get("/admin/struktur").then((data) => setStruktur(data)).catch(() => {});
  }, []);

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

  const toggleSelect = (soalId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(soalId) ? next.delete(soalId) : next.add(soalId);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === soalList.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(soalList.map((s) => s.id)));
  };

  const handleBulkUpdate = async () => {
    if (!bulkSel.subtopik_id || selectedIds.size === 0) return;
    setBulkSaving(true);
    try {
      await api.put(`/admin/quiz/${id}/soal/bulk-subtopik`, {
        soal_ids: Array.from(selectedIds),
        subtopik_id: bulkSel.subtopik_id,
      });
      const soal = await adminGetQuizSoal(id);
      setSoalList(Array.isArray(soal) ? soal : []);
      setSelectedIds(new Set());
      setBulkSel({ jenjang: "", subjenjang: "", mapel: "", topik: "", subtopik_id: "" });
    } catch {
      alert("Gagal mengupdate subtopik");
    } finally {
      setBulkSaving(false);
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
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{
            height: "64px", borderRadius: "12px",
            background: "#e2ddd5", opacity: 0.5,
            animation: "pulse 1.5s infinite",
          }} />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
      </div>
    );

  if (!quizSet)
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#e84c2b" }}>
        Set soal tidak ditemukan.
      </div>
    );

  const isPublished = quizSet.is_published == 1;

  return (
    <div>
      <Helmet>
        <title>{`${quizSet.judul} | Admin Gudang Soal`}</title>
      </Helmet>

      {/* ── Hero header ── */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #0d2210 100%)",
        padding: isMobile ? "20px 20px 24px" : "24px 32px 28px",
        marginBottom: "24px",
        position: "relative", overflow: "hidden",
      }}>
        {/* watermark */}
        <div style={{
          position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%",
          transform: "translateY(-50%)",
          fontSize: isMobile ? "60px" : "90px",
          fontWeight: "900", color: "rgba(255,255,255,.025)",
          letterSpacing: "-4px", userSelect: "none", lineHeight: 1,
          pointerEvents: "none",
        }}>SET</div>

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Back + breadcrumb */}
          <button
            onClick={() => navigate("/admin/latihan")}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)",
              borderRadius: "8px", padding: "5px 12px",
              color: "rgba(255,255,255,.6)", fontSize: "12px", fontWeight: "600",
              cursor: "pointer", fontFamily: "inherit",
              marginBottom: "14px", transition: "all .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.14)"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "rgba(255,255,255,.6)"; }}
          >
            <ArrowLeft size={13} /> Kelola Latihan
          </button>

          {/* Title row */}
          <div style={{
            display: "flex",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            flexDirection: isMobile ? "column" : "row",
            gap: "16px",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
                <h1 style={{
                  fontSize: isMobile ? "20px" : "22px",
                  fontWeight: "800", color: "white",
                  letterSpacing: "-0.4px", margin: 0,
                }}>{quizSet.judul}</h1>
                <span style={{
                  fontSize: "10px", fontWeight: "700",
                  padding: "3px 9px", borderRadius: "99px",
                  background: isPublished ? "rgba(110,231,183,.18)" : "rgba(252,211,77,.18)",
                  color: isPublished ? "#6ee7b7" : "#fcd34d",
                  textTransform: "uppercase", letterSpacing: ".06em",
                }}>
                  {isPublished ? "Published" : "Draft"}
                </span>
              </div>
              {/* stat chips row */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <StatChip icon={BookOpen} label={`${soalList.length}`} sub="Soal" />
                <StatChip icon={Clock} label={DURASI_LABEL(quizSet.durasi)} sub="Durasi" />
                <StatChip icon={Star} label={`${quizSet.max_xp} XP`} sub="Max XP" />
                <StatChip icon={RefreshCw} label={`${quizSet.max_attempt}×`} sub="Attempt" />
                {!isMobile && (
                  <StatChip
                    icon={quizSet.urutan_mode === "random" ? Shuffle : AlignLeft}
                    label={quizSet.urutan_mode === "random" ? "Acak" : "Tetap"}
                    sub="Urutan"
                  />
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={handleTogglePublish}
                disabled={toggling}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "9px 14px", borderRadius: "10px",
                  border: `1px solid ${isPublished ? "rgba(110,231,183,.3)" : "rgba(255,255,255,.15)"}`,
                  background: isPublished ? "rgba(110,231,183,.12)" : "rgba(255,255,255,.08)",
                  color: isPublished ? "#6ee7b7" : "rgba(255,255,255,.7)",
                  fontSize: "13px", fontWeight: "600",
                  cursor: toggling ? "not-allowed" : "pointer",
                  fontFamily: "inherit", opacity: toggling ? 0.6 : 1,
                  transition: "all .15s",
                }}
              >
                {isPublished ? <><ToggleRight size={15} /> Unpublish</> : <><ToggleLeft size={15} /> Publish</>}
              </button>

              <button
                onClick={() => navigate(`/admin/latihan/${id}/edit`)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "9px 14px", borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,.15)",
                  background: "rgba(255,255,255,.08)",
                  color: "rgba(255,255,255,.7)",
                  fontSize: "13px", fontWeight: "600",
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all .15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.14)"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}
              >
                <Pencil size={14} /> Edit Set
              </button>

              <button
                onClick={() => navigate(`/admin/latihan/${id}/soal/tambah`)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "9px 14px", borderRadius: "10px",
                  border: "none",
                  background: "#e84c2b", color: "white",
                  fontSize: "13px", fontWeight: "700",
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 3px 12px rgba(232,76,43,.35)",
                  transition: "opacity .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = ".88"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                <Plus size={14} /> Tambah Soal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bulk toolbar ── */}
      {selectedIds.size > 0 && (
        <div style={{
          background: "#0f0e17",
          borderRadius: "12px",
          padding: "12px 16px",
          marginBottom: "12px",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          flexWrap: "wrap",
          border: "1px solid rgba(255,255,255,.08)",
        }}>
          <span style={{
            fontSize: "12px", fontWeight: "700",
            padding: "6px 12px", borderRadius: "99px",
            background: "rgba(232,76,43,.2)", color: "#fca5a5",
            flexShrink: 0,
          }}>
            {selectedIds.size} dipilih
          </span>

          {[
            {
              placeholder: "Jenjang",
              value: bulkSel.jenjang,
              options: struktur.jenjang.map((j) => ({ value: j.id, label: j.nama })),
              onChange: (v) => setBulkSel({ jenjang: v, subjenjang: "", mapel: "", topik: "", subtopik_id: "" }),
            },
            {
              placeholder: "Subjenjang",
              value: bulkSel.subjenjang,
              options: struktur.subjenjang.filter((s) => s.jenjang_id == bulkSel.jenjang).map((s) => ({ value: s.id, label: s.nama })),
              onChange: (v) => setBulkSel((p) => ({ ...p, subjenjang: v, mapel: "", topik: "", subtopik_id: "" })),
              disabled: !bulkSel.jenjang,
            },
            {
              placeholder: "Mapel",
              value: bulkSel.mapel,
              options: struktur.mapel.filter((m) => m.subjenjang_id == bulkSel.subjenjang).map((m) => ({ value: m.id, label: m.nama })),
              onChange: (v) => setBulkSel((p) => ({ ...p, mapel: v, topik: "", subtopik_id: "" })),
              disabled: !bulkSel.subjenjang,
            },
            {
              placeholder: "Topik",
              value: bulkSel.topik,
              options: struktur.topik.filter((t) => t.mapel_id == bulkSel.mapel).map((t) => ({ value: t.id, label: t.nama })),
              onChange: (v) => setBulkSel((p) => ({ ...p, topik: v, subtopik_id: "" })),
              disabled: !bulkSel.mapel,
            },
            {
              placeholder: "Subtopik",
              value: bulkSel.subtopik_id,
              options: struktur.subtopik.filter((s) => s.topik_id == bulkSel.topik).map((s) => ({ value: s.id, label: s.nama })),
              onChange: (v) => setBulkSel((p) => ({ ...p, subtopik_id: v })),
              disabled: !bulkSel.topik,
            },
          ].map((sel) => (
            <select
              key={sel.placeholder}
              value={sel.value}
              onChange={(e) => sel.onChange(e.target.value)}
              disabled={sel.disabled}
              style={{
                padding: "6px 10px", borderRadius: "8px",
                border: "none",
                background: sel.disabled ? "#2a2835" : "white",
                color: sel.disabled ? "#4a4758" : "#0f0e17",
                fontSize: "13px", fontFamily: "inherit",
                cursor: sel.disabled ? "not-allowed" : "pointer",
                flex: 1, minWidth: "100px",
              }}
            >
              <option value="">{sel.placeholder}</option>
              {sel.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ))}

          <button
            onClick={handleBulkUpdate}
            disabled={!bulkSel.subtopik_id || bulkSaving}
            style={{
              padding: "6px 16px", borderRadius: "8px", border: "none",
              background: !bulkSel.subtopik_id || bulkSaving ? "#2a2835" : "#e84c2b",
              color: !bulkSel.subtopik_id || bulkSaving ? "#4a4758" : "white",
              fontSize: "13px", fontWeight: "700",
              cursor: !bulkSel.subtopik_id || bulkSaving ? "not-allowed" : "pointer",
              fontFamily: "inherit", flexShrink: 0,
            }}
          >
            {bulkSaving ? "Menyimpan..." : "Terapkan"}
          </button>

          <button
            onClick={() => setSelectedIds(new Set())}
            style={{
              padding: "6px 14px", borderRadius: "8px",
              border: "1px solid rgba(255,255,255,.12)",
              background: "transparent", color: "rgba(255,255,255,.5)",
              fontSize: "13px", fontWeight: "600",
              cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
            }}
          >
            Batal
          </button>
        </div>
      )}

      {/* Urutan hint */}
      {(savingUrutan || (soalList.length > 1 && !isMobile)) && (
        <div style={{
          fontSize: "12px", color: "#b4b2a9", marginBottom: "10px",
          display: "flex", alignItems: "center", gap: "6px",
        }}>
          {savingUrutan ? (
            <><span style={{ animation: "spin .8s linear infinite", display: "inline-block" }}>⟳</span> Menyimpan urutan...</>
          ) : (
            <><GripVertical size={12} /> Drag baris untuk mengubah urutan soal.</>
          )}
        </div>
      )}

      {/* ── Soal list ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {soalList.length > 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "4px 6px", marginBottom: "2px",
          }}>
            <input
              type="checkbox"
              checked={selectedIds.size === soalList.length && soalList.length > 0}
              onChange={toggleSelectAll}
              style={{ cursor: "pointer", width: "15px", height: "15px", accentColor: "#e84c2b" }}
            />
            <span style={{ fontSize: "12px", color: "#b4b2a9" }}>
              {selectedIds.size > 0 ? `${selectedIds.size} dipilih` : "Pilih semua"}
            </span>
          </div>
        )}

        {soalList.length === 0 && (
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
              Belum ada soal dalam set ini
            </div>
            <p style={{ fontSize: "13px", color: "#6b6860", marginBottom: "20px" }}>
              Tambahkan soal pertama untuk mulai menyusun latihan ini.
            </p>
            <button
              onClick={() => navigate(`/admin/latihan/${id}/soal/tambah`)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "10px 20px", borderRadius: "10px",
                border: "none", background: "#e84c2b", color: "white",
                fontSize: "14px", fontWeight: "600",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <Plus size={15} /> Tambah Soal Pertama
            </button>
          </div>
        )}

        {soalList.map((s, i) => {
          const diff = DIFF_META[s.difficulty] || DIFF_META[1];
          const isSelected = selectedIds.has(s.id);
          return (
            <div
              key={s.id}
              draggable={!isMobile}
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              style={{
                background: "white",
                borderRadius: "12px",
                border: `1px solid ${dragIdx === i ? "#e84c2b" : isSelected ? "#e84c2b" : "#e2ddd5"}`,
                borderLeft: `3px solid ${diff.color}`,
                padding: isMobile ? "12px 14px" : "12px 16px",
                display: "flex", alignItems: "center", gap: "10px",
                cursor: isMobile ? "default" : "grab",
                opacity: dragIdx === i ? 0.7 : 1,
                transition: "all .15s",
                background: isSelected ? "#fff8f7" : "white",
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSelect(s.id)}
                onClick={(e) => e.stopPropagation()}
                style={{ cursor: "pointer", width: "14px", height: "14px", flexShrink: 0, accentColor: "#e84c2b" }}
              />

              {!isMobile && (
                <div style={{ color: "#d4d0c8", flexShrink: 0 }}>
                  <GripVertical size={15} />
                </div>
              )}

              {/* Nomor */}
              <div style={{
                width: "26px", height: "26px", borderRadius: "7px",
                background: "#f2efe8",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: "700", color: "#6b6860",
                flexShrink: 0,
              }}>
                {i + 1}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "13px", color: "#0f0e17",
                  overflow: "hidden", textOverflow: "ellipsis",
                  whiteSpace: "nowrap", marginBottom: "3px", fontWeight: "500",
                }}>
                  {s.body.replace(/\$\$?[^$]+\$\$?/g, "[math]").replace(/[*_~`#]/g, "")}
                </div>
                <div style={{ fontSize: "11px", color: "#b4b2a9", display: "flex", gap: "8px" }}>
                  <span>{s.mapel} — {s.subtopik}</span>
                  <span style={{ fontFamily: "monospace", color: "#d4d0c8" }}>#{s.kode}</span>
                </div>
              </div>

              <DifficultyBadge level={s.difficulty} />

              {/* Actions */}
              <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
                {[
                  { title: "Preview", icon: Eye, onClick: () => setPreviewId(s.id) },
                  { title: "Salin soal", icon: Copy, onClick: () => handleSalin(s.id), disabled: copying[s.id] },
                  { title: "Edit", icon: Pencil, onClick: () => navigate(`/admin/latihan/${id}/soal/edit/${s.id}`) },
                ].map(({ title, icon: Icon, onClick, disabled }) => (
                  <button key={title}
                    onClick={onClick}
                    disabled={disabled}
                    title={title}
                    style={{
                      width: "30px", height: "30px", borderRadius: "8px",
                      border: "1px solid #e2ddd5", background: "white",
                      cursor: disabled ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#6b6860", opacity: disabled ? 0.4 : 1,
                      transition: "all .15s",
                    }}
                    onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = "#f2efe8"; e.currentTarget.style.borderColor = "#0f0e17"; } }}
                    onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2ddd5"; }}
                  >
                    <Icon size={13} />
                  </button>
                ))}
                <button
                  onClick={() => setDeleteId(s.id)}
                  title="Hapus"
                  style={{
                    width: "30px", height: "30px", borderRadius: "8px",
                    border: "1px solid #fca5a5", background: "#fff3f0",
                    cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "#e84c2b", transition: "all .15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff3f0"}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Delete modal ── */}
      {deleteId && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 300, padding: "16px",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteId(null); }}
        >
          <div style={{
            background: "white", borderRadius: "18px",
            padding: "28px", maxWidth: "400px", width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,.2)",
          }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: "#fff3f0",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "14px",
            }}>
              <Trash2 size={20} color="#e84c2b" />
            </div>
            <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f0e17", marginBottom: "6px" }}>
              Hapus Soal?
            </h3>
            <p style={{ fontSize: "14px", color: "#6b6860", marginBottom: "20px", lineHeight: "1.6" }}>
              Soal ini akan dihapus dari set soal dan tidak bisa dikembalikan.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setDeleteId(null)}
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

      {previewId && (
        <SoalPreviewModal soalId={previewId} onClose={() => setPreviewId(null)} />
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
