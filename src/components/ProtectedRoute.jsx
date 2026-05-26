// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../features/auth/authStore";

export default function ProtectedRoute() {
  const { isLoggedIn } = useAuthStore();

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return <Outlet />;
}
