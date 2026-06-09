// src/features/admin/AdminSoalBulkAI.jsx
import { useState } from "react";
import {
  Trash2, ChevronDown, ChevronUp, CheckCircle2, AlertCircle,
  Loader2, Copy, Check, Upload, FileJson, Plus,
} from "lucide-react";
import api from "../../lib/api";
import {
  buildBulkPrompt,
  KONTEKS_OPTIONS, TIPE_OPTIONS, BAHASA_OPTIONS, REFERENSI_OPTIONS,
} from "./AdminSoalAI.prompt";

// ── constants ────────────────────────────────────────────────────────────────

const TIPE_FORMAT_OPTIONS = [
  { value: "pilihan_ganda",       label: "Pilihan Ganda",     desc: "A/B/C/D, satu jawaban benar" },
  { value: "isian_singkat",       label: "Isian Singkat",     desc: "Jawaban teks bebas" },
  { value: "isian_numerik",       label: "Isian Numerik",     desc: "Jawaban harus angka" },
  { value: "checklist",           label: "Checklist",         desc: "Beberapa jawaban benar" },
  { value: "multiple_choice_table", label: "Tabel Pernyataan", desc: "Setiap baris pilih kolom" },
  { value: "menjodohkan",         label: "Menjodohkan",       desc: "Pasangkan dua kolom" },
  { value: "isian_multi",         label: "Isian Multi",       desc: "Beberapa isian terpisah" },
];

const DIFFICULTY_LABELS = { 1: "Easy", 2: "Medium", 3: "Hard" };

// Contoh JSON per tipe (ditampilkan di step paste)
const JSON_EXAMPLE = {
  pilihan_ganda: `[
  {
    "body": "Soal pertama...",
    "options": [
      {"label":"A","text":"jawaban A"},
      {"label":"B","text":"jawaban B"},
      {"label":"C","text":"jawaban C"},
      {"label":"D","text":"jawaban D"}
    ],
    "answer": "A",
    "explanation": "Pembahasan..."
  }
]`,
  isian_singkat: `[
  {
    "body": "Nilai dari $2x + 3 = 11$ adalah ....",
    "options": [],
    "answer": "4",
    "explanation": "Pembahasan..."
  }
]`,
  isian_numerik: `[
  {
    "body": "Jumlah 15 suku pertama barisan tersebut adalah ....",
    "options": [],
    "answer": "495",
    "explanation": "Pembahasan..."
  }
]`,
  checklist: `[
  {
    "body": "Pernyataan yang BENAR adalah ....",
    "options": [
      {"label":"A","text":"pernyataan A"},
      {"label":"B","text":"pernyataan B"},
      {"label":"C","text":"pernyataan C"}
    ],
    "answer": ["A","C"],
    "explanation": "Pembahasan..."
  }
]`,
  multiple_choice_table: `[
  {
    "body": "Tentukan benar/salah setiap pernyataan.",
    "options": [
      {"label":"1","text":"Pernyataan pertama","cols":["Benar","Salah"]},
      {"label":"2","text":"Pernyataan kedua","cols":["Benar","Salah"]}
    ],
    "answer": {"1":"Benar","2":"Salah"},
    "explanation": "Pembahasan..."
  }
]`,
  menjodohkan: `[
  {
    "body": "Jodohkan setiap item.",
    "options": {
      "left": ["Item A","Item B","Item C"],
      "right": ["Pasangan 1","Pasangan 2","Pasangan 3"]
    },
    "answer": {"0":0,"1":2,"2":1},
    "explanation": "Pembahasan..."
  }
]`,
  isian_multi: `[
  {
    "body": "Tentukan suku pertama dan beda dari barisan.",
    "options": [
      {"label":"Suku pertama","satuan":""},
      {"label":"Beda","satuan":""}
    ],
    "answer": ["5","4"],
    "explanation": "Pembahasan..."
  }
]`,
};

// ── helpers ──────────────────────────────────────────────────────────────────

