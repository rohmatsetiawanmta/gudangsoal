// src/features/soal/SoalDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Lock, CheckCircle, XCircle } from "lucide-react";
import MathRenderer from "../../components/MathRenderer";
import Breadcrumb from "../../components/Breadcrumb";
import Navbar from "../../components/Navbar";
import { getSoalDetail, getSoalStatus } from "./soalApi";
import { saveSession } from "../profile/profileApi";
import { useAuthStore } from "../auth/authStore";

const getYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

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

export default function SoalDetail() {
  const { kode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [soal, setSoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chosen, setChosen] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyCorrect, setAlreadyCorrect] = useState(false);

  const [breadcrumb, setBreadcrumb] = useState({
    jenjangNama: state?.jenjangNama || "",
    jenjangSlug: state?.jenjangSlug || "",
    subjenjangNama: state?.subjenjangNama || "",
    subjenjangSlug: state?.subjenjangSlug || "",
    mapelNama: state?.mapelNama || "",
    mapelSlug: state?.mapelSlug || "",
    topikNama: state?.topikNama || "",
    topikSlug: state?.topikSlug || "",
    subtopikNama: state?.subtopikNama || "",
    subtopikSlug: state?.subtopikSlug || "",
  });

  const fillBreadcrumb = (data) => {
    if (!state?.jenjangSlug) {
      setBreadcrumb({
        jenjangNama: data.jenjang_nama,
        jenjangSlug: data.jenjang_slug,
        subjenjangNama: data.subjenjang_nama,
        subjenjangSlug: data.subjenjang_slug,
        mapelNama: data.mapel_nama,
        mapelSlug: data.mapel_slug,
        topikNama: data.topik_nama,
        topikSlug: data.topik_slug,
        subtopikNama: data.subtopik_nama,
        subtopikSlug: data.subtopik_slug,
      });
    }
  };

  useEffect(() => {
    setChosen(null);
    setSubmitted(false);
    setAlreadyCorrect(false);
    setLoading(true);

    if (user) {
      // User login — fetch soal + status parallel
      Promise.all([getSoalDetail(kode), getSoalStatus(kode)])
        .then(([data, status]) => {
          setSoal(data);
          fillBreadcrumb(data);
          if (status?.answered_correct) {
            setAlreadyCorrect(true);
            setSubmitted(true);
            setChosen(data.answer);
          }
        })
        .catch(() => setError("Gagal memuat soal"))
        .finally(() => setLoading(false));
    } else {
      // User tidak login — fetch soal saja
      getSoalDetail(kode)
        .then((data) => {
          setSoal(data);
          fillBreadcrumb(data);
        })
        .catch(() => setError("Gagal memuat soal"))
        .finally(() => setLoading(false));
    }
  }, [kode, user]);

  const handleSubmit = async () => {
    if (!chosen || alreadyCorrect) return;
    setSubmitted(true);

    // Save session hanya kalau login
    if (user) {
      try {
        await saveSession({
          soal_id: soal.id,
          kode: soal.kode,
          difficulty: soal.difficulty,
          is_correct: chosen === soal.answer ? 1 : 0,
        });
      } catch {}
    }
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
    if ((isCorrect || alreadyCorrect) && label === soal.answer)
      return { border: "2px solid #1a8a6e", background: "#e4f5f0" };
    if (!isCorrect && label === chosen)
      return { border: "2px solid #e84c2b", background: "#fff3f0" };
    return { border: "1px solid #e2ddd5", background: "white" };
  };

  const getOptLabelColor = (label) => {
    if (!submitted) return chosen === label ? "#e84c2b" : "#6b6860";
    if ((isCorrect || alreadyCorrect) && label === soal.answer)
      return "#1a8a6e";
    if (!isCorrect && label === chosen) return "#e84c2b";
    return "#6b6860";
  };

  const {
    jenjangNama,
    jenjangSlug,
    subjenjangNama,
    subjenjangSlug,
    mapelNama,
    mapelSlug,
    topikNama,
    topikSlug,
    subtopikNama,
    subtopikSlug,
  } = breadcrumb;

  const backUrl = `/browse/${jenjangSlug}/${subjenjangSlug}/${mapelSlug}/${topikSlug}/${subtopikSlug}`;

  const showPembahasan = user || soal?.is_public_explanation == 1;

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f6" }}>
      <Navbar />

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
              { label: `Soal #${kode}` },
            ]}
          />
        </div>

        {/* Loading */}
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

        {/* Error */}
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
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
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
                    {mapelNama || "Soal"}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#b4b2a9",
                      fontFamily: "monospace",
                    }}
                  >
                    #{kode}
                  </span>
                </div>
                <DifficultyBadge level={soal.difficulty} />
              </div>

              {/* Body soal */}
              <div
                style={{
                  fontSize: "17px",
                  color: "#0f0e17",
                  fontWeight: "500",
                }}
              >
                <MathRenderer text={soal.body} block />
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
                    onClick={() =>
                      !submitted && !alreadyCorrect && setChosen(opt.label)
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "13px 16px",
                      borderRadius: "12px",
                      cursor:
                        submitted || alreadyCorrect ? "default" : "pointer",
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
                    {submitted &&
                      (isCorrect || alreadyCorrect) &&
                      opt.label === soal.answer && (
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#1a8a6e",
                            flexShrink: 0,
                          }}
                        >
                          Benar
                        </span>
                      )}
                    {submitted &&
                      !isCorrect &&
                      !alreadyCorrect &&
                      opt.label === chosen && (
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#e84c2b",
                            flexShrink: 0,
                          }}
                        >
                          Salah
                        </span>
                      )}
                  </div>
                ))}
              </div>

              {/* Submit / Coba Lagi */}
              {!alreadyCorrect && (
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
                  ) : !isCorrect ? (
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
                  ) : null}
                </div>
              )}

              {/* Navigasi */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "8px",
                  borderTop: "1px solid #f2efe8",
                }}
              >
                <button
                  onClick={() => navigate(-1)}
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
                  <ChevronLeft size={16} /> Kembali
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
                // Belum jawab
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
                    Pilih jawaban dan klik Submit untuk melihat pembahasan.
                  </p>
                </div>
              ) : !isCorrect && !alreadyCorrect ? (
                // Jawab salah
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <XCircle
                    size={36}
                    color="#e84c2b"
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
                    Jawaban kurang tepat
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6b6860",
                      lineHeight: "1.6",
                    }}
                  >
                    Coba lagi untuk melihat pembahasan.
                  </p>
                </div>
              ) : (
                // Jawab benar
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
                      background: "#e4f5f0",
                      border: "1px solid #9FE1CB",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <CheckCircle
                      size={24}
                      color="#1a8a6e"
                      style={{ flexShrink: 0 }}
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: "700",
                          fontSize: "15px",
                          color: "#0F6E56",
                        }}
                      >
                        {alreadyCorrect
                          ? "Sudah pernah dijawab benar!"
                          : "Jawaban benar!"}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#1a8a6e",
                          marginTop: "2px",
                        }}
                      >
                        Jawaban yang benar: <strong>{soal.answer}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Pembahasan — login ATAU is_public_explanation */}
                  {showPembahasan && soal.explanation && (
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
                      <div style={{ fontSize: "15px", color: "#0f0e17" }}>
                        <MathRenderer text={soal.explanation} block />
                      </div>
                    </div>
                  )}

                  {!showPembahasan && !soal.explanation && (
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

                  {/* Video — login ATAU is_public_explanation */}
                  {showPembahasan &&
                    soal.video_url &&
                    getYouTubeId(soal.video_url) && (
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
                          Video Pembahasan
                        </div>
                        <div
                          style={{
                            borderRadius: "12px",
                            overflow: "hidden",
                            aspectRatio: "16/9",
                          }}
                        >
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${getYouTubeId(
                              soal.video_url
                            )}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ display: "block" }}
                          />
                        </div>
                      </div>
                    )}

                  {/* Banner daftar — selalu muncul kalau tidak login */}
                  {!user && (
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        background: "#f2efe8",
                        border: "1px solid #e2ddd5",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#0f0e17",
                          marginBottom: "6px",
                        }}
                      >
                        {soal.is_public_explanation == 1
                          ? "Simpan progress & dapat XP"
                          : "Daftar untuk lihat pembahasan lengkap"}
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#6b6860",
                          lineHeight: "1.5",
                          marginBottom: "12px",
                        }}
                      >
                        {soal.is_public_explanation == 1
                          ? "Daftar gratis untuk menyimpan riwayat jawaban dan mendapatkan XP setiap soal yang benar."
                          : "Daftar gratis untuk melihat pembahasan lengkap, menyimpan progress, dan mendapatkan XP."}
                      </p>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => navigate("/register")}
                          style={{
                            flex: 1,
                            padding: "9px",
                            borderRadius: "10px",
                            border: "none",
                            background: "#e84c2b",
                            color: "white",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          Daftar Gratis
                        </button>
                        <button
                          onClick={() => navigate("/login")}
                          style={{
                            flex: 1,
                            padding: "9px",
                            borderRadius: "10px",
                            border: "1px solid #e2ddd5",
                            background: "white",
                            color: "#0f0e17",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          Masuk
                        </button>
                      </div>
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
