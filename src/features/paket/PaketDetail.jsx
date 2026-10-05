// src/features/paket/PaketDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Package, List, Check, RotateCcw, Lock, Loader2,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import MathRenderer from "../../components/MathRenderer";
import useWindowWidth from "../../hooks/useWindowWidth";
import api from "../../lib/api";
import { loadMidtransSnap } from "../../lib/midtrans";
import JawabanInput from "../soal/components/JawabanInput";
import PembahasanPanel from "../soal/components/PembahasanPanel";
import { checkCorrect, initChosen } from "../soal/soalUtils";
import { saveSession } from "../profile/profileApi";
import { useAuthStore } from "../auth/authStore";

const JENIS_LABEL = {
  olimpiade: "Olimpiade", un: "Ujian Nasional", utbk: "UTBK/SNBT",
  seleksi: "Seleksi", ujian_sekolah: "Ujian Sekolah", lainnya: "Lainnya",
};
const DIFF_LABEL = { 1: "Mudah", 2: "Sedang", 3: "Sulit" };
const DIFF_COLOR = { 1: "#1a8a6e", 2: "#854F0B", 3: "#e84c2b" };

const NAV_WINDOW = 10;

function SoalNumberNav({ soalList, currentIdx, submitted, alreadyCorrect, answers, onJump }) {
  const total     = soalList.length;
  const navStart  = Math.floor(currentIdx / NAV_WINDOW) * NAV_WINDOW;
  const navEnd    = Math.min(navStart + NAV_WINDOW, total);
  const hasPrev   = navStart > 0;
  const hasNext   = navEnd < total;

  const btnBase = {
    width: "32px", height: "32px", borderRadius: "9px",
    fontSize: "12.5px", fontWeight: "700", cursor: "pointer",
    fontFamily: "inherit", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
      <button
        onClick={() => onJump(navStart - NAV_WINDOW)}
        disabled={!hasPrev}
        style={{ ...btnBase, border: "1px solid var(--gs-border)", background: "var(--gs-surface)", color: hasPrev ? "var(--gs-text-muted)" : "var(--gs-border)", cursor: hasPrev ? "pointer" : "not-allowed" }}
      >
        <ChevronLeft size={14} />
      </button>

      {soalList.slice(navStart, navEnd).map((soal, i) => {
        const idx        = navStart + i;
        const isCurrent  = idx === currentIdx;
        const isSubmit   = !!submitted[soal.id];
        const isCorrect  = !!alreadyCorrect[soal.id] || (isSubmit && checkCorrect(soal.tipe, answers[soal.id], soal.answer));
        const [bg, color, border] = isCurrent
          ? ["#e84c2b", "white", "#e84c2b"]
          : isCorrect
          ? ["#e4f5f0", "#1a8a6e", "#bfe8dc"]
          : isSubmit
          ? ["#fef9ee", "#f5a623", "#fbe5b8"]
          : ["var(--gs-surface)", "var(--gs-text-muted)", "var(--gs-border)"];
        return (
          <button
            key={soal.id}
            onClick={() => onJump(idx)}
            style={{ ...btnBase, border: `1px solid ${border}`, background: bg, color }}
          >
            {soal.urutan}
          </button>
        );
      })}

      <button
        onClick={() => onJump(navEnd)}
        disabled={!hasNext}
        style={{ ...btnBase, border: "1px solid var(--gs-border)", background: "var(--gs-surface)", color: hasNext ? "var(--gs-text-muted)" : "var(--gs-border)", cursor: hasNext ? "pointer" : "not-allowed" }}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

export default function PaketDetail() {
  const { id, urutan } = useParams();
  const navigate = useNavigate();
  const width    = useWindowWidth();
  const isMobile = width <= 480;
  const { user } = useAuthStore();

  const [paket,       setPaket]       = useState(null);
  const [soalList,    setSoalList]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  // View "soal" kalau URL punya :urutan (/paket/:id/soal/:urutan), selain itu "list"
  const view       = urutan ? "soal" : "list";
  const currentIdx = urutan ? soalList.findIndex((s) => String(s.urutan) === urutan) : -1;

  // Per-soal state
  const [answers,        setAnswers]        = useState({}); // { soalId: chosen }
  const [submitted,      setSubmitted]      = useState({}); // { soalId: bool }
  const [alreadyCorrect, setAlreadyCorrect] = useState({}); // { soalId: bool }

  // Checkout state
  const [checkingOut,  setCheckingOut]  = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Ambil data paket + soal. Tidak menyentuh `loading` sama sekali — pemanggil
  // yang memutuskan mau tampilkan full-page loader (mount awal) atau diam-diam
  // refresh di background (setelah checkout sukses).
  const fetchPaket = () => {
    return api.get(`/paket/${id}`)
      .then((d) => {
        setPaket(d.paket);
        const soal = Array.isArray(d.soal) ? d.soal : [];
        setSoalList(soal);
        const initAnswers = {};
        const initSubmitted = {};
        const initAlready = {};
        soal.forEach((s) => {
          if (s.answered_correct) {
            initAlready[s.id] = true;
            initSubmitted[s.id] = true;
            // pre-fill with correct answer so UI shows correctly
            initAnswers[s.id] = Array.isArray(s.answer) && s.tipe === "isian_multi"
              ? s.answer.reduce((o, v, i) => ({ ...o, [i]: v }), {})
              : s.answer;
          } else {
            initAnswers[s.id] = initChosen(s.tipe);
          }
        });
        setAnswers(initAnswers);
        setSubmitted(initSubmitted);
        setAlreadyCorrect(initAlready);
        // :urutan di URL tapi tidak cocok soal manapun di paket ini → balik ke daftar
        if (urutan && !soal.some((s) => String(s.urutan) === urutan)) {
          navigate(`/paket/${id}`, { replace: true });
        }
      })
      .catch(() => setError("Paket tidak ditemukan atau belum dipublikasikan."));
  };

  useEffect(() => {
    fetchPaket().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCheckout = async () => {
    if (!user) { navigate("/login"); return; }
    setCheckingOut(true);
    setCheckoutError("");
    try {
      const res = await api.post(`/paket/${id}/checkout`);
      const snap = await loadMidtransSnap();
      snap.pay(res.snap_token, {
        onSuccess:  () => fetchPaket(),
        onPending:  () => fetchPaket(),
        onError:    () => setCheckoutError("Pembayaran gagal, silakan coba lagi."),
        onClose:    () => {},
      });
    } catch (e) {
      setCheckoutError(e?.error || e?.message || "Gagal memulai pembayaran");
    } finally {
      setCheckingOut(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [urutan]);

  const currentSoal = currentIdx >= 0 ? soalList[currentIdx] ?? null : null;

  const goToSoal = (idx) => {
    const target = soalList[idx];
    if (!target) return;
    navigate(`/paket/${id}/soal/${target.urutan}`);
  };

  const handleSubmit = async () => {
    if (!currentSoal || alreadyCorrect[currentSoal.id]) return;
    const soal = currentSoal;
    const chosen = answers[soal.id];
    const isCorrect = checkCorrect(soal.tipe, chosen, soal.answer);
    setSubmitted((s) => ({ ...s, [soal.id]: true }));
    if (user) {
      try {
        await saveSession({
          soal_id: soal.id,
          kode: soal.kode,
          difficulty: soal.difficulty,
          is_correct: isCorrect ? 1 : 0,
        });
      } catch { /* diabaikan: best-effort, boleh gagal senyap */ }
    }
  };

  const handleRetry = () => {
    if (!currentSoal) return;
    const soal = currentSoal;
    setAnswers((a) => ({ ...a, [soal.id]: initChosen(soal.tipe) }));
    setSubmitted((s) => ({ ...s, [soal.id]: false }));
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gs-bg)" }}>
      <Navbar />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gs-text-hint)", fontSize: "14px" }}>
        Memuat paket soal...
      </div>
      <Footer />
    </div>
  );

  if (error || !paket) return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gs-bg)" }}>
      <Navbar />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", textAlign: "center" }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--gs-text)", marginBottom: "8px" }}>{error || "Paket tidak ditemukan"}</div>
          <button onClick={() => navigate("/paket")} style={{ fontSize: "13px", color: "#e84c2b", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            ← Kembali ke daftar paket
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );

  const answeredCount = soalList.filter((s) => submitted[s.id] || alreadyCorrect[s.id]).length;
  const isLocked = Number(paket.harga) > 0 && !paket.has_access;
  const jumlahSoal = isLocked ? (paket.jumlah_soal ?? 0) : soalList.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gs-bg)" }}>
      <SEO
        title={`${paket.nama}${paket.tahun ? ` ${paket.tahun}` : ""}`}
        description={paket.deskripsi || `${soalList.length} soal dari ${paket.nama}`}
        url={urutan ? `/paket/${id}/soal/${urutan}` : `/paket/${id}`}
      />
      <Navbar />

      <main style={{ flex: 1, maxWidth: view === "soal" && !isMobile ? "1040px" : "760px", width: "100%", margin: "0 auto", padding: isMobile ? "20px 16px 48px" : "32px 24px 64px" }}>

        {/* Header */}
        <div style={{
          borderRadius: "18px",
          background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #1a0a2e 100%)",
          padding: isMobile ? "20px 18px" : "24px 28px",
          marginBottom: "20px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", opacity: 0.06, userSelect: "none", pointerEvents: "none", color: "white" }}>
            <Package size={isMobile ? 70 : 90} />
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <button
                onClick={() => view === "soal" ? navigate(`/paket/${id}`) : navigate("/paket")}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "9px", border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.7)", cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.15)"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}
              >
                <ChevronLeft size={15} />
              </button>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".08em" }}>
                {JENIS_LABEL[paket.jenis] || paket.jenis}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", gap: "10px" }}>
              <div>
                <h1 style={{ fontSize: isMobile ? "18px" : "22px", fontWeight: "800", color: "white", margin: "0 0 6px" }}>
                  {paket.nama}{paket.tahun ? ` ${paket.tahun}` : ""}
                </h1>
                {paket.deskripsi && (
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,.5)", margin: "0 0 8px" }}>{paket.deskripsi}</p>
                )}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", padding: "3px 10px", borderRadius: "99px", color: "rgba(255,255,255,.8)", background: "rgba(255,255,255,.1)" }}>
                    {jumlahSoal} soal
                  </span>
                  {isLocked ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "700", padding: "3px 10px", borderRadius: "99px", color: "#fcd34d", background: "rgba(252,211,77,.12)" }}>
                      <Lock size={11} /> Rp {Number(paket.harga).toLocaleString("id-ID")}
                    </span>
                  ) : answeredCount > 0 && (
                    <span style={{ fontSize: "12px", fontWeight: "700", padding: "3px 10px", borderRadius: "99px", color: "#6ee7b7", background: "rgba(110,231,183,.12)" }}>
                      {answeredCount} dijawab
                    </span>
                  )}
                </div>
              </div>
              {!isLocked && view === "soal" && (
                <button
                  onClick={() => navigate(`/paket/${id}`)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.85)", border: "1px solid rgba(255,255,255,.15)", borderRadius: "9px", padding: "8px 14px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}
                >
                  <List size={14} /> Daftar Soal
                </button>
              )}
            </div>
          </div>
        </div>

        {isLocked ? (
          <>
            <div style={{ background: "var(--gs-surface)", borderRadius: "16px", border: "1px solid var(--gs-border)", padding: isMobile ? "14px 16px" : "16px 20px", marginBottom: "16px" }}>
              {checkoutError && (
                <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "12px", borderRadius: "8px", padding: "8px 12px", marginBottom: "10px" }}>
                  {checkoutError}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--gs-text)" }}>Rp {Number(paket.harga).toLocaleString("id-ID")}</div>
                  <div style={{ fontSize: "12px", color: "var(--gs-text-muted)" }}>Buka {jumlahSoal} soal + pembahasan</div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    padding: "12px 22px", borderRadius: "12px", border: "none",
                    background: checkingOut ? "#f5a07a" : "#e84c2b", color: "white",
                    fontSize: "14px", fontWeight: "700", cursor: checkingOut ? "not-allowed" : "pointer",
                    fontFamily: "inherit", flexShrink: 0,
                  }}
                >
                  {checkingOut ? (
                    <>
                      <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                      Memproses...
                    </>
                  ) : (
                    "Beli Sekarang"
                  )}
                </button>
              </div>
              {!user && (
                <p style={{ fontSize: "11px", color: "var(--gs-text-hint)", textAlign: "center", margin: "8px 0 0" }}>
                  Kamu akan diminta masuk terlebih dahulu.
                </p>
              )}
            </div>
            <div style={{ background: "var(--gs-surface)", borderRadius: "16px", border: "1px solid var(--gs-border)", overflow: "hidden" }}>
              {Array.from({ length: Math.min(jumlahSoal, 5) }).map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", borderBottom: "1px solid var(--gs-border)" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--gs-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Lock size={13} color="var(--gs-text-hint)" />
                  </div>
                  <div style={{ flex: 1, height: "10px", borderRadius: "5px", background: "var(--gs-border)", maxWidth: `${70 - i * 8}%` }} />
                </div>
              ))}
              <div style={{ padding: "12px 18px", fontSize: "13px", color: "var(--gs-text-muted)" }}>
                {jumlahSoal} soal dan pembahasan terkunci
              </div>
            </div>
          </>
        ) : (
        <>
        {/* LIST VIEW */}
        {view === "list" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {soalList.map((soal, idx) => {
              const isAnswered = !!submitted[soal.id];
              const isCorrect  = !!alreadyCorrect[soal.id] || (isAnswered && checkCorrect(soal.tipe, answers[soal.id], soal.answer));
              return (
                <div
                  key={soal.id}
                  onClick={() => goToSoal(idx)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    background: "var(--gs-surface)", borderRadius: "13px",
                    border: "1px solid var(--gs-border)",
                    borderLeft: `3px solid ${isCorrect ? "#1a8a6e" : isAnswered ? "#f5a623" : "#e84c2b"}`,
                    padding: isMobile ? "12px 14px" : "14px 18px",
                    cursor: "pointer", transition: "box-shadow .15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.06)"}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                >
                  <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: isCorrect ? "#e4f5f0" : isAnswered ? "#fef9ee" : "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "13px", fontWeight: "800", color: isCorrect ? "#1a8a6e" : isAnswered ? "#f5a623" : "#e84c2b" }}>
                    {isCorrect ? <Check size={15} /> : soal.urutan}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "11px", color: "var(--gs-text-hint)", marginBottom: "2px" }}>
                      {soal.mapel || soal.subtopik}
                      {soal.difficulty && <span style={{ marginLeft: "6px", color: DIFF_COLOR[soal.difficulty], fontWeight: "600" }}>{DIFF_LABEL[soal.difficulty]}</span>}
                    </div>
                    <div style={{ fontSize: "13.5px", color: "var(--gs-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <MathRenderer text={soal.body} />
                    </div>
                  </div>
                  <ChevronRight size={16} color="var(--gs-text-hint)" style={{ flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        )}

        {/* SOAL VIEW */}
        {view === "soal" && currentSoal && (() => {
          const soal          = currentSoal;
          const chosen        = answers[soal.id];
          const isSubmit      = !!submitted[soal.id];
          const alreadyOk     = !!alreadyCorrect[soal.id];
          const isCorrect     = alreadyOk || (isSubmit && checkCorrect(soal.tipe, chosen, soal.answer));

          return (
            <div>
              {/* Navigasi nomor soal */}
              <SoalNumberNav
                soalList={soalList}
                currentIdx={currentIdx}
                submitted={submitted}
                alreadyCorrect={alreadyCorrect}
                answers={answers}
                onJump={goToSoal}
              />

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px", alignItems: "start" }}>
                {/* Panel Soal + Jawaban */}
                <div style={{ background: "var(--gs-surface)", borderRadius: "16px", border: "1px solid var(--gs-border)", padding: isMobile ? "20px" : "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Meta */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px", background: "#fff3f0", color: "#e84c2b" }}>
                      #{soal.urutan}
                    </span>
                    {soal.mapel && <span style={{ fontSize: "12px", color: "var(--gs-text-hint)" }}>{soal.mapel}</span>}
                    {soal.subtopik && <span style={{ fontSize: "12px", color: "var(--gs-text-hint)" }}>· {soal.subtopik}</span>}
                    {soal.difficulty && (
                      <span style={{ fontSize: "11px", fontWeight: "700", color: DIFF_COLOR[soal.difficulty], marginLeft: "auto" }}>
                        {DIFF_LABEL[soal.difficulty]}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div style={{ fontSize: isMobile ? "14px" : "15px", lineHeight: "1.75", color: "var(--gs-text)", fontWeight: "500" }}>
                    <MathRenderer text={soal.body} block />
                  </div>

                  {/* Jawaban */}
                  <JawabanInput
                    soal={soal}
                    chosen={chosen}
                    setChosen={(val) => {
                      if (isSubmit) return;
                      setAnswers((a) => ({ ...a, [soal.id]: val }));
                    }}
                    submitted={isSubmit}
                    alreadyCorrect={alreadyOk}
                    isCorrect={isCorrect}
                  />

                  {/* Action buttons */}
                  {!alreadyOk && (
                    <div style={{ display: "flex", gap: "10px" }}>
                      {!isSubmit ? (
                        <button
                          onClick={handleSubmit}
                          disabled={!chosen && soal.tipe === "pilihan_ganda"}
                          style={{
                            flex: 1, padding: "12px", borderRadius: "12px", border: "none",
                            background: "#e84c2b", color: "white", fontSize: "15px",
                            fontWeight: "700", cursor: "pointer", fontFamily: "inherit",
                            transition: "all .15s",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                          }}
                        >
                          <Check size={15} />
                          Periksa Jawaban
                        </button>
                      ) : !isCorrect ? (
                        <button
                          onClick={handleRetry}
                          style={{
                            flex: 1, padding: "12px", borderRadius: "12px",
                            border: "1px solid var(--gs-border)", background: "var(--gs-surface)",
                            color: "var(--gs-text)", fontSize: "15px", fontWeight: "700",
                            cursor: "pointer", fontFamily: "inherit",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                          }}
                        >
                          <RotateCcw size={15} />
                          Coba Lagi
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Panel Pembahasan */}
                <div style={{ background: "var(--gs-surface)", borderRadius: "16px", border: "1px solid var(--gs-border)", padding: isMobile ? "20px" : "32px", position: isMobile ? "static" : "sticky", top: "24px" }}>
                  {soal.explanation ? (
                    <PembahasanPanel
                      soal={soal}
                      submitted={isSubmit || alreadyOk}
                      isCorrect={isCorrect}
                      alreadyCorrect={alreadyOk}
                      user={user}
                      isMobile={isMobile}
                    />
                  ) : (
                    <div style={{ textAlign: "center", padding: isMobile ? "32px 16px" : "48px 24px", color: "var(--gs-text-hint)", fontSize: "14px" }}>
                      Tidak ada pembahasan untuk soal ini.
                    </div>
                  )}
                </div>
              </div>

              {/* Prev / Next nav */}
              <div style={{ display: "flex", gap: "8px", justifyContent: "space-between", marginTop: "20px" }}>
                <button
                  onClick={() => goToSoal(currentIdx - 1)}
                  disabled={currentIdx === 0}
                  style={{ flex: 1, padding: "11px", borderRadius: "12px", border: "1px solid var(--gs-border)", background: "var(--gs-surface)", fontSize: "13px", fontWeight: "600", color: currentIdx === 0 ? "var(--gs-text-hint)" : "var(--gs-text)", cursor: currentIdx === 0 ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  <ChevronLeft size={14} /> Sebelumnya
                </button>
                {currentIdx < soalList.length - 1 ? (
                  <button
                    onClick={() => goToSoal(currentIdx + 1)}
                    style={{ flex: 1, padding: "11px", borderRadius: "12px", border: "none", background: "#e84c2b", color: "white", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  >
                    Berikutnya <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/paket/${id}`)}
                    style={{ flex: 1, padding: "11px", borderRadius: "12px", border: "none", background: "#1a8a6e", color: "white", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Lihat Semua Soal
                  </button>
                )}
              </div>
            </div>
          );
        })()}
        </>
        )}
      </main>

      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
