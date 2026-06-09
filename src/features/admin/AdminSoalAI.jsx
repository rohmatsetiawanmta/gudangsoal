// src/features/admin/AdminSoalAI.jsx
import { useState } from "react";
import { Sparkles, X, Copy, Check } from "lucide-react";
import api from "../../lib/api";
import {
  buildPrompt,
  KONTEKS_OPTIONS,
  TIPE_OPTIONS,
  BAHASA_OPTIONS,
  REFERENSI_OPTIONS,
} from "./AdminSoalAI.prompt";

const DIFFICULTY_LABELS = { 1: "Easy", 2: "Medium", 3: "Hard" };

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

export default function AdminSoalAI({
  form,
  setForm,
  struktur,
  selected,
  isMobile,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [model, setModel] = useState("gemini-2.5-flash");
  const [konteks, setKonteks] = useState("sekolah");
  const [jumlahPilihan, setJumlahPilihan] = useState(4);
  const [tipe, setTipe] = useState("hitungan");
  const [bahasa, setBahasa] = useState("formal");
  const [referensi, setReferensi] = useState("");
  const [instruction, setInstruction] = useState("");

  const jenjang =
    struktur.jenjang.find((j) => j.id == selected.jenjang)?.nama || "";
  const subjenjang =
    struktur.subjenjang.find((s) => s.id == selected.subjenjang)?.nama || "";
  const mapel = struktur.mapel.find((m) => m.id == selected.mapel)?.nama || "";
  const topik = struktur.topik.find((t) => t.id == selected.topik)?.nama || "";
  const subtopik =
    struktur.subtopik.find((s) => s.id == form.subtopik_id)?.nama || "";
  const diffLabel = DIFFICULTY_LABELS[form.difficulty] || "Easy";

  const promptArgs = {
    jenjang,
    subjenjang,
    mapel,
    topik,
    subtopik,
    diffLabel,
    konteks,
    jumlahPilihan,
    tipe,
    bahasa,
    referensi,
    instruction,
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

  const handleCopyPrompt = () => {
    if (!form.subtopik_id) {
      setError("Pilih subtopik dulu sebelum copy prompt");
      return;
    }
    navigator.clipboard.writeText(buildPrompt(promptArgs));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        prompt: buildPrompt(promptArgs),
        model,
      });
      const parsed = parseResult(result);
      if (!parsed.body || !parsed.options || !parsed.answer)
        throw new Error("Response AI tidak lengkap");
      setForm((f) => ({
        ...f,
        body: parsed.body,
        options: parsed.options,
        answer: parsed.answer,
        explanation: parsed.explanation || "",
      }));
      setOpen(false);
      setInstruction("");
    } catch {
      setError("Gagal generate soal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setError("");
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
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: isMobile ? "20px 16px" : "28px",
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
                  Generate dengan AI
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

            {/* Konteks info */}
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

            {/* Settings */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              {/* Model selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>Model AI</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  {[
                    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
                    { value: "gemini-2.5-pro",   label: "Gemini 2.5 Pro" },
                    { value: "gpt-4o-mini",       label: "GPT-4o Mini" },
                    { value: "gpt-4o",            label: "GPT-4o" },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setModel(value)}
                      style={{
                        padding: "7px 10px",
                        borderRadius: "8px",
                        border: `1.5px solid ${model === value ? "#e84c2b" : "#e2ddd5"}`,
                        background: model === value ? "#fff3f0" : "white",
                        color: model === value ? "#e84c2b" : "#6b6860",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all .15s",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <RadioGroup
                label="Konteks Soal"
                options={KONTEKS_OPTIONS}
                value={konteks}
                onChange={setKonteks}
              />

              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
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
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
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
                  Mau pakai AI lain? Copy prompt ini ke ChatGPT, Claude, dll —
                  lalu paste hasilnya lewat tombol <strong>Import JSON</strong>{" "}
                  di form.
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

            <p
              style={{
                fontSize: "12px",
                color: "#b4b2a9",
                marginBottom: "16px",
                lineHeight: "1.6",
              }}
            >
              Hasil generate akan mengisi form secara otomatis. Pastikan review
              dan edit sebelum menyimpan.
            </p>

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
                    <Sparkles size={15} /> Generate Soal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
