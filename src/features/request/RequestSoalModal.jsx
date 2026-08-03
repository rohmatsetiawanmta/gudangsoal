// src/features/request/RequestSoalModal.jsx
import { useState } from "react";
import { X } from "lucide-react";
import MarkdownEditor from "../../components/MarkdownEditor";
import api from "../../lib/api";

export default function RequestSoalModal({ onClose, onSuccess }) {
  const [form, setForm]               = useState({ body: "", catatan: "", foto_url: "" });
  const [submitting, setSubmitting]   = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [error, setError]             = useState("");

  const handleFotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Ukuran foto maksimal 2MB"); return; }
    setUploadingFoto(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/upload/image?folder=uploads/request`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: fd,
      });
      const data = await res.json();
      if (data.url) setForm(f => ({ ...f, foto_url: data.url }));
      else setError(data.error || "Gagal upload foto");
    } catch { setError("Gagal upload foto"); }
    finally { setUploadingFoto(false); e.target.value = ""; }
  };

  const handleSubmit = async () => {
    if (!form.body.trim()) { setError("Isi soal wajib diisi"); return; }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/soal-request", form);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.error || "Gagal mengirim request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: "16px" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "var(--gs-surface)", borderRadius: "16px", padding: "28px", maxWidth: "600px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "17px", fontWeight: "800", color: "var(--gs-text)" }}>Kirim Request Soal</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gs-text-muted)", display: "flex" }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "13px", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Body soal */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--gs-text)" }}>Soal yang ingin ditanyakan</label>
            <MarkdownEditor value={form.body} onChange={v => setForm(f => ({ ...f, body: v }))} placeholder="Tulis soal di sini... Bisa pakai LaTeX ($...$) dan Markdown" rows={5} hideImage />
          </div>

          {/* Foto */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--gs-text)" }}>
              Foto Soal <span style={{ fontWeight: "400", color: "var(--gs-text-muted)" }}>(opsional, maks 2MB)</span>
            </label>
            {form.foto_url ? (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img src={form.foto_url} alt="Foto soal" style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "10px", border: "1px solid var(--gs-border)", objectFit: "contain" }} />
                <button onClick={() => setForm(f => ({ ...f, foto_url: "" }))} style={{ position: "absolute", top: "8px", right: "8px", width: "24px", height: "24px", borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "20px", borderRadius: "10px", border: "2px dashed var(--gs-border)", cursor: uploadingFoto ? "not-allowed" : "pointer", fontSize: "14px", color: "var(--gs-text-muted)", transition: "all .15s" }}
                onMouseEnter={e => { if (!uploadingFoto) { e.currentTarget.style.borderColor = "#e84c2b"; e.currentTarget.style.color = "#e84c2b"; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--gs-border)"; e.currentTarget.style.color = "var(--gs-text-muted)"; }}
              >
                <input type="file" accept="image/*" onChange={handleFotoUpload} style={{ display: "none" }} disabled={uploadingFoto} />
                {uploadingFoto ? "Mengupload..." : "Klik untuk upload foto soal"}
              </label>
            )}
          </div>

          {/* Catatan */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--gs-text)" }}>
              Catatan tambahan <span style={{ fontWeight: "400", color: "var(--gs-text-muted)" }}>(opsional)</span>
            </label>
            <textarea value={form.catatan} onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))}
              placeholder="Misal: dari soal UTBK 2023, atau topik spesifik yang belum dimengerti..."
              rows={3}
              style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--gs-border)", fontSize: "14px", outline: "none", fontFamily: "inherit", color: "var(--gs-text)", background: "var(--gs-surface)", resize: "none", lineHeight: "1.6" }}
              onFocus={e => e.target.style.borderColor = "#e84c2b"}
              onBlur={e => e.target.style.borderColor = "var(--gs-border)"}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: "10px", border: "1px solid var(--gs-border)", background: "var(--gs-surface)", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "var(--gs-text)" }}>
              Batal
            </button>
            <button onClick={handleSubmit} disabled={submitting || !form.body.trim()}
              style={{ padding: "9px 20px", borderRadius: "10px", border: "none", background: submitting || !form.body.trim() ? "var(--gs-border)" : "#e84c2b", color: submitting || !form.body.trim() ? "var(--gs-text-hint)" : "white", fontSize: "14px", fontWeight: "600", cursor: submitting || !form.body.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              {submitting ? "Mengirim..." : "Kirim Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
