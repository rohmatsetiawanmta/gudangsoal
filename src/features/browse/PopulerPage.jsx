// src/features/browse/PopulerPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Users, Target, Eye } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import api from "../../lib/api";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";

function DifficultyBadge({ level }) {
  const map = {
    1: { label: "Easy", color: "#1a8a6e", bg: "#e4f5f0" },
    2: { label: "Medium", color: "#854F0B", bg: "#faeeda" },
    3: { label: "Hard", color: "#e84c2b", bg: "#fff3f0" },
  };
  const d = map[level] || map[1];
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: "700",
        padding: "3px 8px",
        borderRadius: "6px",
        background: d.bg,
        color: d.color,
      }}
    >
      {d.label}
    </span>
  );
}

export default function PopulerPage() {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [soal, setSoal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  const fetchPopuler = (n) => {
    setLoading(true);
    api
      .get(`/browse/populer?limit=${n}`)
      .then((data) => setSoal(Array.isArray(data) ? data : []))
      .catch(() => setSoal([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPopuler(limit);
  }, [limit]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--gs-bg)" }}>
      <SEO
        title="Soal Populer"
        description="Soal matematika yang paling banyak dikerjakan di Gudang Soal."
        url="/populer"
      />
      <Navbar />

      <main
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: isMobile ? "24px 20px" : "40px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "16px" : "0",
            marginBottom: "32px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "4px",
              }}
            >
              <TrendingUp size={22} color="#e84c2b" />
              <h1
                style={{
                  fontSize: isMobile ? "22px" : "24px",
                  fontWeight: "800",
                  color: "var(--gs-text)",
                  letterSpacing: "-0.5px",
                }}
              >
                Soal Populer
              </h1>
            </div>
            <p style={{ fontSize: "14px", color: "var(--gs-text-muted)" }}>
              Soal yang paling banyak dikerjakan oleh pengguna.
            </p>
          </div>

          {/* Filter jumlah */}
          <div style={{ display: "flex", gap: "6px" }}>
            {[10, 20].map((n) => (
              <button
                key={n}
                onClick={() => setLimit(n)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "8px",
                  border: `1.5px solid ${limit === n ? "#e84c2b" : "var(--gs-border)"}`,
                  background: limit === n ? "#fff3f0" : "var(--gs-surface)",
                  color: limit === n ? "#e84c2b" : "var(--gs-text-muted)",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all .15s",
                }}
              >
                Top {n}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "88px",
                  borderRadius: "14px",
                  background: "var(--gs-border)",
                  opacity: 0.5,
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && soal.length === 0 && (
          <div
            style={{
              background: "var(--gs-surface)",
              borderRadius: "14px",
              border: "1px solid var(--gs-border)",
              padding: "48px",
              textAlign: "center",
              color: "var(--gs-text-muted)",
              fontSize: "14px",
            }}
          >
            Belum ada data soal populer.
          </div>
        )}

        {/* List */}
        {!loading && soal.length > 0 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {soal.map((s, i) => {
              const akurasi =
                s.total_dikerjakan > 0
                  ? Math.round((s.total_benar / s.total_dikerjakan) * 100)
                  : 0;
              return (
                <div
                  key={s.kode}
                  onClick={() => navigate(`/soal/${s.kode}`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: isMobile ? "12px" : "16px",
                    background: "var(--gs-surface)",
                    borderRadius: "14px",
                    border: "1px solid var(--gs-border)",
                    padding: isMobile ? "14px 16px" : "18px 20px",
                    cursor: "pointer",
                    transition: "all .15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#e84c2b";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(0,0,0,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--gs-border)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Rank */}
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "10px",
                      background: i < 3 ? "#e84c2b" : "var(--gs-hover)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "800",
                      fontSize: "14px",
                      color: i < 3 ? "white" : "var(--gs-text-muted)",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "var(--gs-text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginBottom: "5px",
                        fontWeight: "500",
                      }}
                    >
                      {s.body
                        .replace(/\$\$?[^$]+\$\$?/g, "[math]")
                        .replace(/[*_~`#]/g, "")
                        .slice(0, 80)}
                      ...
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontSize: "12px", color: "var(--gs-text-hint)" }}>
                        {s.mapel}
                        {!isMobile && ` — ${s.subtopik}`}
                      </span>
                      <DifficultyBadge level={s.difficulty} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "4px",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "var(--gs-text)",
                      }}
                    >
                      <Eye size={12} color="var(--gs-text-muted)" />
                      {parseInt(s.views || 0).toLocaleString()}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        color: "var(--gs-text-muted)",
                      }}
                    >
                      <Users size={11} />
                      {parseInt(s.total_dikerjakan).toLocaleString()}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        color: akurasi >= 50 ? "#1a8a6e" : "#e84c2b",
                        fontWeight: "600",
                      }}
                    >
                      <Target size={11} />
                      {akurasi}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
