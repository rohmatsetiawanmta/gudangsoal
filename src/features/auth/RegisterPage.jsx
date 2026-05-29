// src/features/auth/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useAuthStore } from "./authStore";
import { register } from "./authApi";
import Navbar from "../../components/Navbar";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";

function InputField({
  label,
  icon: Icon,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required,
  rightElement,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "14px", fontWeight: "500", color: "#0f0e17" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <Icon
          size={16}
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#6b6860",
            pointerEvents: "none",
          }}
        />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={{
            width: "100%",
            paddingLeft: "40px",
            paddingRight: rightElement ? "40px" : "16px",
            paddingTop: "10px",
            paddingBottom: "10px",
            borderRadius: "12px",
            border: "1px solid #e2ddd5",
            fontSize: "14px",
            outline: "none",
            background: "white",
            color: "#0f0e17",
            fontFamily: "inherit",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
          onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
        />
        {rightElement && (
          <div
            style={{
              position: "absolute",
              right: "14px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak sama");
      return;
    }
    if (form.password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    setLoading(true);
    try {
      const res = await register(form.name, form.email, form.password);
      setAuth(res.user, res.token);
      navigate("/home");
    } catch (err) {
      setError(err.error || "Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      style={{
        color: "#6b6860",
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
      }}
    >
      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <div>
      <SEO
        title="Daftar"
        description="Buat akun Gudang Soal gratis dan mulai latihan soal matematika dengan sistem XP dan tracking progress."
        url="/register"
      />
      <Navbar />

      <div style={{ minHeight: "90vh", display: "flex" }}>
        {/* Kiri — Branding (desktop only) */}
        <div
          style={{
            display: "none",
            width: "50%",
            background: "#0f0e17",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px",
          }}
          className="lg-left"
        >
          <div />
          <div>
            <h1
              style={{
                color: "white",
                fontSize: "40px",
                fontWeight: "800",
                lineHeight: "1.15",
                marginBottom: "16px",
              }}
            >
              Mulai belajar hari ini,
              <br />
              gratis selamanya.
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "17px",
                lineHeight: "1.65",
              }}
            >
              Daftar dalam 30 detik. Tidak perlu kartu kredit.
            </p>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {[
              { step: "01", text: "Buat akun gratis" },
              { step: "02", text: "Pilih jenjang & topik" },
              { step: "03", text: "Mulai latihan & kumpulkan XP" },
            ].map(({ step, text }) => (
              <div
                key={step}
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "12px",
                    fontWeight: "700",
                    flexShrink: 0,
                  }}
                >
                  {step}
                </div>
                <span
                  style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px" }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Kanan — Form */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobile ? "32px 20px" : "48px 32px",
            background: "#faf9f6",
          }}
        >
          <div style={{ width: "100%", maxWidth: "380px" }}>
            <div style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "26px",
                  fontWeight: "800",
                  color: "#0f0e17",
                  marginBottom: "6px",
                }}
              >
                Daftar
              </h2>
              <p style={{ fontSize: "14px", color: "#6b6860" }}>
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#e84c2b",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  Masuk di sini
                </Link>
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: "#fff3f0",
                  border: "1px solid #fca5a5",
                  color: "#b91c1c",
                  fontSize: "14px",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  marginBottom: "20px",
                }}
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <InputField
                label="Nama lengkap"
                icon={User}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nama kamu"
                required
              />
              <InputField
                label="Email"
                icon={Mail}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="kamu@email.com"
                required
              />
              <InputField
                label="Password"
                icon={Lock}
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimal 8 karakter"
                required
                rightElement={togglePassword}
              />
              <InputField
                label="Konfirmasi password"
                icon={Lock}
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Ulangi password"
                required
              />

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: "8px",
                  width: "100%",
                  background: loading ? "#f5a07a" : "#e84c2b",
                  color: "white",
                  fontWeight: "600",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontFamily: "inherit",
                  transition: "background .2s",
                }}
              >
                {loading ? (
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                ) : (
                  <>
                    <UserPlus size={16} /> Buat Akun
                  </>
                )}
              </button>
            </form>

            {/* Browse tanpa login */}
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button
                onClick={() => navigate("/browse")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: "#6b6860",
                  fontFamily: "inherit",
                  textDecoration: "underline",
                }}
              >
                Lanjut tanpa akun
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) { .lg-left { display: flex !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #b4b2a9; }
      `}</style>
    </div>
  );
}
