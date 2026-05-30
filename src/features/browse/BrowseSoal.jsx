// src/features/browse/BrowseSoal.jsx
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Breadcrumb from "../../components/Breadcrumb";
import { getSoal } from "./browseApi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
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
        flexShrink: 0,
      }}
    >
      {d.label}
    </span>
  );
}

export default function BrowseSoal() {
  const navigate = useNavigate();
  const { jenjangSlug, subjenjangSlug, mapelSlug, topikSlug, subtopikSlug } =
    useParams();
  const { state } = useLocation();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const jenjangNama = state?.jenjangNama || jenjangSlug;
  const subjenjangNama = state?.subjenjangNama || subjenjangSlug;
  const mapelNama = state?.mapelNama || mapelSlug;
  const topikNama = state?.topikNama || topikSlug;
  const subtopikNama = state?.subtopikNama || subtopikSlug;

  const [soal, setSoal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSoal(jenjangSlug, subjenjangSlug, mapelSlug, topikSlug, subtopikSlug)
      .then((data) => setSoal(data))
      .catch(() => setError("Gagal memuat soal"))
      .finally(() => setLoading(false));
  }, [jenjangSlug, subjenjangSlug, mapelSlug, topikSlug, subtopikSlug]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#faf9f6",
      }}
    >
      {!loading && (
        <SEO
          title={`${subtopikNama} — ${mapelNama}`}
          description={`${soal.length} soal latihan ${subtopikNama} — ${mapelNama} jenjang ${jenjangNama}. Lengkap dengan pembahasan detail.`}
          url={`/browse/${jenjangSlug}/${subjenjangSlug}/${mapelSlug}/${topikSlug}/${subtopikSlug}`}
        />
      )}
      <Navbar />

      <main
        style={{
          flex: 1,
          maxWidth: "720px",
          width: "100%",
          margin: "0 auto",
          padding: isMobile ? "24px 16px" : "40px",
        }}
      >
        <div style={{ marginBottom: "32px" }}>
          <Breadcrumb
            items={[
              { label: "Direktori Soal", to: "/browse" },
              {
                label: jenjangNama,
                to: `/browse/${jenjangSlug}`,
                state: { jenjangNama, jenjangSlug },
              },
              {
                label: subjenjangNama,
                to: `/browse/${jenjangSlug}/${subjenjangSlug}`,
                state: {
                  jenjangNama,
                  jenjangSlug,
                  subjenjangNama,
                  subjenjangSlug,
                },
              },
              {
                label: mapelNama,
                to: `/browse/${jenjangSlug}/${subjenjangSlug}/${mapelSlug}`,
                state: {
                  jenjangNama,
                  jenjangSlug,
                  subjenjangNama,
                  subjenjangSlug,
                  mapelNama,
                  mapelSlug,
                },
              },
              {
                label: topikNama,
                to: `/browse/${jenjangSlug}/${subjenjangSlug}/${mapelSlug}/${topikSlug}`,
                state: {
                  jenjangNama,
                  jenjangSlug,
                  subjenjangNama,
                  subjenjangSlug,
                  mapelNama,
                  mapelSlug,
                  topikNama,
                  topikSlug,
                },
              },
              { label: subtopikNama },
            ]}
          />
        </div>

        {/* Header */}
        <div
          style={{
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <h1
            style={{
              fontSize: isMobile ? "20px" : "26px",
              fontWeight: "800",
              color: "#0f0e17",
              letterSpacing: "-0.5px",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: isMobile ? "nowrap" : "normal",
            }}
          >
            {subtopikNama}
          </h1>
          {!loading && (
            <span
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#6b6860",
                flexShrink: 0,
              }}
            >
              {soal.length} soal
            </span>
          )}
        </div>

        {error && (
          <div
            style={{
              background: "#fff3f0",
              border: "1px solid #fca5a5",
              color: "#b91c1c",
              fontSize: "14px",
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {loading && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "64px",
                  borderRadius: "14px",
                  background: "#e2ddd5",
                  opacity: 0.5,
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </div>
        )}

        {!loading && !error && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {soal.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px",
                  color: "#6b6860",
                  fontSize: "14px",
                }}
              >
                Belum ada soal untuk {subtopikNama}.
              </div>
            )}
            {soal.map((s, i) => (
              <div
                key={s.id}
                onClick={() =>
                  navigate(`/soal/${s.kode}`, {
                    state: { ...state, subtopikNama },
                  })
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? "10px" : "14px",
                  background: "white",
                  borderRadius: "14px",
                  padding: isMobile ? "12px 14px" : "16px 20px",
                  border: "1px solid #e2ddd5",
                  cursor: "pointer",
                  transition: "transform .15s, box-shadow .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 16px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Nomor */}
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "#f2efe8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#6b6860",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>

                {/* Kode — disembunyikan di mobile */}
                {!isMobile && (
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#b4b2a9",
                      fontFamily: "monospace",
                      letterSpacing: ".05em",
                      flexShrink: 0,
                    }}
                  >
                    {s.kode}
                  </div>
                )}

                {/* Body soal */}
                <div
                  style={{
                    flex: 1,
                    fontSize: "14px",
                    color: "#0f0e17",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    minWidth: 0,
                  }}
                >
                  {s.body
                    .replace(/\$\$?[^$]+\$\$?/g, "[math]")
                    .replace(/[*_~`#]/g, "")}
                </div>

                {/* Badge + arrow */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: isMobile ? "6px" : "10px",
                    flexShrink: 0,
                  }}
                >
                  <DifficultyBadge level={s.difficulty} />
                  <ChevronRight size={16} color="#b4b2a9" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
