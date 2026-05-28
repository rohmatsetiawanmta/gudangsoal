// src/features/admin/AdminSoalRequests.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  ExternalLink,
} from "lucide-react";
import MathRenderer from "../../components/MathRenderer";
import api from "../../lib/api";

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

export default function AdminSoalRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState(null); // { type: 'approve'|'reject'|'detail', request }
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

  return (
    <div>
      {/* Header */}
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
          Request Soal
        </h1>
        <p style={{ fontSize: "14px", color: "#6b6860" }}>
          {total} request masuk
        </p>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
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

      {/* Table */}
      <div
        style={{
          background: "white",
          borderRadius: "14px",
          border: "1px solid #e2ddd5",
          overflow: "hidden",
        }}
      >
        {/* Header */}
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

        {/* Loading */}
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

        {/* Rows */}
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
            Halaman {page} dari {totalPages}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "8px 14px",
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
              <ChevronLeft size={14} /> Sebelumnya
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "8px 14px",
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
              Berikutnya <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {modal?.type === "detail" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
            padding: "24px",
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
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
                  style={{
                    fontSize: "12px",
                    color: "#6b6860",
                    marginTop: "2px",
                  }}
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
                      modal.request.status === "approved"
                        ? "#e4f5f0"
                        : "#fff3f0",
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

              {modal.request.status === "approved" &&
                modal.request.soal_kode && (
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
                    <ExternalLink size={15} /> Lihat Soal #
                    {modal.request.soal_kode}
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
          </div>
        </div>
      )}

      {/* Modal Approve */}
      {modal?.type === "approve" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "440px",
              width: "100%",
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
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #e2ddd5",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "inherit",
                    color: "#0f0e17",
                    fontFamily: "monospace",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
                />
                <p style={{ fontSize: "12px", color: "#b4b2a9" }}>
                  Isi dengan kode soal yang sudah ada di bank soal, atau buat
                  soal baru dulu.
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
          </div>
        </div>
      )}

      {/* Modal Reject */}
      {modal?.type === "reject" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "440px",
              width: "100%",
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
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
