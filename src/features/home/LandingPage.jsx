// src/features/home/LandingPage.jsx
import { Link } from "react-router-dom";
import {
  School,
  Ruler,
  BarChart2,
  Target,
  Landmark,
  Trophy,
  BookOpen,
  Timer,
  TrendingUp,
} from "lucide-react";
import Navbar from "../../components/Navbar";

const JENJANG = [
  { id: "sd", label: "SD", icon: School, color: "#e84c2b", soal: "1.200+" },
  { id: "smp", label: "SMP", icon: Ruler, color: "#2563eb", soal: "1.800+" },
  {
    id: "sma",
    label: "SMA",
    icon: BarChart2,
    color: "#1a8a6e",
    soal: "2.500+",
  },
  { id: "utbk", label: "UTBK", icon: Target, color: "#f5a623", soal: "2.000+" },
  {
    id: "cpns",
    label: "CPNS",
    icon: Landmark,
    color: "#7c3aed",
    soal: "1.500+",
  },
  { id: "osn", label: "OSN", icon: Trophy, color: "#db2777", soal: "800+" },
];

const FITUR = [
  {
    icon: BookOpen,
    label: "Bank Soal Lengkap",
    desc: "Ribuan soal dari SD hingga OSN, terstruktur per topik dan tingkat kesulitan.",
  },
  {
    icon: Timer,
    label: "Mode Timed & Bebas",
    desc: "Latihan santai atau simulasi ujian ketat dengan timer. Keduanya tersedia.",
  },
  {
    icon: TrendingUp,
    label: "Pembahasan Langkah per Langkah",
    desc: "Setiap soal punya pembahasan terperinci — bukan cuma jawaban akhir.",
  },
];

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#faf9f6",
        fontFamily: "inherit",
      }}
    >
      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <section
        style={{
          padding: "80px 40px",
          textAlign: "center",
          maxWidth: "760px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#e4f5f0",
            color: "#1a8a6e",
            border: "1px solid rgba(26,138,110,0.2)",
            borderRadius: "100px",
            padding: "6px 16px",
            fontSize: "13px",
            fontWeight: "600",
            marginBottom: "28px",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              background: "#1a8a6e",
              borderRadius: "50%",
              display: "inline-block",
            }}
          />
          Persiapan UTBK, CPNS, OSN & lebih
        </div>
        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: "800",
            lineHeight: "1.1",
            letterSpacing: "-1.5px",
            color: "#0f0e17",
            marginBottom: "20px",
          }}
        >
          Satu gudang untuk
          <br />
          <span style={{ color: "#e84c2b" }}>semua soal matematika</span>
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: "#6b6860",
            lineHeight: "1.65",
            marginBottom: "36px",
            maxWidth: "500px",
            margin: "0 auto 36px",
          }}
        >
          Latihan terstruktur dari SD hingga persiapan ujian nasional. Ribuan
          soal dengan pembahasan lengkap.
        </p>
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/register"
            style={{
              padding: "14px 32px",
              borderRadius: "12px",
              background: "#e84c2b",
              color: "white",
              fontWeight: "700",
              fontSize: "16px",
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(232,76,43,0.3)",
            }}
          >
            Mulai Latihan Sekarang →
          </Link>
          <Link
            to="/login"
            style={{
              padding: "14px 32px",
              borderRadius: "12px",
              border: "2px solid #e2ddd5",
              color: "#0f0e17",
              fontWeight: "600",
              fontSize: "16px",
              textDecoration: "none",
            }}
          >
            Sudah punya akun
          </Link>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            justifyContent: "center",
            marginTop: "52px",
          }}
        >
          {[
            { num: "10K+", label: "Bank Soal" },
            { num: "SD–SMA", label: "Semua Jenjang" },
            { num: "6 Jenis", label: "Ujian Nasional" },
          ].map(({ num, label }, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  color: "#0f0e17",
                }}
              >
                {num}
              </div>
              <div
                style={{ fontSize: "13px", color: "#6b6860", marginTop: "4px" }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Jenjang */}
      <section style={{ padding: "80px 40px", background: "#f2efe8" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ marginBottom: "40px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "#e84c2b",
                marginBottom: "8px",
              }}
            >
              Persiapan Ujian
            </div>
            <h2
              style={{
                fontSize: "clamp(24px, 3.5vw, 36px)",
                fontWeight: "800",
                color: "#0f0e17",
                letterSpacing: "-0.5px",
              }}
            >
              Apapun ujiannya, kamu siap.
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "14px",
            }}
          >
            {JENJANG.map(({ id, label, icon: Icon, color, soal }) => (
              <div
                key={id}
                style={{
                  background: "white",
                  borderRadius: "14px",
                  padding: "22px 18px",
                  border: "1px solid #e2ddd5",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "transform .2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-4px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: color,
                  }}
                />
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: color + "18",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px",
                  }}
                >
                  <Icon size={20} color={color} />
                </div>
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "17px",
                    color: "#0f0e17",
                    marginBottom: "4px",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#6b6860",
                    letterSpacing: ".04em",
                  }}
                >
                  {soal} SOAL
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ marginBottom: "40px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "#e84c2b",
                marginBottom: "8px",
              }}
            >
              Kenapa Gudang Soal?
            </div>
            <h2
              style={{
                fontSize: "clamp(24px, 3.5vw, 36px)",
                fontWeight: "800",
                color: "#0f0e17",
                letterSpacing: "-0.5px",
              }}
            >
              Lebih dari sekadar kumpulan soal.
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {FITUR.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                style={{
                  background: "white",
                  borderRadius: "14px",
                  padding: "24px",
                  border: "1px solid #e2ddd5",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "#fff3f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "14px",
                  }}
                >
                  <Icon size={22} color="#e84c2b" />
                </div>
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "16px",
                    color: "#0f0e17",
                    marginBottom: "6px",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b6860",
                    lineHeight: "1.6",
                  }}
                >
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: "520px", margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "clamp(24px, 3.5vw, 36px)",
              fontWeight: "800",
              color: "#0f0e17",
              letterSpacing: "-0.5px",
              marginBottom: "16px",
            }}
          >
            Mulai latihan hari ini,
            <br />
            gratis selamanya.
          </h2>
          <p
            style={{ fontSize: "16px", color: "#6b6860", marginBottom: "32px" }}
          >
            Daftar dalam 30 detik. Tidak perlu kartu kredit.
          </p>
          <Link
            to="/register"
            style={{
              display: "inline-block",
              padding: "16px 40px",
              borderRadius: "12px",
              background: "#e84c2b",
              color: "white",
              fontWeight: "700",
              fontSize: "17px",
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(232,76,43,0.3)",
            }}
          >
            Daftar Sekarang — Gratis →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: "#f2efe8",
          borderTop: "1px solid #e2ddd5",
          padding: "32px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              background: "#e84c2b",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "800",
              fontSize: "12px",
            }}
          >
            GS
          </div>
          <span
            style={{ fontWeight: "700", fontSize: "15px", color: "#0f0e17" }}
          >
            Gudang Soal
          </span>
        </div>
        <p style={{ fontSize: "13px", color: "#6b6860" }}>
          © 2025 Gudang Soal. Dibuat untuk pelajar Indonesia.
        </p>
      </footer>
    </div>
  );
}
