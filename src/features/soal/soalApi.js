// src/features/soal/soalApi.js
import api from "../../lib/api";

export const getSoalDetail = (kode) =>
  api.get(`/browse/soal/detail?kode=${kode}`);
