// src/features/materi/MateriList.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap, Search, X, ChevronRight, ChevronLeft,
  BookOpen, Loader2, SlidersHorizontal, ChevronDown,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import MathRenderer from "../../components/MathRenderer";
import useWindowWidth from "../../hooks/useWindowWidth";
import api from "../../lib/api";

function fmtDate(str) {
  if (!str) return "";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function FilterSelect({ label, value, onChange, options, disabled }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        disabled={disabled}
        style={{
          width: "100%", appearance: "none",
          padding: "9px 32px 9px 12px",
          border: "1px solid var(--gs-border)", borderRadius: "10px",
          fontSize: "13.5px", fontFamily: "inherit",
          color: value ? "var(--gs-text)" : "var(--gs-text-hint)",
          background: disabled ? "var(--gs-surface-subtle)" : "var(--gs-surface)",
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none", boxSizing: "border-box",
        }}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.nama}</option>
        ))}
      </select>
      <ChevronDown size={13} style={{
        position: "absolute", right: "10px", top: "50%",
        transform: "translateY(-50%)", pointerEvents: "none",
        color: disabled ? "var(--gs-border)" : "var(--gs-text-hint)",
      }} />
    </div>
  );
}

export default function MateriList() {
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [items, setItems]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [jenjangList,   setJenjangList]   = useState([]);
  const [subjenjangList, setSubjenjangList] = useState([]);
  const [mapelList,     setMapelList]     = useState([]);
  const [topikList,     setTopikList]     = useState([]);
  const [subtopikList,  setSubtopikList]  = useState([]);

  const [selJenjang,   setSelJenjang]   = useState(null);
  const [selSubjenjang, setSelSubjenjang] = useState(null);
  const [selMapel,     setSelMapel]     = useState(null);
  const [selTopik,     setSelTopik]     = useState(null);
  const [selSubtopik,  setSelSubtopik]  = useState(null);

  const [loadingSubjenjang, setLoadingSubjenjang] = useState(false);
  const [loadingMapel,      setLoadingMapel]      = useState(false);
  const [loadingTopik,      setLoadingTopik]      = useState(false);
  const [loadingSubtopik,   setLoadingSubtopik]   = useState(false);

  const LIMIT = 20;
  const totalPages = Math.ceil(total / LIMIT);
  const debRef = useRef(null);

  useEffect(() => {
    api.get("/browse/jenjang")
      .then((data) => setJenjangList(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSelSubjenjang(null); setSelMapel(null); setSelTopik(null); setSelSubtopik(null);
    setSubjenjangList([]); setMapelList([]); setTopikList([]); setSubtopikList([]);
    if (!selJenjang) return;
    setLoadingSubjenjang(true);
    api.get(`/browse/subjenjang-list?jenjang_id=${selJenjang}`)
      .then((data) => setSubjenjangList(Array.isArray(data) ? data : []))
      .catch(() => {}).finally(() => setLoadingSubjenjang(false));
  }, [selJenjang]);

  useEffect(() => {
    setSelMapel(null); setSelTopik(null); setSelSubtopik(null);
    setMapelList([]); setTopikList([]); setSubtopikList([]);
    if (!selSubjenjang) return;
    setLoadingMapel(true);
    api.get(`/browse/mapel-list?subjenjang_id=${selSubjenjang}`)
      .then((data) => setMapelList(Array.isArray(data) ? data : []))
      .catch(() => {}).finally(() => setLoadingMapel(false));
  }, [selSubjenjang]);

  useEffect(() => {
    setSelTopik(null); setSelSubtopik(null);
    setTopikList([]); setSubtopikList([]);
    if (!selMapel) return;
    setLoadingTopik(true);
    api.get(`/browse/topik-list?mapel_id=${selMapel}`)
      .then((data) => setTopikList(Array.isArray(data) ? data : []))
      .catch(() => {}).finally(() => setLoadingTopik(false));
  }, [selMapel]);

  useEffect(() => {
    setSelSubtopik(null); setSubtopikList([]);
    if (!selTopik) return;
    setLoadingSubtopik(true);
    api.get(`/browse/subtopik-list?topik_id=${selTopik}`)
      .then((data) => setSubtopikList(Array.isArray(data) ? data : []))
      .catch(() => {}).finally(() => setLoadingSubtopik(false));
  }, [selTopik]);

  const handleSearchChange = useCallback((val) => {
    setSearch(val);
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 350);
  }, []);

  const showResults  = !!selSubtopik || !!debouncedSearch;
  const filterParam  = selSubtopik   ? `subtopik_id=${selSubtopik}`
    : selTopik      ? `topik_id=${selTopik}`
    : selMapel      ? `mapel_id=${selMapel}`
    : selSubjenjang ? `subjenjang_id=${selSubjenjang}`
    : selJenjang    ? `jenjang_id=${selJenjang}`
    : "";

  const fetchData = useCallback(async () => {
    if (!showResults) { setItems([]); setTotal(0); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (filterParam) filterParam.split("&").forEach((p) => {
        const [k, v] = p.split("="); params.set(k, v);
      });
      const res = await api.get(`/browse/materi/list?${params}`);
      setItems(res.data ?? []); setTotal(res.total ?? 0);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [page, debouncedSearch, filterParam, showResults]);

  useEffect(() => { setPage(1); }, [filterParam]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const hasFilter = selJenjang || selSubjenjang || selMapel || selTopik || selSubtopik || debouncedSearch;
  const clearFilters = () => {
    setSelJenjang(null); setSelSubjenjang(null); setSelMapel(null);
    setSelTopik(null); setSelSubtopik(null); handleSearchChange("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gs-bg)" }}>
      <SEO
        title="Materi Belajar"
        description="Baca materi teori lengkap dengan rumus dan ringkasan per subtopik. Gratis untuk semua jenjang."
        url="/materi"
      />
      <Navbar />

      <main style={{
        flex: 1, maxWidth: "820px", width: "100%", margin: "0 auto",
        padding: isMobile ? "20px 16px 40px" : "32px 24px 56px",
      }}>
        {/* Hero — intentionally always dark */}
        <div style={{
          borderRadius: "18px",
          background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #0a1c1a 100%)",
          padding: isMobile ? "24px 20px" : "28px 32px",
          marginBottom: "20px", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", right: isMobile ? "-10px" : "24px",
            top: "50%", transform: "translateY(-50%)",
            opacity: 0.06, pointerEvents: "none", color: "white",
          }}>
            <GraduationCap size={isMobile ? 80 : 110} />
          </div>
          <div style={{
            position: "relative", zIndex: 1,
            display: "flex", alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            flexDirection: isMobile ? "column" : "row", gap: "12px",
          }}>
            <div>
              <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 6px" }}>
                Materi Belajar
              </h1>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,.5)", margin: 0 }}>
                Teori, rumus, dan ringkasan per subtopik.
              </p>
            </div>
            {total > 0 && (
              <span style={{
                fontSize: "12px", fontWeight: "700", padding: "4px 12px",
                borderRadius: "99px", color: "rgba(255,255,255,.8)",
                background: "rgba(255,255,255,.1)", flexShrink: 0,
              }}>
                {total} materi
              </span>
            )}
          </div>
        </div>

        {/* Search + filter bar */}
        <div style={{
          background: "var(--gs-surface)", borderRadius: "14px",
          border: "1px solid var(--gs-border)", padding: "14px 16px", marginBottom: "14px",
        }}>
          {/* Search */}
          <div style={{ position: "relative", marginBottom: "12px" }}>
            <Search size={15} style={{
              position: "absolute", left: "12px", top: "50%",
              transform: "translateY(-50%)", color: "var(--gs-text-hint)", pointerEvents: "none",
            }} />
            <input
              type="text"
              placeholder="Cari judul materi..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                width: "100%", paddingLeft: "36px",
                paddingRight: search ? "34px" : "12px",
                paddingTop: "9px", paddingBottom: "9px",
                border: "1px solid var(--gs-border)", borderRadius: "10px",
                fontSize: "13.5px", fontFamily: "inherit", outline: "none",
                background: "var(--gs-input-bg)", color: "var(--gs-text)", boxSizing: "border-box",
              }}
            />
            {search && (
              <button onClick={() => handleSearchChange("")} style={{
                position: "absolute", right: "9px", top: "50%",
                transform: "translateY(-50%)", background: "none", border: "none",
                cursor: "pointer", color: "var(--gs-text-hint)", display: "flex", padding: "2px",
              }}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Cascade dropdowns */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
            gap: "8px",
          }}>
            <FilterSelect label="Semua Jenjang" value={selJenjang ?? ""} onChange={setSelJenjang} options={jenjangList} disabled={false} />
            <FilterSelect label={loadingSubjenjang ? "Memuat..." : "Semua Kelas"} value={selSubjenjang ?? ""} onChange={setSelSubjenjang} options={subjenjangList} disabled={!selJenjang || loadingSubjenjang} />
            <FilterSelect label={loadingMapel ? "Memuat..." : "Semua Mapel"} value={selMapel ?? ""} onChange={setSelMapel} options={mapelList} disabled={!selSubjenjang || loadingMapel} />
            <FilterSelect label={loadingTopik ? "Memuat..." : "Semua Topik"} value={selTopik ?? ""} onChange={setSelTopik} options={topikList} disabled={!selMapel || loadingTopik} />
          </div>

          {/* Subtopik chips */}
          {subtopikList.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
              {loadingSubtopik ? (
                <span style={{ fontSize: "12px", color: "var(--gs-text-hint)" }}>Memuat subtopik...</span>
              ) : (
                subtopikList.map((st) => {
                  const active = selSubtopik === st.id;
                  return (
                    <button key={st.id} onClick={() => setSelSubtopik(active ? null : st.id)} style={{
                      padding: "5px 12px", borderRadius: "99px",
                      fontSize: "12.5px", fontWeight: "600",
                      border: active ? "1px solid #1a8a6e" : "1px solid var(--gs-border)",
                      background: active ? "#e4f5f0" : "var(--gs-surface)",
                      color: active ? "#1a8a6e" : "var(--gs-text-muted)",
                      cursor: "pointer", fontFamily: "inherit", transition: "all .12s",
                    }}>
                      {st.nama}
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Active filter summary */}
          {hasFilter && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--gs-divider)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--gs-text-muted)" }}>
                <SlidersHorizontal size={12} />
                <span>Filter aktif</span>
                {debouncedSearch && (
                  <span style={{ fontWeight: "600", color: "var(--gs-text)" }}>"{debouncedSearch}"</span>
                )}
              </div>
              <button onClick={clearFilters} style={{
                fontSize: "12px", color: "#e84c2b", fontWeight: "600",
                background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
              }}>
                Reset filter
              </button>
            </div>
          )}
        </div>

        {/* Content area */}
        {!showResults ? (
          <div style={{ background: "var(--gs-surface)", borderRadius: "16px", border: "1px solid var(--gs-border)", padding: "48px 32px", textAlign: "center" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#e4f5f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <BookOpen size={24} color="#1a8a6e" />
            </div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--gs-text)", marginBottom: "6px" }}>Pilih subtopik terlebih dahulu</div>
            <p style={{ fontSize: "13px", color: "var(--gs-text-muted)", margin: 0, lineHeight: 1.6 }}>
              Gunakan filter di atas untuk memilih subtopik,<br />atau ketik di kolom pencarian untuk mencari langsung.
            </p>
          </div>
        ) : loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px", color: "var(--gs-text-hint)", gap: "10px" }}>
            <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: "14px" }}>Memuat materi...</span>
          </div>
        ) : items.length === 0 ? (
          <div style={{ background: "var(--gs-surface)", borderRadius: "16px", border: "1px solid var(--gs-border)", padding: "56px 32px", textAlign: "center" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#e4f5f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <BookOpen size={24} color="#1a8a6e" />
            </div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--gs-text)", marginBottom: "6px" }}>
              {hasFilter ? "Tidak ada materi yang cocok" : "Belum ada materi"}
            </div>
            <p style={{ fontSize: "13px", color: "var(--gs-text-muted)", margin: 0 }}>
              {hasFilter ? "Coba ubah atau reset filter." : "Konten materi sedang disiapkan."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {items.map((item) => (
              <Link key={item.id} to={`/materi/${item.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div style={{
                  background: "var(--gs-surface)", borderRadius: "14px",
                  border: "1px solid var(--gs-border)", borderLeft: "3px solid #1a8a6e",
                  padding: isMobile ? "14px 16px" : "16px 20px",
                  display: "flex", alignItems: "center", gap: "14px",
                  transition: "box-shadow .15s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.07)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "10px",
                    background: "#e4f5f0", display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                  }}>
                    <GraduationCap size={18} color="#1a8a6e" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--gs-text)", marginBottom: "4px" }}>
                      <MathRenderer text={item.judul} />
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--gs-text-hint)" }}>
                      {[item.jenjang, item.mapel, item.topik, item.subtopik].filter(Boolean).join(" › ")}
                    </div>
                  </div>

                  {!isMobile && (
                    <div style={{ fontSize: "11px", color: "var(--gs-text-hint)", flexShrink: 0 }}>
                      {fmtDate(item.updated_at)}
                    </div>
                  )}

                  <ChevronRight size={16} color="var(--gs-text-hint)" style={{ flexShrink: 0 }} />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px" }}>
            <span style={{ fontSize: "13px", color: "var(--gs-text-muted)" }}>
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} dari {total}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} style={{
                width: "34px", height: "34px", borderRadius: "9px",
                border: "1px solid var(--gs-border)", background: "var(--gs-surface)",
                cursor: page === 1 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: page === 1 ? "var(--gs-border)" : "var(--gs-text-muted)",
              }}>
                <ChevronLeft size={15} />
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} style={{
                width: "34px", height: "34px", borderRadius: "9px",
                border: "1px solid var(--gs-border)", background: "var(--gs-surface)",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: page === totalPages ? "var(--gs-border)" : "var(--gs-text-muted)",
              }}>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
