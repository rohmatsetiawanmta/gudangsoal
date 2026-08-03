// src/features/admin/soal-form/AnswerInput/ChecklistInput.jsx
import { Plus, Trash2 } from "lucide-react";
import { LABELS, emptyOption } from "../constants";

export default function ChecklistInput({ form, setForm }) {
  const answer = Array.isArray(form.answer) ? form.answer : [];

  const toggleAnswer = (label) => {
    setForm((f) => {
      const current = Array.isArray(f.answer) ? f.answer : [];
      return {
        ...f,
        answer: current.includes(label)
          ? current.filter((a) => a !== label)
          : [...current, label].sort(),
      };
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {form.options.map((opt, i) => (
          <div
            key={opt.label}
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <div
              onClick={() => toggleAnswer(opt.label)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: answer.includes(opt.label) ? "#e84c2b" : "#f2efe8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: answer.includes(opt.label) ? "white" : "#6b6860",
                fontWeight: "700",
                fontSize: "13px",
                flexShrink: 0,
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              {opt.label}
            </div>
            <input
              value={opt.text}
              onChange={(e) => {
                const newOptions = [...form.options];
                newOptions[i] = { ...newOptions[i], text: e.target.value };
                setForm((f) => ({ ...f, options: newOptions }));
              }}
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
                onClick={() => {
                  const newOptions = form.options
                    .filter((_, idx) => idx !== i)
                    .map((o, idx) => ({ ...o, label: LABELS[idx] }));
                  setForm((f) => ({
                    ...f,
                    options: newOptions,
                    answer: Array.isArray(f.answer)
                      ? f.answer.filter((a) => a !== opt.label)
                      : f.answer,
                  }));
                }}
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

      {form.options.length < 10 && (
        <button
          type="button"
          onClick={() =>
            setForm((f) => ({
              ...f,
              options: [...f.options, emptyOption(LABELS[f.options.length])],
            }))
          }
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
            alignSelf: "flex-start",
          }}
        >
          <Plus size={14} /> Tambah Pilihan
        </button>
      )}

      <div
        style={{
          background: "#f2efe8",
          borderRadius: "10px",
          padding: "12px 14px",
          fontSize: "13px",
          color: "#6b6860",
        }}
      >
        Jawaban benar:{" "}
        <strong style={{ color: "#0f0e17" }}>
          {answer.length > 0 ? answer.join(", ") : "—"}
        </strong>
        <span style={{ marginLeft: "8px", color: "#b4b2a9" }}>
          (klik label untuk toggle)
        </span>
      </div>
    </div>
  );
}
