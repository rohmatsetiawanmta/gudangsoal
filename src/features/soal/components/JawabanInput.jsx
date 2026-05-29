import MathRenderer from "../../../components/MathRenderer";

export default function JawabanInput({
  soal,
  chosen,
  setChosen,
  submitted,
  alreadyCorrect,
  isCorrect,
}) {
  const tipe = soal?.tipe || "pilihan_ganda";

  if (tipe === "pilihan_ganda") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {soal.options?.map((opt) => {
          const isChosen = chosen === opt.label;
          const isAnswer =
            (isCorrect || alreadyCorrect) && opt.label === soal.answer;
          const isWrong =
            submitted && !isCorrect && !alreadyCorrect && opt.label === chosen;
          let border = "1px solid #e2ddd5",
            bg = "white",
            labelColor = "#6b6860";
          if (!submitted) {
            if (isChosen) {
              border = "2px solid #e84c2b";
              bg = "#fff3f0";
              labelColor = "#e84c2b";
            }
          } else if (isAnswer) {
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
              <span style={{ fontSize: "15px", color: "#0f0e17", flex: 1 }}>
                <MathRenderer text={opt.text} />
              </span>
              {submitted && isAnswer && (
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
            color: "#0f0e17",
            border: !submitted
              ? "2px solid #e2ddd5"
              : isCorrect || alreadyCorrect
              ? "2px solid #1a8a6e"
              : "2px solid #e84c2b",
            background: !submitted
              ? "white"
              : isCorrect || alreadyCorrect
              ? "#e4f5f0"
              : "#fff3f0",
          }}
          onFocus={(e) => {
            if (!submitted) e.target.style.borderColor = "#e84c2b";
          }}
          onBlur={(e) => {
            if (!submitted) e.target.style.borderColor = "#e2ddd5";
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
          style={{ fontSize: "13px", color: "#6b6860", marginBottom: "4px" }}
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
          let border = "1px solid #e2ddd5",
            bg = "white",
            checkBg = "white",
            checkBorder = "#e2ddd5",
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
                  color: "#6b6860",
                  flexShrink: 0,
                }}
              >
                {opt.label}
              </span>
              <span style={{ fontSize: "15px", color: "#0f0e17", flex: 1 }}>
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
            background: "#f2efe8",
            borderRadius: "10px 10px 0 0",
            marginBottom: "2px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#6b6860",
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
                color: "#0f0e17",
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
                background: rowIdx % 2 === 0 ? "white" : "#faf9f6",
                borderRadius:
                  rowIdx === soal.options.length - 1 ? "0 0 10px 10px" : "0",
                border: "1px solid #f2efe8",
                borderTop: "none",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "14px", color: "#0f0e17" }}>
                <MathRenderer text={row.text} />
              </div>
              {cols.map((col) => {
                const isSelected = rowChosen === col;
                const isAns =
                  (isCorrect || alreadyCorrect) && rowAnswer === col;
                const isWrong =
                  submitted &&
                  !isCorrect &&
                  !alreadyCorrect &&
                  isSelected &&
                  col !== rowAnswer;
                let bg = "white",
                  border = "2px solid #e2ddd5",
                  color = "#6b6860";
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
                  bg = "white";
                  border = "2px solid #e2ddd5";
                  color = "#6b6860";
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

  return null;
}
