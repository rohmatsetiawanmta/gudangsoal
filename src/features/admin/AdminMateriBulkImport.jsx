// src/features/admin/AdminMateriBulkImport.jsx
import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, Upload, GraduationCap, BookOpen,
  CheckCircle, AlertCircle, Search, X, ChevronRight,
} from "lucide-react";
import api from "../../lib/api";
import useWindowWidth from "../../hooks/useWindowWidth";

const VALID_TYPES      = ["definisi", "rumus", "ringkasan", "contoh", "catatan"];
const VALID_TIPE_SOAL  = ["pilihan_ganda", "isian_singkat", "isian_numerik"];

function parseItem(raw) {
  const highlights = Array.isArray(raw.highlights)
    ? raw.highlights.map(h => ({
        type:    VALID_TYPES.includes(h.type) ? h.type : "rumus",
        label:   String(h.label   ?? ""),
        content: String(h.content ?? ""),
      }))
    : [];

  const pertanyaan = Array.isArray(raw.pertanyaan)
    ? raw.pertanyaan.map(q => ({
        tipe:       VALID_TIPE_SOAL.includes(q.tipe) ? q.tipe : "pilihan_ganda",
        teks:       String(q.teks       ?? ""),
        pilihan:    Array.isArray(q.pilihan) ? q.pilihan.map(String) : [],
        jawaban:    String(q.jawaban    ?? ""),
        pembahasan: String(q.pembahasan ?? ""),
      }))
    : [];

  return {
    id:           raw.id ? parseInt(raw.id) || null : null,
    judul:        String(raw.judul ?? "").trim(),
    konten:       String(raw.konten ?? ""),
    highlights,
    pertanyaan,
    is_published: raw.is_published ? 1 : 0,
    urutan:       parseInt(raw.urutan ?? 0) || 0,
  };
}

