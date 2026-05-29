// src/features/home/ChangelogPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Wrench, Bug, AlertTriangle } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import api from "../../lib/api";

const TIPE_CONFIG = {
  feature: { label: "Fitur Baru", color: "#1a8a6e", bg: "#e4f5f0", icon: Zap },
  improvement: {
    label: "Peningkatan",
    color: "#2563eb",
    bg: "#eff6ff",
    icon: Wrench,
  },
  fix: { label: "Perbaikan", color: "#854F0B", bg: "#faeeda", icon: Bug },
  breaking: {
    label: "Breaking",
    color: "#e84c2b",
    bg: "#fff3f0",
    icon: AlertTriangle,
  },
};

function TipeBadge({ tipe }) {
  const t = TIPE_CONFIG[tipe] || TIPE_CONFIG.feature;
  const Icon = t.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontSize: "11px",
        fontWeight: "700",
        padding: "3px 8px",
        borderRadius: "6px",
        background: t.bg,
        color: t.color,
      }}
    >
      <Icon size={11} />
      {t.label}
    </span>
  );
}

export default function ChangelogPage() {
  const navigate = useNavigate();
  const [changelogs, setChangelogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTipe, setFilterTipe] = useState("all");

  useEffect(() => {
    api
      .get("/changelog")
      .then((data) => setChangelogs(Array.isArray(data) ? data : []))
      .catch(() => setChangelogs([]))
      .finally(() => setLoading(false));
  }, []);

  // Filter berdasarkan tipe
  const filtered =
    filterTipe === "all"
      ? changelogs
      : changelogs.filter((c) => c.tipe === filterTipe);

  // Group by versi
  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.versi])
      acc[item.versi] = {
        versi: item.versi,
        released_at: item.released_at,
        items: [],
      };
    acc[item.versi].items.push(item);
    return acc;
  }, {});

  const versions = Object.values(grouped);

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f6" }}>
      <SEO
        title="Changelog"
        description="Daftar pembaruan dan fitur baru yang dirilis di Gudang Soal."
        url="/changelog"
      />
      <Navbar />

      <main
        style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 40px" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: "800",
              color: "#0f0e17",
              letterSpacing: "-0.5px",
              marginBottom: "12px",
            }}
          >
            Changelog
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#6b6860",
              lineHeight: "1.7",
              marginBottom: "24px",
            }}
          >
            Semua pembaruan, fitur baru, dan perbaikan yang dirilis di Gudang
            Soal.
          </p>

          {/* Filter tipe */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { value: "all", label: "Semua" },
              { value: "feature", label: "Fitur Baru" },
              { value: "improvement", label: "Peningkatan" },
              { value: "fix", label: "Perbaikan" },
              { value: "breaking", label: "Breaking" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterTipe(f.value)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "100px",
                  border: `1.5px solid ${
                    filterTipe === f.value ? "#e84c2b" : "#e2ddd5"
                  }`,
                  background: filterTipe === f.value ? "#fff3f0" : "white",
                  color: filterTipe === f.value ? "#e84c2b" : "#6b6860",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all .15s",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "32px" }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "120px",
                  borderRadius: "14px",
                  background: "#e2ddd5",
                  opacity: 0.5,
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && versions.length === 0 && (
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: "48px",
              textAlign: "center",
              color: "#6b6860",
              fontSize: "14px",
            }}
          >
            Belum ada changelog.
          </div>
        )}

        {/* Versions */}
        {!loading && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "48px" }}
          >
            {versions.map((v, vi) => (
              <div key={v.versi}>
                {/* Version header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "800",
                      color: "#0f0e17",
                    }}
                  >
                    v{v.versi}
                  </span>
                  {vi === 0 && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: "#e84c2b",
                        color: "white",
                      }}
                    >
                      Latest
                    </span>
                  )}
                  <div
                    style={{ flex: 1, height: "1px", background: "#e2ddd5" }}
                  />
                  <span style={{ fontSize: "13px", color: "#b4b2a9" }}>
                    {new Date(v.released_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Card grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  {v.items.map((item) => {
                    const t = TIPE_CONFIG[item.tipe] || TIPE_CONFIG.feature;
                    const Icon = t.icon;
                    return (
                      <div
                        key={item.id}
                        style={{
                          background: "white",
                          borderRadius: "12px",
                          border: "1px solid #e2ddd5",
                          padding: "16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "8px",
                              background: t.bg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={13} color={t.color} />
                          </div>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "700",
                              color: t.color,
                            }}
                          >
                            {t.label}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#0f0e17",
                            lineHeight: "1.4",
                          }}
                        >
                          {item.judul}
                        </div>
                        {item.deskripsi && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6b6860",
                              lineHeight: "1.6",
                            }}
                          >
                            {item.deskripsi}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA bottom */}
        <div
          style={{
            marginTop: "64px",
            background: "#0f0e17",
            borderRadius: "16px",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "800",
              color: "white",
              marginBottom: "8px",
            }}
          >
            Siap mulai belajar?
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.6)",
              marginBottom: "24px",
            }}
          >
            Bergabung gratis dan mulai kerjakan soal matematika.
          </p>
          <button
            onClick={() => navigate("/register")}
            style={{
              padding: "12px 28px",
              borderRadius: "10px",
              border: "none",
              background: "#e84c2b",
              color: "white",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Daftar Gratis
          </button>
        </div>
      </main>

      <Footer />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
