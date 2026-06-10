// src/features/admin/AdminChangelog.jsx
import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Zap,
  Wrench,
  Bug,
  AlertTriangle,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import api from "../../lib/api";
import ToggleSwitch from "../../components/ToggleSwitch";
import useWindowWidth from "../../hooks/useWindowWidth";

const TIPE_OPTIONS = [
  { value: "feature", label: "Fitur Baru", icon: Zap, color: "#1a8a6e" },
  {
    value: "improvement",
    label: "Peningkatan",
    icon: Wrench,
    color: "#2563eb",
  },
  { value: "fix", label: "Perbaikan", icon: Bug, color: "#854F0B" },
  {
    value: "breaking",
    label: "Breaking",
    icon: AlertTriangle,
    color: "#e84c2b",
  },
];

const TIPE_CONFIG = {
  feature: { label: "Fitur Baru", color: "#1a8a6e", bg: "#e4f5f0" },
  improvement: { label: "Peningkatan", color: "#2563eb", bg: "#eff6ff" },
  fix: { label: "Perbaikan", color: "#854F0B", bg: "#faeeda" },
  breaking: { label: "Breaking", color: "#e84c2b", bg: "#fff3f0" },
};

const AUDIENCE_CONFIG = {
  all: { label: "Semua", color: "#6b6860" },
  user: { label: "User", color: "#2563eb" },
  admin: { label: "Admin", color: "#7c3aed" },
};

function TipeBadge({ tipe }) {
  const t = TIPE_CONFIG[tipe] || TIPE_CONFIG.feature;
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: "700",
        padding: "3px 8px",
        borderRadius: "6px",
        background: t.bg,
        color: t.color,
      }}
    >
      {t.label}
    </span>
  );
}

const defaultForm = {
  versi: "",
  judul: "",
  deskripsi: "",
  tipe: "feature",
  is_published: 0,
  released_at: new Date().toISOString().split("T")[0],
  audience: "all",
};

const inputStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #e2ddd5",
  fontSize: "14px",
  outline: "none",
  fontFamily: "inherit",
  color: "#0f0e17",
};

