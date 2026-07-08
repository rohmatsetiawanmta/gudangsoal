// src/lib/api.js
import axios from "axios";
import { useAuthStore } from "../features/auth/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://gudangsoal.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

// Otomatis sisipkan token JWT ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle error global
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const url = error.config?.url || "";
    const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register");
    if (error.response?.status === 401 && !isAuthEndpoint) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
