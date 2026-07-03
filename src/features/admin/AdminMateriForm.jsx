// src/features/admin/AdminMateriForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, GraduationCap, Save, Plus, Trash2,
  BookOpen, AlignLeft,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import api from "../../lib/api";
import useWindowWidth from "../../hooks/useWindowWidth";
import ToggleSwitch from "../../components/ToggleSwitch";
import LokasiSoal from "./soal-form/FormSections/LokasiSoal";
import AdminMateriImport from "./AdminMateriImport";
import MarkdownEditor from "../../components/MarkdownEditor";

// ── SectionCard ───────────────────────────────────────────────────────────────

function SectionCard({ label, accent, children, isMobile }) {
  return (
    <div style={{
      background: "white", borderRadius: "14px",
      border: "1px solid #e2ddd5",
      borderLeft: `3px solid ${accent}`,
    }}>
      {label && (
        <div style={{
          padding: isMobile ? "12px 16px" : "14px 20px",
          borderBottom: "1px solid #f0ede6",
          fontSize: "13px", fontWeight: "700", color: "#0f0e17",
          background: "linear-gradient(to right, #faf9f6, white)",
          display: "flex", alignItems: "center", gap: "8px",
          borderRadius: "14px 14px 0 0",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: accent, flexShrink: 0 }} />
          {label}
        </div>
      )}
      <div style={{ padding: isMobile ? "16px" : "20px" }}>
        {children}
      </div>
    </div>
  );
}

// ── FormField ─────────────────────────────────────────────────────────────────

function FormField({ label, required, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>
        {label}
        {required && <span style={{ color: "#e84c2b", marginLeft: "3px" }}>*</span>}
        {hint && <span style={{ fontWeight: "400", color: "#6b6860", marginLeft: "6px" }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, autoFocus }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        padding: "10px 14px", borderRadius: "10px",
        border: `1.5px solid ${focused ? "#e84c2b" : "#e2ddd5"}`,
        fontSize: "14px", outline: "none",
        fontFamily: "inherit", color: "#0f0e17",
        transition: "border-color .15s", background: "white",
      }}
    />
  );
}

function TextareaInput({ value, onChange, placeholder, rows = 8 }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        padding: "10px 14px", borderRadius: "10px",
        border: `1.5px solid ${focused ? "#e84c2b" : "#e2ddd5"}`,
        fontSize: "14px", outline: "none",
        fontFamily: "inherit", color: "#0f0e17",
        transition: "border-color .15s", background: "white",
        resize: "vertical", lineHeight: "1.6",
      }}
    />
  );
}

// ── HighlightCard ─────────────────────────────────────────────────────────────

const HIGHLIGHT_TYPES = [
  { value: "definisi",  label: "Definisi",  color: "#7c3aed", bg: "#f5f3ff" },
  { value: "rumus",     label: "Rumus",     color: "#2563eb", bg: "#eff6ff" },
  { value: "ringkasan", label: "Ringkasan", color: "#1a8a6e", bg: "#e4f5f0" },
  { value: "contoh",    label: "Contoh",    color: "#f5a623", bg: "#fef9ee" },
  { value: "catatan",   label: "Catatan",   color: "#e84c2b", bg: "#fff3f0" },
];

