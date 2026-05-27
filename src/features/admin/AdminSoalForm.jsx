// src/features/admin/AdminSoalForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, ChevronDown, Sparkles } from "lucide-react";
import api from "../../lib/api";
import MathRenderer from "../../components/MathRenderer";
import MarkdownEditor from "../../components/MarkdownEditor";
import AdminSoalAI from "./AdminSoalAI";

const LABELS = ["A", "B", "C", "D", "E"];
const emptyOption = (label) => ({ label, text: "" });
const defaultForm = {
  subtopik_id: "",
  body: "",
  options: LABELS.slice(0, 4).map(emptyOption),
  answer: "",
  explanation: "",
  difficulty: 1,
  video_url: "",
};

const DIFFICULTY_MAP = {
  1: { label: "Easy", color: "#1a8a6e", bg: "#e4f5f0" },
  2: { label: "Medium", color: "#854F0B", bg: "#faeeda" },
  3: { label: "Hard", color: "#e84c2b", bg: "#fff3f0" },
};

function Select({ label, value, onChange, options, placeholder, disabled }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          style={{
            width: "100%",
            padding: "10px 36px 10px 14px",
            borderRadius: "10px",
            border: "1px solid #e2ddd5",
            fontSize: "14px",
            color: value ? "#0f0e17" : "#b4b2a9",
            background: "white",
            appearance: "none",
            outline: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#6b6860",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

const getYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

function PreviewPanel({ form }) {
  const diff = DIFFICULTY_MAP[form.difficulty] || DIFFICULTY_MAP[1];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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

      {/* Pilihan */}
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
          Pilihan Jawaban
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {form.options.map((opt) => {
            const isAnswer = form.answer === opt.label;
            return (
              <div
                key={opt.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: isAnswer ? "2px solid #1a8a6e" : "1px solid #e2ddd5",
                  background: isAnswer ? "#e4f5f0" : "white",
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
                    color: isAnswer ? "#1a8a6e" : "#6b6860",
                  }}
                >
                  {opt.label}
                </span>
                <span style={{ fontSize: "14px", color: "#0f0e17", flex: 1 }}>
                  {opt.text ? (
                    <MathRenderer text={opt.text} />
                  ) : (
                    <span style={{ color: "#b4b2a9", fontStyle: "italic" }}>
                      Pilihan {opt.label} belum diisi...
                    </span>
                  )}
                </span>
                {isAnswer && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#1a8a6e",
                      flexShrink: 0,
                    }}
                  >
                    ✓ Benar
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

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

export default function AdminSoalForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState(defaultForm);
  const [struktur, setStruktur] = useState({
    jenjang: [],
    subjenjang: [],
    mapel: [],
    topik: [],
    subtopik: [],
  });
  const [selected, setSelected] = useState({
    jenjang: "",
    subjenjang: "",
    mapel: "",
    topik: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingStruktur, setLoadingStruktur] = useState(true);
  const [error, setError] = useState("");
  const [generatingExplanation, setGeneratingExplanation] = useState(false);

  useEffect(() => {
    api
      .get("/admin/struktur")
      .then((data) => setStruktur(data))
      .catch(() => setError("Gagal memuat struktur"))
      .finally(() => setLoadingStruktur(false));
  }, []);

  useEffect(() => {
    if (!isEdit || !struktur.subtopik.length) return;
    api
      .get(`/admin/soal/detail?id=${id}`)
      .then((data) => {
        setForm({
          subtopik_id: data.subtopik_id,
          body: data.body,
          options: data.options,
          answer: data.answer,
          explanation: data.explanation || "",
          difficulty: data.difficulty,
          video_url: data.video_url || "",
        });
        const subtopik = struktur.subtopik.find(
          (s) => s.id == data.subtopik_id
        );
        if (subtopik) {
          const topik = struktur.topik.find((t) => t.id == subtopik.topik_id);
          if (topik) {
            const mapel = struktur.mapel.find((m) => m.id == topik.mapel_id);
            if (mapel) {
              const sj = struktur.subjenjang.find(
                (s) => s.id == mapel.subjenjang_id
              );
              if (sj)
                setSelected({
                  jenjang: sj.jenjang_id,
                  subjenjang: sj.id,
                  mapel: mapel.id,
                  topik: topik.id,
                });
            }
          }
        }
      })
      .catch(() => setError("Gagal memuat soal"));
  }, [id, struktur.subtopik.length]);

  const filteredSubjenjang = struktur.subjenjang.filter(
    (s) => s.jenjang_id == selected.jenjang
  );
  const filteredMapel = struktur.mapel.filter(
    (m) => m.subjenjang_id == selected.subjenjang
  );
  const filteredTopik = struktur.topik.filter(
    (t) => t.mapel_id == selected.mapel
  );
  const filteredSubtopik = struktur.subtopik.filter(
    (s) => s.topik_id == selected.topik
  );

  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = { ...newOptions[index], text: value };
    setForm((f) => ({ ...f, options: newOptions }));
  };

  const addOption = () => {
    if (form.options.length >= 5) return;
    setForm((f) => ({
      ...f,
      options: [...f.options, emptyOption(LABELS[f.options.length])],
    }));
  };

  const removeOption = (index) => {
    if (form.options.length <= 2) return;
    const newOptions = form.options
      .filter((_, i) => i !== index)
      .map((o, i) => ({ ...o, label: LABELS[i] }));
    setForm((f) => ({
      ...f,
      options: newOptions,
      answer: f.answer === form.options[index].label ? "" : f.answer,
    }));
  };

  const handleGenerateExplanation = async () => {
    if (!form.body || !form.answer || form.options.some((o) => !o.text)) return;
    setGeneratingExplanation(true);
    try {
      const optionsText = form.options
        .map((o) => `${o.label}. ${o.text}`)
        .join("\n");
      const prompt = `Kamu adalah guru matematika profesional untuk siswa Indonesia.

Berikut adalah soal matematika beserta pilihan jawabannya:

SOAL:
${form.body}

PILIHAN JAWABAN:
${optionsText}

JAWABAN BENAR: ${form.answer}

Buat pembahasan langkah per langkah yang jelas dan mudah dipahami untuk soal ini.
Gunakan LaTeX untuk rumus matematika dengan format $...$ untuk inline dan $$...$$ untuk display.
Gunakan markdown untuk formatting (bold, list, dll).

OUTPUT HANYA pembahasan saja dalam format teks, tanpa JSON, tanpa preamble apapun.`;

      const result = await api.post("/admin/ai/generate", { prompt });
      const text = result.text || result.parsed?.explanation || "";
      if (text) setForm((f) => ({ ...f, explanation: text.trim() }));
    } catch {
      alert("Gagal generate pembahasan. Coba lagi.");
    } finally {
      setGeneratingExplanation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.subtopik_id) {
      setError("Pilih subtopik terlebih dahulu");
      return;
    }
    if (!form.body.trim()) {
      setError("Isi soal tidak boleh kosong");
      return;
    }
    if (form.options.some((o) => !o.text.trim())) {
      setError("Semua pilihan jawaban harus diisi");
      return;
    }
    if (!form.answer) {
      setError("Pilih jawaban yang benar");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/admin/soal?id=${id}`, form);
      } else {
        await api.post("/admin/soal", form);
      }
      navigate("/admin/soal");
    } catch (err) {
      setError(err.error || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const canGenerateExplanation =
    form.body.trim() && form.answer && form.options.every((o) => o.text.trim());

  return (
    <div>
      {/* Header */}
      <div
        style={{
          marginBottom: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "#0f0e17",
              letterSpacing: "-0.5px",
              marginBottom: "4px",
            }}
          >
            {isEdit ? "Edit Soal" : "Tambah Soal"}
          </h1>
          <p style={{ fontSize: "14px", color: "#6b6860" }}>
            {isEdit
              ? "Ubah soal yang sudah ada"
              : "Tambahkan soal baru ke bank soal"}
          </p>
        </div>
        <AdminSoalAI
          form={form}
          setForm={setForm}
          struktur={struktur}
          selected={selected}
        />
      </div>

      {error && (
        <div
          style={{
            background: "#fff3f0",
            border: "1px solid #fca5a5",
            color: "#b91c1c",
            fontSize: "14px",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "24px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Kiri — Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {/* Lokasi soal */}
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
                fontSize: "14px",
                fontWeight: "700",
                color: "#0f0e17",
                marginBottom: "16px",
              }}
            >
              Lokasi Soal
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <Select
                label="Jenjang"
                value={selected.jenjang}
                onChange={(v) =>
                  setSelected({
                    jenjang: v,
                    subjenjang: "",
                    mapel: "",
                    topik: "",
                  })
                }
                options={struktur.jenjang.map((j) => ({
                  value: j.id,
                  label: j.nama,
                }))}
                placeholder="Pilih jenjang"
                disabled={loadingStruktur}
              />
              <Select
                label="Subjenjang"
                value={selected.subjenjang}
                onChange={(v) =>
                  setSelected((s) => ({
                    ...s,
                    subjenjang: v,
                    mapel: "",
                    topik: "",
                  }))
                }
                options={filteredSubjenjang.map((j) => ({
                  value: j.id,
                  label: j.nama,
                }))}
                placeholder="Pilih subjenjang"
                disabled={!selected.jenjang}
              />
              <Select
                label="Mata Pelajaran"
                value={selected.mapel}
                onChange={(v) =>
                  setSelected((s) => ({ ...s, mapel: v, topik: "" }))
                }
                options={filteredMapel.map((m) => ({
                  value: m.id,
                  label: m.nama,
                }))}
                placeholder="Pilih mapel"
                disabled={!selected.subjenjang}
              />
              <Select
                label="Topik"
                value={selected.topik}
                onChange={(v) => setSelected((s) => ({ ...s, topik: v }))}
                options={filteredTopik.map((t) => ({
                  value: t.id,
                  label: t.nama,
                }))}
                placeholder="Pilih topik"
                disabled={!selected.mapel}
              />
              <div style={{ gridColumn: "1 / -1" }}>
                <Select
                  label="Subtopik"
                  value={form.subtopik_id}
                  onChange={(v) => setForm((f) => ({ ...f, subtopik_id: v }))}
                  options={filteredSubtopik.map((s) => ({
                    value: s.id,
                    label: s.nama,
                  }))}
                  placeholder="Pilih subtopik"
                  disabled={!selected.topik}
                />
              </div>
            </div>
          </div>

          {/* Body soal */}
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
                fontSize: "14px",
                fontWeight: "700",
                color: "#0f0e17",
                marginBottom: "16px",
              }}
            >
              Soal
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#0f0e17",
                  }}
                >
                  Teks Soal
                </label>
                <MarkdownEditor
                  value={form.body}
                  onChange={(v) => setForm((f) => ({ ...f, body: v }))}
                  placeholder="Tulis soal... Gunakan $...$ untuk LaTeX inline, $$...$$ untuk display"
                  rows={4}
                />
              </div>

              {/* Difficulty */}
              <div>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#0f0e17",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Tingkat Kesulitan
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[
                    { value: 1, label: "Easy", color: "#1a8a6e" },
                    { value: 2, label: "Medium", color: "#f5a623" },
                    { value: 3, label: "Hard", color: "#e84c2b" },
                  ].map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, difficulty: d.value }))
                      }
                      style={{
                        padding: "8px 16px",
                        borderRadius: "10px",
                        border: `2px solid ${
                          form.difficulty === d.value ? d.color : "#e2ddd5"
                        }`,
                        background:
                          form.difficulty === d.value
                            ? d.color + "18"
                            : "white",
                        color:
                          form.difficulty === d.value ? d.color : "#6b6860",
                        fontWeight: "700",
                        fontSize: "13px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all .15s",
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pilihan jawaban */}
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
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#0f0e17",
                }}
              >
                Pilihan Jawaban
              </div>
              {form.options.length < 5 && (
                <button
                  type="button"
                  onClick={addOption}
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
                  }}
                >
                  <Plus size={14} /> Tambah Pilihan
                </button>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              {form.options.map((opt, i) => (
                <div
                  key={opt.label}
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background:
                        form.answer === opt.label ? "#e84c2b" : "#f2efe8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: form.answer === opt.label ? "white" : "#6b6860",
                      fontWeight: "700",
                      fontSize: "13px",
                      flexShrink: 0,
                    }}
                  >
                    {opt.label}
                  </div>
                  <input
                    value={opt.text}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
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
                      onClick={() => removeOption(i)}
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

            {/* Jawaban benar */}
            <div>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f0e17",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Jawaban Benar
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {form.options.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, answer: opt.label }))
                    }
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      border: `2px solid ${
                        form.answer === opt.label ? "#1a8a6e" : "#e2ddd5"
                      }`,
                      background:
                        form.answer === opt.label ? "#e4f5f0" : "white",
                      color: form.answer === opt.label ? "#1a8a6e" : "#6b6860",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all .15s",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

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
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#0f0e17",
                }}
              >
                Pembahasan{" "}
                <span
                  style={{
                    fontWeight: "400",
                    color: "#6b6860",
                    fontSize: "13px",
                  }}
                >
                  (opsional)
                </span>
              </div>
              {canGenerateExplanation && (
                <button
                  type="button"
                  onClick={handleGenerateExplanation}
                  disabled={generatingExplanation}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    border: "1px solid #e2ddd5",
                    background: "white",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: generatingExplanation ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    color: "#0f0e17",
                    transition: "all .15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!generatingExplanation)
                      e.currentTarget.style.background = "#f2efe8";
                  }}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  {generatingExplanation ? (
                    <>
                      <span
                        style={{
                          width: "12px",
                          height: "12px",
                          border: "2px solid #e2ddd5",
                          borderTopColor: "#6b6860",
                          borderRadius: "50%",
                          animation: "spin 0.7s linear infinite",
                          display: "block",
                        }}
                      />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} color="#e84c2b" />
                      Generate Pembahasan
                    </>
                  )}
                </button>
              )}
            </div>
            <MarkdownEditor
              value={form.explanation}
              onChange={(v) => setForm((f) => ({ ...f, explanation: v }))}
              placeholder="Tulis pembahasan langkah per langkah... Bisa pakai LaTeX dan Markdown"
              rows={5}
            />
          </div>

          {/* Video Pembahasan */}
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
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#0f0e17",
                }}
              >
                Video Pembahasan
              </div>
              <span
                style={{
                  fontWeight: "400",
                  color: "#6b6860",
                  fontSize: "13px",
                }}
              >
                (opsional)
              </span>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f0e17",
                }}
              >
                URL YouTube
              </label>
              <input
                value={form.video_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, video_url: e.target.value }))
                }
                placeholder="https://www.youtube.com/watch?v=..."
                style={{
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
              {form.video_url && getYouTubeId(form.video_url) && (
                <div
                  style={{
                    marginTop: "10px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    aspectRatio: "16/9",
                  }}
                >
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${getYouTubeId(
                      form.video_url
                    )}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ display: "block" }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div
            style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              onClick={() => navigate("/admin/soal")}
              style={{
                padding: "11px 24px",
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
              type="submit"
              disabled={loading}
              style={{
                padding: "11px 24px",
                borderRadius: "10px",
                border: "none",
                background: loading ? "#f5a07a" : "#e84c2b",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                minWidth: "120px",
              }}
            >
              {loading
                ? "Menyimpan..."
                : isEdit
                ? "Simpan Perubahan"
                : "Tambah Soal"}
            </button>
          </div>
        </form>

        {/* Kanan — Preview */}
        <div style={{ position: "sticky", top: "24px" }}>
          <PreviewPanel form={form} />
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
