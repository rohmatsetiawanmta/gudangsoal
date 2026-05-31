// src/features/soal/SoalDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Flag,
  Share2,
  Copy,
  Check,
  Eye,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import MathRenderer from "../../components/MathRenderer";
import Breadcrumb from "../../components/Breadcrumb";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";
import { getSoalDetail, getSoalStatus } from "./soalApi";
import { saveSession } from "../profile/profileApi";
import { useAuthStore } from "../auth/authStore";
import { checkCorrect, initChosen, DifficultyBadge } from "./soalUtils";
import JawabanInput from "./components/JawabanInput";
import PembahasanPanel from "./components/PembahasanPanel";
import ReportModal from "./components/ReportModal";
import {
  checkBookmark,
  addBookmark,
  removeBookmark,
} from "../bookmark/bookmarkApi";

export default function SoalDetail() {
  const { kode } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [soal, setSoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chosen, setChosen] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadyCorrect, setAlreadyCorrect] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

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
    setBookmarked(false);
    setLoading(true);

    if (user) {
      Promise.all([
        getSoalDetail(kode),
        getSoalStatus(kode),
        checkBookmark(kode),
      ])
        .then(([data, status, bm]) => {
          setSoal(data);
          fillBreadcrumb(data);
          setChosen(initChosen(data.tipe));
          setBookmarked(bm?.bookmarked || false);
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
    try {
      const data = await getSoalDetail(kode);
      setSoal(data);
    } catch {}
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

  const handleBookmark = async () => {
    if (!user || bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      if (bookmarked) {
        await removeBookmark(soal.id);
        setBookmarked(false);
      } else {
        await addBookmark(soal.id);
        setBookmarked(true);
      }
    } catch {
    } finally {
      setBookmarkLoading(false);
    }
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

  function IconButton({
    onClick,
    icon: Icon,
    title,
    color,
    hoverColor,
    hoverBorder,
    active,
    activeColor,
    activeBg,
    activeBorder,
    disabled,
    children,
  }) {
    const [hovered, setHovered] = useState(false);

    return (
      <div style={{ position: "relative" }}>
        <button
          onClick={onClick}
          disabled={disabled}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            border: `1px solid ${
              active ? activeBorder : hovered ? hoverBorder : "#e2ddd5"
            }`,
            background: active ? activeBg : "white",
            cursor: disabled ? "not-allowed" : "pointer",
            color: active
              ? activeColor
              : hovered
              ? hoverColor
              : color || "#6b6860",
            transition: "all .15s",
            opacity: disabled ? 0.5 : 1,
            flexShrink: 0,
          }}
        >
          {children || <Icon size={14} />}
        </button>

        {/* Tooltip */}
        {hovered && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 6px)",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#0f0e17",
              color: "white",
              fontSize: "11px",
              fontWeight: "500",
              padding: "4px 8px",
              borderRadius: "6px",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            {title}
            {/* Arrow */}
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderTop: "4px solid #0f0e17",
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#faf9f6",
      }}
    >
      {soal && (
        <SEO
          title={`Soal ${soal.mapel_nama} (#${soal.kode})`}
          description={soal.body
            .replace(/\$\$?[^$]+\$\$?/g, "")
            .replace(/[*_~`#]/g, "")
            .trim()
            .slice(0, 150)}
          url={`/soal/${kode}`}
        />
      )}
      <Navbar />

      <main
        style={{
          flex: 1,
          maxWidth: "1100px",
          margin: "0 auto",
          padding: isMobile ? "24px 16px" : "40px",
          width: "100%",
        }}
      >
        {/* Breadcrumb */}
        <div style={{ marginBottom: isMobile ? "20px" : "32px" }}>
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
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "24px",
            }}
          >
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
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: "20px",
              alignItems: "start",
            }}
          >
            {/* Panel Soal */}
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
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "#b4b2a9",
                      fontSize: "12px",
                    }}
                  >
                    <Eye size={13} />
                    {parseInt(soal.views || 0).toLocaleString()}
                  </div>
                  <DifficultyBadge level={soal.difficulty} />
                </div>
              </div>

              {/* Body */}
              <div
                style={{
                  fontSize: isMobile ? "15px" : "17px",
                  color: "#0f0e17",
                  fontWeight: "500",
                }}
              >
                <MathRenderer text={soal.body} block />
              </div>

              {/* Input jawaban */}
              <JawabanInput
                soal={soal}
                chosen={chosen}
                setChosen={setChosen}
                submitted={submitted}
                alreadyCorrect={alreadyCorrect}
                isCorrect={isCorrect}
              />

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
                      onClick={() => {
                        setChosen(initChosen(soal?.tipe));
                        setSubmitted(false);
                      }}
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

              {/* Navigasi bawah */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "12px",
                  borderTop: "1px solid #f2efe8",
                }}
              >
                {/* Kiri: Kembali */}
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
                    fontSize: "13px",
                    fontFamily: "inherit",
                    padding: 0,
                  }}
                >
                  <ChevronLeft size={15} /> Kembali
                </button>

                {/* Kanan: aksi sebagai pill buttons */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {user && (
                    <IconButton
                      onClick={handleBookmark}
                      disabled={bookmarkLoading}
                      title={bookmarked ? "Hapus bookmark" : "Simpan soal"}
                      active={bookmarked}
                      activeColor="#e84c2b"
                      activeBg="#fff3f0"
                      activeBorder="#e84c2b"
                      hoverColor="#e84c2b"
                      hoverBorder="#e84c2b"
                    >
                      {bookmarked ? (
                        <BookmarkCheck size={14} />
                      ) : (
                        <Bookmark size={14} />
                      )}
                    </IconButton>
                  )}
                  <IconButton
                    onClick={handleCopy}
                    title={copied ? "Tersalin!" : "Salin link"}
                    active={copied}
                    activeColor="#1a8a6e"
                    activeBg="#e4f5f0"
                    activeBorder="#9FE1CB"
                    hoverColor="#1a8a6e"
                    hoverBorder="#9FE1CB"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </IconButton>
                  <IconButton
                    onClick={handleShareWA}
                    title="Bagikan ke WhatsApp"
                    hoverColor="#25D366"
                    hoverBorder="#25D366"
                  >
                    <Share2 size={14} />
                  </IconButton>
                  <IconButton
                    onClick={() => setReportOpen(true)}
                    title="Laporkan soal"
                    color="#b4b2a9"
                    hoverColor="#e84c2b"
                    hoverBorder="#fca5a5"
                  >
                    <Flag size={14} />
                  </IconButton>
                </div>
              </div>
            </div>

            {/* Panel Pembahasan */}
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                border: "1px solid #e2ddd5",
                padding: isMobile ? "20px" : "32px",
                position: isMobile ? "static" : "sticky",
                top: "24px",
              }}
            >
              <PembahasanPanel
                soal={soal}
                submitted={submitted}
                isCorrect={isCorrect}
                alreadyCorrect={alreadyCorrect}
                user={user}
                isMobile={isMobile}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />

      {reportOpen && (
        <ReportModal
          kode={kode}
          onClose={() => setReportOpen(false)}
          isMobile={isMobile}
        />
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
