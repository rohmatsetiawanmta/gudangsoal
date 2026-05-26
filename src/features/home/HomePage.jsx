// src/features/home/HomePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";
import { getProfile } from "../auth/authApi";
import {
  School,
  Ruler,
  BarChart2,
  Target,
  Landmark,
  Trophy,
  Flame,
  Star,
  ChevronRight,
} from "lucide-react";

const JENJANG = [
  { id: "sd", label: "SD", desc: "Kelas 1–6", icon: School, color: "#e84c2b" },
  { id: "smp", label: "SMP", desc: "Kelas 7–9", icon: Ruler, color: "#2563eb" },
  {
    id: "sma",
    label: "SMA",
    desc: "Kelas 10–12",
    icon: BarChart2,
    color: "#1a8a6e",
  },
  {
    id: "utbk",
    label: "UTBK",
    desc: "Persiapan PTN",
    icon: Target,
    color: "#f5a623",
  },
  {
    id: "cpns",
    label: "CPNS",
    desc: "TIU Numerik",
    icon: Landmark,
    color: "#7c3aed",
  },
  {
    id: "osn",
    label: "OSN",
    desc: "Olimpiade",
    icon: Trophy,
    color: "#db2777",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then((data) => updateUser(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f6" }}>
      {/* Navbar */}
      <nav
        style={{
          background: "white",
          borderBottom: "1px solid #e2ddd5",
          padding: "0 40px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              background: "#e84c2b",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "800",
              fontSize: "13px",
            }}
          >
            GS
          </div>
          <span
            style={{ fontWeight: "700", fontSize: "17px", color: "#0f0e17" }}
          >
            Gudang Soal
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Streak */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#fff3f0",
              borderRadius: "100px",
              padding: "6px 14px",
            }}
          >
            <Flame size={15} color="#e84c2b" />
            <span
              style={{ fontSize: "13px", fontWeight: "700", color: "#e84c2b" }}
            >
              {user?.streak || 0} hari
            </span>
          </div>
          {/* XP */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#faeeda",
              borderRadius: "100px",
              padding: "6px 14px",
            }}
          >
            <Star size={15} color="#854F0B" />
            <span
              style={{ fontSize: "13px", fontWeight: "700", color: "#854F0B" }}
            >
              {user?.xp || 0} XP
            </span>
          </div>
          {/* Avatar */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#e84c2b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
              }}
              onClick={() => logout()}
              title="Logout"
            >
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </nav>

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
            {loading ? "..." : user?.name} 👋
          </h1>
          <p style={{ fontSize: "15px", color: "#6b6860", marginTop: "8px" }}>
            Mau latihan apa hari ini?
          </p>
        </div>

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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "14px",
            marginBottom: "52px",
          }}
        >
          {JENJANG.map(({ id, label, desc, icon: Icon, color }) => (
            <div
              key={id}
              onClick={() => navigate(`/browse?jenjang=${id}`)}
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
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
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
                <Icon size={22} color={color} />
              </div>
              <div
                style={{
                  fontWeight: "700",
                  fontSize: "17px",
                  color: "#0f0e17",
                  marginBottom: "3px",
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: "13px", color: "#6b6860" }}>{desc}</div>
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
          ))}
        </div>

        {/* Riwayat — placeholder */}
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#0f0e17" }}>
            Sesi Terakhir
          </h2>
        </div>
        <div
          style={{
            background: "white",
            borderRadius: "14px",
            border: "1px solid #e2ddd5",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "10px" }}>📭</div>
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
      </main>
    </div>
  );
}
