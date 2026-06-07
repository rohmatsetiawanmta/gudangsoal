// Definisi semua game yang tersedia di frontend.
// slug harus cocok dengan kolom `link` di tabel `game` di database.

import { Hash } from "lucide-react";

export const GAMES_CONFIG = [
  {
    slug: "number-sequence",
    title: "Number Sequence",
    description: "Tebak angka berikutnya dari pola deret aritmatika atau geometri.",
    path: "/games/number-sequence",
    icon: Hash,
    color: "#2563eb",
    bg: "#eff6ff",
  },
];

// Helper: cari game berdasarkan slug
export function getGameBySlug(slug) {
  return GAMES_CONFIG.find((g) => g.slug === slug) || null;
}
