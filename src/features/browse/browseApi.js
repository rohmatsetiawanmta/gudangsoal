// src/features/browse/browseApi.js
import api from "../../lib/api";

export const getJenjang = () => api.get("/browse/jenjang");

export const getSubjenjang = (jenjangSlug) =>
  api.get(`/browse/subjenjang?jenjang_slug=${jenjangSlug}`);

export const getMapel = (jenjangSlug, subjenjangSlug) =>
  api.get(
    `/browse/mapel?jenjang_slug=${jenjangSlug}&subjenjang_slug=${subjenjangSlug}`
  );

export const getTopik = (jenjangSlug, subjenjangSlug, mapelSlug) =>
  api.get(
    `/browse/topik?jenjang_slug=${jenjangSlug}&subjenjang_slug=${subjenjangSlug}&mapel_slug=${mapelSlug}`
  );

export const getSubtopik = (
  jenjangSlug,
  subjenjangSlug,
  mapelSlug,
  topikSlug
) =>
  api.get(
    `/browse/subtopik?jenjang_slug=${jenjangSlug}&subjenjang_slug=${subjenjangSlug}&mapel_slug=${mapelSlug}&topik_slug=${topikSlug}`
  );

export const getSoal = (
  jenjangSlug,
  subjenjangSlug,
  mapelSlug,
  topikSlug,
  subtopikSlug
) =>
  api.get(
    `/browse/soal?jenjang_slug=${jenjangSlug}&subjenjang_slug=${subjenjangSlug}&mapel_slug=${mapelSlug}&topik_slug=${topikSlug}&subtopik_slug=${subtopikSlug}`
  );

export const getSoalDetail = (id) => api.get(`/browse/soal/detail?id=${id}`);
