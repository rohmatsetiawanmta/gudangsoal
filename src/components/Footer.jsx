// src/components/Footer.jsx
import { Warehouse } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import useWindowWidth from "../hooks/useWindowWidth";

export default function Footer() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const width     = useWindowWidth();
  const isMobile  = width <= 480;
  const year      = new Date().getFullYear();

  const links = [
    { label: "FAQ",            path: "/faq" },
    { label: "Direktori Soal", path: "/browse" },
    { label: "Soal Populer",   path: "/populer" },
    { label: "Changelog",      path: "/changelog" },
  ];

  return (
    <footer style={{ background: "#0f0e17", borderTop: "1px solid rgba(255,255,255,.06)" }}>
      <div style={{
        maxWidth: "1100px", margin: "0 auto",
        padding: isMobile ? "40px 20px 32px" : "52px 40px 36px",
      }}>
        {/* Top — brand + links */}
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: isMobile ? "28px" : "0",
          marginBottom: isMobile ? "28px" : "44px",
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div style={{
                width: "32px", height: "32px", background: "#e84c2b",
                borderRadius: "9px", display: "flex", alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(232,76,43,.3)",
              }}>
                <Warehouse size={17} color="white" />
              </div>
              <span style={{ fontWeight: "800", fontSize: "16px", color: "white", letterSpacing: "-0.3px" }}>
                Gudang Soal
              </span>
            </div>
            <p style={{
              fontSize: "13px", color: "rgba(255,255,255,.35)",
              margin: 0, maxWidth: "240px", lineHeight: "1.65",
            }}>
              Akses ke soal-soal berkualitas secara gratis.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: isMobile ? "20px" : "36px", flexWrap: "wrap" }}>
            {links.map((l) => {
              const active = location.pathname === l.path;
              return (
                <button key={l.path} onClick={() => navigate(l.path)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "13px", fontFamily: "inherit", padding: 0,
                  color: active ? "white" : "rgba(255,255,255,.4)",
                  fontWeight: active ? "600" : "400",
                  transition: "color .15s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.8)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = active ? "white" : "rgba(255,255,255,.4)")}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom strip */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,.07)",
          paddingTop: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,.18)" }}>
            © {year} Gudang Soal
          </span>
        </div>
      </div>
    </footer>
  );
}
