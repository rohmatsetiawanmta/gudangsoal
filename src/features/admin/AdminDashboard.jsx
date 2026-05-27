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
} from "lucide-react";
import api from "../../lib/api";

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "14px",
        border: "1px solid #e2ddd5",
        padding: "24px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          background: color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={22} color={color} />
      </div>
      <div>
        <div
          style={{ fontSize: "13px", color: "#6b6860", marginBottom: "4px" }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: "800",
            color: "#0f0e17",
            lineHeight: 1,
          }}
        >
          {loading ? "..." : value.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, desc, onClick, color }) {
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
        padding: "20px",
        cursor: "pointer",
        transition: "all .15s",
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#0f0e17",
            marginBottom: "2px",
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: "13px", color: "#6b6860" }}>{desc}</div>
      </div>
      <ArrowRight size={16} color={hovered ? color : "#b4b2a9"} />
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "800",
            color: "#0f0e17",
            letterSpacing: "-0.5px",
            marginBottom: "4px",
          }}
        >
          Dashboard
        </h1>
        <p style={{ fontSize: "14px", color: "#6b6860" }}>
          Selamat datang di admin panel Gudang Soal.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "14px",
          marginBottom: "40px",
        }}
      >
        <StatCard
          icon={BookOpen}
          label="Total Soal"
          value={stats?.total_soal || 0}
          color="#e84c2b"
          loading={loading}
        />
        <StatCard
          icon={Users}
          label="Total User"
          value={stats?.total_user || 0}
          color="#2563eb"
          loading={loading}
        />
        <StatCard
          icon={FolderTree}
          label="Total Jenjang"
          value={stats?.total_jenjang || 0}
          color="#1a8a6e"
          loading={loading}
        />
        <StatCard
          icon={Layers}
          label="Total Subtopik"
          value={stats?.total_subtopik || 0}
          color="#7c3aed"
          loading={loading}
        />
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#0f0e17" }}>
          Aksi Cepat
        </h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <QuickAction
          icon={Plus}
          label="Tambah Soal Baru"
          desc="Input soal beserta pilihan jawaban dan pembahasan"
          color="#e84c2b"
          onClick={() => navigate("/admin/soal/tambah")}
        />
        <QuickAction
          icon={BookOpen}
          label="Kelola Soal"
          desc="Lihat, edit, atau hapus soal yang sudah ada"
          color="#2563eb"
          onClick={() => navigate("/admin/soal")}
        />
        <QuickAction
          icon={FolderTree}
          label="Kelola Struktur"
          desc="Atur jenjang, subjenjang, mapel, topik, dan subtopik"
          color="#1a8a6e"
          onClick={() => navigate("/admin/struktur")}
        />
      </div>
    </div>
  );
}
