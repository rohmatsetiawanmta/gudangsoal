// src/features/admin/soal-form/AnswerInput/IsianInput.jsx
export default function IsianInput({ form, setForm }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>
        Kunci Jawaban
      </label>
      <input
        value={form.answer || ""}
        onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
        placeholder={
          form.tipe === "isian_numerik"
            ? "Contoh: 42 atau 3.14"
            : "Tulis jawaban yang benar"
        }
        type={form.tipe === "isian_numerik" ? "number" : "text"}
        style={{
          padding: "10px 14px",
          borderRadius: "10px",
          border: "1px solid #e2ddd5",
          fontSize: "14px",
          outline: "none",
          fontFamily: "inherit",
          color: "#0f0e17",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
        onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
      />
      {form.tipe === "isian_numerik" && (
        <p style={{ fontSize: "12px", color: "#b4b2a9" }}>
          Hanya angka yang diterima. Bisa desimal.
        </p>
      )}
    </div>
  );
}
