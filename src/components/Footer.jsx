// src/components/Footer.jsx
import { Instagram, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import useWindowWidth from "../hooks/useWindowWidth";

function ThreadsIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.236-8.184-3.604C2.35 18.283 1.5 15.526 1.472 12.01v-.016c.03-3.516.878-6.273 2.522-8.386C5.845 1.24 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.68 1.293 2.858 3.17 3.509 5.584l-2.189.586c-1.084-4.03-3.812-6.052-8.147-6.082-2.922.021-5.13.971-6.566 2.824-1.344 1.735-2.038 4.08-2.064 6.973.026 2.892.72 5.236 2.064 6.972 1.436 1.853 3.644 2.803 6.566 2.823 2.638-.019 4.38-.653 5.816-2.12 1.638-1.672 1.609-3.734 1.085-5.014-.31-.76-.873-1.39-1.635-1.85-.192 1.37-.629 2.465-1.303 3.264-.896 1.062-2.166 1.642-3.772 1.72-1.218.059-2.388-.226-3.299-.802-1.077-.68-1.706-1.73-1.774-2.957-.065-1.193.372-2.296 1.231-3.106.822-.776 1.996-1.244 3.396-1.355.98-.079 1.887-.038 2.72.12-.111-.674-.336-1.207-.671-1.589-.456-.519-1.166-.783-2.11-.787h-.027c-.764 0-1.802.21-2.465 1.21l-1.868-1.274c.887-1.332 2.368-2.065 4.17-2.065h.034c2.998.018 4.78 1.848 4.957 5.038.102.043.202.088.3.136 1.39.669 2.407 1.682 2.941 2.93.746 1.738.812 4.572-1.513 6.869-1.788 1.773-3.966 2.567-7.047 2.591z" />
    </svg>
  );
}

function TikTokIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  );
}

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/matrohmatmath",       Icon: Instagram },
  { label: "Threads",   href: "https://www.threads.com/@matrohmatmath",   Icon: ThreadsIcon },
  { label: "TikTok",    href: "https://www.tiktok.com/@matrohmatmath",    Icon: TikTokIcon },
  { label: "X",         href: "https://x.com/matrohmatmath",              Icon: X },
];

export default function Footer() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const width     = useWindowWidth();
  const isMobile  = width <= 480;
  const year      = new Date().getFullYear();

  const links = [
    { label: "FAQ",               path: "/faq" },
    { label: "Direktori Soal",    path: "/browse" },
    { label: "Soal Populer",      path: "/populer" },
    { label: "Changelog",         path: "/changelog" },
    { label: "Kebijakan Privasi", path: "/privacy" },
  ];

  return (
    <footer style={{ background: "#0f0e17", borderTop: "1px solid rgba(255,255,255,.06)" }}>
      <div style={{
        maxWidth: "1100px", margin: "0 auto",
        padding: isMobile ? "40px 20px 32px" : "52px 40px 36px",
      }}>
        {/* Top — brand + links */}
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: isMobile ? "28px" : "0",
          marginBottom: isMobile ? "28px" : "44px",
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <img src="/logo.png" alt="matrohmatmath" style={{
                width: "32px", height: "32px",
                boxShadow: "0 2px 8px rgba(232,76,43,.3)",
                borderRadius: "9px",
              }} />
              <span style={{ fontWeight: "800", fontSize: "16px", color: "white", letterSpacing: "-0.3px" }}>
                matrohmat<span style={{ color: "#e84c2b" }}>math</span>
              </span>
            </div>
            <p style={{
              fontSize: "13px", color: "rgba(255,255,255,.35)",
              margin: 0, maxWidth: "240px", lineHeight: "1.65",
            }}>
              Akses ke soal-soal berkualitas secara gratis.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "20px" : "36px", flexWrap: "wrap" }}>
            {links.map((l) => {
              const active = location.pathname === l.path;
              return (
                <button key={l.path} onClick={() => navigate(l.path)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "13px", fontFamily: "inherit", padding: 0,
                  color: active ? "white" : "rgba(255,255,255,.4)",
                  fontWeight: active ? "600" : "400",
                  transition: "color .15s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.8)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = active ? "white" : "rgba(255,255,255,.4)")}
                >
                  {l.label}
                </button>
              );
            })}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {SOCIALS.map(({ label, href, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener" aria-label={label} title={label} style={{
                  display: "flex", color: "rgba(255,255,255,.4)",
                  transition: "color .15s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.8)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,.4)")}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,.07)",
          paddingTop: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
        }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,.18)" }}>
            © {year} matrohmatmath
          </span>
        </div>
      </div>
    </footer>
  );
}
