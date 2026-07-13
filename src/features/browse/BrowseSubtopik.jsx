// src/features/browse/BrowseSubtopik.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronRight, BookOpen } from "lucide-react";
import Breadcrumb from "../../components/Breadcrumb";
import { getSubtopik } from "./browseApi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";

export default function BrowseSubtopik() {
  const navigate = useNavigate();
  const { jenjangSlug, subjenjangSlug, mapelSlug, topikSlug } = useParams();
  const { state }  = useLocation();
  const width      = useWindowWidth();
  const isMobile   = width <= 480;

  const jenjangNama    = state?.jenjangNama    || jenjangSlug;
  const subjenjangNama = state?.subjenjangNama || subjenjangSlug;
  const mapelNama      = state?.mapelNama      || mapelSlug;
  const topikNama      = state?.topikNama      || topikSlug;

  const [subtopik, setSubtopik] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    getSubtopik(jenjangSlug, subjenjangSlug, mapelSlug, topikSlug)
      .then((data) => setSubtopik(data))
      .catch(() => setError("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [jenjangSlug, subjenjangSlug, mapelSlug, topikSlug]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gs-bg)" }}>
      <SEO
        title={`${topikNama} — ${mapelNama}`}
        description={`Pilih subtopik ${topikNama} untuk latihan soal ${mapelNama} jenjang ${jenjangNama}.`}
        url={`/browse/${jenjangSlug}/${subjenjangSlug}/${mapelSlug}/${topikSlug}`}
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
            { label: mapelNama, to: `/browse/${jenjangSlug}/${subjenjangSlug}/${mapelSlug}`, state: { jenjangNama, jenjangSlug, subjenjangNama, subjenjangSlug, mapelNama, mapelSlug } },
            { label: topikNama },
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
              {topikNama}
            </h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,.5)", margin: 0 }}>
              {mapelNama} · {subjenjangNama} · Pilih subtopik
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
            {subtopik.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px", color: "var(--gs-text-muted)", fontSize: "14px" }}>
                Belum ada subtopik untuk {topikNama}.
              </div>
            )}
            {subtopik.map((st) => {
              const pct = st.soal_count > 0 ? Math.min(100, Math.round((st.answered_count / st.soal_count) * 100)) : 0;
              const done = st.soal_count > 0 && st.answered_count >= st.soal_count;
              return (
                <div
                  key={st.id}
                  onClick={() => navigate(`/browse/${jenjangSlug}/${subjenjangSlug}/${mapelSlug}/${topikSlug}/${st.slug}`, {
                    state: { jenjangNama, jenjangSlug, subjenjangNama, subjenjangSlug, mapelNama, mapelSlug, topikNama, topikSlug, subtopikNama: st.nama, subtopikSlug: st.slug },
                  })}
                  style={{
                    background: "var(--gs-surface)", borderRadius: "14px",
                    border: "1px solid var(--gs-border)",
                    borderLeft: `3px solid ${done ? "#1a8a6e" : "#7c3aed"}`,
                    padding: isMobile ? "14px 16px" : "16px 20px",
                    cursor: "pointer", transition: "transform .15s, box-shadow .15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "600", fontSize: isMobile ? "14px" : "15px", color: "var(--gs-text)" }}>
                      {st.nama}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                      {st.soal_count > 0 && (
                        <span style={{ fontSize: "11px", color: done ? "#1a8a6e" : "var(--gs-text-hint)", fontWeight: done ? "700" : "400" }}>
                          {done ? "Selesai" : `${st.answered_count}/${st.soal_count}`}
                        </span>
                      )}
                      <ChevronRight size={17} color="var(--gs-text-hint)" />
                    </div>
                  </div>
                  {st.soal_count > 0 && (
                    <div style={{ marginTop: "10px", height: "4px", borderRadius: "2px", background: "var(--gs-divider)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: "2px",
                        width: `${pct}%`,
                        background: done ? "#1a8a6e" : "#7c3aed",
                        transition: "width .4s ease",
                      }} />
                    </div>
                  )}
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
