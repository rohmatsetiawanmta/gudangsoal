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

export const checkCorrect = (tipe, chosen, answer) => {
  if (!chosen || answer === undefined || answer === null) return false;
  switch (tipe) {
    case "pilihan_ganda":
      return chosen === answer;
    case "isian_singkat":
      return (
        chosen.trim().toLowerCase() === String(answer).trim().toLowerCase()
      );
    case "isian_numerik":
      return parseFloat(chosen) === parseFloat(answer);
    case "checklist":
      if (!Array.isArray(chosen) || !Array.isArray(answer)) return false;
      return (
        chosen.length === answer.length &&
        [...chosen].sort().join(",") === [...answer].sort().join(",")
      );
    case "multiple_choice_table":
      if (typeof chosen !== "object" || typeof answer !== "object")
        return false;
      return JSON.stringify(chosen) === JSON.stringify(answer);

    case "menjodohkan":
      if (typeof chosen !== "object" || typeof answer !== "object")
        return false;
      const leftIds = Object.keys(answer);
      return leftIds.every((leftId) => chosen[leftId] === answer[leftId]);

    default:
      return chosen === answer;
  }
};

export const normalizeMenjodohkan = (options) => {
  if (!options) return { left: [], right: [] };
  const raw = typeof options === "string" ? JSON.parse(options) : options;
  return {
    left: (raw.left || []).map((item) =>
      typeof item === "string" ? item : item?.text || ""
    ),
    right: (raw.right || []).map((item) =>
      typeof item === "string" ? item : item?.text || ""
    ),
  };
};

export const formatAnswer = (tipe, answer) => {
  if (answer === null || answer === undefined) return "—";
  switch (tipe) {
    case "checklist":
      return Array.isArray(answer) ? answer.join(", ") : String(answer);
    case "multiple_choice_table":
      if (typeof answer === "object" && !Array.isArray(answer)) {
        return Object.entries(answer)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
      }
      return String(answer);
    case "menjodohkan":
      if (typeof chosen !== "object" || typeof answer !== "object")
        return false;
      const leftCount = Object.keys(answer).length;
      if (Object.keys(chosen).length !== leftCount) return false;
      return Object.keys(answer).every(
        (k) => String(chosen[k]) === String(answer[k])
      );
    default:
      return String(answer);
  }
};

export const initChosen = (tipe) => {
  switch (tipe) {
    case "checklist":
      return [];
    case "multiple_choice_table":
      return {};
    case "menjodohkan":
      return {};
    default:
      return "";
  }
};

export const KATEGORI_REPORT = [
  { value: "soal_salah", label: "Soal salah / ambigu" },
  { value: "jawaban_salah", label: "Jawaban salah" },
  { value: "pembahasan_salah", label: "Pembahasan salah" },
  { value: "typo", label: "Typo / salah ketik" },
  { value: "latex_error", label: "Rumus LaTeX error" },
  { value: "duplikat", label: "Soal duplikat" },
  { value: "lainnya", label: "Lainnya" },
];

export function DifficultyBadge({ level }) {
  const map = {
    1: { label: "Easy", color: "#1a8a6e", bg: "#e4f5f0" },
    2: { label: "Medium", color: "#854F0B", bg: "#faeeda" },
    3: { label: "Hard", color: "#e84c2b", bg: "#fff3f0" },
  };
  const d = map[level] || map[1];
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: "700",
        padding: "3px 8px",
        borderRadius: "6px",
        background: d.bg,
        color: d.color,
      }}
    >
      {d.label}
    </span>
  );
}
