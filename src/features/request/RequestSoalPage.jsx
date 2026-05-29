// src/features/request/RequestSoalPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronDown, ChevronUp, ExternalLink, X } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import MarkdownEditor from "../../components/MarkdownEditor";
import MathRenderer from "../../components/MathRenderer";
import api from "../../lib/api";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";

const STATUS_CONFIG = {
  pending: { label: "Menunggu Review", color: "#854F0B", bg: "#faeeda" },
  approved: { label: "Disetujui", color: "#1a8a6e", bg: "#e4f5f0" },
  rejected: { label: "Ditolak", color: "#e84c2b", bg: "#fff3f0" },
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

export default function RequestSoalPage() {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({ body: "", catatan: "", foto_url: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [uploadingFoto, setUploadingFoto] = useState(false);

  const fetchRequests = () => {
    setLoading(true);
    api
      .get("/soal-request")
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleFotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setSubmitError("Ukuran foto maksimal 2MB");
      return;
    }
    setUploadingFoto(true);
    setSubmitError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/upload/image?folder=uploads/request`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: formData,
        }
      );
      const data = await res.json();
      if (data.url) setForm((f) => ({ ...f, foto_url: data.url }));
      else setSubmitError(data.error || "Gagal upload foto");
    } catch {
      setSubmitError("Gagal upload foto");
    } finally {
      setUploadingFoto(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!form.body.trim()) {
      setSubmitError("Isi soal wajib diisi");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      await api.post("/soal-request", form);
      setSubmitSuccess(
        "Request soal berhasil dikirim! Admin akan mereview dalam waktu dekat."
      );
      setForm({ body: "", catatan: "", foto_url: "" });
      setFormOpen(false);
      fetchRequests();
      setTimeout(() => setSubmitSuccess(""), 4000);
    } catch (err) {
      setSubmitError(err.error || "Gagal mengirim request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f6" }}>
      <SEO
        title="Request Soal"
        description="Kirim soal yang ingin kamu tanyakan. Admin akan mereview dan menjawab."
        url="/request-soal"
      />
      <Navbar />

      <main
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: isMobile ? "24px 20px" : "40px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "16px" : "0",
            marginBottom: "32px",
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
              Request Soal
            </h1>
            <p style={{ fontSize: "14px", color: "#6b6860" }}>
              Kirim soal yang ingin kamu tanyakan. Admin akan mereview dan
              menjawab.
            </p>
          </div>
          <button
            onClick={() => {
              setFormOpen(true);
              setSubmitError("");
            }}
            style={{
              display: "flex",
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
              flexShrink: 0,
            }}
          >
            <Plus size={16} /> Kirim Soal
          </button>
        </div>

        {/* Success banner */}
        {submitSuccess && (
          <div
            style={{
              background: "#e4f5f0",
              border: "1px solid #9FE1CB",
              color: "#0F6E56",
              fontSize: "14px",
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "24px",
              fontWeight: "500",
            }}
          >
            {submitSuccess}
          </div>
        )}

        {/* Modal form */}
        {formOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 300,
              padding: isMobile ? "16px" : "24px",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: isMobile ? "20px" : "28px",
                maxWidth: "600px",
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
                  Kirim Request Soal
                </h3>
                <button
                  onClick={() => setFormOpen(false)}
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

              {submitError && (
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
                  {submitError}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* Body soal */}
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
                    Soal yang ingin ditanyakan
                  </label>
                  <MarkdownEditor
                    value={form.body}
                    onChange={(v) => setForm((f) => ({ ...f, body: v }))}
                    placeholder="Tulis soal di sini... Bisa pakai LaTeX ($...$) dan Markdown"
                    rows={5}
                    hideImage
                  />
                </div>

                {/* Foto upload */}
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
                    Foto Soal{" "}
                    <span style={{ fontWeight: "400", color: "#6b6860" }}>
                      (opsional, maks 2MB)
                    </span>
                  </label>
                  {form.foto_url ? (
                    <div
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <img
                        src={form.foto_url}
                        alt="Foto soal"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "200px",
                          borderRadius: "10px",
                          border: "1px solid #e2ddd5",
                          objectFit: "contain",
                        }}
                      />
                      <button
                        onClick={() => setForm((f) => ({ ...f, foto_url: "" }))}
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "rgba(0,0,0,0.5)",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "20px",
                        borderRadius: "10px",
                        border: "2px dashed #e2ddd5",
                        cursor: uploadingFoto ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        color: "#6b6860",
                        transition: "all .15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!uploadingFoto) {
                          e.currentTarget.style.borderColor = "#e84c2b";
                          e.currentTarget.style.color = "#e84c2b";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e2ddd5";
                        e.currentTarget.style.color = "#6b6860";
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoUpload}
                        style={{ display: "none" }}
                        disabled={uploadingFoto}
                      />
                      {uploadingFoto
                        ? "Mengupload..."
                        : "Klik untuk upload foto soal"}
                    </label>
                  )}
                </div>

                {/* Catatan */}
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
                    Catatan tambahan{" "}
                    <span style={{ fontWeight: "400", color: "#6b6860" }}>
                      (opsional)
                    </span>
                  </label>
                  <textarea
                    value={form.catatan}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, catatan: e.target.value }))
                    }
                    placeholder="Misal: dari soal UTBK 2023, atau topik spesifik yang belum dimengerti..."
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
                    onClick={() => setFormOpen(false)}
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
                    onClick={handleSubmit}
                    disabled={submitting || !form.body.trim()}
                    style={{
                      padding: "9px 20px",
                      borderRadius: "10px",
                      border: "none",
                      background:
                        submitting || !form.body.trim() ? "#e2ddd5" : "#e84c2b",
                      color:
                        submitting || !form.body.trim() ? "#b4b2a9" : "white",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor:
                        submitting || !form.body.trim()
                          ? "not-allowed"
                          : "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {submitting ? "Mengirim..." : "Kirim Request"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* List requests */}
        {loading ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
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
          </div>
        ) : requests.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: "48px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#0f0e17",
                marginBottom: "8px",
              }}
            >
              Belum ada request soal
            </p>
            <p style={{ fontSize: "14px", color: "#6b6860" }}>
              Klik tombol "Kirim Soal" untuk mulai.
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {requests.map((r) => (
              <div
                key={r.id}
                style={{
                  background: "white",
                  borderRadius: "14px",
                  border: "1px solid #e2ddd5",
                  overflow: "hidden",
                }}
              >
                {/* Header row */}
                <div
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: isMobile ? "14px 16px" : "16px 20px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#0f0e17",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginBottom: "4px",
                      }}
                    >
                      {r.body
                        .replace(/\$\$?[^$]+\$\$?/g, "[math]")
                        .replace(/[*_~`#]/g, "")
                        .slice(0, 80)}
                      ...
                    </div>
                    <div style={{ fontSize: "12px", color: "#b4b2a9" }}>
                      {new Date(r.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                  {expanded === r.id ? (
                    <ChevronUp size={16} color="#6b6860" />
                  ) : (
                    <ChevronDown size={16} color="#6b6860" />
                  )}
                </div>

                {/* Expanded detail */}
                {expanded === r.id && (
                  <div
                    style={{
                      padding: isMobile ? "0 16px 16px" : "0 20px 20px",
                      borderTop: "1px solid #f2efe8",
                    }}
                  >
                    <div
                      style={{
                        paddingTop: "16px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      {/* Body soal */}
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
                          <MathRenderer text={r.body} block />
                        </div>
                      </div>

                      {/* Foto */}
                      {r.foto_url && (
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
                            src={r.foto_url}
                            alt="Foto soal"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "300px",
                              borderRadius: "10px",
                              border: "1px solid #e2ddd5",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                      )}

                      {/* Catatan user */}
                      {r.catatan && (
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
                            Catatan
                          </div>
                          <div style={{ fontSize: "14px", color: "#6b6860" }}>
                            {r.catatan}
                          </div>
                        </div>
                      )}

                      {/* Admin notes */}
                      {r.admin_notes && (
                        <div
                          style={{
                            background:
                              r.status === "approved" ? "#e4f5f0" : "#fff3f0",
                            borderRadius: "10px",
                            padding: "14px 16px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: "700",
                              letterSpacing: ".08em",
                              textTransform: "uppercase",
                              color:
                                r.status === "approved" ? "#1a8a6e" : "#e84c2b",
                              marginBottom: "6px",
                            }}
                          >
                            Catatan Admin
                          </div>
                          <div style={{ fontSize: "14px", color: "#0f0e17" }}>
                            {r.admin_notes}
                          </div>
                        </div>
                      )}

                      {/* Link soal kalau approved */}
                      {r.status === "approved" && r.soal_kode && (
                        <button
                          onClick={() => navigate(`/soal/${r.soal_kode}`)}
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
                          <ExternalLink size={15} />
                          Lihat Soal #{r.soal_kode}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
