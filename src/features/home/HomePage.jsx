// src/features/home/HomePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import {
  ChevronRight,
  CheckCircle,
  XCircle,
  BookOpen,
  Shuffle,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import api from "../../lib/api";
import { getProfile } from "../profile/profileApi";
import RandomSoal from "../../components/RandomSoal";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const [jenjang, setJenjang] = useState([]);
  const [riwayat, setRiwayat] = useState([]);
  const [loadingJenjang, setLoadingJenjang] = useState(true);
  const [loadingRiwayat, setLoadingRiwayat] = useState(true);
  const [randomOpen, setRandomOpen] = useState(false);

  useEffect(() => {
    // Fetch jenjang published
    api
      .get("/browse/jenjang")
      .then((data) => setJenjang(data))
      .catch(() => {})
      .finally(() => setLoadingJenjang(false));

    // Fetch profile + riwayat
    getProfile()
      .then((data) => {
        updateUser(data.user);
        setRiwayat(data.riwayat?.slice(0, 5) || []);
      })
      .catch(() => {})
      .finally(() => setLoadingRiwayat(false));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
  };

  // Warna per jenjang — fallback ke default kalau tidak ada
  const JENJANG_COLORS = {
    sd: "#e84c2b",
    smp: "#2563eb",
    sma: "#1a8a6e",
    utbk: "#f5a623",
    cpns: "#7c3aed",
    osn: "#db2777",
  };

  const getColor = (slug) => JENJANG_COLORS[slug?.toLowerCase()] || "#6b6860";

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f6" }}>
      <Navbar />

      <main
        style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 40px" }}
      >
        {/* Greeting */}
        <div style={{ marginBottom: "48px" }}>
          <p
            style={{ fontSize: "15px", color: "#6b6860", marginBottom: "4px" }}
          >
            {getGreeting()},
          </p>
          <h1
            style={{
              fontSize: "clamp(26px, 4vw, 36px)",
              fontWeight: "800",
              color: "#0f0e17",
              letterSpacing: "-0.5px",
            }}
          >
            {user?.name || "..."}
          </h1>
          <p style={{ fontSize: "15px", color: "#6b6860", marginTop: "8px" }}>
            Mau latihan apa hari ini?
          </p>
          <button
            onClick={() => setRandomOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "16px",
              padding: "10px 20px",
              borderRadius: "10px",
              border: "1px solid #e2ddd5",
              background: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "inherit",
              color: "#0f0e17",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f2efe8";
              e.currentTarget.style.borderColor = "#0f0e17";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#e2ddd5";
            }}
          >
            <Shuffle size={16} color="#e84c2b" />
            Acak Soal
          </button>
        </div>

        {randomOpen && <RandomSoal onClose={() => setRandomOpen(false)} />}

        {/* Jenjang Grid */}
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#0f0e17" }}>
            Pilih Jenjang
          </h2>
        </div>

        {loadingJenjang ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "14px",
              marginBottom: "52px",
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "110px",
                  borderRadius: "14px",
                  background: "#e2ddd5",
                  opacity: 0.5,
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "14px",
              marginBottom: "52px",
            }}
          >
            {jenjang.length === 0 && (
              <div
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  padding: "32px",
                  color: "#6b6860",
                  fontSize: "14px",
                }}
              >
                Belum ada jenjang tersedia.
              </div>
            )}
            {jenjang.map((j) => {
              const color = getColor(j.slug);
              return (
                <div
                  key={j.id}
                  onClick={() =>
                    navigate(`/browse/${j.slug}`, {
                      state: { jenjangNama: j.nama, jenjangSlug: j.slug },
                    })
                  }
                  style={{
                    background: "white",
                    borderRadius: "14px",
                    padding: "22px 18px",
                    border: "1px solid #e2ddd5",
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
                      width: "42px",
                      height: "42px",
                      borderRadius: "12px",
                      background: color + "18",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "14px",
                    }}
                  >
                    <BookOpen size={22} color={color} />
                  </div>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "17px",
                      color: "#0f0e17",
                      marginBottom: "3px",
                    }}
                  >
                    {j.nama}
                  </div>
                  <div style={{ fontSize: "13px", color: "#6b6860" }}>
                    {j.slug?.toUpperCase()}
                  </div>
                  <ChevronRight
                    size={16}
                    color="#b4b2a9"
                    style={{
                      position: "absolute",
                      right: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Sesi Terakhir */}
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#0f0e17" }}>
            Sesi Terakhir
          </h2>
          {riwayat.length > 0 && (
            <button
              onClick={() => navigate("/profile")}
              style={{
                fontSize: "13px",
                color: "#e84c2b",
                fontWeight: "600",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Lihat semua
            </button>
          )}
        </div>

        {loadingRiwayat ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "64px",
                  borderRadius: "14px",
                  background: "#e2ddd5",
                  opacity: 0.5,
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </div>
        ) : riwayat.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: "40px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "#f2efe8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}
            >
              <BookOpen size={24} color="#b4b2a9" />
            </div>
            <p
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#0f0e17",
                marginBottom: "4px",
              }}
            >
              Belum ada sesi latihan
            </p>
            <p style={{ fontSize: "14px", color: "#6b6860" }}>
              Pilih jenjang di atas untuk mulai latihan pertamamu!
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {riwayat.map((r, i) => (
              <div
                key={i}
                onClick={() => navigate(`/soal/${r.kode}`)}
                style={{
                  background: "white",
                  borderRadius: "14px",
                  border: "1px solid #e2ddd5",
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  cursor: "pointer",
                  transition: "transform .15s, box-shadow .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 16px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {r.is_correct == 1 ? (
                  <CheckCircle
                    size={18}
                    color="#1a8a6e"
                    style={{ flexShrink: 0 }}
                  />
                ) : (
                  <XCircle
                    size={18}
                    color="#e84c2b"
                    style={{ flexShrink: 0 }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#0f0e17",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.body
                      .replace(/\$\$?[^$]+\$\$?/g, "[math]")
                      .replace(/[*_~`#]/g, "")}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#b4b2a9",
                      marginTop: "3px",
                    }}
                  >
                    {r.jenjang} — {r.mapel} — {r.subtopik}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "4px",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#b4b2a9",
                      fontFamily: "monospace",
                    }}
                  >
                    {r.kode}
                  </span>
                  <span style={{ fontSize: "11px", color: "#b4b2a9" }}>
                    {new Date(r.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
