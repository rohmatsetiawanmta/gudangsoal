// src/features/admin/AdminLayout.jsx
import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, FolderTree, LogOut, ChevronRight,
  PanelLeftClose, PanelLeftOpen, Users, Flag, Inbox,
  ScrollText, Menu, X, MessageCircle, Dumbbell, GraduationCap,
} from "lucide-react";
import { useAuthStore } from "../auth/authStore";
import useWindowWidth from "../../hooks/useWindowWidth";

// ── Menu structure ────────────────────────────────────────────────────────────
// { type: "link", ... } or { type: "section", label }

const MENU = [
  { type: "link", to: "/admin",          label: "Dashboard",       icon: LayoutDashboard, end: true },

  { type: "section", label: "Konten" },
  { type: "link", to: "/admin/struktur", label: "Kelola Struktur", icon: FolderTree },
  { type: "link", to: "/admin/soal",     label: "Kelola Soal",     icon: BookOpen },
  { type: "link", to: "/admin/latihan",  label: "Kelola Latihan",  icon: Dumbbell },
  { type: "link", to: "/admin/materi",   label: "Kelola Materi",   icon: GraduationCap },

  { type: "section", label: "Komunitas" },
  { type: "link", to: "/admin/users",        label: "Kelola User",   icon: Users },
  { type: "link", to: "/admin/reports",      label: "Laporan Soal",  icon: Flag },
  { type: "link", to: "/admin/soal-requests",label: "Request Soal",  icon: Inbox },
  { type: "link", to: "/admin/feedback",     label: "Masukan User",  icon: MessageCircle },

  { type: "section", label: "Sistem" },
  { type: "link", to: "/admin/changelog", label: "Changelog", icon: ScrollText },
];

// ── SidebarLink ───────────────────────────────────────────────────────────────

function SidebarLink({ to, label, icon: Icon, end, collapsed, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <NavLink to={to} end={end} onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={collapsed ? label : undefined}
      style={({ isActive }) => ({
        display: "flex", alignItems: "center",
        gap: collapsed ? 0 : "10px",
        padding: "9px 10px",
        borderRadius: "10px",
        textDecoration: "none",
        fontSize: "13.5px",
        fontWeight: "500",
        transition: "all .15s",
        justifyContent: collapsed ? "center" : "flex-start",
        background: isActive ? "rgba(232,76,43,0.15)" : hovered ? "rgba(255,255,255,0.06)" : "transparent",
        color: isActive ? "#e84c2b" : hovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)",
      })}>
      <Icon size={17} />
      {!collapsed && label}
    </NavLink>
  );
}

// ── SidebarSection label ──────────────────────────────────────────────────────

