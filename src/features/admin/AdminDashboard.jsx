// src/features/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  FolderTree,
  Layers,
  Plus,
  ArrowRight,
  CheckCircle,
  Activity,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Helmet } from "react-helmet-async";
import api from "../../lib/api";
import useWindowWidth from "../../hooks/useWindowWidth";

// ── Stat Card (elevated) ──────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color, gradient, loading, isMobile }) {
  return (
    <div
      style={{
        background: gradient || "white",
        borderRadius: "18px",
        border: "1px solid rgba(0,0,0,0.06)",
        padding: isMobile ? "16px" : "22px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Large watermark icon */}
      <div
        style={{
          position: "absolute",
          right: "-8px",
          bottom: "-8px",
          opacity: 0.07,
          pointerEvents: "none",
        }}
      >
        <Icon size={80} color={color} />
      </div>

      {/* Icon bubble */}
      <div
        style={{
          width: isMobile ? "38px" : "44px",
          height: isMobile ? "38px" : "44px",
          borderRadius: "13px",
          background: color + "20",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: isMobile ? "14px" : "18px",
          border: `1.5px solid ${color}30`,
        }}
      >
        <Icon size={isMobile ? 19 : 21} color={color} />
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: isMobile ? "26px" : "32px",
          fontWeight: "800",
          color: "#0f0e17",
          lineHeight: 1,
          letterSpacing: "-1px",
          marginBottom: "5px",
        }}
      >
        {loading ? (
          <div style={{ width: "60px", height: "32px", background: "#e8e6e0", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
        ) : typeof value === "number" ? value.toLocaleString() : value}
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: "11.5px",
          fontWeight: "700",
          color: "#6b6860",
          textTransform: "uppercase",
          letterSpacing: ".07em",
          marginBottom: sub && !loading ? "5px" : 0,
        }}
      >
        {label}
      </div>

      {/* Sub */}
      {sub && !loading && (
        <div style={{ fontSize: "11px", color: "#b4b2a9", lineHeight: 1.4 }}>{sub}</div>
      )}
    </div>
  );
}

// ── Health KPI chip ───────────────────────────────────────────────────────────

function KpiChip({ label, value, color }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
        padding: "10px 18px",
        borderRadius: "12px",
        background: color + "15",
        border: `1px solid ${color}25`,
        minWidth: "88px",
      }}
    >
      <div style={{ fontSize: "16px", fontWeight: "800", color, letterSpacing: "-0.5px" }}>{value}</div>
      <div style={{ fontSize: "10.5px", fontWeight: "600", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: ".06em", whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
}

// ── Chart Card wrapper ────────────────────────────────────────────────────────

function ChartCard({ title, children, headerRight }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        border: "1px solid #e8e6e0",
        padding: "20px",
        boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17", margin: 0 }}>
          {title}
        </h2>
        {headerRight}
      </div>
      {children}
    </div>
  );
}

// ── Quick Action ──────────────────────────────────────────────────────────────

function QuickAction({ icon: Icon, label, desc, onClick, color, isMobile }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? color + "0d" : "white",
        borderRadius: "14px",
        border: `1.5px solid ${hovered ? color + "50" : "#e8e6e0"}`,
        padding: isMobile ? "13px 14px" : "14px 16px",
        cursor: "pointer",
        transition: "all .15s",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        boxShadow: hovered ? `0 4px 16px ${color}18` : "none",
      }}
    >
      <div
        style={{
          width: isMobile ? "36px" : "40px",
          height: isMobile ? "36px" : "40px",
          borderRadius: "11px",
          background: color + "18",
          border: `1px solid ${color}25`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={isMobile ? 17 : 19} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f0e17", marginBottom: isMobile ? 0 : "2px" }}>
          {label}
        </div>
        {!isMobile && <div style={{ fontSize: "12px", color: "#6b6860" }}>{desc}</div>}
      </div>
      <ArrowRight size={15} color={hovered ? color : "#c8c6be"} />
    </div>
  );
}

// ── Difficulty badge ──────────────────────────────────────────────────────────

