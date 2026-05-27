// src/features/profile/ProfilePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Flame,
  Star,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { useAuthStore } from "../auth/authStore";
import { getProfile, updateProfile } from "./profileApi";
import { BADGES } from "../../lib/constants";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "14px",
        border: "1px solid #e2ddd5",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
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
            fontSize: "24px",
            fontWeight: "800",
            color: "#0f0e17",
            lineHeight: 1,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function XPBar({ xp }) {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const prevXP = Math.pow(level - 1, 2) * 100;
  const nextXP = Math.pow(level, 2) * 100;
  const percent = ((xp - prevXP) / (nextXP - prevXP)) * 100;

  return (
    <div
      style={{
        background: "white",
        borderRadius: "14px",
        border: "1px solid #e2ddd5",
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "#faeeda",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "800",
            fontSize: "16px",
            color: "#854F0B",
            flexShrink: 0,
          }}
        >
          {level}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span
              style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}
            >
              Level {level}
            </span>
            <span style={{ fontSize: "13px", color: "#6b6860" }}>
              {xp.toLocaleString()} XP
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
                width: `${percent}%`,
                background: "linear-gradient(90deg, #f5a623, #e84c2b)",
                borderRadius: "4px",
                transition: "width 1s ease",
              }}
            />
          </div>
          <div style={{ fontSize: "12px", color: "#b4b2a9", marginTop: "4px" }}>
            {(nextXP - xp).toLocaleString()} XP lagi ke Level {level + 1}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit form
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getProfile()
      .then((d) => {
        setData(d);
        setForm((f) => ({ ...f, name: d.user.name }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Nama wajib diisi");
      return;
    }
    if (form.new_password && form.new_password !== form.confirm_password) {
      setError("Password baru tidak cocok");
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: form.name,
        current_password: form.current_password || undefined,
        new_password: form.new_password || undefined,
      });
      updateUser({ name: form.name });
      setSuccess("Profil berhasil diupdate!");
      setEditMode(false);
      setForm((f) => ({
        ...f,
        current_password: "",
        new_password: "",
        confirm_password: "",
      }));
      setData((d) => ({ ...d, user: { ...d.user, name: form.name } }));
    } catch (err) {
      setError(err.error || "Gagal mengupdate profil");
    } finally {
      setSaving(false);
    }
  };

  const earnedBadgeIds = data?.badges?.map((b) => b.badge_id) || [];

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f6" }}>
      <Navbar />

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "40px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "800",
              color: "#0f0e17",
              letterSpacing: "-0.5px",
              marginBottom: "4px",
            }}
          >
            Profil Saya
          </h1>
          <p style={{ fontSize: "14px", color: "#6b6860" }}>
            Lihat progress dan kelola akun kamu.
          </p>
        </div>

        {loading ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: "80px",
                  borderRadius: "14px",
                  background: "#e2ddd5",
                  opacity: 0.5,
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* Info user */}
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
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "14px" }}
                >
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "16px",
                      background: "#e84c2b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "800",
                      fontSize: "20px",
                    }}
                  >
                    {data?.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: "800",
                        color: "#0f0e17",
                      }}
                    >
                      {data?.user?.name}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6b6860",
                        marginTop: "2px",
                      }}
                    >
                      {data?.user?.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditMode(!editMode);
                    setError("");
                    setSuccess("");
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    border: "1px solid #e2ddd5",
                    background: editMode ? "#f2efe8" : "white",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: "#0f0e17",
                  }}
                >
                  {editMode ? "Batal" : "Edit Profil"}
                </button>
              </div>

              {/* Edit form */}
              {editMode && (
                <form
                  onSubmit={handleSave}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    borderTop: "1px solid #f2efe8",
                    paddingTop: "20px",
                  }}
                >
                  {error && (
                    <div
                      style={{
                        background: "#fff3f0",
                        border: "1px solid #fca5a5",
                        color: "#b91c1c",
                        fontSize: "13px",
                        borderRadius: "10px",
                        padding: "10px 14px",
                      }}
                    >
                      {error}
                    </div>
                  )}
                  {success && (
                    <div
                      style={{
                        background: "#e4f5f0",
                        border: "1px solid #9FE1CB",
                        color: "#0F6E56",
                        fontSize: "13px",
                        borderRadius: "10px",
                        padding: "10px 14px",
                      }}
                    >
                      {success}
                    </div>
                  )}

                  {/* Nama */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#0f0e17",
                      }}
                    >
                      Nama
                    </label>
                    <div style={{ position: "relative" }}>
                      <User
                        size={15}
                        style={{
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#6b6860",
                          pointerEvents: "none",
                        }}
                      />
                      <input
                        value={form.name}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, name: e.target.value }))
                        }
                        style={{
                          width: "100%",
                          paddingLeft: "36px",
                          paddingRight: "14px",
                          paddingTop: "10px",
                          paddingBottom: "10px",
                          borderRadius: "10px",
                          border: "1px solid #e2ddd5",
                          fontSize: "14px",
                          outline: "none",
                          fontFamily: "inherit",
                          color: "#0f0e17",
                          boxSizing: "border-box",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#e84c2b")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
                      />
                    </div>
                  </div>

                  {/* Password lama */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#0f0e17",
                      }}
                    >
                      Password Lama{" "}
                      <span style={{ fontWeight: "400", color: "#6b6860" }}>
                        (isi jika ingin ganti password)
                      </span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <Lock
                        size={15}
                        style={{
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#6b6860",
                          pointerEvents: "none",
                        }}
                      />
                      <input
                        type={showPass ? "text" : "password"}
                        value={form.current_password}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            current_password: e.target.value,
                          }))
                        }
                        placeholder="Password lama"
                        style={{
                          width: "100%",
                          paddingLeft: "36px",
                          paddingRight: "40px",
                          paddingTop: "10px",
                          paddingBottom: "10px",
                          borderRadius: "10px",
                          border: "1px solid #e2ddd5",
                          fontSize: "14px",
                          outline: "none",
                          fontFamily: "inherit",
                          color: "#0f0e17",
                          boxSizing: "border-box",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = "#e84c2b")
                        }
                        onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#6b6860",
                          display: "flex",
                        }}
                      >
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Password baru */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#0f0e17",
                        }}
                      >
                        Password Baru
                      </label>
                      <div style={{ position: "relative" }}>
                        <Lock
                          size={15}
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#6b6860",
                            pointerEvents: "none",
                          }}
                        />
                        <input
                          type={showPass ? "text" : "password"}
                          value={form.new_password}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              new_password: e.target.value,
                            }))
                          }
                          placeholder="Minimal 8 karakter"
                          style={{
                            width: "100%",
                            paddingLeft: "36px",
                            paddingRight: "14px",
                            paddingTop: "10px",
                            paddingBottom: "10px",
                            borderRadius: "10px",
                            border: "1px solid #e2ddd5",
                            fontSize: "14px",
                            outline: "none",
                            fontFamily: "inherit",
                            color: "#0f0e17",
                            boxSizing: "border-box",
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderColor = "#e84c2b")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor = "#e2ddd5")
                          }
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#0f0e17",
                        }}
                      >
                        Konfirmasi Password
                      </label>
                      <div style={{ position: "relative" }}>
                        <Lock
                          size={15}
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#6b6860",
                            pointerEvents: "none",
                          }}
                        />
                        <input
                          type={showPass ? "text" : "password"}
                          value={form.confirm_password}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              confirm_password: e.target.value,
                            }))
                          }
                          placeholder="Ulangi password baru"
                          style={{
                            width: "100%",
                            paddingLeft: "36px",
                            paddingRight: "14px",
                            paddingTop: "10px",
                            paddingBottom: "10px",
                            borderRadius: "10px",
                            border: "1px solid #e2ddd5",
                            fontSize: "14px",
                            outline: "none",
                            fontFamily: "inherit",
                            color: "#0f0e17",
                            boxSizing: "border-box",
                          }}
                          onFocus={(e) =>
                            (e.target.style.borderColor = "#e84c2b")
                          }
                          onBlur={(e) =>
                            (e.target.style.borderColor = "#e2ddd5")
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="submit"
                      disabled={saving}
                      style={{
                        padding: "10px 24px",
                        borderRadius: "10px",
                        border: "none",
                        background: saving ? "#f5a07a" : "#e84c2b",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: saving ? "not-allowed" : "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {saving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* XP Bar */}
            <XPBar xp={data?.user?.xp || 0} />

            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: "14px",
              }}
            >
              <StatCard
                icon={Star}
                label="Total XP"
                value={(data?.user?.xp || 0).toLocaleString()}
                color="#f5a623"
              />
              <StatCard
                icon={Flame}
                label="Streak Hari"
                value={`${data?.user?.streak || 0} hari`}
                color="#e84c2b"
              />
              <StatCard
                icon={Zap}
                label="Streak Soal"
                value={data?.user?.soal_streak || 0}
                color="#2563eb"
              />
              <StatCard
                icon={CheckCircle}
                label="Soal Dikerjakan"
                value={data?.stats?.total || 0}
                color="#1a8a6e"
              />
            </div>

            {/* Akurasi */}
            {data?.stats?.total > 0 && (
              <div
                style={{
                  background: "white",
                  borderRadius: "14px",
                  border: "1px solid #e2ddd5",
                  padding: "20px 24px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b6860",
                    marginBottom: "8px",
                  }}
                >
                  Akurasi Keseluruhan
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "14px" }}
                >
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "800",
                      color: "#0f0e17",
                    }}
                  >
                    {Math.round((data.stats.benar / data.stats.total) * 100)}%
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: "10px",
                      background: "#f2efe8",
                      borderRadius: "5px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.round(
                          (data.stats.benar / data.stats.total) * 100
                        )}%`,
                        background: "#1a8a6e",
                        borderRadius: "5px",
                        transition: "width 1s ease",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#6b6860",
                      flexShrink: 0,
                    }}
                  >
                    {data.stats.benar}/{data.stats.total} benar
                  </div>
                </div>
              </div>
            )}

            {/* Badge */}
            <div>
              <h2
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "#0f0e17",
                  marginBottom: "14px",
                }}
              >
                Badge
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: "12px",
                }}
              >
                {BADGES.map((badge) => {
                  const earned = earnedBadgeIds.includes(badge.id);
                  const earnedAt = data?.badges?.find(
                    (b) => b.badge_id === badge.id
                  )?.earned_at;
                  return (
                    <div
                      key={badge.id}
                      style={{
                        background: earned ? "white" : "#f2efe8",
                        borderRadius: "14px",
                        border: `1px solid ${
                          earned ? "#e2ddd5" : "transparent"
                        }`,
                        padding: "18px 16px",
                        textAlign: "center",
                        opacity: earned ? 1 : 0.5,
                        transition: "all .15s",
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          background: earned ? "#faeeda" : "#f2efe8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 10px",
                          transition: "all .15s",
                        }}
                      >
                        {badge.icon && (
                          <badge.icon
                            size={22}
                            color={earned ? "#854F0B" : "#b4b2a9"}
                          />
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#0f0e17",
                          marginBottom: "4px",
                        }}
                      >
                        {badge.label}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b6860",
                          lineHeight: "1.4",
                        }}
                      >
                        {badge.desc}
                      </div>
                      {earned && earnedAt && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#b4b2a9",
                            marginTop: "8px",
                          }}
                        >
                          {new Date(earnedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Riwayat soal */}
            <div>
              <h2
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "#0f0e17",
                  marginBottom: "14px",
                }}
              >
                Riwayat Soal
              </h2>
              {!data?.riwayat?.length ? (
                <div
                  style={{
                    background: "white",
                    borderRadius: "14px",
                    border: "1px solid #e2ddd5",
                    padding: "32px",
                    textAlign: "center",
                    color: "#6b6860",
                    fontSize: "14px",
                  }}
                >
                  Belum ada soal yang dikerjakan.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {data.riwayat.map((r, i) => (
                    <div
                      key={i}
                      onClick={() => navigate(`/soal/${r.kode}`)}
                      style={{
                        background: "white",
                        borderRadius: "14px",
                        border: "1px solid #e2ddd5",
                        padding: "14px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        cursor: "pointer",
                        transition: "transform .15s, box-shadow .15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateX(4px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 16px rgba(0,0,0,0.06)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateX(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {r.is_correct == 1 ? (
                        <CheckCircle
                          size={18}
                          color="#1a8a6e"
                          style={{ flexShrink: 0 }}
                        />
                      ) : (
                        <XCircle
                          size={18}
                          color="#e84c2b"
                          style={{ flexShrink: 0 }}
                        />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#0f0e17",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {r.body
                            .replace(/\$\$?[^$]+\$\$?/g, "[math]")
                            .replace(/[*_~`#]/g, "")}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#b4b2a9",
                            marginTop: "3px",
                          }}
                        >
                          {r.jenjang} — {r.mapel} — {r.subtopik}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "4px",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#b4b2a9",
                            fontFamily: "monospace",
                          }}
                        >
                          {r.kode}
                        </span>
                        <span style={{ fontSize: "11px", color: "#b4b2a9" }}>
                          {new Date(r.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </div>
  );
}
