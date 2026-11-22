// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../features/auth/authStore";

export default function ProtectedRoute({ returnTo }) {
  const { isLoggedIn } = useAuthStore();

  if (!isLoggedIn) return <Navigate to="/login" replace state={returnTo ? { returnTo } : undefined} />;

  return <Outlet />;
}