function DifficultyBadge({ level }) {
  const map = {
    1: { label: "Easy",   color: "#1a8a6e", bg: "#e4f5f0" },
    2: { label: "Medium", color: "#854F0B", bg: "#faeeda" },
    3: { label: "Hard",   color: "#e84c2b", bg: "#fff3f0" },
  };
  const d = map[level] || map[1];
  return (
    <span
      style={{
        fontSize: "10.5px",
        fontWeight: "700",
        padding: "2px 8px",
        borderRadius: "6px",
        background: d.bg,
        color: d.color,
        flexShrink: 0,
      }}
    >
      {d.label}
    </span>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e8e6e0",
        borderRadius: "10px",
        padding: "10px 14px",
        fontSize: "12.5px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ fontWeight: "700", color: "#0f0e17", marginBottom: "5px" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#6b6860", display: "flex", gap: "6px" }}>
          <span>{p.name}:</span>
          <strong>{p.value?.toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────

const Empty = ({ msg }) => (
  <div style={{ textAlign: "center", padding: "36px 20px", color: "#c8c6be", fontSize: "13px" }}>
    {msg || "Belum ada data."}
  </div>
);

// ── Constants ─────────────────────────────────────────────────────────────────

const DIFFICULTY_LABELS = { 1: "Easy", 2: "Medium", 3: "Hard" };
const DIFFICULTY_COLORS = { 1: "#1a8a6e", 2: "#f5a623", 3: "#e84c2b" };
const CHART_COLORS = ["#e84c2b", "#2563eb", "#1a8a6e", "#f5a623", "#7c3aed", "#db2777"];

const axisProps = {
  tick: { fontSize: 11, fill: "#c8c6be" },
  tickLine: false,
  axisLine: false,
};

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [registrasiMode, setRegistrasiMode] = useState("harian");

  useEffect(() => {
    api.get("/admin/stats")
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const greeting =
    now.getHours() < 11 ? "Selamat pagi" :
    now.getHours() < 15 ? "Selamat siang" :
    now.getHours() < 18 ? "Selamat sore" : "Selamat malam";

  // Chart data
  const userAktifData = (stats?.user_aktif || []).map((d) => ({
    tanggal: new Date(d.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    aktif: parseInt(d.aktif),
  }));

  const soalPerHariData = (stats?.soal_per_hari || []).map((d) => ({
    tanggal: new Date(d.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    total: parseInt(d.total),
  }));

  const soalPerJenjangData = (stats?.soal_per_jenjang || []).map((d) => ({
    nama: d.nama,
    total: parseInt(d.total),
  }));

  const akurasiData = (stats?.akurasi_per_difficulty || []).map((d) => ({
    name: DIFFICULTY_LABELS[d.difficulty] || d.difficulty,
    value: parseInt(d.total),
    color: DIFFICULTY_COLORS[d.difficulty] || "#6b6860",
    akurasi: d.total > 0 ? Math.round((d.benar / d.total) * 100) : 0,
  }));

  const registrasiData = (stats?.registrasi_harian || []).map((d) => ({
    tanggal: new Date(d.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    total: parseInt(d.total),
  }));

  const registrasiMingguanData = (stats?.registrasi_mingguan || []).map((d) => ({
    tanggal: new Date(d.tanggal_mulai).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    total: parseInt(d.total),
  }));

  const xpPerHariData = (stats?.xp_per_hari || []).map((d) => ({
    tanggal: new Date(d.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    total_xp: parseInt(d.total_xp),
    transaksi: parseInt(d.total_transaksi),
  }));

  const publishedPct = stats?.total_soal > 0
    ? Math.round((stats.total_soal_published / stats.total_soal) * 100)
    : 0;

  return (
    <div>
      <Helmet>
        <title>Dashboard | Admin Gudang Soal</title>
      </Helmet>

      {/* ── Hero Header ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 60%, #0f1a2e 100%)",
          borderRadius: "20px",
          padding: isMobile ? "20px" : "28px 32px",
          marginBottom: isMobile ? "20px" : "28px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative blobs */}
        <div style={{ position: "absolute", right: "-40px", top: "-40px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(232,76,43,0.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "80px", bottom: "-30px", width: "120px", height: "120px", borderRadius: "50%", background: "rgba(37,99,235,0.08)", pointerEvents: "none" }} />

        <div style={{ position: "relative" }}>
          {/* Date pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "20px",
              padding: "4px 12px",
              fontSize: "11.5px",
              color: "rgba(255,255,255,0.5)",
              marginBottom: "12px",
            }}
          >
            <Zap size={11} color="#f5a623" />
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: isMobile ? "flex-start" : "center",
              justifyContent: "space-between",
              flexDirection: isMobile ? "column" : "row",
              gap: "16px",
            }}
          >
            <div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                {greeting}, Admin 👋
              </p>
              <h1
                style={{
                  fontSize: isMobile ? "24px" : "28px",
                  fontWeight: "800",
                  color: "white",
                  letterSpacing: "-0.8px",
                  margin: 0,
                }}
              >
                Dashboard
              </h1>
            </div>

            {/* Mini KPI strip */}
            {!loading && stats && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <KpiChip label="Publikasi" value={`${publishedPct}%`} color="#1a8a6e" />
                <KpiChip label="Akurasi" value={`${stats.akurasi || 0}%`} color="#2563eb" />
                <KpiChip label="Sesi" value={(stats.total_sesi || 0).toLocaleString()} color="#f5a623" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(190px, 1fr))",
          gap: isMobile ? "10px" : "14px",
          marginBottom: isMobile ? "20px" : "28px",
        }}
      >
        <StatCard icon={BookOpen} label="Total Soal" value={stats?.total_soal || 0}
          sub={loading ? null : `${stats?.total_soal_published || 0} published · ${stats?.total_soal_draft || 0} draft`}
          color="#e84c2b" gradient="linear-gradient(135deg, #fff8f7 0%, white 60%)" loading={loading} isMobile={isMobile} />
        <StatCard icon={Users} label="Total User" value={stats?.total_user || 0}
          color="#2563eb" gradient="linear-gradient(135deg, #f0f5ff 0%, white 60%)" loading={loading} isMobile={isMobile} />
        <StatCard icon={Activity} label="Total Sesi" value={stats?.total_sesi || 0}
          sub={loading ? null : `Akurasi rata-rata ${stats?.akurasi || 0}%`}
          color="#1a8a6e" gradient="linear-gradient(135deg, #f0faf7 0%, white 60%)" loading={loading} isMobile={isMobile} />
        <StatCard icon={FolderTree} label="Total Jenjang" value={stats?.total_jenjang || 0}
          color="#f5a623" gradient="linear-gradient(135deg, #fffbf0 0%, white 60%)" loading={loading} isMobile={isMobile} />
        <StatCard icon={Layers} label="Total Subtopik" value={stats?.total_subtopik || 0}
          color="#7c3aed" gradient="linear-gradient(135deg, #f7f0ff 0%, white 60%)" loading={loading} isMobile={isMobile} />
        <StatCard icon={CheckCircle} label="Jawaban Benar" value={stats?.total_benar || 0}
          sub={loading ? null : `dari ${stats?.total_sesi || 0} attempt`}
          color="#db2777" gradient="linear-gradient(135deg, #fff0f7 0%, white 60%)" loading={loading} isMobile={isMobile} />
      </div>

      {/* ── Charts Row 1 ── */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
          <ChartCard title="User Aktif 7 Hari Terakhir">
            {userAktifData.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={userAktifData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="tanggal" {...axisProps} />
                  <YAxis {...axisProps} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="aktif" name="User aktif" stroke="#2563eb" strokeWidth={2} fill="url(#gBlue)" dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Soal Ditambahkan 30 Hari Terakhir">
            {soalPerHariData.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={soalPerHariData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="tanggal" {...axisProps} interval="preserveStartEnd" />
                  <YAxis {...axisProps} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" name="Soal baru" fill="#e84c2b" radius={[5, 5, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      )}

      {/* ── Charts Row 2 ── */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
          <ChartCard title="Soal per Jenjang">
            {soalPerJenjangData.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={soalPerJenjangData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <XAxis type="number" {...axisProps} allowDecimals={false} />
                  <YAxis type="category" dataKey="nama" tick={{ fontSize: 11, fill: "#6b6860" }} tickLine={false} axisLine={false} width={64} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" name="Soal" radius={[0, 5, 5, 0]}>
                    {soalPerJenjangData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Distribusi Attempt per Kesulitan">
            {akurasiData.length === 0 ? <Empty /> : (
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={akurasiData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {akurasiData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div style={{ background: "white", border: "1px solid #e8e6e0", borderRadius: "10px", padding: "10px 14px", fontSize: "12.5px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
                            <div style={{ fontWeight: "700", color: d.color, marginBottom: "3px" }}>{d.name}</div>
                            <div style={{ color: "#6b6860" }}>Total: <strong>{d.value}</strong></div>
                            <div style={{ color: "#6b6860" }}>Akurasi: <strong>{d.akurasi}%</strong></div>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {akurasiData.map((d, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "2px" }}>
                        <div style={{ width: "9px", height: "9px", borderRadius: "3px", background: d.color, flexShrink: 0 }} />
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f0e17" }}>{d.name}</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#b4b2a9", paddingLeft: "16px" }}>{d.value} attempt · {d.akurasi}% akurasi</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartCard>
        </div>
      )}

      {/* ── Charts Row 3 ── */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
          <ChartCard
            title="Registrasi User Baru"
            headerRight={
              <div style={{ display: "flex", gap: "5px" }}>
                {["harian", "mingguan"].map((mode) => (
                  <button key={mode} onClick={() => setRegistrasiMode(mode)}
                    style={{ padding: "3px 10px", borderRadius: "6px", border: "none", background: registrasiMode === mode ? "#0f0e17" : "#f2efe8", color: registrasiMode === mode ? "white" : "#6b6860", fontSize: "11px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", transition: "all .15s", textTransform: "capitalize" }}>
                    {mode}
                  </button>
                ))}
              </div>
            }
          >
            {(registrasiMode === "harian" ? registrasiData : registrasiMingguanData).length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={registrasiMode === "harian" ? registrasiData : registrasiMingguanData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="tanggal" {...axisProps} interval="preserveStartEnd" />
                  <YAxis {...axisProps} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" name="User baru" fill="#2563eb" radius={[5, 5, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="XP Didistribusikan per Hari">
            {xpPerHariData.length === 0 ? <Empty /> : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={xpPerHariData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gAmber" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f5a623" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f5a623" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="tanggal" {...axisProps} interval="preserveStartEnd" />
                    <YAxis {...axisProps} allowDecimals={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div style={{ background: "white", border: "1px solid #e8e6e0", borderRadius: "10px", padding: "10px 14px", fontSize: "12.5px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
                            <div style={{ fontWeight: "700", color: "#0f0e17", marginBottom: "5px" }}>{label}</div>
                            <div style={{ color: "#f5a623" }}>Total XP: <strong>{parseInt(payload[0]?.value || 0).toLocaleString()}</strong></div>
                            <div style={{ color: "#b4b2a9" }}>Transaksi: <strong>{payload[1]?.value || 0}</strong></div>
                          </div>
                        );
                      }}
                    />
                    <Area type="monotone" dataKey="total_xp" name="Total XP" stroke="#f5a623" strokeWidth={2} fill="url(#gAmber)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="transaksi" name="Transaksi" stroke="#d4d2ca" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: "16px", marginTop: "6px" }}>
                  {[{ color: "#f5a623", label: "Total XP", dashed: false }, { color: "#d4d2ca", label: "Transaksi", dashed: true }].map(({ color, label, dashed }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke={color} strokeWidth="2" strokeDasharray={dashed ? "4 3" : undefined} /></svg>
                      <span style={{ fontSize: "11px", color: "#9b9992" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </ChartCard>
        </div>
      )}

      {/* ── Charts Row 4 — Paling salah + Terpopuler ── */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
          <ChartCard title="Soal Paling Sering Salah">
            {!stats?.soal_paling_salah?.length ? <Empty msg="Belum ada data (min. 5 attempt per soal)." /> : (
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {stats.soal_paling_salah.map((s, i) => (
                  <div
                    key={s.kode}
                    onClick={() => navigate(`/soal/${s.kode}`)}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "11px", border: `1px solid ${i === 0 ? "#fca5a5" : "#f2efe8"}`, background: i === 0 ? "#fff7f7" : "white", cursor: "pointer", transition: "all .15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#faf9f6"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = i === 0 ? "#fff7f7" : "white"; }}
                  >
                    <div style={{ width: "26px", height: "26px", borderRadius: "8px", flexShrink: 0, background: i === 0 ? "#e84c2b" : i === 1 ? "#f5a623" : "#f2efe8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", color: i < 2 ? "white" : "#9b9992" }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12.5px", color: "#0f0e17", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.body.replace(/\$\$?[^$]+\$\$?/g, "[math]").replace(/[*_~`#]/g, "").slice(0, 38)}…
                      </div>
                      <div style={{ fontSize: "11px", color: "#b4b2a9", marginTop: "2px" }}>{s.mapel} · {s.total_attempt} attempt</div>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      <div style={{ fontSize: "14px", fontWeight: "800", color: parseInt(s.error_rate) >= 70 ? "#e84c2b" : "#f5a623" }}>{s.error_rate}%</div>
                      <div style={{ fontSize: "10px", color: "#b4b2a9" }}>salah</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>

          <ChartCard title="Soal Terpopuler">
            {!stats?.soal_terpopuler?.length ? <Empty msg="Belum ada data (min. 3 attempt per soal)." /> : (
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {stats.soal_terpopuler.map((s, i) => (
                  <div
                    key={s.kode}
                    onClick={() => navigate(`/soal/${s.kode}`)}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "11px", border: `1px solid ${i === 0 ? "#93c5fd" : "#f2efe8"}`, background: i === 0 ? "#f5f9ff" : "white", cursor: "pointer", transition: "all .15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#faf9f6"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = i === 0 ? "#f5f9ff" : "white"; }}
                  >
                    <div style={{ width: "26px", height: "26px", borderRadius: "8px", flexShrink: 0, background: i === 0 ? "#2563eb" : i === 1 ? "#7c3aed" : "#f2efe8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", color: i < 2 ? "white" : "#9b9992" }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12.5px", color: "#0f0e17", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.body.replace(/\$\$?[^$]+\$\$?/g, "[math]").replace(/[*_~`#]/g, "").slice(0, 38)}…
                      </div>
                      <div style={{ fontSize: "11px", color: "#b4b2a9", marginTop: "2px" }}>{s.mapel} · {s.total_user} user · {s.views} views</div>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      <div style={{ fontSize: "14px", fontWeight: "800", color: parseInt(s.akurasi) >= 50 ? "#1a8a6e" : "#e84c2b" }}>{s.akurasi}%</div>
                      <div style={{ fontSize: "10px", color: "#b4b2a9" }}>akurasi</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      )}

      {/* ── Bottom — Soal terbaru + User terbaru + Quick actions ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "16px" : "20px",
          alignItems: "start",
        }}
      >
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? "16px" : "20px" }}>

          {/* Soal terbaru */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17", margin: 0 }}>Soal Terbaru</h2>
              <button onClick={() => navigate("/admin/soal")}
                style={{ fontSize: "12.5px", color: "#e84c2b", fontWeight: "600", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                Lihat semua →
              </button>
            </div>
            <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e8e6e0", overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
              {loading && Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ height: "58px", borderBottom: "1px solid #f2efe8", animation: "pulse 1.5s infinite", background: "#faf9f6" }} />
              ))}
              {!loading && !stats?.soal_terbaru?.length && (
                <div style={{ padding: "28px", textAlign: "center", fontSize: "13px", color: "#b4b2a9" }}>Belum ada soal.</div>
              )}
              {!loading && stats?.soal_terbaru?.map((s, i) => (
                <div key={s.kode} onClick={() => navigate(`/admin/soal/edit/${s.id}`)}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderBottom: i < stats.soal_terbaru.length - 1 ? "1px solid #f5f3ef" : "none", cursor: "pointer", transition: "background .12s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#faf9f6")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", color: "#0f0e17", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.body.replace(/\$\$?[^$]+\$\$?/g, "[math]").replace(/[*_~`#]/g, "").slice(0, 42)}…
                    </div>
                    <div style={{ fontSize: "11px", color: "#b4b2a9", marginTop: "2px" }}>{s.mapel} — {s.subtopik}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <DifficultyBadge level={s.difficulty} />
                    {!isMobile && (
                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 7px", borderRadius: "6px", background: s.is_published == 1 ? "#e4f5f0" : "#f2efe8", color: s.is_published == 1 ? "#1a8a6e" : "#6b6860" }}>
                        {s.is_published == 1 ? "Published" : "Draft"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User terbaru */}
          <div>
            <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17", marginBottom: "12px" }}>User Terbaru</h2>
            <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e8e6e0", overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
              {loading && Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ height: "58px", borderBottom: "1px solid #f2efe8", animation: "pulse 1.5s infinite", background: "#faf9f6" }} />
              ))}
              {!loading && !stats?.user_terbaru?.length && (
                <div style={{ padding: "28px", textAlign: "center", fontSize: "13px", color: "#b4b2a9" }}>Belum ada user.</div>
              )}
              {!loading && stats?.user_terbaru?.map((u, i) => (
                <div key={u.id}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderBottom: i < stats.user_terbaru.length - 1 ? "1px solid #f5f3ef" : "none" }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "11px",
                      background: `hsl(${(u.name?.charCodeAt(0) || 200) * 7 % 360}, 65%, 55%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "800",
                      fontSize: "15px",
                      flexShrink: 0,
                    }}
                  >
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
                    <div style={{ fontSize: "11px", color: "#b4b2a9", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px", flexShrink: 0 }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#f5a623" }}>{u.xp?.toLocaleString()} XP</span>
                    <span style={{ fontSize: "10.5px", color: "#b4b2a9" }}>
                      {new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Quick actions + summary cards */}
        <div>
          <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17", marginBottom: "12px" }}>Aksi Cepat</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <QuickAction icon={Plus} label="Tambah Soal Baru" desc="Input soal beserta pilihan jawaban dan pembahasan" color="#e84c2b" onClick={() => navigate("/admin/soal/tambah")} isMobile={isMobile} />
            <QuickAction icon={BookOpen} label="Kelola Soal" desc="Lihat, edit, atau hapus soal yang sudah ada" color="#2563eb" onClick={() => navigate("/admin/soal")} isMobile={isMobile} />
            <QuickAction icon={FolderTree} label="Kelola Struktur" desc="Atur jenjang, subjenjang, mapel, topik, dan subtopik" color="#1a8a6e" onClick={() => navigate("/admin/struktur")} isMobile={isMobile} />
            <QuickAction icon={TrendingUp} label="Lihat Profil App" desc="Statistik penggunaan dan performa" color="#7c3aed" onClick={() => navigate("/home")} isMobile={isMobile} />
          </div>

          {/* Progress publikasi */}
          {!loading && stats?.total_soal > 0 && (
            <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e8e6e0", padding: "18px 20px", marginTop: "12px", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f0e17" }}>Progress Publikasi</div>
                <div style={{ fontSize: "17px", fontWeight: "800", color: "#1a8a6e", letterSpacing: "-0.5px" }}>{publishedPct}%</div>
              </div>
              <div style={{ height: "8px", background: "#f2efe8", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${publishedPct}%`, background: "linear-gradient(90deg, #1a8a6e, #2563eb)", borderRadius: "4px", transition: "width 1.2s cubic-bezier(.4,0,.2,1)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: "#b4b2a9", marginTop: "8px" }}>
                <span>{stats.total_soal_published.toLocaleString()} published · {stats.total_soal_draft} draft</span>
                <span>{stats.total_soal.toLocaleString()} total</span>
              </div>
            </div>
          )}

          {/* Dark summary card */}
          {!loading && stats && (
            <div
              style={{
                background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 100%)",
                borderRadius: "16px",
                padding: "18px 20px",
                marginTop: "12px",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "14px" }}>
                Ringkasan Platform
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {[
                  { label: "Akurasi Rata-rata", value: `${stats.akurasi || 0}%`, color: "#2563eb" },
                  { label: "Total XP", value: (stats.total_xp || 0).toLocaleString(), color: "#f5a623" },
                  { label: "Soal Tersedia", value: (stats.total_soal_published || 0).toLocaleString(), color: "#1a8a6e" },
                  { label: "User Hari Ini", value: (stats.user_aktif?.[stats.user_aktif.length - 1]?.aktif || 0).toString(), color: "#e84c2b" },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div style={{ fontSize: "17px", fontWeight: "800", color, letterSpacing: "-0.5px" }}>{value}</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}
