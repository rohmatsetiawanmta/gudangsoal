// src/features/auth/authApi.js
import api from "../../lib/api";

export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const register = (name, email, password) =>
  api.post("/auth/register", { name, email, password });

export const getProfile = () => api.get("/auth/profile");

export const updateProfile = (data) => api.put("/auth/profile", data);
