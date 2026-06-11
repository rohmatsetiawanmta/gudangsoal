// src/features/home/LandingPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Target,
  Zap,
  Trophy,
  Star,
  BarChart2,
  Layers,
  ArrowRight,
  Users,
  CheckCircle,
} from "lucide-react";
import api from "../../lib/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";

const FITUR = [
  {
    icon: BookOpen,
    label: "Bank Soal Lengkap",
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

export default function LandingPage() {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    api
      .get("/browse/stats")
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  const px = isMobile ? "20px" : "40px";
  const sectionPy = isMobile ? "56px" : "88px";

  const statVal = (v) =>
    loadingStats ? "—" : typeof v === "number" ? v.toLocaleString() + "+" : (v || "—");

  return (
    <div style={{ minHeight: "100vh", background: "#f2efe8", fontFamily: "inherit" }}>
      <SEO url="/" />
      <Navbar />

      {/* ── Hero ── */}
      <section style={{
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #0c1a2e 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* background watermark */}
        <div style={{
          position: "absolute", right: isMobile ? "-60px" : "80px",
          top: "50%", transform: "translateY(-50%)",
          opacity: 0.04, pointerEvents: "none", color: "white", lineHeight: 1,
          userSelect: "none",
        }}>
          <BookOpen size={isMobile ? 220 : 360} />
        </div>

        <div style={{
          maxWidth: "1100px", margin: "0 auto",
          padding: `${isMobile ? "64px" : "100px"} ${px} ${isMobile ? "56px" : "80px"}`,
          position: "relative", zIndex: 1,
        }}>
          <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center" }}>

            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(232,76,43,.15)",
              border: "1px solid rgba(232,76,43,.3)",
              borderRadius: "100px", padding: "6px 14px",
              marginBottom: "24px",
            }}>
              <Zap size={13} color="#fca5a5" />
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#fca5a5" }}>
                Platform latihan matematika
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: isMobile ? "32px" : "clamp(36px, 5vw, 60px)",
              fontWeight: "800", color: "white",
              letterSpacing: "-1px", lineHeight: 1.1,
              marginBottom: "20px",
            }}>
              Kuasai Matematika dengan{" "}
              <span style={{ color: "#e84c2b" }}>Soal-Soal</span>{" "}
              Berkualitas
            </h1>

            {/* Description */}
            <p style={{
              fontSize: isMobile ? "15px" : "17px",
              color: "rgba(255,255,255,.55)",
              lineHeight: "1.75",
              maxWidth: "500px",
              margin: "0 auto 32px",
            }}>
              Latihan soal UTBK. Dilengkapi pembahasan detail, sistem XP, dan
              tracking progress belajarmu.
            </p>

            {/* CTAs */}
            <div style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "10px",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <button
                onClick={() => navigate("/register")}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  padding: isMobile ? "13px 24px" : "14px 28px",
                  borderRadius: "12px", border: "none",
                  background: "#e84c2b", color: "white",
                  fontSize: isMobile ? "14px" : "15px", fontWeight: "700",
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 4px 20px rgba(232,76,43,.4)",
                  width: isMobile ? "100%" : "auto",
                  transition: "background .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#c43d20")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#e84c2b")}
              >
                Mulai Belajar Gratis <ArrowRight size={17} />
              </button>
              <button
                onClick={() => navigate("/login")}
                style={{
                  padding: isMobile ? "13px 24px" : "14px 28px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,.2)",
                  background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.8)",
                  fontSize: isMobile ? "14px" : "15px", fontWeight: "600",
                  cursor: "pointer", fontFamily: "inherit",
                  width: isMobile ? "100%" : "auto",
                  transition: "background .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.15)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.08)")}
              >
                Sudah punya akun? Masuk
              </button>
            </div>

            {/* Inline stats */}
            <div style={{
              display: "flex", gap: isMobile ? "24px" : "56px",
              justifyContent: "center", flexWrap: "wrap",
              marginTop: "52px", paddingTop: "32px",
              borderTop: "1px solid rgba(255,255,255,.08)",
            }}>
              {[
                { value: stats?.total_soal, label: "Soal tersedia" },
                { value: stats?.total_subtopik, label: "Subtopik" },
                { value: stats?.total_jenjang, label: "Jenjang" },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{
                    fontSize: isMobile ? "26px" : "34px",
                    fontWeight: "800", color: "white",
                    lineHeight: 1, marginBottom: "5px",
                  }}>
                    {statVal(s.value)}
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,.4)", fontWeight: "500" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Fitur ── */}
      <section style={{ background: "white", borderTop: "1px solid #e8e6e0", borderBottom: "1px solid #e8e6e0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: `${sectionPy} ${px}` }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? "32px" : "56px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "#f0f4ff", border: "1px solid #bfdbfe",
              borderRadius: "100px", padding: "5px 14px", marginBottom: "16px",
            }}>
              <Zap size={12} color="#2563eb" />
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb" }}>Fitur unggulan</span>
            </div>
            <h2 style={{
              fontSize: isMobile ? "22px" : "clamp(24px, 3vw, 36px)",
              fontWeight: "800", color: "#0f0e17",
              letterSpacing: "-0.5px", marginBottom: "12px",
            }}>
              Semua yang kamu butuhkan untuk belajar
            </h2>
            <p style={{
              fontSize: "15px", color: "#6b6860",
              maxWidth: "480px", margin: "0 auto", lineHeight: "1.7",
            }}>
              Dirancang untuk membantu pelajar Indonesia berprestasi di ujian dan kompetisi matematika.
            </p>
          </div>

          {isMobile ? (
            /* Mobile: stacked list */
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {FITUR.map(({ icon: Icon, label, desc, color }) => (
                <div key={label} style={{
                  background: "#faf9f6",
                  borderRadius: "16px",
                  border: "1px solid #e2ddd5",
                  borderLeft: `3px solid ${color}`,
                  padding: "18px 20px",
                  display: "flex", gap: "14px", alignItems: "flex-start",
                }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "10px",
                    background: color + "18", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f0e17", marginBottom: "4px" }}>{label}</div>
                    <div style={{ fontSize: "13px", color: "#6b6860", lineHeight: "1.6" }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Desktop: featured first card + 2×2 grid */
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "16px" }}>
              {/* Featured card — spans 2 rows */}
              {(() => {
                const { icon: Icon, label, desc, color } = FITUR[0];
                return (
                  <div style={{
                    gridColumn: "1", gridRow: "1 / 3",
                    background: `linear-gradient(160deg, ${color}10 0%, #faf9f6 55%)`,
                    borderRadius: "20px",
                    border: `1px solid ${color}28`,
                    padding: "36px 32px",
                    display: "flex", flexDirection: "column",
                    position: "relative", overflow: "hidden",
                  }}>
                    <div style={{
                      position: "absolute", right: "-16px", bottom: "-20px",
                      opacity: 0.05, pointerEvents: "none", color,
                    }}>
                      <Icon size={160} />
                    </div>
                    <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{
                        width: "64px", height: "64px", borderRadius: "18px",
                        background: color + "18",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: "28px",
                        boxShadow: `0 6px 20px ${color}30`,
                      }}>
                        <Icon size={32} color={color} />
                      </div>
                      <div style={{
                        fontSize: "11px", fontWeight: "800", color,
                        letterSpacing: ".1em", textTransform: "uppercase", marginBottom: "10px",
                      }}>
                        Fitur utama
                      </div>
                      <div style={{
                        fontSize: "22px", fontWeight: "800", color: "#0f0e17",
                        letterSpacing: "-0.4px", marginBottom: "14px", lineHeight: 1.2,
                      }}>
                        {label}
                      </div>
                      <div style={{ fontSize: "14px", color: "#6b6860", lineHeight: "1.75", flex: 1 }}>
                        {desc}
                      </div>
                      <div style={{
                        marginTop: "28px", paddingTop: "20px",
                        borderTop: `1px solid ${color}18`,
                        fontSize: "13px", fontWeight: "600", color,
                        display: "flex", alignItems: "center", gap: "6px",
                      }}>
                        <CheckCircle size={14} /> Terus diperbarui
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 4 compact cards — 2×2 */}
              {FITUR.slice(1).map(({ icon: Icon, label, desc, color }) => (
                <div key={label} style={{
                  background: "#faf9f6",
                  borderRadius: "16px",
                  border: "1px solid #e2ddd5",
                  padding: "22px 24px",
                  display: "flex", gap: "14px", alignItems: "flex-start",
                  transition: "box-shadow .15s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  <div style={{
                    width: "42px", height: "42px", borderRadius: "12px",
                    background: color + "15", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f0e17", marginBottom: "5px" }}>{label}</div>
                    <div style={{ fontSize: "13px", color: "#6b6860", lineHeight: "1.65" }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Cara kerja ── */}
      <section style={{ background: "#f5f3ef", borderTop: "1px solid #e8e6e0", borderBottom: "1px solid #e2ddd5" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: `${sectionPy} ${px}` }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? "36px" : "60px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "#fff3f0", border: "1px solid #fca5a5",
              borderRadius: "100px", padding: "5px 14px", marginBottom: "16px",
            }}>
              <CheckCircle size={12} color="#e84c2b" />
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#e84c2b" }}>Cara mulai</span>
            </div>
            <h2 style={{
              fontSize: isMobile ? "22px" : "clamp(24px, 3vw, 36px)",
              fontWeight: "800", color: "#0f0e17",
              letterSpacing: "-0.5px", marginBottom: "10px",
            }}>
              Mulai belajar dalam 3 langkah
            </h2>
            <p style={{ fontSize: "15px", color: "#6b6860" }}>
              Daftar gratis, pilih topik, dan mulai latihan sekarang.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "20px",
          }}>
            {[
              {
                step: "01", label: "Daftar gratis",
                desc: "Buat akun dalam hitungan detik. Tidak perlu kartu kredit.",
                icon: Users, color: "#e84c2b",
              },
              {
                step: "02", label: "Pilih jenjang & topik",
                desc: "Pilih jenjang pendidikan dan topik yang ingin kamu latih.",
                icon: BookOpen, color: "#2563eb",
              },
              {
                step: "03", label: "Kerjakan & berkembang",
                desc: "Jawab soal, baca pembahasan, dan pantau progresmu setiap hari.",
                icon: Trophy, color: "#1a8a6e",
              },
            ].map(({ step, label, desc, icon: Icon, color }) => (
              <div key={step} style={{
                background: `linear-gradient(135deg, white 0%, ${color}09 100%)`,
                borderRadius: "20px",
                border: `1px solid ${color}30`,
                padding: isMobile ? "24px 22px" : "32px 28px",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Large watermark number */}
                <div style={{
                  position: "absolute", right: "-8px", bottom: "-24px",
                  fontSize: isMobile ? "96px" : "120px",
                  fontWeight: "900", color, opacity: 0.07,
                  lineHeight: 1, userSelect: "none", pointerEvents: "none",
                }}>
                  {step}
                </div>

                <div style={{ position: "relative", zIndex: 1 }}>
                  {/* Icon */}
                  <div style={{
                    width: "52px", height: "52px", borderRadius: "14px",
                    background: color + "18",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "20px",
                    boxShadow: `0 4px 12px ${color}25`,
                  }}>
                    <Icon size={26} color={color} />
                  </div>

                  {/* Eyebrow */}
                  <div style={{
                    fontSize: "11px", fontWeight: "800", color,
                    letterSpacing: ".1em", textTransform: "uppercase",
                    marginBottom: "8px",
                  }}>
                    Langkah {step}
                  </div>

                  {/* Title */}
                  <div style={{
                    fontSize: isMobile ? "16px" : "18px",
                    fontWeight: "800", color: "#0f0e17",
                    letterSpacing: "-0.3px", marginBottom: "10px",
                  }}>
                    {label}
                  </div>

                  {/* Desc */}
                  <div style={{ fontSize: "13px", color: "#6b6860", lineHeight: "1.75" }}>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: `${sectionPy} ${px}` }}>
        <div style={{
          background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #2c1810 100%)",
          borderRadius: isMobile ? "20px" : "28px",
          padding: isMobile ? "48px 28px" : "72px 56px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* watermark */}
          <div style={{
            position: "absolute", right: isMobile ? "-30px" : "60px",
            top: "50%", transform: "translateY(-50%)",
            opacity: 0.04, pointerEvents: "none", color: "white", lineHeight: 1,
            userSelect: "none",
          }}>
            <Layers size={isMobile ? 140 : 220} />
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(110,231,183,.12)",
              border: "1px solid rgba(110,231,183,.25)",
              borderRadius: "100px", padding: "6px 14px",
              marginBottom: "20px",
            }}>
              <CheckCircle size={13} color="#6ee7b7" />
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#6ee7b7" }}>
                Gratis selamanya
              </span>
            </div>

            <h2 style={{
              fontSize: isMobile ? "24px" : "clamp(28px, 3vw, 44px)",
              fontWeight: "800", color: "white",
              letterSpacing: "-0.5px", marginBottom: "16px", lineHeight: 1.2,
            }}>
              Siap mulai perjalanan belajarmu?
            </h2>
            <p style={{
              fontSize: isMobile ? "14px" : "16px",
              color: "rgba(255,255,255,.5)",
              marginBottom: "32px", lineHeight: "1.7",
            }}>
              Bergabung dengan Gudang Soal. Gratis, tanpa syarat.
            </p>
            <button
              onClick={() => navigate("/register")}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: isMobile ? "13px 28px" : "15px 36px",
                borderRadius: "12px", border: "none",
                background: "#e84c2b", color: "white",
                fontSize: isMobile ? "14px" : "16px", fontWeight: "700",
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 4px 20px rgba(232,76,43,.4)",
                transition: "background .15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#c43d20")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#e84c2b")}
            >
              Daftar Gratis Sekarang <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
