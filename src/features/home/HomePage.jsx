// src/features/home/HomePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import {
  ChevronRight, CheckCircle, XCircle, BookOpen, Shuffle,
  Zap, Flame, Dumbbell, GraduationCap, TrendingUp,
  Target, Award, BarChart2,
} from "lucide-react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getProfile } from "../profile/profileApi";
import RandomSoal from "../../components/RandomSoal";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";
import SoalHariIni from "./components/SoalHariIni";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const width    = useWindowWidth();
  const isMobile = width <= 480;

  const [riwayat,        setRiwayat]       = useState([]);
  const [stats,          setStats]         = useState(null);
  const [loadingRiwayat, setLoadingRiwayat] = useState(true);
  const [randomOpen,     setRandomOpen]    = useState(false);

  useEffect(() => {
    getProfile()
      .then((data) => {
        updateUser(data.user);
        setRiwayat(data.riwayat?.slice(0, 5) || []);
        setStats(data.stats || null);
      })
      .catch(() => {})
      .finally(() => setLoadingRiwayat(false));
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 11) return "Selamat pagi";
    if (h < 15) return "Selamat siang";
    if (h < 18) return "Selamat sore";
    return "Selamat malam";
  };

  const totalSoal = Number(stats?.total  ?? 0);
  const benar     = Number(stats?.benar  ?? 0);
  const akurasi   = totalSoal > 0 ? Math.round((benar / totalSoal) * 100) : 0;

  const QUICK_ACTIONS = [
    { label: "Direktori Soal", desc: "Jelajahi soal berdasarkan jenjang & topik", icon: BookOpen,      color: "#2563eb", bg: "rgba(37,99,235,.1)",   to: "/browse"   },
    { label: "Latihan",        desc: "Set soal latihan terstruktur",             icon: Dumbbell,      color: "#f5a623", bg: "rgba(245,166,35,.1)",  to: "/latihan"  },
    { label: "Materi Belajar", desc: "Teori & rumus per subtopik",               icon: GraduationCap, color: "#1a8a6e", bg: "rgba(26,138,110,.1)",  to: "/materi"   },
    { label: "Soal Populer",   desc: "Soal yang paling banyak dikerjakan",       icon: TrendingUp,    color: "#e84c2b", bg: "rgba(232,76,43,.1)",   to: "/populer"  },
  ];

  const STAT_CARDS = [
    { label: "Soal Dikerjakan", value: totalSoal.toLocaleString("id-ID"), icon: Target,   color: "#2563eb", bg: "rgba(37,99,235,.08)"  },
    { label: "Jawaban Benar",   value: benar.toLocaleString("id-ID"),     icon: Award,    color: "#1a8a6e", bg: "rgba(26,138,110,.08)" },
    { label: "Akurasi",         value: `${akurasi}%`,                     icon: BarChart2,color: "#7c3aed", bg: "rgba(124,58,237,.08)" },
    { label: "Hari Streak",     value: (user?.streak ?? 0).toString(),    icon: Flame,    color: "#e84c2b", bg: "rgba(232,76,43,.08)"  },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f2efe8" }}>
      <SEO
        title="Beranda"
        description="Selamat datang di Gudang Soal. Lanjutkan belajar, kerjakan soal baru, dan pantau progress XP-mu."
        url="/home"
      />
      <Navbar />

      <main style={{ maxWidth: "960px", margin: "0 auto", padding: isMobile ? "20px 16px 48px" : "36px 32px 64px" }}>

        {/* ── Hero ── */}
        <div style={{
          borderRadius: "20px",
          background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #2c1810 100%)",
          padding: isMobile ? "28px 24px" : "36px 40px",
          marginBottom: "16px",
          position: "relative", overflow: "hidden",
        }}>
          {/* watermark */}
          <div style={{ position: "absolute", right: isMobile ? "-10px" : "32px", top: "50%", transform: "translateY(-50%)", opacity: 0.05, pointerEvents: "none", color: "white" }}>
            <BookOpen size={isMobile ? 100 : 150} />
          </div>

          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "6px" }}>
                {getGreeting()}
              </div>
              <h1 style={{ fontSize: isMobile ? "26px" : "32px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 14px" }}>
                {user?.name?.split(" ")[0] || "..."}
              </h1>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", background: "rgba(252,211,77,.15)", color: "#fcd34d" }}>
                  <Zap size={11} /> {(user?.xp ?? 0).toLocaleString("id-ID")} XP
                </span>
                {(user?.streak || 0) > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", background: "rgba(232,76,43,.2)", color: "#fca5a5" }}>
                    <Flame size={11} /> {user.streak} hari streak
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => setRandomOpen(true)} style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "11px 22px", borderRadius: "12px", border: "none",
              background: "#e84c2b", color: "white",
              fontSize: "14px", fontWeight: "700", cursor: "pointer",
              fontFamily: "inherit", boxShadow: "0 4px 16px rgba(232,76,43,.4)",
              width: isMobile ? "100%" : "auto", flexShrink: 0,
              transition: "background .15s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#d43f20")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#e84c2b")}
            >
              <Shuffle size={15} /> Soal Random
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: "10px",
          marginBottom: "24px",
        }}>
          {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} style={{
              background: "white", borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: isMobile ? "14px" : "16px 18px",
              display: "flex", alignItems: "center", gap: "12px",
            }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={17} color={color} />
              </div>
              <div>
                <div style={{ fontSize: isMobile ? "18px" : "20px", fontWeight: "800", color: "#0f0e17", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
                  {loadingRiwayat ? "—" : value}
                </div>
                <div style={{ fontSize: "11px", color: "#b4b2a9", fontWeight: "500", marginTop: "2px" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick actions ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: "10px",
          marginBottom: "32px",
        }}>
          {QUICK_ACTIONS.map(({ label, desc, icon: Icon, color, bg, to }) => (
            <div key={to}
              onClick={() => navigate(to)}
              style={{
                background: "white", borderRadius: "14px",
                border: "1px solid #e2ddd5",
                padding: "16px 18px",
                display: "flex", alignItems: "center", gap: "14px",
                cursor: "pointer", transition: "box-shadow .15s, transform .15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,.07)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={20} color={color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17", marginBottom: "2px" }}>{label}</div>
                <div style={{ fontSize: "12px", color: "#b4b2a9" }}>{desc}</div>
              </div>
              <ChevronRight size={15} color="#d4d0c8" />
            </div>
          ))}
        </div>

        {/* ── Soal Hari Ini ── */}
        <SoalHariIni isMobile={isMobile} />

        {/* ── Sesi Terakhir ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "3px", height: "16px", borderRadius: "2px", background: "#e84c2b", marginRight: "10px", flexShrink: 0 }} />
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0f0e17", margin: 0 }}>Sesi Terakhir</h2>
          </div>
          {riwayat.length > 0 && (
            <button onClick={() => navigate("/profile")} style={{ fontSize: "13px", color: "#e84c2b", fontWeight: "600", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              Lihat semua
            </button>
          )}
        </div>

        {loadingRiwayat ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ height: "60px", borderRadius: "12px", background: "#e2ddd5", opacity: 0.5, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : riwayat.length === 0 ? (
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", padding: "40px", textAlign: "center" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "13px", background: "#f2efe8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <BookOpen size={22} color="#b4b2a9" />
            </div>
            <p style={{ fontSize: "15px", fontWeight: "600", color: "#0f0e17", margin: "0 0 4px" }}>Belum ada sesi latihan</p>
            <p style={{ fontSize: "13px", color: "#6b6860", margin: 0 }}>Pilih jenjang di atas untuk mulai latihan pertamamu!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {riwayat.map((r, i) => (
              <div key={i}
                onClick={() => navigate(`/soal/${r.kode}`)}
                style={{
                  background: "white", borderRadius: "13px",
                  border: "1px solid #e2ddd5",
                  borderLeft: `3px solid ${r.is_correct == 1 ? "#1a8a6e" : "#e84c2b"}`,
                  padding: isMobile ? "12px 14px" : "13px 18px",
                  display: "flex", alignItems: "center", gap: "12px",
                  cursor: "pointer", transition: "box-shadow .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                {r.is_correct == 1
                  ? <CheckCircle size={17} color="#1a8a6e" style={{ flexShrink: 0 }} />
                  : <XCircle    size={17} color="#e84c2b" style={{ flexShrink: 0 }} />
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13.5px", color: "#0f0e17", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.body.replace(/\$\$?[^$]+\$\$?/g, "[math]").replace(/[*_~`#]/g, "")}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#b4b2a9", marginTop: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.jenjang} · {r.mapel} · {r.subtopik}
                  </div>
                </div>
                {!isMobile && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px", flexShrink: 0 }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#b4b2a9", fontFamily: "monospace" }}>{r.kode}</span>
                    <span style={{ fontSize: "11px", color: "#b4b2a9" }}>
                      {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      {randomOpen && <RandomSoal onClose={() => setRandomOpen(false)} />}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
