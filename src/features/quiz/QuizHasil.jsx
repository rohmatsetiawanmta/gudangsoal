// src/features/quiz/QuizHasil.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Trophy,
  Clock,
  Zap,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import MathRenderer from "../../components/MathRenderer";
import useWindowWidth from "../../hooks/useWindowWidth";
import { getQuizResult, finalizeQuiz, startQuiz } from "./quizApi";
import PembahasanPanel from "../soal/components/PembahasanPanel";
import JawabanInput from "../soal/components/JawabanInput";

const DURASI_FORMAT = (detik) => {
  const m = Math.floor(detik / 60);
  const s = detik % 60;
  return m > 0 ? `${m} mnt ${s} dtk` : `${s} detik`;
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
        flexShrink: 0,
      }}
    >
      {d.label}
    </span>
  );
}

function ScoreDonut({ persen }) {
  const data = [
    {
      value: persen,
      color: persen >= 75 ? "#1a8a6e" : persen >= 50 ? "#f5a623" : "#e84c2b",
    },
    { value: 100 - persen, color: "#f2efe8" },
  ];
  return (
    <div style={{ position: "relative", width: "120px", height: "120px" }}>
      <PieChart width={120} height={120}>
        <Pie
          data={data}
          cx={55}
          cy={55}
          innerRadius={40}
          outerRadius={55}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: "22px",
            fontWeight: "800",
            color: "#0f0e17",
            lineHeight: 1,
          }}
        >
          {persen}%
        </span>
      </div>
    </div>
  );
}

