// src/features/admin/AdminShares.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Share2, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../lib/api";
import useWindowWidth from "../../hooks/useWindowWidth";

const TYPE_OPTIONS = [{ label: "Soal", value: "soal" }, { label: "Materi", value: "materi" }];
const DAYS_OPTIONS = [{ label: "Hari ini", value: 1 }, { label: "7 hari", value: 7 }, { label: "30 hari", value: 30 }, { label: "Semua", value: 0 }];

const DIFF_COLOR = {
  easy:   { color: "#1a8a6e", bg: "#e4f5f0" },
  medium: { color: "#854F0B", bg: "#fef9ee" },
  hard:   { color: "#e84c2b", bg: "#fff3f0" },
};

const TYPE_CFG = {
  soal:   { accent: "#7c3aed", accentBg: "#f3f0ff", chartColor: "#7c3aed", topAccent: "#7c3aed", topBg: "#f3f0ff" },
  materi: { accent: "#1a8a6e", accentBg: "#e4f5f0", chartColor: "#1a8a6e", topAccent: "#1a8a6e", topBg: "#e4f5f0" },
};

const PLATFORM_LABEL = {
  whatsapp: { label: "WhatsApp", color: "#25D366", bg: "#f0fdf4" },
  telegram: { label: "Telegram", color: "#229ED9", bg: "#e8f4fd" },
  facebook: { label: "Facebook", color: "#1877F2", bg: "#eef4ff" },
  twitter:  { label: "Twitter/X", color: "#111",   bg: "#f5f5f5" },
  threads:  { label: "Threads",  color: "#111",   bg: "#f5f5f5" },
  email:    { label: "Email",    color: "#f5a623", bg: "#fef9ee" },
  copy:     { label: "Salin",    color: "#7c3aed", bg: "#f3f0ff" },
};

