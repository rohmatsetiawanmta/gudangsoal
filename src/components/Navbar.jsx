// src/components/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search, X, BookOpen, User, LogOut, ChevronDown,
  LayoutDashboard, Warehouse, Flame, Shuffle, MessageSquarePlus,
  TrendingUp, Menu, Zap, GraduationCap, Lightbulb,
} from "lucide-react";
import { useAuthStore } from "../features/auth/authStore";
import RandomSoal from "./RandomSoal";
import FeedbackModal from "../features/feedback/FeedbackModal";
import NotificationBell from "../features/notifications/NotificationBell";
import useWindowWidth from "../hooks/useWindowWidth";

const JELAJAHI_LINKS = [
  { to: "/browse",  label: "Soal",   icon: BookOpen,      color: "#2563eb" },
  { to: "/materi",  label: "Materi", icon: GraduationCap, color: "#1a8a6e" },
];

const NAV_LINKS = [];
const NAV_LINKS_LOGGED_IN = [];

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const width     = useWindowWidth();
  const isMobile  = width <= 480;
  const { user, isLoggedIn, logout } = useAuthStore();

  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [randomOpen,   setRandomOpen]   = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const searchRef   = useRef(null);
  const dropdownRef = useRef(null);
  const menuRef     = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (menuRef.current     && !menuRef.current.contains(e.target))     setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery("");
    setMenuOpen(false);
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    setMenuOpen(false);
    logout();
    navigate("/");
  };

  const isActive  = (to) => location.pathname === to || location.pathname.startsWith(to + "/");
  const navLinks  = isLoggedIn ? NAV_LINKS_LOGGED_IN : NAV_LINKS;

  // shared icon-button style (no border, hover bg only)
  const iconBtnStyle = {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "36px", height: "36px", borderRadius: "10px",
    border: "none", background: "transparent",
    cursor: "pointer", color: "#6b6860",
    transition: "background .15s, color .15s",
  };

  const menuItemStyle = {
    width: "100%", display: "flex", alignItems: "center", gap: "10px",
    padding: "9px 12px", borderRadius: "8px", border: "none",
    background: "none", cursor: "pointer", fontSize: "14px",
    fontWeight: "500", color: "#0f0e17", fontFamily: "inherit", textAlign: "left",
  };

  return (
    <>
      <nav style={{
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid #ede9e2",
        boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.03)",
        padding: `0 ${isMobile ? "16px" : "32px"}`,
        height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        gap: "12px",
      }}>

        {/* ── Logo ── */}
        <Link to={isLoggedIn ? "/home" : "/"} style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none", flexShrink: 0 }}>
          <div style={{
            width: "34px", height: "34px",
            background: "linear-gradient(135deg, #e84c2b 0%, #c0391a 100%)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", flexShrink: 0,
            boxShadow: "0 2px 10px rgba(232,76,43,.35), inset 0 1px 0 rgba(255,255,255,.15)",
          }}>
            <Warehouse size={17} />
          </div>
          <span style={{ fontWeight: "800", fontSize: "16.5px", color: "#0f0e17", letterSpacing: "-0.4px" }}>
            Gudang<span style={{ color: "#e84c2b" }}> Soal</span>
          </span>
        </Link>

        {/* ── Desktop center nav ── */}
        {!isMobile && !searchOpen && (
          <div style={{ display: "flex", alignItems: "center", gap: "1px", flex: 1, justifyContent: "center" }}>
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = isActive(to);
              return (
                <Link key={to} to={to} style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "6px 11px", borderRadius: "8px",
                  textDecoration: "none", fontSize: "13.5px",
                  fontWeight: active ? "700" : "500",
                  color: active ? "#e84c2b" : "#52504e",
                  background: active ? "#fff3f0" : "transparent",
                  transition: "background .15s, color .15s",
                }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "#f5f3ef"; e.currentTarget.style.color = "#0f0e17"; }}}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#52504e"; }}}
                >
                  <Icon size={14} strokeWidth={active ? 2.5 : 2} />
                  {label}
                </Link>
              );
            })}

            {/* Jelajahi links langsung */}
            {JELAJAHI_LINKS.map(({ to, label, icon: Icon }) => {
              const active = isActive(to);
              return (
                <Link key={to} to={to} style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "6px 11px", borderRadius: "8px",
                  textDecoration: "none", fontSize: "13.5px",
                  fontWeight: active ? "700" : "500",
                  color: active ? "#e84c2b" : "#52504e",
                  background: active ? "#fff3f0" : "transparent",
                  transition: "background .15s, color .15s",
                }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "#f5f3ef"; e.currentTarget.style.color = "#0f0e17"; }}}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#52504e"; }}}
                >
                  <Icon size={14} strokeWidth={active ? 2.5 : 2} />
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Right side ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>

          {/* Desktop: Search */}
          {!isMobile && (searchOpen ? (
            <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "#9b9890", pointerEvents: "none" }} />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari soal, topik..."
                  style={{
                    paddingLeft: "34px", paddingRight: "14px", paddingTop: "7px", paddingBottom: "7px",
                    borderRadius: "10px", border: "1.5px solid #e84c2b",
                    fontSize: "13.5px", outline: "none", width: "220px",
                    fontFamily: "inherit", color: "#0f0e17", background: "#fff9f8",
                  }}
                />
              </div>
              <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(""); }} style={{ ...iconBtnStyle, color: "#9b9890" }}>
                <X size={16} />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} style={iconBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f3ef"; e.currentTarget.style.color = "#0f0e17"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b6860"; }}
              title="Cari"
            >
              <Search size={16} />
            </button>
          ))}

          {/* Desktop: Shuffle */}
          {!isMobile && (
            <button onClick={() => setRandomOpen(true)} title="Soal Random" style={iconBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f3ef"; e.currentTarget.style.color = "#0f0e17"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b6860"; }}
            >
              <Shuffle size={16} />
            </button>
          )}

          {/* Notifikasi */}
          {!isMobile && isLoggedIn && <NotificationBell isMobile={false} />}

          {/* ── Separator ── */}
          {!isMobile && (
            <div style={{ width: "1px", height: "22px", background: "#ede9e2", margin: "0 4px" }} />
          )}

          {/* Desktop: Login / Avatar */}
          {!isMobile && (!isLoggedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button onClick={() => navigate("/login")} style={{
                padding: "6px 14px", borderRadius: "9px",
                border: "1px solid #e2ddd5", background: "white",
                fontSize: "13.5px", fontWeight: "600", cursor: "pointer",
                fontFamily: "inherit", color: "#0f0e17", transition: "all .15s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f3ef"; e.currentTarget.style.borderColor = "#d4d0c8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2ddd5"; }}
              >
                Masuk
              </button>
              <button onClick={() => navigate("/register")} style={{
                padding: "6px 14px", borderRadius: "9px", border: "none",
                background: "linear-gradient(135deg, #e84c2b 0%, #c0391a 100%)",
                fontSize: "13.5px", fontWeight: "700", cursor: "pointer",
                fontFamily: "inherit", color: "white",
                boxShadow: "0 2px 8px rgba(232,76,43,.3)",
                transition: "opacity .15s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Daftar
              </button>
            </div>
          ) : (
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "4px 10px 4px 4px", borderRadius: "10px",
                border: "1px solid #ede9e2", background: dropdownOpen ? "#f5f3ef" : "white",
                cursor: "pointer", transition: "background .15s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f3ef")}
                onMouseLeave={(e) => (e.currentTarget.style.background = dropdownOpen ? "#f5f3ef" : "white")}
              >
                <div style={{
                  width: "28px", height: "28px", borderRadius: "8px",
                  background: "linear-gradient(135deg, #e84c2b 0%, #c0391a 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: "800", fontSize: "12px",
                  boxShadow: "0 1px 4px rgba(232,76,43,.3)",
                }}>
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f0e17", maxWidth: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.name?.split(" ")[0] || "User"}
                </span>
                <ChevronDown size={13} color="#b4b2a9" style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }} />
              </button>

              {dropdownOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: "white", border: "1px solid #ede9e2",
                  borderRadius: "18px", padding: "8px", minWidth: "220px",
                  boxShadow: "0 20px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
                  zIndex: 200,
                }}>
                  {/* User info */}
                  <div style={{
                    padding: "12px", marginBottom: "6px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #fff9f8 0%, #faf9f6 100%)",
                    border: "1px solid #f2ede7",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <div style={{
                        width: "38px", height: "38px", borderRadius: "11px",
                        background: "linear-gradient(135deg, #e84c2b 0%, #c0391a 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontWeight: "800", fontSize: "15px",
                        boxShadow: "0 2px 8px rgba(232,76,43,.3)",
                      }}>
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
                        <div style={{ fontSize: "11px", color: "#b4b2a9", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", background: "rgba(252,211,77,.18)", borderRadius: "8px", padding: "5px 8px", fontSize: "12px", fontWeight: "700", color: "#b45309" }}>
                        <Zap size={11} /> {user?.xp || 0} XP
                      </div>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", background: "#fff3f0", borderRadius: "8px", padding: "5px 8px", fontSize: "12px", fontWeight: "700", color: "#e84c2b" }}>
                        <Flame size={11} /> {user?.streak || 0} hari
                      </div>
                    </div>
                  </div>

                  {[
                    ...(user?.role === "admin" ? [{ icon: LayoutDashboard, label: "Admin Panel",    onClick: () => { navigate("/admin");         setDropdownOpen(false); }, danger: false }] : []),
                    { icon: User,              label: "Profile",          onClick: () => { navigate("/profile");      setDropdownOpen(false); }, danger: false },
                    { icon: TrendingUp,        label: "Soal Populer",     onClick: () => { navigate("/populer");      setDropdownOpen(false); }, danger: false },
                    { icon: MessageSquarePlus, label: "Request Soal",     onClick: () => { navigate("/request-soal"); setDropdownOpen(false); }, danger: false },
                    { icon: Lightbulb,         label: "Kirim Masukan",    onClick: () => { setDropdownOpen(false); setFeedbackOpen(true);  }, danger: false },
                    { icon: LogOut,            label: "Keluar",           onClick: handleLogout,                                             danger: true  },
                  ].map(({ icon: Icon, label, onClick, danger }) => (
                    <button key={label} onClick={onClick} style={{ ...menuItemStyle, color: danger ? "#e84c2b" : "#0f0e17" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = danger ? "#fff3f0" : "#f5f3ef")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <Icon size={15} /> {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* ── Mobile: Bell + Hamburger ── */}
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {isLoggedIn && <NotificationBell isMobile={true} />}

              <div ref={menuRef} style={{ position: "relative" }}>
                <button onClick={() => setMenuOpen(!menuOpen)} style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "36px", height: "36px", borderRadius: "10px",
                  border: "1px solid #ede9e2", background: menuOpen ? "#f5f3ef" : "white",
                  cursor: "pointer", color: "#52504e", transition: "background .15s",
                }}>
                  {menuOpen ? <X size={17} /> : <Menu size={17} />}
                </button>

                {menuOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    background: "white", border: "1px solid #ede9e2",
                    borderRadius: "18px", padding: "8px", minWidth: "260px",
                    boxShadow: "0 20px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
                    zIndex: 200,
                  }}>
                    {/* User info (if logged in) */}
                    {isLoggedIn && (
                      <div style={{
                        padding: "12px", marginBottom: "8px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #fff9f8 0%, #faf9f6 100%)",
                        border: "1px solid #f2ede7",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                          <div style={{
                            width: "36px", height: "36px", borderRadius: "10px",
                            background: "linear-gradient(135deg, #e84c2b 0%, #c0391a 100%)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontWeight: "800", fontSize: "14px",
                          }}>
                            {user?.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
                            <div style={{ fontSize: "11px", color: "#b4b2a9" }}>{user?.email}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", background: "rgba(252,211,77,.18)", borderRadius: "8px", padding: "5px 8px", fontSize: "12px", fontWeight: "700", color: "#b45309" }}>
                            <Zap size={11} /> {user?.xp || 0} XP
                          </div>
                          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", background: "#fff3f0", borderRadius: "8px", padding: "5px 8px", fontSize: "12px", fontWeight: "700", color: "#e84c2b" }}>
                            <Flame size={11} /> {user?.streak || 0} hari
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Search */}
                    <div style={{ padding: "4px 4px 8px", borderBottom: "1px solid #f2efe8", marginBottom: "8px" }}>
                      <form onSubmit={handleSearch}>
                        <div style={{ position: "relative" }}>
                          <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9b9890", pointerEvents: "none" }} />
                          <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari soal, topik..."
                            style={{ width: "100%", paddingLeft: "32px", paddingRight: "12px", paddingTop: "9px", paddingBottom: "9px", borderRadius: "9px", border: "1px solid #ede9e2", fontSize: "13.5px", outline: "none", fontFamily: "inherit", color: "#0f0e17", boxSizing: "border-box", background: "#faf9f6" }}
                          />
                        </div>
                      </form>
                    </div>

                    {/* Nav links */}
                    <div style={{ marginBottom: "4px" }}>
                      <div style={{ fontSize: "10px", fontWeight: "700", color: "#b4b2a9", letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 12px 6px" }}>Menu</div>
                      {navLinks.map(({ to, label, icon: Icon }) => (
                        <button key={to} onClick={() => { navigate(to); setMenuOpen(false); }}
                          style={{ ...menuItemStyle, color: isActive(to) ? "#e84c2b" : "#0f0e17", background: isActive(to) ? "#fff3f0" : "none", fontWeight: isActive(to) ? "600" : "500" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = isActive(to) ? "#fff3f0" : "#f5f3ef")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = isActive(to) ? "#fff3f0" : "none")}
                        >
                          <Icon size={15} color={isActive(to) ? "#e84c2b" : "#6b6860"} /> {label}
                        </button>
                      ))}
                    </div>

                    {/* Jelajahi section */}
                    <div style={{ borderTop: "1px solid #f2efe8", paddingTop: "8px", marginBottom: "4px" }}>
                      <div style={{ fontSize: "10px", fontWeight: "700", color: "#b4b2a9", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 12px 6px" }}>Jelajahi</div>
                      {[...JELAJAHI_LINKS, { to: "/populer", label: "Soal Populer", icon: TrendingUp, color: "#e84c2b" }].map(({ to, label, icon: Icon, color }) => (
                        <button key={to} onClick={() => { navigate(to); setMenuOpen(false); }}
                          style={{ ...menuItemStyle, color: isActive(to) ? "#e84c2b" : "#0f0e17", background: isActive(to) ? "#fff3f0" : "none", fontWeight: isActive(to) ? "600" : "500" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = isActive(to) ? "#fff3f0" : "#f5f3ef")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = isActive(to) ? "#fff3f0" : "none")}
                        >
                          <Icon size={15} color={isActive(to) ? "#e84c2b" : color} /> {label}
                        </button>
                      ))}
                    </div>

                    {/* Actions */}
                    <div style={{ borderTop: "1px solid #f2efe8", paddingTop: "6px", marginTop: "2px" }}>
                      <button onClick={() => { setMenuOpen(false); setRandomOpen(true); }} style={menuItemStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f3ef")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                      >
                        <Shuffle size={15} color="#6b6860" /> Soal Random
                      </button>
                      <button onClick={() => { setMenuOpen(false); setFeedbackOpen(true); }} style={menuItemStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f3ef")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                      >
                        <MessageSquarePlus size={15} color="#6b6860" /> Kirim Masukan
                      </button>
                    </div>

                    {/* Auth */}
                    <div style={{ borderTop: "1px solid #f2efe8", paddingTop: "6px", marginTop: "2px" }}>
                      {!isLoggedIn ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "2px 2px" }}>
                          <button onClick={() => { navigate("/login"); setMenuOpen(false); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 12px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", cursor: "pointer", fontSize: "13.5px", fontWeight: "600", color: "#0f0e17", fontFamily: "inherit" }}>
                            Masuk
                          </button>
                          <button onClick={() => { navigate("/register"); setMenuOpen(false); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 12px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #e84c2b 0%, #c0391a 100%)", cursor: "pointer", fontSize: "13.5px", fontWeight: "700", color: "white", fontFamily: "inherit" }}>
                            Daftar Gratis
                          </button>
                        </div>
                      ) : (
                        <>
                          {user?.role === "admin" && (
                            <button onClick={() => { navigate("/admin"); setMenuOpen(false); }} style={menuItemStyle}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f3ef")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                            >
                              <LayoutDashboard size={15} color="#6b6860" /> Admin Panel
                            </button>
                          )}
                          <button onClick={() => { navigate("/profile"); setMenuOpen(false); }} style={menuItemStyle}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f3ef")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                          >
                            <User size={15} color="#6b6860" /> Profile
                          </button>
                          <button onClick={() => { navigate("/request-soal"); setMenuOpen(false); }} style={menuItemStyle}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f3ef")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                          >
                            <MessageSquarePlus size={15} color="#6b6860" /> Request Soal
                          </button>
                          <button onClick={handleLogout} style={{ ...menuItemStyle, color: "#e84c2b" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#fff3f0")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                          >
                            <LogOut size={15} /> Keluar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {randomOpen   && <RandomSoal   onClose={() => setRandomOpen(false)} />}
      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
    </>
  );
}