function HighlightCard({ item, index, onChange, onRemove, isMobile }) {
  const typeInfo = HIGHLIGHT_TYPES.find(t => t.value === item.type) || HIGHLIGHT_TYPES[0];

  return (
    <div style={{
      background: "#faf9f6", borderRadius: "12px",
      border: "1px solid #e2ddd5",
      borderLeft: `3px solid ${typeInfo.color}`,
      padding: isMobile ? "14px" : "16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        {/* Type toggle */}
        <div style={{ display: "flex", gap: "6px" }}>
          {HIGHLIGHT_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange(index, "type", t.value)}
              style={{
                padding: "5px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "700",
                border: `1px solid ${item.type === t.value ? t.color : "#e2ddd5"}`,
                background: item.type === t.value ? t.bg : "white",
                color: item.type === t.value ? t.color : "#6b6860",
                cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          style={{ width: "28px", height: "28px", borderRadius: "7px", border: "1px solid #fca5a5", background: "#fff3f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#e84c2b", transition: "all .15s" }}
          onMouseEnter={e => (e.currentTarget.style.background = "#fee2e2")}
          onMouseLeave={e => (e.currentTarget.style.background = "#fff3f0")}
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <FormField label="Label" hint="(misal: Rumus Luas Lingkaran)">
          <TextInput
            value={item.label}
            onChange={v => onChange(index, "label", v)}
            placeholder="Nama singkat highlight..."
          />
        </FormField>
        <FormField label="Konten">
          <TextareaInput
            value={item.content}
            onChange={v => onChange(index, "content", v)}
            placeholder={
              item.type === "rumus"     ? "Tulis rumus, bisa pakai LaTeX: $A = \\pi r^2$" :
              item.type === "definisi"  ? "Tulis definisi konsep..." :
              item.type === "contoh"    ? "Tulis contoh singkat..." :
              item.type === "catatan"   ? "Tulis peringatan atau catatan konsep..." :
                                          "Tulis poin-poin penting..."
            }
            rows={4}
          />
        </FormField>
      </div>
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────────

const DEFAULT_FORM = { subtopik_id: "", judul: "", konten: "", highlights: [], is_published: 0, urutan: 0 };

export default function AdminMateriForm() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = !!id;
  const width    = useWindowWidth();
  const isMobile = width <= 480;

  const [form, setForm]               = useState(DEFAULT_FORM);
  const [struktur, setStruktur]       = useState({ jenjang: [], subjenjang: [], mapel: [], topik: [], subtopik: [] });
  const [selected, setSelected]       = useState({ jenjang: "", subjenjang: "", mapel: "", topik: "" });
  const [loadingStruktur, setLoadingStruktur] = useState(true);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  // Load struktur
  useEffect(() => {
    api.get("/admin/struktur")
      .then(data => setStruktur(data))
      .catch(() => setError("Gagal memuat struktur"))
      .finally(() => setLoadingStruktur(false));
  }, []);

  // Load data for edit mode (after struktur is ready)
  useEffect(() => {
    if (!isEdit || !struktur.subtopik.length) return;
    api.get(`/admin/materi/detail?id=${id}`)
      .then(data => {
        setForm({
          subtopik_id: data.subtopik_id,
          judul:       data.judul || "",
          konten:      data.konten || "",
          highlights:  Array.isArray(data.highlights) ? data.highlights : [],
          is_published: Number(data.is_published ?? 0),
          urutan:      Number(data.urutan ?? 0),
        });
        // Reconstruct selected from subtopik_id
        const st = struktur.subtopik.find(s => s.id == data.subtopik_id);
        if (!st) return;
        const topik = struktur.topik.find(t => t.id == st.topik_id);
        if (!topik) return;
        const mapel = struktur.mapel.find(m => m.id == topik.mapel_id);
        if (!mapel) return;
        const sj = struktur.subjenjang.find(s => s.id == mapel.subjenjang_id);
        if (!sj) return;
        setSelected({ jenjang: sj.jenjang_id, subjenjang: sj.id, mapel: mapel.id, topik: topik.id });
      })
      .catch(() => setError("Gagal memuat materi"));
  }, [id, struktur.subtopik.length]);

  const handleHighlightChange = (index, field, value) => {
    setForm(f => ({
      ...f,
      highlights: f.highlights.map((h, i) => i === index ? { ...h, [field]: value } : h),
    }));
  };

  const handleHighlightRemove = (index) => {
    setForm(f => ({ ...f, highlights: f.highlights.filter((_, i) => i !== index) }));
  };

  const handleHighlightAdd = () => {
    setForm(f => ({
      ...f,
      highlights: [...f.highlights, { type: "rumus", label: "", content: "" }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.subtopik_id) { setError("Pilih subtopik terlebih dahulu"); return; }
    if (!form.judul.trim()) { setError("Judul tidak boleh kosong"); return; }

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/admin/materi?id=${id}`, form);
      } else {
        await api.post("/admin/materi", form);
      }
      navigate("/admin/materi");
    } catch (err) {
      setError(err.error || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Helmet>
        <title>{`${isEdit ? "Edit Materi" : "Tambah Materi"} | Admin Gudang Soal`}</title>
      </Helmet>

      {/* ── Hero header ── */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 60%, #0a1c1a 100%)",
        padding: isMobile ? "24px 20px" : "28px 32px",
        marginBottom: "28px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", right: isMobile ? "-10px" : "32px", top: "50%",
          transform: "translateY(-50%)",
          opacity: 0.06, userSelect: "none", lineHeight: 1,
          pointerEvents: "none", color: "white",
        }}>
          <GraduationCap size={isMobile ? 80 : 110} />
        </div>

        <div style={{
          display: "flex", alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: "16px", position: "relative", zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <button
              type="button"
              onClick={() => navigate("/admin/materi")}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "36px", height: "36px", borderRadius: "10px",
                border: "1px solid rgba(255,255,255,.15)",
                background: "rgba(255,255,255,.08)",
                color: "rgba(255,255,255,.7)", cursor: "pointer",
                transition: "all .15s", flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.15)"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}
            >
              <ArrowLeft size={16} />
            </button>
            <h1 style={{ fontSize: isMobile ? "20px" : "22px", fontWeight: "800", color: "white", letterSpacing: "-0.4px", margin: 0 }}>
              {isEdit ? "Edit Materi" : "Tambah Materi"}
            </h1>
          </div>

          <div style={{ width: isMobile ? "100%" : "auto" }}>
            <AdminMateriImport setForm={setForm} isMobile={isMobile} />
          </div>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "14px", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* ── Lokasi ── */}
        <SectionCard label="Lokasi" accent="#7c3aed" isMobile={isMobile}>
          <LokasiSoal
            form={form}
            setForm={setForm}
            struktur={struktur}
            selected={selected}
            setSelected={setSelected}
            loadingStruktur={loadingStruktur}
            isMobile={isMobile}
          />
        </SectionCard>

        {/* ── Konten ── */}
        <SectionCard label="Konten" accent="#2563eb" isMobile={isMobile}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <FormField label="Judul" required>
              <TextInput
                value={form.judul}
                onChange={v => setForm(f => ({ ...f, judul: v }))}
                placeholder="Judul materi..."
                autoFocus={!isEdit}
              />
            </FormField>
            <FormField label="Konten" hint="(mendukung Markdown & LaTeX)">
              <MarkdownEditor
                value={form.konten}
                onChange={v => setForm(f => ({ ...f, konten: v }))}
                placeholder={"Tulis materi di sini...\n\nContoh LaTeX: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$"}
                rows={12}
              />
            </FormField>
          </div>
        </SectionCard>

        {/* ── Highlights ── */}
        <SectionCard label="Highlights" accent="#1a8a6e" isMobile={isMobile}>
          <p style={{ fontSize: "13px", color: "#6b6860", marginTop: 0, marginBottom: "16px" }}>
            Blok rumus penting atau ringkasan yang ditampilkan di bagian bawah materi.
          </p>

          {form.highlights.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
              {form.highlights.map((h, i) => (
                <HighlightCard
                  key={i}
                  item={h}
                  index={i}
                  onChange={handleHighlightChange}
                  onRemove={handleHighlightRemove}
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleHighlightAdd}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "9px 16px", borderRadius: "10px",
              border: "1.5px dashed #c8c6be", background: "transparent",
              color: "#6b6860", fontSize: "13.5px", fontWeight: "600",
              cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
              width: "100%", justifyContent: "center",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a8a6e"; e.currentTarget.style.color = "#1a8a6e"; e.currentTarget.style.background = "#f0faf6"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#c8c6be"; e.currentTarget.style.color = "#6b6860"; e.currentTarget.style.background = "transparent"; }}
          >
            <Plus size={15} /> Tambah Highlight
          </button>
        </SectionCard>

        {/* ── Pengaturan ── */}
        <SectionCard label="Pengaturan" accent="#f5a623" isMobile={isMobile}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Urutan */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f0e17", marginBottom: "3px" }}>Urutan</div>
                <div style={{ fontSize: "13px", color: "#6b6860" }}>Materi dengan urutan lebih kecil tampil lebih dulu (0, 1, 2, …).</div>
              </div>
              <input
                type="number"
                min="0"
                value={form.urutan}
                onChange={e => setForm(f => ({ ...f, urutan: Math.max(0, parseInt(e.target.value) || 0) }))}
                style={{ width: "80px", padding: "8px 10px", borderRadius: "9px", border: "1px solid #e2ddd5", fontSize: "14px", fontFamily: "inherit", color: "#0f0e17", outline: "none", textAlign: "center" }}
                onFocus={e => (e.target.style.borderColor = "#f5a623")}
                onBlur={e => (e.target.style.borderColor = "#e2ddd5")}
              />
            </div>
            {/* Divider */}
            <div style={{ height: "1px", background: "#f0ede6" }} />
            {/* Publish toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f0e17", marginBottom: "3px" }}>Status Publish</div>
                <div style={{ fontSize: "13px", color: "#6b6860" }}>Materi hanya tampil ke pengguna jika berstatus Published.</div>
              </div>
              <ToggleSwitch
                checked={form.is_published === 1}
                onChange={() => setForm(f => ({ ...f, is_published: f.is_published === 1 ? 0 : 1 }))}
              />
            </div>
          </div>
        </SectionCard>

        {/* ── Action buttons ── */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
          <button
            type="button"
            onClick={() => navigate("/admin/materi")}
            style={{ padding: "10px 22px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#0f0e17" }}
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 22px", borderRadius: "10px", border: "none", background: loading ? "#f5a07a" : "#e84c2b", color: "white", fontSize: "14px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: loading ? "none" : "0 4px 14px rgba(232,76,43,.3)", transition: "all .15s" }}
          >
            <Save size={15} />
            {loading ? "Menyimpan..." : (isEdit ? "Simpan Perubahan" : "Tambah Materi")}
          </button>
        </div>
      </form>
    </div>
  );
}
