// src/features/academy/AcademyPage.jsx
import { useNavigate } from "react-router-dom";
import { School, BookOpen, DoorOpen, Presentation, Sparkles } from "lucide-react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";
import PixelCharacter from "./PixelCharacter";

const PIXEL_FONT = "'Press Start 2P', monospace";

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

        {/* ── 2D Room (8-bit) ── */}
        <div style={{
          background: "var(--gs-surface)",
          borderRadius: "20px",
          border: "1px solid var(--gs-border)",
          padding: isMobile ? "20px" : "28px",
        }}>
          <div style={{
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(to bottom, #d7cfc0 0%, #d7cfc0 38%, #c9a876 38%, #c9a876 100%)",
            minHeight: isMobile ? "340px" : "400px",
            border: "4px solid #0f0e17",
            borderRadius: "6px",
            boxShadow: "0 0 0 3px #c9a876, 6px 6px 0 rgba(15,14,23,.15)",
            imageRendering: "pixelated",
          }}>
            {/* Floor tile pattern */}
            <div style={{
              position: "absolute", left: 0, right: 0, bottom: 0, top: "38%",
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0,0,0,.1) 0 2px, transparent 2px 40px)," +
                "repeating-linear-gradient(90deg, rgba(0,0,0,.1) 0 2px, transparent 2px 40px)",
            }} />

            {/* Blackboard */}
            <div style={{
              position: "absolute", top: isMobile ? "14px" : "20px", left: "50%", transform: "translateX(-50%)",
              width: isMobile ? "140px" : "180px", height: isMobile ? "70px" : "90px",
              background: "#1a3a2e",
              border: "4px solid #0f0e17",
              boxShadow: "0 0 0 3px #8a6d4b, 4px 4px 0 rgba(15,14,23,.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Presentation size={isMobile ? 24 : 30} color="rgba(255,255,255,.55)" strokeWidth={2.5} />
            </div>

            {/* Windows */}
            <div style={{
              position: "absolute", top: isMobile ? "16px" : "24px", left: isMobile ? "16px" : "32px",
              width: isMobile ? "44px" : "58px", height: isMobile ? "44px" : "58px",
              background: "linear-gradient(135deg, #a8d8e8, #6ba8c8)",
              border: "4px solid #0f0e17",
              boxShadow: "0 0 0 3px white, 3px 3px 0 rgba(15,14,23,.2)",
            }} />
            <div style={{
              position: "absolute", top: isMobile ? "16px" : "24px", right: isMobile ? "16px" : "32px",
              width: isMobile ? "44px" : "58px", height: isMobile ? "44px" : "58px",
              background: "linear-gradient(135deg, #a8d8e8, #6ba8c8)",
              border: "4px solid #0f0e17",
              boxShadow: "0 0 0 3px white, 3px 3px 0 rgba(15,14,23,.2)",
            }} />

            {/* Student character */}
            <div style={{
              position: "absolute", left: isMobile ? "6%" : "18%", bottom: isMobile ? "16%" : "18%",
            }}>
              <PixelCharacter size={isMobile ? 4 : 5} />
            </div>

            {/* Interactive desk → Latihan Soal */}
            <button
              onClick={() => navigate("/browse")}
              style={{
                position: "absolute", left: isMobile ? "38%" : "55%", bottom: isMobile ? "18%" : "20%", transform: "translateX(-50%)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
                background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit",
              }}
            >
              <div style={{
                width: isMobile ? "64px" : "80px", height: isMobile ? "64px" : "80px",
                background: "#e84c2b",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "4px solid #0f0e17",
                boxShadow: "0 0 0 3px #fff, 4px 4px 0 rgba(15,14,23,.3)",
                animation: "academy-pulse 1.4s steps(2) infinite",
              }}>
                <BookOpen size={isMobile ? 26 : 32} color="white" strokeWidth={2.5} />
              </div>
              <span style={{
                fontFamily: PIXEL_FONT,
                fontSize: isMobile ? "8px" : "9px", color: "#0f0e17", lineHeight: 1.6,
                background: "white", padding: "6px 10px",
                border: "3px solid #0f0e17",
                boxShadow: "2px 2px 0 rgba(15,14,23,.3)",
                whiteSpace: "nowrap",
              }}>
                LATIHAN SOAL
              </span>
            </button>

            {/* Locked door — teaser for future rooms */}
            <div style={{
              position: "absolute", right: isMobile ? "10%" : "12%", bottom: isMobile ? "18%" : "20%",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", opacity: 0.55,
            }}>
              <div style={{
                width: isMobile ? "50px" : "60px", height: isMobile ? "50px" : "60px",
                background: "var(--gs-hover)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "3px dashed #0f0e17",
              }}>
                <DoorOpen size={isMobile ? 20 : 24} color="var(--gs-text-hint)" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: PIXEL_FONT, fontSize: isMobile ? "7px" : "8px", color: "var(--gs-text-hint)" }}>
                SEGERA
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
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        @keyframes academy-pulse {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes pixel-char-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
      `}</style>

      <Footer />
    </div>
  );
}
