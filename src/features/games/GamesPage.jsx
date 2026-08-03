import { useNavigate } from "react-router-dom";
import { Gamepad2, TrendingUp } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";

const GAMES = [
  {
    slug: "number-sequence",
    title: "Number Sequence",
    description: "Tebak angka berikutnya dari pola deret aritmatika atau geometri.",
    icon: Gamepad2,
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    slug: "bank-pintar",
    title: "Bank Pintar",
    description: "Hitung bunga tunggal, bunga majemuk, dan cicilan pinjaman dengan cepat.",
    icon: TrendingUp,
    color: "#1a8a6e",
    bg: "#e4f5f0",
  },
];

export default function GamesPage() {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gs-bg)" }}>
      <SEO
        title="Games"
        description="Asah kemampuan matematika sambil bermain mini-game seru."
        url="/games"
      />
      <Navbar />

      <main
        style={{
          flex: 1,
          maxWidth: "800px",
          margin: "0 auto",
          padding: isMobile ? "24px 20px" : "40px",
          width: "100%",
        }}
      >
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              fontSize: isMobile ? "24px" : "28px",
              fontWeight: "800",
              color: "var(--gs-text)",
              letterSpacing: "-0.5px",
              marginBottom: "6px",
            }}
          >
            Games
          </h1>
          <p style={{ fontSize: "15px", color: "var(--gs-text-muted)" }}>
            Asah kemampuan matematika sambil bermain.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {GAMES.map((game) => {
            const Icon = game.icon;
            return (
              <div
                key={game.slug}
                onClick={() => navigate(`/games/${game.slug}`)}
                style={{
                  background: "var(--gs-surface)",
                  borderRadius: "16px",
                  border: "1px solid var(--gs-border)",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "transform .15s, box-shadow .15s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
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
                    top: 0, left: 0, right: 0,
                    height: "3px",
                    background: game.color,
                    borderRadius: "16px 16px 0 0",
                  }}
                />
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: game.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "14px",
                  }}
                >
                  <Icon size={22} color={game.color} />
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "var(--gs-text)",
                    marginBottom: "6px",
                  }}
                >
                  {game.title}
                </div>
                <div style={{ fontSize: "13px", color: "var(--gs-text-muted)", lineHeight: "1.5" }}>
                  {game.description}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
