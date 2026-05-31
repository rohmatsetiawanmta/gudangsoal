// src/features/admin/soal-form/index.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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
import AdminSoalAI from "../AdminSoalAI";
import AdminSoalImport from "../AdminSoalImport";

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
        setForm({
          subtopik_id: data.subtopik_id,
          tipe: data.tipe || "pilihan_ganda",
          body: data.body,
          options: data.options,
          answer: data.answer,
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

  return (
    <div>
      <Helmet>
        <title>{`${
          isEdit ? "Edit Soal" : "Tambah Soal"
        } | Admin Gudang Soal`}</title>
      </Helmet>

      {/* Header */}
      <div
        style={{
          marginBottom: "28px",
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          gap: isMobile ? "14px" : "0",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: isMobile ? "22px" : "24px",
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

        {/* Tombol AI + Import */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexDirection: isMobile ? "column" : "row",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <AdminSoalAI
            form={form}
            setForm={setForm}
            struktur={struktur}
            selected={selected}
            isMobile={isMobile}
          />
          <AdminSoalImport setForm={setForm} isMobile={isMobile} />
        </div>
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
          <LokasiSoal
            form={form}
            setForm={setForm}
            struktur={struktur}
            selected={selected}
            setSelected={setSelected}
            loadingStruktur={loadingStruktur}
            isMobile={isMobile}
          />

          <TeksSoal form={form} setForm={setForm} isMobile={isMobile} />

          {/* Answer input per tipe */}
          {form.tipe === "pilihan_ganda" && (
            <div
              style={{
                background: "white",
                borderRadius: "14px",
                border: "1px solid #e2ddd5",
                padding: isMobile ? "20px 16px" : "24px",
              }}
            >
              <PilihanGanda form={form} setForm={setForm} />
            </div>
          )}
          {(form.tipe === "isian_singkat" || form.tipe === "isian_numerik") && (
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
                Kunci Jawaban
              </div>
              <IsianInput form={form} setForm={setForm} />
            </div>
          )}
          {form.tipe === "checklist" && (
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
                Pilihan Jawaban
              </div>
              <ChecklistInput form={form} setForm={setForm} />
            </div>
          )}
          {form.tipe === "multiple_choice_table" && (
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
                Tabel Pernyataan
              </div>
              <MCTInput form={form} setForm={setForm} />
            </div>
          )}
          {form.tipe === "menjodohkan" && (
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
                Pasangan Jawaban
              </div>
              <MenjodohkanInput
                form={form}
                setForm={setForm}
                isMobile={isMobile}
              />
            </div>
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
        {(!isMobile || showPreview) && (
          <div
            style={{ position: isMobile ? "static" : "sticky", top: "24px" }}
          >
            <PreviewPanel form={form} />
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
