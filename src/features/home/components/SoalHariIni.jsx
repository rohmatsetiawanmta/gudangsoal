// src/features/home/components/SoalHariIni.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronRight } from "lucide-react";
import { getSoalHariIni } from "../homeApi";
import MathRenderer from "../../../components/MathRenderer";

const DIFFICULTY_MAP = {
  1: { label: "Easy", color: "#1a8a6e", bg: "#e4f5f0" },
  2: { label: "Medium", color: "#854F0B", bg: "#faeeda" },
  3: { label: "Hard", color: "#e84c2b", bg: "#fff3f0" },
};

export default function SoalHariIni({ isMobile }) {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJenjang, setSelectedJenjang] = useState(null);

  useEffect(() => {
    getSoalHariIni()
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setData(list);
        if (list.length > 0) setSelectedJenjang(list[0].jenjang_id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const selected = data.find((d) => d.jenjang_id === selectedJenjang);
  const soal = selected?.soal;
  const diff = DIFFICULTY_MAP[soal?.difficulty] || DIFFICULTY_MAP[1];

  if (!loading && data.length === 0) return null;

  return (
    <div style={{ marginBottom: isMobile ? "32px" : "48px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <h2
            style={{
              fontSize: isMobile ? "16px" : "18px",
              fontWeight: "800",
              color: "var(--gs-text)",
              letterSpacing: "-0.3px",
            }}
          >
            Soal Hari Ini
          </h2>
        </div>
        <span style={{ fontSize: "12px", color: "var(--gs-text-hint)" }}>{today}</span>
      </div>

      {/* Card */}
      <div
        style={{
          background: "var(--gs-surface)",
          borderRadius: "16px",
          border: "1px solid var(--gs-border)",
          overflow: "hidden",
        }}
      >
        {/* Tab jenjang */}
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            borderBottom: "1px solid #f2efe8",
            scrollbarWidth: "none",
          }}
        >
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: "40px",
                    width: "80px",
                    flexShrink: 0,
                    background: "var(--gs-hover)",
                    margin: "8px",
                    borderRadius: "8px",
                    animation: "pulse 1.5s infinite",
                  }}
                />
              ))
            : data.map((d) => (
                <button
                  key={d.jenjang_id}
                  onClick={() => setSelectedJenjang(d.jenjang_id)}
                  style={{
                    padding: "12px 18px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: "13px",
                    fontWeight:
                      selectedJenjang === d.jenjang_id ? "700" : "500",
                    color:
                      selectedJenjang === d.jenjang_id ? "#e84c2b" : "var(--gs-text-muted)",
                    borderBottom:
                      selectedJenjang === d.jenjang_id
                        ? "2px solid #e84c2b"
                        : "2px solid transparent",
                    whiteSpace: "nowrap",
                    transition: "all .15s",
                    flexShrink: 0,
                  }}
                >
                  {d.jenjang_nama}
                </button>
              ))}
        </div>

        {/* Soal */}
        {loading ? (
          <div
            style={{
              padding: isMobile ? "20px 16px" : "24px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                height: "16px",
                width: "60px",
                background: "var(--gs-hover)",
                borderRadius: "6px",
                animation: "pulse 1.5s infinite",
              }}
            />
            <div
              style={{
                height: "60px",
                background: "var(--gs-hover)",
                borderRadius: "8px",
                animation: "pulse 1.5s infinite",
              }}
            />
          </div>
        ) : soal ? (
          <div
            onClick={() => navigate(`/soal/${soal.kode}`)}
            style={{
              padding: isMobile ? "18px 16px" : "22px 24px",
              cursor: "pointer",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gs-surface-subtle)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            {/* Meta */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  background: diff.bg,
                  color: diff.color,
                }}
              >
                {diff.label}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "var(--gs-text-hint)",
                  fontFamily: "monospace",
                }}
              >
                #{soal.kode}
              </span>
            </div>

            {/* Lokasi soal */}
            <div
              style={{
                fontSize: "12px",
                color: "var(--gs-text-hint)",
                marginBottom: "12px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {isMobile
                ? `${soal.mapel} — ${soal.subtopik}`
                : `${soal.subjenjang} — ${soal.mapel} — ${soal.topik} — ${soal.subtopik}`}
            </div>

            {/* Body soal */}
            <div
              style={{
                fontSize: isMobile ? "14px" : "15px",
                color: "var(--gs-text)",
                fontWeight: "500",
                lineHeight: "1.6",
                marginBottom: "16px",
                maxHeight: "100px",
                overflow: "hidden",
                maskImage:
                  "linear-gradient(to bottom, black 60%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 60%, transparent 100%)",
              }}
            >
              <MathRenderer text={soal.body} block />
            </div>

            {/* CTA */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "14px",
                borderTop: "1px solid #f2efe8",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#e84c2b",
                }}
              >
                Kerjakan sekarang
              </span>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "#fff3f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChevronRight size={15} color="#e84c2b" />
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              color: "var(--gs-text-hint)",
              fontSize: "13px",
            }}
          >
            Belum ada soal untuk jenjang ini.
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
