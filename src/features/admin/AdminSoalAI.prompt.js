// src/features/admin/AdminSoalAI.prompt.js

export const KONTEKS_OPTIONS = [
  { value: "sekolah", label: "Soal Sekolah (Ujian/UTS/UAS)" },
  { value: "seleksi", label: "Tes Seleksi (UTBK/CPNS/OSN)" },
];

export const TIPE_OPTIONS = [
  { value: "hitungan", label: "Hitungan Murni" },
  { value: "cerita", label: "Soal Cerita / Kontekstual" },
  { value: "konsep", label: "Konsep / Teori" },
];

export const BAHASA_OPTIONS = [
  { value: "formal", label: "Formal (Buku Teks)" },
  { value: "semiformal", label: "Semi-formal (Mudah Dipahami)" },
];

export const REFERENSI_OPTIONS = [
  { value: "", label: "Tidak ada referensi khusus" },
  { value: "UN", label: "Mirip soal UN" },
  { value: "UTBK", label: "Mirip soal UTBK" },
  { value: "olimpiade", label: "Mirip soal Olimpiade" },
];

// Deskripsi tipe format soal yang dikirim ke AI
const TIPE_FORMAT_DESC = {
  pilihan_ganda: {
    label: "pilihan ganda (satu jawaban benar)",
    formatNote: `- Setiap soal memiliki tepat {jumlahPilihan} pilihan jawaban ({labels})
- Satu jawaban benar per soal, sisanya salah tapi masuk akal
- Field "answer" berisi label huruf jawaban benar (misal: "A")`,
    outputExample: (jp) => {
      const labels = ["A","B","C","D","E"].slice(0,jp);
      const opts = labels.map(l => `{"label":"${l}","text":"isi pilihan ${l}"}`).join(",");
      return `[
  {"body":"<soal 1>","options":[${opts}],"answer":"<label>","explanation":"<pembahasan>"},
  ...
]`;
    },
  },
  isian_singkat: {
    label: "isian singkat (jawaban teks bebas, biasanya 1-2 kata)",
    formatNote: `- Soal dijawab dengan tulisan bebas singkat
- Field "options" berisi array kosong []
- Field "answer" berisi string jawaban yang benar`,
    outputExample: () => `[
  {"body":"<soal 1>","options":[],"answer":"<jawaban>","explanation":"<pembahasan>"},
  ...
]`,
  },
  isian_numerik: {
    label: "isian numerik (jawaban harus berupa angka)",
    formatNote: `- Soal dijawab dengan angka saja (bisa desimal)
- Field "options" berisi array kosong []
- Field "answer" berisi string angka yang benar, tanpa satuan`,
    outputExample: () => `[
  {"body":"<soal 1>","options":[],"answer":"495","explanation":"<pembahasan>"},
  ...
]`,
  },
  checklist: {
    label: "checklist (bisa lebih dari satu jawaban benar)",
    formatNote: `- Setiap soal memiliki beberapa pilihan, bisa lebih dari satu yang benar
- Field "options" berisi array pilihan dengan label huruf
- Field "answer" berisi ARRAY label yang benar (misal: ["A","C"])`,
    outputExample: (jp) => {
      const labels = ["A","B","C","D","E"].slice(0,jp);
      const opts = labels.map(l => `{"label":"${l}","text":"pernyataan ${l}"}`).join(",");
      return `[
  {"body":"<soal 1>","options":[${opts}],"answer":["A","C"],"explanation":"<pembahasan>"},
  ...
]`;
    },
  },
  multiple_choice_table: {
    label: "tabel pernyataan (setiap baris dipilih kolom tertentu)",
    formatNote: `- Soal berisi tabel dengan beberapa pernyataan sebagai baris
- Setiap baris punya kolom pilihan (misal: Benar/Salah, atau Ya/Tidak)
- Field "options" berisi array baris: {"label":"1","text":"pernyataan","cols":["Benar","Salah"]}
- Field "answer" berisi objek: {"1":"Benar","2":"Salah",...} (label baris → kolom yang dipilih)`,
    outputExample: () => `[
  {
    "body":"<konteks soal>",
    "options":[
      {"label":"1","text":"Pernyataan pertama","cols":["Benar","Salah"]},
      {"label":"2","text":"Pernyataan kedua","cols":["Benar","Salah"]},
      {"label":"3","text":"Pernyataan ketiga","cols":["Benar","Salah"]}
    ],
    "answer":{"1":"Benar","2":"Salah","3":"Benar"},
    "explanation":"<pembahasan>"
  },
  ...
]`,
  },
  menjodohkan: {
    label: "menjodohkan (pasangkan item kiri ke item kanan)",
    formatNote: `- Soal berisi dua kolom: kiri dan kanan yang harus dipasangkan
- Field "options" berisi objek: {"left":["item kiri 1",...], "right":["item kanan 1",...]}
- Field "answer" berisi objek yang memetakan indeks kiri (0-based) ke indeks kanan (0-based): {"0":1,"1":0,...}`,
    outputExample: () => `[
  {
    "body":"<instruksi menjodohkan>",
    "options":{
      "left":["Item A","Item B","Item C"],
      "right":["Pasangan 2","Pasangan 3","Pasangan 1"]
    },
    "answer":{"0":2,"1":0,"2":1},
    "explanation":"<pembahasan>"
  },
  ...
]`,
  },
  isian_multi: {
    label: "isian multi (beberapa sub-jawaban terpisah)",
    formatNote: `- Soal memiliki beberapa bagian jawaban yang berbeda
- Field "options" berisi array sub-jawaban: {"label":"nama sub-jawaban","satuan":"cm"} (satuan boleh kosong "")
- Field "answer" berisi ARRAY string jawaban sesuai urutan options: ["nilai1","nilai2",...]`,
    outputExample: () => `[
  {
    "body":"<soal dengan beberapa sub-pertanyaan>",
    "options":[
      {"label":"Suku pertama","satuan":""},
      {"label":"Beda","satuan":""},
      {"label":"Suku ke-10","satuan":""}
    ],
    "answer":["3","4","39"],
    "explanation":"<pembahasan>"
  },
  ...
]`,
  },
};

