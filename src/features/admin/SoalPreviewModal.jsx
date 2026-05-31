// src/features/admin/SoalPreviewModal.jsx
import { useEffect, useState } from "react";
import { X, ChevronRight } from "lucide-react";
import api from "../../lib/api";
import MathRenderer from "../../components/MathRenderer";
import { DIFFICULTY_MAP, TIPE_SOAL } from "./soal-form/constants";
import { normalizeMenjodohkan } from "../soal/soalUtils";
import useWindowWidth from "../../hooks/useWindowWidth";

function DifficultyBadge({ level }) {
  const d = DIFFICULTY_MAP[level] || DIFFICULTY_MAP[1];
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

function AnswerPreview({ soal }) {
  const { tipe, options, answer } = soal;

  if (tipe === "pilihan_ganda") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {options?.map((opt) => {
          const isAns = answer === opt.label;
          return (
            <div
              key={opt.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "10px",
                border: isAns ? "2px solid #1a8a6e" : "1px solid #e2ddd5",
                background: isAns ? "#e4f5f0" : "white",
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
                  color: isAns ? "#1a8a6e" : "#6b6860",
                }}
              >
                {opt.label}
              </span>
              <span style={{ fontSize: "14px", color: "#0f0e17", flex: 1 }}>
                <MathRenderer text={opt.text} />
              </span>
              {isAns && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#1a8a6e",
                  }}
                >
                  Benar
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (tipe === "isian_singkat" || tipe === "isian_numerik") {
    return (
      <div
        style={{
          padding: "14px",
          borderRadius: "10px",
          border: "2px solid #1a8a6e",
          background: "#e4f5f0",
          fontSize: "15px",
          fontWeight: "600",
          color: "#0F6E56",
        }}
      >
        {answer}
      </div>
    );
  }

  if (tipe === "checklist") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {options?.map((opt) => {
          const isAns = Array.isArray(answer) && answer.includes(opt.label);
          return (
            <div
              key={opt.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "10px",
                border: isAns ? "2px solid #1a8a6e" : "1px solid #e2ddd5",
                background: isAns ? "#e4f5f0" : "white",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "4px",
                  border: `2px solid ${isAns ? "#1a8a6e" : "#e2ddd5"}`,
                  background: isAns ? "#1a8a6e" : "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {isAns && (
                  <span
                    style={{
                      color: "white",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    ✓
                  </span>
                )}
              </div>
              <span style={{ fontSize: "14px", color: "#0f0e17", flex: 1 }}>
                <MathRenderer text={opt.text} />
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  if (tipe === "multiple_choice_table" && options?.[0]?.cols) {
    const answerObj =
      typeof answer === "object" && !Array.isArray(answer) ? answer : {};
    return (
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  padding: "8px 12px",
                  textAlign: "left",
                  background: "#f2efe8",
                  fontWeight: "600",
                  color: "#6b6860",
                  fontSize: "12px",
                }}
              >
                Pernyataan
              </th>
              {options[0].cols.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "8px 16px",
                    textAlign: "center",
                    background: "#f2efe8",
                    fontWeight: "700",
                    color: "#0f0e17",
                    fontSize: "13px",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {options.map((row, i) => (
              <tr
                key={row.label}
                style={{ background: i % 2 === 0 ? "white" : "#faf9f6" }}
              >
                <td style={{ padding: "10px 12px", color: "#0f0e17" }}>
                  <MathRenderer text={row.text} />
                </td>
                {row.cols.map((col) => {
                  const isAns = answerObj[row.label] === col;
                  return (
                    <td
                      key={col}
                      style={{ padding: "10px 16px", textAlign: "center" }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          border: `2px solid ${isAns ? "#1a8a6e" : "#e2ddd5"}`,
                          background: isAns ? "#1a8a6e" : "white",
                          margin: "0 auto",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isAns && (
                          <span
                            style={{
                              color: "white",
                              fontSize: "11px",
                              fontWeight: "700",
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (tipe === "menjodohkan") {
    const { left: leftItems, right: rightItems } =
      normalizeMenjodohkan(options);
    const answerObj =
      typeof answer === "object" && !Array.isArray(answer) ? answer : {};
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {leftItems.map((leftText, li) => {
          const ri =
            answerObj[String(li)] !== undefined
              ? parseInt(answerObj[String(li)])
              : null;
          const rightText = ri !== null ? rightItems[ri] : null;
          return (
            <div
              key={li}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "10px",
                border: rightText ? "2px solid #1a8a6e" : "1px solid #e2ddd5",
                background: rightText ? "#e4f5f0" : "white",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#6b6860",
                  flexShrink: 0,
                }}
              >
                {li + 1}.
              </span>
              <span
                style={{
                  fontSize: "14px",
                  color: "#0f0e17",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <MathRenderer text={leftText} />
              </span>
              <span style={{ color: "#b4b2a9", flexShrink: 0 }}>→</span>
              <span
                style={{
                  fontSize: "14px",
                  color: rightText ? "#1a8a6e" : "#b4b2a9",
                  fontWeight: rightText ? "600" : "400",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {rightText ? `${String.fromCharCode(65 + ri)}. ` : ""}
                {rightText ? <MathRenderer text={rightText} /> : "—"}
              </span>
            </div>
          );
        })}
        {rightItems.length > leftItems.length && (
          <div style={{ fontSize: "12px", color: "#b4b2a9" }}>
            {rightItems.length - leftItems.length} opsi kanan sebagai distraktor
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default function SoalPreviewModal({ soalId, onClose }) {
  const width = useWindowWidth();
  const isMobile = width <= 480;
  const [soal, setSoal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/admin/soal/detail?id=${soalId}`)
      .then((data) => {
        // Normalize answer menjodohkan
        if (data.tipe === "menjodohkan" && Array.isArray(data.answer)) {
          const obj = {};
          data.answer.forEach((rIdx, lIdx) => {
            obj[String(lIdx)] = String(rIdx);
          });
          data.answer = obj;
        }
        setSoal(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [soalId]);

  const tipeLabel =
    TIPE_SOAL.find((t) => t.value === soal?.tipe)?.label || soal?.tipe;

  return (
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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid #f2efe8",
            position: "sticky",
            top: 0,
            background: "white",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{ fontSize: "16px", fontWeight: "800", color: "#0f0e17" }}
            >
              Preview Soal
            </span>
            {soal && (
              <>
                <DifficultyBadge level={soal.difficulty} />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: "#f2efe8",
                    color: "#6b6860",
                  }}
                >
                  {tipeLabel}
                </span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b6860",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: isMobile ? "20px 16px" : "24px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {loading && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: "60px",
                    borderRadius: "10px",
                    background: "#f2efe8",
                    animation: "pulse 1.5s infinite",
                  }}
                />
              ))}
            </div>
          )}

          {!loading && soal && (
            <>
              {/* Meta info */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                {/* Baris 1: kode + status */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontFamily: "monospace",
                      fontWeight: "700",
                      color: "#b4b2a9",
                    }}
                  >
                    #{soal.kode}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "2px 7px",
                      borderRadius: "5px",
                      background:
                        soal.is_published == 1 ? "#e4f5f0" : "#f2efe8",
                      color: soal.is_published == 1 ? "#1a8a6e" : "#6b6860",
                    }}
                  >
                    {soal.is_published == 1 ? "Published" : "Draft"}
                  </span>
                </div>

                {/* Baris 2: breadcrumb */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    flexWrap: "wrap",
                  }}
                >
                  {[soal.jenjang, soal.mapel, soal.topik, soal.subtopik]
                    .filter(Boolean)
                    .map((item, i, arr) => (
                      <span
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span style={{ fontSize: "13px", color: "#6b6860" }}>
                          {item}
                        </span>
                        {i < arr.length - 1 && (
                          <ChevronRight size={12} color="#b4b2a9" />
                        )}
                      </span>
                    ))}
                </div>
              </div>

              {/* Soal */}
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
                  Soal
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    color: "#0f0e17",
                    fontWeight: "500",
                    lineHeight: "1.7",
                  }}
                >
                  <MathRenderer text={soal.body} block />
                </div>
              </div>

              {/* Jawaban */}
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
                  {soal.tipe === "isian_singkat" ||
                  soal.tipe === "isian_numerik"
                    ? "Kunci Jawaban"
                    : "Pilihan Jawaban"}
                </div>
                <AnswerPreview soal={soal} />
              </div>

              {/* Pembahasan */}
              {soal.explanation && (
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
                      fontSize: "14px",
                      color: "#0f0e17",
                      lineHeight: "1.7",
                    }}
                  >
                    <MathRenderer text={soal.explanation} block />
                  </div>
                </div>
              )}

              {/* Video */}
              {soal.video_url && (
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
                      borderRadius: "10px",
                      overflow: "hidden",
                      aspectRatio: "16/9",
                    }}
                  >
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${
                        soal.video_url.match(
                          /(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/
                        )?.[1]
                      }`}
                      frameBorder="0"
                      allowFullScreen
                      style={{ display: "block" }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
