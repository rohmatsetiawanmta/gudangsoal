// src/components/Breadcrumb.jsx
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        flexWrap: "wrap",
      }}
    >
      {/* Home */}
      <Link
        to="/home"
        style={{
          display: "flex",
          alignItems: "center",
          color: "#6b6860",
          textDecoration: "none",
          padding: "4px",
        }}
      >
        <Home size={14} />
      </Link>

      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            <ChevronRight size={14} color="#b4b2a9" />
            {isLast || !item.to ? (
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: isLast ? "600" : "500",
                  color: isLast ? "#0f0e17" : "#6b6860",
                }}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                state={item.state}
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#6b6860",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#0f0e17")}
                onMouseLeave={(e) => (e.target.style.color = "#6b6860")}
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
