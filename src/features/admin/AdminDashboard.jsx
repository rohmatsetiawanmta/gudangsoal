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
} from "lucide-react";
import {
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
  Legend,
} from "recharts";
import { Helmet } from "react-helmet-async";
import api from "../../lib/api";
import useWindowWidth from "../../hooks/useWindowWidth";

function StatCard({ icon: Icon, label, value, sub, color, loading, isMobile }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        border: "1px solid #e2ddd5",
        padding: isMobile ? "16px" : "20px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: color,
          borderRadius: "16px 16px 0 0",
        }}
      />
      <div
        style={{
          width: isMobile ? "36px" : "42px",
          height: isMobile ? "36px" : "42px",
          borderRadius: "12px",
          background: color + "15",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: isMobile ? "12px" : "16px",
        }}
      >
        <Icon size={isMobile ? 18 : 20} color={color} />
      </div>
      <div
        style={{
          fontSize: isMobile ? "24px" : "30px",
          fontWeight: "800",
          color: "#0f0e17",
          lineHeight: 1,
          letterSpacing: "-0.5px",
          marginBottom: "4px",
        }}
      >
        {loading
          ? "—"
          : typeof value === "number"
          ? value.toLocaleString()
          : value}
      </div>
      <div
        style={{
          fontSize: "12px",
          fontWeight: "600",
          color: "#6b6860",
          textTransform: "uppercase",
          letterSpacing: ".06em",
          marginBottom: sub && !loading ? "6px" : "0",
        }}
      >
        {label}
      </div>
      {sub && !loading && (
        <div style={{ fontSize: "11px", color: "#b4b2a9" }}>{sub}</div>
      )}
    </div>
  );
}

function QuickAction({ icon: Icon, label, desc, onClick, color, isMobile }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white",
        borderRadius: "14px",
        border: `1px solid ${hovered ? color : "#e2ddd5"}`,
        padding: isMobile ? "14px 16px" : "20px",
        cursor: "pointer",
        transition: "all .15s",
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}
    >
      <div
        style={{
          width: isMobile ? "36px" : "40px",
          height: isMobile ? "36px" : "40px",
          borderRadius: "10px",
          background: color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={isMobile ? 17 : 20} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#0f0e17",
            marginBottom: isMobile ? "0" : "2px",
          }}
        >
          {label}
        </div>
        {!isMobile && (
          <div style={{ fontSize: "13px", color: "#6b6860" }}>{desc}</div>
        )}
      </div>
      <ArrowRight size={16} color={hovered ? color : "#b4b2a9"} />
    </div>
  );
}

