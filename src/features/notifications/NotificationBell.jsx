// src/features/notifications/NotificationBell.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { getNotifications, markAllRead, markOneRead } from "./notificationApi";

const TIPE_CONFIG = {
  request_approved: {
    color: "#1a8a6e",
    bg: "#e4f5f0",
    label: "Request Disetujui",
  },
  request_rejected: {
    color: "#e84c2b",
    bg: "#fff3f0",
    label: "Request Ditolak",
  },
  report_resolved: {
    color: "#2563eb",
    bg: "#eff6ff",
    label: "Laporan Ditindaklanjuti",
  },
  report_dismissed: {
    color: "#6b6860",
    bg: "#f2efe8",
    label: "Laporan Ditutup",
  },
  feedback_responded: {
    color: "#7c3aed",
    bg: "#f5f3ff",
    label: "Masukan Ditindaklanjuti",
  },
};

export default function NotificationBell({ isMobile }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  // Fetch notifikasi
  const fetchNotifs = () => {
    setLoading(true);
    getNotifications()
      .then((d) => {
        setNotifs(Array.isArray(d?.data) ? d.data : []);
        setUnread(d?.unread || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
    // Poll setiap 60 detik
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, []);

  // Tutup dropdown saat klik luar
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    setUnread(0);
  };

  const handleClickNotif = async (notif) => {
    // Tandai dibaca
    if (!notif.is_read) {
      await markOneRead(notif.id);
      setNotifs((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: 1 } : n))
      );
      setUnread((u) => Math.max(0, u - 1));
    }
    // Navigate ke link
    if (notif.link) {
      setOpen(false);
      navigate(notif.link);
    }
  };

  const formatTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHour < 24) return `${diffHour} jam lalu`;
    if (diffDay < 7) return `${diffDay} hari lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          border: "1px solid #e2ddd5",
          background: open ? "#f2efe8" : "none",
          cursor: "pointer",
          color: "#6b6860",
          transition: "background .15s",
          position: "relative",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f2efe8")}
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = open ? "#f2efe8" : "none")
        }
      >
        <Bell size={16} />
        {/* Unread badge */}
        {unread > 0 && (
          <div
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: "#e84c2b",
              border: "2px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: "9px",
                fontWeight: "800",
                color: "white",
                lineHeight: 1,
              }}
            >
              {unread > 9 ? "9+" : unread}
            </span>
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: isMobile ? "-80px" : "0",
            width: isMobile ? "calc(100vw - 32px)" : "360px",
            maxWidth: "360px",
            background: "white",
            border: "1px solid #e2ddd5",
            borderRadius: "14px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
            zIndex: 200,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: "1px solid #f2efe8",
            }}
          >
            <span
              style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}
            >
              Notifikasi{" "}
              {unread > 0 && (
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    padding: "2px 7px",
                    borderRadius: "6px",
                    background: "#fff3f0",
                    color: "#e84c2b",
                    marginLeft: "6px",
                  }}
                >
                  {unread} baru
                </span>
              )}
            </span>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#6b6860",
                  fontFamily: "inherit",
                  transition: "color .15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#0f0e17")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6860")}
              >
                <CheckCheck size={13} /> Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {loading && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "1px" }}
              >
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: "72px",
                      background: i % 2 === 0 ? "white" : "#faf9f6",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                ))}
              </div>
            )}

            {!loading && notifs.length === 0 && (
              <div
                style={{
                  padding: "40px 16px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Inbox size={28} color="#e2ddd5" />
                <span style={{ fontSize: "13px", color: "#b4b2a9" }}>
                  Belum ada notifikasi.
                </span>
              </div>
            )}

            {!loading &&
              notifs.map((n, i) => {
                const config =
                  TIPE_CONFIG[n.tipe] || TIPE_CONFIG.report_dismissed;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleClickNotif(n)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "12px 16px",
                      borderBottom:
                        i < notifs.length - 1 ? "1px solid #f2efe8" : "none",
                      background: n.is_read == 1 ? "white" : "#fffdf9",
                      cursor: n.link ? "pointer" : "default",
                      transition: "background .15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#faf9f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        n.is_read == 1 ? "white" : "#fffdf9")
                    }
                  >
                    {/* Dot unread */}
                    <div style={{ paddingTop: "5px", flexShrink: 0 }}>
                      <div
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background:
                            n.is_read == 1 ? "transparent" : "#e84c2b",
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "4px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "700",
                            padding: "2px 6px",
                            borderRadius: "5px",
                            background: config.bg,
                            color: config.color,
                            flexShrink: 0,
                          }}
                        >
                          {config.label}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: n.is_read == 1 ? "400" : "600",
                          color: "#0f0e17",
                          marginBottom: "3px",
                        }}
                      >
                        {n.judul}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b6860",
                          lineHeight: "1.5",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {n.pesan}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#b4b2a9",
                          marginTop: "4px",
                        }}
                      >
                        {formatTime(n.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Footer */}
          {notifs.length > 0 && (
            <div
              style={{
                padding: "10px 16px",
                borderTop: "1px solid #f2efe8",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "#b4b2a9" }}>
                Menampilkan {notifs.length} notifikasi terbaru
              </span>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
