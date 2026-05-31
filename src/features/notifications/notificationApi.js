// src/features/notifications/notificationApi.js
import api from "../../lib/api";

export const getNotifications = () => api.get("/notifications");

export const markAllRead = () => api.put("/notifications/read");

export const markOneRead = (id) => api.put(`/notifications/read?id=${id}`);
