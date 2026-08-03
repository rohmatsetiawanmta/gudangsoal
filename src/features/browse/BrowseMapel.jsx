// src/features/browse/BrowseMapel.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronRight, BookOpen } from "lucide-react";
import Breadcrumb from "../../components/Breadcrumb";
import { getMapel } from "./browseApi";
import ComingSoonModal from "./ComingSoonModal";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";

export default function BrowseMapel() {
  const navigate = useNavigate();
  const { jenjangSlug, subjenjangSlug } = useParams();
  const { state }  = useLocation();
  const width      = useWindowWidth();
  const isMobile   = width <= 480;

  const jenjangNama    = state?.jenjangNama    || jenjangSlug;
  const subjenjangNama = state?.subjenjangNama || subjenjangSlug;

  const [mapel,   setMapel]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [comingSoonModal, setComingSoonModal] = useState(null);

  useEffect(() => {
    getMapel(jenjangSlug, subjenjangSlug)
      .then((data) => setMapel(data))
      .catch(() => setError("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [jenjangSlug, subjenjangSlug]);

  const labelMapel = ["utbk", "cpns", "osn"].includes(jenjangSlug) ? "Subtes" : "Mata Pelajaran";

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gs-bg)" }}>
      <SEO
        title={`${subjenjangNama} — ${jenjangNama}`}
        description={`Latihan soal ${subjenjangNama} jenjang ${jenjangNama}. Pilih mata pelajaran untuk mulai berlatih.`}
        url={`/browse/${jenjangSlug}/${subjenjangSlug}`}
      />
      <Navbar />

      <main style={{
        flex: 1, maxWidth: "720px", width: "100%", margin: "0 auto",
        padding: isMobile ? "20px 16px 48px" : "32px 24px 64px",
      }}>
        <div style={{ marginBottom: "16px" }}>
          <Breadcrumb items={[
            { label: "Direktori Soal", to: "/browse" },
            { label: jenjangNama, to: `/browse/${jenjangSlug}`, state: { jenjangNama, jenjangSlug } },
            { label: subjenjangNama },
          ]} />
        </div>

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
              {subjenjangNama}
            </h1>
            {!loading && mapel.length > 0 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "rgba(255,255,255,.8)", background: "rgba(255,255,255,.1)" }}>
                  {mapel.length} {labelMapel}
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
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{
                height: "68px", borderRadius: "14px",
                background: "var(--gs-border)", opacity: 0.5, animation: "pulse 1.5s infinite",
              }} />
            ))}
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {mapel.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px", color: "var(--gs-text-muted)", fontSize: "14px" }}>
                Belum ada {labelMapel.toLowerCase()} untuk {subjenjangNama}.
              </div>
            )}
            {mapel.map((m) => (
              <div
                key={m.id}
                onClick={() => m.is_coming_soon == 1 ? setComingSoonModal(m) : navigate(`/browse/${jenjangSlug}/${subjenjangSlug}/${m.slug}`, {
                  state: { jenjangNama, jenjangSlug, subjenjangNama, subjenjangSlug, mapelNama: m.nama, mapelSlug: m.slug },
                })}
                style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  background: "var(--gs-surface)", borderRadius: "14px",
                  border: "1px solid var(--gs-border)",
                  borderLeft: `3px solid ${m.is_coming_soon == 1 ? "#f5a623" : "#2563eb"}`,
                  padding: isMobile ? "14px 16px" : "16px 20px",
                  cursor: "pointer", transition: "transform .15s, box-shadow .15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{
                  width: isMobile ? "36px" : "40px", height: isMobile ? "36px" : "40px",
                  borderRadius: "10px", background: "rgba(37,99,235,.1)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <BookOpen size={isMobile ? 17 : 19} color="#2563eb" />
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: "600", fontSize: isMobile ? "14px" : "15px", color: "var(--gs-text)" }}>{m.nama}</span>
                  {m.is_coming_soon == 1 && <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "5px", background: "#fef9ee", color: "#f5a623", border: "1px solid #fde68a", flexShrink: 0 }}>Segera</span>}
                </div>
                <ChevronRight size={17} color={m.is_coming_soon == 1 ? "#f5a623" : "var(--gs-text-hint)"} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
      <ComingSoonModal item={comingSoonModal} onClose={() => setComingSoonModal(null)} />
    </div>
  );
}
