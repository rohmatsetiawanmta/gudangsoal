// src/features/admin/soal-form/AnswerInput/IsianMultiInput.jsx
import { Plus, Trash2 } from "lucide-react";

export default function IsianMultiInput({ form, setForm }) {
  // options: [{label, satuan}]
  // answer: ["jawaban1", "jawaban2"]
  const options = Array.isArray(form.options)
    ? form.options
    : [{ label: "", satuan: "" }];
  const answer = Array.isArray(form.answer)
    ? form.answer
    : options.map(() => "");

  const sync = (newOptions, newAnswer) => {
    setForm((f) => ({ ...f, options: newOptions, answer: newAnswer }));
  };

  const addItem = () => {
    sync([...options, { label: "", satuan: "" }], [...answer, ""]);
  };

  const removeItem = (idx) => {
    sync(
      options.filter((_, i) => i !== idx),
      answer.filter((_, i) => i !== idx)
    );
  };

  const updateLabel = (idx, val) => {
    const newOpts = [...options];
    newOpts[idx] = { ...newOpts[idx], label: val };
    sync(newOpts, answer);
  };

  const updateSatuan = (idx, val) => {
    const newOpts = [...options];
    newOpts[idx] = { ...newOpts[idx], satuan: val };
    sync(newOpts, answer);
  };

  const updateAnswer = (idx, val) => {
    const newAns = [...answer];
    newAns[idx] = val;
    sync(options, newAns);
  };

  const inputStyle = {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e2ddd5",
    fontSize: "13px",
    outline: "none",
    fontFamily: "inherit",
    color: "#0f0e17",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ fontSize: "12px", color: "#b4b2a9" }}>
        Tiap item punya label, kunci jawaban, dan satuan (opsional).
      </div>

      {options.map((opt, idx) => (
        <div
          key={idx}
          style={{
            background: "#faf9f6",
            borderRadius: "12px",
            border: "1px solid #e2ddd5",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {/* Nomor + hapus */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{ fontSize: "12px", fontWeight: "700", color: "#6b6860" }}
            >
              Sub-jawaban {idx + 1}
            </span>
            {options.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(idx)}
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "7px",
                  border: "1px solid #fca5a5",
                  background: "#fff3f0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#e84c2b",
                }}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>

          {/* Label */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label
              style={{ fontSize: "12px", fontWeight: "600", color: "#0f0e17" }}
            >
              Label
            </label>
            <input
              value={opt.label}
              onChange={(e) => updateLabel(idx, e.target.value)}
              placeholder="Contoh: Suku pertama, Beda, Luas, dll"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
              onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
            />
          </div>

          {/* Jawaban + Satuan */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px",
              gap: "10px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#0f0e17",
                }}
              >
                Kunci Jawaban
              </label>
              <input
                value={answer[idx] || ""}
                onChange={(e) => updateAnswer(idx, e.target.value)}
                placeholder="Contoh: -53"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#0f0e17",
                }}
              >
                Satuan{" "}
                <span style={{ fontWeight: "400", color: "#b4b2a9" }}>
                  (opsional)
                </span>
              </label>
              <input
                value={opt.satuan || ""}
                onChange={(e) => updateSatuan(idx, e.target.value)}
                placeholder="cm, kg, ..."
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
              />
            </div>
          </div>
        </div>
      ))}

      {options.length < 6 && (
        <button
          type="button"
          onClick={addItem}
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
          <Plus size={13} /> Tambah Sub-jawaban
        </button>
      )}

      {/* Summary */}
      <div
        style={{
          background: "#f2efe8",
          borderRadius: "10px",
          padding: "12px 14px",
          fontSize: "13px",
        }}
      >
        <div
          style={{ fontWeight: "600", color: "#0f0e17", marginBottom: "6px" }}
        >
          Kunci Jawaban:
        </div>
        {options.map((opt, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "3px",
              alignItems: "center",
            }}
          >
            <span
              style={{ fontWeight: "600", color: "#6b6860", minWidth: "120px" }}
            >
              {opt.label || `Sub-jawaban ${idx + 1}`}:
            </span>
            <span style={{ fontWeight: "700", color: "#0f0e17" }}>
              {answer[idx] || (
                <span style={{ color: "#b4b2a9", fontStyle: "italic" }}>
                  belum diisi
                </span>
              )}
              {opt.satuan && (
                <span
                  style={{
                    fontWeight: "400",
                    color: "#6b6860",
                    marginLeft: "4px",
                  }}
                >
                  {opt.satuan}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