function RadioGroup({ label, options, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>{label}</label>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {options.map((opt) => (
          <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
            style={{ padding: "6px 14px", borderRadius: "8px", border: `1.5px solid ${value === opt.value ? "#e84c2b" : "#e2ddd5"}`, background: value === opt.value ? "#fff3f0" : "white", color: value === opt.value ? "#e84c2b" : "#6b6860", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function parseJsonArray(raw) {
  let text = raw.trim()
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .replace(/```json/gi, "").replace(/```/g, "").trim();
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Tidak ditemukan JSON array dalam teks");
  return JSON.parse(match[0]);
}

function normalizeAnswer(s) {
  if (s.tipe === "checklist") {
    if (typeof s.answer === "string") return [s.answer];
    if (Array.isArray(s.answer)) return s.answer;
    return [];
  }
  return s.answer;
}

// ── SoalCard ─────────────────────────────────────────────────────────────────

function SoalCard({ soal, index, onChange, onDelete, status }) {
  const [expanded, setExpanded] = useState(true);
  const borderColor = status === "saved" ? "#1a8a6e" : status === "error" ? "#e84c2b" : "#e2ddd5";
  const u = (field, val) => onChange(index, { ...soal, [field]: val });

  const bodyPreview = (soal.body || "Soal kosong")
    .replace(/\$.*?\$/g, "[rumus]").substring(0, 80);

  return (
    <div style={{ border: `1.5px solid ${borderColor}`, borderRadius: "12px", background: status === "saved" ? "#f0fdf8" : "white", overflow: "hidden" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: "10px", cursor: "pointer", borderBottom: expanded ? "1px solid #f0ede6" : "none" }} onClick={() => setExpanded(v => !v)}>
        <span style={{ width: "26px", height: "26px", borderRadius: "8px", background: status === "saved" ? "#1a8a6e" : "#e84c2b", color: "white", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{index + 1}</span>
        <div style={{ flex: 1, fontSize: "13px", color: "#0f0e17", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bodyPreview}{soal.body?.length > 80 ? "…" : ""}</div>
        <span style={{ fontSize: "11px", color: "#b4b2a9", background: "#f2efe8", padding: "2px 8px", borderRadius: "99px", flexShrink: 0 }}>{soal.tipe?.replace("_", " ")}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {status === "saved" && <CheckCircle2 size={16} color="#1a8a6e" />}
          {status === "error" && <AlertCircle size={16} color="#e84c2b" />}
          <button type="button" onClick={e => { e.stopPropagation(); onDelete(index); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#b4b2a9", display: "flex", padding: "2px" }}><Trash2 size={14} /></button>
          {expanded ? <ChevronUp size={16} color="#6b6860" /> : <ChevronDown size={16} color="#6b6860" />}
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* body */}
          <Field label="Soal">
            <textarea value={soal.body || ""} onChange={e => u("body", e.target.value)} rows={3} style={taStyle} onFocus={focusRed} onBlur={blurGray} />
          </Field>

          {/* per-tipe options & answer */}
          {soal.tipe === "pilihan_ganda" && <PGFields soal={soal} u={u} />}
          {(soal.tipe === "isian_singkat" || soal.tipe === "isian_numerik") && <IsianFields soal={soal} u={u} />}
          {soal.tipe === "checklist" && <ChecklistFields soal={soal} u={u} />}
          {soal.tipe === "multiple_choice_table" && <MCTFields soal={soal} u={u} />}
          {soal.tipe === "menjodohkan" && <MenjodohkanFields soal={soal} u={u} />}
          {soal.tipe === "isian_multi" && <IsianMultiFields soal={soal} u={u} />}

          {/* explanation */}
          <Field label="Pembahasan (opsional)">
            <textarea value={soal.explanation || ""} onChange={e => u("explanation", e.target.value)} rows={2} style={taStyle} onFocus={focusRed} onBlur={blurGray} />
          </Field>
        </div>
      )}
    </div>
  );
}

// ── per-tipe edit fields ──────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "12px", fontWeight: "600", color: "#6b6860", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</label>
      {children}
    </div>
  );
}

const taStyle = { padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2ddd5", fontSize: "13px", fontFamily: "inherit", lineHeight: "1.6", resize: "vertical", outline: "none", color: "#0f0e17" };
const inStyle = { flex: 1, padding: "7px 10px", borderRadius: "8px", border: "1px solid #e2ddd5", fontSize: "13px", fontFamily: "inherit", outline: "none", color: "#0f0e17" };
const focusRed = e => (e.target.style.borderColor = "#e84c2b");
const blurGray = e => (e.target.style.borderColor = "#e2ddd5");

function PGFields({ soal, u }) {
  const opts = soal.options || [];
  const ans = Array.isArray(soal.answer) ? soal.answer[0] : soal.answer;
  const updateOpt = (i, text) => {
    const n = [...opts]; n[i] = { ...n[i], text }; u("options", n);
  };
  return (
    <Field label="Pilihan Jawaban">
      {opts.map((opt, i) => {
        const lbl = opt.label || String.fromCharCode(65 + i);
        const isAns = ans === lbl || ans === opt.text;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span onClick={() => u("answer", [lbl])} title="Tandai jawaban" style={{ width: "28px", height: "28px", borderRadius: "6px", background: isAns ? "#e84c2b" : "#f2efe8", color: isAns ? "white" : "#6b6860", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>{lbl}</span>
            <input value={opt.text || ""} onChange={e => updateOpt(i, e.target.value)} style={inStyle} onFocus={focusRed} onBlur={blurGray} />
          </div>
        );
      })}
      <p style={{ fontSize: "11px", color: "#b4b2a9", margin: 0 }}>Klik huruf untuk tandai jawaban benar.</p>
    </Field>
  );
}

function IsianFields({ soal, u }) {
  const ans = Array.isArray(soal.answer) ? soal.answer[0] : soal.answer;
  return (
    <Field label="Kunci Jawaban">
      <input value={ans || ""} onChange={e => u("answer", e.target.value)} style={{ ...inStyle, flex: "none" }} onFocus={focusRed} onBlur={blurGray} />
    </Field>
  );
}

function ChecklistFields({ soal, u }) {
  const opts = soal.options || [];
  const ans = Array.isArray(soal.answer) ? soal.answer : [];
  const toggle = (lbl) => {
    const n = ans.includes(lbl) ? ans.filter(a => a !== lbl) : [...ans, lbl].sort();
    u("answer", n);
  };
  const updateOpt = (i, text) => {
    const n = [...opts]; n[i] = { ...n[i], text }; u("options", n);
  };
  return (
    <Field label="Pilihan Jawaban (bisa pilih lebih dari satu)">
      {opts.map((opt, i) => {
        const lbl = opt.label || String.fromCharCode(65 + i);
        const isAns = ans.includes(lbl);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span onClick={() => toggle(lbl)} style={{ width: "28px", height: "28px", borderRadius: "6px", background: isAns ? "#e84c2b" : "#f2efe8", color: isAns ? "white" : "#6b6860", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>{lbl}</span>
            <input value={opt.text || ""} onChange={e => updateOpt(i, e.target.value)} style={inStyle} onFocus={focusRed} onBlur={blurGray} />
          </div>
        );
      })}
      <p style={{ fontSize: "11px", color: "#b4b2a9", margin: 0 }}>Jawaban benar: <strong>{ans.join(", ") || "—"}</strong></p>
    </Field>
  );
}

function MCTFields({ soal, u }) {
  const rows = Array.isArray(soal.options) ? soal.options : [];
  const ans = (typeof soal.answer === "object" && !Array.isArray(soal.answer)) ? soal.answer : {};
  const cols = rows[0]?.cols || ["Benar", "Salah"];
  const updateRow = (i, text) => { const n = [...rows]; n[i] = { ...n[i], text }; u("options", n); };
  const setRowAns = (lbl, col) => u("answer", { ...ans, [lbl]: col });
  return (
    <Field label="Tabel Pernyataan">
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "6px 8px", color: "#6b6860", fontWeight: "600" }}>Pernyataan</th>
              {cols.map(c => <th key={c} style={{ padding: "6px 12px", color: "#6b6860", fontWeight: "600" }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderTop: "1px solid #f0ede6" }}>
                <td style={{ padding: "6px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#b4b2a9", fontSize: "11px", fontWeight: "700", minWidth: "16px" }}>{row.label}</span>
                    <input value={row.text || ""} onChange={e => updateRow(i, e.target.value)} style={{ ...inStyle, flex: 1 }} onFocus={focusRed} onBlur={blurGray} />
                  </div>
                </td>
                {cols.map(c => (
                  <td key={c} style={{ padding: "6px 12px", textAlign: "center" }}>
                    <input type="radio" name={`mct-${soal._key}-${i}`} checked={ans[row.label] === c} onChange={() => setRowAns(row.label, c)} style={{ accentColor: "#e84c2b", width: "16px", height: "16px", cursor: "pointer" }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Field>
  );
}

function MenjodohkanFields({ soal, u }) {
  const opts = (soal.options?.left !== undefined) ? soal.options : { left: [], right: [] };
  const ans = (typeof soal.answer === "object" && !Array.isArray(soal.answer)) ? soal.answer : {};
  const updateLeft = (i, v) => { const l = [...opts.left]; l[i] = v; u("options", { ...opts, left: l }); };
  const updateRight = (i, v) => { const r = [...opts.right]; r[i] = v; u("options", { ...opts, right: r }); };
  const setAns = (li, ri) => u("answer", { ...ans, [String(li)]: ri });
  return (
    <Field label="Pasangan Jawaban">
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "8px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#6b6860" }}>KIRI</span>
          {opts.left.map((item, i) => (
            <input key={i} value={item} onChange={e => updateLeft(i, e.target.value)} style={inStyle} onFocus={focusRed} onBlur={blurGray} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "20px" }}>
          {opts.left.map((_, i) => (
            <select key={i} value={ans[String(i)] ?? ""} onChange={e => setAns(i, Number(e.target.value))} style={{ padding: "7px 4px", borderRadius: "8px", border: "1px solid #e2ddd5", fontSize: "12px", outline: "none", cursor: "pointer" }}>
              <option value="">→</option>
              {opts.right.map((r, ri) => <option key={ri} value={ri}>{ri + 1}</option>)}
            </select>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#6b6860" }}>KANAN</span>
          {opts.right.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "11px", color: "#b4b2a9", minWidth: "14px" }}>{i + 1}.</span>
              <input value={item} onChange={e => updateRight(i, e.target.value)} style={inStyle} onFocus={focusRed} onBlur={blurGray} />
            </div>
          ))}
        </div>
      </div>
    </Field>
  );
}

function IsianMultiFields({ soal, u }) {
  const opts = Array.isArray(soal.options) ? soal.options : [];
  const ans = Array.isArray(soal.answer) ? soal.answer : opts.map(() => "");
  const updateAns = (i, v) => { const n = [...ans]; n[i] = v; u("answer", n); };
  const updateLabel = (i, v) => { const n = [...opts]; n[i] = { ...n[i], label: v }; u("options", n); };
  const updateSatuan = (i, v) => { const n = [...opts]; n[i] = { ...n[i], satuan: v }; u("options", n); };
  const add = () => { u("options", [...opts, { label: "", satuan: "" }]); u("answer", [...ans, ""]); };
  const remove = (i) => { u("options", opts.filter((_, j) => j !== i)); u("answer", ans.filter((_, j) => j !== i)); };
  return (
    <Field label="Sub-jawaban">
      {opts.map((opt, i) => (
        <div key={i} style={{ background: "#faf9f6", borderRadius: "10px", border: "1px solid #e2ddd5", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#6b6860" }}>Sub-jawaban {i + 1}</span>
            {opts.length > 1 && <button type="button" onClick={() => remove(i)} style={{ background: "#fff3f0", border: "1px solid #fca5a5", borderRadius: "6px", cursor: "pointer", padding: "2px 6px", color: "#e84c2b", fontSize: "11px" }}>Hapus</button>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: "8px" }}>
            <div>
              <label style={{ fontSize: "11px", color: "#6b6860", fontWeight: "600" }}>Label</label>
              <input value={opt.label || ""} onChange={e => updateLabel(i, e.target.value)} style={inStyle} onFocus={focusRed} onBlur={blurGray} />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "#6b6860", fontWeight: "600" }}>Jawaban</label>
              <input value={ans[i] || ""} onChange={e => updateAns(i, e.target.value)} style={inStyle} onFocus={focusRed} onBlur={blurGray} />
            </div>
            <div>
              <label style={{ fontSize: "11px", color: "#6b6860", fontWeight: "600" }}>Satuan</label>
              <input value={opt.satuan || ""} onChange={e => updateSatuan(i, e.target.value)} placeholder="cm, kg..." style={inStyle} onFocus={focusRed} onBlur={blurGray} />
            </div>
          </div>
        </div>
      ))}
      {opts.length < 6 && (
        <button type="button" onClick={add} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", color: "#e84c2b", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
          <Plus size={13} /> Tambah Sub-jawaban
        </button>
      )}
    </Field>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminSoalBulkAI({ struktur }) {
  const [step, setStep] = useState("config");

  // Config
  const [subtopikId, setSubtopikId] = useState("");
  const [tipeFormat, setTipeFormat] = useState("pilihan_ganda");
  const [jumlah, setJumlah] = useState(10);
  const [jumlahPilihan, setJumlahPilihan] = useState(4);
  const [difficulty, setDifficulty] = useState(1);
  const [konteks, setKonteks] = useState("sekolah");
  const [tipe, setTipe] = useState("hitungan");
  const [bahasa, setBahasa] = useState("formal");
  const [referensi, setReferensi] = useState("");
  const [instruction, setInstruction] = useState("");

  // Struktur nav
  const [selJenjang, setSelJenjang] = useState("");
  const [selSubjenjang, setSelSubjenjang] = useState("");
  const [selMapel, setSelMapel] = useState("");
  const [selTopik, setSelTopik] = useState("");

  // Paste step
  const [copied, setCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [parseError, setParseError] = useState("");
  const [parseSnippet, setParseSnippet] = useState("");

  // Review
  const [soalList, setSoalList] = useState([]);
  const [cardStatus, setCardStatus] = useState({});
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  // Derived
  const getLabel = (arr, id) => arr.find(x => x.id == id)?.nama || "";
  const jenjang = getLabel(struktur.jenjang, selJenjang);
  const subjenjang = getLabel(struktur.subjenjang, selSubjenjang);
  const mapel = getLabel(struktur.mapel, selMapel);
  const topik = getLabel(struktur.topik, selTopik);
  const subtopik = getLabel(struktur.subtopik, subtopikId);
  const diffLabel = DIFFICULTY_LABELS[difficulty] || "Easy";

  const subjenjangList = struktur.subjenjang.filter(s => s.jenjang_id == selJenjang);
  const mapelList = struktur.mapel.filter(m => m.subjenjang_id == selSubjenjang);
  const topikList = struktur.topik.filter(t => t.mapel_id == selMapel);
  const subtopikList = struktur.subtopik.filter(s => s.topik_id == selTopik);

  // Show jumlahPilihan only for pg/checklist
  const showPilihanOpt = ["pilihan_ganda", "checklist"].includes(tipeFormat);

  const promptArgs = { jenjang, subjenjang, mapel, topik, subtopik, diffLabel, konteks, jumlahPilihan: showPilihanOpt ? jumlahPilihan : 4, tipe, bahasa, referensi, instruction, jumlah, tipeFormat };

  // ── copy prompt ───────────────────────────────────────────────────────────
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(buildBulkPrompt(promptArgs));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ── import ────────────────────────────────────────────────────────────────
  const handleImport = () => {
    setParseError(""); setParseSnippet("");
    if (!jsonInput.trim()) { setParseError("Paste JSON dulu"); return; }
    try {
      const arr = parseJsonArray(jsonInput);
      if (!Array.isArray(arr) || arr.length === 0) throw new Error("Bukan array atau kosong");
      const difficultyMap = { easy: 1, medium: 2, hard: 3, mudah: 1, sedang: 2, sulit: 3, susah: 3 };
      const parseDiff = (val) => {
        if (val === undefined || val === null) return null;
        if (typeof val === "number" && [1, 2, 3].includes(val)) return val;
        return difficultyMap[String(val).toLowerCase()] ?? null;
      };
      const VALID_TIPE = ["pilihan_ganda","isian_singkat","isian_numerik","checklist","multiple_choice_table","menjodohkan","isian_multi"];
      const parseTipe = (val) => {
        if (!val) return null;
        const v = String(val).toLowerCase().replace(/[\s-]/g, "_");
        return VALID_TIPE.includes(v) ? v : null;
      };
      const soal = arr.map((s, i) => {
        const resolvedTipe = parseTipe(s.tipe) ?? tipeFormat;
        return {
        _key: i,
        subtopik_id: Number(subtopikId),
        tipe: resolvedTipe,
        difficulty: parseDiff(s.difficulty) ?? difficulty,
        body: s.body || "",
        options: s.options || [],
        answer: normalizeAnswer({ ...s, tipe: resolvedTipe }),
        explanation: s.explanation || "",
        };
      });
      setSoalList(soal);
      setCardStatus({});
      setSaveError("");
      setStep("review");
    } catch (e) {
      const msg = e.message || "";
      const posMatch = msg.match(/position (\d+)/i) || msg.match(/at (\d+)/i);
      if (posMatch) {
        const pos = Number(posMatch[1]);
        const src = jsonInput.trim().replace(/```json/gi,"").replace(/```/g,"").trim();
        const start = Math.max(0, pos - 40);
        const end = Math.min(src.length, pos + 40);
        const snip = src.slice(start, end);
        setParseSnippet(snip + "\n" + " ".repeat(Math.min(pos - start, 40)) + "^");
      }
      setParseError("JSON tidak valid — " + msg.replace(/^JSON Parse error: /i,"").replace(/^SyntaxError: /i,""));
    }
  };

  // ── review ────────────────────────────────────────────────────────────────
  const handleChange = (i, updated) => setSoalList(list => list.map((s, j) => j === i ? updated : s));
  const handleDelete = (i) => setSoalList(list => list.filter((_, j) => j !== i));

  // ── save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!soalList.length) return;
    setSaving(true); setSaveError("");
    try {
      const res = await api.post("/admin/soal/bulk", { soal: soalList });
      const statusMap = {};
      (res.saved || []).forEach(({ index }) => { statusMap[index] = "saved"; });
      (res.errors || []).forEach(({ index }) => { statusMap[index] = "error"; });
      setCardStatus(statusMap);
      if (!(res.errors || []).length) { setStep("done"); }
      else {
        setSaveError(`${res.total} soal berhasil disimpan, ${res.errors.length} gagal.`);
        setSoalList(list => list.filter((_, i) => statusMap[i] !== "saved"));
        setCardStatus({});
      }
    } catch { setSaveError("Gagal menyimpan. Coba lagi."); }
    finally { setSaving(false); }
  };

  const handleReset = () => {
    setStep("config"); setSoalList([]); setCardStatus({}); setSaveError("");
    setJsonInput(""); setParseError(""); setParseSnippet("");
    setSubtopikId(""); setSelJenjang(""); setSelSubjenjang(""); setSelMapel(""); setSelTopik("");
  };

  const sel = { padding: "9px 12px", borderRadius: "10px", border: "1px solid #e2ddd5", fontSize: "14px", fontFamily: "inherit", color: "#0f0e17", background: "white", outline: "none", width: "100%" };

  return (
    <div style={{ maxWidth: "760px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── config ── */}
      {step === "config" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f0e17", marginBottom: "6px" }}>Bulk Generate Soal</h2>
            <p style={{ fontSize: "14px", color: "#6b6860", lineHeight: "1.6" }}>Konfigurasi → copy prompt → paste ke ChatGPT/Claude/Gemini → import hasilnya.</p>
          </div>

          {/* Subtopik */}
          <div style={{ background: "white", border: "1px solid #e2ddd5", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}>Pilih Subtopik</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { label: "Jenjang", value: selJenjang, list: struktur.jenjang, onChange: v => { setSelJenjang(v); setSelSubjenjang(""); setSelMapel(""); setSelTopik(""); setSubtopikId(""); }, disabled: false },
                { label: "Kelas", value: selSubjenjang, list: subjenjangList, onChange: v => { setSelSubjenjang(v); setSelMapel(""); setSelTopik(""); setSubtopikId(""); }, disabled: !selJenjang },
                { label: "Mata Pelajaran", value: selMapel, list: mapelList, onChange: v => { setSelMapel(v); setSelTopik(""); setSubtopikId(""); }, disabled: !selSubjenjang },
                { label: "Topik", value: selTopik, list: topikList, onChange: v => { setSelTopik(v); setSubtopikId(""); }, disabled: !selMapel },
              ].map(({ label, value, list, onChange, disabled }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#6b6860" }}>{label}</label>
                  <select style={sel} value={value} onChange={e => onChange(e.target.value)} disabled={disabled}>
                    <option value="">-- Pilih --</option>
                    {list.map(x => <option key={x.id} value={x.id}>{x.nama}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#6b6860" }}>Subtopik</label>
              <select style={sel} value={subtopikId} onChange={e => setSubtopikId(e.target.value)} disabled={!selTopik}>
                <option value="">-- Pilih subtopik --</option>
                {subtopikList.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
              </select>
            </div>
          </div>

          {/* Pengaturan */}
          <div style={{ background: "white", border: "1px solid #e2ddd5", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}>Pengaturan Soal</div>

            {/* Tipe Format */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>Tipe Soal</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {TIPE_FORMAT_OPTIONS.map(({ value, label, desc }) => (
                  <button key={value} type="button" onClick={() => setTipeFormat(value)} style={{ padding: "10px 12px", borderRadius: "10px", border: `1.5px solid ${tipeFormat === value ? "#e84c2b" : "#e2ddd5"}`, background: tipeFormat === value ? "#fff3f0" : "white", cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "all .15s" }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: tipeFormat === value ? "#e84c2b" : "#0f0e17" }}>{label}</div>
                    <div style={{ fontSize: "11px", color: tipeFormat === value ? "#e84c2b" : "#b4b2a9", marginTop: "2px" }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Jumlah */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>Jumlah Soal: <span style={{ color: "#e84c2b" }}>{jumlah}</span></label>
              <input type="range" min={5} max={30} step={5} value={jumlah} onChange={e => setJumlah(Number(e.target.value))} style={{ accentColor: "#e84c2b" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#b4b2a9" }}>
                {[5,10,15,20,25,30].map(n => <span key={n}>{n}</span>)}
              </div>
            </div>

            {/* Jumlah pilihan (hanya pg/checklist) */}
            {showPilihanOpt && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>Jumlah Pilihan Jawaban</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setJumlahPilihan(n)} style={{ width: "44px", height: "44px", borderRadius: "10px", border: `1.5px solid ${jumlahPilihan === n ? "#e84c2b" : "#e2ddd5"}`, background: jumlahPilihan === n ? "#fff3f0" : "white", color: jumlahPilihan === n ? "#e84c2b" : "#6b6860", fontWeight: "700", fontSize: "15px", cursor: "pointer", fontFamily: "inherit" }}>{n}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Difficulty */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>Tingkat Kesulitan</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[{v:1,l:"Easy"},{v:2,l:"Medium"},{v:3,l:"Hard"}].map(({v,l}) => (
                  <button key={v} type="button" onClick={() => setDifficulty(v)} style={{ padding: "6px 16px", borderRadius: "8px", border: `1.5px solid ${difficulty === v ? "#e84c2b" : "#e2ddd5"}`, background: difficulty === v ? "#fff3f0" : "white", color: difficulty === v ? "#e84c2b" : "#6b6860", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
                ))}
              </div>
            </div>

            <RadioGroup label="Konteks" options={KONTEKS_OPTIONS} value={konteks} onChange={setKonteks} />
            <RadioGroup label="Tipe Soal (konten)" options={TIPE_OPTIONS} value={tipe} onChange={setTipe} />
            <RadioGroup label="Gaya Bahasa" options={BAHASA_OPTIONS} value={bahasa} onChange={setBahasa} />
            <RadioGroup label="Referensi" options={REFERENSI_OPTIONS} value={referensi} onChange={setReferensi} />

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>Instruksi Tambahan <span style={{ fontWeight: "400", color: "#6b6860" }}>(opsional)</span></label>
              <textarea value={instruction} onChange={e => setInstruction(e.target.value)} placeholder="Contoh: gunakan konteks kehidupan sehari-hari, dll." rows={2} style={{ ...taStyle, resize: "none" }} onFocus={focusRed} onBlur={blurGray} />
            </div>
          </div>

          <button type="button" onClick={() => setStep("paste")} disabled={!subtopikId} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "14px 24px", borderRadius: "12px", border: "none", background: !subtopikId ? "#e2ddd5" : "#0f0e17", color: !subtopikId ? "#b4b2a9" : "white", fontSize: "15px", fontWeight: "700", cursor: !subtopikId ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            <FileJson size={18} /> Lanjut → Buat Soal
          </button>
          {!subtopikId && <p style={{ fontSize: "13px", color: "#b4b2a9", marginTop: "-12px" }}>Pilih subtopik dulu.</p>}
        </div>
      )}

      {/* ── paste ── */}
      {step === "paste" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f0e17", marginBottom: "6px" }}>Buat & Import Soal</h2>
            <p style={{ fontSize: "14px", color: "#6b6860", lineHeight: "1.6" }}>Copy prompt → paste ke <strong>ChatGPT / Claude / Gemini</strong> → copy hasilnya → paste di sini.</p>
          </div>

          {/* Step 1 */}
          <div style={{ background: "white", border: "1px solid #e2ddd5", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#e84c2b", color: "white", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>1</span>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}>Copy Prompt</div>
            </div>
            <p style={{ fontSize: "13px", color: "#6b6860", margin: 0 }}>
              Prompt meminta AI membuat <strong>{jumlah} soal {TIPE_FORMAT_OPTIONS.find(t => t.value === tipeFormat)?.label}</strong> — subtopik <strong>{subtopik}</strong>.
            </p>
            <button type="button" onClick={handleCopyPrompt} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "10px", border: `1.5px solid ${copied ? "#1a8a6e" : "#e2ddd5"}`, background: copied ? "#f0fdf8" : "white", color: copied ? "#1a8a6e" : "#0f0e17", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-start" }}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Prompt disalin!" : "Copy Prompt"}
            </button>
            <p style={{ fontSize: "12px", color: "#b4b2a9", margin: 0 }}>Buka <strong>chatgpt.com</strong>, <strong>claude.ai</strong>, atau <strong>gemini.google.com</strong> → paste → jalankan → copy seluruh respons JSON.</p>
          </div>

          {/* Step 2 */}
          <div style={{ background: "white", border: "1px solid #e2ddd5", borderRadius: "14px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#e84c2b", color: "white", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>2</span>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}>Paste Hasil AI</div>
            </div>

            {/* contoh format */}
            <details style={{ fontSize: "12px", color: "#6b6860" }}>
              <summary style={{ cursor: "pointer", fontWeight: "600", marginBottom: "4px" }}>Lihat contoh format JSON yang diharapkan</summary>
              <pre style={{ margin: "8px 0 0", padding: "10px 12px", background: "#f2efe8", borderRadius: "8px", fontSize: "11px", overflowX: "auto", lineHeight: "1.5", color: "#0f0e17" }}>
                {JSON_EXAMPLE[tipeFormat]}
              </pre>
            </details>

            <textarea
              value={jsonInput}
              onChange={e => { setJsonInput(e.target.value); setParseError(""); setParseSnippet(""); }}
              placeholder="Paste JSON array dari AI di sini..."
              rows={10}
              style={{ ...taStyle, fontSize: "13px", fontFamily: "monospace", border: `1px solid ${parseError ? "#fca5a5" : "#e2ddd5"}` }}
              onFocus={focusRed} onBlur={blurGray}
            />

            {parseError && (
              <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div>{parseError}</div>
                {parseSnippet && <pre style={{ margin: 0, padding: "8px 10px", background: "rgba(0,0,0,0.06)", borderRadius: "6px", fontSize: "12px", fontFamily: "monospace", overflowX: "auto", whiteSpace: "pre", color: "#7f1d1d", lineHeight: "1.5" }}>{parseSnippet}</pre>}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={() => setStep("config")} style={{ padding: "11px 20px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#6b6860" }}>← Kembali</button>
            <button type="button" onClick={handleImport} disabled={!jsonInput.trim()} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "11px 24px", borderRadius: "10px", border: "none", background: !jsonInput.trim() ? "#e2ddd5" : "#e84c2b", color: !jsonInput.trim() ? "#b4b2a9" : "white", fontSize: "15px", fontWeight: "700", cursor: !jsonInput.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              <Upload size={17} /> Import & Review Soal
            </button>
          </div>
        </div>
      )}

      {/* ── review ── */}
      {step === "review" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f0e17", marginBottom: "4px" }}>Review {soalList.length} Soal</h2>
              <p style={{ fontSize: "13px", color: "#6b6860" }}>Subtopik: <strong>{subtopik}</strong> · Tipe: <strong>{TIPE_FORMAT_OPTIONS.find(t => t.value === tipeFormat)?.label}</strong></p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" onClick={() => setStep("paste")} style={{ padding: "9px 18px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#6b6860" }}>← Import Lagi</button>
              <button type="button" onClick={handleSave} disabled={saving || !soalList.length} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 20px", borderRadius: "10px", border: "none", background: saving || !soalList.length ? "#e2ddd5" : "#e84c2b", color: saving || !soalList.length ? "#b4b2a9" : "white", fontSize: "14px", fontWeight: "700", cursor: saving || !soalList.length ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {saving ? <Loader2 size={15} style={{ animation: "spin .7s linear infinite" }} /> : <CheckCircle2 size={15} />}
                {saving ? "Menyimpan..." : `Simpan Semua (${soalList.length})`}
              </button>
            </div>
          </div>

          {saveError && <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "13px", borderRadius: "10px", padding: "12px 16px" }}>{saveError}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {soalList.map((soal, i) => (
              <SoalCard key={soal._key ?? i} soal={soal} index={i} onChange={handleChange} onDelete={handleDelete} status={cardStatus[i]} />
            ))}
          </div>

          {soalList.length > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="button" onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 28px", borderRadius: "12px", border: "none", background: saving ? "#e2ddd5" : "#e84c2b", color: saving ? "#b4b2a9" : "white", fontSize: "15px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {saving ? <Loader2 size={16} style={{ animation: "spin .7s linear infinite" }} /> : <CheckCircle2 size={16} />}
                {saving ? "Menyimpan..." : `Simpan Semua (${soalList.length} soal)`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── done ── */}
      {step === "done" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", padding: "60px 0", textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#f0fdf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={32} color="#1a8a6e" />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f0e17", marginBottom: "8px" }}>Semua soal berhasil disimpan!</div>
            <p style={{ fontSize: "14px", color: "#6b6860" }}>Soal sudah masuk ke database dan siap digunakan.</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button type="button" onClick={handleReset} style={{ padding: "10px 24px", borderRadius: "12px", border: "1px solid #e2ddd5", background: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#0f0e17" }}>Import Lagi</button>
            <a href="/admin/soal" style={{ padding: "10px 24px", borderRadius: "12px", border: "none", background: "#e84c2b", color: "white", fontSize: "14px", fontWeight: "600", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Lihat Semua Soal</a>
          </div>
        </div>
      )}
    </div>
  );
}
