// src/features/quiz/QuizReview.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Warehouse,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import MathRenderer from "../../components/MathRenderer";
import useWindowWidth from "../../hooks/useWindowWidth";
import { getQuizResult } from "./quizApi";
import JawabanInput from "../soal/components/JawabanInput";
import PembahasanPanel from "../soal/components/PembahasanPanel";

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

export default function QuizReview() {
  const navigate = useNavigate();
  const { id, session_id } = useParams();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("semua");
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    getQuizResult(session_id)
      .then((d) => setResult(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session_id]);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#faf9f6",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: "14px", color: "#6b6860" }}>Memuat...</div>
      </div>
    );

  if (!result)
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#faf9f6",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: "14px", color: "#e84c2b" }}>
          Gagal memuat review.
        </div>
      </div>
    );

  const { session, soal } = result;

  const soalFiltered = soal.filter((s) => {
    if (filter === "benar") return s.is_correct;
    if (filter === "salah") return !s.is_correct;
    return true;
  });

  const currentSoal = soalFiltered[currentIdx];

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
        <title>Review Soal | Gudang Soal</title>
      </Helmet>

      {/* Navbar */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e2ddd5",
          padding: `0 ${isMobile ? "16px" : "40px"}`,
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flex: 1,
            minWidth: 0,
          }}
        >
          <button
            onClick={() => navigate(`/latihan/${id}/hasil/${session_id}`)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b6860",
              display: "flex",
              padding: 0,
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <div
            style={{
              width: "30px",
              height: "30px",
              background: "#e84c2b",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Warehouse size={16} color="white" />
          </div>
          {!isMobile && (
            <span
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#0f0e17",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Review Soal — {session.judul}
            </span>
          )}
        </div>
        <span style={{ fontSize: "13px", color: "#6b6860", flexShrink: 0 }}>
          {currentIdx + 1} / {soalFiltered.length}
        </span>
      </div>

      {/* Panel filter + navigasi nomor — sticky */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #f2efe8",
          padding: isMobile ? "10px 16px" : "10px 40px",
          position: "sticky",
          top: "56px",
          zIndex: 99,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          alignItems: "center",
        }}
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
              onClick={() => {
                setFilter(f.value);
                setCurrentIdx(0);
              }}
              style={{
                padding: "5px 12px",
                borderRadius: "8px",
                border: `1.5px solid ${
                  filter === f.value ? "#e84c2b" : "#e2ddd5"
                }`,
                background: filter === f.value ? "#fff3f0" : "white",
                color: filter === f.value ? "#e84c2b" : "#6b6860",
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

        {/* Navigasi nomor soal */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {soalFiltered.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrentIdx(i)}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "7px",
                border: `1.5px solid ${
                  i === currentIdx
                    ? "#e84c2b"
                    : s.is_correct
                    ? "#1a8a6e"
                    : "#fca5a5"
                }`,
                background:
                  i === currentIdx
                    ? "#e84c2b"
                    : s.is_correct
                    ? "#e4f5f0"
                    : "#fff3f0",
                color:
                  i === currentIdx
                    ? "white"
                    : s.is_correct
                    ? "#1a8a6e"
                    : "#e84c2b",
                fontSize: "11px",
                fontWeight: "700",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {soal.indexOf(s) + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <main
        style={{
          flex: 1,
          maxWidth: "1100px",
          margin: "0 auto",
          padding: isMobile ? "20px 16px" : "32px 40px",
          width: "100%",
        }}
      >
        {currentSoal ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: "20px",
              alignItems: "start",
            }}
          >
            {/* Panel soal */}
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                border: "1px solid #e2ddd5",
                padding: isMobile ? "20px" : "28px",
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
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "8px",
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
                    {currentSoal.mapel || "Soal"}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#b4b2a9",
                      fontFamily: "monospace",
                    }}
                  >
                    #{currentSoal.kode}
                  </span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span style={{ fontSize: "11px", color: "#b4b2a9" }}>
                    {DURASI_FORMAT(currentSoal.waktu_detik || 0)}
                  </span>
                  <DifficultyBadge level={currentSoal.difficulty} />
                  {currentSoal.is_correct ? (
                    <CheckCircle size={15} color="#1a8a6e" />
                  ) : (
                    <XCircle size={15} color="#e84c2b" />
                  )}
                </div>
              </div>

              {/* Body soal */}
              <div
                style={{
                  fontSize: isMobile ? "15px" : "17px",
                  color: "#0f0e17",
                  fontWeight: "500",
                  lineHeight: "1.7",
                }}
              >
                <MathRenderer text={currentSoal.body} block />
              </div>

              {/* Jawaban input — submitted, jawaban user di-highlight */}
              <JawabanInput
                soal={{ ...currentSoal }}
                chosen={currentSoal.jawaban_user}
                setChosen={() => {}}
                submitted={true}
                alreadyCorrect={currentSoal.is_correct}
                isCorrect={currentSoal.is_correct}
              />

              {/* Prev / Next */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "12px",
                  borderTop: "1px solid #f2efe8",
                }}
              >
                <button
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                  disabled={currentIdx === 0}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "10px",
                    border: "1px solid #e2ddd5",
                    background: "white",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: currentIdx === 0 ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    color: currentIdx === 0 ? "#b4b2a9" : "#0f0e17",
                  }}
                >
                  <ChevronLeft size={14} /> Sebelumnya
                </button>
                <span style={{ fontSize: "12px", color: "#b4b2a9" }}>
                  {currentIdx + 1} / {soalFiltered.length}
                </span>
                <button
                  onClick={() =>
                    setCurrentIdx((i) =>
                      Math.min(soalFiltered.length - 1, i + 1)
                    )
                  }
                  disabled={currentIdx === soalFiltered.length - 1}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "10px",
                    border: "1px solid #e2ddd5",
                    background: "white",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor:
                      currentIdx === soalFiltered.length - 1
                        ? "not-allowed"
                        : "pointer",
                    fontFamily: "inherit",
                    color:
                      currentIdx === soalFiltered.length - 1
                        ? "#b4b2a9"
                        : "#0f0e17",
                  }}
                >
                  Berikutnya <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Panel pembahasan — selalu tampil */}
            <div
              style={{ position: isMobile ? "static" : "sticky", top: "160px" }}
            >
              <PembahasanPanel
                soal={{ ...currentSoal }}
                submitted={true}
                isCorrect={currentSoal.is_correct}
                alreadyCorrect={currentSoal.is_correct}
                user={true}
                isMobile={isMobile}
                forceShow={true}
                jawabanUser={currentSoal.jawaban_user}
              />
            </div>
          </div>
        ) : (
          <div
            style={{ textAlign: "center", padding: "48px", color: "#6b6860" }}
          >
            Tidak ada soal.
          </div>
        )}
      </main>
    </div>
  );
}
