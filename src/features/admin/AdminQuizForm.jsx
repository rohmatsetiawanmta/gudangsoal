// src/features/admin/AdminQuizForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, Save, Plus, AlertCircle,
  Clock, Star, RefreshCw, List, Eye, EyeOff, Shuffle, AlignLeft,
} from "lucide-react";
import useWindowWidth from "../../hooks/useWindowWidth";
import {
  adminCreateQuizSet,
  adminUpdateQuizSet,
  adminGetQuizSets,
} from "../quiz/quizApi";
import api from "../../lib/api";

const defaultForm = {
  judul: "",
  deskripsi: "",
  jenjang_id: "",
  durasi: 60,
  max_xp: 100,
  max_attempt: 3,
  urutan: 0,
  urutan_mode: "fixed",
  show_answer: 1,
};

// ── Reusable sub-components ───────────────────────────────────────────────────

function SectionCard({ label, accent, children, isMobile }) {
  return (
    <div style={{
      background: "white", borderRadius: "14px",
      border: "1px solid #e2ddd5",
      borderLeft: `3px solid ${accent || "#e2ddd5"}`,
      overflow: "hidden",
    }}>
      {label && (
        <div style={{
          padding: isMobile ? "12px 16px" : "14px 20px",
          borderBottom: "1px solid #f0ede6",
          fontSize: "13px", fontWeight: "700", color: "#0f0e17",
          background: "linear-gradient(to right, #faf9f6, white)",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: accent || "#e2ddd5", flexShrink: 0,
          }} />
          {label}
        </div>
      )}
      <div style={{ padding: isMobile ? "16px" : "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: "11px", color: "#b4b2a9", lineHeight: "1.5" }}>{hint}</div>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, onFocus, onBlur }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        padding: "10px 14px", borderRadius: "10px",
        border: "1px solid #e2ddd5", fontSize: "14px",
        outline: "none", fontFamily: "inherit", color: "#0f0e17",
        transition: "border-color .15s",
      }}
      onFocus={e => { e.target.style.borderColor = "#e84c2b"; onFocus?.(e); }}
      onBlur={e => { e.target.style.borderColor = "#e2ddd5"; onBlur?.(e); }}
    />
  );
}

function NumberField({ label, value, onChange, min = 1, max, hint }) {
  return (
    <FormField label={label} hint={hint}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || min)}
        min={min}
        max={max}
        style={{
          padding: "10px 14px", borderRadius: "10px",
          border: "1px solid #e2ddd5", fontSize: "14px",
          outline: "none", fontFamily: "inherit", color: "#0f0e17",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
        onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
      />
    </FormField>
  );
}

