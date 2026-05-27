// src/features/browse/BrowseSoal.jsx
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Breadcrumb from "../../components/Breadcrumb";
import MathRenderer from "../../components/MathRenderer";
import { getSoal } from "./browseApi";
import Navbar from "../../components/Navbar";

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
    <div style={{ minHeight: "100vh", background: "#faf9f6" }}>
      <Navbar />

      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "40px" }}>
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

        <div
          style={{
            marginBottom: "28px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "800",
                color: "#0f0e17",
                letterSpacing: "-0.5px",
                marginBottom: "6px",
              }}
            >
              {subtopikNama}
            </h1>
            <p style={{ fontSize: "14px", color: "#6b6860" }}>
              {jenjangNama} — {subjenjangNama} — {mapelNama} — {topikNama}
            </p>
          </div>
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
                  gap: "14px",
                  background: "white",
                  borderRadius: "14px",
                  padding: "16px 20px",
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
                    width: "30px",
                    height: "30px",
                    borderRadius: "8px",
                    background: "#f2efe8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#6b6860",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>

                {/* Kode */}
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

                {/* Body soal — strip markdown & latex untuk preview */}
                <div
                  style={{
                    flex: 1,
                    fontSize: "14px",
                    color: "#0f0e17",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.body
                    .replace(/\$\$?[^$]+\$\$?/g, "[math]")
                    .replace(/[*_~`#]/g, "")}
                </div>

                {/* Difficulty + arrow */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
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
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
