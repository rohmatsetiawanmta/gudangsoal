// src/features/paket/PembelianSaya.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Receipt, CheckCircle, Clock, XCircle, ChevronRight } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";
import api from "../../lib/api";

const STATUS_META = {
  success:   { label: "Berhasil",    color: "#1a8a6e", bg: "#e4f5f0", icon: CheckCircle },
  pending:   { label: "Menunggu bayar", color: "#854F0B", bg: "#fef9ee", icon: Clock },
  failed:    { label: "Gagal",       color: "#b91c1c", bg: "#fff3f0", icon: XCircle },
  expired:   { label: "Kedaluwarsa", color: "#6b6860", bg: "#f2efe8", icon: XCircle },
  cancelled: { label: "Dibatalkan",  color: "#6b6860", bg: "#f2efe8", icon: XCircle },
  refunded:  { label: "Dikembalikan", color: "#6b6860", bg: "#f2efe8", icon: XCircle },
};

const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
const formatTgl = (s) => (s ? new Date(s.replace(" ", "T") + "+07:00").toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-");

export default function PembelianSaya() {
  const navigate = useNavigate();
  const width    = useWindowWidth();
  const isMobile = width <= 480;

  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauth,  setUnauth]  = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    api.get("/paket/my-transactions")
      .then((d) => setList(Array.isArray(d) ? d : []))
      .catch((e) => {
        if (e?.status === 401 || e?.response?.status === 401) setUnauth(true);
        else setError("Gagal memuat riwayat pembelian");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--gs-bg)" }}>
      <SEO title="Pembelian Saya" description="Riwayat pembelian paket soal kamu." url="/pembelian" />
      <Navbar />

      <main style={{ flex: 1, maxWidth: "720px", width: "100%", margin: "0 auto", padding: isMobile ? "20px 16px 48px" : "32px 24px 64px" }}>
        <div style={{
          borderRadius: "18px", background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #0d2210 100%)",
          padding: isMobile ? "24px 20px" : "28px 32px", marginBottom: "20px", position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%", transform: "translateY(-50%)", opacity: 0.06, userSelect: "none", pointerEvents: "none", color: "white" }}>
            <Receipt size={isMobile ? 80 : 110} />
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 8px" }}>
              Pembelian Saya
            </h1>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,.5)", margin: 0 }}>
              Riwayat pembelian paket soal dan statusnya.
            </p>
          </div>
        </div>

        {loading && <div style={{ padding: "40px", textAlign: "center", color: "var(--gs-text-muted)" }}>Memuat...</div>}

        {unauth && (
          <div style={{ background: "var(--gs-surface)", borderRadius: "16px", border: "1px solid var(--gs-border)", padding: "48px 32px", textAlign: "center" }}>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--gs-text)", marginBottom: "6px" }}>Masuk dulu untuk melihat pembelianmu</div>
            <button onClick={() => navigate("/login")} style={{ marginTop: "12px", padding: "10px 20px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
              Masuk
            </button>
          </div>
        )}

        {error && (
          <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "14px", borderRadius: "12px", padding: "12px 16px" }}>{error}</div>
        )}

        {!loading && !unauth && !error && list.length === 0 && (
          <div style={{ background: "var(--gs-surface)", borderRadius: "16px", border: "1px solid var(--gs-border)", padding: "48px 32px", textAlign: "center" }}>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--gs-text)", marginBottom: "6px" }}>Belum ada pembelian</div>
            <p style={{ fontSize: "13px", color: "var(--gs-text-muted)", margin: "0 0 12px" }}>Paket berbayar yang kamu beli akan muncul di sini.</p>
            <Link to="/paket" style={{ fontSize: "14px", fontWeight: "700", color: "#e84c2b" }}>Lihat paket soal</Link>
          </div>
        )}

        {!loading && !unauth && list.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {list.map((t) => {
              const meta = STATUS_META[t.status] || STATUS_META.pending;
              const Icon = meta.icon;
              return (
                <div
                  key={t.id}
                  onClick={() => navigate(`/paket/${t.paket_id}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    background: "var(--gs-surface)", borderRadius: "14px", border: "1px solid var(--gs-border)",
                    borderLeft: `3px solid ${meta.color}`, padding: isMobile ? "14px 16px" : "16px 20px", cursor: "pointer",
                  }}
                >
                  <div style={{ width: "38px", height: "38px", borderRadius: "11px", background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} color={meta.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: "700", fontSize: "14.5px", color: "var(--gs-text)", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.paket_nama}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--gs-text-hint)" }}>
                      {formatTgl(t.created_at)} · {formatRp(t.amount)}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 9px", borderRadius: "99px", color: meta.color, background: meta.bg }}>
                      {meta.label}
                    </span>
                    <div style={{ fontSize: "11px", color: "var(--gs-text-hint)", marginTop: "4px" }}>
                      {t.status === "pending" ? "Lanjutkan pembayaran" : t.status === "success" ? "Buka paket" : ""}
                    </div>
                  </div>
                  <ChevronRight size={17} color="var(--gs-text-hint)" />
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
