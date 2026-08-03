// src/features/soal/soalApi.js
import api from "../../lib/api";

export const getSoalDetail = (kode) =>
  api.get(`/browse/soal/detail?kode=${kode}`);

export const getSoalStatus = (kode) =>
  api.get(`/browse/soal/status?kode=${kode}`);
