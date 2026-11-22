// src/features/academy/AcademyPage.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { School, DoorOpen, Sparkles, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";
import PixelSprite from "./PixelCharacter";
import {
  STUDENT_PALETTE, STUDENT_IDLE, STUDENT_WALK_A, STUDENT_WALK_B,
  NPC_PALETTE, NPC_IDLE,
} from "./spriteData";

const PIXEL_FONT = "'Press Start 2P', monospace";

const MOVE_KEYS = {
  arrowup: [0, -1], w: [0, -1],
  arrowdown: [0, 1], s: [0, 1],
  arrowleft: [-1, 0], a: [-1, 0],
  arrowright: [1, 0], d: [1, 0],
};

const BOUNDS = { xMin: 4, xMax: 88, yMin: 60, yMax: 90 };

export default function AcademyPage() {
  const navigate = useNavigate();
  const width    = useWindowWidth();
  const isMobile = width <= 480;

  const [pos, setPos]           = useState({ x: 14, y: 78 });
  const [facing, setFacing]     = useState(1); // 1 = right, -1 = left
  const [walkFrame, setWalkFrame] = useState(0);
  const [moving, setMoving]     = useState(false);
  const keysRef = useRef({});

  // Keyboard controls
  useEffect(() => {
    const onDown = (e) => {
      const k = e.key.toLowerCase();
      if (MOVE_KEYS[k]) {
        e.preventDefault();
        keysRef.current[k] = true;
      }
    };
    const onUp = (e) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  // Movement loop
  useEffect(() => {
    let raf;
    const speed = 0.7;
    const loop = () => {
      let dx = 0, dy = 0;
      for (const k in keysRef.current) {
        if (keysRef.current[k] && MOVE_KEYS[k]) {
          dx += MOVE_KEYS[k][0];
          dy += MOVE_KEYS[k][1];
        }
      }
      if (dx !== 0 || dy !== 0) {
        if (dx !== 0) setFacing(dx > 0 ? 1 : -1);
        setMoving(true);
        setPos((p) => ({
          x: Math.min(BOUNDS.xMax, Math.max(BOUNDS.xMin, p.x + dx * speed)),
          y: Math.min(BOUNDS.yMax, Math.max(BOUNDS.yMin, p.y + dy * speed)),
        }));
      } else {
        setMoving(false);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Walk-cycle frame toggle
  useEffect(() => {
    const id = setInterval(() => setWalkFrame((f) => (f === 0 ? 1 : 0)), 160);
    return () => clearInterval(id);
  }, []);

  const studentRows = !moving ? STUDENT_IDLE : walkFrame === 0 ? STUDENT_WALK_A : STUDENT_WALK_B;

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

        {/* ── 2D Village ── */}
        <div style={{
          background: "var(--gs-surface)",
          borderRadius: "20px",
          border: "1px solid var(--gs-border)",
          padding: isMobile ? "20px" : "28px",
        }}>
          <div style={{
            position: "relative",
            overflow: "hidden",
            minHeight: isMobile ? "340px" : "400px",
            border: "4px solid #0f0e17",
            borderRadius: "6px",
            boxShadow: "0 0 0 3px #3f7a3f, 6px 6px 0 rgba(15,14,23,.15)",
          }}>
            {/* Grass */}
            <div style={{
              position: "absolute", left: 0, right: 0, top: 0, bottom: 0,
              background: "#5fa84f",
              backgroundImage: "radial-gradient(rgba(255,255,255,.12) 2px, transparent 2px)",
              backgroundSize: "24px 24px",
            }} />
            {/* Dirt path */}
            <div style={{
              position: "absolute", left: 0, right: 0, bottom: 0, top: "56%",
              background: "#c79a6b",
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(0,0,0,.06) 0 6px, transparent 6px 16px)",
              borderTop: "4px solid #a9805a",
            }} />

            {/* Trees */}
            {[
              { left: isMobile ? "8%" : "10%", top: isMobile ? "26px" : "32px" },
              { right: isMobile ? "8%" : "10%", top: isMobile ? "28px" : "36px" },
            ].map((posStyle, i) => (
              <div key={i} style={{ position: "absolute", ...posStyle }}>
                <div style={{
                  width: isMobile ? "10px" : "12px", height: isMobile ? "18px" : "22px",
                  background: "#7a5230", margin: "0 auto",
                  border: "2px solid #0f0e17",
                }} />
                <div style={{
                  width: isMobile ? "44px" : "56px", height: isMobile ? "40px" : "50px",
                  background: "#3f8a3f", borderRadius: "50%",
                  border: "3px solid #0f0e17",
                  marginTop: isMobile ? "-30px" : "-38px",
                  boxShadow: "inset -6px -6px 0 rgba(0,0,0,.1)",
                }} />
              </div>
            ))}

            {/* NPC (static, decorative) */}
            <div style={{ position: "absolute", left: isMobile ? "58%" : "62%", top: isMobile ? "52%" : "54%" }}>
              <PixelSprite rows={NPC_IDLE} palette={NPC_PALETTE} size={isMobile ? 3.5 : 4.5} />
            </div>

            {/* House → Latihan Soal */}
            <button
              onClick={() => navigate("/browse")}
              style={{
                position: "absolute", left: isMobile ? "30%" : "34%", top: isMobile ? "28%" : "26%",
                display: "flex", flexDirection: "column", alignItems: "center",
                background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit",
              }}
            >
              <div style={{
                width: 0, height: 0,
                borderLeft: isMobile ? "38px solid transparent" : "48px solid transparent",
                borderRight: isMobile ? "38px solid transparent" : "48px solid transparent",
                borderBottom: `${isMobile ? "30px" : "38px"} solid #e84c2b`,
                filter: "drop-shadow(0 3px 0 #0f0e17)",
              }} />
              <div style={{
                width: isMobile ? "66px" : "84px", height: isMobile ? "44px" : "56px",
                background: "#e8ded0",
                border: "4px solid #0f0e17",
                borderTop: "none",
                display: "flex", alignItems: "flex-end", justifyContent: "center",
                boxShadow: "4px 4px 0 rgba(15,14,23,.25)",
              }}>
                <div style={{
                  width: isMobile ? "20px" : "26px", height: isMobile ? "28px" : "36px",
                  background: "#5a3a22", border: "2px solid #0f0e17", borderBottom: "none",
                }} />
              </div>
              <span style={{
                fontFamily: PIXEL_FONT,
                fontSize: isMobile ? "7px" : "9px", color: "#0f0e17", lineHeight: 1.6,
                background: "white", padding: "6px 10px", marginTop: "8px",
                border: "3px solid #0f0e17",
                boxShadow: "2px 2px 0 rgba(15,14,23,.3)",
                whiteSpace: "nowrap",
              }}>
                LATIHAN SOAL
              </span>
            </button>

            {/* Locked hut — teaser for future rooms */}
            <div style={{
              position: "absolute", right: isMobile ? "8%" : "10%", top: isMobile ? "30%" : "28%",
              display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.55,
            }}>
              <div style={{
                width: 0, height: 0,
                borderLeft: isMobile ? "28px solid transparent" : "36px solid transparent",
                borderRight: isMobile ? "28px solid transparent" : "36px solid transparent",
                borderBottom: `${isMobile ? "22px" : "28px"} solid #9ca3af`,
              }} />
              <div style={{
                width: isMobile ? "50px" : "64px", height: isMobile ? "34px" : "44px",
                background: "var(--gs-hover)",
                border: "3px dashed #0f0e17",
                borderTop: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <DoorOpen size={isMobile ? 16 : 20} color="var(--gs-text-hint)" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: PIXEL_FONT, fontSize: isMobile ? "6px" : "7px", color: "var(--gs-text-hint)", marginTop: "6px" }}>
                SEGERA
              </span>
            </div>

            {/* Player character */}
            <div style={{
              position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -100%)",
            }}>
              <PixelSprite
                rows={studentRows}
                palette={STUDENT_PALETTE}
                size={isMobile ? 4 : 5}
                flip={facing === -1}
              />
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginTop: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--gs-text-muted)", fontSize: "13px" }}>
              <Sparkles size={14} />
              {isMobile
                ? "Pakai tombol panah buat jalan, klik rumah merah buat ke Direktori Soal."
                : "Gerakin karakter pakai tombol panah / WASD, klik rumah merah buat ke Direktori Soal."}
            </div>

            {isMobile && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 36px)", gridTemplateRows: "repeat(2, 36px)", gap: "4px" }}>
                <div />
                <DpadBtn dirKey="arrowup" keysRef={keysRef}><ArrowUp size={16} /></DpadBtn>
                <div />
                <DpadBtn dirKey="arrowleft" keysRef={keysRef}><ArrowLeft size={16} /></DpadBtn>
                <DpadBtn dirKey="arrowdown" keysRef={keysRef}><ArrowDown size={16} /></DpadBtn>
                <DpadBtn dirKey="arrowright" keysRef={keysRef}><ArrowRight size={16} /></DpadBtn>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      `}</style>

      <Footer />
    </div>
  );
}

function DpadBtn({ children, dirKey, keysRef }) {
  return (
    <button
      onPointerDown={() => { keysRef.current[dirKey] = true; }}
      onPointerUp={() => { keysRef.current[dirKey] = false; }}
      onPointerLeave={() => { keysRef.current[dirKey] = false; }}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "white", border: "2px solid #0f0e17", borderRadius: "6px",
        color: "#0f0e17", touchAction: "none", userSelect: "none",
      }}
    >
      {children}
    </button>
  );
}
