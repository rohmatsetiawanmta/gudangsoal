// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./features/auth/authStore";

import LandingPage from "./features/home/LandingPage";
import HomePage from "./features/home/HomePage";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";

import BrowseJenjang from "./features/browse/BrowseJenjang";
import BrowseSubjenjang from "./features/browse/BrowseSubjenjang";
import BrowseMapel from "./features/browse/BrowseMapel";
import BrowseTopik from "./features/browse/BrowseTopik";
import BrowseSubtopik from "./features/browse/BrowseSubtopik";
import BrowseSoal from "./features/browse/BrowseSoal";
import SoalDetail from "./features/soal/SoalDetail";

export default function App() {
  const { isLoggedIn } = useAuthStore();

  return (
    <Routes>
      <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/home" /> : <LandingPage />}
      />
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/home" /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isLoggedIn ? <Navigate to="/home" /> : <RegisterPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/browse" element={<BrowseJenjang />} />
        <Route path="/browse/:jenjangSlug" element={<BrowseSubjenjang />} />
        <Route
          path="/browse/:jenjangSlug/:subjenjangSlug"
          element={<BrowseMapel />}
        />
        <Route
          path="/browse/:jenjangSlug/:subjenjangSlug/:mapelSlug"
          element={<BrowseTopik />}
        />
        <Route
          path="/browse/:jenjangSlug/:subjenjangSlug/:mapelSlug/:topikSlug"
          element={<BrowseSubtopik />}
        />
        <Route
          path="/browse/:jenjangSlug/:subjenjangSlug/:mapelSlug/:topikSlug/:subtopikSlug"
          element={<BrowseSoal />}
        />
        <Route path="/soal/:id" element={<SoalDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
