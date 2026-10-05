// src/features/admin/AdminTransaksi.jsx
import React, { useEffect, useState } from "react";
import { Receipt, RefreshCw, Unlock, Lock } from "lucide-react";
import { Helmet } from "react-helmet-async";
import useWindowWidth from "../../hooks/useWindowWidth";
import api from "../../lib/api";

const STATUS_META = {
  success:   { label: "Sukses",      color: "#1a8a6e", bg: "#e4f5f0", border: "#1a8a6e" },
  pending:   { label: "Menunggu",    color: "#854F0B", bg: "#fef9ee", border: "#f5a623" },
  failed:    { label: "Gagal",       color: "#b91c1c", bg: "#fff3f0", border: "#e84c2b" },
  expired:   { label: "Kedaluwarsa", color: "#6b6860", bg: "#f2efe8", border: "#b4b2a9" },
  cancelled: { label: "Dibatalkan",  color: "#6b6860", bg: "#f2efe8", border: "#b4b2a9" },
  refunded:  { label: "Dikembalikan", color: "#6b6860", bg: "#f2efe8", border: "#b4b2a9" },
};

const FILTERS = ["", "success", "pending", "failed", "expired", "cancelled", "refunded"];

const formatRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
const formatTgl = (s) => (s ? new Date(s.replace(" ", "T") + "+07:00").toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-");

const btnStyle = (color, filled) => ({
  display: "flex", alignItems: "center", gap: "6px",
  padding: "6px 12px", borderRadius: "8px", fontFamily: "inherit",
  fontSize: "12px", fontWeight: "700", cursor: "pointer",
  border: filled ? "none" : `1px solid ${color}`,
  background: filled ? color : "white",
  color: filled ? "white" : color,
});

export default function AdminTransaksi() {
  const width    = useWindowWidth();
  const isMobile = width <= 480;

  const [status,  setStatus]  = useState("");
  const [page,    setPage]    = useState(1);
  const [rows,    setRows]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [reload,  setReload]  = useState(0);

  const [panel,   setPanel]   = useState(null); // { id, action: "grant" | "revoke" }
  const [note,    setNote]    = useState("");
  const [busy,    setBusy]    = useState(false);
  const [notice,  setNotice]  = useState("");

  useEffect(() => {
    const qs = new URLSearchParams({ page: String(page) });
    if (status) qs.set("status", status);
    api.get(`/admin/transactions?${qs}`)
      .then((d) => {
        setRows(d.data || []);
        setTotal(d.total || 0);
        setSummary(d.summary || []);
        setError("");
      })
      .catch(() => setError("Gagal memuat transaksi"))
      .finally(() => setLoading(false));
  }, [status, page, reload]);

  const refresh = () => setReload((r) => r + 1);

  const countOf = (s) => summary.find((x) => x.status === s)?.jumlah ?? 0;
  const revenue = summary.find((x) => x.status === "success")?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  const runSync = async (t) => {
    setBusy(true); setNotice("");
    try {
      const res = await api.post(`/admin/transactions/${t.id}/sync`);
      setNotice(`${t.order_id}: ${STATUS_META[res.status]?.label || res.status}`);
      refresh();
    } catch (e) {
      setNotice(e?.error || "Gagal sinkron");
    } finally { setBusy(false); }
  };

  const submitPanel = async () => {
    if (!panel || !note.trim()) return;
    setBusy(true); setNotice("");
    try {
      await api.post(`/admin/transactions/${panel.id}/${panel.action}`, { note: note.trim() });
      setNotice(panel.action === "grant" ? "Akses diberikan" : "Akses dicabut");
      setPanel(null); setNote("");
      refresh();
    } catch (e) {
      setNotice(e?.error || "Gagal menyimpan");
    } finally { setBusy(false); }
  };

  return (
    <div style={{ padding: isMobile ? "16px" : "24px 28px", maxWidth: "960px" }}>
      <Helmet><title>Transaksi — Admin</title></Helmet>

      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #0d2210 100%)",
        padding: isMobile ? "24px 20px" : "28px 32px",
        marginBottom: "24px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%",
          transform: "translateY(-50%)", opacity: 0.06, userSelect: "none", pointerEvents: "none", color: "white",
        }}>
          <Receipt size={isMobile ? 80 : 110} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "6px" }}>
            Kelola Pembayaran
          </div>
          <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 12px" }}>
            Transaksi Paket
          </h1>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "rgba(255,255,255,.8)", background: "rgba(255,255,255,.1)" }}>
              Total pendapatan {formatRp(revenue)}
            </span>
            <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "#6ee7b7", background: "rgba(110,231,183,.12)" }}>
              {countOf("success")} Sukses
            </span>
            <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "#fcd34d", background: "rgba(252,211,77,.12)" }}>
              {countOf("pending")} Menunggu
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
        {FILTERS.map((f) => {
          const active = status === f;
          const label = f ? STATUS_META[f].label : "Semua";
          return (
            <button
              key={f || "all"}
              onClick={() => { setStatus(f); setPage(1); }}
              style={{
                padding: "6px 14px", borderRadius: "99px", fontFamily: "inherit",
                border: `1px solid ${active ? "#0f0e17" : "#e2ddd5"}`,
                background: active ? "#0f0e17" : "white",
                color: active ? "white" : "#6b6860",
                fontSize: "12px", fontWeight: "700", cursor: "pointer",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {notice && (
        <div style={{ background: "#e4f5f0", border: "1px solid #6ee7b7", color: "#0f5a45", fontSize: "13px", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px" }}>
          {notice}
        </div>
      )}
      {error && (
        <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "13px", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {loading && <div style={{ padding: "40px", textAlign: "center", color: "#6b6860" }}>Memuat...</div>}

      {!loading && rows.length === 0 && !error && (
        <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2ddd5", padding: "60px 48px", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Receipt size={26} color="#e84c2b" />
          </div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f0e17", marginBottom: "6px" }}>Belum ada transaksi</div>
          <p style={{ fontSize: "13px", color: "#6b6860", margin: 0 }}>Transaksi pembelian paket akan muncul di sini.</p>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "760px" }}>
            <thead>
              <tr style={{ background: "linear-gradient(to right, #faf9f6, white)", textAlign: "left" }}>
                {["Waktu", "Paket", "User", "Order ID", "Nominal", "Status", "Aksi"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", fontSize: "12px", fontWeight: "700", color: "#6b6860", borderBottom: "1px solid #f0ede6", textAlign: h === "Nominal" ? "right" : "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const meta = STATUS_META[t.status] || STATUS_META.pending;
                const isOpen = panel?.id === t.id;
                return (
                  <React.Fragment key={t.id}>
                    <tr style={{ borderBottom: "1px solid #f0ede6", verticalAlign: "top" }}>
                      <td style={{ padding: "12px 14px", color: "#6b6860", whiteSpace: "nowrap" }}>{formatTgl(t.created_at)}</td>
                      <td style={{ padding: "12px 14px", fontWeight: "700", color: "#0f0e17", minWidth: "160px" }}>
                        {t.paket_nama}
                        {t.admin_note && <div style={{ fontSize: "11px", fontWeight: "500", color: "#6b6860", marginTop: "4px" }}>Catatan: {t.admin_note}</div>}
                      </td>
                      <td style={{ padding: "12px 14px", color: "#0f0e17" }}>{t.user_name || t.user_email}</td>
                      <td style={{ padding: "12px 14px", color: "#b4b2a9", fontSize: "12px", whiteSpace: "nowrap" }}>{t.order_id}</td>
                      <td style={{ padding: "12px 14px", fontWeight: "700", textAlign: "right", whiteSpace: "nowrap" }}>{formatRp(t.amount)}</td>
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 9px", borderRadius: "99px", color: meta.color, background: meta.bg }}>{meta.label}</span>
                      </td>
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button title="Sinkron Midtrans" disabled={busy} onClick={() => runSync(t)} style={btnStyle("#2563eb", false)}>
                            <RefreshCw size={13} />
                          </button>
                          {t.status !== "success" && (
                            <button disabled={busy} onClick={() => { setPanel({ id: t.id, action: "grant" }); setNote(""); }} style={btnStyle("#1a8a6e", false)}>
                              <Unlock size={13} /> Beri akses
                            </button>
                          )}
                          {t.status === "success" && (
                            <button disabled={busy} onClick={() => { setPanel({ id: t.id, action: "revoke" }); setNote(""); }} style={btnStyle("#e84c2b", false)}>
                              <Lock size={13} /> Cabut akses
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr style={{ borderBottom: "1px solid #f0ede6", background: "#faf9f6" }}>
                        <td colSpan={7} style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "560px" }}>
                            <textarea
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              placeholder={panel.action === "grant" ? "Alasan memberi akses (wajib)..." : "Alasan mencabut akses (wajib)..."}
                              rows={2}
                              style={{ padding: "9px 12px", borderRadius: "9px", border: "1.5px solid #e2ddd5", fontSize: "13px", fontFamily: "inherit", resize: "vertical" }}
                            />
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button onClick={() => { setPanel(null); setNote(""); }} style={btnStyle("#6b6860", false)}>Batal</button>
                              <button disabled={busy || !note.trim()} onClick={submitPanel}
                                style={{ ...btnStyle(panel.action === "grant" ? "#1a8a6e" : "#e84c2b", true), opacity: busy || !note.trim() ? 0.5 : 1 }}>
                                Simpan
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "20px" }}>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
            style={{ padding: "8px 14px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", fontFamily: "inherit", fontWeight: "600", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.4 : 1 }}>
            Sebelumnya
          </button>
          <span style={{ fontSize: "13px", color: "#6b6860" }}>Halaman {page} dari {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
            style={{ padding: "8px 14px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", fontFamily: "inherit", fontWeight: "600", cursor: page >= totalPages ? "not-allowed" : "pointer", opacity: page >= totalPages ? 0.4 : 1 }}>
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
