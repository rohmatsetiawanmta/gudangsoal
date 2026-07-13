// src/features/quiz/LatihanDetail.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Zap,
  RotateCcw,
  Trophy,
  ChevronLeft,
  Play,
  CheckCircle,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";
import { useAuthStore } from "../auth/authStore";
import { getQuizDetail, startQuiz } from "./quizApi";

const DURASI_LABEL = (menit) => {
  if (menit < 60) return `${menit} menit`;
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;
  return sisa ? `${jam} jam ${sisa} menit` : `${jam} jam`;
};

const XP_TIERS = [
  { persen: 90, xpPersen: 100, label: "90–100%" },
  { persen: 75, xpPersen: 75, label: "75–89%" },
  { persen: 60, xpPersen: 50, label: "60–74%" },
  { persen: 50, xpPersen: 25, label: "50–59%" },
  { persen: 0, xpPersen: 0, label: "< 50%" },
];

export default function LatihanDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isLoggedIn } = useAuthStore();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getQuizDetail(id)
      .then((d) => setSet(d))
      .catch(() => setError("Set soal tidak ditemukan"))
      .finally(() => setLoading(false));
  }, [id, isLoggedIn]);

  const handleMulai = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setStarting(true);
    try {
      const res = await startQuiz(id);
      if (res.auto_finished) {
        navigate(`/latihan/${id}/hasil/${res.session_id}`);
      } else if (res.resumed) {
        // Ada session aktif — langsung masuk quiz dengan resume
        navigate(`/latihan/${id}/quiz`, { state: { session: res } });
      } else {
        navigate(`/latihan/${id}/quiz`, { state: { session: res } });
      }
    } catch (err) {
      setError(err.error || "Gagal memulai latihan");
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
          background: "var(--gs-bg)",
        }}
      >
        <Navbar />
        <main
          style={{
            flex: 1,
            maxWidth: "700px",
            margin: "0 auto",
            padding: isMobile ? "24px 20px" : "40px",
            width: "100%",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "100px",
                  borderRadius: "14px",
                  background: "var(--gs-border)",
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

  if (error || !set)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: "var(--gs-bg)",
        }}
      >
        <Navbar />
        <main
          style={{
            flex: 1,
            maxWidth: "700px",
            margin: "0 auto",
            padding: isMobile ? "24px 20px" : "40px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#e84c2b", fontSize: "15px" }}>
            {error || "Set soal tidak ditemukan"}
          </p>
        </main>
      </div>
    );

  const isFinal = set.is_final == 1;
  const attemptHabis = set.sisa_attempt === 0;
  const sudahMulai = set.attempt_ke > 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--gs-bg)",
      }}
    >
      <SEO
        title={set.judul}
        description={set.deskripsi || `Set soal latihan: ${set.judul}`}
        url={`/latihan/${id}`}
      />
      <Navbar />

      <main
        style={{
          flex: 1,
          maxWidth: "700px",
          margin: "0 auto",
          padding: isMobile ? "24px 20px" : "40px",
          width: "100%",
        }}
      >
        {/* Back */}
        <button
          onClick={() => navigate("/latihan")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--gs-text-muted)",
            fontSize: "13px",
            fontFamily: "inherit",
            padding: 0,
            marginBottom: "20px",
          }}
        >
          <ChevronLeft size={15} /> Kembali
        </button>

        {/* Header card */}
        <div
          style={{
            background: "var(--gs-surface)",
            borderRadius: "16px",
            border: "1px solid var(--gs-border)",
            padding: isMobile ? "20px" : "28px",
            marginBottom: "16px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: attemptHabis ? "var(--gs-border)" : "#e84c2b",
            }}
          />

          <div
            style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: attemptHabis ? "var(--gs-hover)" : "#fff3f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <BookOpen
                size={24}
                color={attemptHabis ? "var(--gs-text-hint)" : "#e84c2b"}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "6px",
                }}
              >
                <h1
                  style={{
                    fontSize: isMobile ? "18px" : "20px",
                    fontWeight: "800",
                    color: "var(--gs-text)",
                    margin: 0,
                  }}
                >
                  {set.judul}
                </h1>
                {set.jenjang_nama && (
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: "#eff6ff",
                      color: "#2563eb",
                    }}
                  >
                    {set.jenjang_nama}
                  </span>
                )}
              </div>
              {set.deskripsi && (
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--gs-text-muted)",
                    lineHeight: "1.6",
                    margin: 0,
                  }}
                >
                  {set.deskripsi}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          {[
            {
              icon: BookOpen,
              label: "Jumlah Soal",
              value: `${set.jumlah_soal} soal`,
              color: "#2563eb",
            },
            {
              icon: Clock,
              label: "Durasi",
              value: DURASI_LABEL(set.durasi),
              color: "#1a8a6e",
            },
            {
              icon: Zap,
              label: "Max XP",
              value: `${set.max_xp} XP`,
              color: "#f5a623",
            },
            {
              icon: RotateCcw,
              label: "Sisa Attempt",
              value: isLoggedIn
                ? `${set.sisa_attempt ?? set.max_attempt}/${set.max_attempt}`
                : `Max ${set.max_attempt}x`,
              color: "#7c3aed",
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              style={{
                background: "var(--gs-surface)",
                borderRadius: "12px",
                border: "1px solid var(--gs-border)",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: color + "15",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={17} color={color} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--gs-text-hint)",
                    marginBottom: "2px",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "var(--gs-text)",
                  }}
                >
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Skor terbaik */}
        {sudahMulai && set.best_persen !== null && (
          <div
            style={{
              background: "var(--gs-surface)",
              borderRadius: "14px",
              border: "1px solid var(--gs-border)",
              padding: isMobile ? "16px" : "20px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--gs-text)",
                }}
              >
                Skor Terbaik
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Trophy size={14} color="#f5a623" />
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "var(--gs-text)",
                  }}
                >
                  {set.best_persen}%
                </span>
              </div>
            </div>
            <div
              style={{
                height: "8px",
                background: "var(--gs-divider)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${set.best_persen}%`,
                  background:
                    set.best_persen >= 75
                      ? "#1a8a6e"
                      : set.best_persen >= 50
                      ? "#f5a623"
                      : "#e84c2b",
                  borderRadius: "4px",
                  transition: "width 1s ease",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "var(--gs-text-hint)",
                marginTop: "4px",
              }}
            >
              <span>
                {set.best_score}/{set.best_total} benar
              </span>
              <span>Attempt {set.attempt_ke} kali</span>
            </div>
          </div>
        )}

        {/* Sistem XP */}
        <div
          style={{
            background: "var(--gs-surface)",
            borderRadius: "14px",
            border: "1px solid var(--gs-border)",
            padding: isMobile ? "16px" : "20px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--gs-text)",
              marginBottom: "12px",
            }}
          >
            Sistem XP
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {XP_TIERS.map((tier, i) => {
              const xp = Math.round((set.max_xp * tier.xpPersen) / 100);
              const isAchieved =
                set.best_persen >= tier.persen && tier.persen > 0;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background: isAchieved ? "#e4f5f0" : "var(--gs-surface-subtle)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--gs-text-muted)",
                      minWidth: "60px",
                    }}
                  >
                    {tier.label}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "6px",
                      background: "var(--gs-border)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${tier.xpPersen}%`,
                        background:
                          tier.xpPersen === 0 ? "transparent" : "#f5a623",
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: tier.xpPersen === 0 ? "var(--gs-text-hint)" : "#f5a623",
                      minWidth: "50px",
                      textAlign: "right",
                    }}
                  >
                    {xp} XP
                  </span>
                  {isAchieved && <CheckCircle size={14} color="#1a8a6e" />}
                </div>
              );
            })}
          </div>
          <div
            style={{ fontSize: "11px", color: "var(--gs-text-hint)", marginTop: "10px" }}
          >
            XP dihitung dari delta skor terbaik antar attempt.
          </div>
        </div>

        {/* CTA */}
        {!isLoggedIn ? (
          <button
            onClick={() => navigate("/login")}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "14px",
              border: "none",
              background: "#e84c2b",
              color: "white",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Login untuk Mulai Latihan
          </button>
        ) : isFinal ? (
          <button
            onClick={() =>
              navigate(`/latihan/${id}/hasil/${set.best_session_id}`)
            }
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "14px",
              border: "none",
              background: "#e84c2b",
              color: "white",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Lihat Hasil Terakhir
          </button>
        ) : attemptHabis ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <div
              style={{
                padding: "14px",
                borderRadius: "14px",
                background: "var(--gs-hover)",
                textAlign: "center",
                fontSize: "14px",
                color: "var(--gs-text-muted)",
                fontWeight: "600",
              }}
            >
              Attempt sudah habis
            </div>
            <button
              onClick={() =>
                navigate(`/latihan/${id}/hasil/${set.best_session_id}`)
              }
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                border: "1px solid var(--gs-border)",
                background: "var(--gs-surface)",
                color: "var(--gs-text)",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Lihat Hasil Terakhir
            </button>
          </div>
        ) : (
          <button
            onClick={handleMulai}
            disabled={starting}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "14px",
              border: "none",
              background: starting ? "#f5a07a" : "#e84c2b",
              color: "white",
              fontSize: "16px",
              fontWeight: "700",
              cursor: starting ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <Play size={18} />
            {starting
              ? "Memulai..."
              : sudahMulai
              ? `Attempt ${(set.attempt_ke || 0) + 1}`
              : "Mulai Latihan"}
          </button>
        )}
      </main>

      <Footer />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
