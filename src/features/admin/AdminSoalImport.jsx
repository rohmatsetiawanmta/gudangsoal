// src/features/admin/AdminSoalImport.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, Loader } from "lucide-react";
import api from "../../lib/api";

export default function AdminSoalImport({ setForm, isMobile }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");
  const [snippet, setSnippet] = useState("");
  const [validating, setValidating] = useState(false);

  const parseDifficulty = (val) => {
    if (val === undefined || val === null) return null;
    if (typeof val === "number" && [1, 2, 3].includes(val)) return val;
    const map = { easy: 1, medium: 2, hard: 3, mudah: 1, sedang: 2, sulit: 3, susah: 3 };
    return map[String(val).toLowerCase()] ?? null;
  };

  const VALID_TIPE = [
    "pilihan_ganda", "isian_singkat", "isian_numerik",
    "checklist", "multiple_choice_table", "menjodohkan", "isian_multi",
  ];
  const parseTipe = (val) => {
    if (!val) return null;
    const v = String(val).toLowerCase().replace(/[\s-]/g, "_");
    return VALID_TIPE.includes(v) ? v : null;
  };

  const buildFormFields = (parsed, fallback = {}) => {
    const difficulty = parseDifficulty(parsed.difficulty);
    const tipe = parseTipe(parsed.tipe);
    let explanation = parsed.explanation || "";
    if (typeof explanation === "object" && explanation !== null) {
      explanation = JSON.stringify(explanation);
    }
    return {
      body: parsed.body,
      options: parsed.options,
      answer: parsed.answer,
      explanation,
      tipe: tipe || fallback.tipe || "pilihan_ganda",
      difficulty: difficulty !== null ? difficulty : (fallback.difficulty ?? 1),
      video_url: parsed.video_url || fallback.video_url || "",
      materi_ids: Array.isArray(parsed.materi_ids) ? parsed.materi_ids : (fallback.materi_ids || []),
    };
  };

  const handleImport = async () => {
    setError("");
    setSnippet("");
    if (!jsonInput.trim()) {
      setError("Paste JSON dulu sebelum import");
      return;
    }
    try {
      let text = jsonInput.trim();
      text = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      const parsed = JSON.parse(text);
      if (!parsed.body || !parsed.options || !parsed.answer) {
        setError("JSON tidak lengkap — harus ada body, options, dan answer");
        return;
      }

      // === Mode: Edit (ada id DAN kode) ===
      if (parsed.id && parsed.kode) {
        setValidating(true);
        try {
          const data = await api.get(`/admin/soal/detail?id=${parsed.id}`);
          if (data.kode !== String(parsed.kode)) {
            setError(
              `Kode tidak cocok — soal ID ${parsed.id} di database punya kode "${data.kode}", bukan "${parsed.kode}"`
            );
            return;
          }
          // Valid → navigate ke edit page dengan import data di state
          navigate(`/admin/soal/edit/${parsed.id}`, {
            state: { importData: buildFormFields(parsed) },
          });
          setOpen(false);
          setJsonInput("");
        } catch (e) {
          const status = e?.status || e?.response?.status;
          if (status === 404) {
            setError(`Soal dengan ID ${parsed.id} tidak ditemukan di database`);
          } else {
            setError("Gagal validasi soal — " + (e?.error || e?.message || "error tidak diketahui"));
          }
        } finally {
          setValidating(false);
        }
        return;
      }

      // === Mode: Tambah baru (tidak ada id/kode) ===
      const fields = buildFormFields(parsed);
      setForm((f) => ({
        ...f,
        body: fields.body,
        options: fields.options,
        answer: fields.answer,
        explanation: fields.explanation,
        ...(fields.tipe !== "pilihan_ganda" && { tipe: fields.tipe }),
        difficulty: fields.difficulty,
        ...(fields.materi_ids.length > 0 && { materi_ids: fields.materi_ids }),
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
        const end = Math.min(src.length, pos + 40);
        const snip = src.slice(start, end);
        const arrow = " ".repeat(Math.min(pos - start, 40)) + "^";
        setSnippet(snip + "\n" + arrow);
      }
      setError("JSON tidak valid — " + msg.replace(/^JSON Parse error: /i, "").replace(/^SyntaxError: /i, ""));
    }
  };

  const handleClose = () => {
    setOpen(false);
    setJsonInput("");
    setError("");
    setSnippet("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "10px 18px",
          borderRadius: "10px",
          border: "1px solid #e2ddd5",
          background: "white",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
          fontFamily: "inherit",
          color: "#0f0e17",
          transition: "all .15s",
          width: isMobile ? "100%" : "auto",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f2efe8";
          e.currentTarget.style.borderColor = "#0f0e17";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "white";
          e.currentTarget.style.borderColor = "#e2ddd5";
        }}
      >
        <Upload size={15} />
        Import JSON
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: isMobile ? "20px 16px" : "28px",
              maxWidth: "480px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Upload size={18} color="#0f0e17" />
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: "800",
                    color: "#0f0e17",
                  }}
                >
                  Import JSON
                </h3>
              </div>
              <button
                onClick={handleClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b6860",
                  display: "flex",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Penjelasan */}
            <div
              style={{
                fontSize: "13px",
                color: "#6b6860",
                lineHeight: "1.6",
                marginBottom: "16px",
              }}
            >
              Paste JSON soal di bawah ini. Lihat format yang didukung di
              tombol <strong>Lihat Format</strong> untuk referensi struktur JSON.
            </div>

            {/* Format contoh */}
            <pre
              style={{
                background: "#f2efe8",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "11px",
                color: "#6b6860",
                overflowX: "auto",
                lineHeight: "1.6",
                margin: "0 0 16px 0",
              }}
            >
              {`{
  "body": "teks soal...",
  "options": [{"label":"A","text":"..."},{"label":"B","text":"..."}],
  "answer": "A",
  "explanation": "pembahasan...",
  "tipe": "pilihan_ganda",
  "difficulty": "easy"
}
// tipe: pilihan_ganda / isian_singkat / isian_numerik /
//        checklist / multiple_choice_table / menjodohkan / isian_multi
// difficulty: easy / medium / hard  (keduanya opsional)`}
            </pre>

            {/* Textarea */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                marginBottom: "16px",
              }}
            >
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f0e17",
                }}
              >
                Paste JSON di sini
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"body": "...", "options": [...], "answer": "A", "explanation": "..."}'
                rows={8}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #e2ddd5",
                  fontSize: "13px",
                  outline: "none",
                  fontFamily: "monospace",
                  color: "#0f0e17",
                  resize: "vertical",
                  lineHeight: "1.6",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
              />
            </div>

            {error && (
              <div
                style={{
                  background: "#fff3f0",
                  border: "1px solid #fca5a5",
                  color: "#b91c1c",
                  fontSize: "13px",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div>{error}</div>
                {snippet && (
                  <pre style={{ margin: 0, padding: "8px 10px", background: "rgba(0,0,0,0.06)", borderRadius: "6px", fontSize: "12px", fontFamily: "monospace", overflowX: "auto", whiteSpace: "pre", color: "#7f1d1d", lineHeight: "1.5" }}>
                    {snippet}
                  </pre>
                )}
              </div>
            )}

            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: "9px 20px",
                  borderRadius: "10px",
                  border: "1px solid #e2ddd5",
                  background: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: "#0f0e17",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={!jsonInput.trim() || validating}
                style={{
                  padding: "9px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: !jsonInput.trim() || validating ? "#e2ddd5" : "#0f0e17",
                  color: !jsonInput.trim() || validating ? "#b4b2a9" : "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: !jsonInput.trim() || validating ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {validating ? <Loader size={15} style={{ animation: "spin 0.7s linear infinite" }} /> : <Upload size={15} />}
                {validating ? "Memvalidasi..." : "Import ke Form"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
