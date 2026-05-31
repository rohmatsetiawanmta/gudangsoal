// src/features/soal/components/PembahasanPanel.jsx
import { useNavigate } from "react-router-dom";
import {
  Lock,
  CheckCircle,
  XCircle,
  Users,
  RefreshCw,
  BarChart2,
} from "lucide-react";
import MathRenderer from "../../../components/MathRenderer";
import { formatAnswer, getYouTubeId, normalizeMenjodohkan } from "../soalUtils";

export default function PembahasanPanel({
  soal,
  submitted,
  isCorrect,
  alreadyCorrect,
  user,
  isMobile,
}) {
  const navigate = useNavigate();
  const showPembahasan = user || soal?.is_public_explanation == 1;

  // Normalize options menjodohkan
  const menjodohkanOptions =
    soal.tipe === "menjodohkan"
      ? normalizeMenjodohkan(soal.options)
      : { left: [], right: [] };
  const answerObj =
    soal.tipe === "menjodohkan" &&
    typeof soal.answer === "object" &&
    soal.answer !== null
      ? soal.answer
      : {};

  if (!submitted) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: isMobile ? "32px 16px" : "48px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Lock size={36} color="#b4b2a9" style={{ marginBottom: "16px" }} />
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
        <p style={{ fontSize: "14px", color: "#6b6860", lineHeight: "1.6" }}>
          {soal.tipe === "multiple_choice_table"
            ? "Pilih jawaban untuk setiap pernyataan, lalu klik Submit."
            : soal.tipe === "checklist"
            ? "Pilih semua jawaban yang benar, lalu klik Submit."
            : soal.tipe === "menjodohkan"
            ? "Pasangkan semua item, lalu klik Submit."
            : "Pilih jawaban dan klik Submit untuk melihat pembahasan."}
        </p>
      </div>
    );
  }

  if (!isCorrect && !alreadyCorrect) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: isMobile ? "32px 16px" : "48px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <XCircle size={36} color="#e84c2b" style={{ marginBottom: "16px" }} />
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
        <p style={{ fontSize: "14px", color: "#6b6860", lineHeight: "1.6" }}>
          Coba lagi untuk melihat pembahasan.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Result banner */}
      <div
        style={{
          padding: "16px",
          borderRadius: "12px",
          background: "#e4f5f0",
          border: "1px solid #9FE1CB",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <CheckCircle
          size={24}
          color="#1a8a6e"
          style={{ flexShrink: 0, marginTop: "2px" }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: "700",
              fontSize: "15px",
              color: "#0F6E56",
              marginBottom: "6px",
            }}
          >
            {alreadyCorrect ? "Sudah pernah dijawab benar!" : "Jawaban benar!"}
          </div>

          {soal.tipe === "menjodohkan" ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              {menjodohkanOptions.left.map((leftText, li) => {
                const ri =
                  answerObj[String(li)] !== undefined
                    ? parseInt(answerObj[String(li)])
                    : null;
                const rightText =
                  ri !== null ? menjodohkanOptions.right[ri] : null;
                return (
                  <div
                    key={li}
                    style={{
                      fontSize: "13px",
                      color: "#1a8a6e",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontWeight: "600", flexShrink: 0 }}>
                      {li + 1}.
                    </span>
                    <span style={{ color: "#1a8a6e" }}>
                      <MathRenderer text={leftText} />
                    </span>
                    <span style={{ color: "#9FE1CB", flexShrink: 0 }}>→</span>
                    <span style={{ fontWeight: "700", flexShrink: 0 }}>
                      {ri !== null && rightText ? (
                        <>
                          <span>{String.fromCharCode(65 + ri)}. </span>
                          <MathRenderer text={rightText} />
                        </>
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: "13px", color: "#1a8a6e" }}>
              Jawaban: <strong>{formatAnswer(soal.tipe, soal.answer)}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {soal.stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "8px",
          }}
        >
          {[
            {
              icon: Users,
              label: "Dikerjakan",
              value: soal.stats.total_user.toLocaleString(),
              color: "#2563eb",
            },
            {
              icon: RefreshCw,
              label: "Attempt",
              value: soal.stats.total_attempt.toLocaleString(),
              color: "#f5a623",
            },
            {
              icon: BarChart2,
              label: "Akurasi",
              value: `${soal.stats.akurasi}%`,
              color: soal.stats.akurasi >= 50 ? "#1a8a6e" : "#e84c2b",
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              style={{
                background: "#faf9f6",
                borderRadius: "10px",
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: color + "18",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={13} color={color} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                    color: "#0f0e17",
                    lineHeight: 1,
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#6b6860",
                    marginTop: "2px",
                  }}
                >
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pembahasan */}
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
          style={{ fontSize: "14px", color: "#6b6860", fontStyle: "italic" }}
        >
          Pembahasan belum tersedia untuk soal ini.
        </div>
      )}

      {/* Video */}
      {showPembahasan && soal.video_url && getYouTubeId(soal.video_url) && (
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

      {/* Banner daftar */}
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
  );
}
