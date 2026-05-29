// src/components/Footer.jsx
import { Warehouse } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const year = new Date().getFullYear();

  const links = [
    { label: "FAQ", path: "/faq" },
    { label: "Direktori Soal", path: "/browse" },
    { label: "Soal Populer", path: "/populer" },
  ];

  return (
    <footer style={{ borderTop: "1px solid #e2ddd5", background: "white" }}>
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "32px 40px",
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
              fontWeight: "800",
              fontSize: "11px",
            }}
          >
            <Warehouse size={18} />
          </div>
          <span
            style={{ fontWeight: "600", fontSize: "15px", color: "#0f0e17" }}
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
              onMouseEnter={(e) => (e.currentTarget.style.color = "#e84c2b")}
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
    </footer>
  );
}
