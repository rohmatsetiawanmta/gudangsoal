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
          color: "var(--gs-text-muted)",
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
            <ChevronRight size={14} color="var(--gs-text-hint)" />
            {isLast || !item.to ? (
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: isLast ? "600" : "500",
                  color: isLast ? "var(--gs-text)" : "var(--gs-text-muted)",
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
                  color: "var(--gs-text-muted)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.target.style.color = "var(--gs-text)")}
                onMouseLeave={(e) => (e.target.style.color = "var(--gs-text-muted)")}
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
