// src/features/profile/components/ProfileHeader.jsx
import { User, Lock, Eye, EyeOff, Zap, Flame, Edit2, X } from "lucide-react";
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
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  // XP progress
  const xp      = user?.xp || 0;
  const level   = Math.floor(Math.sqrt(xp / 100)) + 1;
  const prevXP  = Math.pow(level - 1, 2) * 100;
  const nextXP  = Math.pow(level, 2) * 100;
  const percent = Math.min(100, ((xp - prevXP) / (nextXP - prevXP)) * 100);

  const inputStyle = {
    width: "100%",
    paddingLeft: "36px", paddingRight: "14px",
    paddingTop: "10px", paddingBottom: "10px",
    borderRadius: "10px", border: "1px solid #e2ddd5",
    fontSize: "14px", outline: "none",
    fontFamily: "inherit", color: "#0f0e17", boxSizing: "border-box",
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Nama wajib diisi"); return; }
    if (form.new_password && form.new_password !== form.confirm_password) {
      setError("Password baru tidak cocok"); return;
    }
    setSaving(true);
    try {
      await onUpdate({
        name: form.name,
        current_password: form.current_password || undefined,
        new_password: form.new_password || undefined,
      });
      setEditMode(false);
      setForm(f => ({ ...f, current_password: "", new_password: "", confirm_password: "" }));
    } catch (err) {
      setError(err.error || "Gagal mengupdate profil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* ── Hero card ── */}
      <div style={{
        borderRadius: "20px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 60%, #2c1810 100%)",
        padding: isMobile ? "24px 20px" : "32px 36px",
        position: "relative", overflow: "hidden",
      }}>
        {/* watermark */}
        <div style={{
          position: "absolute", right: isMobile ? "-10px" : "32px", top: "50%",
          transform: "translateY(-50%)",
          opacity: 0.05, userSelect: "none", pointerEvents: "none",
          color: "white", lineHeight: 1,
        }}>
          <User size={isMobile ? 100 : 140} />
        </div>

        {/* Avatar + info + edit btn */}
        <div style={{
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: "20px",
          position: "relative", zIndex: 1,
          marginBottom: "24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: isMobile ? "52px" : "64px",
              height: isMobile ? "52px" : "64px",
              borderRadius: "16px", background: "#e84c2b",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: "800",
              fontSize: isMobile ? "22px" : "26px",
              flexShrink: 0,
              boxShadow: "0 4px 16px rgba(232,76,43,.4)",
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{
                fontSize: isMobile ? "18px" : "22px", fontWeight: "800",
                color: "white", letterSpacing: "-0.4px", marginBottom: "3px",
              }}>
                {user?.name}
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,.4)", marginBottom: "10px" }}>
                {user?.email}
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  fontSize: "12px", fontWeight: "700", padding: "3px 10px",
                  borderRadius: "99px", background: "rgba(252,211,77,.15)", color: "#fcd34d",
                }}>
                  <Zap size={11} /> {xp.toLocaleString()} XP
                </span>
                {(user?.streak || 0) > 0 && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "4px",
                    fontSize: "12px", fontWeight: "700", padding: "3px 10px",
                    borderRadius: "99px", background: "rgba(232,76,43,.2)", color: "#fca5a5",
                  }}>
                    <Flame size={11} /> {user.streak} hari streak
                  </span>
                )}
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  fontSize: "12px", fontWeight: "700", padding: "3px 10px",
                  borderRadius: "99px", background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.65)",
                }}>
                  Lv. {level}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setEditMode(!editMode); setError(""); }}
            style={{
              display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start",
              gap: "7px", padding: "9px 16px", borderRadius: "10px",
              border: "1px solid rgba(255,255,255,.2)",
              background: editMode ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.08)",
              color: editMode ? "white" : "rgba(255,255,255,.7)",
              fontSize: "13px", fontWeight: "600", cursor: "pointer",
              fontFamily: "inherit", transition: "all .15s",
              flexShrink: 0, width: isMobile ? "100%" : "auto",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.18)"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { if (!editMode) { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; } }}
          >
            {editMode ? <X size={14} /> : <Edit2 size={14} />}
            {editMode ? "Batal" : "Edit Profil"}
          </button>
        </div>

        {/* XP progress bar */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,.45)" }}>
              Level {level}
            </span>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,.3)" }}>
              {(nextXP - xp).toLocaleString()} XP lagi ke Level {level + 1}
            </span>
          </div>
          <div style={{ height: "6px", background: "rgba(255,255,255,.1)", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${percent}%`,
              background: "linear-gradient(90deg, #fcd34d, #f59e0b)",
              borderRadius: "3px", transition: "width 1s ease",
            }} />
          </div>
        </div>
      </div>

      {/* ── Edit form card ── */}
      {editMode && (
        <div style={{
          marginTop: "16px",
          background: "white", borderRadius: "16px",
          border: "1px solid #e2ddd5", borderLeft: "3px solid #7c3aed",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "14px 20px", borderBottom: "1px solid #f0ede6",
            fontSize: "13px", fontWeight: "700", color: "#0f0e17",
            background: "linear-gradient(to right, #faf9f6, white)",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
            Edit Profil
          </div>

          <form onSubmit={handleSave} style={{ padding: isMobile ? "16px" : "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {error && (
              <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "13px", borderRadius: "10px", padding: "10px 14px" }}>
                {error}
              </div>
            )}

            {/* Nama */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>Nama</label>
              <div style={{ position: "relative" }}>
                <User size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b6860", pointerEvents: "none" }} />
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "#e84c2b")}
                  onBlur={e => (e.target.style.borderColor = "#e2ddd5")}
                />
              </div>
            </div>

            {/* Password lama */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>
                Password Lama{" "}
                <span style={{ fontWeight: "400", color: "#6b6860" }}>(isi jika ingin ganti password)</span>
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b6860", pointerEvents: "none" }} />
                <input type={showPass ? "text" : "password"} value={form.current_password}
                  onChange={e => setForm(f => ({ ...f, current_password: e.target.value }))}
                  placeholder="Password lama"
                  style={{ ...inputStyle, paddingRight: "40px" }}
                  onFocus={e => (e.target.style.borderColor = "#e84c2b")}
                  onBlur={e => (e.target.style.borderColor = "#e2ddd5")}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6b6860", display: "flex" }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Password baru + konfirmasi */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>Password Baru</label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b6860", pointerEvents: "none" }} />
                  <input type={showPass ? "text" : "password"} value={form.new_password}
                    onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))}
                    placeholder="Minimal 8 karakter"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#e84c2b")}
                    onBlur={e => (e.target.style.borderColor = "#e2ddd5")}
                  />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>Konfirmasi Password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b6860", pointerEvents: "none" }} />
                  <input type={showPass ? "text" : "password"} value={form.confirm_password}
                    onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))}
                    placeholder="Ulangi password baru"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = "#e84c2b")}
                    onBlur={e => (e.target.style.borderColor = "#e2ddd5")}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" disabled={saving} style={{
                padding: "10px 24px", borderRadius: "10px", border: "none",
                background: saving ? "#f5a07a" : "#e84c2b",
                color: "white", fontSize: "14px", fontWeight: "700",
                cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
              }}>
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
