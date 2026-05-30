// src/features/admin/AdminSoalImport.jsx
import { useState } from "react";
import { Upload, X } from "lucide-react";

export default function AdminSoalImport({ setForm, isMobile }) {
  const [open, setOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");

  const handleImport = () => {
    setError("");
    if (!jsonInput.trim()) {
      setError("Paste JSON dulu sebelum import");
      return;
    }
    try {
      let text = jsonInput.trim();
      text = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      text = text.replace(/\\([a-zA-Z])/g, "\\\\$1");
      const parsed = JSON.parse(text);
      if (!parsed.body || !parsed.options || !parsed.answer) {
        setError("JSON tidak lengkap — harus ada body, options, dan answer");
        return;
      }
      setForm((f) => ({
        ...f,
        body: parsed.body,
        options: parsed.options,
        answer: parsed.answer,
        explanation: parsed.explanation || "",
      }));
      setOpen(false);
      setJsonInput("");
    } catch {
      setError(
        "Format JSON tidak valid. Pastikan JSON yang dipaste sudah benar."
      );
    }
  };

  const handleClose = () => {
    setOpen(false);
    setJsonInput("");
    setError("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "10px 18px",
          borderRadius: "10px",
          border: "1px solid #e2ddd5",
          background: "white",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
          fontFamily: "inherit",
          color: "#0f0e17",
          transition: "all .15s",
          width: isMobile ? "100%" : "auto",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f2efe8";
          e.currentTarget.style.borderColor = "#0f0e17";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "white";
          e.currentTarget.style.borderColor = "#e2ddd5";
        }}
      >
        <Upload size={15} />
        Import JSON
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: isMobile ? "20px 16px" : "28px",
              maxWidth: "480px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Upload size={18} color="#0f0e17" />
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: "800",
                    color: "#0f0e17",
                  }}
                >
                  Import JSON
                </h3>
              </div>
              <button
                onClick={handleClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b6860",
                  display: "flex",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Penjelasan */}
            <div
              style={{
                fontSize: "13px",
                color: "#6b6860",
                lineHeight: "1.6",
                marginBottom: "16px",
              }}
            >
              Paste response JSON dari AI lain (ChatGPT, Claude, Gemini, dll) di
              bawah ini. Gunakan fitur <strong>Generate dengan AI</strong> untuk
              mendapatkan prompt yang bisa dicopy ke AI lain.
            </div>

            {/* Format contoh */}
            <pre
              style={{
                background: "#f2efe8",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "11px",
                color: "#6b6860",
                overflowX: "auto",
                lineHeight: "1.6",
                margin: "0 0 16px 0",
              }}
            >
              {`{
  "body": "teks soal...",
  "options": [
    {"label": "A", "text": "..."},
    {"label": "B", "text": "..."}
  ],
  "answer": "A",
  "explanation": "pembahasan..."
}`}
            </pre>

            {/* Textarea */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                marginBottom: "16px",
              }}
            >
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f0e17",
                }}
              >
                Paste JSON di sini
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"body": "...", "options": [...], "answer": "A", "explanation": "..."}'
                rows={8}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #e2ddd5",
                  fontSize: "13px",
                  outline: "none",
                  fontFamily: "monospace",
                  color: "#0f0e17",
                  resize: "vertical",
                  lineHeight: "1.6",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
              />
            </div>

            {error && (
              <div
                style={{
                  background: "#fff3f0",
                  border: "1px solid #fca5a5",
                  color: "#b91c1c",
                  fontSize: "13px",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                }}
              >
                {error}
              </div>
            )}

            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: "9px 20px",
                  borderRadius: "10px",
                  border: "1px solid #e2ddd5",
                  background: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: "#0f0e17",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={!jsonInput.trim()}
                style={{
                  padding: "9px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: !jsonInput.trim() ? "#e2ddd5" : "#0f0e17",
                  color: !jsonInput.trim() ? "#b4b2a9" : "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: !jsonInput.trim() ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Upload size={15} /> Import ke Form
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
