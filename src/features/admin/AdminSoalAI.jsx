// src/features/admin/AdminSoalAI.jsx
import { useState } from "react";
import { Sparkles, X, Copy, Check, Upload } from "lucide-react";
import api from "../../lib/api";

const DIFFICULTY_LABELS = { 1: "Easy", 2: "Medium", 3: "Hard" };

const KONTEKS_OPTIONS = [
  { value: "sekolah", label: "Soal Sekolah (Ujian/UTS/UAS)" },
  { value: "seleksi", label: "Tes Seleksi (UTBK/CPNS/OSN)" },
];

const TIPE_OPTIONS = [
  { value: "hitungan", label: "Hitungan Murni" },
  { value: "cerita", label: "Soal Cerita / Kontekstual" },
  { value: "konsep", label: "Konsep / Teori" },
];

const BAHASA_OPTIONS = [
  { value: "formal", label: "Formal (Buku Teks)" },
  { value: "semiformal", label: "Semi-formal (Mudah Dipahami)" },
];

const REFERENSI_OPTIONS = [
  { value: "", label: "Tidak ada referensi khusus" },
  { value: "UN", label: "Mirip soal UN" },
  { value: "UTBK", label: "Mirip soal UTBK" },
  { value: "olimpiade", label: "Mirip soal Olimpiade" },
];

