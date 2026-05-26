// src/lib/constants.js
import {
  School,
  Ruler,
  BarChart2,
  Target,
  Landmark,
  Trophy,
} from "lucide-react";

export const FALLBACK_JENJANG = [
  { id: "sd", label: "SD", icon: School, color: "#e84c2b" },
  { id: "smp", label: "SMP", icon: Ruler, color: "#2563eb" },
  { id: "sma", label: "SMA", icon: BarChart2, color: "#1a8a6e" },
  { id: "utbk", label: "UTBK", icon: Target, color: "#f5a623" },
  { id: "cpns", label: "CPNS", icon: Landmark, color: "#7c3aed" },
  { id: "osn", label: "OSN", icon: Trophy, color: "#db2777" },
];

export const FALLBACK_TOPICS = {
  sd: [
    "Bilangan",
    "Pecahan",
    "Geometri Dasar",
    "Pengukuran",
    "Statistika Dasar",
  ],
  smp: [
    "Aljabar",
    "Persamaan Linear",
    "Fungsi",
    "Geometri",
    "Statistika",
    "Peluang",
  ],
  sma: [
    "Kalkulus",
    "Trigonometri",
    "Matriks",
    "Vektor",
    "Peluang",
    "Statistika",
    "Barisan & Deret",
  ],
  utbk: ["Penalaran Matematika", "Literasi Matematika"],
  cpns: ["TIU Numerik", "Deret Angka", "Perbandingan", "Logika Matematika"],
  osn: [
    "Aljabar Olimpiade",
    "Kombinatorika",
    "Teori Bilangan",
    "Geometri Olimpiade",
  ],
};

export const QUIZ_MODES = {
  FREE: "free",
  TIMED: "timed",
};

export const DEFAULT_QUESTION_COUNT = 10;
export const DEFAULT_TIME_PER_QUESTION = 90;

export const XP_VALUES = {
  CORRECT_ANSWER: 10,
  SPEED_BONUS: 5,
  DAILY_STREAK: 20,
  PERFECT_SCORE: 50,
  NEW_BADGE: 100,
};

export const BADGES = [
  {
    id: "first_quiz",
    label: "Langkah Pertama",
    desc: "Selesaikan kuis pertama",
  },
  {
    id: "streak_7",
    label: "Seminggu Penuh",
    desc: "Streak 7 hari berturut-turut",
  },
  { id: "perfect_score", label: "Sempurna", desc: "Skor 100% dalam satu sesi" },
  { id: "hundred_correct", label: "Centurion", desc: "100 soal dijawab benar" },
  { id: "speed_demon", label: "Kilat", desc: "Jawab 10 soal dalam < 5 menit" },
  { id: "all_topics", label: "Penjelajah", desc: "Latihan di 5 topik berbeda" },
];
