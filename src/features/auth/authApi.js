// src/features/auth/authApi.js
import api from "../../lib/api";

export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const register = (name, email, password) =>
  api.post("/auth/register", { name, email, password });

export const verifyEmail = (token) =>
  api.get(`/auth/verify-email?token=${token}`);

export const resendVerification = (email) =>
  api.post("/auth/resend-verification", { email });

export const getProfile = () => api.get("/auth/profile");

export const updateProfile = (data) => api.put("/auth/profile", data);
