// src/features/browse/BrowseSoal.jsx
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";

const PAGE_SIZE = 10;
import Breadcrumb from "../../components/Breadcrumb";
import MateriTerkaitBanner from "../../components/MateriTerkaitBanner";
import { getSoal } from "./browseApi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";

function DifficultyBadge({ level }) {
  const map = {
    1: { label: "Easy", color: "#1a8a6e", bg: "#e4f5f0" },
    2: { label: "Medium", color: "#854F0B", bg: "#faeeda" },
    3: { label: "Hard", color: "#e84c2b", bg: "#fff3f0" },
  };
  const d = map[level] || map[1];
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: "700",
        padding: "3px 8px",
        borderRadius: "6px",
        background: d.bg,
        color: d.color,
        flexShrink: 0,
      }}
    >
      {d.label}
    </span>
  );
}

export default function BrowseSoal() {
  const navigate = useNavigate();
  const { jenjangSlug, subjenjangSlug, mapelSlug, topikSlug, subtopikSlug } =
    useParams();
  const { state } = useLocation();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const jenjangNama = state?.jenjangNama || jenjangSlug;
  const subjenjangNama = state?.subjenjangNama || subjenjangSlug;
  const mapelNama = state?.mapelNama || mapelSlug;
  const topikNama = state?.topikNama || topikSlug;
  const subtopikNama = state?.subtopikNama || subtopikSlug;

  const [soal, setSoal]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [page, setPage]       = useState(1);
  const [filterDiff, setFilterDiff] = useState(0);

  useEffect(() => {
    setPage(1);
    getSoal(jenjangSlug, subjenjangSlug, mapelSlug, topikSlug, subtopikSlug)
      .then((data) => {
        data.sort((a, b) => (a.answered_correct === b.answered_correct ? 0 : a.answered_correct ? 1 : -1));
        setSoal(data);
      })
      .catch(() => setError("Gagal memuat soal"))
      .finally(() => setLoading(false));
  }, [jenjangSlug, subjenjangSlug, mapelSlug, topikSlug, subtopikSlug]);

  const filtered   = filterDiff ? soal.filter(s => s.difficulty == filterDiff) : soal;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedSoal  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#faf9f6",
      }}
    >
      {!loading && (
        <SEO
          title={`${subtopikNama} — ${mapelNama}`}
          description={`${soal.length} soal latihan ${subtopikNama} — ${mapelNama} jenjang ${jenjangNama}. Lengkap dengan pembahasan detail.`}
          url={`/browse/${jenjangSlug}/${subjenjangSlug}/${mapelSlug}/${topikSlug}/${subtopikSlug}`}
        />
      )}
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
              {
                label: topikNama,
                to: `/browse/${jenjangSlug}/${subjenjangSlug}/${mapelSlug}/${topikSlug}`,
                state: {
                  jenjangNama,
                  jenjangSlug,
                  subjenjangNama,
                  subjenjangSlug,
                  mapelNama,
                  mapelSlug,
                  topikNama,
                  topikSlug,
                },
              },
              { label: subtopikNama },
            ]}
          />
        </div>

        {/* Header */}
        <div
          style={{
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <h1
            style={{
              fontSize: isMobile ? "20px" : "26px",
              fontWeight: "800",
              color: "#0f0e17",
              letterSpacing: "-0.5px",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: isMobile ? "nowrap" : "normal",
            }}
          >
            {subtopikNama}
          </h1>
          {!loading && (
            <span
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#6b6860",
                flexShrink: 0,
              }}
            >
              {soal.length} soal
            </span>
          )}
        </div>

        <MateriTerkaitBanner subtopikSlug={subtopikSlug} style={{ marginBottom: "20px" }} />

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
            {Array.from({ length: 5 }).map((_, i) => (
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
          <>
            {/* Filter + header row */}
            {soal.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", gap: "8px", flexWrap: "wrap" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {filterDiff ? filtered.length : soal.length} Soal
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[
                    { label: "Semua", val: 0,  color: "#6b6860",  bg: "#f2efe8" },
                    { label: "Easy",  val: 1,  color: "#1a8a6e",  bg: "#e4f5f0" },
                    { label: "Medium",val: 2,  color: "#854F0B",  bg: "#faeeda" },
                    { label: "Hard",  val: 3,  color: "#e84c2b",  bg: "#fff3f0" },
                  ].map(({ label, val, color, bg }) => (
                    <button key={val} onClick={() => { setFilterDiff(v => v === val ? 0 : val); setPage(1); }}
                      style={{
                        padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                        border: `1.5px solid ${filterDiff === val ? color : "#e2ddd5"}`,
                        background: filterDiff === val ? bg : "white",
                        color: filterDiff === val ? color : "#6b6860",
                        cursor: "pointer", fontFamily: "inherit", transition: "all .12s",
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px", color: "#6b6860", fontSize: "14px" }}>
                  {soal.length === 0
                    ? `Belum ada soal untuk ${subtopikNama}.`
                    : "Tidak ada soal dengan filter ini."}
                </div>
              )}
              {pagedSoal.map((s, i) => {
                const globalIndex = (page - 1) * PAGE_SIZE + i + 1;
                return (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/soal/${s.kode}`, { state: { ...state, subtopikNama } })}
                    style={{
                      display: "flex", alignItems: "center",
                      gap: isMobile ? "10px" : "14px",
                      background: "white", borderRadius: "14px",
                      padding: isMobile ? "12px 14px" : "16px 20px",
                      border: "1px solid #e2ddd5",
                      borderLeft: s.answered_correct ? "3px solid #1a8a6e" : "1px solid #e2ddd5",
                      cursor: "pointer",
                      transition: "transform .15s, box-shadow .15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: s.answered_correct ? "#e4f5f0" : "#f2efe8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: s.answered_correct ? "#1a8a6e" : "#6b6860", flexShrink: 0 }}>
                      {s.answered_correct
                        ? <CheckCircle2 size={15} color="#1a8a6e" />
                        : globalIndex}
                    </div>
                    {!isMobile && (
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#b4b2a9", fontFamily: "monospace", letterSpacing: ".05em", flexShrink: 0 }}>
                        {s.kode}
                      </div>
                    )}
                    <div style={{ flex: 1, fontSize: "14px", color: "#0f0e17", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>
                      {s.body.replace(/\$\$?[^$]+\$\$?/g, "[math]").replace(/[*_~`#]/g, "")}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "6px" : "10px", flexShrink: 0 }}>
                      <DifficultyBadge level={s.difficulty} />
                      <ChevronRight size={16} color="#b4b2a9" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "24px" }}>
                {/* Prev */}
                <button
                  onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === 1}
                  style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "#d4d0c8" : "#6b6860", transition: "all .15s" }}
                  onMouseEnter={e => { if (page !== 1) e.currentTarget.style.borderColor = "#0f0e17"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2ddd5"; }}
                >
                  <ChevronLeft size={15} />
                </button>

                {/* Page numbers */}
                {(() => {
                  const pages = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (page > 3) pages.push("...");
                    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
                    if (page < totalPages - 2) pages.push("...");
                    pages.push(totalPages);
                  }
                  return pages.map((p, idx) =>
                    p === "..." ? (
                      <span key={`ellipsis-${idx}`} style={{ width: "36px", textAlign: "center", color: "#b4b2a9", fontSize: "13px" }}>…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        style={{ width: "36px", height: "36px", borderRadius: "10px", border: `1px solid ${p === page ? "#2563eb" : "#e2ddd5"}`, background: p === page ? "#2563eb" : "white", color: p === page ? "white" : "#0f0e17", fontSize: "13px", fontWeight: p === page ? "700" : "500", cursor: "pointer", transition: "all .15s" }}
                        onMouseEnter={e => { if (p !== page) e.currentTarget.style.borderColor = "#2563eb"; }}
                        onMouseLeave={e => { if (p !== page) e.currentTarget.style.borderColor = "#e2ddd5"; }}
                      >
                        {p}
                      </button>
                    )
                  );
                })()}

                {/* Next */}
                <button
                  onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={page === totalPages}
                  style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: page === totalPages ? "not-allowed" : "pointer", color: page === totalPages ? "#d4d0c8" : "#6b6860", transition: "all .15s" }}
                  onMouseEnter={e => { if (page !== totalPages) e.currentTarget.style.borderColor = "#0f0e17"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2ddd5"; }}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
