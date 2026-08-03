import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

const GA_ID = "G-WGC1NZRJZP";
const STORAGE_KEY = "gs_cookie_consent";

function loadGA() {
  if (document.getElementById("ga-script")) return;
  const s = document.createElement("script");
  s.id = "ga-script";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  s.onload = () => {
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
  };
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (consent === "accepted") {
      loadGA();
    } else if (!consent) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    loadGA();
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        width: "calc(100% - 32px)",
        maxWidth: "560px",
        background: "#0f0e17",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,.1)",
        boxShadow: "0 8px 40px rgba(0,0,0,.4)",
        padding: "20px 20px 20px 20px",
        display: "flex",
        gap: "14px",
        alignItems: "flex-start",
        animation: "slideUp .3s ease",
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Icon */}
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: "rgba(232,76,43,.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: "1px",
        }}
      >
        <Cookie size={18} color="#e84c2b" />
      </div>

      {/* Teks */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: "700",
            color: "white",
            marginBottom: "4px",
          }}
        >
          Izinkan Cookie Analytics?
        </div>
        <div
          style={{
            fontSize: "12.5px",
            color: "rgba(255,255,255,.5)",
            lineHeight: "1.6",
            marginBottom: "14px",
          }}
        >
          Kami pakai Google Analytics untuk memahami bagaimana kamu menggunakan
          situs ini. Data bersifat anonim.{" "}
          <a
            href="/privacy"
            style={{ color: "rgba(255,255,255,.7)", textDecoration: "underline" }}
          >
            Kebijakan Privasi
          </a>
        </div>

        {/* Tombol */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={decline}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,.15)",
              background: "rgba(255,255,255,.07)",
              color: "rgba(255,255,255,.65)",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,.12)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,.07)";
              e.currentTarget.style.color = "rgba(255,255,255,.65)";
            }}
          >
            Tolak
          </button>
          <button
            onClick={accept}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "none",
              background: "#e84c2b",
              color: "white",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 4px 12px rgba(232,76,43,.35)",
              transition: "opacity .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Terima
          </button>
        </div>
      </div>

      {/* Close */}
      <button
        onClick={decline}
        style={{
          background: "none",
          border: "none",
          padding: "2px",
          cursor: "pointer",
          color: "rgba(255,255,255,.3)",
          flexShrink: 0,
          display: "flex",
          transition: "color .15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.7)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.3)")}
      >
        <X size={16} />
      </button>
    </div>
  );
}
