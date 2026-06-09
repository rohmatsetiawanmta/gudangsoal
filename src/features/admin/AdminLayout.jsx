// src/features/admin/AdminLayout.jsx
import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Flag,
  MessageSquarePlus,
  ScrollText,
  Menu,
  X,
  Sparkles,
  FileJson,
} from "lucide-react";
import { useAuthStore } from "../auth/authStore";
import useWindowWidth from "../../hooks/useWindowWidth";

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
  { to: "/admin/changelog", label: "Changelog", icon: ScrollText },
  { to: "/admin/feedback", label: "Masukan User", icon: MessageSquarePlus },
  { to: "/admin/latihan", label: "Kelola Latihan", icon: BookOpen },
  { to: "/admin/soal/ai-bulk", label: "AI Bulk Soal", icon: Sparkles },
  { to: "/admin/soal/bulk-import", label: "Bulk Import JSON", icon: FileJson },
];

function SidebarLink({ to, label, icon: Icon, end, collapsed, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
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
  const width = useWindowWidth();
  const isMobile = width <= 480;

  // Desktop: collapsed sidebar. Mobile: drawer open/close
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutHovered, setLogoutHovered] = useState(false);
  const [backHovered, setBackHovered] = useState(false);

  // Tutup drawer otomatis saat navigasi
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Tutup drawer saat resize ke desktop
  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getPageTitle = () => {
    if (location.pathname === "/admin") return "Dashboard";
    if (location.pathname.startsWith("/admin/soal/tambah"))
      return "Tambah Soal";
    if (location.pathname.startsWith("/admin/soal/edit")) return "Edit Soal";
    if (location.pathname.startsWith("/admin/soal/ai-bulk")) return "AI Bulk Soal";
    if (location.pathname.startsWith("/admin/soal/bulk-import")) return "Bulk Import JSON";
    if (location.pathname.startsWith("/admin/soal")) return "Kelola Soal";
    if (location.pathname.startsWith("/admin/struktur"))
      return "Kelola Struktur";
    if (location.pathname.startsWith("/admin/users")) return "Kelola User";
    if (location.pathname.startsWith("/admin/reports")) return "Laporan Soal";
    if (location.pathname.startsWith("/admin/soal-requests"))
      return "Request Soal";
    if (location.pathname.startsWith("/admin/changelog")) return "Changelog";
    if (location.pathname.startsWith("/admin/feedback")) return "Masukan User";
    if (location.pathname.startsWith("/admin/latihan")) return "Kelola Latihan";
    return "Panel";
  };

  // Sidebar content — dipakai di desktop sidebar & mobile drawer
  const SidebarContent = ({ isDrawer = false }) => (
    <>
      {/* Logo */}
      <div
        style={{
          padding: !isDrawer && collapsed ? "20px 12px" : "24px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          justifyContent: !isDrawer && collapsed ? "center" : "flex-start",
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
        {(isDrawer || !collapsed) && (
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
        {/* Tombol X di drawer mobile */}
        {isDrawer && (
          <button
            onClick={() => setDrawerOpen(false)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.5)",
              display: "flex",
              padding: "4px",
            }}
          >
            <X size={18} />
          </button>
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
          <SidebarLink
            key={item.to}
            {...item}
            collapsed={!isDrawer && collapsed}
            onClick={isDrawer ? () => setDrawerOpen(false) : undefined}
          />
        ))}
      </nav>

      {/* User + Logout */}
      <div
        style={{
          padding: "16px 8px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {(isDrawer || !collapsed) && (
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
          title={!isDrawer && collapsed ? "Keluar" : undefined}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: !isDrawer && collapsed ? "center" : "flex-start",
            gap: !isDrawer && collapsed ? 0 : "10px",
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
          {(isDrawer || !collapsed) && "Keluar"}
        </button>
      </div>
    </>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#faf9f6" }}>
      {/* ── DESKTOP SIDEBAR ── */}
      {!isMobile && (
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
          <SidebarContent />
        </aside>
      )}

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {isMobile && drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 400,
            }}
          />
          {/* Drawer */}
          <aside
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "260px",
              height: "100vh",
              background: "#0f0e17",
              display: "flex",
              flexDirection: "column",
              zIndex: 401,
              overflowY: "auto",
            }}
          >
            <SidebarContent isDrawer />
          </aside>
        </>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
        {/* Header */}
        <div
          style={{
            background: isMobile ? "#0f0e17" : "white",
            borderBottom: isMobile ? "none" : "1px solid #e2ddd5",
            padding: isMobile ? "0 16px" : "0 40px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {isMobile ? (
              <button
                onClick={() => setDrawerOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.08)",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.8)",
                  flexShrink: 0,
                }}
              >
                <Menu size={15} />
              </button>
            ) : (
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
            )}

            {/* Breadcrumb */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
              }}
            >
              <span
                style={{
                  color: isMobile ? "rgba(255,255,255,0.45)" : "#6b6860",
                }}
              >
                Admin
              </span>
              <ChevronRight
                size={14}
                color={isMobile ? "rgba(255,255,255,0.25)" : "#b4b2a9"}
              />
              <span
                style={{
                  color: isMobile ? "white" : "#0f0e17",
                  fontWeight: "600",
                }}
              >
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
              color: isMobile
                ? backHovered
                  ? "white"
                  : "rgba(255,255,255,0.5)"
                : backHovered
                ? "#0f0e17"
                : "#6b6860",
              textDecoration: "none",
              transition: "color .15s",
              whiteSpace: "nowrap",
            }}
          >
            {isMobile ? "← App" : "← Kembali ke App"}
          </a>
        </div>
        {/* Page content */}
        <div style={{ padding: isMobile ? "20px 16px" : "40px" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
