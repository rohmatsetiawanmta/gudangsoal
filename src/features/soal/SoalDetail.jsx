// src/features/soal/SoalDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  HelpCircle,
  Flag,
  Share2,
  PenTool,
  Pencil,
  Check,
  Eye,
  Bookmark,
  BookmarkCheck,
  Users,
  BarChart2,
  TrendingUp,
  Mail,
  X,
  Tag,
} from "lucide-react";

import MathRenderer from "../../components/MathRenderer";
import Breadcrumb from "../../components/Breadcrumb";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";
import { usePresence } from "../../hooks/usePresence";
import { getSoalDetail, getSoalStatus } from "./soalApi";
import { saveSession } from "../profile/profileApi";
import { useAuthStore } from "../auth/authStore";
import api from "../../lib/api";
import {
  checkCorrect,
  initChosen,
  normalizeAnswer,
} from "./soalUtils";
import JawabanInput from "./components/JawabanInput";
import PembahasanPanel from "./components/PembahasanPanel";
import ReportModal from "./components/ReportModal";
import {
  checkBookmark,
  addBookmark,
  removeBookmark,
} from "../bookmark/bookmarkApi";

// ── Brand share icons ─────────────────────────────────────────────────────────

const WhatsAppIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.622 5.905-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const ThreadsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 192 192" fill="currentColor">
    <path d="M141.537 88.988a66.667 66.667 0 00-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.741C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.038.473 97.07.252h-.114C69.037.473 47.255 9.643 32.687 27.252 19.79 43.006 13.168 65.16 12.886 96c.282 30.84 6.904 52.994 19.801 68.748 14.568 17.609 36.35 26.78 63.319 27h.114c23.585-.188 41.744-6.92 55.3-20.465 18.007-18.006 17.699-40.556 11.74-54.44-4.254-9.92-12.374-17.985-21.623-23.855z"/>
    <path d="M96.546 128c-6.854 0-12.458-3.431-12.875-8.654-.32-3.969 2.095-6.693 3.388-7.741 2.316-1.853 5.437-2.896 9.143-3.109 3.63-.206 6.786-.012 9.468.568-.734 10.608-4.413 18.936-9.124 18.936z"/>
  </svg>
);
const TelegramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// ── Action button (dark header context) ──────────────────────────────────────

function ActionBtn({ onClick, icon: Icon, title, active, activeColor = "#1a8a6e", activeBg = "#e4f5f0", activeBorder = "#6ee7b7", danger }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "32px", height: "32px", borderRadius: "8px",
          border: `1px solid ${active ? activeBorder : hovered ? (danger ? "#fca5a5" : "rgba(255,255,255,.35)") : "rgba(255,255,255,.15)"}`,
          background: active ? activeBg : hovered ? (danger ? "rgba(232,76,43,.15)" : "rgba(255,255,255,.12)") : "rgba(255,255,255,.07)",
          cursor: "pointer",
          color: active ? activeColor : hovered ? (danger ? "#e84c2b" : "white") : "rgba(255,255,255,.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .15s",
        }}
      >
        <Icon size={14} />
      </button>
      {hovered && (
        <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", background: "#0f0e17", color: "white", fontSize: "11px", fontWeight: "500", padding: "4px 8px", borderRadius: "6px", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 10 }}>
          {title}
          <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "4px solid #0f0e17" }} />
        </div>
      )}
    </div>
  );
}

// ── Soal Stats Card ───────────────────────────────────────────────────────────

