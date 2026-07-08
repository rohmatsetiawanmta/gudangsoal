// src/features/admin/AdminMateriImport.jsx
import { useState } from "react";
import { Upload, X } from "lucide-react";

const VALID_TYPES      = ["definisi", "rumus", "ringkasan", "contoh", "catatan"];
const VALID_TIPE_SOAL  = ["pilihan_ganda", "isian_singkat", "isian_numerik"];

const FORMAT_EXAMPLE = `{
  "judul": "Luas Lingkaran",
  "konten": "Lingkaran adalah...",
  "highlights": [
    { "type": "rumus", "label": "Luas", "content": "$L = \\\\pi r^2$" }
  ],
  "pertanyaan": [
    { "tipe": "pilihan_ganda", "teks": "Soal...", "pilihan": ["A","B","C","D"], "jawaban": "A" },
    { "tipe": "isian_singkat", "teks": "Soal...", "jawaban": "teks jawaban" },
    { "tipe": "isian_numerik", "teks": "Soal...", "jawaban": "42" }
  ],
  "subtopik_id": 12,
  "is_published": 0,
  "urutan": 0
}
// pertanyaan, highlights, subtopik_id, urutan — semua opsional`;

export default function AdminMateriImport({ setForm, isMobile }) {
  const [open, setOpen]           = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError]         = useState("");
  const [snippet, setSnippet]     = useState("");

  const handleImport = () => {
    setError(""); setSnippet("");
    if (!jsonInput.trim()) { setError("Paste JSON dulu sebelum import"); return; }

    try {
      let text = jsonInput.trim().replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        setError('Untuk import banyak sekaligus, gunakan tombol "Import Bulk" di halaman Kelola Materi.');
        return;
      }

      if (!parsed.judul?.trim()) { setError("Field 'judul' wajib ada dan tidak boleh kosong"); return; }

      const highlights = Array.isArray(parsed.highlights)
        ? parsed.highlights.map(h => ({
            type:    VALID_TYPES.includes(h.type) ? h.type : "rumus",
            label:   String(h.label   ?? ""),
            content: String(h.content ?? ""),
          }))
        : [];

      const pertanyaan = Array.isArray(parsed.pertanyaan)
        ? parsed.pertanyaan.map(q => ({
            tipe:       VALID_TIPE_SOAL.includes(q.tipe) ? q.tipe : "pilihan_ganda",
            teks:       String(q.teks       ?? ""),
            pilihan:    Array.isArray(q.pilihan) ? q.pilihan.map(String) : [],
            jawaban:    String(q.jawaban    ?? ""),
            pembahasan: String(q.pembahasan ?? ""),
          }))
        : [];

      setForm(f => ({
        ...f,
        judul:        String(parsed.judul).trim(),
        konten:       String(parsed.konten ?? ""),
        highlights,
        pertanyaan,
        is_published: parsed.is_published ? 1 : 0,
        urutan:       parseInt(parsed.urutan ?? 0) || 0,
        ...(parsed.subtopik_id != null && { subtopik_id: parsed.subtopik_id }),
      }));

      setOpen(false);
      setJsonInput("");
    } catch (e) {
      const msg = e.message || "";
      const posMatch = msg.match(/position (\d+)/i) || msg.match(/at (\d+)/i);
      if (posMatch) {
        const pos = Number(posMatch[1]);
        const src = jsonInput.trim().replace(/```json/gi, "").replace(/```/g, "").trim();
        const start = Math.max(0, pos - 40);
        const end   = Math.min(src.length, pos + 40);
        setSnippet(src.slice(start, end) + "\n" + " ".repeat(Math.min(pos - start, 40)) + "^");
      }
      setError("JSON tidak valid — " + msg.replace(/^JSON Parse error: /i, "").replace(/^SyntaxError: /i, ""));
    }
  };

  const handleClose = () => { setOpen(false); setJsonInput(""); setError(""); setSnippet(""); };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          padding: "10px 16px", borderRadius: "10px",
          border: "1px solid rgba(255,255,255,.15)",
          background: "rgba(255,255,255,.08)",
          fontSize: "13.5px", fontWeight: "600",
          cursor: "pointer", fontFamily: "inherit",
          color: "rgba(255,255,255,.8)",
          transition: "all .15s",
          width: isMobile ? "100%" : "auto",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.15)"; e.currentTarget.style.color = "white"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "rgba(255,255,255,.8)"; }}
      >
        <Upload size={14} />
        Import JSON
      </button>

      {open && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "16px" }}
          onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div style={{ background: "white", borderRadius: "18px", padding: isMobile ? "20px 16px" : "28px", maxWidth: "520px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Upload size={18} color="#0f0e17" />
                <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f0e17", margin: 0 }}>Import JSON Materi</h3>
              </div>
              <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6860", display: "flex" }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "#6b6860", lineHeight: "1.6", marginTop: 0, marginBottom: "14px" }}>
              Paste JSON satu materi. Subtopik tetap bisa dipilih manual di form kecuali <code style={{ background: "#f2efe8", padding: "1px 5px", borderRadius: "4px", fontSize: "12px" }}>subtopik_id</code> sudah ada di JSON.
            </p>

            <pre style={{ background: "#f2efe8", borderRadius: "10px", padding: "12px 14px", fontSize: "11px", color: "#6b6860", overflowX: "auto", lineHeight: "1.6", margin: "0 0 16px" }}>
              {FORMAT_EXAMPLE}
            </pre>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>Paste JSON di sini</label>
              <textarea
                value={jsonInput}
                onChange={e => setJsonInput(e.target.value)}
                placeholder={'{"judul": "...", "konten": "...", "highlights": [...]}'}
                rows={10}
                style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2ddd5", fontSize: "13px", outline: "none", fontFamily: "monospace", color: "#0f0e17", resize: "vertical", lineHeight: "1.6" }}
                onFocus={e => (e.target.style.borderColor = "#e84c2b")}
                onBlur={e => (e.target.style.borderColor = "#e2ddd5")}
              />
            </div>

            {error && (
              <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "13px", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div>{error}</div>
                {snippet && (
                  <pre style={{ margin: 0, padding: "8px 10px", background: "rgba(0,0,0,0.06)", borderRadius: "6px", fontSize: "12px", fontFamily: "monospace", overflowX: "auto", whiteSpace: "pre", color: "#7f1d1d", lineHeight: "1.5" }}>
                    {snippet}
                  </pre>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button type="button" onClick={handleClose}
                style={{ padding: "9px 20px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#0f0e17" }}>
                Batal
              </button>
              <button type="button" onClick={handleImport} disabled={!jsonInput.trim()}
                style={{ padding: "9px 20px", borderRadius: "10px", border: "none", background: !jsonInput.trim() ? "#e2ddd5" : "#0f0e17", color: !jsonInput.trim() ? "#b4b2a9" : "white", fontSize: "14px", fontWeight: "600", cursor: !jsonInput.trim() ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "8px" }}>
                <Upload size={15} /> Import ke Form
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
