// src/features/admin/AdminSoalViews.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Eye, Users, UserX, TrendingUp, ArrowLeft, ChevronLeft, ChevronRight, BarChart2 } from "lucide-react";
import api from "../../lib/api";
import useWindowWidth from "../../hooks/useWindowWidth";

const DAYS_OPTIONS = [
  { label: "Hari ini", value: 1 },
  { label: "7 hari",   value: 7 },
  { label: "30 hari",  value: 30 },
  { label: "Semua",    value: 0 },
];

const DIFF_COLOR = {
  easy:   { color: "#1a8a6e", bg: "#e4f5f0" },
  medium: { color: "#854F0B", bg: "#fef9ee" },
  hard:   { color: "#e84c2b", bg: "#fff3f0" },
};

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
      <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={19} color={color} />
      </div>
      <div>
        <div style={{ fontSize: "22px", fontWeight: "800", color: "#0f0e17", lineHeight: 1 }}>{Number(value).toLocaleString("id-ID")}</div>
        <div style={{ fontSize: "12px", color: "#6b6860", marginTop: "4px" }}>{label}</div>
      </div>
    </div>
  );
}

function BarChart({ daily }) {
  if (!daily || daily.length === 0) return (
    <div style={{ textAlign: "center", padding: "40px 0", color: "#b4b2a9", fontSize: "13px" }}>Belum ada data</div>
  );
  const max = Math.max(...daily.map(d => Number(d.total)), 1);
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", minWidth: `${daily.length * 28}px`, height: "200px", paddingBottom: "24px", position: "relative" }}>
        {daily.map((d) => {
          const pct = (Number(d.total) / max) * 100;
          return (
            <div key={d.date} style={{ flex: "1 0 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%", justifyContent: "flex-end" }}>
              <div title={`${d.date}: ${d.total} views`} style={{ width: "100%", maxWidth: "24px", height: `${Math.max(pct, 4)}%`, background: "#2563eb", borderRadius: "3px 3px 0 0", opacity: 0.85, transition: "opacity .15s", cursor: "default" }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.85}
              />
              <div style={{ fontSize: "10px", color: "#b4b2a9", writingMode: "vertical-rl", transform: "rotate(180deg)", lineHeight: 1, whiteSpace: "nowrap" }}>
                {d.date.slice(5)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminSoalViews() {
  const navigate   = useNavigate();
  const width      = useWindowWidth();
  const isMobile   = width <= 480;

  const [days, setDays]         = useState(30);
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [topPage, setTopPage]   = useState(1);
  const TOP_LIMIT = 5;
  const [rawData, setRawData]     = useState(null);
  const [rawPage, setRawPage]     = useState(1);
  const [rawLimit, setRawLimit]   = useState(5);
  const [rawLoading, setRawLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/soal/views?days=${days}`)
      .then(setData)
      .finally(() => setLoading(false));
    setRawPage(1);
    setTopPage(1);
  }, [days]);

  useEffect(() => {
    setRawLoading(true);
    api.get(`/admin/soal/views/raw?days=${days}&page=${rawPage}&limit=${rawLimit}`)
      .then(setRawData)
      .finally(() => setRawLoading(false));
  }, [days, rawPage, rawLimit]);

  const summary = data?.summary || {};

  return (
    <>
      <Helmet><title>Views Soal | Admin Gudang Soal</title></Helmet>

      {/* ── Hero Header ── */}
      <div style={{
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #0c1a2e 100%)",
        padding: isMobile ? "24px 20px" : "28px 32px",
        marginBottom: "24px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.03)", userSelect: "none", pointerEvents: "none", lineHeight: 1 }}>
          <BarChart2 size={isMobile ? 90 : 120} strokeWidth={1.5} />
        </div>
        <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", gap: "16px", position: "relative", zIndex: 1 }}>
          <div>
            <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 12px" }}>
              Views Soal
            </h1>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "rgba(255,255,255,.8)", background: "rgba(255,255,255,.1)" }}>
                {Number(summary.total || 0).toLocaleString("id-ID")} Total Views
              </span>
              <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "#6ee7b7", background: "rgba(110,231,183,.12)" }}>
                {Number(summary.today || 0).toLocaleString("id-ID")} Hari Ini
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <button onClick={() => navigate("/admin/soal")} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.7)", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.15)"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}
            ><ArrowLeft size={16} /></button>
          </div>
        </div>
      </div>

      {/* ── Timeframe selector ── */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {DAYS_OPTIONS.map(opt => (
          <button key={opt.value} onClick={() => setDays(opt.value)} style={{ padding: "8px 16px", borderRadius: "10px", border: "1px solid", borderColor: days === opt.value ? "#e84c2b" : "#e2ddd5", background: days === opt.value ? "#fff3f0" : "white", color: days === opt.value ? "#e84c2b" : "#6b6860", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#b4b2a9", fontSize: "14px" }}>Memuat data...</div>
      ) : (
        <>
          {/* ── Stat cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
            <StatCard icon={Eye}       label="Total Views" value={summary.total     || 0} color="#e84c2b" bg="#fff3f0" />
            <StatCard icon={TrendingUp} label="Minggu Ini"  value={summary.week      || 0} color="#2563eb" bg="#eff6ff" />
            <StatCard icon={Users}     label="Login"        value={summary.logged_in || 0} color="#1a8a6e" bg="#e4f5f0" />
            <StatCard icon={UserX}     label="Anonim"       value={summary.anonymous || 0} color="#f5a623" bg="#fef9ee" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
            {/* ── Chart harian ── */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", borderLeft: "3px solid #2563eb", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0ede6", fontSize: "13px", fontWeight: "700", color: "#0f0e17", background: "linear-gradient(to right, #faf9f6, white)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2563eb", flexShrink: 0 }} />
                Views Harian {days === 1 ? "(hari ini)" : days > 1 ? `(${days} hari terakhir)` : "(semua waktu)"}
              </div>
              <div style={{ padding: "20px" }}>
                <BarChart daily={data?.daily} />
              </div>
            </div>

            {/* ── Top soal ── */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", borderLeft: "3px solid #e84c2b", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0ede6", fontSize: "13px", fontWeight: "700", color: "#0f0e17", background: "linear-gradient(to right, #faf9f6, white)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#e84c2b", flexShrink: 0 }} />
                Top Soal {days === 1 ? "(hari ini)" : days > 1 ? `(${days} hari terakhir)` : "(semua waktu)"}
                {data?.top?.length > 0 && <span style={{ fontSize: "11px", fontWeight: "600", color: "#b4b2a9" }}>— {data.top.length} soal</span>}
              </div>
              {(() => {
                const topTotalPages = Math.ceil((data?.top?.length || 0) / TOP_LIMIT);
                const topSlice = (data?.top || []).slice((topPage - 1) * TOP_LIMIT, topPage * TOP_LIMIT);
                return (
                  <div style={{ padding: "12px 20px" }}>
                    {!data?.top?.length ? (
                      <div style={{ textAlign: "center", padding: "32px 0", color: "#b4b2a9", fontSize: "13px" }}>Belum ada data</div>
                    ) : (
                      <>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {topSlice.map((s, i) => {
                            const rank = (topPage - 1) * TOP_LIMIT + i;
                            const diff = DIFF_COLOR[s.difficulty] || DIFF_COLOR.medium;
                            return (
                              <div key={s.id} onClick={() => navigate(`/admin/soal/edit/${s.id}`)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 8px", borderRadius: "10px", cursor: "pointer", transition: "background .15s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "#f5f3ef"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                              >
                                <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: rank < 3 ? "#fff3f0" : "#f5f3ef", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", color: rank < 3 ? "#e84c2b" : "#b4b2a9", flexShrink: 0 }}>
                                  {rank + 1}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f0e17" }}>{s.kode}</span>
                                    <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "5px", color: diff.color, background: diff.bg }}>{s.difficulty}</span>
                                  </div>
                                  <div style={{ fontSize: "11px", color: "#b4b2a9", marginTop: "1px" }}>{s.mapel} · {s.subtopik}</div>
                                </div>
                                <div style={{ textAlign: "right", flexShrink: 0 }}>
                                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#e84c2b" }}>{Number(s.views_in_range).toLocaleString("id-ID")}</div>
                                  <div style={{ fontSize: "10px", color: "#b4b2a9" }}>{Number(s.views_total).toLocaleString("id-ID")} total</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {topTotalPages > 1 && (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f0ede6" }}>
                            <span style={{ fontSize: "12px", color: "#6b6860", marginRight: "2px" }}>{topPage} / {topTotalPages}</span>
                            <button onClick={() => setTopPage(p => Math.max(1, p - 1))} disabled={topPage === 1}
                              style={{ width: "28px", height: "28px", borderRadius: "7px", border: "1px solid #e2ddd5", background: topPage === 1 ? "#f5f3ef" : "white", cursor: topPage === 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: topPage === 1 ? "#d4d0c8" : "#6b6860" }}>
                              <ChevronLeft size={13} />
                            </button>
                            <button onClick={() => setTopPage(p => Math.min(topTotalPages, p + 1))} disabled={topPage >= topTotalPages}
                              style={{ width: "28px", height: "28px", borderRadius: "7px", border: "1px solid #e2ddd5", background: topPage >= topTotalPages ? "#f5f3ef" : "white", cursor: topPage >= topTotalPages ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: topPage >= topTotalPages ? "#d4d0c8" : "#6b6860" }}>
                              <ChevronRight size={13} />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* ── Raw views table ── */}
          <div style={{ marginTop: "20px", background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", borderLeft: "3px solid #7c3aed", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0ede6", fontSize: "13px", fontWeight: "700", color: "#0f0e17", background: "linear-gradient(to right, #faf9f6, white)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
                Log Views {days === 1 ? "(hari ini)" : days > 1 ? `(${days} hari terakhir)` : "(semua waktu)"}
                {rawData && <span style={{ fontSize: "11px", fontWeight: "600", color: "#b4b2a9" }}>— {Number(rawData.total).toLocaleString("id-ID")} baris</span>}
              </div>
              {rawData && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#6b6860" }}>
                    {rawPage} / {Math.ceil(rawData.total / rawLimit) || 1}
                  </span>
                  <select value={rawLimit} onChange={e => { setRawLimit(Number(e.target.value)); setRawPage(1); }}
                    style={{ fontSize: "12px", padding: "4px 6px", borderRadius: "7px", border: "1px solid #e2ddd5", background: "white", color: "#6b6860", cursor: "pointer", fontFamily: "inherit" }}>
                    {[5, 10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <button onClick={() => setRawPage(p => Math.max(1, p - 1))} disabled={rawPage === 1}
                    style={{ width: "28px", height: "28px", borderRadius: "7px", border: "1px solid #e2ddd5", background: rawPage === 1 ? "#f5f3ef" : "white", cursor: rawPage === 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: rawPage === 1 ? "#d4d0c8" : "#6b6860" }}>
                    <ChevronLeft size={13} />
                  </button>
                  <button onClick={() => setRawPage(p => p + 1)} disabled={rawPage >= Math.ceil(rawData.total / rawLimit)}
                    style={{ width: "28px", height: "28px", borderRadius: "7px", border: "1px solid #e2ddd5", background: rawPage >= Math.ceil(rawData.total / rawLimit) ? "#f5f3ef" : "white", cursor: rawPage >= Math.ceil(rawData.total / rawLimit) ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: rawPage >= Math.ceil(rawData.total / rawLimit) ? "#d4d0c8" : "#6b6860" }}>
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}
            </div>
            <div style={{ overflowX: "auto" }}>
              {rawLoading ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "#b4b2a9", fontSize: "13px" }}>Memuat...</div>
              ) : !rawData?.data?.length ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "#b4b2a9", fontSize: "13px" }}>Belum ada data</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#faf9f6", borderBottom: "1px solid #f0ede6" }}>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: "700", color: "#6b6860", whiteSpace: "nowrap" }}>#</th>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: "700", color: "#6b6860", whiteSpace: "nowrap" }}>Tanggal & Waktu</th>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: "700", color: "#6b6860" }}>Soal</th>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: "700", color: "#6b6860" }}>User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawData.data.map((row, i) => {
                      const diff = DIFF_COLOR[row.difficulty] || DIFF_COLOR.medium;
                      return (
                        <tr key={row.id} style={{ borderBottom: "1px solid #f5f3ef" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#faf9f6"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "10px 16px", color: "#b4b2a9", fontWeight: "600", whiteSpace: "nowrap" }}>
                            {(rawPage - 1) * rawLimit + i + 1}
                          </td>
                          <td style={{ padding: "10px 16px", color: "#0f0e17", whiteSpace: "nowrap" }}>
                            {new Date(row.viewed_at).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </td>
                          <td style={{ padding: "10px 16px", maxWidth: "280px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                              <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f0e17", cursor: "pointer" }}
                                onClick={() => navigate(`/admin/soal/edit/${row.soal_id}`)}
                                onMouseEnter={e => e.currentTarget.style.color = "#e84c2b"}
                                onMouseLeave={e => e.currentTarget.style.color = "#0f0e17"}
                              >{row.soal_kode}</span>
                              <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "5px", color: diff.color, background: diff.bg }}>{row.difficulty}</span>
                            </div>
                            <div style={{ fontSize: "11px", color: "#b4b2a9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {row.mapel} · {row.subtopik}
                            </div>
                          </td>
                          <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                            {row.user_name ? (
                              <div>
                                <div style={{ fontWeight: "600", color: "#0f0e17" }}>{row.user_name}</div>
                                <div style={{ fontSize: "11px", color: "#b4b2a9" }}>{row.user_email}</div>
                              </div>
                            ) : (
                              <span style={{ fontSize: "12px", fontWeight: "600", padding: "3px 8px", borderRadius: "6px", background: "#fef9ee", color: "#f5a623" }}>Anonim</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
