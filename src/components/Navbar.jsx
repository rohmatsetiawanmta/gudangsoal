// src/components/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  X,
  BookOpen,
  Home,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Warehouse,
  Flame,
  Shuffle,
  MessageSquarePlus,
  TrendingUp,
  Menu,
  Dumbbell,
  Compass,
  Gamepad2,
  Zap,
} from "lucide-react";
import { useAuthStore } from "../features/auth/authStore";
import RandomSoal from "./RandomSoal";
import FeedbackModal from "../features/feedback/FeedbackModal";
import NotificationBell from "../features/notifications/NotificationBell";
import useWindowWidth from "../hooks/useWindowWidth";

const JELAJAHI_LINKS = [
  { to: "/browse",  label: "Direktori Soal", icon: BookOpen,  desc: "Jelajahi soal berdasarkan jenjang & topik", color: "#2563eb" },
  { to: "/populer", label: "Soal Populer",   icon: TrendingUp, desc: "Soal yang paling banyak dikerjakan",       color: "#e84c2b" },
  { to: "/games",   label: "Games",           icon: Gamepad2,  desc: "Mini-game matematika seru",               color: "#7c3aed" },
];

const NAV_LINKS = [
  { to: "/latihan", label: "Latihan", icon: Dumbbell },
];

const NAV_LINKS_LOGGED_IN = [
  { to: "/home",         label: "Beranda",      icon: Home },
  { to: "/latihan",      label: "Latihan",       icon: Dumbbell },
  { to: "/request-soal", label: "Request Soal",  icon: MessageSquarePlus },
];

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const width     = useWindowWidth();
  const isMobile  = width <= 480;
  const { user, isLoggedIn, logout } = useAuthStore();

  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [jelajahiOpen, setJelajahiOpen] = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [randomOpen,   setRandomOpen]   = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const searchRef   = useRef(null);
  const dropdownRef = useRef(null);
  const jelajahiRef = useRef(null);
  const menuRef     = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (jelajahiRef.current && !jelajahiRef.current.contains(e.target)) setJelajahiOpen(false);
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

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + "/");
  const navLinks = isLoggedIn ? NAV_LINKS_LOGGED_IN : NAV_LINKS;

  const navBtnStyle = {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "36px", height: "36px",
    borderRadius: "10px", border: "1px solid #e2ddd5",
    background: "none", cursor: "pointer", color: "#6b6860",
    transition: "background .15s, border-color .15s",
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
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(226,221,213,0.7)",
        boxShadow: "0 1px 12px rgba(0,0,0,0.04)",
        padding: `0 ${isMobile ? "16px" : "40px"}`,
        height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <Link to={isLoggedIn ? "/home" : "/"} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{
            width: "34px", height: "34px", background: "#e84c2b",
            borderRadius: "10px", display: "flex", alignItems: "center",
            justifyContent: "center", color: "white", flexShrink: 0,
            boxShadow: "0 2px 8px rgba(232,76,43,.3)",
          }}>
            <Warehouse size={18} />
          </div>
          <span style={{ fontWeight: "800", fontSize: "17px", color: "#0f0e17", letterSpacing: "-0.3px" }}>
            Gudang Soal
          </span>
        </Link>

        {/* Desktop nav links */}
        {!isMobile && !searchOpen && (
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = isActive(to);
              return (
                <Link key={to} to={to} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "6px 12px", borderRadius: "8px",
                  textDecoration: "none", fontSize: "14px", fontWeight: active ? "600" : "500",
                  color: active ? "#e84c2b" : "#6b6860",
                  background: active ? "#fff3f0" : "transparent",
                  transition: "background .15s, color .15s",
                }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "#f2efe8"; e.currentTarget.style.color = "#0f0e17"; } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b6860"; } }}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}

            {/* Jelajahi dropdown */}
            <div ref={jelajahiRef} style={{ position: "relative" }}>
              <button
                onClick={() => setJelajahiOpen((o) => !o)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "6px 12px", borderRadius: "8px", border: "none",
                  background: jelajahiOpen ? "#f2efe8" : "transparent",
                  fontSize: "14px", fontWeight: "500",
                  color: jelajahiOpen ? "#0f0e17" : "#6b6860",
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "background .15s, color .15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f2efe8"; e.currentTarget.style.color = "#0f0e17"; }}
                onMouseLeave={(e) => { if (!jelajahiOpen) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6b6860"; } }}
              >
                <Compass size={15} />
                Jelajahi
                <ChevronDown size={13} style={{ transform: jelajahiOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }} />
              </button>

              {jelajahiOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", left: 0,
                  background: "white", border: "1px solid #e2ddd5",
                  borderRadius: "16px", padding: "8px", minWidth: "240px",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.10)", zIndex: 200,
                }}>
                  {JELAJAHI_LINKS.map(({ to, label, icon: Icon, desc, color }) => (
                    <Link key={to} to={to} onClick={() => setJelajahiOpen(false)} style={{
                      display: "flex", alignItems: "flex-start", gap: "12px",
                      padding: "10px 12px", borderRadius: "10px",
                      textDecoration: "none", transition: "background .15s",
                    }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8f7f4")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{
                        width: "34px", height: "34px", borderRadius: "10px",
                        background: color + "12", border: `1px solid ${color}20`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Icon size={16} color={color} />
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: "#0f0e17" }}>{label}</div>
                        <div style={{ fontSize: "12px", color: "#b4b2a9", marginTop: "2px" }}>{desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Kanan */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {/* Desktop: Shuffle */}
          {!isMobile && (
            <button onClick={() => setRandomOpen(true)} title="Soal Random" style={navBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f2efe8"; e.currentTarget.style.borderColor = "#d4d0c8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "#e2ddd5"; }}
            >
              <Shuffle size={16} />
            </button>
          )}

          {/* Desktop: Search */}
          {!isMobile && (searchOpen ? (
            <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ position: "relative" }}>
                <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b6860", pointerEvents: "none" }} />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari soal, topik..."
                  style={{
                    paddingLeft: "36px", paddingRight: "16px", paddingTop: "8px", paddingBottom: "8px",
                    borderRadius: "10px", border: "1.5px solid #e84c2b",
                    fontSize: "14px", outline: "none", width: "240px",
                    fontFamily: "inherit", color: "#0f0e17", background: "#fff9f8",
                  }}
                />
              </div>
              <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(""); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "8px", border: "none", background: "none", cursor: "pointer", color: "#6b6860" }}>
                <X size={16} />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} style={navBtnStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f2efe8"; e.currentTarget.style.borderColor = "#d4d0c8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "#e2ddd5"; }}
            >
              <Search size={16} />
            </button>
          ))}

          {/* Notifikasi — hanya user login */}
          {!isMobile && isLoggedIn && <NotificationBell isMobile={false} />}

          {/* Masukan */}
          {!isMobile && (
            <button onClick={() => setFeedbackOpen(true)} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "7px 12px", borderRadius: "8px",
              border: "1px solid #e2ddd5", background: "white",
              cursor: "pointer", color: "#6b6860", fontSize: "13px",
              fontWeight: "600", fontFamily: "inherit", transition: "all .15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f2efe8"; e.currentTarget.style.color = "#0f0e17"; e.currentTarget.style.borderColor = "#d4d0c8"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#6b6860"; e.currentTarget.style.borderColor = "#e2ddd5"; }}
            >
              <MessageSquarePlus size={15} /> Masukan
            </button>
          )}

          {/* Desktop: Login / Avatar */}
          {!isMobile && (!isLoggedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "2px" }}>
              <button onClick={() => navigate("/login")} style={{
                padding: "7px 16px", borderRadius: "10px",
                border: "1px solid #e2ddd5", background: "white",
                fontSize: "14px", fontWeight: "600", cursor: "pointer",
                fontFamily: "inherit", color: "#0f0e17", transition: "all .15s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f2efe8"; e.currentTarget.style.borderColor = "#d4d0c8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2ddd5"; }}
              >
                Masuk
              </button>
              <button onClick={() => navigate("/register")} style={{
                padding: "7px 16px", borderRadius: "10px", border: "none",
                background: "#e84c2b", fontSize: "14px", fontWeight: "700",
                cursor: "pointer", fontFamily: "inherit", color: "white",
                boxShadow: "0 2px 8px rgba(232,76,43,.25)", transition: "background .15s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#c43d20")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#e84c2b")}
              >
                Daftar
              </button>
            </div>
          ) : (
            <div ref={dropdownRef} style={{ position: "relative", marginLeft: "2px" }}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "4px 10px 4px 4px", borderRadius: "10px",
                border: "1px solid #e2ddd5", background: "none",
                cursor: "pointer", transition: "background .15s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f2efe8")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <div style={{
                  width: "28px", height: "28px", borderRadius: "8px",
                  background: "#e84c2b", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "white", fontWeight: "800", fontSize: "13px",
                }}>
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#0f0e17", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.name?.split(" ")[0] || "User"}
                </span>
                <ChevronDown size={14} color="#b4b2a9" style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }} />
              </button>

              {dropdownOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: "white", border: "1px solid #e2ddd5",
                  borderRadius: "16px", padding: "8px", minWidth: "210px",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.10)", zIndex: 200,
                }}>
                  {/* User info header */}
                  <div style={{ padding: "10px 12px 14px", borderBottom: "1px solid #f2efe8", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#e84c2b", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "15px" }}>
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}>{user?.name}</div>
                        <div style={{ fontSize: "11px", color: "#b4b2a9", marginTop: "1px" }}>{user?.email}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(252,211,77,.15)", borderRadius: "7px", padding: "4px 9px", fontSize: "12px", fontWeight: "700", color: "#b45309" }}>
                        <Zap size={11} /> {user?.xp || 0} XP
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#fff3f0", borderRadius: "7px", padding: "4px 9px", fontSize: "12px", fontWeight: "700", color: "#e84c2b" }}>
                        <Flame size={11} /> {user?.streak || 0} hari
                      </div>
                    </div>
                  </div>

                  {[
                    ...(user?.role === "admin" ? [{ icon: LayoutDashboard, label: "Admin Panel", onClick: () => { navigate("/admin"); setDropdownOpen(false); }, danger: false }] : []),
                    { icon: User,   label: "Profile", onClick: () => { navigate("/profile"); setDropdownOpen(false); }, danger: false },
                    { icon: LogOut, label: "Keluar",  onClick: handleLogout, danger: true },
                  ].map(({ icon: Icon, label, onClick, danger }) => (
                    <button key={label} onClick={onClick} style={{ ...menuItemStyle, color: danger ? "#e84c2b" : "#0f0e17" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = danger ? "#fff3f0" : "#f2efe8")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <Icon size={15} /> {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Mobile: Bell + Hamburger */}
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {isLoggedIn && <NotificationBell isMobile={true} />}

              <div ref={menuRef} style={{ position: "relative" }}>
                <button onClick={() => setMenuOpen(!menuOpen)} style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "36px", height: "36px", borderRadius: "10px",
                  border: "1px solid #e2ddd5", background: "none",
                  cursor: "pointer", color: "#6b6860",
                }}>
                  {menuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>

                {menuOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    background: "white", border: "1px solid #e2ddd5",
                    borderRadius: "16px", padding: "8px", minWidth: "240px",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.12)", zIndex: 200,
                  }}>
                    {isLoggedIn && (
                      <div style={{ padding: "10px 12px 14px", borderBottom: "1px solid #f2efe8", marginBottom: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                          <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "#e84c2b", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "14px" }}>
                            {user?.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}>{user?.name}</div>
                            <div style={{ fontSize: "11px", color: "#b4b2a9" }}>{user?.email}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(252,211,77,.15)", borderRadius: "7px", padding: "4px 9px", fontSize: "12px", fontWeight: "700", color: "#b45309" }}>
                            <Zap size={11} /> {user?.xp || 0} XP
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#fff3f0", borderRadius: "7px", padding: "4px 9px", fontSize: "12px", fontWeight: "700", color: "#e84c2b" }}>
                            <Flame size={11} /> {user?.streak || 0} hari
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Search */}
                    <div style={{ padding: "8px 4px", borderBottom: "1px solid #f2efe8", marginBottom: "6px" }}>
                      <form onSubmit={handleSearch}>
                        <div style={{ position: "relative" }}>
                          <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#6b6860", pointerEvents: "none" }} />
                          <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari soal, topik..."
                            style={{ width: "100%", paddingLeft: "32px", paddingRight: "12px", paddingTop: "8px", paddingBottom: "8px", borderRadius: "8px", border: "1px solid #e2ddd5", fontSize: "13px", outline: "none", fontFamily: "inherit", color: "#0f0e17", boxSizing: "border-box" }}
                          />
                        </div>
                      </form>
                    </div>

                    {navLinks.map(({ to, label, icon: Icon }) => (
                      <button key={to} onClick={() => { navigate(to); setMenuOpen(false); }} style={{ ...menuItemStyle, color: isActive(to) ? "#e84c2b" : "#0f0e17", background: isActive(to) ? "#fff3f0" : "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = isActive(to) ? "#fff3f0" : "#f2efe8")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = isActive(to) ? "#fff3f0" : "none")}
                      >
                        <Icon size={15} color={isActive(to) ? "#e84c2b" : "#6b6860"} /> {label}
                      </button>
                    ))}

                    {JELAJAHI_LINKS.map(({ to, label, icon: Icon, color }) => (
                      <button key={to} onClick={() => { navigate(to); setMenuOpen(false); }} style={menuItemStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f2efe8")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                      >
                        <Icon size={15} color={color} /> {label}
                      </button>
                    ))}

                    <button onClick={() => { setMenuOpen(false); setRandomOpen(true); }} style={menuItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f2efe8")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <Shuffle size={15} color="#6b6860" /> Soal Random
                    </button>

                    <button onClick={() => { setMenuOpen(false); setFeedbackOpen(true); }} style={menuItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f2efe8")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      <MessageSquarePlus size={15} color="#6b6860" /> Kirim Masukan
                    </button>

                    <div style={{ borderTop: "1px solid #f2efe8", marginTop: "6px", paddingTop: "6px" }}>
                      {!isLoggedIn ? (
                        <>
                          <button onClick={() => { navigate("/login"); setMenuOpen(false); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "9px 12px", borderRadius: "8px", border: "1px solid #e2ddd5", background: "white", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: "#0f0e17", fontFamily: "inherit", marginBottom: "6px" }}>
                            Masuk
                          </button>
                          <button onClick={() => { navigate("/register"); setMenuOpen(false); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "9px 12px", borderRadius: "8px", border: "none", background: "#e84c2b", cursor: "pointer", fontSize: "14px", fontWeight: "700", color: "white", fontFamily: "inherit" }}>
                            Daftar Gratis
                          </button>
                        </>
                      ) : (
                        <>
                          {user?.role === "admin" && (
                            <button onClick={() => { navigate("/admin"); setMenuOpen(false); }} style={menuItemStyle}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#f2efe8")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                            >
                              <LayoutDashboard size={15} color="#6b6860" /> Admin Panel
                            </button>
                          )}
                          <button onClick={() => { navigate("/profile"); setMenuOpen(false); }} style={menuItemStyle}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f2efe8")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                          >
                            <User size={15} color="#6b6860" /> Profile
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