// ── Subtopik search picker (same logic as LokasiSoal, green theme) ────────────
function SubtopikPicker({ subtopikId, onSelect, onClear, struktur, loadingStruktur }) {
  const [query, setQuery] = useState("");
  const [open,  setOpen]  = useState(false);
  const inputRef = useRef(null);
  const dropRef  = useRef(null);

  const topikMap   = useMemo(() => Object.fromEntries(struktur.topik.map(t => [t.id, t])), [struktur.topik]);
  const mapelMap   = useMemo(() => Object.fromEntries(struktur.mapel.map(m => [m.id, m])), [struktur.mapel]);
  const subjMap    = useMemo(() => Object.fromEntries(struktur.subjenjang.map(s => [s.id, s])), [struktur.subjenjang]);
  const jenjangMap = useMemo(() => Object.fromEntries(struktur.jenjang.map(j => [j.id, j])), [struktur.jenjang]);

  const enriched = useMemo(() => struktur.subtopik.map(st => {
    const topik   = topikMap[st.topik_id]         || {};
    const mapel   = mapelMap[topik.mapel_id]       || {};
    const subj    = subjMap[mapel.subjenjang_id]   || {};
    const jenjang = jenjangMap[subj.jenjang_id]    || {};
    return {
      ...st, topik, mapel, subj, jenjang,
      fullText: [jenjang.nama, subj.nama, mapel.nama, topik.nama, st.nama].filter(Boolean).join(" ").toLowerCase(),
    };
  }), [struktur.subtopik, topikMap, mapelMap, subjMap, jenjangMap]);

  const results = useMemo(() => {
    if (!query.trim()) return enriched.slice(0, 50);
    const q = query.toLowerCase();
    return enriched.filter(s => s.fullText.includes(q)).slice(0, 60);
  }, [enriched, query]);

  const selected = useMemo(() => enriched.find(s => s.id == subtopikId) || null, [enriched, subtopikId]);

  useEffect(() => {
    const handler = e => {
      if (dropRef.current && !dropRef.current.contains(e.target) && inputRef.current && !inputRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = st => { onSelect(st.id); setQuery(""); setOpen(false); };
  const handleClear  = () => { onClear(); setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); };

  const Crumb = ({ st }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
      {st.jenjang?.nama && <><span style={{ fontSize: "11px", color: "#b4b2a9" }}>{st.jenjang.nama}</span><ChevronRight size={10} color="#d4d0c8" /></>}
      {st.subj?.nama    && <><span style={{ fontSize: "11px", color: "#b4b2a9" }}>{st.subj.nama}</span><ChevronRight size={10} color="#d4d0c8" /></>}
      {st.mapel?.nama   && <><span style={{ fontSize: "11px", color: "#b4b2a9" }}>{st.mapel.nama}</span><ChevronRight size={10} color="#d4d0c8" /></>}
      {st.topik?.nama   && <><span style={{ fontSize: "11px", color: "#b4b2a9" }}>{st.topik.nama}</span><ChevronRight size={10} color="#d4d0c8" /></>}
      <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f0e17" }}>{st.nama}</span>
    </div>
  );

  return (
    <div>
      <p style={{ fontSize: "13px", color: "#6b6860", marginBottom: "12px", marginTop: 0 }}>
        Semua item akan disimpan ke subtopik ini.
      </p>

      <div style={{ position: "relative" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "10px 14px", borderRadius: "10px",
          border: `1.5px solid ${open ? "#1a8a6e" : "#e2ddd5"}`,
          background: loadingStruktur ? "#faf9f6" : "white",
          cursor: loadingStruktur ? "not-allowed" : "text",
          transition: "border-color .15s",
        }}>
          <Search size={16} color={open ? "#1a8a6e" : "#b4b2a9"} style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={loadingStruktur ? "Memuat data..." : "Cari subtopik..."}
            disabled={loadingStruktur}
            style={{ flex: 1, border: "none", outline: "none", fontSize: "14px", fontFamily: "inherit", color: "#0f0e17", background: "transparent", minWidth: 0 }}
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); setOpen(true); inputRef.current?.focus(); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#b4b2a9", display: "flex", padding: 0 }}>
              <X size={15} />
            </button>
          )}
        </div>

        {open && !loadingStruktur && (
          <div ref={dropRef} style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
            background: "white", border: "1.5px solid #e2ddd5", borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,.12)", zIndex: 200,
            maxHeight: "280px", overflowY: "auto",
          }}>
            {results.length === 0 ? (
              <div style={{ padding: "20px 16px", fontSize: "13px", color: "#b4b2a9", textAlign: "center" }}>
                Tidak ditemukan "{query}"
              </div>
            ) : (
              <>
                {!query && (
                  <div style={{ padding: "10px 14px 6px", fontSize: "11px", color: "#b4b2a9", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".05em" }}>
                    Semua subtopik ({enriched.length})
                  </div>
                )}
                {results.map(st => (
                  <button key={st.id} type="button" onClick={() => handleSelect(st)}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", border: "none", background: st.id == subtopikId ? "#e4f5f0" : "transparent", cursor: "pointer", borderBottom: "1px solid #f0ede6", fontFamily: "inherit" }}
                    onMouseEnter={e => { if (st.id != subtopikId) e.currentTarget.style.background = "#faf9f6"; }}
                    onMouseLeave={e => { if (st.id != subtopikId) e.currentTarget.style.background = "transparent"; }}
                  >
                    <Crumb st={st} />
                  </button>
                ))}
                {results.length === 60 && (
                  <div style={{ padding: "10px 14px", fontSize: "11px", color: "#b4b2a9", textAlign: "center" }}>
                    Ketik lebih spesifik untuk mempersempit
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {selected && (
        <div style={{ marginTop: "12px", padding: "12px 14px", borderRadius: "10px", background: "#e4f5f0", border: "1.5px solid #6ee7b7", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#1a8a6e", textTransform: "uppercase", letterSpacing: ".05em" }}>
              Subtopik dipilih
            </div>
            <Crumb st={selected} />
          </div>
          <button type="button" onClick={handleClear}
            style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "7px", border: "1px solid #6ee7b7", background: "white", color: "#1a8a6e", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
            <X size={12} /> Ganti
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function AdminMateriBulkImport() {
  const navigate  = useNavigate();
  const width     = useWindowWidth();
  const isMobile  = width <= 480;

  const [struktur, setStruktur]           = useState({ jenjang: [], subjenjang: [], mapel: [], topik: [], subtopik: [] });
  const [loadingStruktur, setLoadingStruktur] = useState(true);
  const [subtopikId, setSubtopikId]       = useState(null);

  useEffect(() => {
    api.get("/admin/struktur")
      .then(data => setStruktur(data))
      .catch(() => {})
      .finally(() => setLoadingStruktur(false));
  }, []);

  const [jsonInput,    setJsonInput]    = useState("");
  const [parseError,   setParseError]   = useState("");
  const [parseSnippet, setParseSnippet] = useState("");
  const [items,        setItems]        = useState(null);

  const handleParse = () => {
    setParseError(""); setParseSnippet(""); setItems(null);
    if (!jsonInput.trim()) { setParseError("Paste JSON array dulu"); return; }
    try {
      let text = jsonInput.trim().replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) { setParseError("JSON harus berupa array [...], bukan object {...}"); return; }
      if (parsed.length === 0)    { setParseError("Array kosong"); return; }
      for (let i = 0; i < parsed.length; i++) {
        if (!parsed[i].judul?.trim()) { setParseError(`Item #${i + 1}: field 'judul' wajib ada`); return; }
      }
      setItems(parsed.map(parseItem));
    } catch (e) {
      const msg = e.message || "";
      const posMatch = msg.match(/position (\d+)/i) || msg.match(/at (\d+)/i);
      if (posMatch) {
        const pos = Number(posMatch[1]);
        const src = jsonInput.trim().replace(/```json/gi, "").replace(/```/g, "").trim();
        const start = Math.max(0, pos - 40);
        setParseSnippet(src.slice(start, Math.min(src.length, pos + 40)) + "\n" + " ".repeat(Math.min(pos - start, 40)) + "^");
      }
      setParseError("JSON tidak valid — " + msg.replace(/^JSON Parse error: /i, "").replace(/^SyntaxError: /i, ""));
    }
  };

  const [importing, setImporting] = useState(false);
  const [result,    setResult]    = useState(null);

  const canImport = items && subtopikId;

  const handleImport = async () => {
    if (!canImport) return;
    setImporting(true);
    try {
      const payload = items.map(item => ({ ...item, subtopik_id: subtopikId }));
      const res = await api.post("/admin/materi/bulk", { items: payload });
      setResult({ inserted: res.inserted ?? 0, updated: res.updated ?? 0, errors: res.errors ?? [] });
    } catch (e) {
      setResult({ inserted: 0, updated: 0, errors: [e?.response?.data?.error || e.message || "Gagal import"] });
    } finally {
      setImporting(false);
    }
  };

  const selectedSubtopikNama = struktur.subtopik.find(s => s.id == subtopikId)?.nama;

  return (
    <>
      <Helmet>
        <title>Import Bulk Materi | Admin Gudang Soal</title>
      </Helmet>

      {/* Hero */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #0a1c1a 100%)",
        padding: isMobile ? "24px 20px" : "28px 32px",
        marginBottom: "24px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%", transform: "translateY(-50%)", opacity: 0.06, pointerEvents: "none", color: "white" }}>
          <GraduationCap size={isMobile ? 80 : 110} />
        </div>
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: isMobile ? "flex-start" : "center", gap: "16px", flexDirection: isMobile ? "column" : "row" }}>
          <button onClick={() => navigate("/admin/materi")}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.7)", cursor: "pointer", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.15)"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: isMobile ? "20px" : "24px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: 0 }}>
              Import Bulk Materi
            </h1>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,.45)", margin: "4px 0 0" }}>
              Pilih subtopik target, paste JSON array, lalu import sekaligus.
            </p>
          </div>
        </div>
      </div>

      {result ? (
        /* Result */
        <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2ddd5", padding: "32px", maxWidth: "560px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
            {(result.inserted + result.updated) > 0
              ? <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#e4f5f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><CheckCircle size={24} color="#1a8a6e" /></div>
              : <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><AlertCircle size={24} color="#e84c2b" /></div>
            }
            <div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#0f0e17" }}>
                {(result.inserted + result.updated) > 0
                  ? [result.inserted > 0 && `${result.inserted} ditambahkan`, result.updated > 0 && `${result.updated} diupdate`].filter(Boolean).join(", ") + "!"
                  : "Tidak ada yang tersimpan"}
              </div>
              {result.errors.length > 0 && <div style={{ fontSize: "13px", color: "#6b6860", marginTop: "3px" }}>{result.errors.length} item gagal</div>}
            </div>
          </div>
          {result.errors.length > 0 && (
            <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", borderRadius: "10px", padding: "12px 14px", marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#b91c1c", marginBottom: "6px" }}>Error:</div>
              {result.errors.map((e, i) => <div key={i} style={{ fontSize: "12px", color: "#b91c1c", lineHeight: "1.6" }}>{e}</div>)}
            </div>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => { setResult(null); setItems(null); setJsonInput(""); }}
              style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#0f0e17" }}>
              Import Lagi
            </button>
            <button onClick={() => navigate("/admin/materi")}
              style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#0f0e17", color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
              Lihat Semua Materi
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px", alignItems: "start" }}>

          {/* Left: Subtopik picker + JSON */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Subtopik card */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", borderLeft: "3px solid #1a8a6e" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0ede6", fontSize: "13px", fontWeight: "700", color: "#0f0e17", background: "linear-gradient(to right, #faf9f6, white)", display: "flex", alignItems: "center", gap: "8px", borderRadius: "11px 11px 0 0" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1a8a6e", flexShrink: 0 }} />
                Target Subtopik
              </div>
              <div style={{ padding: "20px" }}>
                <SubtopikPicker
                  subtopikId={subtopikId}
                  onSelect={setSubtopikId}
                  onClear={() => setSubtopikId(null)}
                  struktur={struktur}
                  loadingStruktur={loadingStruktur}
                />
              </div>
            </div>

            {/* JSON card */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", borderLeft: "3px solid #2563eb" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0ede6", fontSize: "13px", fontWeight: "700", color: "#0f0e17", background: "linear-gradient(to right, #faf9f6, white)", display: "flex", alignItems: "center", gap: "8px", borderRadius: "11px 11px 0 0" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2563eb", flexShrink: 0 }} />
                JSON Data
              </div>
              <div style={{ padding: "20px" }}>
                <textarea
                  value={jsonInput}
                  onChange={e => { setJsonInput(e.target.value); setItems(null); setParseError(""); setParseSnippet(""); }}
                  placeholder={'[{"judul": "...", "konten": "...", "highlights": [...]}, ...]'}
                  rows={14}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e2ddd5", fontSize: "12.5px", fontFamily: "monospace", color: "#0f0e17", resize: "vertical", lineHeight: "1.6", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => (e.target.style.borderColor = "#2563eb")}
                  onBlur={e => (e.target.style.borderColor = "#e2ddd5")}
                />
                {parseError && (
                  <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", borderRadius: "10px", padding: "10px 12px", marginTop: "10px", fontSize: "12.5px", color: "#b91c1c", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div>{parseError}</div>
                    {parseSnippet && <pre style={{ margin: 0, padding: "6px 10px", background: "rgba(0,0,0,0.06)", borderRadius: "6px", fontSize: "11px", fontFamily: "monospace", overflowX: "auto", whiteSpace: "pre", color: "#7f1d1d" }}>{parseSnippet}</pre>}
                  </div>
                )}
                <button type="button" onClick={handleParse} disabled={!jsonInput.trim()}
                  style={{ marginTop: "12px", width: "100%", padding: "10px", borderRadius: "10px", border: "none", background: !jsonInput.trim() ? "#e2ddd5" : "#0f0e17", color: !jsonInput.trim() ? "#b4b2a9" : "white", fontSize: "13.5px", fontWeight: "700", cursor: !jsonInput.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                  Parse JSON
                </button>
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div>
            {items ? (
              <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", borderLeft: "3px solid #7c3aed", position: isMobile ? "static" : "sticky", top: "20px" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0ede6", fontSize: "13px", fontWeight: "700", color: "#0f0e17", background: "linear-gradient(to right, #faf9f6, white)", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "11px 11px 0 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
                    Preview
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "700", padding: "3px 10px", borderRadius: "99px", background: "rgba(124,58,237,.1)", color: "#7c3aed" }}>{items.length} item</span>
                </div>
                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "6px", maxHeight: "400px", overflowY: "auto" }}>
                  {items.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: "#faf9f6", borderRadius: "9px", border: "1px solid #e2ddd5" }}>
                      <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "11px", fontWeight: "700", color: "#7c3aed" }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "12.5px", fontWeight: "600", color: "#0f0e17", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{item.judul}</span>
                          {item.id
                            ? <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "99px", background: "rgba(37,99,235,.1)", color: "#2563eb", flexShrink: 0 }}>Update #{item.id}</span>
                            : <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "99px", background: "rgba(26,138,110,.1)", color: "#1a8a6e", flexShrink: 0 }}>Baru</span>
                          }
                        </div>
                        <div style={{ fontSize: "11px", color: "#b4b2a9" }}>
                          {item.highlights.length} highlight · {item.pertanyaan.length} pertanyaan · urutan {item.urutan} · {item.is_published ? "Published" : "Draft"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "14px 16px", borderTop: "1px solid #f0ede6" }}>
                  {!subtopikId && (
                    <div style={{ fontSize: "12.5px", color: "#f5a623", fontWeight: "600", marginBottom: "10px" }}>
                      ⚠ Pilih subtopik target di kolom kiri dulu
                    </div>
                  )}
                  <button type="button" onClick={handleImport} disabled={!canImport || importing}
                    style={{ width: "100%", padding: "11px", borderRadius: "10px", border: "none", background: !canImport || importing ? "#e2ddd5" : "#e84c2b", color: !canImport || importing ? "#b4b2a9" : "white", fontSize: "14px", fontWeight: "700", cursor: !canImport || importing ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: canImport && !importing ? "0 4px 14px rgba(232,76,43,.3)" : "none" }}>
                    <Upload size={15} />
                    {importing ? "Menyimpan..." : `Simpan ${items.length} Materi${selectedSubtopikNama ? ` → ${selectedSubtopikNama}` : ""}`}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", padding: "48px 24px", textAlign: "center" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <BookOpen size={20} color="#7c3aed" />
                </div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f0e17", marginBottom: "4px" }}>Preview akan muncul di sini</div>
                <p style={{ fontSize: "12px", color: "#b4b2a9", margin: 0 }}>Paste JSON di kiri, lalu klik Parse JSON</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
