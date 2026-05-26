// src/features/soal/soalApi.js
import api from "../../lib/api";

export const getSoalDetail = (id) => api.get(`/browse/soal/detail?id=${id}`);
