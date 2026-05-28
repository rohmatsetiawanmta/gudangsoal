// src/features/admin/AdminReports.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flag,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import api from "../../lib/api";

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

export default function AdminReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [updating, setUpdating] = useState({});

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

  const handleUpdateStatus = async (id, status) => {
    setUpdating((u) => ({ ...u, [id]: true }));
    try {
      await api.put(`/admin/reports?id=${id}`, { status });
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch {
      alert("Gagal mengupdate status");
    } finally {
      setUpdating((u) => ({ ...u, [id]: false }));
    }
  };

  const totalPages = Math.ceil(total / limit);
  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "#0f0e17",
              letterSpacing: "-0.5px",
              marginBottom: "4px",
            }}
          >
            Laporan Soal
          </h1>
          <p style={{ fontSize: "14px", color: "#6b6860" }}>
            {total} laporan masuk
          </p>
        </div>
        {pendingCount > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#faeeda",
              border: "1px solid #f5a623",
              borderRadius: "10px",
              padding: "8px 14px",
            }}
          >
            <Flag size={14} color="#854F0B" />
            <span
              style={{ fontSize: "13px", fontWeight: "600", color: "#854F0B" }}
            >
              {pendingCount} pending di halaman ini
            </span>
          </div>
        )}
      </div>

      {/* Filter status */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
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
            gridTemplateColumns: "80px 1fr 160px 120px 100px 110px",
            gap: "16px",
            padding: "12px 20px",
            background: "#f2efe8",
            borderBottom: "1px solid #e2ddd5",
          }}
        >
          {["Soal", "Report", "Kategori", "Pelapor", "Status", "Aksi"].map(
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
          reports.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 160px 120px 100px 110px",
                gap: "16px",
                padding: "14px 20px",
                borderBottom:
                  i < reports.length - 1 ? "1px solid #f2efe8" : "none",
                alignItems: "center",
                background: r.status === "pending" ? "#fffdf9" : "white",
              }}
            >
              {/* Kode soal */}
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#0f0e17",
                  fontFamily: "monospace",
                }}
              >
                #{r.soal_kode}
              </div>

              {/* Body soal */}
              <div>
                {r.deskripsi && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b6860",
                      marginTop: "3px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    "{r.deskripsi}"
                  </div>
                )}
                <div
                  style={{
                    fontSize: "11px",
                    color: "#b4b2a9",
                    marginTop: "3px",
                  }}
                >
                  {new Date(r.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Kategori */}
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#0f0e17",
                }}
              >
                {KATEGORI_LABEL[r.kategori] || r.kategori}
              </div>

              {/* Pelapor */}
              <div style={{ fontSize: "12px", color: "#6b6860" }}>
                {r.user_name || "Anonymous"}
              </div>

              {/* Status */}
              <StatusBadge status={r.status} />

              {/* Aksi */}
              <div
                style={{ display: "flex", gap: "6px", alignItems: "center" }}
              >
                {/* Lihat soal */}
                <button
                  onClick={() => navigate(`/soal/${r.soal_kode}`)}
                  title="Lihat soal"
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

                {/* Resolve */}
                {r.status !== "resolved" && (
                  <button
                    onClick={() => handleUpdateStatus(r.id, "resolved")}
                    disabled={updating[r.id]}
                    title="Mark resolved"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "7px",
                      border: "1px solid #9FE1CB",
                      background: "#e4f5f0",
                      cursor: updating[r.id] ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#1a8a6e",
                      opacity: updating[r.id] ? 0.5 : 1,
                    }}
                  >
                    <Check size={12} />
                  </button>
                )}

                {/* Dismiss */}
                {r.status !== "dismissed" && (
                  <button
                    onClick={() => handleUpdateStatus(r.id, "dismissed")}
                    disabled={updating[r.id]}
                    title="Dismiss"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "7px",
                      border: "1px solid #e2ddd5",
                      background: "#f2efe8",
                      cursor: updating[r.id] ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#6b6860",
                      opacity: updating[r.id] ? 0.5 : 1,
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}

        {/* Empty */}
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

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
