// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./features/auth/authStore";

import LandingPage from "./features/home/LandingPage";
import HomePage from "./features/home/HomePage";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RequestSoalPage from "./features/request/RequestSoalPage";

import BrowseJenjang from "./features/browse/BrowseJenjang";
import BrowseSubjenjang from "./features/browse/BrowseSubjenjang";
import BrowseMapel from "./features/browse/BrowseMapel";
import BrowseTopik from "./features/browse/BrowseTopik";
import BrowseSubtopik from "./features/browse/BrowseSubtopik";
import BrowseSoal from "./features/browse/BrowseSoal";
import SoalDetail from "./features/soal/SoalDetail";

import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./features/admin/AdminLayout";
import AdminDashboard from "./features/admin/AdminDashboard";
import AdminSoal from "./features/admin/AdminSoal";
import AdminSoalForm from "./features/admin/AdminSoalForm";
import AdminStruktur from "./features/admin/AdminStruktur";
import AdminUsers from "./features/admin/AdminUsers";
import AdminReports from "./features/admin/AdminReports";
import AdminSoalRequests from "./features/admin/AdminSoalRequests";

import SearchPage from "./features/search/SearchPage";
import ProfilePage from "./features/profile/ProfilePage";

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
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/request-soal" element={<RequestSoalPage />} />
      </Route>

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
      <Route path="/soal/:kode" element={<SoalDetail />} />

      <Route path="*" element={<Navigate to="/" />} />

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="soal" element={<AdminSoal />} />
          <Route path="soal/tambah" element={<AdminSoalForm />} />
          <Route path="soal/edit/:id" element={<AdminSoalForm />} />
          <Route path="struktur" element={<AdminStruktur />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="soal-requests" element={<AdminSoalRequests />} />
        </Route>
      </Route>
    </Routes>
  );
}
