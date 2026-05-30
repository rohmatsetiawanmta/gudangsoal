// src/features/admin/soal-form/FormSections/Pembahasan.jsx
import { Sparkles } from "lucide-react";
import MarkdownEditor from "../../../../components/MarkdownEditor";
import api from "../../../../lib/api";
import { useState } from "react";

export default function Pembahasan({ form, setForm, isMobile }) {
  const [generating, setGenerating] = useState(false);

  const canGenerate =
    form.body.trim() &&
    form.answer &&
    (form.tipe === "pilihan_ganda"
      ? form.options.every((o) => o.text.trim())
      : true);

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    try {
      const optionsText = form.options
        .map((o) => `${o.label}. ${o.text}`)
        .join("\n");
      const prompt = `Kamu adalah guru matematika profesional untuk siswa Indonesia.\n\nBerikut adalah soal matematika beserta pilihan jawabannya:\n\nSOAL:\n${
        form.body
      }\n\nPILIHAN JAWABAN:\n${optionsText}\n\nJAWABAN BENAR: ${JSON.stringify(
        form.answer
      )}\n\nBuat pembahasan langkah per langkah yang jelas dan mudah dipahami untuk soal ini.\nGunakan LaTeX untuk rumus matematika dengan format $...$ untuk inline dan $$...$$ untuk display.\nGunakan markdown untuk formatting (bold, list, dll).\n\nOUTPUT HANYA pembahasan saja dalam format teks, tanpa JSON, tanpa preamble apapun.`;
      const result = await api.post("/admin/ai/generate", { prompt });
      const text = result.text || result.parsed?.explanation || "";
      if (text) setForm((f) => ({ ...f, explanation: text.trim() }));
    } catch {
      alert("Gagal generate pembahasan. Coba lagi.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "14px",
        border: "1px solid #e2ddd5",
        padding: isMobile ? "20px 16px" : "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}>
          Pembahasan{" "}
          <span
            style={{ fontWeight: "400", color: "#6b6860", fontSize: "13px" }}
          >
            (opsional)
          </span>
        </div>
        {canGenerate && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "8px",
              border: "1px solid #e2ddd5",
              background: "white",
              fontSize: "13px",
              fontWeight: "600",
              cursor: generating ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              color: "#0f0e17",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              if (!generating) e.currentTarget.style.background = "#f2efe8";
            }}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            {generating ? (
              <>
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    border: "2px solid #e2ddd5",
                    borderTopColor: "#6b6860",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    display: "block",
                  }}
                />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={13} color="#e84c2b" /> Generate
              </>
            )}
          </button>
        )}
      </div>
      <MarkdownEditor
        value={form.explanation}
        onChange={(v) => setForm((f) => ({ ...f, explanation: v }))}
        placeholder="Tulis pembahasan langkah per langkah... Bisa pakai LaTeX dan Markdown"
        rows={5}
      />
    </div>
  );
}
