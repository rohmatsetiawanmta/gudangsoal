// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import { useAuthStore } from "./features/auth/authStore";
import FloatingTools from "./components/FloatingTools";
import CookieConsent from "./components/CookieConsent";

import LandingPage from "./features/home/LandingPage";
import HomePage from "./features/home/HomePage";
import FAQPage from "./features/home/FAQPage";
import ChangelogPage from "./features/home/ChangelogPage";
import PrivacyPage from "./features/home/PrivacyPage";

import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import VerifyEmailPage from "./features/auth/VerifyEmailPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RequestSoalPage from "./features/request/RequestSoalPage";

import BrowseJenjang from "./features/browse/BrowseJenjang";
import BrowseSubjenjang from "./features/browse/BrowseSubjenjang";
import BrowseMapel from "./features/browse/BrowseMapel";
import BrowseTopik from "./features/browse/BrowseTopik";
import BrowseSubtopik from "./features/browse/BrowseSubtopik";
import BrowseSoal from "./features/browse/BrowseSoal";
import SoalDetail from "./features/soal/SoalDetail";
import PopulerPage from "./features/browse/PopulerPage";

import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./features/admin/AdminLayout";
import AdminDashboard from "./features/admin/AdminDashboard";
import AdminSoal from "./features/admin/AdminSoal";
import AdminStruktur from "./features/admin/AdminStruktur";
import AdminUsers from "./features/admin/AdminUsers";
import AdminReports from "./features/admin/AdminReports";
import AdminSoalRequests from "./features/admin/AdminSoalRequests";
import AdminChangelog from "./features/admin/AdminChangelog";
import AdminTransaksi from "./features/admin/AdminTransaksi";
import AdminRoadmap from "./features/admin/AdminRoadmap";
import AdminBugList from "./features/admin/AdminBugList";
import AdminActiveUsers from "./features/admin/AdminActiveUsers";
import AdminFeedback from "./features/admin/AdminFeedback";
import AdminWhiteboard from "./features/admin/AdminWhiteboard";
import AdminThumbnail from "./features/admin/AdminThumbnail";
import AdminWhiteboardSession from "./features/admin/AdminWhiteboardSession";
import AdminWhiteboardBySoal from "./features/admin/AdminWhiteboardBySoal";

import AdminQuiz from "./features/admin/AdminQuiz";
import AdminQuizForm from "./features/admin/AdminQuizForm";
import AdminQuizDetail from "./features/admin/AdminQuizDetail";
import AdminQuizSoalForm from "./features/admin/AdminQuizSoalForm";
import AdminMateri from "./features/admin/AdminMateri";
import AdminMateriForm from "./features/admin/AdminMateriForm";

import LatihanPage from "./features/quiz/LatihanPage";
import LatihanDetail from "./features/quiz/LatihanDetail";
import QuizPage from "./features/quiz/QuizPage";
import QuizHasil from "./features/quiz/QuizHasil";
import QuizReview from "./features/quiz/QuizReview";

import SearchPage from "./features/search/SearchPage";
import ProfilePage from "./features/profile/ProfilePage";
import AdminSoalForm from "./features/admin/soal-form";
import AdminSoalBulkImportPage from "./features/admin/AdminSoalBulkImportPage";
import MateriDetail from "./features/materi/MateriDetail";
import MateriList from "./features/materi/MateriList";
import AdminMateriBulkImport from "./features/admin/AdminMateriBulkImport";
import AdminViews from "./features/admin/AdminViews";
import AdminShares from "./features/admin/AdminShares";
import AdminPaket from "./features/admin/AdminPaket";
import AdminPaketForm from "./features/admin/AdminPaketForm";
import AdminPaketDetail from "./features/admin/AdminPaketDetail";
import PaketList from "./features/paket/PaketList";
import PembelianSaya from "./features/paket/PembelianSaya";
import PaketDetail from "./features/paket/PaketDetail";
import AdminSiteSettings from "./features/admin/AdminSiteSettings";
import { SiteSettingsProvider } from "./contexts/SiteSettingsContext";

export default function App() {
  const { isLoggedIn, checkSessionExpiry } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkSessionExpiry();
  }, []);

  return (
    <SiteSettingsProvider>
    <>
    <ScrollToTop />
    <FloatingTools />
    <CookieConsent />
    <div key={location.key} className="page-fade">
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
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/changelog" element={<ChangelogPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

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
      <Route path="/materi" element={<MateriList />} />
      <Route path="/materi/:id" element={<MateriDetail />} />
      <Route path="/paket" element={<PaketList />} />
      <Route path="/pembelian" element={<PembelianSaya />} />
      <Route path="/paket/:id" element={<PaketDetail />} />
      <Route path="/paket/:id/soal/:urutan" element={<PaketDetail />} />
      <Route path="/latihan" element={<LatihanPage />} />
      <Route path="/latihan/:id" element={<LatihanDetail />} />
      <Route path="/latihan/:id/quiz" element={<QuizPage />} />
      <Route path="/latihan/:id/hasil" element={<QuizHasil />} />
      <Route path="/latihan/:id/review" element={<QuizReview />} />
      <Route path="/populer" element={<PopulerPage />} />

      <Route path="*" element={<Navigate to="/" />} />

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="soal" element={<AdminSoal />} />
          <Route path="views" element={<AdminViews />} />
          <Route path="shares" element={<AdminShares />} />
          <Route path="soal/tambah" element={<AdminSoalForm />} />
          <Route path="soal/edit/:id" element={<AdminSoalForm />} />
          <Route path="soal/bulk-import" element={<AdminSoalBulkImportPage />} />
          <Route path="struktur" element={<AdminStruktur />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="soal-requests" element={<AdminSoalRequests />} />
          <Route path="changelog" element={<AdminChangelog />} />
          <Route path="transaksi" element={<AdminTransaksi />} />
          <Route path="roadmap" element={<AdminRoadmap />} />
          <Route path="bugs"         element={<AdminBugList />} />
          <Route path="whiteboard"   element={<AdminWhiteboard />} />
          <Route path="thumbnail"    element={<AdminThumbnail />} />
          <Route path="whiteboard/:sessionId" element={<AdminWhiteboardSession />} />
          <Route path="whiteboard/by-question/:kode" element={<AdminWhiteboardBySoal />} />
          <Route path="active-users" element={<AdminActiveUsers />} />
          <Route path="feedback" element={<AdminFeedback />} />

          <Route path="latihan" element={<AdminQuiz />} />
          <Route path="latihan/tambah" element={<AdminQuizForm />} />
          <Route path="latihan/:id/edit" element={<AdminQuizForm />} />
          <Route path="latihan/:id" element={<AdminQuizDetail />} />
          <Route
            path="latihan/:id/soal/tambah"
            element={<AdminQuizSoalForm />}
          />
          <Route
            path="latihan/:id/soal/edit/:soal_id"
            element={<AdminQuizSoalForm />}
          />

          <Route path="materi" element={<AdminMateri />} />
          <Route path="materi/tambah" element={<AdminMateriForm />} />
          <Route path="materi/edit/:id" element={<AdminMateriForm />} />
          <Route path="materi/bulk-import" element={<AdminMateriBulkImport />} />

          <Route path="paket" element={<AdminPaket />} />
          <Route path="paket/tambah" element={<AdminPaketForm />} />
          <Route path="paket/:id" element={<AdminPaketDetail />} />
          <Route path="paket/:id/edit" element={<AdminPaketForm />} />
          <Route path="settings" element={<AdminSiteSettings />} />
        </Route>
      </Route>

    </Routes>
    </div>
    </>
    </SiteSettingsProvider>
  );
}
