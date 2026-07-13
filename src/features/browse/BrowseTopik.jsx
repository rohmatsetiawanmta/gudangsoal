// src/features/browse/BrowseTopik.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronRight, BookOpen } from "lucide-react";
import Breadcrumb from "../../components/Breadcrumb";
import { getTopik } from "./browseApi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";

export default function BrowseTopik() {
  const navigate = useNavigate();
  const { jenjangSlug, subjenjangSlug, mapelSlug } = useParams();
  const { state }  = useLocation();
  const width      = useWindowWidth();
  const isMobile   = width <= 480;

  const jenjangNama    = state?.jenjangNama    || jenjangSlug;
  const subjenjangNama = state?.subjenjangNama || subjenjangSlug;
  const mapelNama      = state?.mapelNama      || mapelSlug;

  const [topik,   setTopik]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    getTopik(jenjangSlug, subjenjangSlug, mapelSlug)
      .then((data) => setTopik(data))
      .catch(() => setError("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [jenjangSlug, subjenjangSlug, mapelSlug]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gs-bg)" }}>
      <SEO
        title={`${mapelNama} — ${subjenjangNama}`}
        description={`Pilih topik ${mapelNama} untuk latihan soal matematika jenjang ${jenjangNama}.`}
        url={`/browse/${jenjangSlug}/${subjenjangSlug}/${mapelSlug}`}
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
            { label: subjenjangNama, to: `/browse/${jenjangSlug}/${subjenjangSlug}`, state: { jenjangNama, jenjangSlug, subjenjangNama, subjenjangSlug } },
            { label: mapelNama },
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
          <div style={{
            position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%",
            transform: "translateY(-50%)", opacity: 0.05,
            pointerEvents: "none", color: "white",
          }}>
            <BookOpen size={isMobile ? 80 : 110} />
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 style={{
              fontSize: isMobile ? "22px" : "26px", fontWeight: "800",
              color: "white", letterSpacing: "-0.5px", margin: "0 0 8px",
            }}>
              {mapelNama}
            </h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,.5)", margin: 0 }}>
              {subjenjangNama} · {jenjangNama} · Pilih topik
            </p>
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
                height: "60px", borderRadius: "14px",
                background: "var(--gs-border)", opacity: 0.5, animation: "pulse 1.5s infinite",
              }} />
            ))}
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {topik.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px", color: "var(--gs-text-muted)", fontSize: "14px" }}>
                Belum ada topik untuk {mapelNama}.
              </div>
            )}
            {topik.map((t) => (
              <div
                key={t.id}
                onClick={() => navigate(`/browse/${jenjangSlug}/${subjenjangSlug}/${mapelSlug}/${t.slug}`, {
                  state: { jenjangNama, jenjangSlug, subjenjangNama, subjenjangSlug, mapelNama, mapelSlug, topikNama: t.nama, topikSlug: t.slug },
                })}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "var(--gs-surface)", borderRadius: "14px",
                  border: "1px solid var(--gs-border)",
                  borderLeft: "3px solid #1a8a6e",
                  padding: isMobile ? "14px 16px" : "16px 20px",
                  cursor: "pointer", transition: "transform .15s, box-shadow .15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <span style={{ fontWeight: "600", fontSize: isMobile ? "14px" : "15px", color: "var(--gs-text)" }}>
                  {t.nama}
                </span>
                <ChevronRight size={17} color="var(--gs-text-hint)" />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
