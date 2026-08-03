// src/features/admin/soal-form/FormSections/Pembahasan.jsx
import MarkdownEditor from "../../../../components/MarkdownEditor";

export default function Pembahasan({ form, setForm }) {
  return (
    <MarkdownEditor
      value={form.explanation}
      onChange={(v) => setForm((f) => ({ ...f, explanation: v }))}
      placeholder="Tulis pembahasan langkah per langkah... Bisa pakai LaTeX dan Markdown"
      rows={5}
    />
  );
}
