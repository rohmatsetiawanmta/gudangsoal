// src/features/admin/soal-form/AnswerInput/MenjodohkanInput.jsx
import { Plus, Trash2 } from "lucide-react";
import MathRenderer from "../../../../components/MathRenderer";

export default function MenjodohkanInput({ form, setForm, isMobile }) {
  const options = (() => {
    const raw =
      form.options?.left !== undefined ? form.options : { left: [], right: [] };
    return {
      left: (raw.left || []).map((item) =>
        typeof item === "string" ? item : item?.text || ""
      ),
      right: (raw.right || []).map((item) =>
        typeof item === "string" ? item : item?.text || ""
      ),
    };
  })();

  const answer =
    typeof form.answer === "object" &&
    !Array.isArray(form.answer) &&
    form.answer !== null
      ? form.answer
      : {};

  const setOptions = (newOptions) =>
    setForm((f) => ({ ...f, options: newOptions }));
  const setAnswer = (newAnswer) =>
    setForm((f) => ({ ...f, answer: newAnswer }));

  const addLeft = () => setOptions({ ...options, left: [...options.left, ""] });
  const addRight = () =>
    setOptions({ ...options, right: [...options.right, ""] });

  const updateLeft = (idx, text) => {
    const newLeft = [...options.left];
    newLeft[idx] = text;
    setOptions({ ...options, left: newLeft });
  };

  const updateRight = (idx, text) => {
    const newRight = [...options.right];
    newRight[idx] = text;
    setOptions({ ...options, right: newRight });
  };

  const removeLeft = (idx) => {
    const newLeft = options.left.filter((_, i) => i !== idx);
    const newAnswer = {};
    Object.entries(answer).forEach(([lIdx, rIdx]) => {
      const li = parseInt(lIdx);
      if (li === idx) return;
      const newLi = li > idx ? li - 1 : li;
      newAnswer[String(newLi)] = rIdx;
    });
    setOptions({ ...options, left: newLeft });
    setAnswer(newAnswer);
  };

  const removeRight = (idx) => {
    const newRight = options.right.filter((_, i) => i !== idx);
    const newAnswer = {};
    Object.entries(answer).forEach(([lIdx, rIdx]) => {
      const ri = parseInt(rIdx);
      if (ri === idx) return;
      const newRi = ri > idx ? ri - 1 : ri;
      newAnswer[lIdx] = String(newRi);
    });
    setOptions({ ...options, right: newRight });
    setAnswer(newAnswer);
  };

  const setPair = (lIdx, rIdx) => {
    const key = String(lIdx);
    const val = String(rIdx);
    const newAnswer = { ...answer };
    if (newAnswer[key] === val) {
      delete newAnswer[key];
    } else {
      newAnswer[key] = val;
    }
    setAnswer(newAnswer);
  };

  const inputStyle = {
    flex: 1,
    minWidth: 0,
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e2ddd5",
    fontSize: "13px",
    outline: "none",
    fontFamily: "inherit",
    color: "#0f0e17",
  };

  const labelBox = (content) => (
    <div
      style={{
        width: "24px",
        height: "24px",
        borderRadius: "6px",
        background: "#f2efe8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: "700",
        color: "#6b6860",
        flexShrink: 0,
      }}
    >
      {content}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Input kolom kiri + kanan */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "20px" : "16px",
          overflow: "hidden",
        }}
      >
        {/* Kolom Kiri */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}
          >
            Kolom Kiri
          </div>
          {options.left.map((text, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                minWidth: 0,
              }}
            >
              {labelBox(idx + 1)}
              <input
                value={text}
                onChange={(e) => updateLeft(idx, e.target.value)}
                placeholder={`Item ${idx + 1} — bisa LaTeX: $x^2$`}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
              />
              {options.left.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLeft(idx)}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "7px",
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
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
          {options.left.length < 8 && (
            <button
              type="button"
              onClick={addLeft}
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
              <Plus size={13} /> Tambah
            </button>
          )}
        </div>

        {/* Kolom Kanan */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}
          >
            Kolom Kanan
          </div>
          {options.right.map((text, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                minWidth: 0,
              }}
            >
              {labelBox(String.fromCharCode(65 + idx))}
              <input
                value={text}
                onChange={(e) => updateRight(idx, e.target.value)}
                placeholder={`Opsi ${String.fromCharCode(
                  65 + idx
                )} — bisa LaTeX: $x^2$`}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
              />
              {options.right.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRight(idx)}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "7px",
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
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
          {options.right.length < 10 && (
            <button
              type="button"
              onClick={addRight}
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
              <Plus size={13} /> Tambah
            </button>
          )}
        </div>
      </div>

      {/* Pasangan jawaban */}
      {options.left.length > 0 && options.right.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div
            style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}
          >
            Tentukan Pasangan Benar
          </div>
          <div
            style={{ fontSize: "12px", color: "#b4b2a9", marginTop: "-6px" }}
          >
            Klik opsi kanan yang merupakan pasangan dari setiap item kiri.
          </div>

          {options.left.map((leftText, li) => (
            <div
              key={li}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                padding: "10px 12px",
                background: "#faf9f6",
                borderRadius: "10px",
                border: "1px solid #e2ddd5",
              }}
            >
              {/* Label kiri dengan MathRenderer */}
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#0f0e17",
                }}
              >
                <span
                  style={{
                    fontWeight: "700",
                    color: "#6b6860",
                    marginRight: "6px",
                  }}
                >
                  {li + 1}.
                </span>
                {leftText ? (
                  <MathRenderer text={leftText} />
                ) : (
                  <span style={{ color: "#b4b2a9", fontStyle: "italic" }}>
                    Item {li + 1}
                  </span>
                )}
              </div>

              {/* Tombol pilihan kanan */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {options.right.map((rightText, ri) => {
                  const isPaired = answer[String(li)] === String(ri);
                  const isPairedByOther = Object.entries(answer).some(
                    ([k, v]) => v === String(ri) && k !== String(li)
                  );
                  return (
                    <button
                      key={ri}
                      type="button"
                      onClick={() => setPair(li, ri)}
                      title={rightText}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "7px",
                        border: `1.5px solid ${
                          isPaired ? "#1a8a6e" : "#e2ddd5"
                        }`,
                        background: isPaired ? "#e4f5f0" : "white",
                        color: isPaired
                          ? "#1a8a6e"
                          : isPairedByOther
                          ? "#b4b2a9"
                          : "#0f0e17",
                        fontSize: "13px",
                        fontWeight: isPaired ? "700" : "500",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all .15s",
                        opacity: isPairedByOther ? 0.5 : 1,
                      }}
                    >
                      {String.fromCharCode(65 + ri)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary kunci jawaban */}
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
        {options.left.length === 0 && (
          <div style={{ color: "#b4b2a9", fontStyle: "italic" }}>
            Belum ada item.
          </div>
        )}
        {options.left.map((leftText, li) => {
          const ri =
            answer[String(li)] !== undefined
              ? parseInt(answer[String(li)])
              : null;
          const rightText = ri !== null ? options.right[ri] : null;
          return (
            <div
              key={li}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "6px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{ fontWeight: "600", color: "#0f0e17", flexShrink: 0 }}
              >
                {li + 1}.
              </span>
              <span style={{ color: "#0f0e17" }}>
                {leftText ? (
                  <MathRenderer text={leftText} />
                ) : (
                  <span style={{ fontStyle: "italic", color: "#b4b2a9" }}>
                    Item {li + 1}
                  </span>
                )}
              </span>
              <span style={{ color: "#b4b2a9", flexShrink: 0 }}>→</span>
              {rightText ? (
                <span style={{ fontWeight: "600", color: "#1a8a6e" }}>
                  {String.fromCharCode(65 + ri)}.{" "}
                  <MathRenderer text={rightText} />
                </span>
              ) : (
                <span style={{ color: "#b4b2a9", fontStyle: "italic" }}>
                  belum dipasangkan
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
