// src/features/browse/BrowseJenjang.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  School,
  Ruler,
  BarChart2,
  Target,
  Landmark,
  Trophy,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import Breadcrumb from "../../components/Breadcrumb";
import { getJenjang } from "./browseApi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";

const ICON_MAP = {
  sd: { icon: School, color: "#e84c2b" },
  smp: { icon: Ruler, color: "#2563eb" },
  sma: { icon: BarChart2, color: "#1a8a6e" },
  utbk: { icon: Target, color: "#f5a623" },
  cpns: { icon: Landmark, color: "#7c3aed" },
  osn: { icon: Trophy, color: "#db2777" },
};

export default function BrowseJenjang() {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [jenjang, setJenjang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getJenjang()
      .then((data) => setJenjang(data))
      .catch(() => setError("Gagal memuat data jenjang"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#faf9f6",
      }}
    >
      <SEO
        title="Direktori Soal"
        description="Browse semua soal matematika berdasarkan jenjang — SD, SMP, SMA, UTBK, CPNS, dan OSN."
        url="/browse"
      />
      <Navbar />

      <main
        style={{
          flex: 1,
          maxWidth: "720px",
          width: "100%",
          margin: "0 auto",
          padding: isMobile ? "24px 16px" : "40px",
        }}
      >
        <div style={{ marginBottom: "32px" }}>
          <Breadcrumb items={[{ label: "Direktori Soal" }]} />
        </div>

        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              fontSize: isMobile ? "22px" : "26px",
              fontWeight: "800",
              color: "#0f0e17",
              letterSpacing: "-0.5px",
              marginBottom: "6px",
            }}
          >
            Pilih Jenjang
          </h1>
          <p style={{ fontSize: "14px", color: "#6b6860" }}>
            Pilih jenjang pendidikan atau jenis ujian yang ingin kamu pelajari.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fff3f0",
              border: "1px solid #fca5a5",
              color: "#b91c1c",
              fontSize: "14px",
              borderRadius: "12px",
              padding: "12px 16px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {loading && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "72px",
                  borderRadius: "14px",
                  background: "#e2ddd5",
                  opacity: 0.5,
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </div>
        )}

        {!loading && !error && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {jenjang.map((j) => {
              const { icon: Icon, color } = ICON_MAP[j.slug] || {
                icon: BookOpen,
                color: "#6b6860",
              };
              return (
                <div
                  key={j.id}
                  onClick={() =>
                    navigate(`/browse/${j.slug}`, {
                      state: { jenjangNama: j.nama, jenjangSlug: j.slug },
                    })
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    background: "white",
                    borderRadius: "14px",
                    padding: isMobile ? "14px 16px" : "18px 20px",
                    border: "1px solid #e2ddd5",
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
                  <div
                    style={{
                      width: isMobile ? "38px" : "44px",
                      height: isMobile ? "38px" : "44px",
                      borderRadius: "12px",
                      background: color + "18",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={isMobile ? 19 : 22} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: "700",
                        fontSize: isMobile ? "15px" : "16px",
                        color: "#0f0e17",
                      }}
                    >
                      {j.nama}
                    </div>
                  </div>
                  <ChevronRight size={18} color="#b4b2a9" />
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
