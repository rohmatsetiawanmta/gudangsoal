// src/features/quiz/QuizPage.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Warehouse,
} from "lucide-react";
import MathRenderer from "../../components/MathRenderer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";
import {
  saveQuizProgress,
  finishQuiz,
  getQuizDetail,
  startQuiz,
} from "./quizApi";
import JawabanInput from "../soal/components/JawabanInput";
import { initChosen } from "../soal/soalUtils";
import api from "../../lib/api";

function TimerDisplay({ sisaWaktu, isMobile }) {
  const menit = Math.floor(sisaWaktu / 60);
  const detik = sisaWaktu % 60;
  const isWarning = sisaWaktu <= 300;
  const isCritical = sisaWaktu <= 60;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 14px",
        borderRadius: "10px",
        background: isCritical ? "#fff3f0" : isWarning ? "#faeeda" : "#f2efe8",
        border: `1px solid ${
          isCritical ? "#fca5a5" : isWarning ? "#f5a623" : "#e2ddd5"
        }`,
      }}
    >
      <span
        style={{
          fontSize: isMobile ? "14px" : "16px",
          fontWeight: "800",
          fontFamily: "monospace",
          color: isCritical ? "#e84c2b" : isWarning ? "#854F0B" : "#0f0e17",
        }}
      >
        {String(menit).padStart(2, "0")}:{String(detik).padStart(2, "0")}
      </span>
    </div>
  );
}

function NavigasiPanel({ soalList, currentIdx, answers, onJump }) {
  const [navPage, setNavPage] = useState(0);
  const perPage = 10;
  const totalPages = Math.ceil(soalList.length / perPage);
  const start = navPage * perPage;
  const pageNomor = soalList.slice(
    start,
    Math.min(start + perPage, soalList.length)
  );

  useEffect(() => {
    setNavPage(Math.floor(currentIdx / perPage));
  }, [currentIdx]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        alignItems: "center",
      }}
    >
      {/* Nomor soal */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <button
          onClick={() => setNavPage((p) => Math.max(0, p - 1))}
          disabled={navPage === 0}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "7px",
            border: "1px solid #e2ddd5",
            background: "white",
            cursor: navPage === 0 ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: navPage === 0 ? "#b4b2a9" : "#6b6860",
            flexShrink: 0,
          }}
        >
          <ChevronLeft size={13} />
        </button>

        <div style={{ display: "flex", gap: "4px" }}>
          {pageNomor.map((soalId, i) => {
            const globalIdx = start + i;
            const isActive = globalIdx === currentIdx;
            const ans = answers[soalId]?.jawaban;
            const isDijawab =
              ans !== null &&
              ans !== undefined &&
              ans !== "" &&
              !(Array.isArray(ans) && ans.length === 0) &&
              !(
                typeof ans === "object" &&
                !Array.isArray(ans) &&
                Object.keys(ans).length === 0
              );
            return (
              <button
                key={soalId}
                onClick={() => onJump(globalIdx)}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "7px",
                  border: `1.5px solid ${
                    isActive ? "#e84c2b" : isDijawab ? "#1a8a6e" : "#e2ddd5"
                  }`,
                  background: isActive
                    ? "#e84c2b"
                    : isDijawab
                    ? "#e4f5f0"
                    : "white",
                  color: isActive ? "white" : isDijawab ? "#1a8a6e" : "#6b6860",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  flexShrink: 0,
                }}
              >
                {globalIdx + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setNavPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={navPage === totalPages - 1}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "7px",
            border: "1px solid #e2ddd5",
            background: "white",
            cursor: navPage === totalPages - 1 ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: navPage === totalPages - 1 ? "#b4b2a9" : "#6b6860",
            flexShrink: 0,
          }}
        >
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          fontSize: "11px",
          color: "#6b6860",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "3px",
              background: "#e84c2b",
            }}
          />{" "}
          Aktif
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "3px",
              background: "#e4f5f0",
              border: "1px solid #1a8a6e",
            }}
          />{" "}
          Dijawab
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "3px",
              background: "white",
              border: "1px solid #e2ddd5",
            }}
          />{" "}
          Belum
        </div>
      </div>
    </div>
  );
}