function OptionToggle({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      {options.map((m) => {
        const active = value === m.value;
        return (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange(m.value)}
            style={{
              flex: 1, padding: "11px 12px",
              borderRadius: "10px", border: "none",
              cursor: "pointer", fontFamily: "inherit",
              textAlign: "left",
              background: active ? "#fff3f0" : "#f2efe8",
              outline: active ? "2px solid #e84c2b" : "none",
              transition: "all .15s",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontSize: "13px", fontWeight: "700",
              color: active ? "#e84c2b" : "#0f0e17",
              marginBottom: "2px",
            }}>
              {m.icon && <m.icon size={13} />}
              {m.label}
            </div>
            <div style={{ fontSize: "11px", color: "#6b6860", lineHeight: "1.4" }}>{m.desc}</div>
          </button>
        );
      })}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AdminQuizForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [form, setForm] = useState(defaultForm);
  const [jenjangList, setJenjangList] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/browse/jenjang")
      .then((d) => setJenjangList(Array.isArray(d) ? d : []))
      .catch(() => {});

    if (isEdit) {
      adminGetQuizSets()
        .then((sets) => {
          const set = sets.find((s) => s.id == id);
          if (set) {
            setForm({
              judul: set.judul || "",
              deskripsi: set.deskripsi || "",
              jenjang_id: set.jenjang_id || "",
              durasi: set.durasi || 60,
              max_xp: set.max_xp || 100,
              max_attempt: set.max_attempt || 3,
              urutan: set.urutan || 0,
              urutan_mode: set.urutan_mode || "fixed",
              show_answer: set.show_answer ?? 1,
            });
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async () => {
    setError("");
    if (!form.judul.trim()) { setError("Judul wajib diisi"); return; }
    if (form.durasi < 1)     { setError("Durasi minimal 1 menit"); return; }
    if (form.max_xp < 1)     { setError("Max XP minimal 1"); return; }
    if (form.max_attempt < 1){ setError("Max attempt minimal 1"); return; }

    setSaving(true);
    try {
      if (isEdit) {
        await adminUpdateQuizSet(id, form);
        navigate(`/admin/latihan`);
      } else {
        const res = await adminCreateQuizSet(form);
        navigate(`/admin/latihan/${res.id}`);
      }
    } catch {
      setError("Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{
            height: "80px", borderRadius: "14px",
            background: "#e2ddd5", opacity: 0.5,
            animation: "pulse 1.5s infinite",
          }} />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
      </div>
    );

  return (
    <div>
      <Helmet>
        <title>{`${isEdit ? "Edit" : "Buat"} Set Soal | Admin Gudang Soal`}</title>
      </Helmet>

      {/* ── Hero header ── */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #0d2210 100%)",
        padding: isMobile ? "24px 20px" : "28px 32px",
        marginBottom: "28px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%",
          transform: "translateY(-50%)",
          opacity: 0.06, userSelect: "none", lineHeight: 1,
          pointerEvents: "none", color: "white",
        }}>
          <List size={isMobile ? 80 : 110} />
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: "14px",
          position: "relative", zIndex: 1,
        }}>
          <button
            type="button"
            onClick={() => navigate("/admin/latihan")}
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
          <div>
            <h1 style={{
              fontSize: isMobile ? "20px" : "22px",
              fontWeight: "800", color: "white",
              letterSpacing: "-0.4px", margin: 0,
            }}>
              Kelola Latihan
            </h1>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          background: "#fff3f0", border: "1px solid #fca5a5",
          color: "#b91c1c", fontSize: "14px", borderRadius: "12px",
          padding: "12px 16px", marginBottom: "20px",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      {/* ── Form grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: "16px",
      }}>
        {/* Kiri */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          <SectionCard label="Informasi Dasar" accent="#2563eb" isMobile={isMobile}>
            <FormField label="Judul">
              <TextInput
                value={form.judul}
                onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
                placeholder="Contoh: Try Out UTBK Matematika #1"
              />
            </FormField>

            <FormField label={<>Deskripsi <span style={{ fontWeight: "400", color: "#b4b2a9", fontSize: "12px" }}>(opsional)</span></>}>
              <textarea
                value={form.deskripsi}
                onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))}
                placeholder="Deskripsi singkat tentang set soal ini..."
                rows={3}
                style={{
                  padding: "10px 14px", borderRadius: "10px",
                  border: "1px solid #e2ddd5", fontSize: "14px",
                  outline: "none", fontFamily: "inherit", color: "#0f0e17",
                  resize: "none", lineHeight: "1.6",
                  transition: "border-color .15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
              />
            </FormField>

            <FormField label="Jenjang">
              <select
                value={form.jenjang_id}
                onChange={(e) => setForm((f) => ({ ...f, jenjang_id: e.target.value }))}
                style={{
                  padding: "10px 14px", borderRadius: "10px",
                  border: "1px solid #e2ddd5", fontSize: "14px",
                  outline: "none", fontFamily: "inherit", color: "#0f0e17",
                  background: "white",
                }}
              >
                <option value="">Semua jenjang</option>
                {jenjangList.map((j) => (
                  <option key={j.id} value={j.id}>{j.nama}</option>
                ))}
              </select>
            </FormField>
          </SectionCard>

          <SectionCard label="Waktu & Reward" accent="#f5a623" isMobile={isMobile}>
            <NumberField
              label={<><Clock size={12} style={{ marginRight: 4 }} />Durasi (menit)</>}
              value={form.durasi}
              onChange={(v) => setForm((f) => ({ ...f, durasi: v }))}
              min={1}
              hint="Waktu total untuk mengerjakan semua soal"
            />
            <NumberField
              label={<><Star size={12} style={{ marginRight: 4 }} />Max XP</>}
              value={form.max_xp}
              onChange={(v) => setForm((f) => ({ ...f, max_xp: v }))}
              min={1}
              hint="XP maksimal jika jawab 90–100% benar"
            />
          </SectionCard>
        </div>

        {/* Kanan */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          <SectionCard label="Attempt & Urutan" accent="#7c3aed" isMobile={isMobile}>
            <NumberField
              label={<><RefreshCw size={12} style={{ marginRight: 4 }} />Max Attempt</>}
              value={form.max_attempt}
              onChange={(v) => setForm((f) => ({ ...f, max_attempt: v }))}
              min={1} max={10}
              hint="Berapa kali user boleh mengerjakan set soal ini"
            />
            <NumberField
              label={<><List size={12} style={{ marginRight: 4 }} />Urutan Tampil</>}
              value={form.urutan}
              onChange={(v) => setForm((f) => ({ ...f, urutan: v }))}
              min={0}
              hint="Angka kecil tampil lebih dulu di halaman latihan"
            />
          </SectionCard>

          <SectionCard label="Mode Soal" accent="#1a8a6e" isMobile={isMobile}>
            <FormField label="Urutan Soal">
              <OptionToggle
                value={form.urutan_mode}
                onChange={(v) => setForm((f) => ({ ...f, urutan_mode: v }))}
                options={[
                  { value: "fixed",  label: "Tetap",  icon: AlignLeft, desc: "Urutan sama tiap attempt" },
                  { value: "random", label: "Acak",   icon: Shuffle,   desc: "Diacak tiap attempt baru" },
                ]}
              />
            </FormField>

            <FormField label="Tampilkan Pembahasan">
              <OptionToggle
                value={form.show_answer}
                onChange={(v) => setForm((f) => ({ ...f, show_answer: v }))}
                options={[
                  { value: 1, label: "Ya",    icon: Eye,    desc: "User bisa lihat kunci & pembahasan" },
                  { value: 0, label: "Tidak", icon: EyeOff, desc: "Kunci jawaban disembunyikan" },
                ]}
              />
            </FormField>
          </SectionCard>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "8px", padding: "14px",
              borderRadius: "12px", border: "none",
              background: saving ? "#f5a07a" : "#e84c2b",
              color: "white", fontSize: "15px", fontWeight: "700",
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              boxShadow: saving ? "none" : "0 4px 16px rgba(232,76,43,.25)",
              transition: "all .15s",
            }}
          >
            {saving ? (
              "Menyimpan..."
            ) : isEdit ? (
              <><Save size={16} /> Simpan Perubahan</>
            ) : (
              <><Plus size={16} /> Buat Set Soal</>
            )}
          </button>

          {!isEdit && (
            <p style={{ fontSize: "12px", color: "#b4b2a9", textAlign: "center", lineHeight: "1.6" }}>
              Setelah membuat set soal, kamu bisa langsung menambahkan soal di dalamnya.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
