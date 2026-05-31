// src/features/profile/components/StatCards.jsx
import { Star, Flame, Zap, CheckCircle } from "lucide-react";

function StatCard({ icon: Icon, label, value, color, isMobile }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "14px",
        border: "1px solid #e2ddd5",
        padding: isMobile ? "14px 16px" : "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: isMobile ? "36px" : "44px",
          height: isMobile ? "36px" : "44px",
          borderRadius: "12px",
          background: color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={isMobile ? 18 : 22} color={color} />
      </div>
      <div>
        <div
          style={{ fontSize: "12px", color: "#6b6860", marginBottom: "3px" }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: isMobile ? "18px" : "22px",
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

export default function StatCards({ user, stats, isMobile }) {
  return (
    <>
      {/* 4 stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: "12px",
        }}
      >
        <StatCard
          icon={Star}
          label="Total XP"
          value={(user?.xp || 0).toLocaleString()}
          color="#f5a623"
          isMobile={isMobile}
        />
        <StatCard
          icon={Flame}
          label="Streak Hari"
          value={`${user?.streak || 0}d`}
          color="#e84c2b"
          isMobile={isMobile}
        />
        <StatCard
          icon={Zap}
          label="Streak Soal"
          value={user?.soal_streak || 0}
          color="#2563eb"
          isMobile={isMobile}
        />
        <StatCard
          icon={CheckCircle}
          label="Soal Dikerjakan"
          value={stats?.total || 0}
          color="#1a8a6e"
          isMobile={isMobile}
        />
      </div>

      {/* Akurasi */}
      {stats?.total > 0 && (
        <div
          style={{
            background: "white",
            borderRadius: "14px",
            border: "1px solid #e2ddd5",
            padding: isMobile ? "16px" : "20px 24px",
          }}
        >
          <div
            style={{ fontSize: "13px", color: "#6b6860", marginBottom: "8px" }}
          >
            Akurasi Keseluruhan
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{ fontSize: "28px", fontWeight: "800", color: "#0f0e17" }}
            >
              {Math.round((stats.benar / stats.total) * 100)}%
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
                  width: `${Math.round((stats.benar / stats.total) * 100)}%`,
                  background: "#1a8a6e",
                  borderRadius: "5px",
                  transition: "width 1s ease",
                }}
              />
            </div>
            <div style={{ fontSize: "13px", color: "#6b6860", flexShrink: 0 }}>
              {stats.benar}/{stats.total}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
