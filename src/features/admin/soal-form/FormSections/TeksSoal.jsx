// src/features/admin/soal-form/FormSections/TeksSoal.jsx
import MarkdownEditor from "../../../../components/MarkdownEditor";
import { TIPE_SOAL, defaultForm } from "../constants";

export default function TeksSoal({ form, setForm, isMobile }) {
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Tipe soal */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}
          >
            Tipe Soal
          </label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {TIPE_SOAL.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...defaultForm,
                    subtopik_id: f.subtopik_id,
                    body: f.body,
                    difficulty: f.difficulty,
                    explanation: f.explanation,
                    video_url: f.video_url,
                    is_public_explanation: f.is_public_explanation,
                    tipe: t.value,
                  }))
                }
                style={{
                  padding: "7px 14px",
                  borderRadius: "8px",
                  border: `1.5px solid ${
                    form.tipe === t.value ? "#e84c2b" : "#e2ddd5"
                  }`,
                  background: form.tipe === t.value ? "#fff3f0" : "white",
                  color: form.tipe === t.value ? "#e84c2b" : "#6b6860",
                  fontSize: isMobile ? "12px" : "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all .15s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Teks soal */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}
          >
            Teks Soal
          </label>
          <MarkdownEditor
            value={form.body}
            onChange={(v) => setForm((f) => ({ ...f, body: v }))}
            placeholder="Tulis soal... Gunakan $...$ untuk LaTeX inline, $$...$$ untuk display"
            rows={4}
          />
        </div>

        {/* Difficulty */}
        <div>
          <label
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#0f0e17",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Tingkat Kesulitan
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { value: 1, label: "Easy", color: "#1a8a6e" },
              { value: 2, label: "Medium", color: "#f5a623" },
              { value: 3, label: "Hard", color: "#e84c2b" },
            ].map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, difficulty: d.value }))}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: `2px solid ${
                    parseInt(form.difficulty) === d.value ? d.color : "#e2ddd5"
                  }`,
                  background:
                    parseInt(form.difficulty) === d.value
                      ? d.color + "18"
                      : "white",
                  color:
                    parseInt(form.difficulty) === d.value ? d.color : "#6b6860",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all .15s",
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