export default function QuizPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [quizSet, setQuizSet] = useState(null);
  const [soalList, setSoalList] = useState([]);
  const [soalData, setSoalData] = useState({});
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sisaWaktu, setSisaWaktu] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [waktuMasuk, setWaktuMasuk] = useState(Date.now());

  const timerRef = useRef(null);
  const sessionIdRef = useRef(null);
  const answersRef = useRef({});
  const sisaWaktuRef = useRef(0);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    sisaWaktuRef.current = sisaWaktu;
  }, [sisaWaktu]);
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const saveToBackend = useCallback(async () => {
    if (!sessionIdRef.current) return;
    try {
      await saveQuizProgress(
        sessionIdRef.current,
        answersRef.current,
        sisaWaktuRef.current
      );
    } catch {}
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) saveToBackend();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [saveToBackend]);

  useEffect(() => {
    const initQuiz = async () => {
      setLoading(true);
      try {
        const res = await startQuiz(id);

        if (res.auto_finished) {
          navigate(`/latihan/${id}/hasil/${res.session_id}`);
          return;
        }

        if (res.resumed) setShowResume(true);

        setSessionId(res.session_id);
        setSoalList(res.urutan_soal || []);
        setAnswers(res.answers || {});
        setSisaWaktu(res.sisa_waktu || 0);

        const qset = await getQuizDetail(id);
        setQuizSet(qset);

        const soalDetails = {};
        await Promise.all(
          (res.urutan_soal || []).map(async (soalId) => {
            const data = await api.get(`/quiz/soal/${soalId}`);
            soalDetails[soalId] = data;
          })
        );
        setSoalData(soalDetails);
      } catch {
        navigate(`/latihan/${id}`);
      } finally {
        setLoading(false);
      }
    };

    initQuiz();
  }, [id]);

  useEffect(() => {
    if (loading || sisaWaktu <= 0) return;

    timerRef.current = setInterval(() => {
      setSisaWaktu((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        if (prev % 30 === 0) saveToBackend();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading]);

  const currentSoalId = soalList[currentIdx];
  const currentSoal = soalData[currentSoalId];

  const getChosen = (soalId) => {
    const ans = answers[soalId];
    if (ans?.jawaban !== undefined) return ans.jawaban;
    if (soalData[soalId]) return initChosen(soalData[soalId].tipe);
    return "";
  };

  const updateWaktuSoal = useCallback(() => {
    if (!currentSoalId) return;
    const elapsed = Math.floor((Date.now() - waktuMasuk) / 1000);
    setAnswers((prev) => ({
      ...prev,
      [currentSoalId]: {
        ...prev[currentSoalId],
        jawaban: prev[currentSoalId]?.jawaban ?? null,
        waktu_detik: (prev[currentSoalId]?.waktu_detik || 0) + elapsed,
      },
    }));
  }, [currentSoalId, waktuMasuk]);

  const setChosen = (soalId, value) => {
    const elapsed = Math.floor((Date.now() - waktuMasuk) / 1000);
    setAnswers((prev) => ({
      ...prev,
      [soalId]: {
        jawaban: value,
        waktu_detik: (prev[soalId]?.waktu_detik || 0) + elapsed,
      },
    }));
    setWaktuMasuk(Date.now());
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      updateWaktuSoal();
      setCurrentIdx((i) => i - 1);
      setWaktuMasuk(Date.now());
      saveToBackend();
    }
  };

  const handleNext = () => {
    if (currentIdx < soalList.length - 1) {
      updateWaktuSoal();
      setCurrentIdx((i) => i + 1);
      setWaktuMasuk(Date.now());
      saveToBackend();
    }
  };

  const handleJump = (idx) => {
    updateWaktuSoal();
    setCurrentIdx(idx);
    setWaktuMasuk(Date.now());
    saveToBackend();
  };

  const doSubmit = async () => {
    if (!sessionId) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      await saveQuizProgress(
        sessionId,
        answersRef.current,
        sisaWaktuRef.current
      );
      await finishQuiz(sessionId);
      navigate(`/latihan/${id}/hasil/${sessionId}`);
    } catch (e) {
      console.error("submit error:", e);
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (!sessionIdRef.current) return;
    try {
      await saveQuizProgress(sessionIdRef.current, answersRef.current, 0);
      await finishQuiz(sessionIdRef.current);
      navigate(`/latihan/${id}/hasil/${sessionIdRef.current}`);
    } catch {}
  };

  const jumlahDijawab = soalList.filter((sid) => {
    const ans = answers[sid]?.jawaban;
    if (ans === null || ans === undefined || ans === "") return false;
    if (Array.isArray(ans) && ans.length === 0) return false;
    if (
      typeof ans === "object" &&
      !Array.isArray(ans) &&
      Object.keys(ans).length === 0
    )
      return false;
    return true;
  }).length;

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: "#faf9f6",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: "14px", color: "#6b6860" }}>Memuat soal...</div>
      </div>
    );

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
        title={`${quizSet?.judul || "Quiz"} — Mode Latihan`}
        url={`/latihan/${id}/quiz`}
      />

      {/* Resume dialog */}
      {showResume && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 400,
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
              Lanjutkan Latihan?
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6b6860",
                marginBottom: "6px",
              }}
            >
              {quizSet?.judul}
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#6b6860",
                marginBottom: "24px",
              }}
            >
              Sisa waktu:{" "}
              <strong>
                {Math.floor(sisaWaktu / 60)} menit {sisaWaktu % 60} detik
              </strong>
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={async () => {
                  setShowResume(false);
                  await doSubmit();
                }}
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
                Selesaikan Sesi
              </button>
              <button
                onClick={() => setShowResume(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#e84c2b",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm submit */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 400,
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
              Submit Jawaban?
            </h3>
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b6860",
                  marginBottom: "8px",
                }}
              >
                {jumlahDijawab} dari {soalList.length} soal sudah dijawab.
              </div>
              {jumlahDijawab < soalList.length && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "#fff3f0",
                    border: "1px solid #fca5a5",
                  }}
                >
                  <AlertCircle size={15} color="#e84c2b" />
                  <span style={{ fontSize: "13px", color: "#b91c1c" }}>
                    {soalList.length - jumlahDijawab} soal belum dijawab akan
                    dihitung salah.
                  </span>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowConfirm(false)}
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
                Kembali
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  doSubmit();
                }}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#e84c2b",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {submitting ? "Submitting..." : "Ya, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

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
        {/* Kiri — back + logo + judul */}
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
            onClick={() => navigate(`/latihan/${id}`)}
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
              {quizSet?.judul}
            </span>
          )}
        </div>

        {/* Kanan — timer + submit */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <TimerDisplay sisaWaktu={sisaWaktu} isMobile={isMobile} />
          <button
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            style={{
              padding: isMobile ? "7px 12px" : "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: "#e84c2b",
              color: "white",
              fontSize: "13px",
              fontWeight: "700",
              cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {submitting ? "..." : "Submit"}
          </button>
        </div>
      </div>

      {/* Panel navigasi soal — sticky di bawah navbar */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #f2efe8",
          padding: isMobile ? "10px 16px" : "10px 40px",
          position: "sticky",
          top: "56px",
          zIndex: 99,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <NavigasiPanel
          soalList={soalList}
          currentIdx={currentIdx}
          answers={answers}
          onJump={handleJump}
        />
      </div>

      {/* Main */}
      <main
        style={{
          flex: 1,
          maxWidth: "800px",
          margin: "0 auto",
          padding: isMobile ? "20px 16px" : "32px 40px",
          width: "100%",
        }}
      >
        {currentSoal ? (
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              border: "1px solid #e2ddd5",
              padding: isMobile ? "20px" : "32px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Meta */}
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
                    color: "#6b6860",
                  }}
                >
                  Soal {currentIdx + 1} dari {soalList.length}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#b4b2a9",
                    fontFamily: "monospace",
                  }}
                >
                  #{currentSoal.kode}
                </span>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                {(() => {
                  const map = {
                    1: { label: "Easy", color: "#1a8a6e", bg: "#e4f5f0" },
                    2: { label: "Medium", color: "#854F0B", bg: "#faeeda" },
                    3: { label: "Hard", color: "#e84c2b", bg: "#fff3f0" },
                  };
                  const d = map[currentSoal.difficulty] || map[1];
                  return (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: d.bg,
                        color: d.color,
                      }}
                    >
                      {d.label}
                    </span>
                  );
                })()}
                <span style={{ fontSize: "11px", color: "#b4b2a9" }}>
                  {jumlahDijawab}/{soalList.length} dijawab
                </span>
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

            {/* Input jawaban */}
            <JawabanInput
              soal={currentSoal}
              chosen={getChosen(currentSoalId)}
              setChosen={(val) => setChosen(currentSoalId, val)}
              submitted={false}
              alreadyCorrect={false}
              isCorrect={false}
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
                onClick={handlePrev}
                disabled={currentIdx === 0}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 16px",
                  borderRadius: "10px",
                  border: "1px solid #e2ddd5",
                  background: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: currentIdx === 0 ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  color: currentIdx === 0 ? "#b4b2a9" : "#0f0e17",
                }}
              >
                <ChevronLeft size={15} /> Sebelumnya
              </button>

              <span style={{ fontSize: "12px", color: "#b4b2a9" }}>
                {currentIdx + 1} / {soalList.length}
              </span>

              <button
                onClick={handleNext}
                disabled={currentIdx === soalList.length - 1}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 16px",
                  borderRadius: "10px",
                  border: "1px solid #e2ddd5",
                  background: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor:
                    currentIdx === soalList.length - 1
                      ? "not-allowed"
                      : "pointer",
                  fontFamily: "inherit",
                  color:
                    currentIdx === soalList.length - 1 ? "#b4b2a9" : "#0f0e17",
                }}
              >
                Berikutnya <ChevronRight size={15} />
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{ textAlign: "center", padding: "48px", color: "#6b6860" }}
          >
            Soal tidak ditemukan.
          </div>
        )}
      </main>
    </div>
  );
}
