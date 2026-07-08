// src/features/auth/VerifyEmailPage.jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import Navbar from "../../components/Navbar";
import SEO from "../../components/SEO";
import { verifyEmail } from "./authApi";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token tidak ditemukan.");
      return;
    }
    verifyEmail(token)
      .then((res) => {
        setMessage(res.message || "Email berhasil dikonfirmasi!");
        setStatus("success");
      })
      .catch((err) => {
        setMessage(err.error || "Link tidak valid atau sudah kedaluwarsa.");
        setStatus("error");
      });
  }, [token]);

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f6" }}>
      <SEO title="Konfirmasi Email" description="Verifikasi email akun Gudang Soal." url="/verify-email" />
      <Navbar />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "32px 20px" }}>
        <div style={{ width: "100%", maxWidth: "380px", textAlign: "center" }}>
          {status === "loading" && (
            <>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                <Loader size={40} color="#e84c2b" style={{ animation: "spin 1s linear infinite" }} />
              </div>
              <p style={{ fontSize: "15px", color: "#6b6860" }}>Memverifikasi email kamu...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "#e4f5f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <CheckCircle size={30} color="#1a8a6e" />
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f0e17", marginBottom: "8px" }}>
                Email dikonfirmasi!
              </h2>
              <p style={{ fontSize: "15px", color: "#6b6860", lineHeight: "1.65", marginBottom: "28px" }}>
                {message}
              </p>
              <Link
                to="/login"
                style={{ display: "inline-block", background: "#e84c2b", color: "white", fontSize: "15px", fontWeight: "700", padding: "12px 28px", borderRadius: "12px", textDecoration: "none", boxShadow: "0 4px 14px rgba(232,76,43,.3)" }}
              >
                Masuk sekarang
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <XCircle size={30} color="#e84c2b" />
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f0e17", marginBottom: "8px" }}>
                Link tidak valid
              </h2>
              <p style={{ fontSize: "15px", color: "#6b6860", lineHeight: "1.65", marginBottom: "28px" }}>
                {message}
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link
                  to="/login"
                  style={{ display: "inline-block", background: "#e84c2b", color: "white", fontSize: "14px", fontWeight: "700", padding: "11px 24px", borderRadius: "12px", textDecoration: "none" }}
                >
                  Ke halaman login
                </Link>
                <Link
                  to="/register"
                  style={{ display: "inline-block", background: "white", border: "1px solid #e2ddd5", color: "#0f0e17", fontSize: "14px", fontWeight: "600", padding: "11px 24px", borderRadius: "12px", textDecoration: "none" }}
                >
                  Daftar ulang
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
