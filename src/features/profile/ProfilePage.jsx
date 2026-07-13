// src/features/profile/ProfilePage.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import { useAuthStore } from "../auth/authStore";
import { getProfile, updateProfile, getMyReports } from "./profileApi";
import { getBookmarks } from "../bookmark/bookmarkApi";
import useWindowWidth from "../../hooks/useWindowWidth";

import ProfileHeader from "./components/ProfileHeader";
import StatCards from "./components/StatCards";
import { TABS } from "./components/TabSwitcher";
import TabSwitcher from "./components/TabSwitcher";
import TabXP from "./components/TabXP";
import TabRiwayat from "./components/TabRiwayat";
import TabBookmark from "./components/TabBookmark";
import TabSoalRequest from "./components/TabSoalRequest";
import { getMyFeedback } from "../feedback/feedbackApi";
import FeedbackModal from "../feedback/FeedbackModal";
import TabMasukan from "./components/TabMasukan";
import TabLaporan from "./components/TabLaporan";
import RequestSoalModal from "../request/RequestSoalModal";
import api from "../../lib/api";

export default function ProfilePage() {
  const { updateUser } = useAuthStore();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "xp";
  const setActiveTab = (tab) => setSearchParams({ tab }, { replace: true });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [bookmarks, setBookmarks] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  const [masukan, setMasukan] = useState([]);
  const [loadingMasukan, setLoadingMasukan] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const [laporan, setLaporan] = useState([]);
  const [loadingLaporan, setLoadingLaporan] = useState(false);

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);

  useEffect(() => {
    getProfile()
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  useEffect(() => {
    if (activeTab !== "laporan") return;
    setLoadingLaporan(true);
    getMyReports()
      .then((d) => setLaporan(Array.isArray(d) ? d : []))
      .catch(() => setLaporan([]))
      .finally(() => setLoadingLaporan(false));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "request") return;
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = () => {
    setLoadingRequests(true);
    api.get("/soal-request")
      .then((d) => setRequests(Array.isArray(d) ? d : []))
      .catch(() => setRequests([]))
      .finally(() => setLoadingRequests(false));
  };

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

  const tabContent = (
    <>
      {activeTab === "xp" && (
        <TabXP xpHistory={data?.xp_history} isMobile={isMobile} />
      )}
      {activeTab === "riwayat" && <TabRiwayat isMobile={isMobile} />}
      {activeTab === "bookmark" && (
        <TabBookmark bookmarks={bookmarks} loading={loadingBookmarks} isMobile={isMobile} />
      )}
      {activeTab === "request" && (
        <TabSoalRequest
          requests={requests}
          loading={loadingRequests}
          onKirim={() => setRequestOpen(true)}
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
      {activeTab === "laporan" && (
        <TabLaporan laporan={laporan} loading={loadingLaporan} isMobile={isMobile} />
      )}
    </>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gs-hover)" }}>
      <SEO
        title="Profil"
        description="Lihat progress belajar, riwayat soal, XP, dan streak harianmu di Gudang Soal."
        url="/profile"
      />
      <Navbar />

      <main style={{
        flex: 1,
        maxWidth: "900px",
        width: "100%",
        margin: "0 auto",
        padding: isMobile ? "24px 16px" : "40px 32px",
      }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: "80px", borderRadius: "14px", background: "var(--gs-border)", opacity: 0.5, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <ProfileHeader user={data?.user} isMobile={isMobile} onUpdate={handleUpdate} />
            <StatCards user={data?.user} stats={data?.stats} isMobile={isMobile} />

            {isMobile ? (
              <div>
                <TabSwitcher activeTab={activeTab} onChange={setActiveTab} isMobile={isMobile} />
                {tabContent}
              </div>
            ) : (
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                {/* Sidebar kiri */}
                <div style={{
                  width: "196px", flexShrink: 0,
                  background: "var(--gs-surface)", borderRadius: "14px",
                  border: "1px solid var(--gs-border)", overflow: "hidden",
                  position: "sticky", top: "80px",
                }}>
                  {TABS.map(({ key, label, icon: Icon }) => {
                    const active = activeTab === key;
                    return (
                      <button key={key} onClick={() => setActiveTab(key)} style={{
                        width: "100%", display: "flex", alignItems: "center", gap: "10px",
                        padding: "11px 16px", border: "none",
                        borderLeft: `3px solid ${active ? "#e84c2b" : "transparent"}`,
                        borderBottom: "1px solid var(--gs-border)",
                        background: active ? "var(--gs-hover)" : "transparent",
                        color: active ? "#e84c2b" : "var(--gs-text-muted)",
                        fontSize: "13px", fontWeight: active ? "700" : "500",
                        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                        transition: "all .15s", boxSizing: "border-box",
                      }}
                        onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--gs-hover)"; }}
                        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                      >
                        <Icon size={14} />
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Konten kanan */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {tabContent}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {feedbackOpen && <FeedbackModal onClose={handleFeedbackClose} />}
      {requestOpen && (
        <RequestSoalModal
          onClose={() => setRequestOpen(false)}
          onSuccess={fetchRequests}
        />
      )}
      <Footer />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
