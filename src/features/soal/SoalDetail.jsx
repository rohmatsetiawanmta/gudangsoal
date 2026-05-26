// src/features/soal/SoalDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import MathRenderer from "../../components/MathRenderer";
import Breadcrumb from "../../components/Breadcrumb";
import { getSoalDetail } from "./soalApi";

function DifficultyDots({ level = 1 }) {
  return (
    <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
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

export default function SoalDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const jenjangNama = state?.jenjangNama || "";
  const jenjangSlug = state?.jenjangSlug || "";
  const subjenjangNama = state?.subjenjangNama || "";
  const subjenjangSlug = state?.subjenjangSlug || "";
  const mapelNama = state?.mapelNama || "";
  const mapelSlug = state?.mapelSlug || "";
  const topikNama = state?.topikNama || "";
  const topikSlug = state?.topikSlug || "";
  const subtopikNama = state?.subtopikNama || "";
  const subtopikSlug = state?.subtopikSlug || "";

  const [soal, setSoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setChosen(null);
    setSubmitted(false);
    getSoalDetail(id)
      .then((data) => setSoal(data))
      .catch(() => setError("Gagal memuat soal"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = () => {
    if (!chosen) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setChosen(null);
    setSubmitted(false);
  };

  const isCorrect = chosen === soal?.answer;

  const getOptStyle = (label) => {
    if (!submitted)
      return {
        border: chosen === label ? "2px solid #e84c2b" : "1px solid #e2ddd5",
        background: chosen === label ? "#fff3f0" : "white",
      };
    if (label === soal.answer)
      return { border: "2px solid #1a8a6e", background: "#e4f5f0" };
    if (label === chosen && !isCorrect)
      return { border: "2px solid #e84c2b", background: "#fff3f0" };
    return { border: "1px solid #e2ddd5", background: "white" };
  };

  const getOptLabelColor = (label) => {
    if (!submitted) return chosen === label ? "#e84c2b" : "#6b6860";
    if (label === soal.answer) return "#1a8a6e";
    if (label === chosen && !isCorrect) return "#e84c2b";
    return "#6b6860";
  };

  const backUrl = `/browse/${jenjangSlug}/${subjenjangSlug}/${mapelSlug}/${topikSlug}/${subtopikSlug}`;

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f6" }}>
      {/* Navbar */}
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

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px" }}>
        {/* Breadcrumb */}
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
              { label: subtopikNama, to: backUrl, state },
              { label: `Soal #${id}` },
            ]}
          />
        </div>

        {loading && (
          <div style={{ display: "flex", gap: "24px" }}>
            {[1, 2].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: "400px",
                  borderRadius: "14px",
                  background: "#e2ddd5",
                  opacity: 0.5,
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </div>
        )}

        {error && (
          <div
            style={{
              background: "#fff3f0",
              border: "1px solid #fca5a5",
              color: "#b91c1c",
              fontSize: "14px",
              borderRadius: "12px",
              padding: "12px 16px",
            }}
          >
            {error}
          </div>
        )}

        {!loading && soal && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              alignItems: "start",
            }}
          >
            {/* Kiri — Soal */}
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                border: "1px solid #e2ddd5",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              {/* Meta */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "#6b6860",
                  }}
                >
                  {mapelNama} — {topikNama}
                </span>
                <DifficultyDots level={soal.difficulty} />
              </div>

              {/* Body soal */}
              <div
                style={{
                  fontSize: "17px",
                  lineHeight: "1.75",
                  color: "#0f0e17",
                  fontWeight: "500",
                }}
              >
                <MathRenderer text={soal.body} />
              </div>

              {/* Pilihan jawaban */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {soal.options?.map((opt) => (
                  <div
                    key={opt.label}
                    onClick={() => !submitted && setChosen(opt.label)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "13px 16px",
                      borderRadius: "12px",
                      cursor: submitted ? "default" : "pointer",
                      transition: "all .15s",
                      ...getOptStyle(opt.label),
                    }}
                  >
                    <span
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        border: "2px solid currentColor",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: "700",
                        flexShrink: 0,
                        color: getOptLabelColor(opt.label),
                      }}
                    >
                      {opt.label}
                    </span>
                    <span
                      style={{ fontSize: "15px", color: "#0f0e17", flex: 1 }}
                    >
                      <MathRenderer text={opt.text} />
                    </span>
                    {submitted && opt.label === soal.answer && (
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#1a8a6e",
                          flexShrink: 0,
                        }}
                      >
                        ✓ Benar
                      </span>
                    )}
                    {submitted &&
                      opt.label === chosen &&
                      !isCorrect &&
                      opt.label !== soal.answer && (
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#e84c2b",
                            flexShrink: 0,
                          }}
                        >
                          ✗ Salah
                        </span>
                      )}
                  </div>
                ))}
              </div>

              {/* Tombol submit / reset */}
              <div style={{ display: "flex", gap: "10px" }}>
                {!submitted ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!chosen}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "12px",
                      background: chosen ? "#e84c2b" : "#e2ddd5",
                      color: chosen ? "white" : "#b4b2a9",
                      border: "none",
                      fontWeight: "700",
                      fontSize: "15px",
                      cursor: chosen ? "pointer" : "not-allowed",
                      fontFamily: "inherit",
                      transition: "all .15s",
                    }}
                  >
                    Submit Jawaban
                  </button>
                ) : (
                  <button
                    onClick={handleReset}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "12px",
                      background: "white",
                      color: "#0f0e17",
                      border: "1px solid #e2ddd5",
                      fontWeight: "600",
                      fontSize: "15px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Coba Lagi
                  </button>
                )}
              </div>

              {/* Navigasi soal */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "8px",
                  borderTop: "1px solid #f2efe8",
                }}
              >
                <button
                  onClick={() =>
                    navigate(`/soal/${parseInt(id) - 1}`, { state })
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#6b6860",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    padding: 0,
                  }}
                >
                  <ChevronLeft size={16} /> Soal sebelumnya
                </button>
                <button
                  onClick={() =>
                    navigate(`/soal/${parseInt(id) + 1}`, { state })
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#6b6860",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    padding: 0,
                  }}
                >
                  Soal berikutnya <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Kanan — Pembahasan */}
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                border: "1px solid #e2ddd5",
                padding: "32px",
                position: "sticky",
                top: "24px",
              }}
            >
              {!submitted ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Lock
                    size={36}
                    color="#b4b2a9"
                    style={{ marginBottom: "16px" }}
                  />
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#0f0e17",
                      marginBottom: "8px",
                    }}
                  >
                    Pembahasan tersembunyi
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6b6860",
                      lineHeight: "1.6",
                    }}
                  >
                    Pilih jawaban dan klik Submit untuk melihat pembahasan
                    lengkap.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  {/* Result banner */}
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "12px",
                      background: isCorrect ? "#e4f5f0" : "#fff3f0",
                      border: `1px solid ${isCorrect ? "#9FE1CB" : "#fca5a5"}`,
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    {isCorrect ? (
                      <CheckCircle
                        size={24}
                        color="#1a8a6e"
                        style={{ flexShrink: 0 }}
                      />
                    ) : (
                      <XCircle
                        size={24}
                        color="#e84c2b"
                        style={{ flexShrink: 0 }}
                      />
                    )}
                    <div>
                      <div
                        style={{
                          fontWeight: "700",
                          fontSize: "15px",
                          color: isCorrect ? "#0F6E56" : "#b91c1c",
                        }}
                      >
                        {isCorrect ? "Jawaban benar!" : "Jawaban kurang tepat"}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: isCorrect ? "#1a8a6e" : "#e84c2b",
                          marginTop: "2px",
                        }}
                      >
                        Jawaban yang benar: <strong>{soal.answer}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Pembahasan */}
                  {soal.explanation ? (
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          letterSpacing: ".08em",
                          textTransform: "uppercase",
                          color: "#6b6860",
                          marginBottom: "12px",
                        }}
                      >
                        Pembahasan
                      </div>
                      <div
                        style={{
                          fontSize: "15px",
                          lineHeight: "1.75",
                          color: "#0f0e17",
                        }}
                      >
                        <MathRenderer text={soal.explanation} />
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6b6860",
                        fontStyle: "italic",
                      }}
                    >
                      Pembahasan belum tersedia untuk soal ini.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
        @media (max-width: 768px) {
          main > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
