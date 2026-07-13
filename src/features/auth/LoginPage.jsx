// src/features/auth/LoginPage.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, Eye, EyeOff, Send } from "lucide-react";
import { useAuthStore } from "./authStore";
import { login, resendVerification } from "./authApi";
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
      <label style={{ fontSize: "14px", fontWeight: "500", color: "var(--gs-text)" }}>
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
            color: "var(--gs-text-muted)",
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
            background: "var(--gs-input-bg)",
            color: "var(--gs-text)",
            fontFamily: "inherit",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
          onBlur={(e) => (e.target.style.borderColor = "var(--gs-border)")}
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

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownRef.current = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(cooldownRef.current);
  }, [cooldown]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setUnverifiedEmail("");
    setResendMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUnverifiedEmail("");
    setResendMsg("");
    try {
      const res = await login(form.email, form.password);
      setAuth(res.user, res.token);
      navigate("/home");
    } catch (err) {
      if (err.unverified) {
        setUnverifiedEmail(err.email || form.email);
      } else {
        setError(err.error || "Terjadi kesalahan, coba lagi");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail || resending || cooldown > 0) return;
    setResending(true);
    setResendMsg("");
    try {
      await resendVerification(unverifiedEmail);
      setResendMsg("Email konfirmasi telah dikirim ulang. Cek inbox kamu.");
      setCooldown(60);
    } catch {
      setResendMsg("Gagal mengirim ulang, coba beberapa saat lagi.");
    } finally {
      setResending(false);
    }
  };

  const togglePassword = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      style={{
        color: "var(--gs-text-muted)",
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
        title="Masuk"
        description="Masuk ke akun Gudang Soal untuk melanjutkan belajar, melihat progress, dan mendapatkan XP."
        url="/login"
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
              Satu gudang untuk
              <br />
              semua soal matematika.
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "17px",
                lineHeight: "1.65",
              }}
            >
              Latihan terstruktur dari SD hingga persiapan UTBK, CPNS, dan OSN.
            </p>
          </div>
          <div style={{ display: "flex", gap: "40px" }}>
            {[
              { num: "10K+", label: "Bank Soal" },
              { num: "6", label: "Jenis Ujian" },
              { num: "Gratis", label: "Selamanya" },
            ].map(({ num, label }) => (
              <div key={label}>
                <div
                  style={{
                    color: "white",
                    fontSize: "24px",
                    fontWeight: "800",
                  }}
                >
                  {num}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "13px",
                    marginTop: "4px",
                  }}
                >
                  {label}
                </div>
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
            background: "var(--gs-bg)",
          }}
        >
          <div style={{ width: "100%", maxWidth: "380px" }}>
            <div style={{ marginBottom: "32px" }}>
              <h2
                style={{
                  fontSize: "26px",
                  fontWeight: "800",
                  color: "var(--gs-text)",
                  marginBottom: "6px",
                }}
              >
                Masuk
              </h2>
              <p style={{ fontSize: "14px", color: "var(--gs-text-muted)" }}>
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  style={{
                    color: "#e84c2b",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  Daftar gratis
                </Link>
              </p>
            </div>

            {error && (
              <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "14px", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px" }}>
                {error}
              </div>
            )}

            {unverifiedEmail && (
              <div style={{ background: "#fef9ee", border: "1px solid #fcd34d", borderRadius: "12px", padding: "14px 16px", marginBottom: "20px" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#854f0b", marginBottom: "6px" }}>
                  Email belum diverifikasi
                </div>
                <div style={{ fontSize: "13px", color: "#92400e", lineHeight: "1.5", marginBottom: "10px" }}>
                  Cek inbox <strong>{unverifiedEmail}</strong> dan klik link konfirmasi.
                </div>
                {resendMsg && (
                  <div style={{ fontSize: "13px", color: "#1a8a6e", fontWeight: "500", marginBottom: "8px" }}>{resendMsg}</div>
                )}
                <button
                  onClick={handleResend}
                  disabled={resending || cooldown > 0}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "8px", border: "1px solid #fcd34d", background: "var(--gs-input-bg)", fontSize: "13px", fontWeight: "600", cursor: (resending || cooldown > 0) ? "not-allowed" : "pointer", fontFamily: "inherit", color: cooldown > 0 ? "var(--gs-text-hint)" : "#854f0b", opacity: cooldown > 0 ? 0.7 : 1 }}
                >
                  <Send size={12} />
                  {resending ? "Mengirim..." : cooldown > 0 ? `Kirim ulang dalam ${cooldown}s` : "Kirim ulang email"}
                </button>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
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
                placeholder="••••••••"
                required
                rightElement={togglePassword}
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
                    <LogIn size={16} /> Masuk
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
                  color: "var(--gs-text-muted)",
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
