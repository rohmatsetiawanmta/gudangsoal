// src/features/browse/ComingSoonModal.jsx
import { Clock } from "lucide-react";

export default function ComingSoonModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: "16px" }}
      onClick={onClose}
    >
      <div style={{ background: "white", borderRadius: "18px", padding: "28px", maxWidth: "360px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#fef9ee", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
          <Clock size={22} color="#f5a623" />
        </div>
        <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f0e17", marginBottom: "8px" }}>Segera Hadir</h3>
        <p style={{ fontSize: "14px", color: "#6b6860", lineHeight: "1.6", marginBottom: "0" }}>
          <strong style={{ color: "#0f0e17" }}>{item.nama}</strong> sedang dalam persiapan dan akan segera tersedia. Pantau terus ya!
        </p>
        <button onClick={onClose}
          style={{ marginTop: "20px", width: "100%", padding: "11px", borderRadius: "10px", border: "none", background: "#f5a623", color: "white", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>
          Oke, nanti coba lagi
        </button>
      </div>
    </div>
  );
}
