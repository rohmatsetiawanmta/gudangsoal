// src/features/feedback/feedbackApi.js
import api from "../../lib/api";

export const submitFeedback = (data) => api.post("/feedback", data);
export const getMyFeedback = () => api.get("/feedback");
