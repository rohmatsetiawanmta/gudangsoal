// src/features/home/homeApi.js
import api from "../../lib/api";

export const getSoalHariIni = () => api.get("/browse/soal-hari-ini");
