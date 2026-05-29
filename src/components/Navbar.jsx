// src/components/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useAuthStore } from "../features/auth/authStore";
import RandomSoal from "./RandomSoal";
import useWindowWidth from "../hooks/useWindowWidth";

const NAV_LINKS = [
  { to: "/browse", label: "Direktori Soal", icon: BookOpen },
  { to: "/populer", label: "Soal Populer", icon: TrendingUp },
];

const NAV_LINKS_LOGGED_IN = [
  { to: "/home", label: "Beranda", icon: Home },
  { to: "/browse", label: "Direktori Soal", icon: BookOpen },
  { to: "/populer", label: "Soal Populer", icon: TrendingUp },
  { to: "/request-soal", label: "Request Soal", icon: MessageSquarePlus },
];

export default function Navbar() {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 480;
  const { user, isLoggedIn, logout } = useAuthStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [randomOpen, setRandomOpen] = useState(false);

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
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

  const navLinks = isLoggedIn ? NAV_LINKS_LOGGED_IN : NAV_LINKS;

  return (
    <>
      <nav
        style={{
          background: "white",
          borderBottom: "1px solid #e2ddd5",
          padding: `0 ${isMobile ? "16px" : "40px"}`,
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Kiri — Logo */}
        <Link
          to={isLoggedIn ? "/home" : "/"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              background: "#e84c2b",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "800",
              fontSize: "13px",
              flexShrink: 0,
            }}
          >
            <Warehouse size={18} />
          </div>
          <span
            style={{ fontWeight: "700", fontSize: "17px", color: "#0f0e17" }}
          >
            Gudang Soal
          </span>
        </Link>

        {/* Desktop — Nav links */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#6b6860",
                  transition: "background .15s, color .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f2efe8";
                  e.currentTarget.style.color = "#0f0e17";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#6b6860";
                }}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Kanan */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Shuffle — desktop only */}
          {!isMobile && (
            <button
              onClick={() => setRandomOpen(true)}
              title="Soal Random"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                border: "1px solid #e2ddd5",
                background: "none",
                cursor: "pointer",
                color: "#6b6860",
                transition: "background .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f2efe8")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <Shuffle size={16} />
            </button>
          )}

          {/* Search — desktop only */}
          {!isMobile &&
            (searchOpen ? (
              <form
                onSubmit={handleSearch}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div style={{ position: "relative" }}>
                  <Search
                    size={15}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6b6860",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    ref={searchRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari soal, topik..."
                    style={{
                      paddingLeft: "36px",
                      paddingRight: "16px",
                      paddingTop: "8px",
                      paddingBottom: "8px",
                      borderRadius: "10px",
                      border: "1px solid #e2ddd5",
                      fontSize: "14px",
                      outline: "none",
                      width: "240px",
                      fontFamily: "inherit",
                      color: "#0f0e17",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "#6b6860",
                  }}
                >
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  border: "1px solid #e2ddd5",
                  background: "none",
                  cursor: "pointer",
                  color: "#6b6860",
                  transition: "background .15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f2efe8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <Search size={16} />
              </button>
            ))}

          {/* Desktop — Login/Avatar */}
          {!isMobile &&
            (!isLoggedIn ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "10px",
                    border: "1px solid #e2ddd5",
                    background: "white",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: "#0f0e17",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f2efe8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  Masuk
                </button>
                <button
                  onClick={() => navigate("/register")}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#e84c2b",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: "white",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#c43d20")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#e84c2b")
                  }
                >
                  Daftar
                </button>
              </div>
            ) : (
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "4px 8px 4px 4px",
                    borderRadius: "10px",
                    border: "1px solid #e2ddd5",
                    background: "none",
                    cursor: "pointer",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f2efe8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      background: "#e84c2b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "13px",
                    }}
                  >
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#0f0e17",
                      maxWidth: "100px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user?.name?.split(" ")[0] || "User"}
                  </span>
                  <ChevronDown
                    size={14}
                    color="#6b6860"
                    style={{
                      transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform .2s",
                    }}
                  />
                </button>

                {dropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      background: "white",
                      border: "1px solid #e2ddd5",
                      borderRadius: "14px",
                      padding: "8px",
                      minWidth: "200px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      zIndex: 200,
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 12px 12px",
                        borderBottom: "1px solid #f2efe8",
                        marginBottom: "6px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#0f0e17",
                        }}
                      >
                        {user?.name}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b6860",
                          marginTop: "2px",
                        }}
                      >
                        {user?.email}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginTop: "10px",
                        }}
                      >
                        <div
                          style={{
                            background: "#fff3f0",
                            borderRadius: "8px",
                            padding: "5px 10px",
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#e84c2b",
                          }}
                        >
                          {user?.xp || 0} XP
                        </div>
                        <div
                          style={{
                            background: "#fff3f0",
                            borderRadius: "8px",
                            padding: "5px 10px",
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#e84c2b",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Flame size={12} />
                          {user?.streak || 0} hari
                        </div>
                      </div>
                    </div>
                    {[
                      ...(user?.role === "admin"
                        ? [
                            {
                              icon: LayoutDashboard,
                              label: "Admin Panel",
                              onClick: () => {
                                navigate("/admin");
                                setDropdownOpen(false);
                              },
                              danger: false,
                            },
                          ]
                        : []),
                      {
                        icon: User,
                        label: "Profile",
                        onClick: () => {
                          navigate("/profile");
                          setDropdownOpen(false);
                        },
                        danger: false,
                      },
                      {
                        icon: LogOut,
                        label: "Keluar",
                        onClick: handleLogout,
                        danger: true,
                      },
                    ].map(({ icon: Icon, label, onClick, danger }) => (
                      <button
                        key={label}
                        onClick={onClick}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: danger ? "#e84c2b" : "#0f0e17",
                          fontFamily: "inherit",
                          textAlign: "left",
                          transition: "background .15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = danger
                            ? "#fff3f0"
                            : "#f2efe8")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "none")
                        }
                      >
                        <Icon size={15} />
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

          {/* Mobile — Hamburger */}
          {isMobile && (
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  border: "1px solid #e2ddd5",
                  background: "none",
                  cursor: "pointer",
                  color: "#6b6860",
                }}
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>

              {/* Mobile dropdown menu */}
              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    background: "white",
                    border: "1px solid #e2ddd5",
                    borderRadius: "14px",
                    padding: "8px",
                    minWidth: "220px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    zIndex: 200,
                  }}
                >
                  {/* User info kalau login */}
                  {isLoggedIn && (
                    <div
                      style={{
                        padding: "10px 12px 12px",
                        borderBottom: "1px solid #f2efe8",
                        marginBottom: "6px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#0f0e17",
                        }}
                      >
                        {user?.name}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b6860",
                          marginTop: "2px",
                        }}
                      >
                        {user?.email}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginTop: "8px",
                        }}
                      >
                        <div
                          style={{
                            background: "#fff3f0",
                            borderRadius: "8px",
                            padding: "4px 8px",
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#e84c2b",
                          }}
                        >
                          {user?.xp || 0} XP
                        </div>
                        <div
                          style={{
                            background: "#fff3f0",
                            borderRadius: "8px",
                            padding: "4px 8px",
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#e84c2b",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Flame size={11} />
                          {user?.streak || 0} hari
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Search */}
                  <div
                    style={{
                      padding: "8px 4px",
                      borderBottom: "1px solid #f2efe8",
                      marginBottom: "6px",
                    }}
                  >
                    <form onSubmit={handleSearch}>
                      <div style={{ position: "relative" }}>
                        <Search
                          size={14}
                          style={{
                            position: "absolute",
                            left: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#6b6860",
                            pointerEvents: "none",
                          }}
                        />
                        <input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Cari soal, topik..."
                          style={{
                            width: "100%",
                            paddingLeft: "32px",
                            paddingRight: "12px",
                            paddingTop: "8px",
                            paddingBottom: "8px",
                            borderRadius: "8px",
                            border: "1px solid #e2ddd5",
                            fontSize: "13px",
                            outline: "none",
                            fontFamily: "inherit",
                            color: "#0f0e17",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                    </form>
                  </div>

                  {/* Nav links */}
                  {navLinks.map(({ to, label, icon: Icon }) => (
                    <button
                      key={to}
                      onClick={() => {
                        navigate(to);
                        setMenuOpen(false);
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#0f0e17",
                        fontFamily: "inherit",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f2efe8")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "none")
                      }
                    >
                      <Icon size={15} color="#6b6860" />
                      {label}
                    </button>
                  ))}

                  {/* Soal random */}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setRandomOpen(true);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#0f0e17",
                      fontFamily: "inherit",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f2efe8")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                  >
                    <Shuffle size={15} color="#6b6860" /> Soal Random
                  </button>

                  <div
                    style={{
                      borderTop: "1px solid #f2efe8",
                      marginTop: "6px",
                      paddingTop: "6px",
                    }}
                  >
                    {!isLoggedIn ? (
                      <>
                        <button
                          onClick={() => {
                            navigate("/login");
                            setMenuOpen(false);
                          }}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "9px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e2ddd5",
                            background: "white",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#0f0e17",
                            fontFamily: "inherit",
                            marginBottom: "6px",
                          }}
                        >
                          Masuk
                        </button>
                        <button
                          onClick={() => {
                            navigate("/register");
                            setMenuOpen(false);
                          }}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "9px 12px",
                            borderRadius: "8px",
                            border: "none",
                            background: "#e84c2b",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "white",
                            fontFamily: "inherit",
                          }}
                        >
                          Daftar Gratis
                        </button>
                      </>
                    ) : (
                      <>
                        {user?.role === "admin" && (
                          <button
                            onClick={() => {
                              navigate("/admin");
                              setMenuOpen(false);
                            }}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "9px 12px",
                              borderRadius: "8px",
                              border: "none",
                              background: "none",
                              cursor: "pointer",
                              fontSize: "14px",
                              fontWeight: "500",
                              color: "#0f0e17",
                              fontFamily: "inherit",
                              textAlign: "left",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#f2efe8")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "none")
                            }
                          >
                            <LayoutDashboard size={15} color="#6b6860" /> Admin
                            Panel
                          </button>
                        )}
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setMenuOpen(false);
                          }}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "9px 12px",
                            borderRadius: "8px",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#0f0e17",
                            fontFamily: "inherit",
                            textAlign: "left",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#f2efe8")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "none")
                          }
                        >
                          <User size={15} color="#6b6860" /> Profile
                        </button>
                        <button
                          onClick={handleLogout}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "9px 12px",
                            borderRadius: "8px",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#e84c2b",
                            fontFamily: "inherit",
                            textAlign: "left",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#fff3f0")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "none")
                          }
                        >
                          <LogOut size={15} /> Keluar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {randomOpen && <RandomSoal onClose={() => setRandomOpen(false)} />}
    </>
  );
}
