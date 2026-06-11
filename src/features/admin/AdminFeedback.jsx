// src/features/admin/AdminFeedback.jsx
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { X, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import api from "../../lib/api";
import useWindowWidth from "../../hooks/useWindowWidth";

const KATEGORI_LABEL = {
  saran_fitur: "Saran Fitur",
  bug: "Laporan Bug",
  minta_topik: "Request Topik",
  kualitas_konten: "Kualitas Soal",
  lainnya: "Lainnya",
};

const KATEGORI_CONFIG = {
  saran_fitur: { color: "#7c3aed", bg: "#f5f3ff" },
  bug: { color: "#e84c2b", bg: "#fff3f0" },
  minta_topik: { color: "#2563eb", bg: "#eff6ff" },
  kualitas_konten: { color: "#854F0B", bg: "#faeeda" },
  lainnya: { color: "#6b6860", bg: "#f2efe8" },
};

const STATUS_CONFIG = {
  pending: { label: "Menunggu", color: "#854F0B", bg: "#faeeda" },
  dibaca: { label: "Dibaca", color: "#2563eb", bg: "#eff6ff" },
  ditindaklanjuti: {
    label: "Ditindaklanjuti",
    color: "#1a8a6e",
    bg: "#e4f5f0",
  },
};

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: "700",
        padding: "3px 8px",
        borderRadius: "6px",
        background: s.bg,
        color: s.color,
        flexShrink: 0,
      }}
    >
      {s.label}
    </span>
  );
}

function KategoriBadge({ kategori }) {
  const k = KATEGORI_CONFIG[kategori] || KATEGORI_CONFIG.lainnya;
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: "700",
        padding: "3px 8px",
        borderRadius: "6px",
        background: k.bg,
        color: k.color,
        flexShrink: 0,
      }}
    >
      {KATEGORI_LABEL[kategori] || kategori}
    </span>
  );
}

function DetailModal({ item, onClose, onUpdate }) {
  const [status, setStatus] = useState(item.status);
  const [catatan, setCatatan] = useState(item.catatan || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await api.put(`/admin/feedback?id=${item.id}`, {
        status,
        catatan: catatan || null,
      });
      onUpdate({ ...item, status, catatan });
      onClose();
    } catch {
      setError("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

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
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h3
              style={{ fontSize: "17px", fontWeight: "800", color: "#0f0e17" }}
            >
              Detail Masukan
            </h3>
            <KategoriBadge kategori={item.kategori} />
          </div>
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

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* User info */}
          {(item.user_name || item.user_email) && (
            <div
              style={{
                background: "#f2efe8",
                borderRadius: "10px",
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f0e17",
                }}
              >
                {item.user_name || "—"}
              </div>
              <div
                style={{ fontSize: "12px", color: "#6b6860", marginTop: "2px" }}
              >
                {item.user_email || "Tidak login"}
              </div>
            </div>
          )}
          {!item.user_name && !item.user_email && (
            <div
              style={{
                background: "#f2efe8",
                borderRadius: "10px",
                padding: "12px 14px",
                fontSize: "13px",
                color: "#b4b2a9",
              }}
            >
              Dikirim tanpa login
            </div>
          )}

          {/* Judul */}
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#6b6860",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                marginBottom: "6px",
              }}
            >
              Judul
            </div>
            <div
              style={{ fontSize: "15px", fontWeight: "600", color: "#0f0e17" }}
            >
              {item.judul}
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#6b6860",
                textTransform: "uppercase",
                letterSpacing: ".06em",
                marginBottom: "6px",
              }}
            >
              Deskripsi
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#0f0e17",
                lineHeight: "1.7",
                whiteSpace: "pre-wrap",
              }}
            >
              {item.deskripsi}
            </div>
          </div>

          {/* Tanggal */}
          <div style={{ fontSize: "12px", color: "#b4b2a9" }}>
            Dikirim:{" "}
            {new Date(item.created_at).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #f2efe8" }} />

          {/* Update status */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}
            >
              Status
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatus(key)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "8px",
                    border: `1.5px solid ${
                      status === key ? val.color : "#e2ddd5"
                    }`,
                    background: status === key ? val.bg : "white",
                    color: status === key ? val.color : "#6b6860",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all .15s",
                  }}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          {/* Catatan */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}
            >
              Catatan untuk User{" "}
              <span style={{ fontWeight: "400", color: "#6b6860" }}>
                (opsional)
              </span>
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Misal: Terima kasih, fitur ini sedang kami pertimbangkan untuk versi berikutnya."
              rows={3}
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1px solid #e2ddd5",
                fontSize: "14px",
                outline: "none",
                fontFamily: "inherit",
                color: "#0f0e17",
                resize: "none",
                lineHeight: "1.6",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
              onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
            />
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
              }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div
            style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
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
  );
}

