// src/features/admin/AdminReports.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flag, ChevronLeft, ChevronRight, ExternalLink, X, AlertTriangle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import api from "../../lib/api";
import useWindowWidth from "../../hooks/useWindowWidth";

const KATEGORI_LABEL = {
  soal_salah: "Soal salah / ambigu",
  jawaban_salah: "Jawaban salah",
  pembahasan_salah: "Pembahasan salah",
  typo: "Typo / salah ketik",
  latex_error: "Rumus LaTeX error",
  duplikat: "Soal duplikat",
  lainnya: "Lainnya",
};

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#854F0B", bg: "#faeeda" },
  resolved: { label: "Resolved", color: "#1a8a6e", bg: "#e4f5f0" },
  dismissed: { label: "Dismissed", color: "#6b6860", bg: "#f2efe8" },
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

function UpdateModal({ report, onClose, onUpdate }) {
  const [status, setStatus] = useState(report.status);
  const [adminNotes, setAdminNotes] = useState(report.admin_notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await api.put(`/admin/reports?id=${report.id}`, {
        status,
        admin_notes: adminNotes || null,
      });
      onUpdate({ ...report, status, admin_notes: adminNotes });
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
          maxWidth: "460px",
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
          <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f0e17" }}>
            Update Laporan
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

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Info laporan */}
          <div
            style={{
              background: "#f2efe8",
              borderRadius: "10px",
              padding: "12px 14px",
            }}
          >
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
              Laporan
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#0f0e17",
                marginBottom: "2px",
              }}
            >
              Soal #{report.soal_kode} —{" "}
              {KATEGORI_LABEL[report.kategori] || report.kategori}
            </div>
            {report.deskripsi && (
              <div style={{ fontSize: "13px", color: "#6b6860" }}>
                "{report.deskripsi}"
              </div>
            )}
            <div
              style={{ fontSize: "12px", color: "#b4b2a9", marginTop: "4px" }}
            >
              {report.user_name || "Anonymous"}
            </div>
          </div>

          {/* Status */}
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

          {/* Catatan admin */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}
            >
              Catatan{" "}
              <span style={{ fontWeight: "400", color: "#6b6860" }}>
                (opsional — dikirim ke user sebagai notifikasi)
              </span>
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Misal: Terima kasih, soal sudah diperbaiki."
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

