// src/features/admin/AdminStruktur.jsx
import { useState } from "react";
import { ChevronRight, Plus, Pencil, Trash2, X, ArrowLeft } from "lucide-react";
import api from "../../lib/api";

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
  const [items, setItems] = useState({});
  const [loadingLevel, setLoadingLevel] = useState({});
  const [modal, setModal] = useState(null);
  const [modalForm, setModalForm] = useState({ nama: "", urutan: "" });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const currentStack = stack[stack.length - 1];
  const currentLevel = LEVELS.find((l) => l.key === currentStack.level);
  const cacheKey = currentStack.level + (currentStack.item?.id || "");
  const currentItems = items[cacheKey] || [];
  const isLoading = loadingLevel[cacheKey];
  const isLastLevel =
    LEVELS.findIndex((l) => l.key === currentStack.level) === LEVELS.length - 1;

  const fetchItems = (level, parentItem) => {
    const key = level + (parentItem?.id || "");
    if (items[key] !== undefined) return;
    const levelInfo = LEVELS.find((l) => l.key === level);
    setLoadingLevel((l) => ({ ...l, [key]: true }));
    api
      .get("/admin/struktur")
      .then((data) => {
        const allItems = data[level] || [];
        const filtered =
          levelInfo.parentKey && parentItem
            ? allItems.filter((i) => i[levelInfo.parentIdCol] == parentItem.id)
            : allItems;
        setItems((prev) => ({ ...prev, [key]: filtered }));
      })
      .catch(() => {})
      .finally(() => setLoadingLevel((l) => ({ ...l, [key]: false })));
  };

  useState(() => {
    fetchItems("jenjang", null);
  });

  const invalidateCache = (level, parentItem) => {
    const key = level + (parentItem?.id || "");
    setItems((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
    fetchItems(level, parentItem);
  };

  const handleDrillDown = (item) => {
    const nextIndex = LEVELS.findIndex((l) => l.key === currentStack.level) + 1;
    if (nextIndex >= LEVELS.length) return;
    const nextLevel = LEVELS[nextIndex].key;
    const newStack = [...stack, { level: nextLevel, item }];
    setStack(newStack);
    fetchItems(nextLevel, item);
  };

  const handleBack = () => {
    if (stack.length <= 1) return;
    setStack((s) => s.slice(0, -1));
  };

  const handleGoTo = (index) => {
    setStack((s) => s.slice(0, index + 1));
  };

  const handleTogglePublish = async (e, item) => {
    e.stopPropagation();
    try {
      const res = await api.put(
        `/admin/publish/${currentStack.level}?id=${item.id}`
      );
      setItems((prev) => ({
        ...prev,
        [cacheKey]: prev[cacheKey]?.map((i) =>
          i.id === item.id
            ? { ...i, is_published: res.is_published ? 1 : 0 }
            : i
        ),
      }));
    } catch {
      alert("Gagal mengubah status publish");
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
      const payload = { nama: modalForm.nama };
      if (currentLevel.parentIdCol && currentStack.item) {
        payload[currentLevel.parentIdCol] = currentStack.item.id;
      }
      if (
        currentStack.level === "jenjang" ||
        currentStack.level === "subjenjang"
      ) {
        payload.urutan = parseInt(modalForm.urutan) || 0;
      }
      await api.post(`/admin/struktur/${currentStack.level}`, payload);
      invalidateCache(
        currentStack.level,
        stack[stack.length - 2]?.item || null
      );
      closeModal();
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
      invalidateCache(
        currentStack.level,
        stack[stack.length - 2]?.item || null
      );
      closeModal();
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
      invalidateCache(
        currentStack.level,
        stack[stack.length - 2]?.item || null
      );
      closeModal();
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
                  gap: "4px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b6860",
                  fontSize: "13px",
                  fontFamily: "inherit",
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
        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "56px",
                  borderBottom: "1px solid #f2efe8",
                  animation: "pulse 1.5s infinite",
                  background: i % 2 === 0 ? "white" : "#faf9f6",
                }}
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && currentItems.length === 0 && (
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
        {!isLoading &&
          currentItems.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 20px",
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
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#0f0e17",
                  }}
                >
                  {item.nama}
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

              {!isLastLevel && <ChevronRight size={16} color="#b4b2a9" />}

              {/* Publish badge */}
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  flexShrink: 0,
                  background: item.is_published ? "#e4f5f0" : "#f2efe8",
                  color: item.is_published ? "#1a8a6e" : "#6b6860",
                }}
              >
                {item.is_published ? "Published" : "Draft"}
              </span>

              <div
                style={{ display: "flex", gap: "6px" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => handleTogglePublish(e, item)}
                  style={{
                    padding: "0 10px",
                    height: "30px",
                    borderRadius: "8px",
                    border: `1px solid ${
                      item.is_published ? "#e2ddd5" : "#1a8a6e"
                    }`,
                    background: item.is_published ? "white" : "#e4f5f0",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: item.is_published ? "#6b6860" : "#1a8a6e",
                    fontFamily: "inherit",
                    flexShrink: 0,
                  }}
                >
                  {item.is_published ? "Unpublish" : "Publish"}
                </button>
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
            {(currentStack.level === "jenjang" ||
              currentStack.level === "subjenjang") && (
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
                  Urutan
                </label>
                <input
                  value={modalForm.urutan}
                  onChange={(e) =>
                    setModalForm((f) => ({ ...f, urutan: e.target.value }))
                  }
                  placeholder="0"
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
            )}
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
