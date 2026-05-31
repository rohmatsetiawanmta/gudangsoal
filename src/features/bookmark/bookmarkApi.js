// src/features/bookmark/bookmarkApi.js
import api from "../../lib/api";

// Ambil semua bookmark user
export const getBookmarks = () => api.get("/bookmark");

// Cek status bookmark pakai kode
export const checkBookmark = (kode) => api.get(`/bookmark/check?kode=${kode}`);

// Tambah bookmark
export const addBookmark = (soal_id) => api.post("/bookmark", { soal_id });

// Hapus bookmark pakai query string
export const removeBookmark = (soal_id) =>
  api.delete(`/bookmark?soal_id=${soal_id}`);
