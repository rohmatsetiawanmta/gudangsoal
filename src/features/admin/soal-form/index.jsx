// src/features/admin/soal-form/index.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, ArrowLeft, Save, PlusCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import api from "../../../lib/api";
import useWindowWidth from "../../../hooks/useWindowWidth";

import { defaultForm } from "./constants";
import PreviewPanel from "./PreviewPanel";
import LokasiSoal from "./FormSections/LokasiSoal";
import TeksSoal from "./FormSections/TeksSoal";
import Pembahasan from "./FormSections/Pembahasan";
import PembahasanPublik from "./FormSections/PembahasanPublik";
import Video from "./FormSections/Video";
import PilihanGanda from "./AnswerInput/PilihanGanda";
import IsianInput from "./AnswerInput/IsianInput";
import ChecklistInput from "./AnswerInput/ChecklistInput";
import MCTInput from "./AnswerInput/MCTInput";
import MenjodohkanInput from "./AnswerInput/MenjodohkanInput";
import IsianMultiInput from "./AnswerInput/IsianMultiInput";
import AdminSoalImport from "../AdminSoalImport";

// ── Section card wrapper ──────────────────────────────────────────────────────

function SectionCard({ label, accent, children, isMobile, noPad }) {
  return (
    <div style={{
      background: "white",
      borderRadius: "14px",
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
      <div style={noPad ? {} : { padding: isMobile ? "16px" : "20px" }}>
        {children}
      </div>
    </div>
  );
}

const TIPE_ANSWER_LABEL = {
  pilihan_ganda: "Pilihan Jawaban",
  isian_singkat: "Kunci Jawaban",
  isian_numerik: "Kunci Jawaban",
  checklist: "Pilihan Jawaban",
  multiple_choice_table: "Tabel Pernyataan",
  menjodohkan: "Pasangan Jawaban",
  isian_multi: "Sub-jawaban",
};

export default function AdminSoalForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const width = useWindowWidth();
  const isMobile = width <= 480;

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
  const [showPreview, setShowPreview] = useState(false);

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
    if (!isEdit || !struktur.subtopik.length) return;
    api
      .get(`/admin/soal/detail?id=${id}`)
      .then((data) => {
        let answer = data.answer;
        if (data.tipe === "menjodohkan" && Array.isArray(answer)) {
          const obj = {};
          answer.forEach((rIdx, lIdx) => {
            obj[String(lIdx)] = String(rIdx);
          });
          answer = obj;
        }

        setForm({
          subtopik_id: data.subtopik_id,
          tipe: data.tipe || "pilihan_ganda",
          body: data.body,
          options: data.options,
          answer: answer,
          explanation: data.explanation || "",
          difficulty: data.difficulty,
          video_url: data.video_url || "",
          is_public_explanation: data.is_public_explanation ?? 0,
        });

        // Reconstruct selected dari subtopik_id
        const subtopik = struktur.subtopik.find(
          (s) => s.id == data.subtopik_id
        );
        if (!subtopik) return;
        const topik = struktur.topik.find((t) => t.id == subtopik.topik_id);
        if (!topik) return;
        const mapel = struktur.mapel.find((m) => m.id == topik.mapel_id);
        if (!mapel) return;
        const sj = struktur.subjenjang.find((s) => s.id == mapel.subjenjang_id);
        if (!sj) return;
        setSelected({
          jenjang: sj.jenjang_id,
          subjenjang: sj.id,
          mapel: mapel.id,
          topik: topik.id,
        });
      })
      .catch(() => setError("Gagal memuat soal"));
  }, [id, struktur.subtopik.length]);

  const validate = () => {
    if (!form.subtopik_id) return "Pilih subtopik terlebih dahulu";
    if (!form.body.trim()) return "Isi soal tidak boleh kosong";

    if (form.tipe === "pilihan_ganda") {
      if (form.options.some((o) => !o.text.trim()))
        return "Semua pilihan jawaban harus diisi";
      if (!form.answer) return "Pilih jawaban yang benar";
    } else if (form.tipe === "isian_singkat" || form.tipe === "isian_numerik") {
      if (!form.answer) return "Kunci jawaban tidak boleh kosong";
      if (form.tipe === "isian_numerik" && isNaN(Number(form.answer)))
        return "Jawaban harus berupa angka";
    } else if (form.tipe === "checklist") {
      if (form.options.some((o) => !o.text.trim()))
        return "Semua pilihan harus diisi";
      if (!Array.isArray(form.answer) || form.answer.length === 0)
        return "Pilih minimal satu jawaban benar";
    } else if (form.tipe === "multiple_choice_table") {
      if (form.options.some((o) => !o.text.trim()))
        return "Semua pernyataan harus diisi";
      const unanswered = form.options.filter((o) => !form.answer?.[o.label]);
      if (unanswered.length > 0)
        return "Semua pernyataan harus dipilih jawabannya";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
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

  const answerLabel = TIPE_ANSWER_LABEL[form.tipe] || "Jawaban";

  return (
    <div>
      <Helmet>
        <title>{`${isEdit ? "Edit Soal" : "Tambah Soal"} | Admin Gudang Soal`}</title>
      </Helmet>

      {/* ── Hero header ── */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 60%, #2c1810 100%)",
        padding: isMobile ? "24px 20px" : "28px 32px",
        marginBottom: "28px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* watermark */}
        <div style={{
          position: "absolute", right: isMobile ? "-10px" : "32px", top: "50%",
          transform: "translateY(-50%)",
          fontSize: isMobile ? "72px" : "100px",
          fontWeight: "900", color: "rgba(255,255,255,.03)",
          letterSpacing: "-4px", userSelect: "none", lineHeight: 1,
          pointerEvents: "none",
        }}>
          {isEdit ? "EDIT" : "NEW"}
        </div>

        <div style={{
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: "16px",
          position: "relative", zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* back button */}
            <button
              type="button"
              onClick={() => navigate("/admin/soal")}
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
                {isEdit ? "Edit Soal" : "Tambah Soal"}
              </h1>
            </div>
          </div>

          {/* Import JSON button */}
          <div style={{ width: isMobile ? "100%" : "auto" }}>
            <AdminSoalImport setForm={setForm} isMobile={isMobile} />
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

      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: "24px",
        alignItems: "start",
      }}>
        {/* Kiri — Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {/* Lokasi soal */}
          <SectionCard label="Lokasi Soal" accent="#7c3aed" isMobile={isMobile}>
            <LokasiSoal
              form={form} setForm={setForm}
              struktur={struktur} selected={selected} setSelected={setSelected}
              loadingStruktur={loadingStruktur} isMobile={isMobile}
            />
          </SectionCard>

          {/* Teks soal */}
          <SectionCard label="Teks Soal" accent="#2563eb" isMobile={isMobile}>
            <TeksSoal form={form} setForm={setForm} isMobile={isMobile} />
          </SectionCard>

          {/* Answer input per tipe */}
          {form.tipe !== "isian_multi" && (
            <SectionCard label={answerLabel} accent="#e84c2b" isMobile={isMobile}>
              {form.tipe === "pilihan_ganda" && (
                <PilihanGanda form={form} setForm={setForm} />
              )}
              {(form.tipe === "isian_singkat" || form.tipe === "isian_numerik") && (
                <IsianInput form={form} setForm={setForm} />
              )}
              {form.tipe === "checklist" && (
                <ChecklistInput form={form} setForm={setForm} />
              )}
              {form.tipe === "multiple_choice_table" && (
                <MCTInput form={form} setForm={setForm} />
              )}
              {form.tipe === "menjodohkan" && (
                <MenjodohkanInput form={form} setForm={setForm} isMobile={isMobile} />
              )}
            </SectionCard>
          )}
          {form.tipe === "isian_multi" && (
            <IsianMultiInput form={form} setForm={setForm} />
          )}

          {/* Pembahasan */}
          <SectionCard label="Pembahasan" accent="#1a8a6e" isMobile={isMobile}>
            <Pembahasan form={form} setForm={setForm} isMobile={isMobile} />
          </SectionCard>

          {/* Pembahasan publik + video — tanpa label, accent subtle */}
          <SectionCard accent="#f5a623" isMobile={isMobile}>
            <PembahasanPublik form={form} setForm={setForm} isMobile={isMobile} />
          </SectionCard>

          <SectionCard accent="#b4b2a9" isMobile={isMobile}>
            <Video form={form} setForm={setForm} isMobile={isMobile} />
          </SectionCard>

          {/* Mobile: toggle preview */}
          {isMobile && (
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "8px", padding: "12px", borderRadius: "12px",
                border: "1px solid #e2ddd5", background: "white",
                fontSize: "14px", fontWeight: "600", cursor: "pointer",
                fontFamily: "inherit", color: "#0f0e17",
              }}
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPreview ? "Sembunyikan Preview" : "Lihat Preview"}
            </button>
          )}

          {/* Actions */}
          <div style={{
            display: "flex", gap: "10px", justifyContent: "flex-end",
            paddingTop: "4px",
          }}>
            <button
              type="button"
              onClick={() => navigate("/admin/soal")}
              style={{
                padding: "11px 24px", borderRadius: "10px",
                border: "1px solid #e2ddd5", background: "white",
                fontSize: "14px", fontWeight: "600", cursor: "pointer",
                fontFamily: "inherit", color: "#0f0e17",
                transition: "all .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f2efe8"; e.currentTarget.style.borderColor = "#0f0e17"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2ddd5"; }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: "8px", padding: "11px 24px", borderRadius: "10px",
                border: "none",
                background: loading ? "#f5a07a" : "#e84c2b",
                color: "white", fontSize: "14px", fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit", minWidth: "148px",
                transition: "opacity .15s",
              }}
            >
              {loading ? (
                "Menyimpan..."
              ) : isEdit ? (
                <><Save size={15} /> Simpan Perubahan</>
              ) : (
                <><PlusCircle size={15} /> Tambah Soal</>
              )}
            </button>
          </div>
        </form>

        {/* Kanan — Preview */}
        {(!isMobile || showPreview) && (
          <div style={{ position: isMobile ? "static" : "sticky", top: "24px" }}>
            <PreviewPanel form={form} />
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
