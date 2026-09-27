// src/features/browse/BrowseJenjang.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  School, Ruler, BarChart2, Target, Landmark, Trophy,
  ChevronRight, BookOpen,
} from "lucide-react";
import { getJenjang } from "./browseApi";
import ComingSoonModal from "./ComingSoonModal";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";

const ICON_MAP = {
  sd:   { icon: School,    color: "#e84c2b" },
  smp:  { icon: Ruler,     color: "#2563eb" },
  sma:  { icon: BarChart2, color: "#1a8a6e" },
  utbk: { icon: Target,    color: "#f5a623" },
  cpns: { icon: Landmark,  color: "#7c3aed" },
  osn:  { icon: Trophy,    color: "#db2777" },
};

export default function BrowseJenjang() {
  const navigate = useNavigate();
  const width    = useWindowWidth();
  const isMobile = width <= 480;

  const [jenjang, setJenjang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [comingSoonModal, setComingSoonModal] = useState(null);

  useEffect(() => {
    getJenjang()
      .then((data) => setJenjang(data))
      .catch(() => setError("Gagal memuat data jenjang"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gs-bg)" }}>
      <SEO
        title="Direktori Soal"
        description="Browse semua soal matematika berdasarkan jenjang — SD, SMP, SMA, UTBK, CPNS, dan OSN."
        url="/browse"
      />
      <Navbar />

      <main style={{
        flex: 1, maxWidth: "720px", width: "100%", margin: "0 auto",
        padding: isMobile ? "20px 16px 48px" : "32px 24px 64px",
      }}>

        {/* Hero */}
        <div style={{
          borderRadius: "18px",
          background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #0c1a2e 100%)",
          padding: isMobile ? "24px 20px" : "28px 32px",
          marginBottom: "20px",
          position: "relative", overflow: "hidden",
        }}>

          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 style={{
              fontSize: isMobile ? "22px" : "26px", fontWeight: "800",
              color: "white", letterSpacing: "-0.5px", margin: "0 0 10px",
            }}>
              Direktori Soal
            </h1>
            {!loading && jenjang.length > 0 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "rgba(255,255,255,.8)", background: "rgba(255,255,255,.1)" }}>
                  {jenjang.length} Jenjang
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div style={{
            background: "#fff3f0", border: "1px solid #fca5a5",
            color: "#b91c1c", fontSize: "14px",
            borderRadius: "12px", padding: "12px 16px", marginBottom: "16px",
          }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                height: "68px", borderRadius: "14px",
                background: "var(--gs-border)", opacity: 0.5,
                animation: "pulse 1.5s infinite",
              }} />
            ))}
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {jenjang.map((j) => {
              const { icon: Icon, color } = ICON_MAP[j.slug] || { icon: BookOpen, color: "var(--gs-text-muted)" };
              return (
                <div
                  key={j.id}
                  onClick={() => j.is_coming_soon == 1 ? setComingSoonModal(j) : navigate(`/browse/${j.slug}`, { state: { jenjangNama: j.nama, jenjangSlug: j.slug } })}
                  style={{
                    display: "flex", alignItems: "center", gap: "16px",
                    background: "var(--gs-surface)", borderRadius: "14px",
                    border: "1px solid var(--gs-border)",
                    borderLeft: `3px solid ${j.is_coming_soon == 1 ? "#d4d0c8" : color}`,
                    padding: isMobile ? "14px 16px" : "16px 20px",
                    cursor: j.is_coming_soon == 1 ? "default" : "pointer",
                    opacity: j.is_coming_soon == 1 ? 0.55 : 1,
                    transition: "box-shadow .15s, transform .15s",
                  }}
                  onMouseEnter={(e) => {
                    if (j.is_coming_soon == 1) return;
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.06)";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    if (j.is_coming_soon == 1) return;
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <div style={{
                    width: isMobile ? "38px" : "42px",
                    height: isMobile ? "38px" : "42px",
                    borderRadius: "11px",
                    background: color + "15",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon size={isMobile ? 19 : 21} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: "700", fontSize: isMobile ? "15px" : "15.5px", color: "var(--gs-text)" }}>
                        {j.nama}
                      </span>
                      {j.is_coming_soon == 1 && (
                        <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "5px", background: "#fef9ee", color: "#f5a623", border: "1px solid #fde68a", flexShrink: 0 }}>Segera</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={17} color={j.is_coming_soon ? "#f5a623" : "var(--gs-text-hint)"} />
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
      <ComingSoonModal item={comingSoonModal} onClose={() => setComingSoonModal(null)} />
    </div>
  );
}
