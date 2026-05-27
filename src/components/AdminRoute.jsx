// src/components/AdminRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../features/auth/authStore";

export default function AdminRoute() {
  const { isLoggedIn, user } = useAuthStore();

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/home" replace />;

  return <Outlet />;
}