function SoalStatsCard({ stats, isMobile }) {
  const { total_attempt, total_benar, akurasi } = stats;
  const total_salah = total_attempt - total_benar;

  const diffColor  = akurasi >= 70 ? "#1a8a6e" : akurasi >= 40 ? "#f5a623" : "#e84c2b";
  const diffBg     = akurasi >= 70 ? "#e4f5f0" : akurasi >= 40 ? "#fef9ee" : "#fff3f0";
  const diffLabel  = akurasi >= 70 ? "Mudah"   : akurasi >= 40 ? "Sedang"  : "Susah";

  return (
    <div style={{
      background: "var(--gs-surface)", borderRadius: "14px",
      border: "1px solid var(--gs-border)",
      borderLeft: "3px solid #2563eb",
      padding: isMobile ? "16px" : "20px 24px",
      marginTop: "12px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <BarChart2 size={14} color="#2563eb" />
        </div>
        <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--gs-text)" }}>Statistik Soal</span>
        <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "99px", background: diffBg, color: diffColor }}>
          {diffLabel}
        </span>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: isMobile ? "12px" : "24px", marginBottom: "14px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "7px", background: "var(--gs-hover)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Users size={12} color="var(--gs-text-muted)" />
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "800", color: "var(--gs-text)", lineHeight: 1 }}>
              {total_attempt.toLocaleString("id-ID")}
            </div>
            <div style={{ fontSize: "11px", color: "var(--gs-text-hint)", marginTop: "2px" }}>pengerjaan</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "7px", background: "#e4f5f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Check size={12} color="#1a8a6e" />
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "800", color: "#1a8a6e", lineHeight: 1 }}>
              {total_benar.toLocaleString("id-ID")}
            </div>
            <div style={{ fontSize: "11px", color: "var(--gs-text-hint)", marginTop: "2px" }}>jawaban benar</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "7px", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TrendingUp size={12} color="#e84c2b" />
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "800", color: diffColor, lineHeight: 1 }}>
              {akurasi}%
            </div>
            <div style={{ fontSize: "11px", color: "var(--gs-text-hint)", marginTop: "2px" }}>tingkat keberhasilan</div>
          </div>
        </div>
      </div>

      {/* Accuracy bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <span style={{ fontSize: "11px", color: "#1a8a6e", fontWeight: "600" }}>Benar {total_benar.toLocaleString("id-ID")}</span>
          <span style={{ fontSize: "11px", color: "#e84c2b", fontWeight: "600" }}>Salah {total_salah.toLocaleString("id-ID")}</span>
        </div>
        <div style={{ height: "7px", borderRadius: "99px", background: "#fff3f0", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${akurasi}%`, background: diffColor, borderRadius: "99px", transition: "width .6s ease" }} />
        </div>
      </div>
    </div>
  );
}

export default function SoalDetail() {
  const { kode } = useParams();
  const activeCount = usePresence(`soal/${kode}`);
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
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCount, setShareCount] = useState(0);
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
          setShareCount(parseInt(data.share_count || 0));
          fillBreadcrumb(data);
          setChosen(initChosen(data.tipe));
          setBookmarked(bm?.bookmarked || false);
          if (status?.answered_correct) {
            setAlreadyCorrect(true);
            setSubmitted(true);
            if (data.tipe === "isian_multi" && Array.isArray(data.answer)) {
              const obj = {};
              data.answer.forEach((val, idx) => {
                obj[idx] = val;
              });
              setChosen(obj);
            } else {
              setChosen(data.answer);
            }
          }
        })
        .catch(() => setError("Gagal memuat soal"))
        .finally(() => setLoading(false));
    } else {
      getSoalDetail(kode)
        .then((data) => {
          setSoal(data);
          setShareCount(parseInt(data.share_count || 0));
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
      case "menjodohkan": {
        const leftItems = soal.options?.left || [];
        return (
          typeof chosen === "object" &&
          chosen !== null &&
          leftItems.every((_, idx) => chosen[String(idx)] !== undefined)
        );
      }
      case "isian_multi": {
        const opts = soal.options || [];
        if (typeof chosen !== "object" || Array.isArray(chosen) || !chosen)
          return false;
        return opts.every(
          (_, idx) => chosen[idx] !== undefined && chosen[idx].trim() !== ""
        );
      }
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
      } catch { /* diabaikan: best-effort, boleh gagal senyap */ }
    }
    try {
      const data = await getSoalDetail(kode);
      setSoal({
        ...data,
        answer: normalizeAnswer(data.tipe, data.answer),
      });
    } catch { /* diabaikan: best-effort, boleh gagal senyap */ }
  };

  const soalUrl    = `https://gudangsoal.com/soal/${kode}`;
  const shareUrl   = encodeURIComponent(soalUrl);
  const topikLabel = soal?.subtopik_nama || soal?.topik_nama || soal?.mapel_nama || "Matematika";
  const shareMsg   = `Ada soal ${topikLabel} menarik nih di Gudang Soal! Bisa kamu jawab? Coba deh!\n${soalUrl}`;
  const shareText  = encodeURIComponent(shareMsg);

  const trackShare = async (platform) => {
    try {
      const json = await api.post("/soal/share", { kode, platform });
      if (json.share_count !== undefined) setShareCount(json.share_count);
    } catch { /* diabaikan: best-effort, boleh gagal senyap */ }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(soalUrl);
    trackShare("copy");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SHARE_OPTIONS = [
    { label: "WhatsApp",   icon: <WhatsAppIcon />,  color: "#25D366", bg: "#f0fdf4", platform: "whatsapp", url: `https://wa.me/?text=${shareText}` },
    { label: "Telegram",   icon: <TelegramIcon />,  color: "#2AABEE", bg: "#e8f4fd", platform: "telegram", url: `https://t.me/share/url?url=${shareUrl}&text=${encodeURIComponent(`Ada soal ${topikLabel} menarik nih di Gudang Soal! Bisa kamu jawab? Coba deh!`)}` },
    { label: "Facebook",   icon: <FacebookIcon />,  color: "#1877F2", bg: "#edf3fb", platform: "facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
    { label: "Twitter / X", icon: <XIcon />,        color: "#000",    bg: "#f5f5f5", platform: "twitter",  url: `https://twitter.com/intent/tweet?text=${shareText}` },
    { label: "Threads",    icon: <ThreadsIcon />,   color: "#000",    bg: "#f5f5f5", platform: "threads",  url: `https://www.threads.net/intent/post?text=${shareText}` },
    { label: "Email",      icon: <Mail size={15} />, color: "#6b6860", bg: "#f5f3ef", platform: "email",   url: `mailto:?subject=${encodeURIComponent(`Soal ${topikLabel} dari Gudang Soal`)}&body=${shareText}` },
  ];

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
    } catch { /* diabaikan: best-effort, boleh gagal senyap */
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--gs-bg)",
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
                  background: "var(--gs-border)",
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
          <>
          {/* Hero Header */}
          <div style={{
            background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #0c1a2e 100%)",
            borderRadius: "18px", padding: isMobile ? "24px 20px" : "28px 32px",
            marginBottom: "20px", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%", transform: "translateY(-50%)", opacity: 0.06, pointerEvents: "none", color: "white" }}>
              <HelpCircle size={isMobile ? 80 : 110} />
            </div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
                {[mapelNama, topikNama].filter(Boolean).map((crumb, i, arr) => (
                  <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,.45)", fontWeight: "500" }}>{crumb}</span>
                    {i < arr.length - 1 && <ChevronRight size={11} color="rgba(255,255,255,.25)" />}
                  </span>
                ))}
              </div>
              <h1 style={{ fontSize: isMobile ? "21px" : "26px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 14px", lineHeight: 1.25 }}>
                Soal {subtopikNama || topikNama || mapelNama || `#${kode}`}
              </h1>
              {/* Baris 1 — info chips */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "10px" }}>
                {jenjangNama && (
                  <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "#6ee7b7", background: "rgba(110,231,183,.12)" }}>
                    {jenjangNama}
                  </span>
                )}
                {mapelNama && (
                  <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "rgba(255,255,255,.7)", background: "rgba(255,255,255,.1)" }}>
                    {mapelNama}
                  </span>
                )}
                {soal.difficulty && (() => {
                  const d = soal.difficulty;
                  const [c, bg] = d === "easy" ? ["#6ee7b7","rgba(110,231,183,.12)"] : d === "hard" ? ["#fca5a5","rgba(252,165,165,.12)"] : ["#fcd34d","rgba(252,211,77,.12)"];
                  const label = d === "easy" ? "Mudah" : d === "hard" ? "Sulit" : "Sedang";
                  return <span key="diff" style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: c, background: bg }}>{label}</span>;
                })()}
              </div>

              {/* Baris 2 — stats + actions */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "8px", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)" }}>
                  <Eye size={13} color="rgba(255,255,255,.5)" />
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,.6)" }}>
                    {parseInt(soal.view_count ?? soal.views ?? 0).toLocaleString()}
                  </span>
                </div>
                {activeCount > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "8px", background: "rgba(110,231,183,.15)", border: "1px solid rgba(110,231,183,.3)" }}>
                    <span className="presence-dot" />
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#6ee7b7" }}>
                      {isMobile ? activeCount : `${activeCount} orang sedang mengerjakan`}
                    </span>
                  </div>
                )}
                <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,.12)", margin: "0 2px" }} />
                <button
                  onClick={() => setShareOpen(true)}
                  title="Bagikan"
                  style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", borderRadius: "8px", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", cursor: "pointer", fontFamily: "inherit" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.13)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.07)"; }}
                >
                  <Share2 size={13} color="rgba(255,255,255,.5)" />
                  {shareCount > 0 && <span style={{ fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,.6)" }}>{shareCount.toLocaleString("id-ID")}</span>}
                </button>
                {user && (
                  <ActionBtn
                    onClick={handleBookmark}
                    icon={bookmarked ? BookmarkCheck : Bookmark}
                    title={bookmarked ? "Hapus bookmark" : "Simpan soal"}
                    active={bookmarked}
                    activeColor="#e84c2b"
                    activeBg="#fff3f0"
                    activeBorder="#fca5a5"
                  />
                )}
                <ActionBtn onClick={() => setReportOpen(true)} icon={Flag} title="Laporkan soal" danger />
                {user?.role === "admin" && (
                  <>
                    <ActionBtn onClick={() => navigate(`/admin/soal/edit/${soal.id}`)} icon={Pencil} title="Edit soal ini" />
                    <ActionBtn onClick={() => navigate(`/admin/whiteboard/by-question/${kode}`)} icon={PenTool} title="Buka whiteboard soal ini" />
                  </>
                )}
              </div>
            </div>
          </div>

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
                background: "var(--gs-surface)",
                borderRadius: "16px",
                border: "1px solid var(--gs-border)",
                padding: isMobile ? "20px" : "32px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {/* Tags */}
              {soal.tags && soal.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {soal.tags.map((tag, i) => (
                    <span key={i} style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      padding: "3px 10px", borderRadius: "99px",
                      background: "var(--gs-bg)", border: "1px solid var(--gs-border)",
                      fontSize: "11px", fontWeight: "600", color: "var(--gs-text-muted)",
                    }}>
                      <Tag size={9} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Body */}
              <div
                style={{
                  fontSize: isMobile ? "14px" : "15px",
                  color: "var(--gs-text)",
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
                        background: isChosenValid() ? "#e84c2b" : "var(--gs-border)",
                        color: isChosenValid() ? "white" : "var(--gs-text-hint)",
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
                        background: "var(--gs-surface)",
                        color: "var(--gs-text)",
                        border: "1px solid var(--gs-border)",
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

            </div>

            {/* Panel Pembahasan */}
            <div
              style={{
                background: "var(--gs-surface)",
                borderRadius: "16px",
                border: "1px solid var(--gs-border)",
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

          {/* Stats Card — hidden for now */}
          {false && soal.stats && (
            <SoalStatsCard stats={soal.stats} isMobile={isMobile} />
          )}
          </>
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

      {shareOpen && (
        <div onClick={e => { if (e.target === e.currentTarget) setShareOpen(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div style={{ background: "var(--gs-surface)", borderRadius: "20px", padding: "24px", width: "300px", maxWidth: "100%", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--gs-text)" }}>Bagikan</span>
              <button onClick={() => setShareOpen(false)} style={{ width: "28px", height: "28px", borderRadius: "8px", border: "1px solid var(--gs-border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gs-text-muted)" }}><X size={14} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
              {SHARE_OPTIONS.map(opt => (
                <button key={opt.label} onClick={() => { trackShare(opt.platform); window.open(opt.url, "_blank"); }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "7px", padding: "12px 8px", borderRadius: "12px", border: "1px solid var(--gs-border)", background: "var(--gs-surface)", cursor: "pointer", fontFamily: "inherit" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--gs-hover)"}
                  onMouseLeave={e => e.currentTarget.style.background = "var(--gs-surface)"}
                >
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: opt.bg, display: "flex", alignItems: "center", justifyContent: "center", color: opt.color }}>{opt.icon}</div>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--gs-text)", textAlign: "center", lineHeight: "1.3" }}>{opt.label}</span>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--gs-hover)", borderRadius: "10px", padding: "10px 12px" }}>
              <span style={{ flex: 1, fontSize: "12px", color: "var(--gs-text-muted)", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>gudangsoal.com/soal/{kode}</span>
              <button onClick={handleCopy} style={{ padding: "5px 10px", borderRadius: "7px", border: "none", background: copied ? "#1a8a6e" : "#e84c2b", color: "white", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", flexShrink: 0, transition: "background .15s" }}>
                {copied ? "Tersalin!" : "Salin"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
