// src/features/admin/AdminSiteSettings.jsx
import { useEffect, useState } from "react";
import { Settings, BookOpen, GraduationCap, Package, Dumbbell } from "lucide-react";
import { Helmet } from "react-helmet-async";
import api from "../../lib/api";
import useWindowWidth from "../../hooks/useWindowWidth";

const MENU_ITEMS = [
  {
    key: "menu_soal",
    label: "Soal",
    desc: "Halaman browse soal (/browse) tampil di navbar",
    icon: BookOpen,
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    key: "menu_materi",
    label: "Materi",
    desc: "Halaman daftar materi (/materi) tampil di navbar",
    icon: GraduationCap,
    color: "#1a8a6e",
    bg: "#e4f5f0",
  },
  {
    key: "menu_paket",
    label: "Paket",
    desc: "Halaman daftar paket soal (/paket) tampil di navbar",
    icon: Package,
    color: "#7c3aed",
    bg: "#ede9fe",
  },
  {
    key: "menu_latihan",
    label: "Latihan",
    desc: "Halaman daftar latihan/quiz (/latihan) tampil di navbar",
    icon: Dumbbell,
    color: "#e84c2b",
    bg: "#fff3f0",
  },
];

export default function AdminSiteSettings() {
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [settings, setSettings] = useState({
    menu_soal: true,
    menu_materi: true,
    menu_paket: true,
    menu_latihan: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/admin/site-settings")
      .then(r => setSettings(prev => ({ ...prev, ...(r || {}) })))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (key) => {
    const newVal = !settings[key];
    const next = { ...settings, [key]: newVal };
    setSettings(next);
    setSaving(true);
    setSaved(false);
    try {
      await api.post("/admin/site-settings", next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch(e) {
      console.error("Toggle save error:", e);
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: isMobile ? "16px" : "24px", maxWidth: "760px" }}>
      <Helmet><title>Pengaturan Menu — Admin</title></Helmet>

      {/* Hero header */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #1a0e2c 100%)",
        padding: isMobile ? "24px 20px" : "28px 32px",
        marginBottom: "24px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%",
          transform: "translateY(-50%)",
          opacity: 0.06, userSelect: "none", lineHeight: 1,
          pointerEvents: "none", color: "white",
        }}>
          <Settings size={isMobile ? 80 : 110} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "6px" }}>
            Sistem
          </div>
          <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 12px" }}>
            Pengaturan Menu
          </h1>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "rgba(255,255,255,.8)", background: "rgba(255,255,255,.1)" }}>
              {MENU_ITEMS.filter(m => settings?.[m.key] !== false).length} / {MENU_ITEMS.length} aktif
            </span>
            {saved && (
              <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "#6ee7b7", background: "rgba(110,231,183,.12)" }}>
                Tersimpan ✓
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Settings card */}
      <div style={{
        background: "white",
        borderRadius: "14px",
        border: "1px solid #e2ddd5",
        borderLeft: "3px solid #7c3aed",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "14px 20px",
          borderBottom: "1px solid #f0ede6",
          fontSize: "13px", fontWeight: "700", color: "#0f0e17",
          background: "linear-gradient(to right, #faf9f6, white)",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
          Menu Navigasi
        </div>

        <div style={{ padding: "8px 0" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#b4b2a9", fontSize: "13px" }}>Memuat...</div>
          ) : (
            MENU_ITEMS.map((item, i) => {
              const Icon = item.icon;
              const isOn = settings?.[item.key] ?? true;
              return (
                <div
                  key={item.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px 20px",
                    borderBottom: i < MENU_ITEMS.length - 1 ? "1px solid #f0ede6" : "none",
                    transition: "background .12s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#faf9f6"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* Icon */}
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "11px",
                    background: isOn ? item.bg : "#f2efe8",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "background .2s",
                  }}>
                    <Icon size={18} color={isOn ? item.color : "#b4b2a9"} />
                  </div>

                  {/* Label + desc */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17", marginBottom: "2px" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b6860", lineHeight: 1.4 }}>
                      {item.desc}
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(item.key)}
                    disabled={saving}
                    style={{
                      width: "44px", height: "24px", borderRadius: "12px",
                      background: isOn ? "#1a8a6e" : "#d4d0c8",
                      border: "none", cursor: saving ? "not-allowed" : "pointer",
                      position: "relative", flexShrink: 0,
                      transition: "background .2s",
                      padding: 0,
                    }}
                  >
                    <span style={{
                      position: "absolute",
                      top: "3px",
                      left: isOn ? "23px" : "3px",
                      width: "18px", height: "18px",
                      borderRadius: "50%", background: "white",
                      transition: "left .2s",
                      boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                    }} />
                  </button>

                  {/* Status label */}
                  <span style={{
                    fontSize: "11px", fontWeight: "700",
                    padding: "3px 9px", borderRadius: "6px",
                    background: isOn ? "#e4f5f0" : "#f2efe8",
                    color: isOn ? "#1a8a6e" : "#9b9992",
                    minWidth: "44px", textAlign: "center",
                    flexShrink: 0,
                  }}>
                    {isOn ? "ON" : "OFF"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <p style={{ fontSize: "12px", color: "#b4b2a9", marginTop: "16px" }}>
        Perubahan langsung berlaku — item yang dinonaktifkan tidak akan muncul di navbar.
      </p>
    </div>
  );
}
