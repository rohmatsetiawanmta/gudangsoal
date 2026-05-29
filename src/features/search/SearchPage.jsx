// src/features/search/SearchPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, BookOpen, FolderTree, FileText } from "lucide-react";
import Navbar from "../../components/Navbar";
import { search } from "./searchApi";
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

function SectionLabel({ icon: Icon, label, count }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "10px",
      }}
    >
      <Icon size={15} color="#6b6860" />
      <span
        style={{
          fontSize: "12px",
          fontWeight: "700",
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "#6b6860",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: "12px", color: "#b4b2a9" }}>({count})</span>
    </div>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 480;
  const q = searchParams.get("q") || "";

  const [query, setQuery] = useState(q);
  const [results, setResults] = useState({ soal: [], topik: [], jenjang: [] });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const doSearch = useCallback(async (val) => {
    if (val.length < 2) {
      setResults({ soal: [], topik: [], jenjang: [] });
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await search(val);
      setResults(data);
    } catch {
      setResults({ soal: [], topik: [], jenjang: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      doSearch(query);
      if (query) setSearchParams({ q: query });
      else setSearchParams({});
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (q) doSearch(q);
  }, []);

  const totalResults =
    (results.soal?.length || 0) +
    (results.topik?.length || 0) +
    (results.jenjang?.length || 0);
  const isEmpty = hasSearched && !loading && totalResults === 0;

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f6" }}>
      <SEO
        title={q ? `Hasil pencarian "${q}"` : "Cari Soal"}
        description={
          q
            ? `Hasil pencarian soal matematika untuk "${q}" di Gudang Soal.`
            : "Cari soal, topik, dan jenjang di Gudang Soal."
        }
        url={q ? `/search?q=${encodeURIComponent(q)}` : "/search"}
      />
      <Navbar />

      <main
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: isMobile ? "24px 20px" : "40px",
        }}
      >
        {/* Search input */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: isMobile ? "22px" : "24px",
              fontWeight: "800",
              color: "#0f0e17",
              letterSpacing: "-0.5px",
              marginBottom: "20px",
            }}
          >
            Cari Soal
          </h1>
          <div style={{ position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6b6860",
                pointerEvents: "none",
              }}
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari soal, topik, atau jenjang..."
              style={{
                width: "100%",
                paddingLeft: "48px",
                paddingRight: "16px",
                paddingTop: "14px",
                paddingBottom: "14px",
                borderRadius: "14px",
                border: "1px solid #e2ddd5",
                fontSize: isMobile ? "14px" : "16px",
                outline: "none",
                fontFamily: "inherit",
                color: "#0f0e17",
                background: "white",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
              onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
            />
            {loading && (
              <div
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "18px",
                  height: "18px",
                  border: "2px solid #e2ddd5",
                  borderTopColor: "#e84c2b",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />
            )}
          </div>
          {query.length === 1 && (
            <p style={{ fontSize: "13px", color: "#b4b2a9", marginTop: "8px" }}>
              Ketik minimal 2 karakter...
            </p>
          )}
        </div>

        {/* Empty state */}
        {!hasSearched && !query && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Search
              size={40}
              color="#e2ddd5"
              style={{ marginBottom: "16px" }}
            />
            <p
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#0f0e17",
                marginBottom: "6px",
              }}
            >
              Cari apa hari ini?
            </p>
            <p style={{ fontSize: "14px", color: "#6b6860" }}>
              Ketik nama soal, topik, atau jenjang untuk mulai mencari.
            </p>
          </div>
        )}

        {/* No results */}
        {isEmpty && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <FileText
              size={40}
              color="#e2ddd5"
              style={{ marginBottom: "16px" }}
            />
            <p
              style={{
                fontSize: "15px",
                fontWeight: "600",
                color: "#0f0e17",
                marginBottom: "6px",
              }}
            >
              Tidak ada hasil untuk "{query}"
            </p>
            <p style={{ fontSize: "14px", color: "#6b6860" }}>
              Coba kata kunci yang berbeda.
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && totalResults > 0 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "32px" }}
          >
            {/* Soal */}
            {results.soal.length > 0 && (
              <div>
                <SectionLabel
                  icon={FileText}
                  label="Soal"
                  count={results.soal.length}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {results.soal.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => navigate(`/soal/${s.kode}`)}
                      style={{
                        background: "white",
                        borderRadius: "14px",
                        border: "1px solid #e2ddd5",
                        padding: isMobile ? "14px 16px" : "16px 20px",
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
                            color: "#b4b2a9",
                            fontFamily: "monospace",
                            letterSpacing: ".05em",
                          }}
                        >
                          {s.kode}
                        </span>
                        <DifficultyBadge level={s.difficulty} />
                        {!isMobile && (
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#b4b2a9",
                              marginLeft: "auto",
                            }}
                          >
                            {s.jenjang} — {s.mapel}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#0f0e17",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.body
                          .replace(/\$\$?[^$]+\$\$?/g, "[math]")
                          .replace(/[*_~`#]/g, "")}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#b4b2a9",
                          marginTop: "6px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {isMobile
                          ? `${s.mapel} — ${s.subtopik}`
                          : `${s.subjenjang} › ${s.topik} › ${s.subtopik}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topik & Subtopik */}
            {results.topik.length > 0 && (
              <div>
                <SectionLabel
                  icon={FolderTree}
                  label="Topik & Subtopik"
                  count={results.topik.length}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {results.topik.map((t, i) => {
                    const url =
                      t.type === "subtopik"
                        ? `/browse/${t.jenjang_slug}/${t.subjenjang_slug}/${t.mapel_slug}/${t.topik_slug}`
                        : `/browse/${t.jenjang_slug}/${t.subjenjang_slug}/${t.mapel_slug}`;
                    return (
                      <div
                        key={i}
                        onClick={() => navigate(url)}
                        style={{
                          background: "white",
                          borderRadius: "14px",
                          border: "1px solid #e2ddd5",
                          padding: isMobile ? "12px 14px" : "14px 20px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
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
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: "#f2efe8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <FolderTree size={15} color="#6b6860" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#0f0e17",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {t.topik}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#b4b2a9",
                              marginTop: "2px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {isMobile
                              ? `${t.mapel}`
                              : `${t.jenjang} — ${t.subjenjang} — ${t.mapel}`}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            background:
                              t.type === "subtopik" ? "#e4f5f0" : "#f2efe8",
                            color:
                              t.type === "subtopik" ? "#1a8a6e" : "#6b6860",
                            flexShrink: 0,
                          }}
                        >
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
                <SectionLabel
                  icon={BookOpen}
                  label="Jenjang"
                  count={results.jenjang.length}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {results.jenjang.map((j, i) => {
                    const url =
                      j.type === "subjenjang"
                        ? `/browse/${j.kode}`
                        : `/browse/${j.slug}`;
                    return (
                      <div
                        key={i}
                        onClick={() => navigate(url)}
                        style={{
                          background: "white",
                          borderRadius: "14px",
                          border: "1px solid #e2ddd5",
                          padding: isMobile ? "12px 14px" : "14px 20px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
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
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: "#f2efe8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <BookOpen size={15} color="#6b6860" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#0f0e17",
                            }}
                          >
                            {j.nama}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            background: "#f2efe8",
                            color: "#6b6860",
                            flexShrink: 0,
                          }}
                        >
                          {j.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
