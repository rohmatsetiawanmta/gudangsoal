// src/features/search/searchApi.js
import api from "../../lib/api";

export const search = (q, filters = {}, page = 1) => {
  const params = new URLSearchParams({ q, page });
  if (filters.jenjang_slug) params.append("jenjang_slug", filters.jenjang_slug);
  if (filters.difficulty) params.append("difficulty", filters.difficulty);
  if (filters.tipe) params.append("tipe", filters.tipe);
  return api.get(`/browse/search?${params}`);
};
