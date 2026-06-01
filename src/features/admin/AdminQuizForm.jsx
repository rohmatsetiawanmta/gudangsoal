// src/features/admin/AdminQuizForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft } from "lucide-react";
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

function Select({ label, value, onChange, options, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "10px 14px",
          borderRadius: "10px",
          border: "1px solid #e2ddd5",
          fontSize: "14px",
          outline: "none",
          fontFamily: "inherit",
          color: "#0f0e17",
          background: "white",
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumberInput({ label, value, onChange, min = 1, max, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || min)}
        min={min}
        max={max}
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
      {hint && <div style={{ fontSize: "12px", color: "#b4b2a9" }}>{hint}</div>}
    </div>
  );
}

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
    if (!form.judul.trim()) {
      setError("Judul wajib diisi");
      return;
    }
    if (form.durasi < 1) {
      setError("Durasi minimal 1 menit");
      return;
    }
    if (form.max_xp < 1) {
      setError("Max XP minimal 1");
      return;
    }
    if (form.max_attempt < 1) {
      setError("Max attempt minimal 1");
      return;
    }

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
      <div style={{ padding: "40px", textAlign: "center", color: "#6b6860" }}>
        Memuat...
      </div>
    );

  return (
    <div>
      <Helmet>
        <title>{`${
          isEdit ? "Edit" : "Buat"
        } Set Soal | Admin Gudang Soal`}</title>
      </Helmet>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={() => navigate("/admin/latihan")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6b6860",
            fontSize: "13px",
            fontFamily: "inherit",
            padding: 0,
          }}
        >
          <ChevronLeft size={15} /> Kembali
        </button>
        <h1
          style={{
            fontSize: isMobile ? "20px" : "22px",
            fontWeight: "800",
            color: "#0f0e17",
            letterSpacing: "-0.5px",
          }}
        >
          {isEdit ? "Edit Set Soal" : "Buat Set Soal Baru"}
        </h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "20px",
        }}
      >
        {/* Kiri */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Info dasar */}
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: isMobile ? "16px" : "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div
              style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}
            >
              Informasi Dasar
            </div>

            {/* Judul */}
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
                Judul
              </label>
              <input
                value={form.judul}
                onChange={(e) =>
                  setForm((f) => ({ ...f, judul: e.target.value }))
                }
                placeholder="Contoh: Try Out UTBK Matematika #1"
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
            </div>

            {/* Deskripsi */}
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
                Deskripsi{" "}
                <span style={{ fontWeight: "400", color: "#b4b2a9" }}>
                  (opsional)
                </span>
              </label>
              <textarea
                value={form.deskripsi}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deskripsi: e.target.value }))
                }
                placeholder="Deskripsi singkat tentang set soal ini..."
                rows={3}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid #e2ddd5",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "inherit",
                  color: "#0f0e17",
                  resize: "none",
                  lineHeight: "1.6",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
              />
            </div>

            {/* Jenjang */}
            <Select
              label="Jenjang"
              value={form.jenjang_id}
              onChange={(v) => setForm((f) => ({ ...f, jenjang_id: v }))}
              placeholder="Semua jenjang"
              options={jenjangList.map((j) => ({ value: j.id, label: j.nama }))}
            />
          </div>

          {/* Pengaturan waktu & XP */}
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: isMobile ? "16px" : "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div
              style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}
            >
              Waktu & XP
            </div>

            <NumberInput
              label="Durasi (menit)"
              value={form.durasi}
              onChange={(v) => setForm((f) => ({ ...f, durasi: v }))}
              min={1}
              hint="Waktu total untuk mengerjakan semua soal"
            />
            <NumberInput
              label="Max XP"
              value={form.max_xp}
              onChange={(v) => setForm((f) => ({ ...f, max_xp: v }))}
              min={1}
              hint="XP maksimal yang bisa didapat jika jawab 90-100% benar"
            />
          </div>
        </div>

        {/* Kanan */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Pengaturan attempt */}
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: isMobile ? "16px" : "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div
              style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}
            >
              Pengaturan Attempt
            </div>

            <NumberInput
              label="Max Attempt"
              value={form.max_attempt}
              onChange={(v) => setForm((f) => ({ ...f, max_attempt: v }))}
              min={1}
              max={10}
              hint="Berapa kali user boleh mengerjakan set soal ini"
            />

            <NumberInput
              label="Urutan"
              value={form.urutan}
              onChange={(v) => setForm((f) => ({ ...f, urutan: v }))}
              min={0}
              hint="Urutan tampil di halaman latihan (angka kecil = tampil duluan)"
            />
          </div>

          {/* Mode & Pembahasan */}
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: isMobile ? "16px" : "20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div
              style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}
            >
              Mode Soal
            </div>

            {/* Urutan mode */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f0e17",
                }}
              >
                Urutan Soal
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  {
                    value: "fixed",
                    label: "Tetap",
                    desc: "Urutan sama tiap attempt",
                  },
                  {
                    value: "random",
                    label: "Acak",
                    desc: "Diacak tiap attempt baru",
                  },
                ].map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, urutan_mode: m.value }))
                    }
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "10px",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                      background:
                        form.urutan_mode === m.value ? "#fff3f0" : "#f2efe8",
                      outline:
                        form.urutan_mode === m.value
                          ? "2px solid #e84c2b"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color:
                          form.urutan_mode === m.value ? "#e84c2b" : "#0f0e17",
                        marginBottom: "2px",
                      }}
                    >
                      {m.label}
                    </div>
                    <div style={{ fontSize: "11px", color: "#6b6860" }}>
                      {m.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Show answer */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f0e17",
                }}
              >
                Tampilkan Pembahasan
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  {
                    value: 1,
                    label: "Ya",
                    desc: "User bisa lihat kunci & pembahasan",
                  },
                  {
                    value: 0,
                    label: "Tidak",
                    desc: "Kunci jawaban disembunyikan",
                  },
                ].map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, show_answer: m.value }))
                    }
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "10px",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                      background:
                        form.show_answer === m.value ? "#fff3f0" : "#f2efe8",
                      outline:
                        form.show_answer === m.value
                          ? "2px solid #e84c2b"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color:
                          form.show_answer === m.value ? "#e84c2b" : "#0f0e17",
                        marginBottom: "2px",
                      }}
                    >
                      {m.label}
                    </div>
                    <div style={{ fontSize: "11px", color: "#6b6860" }}>
                      {m.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "#fff3f0",
                border: "1px solid #fca5a5",
                color: "#b91c1c",
                fontSize: "13px",
                borderRadius: "10px",
                padding: "10px 14px",
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: saving ? "#f5a07a" : "#e84c2b",
              color: "white",
              fontSize: "15px",
              fontWeight: "700",
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {saving
              ? "Menyimpan..."
              : isEdit
              ? "Simpan Perubahan"
              : "Buat Set Soal"}
          </button>

          {!isEdit && (
            <p
              style={{
                fontSize: "12px",
                color: "#b4b2a9",
                textAlign: "center",
              }}
            >
              Setelah membuat set soal, kamu bisa langsung menambahkan soal di
              dalamnya.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
