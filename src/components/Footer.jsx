// src/components/Footer.jsx
import { Warehouse } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import useWindowWidth from "../hooks/useWindowWidth";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const width = useWindowWidth();
  const isMobile = width <= 480;
  const year = new Date().getFullYear();

  const links = [
    { label: "FAQ", path: "/faq" },
    { label: "Direktori Soal", path: "/browse" },
    { label: "Soal Populer", path: "/populer" },
    { label: "Changelog", path: "/changelog" },
  ];

  return (
    <footer style={{ borderTop: "1px solid #e2ddd5", background: "white" }}>
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: isMobile ? "24px 20px" : "32px 40px",
        }}
      >
        {isMobile ? (
          // Mobile layout — stack vertikal
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  background: "#e84c2b",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <Warehouse size={16} />
              </div>
              <span
                style={{
                  fontWeight: "600",
                  fontSize: "15px",
                  color: "#0f0e17",
                }}
              >
                Gudang Soal
              </span>
            </div>

            {/* Links — grid 2 kolom */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              {links.map((l) => (
                <button
                  key={l.path}
                  onClick={() => navigate(l.path)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontFamily: "inherit",
                    color: location.pathname === l.path ? "#e84c2b" : "#6b6860",
                    fontWeight: location.pathname === l.path ? "600" : "400",
                    textAlign: "left",
                    padding: 0,
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Copyright */}
            <span style={{ fontSize: "12px", color: "#b4b2a9" }}>
              © {year} Gudang Soal
            </span>
          </div>
        ) : (
          // Desktop layout — horizontal
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  background: "#e84c2b",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <Warehouse size={16} />
              </div>
              <span
                style={{
                  fontWeight: "600",
                  fontSize: "15px",
                  color: "#0f0e17",
                }}
              >
                Gudang Soal
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              {links.map((l) => (
                <button
                  key={l.path}
                  onClick={() => navigate(l.path)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontFamily: "inherit",
                    color: location.pathname === l.path ? "#e84c2b" : "#6b6860",
                    fontWeight: location.pathname === l.path ? "600" : "400",
                    transition: "color .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#e84c2b")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color =
                      location.pathname === l.path ? "#e84c2b" : "#6b6860")
                  }
                >
                  {l.label}
                </button>
              ))}
              <span style={{ fontSize: "13px", color: "#b4b2a9" }}>
                © {year} Gudang Soal
              </span>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
