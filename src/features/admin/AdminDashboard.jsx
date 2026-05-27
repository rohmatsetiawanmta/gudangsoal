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
  Clock,
} from "lucide-react";
import api from "../../lib/api";

function StatCard({ icon: Icon, label, value, sub, color, loading }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "14px",
        border: "1px solid #e2ddd5",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: color + "18",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} color={color} />
        </div>
      </div>
      <div
        style={{
          fontSize: "28px",
          fontWeight: "800",
          color: "#0f0e17",
          lineHeight: 1,
          marginBottom: "4px",
        }}
      >
        {loading
          ? "..."
          : typeof value === "number"
          ? value.toLocaleString()
          : value}
      </div>
      <div style={{ fontSize: "13px", color: "#6b6860" }}>{label}</div>
      {sub && !loading && (
        <div style={{ fontSize: "12px", color: "#b4b2a9", marginTop: "6px" }}>
          {sub}
        </div>
      )}
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

  const now = new Date();
  const greeting =
    now.getHours() < 11
      ? "Selamat pagi"
      : now.getHours() < 15
      ? "Selamat siang"
      : now.getHours() < 18
      ? "Selamat sore"
      : "Selamat malam";

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <p style={{ fontSize: "14px", color: "#6b6860", marginBottom: "4px" }}>
          {greeting} 👋
        </p>
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
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "14px",
          marginBottom: "32px",
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
        />
        <StatCard
          icon={Users}
          label="Total User"
          value={stats?.total_user || 0}
          color="#2563eb"
          loading={loading}
        />
        <StatCard
          icon={Activity}
          label="Total Sesi"
          value={stats?.total_sesi || 0}
          sub={loading ? null : `Akurasi rata-rata ${stats?.akurasi || 0}%`}
          color="#1a8a6e"
          loading={loading}
        />
        <StatCard
          icon={FolderTree}
          label="Total Jenjang"
          value={stats?.total_jenjang || 0}
          color="#f5a623"
          loading={loading}
        />
        <StatCard
          icon={Layers}
          label="Total Subtopik"
          value={stats?.total_subtopik || 0}
          color="#7c3aed"
          loading={loading}
        />
        <StatCard
          icon={CheckCircle}
          label="Jawaban Benar"
          value={stats?.total_benar || 0}
          sub={loading ? null : `dari ${stats?.total_sesi || 0} attempt`}
          color="#db2777"
          loading={loading}
        />
      </div>

      {/* Bottom grid — soal terbaru + user terbaru + quick actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Kiri — Soal terbaru + User terbaru */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#0f0e17",
                }}
              >
                Soal Terbaru
              </h2>
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
                          maxWidth: "100%",
                        }}
                      >
                        {s.body
                          .replace(/\$\$?[^$]+\$\$?/g, "[math]")
                          .replace(/[*_~`#]/g, "")
                          .slice(0, 40)}
                        {s.body.length > 40 ? "..." : ""}
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
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* User terbaru */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#0f0e17",
                }}
              >
                User Terbaru
              </h2>
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

        {/* Kanan — Quick actions */}
        <div>
          <div style={{ marginBottom: "14px" }}>
            <h2
              style={{ fontSize: "15px", fontWeight: "700", color: "#0f0e17" }}
            >
              Aksi Cepat
            </h2>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
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
            <QuickAction
              icon={TrendingUp}
              label="Lihat Profil App"
              desc="Statistik penggunaan dan performa"
              color="#7c3aed"
              onClick={() => navigate("/home")}
            />
          </div>

          {/* Soal published vs draft bar */}
          {!loading && stats?.total_soal > 0 && (
            <div
              style={{
                background: "white",
                borderRadius: "14px",
                border: "1px solid #e2ddd5",
                padding: "20px",
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
