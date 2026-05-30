// src/features/admin/AdminSoal.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../../lib/api";
import ToggleSwitch from "../../components/ToggleSwitch";
import useWindowWidth from "../../hooks/useWindowWidth";
import { Helmet } from "react-helmet-async";

function DifficultyBadge({ level }) {
  const map = {
    1: { label: "Easy", color: "#1a8a6e", bg: "#e4f5f0" },
    2: { label: "Medium", color: "#854F0B", bg: "#faeeda" },
    3: { label: "Hard", color: "#e84c2b", bg: "#fff3f0" },
  };
  const d = map[level] || map[1];
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: "700",
        padding: "3px 8px",
        borderRadius: "6px",
        background: d.bg,
        color: d.color,
        flexShrink: 0,
      }}
    >
      {d.label}
    </span>
  );
}

export default function AdminSoal() {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [soal, setSoal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [publishLoading, setPublishLoading] = useState({});

  const limit = 20;

  const fetchSoal = () => {
    setLoading(true);
    api
      .get(`/admin/soal?page=${page}&limit=${limit}&search=${search}`)
      .then((data) => {
        setSoal(data.data);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSoal();
  }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleTogglePublish = async (id, currentStatus) => {
    setPublishLoading((p) => ({ ...p, [id]: true }));
    try {
      await api.put(`/admin/publish/soal?id=${id}`);
      setSoal((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, is_published: currentStatus == 1 ? "0" : "1" }
            : s
        )
      );
    } catch {
      alert("Gagal mengubah status publish");
    } finally {
      setPublishLoading((p) => ({ ...p, [id]: false }));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/soal?id=${deleteId}`);
      setDeleteId(null);
      fetchSoal();
    } catch {
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <Helmet>
        <title>Kelola Soal | Admin Gudang Soal</title>
      </Helmet>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "14px" : "0",
          marginBottom: "24px",
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
            Kelola Soal
          </h1>
          <p style={{ fontSize: "14px", color: "#6b6860" }}>
            {total} soal tersedia
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/soal/tambah")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#e84c2b",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "10px 18px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            fontFamily: "inherit",
            flexShrink: 0,
            width: isMobile ? "100%" : "auto",
            justifyContent: isMobile ? "center" : "flex-start",
          }}
        >
          <Plus size={16} />
          Tambah Soal
        </button>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        style={{ marginBottom: "20px", display: "flex", gap: "10px" }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#6b6860",
              pointerEvents: "none",
            }}
          />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari soal..."
            style={{
              width: "100%",
              paddingLeft: "36px",
              paddingRight: "16px",
              paddingTop: "10px",
              paddingBottom: "10px",
              borderRadius: "10px",
              border: "1px solid #e2ddd5",
              fontSize: "14px",
              outline: "none",
              fontFamily: "inherit",
              color: "#0f0e17",
              background: "white",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
            onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            background: "#0f0e17",
            color: "white",
            border: "none",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            fontFamily: "inherit",
            flexShrink: 0,
          }}
        >
          Cari
        </button>
      </form>

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
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "40px 70px 1fr 160px 80px 120px 70px",
              gap: "16px",
              padding: "12px 20px",
              background: "#f2efe8",
              borderBottom: "1px solid #e2ddd5",
            }}
          >
            {[
              "#",
              "Kode",
              "Soal",
              "Subtopik",
              "Sulit",
              "Published",
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

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: "60px",
                    borderBottom: "1px solid #f2efe8",
                    background: i % 2 === 0 ? "white" : "#faf9f6",
                    animation: "pulse 1.5s infinite",
                  }}
                />
              ))}
            </div>
          )}

          {/* Rows */}
          {!loading &&
            soal.map((s, i) => (
              <div
                key={s.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 70px 1fr 160px 80px 120px 70px",
                  gap: "16px",
                  padding: "14px 20px",
                  borderBottom: "1px solid #f2efe8",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: "13px", color: "#6b6860" }}>
                  {(page - 1) * limit + i + 1}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#6b6860",
                    fontFamily: "monospace",
                    letterSpacing: ".05em",
                  }}
                >
                  {s.kode || "—"}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#0f0e17",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.body
                    .replace(/\$[^$]+\$/g, "[math]")
                    .replace(/[*_~`#]/g, "")}
                </div>
                <div style={{ fontSize: "12px", color: "#6b6860" }}>
                  <div
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.subtopik}
                  </div>
                  <div
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginTop: "2px",
                      color: "#b4b2a9",
                    }}
                  >
                    {s.mapel}
                  </div>
                </div>
                <DifficultyBadge level={s.difficulty} />
                <ToggleSwitch
                  checked={s.is_published == 1}
                  onChange={() => handleTogglePublish(s.id, s.is_published)}
                  loading={publishLoading[s.id]}
                />
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => navigate(`/admin/soal/edit/${s.id}`)}
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
                    onClick={() => setDeleteId(s.id)}
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

          {/* Empty */}
          {!loading && soal.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "48px",
                color: "#6b6860",
                fontSize: "14px",
              }}
            >
              Tidak ada soal ditemukan.
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
                  height: "88px",
                  borderRadius: "14px",
                  background: "#e2ddd5",
                  opacity: 0.5,
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}

          {!loading && soal.length === 0 && (
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
              Tidak ada soal ditemukan.
            </div>
          )}

          {!loading &&
            soal.map((s, i) => (
              <div
                key={s.id}
                style={{
                  background: "white",
                  borderRadius: "14px",
                  border: "1px solid #e2ddd5",
                  padding: "14px 16px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                {/* Nomor avatar + kode */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "#f2efe8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: "800",
                      color: "#6b6860",
                    }}
                  >
                    {(page - 1) * limit + i + 1}
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "#b4b2a9",
                      fontFamily: "monospace",
                      letterSpacing: ".04em",
                    }}
                  >
                    {s.kode || "—"}
                  </span>
                </div>

                {/* Konten */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Body soal */}
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#0f0e17",
                      fontWeight: "500",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: "4px",
                    }}
                  >
                    {s.body
                      .replace(/\$[^$]+\$/g, "[math]")
                      .replace(/[*_~`#]/g, "")}
                  </div>

                  {/* Subtopik */}
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#b4b2a9",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: "8px",
                    }}
                  >
                    {s.mapel} — {s.subtopik}
                  </div>

                  {/* Badges + aksi */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <DifficultyBadge level={s.difficulty} />
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: s.is_published == 1 ? "#e4f5f0" : "#f2efe8",
                        color: s.is_published == 1 ? "#1a8a6e" : "#6b6860",
                      }}
                    >
                      {s.is_published == 1 ? "Published" : "Draft"}
                    </span>
                    <div style={{ flex: 1 }} />
                    <ToggleSwitch
                      checked={s.is_published == 1}
                      onChange={() => handleTogglePublish(s.id, s.is_published)}
                      loading={publishLoading[s.id]}
                    />
                    <button
                      onClick={() => navigate(`/admin/soal/edit/${s.id}`)}
                      style={{
                        width: "28px",
                        height: "28px",
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
                      onClick={() => setDeleteId(s.id)}
                      style={{
                        width: "28px",
                        height: "28px",
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

      {/* Delete modal */}
      {deleteId && (
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
              maxWidth: "400px",
              width: "100%",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "800",
                color: "#0f0e17",
                marginBottom: "8px",
              }}
            >
              Hapus Soal?
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6b6860",
                marginBottom: "24px",
                lineHeight: "1.6",
              }}
            >
              Soal ini akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setDeleteId(null)}
                style={{
                  padding: "10px 20px",
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
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#e84c2b",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: deleting ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
