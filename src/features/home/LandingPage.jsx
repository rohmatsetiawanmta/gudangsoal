// src/features/home/LandingPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Target,
  Zap,
  Trophy,
  Star,
  ChevronRight,
  BarChart2,
  Layers,
  CheckCircle,
  ArrowRight,
  Users,
} from "lucide-react";
import api from "../../lib/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";

const JENJANG = [
  //   { slug: "sd", label: "SD", desc: "Kelas 1–6", color: "#e84c2b" },
  //   { slug: "smp", label: "SMP", desc: "Kelas 7–9", color: "#2563eb" },
  //   { slug: "sma", label: "SMA", desc: "Kelas 10–12", color: "#1a8a6e" },
  { slug: "utbk", label: "UTBK", desc: "Persiapan PTN", color: "#f5a623" },
  //   { slug: "cpns", label: "CPNS", desc: "TIU Numerik", color: "#7c3aed" },
  //   { slug: "osn", label: "OSN", desc: "Olimpiade", color: "#db2777" },
];

const FITUR = [
  {
    icon: BookOpen,
    label: "Bank Soal Lengkap",
    // desc: "Ribuan soal matematika dari SD hingga persiapan UTBK, CPNS, dan OSN yang terus diperbarui.",
    desc: "Soal-soal persiapan UTBK yang terus diperbarui.",
    color: "#e84c2b",
  },
  {
    icon: Target,
    label: "Pembahasan Detail",
    desc: "Setiap soal dilengkapi pembahasan langkah per langkah yang mudah dipahami.",
    color: "#2563eb",
  },
  {
    icon: Zap,
    label: "Sistem XP & Streak",
    desc: "Kumpulkan XP setiap menjawab soal dengan benar. Jaga streak harianmu untuk bonus XP ekstra.",
    color: "#f5a623",
  },
  {
    icon: BarChart2,
    label: "Tracking Progress",
    desc: "Pantau akurasi, riwayat soal, dan perkembangan belajarmu dari waktu ke waktu.",
    color: "#7c3aed",
  },
  {
    icon: Star,
    label: "Berbagai Tingkat",
    desc: "Pilih tingkat kesulitan Easy, Medium, atau Hard sesuai kemampuan dan targetmu.",
    color: "#db2777",
  },
];

