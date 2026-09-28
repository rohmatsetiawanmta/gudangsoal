// src/features/admin/AdminPaketForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Package } from "lucide-react";
import { Helmet } from "react-helmet-async";
import useWindowWidth from "../../hooks/useWindowWidth";
import api from "../../lib/api";

const JENIS_OPTIONS = [
  { value: "olimpiade",     label: "Olimpiade" },
  { value: "un",            label: "Ujian Nasional" },
  { value: "utbk",          label: "UTBK/SNBT" },
  { value: "seleksi",       label: "Seleksi" },
  { value: "ujian_sekolah", label: "Ujian Sekolah" },
  { value: "lainnya",       label: "Lainnya" },
];

const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: "10px",
  border: "1px solid #e2ddd5", fontSize: "14px", fontFamily: "inherit",
  color: "#0f0e17", background: "white", outline: "none", boxSizing: "border-box",
};

export default function AdminPaketForm() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = !!id;
  const width    = useWindowWidth();
  const isMobile = width <= 480;

  const [form, setForm] = useState({ nama: "", tahun: "", jenis: "lainnya", harga: "", deskripsi: "" });
  const [loading, setLoading] = useState(isEdit);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/admin/paket/${id}`)
      .then((d) => setForm({
        nama:      d.nama      || "",
        tahun:     d.tahun     || "",
        jenis:     d.jenis     || "lainnya",
        harga:     d.harga     || "",
        deskripsi: d.deskripsi || "",
      }))
      .catch(() => setError("Gagal memuat data paket"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSave = async () => {
    if (!form.nama.trim()) { setError("Nama paket wajib diisi"); return; }
    setSaving(true); setError("");
    try {
      const payload = {
        nama:      form.nama.trim(),
        tahun:     form.tahun ? parseInt(form.tahun) : null,
        jenis:     form.jenis,
        harga:     form.harga ? parseInt(form.harga) : 0,
        deskripsi: form.deskripsi.trim(),
      };
      if (isEdit) {
        await api.put(`/admin/paket/${id}`, payload);
        navigate(`/admin/paket/${id}`);
      } else {
        const res = await api.post("/admin/paket", payload);
        navigate(`/admin/paket/${res.id}`);
      }
    } catch (e) {
      setError(e?.error || e?.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "#6b6860" }}>Memuat...</div>;

  return (
    <div style={{ padding: isMobile ? "16px" : "24px 28px", maxWidth: "640px" }}>
      <Helmet><title>{isEdit ? "Edit Paket" : "Buat Paket"} — Admin</title></Helmet>

      {/* Hero */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #1a0a2e 100%)",
        padding: isMobile ? "24px 20px" : "28px 32px",
        marginBottom: "24px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", right: "24px", top: "50%", transform: "translateY(-50%)",
          opacity: 0.06, userSelect: "none", pointerEvents: "none", color: "white",
        }}>
          <Package size={110} />
        </div>
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            onClick={() => navigate(isEdit ? `/admin/paket/${id}` : "/admin/paket")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
              border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.08)",
              color: "rgba(255,255,255,.7)", cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.15)"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "4px" }}>
              {isEdit ? "Edit Paket" : "Buat Paket Baru"}
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: "800", color: "white", margin: 0 }}>
              {isEdit ? form.nama || "Edit Paket" : "Paket Baru"}
            </h1>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "13px", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {/* Info section */}
      <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", borderLeft: "3px solid #7c3aed", overflow: "hidden", marginBottom: "16px" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0ede6", fontSize: "13px", fontWeight: "700", color: "#0f0e17", background: "linear-gradient(to right, #faf9f6, white)", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#7c3aed" }} />
          Informasi Paket
        </div>
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17", display: "block", marginBottom: "6px" }}>
              Nama Paket <span style={{ color: "#e84c2b" }}>*</span>
            </label>
            <input
              value={form.nama}
              onChange={set("nama")}
              placeholder="Contoh: OSK Matematika 2025"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "#7c3aed"}
              onBlur={(e) => e.target.style.borderColor = "#e2ddd5"}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17", display: "block", marginBottom: "6px" }}>Tahun</label>
              <input
                type="number"
                value={form.tahun}
                onChange={set("tahun")}
                placeholder="2025"
                min="2000" max="2099"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#7c3aed"}
                onBlur={(e) => e.target.style.borderColor = "#e2ddd5"}
              />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17", display: "block", marginBottom: "6px" }}>Jenis</label>
              <select
                value={form.jenis}
                onChange={set("jenis")}
                style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                onFocus={(e) => e.target.style.borderColor = "#7c3aed"}
                onBlur={(e) => e.target.style.borderColor = "#e2ddd5"}
              >
                {JENIS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: isMobile ? "1 / -1" : "auto" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17", display: "block", marginBottom: "6px" }}>Harga (Rp)</label>
              <input
                type="number"
                value={form.harga}
                onChange={set("harga")}
                placeholder="0 = gratis"
                min="0" step="1000"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#7c3aed"}
                onBlur={(e) => e.target.style.borderColor = "#e2ddd5"}
              />
            </div>
          </div>
          <p style={{ fontSize: "12px", color: "#6b6860", margin: "-8px 0 0" }}>
            Kosongkan atau isi 0 kalau paket ini gratis. Kalau diisi, user harus bayar dulu (Midtrans) sebelum bisa mengerjakan soal di paket ini.
          </p>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17", display: "block", marginBottom: "6px" }}>Deskripsi</label>
            <textarea
              value={form.deskripsi}
              onChange={set("deskripsi")}
              placeholder="Opsional — deskripsi singkat tentang paket ini..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }}
              onFocus={(e) => e.target.style.borderColor = "#7c3aed"}
              onBlur={(e) => e.target.style.borderColor = "#e2ddd5"}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "11px 24px", borderRadius: "10px", border: "none",
            background: saving ? "#f5a07a" : "#e84c2b", color: "white",
            fontSize: "14px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "inherit", boxShadow: saving ? "none" : "0 4px 16px rgba(232,76,43,.3)",
          }}
        >
          <Save size={15} />
          {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat & Kelola Soal"}
        </button>
      </div>
    </div>
  );
}
