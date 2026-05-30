// src/features/admin/soal-form/AnswerInput/MCTInput.jsx
import { Plus, Trash2, X } from "lucide-react";

export default function MCTInput({ form, setForm }) {
  const rows =
    Array.isArray(form.options) && form.options[0]?.cols ? form.options : [];
  const answer =
    typeof form.answer === "object" &&
    !Array.isArray(form.answer) &&
    form.answer !== null
      ? form.answer
      : {};
  const cols = rows[0]?.cols || ["A", "B"];

  const updateColLabel = (colIdx, newLabel) => {
    const oldLabel = cols[colIdx];
    const newCols = cols.map((c, i) => (i === colIdx ? newLabel : c));
    const newAnswer = {};
    Object.keys(answer).forEach((k) => {
      newAnswer[k] = answer[k] === oldLabel ? newLabel : answer[k];
    });
    setForm((f) => ({
      ...f,
      options: rows.map((r) => ({ ...r, cols: newCols })),
      answer: newAnswer,
    }));
  };

  const addRow = () =>
    setForm((f) => ({
      ...f,
      options: [...rows, { label: String(rows.length + 1), text: "", cols }],
    }));

  const removeRow = (index) => {
    const newRows = rows
      .filter((_, i) => i !== index)
      .map((r, i) => ({ ...r, label: String(i + 1) }));
    const newAnswer = {};
    newRows.forEach((r) => {
      if (answer[r.label]) newAnswer[r.label] = answer[r.label];
    });
    setForm((f) => ({ ...f, options: newRows, answer: newAnswer }));
  };

  const updateRowText = (index, text) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], text };
    setForm((f) => ({ ...f, options: newRows }));
  };

  const setRowAnswer = (rowLabel, col) =>
    setForm((f) => ({
      ...f,
      answer: {
        ...(typeof f.answer === "object" && !Array.isArray(f.answer)
          ? f.answer
          : {}),
        [rowLabel]: col,
      },
    }));

  const addCol = () => {
    if (cols.length >= 5) return;
    const newCols = [...cols, `Opsi ${cols.length + 1}`];
    setForm((f) => ({
      ...f,
      options: rows.map((r) => ({ ...r, cols: newCols })),
    }));
  };

  const removeCol = (colIdx) => {
    if (cols.length <= 2) return;
    const removedCol = cols[colIdx];
    const newCols = cols.filter((_, i) => i !== colIdx);
    const newAnswer = { ...answer };
    Object.keys(newAnswer).forEach((k) => {
      if (newAnswer[k] === removedCol) delete newAnswer[k];
    });
    setForm((f) => ({
      ...f,
      options: rows.map((r) => ({ ...r, cols: newCols })),
      answer: newAnswer,
    }));
  };

  if (rows.length === 0) {
    setTimeout(() => {
      setForm((f) => ({
        ...f,
        options: [
          { label: "1", text: "Pernyataan 1", cols: ["Benar", "Salah"] },
          { label: "2", text: "Pernyataan 2", cols: ["Benar", "Salah"] },
          { label: "3", text: "Pernyataan 3", cols: ["Benar", "Salah"] },
        ],
        answer: {},
      }));
    }, 0);
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* Header kolom */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#6b6860",
            flex: 1,
          }}
        >
          Pernyataan
        </div>
        {cols.map((col, colIdx) => (
          <div
            key={colIdx}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <input
              value={col}
              onChange={(e) => updateColLabel(colIdx, e.target.value)}
              style={{
                width: "64px",
                padding: "6px 8px",
                borderRadius: "8px",
                border: "1px solid #e2ddd5",
                fontSize: "12px",
                fontWeight: "700",
                textAlign: "center",
                outline: "none",
                fontFamily: "inherit",
                color: "#0f0e17",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
              onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
            />
            {cols.length > 2 && (
              <button
                type="button"
                onClick={() => removeCol(colIdx)}
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "4px",
                  border: "1px solid #fca5a5",
                  background: "#fff3f0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#e84c2b",
                  padding: 0,
                }}
              >
                <X size={10} />
              </button>
            )}
          </div>
        ))}
        {cols.length < 5 && (
          <button
            type="button"
            onClick={addCol}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              fontWeight: "600",
              color: "#e84c2b",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Plus size={12} /> Kolom
          </button>
        )}
        <div style={{ width: "32px" }} />
      </div>

      {/* Rows */}
      {rows.map((row, rowIdx) => (
        <div
          key={row.label}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <input
            value={row.text}
            onChange={(e) => updateRowText(rowIdx, e.target.value)}
            placeholder={`Pernyataan ${row.label}`}
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
          {cols.map((col) => (
            <button
              key={col}
              type="button"
              onClick={() => setRowAnswer(row.label, col)}
              style={{
                width: "44px",
                height: "40px",
                borderRadius: "8px",
                border: `2px solid ${
                  answer[row.label] === col ? "#1a8a6e" : "#e2ddd5"
                }`,
                background: answer[row.label] === col ? "#e4f5f0" : "white",
                color: answer[row.label] === col ? "#1a8a6e" : "#6b6860",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .15s",
                flexShrink: 0,
              }}
            >
              {col}
            </button>
          ))}
          {rows.length > 2 && (
            <button
              type="button"
              onClick={() => removeRow(rowIdx)}
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

      {rows.length < 8 && (
        <button
          type="button"
          onClick={addRow}
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
          <Plus size={14} /> Tambah Pernyataan
        </button>
      )}

      {/* Summary jawaban */}
      <div
        style={{
          background: "#f2efe8",
          borderRadius: "10px",
          padding: "12px 14px",
          fontSize: "13px",
          color: "#6b6860",
        }}
      >
        <div
          style={{ fontWeight: "600", color: "#0f0e17", marginBottom: "6px" }}
        >
          Kunci Jawaban:
        </div>
        {rows.map((row) => (
          <div
            key={row.label}
            style={{ display: "flex", gap: "8px", marginBottom: "2px" }}
          >
            <span style={{ minWidth: "20px" }}>{row.label}.</span>
            <span
              style={{
                color: "#0f0e17",
                fontWeight: answer[row.label] ? "600" : "400",
              }}
            >
              {answer[row.label] || (
                <span style={{ color: "#b4b2a9" }}>belum dipilih</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
