// src/features/profile/components/TabRiwayat.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import { getRiwayat } from "../profileApi";
import Pagination from "./Pagination";

const FILTERS = [
  { value: "semua", label: "Semua" },
  { value: "benar", label: "Benar" },
  { value: "salah", label: "Salah" },
];

export default function TabRiwayat({ isMobile }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("semua");
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    getRiwayat(filter, page)
      .then((d) => {
        setData(Array.isArray(d?.data) ? d.data : []);
        setTotal(d?.total || 0);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [filter, page]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Filter */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: `1.5px solid ${
                filter === f.value ? "#e84c2b" : "var(--gs-border)"
              }`,
              background: filter === f.value ? "#fff3f0" : "var(--gs-surface)",
              color: filter === f.value ? "#e84c2b" : "var(--gs-text-muted)",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .15s",
            }}
          >
            {f.label}
          </button>
        ))}
        {!loading && (
          <span
            style={{ fontSize: "12px", color: "var(--gs-text-hint)", marginLeft: "4px" }}
          >
            {total} soal
          </span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: "48px",
                borderRadius: "10px",
                background: "var(--gs-border)",
                opacity: 0.5,
                animation: "pulse 1.5s infinite",
              }}
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && data.length === 0 && (
        <div
          style={{
            background: "var(--gs-surface)",
            borderRadius: "12px",
            border: "1px solid var(--gs-border)",
            padding: "28px",
            textAlign: "center",
            color: "var(--gs-text-muted)",
            fontSize: "14px",
          }}
        >
          {filter === "semua"
            ? "Belum ada soal yang dikerjakan."
            : filter === "benar"
            ? "Belum ada soal yang dijawab benar."
            : "Belum ada soal yang dijawab salah."}
        </div>
      )}

      {/* List */}
      {!loading && data.length > 0 && (
        <div
          style={{
            background: "var(--gs-surface)",
            borderRadius: "14px",
            border: "1px solid var(--gs-border)",
            overflow: "hidden",
          }}
        >
          {data.map((r, i) => (
            <div
              key={r.kode}
              onClick={() => navigate(`/soal/${r.kode}`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 16px",
                borderBottom:
                  i < data.length - 1 ? "1px solid var(--gs-divider)" : "none",
                cursor: "pointer",
                transition: "background .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--gs-surface-subtle)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--gs-surface)")}
            >
              {/* Icon benar/salah */}
              {r.is_correct == 1 ? (
                <CheckCircle
                  size={16}
                  color="#1a8a6e"
                  style={{ flexShrink: 0 }}
                />
              ) : (
                <XCircle size={16} color="#e84c2b" style={{ flexShrink: 0 }} />
              )}

              {/* Teks soal + mapel */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--gs-text)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.body
                    .replace(/\$\$?[^$]+\$\$?/g, "[math]")
                    .replace(/[*_~`#]/g, "")}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--gs-text-hint)",
                    marginTop: "1px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isMobile
                    ? `${r.mapel} — ${r.subtopik}`
                    : `${r.jenjang} — ${r.mapel} — ${r.subtopik}`}
                </div>
              </div>

              {/* Kanan: attempt badge + tanggal */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexShrink: 0,
                }}
              >
                {parseInt(r.total_attempt) > 1 && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "2px 7px",
                      borderRadius: "6px",
                      background: "var(--gs-hover)",
                      color: "var(--gs-text-muted)",
                    }}
                  >
                    {r.total_attempt}×
                  </span>
                )}
                {!isMobile && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "var(--gs-text-hint)",
                      fontFamily: "monospace",
                    }}
                  >
                    {r.kode}
                  </span>
                )}
                <span style={{ fontSize: "11px", color: "var(--gs-text-hint)" }}>
                  {new Date(r.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} isMobile={isMobile} />
      )}
    </div>
  );
}
