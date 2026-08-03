// src/features/quiz/quizApi.js
import api from "../../lib/api";

// User
export const getQuizSets = (jenjang_id = "") =>
  api.get(`/quiz${jenjang_id ? `?jenjang_id=${jenjang_id}` : ""}`);

export const getQuizDetail = (id) => api.get(`/quiz/${id}`);

export const startQuiz = (id) => api.post(`/quiz/${id}/start`);

export const saveQuizProgress = (sessionId, answers, sisaWaktu) =>
  api.patch(`/quiz/session/${sessionId}`, { answers, sisa_waktu: sisaWaktu });

export const finishQuiz = (sessionId) =>
  api.post(`/quiz/session/${sessionId}/finish`);

export const finalizeQuiz = (sessionId) =>
  api.put(`/quiz/session/${sessionId}/final`);

export const getQuizResult = (sessionId) =>
  api.get(`/quiz/session/${sessionId}/result`);

// Admin
export const adminGetQuizSets = () => api.get("/admin/quiz");
export const adminCreateQuizSet = (data) => api.post("/admin/quiz", data);
export const adminUpdateQuizSet = (id, data) =>
  api.put(`/admin/quiz/${id}`, data);
export const adminDeleteQuizSet = (id) => api.delete(`/admin/quiz/${id}`);
export const adminTogglePublish = (id) => api.put(`/admin/quiz/${id}/publish`);
export const adminGetQuizSoal = (id) => api.get(`/admin/quiz/${id}/soal`);
export const adminAddQuizSoal = (id, data) =>
  api.post(`/admin/quiz/${id}/soal`, data);
export const adminUpdateQuizSoal = (quizId, soalId, data) =>
  api.put(`/admin/quiz/${quizId}/soal/${soalId}`, data);
export const adminDeleteQuizSoal = (quizId, soalId) =>
  api.delete(`/admin/quiz/${quizId}/soal/${soalId}`);
export const adminUpdateUrutan = (quizId, urutan) =>
  api.put(`/admin/quiz/${quizId}/soal/urutan`, { urutan });
export const adminLinkQuizSoal = (quizId, soalId) =>
  api.post(`/admin/quiz/${quizId}/soal/link`, { soal_id: soalId });
