// src/features/soal/components/JawabanInput.jsx
import { useState } from "react";
import MathRenderer from "../../../components/MathRenderer";
import { normalizeMenjodohkan } from "../soalUtils";

export default function JawabanInput({
  soal,
  chosen,
  setChosen,
  submitted,
  alreadyCorrect,
  isCorrect,
}) {
  const tipe = soal?.tipe || "pilihan_ganda";
  const [selectedLeft, setSelectedLeft] = useState(null);

  if (tipe === "pilihan_ganda") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {soal.options?.map((opt) => {
          const isChosen = chosen === opt.label;
          const isAnswer = opt.label === soal.answer;
          const isCorrectChosen = (isCorrect || alreadyCorrect) && isAnswer;
          const isWrong = submitted && !isCorrect && !alreadyCorrect && isChosen;

          let border = "1px solid var(--gs-border)",
            bg = "var(--gs-surface)",
            labelColor = "var(--gs-text-muted)";

          if (!submitted) {
            if (isChosen) {
              border = "2px solid #e84c2b";
              bg = "#fff3f0";
              labelColor = "#e84c2b";
            }
          } else if (isCorrectChosen) {
            border = "2px solid #1a8a6e";
            bg = "#e4f5f0";
            labelColor = "#1a8a6e";
          } else if (isWrong) {
            border = "2px solid #e84c2b";
            bg = "#fff3f0";
            labelColor = "#e84c2b";
          }

          return (
            <div
              key={opt.label}
              onClick={() =>
                !submitted && !alreadyCorrect && setChosen(opt.label)
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "13px 16px",
                borderRadius: "12px",
                cursor: submitted || alreadyCorrect ? "default" : "pointer",
                transition: "all .15s",
                border,
                background: bg,
              }}
            >
              <span
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  border: "2px solid currentColor",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: "700",
                  flexShrink: 0,
                  color: labelColor,
                }}
              >
                {opt.label}
              </span>
              <span style={{ fontSize: "15px", color: "var(--gs-text)", flex: 1 }}>
                <MathRenderer text={opt.text} />
              </span>
              {submitted && isCorrectChosen && (
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#1a8a6e",
                    flexShrink: 0,
                  }}
                >
                  Benar
                </span>
              )}
              {submitted && isWrong && (
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#e84c2b",
                    flexShrink: 0,
                  }}
                >
                  Salah
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (tipe === "isian_singkat" || tipe === "isian_numerik") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          value={chosen || ""}
          onChange={(e) =>
            !submitted && !alreadyCorrect && setChosen(e.target.value)
          }
          disabled={submitted || alreadyCorrect}
          type={tipe === "isian_numerik" ? "number" : "text"}
          placeholder={
            tipe === "isian_numerik"
              ? "Tulis jawaban angka..."
              : "Tulis jawabanmu..."
          }
          style={{
            padding: "14px 16px",
            borderRadius: "12px",
            fontSize: "16px",
            outline: "none",
            fontFamily: "inherit",
            color: "var(--gs-text)",
            border: !submitted
              ? "2px solid var(--gs-border)"
              : isCorrect || alreadyCorrect
              ? "2px solid #1a8a6e"
              : "2px solid #e84c2b",
            background: !submitted
              ? "var(--gs-input-bg)"
              : isCorrect || alreadyCorrect
              ? "#e4f5f0"
              : "#fff3f0",
          }}
          onFocus={(e) => {
            if (!submitted) e.target.style.borderColor = "#e84c2b";
          }}
          onBlur={(e) => {
            if (!submitted) e.target.style.borderColor = "var(--gs-border)";
          }}
        />
        {submitted && !isCorrect && !alreadyCorrect && (
          <div
            style={{ fontSize: "13px", color: "#e84c2b", fontWeight: "600" }}
          >
            Jawaban kurang tepat, coba lagi.
          </div>
        )}
      </div>
    );
  }

  if (tipe === "checklist") {
    const chosenArr = Array.isArray(chosen) ? chosen : [];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div
          style={{ fontSize: "13px", color: "var(--gs-text-muted)", marginBottom: "4px" }}
        >
          Pilih semua jawaban yang benar:
        </div>
        {soal.options?.map((opt) => {
          const isChosen = chosenArr.includes(opt.label);
          const answerArr = Array.isArray(soal.answer) ? soal.answer : [];
          const isAnswer =
            (isCorrect || alreadyCorrect) && answerArr.includes(opt.label);
          const isWrong =
            submitted &&
            !isCorrect &&
            !alreadyCorrect &&
            isChosen &&
            !answerArr.includes(opt.label);

          let border = "1px solid var(--gs-border)",
            bg = "var(--gs-surface)",
            checkBg = "var(--gs-surface)",
            checkBorder = "var(--gs-border)",
            checkColor = "transparent";
          if (!submitted) {
            if (isChosen) {
              border = "2px solid #e84c2b";
              bg = "#fff3f0";
              checkBg = "#e84c2b";
              checkBorder = "#e84c2b";
              checkColor = "white";
            }
          } else if (isAnswer) {
            border = "2px solid #1a8a6e";
            bg = "#e4f5f0";
            checkBg = "#1a8a6e";
            checkBorder = "#1a8a6e";
            checkColor = "white";
          } else if (isWrong) {
            border = "2px solid #e84c2b";
            bg = "#fff3f0";
            checkBg = "#e84c2b";
            checkBorder = "#e84c2b";
            checkColor = "white";
          }

          const toggle = () => {
            if (submitted || alreadyCorrect) return;
            setChosen((prev) => {
              const arr = Array.isArray(prev) ? prev : [];
              return arr.includes(opt.label)
                ? arr.filter((a) => a !== opt.label)
                : [...arr, opt.label].sort();
            });
          };

          return (
            <div
              key={opt.label}
              onClick={toggle}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "13px 16px",
                borderRadius: "12px",
                cursor: submitted || alreadyCorrect ? "default" : "pointer",
                transition: "all .15s",
                border,
                background: bg,
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "6px",
                  border: `2px solid ${checkBorder}`,
                  background: checkBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all .15s",
                }}
              >
                {(isChosen || isAnswer) && (
                  <span
                    style={{
                      color: checkColor,
                      fontSize: "12px",
                      fontWeight: "800",
                    }}
                  >
                    ✓
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "var(--gs-text-muted)",
                  flexShrink: 0,
                }}
              >
                {opt.label}
              </span>
              <span style={{ fontSize: "15px", color: "var(--gs-text)", flex: 1 }}>
                <MathRenderer text={opt.text} />
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  if (tipe === "multiple_choice_table") {
    const chosenObj =
      typeof chosen === "object" && !Array.isArray(chosen) && chosen !== null
        ? chosen
        : {};
    const cols = soal.options?.[0]?.cols || [];
    const answerObj =
      typeof soal.answer === "object" && !Array.isArray(soal.answer)
        ? soal.answer
        : {};
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0",
          overflowX: "auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `1fr ${cols.map(() => "80px").join(" ")}`,
            gap: "8px",
            padding: "10px 14px",
            background: "var(--gs-hover)",
            borderRadius: "10px 10px 0 0",
            marginBottom: "2px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "var(--gs-text-muted)",
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            Pernyataan
          </div>
          {cols.map((col) => (
            <div
              key={col}
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "var(--gs-text)",
                textAlign: "center",
              }}
            >
              {col}
            </div>
          ))}
        </div>
        {soal.options?.map((row, rowIdx) => {
          const rowAnswer = answerObj[row.label];
          const rowChosen = chosenObj[row.label];
          return (
            <div
              key={row.label}
              style={{
                display: "grid",
                gridTemplateColumns: `1fr ${cols.map(() => "80px").join(" ")}`,
                gap: "8px",
                padding: "12px 14px",
                background: rowIdx % 2 === 0 ? "var(--gs-surface)" : "var(--gs-surface-subtle)",
                borderRadius:
                  rowIdx === soal.options.length - 1 ? "0 0 10px 10px" : "0",
                border: "1px solid var(--gs-divider)",
                borderTop: "none",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "14px", color: "var(--gs-text)" }}>
                <MathRenderer text={row.text} />
              </div>
              {cols.map((col) => {
                const isSelected = rowChosen === col;
                const isAns = submitted && (isCorrect || alreadyCorrect) && rowAnswer === col;
                const isWrong =
                  submitted &&
                  !isCorrect &&
                  !alreadyCorrect &&
                  isSelected &&
                  col !== rowAnswer;
                let bg = "var(--gs-surface)",
                  border = "2px solid var(--gs-border)",
                  color = "var(--gs-text-muted)";
                if (!submitted) {
                  if (isSelected) {
                    bg = "#fff3f0";
                    border = "2px solid #e84c2b";
                    color = "#e84c2b";
                  }
                } else if (isAns) {
                  bg = "#e4f5f0";
                  border = "2px solid #1a8a6e";
                  color = "#1a8a6e";
                } else if (isWrong) {
                  bg = "#fff3f0";
                  border = "2px solid #e84c2b";
                  color = "#e84c2b";
                } else if (isSelected) {
                  bg = "var(--gs-surface)";
                  border = "2px solid var(--gs-border)";
                  color = "var(--gs-text-muted)";
                }
                return (
                  <div
                    key={col}
                    onClick={() => {
                      if (submitted || alreadyCorrect) return;
                      setChosen((prev) => {
                        const obj =
                          typeof prev === "object" &&
                          !Array.isArray(prev) &&
                          prev !== null
                            ? prev
                            : {};
                        return { ...obj, [row.label]: col };
                      });
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        border,
                        background: bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor:
                          submitted || alreadyCorrect ? "default" : "pointer",
                        transition: "all .15s",
                        fontSize: "13px",
                        fontWeight: "700",
                        color,
                      }}
                    >
                      {isSelected || isAns ? col : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  if (tipe === "menjodohkan") {
    const { left: leftItems, right: rightItems } = normalizeMenjodohkan(
      soal.options
    );
    const rawChosenObj =
      typeof chosen === "object" && !Array.isArray(chosen) && chosen !== null
        ? chosen
        : {};
    const answerObj =
      typeof soal.answer === "object" &&
      !Array.isArray(soal.answer) &&
      soal.answer !== null
        ? soal.answer
        : {};
    // When already correct (revisiting), show the correct answer as the displayed pairing
    const chosenObj = alreadyCorrect && Object.keys(rawChosenObj).length === 0
      ? answerObj
      : rawChosenObj;

    const handleLeftClick = (li) => {
      if (submitted || alreadyCorrect) return;
      setSelectedLeft((prev) => (prev === li ? null : li));
    };

    const handleRightClick = (ri) => {
      if (submitted || alreadyCorrect || selectedLeft === null) return;
      setChosen((prev) => {
        const obj =
          typeof prev === "object" && !Array.isArray(prev) && prev !== null
            ? prev
            : {};
        const newObj = { ...obj };
        Object.keys(newObj).forEach((k) => {
          if (newObj[k] === String(ri)) delete newObj[k];
        });
        if (newObj[String(selectedLeft)] === String(ri)) {
          delete newObj[String(selectedLeft)];
        } else {
          newObj[String(selectedLeft)] = String(ri);
        }
        return newObj;
      });
      setSelectedLeft(null);
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {!submitted && !alreadyCorrect && (
          <div style={{ fontSize: "13px", color: "var(--gs-text-muted)" }}>
            {selectedLeft !== null
              ? "Klik opsi di kanan untuk memasangkan."
              : "Klik item kiri, lalu klik pasangannya di kanan."}
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            alignItems: "start",
          }}
        >
          {/* Kolom kiri */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {leftItems.map((leftText, li) => {
              const isSelected = selectedLeft === li;
              const pairedRi =
                chosenObj[String(li)] !== undefined
                  ? parseInt(chosenObj[String(li)])
                  : null;
              const isPaired = pairedRi !== null;
              const isCorrectPair = submitted && String(answerObj[String(li)]) === String(pairedRi);
              const isWrongPair = submitted && isPaired && !isCorrectPair;

              let border = "1px solid var(--gs-border)", bg = "var(--gs-surface)";
              if (submitted) {
                if (isCorrectPair) { border = "2px solid #1a8a6e"; bg = "#e4f5f0"; }
                else if (isWrongPair) { border = "2px solid #e84c2b"; bg = "#fff3f0"; }
              } else {
                if (isSelected) { border = "2px solid #e84c2b"; bg = "#fff3f0"; }
                else if (isPaired) { border = "2px solid #2563eb"; bg = "#eff6ff"; }
              }

              return (
                <div
                  key={li}
                  onClick={() => handleLeftClick(li)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border,
                    background: bg,
                    cursor: submitted || alreadyCorrect ? "default" : "pointer",
                    transition: "all .15s",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "var(--gs-text-hint)",
                      flexShrink: 0,
                    }}
                  >
                    {li + 1}.
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--gs-text)",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <MathRenderer text={leftText} />
                  </span>
                  {isPaired && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "2px 7px",
                        borderRadius: "6px",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                        background: isCorrectPair
                          ? "#1a8a6e"
                          : isWrongPair
                          ? "#e84c2b"
                          : "#2563eb",
                        color: "white",
                      }}
                    >
                      → {String.fromCharCode(65 + pairedRi)}
                      {isCorrectPair && " ✓"}
                      {isWrongPair && " ✗"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Kolom kanan */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {rightItems.map((rightText, ri) => {
              const pairedByLeftIdx = Object.entries(chosenObj).find(
                ([, v]) => parseInt(v) === ri
              );
              const isPaired = !!pairedByLeftIdx;
              const pairedLi = pairedByLeftIdx
                ? parseInt(pairedByLeftIdx[0])
                : null;
              const isCorrectPair = submitted && isPaired && String(answerObj[String(pairedLi)]) === String(ri);
              const isWrongPair = submitted && isPaired && !isCorrectPair;
              let border = "1px solid var(--gs-border)", bg = "var(--gs-surface)", color = "var(--gs-text)", opacity = 1;
              if (submitted) {
                if (isCorrectPair) { border = "2px solid #1a8a6e"; bg = "#e4f5f0"; color = "#1a8a6e"; }
                else if (isWrongPair) { border = "2px solid #e84c2b"; bg = "#fff3f0"; color = "#e84c2b"; }
              } else {
                if (isPaired) { border = "2px solid #2563eb"; bg = "#eff6ff"; color = "#2563eb"; }
                else if (selectedLeft !== null) { opacity = 0.8; }
                else { opacity = 0.5; }
              }

              return (
                <div
                  key={ri}
                  onClick={() => handleRightClick(ri)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border,
                    background: bg,
                    opacity,
                    cursor:
                      submitted || alreadyCorrect
                        ? "default"
                        : selectedLeft !== null
                        ? "pointer"
                        : "default",
                    transition: "all .15s",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "var(--gs-text-hint)",
                      flexShrink: 0,
                    }}
                  >
                    {String.fromCharCode(65 + ri)}.
                  </span>
                  <span
                    style={{ fontSize: "13px", color, flex: 1, minWidth: 0 }}
                  >
                    <MathRenderer text={rightText} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {!submitted && (
          <div style={{ fontSize: "12px", color: "var(--gs-text-hint)" }}>
            {Object.keys(chosenObj).length} / {leftItems.length} dipasangkan
          </div>
        )}
        {submitted && (
          <div
            style={{
              background: isCorrect ? "#e4f5f0" : "#fff3f0",
              border: `1px solid ${isCorrect ? "#9FE1CB" : "#fca5a5"}`,
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: "600",
              color: isCorrect ? "#0F6E56" : "#b91c1c",
            }}
          >
            {isCorrect || alreadyCorrect
              ? "Semua pasangan benar!"
              : "Ada pasangan yang kurang tepat."}
          </div>
        )}
      </div>
    );
  }

  if (tipe === "isian_multi") {
    const opts = Array.isArray(soal.options) ? soal.options : [];
    const chosenMulti =
      typeof chosen === "object" && !Array.isArray(chosen) && chosen !== null
        ? chosen
        : {};

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {opts.map((opt, idx) => (
          <div
            key={idx}
            style={{ display: "flex", flexDirection: "column", gap: "6px" }}
          >
            {opt.label && (
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--gs-text)",
                }}
              >
                {opt.label}
              </label>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="number"
                inputMode="decimal"
                value={chosenMulti[idx] || ""}
                onChange={(e) => {
                  if (submitted || alreadyCorrect) return;
                  setChosen({ ...chosenMulti, [idx]: e.target.value });
                }}
                disabled={submitted || alreadyCorrect}
                placeholder="Tulis jawaban angka..."
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  borderRadius: "12px",
                  fontSize: "16px",
                  outline: "none",
                  fontFamily: "inherit",
                  color: "var(--gs-text)",
                  border: !submitted
                    ? "2px solid var(--gs-border)"
                    : isCorrect || alreadyCorrect
                    ? "2px solid #1a8a6e"
                    : "2px solid #e84c2b",
                  background: !submitted
                    ? "var(--gs-input-bg)"
                    : isCorrect || alreadyCorrect
                    ? "#e4f5f0"
                    : "#fff3f0",
                }}
                onFocus={(e) => {
                  if (!submitted) e.target.style.borderColor = "#e84c2b";
                }}
                onBlur={(e) => {
                  if (!submitted) e.target.style.borderColor = "var(--gs-border)";
                }}
              />
              {opt.satuan && (
                <span
                  style={{ fontSize: "14px", color: "var(--gs-text-muted)", flexShrink: 0 }}
                >
                  {opt.satuan}
                </span>
              )}
            </div>
          </div>
        ))}
        {submitted && !isCorrect && !alreadyCorrect && (
          <div
            style={{ fontSize: "13px", color: "#e84c2b", fontWeight: "600" }}
          >
            Jawaban kurang tepat, coba lagi.
          </div>
        )}
      </div>
    );
  }

  return null;
}
