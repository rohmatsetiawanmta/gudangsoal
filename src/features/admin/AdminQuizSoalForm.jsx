// src/features/admin/AdminQuizSoalForm.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";
import useWindowWidth from "../../hooks/useWindowWidth";
import api from "../../lib/api";

import { defaultForm } from "./soal-form/constants";
import PreviewPanel from "./soal-form/PreviewPanel";
import LokasiSoal from "./soal-form/FormSections/LokasiSoal";
import TeksSoal from "./soal-form/FormSections/TeksSoal";
import Pembahasan from "./soal-form/FormSections/Pembahasan";
import PembahasanPublik from "./soal-form/FormSections/PembahasanPublik";
import Video from "./soal-form/FormSections/Video";
import PilihanGanda from "./soal-form/AnswerInput/PilihanGanda";
import IsianInput from "./soal-form/AnswerInput/IsianInput";
import ChecklistInput from "./soal-form/AnswerInput/ChecklistInput";
import MCTInput from "./soal-form/AnswerInput/MCTInput";
import MenjodohkanInput from "./soal-form/AnswerInput/MenjodohkanInput";
import IsianMultiInput from "./soal-form/AnswerInput/IsianMultiInput";
import { adminAddQuizSoal, adminUpdateQuizSoal } from "../quiz/quizApi";

export default function AdminQuizSoalForm() {
  const navigate = useNavigate();
  const { id: quizId, soal_id } = useParams();
  const isEdit = !!soal_id;
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
  const [loadingStruktur, setLoadingStruktur] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
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

  // Load soal saat edit
  useEffect(() => {
    if (!isEdit || !struktur.subtopik.length) return;
    api
      .get(`/admin/soal/detail?id=${soal_id}`)
      .then((data) => {
        let answer = data.answer;
        if (data.tipe === "menjodohkan" && Array.isArray(answer)) {
          const obj = {};
          answer.forEach((rIdx, lIdx) => {
            obj[String(lIdx)] = String(rIdx);
          });
          answer = obj;
        }
        if (data.tipe === "isian_multi" && Array.isArray(answer)) {
          const obj = {};
          answer.forEach((val, idx) => {
            obj[idx] = val;
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
          difficulty: parseInt(data.difficulty),
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
      .catch(() => setError("Gagal memuat soal"))
      .finally(() => setLoadingData(false));
  }, [soal_id, struktur.subtopik.length]);

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
    } else if (form.tipe === "menjodohkan") {
      const opts = form.options;
      if (!opts?.left?.length || !opts?.right?.length)
        return "Kolom kiri dan kanan harus diisi";
      if (!form.answer || Object.keys(form.answer).length === 0)
        return "Tentukan pasangan jawaban";
    } else if (form.tipe === "isian_multi") {
      if (!Array.isArray(form.options) || form.options.length === 0)
        return "Tambah minimal satu sub-jawaban";
      if (!form.options.every((o) => o.label.trim()))
        return "Semua label sub-jawaban harus diisi";
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
        await adminUpdateQuizSoal(quizId, soal_id, form);
      } else {
        await adminAddQuizSoal(quizId, form);
      }
      navigate(`/admin/latihan/${quizId}`);
    } catch (err) {
      setError(err.error || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData)
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#6b6860" }}>
        Memuat...
      </div>
    );

  const answerInputStyle = {
    background: "white",
    borderRadius: "14px",
    border: "1px solid #e2ddd5",
    padding: isMobile ? "20px 16px" : "24px",
  };

  const sectionTitle = (title) => (
    <div
      style={{
        fontSize: "14px",
        fontWeight: "700",
        color: "#0f0e17",
        marginBottom: "16px",
      }}
    >
      {title}
    </div>
  );

  return (
    <div>
      <Helmet>
        <title>{`${
          isEdit ? "Edit" : "Tambah"
        } Soal | Admin Gudang Soal`}</title>
      </Helmet>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <button
          onClick={() => navigate(`/admin/latihan/${quizId}`)}
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
            marginBottom: "12px",
          }}
        >
          <ChevronLeft size={15} /> Kembali ke Set Soal
        </button>
        <h1
          style={{
            fontSize: isMobile ? "20px" : "22px",
            fontWeight: "800",
            color: "#0f0e17",
            letterSpacing: "-0.5px",
          }}
        >
          {isEdit ? "Edit Soal" : "Tambah Soal"}
        </h1>
        <p style={{ fontSize: "13px", color: "#b4b2a9", marginTop: "4px" }}>
          Soal ini eksklusif untuk set latihan dan tidak muncul di direktori
          soal.
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
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
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
          <LokasiSoal
            form={form}
            setForm={setForm}
            struktur={struktur}
            selected={selected}
            setSelected={setSelected}
            loadingStruktur={loadingStruktur}
            isMobile={isMobile}
          />

          {/* Teks soal + difficulty + tipe */}
          <TeksSoal form={form} setForm={setForm} isMobile={isMobile} />

          {/* Answer input per tipe */}
          {form.tipe === "pilihan_ganda" && (
            <div style={answerInputStyle}>
              <PilihanGanda form={form} setForm={setForm} />
            </div>
          )}
          {(form.tipe === "isian_singkat" || form.tipe === "isian_numerik") && (
            <div style={answerInputStyle}>
              {sectionTitle("Kunci Jawaban")}
              <IsianInput form={form} setForm={setForm} />
            </div>
          )}
          {form.tipe === "checklist" && (
            <div style={answerInputStyle}>
              {sectionTitle("Pilihan Jawaban")}
              <ChecklistInput form={form} setForm={setForm} />
            </div>
          )}
          {form.tipe === "multiple_choice_table" && (
            <div style={answerInputStyle}>
              {sectionTitle("Tabel Pernyataan")}
              <MCTInput form={form} setForm={setForm} />
            </div>
          )}
          {form.tipe === "menjodohkan" && (
            <div style={answerInputStyle}>
              {sectionTitle("Pasangan Jawaban")}
              <MenjodohkanInput
                form={form}
                setForm={setForm}
                isMobile={isMobile}
              />
            </div>
          )}
          {form.tipe === "isian_multi" && (
            <IsianMultiInput form={form} setForm={setForm} />
          )}

          <Pembahasan form={form} setForm={setForm} isMobile={isMobile} />
          <PembahasanPublik form={form} setForm={setForm} isMobile={isMobile} />
          <Video form={form} setForm={setForm} isMobile={isMobile} />

          {/* Mobile: toggle preview */}
          {isMobile && (
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #e2ddd5",
                background: "white",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
                color: "#0f0e17",
              }}
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPreview ? "Sembunyikan Preview" : "Lihat Preview"}
            </button>
          )}

          {/* Actions */}
          <div
            style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              onClick={() => navigate(`/admin/latihan/${quizId}`)}
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
        {(!isMobile || showPreview) && (
          <div
            style={{ position: isMobile ? "static" : "sticky", top: "24px" }}
          >
            <PreviewPanel form={form} />
          </div>
        )}
      </div>
    </div>
  );
}
