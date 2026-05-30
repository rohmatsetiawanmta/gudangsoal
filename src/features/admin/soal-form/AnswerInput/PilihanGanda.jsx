// src/features/admin/soal-form/AnswerInput/PilihanGanda.jsx
import { Plus, Trash2 } from "lucide-react";
import { LABELS, emptyOption } from "../constants";

export default function PilihanGanda({ form, setForm }) {
  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = { ...newOptions[index], text: value };
    setForm((f) => ({ ...f, options: newOptions }));
  };

  const addOption = () => {
    if (form.options.length >= 10) return;
    setForm((f) => ({
      ...f,
      options: [...f.options, emptyOption(LABELS[f.options.length])],
    }));
  };

  const removeOption = (index) => {
    if (form.options.length <= 2) return;
    const newOptions = form.options
      .filter((_, i) => i !== index)
      .map((o, i) => ({ ...o, label: LABELS[i] }));
    setForm((f) => ({
      ...f,
      options: newOptions,
      answer: f.answer === form.options[index].label ? "" : f.answer,
    }));
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}>
          Pilihan Jawaban
        </div>
        {form.options.length < 10 && (
          <button
            type="button"
            onClick={addOption}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: "600",
              color: "#e84c2b",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Plus size={14} /> Tambah Pilihan
          </button>
        )}
      </div>

      {/* Options */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        {form.options.map((opt, i) => (
          <div
            key={opt.label}
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: form.answer === opt.label ? "#e84c2b" : "#f2efe8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: form.answer === opt.label ? "white" : "#6b6860",
                fontWeight: "700",
                fontSize: "13px",
                flexShrink: 0,
              }}
            >
              {opt.label}
            </div>
            <input
              value={opt.text}
              onChange={(e) => handleOptionChange(i, e.target.value)}
              placeholder={`Pilihan ${opt.label}`}
              style={{
                flex: 1,
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
            {form.options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(i)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid #fca5a5",
                  background: "#fff3f0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#e84c2b",
                  flexShrink: 0,
                }}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Jawaban benar */}
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
          Jawaban Benar
        </label>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {form.options.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setForm((f) => ({ ...f, answer: opt.label }))}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                border: `2px solid ${
                  form.answer === opt.label ? "#1a8a6e" : "#e2ddd5"
                }`,
                background: form.answer === opt.label ? "#e4f5f0" : "white",
                color: form.answer === opt.label ? "#1a8a6e" : "#6b6860",
                fontWeight: "700",
                fontSize: "14px",
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
    </div>
  );
}
