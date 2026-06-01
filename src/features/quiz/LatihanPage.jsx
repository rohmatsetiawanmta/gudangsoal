// src/features/quiz/LatihanPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, Zap, RotateCcw, Trophy } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";
import { useAuthStore } from "../auth/authStore";
import { getQuizSets } from "./quizApi";
import api from "../../lib/api";

const DURASI_LABEL = (menit) => {
  if (menit < 60) return `${menit} menit`;
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;
  return sisa ? `${jam} jam ${sisa} mnt` : `${jam} jam`;
};

function QuizCard({ set, isMobile, onClick }) {
  const attemptHabis = set.sisa_attempt === 0;
  const sudahMulai = set.attempt_ke > 0;

  return (
    <div
      onClick={onClick}
      style={{
        background: "white",
        borderRadius: "16px",
        border: `1px solid ${attemptHabis ? "#e2ddd5" : "#e2ddd5"}`,
        padding: isMobile ? "16px" : "20px 24px",
        cursor: "pointer",
        transition: "transform .15s, box-shadow .15s",
        opacity: attemptHabis ? 0.7 : 1,
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!attemptHabis) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Top accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: attemptHabis ? "#e2ddd5" : "#e84c2b",
          borderRadius: "16px 16px 0 0",
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        {/* Icon */}
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: attemptHabis ? "#f2efe8" : "#fff3f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <BookOpen size={20} color={attemptHabis ? "#b4b2a9" : "#e84c2b"} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
              flexWrap: "wrap",
            }}
          >
            <h3
              style={{
                fontSize: "15px",
                fontWeight: "700",
                color: attemptHabis ? "#6b6860" : "#0f0e17",
                margin: 0,
              }}
            >
              {set.judul}
            </h3>
            {attemptHabis && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "2px 7px",
                  borderRadius: "5px",
                  background: "#f2efe8",
                  color: "#6b6860",
                }}
              >
                Attempt Habis
              </span>
            )}
            {set.jenjang_nama && (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "2px 7px",
                  borderRadius: "5px",
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
                fontSize: "13px",
                color: "#6b6860",
                marginBottom: "10px",
                lineHeight: "1.5",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {set.deskripsi}
            </p>
          )}

          {/* Stats */}
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
              <BookOpen size={12} />
              {set.jumlah_soal} soal
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
              <Clock size={12} />
              {DURASI_LABEL(set.durasi)}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                color: "#f5a623",
                fontWeight: "600",
              }}
            >
              <Zap size={12} />
              {set.max_xp} XP
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
              <RotateCcw size={12} />
              {set.sisa_attempt !== undefined
                ? `${set.sisa_attempt}/${set.max_attempt} attempt tersisa`
                : `Max ${set.max_attempt}x`}
            </div>
          </div>

          {/* Skor terbaik */}
          {sudahMulai && set.best_persen !== null && (
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "6px",
                  background: "#f2efe8",
                  borderRadius: "3px",
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
                    borderRadius: "3px",
                    transition: "width 1s ease",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#0f0e17",
                  flexShrink: 0,
                }}
              >
                {set.best_persen}% terbaik
              </span>
              {attemptHabis && <Trophy size={14} color="#f5a623" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LatihanPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuthStore();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jenjangList, setJenjangList] = useState([]);
  const [filterJenjang, setFilterJenjang] = useState("");

  useEffect(() => {
    api
      .get("/browse/jenjang")
      .then((d) => setJenjangList(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getQuizSets(filterJenjang)
      .then((d) => setSets(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filterJenjang, isLoggedIn]);

  const handleClickSet = (set) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    navigate(`/latihan/${set.id}`);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#faf9f6",
      }}
    >
      <SEO
        title="Mode Latihan"
        description="Kerjakan set soal latihan dengan timer dan sistem penilaian. Simulasi ujian nyata."
        url="/latihan"
      />
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
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              fontSize: isMobile ? "24px" : "28px",
              fontWeight: "800",
              color: "#0f0e17",
              letterSpacing: "-0.5px",
              marginBottom: "8px",
            }}
          >
            Mode Latihan
          </h1>
          <p style={{ fontSize: "15px", color: "#6b6860" }}>
            Kerjakan set soal dengan timer. Simulasi ujian nyata.
          </p>
          {!isLoggedIn && (
            <div
              style={{
                marginTop: "12px",
                padding: "10px 14px",
                borderRadius: "10px",
                background: "#fff3f0",
                border: "1px solid #fca5a5",
                fontSize: "13px",
                color: "#b91c1c",
              }}
            >
              Login diperlukan untuk mulai mengerjakan set soal.
            </div>
          )}
        </div>

        {/* Filter jenjang */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={() => setFilterJenjang("")}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: `1.5px solid ${!filterJenjang ? "#e84c2b" : "#e2ddd5"}`,
              background: !filterJenjang ? "#fff3f0" : "white",
              color: !filterJenjang ? "#e84c2b" : "#6b6860",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .15s",
            }}
          >
            Semua
          </button>
          {jenjangList.map((j) => (
            <button
              key={j.id}
              onClick={() => setFilterJenjang(j.id)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: `1.5px solid ${
                  filterJenjang == j.id ? "#e84c2b" : "#e2ddd5"
                }`,
                background: filterJenjang == j.id ? "#fff3f0" : "white",
                color: filterJenjang == j.id ? "#e84c2b" : "#6b6860",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .15s",
              }}
            >
              {j.nama}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "120px",
                  borderRadius: "16px",
                  background: "#e2ddd5",
                  opacity: 0.5,
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}

          {!loading && sets.length === 0 && (
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                border: "1px solid #e2ddd5",
                padding: "48px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <BookOpen size={36} color="#e2ddd5" />
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#0f0e17",
                }}
              >
                Belum ada set soal
              </p>
              <p style={{ fontSize: "14px", color: "#6b6860" }}>
                Set soal latihan akan segera hadir.
              </p>
            </div>
          )}

          {!loading &&
            sets.map((s) => (
              <QuizCard
                key={s.id}
                set={s}
                isMobile={isMobile}
                onClick={() => handleClickSet(s)}
              />
            ))}
        </div>
      </main>

      <Footer />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
