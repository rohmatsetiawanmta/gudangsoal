// src/features/search/searchApi.js
import api from "../../lib/api";

export const search = (q) =>
  api.get(`/browse/search?q=${encodeURIComponent(q)}`);
