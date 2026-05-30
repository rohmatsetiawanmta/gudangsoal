// src/features/admin/soal-form/FormSections/LokasiSoal.jsx
import Select from "../Select";

export default function LokasiSoal({
  form,
  setForm,
  struktur,
  selected,
  setSelected,
  loadingStruktur,
  isMobile,
}) {
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

  return (
    <div
      style={{
        background: "white",
        borderRadius: "14px",
        border: "1px solid #e2ddd5",
        padding: isMobile ? "20px 16px" : "24px",
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
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "12px",
        }}
      >
        <Select
          label="Jenjang"
          value={selected.jenjang}
          onChange={(v) =>
            setSelected({ jenjang: v, subjenjang: "", mapel: "", topik: "" })
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
            setSelected((s) => ({ ...s, subjenjang: v, mapel: "", topik: "" }))
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
          onChange={(v) => setSelected((s) => ({ ...s, mapel: v, topik: "" }))}
          options={filteredMapel.map((m) => ({ value: m.id, label: m.nama }))}
          placeholder="Pilih mapel"
          disabled={!selected.subjenjang}
        />
        <Select
          label="Topik"
          value={selected.topik}
          onChange={(v) => setSelected((s) => ({ ...s, topik: v }))}
          options={filteredTopik.map((t) => ({ value: t.id, label: t.nama }))}
          placeholder="Pilih topik"
          disabled={!selected.mapel}
        />
        <div style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
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
  );
}
