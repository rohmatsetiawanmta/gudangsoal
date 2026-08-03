// src/features/browse/BrowseSoal.jsx
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import katex from "katex";
import api from "../../lib/api";

const PAGE_SIZE = 10;
import Breadcrumb from "../../components/Breadcrumb";
import MateriTerkaitBanner from "../../components/MateriTerkaitBanner";
import { getSoal } from "./browseApi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";

function renderBodyPreview(raw) {
  const text = raw.replace(/[*_~`#]/g, "");
  const esc  = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const re   = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
  let html = "", last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) html += esc(text.slice(last, m.index));
    try {
      html += katex.renderToString(m[1] ?? m[2], { throwOnError: false, displayMode: false, output: "html" });
    } catch {
      html += esc(m[0]);
    }
    last = m.index + m[0].length;
  }
  html += esc(text.slice(last));
  return html;
}

const DIFF = {
  1: { label: "Easy",   color: "#1a8a6e", bg: "#e4f5f0", chip: "#6ee7b7", chipBg: "rgba(110,231,183,.12)" },
  2: { label: "Medium", color: "#854F0B", bg: "#faeeda", chip: "#fcd34d", chipBg: "rgba(252,211,77,.12)"  },
  3: { label: "Hard",   color: "#e84c2b", bg: "#fff3f0", chip: "#fca5a5", chipBg: "rgba(252,165,165,.12)" },
};

function DifficultyBadge({ level }) {
  const d = DIFF[level] || DIFF[1];
  return (
    <span style={{
      fontSize: "11px", fontWeight: "700",
      padding: "3px 9px", borderRadius: "6px",
      background: d.bg, color: d.color, flexShrink: 0,
    }}>
      {d.label}
    </span>
  );
}

export default function BrowseSoal() {
  const navigate = useNavigate();
  const { jenjangSlug, subjenjangSlug, mapelSlug, topikSlug, subtopikSlug } = useParams();
  const { state } = useLocation();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [meta, setMeta] = useState(null);
  const jenjangNama    = state?.jenjangNama    || meta?.jenjang    || jenjangSlug;
  const subjenjangNama = state?.subjenjangNama || meta?.subjenjang || subjenjangSlug;
  const mapelNama      = state?.mapelNama      || meta?.mapel      || mapelSlug;
  const topikNama      = state?.topikNama      || meta?.topik      || topikSlug;
  const subtopikNama   = state?.subtopikNama   || meta?.subtopik   || subtopikSlug;

  const [soal, setSoal]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [page, setPage]             = useState(1);
  const [filterDiff, setFilterDiff] = useState(0);

  const [materi, setMateri]               = useState([]);
  const [materiLoading, setMateriLoading] = useState(true);

  useEffect(() => {
    setPage(1);
    getSoal(jenjangSlug, subjenjangSlug, mapelSlug, topikSlug, subtopikSlug)
      .then(data => {
        const list = Array.isArray(data) ? data : (data.soal ?? []);
        if (!Array.isArray(data) && data.meta) setMeta(data.meta);
        list.sort((a, b) => (a.answered_correct === b.answered_correct ? 0 : a.answered_correct ? 1 : -1));
        setSoal(list);
      })
      .catch(() => setError("Gagal memuat soal"))
      .finally(() => setLoading(false));
  }, [jenjangSlug, subjenjangSlug, mapelSlug, topikSlug, subtopikSlug]);

  useEffect(() => {
    setMateriLoading(true);
    api.get(`/browse/materi?subtopik_slug=${subtopikSlug}&topik_slug=${topikSlug}`)
      .then(data => setMateri(Array.isArray(data) ? data : []))
      .catch(() => setMateri([]))
      .finally(() => setMateriLoading(false));
  }, [subtopikSlug]);

  const answeredCnt = soal.filter(s => s.answered_correct).length;
  const diffCounts  = { 1: 0, 2: 0, 3: 0 };
  soal.forEach(s => { if (diffCounts[s.difficulty] !== undefined) diffCounts[s.difficulty]++; });

  const filtered   = filterDiff ? soal.filter(s => s.difficulty == filterDiff) : soal;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pagedSoal  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const showSidebar = !materiLoading && materi.length > 0 && width > 640;

  const soalSection = (
    <>
      {error && (
        <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "14px", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ height: "76px", borderRadius: "14px", background: "var(--gs-border)", opacity: 0.5, animation: "pulse 1.5s infinite" }} />
          ))}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Filter + header row */}
          {soal.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", gap: "8px", flexWrap: "wrap" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--gs-text-muted)", textTransform: "uppercase", letterSpacing: ".07em" }}>
                {filterDiff ? `${filtered.length} Soal` : `${soal.length} Soal`}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {[
                  { label: "Semua", val: 0, count: soal.length },
                  { label: "Easy",  val: 1, count: diffCounts[1] },
                  { label: "Medium",val: 2, count: diffCounts[2] },
                  { label: "Hard",  val: 3, count: diffCounts[3] },
                ].filter(f => f.val === 0 || f.count > 0).map(({ label, val, count }) => {
                  const active = filterDiff === val;
                  const d = DIFF[val];
                  const color = d?.color || "var(--gs-text-muted)";
                  const bg    = d?.bg    || "var(--gs-hover)";
                  return (
                    <button key={val} onClick={() => { setFilterDiff(v => v === val ? 0 : val); setPage(1); }}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600",
                        border: `1.5px solid ${active ? color : "var(--gs-border)"}`,
                        background: active ? bg : "var(--gs-surface)",
                        color: active ? color : "var(--gs-text-muted)",
                        cursor: "pointer", fontFamily: "inherit", transition: "all .12s",
                      }}>
                      {label}
                      {val !== 0 && (
                        <span style={{ fontSize: "10.5px", fontWeight: "700", opacity: active ? 0.7 : 0.5 }}>{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Soal list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px", color: "var(--gs-text-muted)", fontSize: "14px" }}>
                {soal.length === 0
                  ? `Belum ada soal untuk ${subtopikNama}.`
                  : "Tidak ada soal dengan filter ini."}
              </div>
            )}
            {pagedSoal.map((s, i) => {
              const globalIndex = (page - 1) * PAGE_SIZE + i + 1;
              const diff = DIFF[s.difficulty] || DIFF[1];
              const done = s.answered_correct;
              return (
                <div
                  key={s.id}
                  onClick={() => navigate(`/soal/${s.kode}`, { state: { ...state, subtopikNama } })}
                  style={{
                    display: "flex", alignItems: "center",
                    gap: isMobile ? "10px" : "14px",
                    background: "var(--gs-surface)", borderRadius: "14px",
                    padding: isMobile ? "14px" : "16px 20px",
                    border: "1px solid var(--gs-border)",
                    borderLeft: done ? "3px solid #1a8a6e" : `3px solid ${diff.color}22`,
                    cursor: "pointer",
                    transition: "box-shadow .15s, border-color .15s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,.08)";
                    e.currentTarget.style.borderLeftColor = done ? "#1a8a6e" : diff.color + "66";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderLeftColor = done ? "#1a8a6e" : diff.color + "22";
                  }}
                >
                  {/* Number / check */}
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0,
                    background: done ? "#e4f5f0" : "var(--gs-hover)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12.5px", fontWeight: "800",
                    color: done ? "#1a8a6e" : "var(--gs-text-muted)",
                  }}>
                    {done ? <CheckCircle2 size={16} color="#1a8a6e" /> : globalIndex}
                  </div>

                  {/* Body + kode */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      dangerouslySetInnerHTML={{ __html: renderBodyPreview(s.body) }}
                      style={{
                        fontSize: "13.5px", color: "var(--gs-text)",
                        overflow: "hidden", display: "-webkit-box",
                        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                        lineHeight: "1.45",
                      }}
                    />
                    {!isMobile && (
                      <div style={{ fontSize: "10.5px", fontFamily: "monospace", color: "var(--gs-text-hint)", marginTop: "4px", letterSpacing: ".04em" }}>
                        {s.kode}
                      </div>
                    )}
                  </div>

                  {/* Difficulty + chevron */}
                  <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "6px" : "10px", flexShrink: 0 }}>
                    <DifficultyBadge level={s.difficulty} />
                    <ChevronRight size={15} color="var(--gs-text-hint)" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "24px" }}>
              <button
                onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                disabled={page === 1}
                style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid var(--gs-border)", background: "var(--gs-surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "var(--gs-border)" : "var(--gs-text-muted)", transition: "all .15s" }}
                onMouseEnter={e => { if (page !== 1) e.currentTarget.style.borderColor = "var(--gs-text)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--gs-border)"; }}
              >
                <ChevronLeft size={15} />
              </button>
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
                    <span key={`e-${idx}`} style={{ width: "36px", textAlign: "center", color: "var(--gs-text-hint)", fontSize: "13px" }}>…</span>
                  ) : (
                    <button key={p} onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      style={{ width: "36px", height: "36px", borderRadius: "10px", border: `1px solid ${p === page ? "#2563eb" : "var(--gs-border)"}`, background: p === page ? "#2563eb" : "var(--gs-surface)", color: p === page ? "white" : "var(--gs-text)", fontSize: "13px", fontWeight: p === page ? "700" : "500", cursor: "pointer", transition: "all .15s" }}
                      onMouseEnter={e => { if (p !== page) e.currentTarget.style.borderColor = "#2563eb"; }}
                      onMouseLeave={e => { if (p !== page) e.currentTarget.style.borderColor = "var(--gs-border)"; }}
                    >
                      {p}
                    </button>
                  )
                );
              })()}
              <button
                onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                disabled={page === totalPages}
                style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid var(--gs-border)", background: "var(--gs-surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: page === totalPages ? "not-allowed" : "pointer", color: page === totalPages ? "var(--gs-border)" : "var(--gs-text-muted)", transition: "all .15s" }}
                onMouseEnter={e => { if (page !== totalPages) e.currentTarget.style.borderColor = "var(--gs-text)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--gs-border)"; }}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gs-bg)" }}>
      {!loading && (
        <SEO
          title={`${subtopikNama} — ${mapelNama}`}
          description={`${soal.length} soal latihan ${subtopikNama} — ${mapelNama} jenjang ${jenjangNama}. Lengkap dengan pembahasan detail.`}
          url={`/browse/${jenjangSlug}/${subjenjangSlug}/${mapelSlug}/${topikSlug}/${subtopikSlug}`}
        />
      )}
      <Navbar />

      <main style={{
        flex: 1,
        maxWidth: showSidebar ? "960px" : "720px",
        width: "100%", margin: "0 auto",
        padding: isMobile ? "20px 16px 48px" : "32px 24px 64px",
        transition: "max-width .2s ease",
      }}>
        <div style={{ marginBottom: "16px" }}>
          <Breadcrumb items={[
            { label: "Direktori Soal", to: "/browse" },
            { label: jenjangNama,    to: `/browse/${jenjangSlug}`,                                                    state: { jenjangNama, jenjangSlug } },
            { label: subjenjangNama, to: `/browse/${jenjangSlug}/${subjenjangSlug}`,                                  state: { jenjangNama, jenjangSlug, subjenjangNama, subjenjangSlug } },
            { label: mapelNama,      to: `/browse/${jenjangSlug}/${subjenjangSlug}/${mapelSlug}`,                     state: { jenjangNama, jenjangSlug, subjenjangNama, subjenjangSlug, mapelNama, mapelSlug } },
            { label: topikNama,      to: `/browse/${jenjangSlug}/${subjenjangSlug}/${mapelSlug}/${topikSlug}`,        state: { jenjangNama, jenjangSlug, subjenjangNama, subjenjangSlug, mapelNama, mapelSlug, topikNama, topikSlug } },
            { label: subtopikNama },
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
            {/* Title */}
            <h1 style={{
              fontSize: isMobile ? "22px" : "26px", fontWeight: "800",
              color: "white", letterSpacing: "-0.5px", margin: "0 0 14px",
            }}>
              {subtopikNama || "Memuat..."}
            </h1>

            {/* Stat chips */}
            {!loading && soal.length > 0 && (
              <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "rgba(255,255,255,.8)", background: "rgba(255,255,255,.1)" }}>
                  {soal.length} Soal
                </span>
                {Object.entries(diffCounts).map(([lvl, cnt]) => cnt > 0 && (
                  <span key={lvl} style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: DIFF[lvl].chip, background: DIFF[lvl].chipBg }}>
                    {cnt} {DIFF[lvl].label}
                  </span>
                ))}
                {answeredCnt > 0 && (
                  <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "#6ee7b7", background: "rgba(110,231,183,.12)" }}>
                    ✓ {answeredCnt}/{soal.length} Selesai
                  </span>
                )}
              </div>
            )}

            {/* Progress bar */}
            {!loading && answeredCnt > 0 && soal.length > 0 && (
              <div style={{ marginTop: "14px" }}>
                <div style={{ height: "4px", borderRadius: "99px", background: "rgba(255,255,255,.1)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: "99px", background: "#6ee7b7",
                    width: `${(answeredCnt / soal.length * 100).toFixed(0)}%`,
                    transition: "width .6s ease",
                  }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Body: 2-col with sidebar, or 1-col */}
        {showSidebar ? (
          <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: "24px", alignItems: "start" }}>
            <div style={{ position: "sticky", top: "24px" }}>
              <MateriTerkaitBanner materi={materi} sidebar />
            </div>
            <div>{soalSection}</div>
          </div>
        ) : (
          <>
            {materi.length > 0 && (
              <MateriTerkaitBanner materi={materi} style={{ marginBottom: "20px" }} />
            )}
            {soalSection}
          </>
        )}
      </main>

      <Footer />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
