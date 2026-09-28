// src/features/paket/PaketList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ChevronRight, Lock, CheckCircle } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";
import api from "../../lib/api";

const JENIS_LABEL = {
  olimpiade:     "Olimpiade",
  un:            "Ujian Nasional",
  utbk:          "UTBK/SNBT",
  seleksi:       "Seleksi",
  ujian_sekolah: "Ujian Sekolah",
  lainnya:       "Lainnya",
};
const JENIS_COLOR = {
  olimpiade:     { color: "#e84c2b", bg: "rgba(232,76,43,.12)" },
  un:            { color: "#2563eb", bg: "rgba(37,99,235,.12)" },
  utbk:          { color: "#f5a623", bg: "rgba(245,166,35,.12)" },
  seleksi:       { color: "#e84c2b", bg: "rgba(232,76,43,.12)" },
  ujian_sekolah: { color: "#1a8a6e", bg: "rgba(26,138,110,.12)" },
  lainnya:       { color: "#6b6860", bg: "rgba(107,104,96,.12)" },
};

export default function PaketList() {
  const navigate  = useNavigate();
  const width     = useWindowWidth();
  const isMobile  = width <= 480;

  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    api.get("/paket")
      .then((d) => setList(Array.isArray(d) ? d : []))
      .catch(() => setError("Gagal memuat daftar paket soal"))
      .finally(() => setLoading(false));
  }, []);

  // Group by jenis
  const grouped = list.reduce((acc, p) => {
    const key = p.jenis || "lainnya";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});
  const jenisOrder = ["olimpiade", "utbk", "seleksi", "un", "ujian_sekolah", "lainnya"];
  const sortedJenis = jenisOrder.filter((j) => grouped[j]?.length > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gs-bg)" }}>
      <SEO
        title="Paket Soal"
        description="Kumpulan soal berdasarkan sumber aslinya — OSK, UTBK, UN, dan berbagai ujian seleksi lainnya."
        url="/paket"
      />
      <Navbar />

      <main style={{
        flex: 1, maxWidth: "720px", width: "100%", margin: "0 auto",
        padding: isMobile ? "20px 16px 48px" : "32px 24px 64px",
      }}>
        {/* Hero */}
        <div style={{
          borderRadius: "18px",
          background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #1a0a2e 100%)",
          padding: isMobile ? "24px 20px" : "28px 32px",
          marginBottom: "20px", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%",
            transform: "translateY(-50%)",
            opacity: 0.06, userSelect: "none", lineHeight: 1, pointerEvents: "none", color: "white",
          }}>
            <Package size={isMobile ? 80 : 110} />
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 8px" }}>
              Paket Soal
            </h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,.5)", margin: "0 0 12px" }}>
              Soal dari ujian dan olimpiade asli — OSK, UTBK, UN, dan lainnya.
            </p>
            {!loading && list.length > 0 && (
              <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "rgba(255,255,255,.8)", background: "rgba(255,255,255,.1)" }}>
                {list.length} Paket
              </span>
            )}
          </div>
        </div>

        {error && (
          <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "14px", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ height: "68px", borderRadius: "14px", background: "var(--gs-border)", opacity: 0.5, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        )}

        {!loading && !error && list.length === 0 && (
          <div style={{ background: "var(--gs-surface)", borderRadius: "16px", border: "1px solid var(--gs-border)", padding: "60px 48px", textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Package size={26} color="#e84c2b" />
            </div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--gs-text)", marginBottom: "6px" }}>Belum ada paket soal</div>
            <p style={{ fontSize: "13px", color: "var(--gs-text-muted)", margin: 0 }}>Paket soal sedang disiapkan.</p>
          </div>
        )}

        {!loading && !error && list.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {sortedJenis.map((jenis) => {
              const jc = JENIS_COLOR[jenis] || JENIS_COLOR.lainnya;
              const items = grouped[jenis];
              return (
                <div key={jenis}>
                  {/* Section label */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "99px", color: jc.color, background: jc.bg }}>
                      {JENIS_LABEL[jenis] || jenis}
                    </span>
                    <div style={{ flex: 1, height: "1px", background: "var(--gs-divider)" }} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {items.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => navigate(`/paket/${p.id}`)}
                        style={{
                          display: "flex", alignItems: "center", gap: "14px",
                          background: "var(--gs-surface)", borderRadius: "14px",
                          border: "1px solid var(--gs-border)",
                          borderLeft: `3px solid ${jc.color}`,
                          padding: isMobile ? "14px 16px" : "16px 20px",
                          cursor: "pointer", transition: "box-shadow .15s, transform .15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.06)"; e.currentTarget.style.transform = "translateX(3px)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateX(0)"; }}
                      >
                        <div style={{ width: isMobile ? "38px" : "42px", height: isMobile ? "38px" : "42px", borderRadius: "11px", background: jc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Package size={isMobile ? 18 : 20} color={jc.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: "700", fontSize: isMobile ? "14.5px" : "15px", color: "var(--gs-text)", marginBottom: "3px" }}>
                            {p.nama}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--gs-text-hint)" }}>
                            {p.jumlah_soal} soal{p.tahun ? ` · ${p.tahun}` : ""}
                          </div>
                        </div>
                        {p.harga > 0 && (
                          p.has_access ? (
                            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "700", padding: "3px 9px", borderRadius: "99px", color: "#1a8a6e", background: "#e4f5f0", flexShrink: 0 }}>
                              <CheckCircle size={11} /> Dibeli
                            </span>
                          ) : (
                            <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "700", padding: "3px 9px", borderRadius: "99px", color: "#854F0B", background: "#fef9ee", flexShrink: 0 }}>
                              <Lock size={11} /> Rp {Number(p.harga).toLocaleString("id-ID")}
                            </span>
                          )
                        )}
                        <ChevronRight size={17} color="var(--gs-text-hint)" />
                      </div>
                    ))}
                  </div>
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
