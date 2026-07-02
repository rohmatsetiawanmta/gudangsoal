// src/features/admin/soal-form/constants.js

export const LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export const emptyOption = (label) => ({ label, text: "" });

export const TIPE_SOAL = [
  { value: "pilihan_ganda", label: "Pilihan Ganda" },
  { value: "isian_singkat", label: "Isian Singkat" },
  { value: "isian_numerik", label: "Isian Numerik" },
  { value: "checklist", label: "Checklist" },
  { value: "multiple_choice_table", label: "Multiple Choice Table" },
  { value: "menjodohkan", label: "Menjodohkan" },
  { value: "isian_multi", label: "Isian Multi" },
];

export const DIFFICULTY_MAP = {
  1: { label: "Easy", color: "#1a8a6e", bg: "#e4f5f0" },
  2: { label: "Medium", color: "#854F0B", bg: "#faeeda" },
  3: { label: "Hard", color: "#e84c2b", bg: "#fff3f0" },
};

export const defaultForm = {
  subtopik_id: "",
  tipe: "pilihan_ganda",
  body: "",
  options: LABELS.slice(0, 4).map(emptyOption),
  answer: "",
  explanation: "",
  difficulty: 1,
  video_url: "",
  is_public_explanation: 0,
  materi_ids: [],
};

export const getYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};