function StatCard({ icon: Icon, value, label, color, loading }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 24px" }}>
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "14px",
          background: color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 12px",
        }}
      >
        <Icon size={24} color={color} />
      </div>
      <div
        style={{
          fontSize: "32px",
          fontWeight: "800",
          color: "#0f0e17",
          lineHeight: 1,
          marginBottom: "4px",
        }}
      >
        {loading
          ? "..."
          : typeof value === "number"
          ? value.toLocaleString() + "+"
          : value}
      </div>
      <div style={{ fontSize: "14px", color: "#6b6860" }}>{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    api
      .get("/browse/stats")
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#faf9f6",
        fontFamily: "inherit",
      }}
    >
      <SEO url="/" />

      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "80px 40px 60px",
        }}
      >
        <div
          style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#fff3f0",
              border: "1px solid #fca5a5",
              borderRadius: "100px",
              padding: "6px 14px",
              marginBottom: "24px",
            }}
          >
            <Zap size={13} color="#e84c2b" />
            <span
              style={{ fontSize: "13px", fontWeight: "600", color: "#e84c2b" }}
            >
              Platform latihan matematika
            </span>
          </div>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: "800",
              color: "#0f0e17",
              letterSpacing: "-1px",
              lineHeight: 1.15,
              marginBottom: "20px",
            }}
          >
            Kuasai Matematika dengan{" "}
            <span style={{ color: "#e84c2b" }}>Soal-Soal</span> Berkualitas
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "#6b6860",
              lineHeight: "1.7",
              marginBottom: "36px",
            }}
          >
            Latihan soal {/*dari SD hingga*/} UTBK{/*}, CPNS, dan OSN*/}.
            Dilengkapi pembahasan detail, sistem XP, dan tracking progress
            belajarmu.
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => navigate("/register")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 28px",
                borderRadius: "12px",
                border: "none",
                background: "#e84c2b",
                color: "white",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#c43d20")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#e84c2b")
              }
            >
              Mulai Belajar Gratis
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "14px 28px",
                borderRadius: "12px",
                border: "1px solid #e2ddd5",
                background: "white",
                color: "#0f0e17",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f2efe8")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              Sudah punya akun? Masuk
            </button>
          </div>
        </div>
      </section>

      {/* Statistik */}
      <section
        style={{
          background: "white",
          borderTop: "1px solid #e2ddd5",
          borderBottom: "1px solid #e2ddd5",
        }}
      >
        <div
          style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 40px" }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}
          >
            {[
              {
                icon: BookOpen,
                value: stats?.total_soal,
                label: "Soal Tersedia",
                color: "#e84c2b",
              },
              {
                icon: Layers,
                value: stats?.total_subtopik,
                label: "Subtopik",
                color: "#1a8a6e",
              },
              {
                icon: Trophy,
                value: stats?.total_jenjang,
                label: "Jenjang Pendidikan",
                color: "#f5a623",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{ borderRight: i < 2 ? "1px solid #e2ddd5" : "none" }}
              >
                <StatCard {...s} loading={loadingStats} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 40px" }}
      >
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2
            style={{
              fontSize: "clamp(24px, 3vw, 36px)",
              fontWeight: "800",
              color: "#0f0e17",
              letterSpacing: "-0.5px",
              marginBottom: "12px",
            }}
          >
            Semua yang kamu butuhkan untuk belajar
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "#6b6860",
              maxWidth: "500px",
              margin: "0 auto",
              lineHeight: "1.7",
            }}
          >
            Dirancang untuk membantu pelajar Indonesia berprestasi di ujian dan
            kompetisi matematika.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          {FITUR.map(({ icon: Icon, label, desc, color }) => (
            <div
              key={label}
              style={{
                background: "white",
                borderRadius: "16px",
                border: "1px solid #e2ddd5",
                padding: "28px",
                transition: "transform .15s, box-shadow .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 12px 32px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "12px",
                  background: color + "18",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <Icon size={22} color={color} />
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#0f0e17",
                  marginBottom: "8px",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b6860",
                  lineHeight: "1.7",
                }}
              >
                {desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Jenjang Preview */}
      <section
        style={{
          background: "white",
          borderTop: "1px solid #e2ddd5",
          borderBottom: "1px solid #e2ddd5",
        }}
      >
        <div
          style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 40px" }}
        >
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2
              style={{
                fontSize: "clamp(24px, 3vw, 36px)",
                fontWeight: "800",
                color: "#0f0e17",
                letterSpacing: "-0.5px",
                marginBottom: "12px",
              }}
            >
              Untuk semua jenjang pendidikan
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: "#6b6860",
                maxWidth: "500px",
                margin: "0 auto",
                lineHeight: "1.7",
              }}
            >
              {/* Dari soal dasar SD hingga persiapan seleksi nasional — semua ada
              di sini. */}
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "14px",
            }}
          >
            {JENJANG.map(({ slug, label, desc, color }) => (
              <div
                key={slug}
                onClick={() => navigate("/register")}
                style={{
                  background: "#faf9f6",
                  borderRadius: "14px",
                  border: "1px solid #e2ddd5",
                  padding: "24px",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform .15s, box-shadow .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: "800",
                        color: "#0f0e17",
                        marginBottom: "4px",
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ fontSize: "14px", color: "#6b6860" }}>
                      {desc}
                    </div>
                  </div>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: color + "18",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ChevronRight size={20} color={color} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara kerja */}
      <section
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 40px" }}
      >
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2
            style={{
              fontSize: "clamp(24px, 3vw, 36px)",
              fontWeight: "800",
              color: "#0f0e17",
              letterSpacing: "-0.5px",
              marginBottom: "12px",
            }}
          >
            Mulai belajar dalam 3 langkah
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "32px",
          }}
        >
          {[
            {
              step: "1",
              label: "Daftar gratis",
              desc: "Buat akun dalam hitungan detik. Tidak perlu kartu kredit.",
              icon: Users,
              color: "#e84c2b",
            },
            {
              step: "2",
              label: "Pilih jenjang & topik",
              desc: "Pilih jenjang pendidikan dan topik yang ingin kamu latih.",
              icon: BookOpen,
              color: "#2563eb",
            },
            {
              step: "3",
              label: "Kerjakan & berkembang",
              desc: "Jawab soal, baca pembahasan, dan pantau progresmu setiap hari.",
              icon: Trophy,
              color: "#1a8a6e",
            },
          ].map(({ step, label, desc, icon: Icon, color }) => (
            <div key={step} style={{ textAlign: "center" }}>
              <div
                style={{
                  position: "relative",
                  width: "64px",
                  height: "64px",
                  margin: "0 auto 20px",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: color + "18",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={28} color={color} />
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: "800",
                    color: "white",
                  }}
                >
                  {step}
                </div>
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#0f0e17",
                  marginBottom: "8px",
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b6860",
                  lineHeight: "1.7",
                }}
              >
                {desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 40px 80px" }}
      >
        <div
          style={{
            background: "#0f0e17",
            borderRadius: "24px",
            padding: "64px 48px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(232,76,43,0.2)",
              border: "1px solid rgba(232,76,43,0.3)",
              borderRadius: "100px",
              padding: "6px 14px",
              marginBottom: "24px",
            }}
          >
            <CheckCircle size={13} color="#e84c2b" />
            <span
              style={{ fontSize: "13px", fontWeight: "600", color: "#e84c2b" }}
            >
              Gratis
            </span>
          </div>
          <h2
            style={{
              fontSize: "clamp(24px, 3vw, 40px)",
              fontWeight: "800",
              color: "white",
              letterSpacing: "-0.5px",
              marginBottom: "16px",
              lineHeight: 1.2,
            }}
          >
            Siap mulai perjalanan belajarmu?
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.6)",
              marginBottom: "36px",
              lineHeight: "1.7",
            }}
          >
            {/* Bergabung dengan ribuan pelajar yang sudah berlatih di Gudang Soal. */}
            Bergabung dengan Gudang Soal. Gratis, tanpa syarat.
          </p>
          <button
            onClick={() => navigate("/register")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 32px",
              borderRadius: "12px",
              border: "none",
              background: "#e84c2b",
              color: "white",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#c43d20")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#e84c2b")}
          >
            Daftar Gratis Sekarang
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