function SectionLabel({ label, collapsed }) {
  if (collapsed) {
    return <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "6px 8px" }} />;
  }
  return (
    <div style={{ padding: "10px 10px 4px", fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: ".1em" }}>
      {label}
    </div>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────────

export default function AdminLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuthStore();
  const width     = useWindowWidth();
  const isMobile  = width <= 480;

  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutHovered, setLogoutHovered] = useState(false);
  const [backHovered, setBackHovered] = useState(false);

  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);
  useEffect(() => { if (!isMobile) setDrawerOpen(false); }, [isMobile]);

  const handleLogout = () => { logout(); navigate("/"); };

  const getPageTitle = () => {
    if (location.pathname === "/admin") return "Dashboard";
    if (location.pathname.startsWith("/admin/soal/tambah"))      return "Tambah Soal";
    if (location.pathname.startsWith("/admin/soal/edit"))        return "Edit Soal";
    if (location.pathname.startsWith("/admin/soal/bulk-import")) return "Bulk Import JSON";
    if (location.pathname.startsWith("/admin/soal"))             return "Kelola Soal";
    if (location.pathname.startsWith("/admin/struktur"))         return "Kelola Struktur";
    if (location.pathname.startsWith("/admin/users"))            return "Kelola User";
    if (location.pathname.startsWith("/admin/reports"))          return "Laporan Soal";
    if (location.pathname.startsWith("/admin/soal-requests"))    return "Request Soal";
    if (location.pathname.startsWith("/admin/changelog"))        return "Changelog";
    if (location.pathname.startsWith("/admin/feedback"))         return "Masukan User";
    if (location.pathname.startsWith("/admin/latihan"))          return "Kelola Latihan";
    if (location.pathname.startsWith("/admin/materi/tambah"))   return "Tambah Materi";
    if (location.pathname.startsWith("/admin/materi/edit"))     return "Edit Materi";
    if (location.pathname.startsWith("/admin/materi"))          return "Kelola Materi";
    return "Panel";
  };

  const SidebarContent = ({ isDrawer = false }) => {
    const isCollapsed = !isDrawer && collapsed;
    return (
      <>
        {/* Logo */}
        <div style={{ padding: isCollapsed ? "20px 12px" : "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "10px", justifyContent: isCollapsed ? "center" : "flex-start", transition: "padding .2s" }}>
          <div style={{ width: "32px", height: "32px", background: "#e84c2b", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "12px", flexShrink: 0 }}>
            GS
          </div>
          {!isCollapsed && (
            <div>
              <div style={{ color: "white", fontWeight: "700", fontSize: "14px", whiteSpace: "nowrap" }}>Gudang Soal</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginTop: "1px" }}>Admin Panel</div>
            </div>
          )}
          {isDrawer && (
            <button onClick={() => setDrawerOpen(false)}
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", display: "flex", padding: "4px" }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto" }}>
          {MENU.map((item, i) =>
            item.type === "section"
              ? <SectionLabel key={i} label={item.label} collapsed={isCollapsed} />
              : <SidebarLink key={item.to} {...item} collapsed={isCollapsed} onClick={isDrawer ? () => setDrawerOpen(false) : undefined} />
          )}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {!isCollapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", marginBottom: "4px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#e84c2b", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "12px", flexShrink: 0 }}>
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "white", fontSize: "13px", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginTop: "1px" }}>Administrator</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            onMouseEnter={() => setLogoutHovered(true)}
            onMouseLeave={() => setLogoutHovered(false)}
            title={isCollapsed ? "Keluar" : undefined}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "flex-start", gap: isCollapsed ? 0 : "10px", padding: "9px 10px", borderRadius: "10px", border: "none", background: logoutHovered ? "rgba(232,76,43,0.15)" : "none", cursor: "pointer", color: logoutHovered ? "#e84c2b" : "rgba(255,255,255,0.45)", fontSize: "13.5px", fontWeight: "500", fontFamily: "inherit", transition: "all .15s", textAlign: "left" }}>
            <LogOut size={17} />
            {!isCollapsed && "Keluar"}
          </button>
        </div>
      </>
    );
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#faf9f6" }}>

      {/* ── DESKTOP SIDEBAR ── */}
      {!isMobile && (
        <aside style={{ width: collapsed ? "64px" : "220px", background: "#0f0e17", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", transition: "width .2s ease", overflow: "hidden" }}>
          <SidebarContent />
        </aside>
      )}

      {/* ── MOBILE DRAWER ── */}
      {isMobile && drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 400 }} />
          <aside style={{ position: "fixed", top: 0, left: 0, width: "260px", height: "100vh", background: "#0f0e17", display: "flex", flexDirection: "column", zIndex: 401, overflowY: "auto" }}>
            <SidebarContent isDrawer />
          </aside>
        </>
      )}

      {/* ── MAIN ── */}
      <div style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
        {/* Header */}
        <div style={{ background: isMobile ? "#0f0e17" : "white", borderBottom: isMobile ? "none" : "1px solid #e2ddd5", padding: isMobile ? "0 16px" : "0 40px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {isMobile ? (
              <button onClick={() => setDrawerOpen(true)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", cursor: "pointer", color: "rgba(255,255,255,0.8)", flexShrink: 0 }}>
                <Menu size={15} />
              </button>
            ) : (
              <button onClick={() => setCollapsed(c => !c)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e2ddd5", background: "white", cursor: "pointer", color: "#6b6860", transition: "all .15s", flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.background = "#f2efe8"; e.currentTarget.style.color = "#0f0e17"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#6b6860"; }}
                title={collapsed ? "Buka sidebar" : "Tutup sidebar"}>
                {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
              <span style={{ color: isMobile ? "rgba(255,255,255,0.45)" : "#6b6860" }}>Admin</span>
              <ChevronRight size={14} color={isMobile ? "rgba(255,255,255,0.25)" : "#b4b2a9"} />
              <span style={{ color: isMobile ? "white" : "#0f0e17", fontWeight: "600" }}>{getPageTitle()}</span>
            </div>
          </div>
          <a href="/home"
            onMouseEnter={() => setBackHovered(true)}
            onMouseLeave={() => setBackHovered(false)}
            style={{ fontSize: "13px", color: isMobile ? (backHovered ? "white" : "rgba(255,255,255,0.5)") : (backHovered ? "#0f0e17" : "#6b6860"), textDecoration: "none", transition: "color .15s", whiteSpace: "nowrap" }}>
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
