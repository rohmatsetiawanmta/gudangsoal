// src/features/admin/soal-form/FormSections/Pembahasan.jsx
import { useState, useEffect, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import MarkdownEditor from "../../../../components/MarkdownEditor";

function parseStructured(text) {
  if (!text) return null;
  try {
    const p = typeof text === "string" ? JSON.parse(text) : text;
    if (p && Array.isArray(p.steps)) return p;
  } catch { /* diabaikan: best-effort, boleh gagal senyap */ }
  return null;
}

export default function Pembahasan({ form, setForm }) {
  const initialized = useRef(false);
  const [mode, setMode] = useState("plain");
  const [steps, setSteps] = useState([{ title: "", content: "" }]);
  const [recap, setRecap] = useState("");

  // On edit load, detect format from first non-empty explanation
  useEffect(() => {
    if (form.explanation && !initialized.current) {
      initialized.current = true;
      const p = parseStructured(form.explanation);
      if (p) {
        const s = p.steps?.length ? p.steps : [{ title: "", content: "" }];
        const r = p.recap || "";
        setMode("structured");
        setSteps(s);
        setRecap(r);
        // Normalize: if explanation was an object, re-serialize to string
        if (typeof form.explanation !== "string") {
          syncStructured(s, r);
        }
      }
    }
  }, [form.explanation]);

  const syncStructured = (s, r) => {
    setForm(f => ({ ...f, explanation: JSON.stringify({ steps: s, recap: r }) }));
  };

  const handleSwitchToStructured = () => {
    initialized.current = true;
    const existing = form.explanation && !parseStructured(form.explanation) ? form.explanation : "";
    const s = [{ title: "", content: existing }];
    setMode("structured");
    setSteps(s);
    setRecap("");
    syncStructured(s, "");
  };

  const handleSwitchToPlain = () => {
    initialized.current = true;
    setMode("plain");
    setForm(f => ({ ...f, explanation: "" }));
  };

  const updateStep = (i, field, value) => {
    const s = steps.map((st, idx) => idx === i ? { ...st, [field]: value } : st);
    setSteps(s);
    syncStructured(s, recap);
  };

  const addStep = () => {
    const s = [...steps, { title: "", content: "" }];
    setSteps(s);
    syncStructured(s, recap);
  };

  const removeStep = (i) => {
    const s = steps.filter((_, idx) => idx !== i);
    setSteps(s);
    syncStructured(s, recap);
  };

  const updateRecap = (v) => {
    setRecap(v);
    syncStructured(steps, v);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Mode toggle */}
      <div style={{ display: "flex", gap: "4px", padding: "3px", background: "#f2efe8", borderRadius: "10px", alignSelf: "flex-start" }}>
        <button
          type="button"
          onClick={mode === "structured" ? handleSwitchToPlain : undefined}
          style={{
            padding: "6px 14px", borderRadius: "8px", border: "none",
            fontSize: "12px", fontWeight: "600", cursor: mode === "structured" ? "pointer" : "default",
            fontFamily: "inherit",
            background: mode === "plain" ? "white" : "transparent",
            color: mode === "plain" ? "#0f0e17" : "#6b6860",
            boxShadow: mode === "plain" ? "0 1px 3px rgba(0,0,0,.08)" : "none",
            transition: "all .15s",
          }}
        >
          Teks Biasa
        </button>
        <button
          type="button"
          onClick={mode === "plain" ? handleSwitchToStructured : undefined}
          style={{
            padding: "6px 14px", borderRadius: "8px", border: "none",
            fontSize: "12px", fontWeight: "600", cursor: mode === "plain" ? "pointer" : "default",
            fontFamily: "inherit",
            background: mode === "structured" ? "white" : "transparent",
            color: mode === "structured" ? "#0f0e17" : "#6b6860",
            boxShadow: mode === "structured" ? "0 1px 3px rgba(0,0,0,.08)" : "none",
            transition: "all .15s",
          }}
        >
          Terstruktur (Steps)
        </button>
      </div>

      {mode === "plain" ? (
        <MarkdownEditor
          value={form.explanation}
          onChange={v => { initialized.current = true; setForm(f => ({ ...f, explanation: v })); }}
          placeholder="Tulis pembahasan langkah per langkah... Bisa pakai LaTeX dan Markdown"
          rows={5}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {steps.map((step, i) => (
            <div key={i} style={{ border: "1px solid #e2ddd5", borderRadius: "10px", overflow: "hidden" }}>
              {/* Step header with number + title input */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "#faf9f6", borderBottom: "1px solid #f0ede6" }}>
                <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#2563eb", color: "white", fontSize: "11px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={step.title}
                  onChange={e => updateStep(i, "title", e.target.value)}
                  placeholder={`Judul langkah ${i + 1}, misal: Langkah ${i + 1}: Cek dimensi matriks`}
                  style={{ flex: 1, border: "none", outline: "none", fontSize: "13px", fontWeight: "600", color: "#0f0e17", background: "transparent", fontFamily: "inherit" }}
                />
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    style={{ width: "24px", height: "24px", borderRadius: "6px", border: "1px solid #fca5a5", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "background .12s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff3f0"}
                  >
                    <Trash2 size={12} color="#e84c2b" />
                  </button>
                )}
              </div>
              {/* Step content */}
              <div style={{ padding: "12px 14px" }}>
                <MarkdownEditor
                  value={step.content}
                  onChange={v => updateStep(i, "content", v)}
                  placeholder="Isi pembahasan langkah ini... (LaTeX & Markdown didukung)"
                  rows={3}
                />
              </div>
            </div>
          ))}

          {/* Add step button */}
          <button
            type="button"
            onClick={addStep}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "9px 16px", borderRadius: "10px", border: "1.5px dashed #d4d0c8", background: "transparent", color: "#6b6860", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#d4d0c8"; e.currentTarget.style.color = "#6b6860"; }}
          >
            <Plus size={14} /> Tambah Langkah
          </button>

          {/* Recap / Kesimpulan */}
          <div style={{ border: "1px solid #9FE1CB", borderRadius: "10px", overflow: "hidden", background: "#f0faf7" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid #9FE1CB", fontSize: "12px", fontWeight: "700", color: "#1a8a6e", letterSpacing: ".06em", textTransform: "uppercase" }}>
              Kesimpulan / Recap
            </div>
            <div style={{ padding: "12px 14px" }}>
              <MarkdownEditor
                value={recap}
                onChange={updateRecap}
                placeholder='Misal: Jadi, hasil dari $AB$ adalah $\begin{bmatrix}...\end{bmatrix}$'
                rows={2}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
