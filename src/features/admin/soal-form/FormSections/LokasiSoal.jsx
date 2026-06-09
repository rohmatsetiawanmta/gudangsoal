// src/features/admin/soal-form/FormSections/LokasiSoal.jsx
import { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, ChevronRight } from "lucide-react";

export default function LokasiSoal({
  form,
  setForm,
  struktur,
  selected,
  setSelected,
  loadingStruktur,
  isMobile,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  // Build flat lookup maps
  const topikMap    = useMemo(() => Object.fromEntries(struktur.topik.map(t => [t.id, t])), [struktur.topik]);
  const mapelMap    = useMemo(() => Object.fromEntries(struktur.mapel.map(m => [m.id, m])), [struktur.mapel]);
  const subjMap     = useMemo(() => Object.fromEntries(struktur.subjenjang.map(s => [s.id, s])), [struktur.subjenjang]);
  const jenjangMap  = useMemo(() => Object.fromEntries(struktur.jenjang.map(j => [j.id, j])), [struktur.jenjang]);

  // Build enriched subtopik list with full path
  const enriched = useMemo(() => {
    return struktur.subtopik.map(st => {
      const topik   = topikMap[st.topik_id]   || {};
      const mapel   = mapelMap[topik.mapel_id] || {};
      const subj    = subjMap[mapel.subjenjang_id] || {};
      const jenjang = jenjangMap[subj.jenjang_id]  || {};
      return {
        ...st,
        topik,
        mapel,
        subj,
        jenjang,
        // searchable text
        fullText: [jenjang.nama, subj.nama, mapel.nama, topik.nama, st.nama]
          .filter(Boolean).join(" ").toLowerCase(),
      };
    });
  }, [struktur.subtopik, topikMap, mapelMap, subjMap, jenjangMap]);

  // Filter by query
  const results = useMemo(() => {
    if (!query.trim()) return enriched.slice(0, 50); // show first 50 when empty
    const q = query.toLowerCase();
    return enriched.filter(s => s.fullText.includes(q)).slice(0, 60);
  }, [enriched, query]);

  // Currently selected subtopik object
  const selectedSubtopik = useMemo(
    () => enriched.find(s => s.id == form.subtopik_id) || null,
    [enriched, form.subtopik_id]
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (st) => {
    setForm(f => ({ ...f, subtopik_id: st.id }));
    setSelected({
      jenjang:    st.jenjang?.id   || "",
      subjenjang: st.subj?.id      || "",
      mapel:      st.mapel?.id     || "",
      topik:      st.topik?.id     || "",
    });
    setQuery("");
    setOpen(false);
  };

  const handleClear = () => {
    setForm(f => ({ ...f, subtopik_id: "" }));
    setSelected({ jenjang: "", subjenjang: "", mapel: "", topik: "" });
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const Crumb = ({ text, dim }) => (
    <span style={{ fontSize: "11px", color: dim ? "#b4b2a9" : "#6b6860", fontWeight: dim ? 400 : 500 }}>
      {text}
    </span>
  );

  const Breadcrumb = ({ st, large }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
      {st.jenjang?.nama  && <><Crumb text={st.jenjang.nama} dim /><ChevronRight size={10} color="#d4d0c8" /></>}
      {st.subj?.nama     && <><Crumb text={st.subj.nama}    dim /><ChevronRight size={10} color="#d4d0c8" /></>}
      {st.mapel?.nama    && <><Crumb text={st.mapel.nama}   dim /><ChevronRight size={10} color="#d4d0c8" /></>}
      {st.topik?.nama    && <><Crumb text={st.topik.nama}   dim /><ChevronRight size={10} color="#d4d0c8" /></>}
      <span style={{ fontSize: large ? "14px" : "12px", fontWeight: "700", color: "#0f0e17" }}>{st.nama}</span>
    </div>
  );

  return (
    <div style={{
      background: "white",
      borderRadius: "14px",
      border: "1px solid #e2ddd5",
      padding: isMobile ? "20px 16px" : "24px",
    }}>
      <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17", marginBottom: "4px" }}>
        Lokasi Soal
      </div>
      <p style={{ fontSize: "13px", color: "#6b6860", marginBottom: "16px", marginTop: 0 }}>
        Cari dan pilih subtopik — jenjang, kelas, mapel, dan topik akan terisi otomatis.
      </p>

      {/* Search box */}
      <div style={{ position: "relative" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 14px",
          borderRadius: "10px",
          border: `1.5px solid ${open ? "#e84c2b" : "#e2ddd5"}`,
          background: loadingStruktur ? "#faf9f6" : "white",
          cursor: loadingStruktur ? "not-allowed" : "text",
          transition: "border-color .15s",
        }}>
          <Search size={16} color={open ? "#e84c2b" : "#b4b2a9"} style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={loadingStruktur ? "Memuat data..." : "Cari subtopik..."}
            disabled={loadingStruktur}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "14px",
              fontFamily: "inherit",
              color: "#0f0e17",
              background: "transparent",
              minWidth: 0,
            }}
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); setOpen(true); inputRef.current?.focus(); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#b4b2a9", display: "flex", padding: 0 }}>
              <X size={15} />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {open && !loadingStruktur && (
          <div ref={dropRef} style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "white",
            border: "1.5px solid #e2ddd5",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            zIndex: 200,
            maxHeight: "320px",
            overflowY: "auto",
          }}>
            {results.length === 0 ? (
              <div style={{ padding: "20px 16px", fontSize: "13px", color: "#b4b2a9", textAlign: "center" }}>
                Tidak ditemukan subtopik "{query}"
              </div>
            ) : (
              <>
                {!query && (
                  <div style={{ padding: "10px 14px 6px", fontSize: "11px", color: "#b4b2a9", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".05em" }}>
                    Semua subtopik ({enriched.length})
                  </div>
                )}
                {results.map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelect(st)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 14px",
                      border: "none",
                      background: st.id == form.subtopik_id ? "#fff3f0" : "transparent",
                      cursor: "pointer",
                      borderBottom: "1px solid #f0ede6",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={e => { if (st.id != form.subtopik_id) e.currentTarget.style.background = "#faf9f6"; }}
                    onMouseLeave={e => { if (st.id != form.subtopik_id) e.currentTarget.style.background = "transparent"; }}
                  >
                    <Breadcrumb st={st} />
                  </button>
                ))}
                {results.length === 60 && (
                  <div style={{ padding: "10px 14px", fontSize: "11px", color: "#b4b2a9", textAlign: "center" }}>
                    Terlalu banyak hasil — ketik lebih spesifik untuk mempersempit
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Selected card */}
      {selectedSubtopik && (
        <div style={{
          marginTop: "12px",
          padding: "12px 14px",
          borderRadius: "10px",
          background: "#fff3f0",
          border: "1.5px solid #fca5a5",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#e84c2b", textTransform: "uppercase", letterSpacing: ".05em" }}>
              Subtopik dipilih
            </div>
            <Breadcrumb st={selectedSubtopik} large />
          </div>
          <button
            type="button"
            onClick={handleClear}
            title="Ganti subtopik"
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "5px 10px",
              borderRadius: "7px",
              border: "1px solid #fca5a5",
              background: "white",
              color: "#e84c2b",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <X size={12} /> Ganti
          </button>
        </div>
      )}
    </div>
  );
}
