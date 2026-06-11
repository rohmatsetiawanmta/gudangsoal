// src/features/admin/AdminSoalRequests.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  ExternalLink,
  Inbox,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import MathRenderer from "../../components/MathRenderer";
import api from "../../lib/api";
import useWindowWidth from "../../hooks/useWindowWidth";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#854F0B", bg: "#faeeda" },
  approved: { label: "Approved", color: "#1a8a6e", bg: "#e4f5f0" },
  rejected: { label: "Rejected", color: "#e84c2b", bg: "#fff3f0" },
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
      }}
    >
      {s.label}
    </span>
  );
}

function ModalWrapper({ onClose, children }) {
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
          maxWidth: "560px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function AdminSoalRequests() {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState(null);
  const [modalForm, setModalForm] = useState({
    admin_notes: "",
    soal_kode: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const limit = 20;

  const fetchRequests = () => {
    setLoading(true);
    const statusParam = filterStatus ? `&status=${filterStatus}` : "";
    api
      .get(`/admin/soal-requests?page=${page}&limit=${limit}${statusParam}`)
      .then((data) => {
        setRequests(Array.isArray(data?.data) ? data.data : []);
        setTotal(data?.total || 0);
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
  }, [filterStatus]);
  useEffect(() => {
    fetchRequests();
  }, [page, filterStatus]);

  const openModal = (type, request) => {
    setModal({ type, request });
    setModalForm({ admin_notes: "", soal_kode: "" });
    setSaveError("");
  };
  const closeModal = () => {
    setModal(null);
    setSaveError("");
  };

  const handleApprove = async () => {
    if (!modalForm.soal_kode.trim()) {
      setSaveError("Kode soal wajib diisi");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      await api.put(`/admin/soal-requests?id=${modal.request.id}`, {
        status: "approved",
        admin_notes: modalForm.admin_notes || null,
        soal_kode: modalForm.soal_kode.trim(),
      });
      closeModal();
      fetchRequests();
    } catch (err) {
      setSaveError(err.error || "Gagal approve request");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await api.put(`/admin/soal-requests?id=${modal.request.id}`, {
        status: "rejected",
        admin_notes: modalForm.admin_notes || null,
        soal_kode: null,
      });
      closeModal();
      fetchRequests();
    } catch (err) {
      setSaveError(err.error || "Gagal reject request");
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const ActionButtons = ({ r }) => (
    <div style={{ display: "flex", gap: "6px" }}>
      <button
        onClick={() => openModal("detail", r)}
        title="Lihat detail"
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
        <ExternalLink size={12} />
      </button>
      {r.status === "pending" && (
        <>
          <button
            onClick={() => openModal("approve", r)}
            title="Approve"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "7px",
              border: "1px solid #9FE1CB",
              background: "#e4f5f0",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#1a8a6e",
            }}
          >
            <Check size={12} />
          </button>
          <button
            onClick={() => openModal("reject", r)}
            title="Reject"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "7px",
              border: "1px solid #e2ddd5",
              background: "#f2efe8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b6860",
            }}
          >
            <X size={12} />
          </button>
        </>
      )}
    </div>
  );

  const inputStyle = {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #e2ddd5",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    color: "#0f0e17",
  };

  return (
    <div>
      <Helmet>
        <title>Request Soal | Admin Gudang Soal</title>
      </Helmet>

      {/* ── Hero header ── */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #0d1c12 100%)",
        padding: isMobile ? "24px 20px" : "28px 32px",
        marginBottom: "28px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* watermark */}
        <div style={{
          position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%",
          transform: "translateY(-50%)",
          opacity: 0.06, userSelect: "none", lineHeight: 1,
          pointerEvents: "none", color: "white",
        }}>
          <Inbox size={isMobile ? 80 : 110} />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{
            fontSize: isMobile ? "22px" : "26px",
            fontWeight: "800", color: "white",
            letterSpacing: "-0.5px", margin: "0 0 12px",
          }}>Request Soal</h1>

          {/* stat chips */}
          {!loading && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { label: `${total} Total`, color: "rgba(255,255,255,.8)", bg: "rgba(255,255,255,.1)" },
                { label: `${requests.filter(r => r.status === "pending").length} Pending`, color: "#fcd34d", bg: "rgba(252,211,77,.12)" },
                { label: `${requests.filter(r => r.status === "approved").length} Approved`, color: "#6ee7b7", bg: "rgba(110,231,183,.12)" },
                { label: `${requests.filter(r => r.status === "rejected").length} Rejected`, color: "#fca5a5", bg: "rgba(232,76,43,.12)" },
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
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" },
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
              gridTemplateColumns: "1fr 140px 120px 120px",
              gap: "16px",
              padding: "12px 20px",
              background: "#f2efe8",
              borderBottom: "1px solid #e2ddd5",
            }}
          >
            {["Soal", "Pengirim", "Status", "Aksi"].map((h) => (
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
            requests.map((r, i) => (
              <div
                key={r.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 140px 120px 120px",
                  gap: "16px",
                  padding: "14px 20px",
                  borderBottom:
                    i < requests.length - 1 ? "1px solid #f2efe8" : "none",
                  alignItems: "center",
                  background: r.status === "pending" ? "#fffdf9" : "white",
                }}
              >
                <div style={{ minWidth: 0 }}>
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
                    {r.body
                      .replace(/\$\$?[^$]+\$\$?/g, "[math]")
                      .replace(/[*_~`#]/g, "")
                      .slice(0, 60)}
                    ...
                  </div>
                  <div style={{ fontSize: "11px", color: "#b4b2a9" }}>
                    {new Date(r.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {r.foto_url && (
                      <span style={{ marginLeft: "8px", color: "#6b6860" }}>
                        + foto
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#0f0e17",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.user_name}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#b4b2a9",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.user_email}
                  </div>
                </div>
                <StatusBadge status={r.status} />
                <ActionButtons r={r} />
              </div>
            ))}

          {!loading && requests.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "48px",
                color: "#6b6860",
                fontSize: "14px",
              }}
            >
              Tidak ada request
              {filterStatus ? ` dengan status "${filterStatus}"` : ""}.
            </div>
          )}
        </div>
      )}

      {/* ── MOBILE: Card list ── */}
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

          {!loading && requests.length === 0 && (
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
              Tidak ada request
              {filterStatus ? ` dengan status "${filterStatus}"` : ""}.
            </div>
          )}

          {!loading &&
            requests.map((r) => (
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
                {/* Baris 1: status + tanggal */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <StatusBadge status={r.status} />
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: "11px", color: "#b4b2a9" }}>
                    {new Date(r.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Baris 2: body soal */}
                <div
                  style={{
                    fontSize: "13px",
                    color: "#0f0e17",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.body
                    .replace(/\$\$?[^$]+\$\$?/g, "[math]")
                    .replace(/[*_~`#]/g, "")
                    .slice(0, 80)}
                  ...
                </div>

                {/* Baris 3: pengirim + foto tag */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#6b6860",
                      }}
                    >
                      {r.user_name}
                    </span>
                    {r.foto_url && (
                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: "11px",
                          color: "#b4b2a9",
                        }}
                      >
                        + foto
                      </span>
                    )}
                  </div>
                  <ActionButtons r={r} />
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

      {/* Modal Detail */}
      {modal?.type === "detail" && (
        <ModalWrapper onClose={closeModal}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: "800",
                  color: "#0f0e17",
                }}
              >
                Detail Request
              </h3>
              <StatusBadge status={modal.request.status} />
            </div>
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
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
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
                {modal.request.user_name}
              </div>
              <div
                style={{ fontSize: "12px", color: "#6b6860", marginTop: "2px" }}
              >
                {modal.request.user_email}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "#6b6860",
                  marginBottom: "8px",
                }}
              >
                Soal
              </div>
              <div style={{ fontSize: "14px", color: "#0f0e17" }}>
                <MathRenderer text={modal.request.body} block />
              </div>
            </div>
            {modal.request.foto_url && (
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "#6b6860",
                    marginBottom: "8px",
                  }}
                >
                  Foto
                </div>
                <img
                  src={modal.request.foto_url}
                  alt="Foto soal"
                  style={{
                    maxWidth: "100%",
                    borderRadius: "10px",
                    border: "1px solid #e2ddd5",
                  }}
                />
              </div>
            )}
            {modal.request.catatan && (
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "#6b6860",
                    marginBottom: "8px",
                  }}
                >
                  Catatan User
                </div>
                <div style={{ fontSize: "14px", color: "#6b6860" }}>
                  {modal.request.catatan}
                </div>
              </div>
            )}
            {modal.request.admin_notes && (
              <div
                style={{
                  background:
                    modal.request.status === "approved" ? "#e4f5f0" : "#fff3f0",
                  borderRadius: "10px",
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color:
                      modal.request.status === "approved"
                        ? "#1a8a6e"
                        : "#e84c2b",
                    marginBottom: "6px",
                  }}
                >
                  Catatan Admin
                </div>
                <div style={{ fontSize: "14px", color: "#0f0e17" }}>
                  {modal.request.admin_notes}
                </div>
              </div>
            )}
            {modal.request.status === "approved" && modal.request.soal_kode && (
              <button
                onClick={() => {
                  closeModal();
                  navigate(`/soal/${modal.request.soal_kode}`);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#e84c2b",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  alignSelf: "flex-start",
                }}
              >
                <ExternalLink size={15} /> Lihat Soal #{modal.request.soal_kode}
              </button>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
                Tutup
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Modal Approve */}
      {modal?.type === "approve" && (
        <ModalWrapper onClose={closeModal}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{ fontSize: "17px", fontWeight: "800", color: "#0f0e17" }}
            >
              Approve Request
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
          {saveError && (
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
              {saveError}
            </div>
          )}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
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
                Kode Soal yang Menjawab Request
              </label>
              <input
                value={modalForm.soal_kode}
                onChange={(e) =>
                  setModalForm((f) => ({ ...f, soal_kode: e.target.value }))
                }
                placeholder="Contoh: A1B2C3"
                style={{ ...inputStyle, fontFamily: "monospace" }}
                onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
              />
              <p style={{ fontSize: "12px", color: "#b4b2a9" }}>
                Isi dengan kode soal yang sudah ada di bank soal, atau buat soal
                baru dulu.
              </p>
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
                Catatan untuk User{" "}
                <span style={{ fontWeight: "400", color: "#6b6860" }}>
                  (opsional)
                </span>
              </label>
              <textarea
                value={modalForm.admin_notes}
                onChange={(e) =>
                  setModalForm((f) => ({ ...f, admin_notes: e.target.value }))
                }
                placeholder="Misal: Soal sudah tersedia di bank soal. Silakan cek pembahasannya!"
                rows={3}
                style={{ ...inputStyle, resize: "none", lineHeight: "1.6" }}
                onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
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
                onClick={handleApprove}
                disabled={saving}
                style={{
                  padding: "9px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: saving ? "#9FE1CB" : "#1a8a6e",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {saving ? "Menyimpan..." : "Approve"}
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* Modal Reject */}
      {modal?.type === "reject" && (
        <ModalWrapper onClose={closeModal}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{ fontSize: "17px", fontWeight: "800", color: "#0f0e17" }}
            >
              Reject Request
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
          {saveError && (
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
              {saveError}
            </div>
          )}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
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
                Alasan penolakan{" "}
                <span style={{ fontWeight: "400", color: "#6b6860" }}>
                  (opsional)
                </span>
              </label>
              <textarea
                value={modalForm.admin_notes}
                onChange={(e) =>
                  setModalForm((f) => ({ ...f, admin_notes: e.target.value }))
                }
                placeholder="Misal: Soal kurang jelas, mohon perjelas pertanyaannya."
                rows={3}
                style={{ ...inputStyle, resize: "none", lineHeight: "1.6" }}
                onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
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
                onClick={handleReject}
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
                {saving ? "Menyimpan..." : "Reject"}
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
