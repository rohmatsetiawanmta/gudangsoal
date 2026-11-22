// src/features/academy/AcademyPage.jsx
import { useNavigate } from "react-router-dom";
import { School, BookOpen, DoorOpen, Presentation, Sparkles } from "lucide-react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";

export default function AcademyPage() {
  const navigate = useNavigate();
  const width    = useWindowWidth();
  const isMobile = width <= 480;

  return (
    <div style={{ minHeight: "100vh", background: "var(--gs-bg)" }}>
      <SEO
        title="Academy"
        description="Jelajahi ruang kelas virtual matrohmatmath Academy dan mulai latihan soal."
        url="/academy"
      />
      <Navbar />

      <main style={{ maxWidth: "960px", margin: "0 auto", padding: isMobile ? "20px 16px 48px" : "36px 32px 64px" }}>

        {/* ── Hero ── */}
        <div style={{
          borderRadius: "20px",
          background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #1a0e2c 100%)",
          padding: isMobile ? "28px 24px" : "36px 40px",
          marginBottom: "24px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", right: isMobile ? "-10px" : "32px", top: "50%", transform: "translateY(-50%)", opacity: 0.06, pointerEvents: "none", color: "white" }}>
            <School size={isMobile ? 100 : 150} />
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "6px" }}>
              matrohmatmath
            </div>
            <h1 style={{ fontSize: isMobile ? "24px" : "30px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 10px" }}>
              Academy
            </h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,.65)", lineHeight: "1.6", margin: 0, maxWidth: "520px" }}>
              Masih tahap awal — baru satu ruang yang aktif. Ruang-ruang lain nyusul seiring fitur lainnya siap 🚧
            </p>
          </div>
        </div>

        {/* ── 2D Room ── */}
        <div style={{
          background: "var(--gs-surface)",
          borderRadius: "20px",
          border: "1px solid var(--gs-border)",
          padding: isMobile ? "20px" : "28px",
        }}>
          <div style={{
            position: "relative",
            borderRadius: "16px",
            overflow: "hidden",
            background: "linear-gradient(to bottom, #d7cfc0 0%, #d7cfc0 38%, #c9a876 38%, #c9a876 100%)",
            minHeight: isMobile ? "320px" : "380px",
            border: "1px solid var(--gs-border)",
          }}>
            {/* Floor tile pattern */}
            <div style={{
              position: "absolute", left: 0, right: 0, bottom: 0, top: "38%",
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0,0,0,.05) 0 1px, transparent 1px 42px)," +
                "repeating-linear-gradient(90deg, rgba(0,0,0,.05) 0 1px, transparent 1px 42px)",
            }} />

            {/* Blackboard */}
            <div style={{
              position: "absolute", top: isMobile ? "14px" : "20px", left: "50%", transform: "translateX(-50%)",
              width: isMobile ? "140px" : "180px", height: isMobile ? "70px" : "90px",
              background: "#1a3a2e", borderRadius: "8px",
              border: "6px solid #8a6d4b",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,.15)",
            }}>
              <Presentation size={isMobile ? 26 : 32} color="rgba(255,255,255,.5)" />
            </div>

            {/* Window */}
            <div style={{
              position: "absolute", top: isMobile ? "16px" : "24px", left: isMobile ? "16px" : "32px",
              width: isMobile ? "44px" : "58px", height: isMobile ? "44px" : "58px",
              background: "linear-gradient(135deg, #a8d8e8, #7cb8d8)",
              borderRadius: "6px", border: "4px solid white",
              boxShadow: "0 2px 8px rgba(0,0,0,.1)",
            }} />
            <div style={{
              position: "absolute", top: isMobile ? "16px" : "24px", right: isMobile ? "16px" : "32px",
              width: isMobile ? "44px" : "58px", height: isMobile ? "44px" : "58px",
              background: "linear-gradient(135deg, #a8d8e8, #7cb8d8)",
              borderRadius: "6px", border: "4px solid white",
              boxShadow: "0 2px 8px rgba(0,0,0,.1)",
            }} />

            {/* Interactive desk → Latihan Soal */}
            <button
              onClick={() => navigate("/browse")}
              style={{
                position: "absolute", left: isMobile ? "30%" : "50%", bottom: isMobile ? "18%" : "20%", transform: "translateX(-50%)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit",
              }}
            >
              <div style={{
                width: isMobile ? "68px" : "84px", height: isMobile ? "68px" : "84px",
                borderRadius: "16px", background: "#e84c2b",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 6px 20px rgba(232,76,43,.45)",
                border: "3px solid white",
                animation: "academy-pulse 2.2s ease-in-out infinite",
              }}>
                <BookOpen size={isMobile ? 28 : 36} color="white" />
              </div>
              <span style={{
                fontSize: isMobile ? "12px" : "13px", fontWeight: "700", color: "#0f0e17",
                background: "white", padding: "4px 12px", borderRadius: "99px",
                border: "1px solid var(--gs-border)", boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                whiteSpace: "nowrap",
              }}>
                Latihan Soal
              </span>
            </button>

            {/* Locked door — teaser for future rooms */}
            <div style={{
              position: "absolute", right: isMobile ? "14%" : "14%", bottom: isMobile ? "18%" : "20%",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", opacity: 0.5,
            }}>
              <div style={{
                width: isMobile ? "52px" : "64px", height: isMobile ? "52px" : "64px",
                borderRadius: "14px", background: "var(--gs-hover)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px dashed var(--gs-border)",
              }}>
                <DoorOpen size={isMobile ? 22 : 26} color="var(--gs-text-hint)" />
              </div>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--gs-text-hint)" }}>
                Segera
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "18px", color: "var(--gs-text-muted)", fontSize: "13px" }}>
            <Sparkles size={14} />
            Klik meja merah buat langsung ke Direktori Soal.
          </div>
        </div>
      </main>

      <style>{`
        @keyframes academy-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      <Footer />
    </div>
  );
}