export default function AdminFeedback() {
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const limit = 20;

  const fetchFeedback = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit });
    if (filterStatus) params.append("status", filterStatus);
    if (filterKategori) params.append("kategori", filterKategori);
    api
      .get(`/admin/feedback?${params}`)
      .then((d) => {
        setFeedback(Array.isArray(d?.data) ? d.data : []);
        setTotal(d?.total || 0);
      })
      .catch(() => setFeedback([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
  }, [filterStatus, filterKategori]);
  useEffect(() => {
    fetchFeedback();
  }, [page, filterStatus, filterKategori]);

  const handleUpdate = (updated) => {
    setFeedback((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/admin/feedback?id=${id}`);
      setFeedback((prev) => prev.filter((f) => f.id !== id));
      setTotal((t) => t - 1);
    } catch {
      alert("Gagal menghapus");
    } finally {
      setDeleting(null);
    }
  };

  const totalPages = Math.ceil(total / limit);
  const pendingCount = feedback.filter((f) => f.status === "pending").length;

  return (
    <div>
      <Helmet>
        <title>Masukan User | Admin Gudang Soal</title>
      </Helmet>

      {/* ── Hero header ── */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #1a0d28 100%)",
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
        }}>FEED</div>

        <div style={{
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: "16px",
          position: "relative", zIndex: 1,
        }}>
          <div>
            <h1 style={{
              fontSize: isMobile ? "22px" : "26px",
              fontWeight: "800", color: "white",
              letterSpacing: "-0.5px", margin: "0 0 12px",
            }}>Masukan User</h1>

            {/* stat chips */}
            {!loading && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  { label: `${total} Total`, color: "rgba(255,255,255,.8)", bg: "rgba(255,255,255,.1)" },
                  { label: `${feedback.filter(f => f.status === "pending").length} Menunggu`, color: "#fcd34d", bg: "rgba(252,211,77,.12)" },
                  { label: `${feedback.filter(f => f.status === "dibaca").length} Dibaca`, color: "#93c5fd", bg: "rgba(37,99,235,.12)" },
                  { label: `${feedback.filter(f => f.status === "ditindaklanjuti").length} Ditindaklanjuti`, color: "#6ee7b7", bg: "rgba(110,231,183,.12)" },
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

          {pendingCount > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "rgba(252,211,77,.15)",
              border: "1px solid rgba(252,211,77,.3)",
              borderRadius: "10px", padding: "8px 14px",
              flexShrink: 0, width: isMobile ? "100%" : "auto",
            }}>
              <MessageSquare size={14} color="#fcd34d" />
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#fcd34d" }}>
                {pendingCount} belum dibaca
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filter */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* Filter status */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            { value: "", label: "Semua Status" },
            { value: "pending", label: "Menunggu" },
            { value: "dibaca", label: "Dibaca" },
            { value: "ditindaklanjuti", label: "Ditindaklanjuti" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                border: `1.5px solid ${
                  filterStatus === f.value ? "#e84c2b" : "#e2ddd5"
                }`,
                background: filterStatus === f.value ? "#fff3f0" : "white",
                color: filterStatus === f.value ? "#e84c2b" : "#6b6860",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .15s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Filter kategori */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[
            { value: "", label: "Semua Kategori" },
            ...Object.entries(KATEGORI_LABEL).map(([value, label]) => ({
              value,
              label,
            })),
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterKategori(f.value)}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                border: `1.5px solid ${
                  filterKategori === f.value ? "#2563eb" : "#e2ddd5"
                }`,
                background: filterKategori === f.value ? "#eff6ff" : "white",
                color: filterKategori === f.value ? "#2563eb" : "#6b6860",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .15s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: "90px",
                borderRadius: "14px",
                background: "#e2ddd5",
                opacity: 0.5,
                animation: "pulse 1.5s infinite",
              }}
            />
          ))}

        {!loading && feedback.length === 0 && (
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
            Tidak ada masukan ditemukan.
          </div>
        )}

        {!loading &&
          feedback.map((f) => (
            <div
              key={f.id}
              style={{
                background: f.status === "pending" ? "#fffdf9" : "white",
                borderRadius: "14px",
                border: `1px solid ${
                  f.status === "pending" ? "#f5a623" : "#e2ddd5"
                }`,
                padding: isMobile ? "14px 16px" : "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {/* Baris 1: kategori + status + tanggal */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <KategoriBadge kategori={f.kategori} />
                <StatusBadge status={f.status} />
                <div style={{ flex: 1 }} />
                <span
                  style={{ fontSize: "11px", color: "#b4b2a9", flexShrink: 0 }}
                >
                  {new Date(f.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Baris 2: judul */}
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0f0e17",
                }}
              >
                {f.judul}
              </div>

              {/* Baris 3: deskripsi truncated */}
              <div
                style={{
                  fontSize: "13px",
                  color: "#6b6860",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {f.deskripsi}
              </div>

              {/* Baris 4: user + aksi */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#b4b2a9",
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f.user_name
                    ? `${f.user_name} · ${f.user_email}`
                    : "Tanpa akun"}
                </span>
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button
                    onClick={() => setModal(f)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e2ddd5",
                      background: "white",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      color: "#0f0e17",
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f2efe8")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "white")
                    }
                  >
                    Lihat & Respons
                  </button>
                  <button
                    onClick={() => handleDelete(f.id)}
                    disabled={deleting === f.id}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "8px",
                      border: "1px solid #fca5a5",
                      background: "#fff3f0",
                      cursor: deleting === f.id ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#e84c2b",
                      opacity: deleting === f.id ? 0.5 : 1,
                      fontSize: "14px",
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <span style={{ fontSize: "13px", color: "#6b6860" }}>
            {isMobile
              ? `${page} / ${totalPages}`
              : `Halaman ${page} dari ${totalPages}`}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: isMobile ? "8px 12px" : "8px 14px",
                borderRadius: "8px",
                border: "1px solid #e2ddd5",
                background: "white",
                fontSize: "13px",
                fontWeight: "500",
                cursor: page === 1 ? "not-allowed" : "pointer",
                color: page === 1 ? "#b4b2a9" : "#0f0e17",
                fontFamily: "inherit",
              }}
            >
              <ChevronLeft size={14} />
              {!isMobile && "Sebelumnya"}
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: isMobile ? "8px 12px" : "8px 14px",
                borderRadius: "8px",
                border: "1px solid #e2ddd5",
                background: "white",
                fontSize: "13px",
                fontWeight: "500",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                color: page === totalPages ? "#b4b2a9" : "#0f0e17",
                fontFamily: "inherit",
              }}
            >
              {!isMobile && "Berikutnya"}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {modal && (
        <DetailModal
          item={modal}
          onClose={() => setModal(null)}
          onUpdate={(updated) => {
            handleUpdate(updated);
            setModal(null);
          }}
        />
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