function RadioGroup({ label, options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>
        {label}
      </label>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: `1.5px solid ${
                value === opt.value ? "#e84c2b" : "#e2ddd5"
              }`,
              background: value === opt.value ? "#fff3f0" : "white",
              color: value === opt.value ? "#e84c2b" : "#6b6860",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .15s",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdminSoalAI({ form, setForm, struktur, selected }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("generate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate settings
  const [konteks, setKonteks] = useState("sekolah");
  const [jumlahPilihan, setJumlahPilihan] = useState(4);
  const [tipe, setTipe] = useState("hitungan");
  const [bahasa, setBahasa] = useState("formal");
  const [referensi, setReferensi] = useState("");
  const [instruction, setInstruction] = useState("");

  // Import settings
  const [jsonInput, setJsonInput] = useState("");

  const jenjang =
    struktur.jenjang.find((j) => j.id == selected.jenjang)?.nama || "";
  const subjenjang =
    struktur.subjenjang.find((s) => s.id == selected.subjenjang)?.nama || "";
  const mapel = struktur.mapel.find((m) => m.id == selected.mapel)?.nama || "";
  const topik = struktur.topik.find((t) => t.id == selected.topik)?.nama || "";
  const subtopik =
    struktur.subtopik.find((s) => s.id == form.subtopik_id)?.nama || "";
  const diffLabel = DIFFICULTY_LABELS[form.difficulty] || "Easy";

  const buildLabels = (n) => ["A", "B", "C", "D", "E"].slice(0, n);

  const buildPrompt = () => {
    const labels = buildLabels(jumlahPilihan);
    const optionsDesc = labels
      .map((l) => `{"label": "${l}", "text": "isi pilihan ${l}"}`)
      .join(", ");
    const konteksDesc =
      konteks === "sekolah"
        ? "Soal untuk keperluan sekolah (ujian harian/UTS/UAS)"
        : `Soal untuk tes seleksi (${
            jenjang === "UTBK"
              ? "UTBK"
              : jenjang === "CPNS"
              ? "CPNS"
              : jenjang === "OSN"
              ? "OSN"
              : "tes seleksi"
          })`;

    return `Kamu adalah pembuat soal matematika profesional untuk siswa Indonesia.

Buat 1 soal matematika pilihan ganda dengan spesifikasi berikut:
- Jenjang: ${jenjang}
- Kelas/Rumpun: ${subjenjang}
- Mata Pelajaran: ${mapel}
- Topik: ${topik}
- Subtopik: ${subtopik}
- Tingkat Kesulitan: ${diffLabel}
- Konteks: ${konteksDesc}
- Tipe soal: ${TIPE_OPTIONS.find((t) => t.value === tipe)?.label}
- Gaya bahasa: ${BAHASA_OPTIONS.find((b) => b.value === bahasa)?.label}
${
  referensi
    ? `- Referensi: ${
        REFERENSI_OPTIONS.find((r) => r.value === referensi)?.label
      }`
    : ""
}
${instruction ? `- Instruksi tambahan: ${instruction}` : ""}

PENTING:
- Gunakan LaTeX untuk rumus dengan format $...$ untuk inline dan $$...$$ untuk display
- Berikan tepat ${jumlahPilihan} pilihan jawaban (${labels.join(", ")})
- Satu jawaban benar, sisanya salah tapi masuk akal
- OUTPUT HARUS BERUPA JSON VALID SAJA, tidak ada teks lain sebelum atau sesudah JSON
- Jangan gunakan markdown code block

Output JSON:
{"body":"<soal>","options":[${optionsDesc}],"answer":"<label jawaban benar>","explanation":"<pembahasan langkah per langkah>"}`;
  };

  const handleCopyPrompt = () => {
    if (!form.subtopik_id) {
      setError("Pilih subtopik dulu sebelum copy prompt");
      return;
    }
    navigator.clipboard.writeText(buildPrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseResult = (result) => {
    if (result.parsed) return result.parsed;
    let text = result.text || "";
    text = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(text);
  };

  const handleGenerate = async () => {
    if (!form.subtopik_id) {
      setError("Pilih subtopik dulu sebelum generate soal");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await api.post("/admin/ai/generate", {
        prompt: buildPrompt(),
      });
      const parsed = parseResult(result);

      if (!parsed.body || !parsed.options || !parsed.answer) {
        throw new Error("Response AI tidak lengkap");
      }

      setForm((f) => ({
        ...f,
        body: parsed.body,
        options: parsed.options,
        answer: parsed.answer,
        explanation: parsed.explanation || "",
      }));

      setOpen(false);
      setInstruction("");
    } catch (err) {
      console.log("error:", err);
      setError("Gagal generate soal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleImportJSON = () => {
    setError("");
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

      // Fix backslash LaTeX yang tidak ter-escape
      // \frac → \\frac, \Rightarrow → \\Rightarrow, dst
      text = text.replace(/\\([a-zA-Z])/g, "\\\\$1");

      const parsed = JSON.parse(text);

      if (!parsed.body || !parsed.options || !parsed.answer) {
        setError("JSON tidak lengkap — harus ada body, options, dan answer");
        return;
      }

      setForm((f) => ({
        ...f,
        body: parsed.body,
        options: parsed.options,
        answer: parsed.answer,
        explanation: parsed.explanation || "",
      }));

      setOpen(false);
      setJsonInput("");
    } catch (err) {
      console.log("parse error:", err);
      setError(
        "Format JSON tidak valid. Pastikan JSON yang dipaste sudah benar."
      );
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError("");
    setJsonInput("");
    setInstruction("");
    setCopied(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
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
        <Sparkles size={16} color="#e84c2b" />
        Generate dengan AI
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
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "28px",
              maxWidth: "520px",
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
                <Sparkles size={18} color="#e84c2b" />
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: "800",
                    color: "#0f0e17",
                  }}
                >
                  Soal dengan AI
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

            {/* Mode tabs */}
            <div
              style={{
                display: "flex",
                gap: "6px",
                marginBottom: "20px",
                background: "#f2efe8",
                padding: "4px",
                borderRadius: "10px",
              }}
            >
              {[
                { value: "generate", label: "Generate Otomatis" },
                { value: "import", label: "Import JSON" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setMode(tab.value);
                    setError("");
                  }}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "8px",
                    border: "none",
                    background: mode === tab.value ? "white" : "transparent",
                    color: mode === tab.value ? "#0f0e17" : "#6b6860",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all .15s",
                    boxShadow:
                      mode === tab.value
                        ? "0 1px 4px rgba(0,0,0,0.08)"
                        : "none",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Konteks */}
            <div
              style={{
                background: "#f2efe8",
                borderRadius: "10px",
                padding: "14px 16px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#6b6860",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: "8px",
                }}
              >
                Konteks Soal
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                {[
                  { label: "Jenjang", value: jenjang },
                  { label: "Kelas", value: subjenjang },
                  { label: "Mapel", value: mapel },
                  { label: "Topik", value: topik },
                  { label: "Subtopik", value: subtopik },
                  { label: "Kesulitan", value: diffLabel },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{ display: "flex", gap: "8px", fontSize: "13px" }}
                  >
                    <span style={{ color: "#6b6860", minWidth: "72px" }}>
                      {label}
                    </span>
                    <span
                      style={{
                        color: value ? "#0f0e17" : "#b4b2a9",
                        fontWeight: value ? "500" : "400",
                      }}
                    >
                      {value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {!form.subtopik_id && (
              <div
                style={{
                  background: "#fff3f0",
                  border: "1px solid #fca5a5",
                  color: "#b91c1c",
                  fontSize: "13px",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                }}
              >
                Pilih subtopik dulu di form sebelum generate soal.
              </div>
            )}

            {/* Mode: Generate */}
            {mode === "generate" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  marginBottom: "20px",
                }}
              >
                <RadioGroup
                  label="Konteks Soal"
                  options={KONTEKS_OPTIONS}
                  value={konteks}
                  onChange={setKonteks}
                />

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#0f0e17",
                    }}
                  >
                    Jumlah Pilihan Jawaban
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setJumlahPilihan(n)}
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "10px",
                          border: `1.5px solid ${
                            jumlahPilihan === n ? "#e84c2b" : "#e2ddd5"
                          }`,
                          background: jumlahPilihan === n ? "#fff3f0" : "white",
                          color: jumlahPilihan === n ? "#e84c2b" : "#6b6860",
                          fontWeight: "700",
                          fontSize: "15px",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          transition: "all .15s",
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <RadioGroup
                  label="Tipe Soal"
                  options={TIPE_OPTIONS}
                  value={tipe}
                  onChange={setTipe}
                />
                <RadioGroup
                  label="Gaya Bahasa"
                  options={BAHASA_OPTIONS}
                  value={bahasa}
                  onChange={setBahasa}
                />
                <RadioGroup
                  label="Referensi"
                  options={REFERENSI_OPTIONS}
                  value={referensi}
                  onChange={setReferensi}
                />

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#0f0e17",
                    }}
                  >
                    Instruksi Tambahan{" "}
                    <span style={{ fontWeight: "400", color: "#6b6860" }}>
                      (opsional)
                    </span>
                  </label>
                  <textarea
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="Contoh: gunakan konteks pertanian, soal gabungan dua konsep, dll..."
                    rows={2}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid #e2ddd5",
                      fontSize: "14px",
                      outline: "none",
                      fontFamily: "inherit",
                      color: "#0f0e17",
                      resize: "none",
                      lineHeight: "1.6",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
                  />
                </div>

                {/* Copy prompt */}
                <div
                  style={{
                    background: "#f2efe8",
                    borderRadius: "10px",
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#6b6860",
                      marginBottom: "10px",
                      lineHeight: "1.5",
                    }}
                  >
                    Atau copy prompt ini ke AI lain (ChatGPT, Claude, dll), lalu
                    paste response JSON-nya di tab <strong>Import JSON</strong>.
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "1px solid #e2ddd5",
                      background: "white",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      color: copied ? "#1a8a6e" : "#0f0e17",
                      transition: "all .15s",
                    }}
                  >
                    {copied ? (
                      <Check size={14} color="#1a8a6e" />
                    ) : (
                      <Copy size={14} />
                    )}
                    {copied ? "Prompt disalin!" : "Copy Prompt"}
                  </button>
                </div>
              </div>
            )}

            {/* Mode: Import JSON */}
            {mode === "import" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b6860",
                    lineHeight: "1.6",
                  }}
                >
                  Paste response JSON dari AI (ChatGPT, Claude, Gemini, dll) di
                  bawah ini. Format yang diharapkan:
                </div>
                <pre
                  style={{
                    background: "#f2efe8",
                    borderRadius: "8px",
                    padding: "12px",
                    fontSize: "11px",
                    color: "#6b6860",
                    overflowX: "auto",
                    lineHeight: "1.6",
                    margin: 0,
                  }}
                >
                  {`{
  "body": "teks soal...",
  "options": [
    {"label": "A", "text": "..."},
    {"label": "B", "text": "..."},
    ...
  ],
  "answer": "A",
  "explanation": "pembahasan..."
}`}
                </pre>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
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
              </div>
            )}

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
                }}
              >
                {error}
              </div>
            )}

            {mode === "generate" && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#b4b2a9",
                  marginBottom: "16px",
                  lineHeight: "1.6",
                }}
              >
                Hasil generate AI akan mengisi form secara otomatis. Pastikan
                review dan edit sebelum menyimpan.
              </p>
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

              {mode === "generate" ? (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading || !form.subtopik_id}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "10px",
                    border: "none",
                    background:
                      loading || !form.subtopik_id ? "#e2ddd5" : "#e84c2b",
                    color: loading || !form.subtopik_id ? "#b4b2a9" : "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor:
                      loading || !form.subtopik_id ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    minWidth: "140px",
                    justifyContent: "center",
                  }}
                >
                  {loading ? (
                    <>
                      <span
                        style={{
                          width: "14px",
                          height: "14px",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "white",
                          borderRadius: "50%",
                          animation: "spin 0.7s linear infinite",
                          display: "block",
                        }}
                      />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      Generate Soal
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleImportJSON}
                  disabled={!jsonInput.trim()}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "10px",
                    border: "none",
                    background: !jsonInput.trim() ? "#e2ddd5" : "#e84c2b",
                    color: !jsonInput.trim() ? "#b4b2a9" : "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: !jsonInput.trim() ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Upload size={15} />
                  Import ke Form
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
