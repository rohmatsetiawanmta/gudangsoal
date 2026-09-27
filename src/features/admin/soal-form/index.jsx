// src/features/admin/soal-form/index.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, ArrowLeft, Save, PlusCircle, Globe, EyeOff as Unpublish, Tag, X } from "lucide-react";
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
  const location = useLocation();
  const isEdit = !!id;
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    ...defaultForm,
    ...((!isEdit && searchParams.get("subtopik")) ? { subtopik_id: searchParams.get("subtopik") } : {}),
  });
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
  const [materiList, setMateriList] = useState([]);
  const [isPublished, setIsPublished] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");

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
        const imp = location.state?.importData;

        // Use import data for content fields if present, else use DB data
        const tipe = imp?.tipe ?? data.tipe ?? "pilihan_ganda";
        let answer = imp?.answer ?? data.answer;
        if (tipe === "menjodohkan" && Array.isArray(answer)) {
          const obj = {};
          answer.forEach((rIdx, lIdx) => { obj[String(lIdx)] = String(rIdx); });
          answer = obj;
        }

        setIsPublished(data.is_published == 1);
        setForm({
          subtopik_id:           data.subtopik_id,
          tipe,
          body:                  imp?.body ?? data.body,
          options:               imp?.options ?? data.options,
          answer,
          explanation:           imp?.explanation ?? data.explanation ?? "",
          difficulty:            imp?.difficulty ?? data.difficulty,
          video_url:             imp?.video_url ?? data.video_url ?? "",
          is_public_explanation: data.is_public_explanation ?? 0,
          materi_ids:            imp ? (Array.isArray(imp.materi_ids) ? imp.materi_ids : []) : (Array.isArray(data.materi_ids) ? data.materi_ids : []),
          tags:                  imp ? (Array.isArray(imp.tags) ? imp.tags : []) : (Array.isArray(data.tags) ? data.tags : []),
        });

        // Reconstruct selected dari subtopik_id
        const subtopik = struktur.subtopik.find((s) => s.id == data.subtopik_id);
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

        // Clear import state so refresh doesn't re-apply it
        if (imp) navigate(location.pathname, { replace: true, state: null });
      })
      .catch(() => setError("Gagal memuat soal"));
  }, [id, struktur.subtopik.length]);

  // Fetch materi saat subtopik_id berubah
  useEffect(() => {
    if (!form.subtopik_id) { setMateriList([]); return; }
    api.get(`/admin/materi?subtopik_id=${form.subtopik_id}&limit=100`)
      .then(data => setMateriList(Array.isArray(data?.data) ? data.data : []))
      .catch(() => setMateriList([]));
  }, [form.subtopik_id]);

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

  const handleTogglePublish = async () => {
    setPublishLoading(true);
    try {
      const res = await api.put(`/admin/publish/soal?id=${id}`);
      setIsPublished(res.is_published);
    } catch {
      alert("Gagal mengubah status publikasi");
    } finally {
      setPublishLoading(false);
    }
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
        window.close();
        navigate("/admin/soal");
      } else {
        await api.post("/admin/soal", form);
        navigate("/admin/soal");
      }
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
          opacity: 0.06, userSelect: "none", lineHeight: 1,
          pointerEvents: "none", color: "white",
        }}>
          <PlusCircle size={isMobile ? 80 : 110} />
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
                letterSpacing: "-0.4px", margin: "0 0 8px",
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
          {/* Subtopik */}
          <SectionCard label="Subtopik" accent="#7c3aed" isMobile={isMobile}>
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

          {/* Materi Terkait */}
          {materiList.length > 0 && (
            <SectionCard label="Materi Terkait" accent="#1a8a6e" isMobile={isMobile}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <p style={{ fontSize: "12px", color: "#6b6860", margin: 0 }}>
                  Pilih materi dari subtopik ini yang relevan dengan soal.
                </p>
                {materiList.map(m => {
                  const checked = (form.materi_ids || []).includes(m.id);
                  return (
                    <label key={m.id} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "8px 10px", borderRadius: "10px", border: `1.5px solid ${checked ? "#1a8a6e" : "#e2ddd5"}`, background: checked ? "#e4f5f0" : "white", transition: "all .12s" }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const ids = form.materi_ids || [];
                          setForm(f => ({ ...f, materi_ids: checked ? ids.filter(x => x !== m.id) : [...ids, m.id] }));
                        }}
                        style={{ accentColor: "#1a8a6e", width: "15px", height: "15px", flexShrink: 0 }}
                      />
                      <span style={{ fontSize: "13px", fontWeight: checked ? "600" : "400", color: "#0f0e17", lineHeight: 1.4 }}>{m.judul}</span>
                    </label>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {/* Tags */}
          <SectionCard label="Tags" accent="#7c3aed" isMobile={isMobile}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontSize: "12px", color: "#6b6860", margin: 0 }}>
                Tambah tag seperti "OSK SMA 2025", "UTBK 2024", "OSN Matematika". Enter atau koma untuk konfirmasi.
              </p>
              {/* Chip list */}
              {(form.tags || []).length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {(form.tags || []).map((tag, i) => (
                    <span key={i} style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      padding: "4px 10px", borderRadius: "99px",
                      background: "#ede9fe", border: "1px solid #c4b5fd",
                      fontSize: "12px", fontWeight: "600", color: "#6d28d9",
                    }}>
                      <Tag size={10} />
                      {tag}
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, tags: f.tags.filter((_, j) => j !== i) }))}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "0 0 0 2px", lineHeight: 1, color: "#7c3aed", display: "flex", alignItems: "center" }}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {/* Input */}
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const val = tagInput.trim().replace(/,$/, "");
                      if (val && !(form.tags || []).includes(val)) {
                        setForm(f => ({ ...f, tags: [...(f.tags || []), val] }));
                      }
                      setTagInput("");
                    } else if (e.key === "Backspace" && !tagInput && (form.tags || []).length > 0) {
                      setForm(f => ({ ...f, tags: f.tags.slice(0, -1) }));
                    }
                  }}
                  placeholder="Ketik tag lalu Enter..."
                  style={{
                    flex: 1, padding: "9px 12px", borderRadius: "9px",
                    border: "1.5px solid #e2ddd5", fontSize: "13px",
                    fontFamily: "inherit", outline: "none",
                  }}
                  onFocus={e => e.target.style.borderColor = "#7c3aed"}
                  onBlur={e => {
                    e.target.style.borderColor = "#e2ddd5";
                    const val = tagInput.trim().replace(/,$/, "");
                    if (val && !(form.tags || []).includes(val)) {
                      setForm(f => ({ ...f, tags: [...(f.tags || []), val] }));
                      setTagInput("");
                    }
                  }}
                />
              </div>
            </div>
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
            {isEdit && (
              <button
                type="button"
                onClick={handleTogglePublish}
                disabled={publishLoading}
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "11px 20px", borderRadius: "10px",
                  border: isPublished ? "1px solid #d4d0c8" : "none",
                  background: isPublished ? "white" : "#1a8a6e",
                  color: isPublished ? "#6b6860" : "white",
                  fontSize: "14px", fontWeight: "600",
                  cursor: publishLoading ? "not-allowed" : "pointer",
                  fontFamily: "inherit", opacity: publishLoading ? 0.7 : 1,
                  transition: "all .15s",
                }}
                onMouseEnter={e => { if (!publishLoading) { e.currentTarget.style.background = isPublished ? "#f2efe8" : "#157a5e"; e.currentTarget.style.borderColor = isPublished ? "#0f0e17" : "transparent"; } }}
                onMouseLeave={e => { e.currentTarget.style.background = isPublished ? "white" : "#1a8a6e"; e.currentTarget.style.borderColor = isPublished ? "#d4d0c8" : "transparent"; }}
              >
                {publishLoading ? "..." : isPublished ? <><Unpublish size={14} /> Unpublish</> : <><Globe size={14} /> Publish</>}
              </button>
            )}
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
