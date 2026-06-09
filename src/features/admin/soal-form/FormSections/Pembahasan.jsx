// src/features/admin/soal-form/FormSections/Pembahasan.jsx
import MarkdownEditor from "../../../../components/MarkdownEditor";

export default function Pembahasan({ form, setForm, isMobile }) {
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
          fontSize: "14px",
          fontWeight: "700",
          color: "#0f0e17",
          marginBottom: "16px",
        }}
      >
        Pembahasan{" "}
        <span style={{ fontWeight: "400", color: "#6b6860", fontSize: "13px" }}>
          (opsional)
        </span>
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
