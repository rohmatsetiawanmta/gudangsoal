// src/features/admin/AdminStruktur.jsx
import { useState, useEffect } from "react";
import {
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  X,
  ArrowLeft,
  Minus,
} from "lucide-react";
import api from "../../lib/api";
import ToggleSwitch from "../../components/ToggleSwitch";

const LEVELS = [
  { key: "jenjang", label: "Jenjang", parentKey: null, parentIdCol: null },
  {
    key: "subjenjang",
    label: "Subjenjang",
    parentKey: "jenjang",
    parentIdCol: "jenjang_id",
  },
  {
    key: "mapel",
    label: "Mapel",
    parentKey: "subjenjang",
    parentIdCol: "subjenjang_id",
  },
  { key: "topik", label: "Topik", parentKey: "mapel", parentIdCol: "mapel_id" },
  {
    key: "subtopik",
    label: "Subtopik",
    parentKey: "topik",
    parentIdCol: "topik_id",
  },
];

function Modal({ title, onClose, onSubmit, loading, error, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 300,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "28px",
          maxWidth: "400px",
          width: "90%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f0e17" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b6860",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>
        {error && (
          <div
            style={{
              background: "#fff3f0",
              border: "1px solid #fca5a5",
              color: "#b91c1c",
              fontSize: "13px",
              borderRadius: "10px",
              padding: "10px 14px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}
        {children}
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
            marginTop: "20px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "9px 20px",
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
            onClick={onSubmit}
            disabled={loading}
            style={{
              padding: "9px 20px",
              borderRadius: "10px",
              border: "none",
              background: loading ? "#f5a07a" : "#e84c2b",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminStruktur() {
  const [stack, setStack] = useState([{ level: "jenjang", item: null }]);
  const [allData, setAllData] = useState({
    jenjang: [],
    subjenjang: [],
    mapel: [],
    topik: [],
    subtopik: [],
  });
  const [loading, setLoading] = useState(true);
  const [publishLoading, setPublishLoading] = useState({});
  const [urutanLoading, setUrutanLoading] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [modal, setModal] = useState(null);
  const [modalForm, setModalForm] = useState({ nama: "", urutan: "" });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const currentStack = stack[stack.length - 1];
  const currentLevel = LEVELS.find((l) => l.key === currentStack.level);
  const isLastLevel =
    LEVELS.findIndex((l) => l.key === currentStack.level) === LEVELS.length - 1;

  const fetchAll = () => {
    setLoading(true);
    api
      .get("/admin/struktur")
      .then((data) => setAllData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const getCurrentItems = () => {
    const data = allData[currentStack.level] || [];
    const levelInfo = LEVELS.find((l) => l.key === currentStack.level);
    if (!levelInfo.parentKey || !currentStack.item) return data;
    return data.filter((i) => i[levelInfo.parentIdCol] == currentStack.item.id);
  };

  const currentItems = getCurrentItems();

  const handleDrillDown = (item) => {
    const nextIndex = LEVELS.findIndex((l) => l.key === currentStack.level) + 1;
    if (nextIndex >= LEVELS.length) return;
    setStack([...stack, { level: LEVELS[nextIndex].key, item }]);
  };

  const handleBack = () => {
    if (stack.length > 1) setStack((s) => s.slice(0, -1));
  };
  const handleGoTo = (i) => setStack((s) => s.slice(0, i + 1));

  const handleTogglePublish = async (e, item) => {
    e.stopPropagation();
    setPublishLoading((p) => ({ ...p, [item.id]: true }));
    try {
      const res = await api.put(
        `/admin/publish/${currentStack.level}?id=${item.id}`
      );
      setAllData((prev) => ({
        ...prev,
        [currentStack.level]: prev[currentStack.level].map((i) =>
          i.id === item.id
            ? { ...i, is_published: res.is_published ? 1 : 0 }
            : i
        ),
      }));
    } catch {
      alert("Gagal mengubah status publish");
    } finally {
      setPublishLoading((p) => ({ ...p, [item.id]: false }));
    }
  };

  // Swap satu langkah naik/turun
  const handleUrutanChange = async (item, delta) => {
    const items = getCurrentItems();
    const index = items.findIndex((i) => i.id === item.id);
    const newIndex = index + delta;

    if (newIndex < 0 || newIndex >= items.length) return;

    const targetItem = items[newIndex];

    setUrutanLoading((u) => ({ ...u, [item.id]: true }));
    try {
      await Promise.all([
        api.put(`/admin/urutan/${currentStack.level}?id=${item.id}`, {
          urutan: newIndex,
        }),
        api.put(`/admin/urutan/${currentStack.level}?id=${targetItem.id}`, {
          urutan: index,
        }),
      ]);
      fetchAll();
    } catch {
      alert("Gagal mengubah urutan");
    } finally {
      setUrutanLoading((u) => ({ ...u, [item.id]: false }));
    }
  };

  // Klik index untuk edit langsung
  const handleIndexClick = (item, currentIndex) => {
    setEditingIndex(item.id);
    setEditingValue(String(currentIndex + 1));
  };

  // Submit edit index — geser semua item di antara posisi lama dan baru
  const handleIndexSubmit = async (item, currentIndex) => {
    const items = getCurrentItems();
    const newIndex = parseInt(editingValue) - 1; // convert ke 0-based

    setEditingIndex(null);

    if (isNaN(newIndex) || newIndex === currentIndex) return;
    if (newIndex < 0 || newIndex >= items.length) return;

    setUrutanLoading((u) => ({ ...u, [item.id]: true }));
    try {
      // Buat array baru dengan item dipindah ke posisi baru
      const newItems = [...items];
      newItems.splice(currentIndex, 1); // hapus dari posisi lama
      newItems.splice(newIndex, 0, item); // insert ke posisi baru

      // Update urutan semua item sekaligus
      await Promise.all(
        newItems.map((it, idx) =>
          api.put(`/admin/urutan/${currentStack.level}?id=${it.id}`, {
            urutan: idx,
          })
        )
      );
      fetchAll();
    } catch {
      alert("Gagal mengubah urutan");
    } finally {
      setUrutanLoading((u) => ({ ...u, [item.id]: false }));
    }
  };

  const openTambah = () => {
    setModal({ type: "tambah" });
    setModalForm({ nama: "", urutan: "" });
    setModalError("");
  };
  const openEdit = (item) => {
    setModal({ type: "edit", item });
    setModalForm({ nama: item.nama, urutan: item.urutan || "" });
    setModalError("");
  };
  const openHapus = (item) => {
    setModal({ type: "hapus", item });
    setModalError("");
  };
  const closeModal = () => {
    setModal(null);
    setModalError("");
  };

  const handleTambah = async () => {
    if (!modalForm.nama.trim()) {
      setModalError("Nama wajib diisi");
      return;
    }
    setModalLoading(true);
    try {
      const payload = {
        nama: modalForm.nama,
        urutan: parseInt(modalForm.urutan) || currentItems.length,
      };
      if (currentLevel.parentIdCol && currentStack.item) {
        payload[currentLevel.parentIdCol] = currentStack.item.id;
      }
      await api.post(`/admin/struktur/${currentStack.level}`, payload);
      closeModal();
      fetchAll();
    } catch (err) {
      setModalError(err.error || "Gagal menambahkan");
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!modalForm.nama.trim()) {
      setModalError("Nama wajib diisi");
      return;
    }
    setModalLoading(true);
    try {
      await api.put(
        `/admin/struktur/${currentStack.level}?id=${modal.item.id}`,
        { nama: modalForm.nama }
      );
      closeModal();
      fetchAll();
    } catch (err) {
      setModalError(err.error || "Gagal mengupdate");
    } finally {
      setModalLoading(false);
    }
  };

  const handleHapus = async () => {
    setModalLoading(true);
    try {
      await api.delete(
        `/admin/struktur/${currentStack.level}?id=${modal.item.id}`
      );
      closeModal();
      fetchAll();
    } catch (err) {
      setModalError(
        err.error || "Gagal menghapus. Pastikan tidak ada data di bawahnya."
      );
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "800",
            color: "#0f0e17",
            letterSpacing: "-0.5px",
            marginBottom: "4px",
          }}
        >
          Kelola Struktur
        </h1>
        <p style={{ fontSize: "14px", color: "#6b6860" }}>
          Atur hierarki jenjang, subjenjang, mapel, topik, dan subtopik.
        </p>
      </div>

      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {stack.map((s, i) => {
          const isLast = i === stack.length - 1;
          return (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              {i > 0 && <ChevronRight size={14} color="#b4b2a9" />}
              <button
                onClick={() => !isLast && handleGoTo(i)}
                style={{
                  background: isLast ? "#f2efe8" : "none",
                  border: "none",
                  borderRadius: "8px",
                  padding: "5px 10px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: isLast ? "#0f0e17" : "#6b6860",
                  cursor: isLast ? "default" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {s.item
                  ? s.item.nama
                  : LEVELS.find((l) => l.key === s.level)?.label}
              </button>
            </div>
          );
        })}
      </div>

      {/* Main card */}
      <div
        style={{
          background: "white",
          borderRadius: "14px",
          border: "1px solid #e2ddd5",
          overflow: "hidden",
        }}
      >
        {/* Card header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #f2efe8",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {stack.length > 1 && (
              <button
                onClick={handleBack}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b6860",
                  padding: 0,
                }}
              >
                <ArrowLeft size={15} />
              </button>
            )}
            <span
              style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}
            >
              {currentStack.item ? currentStack.item.nama : "Semua"} —{" "}
              {currentLevel?.label}
            </span>
            <span style={{ fontSize: "13px", color: "#6b6860" }}>
              ({currentItems.length})
            </span>
          </div>
          <button
            onClick={openTambah}
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
            <Plus size={14} />
            Tambah {currentLevel?.label}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "60px",
                  borderBottom: "1px solid #f2efe8",
                  animation: "pulse 1.5s infinite",
                  background: i % 2 === 0 ? "white" : "#faf9f6",
                }}
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && currentItems.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "48px",
              color: "#6b6860",
              fontSize: "14px",
            }}
          >
            Belum ada {currentLevel?.label}.
          </div>
        )}

        {/* Items */}
        {!loading &&
          currentItems.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 20px",
                borderBottom:
                  i < currentItems.length - 1 ? "1px solid #f2efe8" : "none",
                cursor: !isLastLevel ? "pointer" : "default",
                transition: "background .15s",
              }}
              onClick={() => !isLastLevel && handleDrillDown(item)}
              onMouseEnter={(e) => {
                if (!isLastLevel) e.currentTarget.style.background = "#faf9f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
              }}
            >
              {/* Urutan controls */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flexShrink: 0,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleUrutanChange(item, -1)}
                  disabled={i === 0 || urutanLoading[item.id]}
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    border: "1px solid #e2ddd5",
                    background: "white",
                    cursor: i === 0 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: i === 0 ? "#e2ddd5" : "#6b6860",
                  }}
                >
                  <Minus size={11} />
                </button>

                {/* Index — klik untuk edit */}
                {editingIndex === item.id ? (
                  <input
                    autoFocus
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => handleIndexSubmit(item, i)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleIndexSubmit(item, i);
                      if (e.key === "Escape") setEditingIndex(null);
                    }}
                    style={{
                      width: "32px",
                      height: "24px",
                      borderRadius: "6px",
                      border: "1.5px solid #e84c2b",
                      fontSize: "12px",
                      fontWeight: "600",
                      textAlign: "center",
                      outline: "none",
                      fontFamily: "inherit",
                      color: "#0f0e17",
                      padding: 0,
                    }}
                  />
                ) : (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIndexClick(item, i);
                    }}
                    title="Klik untuk edit urutan"
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#b4b2a9",
                      minWidth: "24px",
                      textAlign: "center",
                      cursor: "text",
                      padding: "2px 4px",
                      borderRadius: "4px",
                      transition: "background .15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f2efe8")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                  >
                    {urutanLoading[item.id] ? "…" : i + 1}
                  </span>
                )}

                <button
                  onClick={() => handleUrutanChange(item, 1)}
                  disabled={
                    i === currentItems.length - 1 || urutanLoading[item.id]
                  }
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    border: "1px solid #e2ddd5",
                    background: "white",
                    cursor:
                      i === currentItems.length - 1 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color:
                      i === currentItems.length - 1 ? "#e2ddd5" : "#6b6860",
                  }}
                >
                  <Plus size={11} />
                </button>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#0f0e17",
                    }}
                  >
                    {item.nama}
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      padding: "2px 7px",
                      borderRadius: "6px",
                      background: item.jumlah_soal > 0 ? "#e4f5f0" : "#f2efe8",
                      color: item.jumlah_soal > 0 ? "#1a8a6e" : "#b4b2a9",
                      flexShrink: 0,
                    }}
                  >
                    {item.jumlah_soal} soal
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#b4b2a9",
                    marginTop: "2px",
                  }}
                >
                  slug: {item.slug}
                </div>
              </div>

              {!isLastLevel && (
                <ChevronRight
                  size={16}
                  color="#b4b2a9"
                  style={{ flexShrink: 0 }}
                />
              )}

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexShrink: 0,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <ToggleSwitch
                  checked={item.is_published == 1}
                  onChange={(e) => handleTogglePublish(e, item)}
                  loading={publishLoading[item.id]}
                />
                <button
                  onClick={() => openEdit(item)}
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
                  onClick={() => openHapus(item)}
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

      {/* Modal Tambah */}
      {modal?.type === "tambah" && (
        <Modal
          title={`Tambah ${currentLevel?.label}`}
          onClose={closeModal}
          onSubmit={handleTambah}
          loading={modalLoading}
          error={modalError}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f0e17",
                }}
              >
                Nama
              </label>
              <input
                value={modalForm.nama}
                onChange={(e) =>
                  setModalForm((f) => ({ ...f, nama: e.target.value }))
                }
                placeholder={`Nama ${currentLevel?.label}`}
                autoFocus
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #e2ddd5",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "inherit",
                  color: "#0f0e17",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f0e17",
                }}
              >
                Urutan{" "}
                <span style={{ fontWeight: "400", color: "#6b6860" }}>
                  (opsional, default: akhir list)
                </span>
              </label>
              <input
                value={modalForm.urutan}
                onChange={(e) =>
                  setModalForm((f) => ({ ...f, urutan: e.target.value }))
                }
                placeholder={`${currentItems.length + 1}`}
                type="number"
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #e2ddd5",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "inherit",
                  color: "#0f0e17",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Edit */}
      {modal?.type === "edit" && (
        <Modal
          title={`Edit ${currentLevel?.label}`}
          onClose={closeModal}
          onSubmit={handleEdit}
          loading={modalLoading}
          error={modalError}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}
            >
              Nama
            </label>
            <input
              value={modalForm.nama}
              onChange={(e) =>
                setModalForm((f) => ({ ...f, nama: e.target.value }))
              }
              placeholder={`Nama ${currentLevel?.label}`}
              autoFocus
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #e2ddd5",
                fontSize: "14px",
                outline: "none",
                fontFamily: "inherit",
                color: "#0f0e17",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
              onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
            />
          </div>
        </Modal>
      )}

      {/* Modal Hapus */}
      {modal?.type === "hapus" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <h3
              style={{
                fontSize: "17px",
                fontWeight: "800",
                color: "#0f0e17",
                marginBottom: "8px",
              }}
            >
              Hapus {currentLevel?.label}?
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6b6860",
                lineHeight: "1.6",
                marginBottom: "8px",
              }}
            >
              <strong>{modal.item.nama}</strong> akan dihapus permanen beserta
              semua data di bawahnya.
            </p>
            {modalError && (
              <div
                style={{
                  background: "#fff3f0",
                  border: "1px solid #fca5a5",
                  color: "#b91c1c",
                  fontSize: "13px",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                }}
              >
                {modalError}
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  padding: "9px 20px",
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
                onClick={handleHapus}
                disabled={modalLoading}
                style={{
                  padding: "9px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#e84c2b",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: modalLoading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: modalLoading ? 0.7 : 1,
                }}
              >
                {modalLoading ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