export default function AdminReports() {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState(null);

  const limit = 20;

  const fetchReports = () => {
    setLoading(true);
    const statusParam = filterStatus ? `&status=${filterStatus}` : "";
    api
      .get(`/admin/reports?page=${page}&limit=${limit}${statusParam}`)
      .then((data) => {
        setReports(Array.isArray(data?.data) ? data.data : []);
        setTotal(data?.total || 0);
      })
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
  }, [filterStatus]);
  useEffect(() => {
    fetchReports();
  }, [page, filterStatus]);

  const handleUpdate = (updated) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const totalPages = Math.ceil(total / limit);
  const pendingCount = reports.filter((r) => r.status === "pending").length;

  const ActionButton = ({ r }) => (
    <button
      onClick={() => setModal(r)}
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
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f2efe8")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
    >
      Update
    </button>
  );

  return (
    <div>
      <Helmet>
        <title>Laporan Soal | Admin Gudang Soal</title>
      </Helmet>

      {/* ── Hero header ── */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #1c0d0d 100%)",
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
        }}>FLAG</div>

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
            }}>LAPORAN SOAL</div>
            <h1 style={{
              fontSize: isMobile ? "22px" : "26px",
              fontWeight: "800", color: "white",
              letterSpacing: "-0.5px", margin: "0 0 12px",
            }}>Laporan dari User</h1>

            {/* stat chips */}
            {!loading && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {[
                  { label: `${total} Total`, color: "rgba(255,255,255,.8)", bg: "rgba(255,255,255,.1)" },
                  { label: `${reports.filter(r => r.status === "pending").length} Pending`, color: "#fcd34d", bg: "rgba(252,211,77,.12)" },
                  { label: `${reports.filter(r => r.status === "resolved").length} Resolved`, color: "#6ee7b7", bg: "rgba(110,231,183,.12)" },
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
              flexShrink: 0,
            }}>
              <AlertTriangle size={14} color="#fcd34d" />
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#fcd34d" }}>
                {pendingCount} pending di halaman ini
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
        {[
          { value: "", label: "Semua" },
          { value: "pending", label: "Pending" },
          { value: "resolved", label: "Resolved" },
          { value: "dismissed", label: "Dismissed" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            style={{
              padding: "7px 16px",
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

      {/* Desktop: Table */}
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
              gridTemplateColumns: "80px 1fr 160px 120px 100px 100px",
              gap: "16px",
              padding: "12px 20px",
              background: "#f2efe8",
              borderBottom: "1px solid #e2ddd5",
            }}
          >
            {["Soal", "Deskripsi", "Kategori", "Pelapor", "Status", "Aksi"].map(
              (h) => (
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
              )
            )}
          </div>

          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "64px",
                  borderBottom: "1px solid #f2efe8",
                  background: i % 2 === 0 ? "white" : "#faf9f6",
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}

          {!loading &&
            reports.map((r, i) => (
              <div
                key={r.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 160px 120px 100px 100px",
                  gap: "16px",
                  padding: "14px 20px",
                  borderBottom:
                    i < reports.length - 1 ? "1px solid #f2efe8" : "none",
                  alignItems: "center",
                  background: r.status === "pending" ? "#fffdf9" : "white",
                }}
              >
                <button
                  onClick={() => navigate(`/soal/${r.soal_kode}`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#e84c2b",
                    fontFamily: "monospace",
                    padding: 0,
                  }}
                >
                  #{r.soal_kode} <ExternalLink size={10} />
                </button>
                <div>
                  {r.deskripsi && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b6860",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      "{r.deskripsi}"
                    </div>
                  )}
                  {r.admin_notes && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#1a8a6e",
                        marginTop: "2px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Catatan: {r.admin_notes}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#b4b2a9",
                      marginTop: "2px",
                    }}
                  >
                    {new Date(r.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#0f0e17",
                  }}
                >
                  {KATEGORI_LABEL[r.kategori] || r.kategori}
                </div>
                <div style={{ fontSize: "12px", color: "#6b6860" }}>
                  {r.user_name || "Anonymous"}
                </div>
                <StatusBadge status={r.status} />
                <ActionButton r={r} />
              </div>
            ))}

          {!loading && reports.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "48px",
                color: "#6b6860",
                fontSize: "14px",
              }}
            >
              Tidak ada laporan
              {filterStatus ? ` dengan status "${filterStatus}"` : ""}.
            </div>
          )}
        </div>
      )}

      {/* Mobile: Card list */}
      {isMobile && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "100px",
                  borderRadius: "14px",
                  background: "#e2ddd5",
                  opacity: 0.5,
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}

          {!loading && reports.length === 0 && (
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
              Tidak ada laporan
              {filterStatus ? ` dengan status "${filterStatus}"` : ""}.
            </div>
          )}

          {!loading &&
            reports.map((r) => (
              <div
                key={r.id}
                style={{
                  background: r.status === "pending" ? "#fffdf9" : "white",
                  borderRadius: "14px",
                  border: `1px solid ${
                    r.status === "pending" ? "#f5a623" : "#e2ddd5"
                  }`,
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {/* Baris 1 */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <button
                    onClick={() => navigate(`/soal/${r.soal_kode}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#e84c2b",
                      fontFamily: "monospace",
                      padding: 0,
                    }}
                  >
                    #{r.soal_kode} <ExternalLink size={10} />
                  </button>
                  <StatusBadge status={r.status} />
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: "11px", color: "#b4b2a9" }}>
                    {new Date(r.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>

                {/* Baris 2 */}
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#0f0e17",
                      marginBottom: "2px",
                    }}
                  >
                    {KATEGORI_LABEL[r.kategori] || r.kategori}
                  </div>
                  {r.deskripsi && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b6860",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      "{r.deskripsi}"
                    </div>
                  )}
                  {r.admin_notes && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#1a8a6e",
                        marginTop: "2px",
                      }}
                    >
                      Catatan: {r.admin_notes}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#b4b2a9",
                      marginTop: "2px",
                    }}
                  >
                    {r.user_name || "Anonymous"}
                  </div>
                </div>

                {/* Baris 3: aksi */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <ActionButton r={r} />
                </div>
              </div>
            ))}
        </div>
      )}

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

      {/* Modal */}
      {modal && (
        <UpdateModal
          report={modal}
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
