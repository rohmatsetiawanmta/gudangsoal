// src/features/profile/components/ProfileHeader.jsx
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function ProfileHeader({ user, isMobile, onUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputStyle = {
    width: "100%",
    paddingLeft: "36px",
    paddingRight: "14px",
    paddingTop: "10px",
    paddingBottom: "10px",
    borderRadius: "10px",
    border: "1px solid #e2ddd5",
    fontSize: "14px",
    outline: "none",
    fontFamily: "inherit",
    color: "#0f0e17",
    boxSizing: "border-box",
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.name.trim()) {
      setError("Nama wajib diisi");
      return;
    }
    if (form.new_password && form.new_password !== form.confirm_password) {
      setError("Password baru tidak cocok");
      return;
    }
    setSaving(true);
    try {
      await onUpdate({
        name: form.name,
        current_password: form.current_password || undefined,
        new_password: form.new_password || undefined,
      });
      setSuccess("Profil berhasil diupdate!");
      setEditMode(false);
      setForm((f) => ({
        ...f,
        current_password: "",
        new_password: "",
        confirm_password: "",
      }));
    } catch (err) {
      setError(err.error || "Gagal mengupdate profil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "14px",
        border: "1px solid #e2ddd5",
        padding: isMobile ? "16px" : "24px",
      }}
    >
      {/* Info + tombol edit */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: editMode ? "20px" : "0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "#e84c2b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "800",
              fontSize: "18px",
              flexShrink: 0,
            }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div
              style={{
                fontSize: isMobile ? "16px" : "18px",
                fontWeight: "800",
                color: "#0f0e17",
              }}
            >
              {user?.name}
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#6b6860",
                marginTop: "2px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: isMobile ? "160px" : "300px",
              }}
            >
              {user?.email}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setEditMode(!editMode);
            setError("");
            setSuccess("");
          }}
          style={{
            padding: "7px 14px",
            borderRadius: "10px",
            border: "1px solid #e2ddd5",
            background: editMode ? "#f2efe8" : "white",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            fontFamily: "inherit",
            color: "#0f0e17",
            flexShrink: 0,
          }}
        >
          {editMode ? "Batal" : "Edit"}
        </button>
      </div>

      {/* Edit form */}
      {editMode && (
        <form
          onSubmit={handleSave}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            borderTop: "1px solid #f2efe8",
            paddingTop: "20px",
          }}
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

          {/* Nama */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}
            >
              Nama
            </label>
            <div style={{ position: "relative" }}>
              <User
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
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
              />
            </div>
          </div>

          {/* Password lama */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}
            >
              Password Lama{" "}
              <span style={{ fontWeight: "400", color: "#6b6860" }}>
                (isi jika ingin ganti password)
              </span>
            </label>
            <div style={{ position: "relative" }}>
              <Lock
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
                type={showPass ? "text" : "password"}
                value={form.current_password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, current_password: e.target.value }))
                }
                placeholder="Password lama"
                style={{ ...inputStyle, paddingRight: "40px" }}
                onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b6860",
                  display: "flex",
                }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Password baru + konfirmasi */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: "12px",
            }}
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
                Password Baru
              </label>
              <div style={{ position: "relative" }}>
                <Lock
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
                  type={showPass ? "text" : "password"}
                  value={form.new_password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, new_password: e.target.value }))
                  }
                  placeholder="Minimal 8 karakter"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
                />
              </div>
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
              <div style={{ position: "relative" }}>
                <Lock
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
                  type={showPass ? "text" : "password"}
                  value={form.confirm_password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, confirm_password: e.target.value }))
                  }
                  placeholder="Ulangi password baru"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "10px 24px",
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
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
