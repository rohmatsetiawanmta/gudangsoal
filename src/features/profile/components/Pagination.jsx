// src/features/profile/components/Pagination.jsx
import { ChevronLeft, ChevronRight } from "lucide-react";

const btnBase = {
  display: "flex", alignItems: "center", gap: "4px",
  padding: "7px 12px", borderRadius: "8px",
  border: "1px solid var(--gs-border)", background: "var(--gs-surface)",
  fontSize: "12px", fontWeight: "500", fontFamily: "inherit", cursor: "pointer",
};

export default function Pagination({ page, totalPages, onChange, isMobile }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
      <span style={{ fontSize: "12px", color: "var(--gs-text-muted)" }}>
        {isMobile ? `${page} / ${totalPages}` : `Halaman ${page} dari ${totalPages}`}
      </span>
      <div style={{ display: "flex", gap: "6px" }}>
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          style={{ ...btnBase, color: page === 1 ? "var(--gs-text-hint)" : "var(--gs-text)", cursor: page === 1 ? "not-allowed" : "pointer" }}
        >
          <ChevronLeft size={13} />
          {!isMobile && "Sebelumnya"}
        </button>
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          style={{ ...btnBase, color: page === totalPages ? "var(--gs-text-hint)" : "var(--gs-text)", cursor: page === totalPages ? "not-allowed" : "pointer" }}
        >
          {!isMobile && "Berikutnya"}
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
