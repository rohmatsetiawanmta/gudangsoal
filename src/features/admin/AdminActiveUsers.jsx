// src/features/admin/AdminActiveUsers.jsx
import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Activity, TrendingUp, TrendingDown, Users } from "lucide-react";
import api from "../../lib/api";
import useWindowWidth from "../../hooks/useWindowWidth";

const PERIODS = [
  { key: "daily",   label: "Harian",   sublabel: "30 hari terakhir" },
  { key: "weekly",  label: "Mingguan", sublabel: "12 minggu terakhir" },
  { key: "monthly", label: "Bulanan",  sublabel: "12 bulan terakhir" },
];

function formatLabel(item, period) {
  if (period === "daily") {
    const d = new Date(item.date);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  }
  if (period === "weekly") {
    const d = new Date(item.week);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  }
  // monthly
  const [y, m] = item.month.split("-");
  return new Date(y, m - 1).toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
}

function LineChart({ data, period, accentColor, unit = "user" }) {
  const [tooltip, setTooltip] = useState(null);
  const containerRef = useRef(null);
  const [containerW, setContainerW] = useState(600);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(e => setContainerW(e[0].contentRect.width));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const n      = data.length;
  const maxVal = Math.max(...data.map(d => d.users), 1);
  const chartH = 180;
  const labelH = 32;
  const padL   = 36;
  const padR   = 16;
  const svgH   = chartH + labelH;
  const plotW  = Math.max(containerW - padL - padR, 200);
  const totalW = containerW;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(f * maxVal));

  const px = i => padL + (i / Math.max(n - 1, 1)) * plotW;
  const py = v  => chartH - (v / maxVal) * (chartH - 8);

  const points   = data.map((d, i) => [px(i), py(d.users)]);
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const areaPath = `${linePath} L${px(n - 1)},${chartH} L${px(0)},${chartH} Z`;

  const gradId = `lg-${accentColor.replace("#", "")}`;

  return (
    <div ref={containerRef} style={{ overflowX: "hidden", overflowY: "visible", paddingBottom: "4px" }}>
      <svg width={totalW} height={svgH} style={{ display: "block", width: "100%" }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={accentColor} stopOpacity={0.18} />
            <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map(val => {
          const y = py(val);
          return (
            <g key={val}>
              <line x1={padL} x2={padL + plotW} y1={y} y2={y} stroke="#e2ddd5" strokeWidth={1} strokeDasharray={val === 0 ? "none" : "3 3"} />
              <text x={padL - 4} y={y + 4} textAnchor="end" fill="#b4b2a9" fontSize={10}>{val}</text>
            </g>
          );
        })}

        {/* Area fill */}
        {n > 1 && <path d={areaPath} fill={`url(#${gradId})`} />}

        {/* Line */}
        {n > 1 && <path d={linePath} fill="none" stroke={accentColor} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}

        {/* Dots + hover targets */}
        {data.map((item, i) => {
          const x = px(i), y = py(item.users);
          const isHovered = tooltip?.i === i;
          return (
            <g key={i}>
              {/* Invisible wide hit area */}
              <rect
                x={i === 0 ? x : px(i - 0.5)}
                width={n === 1 ? plotW : (px(i + 0.5) - px(i - 0.5))}
                y={0} height={chartH}
                fill="transparent"
                onMouseEnter={() => setTooltip({ i, item, x, y })}
                onMouseLeave={() => setTooltip(null)}
                style={{ cursor: "crosshair" }}
              />
              {/* Dot — always show for last point, show on hover */}
              {(isHovered || i === n - 1 || n <= 12) && (
                <circle cx={x} cy={y} r={isHovered ? 5 : 4}
                  fill="white" stroke={accentColor} strokeWidth={2.5}
                />
              )}
              {/* X-axis label */}
              {(n <= 15 || i % Math.ceil(n / 12) === 0 || i === n - 1) && (
                <text x={x} y={chartH + 18} textAnchor="middle" fill="#b4b2a9" fontSize={9}>
                  {formatLabel(item, period)}
                </text>
              )}
            </g>
          );
        })}

        {/* Vertical crosshair on hover */}
        {tooltip && (
          <line x1={tooltip.x} x2={tooltip.x} y1={0} y2={chartH}
            stroke="#e2ddd5" strokeWidth={1} strokeDasharray="3 3" pointerEvents="none" />
        )}

        {/* Tooltip */}
        {tooltip && (() => {
          const tw = 84, th = 38;
          const tx = Math.min(Math.max(tooltip.x - tw / 2, padL), padL + plotW - tw);
          const ty = Math.max(tooltip.y - th - 10, 4);
          return (
            <g pointerEvents="none">
              <rect x={tx} y={ty} width={tw} height={th} rx={7} fill="#0f0e17" opacity={0.92} />
              <text x={tx + tw / 2} y={ty + 13} textAnchor="middle" fill="rgba(255,255,255,.5)" fontSize={10}>
                {formatLabel(tooltip.item, period)}
              </text>
              <text x={tx + tw / 2} y={ty + 29} textAnchor="middle" fill="white" fontSize={13} fontWeight="bold">
                {tooltip.item.users} {unit}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

function StatCard({ label, value, sub, trend, accent }) {
  return (
    <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2ddd5", borderTop: `3px solid ${accent ?? "#e2ddd5"}`, padding: "20px 22px" }}>
      <div style={{ fontSize: "11px", fontWeight: "700", color: "#b4b2a9", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "10px" }}>{label}</div>
      <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f0e17", lineHeight: 1, marginBottom: "6px" }}>{value}</div>
      {sub && <div style={{ fontSize: "12px", color: "#6b6860" }}>{sub}</div>}
      {trend !== undefined && trend !== null && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: "3px", marginTop: "8px", fontSize: "12px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px",
          color: trend >= 0 ? "#1a8a6e" : "#e84c2b",
          background: trend >= 0 ? "#e4f5f0" : "#fff3f0",
        }}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend >= 0 ? "+" : ""}{trend}% vs sebelumnya
        </div>
      )}
    </div>
  );
}

export default function AdminActiveUsers() {
  const width    = useWindowWidth();
  const isMobile = width <= 480;

  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("daily");

  useEffect(() => {
    api.get("/admin/analytics/active-users")
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, []);

  const chartData = data
    ? period === "daily"   ? data.daily
    : period === "weekly"  ? data.weekly
    : data.monthly
    : [];

  const currentPeriod = chartData[chartData.length - 1]?.users ?? 0;
  const prevPeriod    = chartData[chartData.length - 2]?.users ?? 0;
  const trend         = prevPeriod > 0 ? Math.round(((currentPeriod - prevPeriod) / prevPeriod) * 100) : null;

  const peakItem  = chartData.length ? chartData.reduce((a, b) => b.users > a.users ? b : a, chartData[0]) : null;
  const avgUsers  = chartData.length ? Math.round(chartData.reduce((s, d) => s + d.users, 0) / chartData.length) : 0;
  const totalDays = data?.registrations?.reduce((s, d) => s + d.count, 0) ?? 0;

  // Stickiness = today's DAU / this month's MAU (%)
  const todayDAU   = data?.daily?.[data.daily.length - 1]?.users ?? 0;
  const thisMonMAU = data?.monthly?.[data.monthly.length - 1]?.users ?? 0;
  const stickiness = thisMonMAU > 0 ? Math.round((todayDAU / thisMonMAU) * 100) : null;

  // Avg sessions per active user — average of non-zero days
  const activeDays = data?.avgSessionsPerUser?.filter(d => d.avg > 0) ?? [];
  const avgSessions = activeDays.length
    ? Math.round((activeDays.reduce((s, d) => s + d.avg, 0) / activeDays.length) * 10) / 10
    : 0;

  const ACCENT = "#2563eb";

  return (
    <>
      <Helmet><title>Active Users | Admin Gudang Soal</title></Helmet>

      {/* Hero */}
      <div style={{ borderRadius: "18px", background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #0c1a2e 100%)", padding: isMobile ? "24px 20px" : "28px 32px", marginBottom: "24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.03)", userSelect: "none", pointerEvents: "none" }}>
          <Activity size={isMobile ? 90 : 120} strokeWidth={1.5} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 12px" }}>Tren Pengguna Aktif</h1>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "rgba(255,255,255,.8)", background: "rgba(255,255,255,.1)" }}>
              Active Users Trend
            </span>
            {data && (
              <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "#93c5fd", background: "rgba(147,197,253,.12)" }}>
                {data.daily.reduce((s, d) => s + d.users, 0)} session-days (30d)
              </span>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#b4b2a9", fontSize: "14px" }}>Memuat data...</div>
      ) : (
        <>
          {/* Stat cards — 2 baris × 3 kolom */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
            <StatCard
              label={`${PERIODS.find(p => p.key === period)?.label ?? ""} ini`}
              value={currentPeriod}
              sub="unique active users"
              trend={trend}
              accent="#2563eb"
            />
            <StatCard
              label="Rata-rata"
              value={avgUsers}
              sub={`per ${period === "daily" ? "hari" : period === "weekly" ? "minggu" : "bulan"}`}
              accent="#2563eb"
            />
            <StatCard
              label="Peak"
              value={peakItem?.users ?? 0}
              sub={peakItem ? formatLabel(peakItem, period) : "-"}
              accent="#2563eb"
            />
            <StatCard
              label="Registrasi baru"
              value={totalDays}
              sub="30 hari terakhir"
              accent="#1a8a6e"
            />
            <StatCard
              label="Stickiness (DAU/MAU)"
              value={stickiness !== null ? `${stickiness}%` : "-"}
              sub={stickiness !== null ? (stickiness >= 20 ? "Bagus ✓" : stickiness >= 10 ? "Sedang" : "Perlu ditingkatkan") : "data tidak cukup"}
              accent="#7c3aed"
            />
            <StatCard
              label="Avg sesi per user"
              value={avgSessions || "-"}
              sub="rata-rata hari aktif (30d)"
              accent="#7c3aed"
            />
          </div>

          {/* Chart card */}
          <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2ddd5", padding: isMobile ? "16px" : "20px 24px" }}>
            {/* Period toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#0f0e17" }}>Unique Active Users</div>
                <div style={{ fontSize: "12px", color: "#b4b2a9", marginTop: "2px" }}>{PERIODS.find(p => p.key === period)?.sublabel}</div>
              </div>
              <div style={{ display: "flex", background: "#f2efe8", borderRadius: "10px", padding: "3px", gap: "2px" }}>
                {PERIODS.map(p => (
                  <button key={p.key} onClick={() => setPeriod(p.key)}
                    style={{ padding: "6px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "12px", fontWeight: "700", transition: "all .15s",
                      background: period === p.key ? "white" : "transparent",
                      color: period === p.key ? "#0f0e17" : "#b4b2a9",
                      boxShadow: period === p.key ? "0 1px 4px rgba(0,0,0,.08)" : "none",
                    }}
                  >{p.label}</button>
                ))}
              </div>
            </div>

            <LineChart data={chartData} period={period} accentColor={ACCENT} />
          </div>

          {/* Secondary charts */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px", marginTop: "12px" }}>
            {/* Registrasi baru */}
            {data?.registrations && (
              <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2ddd5", padding: isMobile ? "16px" : "20px 24px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#0f0e17" }}>Registrasi Baru</div>
                  <div style={{ fontSize: "12px", color: "#b4b2a9", marginTop: "2px" }}>User baru per hari — 30 hari terakhir</div>
                </div>
                <LineChart
                  data={data.registrations.map(r => ({ date: r.date, users: r.count }))}
                  period="daily"
                  accentColor="#1a8a6e"
                  unit="user baru"
                />
              </div>
            )}
            {/* Avg sesi per user */}
            {data?.avgSessionsPerUser && (
              <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2ddd5", padding: isMobile ? "16px" : "20px 24px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "800", color: "#0f0e17" }}>Rata-rata Sesi per User</div>
                  <div style={{ fontSize: "12px", color: "#b4b2a9", marginTop: "2px" }}>Kedalaman engagement harian — 30 hari terakhir</div>
                </div>
                <LineChart
                  data={data.avgSessionsPerUser.map(r => ({ date: r.date, users: r.avg }))}
                  period="daily"
                  accentColor="#7c3aed"
                  unit="sesi/user"
                />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
