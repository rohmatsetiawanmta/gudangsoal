// src/features/profile/profileApi.js
import api from "../../lib/api";

export const getProfile = () => api.get("/profile");
export const updateProfile = (data) => api.put("/profile", data);
export const saveSession = (data) => api.post("/profile/session", data);
