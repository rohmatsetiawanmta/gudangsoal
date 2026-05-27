// src/features/browse/BrowseTopik.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Breadcrumb from "../../components/Breadcrumb";
import { getTopik } from "./browseApi";
import Navbar from "../../components/Navbar";

export default function BrowseTopik() {
  const navigate = useNavigate();
  const { jenjangSlug, subjenjangSlug, mapelSlug } = useParams();
  const { state } = useLocation();

  const jenjangNama = state?.jenjangNama || jenjangSlug;
  const subjenjangNama = state?.subjenjangNama || subjenjangSlug;
  const mapelNama = state?.mapelNama || mapelSlug;

  const [topik, setTopik] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTopik(jenjangSlug, subjenjangSlug, mapelSlug)
      .then((data) => setTopik(data))
      .catch(() => setError("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [jenjangSlug, subjenjangSlug, mapelSlug]);

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f6" }}>
      <Navbar />

      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "40px" }}>
        <div style={{ marginBottom: "32px" }}>
          <Breadcrumb
            items={[
              { label: "Direktori Soal", to: "/browse" },
              {
                label: jenjangNama,
                to: `/browse/${jenjangSlug}`,
                state: { jenjangNama, jenjangSlug },
              },
              {
                label: subjenjangNama,
                to: `/browse/${jenjangSlug}/${subjenjangSlug}`,
                state: {
                  jenjangNama,
                  jenjangSlug,
                  subjenjangNama,
                  subjenjangSlug,
                },
              },
              { label: mapelNama },
            ]}
          />
        </div>
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "800",
              color: "#0f0e17",
              letterSpacing: "-0.5px",
              marginBottom: "6px",
            }}
          >
            Pilih Topik
          </h1>
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
            {Array.from({ length: 4 }).map((_, i) => (
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
        )}

        {!loading && !error && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {topik.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px",
                  color: "#6b6860",
                  fontSize: "14px",
                }}
              >
                Belum ada topik untuk {mapelNama}.
              </div>
            )}
            {topik.map((t) => (
              <div
                key={t.id}
                onClick={() =>
                  navigate(
                    `/browse/${jenjangSlug}/${subjenjangSlug}/${mapelSlug}/${t.slug}`,
                    {
                      state: {
                        jenjangNama,
                        jenjangSlug,
                        subjenjangNama,
                        subjenjangSlug,
                        mapelNama,
                        mapelSlug,
                        topikNama: t.nama,
                        topikSlug: t.slug,
                      },
                    }
                  )
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "white",
                  borderRadius: "14px",
                  padding: "18px 20px",
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
                <span
                  style={{
                    fontWeight: "600",
                    fontSize: "15px",
                    color: "#0f0e17",
                  }}
                >
                  {t.nama}
                </span>
                <ChevronRight size={18} color="#b4b2a9" />
              </div>
            ))}
          </div>
        )}
      </main>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