export default function AdminChangelog() {
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [changelogs, setChangelogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchChangelogs = () => {
    setLoading(true);
    api
      .get("/admin/changelog")
      .then((data) => setChangelogs(Array.isArray(data) ? data : []))
      .catch(() => setChangelogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchChangelogs();
  }, []);

  const openTambah = () => {
    setForm(defaultForm);
    setModal("tambah");
    setError("");
  };
  const openEdit = (item) => {
    setForm({
      versi: item.versi,
      judul: item.judul,
      deskripsi: item.deskripsi || "",
      tipe: item.tipe,
      is_published: item.is_published,
      released_at: item.released_at,
      audience: item.audience || "all",
    });
    setModal({ type: "edit", id: item.id });
    setError("");
  };
  const closeModal = () => {
    setModal(null);
    setError("");
  };

  const handleSave = async () => {
    if (!form.versi.trim() || !form.judul.trim()) {
      setError("Versi dan judul wajib diisi");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (modal === "tambah") {
        await api.post("/admin/changelog", form);
      } else {
        await api.put(`/admin/changelog?id=${modal.id}`, form);
      }
      closeModal();
      fetchChangelogs();
    } catch (err) {
      setError(err.error || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus changelog ini?")) return;
    try {
      await api.delete(`/admin/changelog?id=${id}`);
      fetchChangelogs();
    } catch {
      alert("Gagal menghapus");
    }
  };

  const handleToggle = async (item) => {
    try {
      await api.put(`/admin/changelog?id=${item.id}`, {
        ...item,
        is_published: item.is_published == 1 ? 0 : 1,
      });
      setChangelogs((prev) =>
        prev.map((c) =>
          c.id === item.id
            ? { ...c, is_published: item.is_published == 1 ? 0 : 1 }
            : c
        )
      );
    } catch {
      alert("Gagal mengubah status");
    }
  };

  const GRID = "70px 110px 1fr 80px 110px 110px 80px";

  return (
    <div>
      <Helmet>
        <title>Changelog | Admin Gudang Soal</title>
      </Helmet>

      {/* ── Hero header ── */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #0f1a10 100%)",
        padding: isMobile ? "24px 20px" : "28px 32px",
        marginBottom: "28px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* watermark */}
        <div style={{
          position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%",
          transform: "translateY(-50%)",
          fontSize: isMobile ? "64px" : "90px",
          fontWeight: "900", color: "rgba(255,255,255,.03)",
          letterSpacing: "-4px", userSelect: "none", lineHeight: 1,
          pointerEvents: "none",
        }}>LOG</div>

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
            }}>RIWAYAT PERUBAHAN</div>
            <h1 style={{
              fontSize: isMobile ? "22px" : "26px",
              fontWeight: "800", color: "white",
              letterSpacing: "-0.5px", margin: "0 0 12px",
            }}>Changelog</h1>

            {/* stat chips */}
            {!loading && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  { label: `${changelogs.length} Entri`, color: "rgba(255,255,255,.8)", bg: "rgba(255,255,255,.1)" },
                  { label: `${changelogs.filter(c => c.is_published == 1).length} Published`, color: "#6ee7b7", bg: "rgba(110,231,183,.12)" },
                  { label: `${changelogs.filter(c => c.is_published != 1).length} Draft`, color: "#fcd34d", bg: "rgba(252,211,77,.12)" },
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
            onClick={openTambah}
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
            <Plus size={16} /> Tambah Entri
          </button>
        </div>
      </div>

      {/* ── DESKTOP: Table ── */}
      {!isMobile && (
        <div
          style={{
            background: "white",
            borderRadius: "14px",
            border: "1px solid #e2ddd5",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              gap: "16px",
              padding: "12px 20px",
              background: "#f2efe8",
              borderBottom: "1px solid #e2ddd5",
            }}
          >
            {[
              "Versi",
              "Tipe",
              "Judul",
              "Audience",
              "Tanggal",
              "Status",
              "Aksi",
            ].map((h) => (
              <div
                key={h}
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#6b6860",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "56px",
                  borderBottom: "1px solid #f2efe8",
                  background: i % 2 === 0 ? "white" : "#faf9f6",
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}

          {!loading &&
            changelogs.map((item, i) => {
              const audience =
                AUDIENCE_CONFIG[item.audience] || AUDIENCE_CONFIG.all;
              return (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: GRID,
                    gap: "16px",
                    padding: "14px 20px",
                    borderBottom:
                      i < changelogs.length - 1 ? "1px solid #f2efe8" : "none",
                    alignItems: "start",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#0f0e17",
                      fontFamily: "monospace",
                      paddingTop: "2px",
                    }}
                  >
                    v{item.versi}
                  </div>
                  <div style={{ paddingTop: "2px" }}>
                    <TipeBadge tipe={item.tipe} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "#0f0e17",
                      }}
                    >
                      {item.judul}
                    </div>
                    {item.deskripsi && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#b4b2a9",
                          marginTop: "3px",
                          lineHeight: "1.5",
                        }}
                      >
                        {item.deskripsi}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: audience.color,
                      paddingTop: "2px",
                    }}
                  >
                    {audience.label}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b6860",
                      paddingTop: "2px",
                    }}
                  >
                    {new Date(item.released_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div style={{ paddingTop: "2px" }}>
                    <ToggleSwitch
                      checked={item.is_published == 1}
                      onChange={() => handleToggle(item)}
                      hideLabel
                    />
                  </div>
                  <div
                    style={{ display: "flex", gap: "6px", paddingTop: "2px" }}
                  >
                    <button
                      onClick={() => openEdit(item)}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "7px",
                        border: "1px solid #e2ddd5",
                        background: "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#6b6860",
                      }}
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "7px",
                        border: "1px solid #fca5a5",
                        background: "#fff3f0",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#e84c2b",
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}

          {!loading && changelogs.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "48px",
                color: "#6b6860",
                fontSize: "14px",
              }}
            >
              Belum ada changelog.
            </div>
          )}
        </div>
      )}

      {/* ── MOBILE: Card list ── */}
      {isMobile && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "80px",
                  borderRadius: "14px",
                  background: "#e2ddd5",
                  opacity: 0.5,
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}

          {!loading && changelogs.length === 0 && (
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
              Belum ada changelog.
            </div>
          )}

          {!loading &&
            changelogs.map((item) => {
              const audience =
                AUDIENCE_CONFIG[item.audience] || AUDIENCE_CONFIG.all;
              return (
                <div
                  key={item.id}
                  style={{
                    background: "white",
                    borderRadius: "14px",
                    border: "1px solid #e2ddd5",
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {/* Baris 1: versi + tipe + audience */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#0f0e17",
                        fontFamily: "monospace",
                      }}
                    >
                      v{item.versi}
                    </span>
                    <TipeBadge tipe={item.tipe} />
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "600",
                        color: audience.color,
                      }}
                    >
                      {audience.label}
                    </span>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: "11px", color: "#b4b2a9" }}>
                      {new Date(item.released_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Baris 2: judul + deskripsi */}
                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#0f0e17",
                      }}
                    >
                      {item.judul}
                    </div>
                    {item.deskripsi && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#b4b2a9",
                          marginTop: "3px",
                          lineHeight: "1.5",
                        }}
                      >
                        {item.deskripsi}
                      </div>
                    )}
                  </div>

                  {/* Baris 3: toggle + aksi */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <ToggleSwitch
                      checked={item.is_published == 1}
                      onChange={() => handleToggle(item)}
                      hideLabel
                    />
                    <div style={{ flex: 1 }} />
                    <button
                      onClick={() => openEdit(item)}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "7px",
                        border: "1px solid #e2ddd5",
                        background: "white",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#6b6860",
                      }}
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "7px",
                        border: "1px solid #fca5a5",
                        background: "#fff3f0",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#e84c2b",
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Modal Tambah/Edit */}
      {modal && (
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
              maxWidth: "480px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
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
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: "800",
                  color: "#0f0e17",
                }}
              >
                {modal === "tambah" ? "Tambah Changelog" : "Edit Changelog"}
              </h3>
              <button
                onClick={closeModal}
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

            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {/* Versi + Tanggal */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#0f0e17",
                    }}
                  >
                    Versi
                  </label>
                  <input
                    value={form.versi}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, versi: e.target.value }))
                    }
                    placeholder="1.0.0"
                    style={{ ...inputStyle, fontFamily: "monospace" }}
                    onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#0f0e17",
                    }}
                  >
                    Tanggal Rilis
                  </label>
                  <input
                    type="date"
                    value={form.released_at}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, released_at: e.target.value }))
                    }
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
                  />
                </div>
              </div>

              {/* Tipe */}
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
                  Tipe
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {TIPE_OPTIONS.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, tipe: t.value }))
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "7px 12px",
                          borderRadius: "8px",
                          border: `1.5px solid ${
                            form.tipe === t.value ? t.color : "#e2ddd5"
                          }`,
                          background:
                            form.tipe === t.value ? t.color + "18" : "white",
                          color: form.tipe === t.value ? t.color : "#6b6860",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          transition: "all .15s",
                        }}
                      >
                        <Icon size={13} />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audience */}
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
                  Ditujukan untuk
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[
                    { value: "all", label: "Semua", color: "#6b6860" },
                    { value: "user", label: "User", color: "#2563eb" },
                    { value: "admin", label: "Admin", color: "#7c3aed" },
                  ].map((a) => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, audience: a.value }))
                      }
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "8px",
                        border: `1.5px solid ${
                          form.audience === a.value ? a.color : "#e2ddd5"
                        }`,
                        background:
                          form.audience === a.value ? a.color + "18" : "white",
                        color: form.audience === a.value ? a.color : "#6b6860",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all .15s",
                      }}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Judul */}
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
                  Judul
                </label>
                <input
                  value={form.judul}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, judul: e.target.value }))
                  }
                  placeholder="Contoh: Tambah fitur soal random"
                  autoFocus
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
                />
              </div>

              {/* Deskripsi */}
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
                  Deskripsi{" "}
                  <span style={{ fontWeight: "400", color: "#6b6860" }}>
                    (opsional)
                  </span>
                </label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, deskripsi: e.target.value }))
                  }
                  placeholder="Jelaskan lebih detail perubahan ini..."
                  rows={3}
                  style={{ ...inputStyle, resize: "none", lineHeight: "1.6" }}
                  onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
                />
              </div>

              {/* Publish */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  background: "#f2efe8",
                  borderRadius: "10px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#0f0e17",
                    }}
                  >
                    Publish
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b6860" }}>
                    Tampilkan di halaman changelog publik
                  </div>
                </div>
                <ToggleSwitch
                  checked={form.is_published == 1}
                  onChange={() =>
                    setForm((f) => ({
                      ...f,
                      is_published: f.is_published == 1 ? 0 : 1,
                    }))
                  }
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                  marginTop: "4px",
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
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "10px",
                    border: "none",
                    background: saving ? "#f5a07a" : "#e84c2b",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: saving ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
