// src/features/admin/AdminLayout.jsx
import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../auth/authStore";

const MENU = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/soal", label: "Kelola Soal", icon: BookOpen },
  { to: "/admin/struktur", label: "Kelola Struktur", icon: FolderTree },
];

function SidebarLink({ to, label, icon: Icon, end }) {
  const [hovered, setHovered] = useState(false);
  return (
    <NavLink
      to={to}
      end={end}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 12px",
        borderRadius: "10px",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: "500",
        transition: "all .15s",
        background: isActive
          ? "rgba(232,76,43,0.15)"
          : hovered
          ? "rgba(255,255,255,0.06)"
          : "transparent",
        color: isActive
          ? "#e84c2b"
          : hovered
          ? "rgba(255,255,255,0.9)"
          : "rgba(255,255,255,0.6)",
      })}
    >
      <Icon size={17} />
      {label}
    </NavLink>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [logoutHovered, setLogoutHovered] = useState(false);
  const [backHovered, setBackHovered] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getPageTitle = () => {
    if (location.pathname === "/admin") return "Dashboard";
    if (location.pathname.startsWith("/admin/soal/tambah"))
      return "Tambah Soal";
    if (location.pathname.startsWith("/admin/soal/edit")) return "Edit Soal";
    if (location.pathname.startsWith("/admin/soal")) return "Kelola Soal";
    if (location.pathname.startsWith("/admin/struktur"))
      return "Kelola Struktur";
    return "Panel";
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#faf9f6" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          background: "#0f0e17",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "24px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
              }}
            >
              GS
            </div>
            <div>
              <div
                style={{ color: "white", fontWeight: "700", fontSize: "15px" }}
              >
                Gudang Soal
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "11px",
                  marginTop: "1px",
                }}
              >
                Admin Panel
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav
          style={{
            flex: 1,
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {MENU.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </nav>

        {/* User + Logout */}
        <div
          style={{
            padding: "16px 12px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                background: "#e84c2b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "700",
                fontSize: "13px",
                flexShrink: 0,
              }}
            >
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  color: "white",
                  fontSize: "13px",
                  fontWeight: "600",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.name}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "11px",
                  marginTop: "1px",
                }}
              >
                Administrator
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            onMouseEnter={() => setLogoutHovered(true)}
            onMouseLeave={() => setLogoutHovered(false)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              border: "none",
              background: logoutHovered ? "rgba(232,76,43,0.15)" : "none",
              cursor: "pointer",
              color: logoutHovered ? "#e84c2b" : "rgba(255,255,255,0.5)",
              fontSize: "14px",
              fontWeight: "500",
              fontFamily: "inherit",
              transition: "all .15s",
              textAlign: "left",
            }}
          >
            <LogOut size={17} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
        {/* Header */}
        <div
          style={{
            background: "white",
            borderBottom: "1px solid #e2ddd5",
            padding: "0 40px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#6b6860",
            }}
          >
            <span>Admin</span>
            <ChevronRight size={14} />
            <span style={{ color: "#0f0e17", fontWeight: "500" }}>
              {getPageTitle()}
            </span>
          </div>
          <a
            href="/home"
            onMouseEnter={() => setBackHovered(true)}
            onMouseLeave={() => setBackHovered(false)}
            style={{
              fontSize: "13px",
              color: backHovered ? "#0f0e17" : "#6b6860",
              textDecoration: "none",
              transition: "color .15s",
            }}
          >
            ← Kembali ke App
          </a>
        </div>

        {/* Page content */}
        <div style={{ padding: "40px" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
