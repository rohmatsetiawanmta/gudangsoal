// src/features/admin/AdminSoalAI.prompt.js

export const KONTEKS_OPTIONS = [
  { value: "sekolah", label: "Soal Sekolah (Ujian/UTS/UAS)" },
  { value: "seleksi", label: "Tes Seleksi (UTBK/CPNS/OSN)" },
];

export const TIPE_OPTIONS = [
  { value: "hitungan", label: "Hitungan Murni" },
  { value: "cerita",   label: "Soal Cerita / Kontekstual" },
  { value: "konsep",   label: "Konsep / Teori" },
];

export const BAHASA_OPTIONS = [
  { value: "formal",     label: "Formal (Buku Teks)" },
  { value: "semiformal", label: "Semi-formal (Mudah Dipahami)" },
];

export const REFERENSI_OPTIONS = [
  { value: "",          label: "Tidak ada referensi khusus" },
  { value: "UN",        label: "Mirip soal UN" },
  { value: "UTBK",      label: "Mirip soal UTBK" },
  { value: "olimpiade", label: "Mirip soal Olimpiade" },
];

export const buildPrompt = ({
  jenjang,
  subjenjang,
  mapel,
  topik,
  subtopik,
  diffLabel,
  konteks,
  jumlahPilihan,
  tipe,
  bahasa,
  referensi,
  instruction,
}) => {
  const labels = ["A", "B", "C", "D", "E"].slice(0, jumlahPilihan);
  const optionsDesc = labels
    .map((l) => `{"label": "${l}", "text": "isi pilihan ${l}"}`)
    .join(", ");

  const konteksDesc =
    konteks === "sekolah"
      ? "Soal untuk keperluan sekolah (ujian harian/UTS/UAS)"
      : `Soal untuk tes seleksi (${
          jenjang === "UTBK" ? "UTBK"
          : jenjang === "CPNS" ? "CPNS"
          : jenjang === "OSN"  ? "OSN"
          : "tes seleksi"
        })`;

  const tipeLabel      = TIPE_OPTIONS.find((t) => t.value === tipe)?.label || "";
  const bahasaLabel    = BAHASA_OPTIONS.find((b) => b.value === bahasa)?.label || "";
  const referensiLabel = referensi
    ? REFERENSI_OPTIONS.find((r) => r.value === referensi)?.label
    : null;

  return `Kamu adalah pembuat soal matematika profesional untuk siswa Indonesia.

Buat 1 soal matematika pilihan ganda dengan spesifikasi berikut:
- Jenjang: ${jenjang}
- Kelas/Rumpun: ${subjenjang}
- Mata Pelajaran: ${mapel}
- Topik: ${topik}
- Subtopik: ${subtopik}
- Tingkat Kesulitan: ${diffLabel}
- Konteks: ${konteksDesc}
- Tipe soal: ${tipeLabel}
- Gaya bahasa: ${bahasaLabel}
${referensiLabel ? `- Referensi: ${referensiLabel}` : ""}
${instruction ? `- Instruksi tambahan: ${instruction}` : ""}

PENTING:
- Gunakan LaTeX untuk rumus dengan format $...$ untuk inline dan $$...$$ untuk display
- Berikan tepat ${jumlahPilihan} pilihan jawaban (${labels.join(", ")})
- Satu jawaban benar, sisanya salah tapi masuk akal
- OUTPUT HARUS BERUPA JSON VALID SAJA, tidak ada teks lain sebelum atau sesudah JSON
- Jangan gunakan markdown code block

Output JSON:
{"body":"<soal>","options":[${optionsDesc}],"answer":"<label jawaban benar>","explanation":"<pembahasan langkah per langkah>"}`;
};
