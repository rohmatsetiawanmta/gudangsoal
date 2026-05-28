// src/features/admin/AdminLayout.jsx
import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  LogOut,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Flag,
  MessageSquarePlus,
} from "lucide-react";
import { useAuthStore } from "../auth/authStore";

const MENU = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/soal", label: "Kelola Soal", icon: BookOpen },
  { to: "/admin/struktur", label: "Kelola Struktur", icon: FolderTree },
  { to: "/admin/users", label: "Kelola User", icon: Users },
  { to: "/admin/reports", label: "Laporan Soal", icon: Flag },
  {
    to: "/admin/soal-requests",
    label: "Request Soal",
    icon: MessageSquarePlus,
  },
];

function SidebarLink({ to, label, icon: Icon, end, collapsed }) {
  const [hovered, setHovered] = useState(false);
  return (
    <NavLink
      to={to}
      end={end}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={collapsed ? label : undefined}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: collapsed ? 0 : "10px",
        padding: "10px",
        borderRadius: "10px",
        textDecoration: "none",
        fontSize: "14px",
        fontWeight: "500",
        transition: "all .15s",
        justifyContent: collapsed ? "center" : "flex-start",
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
      <Icon size={18} />
      {!collapsed && label}
    </NavLink>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
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
          width: collapsed ? "64px" : "240px",
          background: "#0f0e17",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          transition: "width .2s ease",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: collapsed ? "20px 12px" : "24px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            justifyContent: collapsed ? "center" : "flex-start",
            transition: "padding .2s",
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
            GS
          </div>
          {!collapsed && (
            <div>
              <div
                style={{
                  color: "white",
                  fontWeight: "700",
                  fontSize: "15px",
                  whiteSpace: "nowrap",
                }}
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
          )}
        </div>

        {/* Menu */}
        <nav
          style={{
            flex: 1,
            padding: "16px 8px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {MENU.map((item) => (
            <SidebarLink key={item.to} {...item} collapsed={collapsed} />
          ))}
        </nav>

        {/* User + Logout */}
        <div
          style={{
            padding: "16px 8px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {!collapsed && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 8px",
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
          )}
          <button
            onClick={handleLogout}
            onMouseEnter={() => setLogoutHovered(true)}
            onMouseLeave={() => setLogoutHovered(false)}
            title={collapsed ? "Keluar" : undefined}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: collapsed ? 0 : "10px",
              padding: "10px",
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
            {!collapsed && "Keluar"}
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Toggle button */}
            <button
              onClick={() => setCollapsed((c) => !c)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                border: "1px solid #e2ddd5",
                background: "white",
                cursor: "pointer",
                color: "#6b6860",
                transition: "all .15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f2efe8";
                e.currentTarget.style.color = "#0f0e17";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.color = "#6b6860";
              }}
              title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen size={15} />
              ) : (
                <PanelLeftClose size={15} />
              )}
            </button>

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
