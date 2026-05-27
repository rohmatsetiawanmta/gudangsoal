// src/features/admin/AdminSoalForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import api from "../../lib/api";

const LABELS = ["A", "B", "C", "D", "E"];

const emptyOption = (label) => ({ label, text: "" });

const defaultForm = {
  subtopik_id: "",
  body: "",
  options: LABELS.slice(0, 4).map(emptyOption),
  answer: "",
  explanation: "",
  difficulty: 1,
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

  // Load struktur
  useEffect(() => {
    api
      .get("/admin/struktur")
      .then((data) => setStruktur(data))
      .catch(() => setError("Gagal memuat struktur"))
      .finally(() => setLoadingStruktur(false));
  }, []);

  // Load soal jika edit
  useEffect(() => {
    if (!isEdit) return;
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
        });
        // Resolve parent chain dari subtopik_id
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
              if (sj) {
                setSelected({
                  jenjang: sj.jenjang_id,
                  subjenjang: sj.id,
                  mapel: mapel.id,
                  topik: topik.id,
                });
              }
            }
          }
        }
      })
      .catch(() => setError("Gagal memuat soal"));
  }, [id, struktur.subtopik.length]);

  // Filtered options
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

  return (
    <div style={{ maxWidth: "720px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
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

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "24px" }}
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
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}
            >
              Teks Soal
            </label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="Tulis soal di sini... Gunakan $...$ untuk LaTeX inline, $$...$$ untuk display"
              rows={4}
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #e2ddd5",
                fontSize: "14px",
                outline: "none",
                fontFamily: "inherit",
                color: "#0f0e17",
                resize: "vertical",
                lineHeight: "1.6",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
              onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
            />
            <p style={{ fontSize: "12px", color: "#b4b2a9" }}>
              Gunakan $x^2$ untuk rumus inline, $$\frac{"{a}{b}"}$$ untuk
              display
            </p>
          </div>

          {/* Difficulty */}
          <div style={{ marginTop: "16px" }}>
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
                      form.difficulty === d.value ? d.color + "18" : "white",
                    color: form.difficulty === d.value ? d.color : "#6b6860",
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
              style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}
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
                  onClick={() => setForm((f) => ({ ...f, answer: opt.label }))}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    border: `2px solid ${
                      form.answer === opt.label ? "#1a8a6e" : "#e2ddd5"
                    }`,
                    background: form.answer === opt.label ? "#e4f5f0" : "white",
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
              fontSize: "14px",
              fontWeight: "700",
              color: "#0f0e17",
              marginBottom: "16px",
            }}
          >
            Pembahasan{" "}
            <span
              style={{ fontWeight: "400", color: "#6b6860", fontSize: "13px" }}
            >
              (opsional)
            </span>
          </div>
          <textarea
            value={form.explanation}
            onChange={(e) =>
              setForm((f) => ({ ...f, explanation: e.target.value }))
            }
            placeholder="Tulis pembahasan langkah per langkah... Bisa pakai LaTeX"
            rows={5}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #e2ddd5",
              fontSize: "14px",
              outline: "none",
              fontFamily: "inherit",
              color: "#0f0e17",
              resize: "vertical",
              lineHeight: "1.6",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
            onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
          />
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
    </div>
  );
}
