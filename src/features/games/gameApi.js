import api from "../../lib/api";

// Ambil daftar game yang di-assign ke topik tertentu.
// Backend harus JOIN tabel game + game_topic dan filter by topik_slug.
// Response: [{ id, slug }, ...]
export const getGamesByTopik = (topikSlug) =>
  api.get(`/games/by-topik?topik_slug=${topikSlug}`);
