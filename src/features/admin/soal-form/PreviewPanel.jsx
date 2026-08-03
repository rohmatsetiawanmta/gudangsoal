// src/features/admin/soal-form/PreviewPanel.jsx
import MathRenderer from "../../../components/MathRenderer";
import { TIPE_SOAL, DIFFICULTY_MAP } from "./constants";

// Helper normalize menjodohkan — handle format lama {id,text} dan baru string
const normalizeMenjodohkan = (options) => {
  if (!options) return { left: [], right: [] };
  const raw = typeof options === "string" ? JSON.parse(options) : options;
  return {
    left: (raw.left || []).map((item) =>
      typeof item === "string" ? item : item?.text || ""
    ),
    right: (raw.right || []).map((item) =>
      typeof item === "string" ? item : item?.text || ""
    ),
  };
};

export default function PreviewPanel({ form }) {
  const diff = DIFFICULTY_MAP[form.difficulty] || DIFFICULTY_MAP[1];
  const { answer, tipe } = form;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Label + badges */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "#6b6860",
          }}
        >
          Preview
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "700",
              padding: "3px 8px",
              borderRadius: "6px",
              background: "#f2efe8",
              color: "#6b6860",
            }}
          >
            {TIPE_SOAL.find((t) => t.value === tipe)?.label}
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "700",
              padding: "3px 8px",
              borderRadius: "6px",
              background: diff.bg,
              color: diff.color,
            }}
          >
            {diff.label}
          </span>
        </div>
      </div>

      {/* Soal */}
      <div
        style={{
          background: "white",
          borderRadius: "14px",
          border: "1px solid #e2ddd5",
          padding: "24px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "#6b6860",
            marginBottom: "12px",
          }}
        >
          Soal
        </div>
        {form.body ? (
          <div
            style={{ fontSize: "15px", color: "#0f0e17", fontWeight: "500" }}
          >
            <MathRenderer text={form.body} block />
          </div>
        ) : (
          <div
            style={{ fontSize: "14px", color: "#b4b2a9", fontStyle: "italic" }}
          >
            Soal belum diisi...
          </div>
        )}
      </div>

      {/* Jawaban */}
      <div
        style={{
          background: "white",
          borderRadius: "14px",
          border: "1px solid #e2ddd5",
          padding: "24px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "#6b6860",
            marginBottom: "12px",
          }}
        >
          {tipe === "isian_singkat" || tipe === "isian_numerik"
            ? "Kunci Jawaban"
            : "Pilihan Jawaban"}
        </div>

        {/* Pilihan ganda */}
        {tipe === "pilihan_ganda" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {form.options.map((opt) => {
              const isAns = answer === opt.label;
              return (
                <div
                  key={opt.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: isAns ? "2px solid #1a8a6e" : "1px solid #e2ddd5",
                    background: isAns ? "#e4f5f0" : "white",
                  }}
                >
                  <span
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "7px",
                      border: "2px solid currentColor",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "700",
                      flexShrink: 0,
                      color: isAns ? "#1a8a6e" : "#6b6860",
                    }}
                  >
                    {opt.label}
                  </span>
                  <span style={{ fontSize: "14px", color: "#0f0e17", flex: 1 }}>
                    {opt.text ? (
                      <MathRenderer text={opt.text} />
                    ) : (
                      <span style={{ color: "#b4b2a9", fontStyle: "italic" }}>
                        Pilihan {opt.label}...
                      </span>
                    )}
                  </span>
                  {isAns && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#1a8a6e",
                      }}
                    >
                      Benar
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Isian */}
        {(tipe === "isian_singkat" || tipe === "isian_numerik") && (
          <div
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "2px solid #1a8a6e",
              background: "#e4f5f0",
              fontSize: "15px",
              fontWeight: "600",
              color: "#0F6E56",
            }}
          >
            {answer || (
              <span
                style={{
                  color: "#b4b2a9",
                  fontWeight: "400",
                  fontStyle: "italic",
                }}
              >
                Belum diisi...
              </span>
            )}
          </div>
        )}

        {/* Checklist */}
        {tipe === "checklist" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {form.options.map((opt) => {
              const isAns = Array.isArray(answer) && answer.includes(opt.label);
              return (
                <div
                  key={opt.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: isAns ? "2px solid #1a8a6e" : "1px solid #e2ddd5",
                    background: isAns ? "#e4f5f0" : "white",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "4px",
                      border: `2px solid ${isAns ? "#1a8a6e" : "#e2ddd5"}`,
                      background: isAns ? "#1a8a6e" : "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isAns && (
                      <span
                        style={{
                          color: "white",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "14px", color: "#0f0e17", flex: 1 }}>
                    {opt.text ? (
                      <MathRenderer text={opt.text} />
                    ) : (
                      <span style={{ color: "#b4b2a9", fontStyle: "italic" }}>
                        Pilihan {opt.label}...
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* MCT */}
        {tipe === "multiple_choice_table" && form.options[0]?.cols && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      background: "#f2efe8",
                      borderRadius: "8px 0 0 0",
                      fontWeight: "600",
                      color: "#6b6860",
                      fontSize: "12px",
                    }}
                  >
                    Pernyataan
                  </th>
                  {form.options[0].cols.map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: "8px 16px",
                        textAlign: "center",
                        background: "#f2efe8",
                        fontWeight: "700",
                        color: "#0f0e17",
                        fontSize: "13px",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {form.options.map((row, i) => (
                  <tr
                    key={row.label}
                    style={{ background: i % 2 === 0 ? "white" : "#faf9f6" }}
                  >
                    <td style={{ padding: "10px 12px", color: "#0f0e17" }}>
                      {row.text ? (
                        <MathRenderer text={row.text} />
                      ) : (
                        <span style={{ color: "#b4b2a9", fontStyle: "italic" }}>
                          Pernyataan {row.label}...
                        </span>
                      )}
                    </td>
                    {row.cols.map((col) => {
                      const isAns = answer[row.label] === col;
                      return (
                        <td
                          key={col}
                          style={{ padding: "10px 16px", textAlign: "center" }}
                        >
                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              border: `2px solid ${
                                isAns ? "#1a8a6e" : "#e2ddd5"
                              }`,
                              background: isAns ? "#1a8a6e" : "white",
                              margin: "0 auto",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {isAns && (
                              <span
                                style={{
                                  color: "white",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                }}
                              >
                                ✓
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Menjodohkan */}
        {tipe === "menjodohkan" &&
          (() => {
            const { left: leftItems, right: rightItems } = normalizeMenjodohkan(
              form.options
            );
            return (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {leftItems.map((leftText, li) => {
                  const ri =
                    answer?.[String(li)] !== undefined
                      ? parseInt(answer[String(li)])
                      : null;
                  const rightText = ri !== null ? rightItems[ri] : null;
                  return (
                    <div
                      key={li}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: rightText
                          ? "2px solid #1a8a6e"
                          : "1px solid #e2ddd5",
                        background: rightText ? "#e4f5f0" : "white",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#6b6860",
                          flexShrink: 0,
                        }}
                      >
                        {li + 1}.
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#0f0e17",
                          flex: 1,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {leftText ? (
                          <MathRenderer text={leftText} />
                        ) : (
                          <span
                            style={{ color: "#b4b2a9", fontStyle: "italic" }}
                          >
                            Item {li + 1}...
                          </span>
                        )}
                      </span>
                      <span style={{ color: "#b4b2a9", flexShrink: 0 }}>→</span>
                      <span
                        style={{
                          fontSize: "14px",
                          flex: 1,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: rightText ? "#1a8a6e" : "#b4b2a9",
                          fontWeight: rightText ? "600" : "400",
                          fontStyle: rightText ? "normal" : "italic",
                        }}
                      >
                        {rightText ? (
                          <>
                            <span
                              style={{ fontWeight: "700", marginRight: "4px" }}
                            >
                              {String.fromCharCode(65 + ri)}.
                            </span>
                            <MathRenderer text={rightText} />
                          </>
                        ) : (
                          "belum dipasangkan..."
                        )}
                      </span>
                    </div>
                  );
                })}
                {rightItems.length > leftItems.length && (
                  <div style={{ fontSize: "12px", color: "#b4b2a9" }}>
                    {rightItems.length - leftItems.length} opsi kanan sebagai
                    distraktor
                  </div>
                )}
              </div>
            );
          })()}
      </div>

      {/* Isian Multi */}
      {tipe === "isian_multi" && Array.isArray(form.options) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {form.options.map((opt, idx) => (
            <div
              key={idx}
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#6b6860",
                }}
              >
                {opt.label || `Sub-jawaban ${idx + 1}`}
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "2px solid #1a8a6e",
                    background: "#e4f5f0",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#0F6E56",
                  }}
                >
                  {Array.isArray(form.answer) ? form.answer[idx] || "—" : "—"}
                </div>
                {opt.satuan && (
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#6b6860",
                      flexShrink: 0,
                    }}
                  >
                    {opt.satuan}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pembahasan */}
      <div
        style={{
          background: "white",
          borderRadius: "14px",
          border: "1px solid #e2ddd5",
          padding: "24px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "#6b6860",
            marginBottom: "12px",
          }}
        >
          Pembahasan
        </div>
        {form.explanation ? (
          <div style={{ fontSize: "14px", color: "#0f0e17" }}>
            <MathRenderer text={form.explanation} block />
          </div>
        ) : (
          <div
            style={{ fontSize: "14px", color: "#b4b2a9", fontStyle: "italic" }}
          >
            Pembahasan belum diisi...
          </div>
        )}
      </div>
    </div>
  );
}