export const buildBulkPrompt = ({
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
  jumlah = 10,
  tipeFormat = "pilihan_ganda",
}) => {
  const labels = ["A", "B", "C", "D", "E"].slice(0, jumlahPilihan);

  const konteksDesc =
    konteks === "sekolah"
      ? "Soal untuk keperluan sekolah (ujian harian/UTS/UAS)"
      : "Soal untuk tes seleksi (UTBK/OSN/CPNS)";

  const tipeLabel = TIPE_OPTIONS.find((t) => t.value === tipe)?.label || "";
  const bahasaLabel = BAHASA_OPTIONS.find((b) => b.value === bahasa)?.label || "";
  const referensiLabel = referensi
    ? REFERENSI_OPTIONS.find((r) => r.value === referensi)?.label
    : null;

  const fmt = TIPE_FORMAT_DESC[tipeFormat] || TIPE_FORMAT_DESC.pilihan_ganda;
  const formatNote = fmt.formatNote
    .replace("{jumlahPilihan}", jumlahPilihan)
    .replace("{labels}", labels.join(", "));
  const outputExample = fmt.outputExample(jumlahPilihan);

  return `Kamu adalah pembuat soal matematika profesional untuk siswa Indonesia.

Buat ${jumlah} soal matematika tipe ${fmt.label} yang BERBEDA-BEDA dengan spesifikasi berikut:
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

ATURAN FORMAT JSON:
${formatNote}

PENTING:
- Gunakan LaTeX untuk rumus matematika: $...$ untuk inline, $$...$$ untuk display
- Buat soal yang bervariasi — berbeda pendekatan, angka, dan konteks soal
- Soal harus sesuai kurikulum Indonesia untuk ${jenjang} ${subjenjang}
- OUTPUT HARUS BERUPA JSON ARRAY VALID berisi tepat ${jumlah} objek soal
- Tidak ada teks lain di luar array, tidak ada markdown code block

Format output yang diharapkan:
${outputExample}`;
};

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
          jenjang === "UTBK"
            ? "UTBK"
            : jenjang === "CPNS"
            ? "CPNS"
            : jenjang === "OSN"
            ? "OSN"
            : "tes seleksi"
        })`;

  const tipeLabel = TIPE_OPTIONS.find((t) => t.value === tipe)?.label || "";
  const bahasaLabel =
    BAHASA_OPTIONS.find((b) => b.value === bahasa)?.label || "";
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
