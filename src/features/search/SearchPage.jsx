// src/features/search/SearchPage.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  FolderTree,
  FileText,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { search } from "./searchApi";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";
import api from "../../lib/api";

const DIFFICULTY_OPTIONS = [
  { value: "1", label: "Easy",   color: "#1a8a6e", bg: "#e4f5f0" },
  { value: "2", label: "Medium", color: "#854F0B", bg: "#faeeda" },
  { value: "3", label: "Hard",   color: "#e84c2b", bg: "#fff3f0" },
];

const TIPE_OPTIONS = [
  { value: "pilihan_ganda",          label: "Pilihan Ganda" },
  { value: "isian_singkat",          label: "Isian Singkat" },
  { value: "isian_numerik",          label: "Isian Numerik" },
  { value: "checklist",              label: "Checklist" },
  { value: "multiple_choice_table",  label: "MCT" },
  { value: "menjodohkan",            label: "Menjodohkan" },
];

function DifficultyBadge({ level }) {
  const map = {
    1: { label: "Easy",   color: "#1a8a6e", bg: "#e4f5f0" },
    2: { label: "Medium", color: "#854F0B", bg: "#faeeda" },
    3: { label: "Hard",   color: "#e84c2b", bg: "#fff3f0" },
  };
  const d = map[level] || map[1];
  return (
    <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px", background: d.bg, color: d.color, flexShrink: 0 }}>
      {d.label}
    </span>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate  = useNavigate();
  const width     = useWindowWidth();
  const isMobile  = width <= 480;
  const q         = searchParams.get("q") || "";

  useEffect(() => {
    const newQ = searchParams.get("q") || "";
    if (newQ !== query) setQuery(newQ);
  }, [searchParams]);

  const [query,       setQuery]       = useState(q);
  const [activeTab,   setActiveTab]   = useState("soal");
  const [results,     setResults]     = useState({ soal: [], topik: [], jenjang: [], total: 0 });
  const [loading,     setLoading]     = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [page,        setPage]        = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filterJenjang,    setFilterJenjang]    = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterTipe,       setFilterTipe]       = useState("");
  const [jenjangList,      setJenjangList]      = useState([]);
  const filterRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setShowFilters(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    api.get("/browse/jenjang")
      .then((d) => setJenjangList(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const activeFilterCount = [filterJenjang, filterDifficulty, filterTipe].filter(Boolean).length;

  const doSearch = useCallback(async (val, filters, pg = 1) => {
    if (val.length < 2) {
      setResults({ soal: [], topik: [], jenjang: [], total: 0 });
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await search(val, filters, pg);
      const normalized = {
        soal:   Array.isArray(data?.soal)   ? data.soal   : [],
        topik:  Array.isArray(data?.topik)  ? data.topik  : [],
        jenjang: Array.isArray(data?.jenjang) ? data.jenjang : [],
        total:  data?.total || 0,
      };
      if (pg === 1) {
        setResults(normalized);
      } else {
        setResults((prev) => ({
          ...normalized,
          soal: [...prev.soal, ...normalized.soal],
          topik: prev.topik,
          jenjang: prev.jenjang,
        }));
      }
    } catch {
      setResults({ soal: [], topik: [], jenjang: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const filters = { jenjang_slug: filterJenjang, difficulty: filterDifficulty, tipe: filterTipe };

  const timerRef = useRef(null);
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPage(1);
      doSearch(query, filters, 1);
      if (query) setSearchParams({ q: query });
      else setSearchParams({});
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [query, filterJenjang, filterDifficulty, filterTipe]);

  useEffect(() => {
    if (q) doSearch(q, filters, 1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    doSearch(query, filters, nextPage);
  };

  const clearFilters = () => {
    setFilterJenjang("");
    setFilterDifficulty("");
    setFilterTipe("");
  };

  const hasMore       = results.soal.length < results.total;
  const totalTopik    = (results.topik?.length || 0) + (results.jenjang?.length || 0);
  const isEmpty       = hasSearched && !loading && results.soal.length === 0 && activeTab === "soal";
  const isEmptyTopik  = hasSearched && !loading && totalTopik === 0 && activeTab === "topik";

  const inactiveChipStyle = {
    border: "1.5px solid var(--gs-border)",
    background: "var(--gs-surface)",
    color: "var(--gs-text-muted)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gs-bg)" }}>
      <SEO
        title={q ? `Hasil pencarian "${q}"` : "Cari Soal"}
        description={q ? `Hasil pencarian soal matematika untuk "${q}" di Gudang Soal.` : "Cari soal, topik, dan jenjang di Gudang Soal."}
        url={q ? `/search?q=${encodeURIComponent(q)}` : "/search"}
      />
      <Navbar />

      <main style={{ flex: 1, maxWidth: "720px", margin: "0 auto", padding: isMobile ? "24px 20px" : "40px", width: "100%" }}>

        {/* Header + Search */}
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: isMobile ? "22px" : "24px", fontWeight: "800", color: "var(--gs-text)", letterSpacing: "-0.5px", marginBottom: "16px" }}>
            Cari Soal
          </h1>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--gs-text-muted)", pointerEvents: "none" }} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari soal, topik, atau jenjang..."
                style={{
                  width: "100%", paddingLeft: "48px", paddingRight: "16px",
                  paddingTop: "13px", paddingBottom: "13px",
                  borderRadius: "12px", border: "1px solid var(--gs-border)",
                  fontSize: isMobile ? "14px" : "15px", outline: "none",
                  fontFamily: "inherit", color: "var(--gs-text)",
                  background: "var(--gs-surface)", boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                onBlur={(e) => (e.target.style.borderColor = "var(--gs-border)")}
              />
              {loading && (
                <div style={{
                  position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)",
                  width: "16px", height: "16px", border: "2px solid var(--gs-border)",
                  borderTopColor: "#e84c2b", borderRadius: "50%", animation: "spin 0.7s linear infinite",
                }} />
              )}
            </div>

            {/* Tombol filter — hanya di tab soal */}
            {activeTab === "soal" && (
              <div ref={filterRef} style={{ position: "relative", flexShrink: 0 }}>
                <button
                  onClick={() => setShowFilters((v) => !v)}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "12px 14px", borderRadius: "12px",
                    border: `1.5px solid ${showFilters || activeFilterCount > 0 ? "#e84c2b" : "var(--gs-border)"}`,
                    background: showFilters || activeFilterCount > 0 ? "#fff3f0" : "var(--gs-surface)",
                    cursor: "pointer",
                    color: showFilters || activeFilterCount > 0 ? "#e84c2b" : "var(--gs-text-muted)",
                    fontSize: "13px", fontWeight: "600", fontFamily: "inherit", transition: "all .15s",
                  }}
                >
                  <SlidersHorizontal size={15} />
                  {!isMobile && "Filter"}
                  {activeFilterCount > 0 && (
                    <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#e84c2b", color: "white", fontSize: "10px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {showFilters && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    width: isMobile ? "calc(100vw - 40px)" : "320px",
                    background: "var(--gs-surface)", borderRadius: "14px",
                    border: "1px solid var(--gs-border)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                    padding: "16px", zIndex: 50,
                    display: "flex", flexDirection: "column", gap: "14px",
                  }}>
                    {/* Jenjang */}
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--gs-text-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" }}>
                        Jenjang
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <button onClick={() => setFilterJenjang("")} style={{ padding: "5px 12px", borderRadius: "7px", border: `1.5px solid ${!filterJenjang ? "#e84c2b" : "var(--gs-border)"}`, background: !filterJenjang ? "#fff3f0" : "var(--gs-surface)", color: !filterJenjang ? "#e84c2b" : "var(--gs-text-muted)", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
                          Semua
                        </button>
                        {jenjangList.map((j) => (
                          <button key={j.id} onClick={() => setFilterJenjang(filterJenjang === j.slug ? "" : j.slug)}
                            style={{ padding: "5px 12px", borderRadius: "7px", border: `1.5px solid ${filterJenjang === j.slug ? "#e84c2b" : "var(--gs-border)"}`, background: filterJenjang === j.slug ? "#fff3f0" : "var(--gs-surface)", color: filterJenjang === j.slug ? "#e84c2b" : "var(--gs-text-muted)", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                            {j.nama}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty */}
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--gs-text-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" }}>
                        Kesulitan
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <button onClick={() => setFilterDifficulty("")} style={{ padding: "5px 12px", borderRadius: "7px", border: `1.5px solid ${!filterDifficulty ? "#e84c2b" : "var(--gs-border)"}`, background: !filterDifficulty ? "#fff3f0" : "var(--gs-surface)", color: !filterDifficulty ? "#e84c2b" : "var(--gs-text-muted)", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
                          Semua
                        </button>
                        {DIFFICULTY_OPTIONS.map((d) => (
                          <button key={d.value} onClick={() => setFilterDifficulty(filterDifficulty === d.value ? "" : d.value)}
                            style={{ padding: "5px 12px", borderRadius: "7px", border: `1.5px solid ${filterDifficulty === d.value ? d.color : "var(--gs-border)"}`, background: filterDifficulty === d.value ? d.bg : "var(--gs-surface)", color: filterDifficulty === d.value ? d.color : "var(--gs-text-muted)", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tipe */}
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--gs-text-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" }}>
                        Tipe Soal
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <button onClick={() => setFilterTipe("")} style={{ padding: "5px 12px", borderRadius: "7px", border: `1.5px solid ${!filterTipe ? "#e84c2b" : "var(--gs-border)"}`, background: !filterTipe ? "#fff3f0" : "var(--gs-surface)", color: !filterTipe ? "#e84c2b" : "var(--gs-text-muted)", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
                          Semua
                        </button>
                        {TIPE_OPTIONS.map((t) => (
                          <button key={t.value} onClick={() => setFilterTipe(filterTipe === t.value ? "" : t.value)}
                            style={{ padding: "5px 12px", borderRadius: "7px", border: `1.5px solid ${filterTipe === t.value ? "#e84c2b" : "var(--gs-border)"}`, background: filterTipe === t.value ? "#fff3f0" : "var(--gs-surface)", color: filterTipe === t.value ? "#e84c2b" : "var(--gs-text-muted)", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reset */}
                    {activeFilterCount > 0 && (
                      <button onClick={() => { clearFilters(); setShowFilters(false); }}
                        style={{ display: "flex", alignItems: "center", gap: "6px", alignSelf: "flex-start", background: "none", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "600", color: "#e84c2b", fontFamily: "inherit", padding: 0 }}>
                        <X size={12} /> Reset filter
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          {query.length === 1 && (
            <p style={{ fontSize: "13px", color: "var(--gs-text-hint)", marginTop: "8px" }}>
              Ketik minimal 2 karakter...
            </p>
          )}
        </div>

        {/* Tab switcher — hanya tampil saat ada hasil */}
        {hasSearched && (
          <div style={{ display: "flex", gap: "4px", background: "var(--gs-hover)", padding: "4px", borderRadius: "12px", marginBottom: "16px" }}>
            <button onClick={() => setActiveTab("soal")} style={{ flex: 1, padding: "8px 12px", borderRadius: "9px", border: "none", background: activeTab === "soal" ? "var(--gs-surface)" : "transparent", color: activeTab === "soal" ? "var(--gs-text)" : "var(--gs-text-muted)", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", transition: "all .15s", boxShadow: activeTab === "soal" ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
              Soal {results.total > 0 && `(${results.total})`}
            </button>
            <button onClick={() => setActiveTab("topik")} style={{ flex: 1, padding: "8px 12px", borderRadius: "9px", border: "none", background: activeTab === "topik" ? "var(--gs-surface)" : "transparent", color: activeTab === "topik" ? "var(--gs-text)" : "var(--gs-text-muted)", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", transition: "all .15s", boxShadow: activeTab === "topik" ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
              Topik & Jenjang {totalTopik > 0 && `(${totalTopik})`}
            </button>
          </div>
        )}

        {/* Active filter chips */}
        {activeTab === "soal" && activeFilterCount > 0 && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
            {filterJenjang && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "7px", background: "#fff3f0", border: "1px solid #e84c2b", fontSize: "12px", fontWeight: "600", color: "#e84c2b" }}>
                {jenjangList.find((j) => j.slug === filterJenjang)?.nama || filterJenjang}
                <button onClick={() => setFilterJenjang("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#e84c2b", display: "flex", padding: 0 }}>
                  <X size={11} />
                </button>
              </div>
            )}
            {filterDifficulty && (() => {
              const d = DIFFICULTY_OPTIONS.find((d) => d.value === filterDifficulty);
              return (
                <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "7px", background: d?.bg, border: `1px solid ${d?.color}`, fontSize: "12px", fontWeight: "600", color: d?.color }}>
                  {d?.label}
                  <button onClick={() => setFilterDifficulty("")} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex", padding: 0 }}>
                    <X size={11} />
                  </button>
                </div>
              );
            })()}
            {filterTipe && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "7px", background: "#fff3f0", border: "1px solid #e84c2b", fontSize: "12px", fontWeight: "600", color: "#e84c2b" }}>
                {TIPE_OPTIONS.find((t) => t.value === filterTipe)?.label}
                <button onClick={() => setFilterTipe("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#e84c2b", display: "flex", padding: 0 }}>
                  <X size={11} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty state awal */}
        {!hasSearched && !query && (
          <div style={{ textAlign: "center", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Search size={40} color="var(--gs-border)" style={{ marginBottom: "16px" }} />
            <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--gs-text)", marginBottom: "6px" }}>Cari apa hari ini?</p>
            <p style={{ fontSize: "14px", color: "var(--gs-text-muted)" }}>Ketik nama soal, topik, atau jenjang untuk mulai mencari.</p>
          </div>
        )}

        {/* Tab: Soal */}
        {activeTab === "soal" && (
          <>
            {isEmpty && (
              <div style={{ textAlign: "center", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <FileText size={40} color="var(--gs-border)" style={{ marginBottom: "16px" }} />
                <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--gs-text)", marginBottom: "6px" }}>
                  Tidak ada soal untuk "{query}"{activeFilterCount > 0 && " dengan filter ini"}
                </p>
                {activeFilterCount > 0 ? (
                  <button onClick={clearFilters} style={{ marginTop: "8px", fontSize: "13px", color: "#e84c2b", fontWeight: "600", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                    Reset filter
                  </button>
                ) : (
                  <p style={{ fontSize: "14px", color: "var(--gs-text-muted)" }}>Coba kata kunci yang berbeda.</p>
                )}
              </div>
            )}

            {results.soal.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {results.soal.map((s) => (
                  <div key={s.id} onClick={() => navigate(`/soal/${s.kode}`)}
                    style={{ background: "var(--gs-surface)", borderRadius: "12px", border: "1px solid var(--gs-border)", padding: isMobile ? "12px 14px" : "14px 18px", cursor: "pointer", transition: "transform .15s, box-shadow .15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--gs-text-hint)", fontFamily: "monospace" }}>{s.kode}</span>
                      <DifficultyBadge level={s.difficulty} />
                      {!isMobile && <span style={{ fontSize: "12px", color: "var(--gs-text-hint)", marginLeft: "auto" }}>{s.jenjang} — {s.mapel}</span>}
                    </div>
                    <div style={{ fontSize: "14px", color: "var(--gs-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.body.replace(/\$\$?[^$]+\$\$?/g, "[math]").replace(/[*_~`#]/g, "")}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--gs-text-hint)", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {isMobile ? `${s.mapel} — ${s.subtopik}` : `${s.subjenjang} › ${s.topik} › ${s.subtopik}`}
                    </div>
                  </div>
                ))}

                {hasMore && (
                  <button onClick={handleLoadMore} disabled={loading}
                    style={{ width: "100%", marginTop: "4px", padding: "12px", borderRadius: "12px", border: "1px solid var(--gs-border)", background: "var(--gs-surface)", fontSize: "13px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", color: "var(--gs-text-muted)", transition: "all .15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gs-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "var(--gs-surface)")}
                  >
                    {loading ? "Memuat..." : `Tampilkan lebih banyak (${results.total - results.soal.length} tersisa)`}
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Tab: Topik & Jenjang */}
        {activeTab === "topik" && (
          <>
            {isEmptyTopik && (
              <div style={{ textAlign: "center", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <FolderTree size={40} color="var(--gs-border)" style={{ marginBottom: "16px" }} />
                <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--gs-text)", marginBottom: "6px" }}>
                  Tidak ada topik atau jenjang untuk "{query}"
                </p>
                <p style={{ fontSize: "14px", color: "var(--gs-text-muted)" }}>Coba kata kunci yang berbeda.</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Topik & Subtopik */}
              {results.topik.length > 0 && (
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "700", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--gs-text-muted)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FolderTree size={13} /> Topik & Subtopik ({results.topik.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {results.topik.map((t, i) => {
                      const url = t.type === "subtopik"
                        ? `/browse/${t.jenjang_slug}/${t.subjenjang_slug}/${t.mapel_slug}/${t.topik_slug}`
                        : `/browse/${t.jenjang_slug}/${t.subjenjang_slug}/${t.mapel_slug}`;
                      return (
                        <div key={i} onClick={() => navigate(url)}
                          style={{ background: "var(--gs-surface)", borderRadius: "12px", border: "1px solid var(--gs-border)", padding: isMobile ? "10px 14px" : "12px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "transform .15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "none"; }}
                        >
                          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "var(--gs-hover)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <FolderTree size={14} color="var(--gs-text-muted)" />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--gs-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.topik}</div>
                            <div style={{ fontSize: "11px", color: "var(--gs-text-hint)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {isMobile ? t.mapel : `${t.jenjang} — ${t.subjenjang} — ${t.mapel}`}
                            </div>
                          </div>
                          <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "5px", background: t.type === "subtopik" ? "#e4f5f0" : "var(--gs-hover)", color: t.type === "subtopik" ? "#1a8a6e" : "var(--gs-text-muted)", flexShrink: 0 }}>
                            {t.type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Jenjang */}
              {results.jenjang.length > 0 && (
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "700", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--gs-text-muted)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <BookOpen size={13} /> Jenjang ({results.jenjang.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {results.jenjang.map((j, i) => {
                      const url = j.type === "subjenjang" ? `/browse/${j.kode}` : `/browse/${j.slug}`;
                      return (
                        <div key={i} onClick={() => navigate(url)}
                          style={{ background: "var(--gs-surface)", borderRadius: "12px", border: "1px solid var(--gs-border)", padding: isMobile ? "10px 14px" : "12px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", transition: "transform .15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.boxShadow = "none"; }}
                        >
                          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "var(--gs-hover)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <BookOpen size={14} color="var(--gs-text-muted)" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--gs-text)" }}>{j.nama}</div>
                          </div>
                          <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "5px", background: "var(--gs-hover)", color: "var(--gs-text-muted)", flexShrink: 0 }}>
                            {j.type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
