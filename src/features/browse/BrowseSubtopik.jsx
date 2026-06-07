// src/features/browse/BrowseSubtopik.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronRight, Gamepad2 } from "lucide-react";
import Breadcrumb from "../../components/Breadcrumb";
import { getSubtopik } from "./browseApi";
import { getGamesByTopik } from "../games/gameApi";
import { getGameBySlug } from "../games/gamesConfig";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";

export default function BrowseSubtopik() {
  const navigate = useNavigate();
  const { jenjangSlug, subjenjangSlug, mapelSlug, topikSlug } = useParams();
  const { state } = useLocation();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const jenjangNama = state?.jenjangNama || jenjangSlug;
  const subjenjangNama = state?.subjenjangNama || subjenjangSlug;
  const mapelNama = state?.mapelNama || mapelSlug;
  const topikNama = state?.topikNama || topikSlug;

  const [subtopik, setSubtopik] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [games, setGames] = useState([]); // game yang di-assign ke topik ini

  useEffect(() => {
    getSubtopik(jenjangSlug, subjenjangSlug, mapelSlug, topikSlug)
      .then((data) => setSubtopik(data))
      .catch(() => setError("Gagal memuat data"))
      .finally(() => setLoading(false));

    // Fetch games — tidak bloking, gagal pun tidak apa-apa
    getGamesByTopik(topikSlug)
      .then((data) => {
        const resolved = (Array.isArray(data) ? data : [])
          .map((g) => getGameBySlug(g.slug))
          .filter(Boolean);
        setGames(resolved);
      })
      .catch(() => {}); // silent — game section cukup tidak muncul
  }, [jenjangSlug, subjenjangSlug, mapelSlug, topikSlug]);

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
        title={`${topikNama} — ${mapelNama}`}
        description={`Pilih subtopik ${topikNama} untuk latihan soal ${mapelNama} jenjang ${jenjangNama}.`}
        url={`/browse/${jenjangSlug}/${subjenjangSlug}/${mapelSlug}/${topikSlug}`}
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
              {
                label: mapelNama,
                to: `/browse/${jenjangSlug}/${subjenjangSlug}/${mapelSlug}`,
                state: {
                  jenjangNama,
                  jenjangSlug,
                  subjenjangNama,
                  subjenjangSlug,
                  mapelNama,
                  mapelSlug,
                },
              },
              { label: topikNama },
            ]}
          />
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
            Pilih Subtopik
          </h1>
          <p style={{ fontSize: "14px", color: "#6b6860" }}>
            Pilih subtopik {topikNama} yang ingin kamu pelajari.
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

        {!loading && !error && games.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <Gamepad2 size={16} color="#6b6860" />
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#0f0e17",
                  margin: 0,
                }}
              >
                Games
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "10px",
              }}
            >
              {games.map((game) => {
                const Icon = game.icon;
                return (
                  <div
                    key={game.slug}
                    onClick={() => navigate(game.path)}
                    style={{
                      background: "white",
                      borderRadius: "14px",
                      border: "1px solid #e2ddd5",
                      padding: "16px",
                      cursor: "pointer",
                      transition: "transform .15s, box-shadow .15s",
                      position: "relative",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
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
                        bottom: 0,
                        width: "3px",
                        background: game.color,
                        borderRadius: "14px 0 0 14px",
                      }}
                    />
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        background: game.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} color={game.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "#0f0e17",
                          marginBottom: "2px",
                        }}
                      >
                        {game.title}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b6860",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {game.description}
                      </div>
                    </div>
                    <ChevronRight size={16} color="#b4b2a9" flexShrink={0} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && !error && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {games.length > 0 && subtopik.length > 0 && (
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#0f0e17",
                  margin: "0 0 2px",
                }}
              >
                Pilih Subtopik
              </h2>
            )}
            {subtopik.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px",
                  color: "#6b6860",
                  fontSize: "14px",
                }}
              >
                Belum ada subtopik untuk {topikNama}.
              </div>
            )}
            {subtopik.map((st) => (
              <div
                key={st.id}
                onClick={() =>
                  navigate(
                    `/browse/${jenjangSlug}/${subjenjangSlug}/${mapelSlug}/${topikSlug}/${st.slug}`,
                    {
                      state: {
                        jenjangNama,
                        jenjangSlug,
                        subjenjangNama,
                        subjenjangSlug,
                        mapelNama,
                        mapelSlug,
                        topikNama,
                        topikSlug,
                        subtopikNama: st.nama,
                        subtopikSlug: st.slug,
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
                <span
                  style={{
                    fontWeight: "600",
                    fontSize: isMobile ? "14px" : "15px",
                    color: "#0f0e17",
                  }}
                >
                  {st.nama}
                </span>
                <ChevronRight size={18} color="#b4b2a9" />
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