export default function QuizHasil() {
  const navigate = useNavigate();
  const { id, session_id } = useParams();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("ringkasan"); // ringkasan | analisis | review
  const [filterReview, setFilterReview] = useState("semua");
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    getQuizResult(session_id)
      .then((d) => setResult(d))
      .catch(() => setError("Gagal memuat hasil"))
      .finally(() => setLoading(false));
  }, [session_id]);

  const handleLihatPembahasan = async () => {
    setFinalizing(true);
    try {
      await finalizeQuiz(session_id);
      navigate(`/latihan/${id}/hasil/${session_id}/review`);
    } catch {
      alert("Gagal memfinalisasi");
    } finally {
      setFinalizing(false);
    }
  };

  const handleCobaLagi = async () => {
    setStarting(true);
    try {
      const res = await startQuiz(id);
      if (res.auto_finished) {
        navigate(`/latihan/${id}/hasil/${res.session_id}`);
      } else {
        navigate(`/latihan/${id}/quiz`, { state: { session: res } });
      }
    } catch (e) {
      alert(e.error || "Gagal memulai ulang");
    } finally {
      setStarting(false);
    }
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: "#faf9f6",
        }}
      >
        <Navbar />
        <main
          style={{
            flex: 1,
            maxWidth: "800px",
            margin: "0 auto",
            padding: isMobile ? "24px 20px" : "40px",
            width: "100%",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "100px",
                  borderRadius: "14px",
                  background: "#e2ddd5",
                  opacity: 0.5,
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </div>
        </main>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
      </div>
    );

  if (error || !result)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: "#faf9f6",
        }}
      >
        <Navbar />
        <main
          style={{
            flex: 1,
            maxWidth: "800px",
            margin: "0 auto",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#e84c2b" }}>{error || "Hasil tidak ditemukan"}</p>
        </main>
      </div>
    );

  const { session, soal, all_attempts, sisa_attempt } = result;
  const persen =
    session.total > 0 ? Math.round((session.score / session.total) * 100) : 0;
  const isFinal = all_attempts.some((a) => a.is_final == 1);
  const attemptHabis = sisa_attempt === 0;

  // Data analisis
  const diffBreakdown = {
    1: { benar: 0, total: 0 },
    2: { benar: 0, total: 0 },
    3: { benar: 0, total: 0 },
  };
  const topikBreakdown = {};
  let totalWaktu = 0;
  let soalTerlama = null;
  let soalTercepat = null;

  soal.forEach((s) => {
    // Difficulty
    const d = s.difficulty || 1;
    diffBreakdown[d].total++;
    if (s.is_correct) diffBreakdown[d].benar++;

    // Topik
    const topikKey = s.subtopik || s.topik || "Lainnya";
    if (!topikBreakdown[topikKey])
      topikBreakdown[topikKey] = { benar: 0, total: 0, topik: s.topik };
    topikBreakdown[topikKey].total++;
    if (s.is_correct) topikBreakdown[topikKey].benar++;

    // Waktu
    const w = s.waktu_detik || 0;
    totalWaktu += w;
    if (!soalTerlama || w > soalTerlama.waktu_detik) soalTerlama = s;
    if (!soalTercepat || w < soalTercepat.waktu_detik) soalTercepat = s;
  });

  const rataWaktu = soal.length > 0 ? Math.round(totalWaktu / soal.length) : 0;

  // Filter review
  const soalFiltered = soal.filter((s) => {
    if (filterReview === "benar") return s.is_correct;
    if (filterReview === "salah") return !s.is_correct;
    return true;
  });

  // Chart attempts
  const attemptsChartData = all_attempts.map((a, i) => ({
    attempt: `Attempt ${i + 1}`,
    persen: a.total > 0 ? Math.round((a.score / a.total) * 100) : 0,
  }));

  const DIFF_LABEL = { 1: "Easy", 2: "Medium", 3: "Hard" };
  const DIFF_COLOR = { 1: "#1a8a6e", 2: "#f5a623", 3: "#e84c2b" };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#faf9f6",
      }}
    >
      <Helmet>
        <title>Hasil Latihan | Gudang Soal</title>
      </Helmet>
      <Navbar />

      {/* Confirm finalize modal */}
      {showFinalConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "400px",
              width: "100%",
            }}
          >
            <h3
              style={{
                fontSize: "17px",
                fontWeight: "800",
                color: "#0f0e17",
                marginBottom: "8px",
              }}
            >
              Lihat Pembahasan?
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6b6860",
                lineHeight: "1.6",
                marginBottom: "24px",
              }}
            >
              Setelah melihat pembahasan, kamu tidak bisa mencoba lagi set soal
              ini. Lanjutkan?
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowFinalConfirm(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #e2ddd5",
                  background: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: "#0f0e17",
                }}
              >
                Batal
              </button>
              <button
                onClick={handleLihatPembahasan}
                disabled={finalizing}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#e84c2b",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: finalizing ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {finalizing ? "Memproses..." : "Lanjutkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main
        style={{
          flex: 1,
          maxWidth: "800px",
          margin: "0 auto",
          padding: isMobile ? "20px 16px" : "36px 40px",
          width: "100%",
        }}
      >
        {/* Back */}
        <button
          onClick={() => navigate(`/latihan/${id}`)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6b6860",
            fontSize: "13px",
            fontFamily: "inherit",
            padding: 0,
            marginBottom: "20px",
          }}
        >
          <ChevronLeft size={15} /> Kembali
        </button>

        {/* Bagian 1 — Summary */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            border: "1px solid #e2ddd5",
            padding: isMobile ? "20px" : "28px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            {/* Donut chart */}
            <ScoreDonut persen={persen} />

            {/* Info */}
            <div style={{ flex: 1, minWidth: "180px" }}>
              <div
                style={{
                  fontSize: "13px",
                  color: "#6b6860",
                  marginBottom: "4px",
                }}
              >
                {session.judul || "Hasil Latihan"}
              </div>
              <div
                style={{
                  fontSize: isMobile ? "22px" : "26px",
                  fontWeight: "800",
                  color: "#0f0e17",
                  marginBottom: "8px",
                }}
              >
                {session.score}/{session.total} Benar
              </div>

              {/* Badge pencapaian */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "12px",
                }}
              >
                {persen >= 90 && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: "#e4f5f0",
                      color: "#1a8a6e",
                    }}
                  >
                    🏆 Luar Biasa!
                  </span>
                )}
                {persen >= 75 && persen < 90 && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: "#e4f5f0",
                      color: "#1a8a6e",
                    }}
                  >
                    👏 Bagus!
                  </span>
                )}
                {all_attempts.length === 1 && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: "#eff6ff",
                      color: "#2563eb",
                    }}
                  >
                    ✨ Pertama kali
                  </span>
                )}
                {all_attempts.length > 1 &&
                  persen >=
                    Math.round(
                      (all_attempts[all_attempts.length - 2].score /
                        all_attempts[all_attempts.length - 2].total) *
                        100
                    ) && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: "#f5f3ff",
                        color: "#7c3aed",
                      }}
                    >
                      📈 Personal Best!
                    </span>
                  )}
              </div>

              {/* Stats kecil */}
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    color: "#6b6860",
                  }}
                >
                  <Zap size={13} color="#f5a623" />
                  <span style={{ fontWeight: "700", color: "#f5a623" }}>
                    {session.xp_earned} XP
                  </span>{" "}
                  didapat
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    color: "#6b6860",
                  }}
                >
                  <Clock size={13} />
                  {DURASI_FORMAT(totalWaktu)}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    color: "#6b6860",
                  }}
                >
                  <RotateCcw size={13} />
                  Attempt {session.attempt_ke}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Switcher attempt */}
        {all_attempts.length > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "16px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "12px", color: "#b4b2a9", flexShrink: 0 }}>
              Attempt:
            </span>
            {all_attempts.map((a) => {
              const isCurrent = String(a.id) === String(session_id);
              return (
                <button
                  key={a.id}
                  onClick={() =>
                    !isCurrent &&
                    navigate(`/latihan/${id}/hasil/${a.id}`)
                  }
                  style={{
                    padding: "5px 12px",
                    borderRadius: "8px",
                    border: `1.5px solid ${isCurrent ? "#e84c2b" : "#e2ddd5"}`,
                    background: isCurrent ? "#fff3f0" : "white",
                    color: isCurrent ? "#e84c2b" : "#6b6860",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: isCurrent ? "default" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Attempt {a.attempt_ke}
                </button>
              );
            })}
          </div>
        )}

        {/* CTA — Coba Lagi & Lihat Pembahasan */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          {!isFinal && !attemptHabis && (
            <button
              onClick={handleCobaLagi}
              disabled={starting}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #e2ddd5",
                background: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: starting ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                color: "#0f0e17",
              }}
            >
              {starting ? "Memulai..." : `Coba Lagi (${sisa_attempt} tersisa)`}
            </button>
          )}
          {session.show_answer == 1 && !isFinal && (
            <button
              onClick={() => setShowFinalConfirm(true)}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                background: "#e84c2b",
                color: "white",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Lihat Pembahasan
            </button>
          )}
          {isFinal && (
            <button
              onClick={() =>
                navigate(`/latihan/${id}/hasil/${session_id}/review`)
              }
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                border: "none",
                background: "#e84c2b",
                color: "white",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Review Soal
            </button>
          )}
        </div>

        {/* Tab */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            background: "#f2efe8",
            padding: "4px",
            borderRadius: "12px",
            marginBottom: "16px",
          }}
        >
          {[
            { key: "ringkasan", label: "Ringkasan" },
            { key: "analisis", label: "Analisis" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "9px",
                border: "none",
                background: activeTab === t.key ? "white" : "transparent",
                color: activeTab === t.key ? "#0f0e17" : "#6b6860",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow:
                  activeTab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Ringkasan */}
        {activeTab === "ringkasan" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {/* Perbandingan attempt */}
            {all_attempts.length > 1 && (
              <div
                style={{
                  background: "white",
                  borderRadius: "14px",
                  border: "1px solid #e2ddd5",
                  padding: isMobile ? "16px" : "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#0f0e17",
                    marginBottom: "14px",
                  }}
                >
                  Perbandingan Attempt
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart
                    data={attemptsChartData}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="attempt"
                      tick={{ fontSize: 11, fill: "#b4b2a9" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "#b4b2a9" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(v) => [`${v}%`, "Skor"]}
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #e2ddd5",
                        fontSize: "13px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="persen"
                      stroke="#e84c2b"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#e84c2b" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Breakdown difficulty */}
            <div
              style={{
                background: "white",
                borderRadius: "14px",
                border: "1px solid #e2ddd5",
                padding: isMobile ? "16px" : "20px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#0f0e17",
                  marginBottom: "14px",
                }}
              >
                Breakdown Kesulitan
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {[1, 2, 3].map((d) => {
                  const { benar, total } = diffBreakdown[d];
                  if (total === 0) return null;
                  const p = Math.round((benar / total) * 100);
                  return (
                    <div
                      key={d}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: DIFF_COLOR[d],
                          minWidth: "52px",
                        }}
                      >
                        {DIFF_LABEL[d]}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: "8px",
                          background: "#f2efe8",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${p}%`,
                            background: DIFF_COLOR[d],
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b6860",
                          minWidth: "60px",
                          textAlign: "right",
                        }}
                      >
                        {benar}/{total} ({p}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Waktu */}
            <div
              style={{
                background: "white",
                borderRadius: "14px",
                border: "1px solid #e2ddd5",
                padding: isMobile ? "16px" : "20px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#0f0e17",
                  marginBottom: "14px",
                }}
              >
                Statistik Waktu
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "10px",
                }}
              >
                {[
                  { label: "Total Waktu", value: DURASI_FORMAT(totalWaktu) },
                  { label: "Rata-rata/Soal", value: DURASI_FORMAT(rataWaktu) },
                  {
                    label: "Terlama",
                    value: soalTerlama
                      ? DURASI_FORMAT(soalTerlama.waktu_detik)
                      : "-",
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      background: "#faf9f6",
                      borderRadius: "10px",
                      padding: "12px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "800",
                        color: "#0f0e17",
                        marginBottom: "4px",
                      }}
                    >
                      {value}
                    </div>
                    <div style={{ fontSize: "11px", color: "#b4b2a9" }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Analisis */}
        {activeTab === "analisis" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {/* Breakdown per topik */}
            <div
              style={{
                background: "white",
                borderRadius: "14px",
                border: "1px solid #e2ddd5",
                padding: isMobile ? "16px" : "20px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#0f0e17",
                  marginBottom: "14px",
                }}
              >
                Breakdown per Topik
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {Object.entries(topikBreakdown)
                  .sort(
                    (a, b) => a[1].benar / a[1].total - b[1].benar / b[1].total
                  )
                  .map(([subtopik, { benar, total, topik }]) => {
                    const p = Math.round((benar / total) * 100);
                    return (
                      <div
                        key={subtopik}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div style={{ minWidth: isMobile ? "80px" : "140px" }}>
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#0f0e17",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {subtopik}
                          </div>
                          {topik && topik !== subtopik && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#b4b2a9",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {topik}
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            flex: 1,
                            height: "8px",
                            background: "#f2efe8",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${p}%`,
                              background:
                                p >= 75
                                  ? "#1a8a6e"
                                  : p >= 50
                                  ? "#f5a623"
                                  : "#e84c2b",
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#6b6860",
                            minWidth: "60px",
                            textAlign: "right",
                          }}
                        >
                          {benar}/{total} ({p}%)
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Soal dengan waktu terlama */}
            <div
              style={{
                background: "white",
                borderRadius: "14px",
                border: "1px solid #e2ddd5",
                padding: isMobile ? "16px" : "20px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#0f0e17",
                  marginBottom: "14px",
                }}
              >
                Soal Paling Lama Dikerjakan
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {[...soal]
                  .sort((a, b) => (b.waktu_detik || 0) - (a.waktu_detik || 0))
                  .slice(0, 3)
                  .map((s, i) => (
                    <div
                      key={s.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: "#faf9f6",
                      }}
                    >
                      {/* Rank */}
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "6px",
                          flexShrink: 0,
                          background:
                            i === 0
                              ? "#e84c2b"
                              : i === 1
                              ? "#f5a623"
                              : "#f2efe8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: i < 2 ? "white" : "#6b6860",
                        }}
                      >
                        {i + 1}
                      </div>

                      {/* Icon benar/salah */}
                      {s.is_correct ? (
                        <CheckCircle
                          size={14}
                          color="#1a8a6e"
                          style={{ flexShrink: 0 }}
                        />
                      ) : (
                        <XCircle
                          size={14}
                          color="#e84c2b"
                          style={{ flexShrink: 0 }}
                        />
                      )}

                      {/* Body soal */}
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#0f0e17",
                          flex: 1,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.body
                          ?.replace(/\$\$?[^$]+\$\$?/g, "[math]")
                          .replace(/[*_~`#]/g, "")
                          .slice(0, 60)}
                        ...
                      </span>

                      {/* Waktu */}
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#e84c2b",
                          flexShrink: 0,
                        }}
                      >
                        {DURASI_FORMAT(s.waktu_detik || 0)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Review Soal */}
        {activeTab === "review" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {/* Filter */}
            <div style={{ display: "flex", gap: "6px" }}>
              {[
                { value: "semua", label: `Semua (${soal.length})` },
                {
                  value: "benar",
                  label: `Benar (${soal.filter((s) => s.is_correct).length})`,
                },
                {
                  value: "salah",
                  label: `Salah (${soal.filter((s) => !s.is_correct).length})`,
                },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilterReview(f.value)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: `1.5px solid ${
                      filterReview === f.value ? "#e84c2b" : "#e2ddd5"
                    }`,
                    background: filterReview === f.value ? "#fff3f0" : "white",
                    color: filterReview === f.value ? "#e84c2b" : "#6b6860",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {!isFinal && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "#faeeda",
                  border: "1px solid #f5a623",
                  fontSize: "13px",
                  color: "#854F0B",
                }}
              >
                Kunci jawaban dan pembahasan tersembunyi. Klik "Lihat
                Pembahasan" untuk membuka.
              </div>
            )}

            {soalFiltered.map((s, i) => (
              <div
                key={s.id}
                style={{
                  background: "white",
                  borderRadius: "14px",
                  border: `1px solid ${s.is_correct ? "#9FE1CB" : "#fca5a5"}`,
                  padding: isMobile ? "14px 16px" : "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {s.is_correct ? (
                    <CheckCircle size={16} color="#1a8a6e" />
                  ) : (
                    <XCircle size={16} color="#e84c2b" />
                  )}
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#6b6860",
                    }}
                  >
                    Soal {soal.indexOf(s) + 1}
                  </span>
                  <DifficultyBadge level={s.difficulty} />
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#b4b2a9",
                      fontFamily: "monospace",
                    }}
                  >
                    #{s.kode}
                  </span>
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: "11px", color: "#b4b2a9" }}>
                    {DURASI_FORMAT(s.waktu_detik || 0)}
                  </span>
                </div>

                {/* Body soal */}
                <div
                  style={{
                    fontSize: isMobile ? "15px" : "16px",
                    color: "#0f0e17",
                    fontWeight: "500",
                    lineHeight: "1.7",
                  }}
                >
                  <MathRenderer text={s.body} block />
                </div>

                {/* Jawaban input — mode submitted, tidak bisa diubah */}
                <JawabanInput
                  soal={{ ...s, answer: s.answer }}
                  chosen={s.jawaban_user}
                  setChosen={() => {}}
                  submitted={true}
                  alreadyCorrect={s.is_correct}
                  isCorrect={s.is_correct}
                />

                {/* Pembahasan — hanya jika is_final */}
                {isFinal && (
                  <PembahasanPanel
                    soal={{ ...s, answer: s.answer }}
                    submitted={true}
                    isCorrect={s.is_correct}
                    alreadyCorrect={s.is_correct}
                    user={true}
                    isMobile={isMobile}
                  />
                )}
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
