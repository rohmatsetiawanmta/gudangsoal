// src/features/soal/SoalDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Lock,
  CheckCircle,
  XCircle,
  Flag,
  X,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import MathRenderer from "../../components/MathRenderer";
import Breadcrumb from "../../components/Breadcrumb";
import Navbar from "../../components/Navbar";
import { getSoalDetail, getSoalStatus } from "./soalApi";
import { saveSession } from "../profile/profileApi";
import { useAuthStore } from "../auth/authStore";
import api from "../../lib/api";

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

const KATEGORI_REPORT = [
  { value: "soal_salah", label: "Soal salah / ambigu" },
  { value: "jawaban_salah", label: "Jawaban salah" },
  { value: "pembahasan_salah", label: "Pembahasan salah" },
  { value: "typo", label: "Typo / salah ketik" },
  { value: "latex_error", label: "Rumus LaTeX error" },
  { value: "duplikat", label: "Soal duplikat" },
  { value: "lainnya", label: "Lainnya" },
];

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

// Cek apakah jawaban benar berdasarkan tipe
const checkCorrect = (tipe, chosen, answer) => {
  if (!chosen || answer === undefined || answer === null) return false;
  switch (tipe) {
    case "pilihan_ganda":
      return chosen === answer;
    case "isian_singkat":
      return (
        chosen.trim().toLowerCase() === String(answer).trim().toLowerCase()
      );
    case "isian_numerik":
      return parseFloat(chosen) === parseFloat(answer);
    case "checklist":
      if (!Array.isArray(chosen) || !Array.isArray(answer)) return false;
      return (
        chosen.length === answer.length &&
        [...chosen].sort().join(",") === [...answer].sort().join(",")
      );
    case "multiple_choice_table":
      if (typeof chosen !== "object" || typeof answer !== "object")
        return false;
      return JSON.stringify(chosen) === JSON.stringify(answer);
    default:
      return chosen === answer;
  }
};

// Format jawaban untuk ditampilkan
const formatAnswer = (tipe, answer) => {
  if (answer === null || answer === undefined) return "—";
  switch (tipe) {
    case "checklist":
      return Array.isArray(answer) ? answer.join(", ") : String(answer);
    case "multiple_choice_table":
      if (typeof answer === "object" && !Array.isArray(answer)) {
        return Object.entries(answer)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
      }
      return String(answer);
    default:
      return String(answer);
  }
};

// Inisialisasi chosen kosong berdasarkan tipe
const initChosen = (tipe) => {
  switch (tipe) {
    case "checklist":
      return [];
    case "multiple_choice_table":
      return {};
    default:
      return "";
  }
};

