// src/features/admin/AdminUsers.jsx
import { useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
  User,
  Eye,
  Crown,
  Users,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import api from "../../lib/api";
import useWindowWidth from "../../hooks/useWindowWidth";

function RoleBadge({ role }) {
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: "700",
        padding: "3px 8px",
        borderRadius: "6px",
        background: role === "admin" ? "#fff3f0" : "#f2efe8",
        color: role === "admin" ? "#e84c2b" : "#6b6860",
      }}
    >
      {role === "admin" ? "Admin" : "User"}
    </span>
  );
}

function Modal({ title, onClose, children }) {
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
          maxWidth: "440px",
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
        {children}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editForm, setEditForm] = useState({ name: "", role: "user" });
  const [resetForm, setResetForm] = useState({ password: "", confirm: "" });
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const limit = 20;

  const fetchUsers = () => {
    setLoading(true);
    api
      .get(`/admin/users?page=${page}&limit=${limit}&search=${search}`)
      .then((data) => {
        setUsers(Array.isArray(data?.data) ? data.data : []);
        setTotal(data?.total || 0);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const openEdit = (user) => {
    setModal({ type: "edit", user });
    setEditForm({ name: user.name, role: user.role });
    setError("");
    setSuccess("");
  };

  const openReset = (user) => {
    setModal({ type: "reset", user });
    setResetForm({ password: "", confirm: "" });
    setError("");
    setSuccess("");
  };

  const openDetail = async (user) => {
    setModal({ type: "detail", user });
    setDetail(null);
    setLoadingDetail(true);
    try {
      const data = await api.get(`/admin/users/detail?id=${user.id}`);
      setDetail(data);
    } catch {
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setModal(null);
    setError("");
    setSuccess("");
  };

  const handleEdit = async () => {
    if (!editForm.name.trim()) {
      setError("Nama wajib diisi");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.put(`/admin/users?id=${modal.user.id}`, editForm);
      setSuccess("User berhasil diupdate!");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === modal.user.id
            ? { ...u, name: editForm.name, role: editForm.role }
            : u
        )
      );
      setTimeout(() => closeModal(), 1000);
    } catch (err) {
      setError(err.error || "Gagal mengupdate user");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetForm.password || resetForm.password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    if (resetForm.password !== resetForm.confirm) {
      setError("Password tidak cocok");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.post(`/admin/users/reset-password?id=${modal.user.id}`, {
        password: resetForm.password,
      });
      setSuccess("Password berhasil direset!");
      setTimeout(() => closeModal(), 1000);
    } catch (err) {
      setError(err.error || "Gagal reset password");
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const ActionButtons = ({ u }) => (
    <div style={{ display: "flex", gap: "6px" }}>
      <button
        onClick={() => openDetail(u)}
        title="Detail"
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
        <Eye size={12} />
      </button>
      <button
        onClick={() => openEdit(u)}
        title="Edit"
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
        <User size={12} />
      </button>
      <button
        onClick={() => openReset(u)}
        title="Reset Password"
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
        <Shield size={12} />
      </button>
    </div>
  );

  return (
    <div>
      <Helmet>
        <title>Kelola User | Admin Gudang Soal</title>
      </Helmet>

      {/* ── Hero header ── */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #0a1628 100%)",
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
          <Users size={isMobile ? 80 : 110} />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{
            fontSize: isMobile ? "22px" : "26px",
            fontWeight: "800", color: "white",
            letterSpacing: "-0.5px", margin: "0 0 12px",
          }}>Kelola User</h1>

          {/* stat chips */}
          {!loading && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { label: `${total} Total`, color: "rgba(255,255,255,.8)", bg: "rgba(255,255,255,.1)" },
                { label: `${users.filter(u => u.role === "admin").length} Admin`, color: "#fca5a5", bg: "rgba(232,76,43,.15)" },
                { label: `${users.filter(u => u.role !== "admin").length} User`, color: "#93c5fd", bg: "rgba(37,99,235,.15)" },
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
            placeholder="Cari nama atau email..."
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "40px 1fr 1fr 80px 80px 80px 100px",
              gap: "16px",
              padding: "12px 20px",
              background: "#f2efe8",
              borderBottom: "1px solid #e2ddd5",
            }}
          >
            {["#", "Nama", "Email", "Role", "XP", "Streak", "Aksi"].map((h) => (
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
                  height: "60px",
                  borderBottom: "1px solid #f2efe8",
                  background: i % 2 === 0 ? "white" : "#faf9f6",
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}

          {!loading &&
            users.map((u, i) => (
              <div
                key={u.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 1fr 1fr 80px 80px 80px 100px",
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
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: u.role === "admin" ? "#e84c2b" : "#f2efe8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: u.role === "admin" ? "white" : "#6b6860",
                      fontWeight: "700",
                      fontSize: "13px",
                      flexShrink: 0,
                    }}
                  >
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#0f0e17",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {u.name}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b6860",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {u.email}
                </div>
                <RoleBadge role={u.role} />
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#f5a623",
                  }}
                >
                  {parseInt(u.xp || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: "13px", color: "#6b6860" }}>
                  {u.streak || 0} hari
                </div>
                <ActionButtons u={u} />
              </div>
            ))}

          {!loading && users.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "48px",
                color: "#6b6860",
                fontSize: "14px",
              }}
            >
              Tidak ada user ditemukan.
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
                  height: "80px",
                  borderRadius: "14px",
                  background: "#e2ddd5",
                  opacity: 0.5,
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}

          {!loading && users.length === 0 && (
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
              Tidak ada user ditemukan.
            </div>
          )}

          {!loading &&
            users.map((u, i) => (
              <div
                key={u.id}
                style={{
                  background: "white",
                  borderRadius: "14px",
                  border: "1px solid #e2ddd5",
                  padding: "14px 16px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: u.role === "admin" ? "#e84c2b" : "#f2efe8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: u.role === "admin" ? "white" : "#6b6860",
                    fontWeight: "800",
                    fontSize: "16px",
                    flexShrink: 0,
                  }}
                >
                  {u.name?.[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "2px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#0f0e17",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {u.name}
                    </div>
                    <RoleBadge role={u.role} />
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#b4b2a9",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: "4px",
                    }}
                  >
                    {u.email}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#f5a623",
                      }}
                    >
                      {parseInt(u.xp || 0).toLocaleString()} XP
                    </span>
                    <span style={{ fontSize: "12px", color: "#b4b2a9" }}>
                      {u.streak || 0} hari streak
                    </span>
                  </div>
                </div>

                {/* Aksi */}
                <ActionButtons u={u} />
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

      {/* Modal Edit */}
      {modal?.type === "edit" && (
        <Modal title="Edit User" onClose={closeModal}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
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
            {success && (
              <div
                style={{
                  background: "#e4f5f0",
                  border: "1px solid #9FE1CB",
                  color: "#0F6E56",
                  fontSize: "13px",
                  borderRadius: "10px",
                  padding: "10px 14px",
                }}
              >
                {success}
              </div>
            )}
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
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
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
                Role
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {["user", "admin"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setEditForm((f) => ({ ...f, role: r }))}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "10px",
                      border: `2px solid ${
                        editForm.role === r ? "#e84c2b" : "#e2ddd5"
                      }`,
                      background: editForm.role === r ? "#fff3f0" : "white",
                      color: editForm.role === r ? "#e84c2b" : "#6b6860",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all .15s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    {r === "admin" ? <Crown size={14} /> : <User size={14} />}
                    {r === "admin" ? "Admin" : "User"}
                  </button>
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "8px",
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
                onClick={handleEdit}
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
        </Modal>
      )}

      {/* Modal Reset Password */}
      {modal?.type === "reset" && (
        <Modal
          title={`Reset Password — ${modal.user.name}`}
          onClose={closeModal}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
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
            {success && (
              <div
                style={{
                  background: "#e4f5f0",
                  border: "1px solid #9FE1CB",
                  color: "#0F6E56",
                  fontSize: "13px",
                  borderRadius: "10px",
                  padding: "10px 14px",
                }}
              >
                {success}
              </div>
            )}
            <div
              style={{
                background: "#fff3f0",
                borderRadius: "10px",
                padding: "12px 14px",
                fontSize: "13px",
                color: "#b91c1c",
              }}
            >
              Password baru akan langsung aktif. User perlu login ulang.
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
                Password Baru
              </label>
              <input
                type="password"
                value={resetForm.password}
                onChange={(e) =>
                  setResetForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder="Minimal 8 karakter"
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
                Konfirmasi Password
              </label>
              <input
                type="password"
                value={resetForm.confirm}
                onChange={(e) =>
                  setResetForm((f) => ({ ...f, confirm: e.target.value }))
                }
                placeholder="Ulangi password baru"
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
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "8px",
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
                onClick={handleResetPassword}
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
                {saving ? "Mereset..." : "Reset Password"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Detail */}
      {modal?.type === "detail" && (
        <Modal title={`Detail — ${modal.user.name}`} onClose={closeModal}>
          {loadingDetail ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: "40px",
                    borderRadius: "8px",
                    background: "#f2efe8",
                    animation: "pulse 1.5s infinite",
                  }}
                />
              ))}
            </div>
          ) : detail ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "16px",
                  background: "#faf9f6",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background:
                      detail.user.role === "admin" ? "#e84c2b" : "#f2efe8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: detail.user.role === "admin" ? "white" : "#6b6860",
                    fontWeight: "800",
                    fontSize: "20px",
                    flexShrink: 0,
                  }}
                >
                  {detail.user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#0f0e17",
                    }}
                  >
                    {detail.user.name}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#6b6860",
                      marginTop: "2px",
                    }}
                  >
                    {detail.user.email}
                  </div>
                  <div style={{ marginTop: "6px" }}>
                    <RoleBadge role={detail.user.role} />
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                {[
                  {
                    label: "Total XP",
                    value: parseInt(detail.user.xp || 0).toLocaleString(),
                    color: "#f5a623",
                  },
                  {
                    label: "Streak Hari",
                    value: `${detail.user.streak || 0} hari`,
                    color: "#e84c2b",
                  },
                  {
                    label: "Streak Soal",
                    value: detail.user.soal_streak || 0,
                    color: "#2563eb",
                  },
                  {
                    label: "Best Streak",
                    value: detail.user.soal_streak_best || 0,
                    color: "#7c3aed",
                  },
                  {
                    label: "Total Sesi",
                    value: detail.sesi?.total || 0,
                    color: "#1a8a6e",
                  },
                  {
                    label: "Jawaban Benar",
                    value: `${detail.sesi?.benar || 0} (${
                      detail.sesi?.total > 0
                        ? Math.round(
                            (detail.sesi.benar / detail.sesi.total) * 100
                          )
                        : 0
                    }%)`,
                    color: "#db2777",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    style={{
                      background: "white",
                      borderRadius: "10px",
                      border: "1px solid #e2ddd5",
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b6860",
                        marginBottom: "4px",
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: "800", color }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#b4b2a9",
                  textAlign: "center",
                }}
              >
                Bergabung sejak{" "}
                {new Date(detail.user.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "32px",
                color: "#6b6860",
                fontSize: "14px",
              }}
            >
              Gagal memuat detail user.
            </div>
          )}
        </Modal>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