function DifficultyBadge({ level }) {
  const map = {
    1: { label: "Easy", color: "#1a8a6e", bg: "#e4f5f0" },
    2: { label: "Medium", color: "#854F0B", bg: "#faeeda" },
    3: { label: "Hard", color: "#e84c2b", bg: "#fff3f0" },
  };
  const d = map[level] || map[1];
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: "700",
        padding: "2px 7px",
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

function SectionTitle({ children }) {
  return (
    <h2
      style={{
        fontSize: "15px",
        fontWeight: "700",
        color: "#0f0e17",
        marginBottom: "14px",
      }}
    >
      {children}
    </h2>
  );
}

const DIFFICULTY_LABELS = { 1: "Easy", 2: "Medium", 3: "Hard" };
const DIFFICULTY_COLORS = { 1: "#1a8a6e", 2: "#f5a623", 3: "#e84c2b" };
const CHART_COLORS = [
  "#e84c2b",
  "#2563eb",
  "#1a8a6e",
  "#f5a623",
  "#7c3aed",
  "#db2777",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e2ddd5",
        borderRadius: "10px",
        padding: "10px 14px",
        fontSize: "13px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ fontWeight: "600", color: "#0f0e17", marginBottom: "4px" }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#6b6860" }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registrasiMode, setRegistrasiMode] = useState("harian");

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const greeting =
    now.getHours() < 11
      ? "Selamat pagi"
      : now.getHours() < 15
      ? "Selamat siang"
      : now.getHours() < 18
      ? "Selamat sore"
      : "Selamat malam";

  // Format data chart
  const userAktifData = (stats?.user_aktif || []).map((d) => ({
    tanggal: new Date(d.tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    }),
    aktif: parseInt(d.aktif),
  }));

  const soalPerHariData = (stats?.soal_per_hari || []).map((d) => ({
    tanggal: new Date(d.tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    }),
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

  const registrasiData = stats?.registrasi_harian?.length
    ? stats.registrasi_harian.map((d) => ({
        tanggal: new Date(d.tanggal).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        }),
        total: parseInt(d.total),
      }))
    : [];

  const registrasiMingguanData = stats?.registrasi_mingguan?.length
    ? stats.registrasi_mingguan.map((d) => ({
        tanggal: new Date(d.tanggal_mulai).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        }),
        total: parseInt(d.total),
      }))
    : [];

  const xpPerHariData = stats?.xp_per_hari?.length
    ? stats.xp_per_hari.map((d) => ({
        tanggal: new Date(d.tanggal).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        }),
        total_xp: parseInt(d.total_xp),
        transaksi: parseInt(d.total_transaksi),
      }))
    : [];

  return (
    <div>
      <Helmet>
        <title>Dashboard | Admin Gudang Soal</title>
      </Helmet>

      {/* Header */}
      <div style={{ marginBottom: isMobile ? "24px" : "32px" }}>
        <p style={{ fontSize: "14px", color: "#6b6860", marginBottom: "4px" }}>
          {greeting}
        </p>
        <h1
          style={{
            fontSize: isMobile ? "22px" : "24px",
            fontWeight: "800",
            color: "#0f0e17",
            letterSpacing: "-0.5px",
            marginBottom: "4px",
          }}
        >
          Dashboard
        </h1>
        <p style={{ fontSize: "14px", color: "#6b6860" }}>
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr 1fr"
            : "repeat(auto-fill, minmax(200px, 1fr))",
          gap: isMobile ? "10px" : "14px",
          marginBottom: isMobile ? "24px" : "32px",
        }}
      >
        <StatCard
          icon={BookOpen}
          label="Total Soal"
          value={stats?.total_soal || 0}
          sub={
            loading
              ? null
              : `${stats?.total_soal_published || 0} published · ${
                  stats?.total_soal_draft || 0
                } draft`
          }
          color="#e84c2b"
          loading={loading}
          isMobile={isMobile}
        />
        <StatCard
          icon={Users}
          label="Total User"
          value={stats?.total_user || 0}
          color="#2563eb"
          loading={loading}
          isMobile={isMobile}
        />
        <StatCard
          icon={Activity}
          label="Total Sesi"
          value={stats?.total_sesi || 0}
          sub={loading ? null : `Akurasi rata-rata ${stats?.akurasi || 0}%`}
          color="#1a8a6e"
          loading={loading}
          isMobile={isMobile}
        />
        <StatCard
          icon={FolderTree}
          label="Total Jenjang"
          value={stats?.total_jenjang || 0}
          color="#f5a623"
          loading={loading}
          isMobile={isMobile}
        />
        <StatCard
          icon={Layers}
          label="Total Subtopik"
          value={stats?.total_subtopik || 0}
          color="#7c3aed"
          loading={loading}
          isMobile={isMobile}
        />
        <StatCard
          icon={CheckCircle}
          label="Jawaban Benar"
          value={stats?.total_benar || 0}
          sub={loading ? null : `dari ${stats?.total_sesi || 0} attempt`}
          color="#db2777"
          loading={loading}
          isMobile={isMobile}
        />
      </div>

      {/* Charts row 1 — User aktif + Soal per hari */}
      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {/* User aktif 7 hari */}
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: isMobile ? "16px" : "20px",
            }}
          >
            <SectionTitle>User Aktif 7 Hari Terakhir</SectionTitle>
            {userAktifData.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px",
                  color: "#b4b2a9",
                  fontSize: "13px",
                }}
              >
                Belum ada data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart
                  data={userAktifData}
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="tanggal"
                    tick={{ fontSize: 11, fill: "#b4b2a9" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#b4b2a9" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="aktif"
                    name="User aktif"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#2563eb" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Soal dibuat 30 hari */}
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: isMobile ? "16px" : "20px",
            }}
          >
            <SectionTitle>Soal Ditambahkan 30 Hari Terakhir</SectionTitle>
            {soalPerHariData.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px",
                  color: "#b4b2a9",
                  fontSize: "13px",
                }}
              >
                Belum ada data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={soalPerHariData}
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="tanggal"
                    tick={{ fontSize: 11, fill: "#b4b2a9" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#b4b2a9" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="total"
                    name="Soal baru"
                    fill="#e84c2b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Charts row 2 — Soal per jenjang + Akurasi per difficulty */}
      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {/* Soal per jenjang */}
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: isMobile ? "16px" : "20px",
            }}
          >
            <SectionTitle>Soal per Jenjang</SectionTitle>
            {soalPerJenjangData.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px",
                  color: "#b4b2a9",
                  fontSize: "13px",
                }}
              >
                Belum ada data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={soalPerJenjangData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#b4b2a9" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="nama"
                    tick={{ fontSize: 11, fill: "#6b6860" }}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" name="Soal" radius={[0, 4, 4, 0]}>
                    {soalPerJenjangData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Akurasi per difficulty */}
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: isMobile ? "16px" : "20px",
            }}
          >
            <SectionTitle>Distribusi Attempt per Kesulitan</SectionTitle>
            {akurasiData.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px",
                  color: "#b4b2a9",
                  fontSize: "13px",
                }}
              >
                Belum ada data.
              </div>
            ) : (
              <div
                style={{ display: "flex", alignItems: "center", gap: "20px" }}
              >
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie
                      data={akurasiData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {akurasiData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div
                            style={{
                              background: "white",
                              border: "1px solid #e2ddd5",
                              borderRadius: "10px",
                              padding: "10px 14px",
                              fontSize: "13px",
                              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                            }}
                          >
                            <div style={{ fontWeight: "600", color: d.color }}>
                              {d.name}
                            </div>
                            <div style={{ color: "#6b6860" }}>
                              Total: <strong>{d.value}</strong>
                            </div>
                            <div style={{ color: "#6b6860" }}>
                              Akurasi: <strong>{d.akurasi}%</strong>
                            </div>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {akurasiData.map((d, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <div
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: d.color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#0f0e17",
                          }}
                        >
                          {d.name}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b6860",
                          paddingLeft: "16px",
                        }}
                      >
                        {d.value} attempt · {d.akurasi}% akurasi
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Charts row 3 — Registrasi user + XP per hari */}
      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {/* Registrasi user */}
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: isMobile ? "16px" : "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <SectionTitle>Registrasi User Baru</SectionTitle>
              <div style={{ display: "flex", gap: "6px" }}>
                {["harian", "mingguan"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setRegistrasiMode(mode)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "none",
                      background:
                        registrasiMode === mode ? "#0f0e17" : "#f2efe8",
                      color: registrasiMode === mode ? "white" : "#6b6860",
                      fontSize: "11px",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all .15s",
                      textTransform: "capitalize",
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            {(registrasiMode === "harian"
              ? registrasiData
              : registrasiMingguanData
            ).length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px",
                  color: "#b4b2a9",
                  fontSize: "13px",
                }}
              >
                Belum ada data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={
                    registrasiMode === "harian"
                      ? registrasiData
                      : registrasiMingguanData
                  }
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="tanggal"
                    tick={{ fontSize: 11, fill: "#b4b2a9" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#b4b2a9" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="total"
                    name="User baru"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* XP per hari */}
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: isMobile ? "16px" : "20px",
            }}
          >
            <SectionTitle>XP Didistribusikan per Hari</SectionTitle>
            {xpPerHariData.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px",
                  color: "#b4b2a9",
                  fontSize: "13px",
                }}
              >
                Belum ada data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart
                  data={xpPerHariData}
                  margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
                >
                  <XAxis
                    dataKey="tanggal"
                    tick={{ fontSize: 11, fill: "#b4b2a9" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#b4b2a9" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div
                          style={{
                            background: "white",
                            border: "1px solid #e2ddd5",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            fontSize: "13px",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: "600",
                              color: "#0f0e17",
                              marginBottom: "4px",
                            }}
                          >
                            {label}
                          </div>
                          <div style={{ color: "#f5a623" }}>
                            Total XP:{" "}
                            <strong>
                              {parseInt(
                                payload[0]?.value || 0
                              ).toLocaleString()}
                            </strong>
                          </div>
                          <div style={{ color: "#6b6860" }}>
                            Transaksi: <strong>{payload[1]?.value || 0}</strong>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total_xp"
                    name="Total XP"
                    stroke="#f5a623"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#f5a623" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="transaksi"
                    name="Transaksi"
                    stroke="#b4b2a9"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
            {xpPerHariData.length > 0 && (
              <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "2px",
                      background: "#f5a623",
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "#6b6860" }}>
                    Total XP
                  </span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "2px",
                      background: "#b4b2a9",
                      backgroundImage:
                        "repeating-linear-gradient(90deg, #b4b2a9 0, #b4b2a9 4px, transparent 0, transparent 8px)",
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "#6b6860" }}>
                    Transaksi
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Charts row 4 — Soal paling sering salah + Soal terpopuler */}
      {!loading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {/* Soal paling sering salah */}
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: isMobile ? "16px" : "20px",
            }}
          >
            <SectionTitle>Soal Paling Sering Salah</SectionTitle>
            {!stats?.soal_paling_salah?.length ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px",
                  color: "#b4b2a9",
                  fontSize: "13px",
                }}
              >
                Belum ada data (min. 5 attempt per soal).
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {stats.soal_paling_salah.map((s, i) => (
                  <div
                    key={s.kode}
                    onClick={() => navigate(`/soal/${s.kode}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "1px solid #f2efe8",
                      background: i === 0 ? "#fff3f0" : "white",
                      cursor: "pointer",
                      transition: "background .15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#faf9f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        i === 0 ? "#fff3f0" : "white")
                    }
                  >
                    {/* Rank */}
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "6px",
                        flexShrink: 0,
                        background:
                          i === 0 ? "#e84c2b" : i === 1 ? "#f5a623" : "#f2efe8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: i < 2 ? "white" : "#6b6860",
                      }}
                    >
                      {i + 1}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#0f0e17",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.body
                          .replace(/\$\$?[^$]+\$\$?/g, "[math]")
                          .replace(/[*_~`#]/g, "")
                          .slice(0, 35)}
                        ...
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#b4b2a9",
                          marginTop: "2px",
                        }}
                      >
                        {s.mapel} · {s.total_attempt} attempt
                      </div>
                    </div>

                    {/* Error rate */}
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "800",
                          color:
                            parseInt(s.error_rate) >= 70
                              ? "#e84c2b"
                              : "#f5a623",
                        }}
                      >
                        {s.error_rate}%
                      </div>
                      <div style={{ fontSize: "10px", color: "#b4b2a9" }}>
                        salah
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Soal terpopuler */}
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              border: "1px solid #e2ddd5",
              padding: isMobile ? "16px" : "20px",
            }}
          >
            <SectionTitle>Soal Terpopuler</SectionTitle>
            {!stats?.soal_terpopuler?.length ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px",
                  color: "#b4b2a9",
                  fontSize: "13px",
                }}
              >
                Belum ada data (min. 3 attempt per soal).
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {stats.soal_terpopuler.map((s, i) => (
                  <div
                    key={s.kode}
                    onClick={() => navigate(`/soal/${s.kode}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "1px solid #f2efe8",
                      background: i === 0 ? "#eff6ff" : "white",
                      cursor: "pointer",
                      transition: "background .15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#faf9f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        i === 0 ? "#eff6ff" : "white")
                    }
                  >
                    {/* Rank */}
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "6px",
                        flexShrink: 0,
                        background:
                          i === 0 ? "#2563eb" : i === 1 ? "#7c3aed" : "#f2efe8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: i < 2 ? "white" : "#6b6860",
                      }}
                    >
                      {i + 1}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#0f0e17",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.body
                          .replace(/\$\$?[^$]+\$\$?/g, "[math]")
                          .replace(/[*_~`#]/g, "")
                          .slice(0, 35)}
                        ...
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#b4b2a9",
                          marginTop: "2px",
                        }}
                      >
                        {s.mapel} · {s.total_user} user · {s.views} views
                      </div>
                    </div>

                    {/* Akurasi */}
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "800",
                          color:
                            parseInt(s.akurasi) >= 50 ? "#1a8a6e" : "#e84c2b",
                        }}
                      >
                        {s.akurasi}%
                      </div>
                      <div style={{ fontSize: "10px", color: "#b4b2a9" }}>
                        akurasi
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom grid — Soal terbaru + User terbaru + Quick actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "20px" : "24px",
          alignItems: "start",
        }}
      >
        {/* Kiri — Soal terbaru + User terbaru */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "20px" : "24px",
          }}
        >
          {/* Soal terbaru */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <SectionTitle>Soal Terbaru</SectionTitle>
              <button
                onClick={() => navigate("/admin/soal")}
                style={{
                  fontSize: "13px",
                  color: "#e84c2b",
                  fontWeight: "600",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Lihat semua
              </button>
            </div>
            <div
              style={{
                background: "white",
                borderRadius: "14px",
                border: "1px solid #e2ddd5",
                overflow: "hidden",
              }}
            >
              {loading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: "56px",
                      borderBottom: "1px solid #f2efe8",
                      animation: "pulse 1.5s infinite",
                      background: i % 2 === 0 ? "white" : "#faf9f6",
                    }}
                  />
                ))}
              {!loading && !stats?.soal_terbaru?.length && (
                <div
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    fontSize: "14px",
                    color: "#6b6860",
                  }}
                >
                  Belum ada soal.
                </div>
              )}
              {!loading &&
                stats?.soal_terbaru?.map((s, i) => (
                  <div
                    key={s.kode}
                    onClick={() => navigate(`/admin/soal/edit/${s.id}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      borderBottom:
                        i < stats.soal_terbaru.length - 1
                          ? "1px solid #f2efe8"
                          : "none",
                      cursor: "pointer",
                      transition: "background .15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#faf9f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "white")
                    }
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#0f0e17",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.body
                          .replace(/\$\$?[^$]+\$\$?/g, "[math]")
                          .replace(/[*_~`#]/g, "")
                          .slice(0, 40)}
                        ...
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#b4b2a9",
                          marginTop: "2px",
                        }}
                      >
                        {s.mapel} — {s.subtopik}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        flexShrink: 0,
                      }}
                    >
                      <DifficultyBadge level={s.difficulty} />
                      {!isMobile && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "2px 7px",
                            borderRadius: "6px",
                            background:
                              s.is_published == 1 ? "#e4f5f0" : "#f2efe8",
                            color: s.is_published == 1 ? "#1a8a6e" : "#6b6860",
                          }}
                        >
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
            <SectionTitle>User Terbaru</SectionTitle>
            <div
              style={{
                background: "white",
                borderRadius: "14px",
                border: "1px solid #e2ddd5",
                overflow: "hidden",
              }}
            >
              {loading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: "56px",
                      borderBottom: "1px solid #f2efe8",
                      animation: "pulse 1.5s infinite",
                      background: i % 2 === 0 ? "white" : "#faf9f6",
                    }}
                  />
                ))}
              {!loading && !stats?.user_terbaru?.length && (
                <div
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    fontSize: "14px",
                    color: "#6b6860",
                  }}
                >
                  Belum ada user.
                </div>
              )}
              {!loading &&
                stats?.user_terbaru?.map((u, i) => (
                  <div
                    key={u.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      borderBottom:
                        i < stats.user_terbaru.length - 1
                          ? "1px solid #f2efe8"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "10px",
                        background: "#e84c2b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "700",
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#0f0e17",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {u.name}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#b4b2a9",
                          marginTop: "1px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {u.email}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "2px",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#f5a623",
                        }}
                      >
                        {u.xp?.toLocaleString()} XP
                      </span>
                      <span style={{ fontSize: "11px", color: "#b4b2a9" }}>
                        {new Date(u.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Kanan — Quick actions + Progress publikasi */}
        <div>
          <SectionTitle>Aksi Cepat</SectionTitle>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <QuickAction
              icon={Plus}
              label="Tambah Soal Baru"
              desc="Input soal beserta pilihan jawaban dan pembahasan"
              color="#e84c2b"
              onClick={() => navigate("/admin/soal/tambah")}
              isMobile={isMobile}
            />
            <QuickAction
              icon={BookOpen}
              label="Kelola Soal"
              desc="Lihat, edit, atau hapus soal yang sudah ada"
              color="#2563eb"
              onClick={() => navigate("/admin/soal")}
              isMobile={isMobile}
            />
            <QuickAction
              icon={FolderTree}
              label="Kelola Struktur"
              desc="Atur jenjang, subjenjang, mapel, topik, dan subtopik"
              color="#1a8a6e"
              onClick={() => navigate("/admin/struktur")}
              isMobile={isMobile}
            />
            <QuickAction
              icon={TrendingUp}
              label="Lihat Profil App"
              desc="Statistik penggunaan dan performa"
              color="#7c3aed"
              onClick={() => navigate("/home")}
              isMobile={isMobile}
            />
          </div>

          {/* Progress publikasi */}
          {!loading && stats?.total_soal > 0 && (
            <div
              style={{
                background: "white",
                borderRadius: "14px",
                border: "1px solid #e2ddd5",
                padding: isMobile ? "16px" : "20px",
                marginTop: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0f0e17",
                  marginBottom: "12px",
                }}
              >
                Progress Publikasi Soal
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "#6b6860",
                  marginBottom: "6px",
                }}
              >
                <span>{stats.total_soal_published} published</span>
                <span>
                  {Math.round(
                    (stats.total_soal_published / stats.total_soal) * 100
                  )}
                  %
                </span>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "#f2efe8",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.round(
                      (stats.total_soal_published / stats.total_soal) * 100
                    )}%`,
                    background: "linear-gradient(90deg, #1a8a6e, #2563eb)",
                    borderRadius: "4px",
                    transition: "width 1s ease",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "#b4b2a9",
                  marginTop: "6px",
                }}
              >
                <span>{stats.total_soal_draft} draft</span>
                <span>{stats.total_soal} total</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