function StatCard({ label, value, color, bg, sublabel }) {
  return (
    <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", padding: "16px 18px" }}>
      <div style={{ fontSize: "22px", fontWeight: "800", color: "#0f0e17", lineHeight: 1 }}>{Number(value).toLocaleString("id-ID")}</div>
      <div style={{ fontSize: "12px", color: "#6b6860", marginTop: "4px" }}>{label}</div>
      {sublabel && <div style={{ display: "inline-flex", marginTop: "8px", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", color, background: bg }}>{sublabel}</div>}
    </div>
  );
}

function BarChartViz({ daily, color }) {
  if (!daily || daily.length === 0) return (
    <div style={{ textAlign: "center", padding: "40px 0", color: "#b4b2a9", fontSize: "13px" }}>Belum ada data</div>
  );
  const max = Math.max(...daily.map(d => Number(d.total)), 1);
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", minWidth: `${daily.length * 28}px`, height: "200px", paddingBottom: "24px" }}>
        {daily.map((d) => {
          const pct = (Number(d.total) / max) * 100;
          return (
            <div key={d.date} style={{ flex: "1 0 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%", justifyContent: "flex-end" }}>
              <div title={`${d.date}: ${d.total} shares`} style={{ width: "100%", maxWidth: "24px", height: `${Math.max(pct, 4)}%`, background: color, borderRadius: "3px 3px 0 0", opacity: 0.85, transition: "opacity .15s", cursor: "default" }}
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

export default function AdminShares() {
  const navigate  = useNavigate();
  const width     = useWindowWidth();
  const isMobile  = width <= 480;

  const [type, setType]           = useState("soal");
  const [days, setDays]           = useState(30);
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [topPage, setTopPage]     = useState(1);
  const TOP_LIMIT = 5;
  const [rawData, setRawData]     = useState(null);
  const [rawPage, setRawPage]     = useState(1);
  const [rawLimit, setRawLimit]   = useState(10);
  const [rawLoading, setRawLoading] = useState(true);

  const cfg = TYPE_CFG[type];

  useEffect(() => {
    setLoading(true);
    setData(null);
    api.get(`/admin/${type}/shares?days=${days}`)
      .then(setData)
      .finally(() => setLoading(false));
    setRawPage(1);
    setTopPage(1);
  }, [type, days]);

  useEffect(() => {
    setRawLoading(true);
    api.get(`/admin/${type}/shares/raw?days=${days}&page=${rawPage}&limit=${rawLimit}`)
      .then(setRawData)
      .finally(() => setRawLoading(false));
  }, [type, days, rawPage, rawLimit]);

  const summary   = data?.summary || {};
  const timeLabel = days === 1 ? "(hari ini)" : days > 1 ? `(${days} hari terakhir)` : "(semua waktu)";
  const totalPages = Math.ceil((rawData?.total || 0) / rawLimit) || 1;

  return (
    <>
      <Helmet><title>Shares | Admin Gudang Soal</title></Helmet>

      {/* Hero */}
      <div style={{ borderRadius: "18px", background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #1a0e2c 100%)", padding: isMobile ? "24px 20px" : "28px 32px", marginBottom: "24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.03)", userSelect: "none", pointerEvents: "none", lineHeight: 1 }}>
          <Share2 size={isMobile ? 90 : 120} strokeWidth={1.5} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 12px" }}>
            Shares
          </h1>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "rgba(255,255,255,.8)", background: "rgba(255,255,255,.1)" }}>
              {Number(summary.total || 0).toLocaleString("id-ID")} Total Shares
            </span>
            <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "#c4b5fd", background: "rgba(196,181,253,.12)" }}>
              {Number(summary.today || 0).toLocaleString("id-ID")} Hari Ini
            </span>
          </div>
        </div>
      </div>

      {/* Type + Timeframe toggles */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        {TYPE_OPTIONS.map(t => (
          <button key={t.value} onClick={() => setType(t.value)} style={{ padding: "8px 18px", borderRadius: "10px", border: "1px solid", borderColor: type === t.value ? cfg.accent : "#e2ddd5", background: type === t.value ? cfg.accentBg : "white", color: type === t.value ? cfg.accent : "#6b6860", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
            {t.label}
          </button>
        ))}
        <div style={{ width: "1px", height: "20px", background: "#e2ddd5", margin: "0 2px" }} />
        {DAYS_OPTIONS.map(opt => (
          <button key={opt.value} onClick={() => setDays(opt.value)} style={{ padding: "8px 14px", borderRadius: "10px", border: "1px solid", borderColor: days === opt.value ? cfg.accent : "#e2ddd5", background: days === opt.value ? cfg.accentBg : "white", color: days === opt.value ? cfg.accent : "#6b6860", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#b4b2a9", fontSize: "14px" }}>Memuat data...</div>
      ) : (
        <>
          {/* Platform stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "12px", marginBottom: "12px" }}>
            <StatCard label="Total Shares" value={summary.total     || 0} />
            <StatCard label="Minggu Ini"   value={summary.week      || 0} />
            <StatCard label="WhatsApp"     value={summary.whatsapp  || 0} color="#25D366" bg="#f0fdf4" sublabel="WhatsApp" />
            <StatCard label="Telegram"     value={summary.telegram  || 0} color="#229ED9" bg="#e8f4fd" sublabel="Telegram" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
            <StatCard label="Twitter/X"  value={summary.twitter  || 0} color="#111"    bg="#f5f5f5" sublabel="Twitter/X" />
            <StatCard label="Threads"    value={summary.threads  || 0} color="#111"    bg="#f5f5f5" sublabel="Threads" />
            <StatCard label="Facebook"   value={summary.facebook || 0} color="#1877F2" bg="#eef4ff" sublabel="Facebook" />
            <StatCard label="Salin Link" value={summary.copy     || 0} color="#7c3aed" bg="#f3f0ff" sublabel="Salin" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "20px" }}>
            {/* Chart harian */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", borderLeft: `3px solid ${cfg.accent}`, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0ede6", fontSize: "13px", fontWeight: "700", color: "#0f0e17", background: "linear-gradient(to right, #faf9f6, white)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: cfg.accent, flexShrink: 0 }} />
                Shares Harian {timeLabel}
              </div>
              <div style={{ padding: "20px" }}>
                <BarChartViz daily={data?.daily} color={cfg.chartColor} />
              </div>
            </div>

            {/* Top items */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", borderLeft: "3px solid #e84c2b", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0ede6", fontSize: "13px", fontWeight: "700", color: "#0f0e17", background: "linear-gradient(to right, #faf9f6, white)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#e84c2b", flexShrink: 0 }} />
                Top {type === "soal" ? "Soal" : "Materi"} {timeLabel}
                {data?.top?.length > 0 && <span style={{ fontSize: "11px", fontWeight: "600", color: "#b4b2a9" }}>— {data.top.length} {type === "soal" ? "soal" : "materi"}</span>}
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
                          {topSlice.map((item, i) => {
                            const rank = (topPage - 1) * TOP_LIMIT + i;
                            return (
                              <div key={item.id} onClick={() => navigate(`/admin/${type}/edit/${item.id}`)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 8px", borderRadius: "10px", cursor: "pointer", transition: "background .15s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "#f5f3ef"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                              >
                                <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: rank < 3 ? cfg.topBg : "#f5f3ef", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", color: rank < 3 ? cfg.topAccent : "#b4b2a9", flexShrink: 0 }}>
                                  {rank + 1}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  {type === "soal" ? (
                                    <>
                                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f0e17" }}>{item.kode}</span>
                                        {item.difficulty && <span style={{ fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "5px", color: (DIFF_COLOR[item.difficulty] || DIFF_COLOR.medium).color, background: (DIFF_COLOR[item.difficulty] || DIFF_COLOR.medium).bg }}>{item.difficulty}</span>}
                                      </div>
                                      <div style={{ fontSize: "11px", color: "#6b6860", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.mapel} · {item.subtopik}</div>
                                    </>
                                  ) : (
                                    <>
                                      <div style={{ fontSize: "12px", fontWeight: "700", color: "#0f0e17", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.judul}</div>
                                      <div style={{ fontSize: "11px", color: "#6b6860", marginTop: "2px" }}>{item.mapel} · {item.subtopik}</div>
                                    </>
                                  )}
                                </div>
                                <div style={{ textAlign: "right", flexShrink: 0 }}>
                                  <div style={{ fontSize: "13px", fontWeight: "800", color: cfg.topAccent }}>{Number(item.shares_in_range).toLocaleString("id-ID")}</div>
                                  <div style={{ fontSize: "10px", color: "#b4b2a9" }}>total: {Number(item.shares_total).toLocaleString("id-ID")}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {topTotalPages > 1 && (
                          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #f0ede6" }}>
                            <span style={{ fontSize: "12px", color: "#b4b2a9" }}>{topPage}/{topTotalPages}</span>
                            <button onClick={() => setTopPage(p => Math.max(1, p - 1))} disabled={topPage === 1} style={{ width: "28px", height: "28px", borderRadius: "7px", border: "1px solid #e2ddd5", background: "white", cursor: topPage === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b6860", opacity: topPage === 1 ? 0.4 : 1 }}><ChevronLeft size={14} /></button>
                            <button onClick={() => setTopPage(p => Math.min(topTotalPages, p + 1))} disabled={topPage === topTotalPages} style={{ width: "28px", height: "28px", borderRadius: "7px", border: "1px solid #e2ddd5", background: "white", cursor: topPage === topTotalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b6860", opacity: topPage === topTotalPages ? 0.4 : 1 }}><ChevronRight size={14} /></button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Raw log table */}
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", borderLeft: "3px solid #1a8a6e", overflow: "hidden", marginTop: "20px" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0ede6", fontSize: "13px", fontWeight: "700", color: "#0f0e17", background: "linear-gradient(to right, #faf9f6, white)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1a8a6e", flexShrink: 0 }} />
                Log Shares {timeLabel}
                {rawData && <span style={{ fontSize: "11px", fontWeight: "600", color: "#b4b2a9" }}>— {Number(rawData.total).toLocaleString("id-ID")} baris</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {rawData && <span style={{ fontSize: "12px", color: "#6b6860" }}>{rawPage}/{totalPages}</span>}
                <select value={rawLimit} onChange={e => { setRawLimit(Number(e.target.value)); setRawPage(1); }}
                  style={{ fontSize: "12px", padding: "4px 6px", borderRadius: "7px", border: "1px solid #e2ddd5", background: "white", color: "#6b6860", fontFamily: "inherit", cursor: "pointer" }}>
                  {[5, 10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <button onClick={() => setRawPage(p => Math.max(1, p - 1))} disabled={rawPage === 1} style={{ width: "28px", height: "28px", borderRadius: "7px", border: "1px solid #e2ddd5", background: "white", cursor: rawPage === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: rawPage === 1 ? 0.4 : 1 }}><ChevronLeft size={13} /></button>
                <button onClick={() => setRawPage(p => Math.min(totalPages, p + 1))} disabled={rawPage >= totalPages} style={{ width: "28px", height: "28px", borderRadius: "7px", border: "1px solid #e2ddd5", background: "white", cursor: rawPage >= totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: rawPage >= totalPages ? 0.4 : 1 }}><ChevronRight size={13} /></button>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              {rawLoading ? (
                <div style={{ padding: "32px", textAlign: "center", color: "#b4b2a9", fontSize: "13px" }}>Memuat...</div>
              ) : !rawData?.data?.length ? (
                <div style={{ padding: "32px", textAlign: "center", color: "#b4b2a9", fontSize: "13px" }}>Belum ada data share</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ background: "#faf9f6" }}>
                      {["Waktu", "Platform", type === "soal" ? "Soal" : "Materi", "Topik", "User"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: "700", color: "#6b6860", borderBottom: "1px solid #f0ede6", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rawData.data.map(row => {
                      const pl = PLATFORM_LABEL[row.platform] || { label: row.platform, color: "#6b6860", bg: "#f5f5f5" };
                      return (
                        <tr key={row.id} style={{ borderBottom: "1px solid #f0ede6" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#faf9f6"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "10px 16px", color: "#6b6860", whiteSpace: "nowrap" }}>
                            {new Date(row.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                          </td>
                          <td style={{ padding: "10px 16px" }}>
                            <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", color: pl.color, background: pl.bg }}>{pl.label}</span>
                          </td>
                          <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                            {type === "soal" ? (
                              <>
                                <span style={{ fontWeight: "700", color: "#0f0e17" }}>{row.soal_kode}</span>
                                {row.difficulty && <span style={{ marginLeft: "6px", fontSize: "10px", fontWeight: "700", padding: "2px 5px", borderRadius: "4px", color: (DIFF_COLOR[row.difficulty] || DIFF_COLOR.medium).color, background: (DIFF_COLOR[row.difficulty] || DIFF_COLOR.medium).bg }}>{row.difficulty}</span>}
                              </>
                            ) : (
                              <span style={{ fontWeight: "700", color: "#0f0e17", maxWidth: "180px", display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", verticalAlign: "bottom" }}>{row.materi_judul}</span>
                            )}
                          </td>
                          <td style={{ padding: "10px 16px", color: "#6b6860", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {row.mapel} · {row.subtopik}
                          </td>
                          <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                            {row.user_name
                              ? <span style={{ color: "#0f0e17", fontWeight: "600" }}>{row.user_name}</span>
                              : <span style={{ color: "#b4b2a9", fontStyle: "italic" }}>Anonim</span>
                            }
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