export default function SoalDetail() {
  const { kode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [soal, setSoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chosen, setChosen] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadyCorrect, setAlreadyCorrect] = useState(false);
  const [copied, setCopied] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ kategori: "", deskripsi: "" });
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState("");
  const [reportError, setReportError] = useState("");

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
    setChosen("");
    setSubmitted(false);
    setAlreadyCorrect(false);
    setLoading(true);

    if (user) {
      Promise.all([getSoalDetail(kode), getSoalStatus(kode)])
        .then(([data, status]) => {
          setSoal(data);
          fillBreadcrumb(data);
          setChosen(initChosen(data.tipe));
          if (status?.answered_correct) {
            setAlreadyCorrect(true);
            setSubmitted(true);
            setChosen(data.answer);
          }
        })
        .catch(() => setError("Gagal memuat soal"))
        .finally(() => setLoading(false));
    } else {
      getSoalDetail(kode)
        .then((data) => {
          setSoal(data);
          fillBreadcrumb(data);
          setChosen(initChosen(data.tipe));
        })
        .catch(() => setError("Gagal memuat soal"))
        .finally(() => setLoading(false));
    }
  }, [kode, user]);

  const isCorrect = soal ? checkCorrect(soal.tipe, chosen, soal.answer) : false;

  // Cek apakah chosen sudah terisi (valid untuk submit)
  const isChosenValid = () => {
    if (!soal) return false;
    switch (soal.tipe) {
      case "pilihan_ganda":
      case "isian_singkat":
      case "isian_numerik":
        return !!chosen;
      case "checklist":
        return Array.isArray(chosen) && chosen.length > 0;
      case "multiple_choice_table":
        return (
          typeof chosen === "object" &&
          soal.options?.every((o) => chosen[o.label])
        );
      default:
        return !!chosen;
    }
  };

  const handleSubmit = async () => {
    if (!isChosenValid() || alreadyCorrect) return;
    setSubmitted(true);

    if (user) {
      try {
        await saveSession({
          soal_id: soal.id,
          kode: soal.kode,
          difficulty: soal.difficulty,
          is_correct: isCorrect ? 1 : 0,
        });
      } catch {}
    }
  };

  const handleReset = () => {
    setChosen(initChosen(soal?.tipe));
    setSubmitted(false);
  };

  const handleReport = async () => {
    if (!reportForm.kategori) {
      setReportError("Pilih kategori laporan");
      return;
    }
    setReportLoading(true);
    setReportError("");
    try {
      await api.post("/report", {
        soal_kode: kode,
        kategori: reportForm.kategori,
        deskripsi: reportForm.deskripsi || null,
      });
      setReportSuccess("Laporan berhasil dikirim, terima kasih!");
      setReportForm({ kategori: "", deskripsi: "" });
      setTimeout(() => {
        setReportOpen(false);
        setReportSuccess("");
      }, 2000);
    } catch (err) {
      setReportError(err.error || "Gagal mengirim laporan");
    } finally {
      setReportLoading(false);
    }
  };

  const showPembahasan = user || soal?.is_public_explanation == 1;

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

  // Render input jawaban berdasarkan tipe
  const renderJawabanInput = () => {
    if (!soal) return null;
    const tipe = soal.tipe || "pilihan_ganda";

    // Pilihan Ganda
    if (tipe === "pilihan_ganda") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {soal.options?.map((opt) => {
            const isChosen = chosen === opt.label;
            const isAnswer =
              (isCorrect || alreadyCorrect) && opt.label === soal.answer;
            const isWrong =
              submitted &&
              !isCorrect &&
              !alreadyCorrect &&
              opt.label === chosen;
            let border = "1px solid #e2ddd5",
              bg = "white",
              labelColor = "#6b6860";
            if (!submitted) {
              if (isChosen) {
                border = "2px solid #e84c2b";
                bg = "#fff3f0";
                labelColor = "#e84c2b";
              }
            } else if (isAnswer) {
              border = "2px solid #1a8a6e";
              bg = "#e4f5f0";
              labelColor = "#1a8a6e";
            } else if (isWrong) {
              border = "2px solid #e84c2b";
              bg = "#fff3f0";
              labelColor = "#e84c2b";
            }
            return (
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
                  cursor: submitted || alreadyCorrect ? "default" : "pointer",
                  transition: "all .15s",
                  border,
                  background: bg,
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
                    color: labelColor,
                  }}
                >
                  {opt.label}
                </span>
                <span style={{ fontSize: "15px", color: "#0f0e17", flex: 1 }}>
                  <MathRenderer text={opt.text} />
                </span>
                {submitted && isAnswer && (
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
                {submitted && isWrong && (
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
            );
          })}
        </div>
      );
    }

    // Isian Singkat & Numerik
    if (tipe === "isian_singkat" || tipe === "isian_numerik") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            value={chosen || ""}
            onChange={(e) =>
              !submitted && !alreadyCorrect && setChosen(e.target.value)
            }
            disabled={submitted || alreadyCorrect}
            type={tipe === "isian_numerik" ? "number" : "text"}
            placeholder={
              tipe === "isian_numerik"
                ? "Tulis jawaban angka..."
                : "Tulis jawabanmu..."
            }
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              fontSize: "16px",
              outline: "none",
              fontFamily: "inherit",
              color: "#0f0e17",
              border: !submitted
                ? "2px solid #e2ddd5"
                : isCorrect || alreadyCorrect
                ? "2px solid #1a8a6e"
                : "2px solid #e84c2b",
              background: !submitted
                ? "white"
                : isCorrect || alreadyCorrect
                ? "#e4f5f0"
                : "#fff3f0",
            }}
            onFocus={(e) => {
              if (!submitted) e.target.style.borderColor = "#e84c2b";
            }}
            onBlur={(e) => {
              if (!submitted) e.target.style.borderColor = "#e2ddd5";
            }}
          />
          {submitted && !isCorrect && !alreadyCorrect && (
            <div
              style={{ fontSize: "13px", color: "#e84c2b", fontWeight: "600" }}
            >
              Jawaban kurang tepat, coba lagi.
            </div>
          )}
        </div>
      );
    }

    // Checklist
    if (tipe === "checklist") {
      const chosenArr = Array.isArray(chosen) ? chosen : [];
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div
            style={{ fontSize: "13px", color: "#6b6860", marginBottom: "4px" }}
          >
            Pilih semua jawaban yang benar:
          </div>
          {soal.options?.map((opt) => {
            const isChosen = chosenArr.includes(opt.label);
            const answerArr = Array.isArray(soal.answer) ? soal.answer : [];
            const isAnswer =
              (isCorrect || alreadyCorrect) && answerArr.includes(opt.label);
            const isWrong =
              submitted &&
              !isCorrect &&
              !alreadyCorrect &&
              isChosen &&
              !answerArr.includes(opt.label);
            let border = "1px solid #e2ddd5",
              bg = "white",
              checkBg = "white",
              checkBorder = "#e2ddd5",
              checkColor = "transparent";
            if (!submitted) {
              if (isChosen) {
                border = "2px solid #e84c2b";
                bg = "#fff3f0";
                checkBg = "#e84c2b";
                checkBorder = "#e84c2b";
                checkColor = "white";
              }
            } else if (isAnswer) {
              border = "2px solid #1a8a6e";
              bg = "#e4f5f0";
              checkBg = "#1a8a6e";
              checkBorder = "#1a8a6e";
              checkColor = "white";
            } else if (isWrong) {
              border = "2px solid #e84c2b";
              bg = "#fff3f0";
              checkBg = "#e84c2b";
              checkBorder = "#e84c2b";
              checkColor = "white";
            } else if (isChosen) {
              border = "1px solid #e2ddd5";
              bg = "white";
            }

            const toggle = () => {
              if (submitted || alreadyCorrect) return;
              setChosen((prev) => {
                const arr = Array.isArray(prev) ? prev : [];
                return arr.includes(opt.label)
                  ? arr.filter((a) => a !== opt.label)
                  : [...arr, opt.label].sort();
              });
            };

            return (
              <div
                key={opt.label}
                onClick={toggle}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "13px 16px",
                  borderRadius: "12px",
                  cursor: submitted || alreadyCorrect ? "default" : "pointer",
                  transition: "all .15s",
                  border,
                  background: bg,
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "6px",
                    border: `2px solid ${checkBorder}`,
                    background: checkBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all .15s",
                  }}
                >
                  {(isChosen || isAnswer) && (
                    <span
                      style={{
                        color: checkColor,
                        fontSize: "12px",
                        fontWeight: "800",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: "#6b6860",
                    flexShrink: 0,
                  }}
                >
                  {opt.label}
                </span>
                <span style={{ fontSize: "15px", color: "#0f0e17", flex: 1 }}>
                  <MathRenderer text={opt.text} />
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    // Multiple Choice Table
    if (tipe === "multiple_choice_table") {
      const chosenObj =
        typeof chosen === "object" && !Array.isArray(chosen) && chosen !== null
          ? chosen
          : {};
      const cols = soal.options?.[0]?.cols || [];
      const answerObj =
        typeof soal.answer === "object" && !Array.isArray(soal.answer)
          ? soal.answer
          : {};

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0",
            overflowX: "auto",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `1fr ${cols.map(() => "80px").join(" ")}`,
              gap: "8px",
              padding: "10px 14px",
              background: "#f2efe8",
              borderRadius: "10px 10px 0 0",
              marginBottom: "2px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#6b6860",
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              Pernyataan
            </div>
            {cols.map((col) => (
              <div
                key={col}
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#0f0e17",
                  textAlign: "center",
                }}
              >
                {col}
              </div>
            ))}
          </div>

          {/* Rows */}
          {soal.options?.map((row, rowIdx) => {
            const rowAnswer = answerObj[row.label];
            const rowChosen = chosenObj[row.label];
            const rowCorrect = submitted && rowChosen === rowAnswer;
            const rowWrong =
              submitted &&
              !isCorrect &&
              !alreadyCorrect &&
              rowChosen &&
              rowChosen !== rowAnswer;

            return (
              <div
                key={row.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: `1fr ${cols
                    .map(() => "80px")
                    .join(" ")}`,
                  gap: "8px",
                  padding: "12px 14px",
                  background: rowIdx % 2 === 0 ? "white" : "#faf9f6",
                  borderRadius:
                    rowIdx === soal.options.length - 1 ? "0 0 10px 10px" : "0",
                  border: "1px solid #f2efe8",
                  borderTop: "none",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: "14px", color: "#0f0e17" }}>
                  <MathRenderer text={row.text} />
                </div>
                {cols.map((col) => {
                  const isSelected = rowChosen === col;
                  const isAns =
                    (isCorrect || alreadyCorrect) && rowAnswer === col;
                  const isWrong =
                    submitted &&
                    !isCorrect &&
                    !alreadyCorrect &&
                    isSelected &&
                    col !== rowAnswer;

                  let bg = "white",
                    border = "2px solid #e2ddd5",
                    color = "#6b6860";
                  if (!submitted) {
                    if (isSelected) {
                      bg = "#fff3f0";
                      border = "2px solid #e84c2b";
                      color = "#e84c2b";
                    }
                  } else if (isAns) {
                    bg = "#e4f5f0";
                    border = "2px solid #1a8a6e";
                    color = "#1a8a6e";
                  } else if (isWrong) {
                    bg = "#fff3f0";
                    border = "2px solid #e84c2b";
                    color = "#e84c2b";
                  } else if (isSelected) {
                    bg = "white";
                    border = "2px solid #e2ddd5";
                    color = "#6b6860";
                  }

                  return (
                    <div
                      key={col}
                      onClick={() => {
                        if (submitted || alreadyCorrect) return;
                        setChosen((prev) => {
                          const obj =
                            typeof prev === "object" &&
                            !Array.isArray(prev) &&
                            prev !== null
                              ? prev
                              : {};
                          return { ...obj, [row.label]: col };
                        });
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          border,
                          background: bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor:
                            submitted || alreadyCorrect ? "default" : "pointer",
                          transition: "all .15s",
                          fontSize: "13px",
                          fontWeight: "700",
                          color,
                        }}
                      >
                        {isSelected || isAns ? col : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://gudangsoal.com/soal/${kode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWA = () => {
    const text = encodeURIComponent(
      `Coba kerjakan soal ini di Gudang Soal!\nhttps://gudangsoal.com/soal/${kode}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

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
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <DifficultyBadge level={soal.difficulty} />
                </div>
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

              {/* Input jawaban */}
              {renderJawabanInput()}

              {/* Submit / Coba Lagi */}
              {!alreadyCorrect && (
                <div style={{ display: "flex", gap: "10px" }}>
                  {!submitted ? (
                    <button
                      onClick={handleSubmit}
                      disabled={!isChosenValid()}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "12px",
                        background: isChosenValid() ? "#e84c2b" : "#e2ddd5",
                        color: isChosenValid() ? "white" : "#b4b2a9",
                        border: "none",
                        fontWeight: "700",
                        fontSize: "15px",
                        cursor: isChosenValid() ? "pointer" : "not-allowed",
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
                  alignItems: "center",
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

                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  {/* Share */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <button
                      onClick={handleCopy}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: copied ? "#1a8a6e" : "#6b6860",
                        fontSize: "13px",
                        fontFamily: "inherit",
                        padding: 0,
                        transition: "color .15s",
                      }}
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      {copied ? "Tersalin!" : "Salin link"}
                    </button>
                    {/* <button
                      onClick={handleShareWA}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#6b6860",
                        fontSize: "13px",
                        fontFamily: "inherit",
                        padding: 0,
                        transition: "color .15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#25D366")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#6b6860")
                      }
                    >
                      <Share2 size={13} />
                      WhatsApp
                    </button> */}
                  </div>

                  {/* Flag */}
                  <button
                    onClick={() => {
                      setReportOpen(true);
                      setReportError("");
                      setReportSuccess("");
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#b4b2a9",
                      fontSize: "13px",
                      fontFamily: "inherit",
                      padding: 0,
                      transition: "color .15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#e84c2b")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#b4b2a9")
                    }
                  >
                    <Flag size={13} />
                    Laporkan
                  </button>
                </div>
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
                    {soal.tipe === "multiple_choice_table"
                      ? "Pilih jawaban untuk setiap pernyataan, lalu klik Submit."
                      : soal.tipe === "checklist"
                      ? "Pilih semua jawaban yang benar, lalu klik Submit."
                      : "Pilih jawaban dan klik Submit untuk melihat pembahasan."}
                  </p>
                </div>
              ) : !isCorrect && !alreadyCorrect ? (
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
                        Jawaban:{" "}
                        <strong>{formatAnswer(soal.tipe, soal.answer)}</strong>
                      </div>
                    </div>
                  </div>

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
                      style={{
                        fontSize: "14px",
                        color: "#6b6860",
                        fontStyle: "italic",
                      }}
                    >
                      Pembahasan belum tersedia untuk soal ini.
                    </div>
                  )}

                  {/* Video */}
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

                  {/* Banner daftar — kalau tidak login */}
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

        {/* Modal Report */}
        {reportOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 300,
              padding: "24px",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "28px",
                maxWidth: "440px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Flag size={18} color="#e84c2b" />
                  <h3
                    style={{
                      fontSize: "17px",
                      fontWeight: "800",
                      color: "#0f0e17",
                    }}
                  >
                    Laporkan Soal
                  </h3>
                </div>
                <button
                  onClick={() => setReportOpen(false)}
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

              {reportSuccess ? (
                <div
                  style={{
                    background: "#e4f5f0",
                    border: "1px solid #9FE1CB",
                    color: "#0F6E56",
                    fontSize: "14px",
                    borderRadius: "12px",
                    padding: "16px",
                    textAlign: "center",
                    fontWeight: "500",
                  }}
                >
                  {reportSuccess}
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  {reportError && (
                    <div
                      style={{
                        background: "#fff3f0",
                        border: "1px solid #fca5a5",
                        color: "#b91c1c",
                        fontSize: "13px",
                        borderRadius: "10px",
                        padding: "10px 14px",
                      }}
                    >
                      {reportError}
                    </div>
                  )}
                  <div
                    style={{
                      background: "#f2efe8",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      fontSize: "13px",
                      color: "#6b6860",
                    }}
                  >
                    Soal{" "}
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: "700",
                        color: "#0f0e17",
                      }}
                    >
                      #{kode}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#0f0e17",
                      }}
                    >
                      Kategori Laporan
                    </label>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      {KATEGORI_REPORT.map((k) => (
                        <label
                          key={k.value}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 14px",
                            borderRadius: "10px",
                            border: `1.5px solid ${
                              reportForm.kategori === k.value
                                ? "#e84c2b"
                                : "#e2ddd5"
                            }`,
                            background:
                              reportForm.kategori === k.value
                                ? "#fff3f0"
                                : "white",
                            cursor: "pointer",
                            transition: "all .15s",
                          }}
                        >
                          <input
                            type="radio"
                            name="kategori"
                            value={k.value}
                            checked={reportForm.kategori === k.value}
                            onChange={() =>
                              setReportForm((f) => ({
                                ...f,
                                kategori: k.value,
                              }))
                            }
                            style={{ accentColor: "#e84c2b", flexShrink: 0 }}
                          />
                          <span
                            style={{
                              fontSize: "14px",
                              color:
                                reportForm.kategori === k.value
                                  ? "#e84c2b"
                                  : "#0f0e17",
                              fontWeight:
                                reportForm.kategori === k.value ? "600" : "400",
                            }}
                          >
                            {k.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#0f0e17",
                      }}
                    >
                      Deskripsi{" "}
                      <span style={{ fontWeight: "400", color: "#6b6860" }}>
                        (opsional)
                      </span>
                    </label>
                    <textarea
                      value={reportForm.deskripsi}
                      onChange={(e) =>
                        setReportForm((f) => ({
                          ...f,
                          deskripsi: e.target.value,
                        }))
                      }
                      placeholder="Jelaskan masalah yang kamu temukan..."
                      rows={3}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #e2ddd5",
                        fontSize: "14px",
                        outline: "none",
                        fontFamily: "inherit",
                        color: "#0f0e17",
                        resize: "none",
                        lineHeight: "1.6",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                      onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      onClick={() => setReportOpen(false)}
                      style={{
                        padding: "9px 20px",
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
                      onClick={handleReport}
                      disabled={reportLoading || !reportForm.kategori}
                      style={{
                        padding: "9px 20px",
                        borderRadius: "10px",
                        border: "none",
                        background:
                          reportLoading || !reportForm.kategori
                            ? "#e2ddd5"
                            : "#e84c2b",
                        color:
                          reportLoading || !reportForm.kategori
                            ? "#b4b2a9"
                            : "white",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor:
                          reportLoading || !reportForm.kategori
                            ? "not-allowed"
                            : "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {reportLoading ? "Mengirim..." : "Kirim Laporan"}
                    </button>
                  </div>
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
