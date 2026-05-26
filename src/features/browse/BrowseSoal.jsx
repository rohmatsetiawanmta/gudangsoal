// src/features/browse/BrowseSoal.jsx
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import Breadcrumb from "../../components/Breadcrumb";
import MathRenderer from "../../components/MathRenderer";
import { getSoal } from "./browseApi";

function DifficultyDots({ level = 1 }) {
  return (
    <div style={{ display: "flex", gap: "3px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: i < level ? "#e84c2b" : "#e2ddd5",
          }}
        />
      ))}
    </div>
  );
}

function SoalCard({ soal, index }) {
  const [expanded, setExpanded] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handlePilih = (label) => {
    if (showAnswer) return;
    setChosen(label);
    setShowAnswer(true);
  };

  const getOptStyle = (label) => {
    if (!showAnswer)
      return {
        border: chosen === label ? "2px solid #e84c2b" : "1px solid #e2ddd5",
        background: "white",
      };
    if (label === soal.answer)
      return { border: "2px solid #1a8a6e", background: "#e4f5f0" };
    if (label === chosen && chosen !== soal.answer)
      return { border: "2px solid #e84c2b", background: "#fff3f0" };
    return { border: "1px solid #e2ddd5", background: "white" };
  };

  const getOptTextColor = (label) => {
    if (!showAnswer) return "#6b6860";
    if (label === soal.answer) return "#1a8a6e";
    if (label === chosen && chosen !== soal.answer) return "#e84c2b";
    return "#6b6860";
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "14px",
        border: "1px solid #e2ddd5",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "18px 20px",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
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
          {index + 1}
        </div>
        <div
          style={{
            flex: 1,
            fontSize: "14px",
            fontWeight: "500",
            color: "#0f0e17",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: expanded ? "normal" : "nowrap",
          }}
        >
          <MathRenderer text={soal.body} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <DifficultyDots level={soal.difficulty} />
          {expanded ? (
            <ChevronUp size={16} color="#6b6860" />
          ) : (
            <ChevronDown size={16} color="#6b6860" />
          )}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop: "1px solid #f2efe8", padding: "20px" }}>
          {/* Soal full */}
          <p
            style={{
              fontSize: "15px",
              lineHeight: "1.7",
              color: "#0f0e17",
              marginBottom: "20px",
            }}
          >
            <MathRenderer text={soal.body} />
          </p>

          {/* Pilihan */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            {soal.options?.map((opt) => (
              <div
                key={opt.label}
                onClick={() => handlePilih(opt.label)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  cursor: showAnswer ? "default" : "pointer",
                  transition: "all .15s",
                  ...getOptStyle(opt.label),
                }}
              >
                <span
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "7px",
                    border: "2px solid currentColor",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "700",
                    flexShrink: 0,
                    color: getOptTextColor(opt.label),
                  }}
                >
                  {opt.label}
                </span>
                <span style={{ fontSize: "14px", color: "#0f0e17", flex: 1 }}>
                  <MathRenderer text={opt.text} />
                </span>
                {showAnswer && opt.label === soal.answer && (
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#1a8a6e",
                    }}
                  >
                    ✓ Benar
                  </span>
                )}
                {showAnswer &&
                  opt.label === chosen &&
                  chosen !== soal.answer && (
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#e84c2b",
                      }}
                    >
                      ✗ Salah
                    </span>
                  )}
              </div>
            ))}
          </div>

          {/* Reset */}
          {showAnswer && (
            <button
              onClick={() => {
                setChosen(null);
                setShowAnswer(false);
              }}
              style={{
                fontSize: "13px",
                color: "#6b6860",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Coba lagi
            </button>
          )}

          {/* Pembahasan */}
          {showAnswer && soal.explanation && (
            <div
              style={{
                marginTop: "16px",
                background: "#faeeda",
                borderRadius: "10px",
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  color: "#854F0B",
                  marginBottom: "6px",
                }}
              >
                Pembahasan
              </div>
              <div
                style={{
                  fontSize: "14px",
                  lineHeight: "1.65",
                  color: "#0f0e17",
                }}
              >
                <MathRenderer text={soal.explanation} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BrowseSoal() {
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
      <nav
        style={{
          background: "white",
          borderBottom: "1px solid #e2ddd5",
          padding: "0 40px",
          height: "64px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              background: "#e84c2b",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "800",
              fontSize: "13px",
            }}
          >
            GS
          </div>
          <span
            style={{ fontWeight: "700", fontSize: "17px", color: "#0f0e17" }}
          >
            Gudang Soal
          </span>
        </div>
      </nav>

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
              <SoalCard key={s.id} soal={s} index={i} />
            ))}
          </div>
        )}
      </main>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
