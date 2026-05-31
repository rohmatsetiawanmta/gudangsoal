// src/features/profile/ProfilePage.jsx
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { useAuthStore } from "../auth/authStore";
import { getProfile, updateProfile } from "./profileApi";
import { getBookmarks } from "../bookmark/bookmarkApi";
import useWindowWidth from "../../hooks/useWindowWidth";

import ProfileHeader from "./components/ProfileHeader";
import XPBar from "./components/XPBar";
import StatCards from "./components/StatCards";
import TabSwitcher from "./components/TabSwitcher";
import TabXP from "./components/TabXP";
import TabRiwayat from "./components/TabRiwayat";
import TabBookmark from "./components/TabBookmark";
import { getMyFeedback } from "../feedback/feedbackApi";
import FeedbackModal from "../feedback/FeedbackModal";
import TabMasukan from "./components/TabMasukan";

export default function ProfilePage() {
  const { updateUser } = useAuthStore();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("xp");
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [masukan, setMasukan] = useState([]);
  const [loadingMasukan, setLoadingMasukan] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    getProfile()
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load bookmark lazy — hanya saat tab aktif
  useEffect(() => {
    if (activeTab !== "bookmark") return;
    setLoadingBookmarks(true);
    getBookmarks()
      .then((d) => setBookmarks(Array.isArray(d) ? d : []))
      .catch(() => setBookmarks([]))
      .finally(() => setLoadingBookmarks(false));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "masukan") return;
    setLoadingMasukan(true);
    getMyFeedback()
      .then((d) => setMasukan(Array.isArray(d) ? d : []))
      .catch(() => setMasukan([]))
      .finally(() => setLoadingMasukan(false));
  }, [activeTab]);

  const handleUpdate = async (payload) => {
    await updateProfile(payload);
    updateUser({ name: payload.name });
    setData((d) => ({ ...d, user: { ...d.user, name: payload.name } }));
  };

  const handleFeedbackClose = () => {
    setFeedbackOpen(false);
    if (activeTab === "masukan") {
      setLoadingMasukan(true);
      getMyFeedback()
        .then((d) => setMasukan(Array.isArray(d) ? d : []))
        .catch(() => setMasukan([]))
        .finally(() => setLoadingMasukan(false));
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#faf9f6",
      }}
    >
      <SEO
        title="Profil"
        description="Lihat progress belajar, riwayat soal, XP, dan streak harianmu di Gudang Soal."
        url="/profile"
      />
      <Navbar />

      <main
        style={{
          flex: 1,
          maxWidth: "800px",
          width: "100%",
          margin: "0 auto",
          padding: isMobile ? "24px 20px" : "40px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: isMobile ? "22px" : "26px",
              fontWeight: "800",
              color: "#0f0e17",
              letterSpacing: "-0.5px",
              marginBottom: "4px",
            }}
          >
            Profil Saya
          </h1>
          <p style={{ fontSize: "14px", color: "#6b6860" }}>
            Lihat progress dan kelola akun kamu.
          </p>
        </div>

        {loading ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "80px",
                  borderRadius: "14px",
                  background: "#e2ddd5",
                  opacity: 0.5,
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <ProfileHeader
              user={data?.user}
              isMobile={isMobile}
              onUpdate={handleUpdate}
            />

            <XPBar xp={data?.user?.xp || 0} isMobile={isMobile} />

            <StatCards
              user={data?.user}
              stats={data?.stats}
              isMobile={isMobile}
            />

            {/* Tabs */}
            <div>
              <TabSwitcher
                activeTab={activeTab}
                onChange={setActiveTab}
                isMobile={isMobile}
              />

              {activeTab === "xp" && (
                <TabXP xpHistory={data?.xp_history} isMobile={isMobile} />
              )}
              {activeTab === "riwayat" && (
                <TabRiwayat riwayat={data?.riwayat} isMobile={isMobile} />
              )}
              {activeTab === "bookmark" && (
                <TabBookmark
                  bookmarks={bookmarks}
                  loading={loadingBookmarks}
                  isMobile={isMobile}
                />
              )}
              {activeTab === "masukan" && (
                <TabMasukan
                  masukan={masukan}
                  loading={loadingMasukan}
                  onKirim={() => setFeedbackOpen(true)}
                  isMobile={isMobile}
                />
              )}
            </div>
          </div>
        )}
      </main>
      {feedbackOpen && <FeedbackModal onClose={handleFeedbackClose} />}

      <Footer />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
