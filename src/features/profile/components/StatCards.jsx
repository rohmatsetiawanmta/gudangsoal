import { CheckCircle, Flame, Star, Zap } from "lucide-react";

function StatCard({ icon: Icon, label, value, unit, color, isMobile }) {
  return (
    <div style={{
      background: "var(--gs-surface)", borderRadius: "14px",
      border: "1px solid var(--gs-border)", borderLeft: `3px solid ${color}`,
      padding: isMobile ? "14px 16px" : "18px 20px",
      display: "flex", alignItems: "center", gap: "12px",
      transition: "box-shadow .15s",
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.06)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
    >
      <div style={{
        width: isMobile ? "36px" : "42px",
        height: isMobile ? "36px" : "42px",
        borderRadius: "11px",
        background: color + "15",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={isMobile ? 17 : 20} color={color} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: "11px", color: "var(--gs-text-hint)", marginBottom: "3px", fontWeight: "600", letterSpacing: ".03em" }}>
          {label}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "3px" }}>
          <span style={{ fontSize: isMobile ? "20px" : "24px", fontWeight: "800", color: "var(--gs-text)", lineHeight: 1 }}>
            {value}
          </span>
          {unit && (
            <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--gs-text-hint)" }}>{unit}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StatCards({ user, stats, isMobile }) {
  return (
    <>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: "12px",
      }}>
        <StatCard icon={Star}        label="Total XP"       value={(user?.xp || 0).toLocaleString()}  unit="XP"   color="#f5a623" isMobile={isMobile} />
        <StatCard icon={Flame}       label="Streak Hari"    value={user?.streak || 0}                 unit="hari" color="#e84c2b" isMobile={isMobile} />
        <StatCard icon={Zap}         label="Streak Soal"    value={user?.soal_streak || 0}            unit="soal" color="#2563eb" isMobile={isMobile} />
        <StatCard icon={CheckCircle} label="Soal Dikerjakan" value={stats?.total || 0}               unit="soal" color="#1a8a6e" isMobile={isMobile} />
      </div>

      {stats?.total > 0 && (
        <div style={{
          background: "var(--gs-surface)", borderRadius: "14px",
          border: "1px solid var(--gs-border)", borderLeft: "3px solid #1a8a6e",
          padding: isMobile ? "16px" : "20px 24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1a8a6e", flexShrink: 0 }} />
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--gs-text)" }}>Akurasi Keseluruhan</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ fontSize: "32px", fontWeight: "800", color: "var(--gs-text)", lineHeight: 1, flexShrink: 0 }}>
              {Math.round((stats.benar / stats.total) * 100)}%
            </div>
            <div style={{ flex: 1, height: "10px", background: "var(--gs-hover)", borderRadius: "5px", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${Math.round((stats.benar / stats.total) * 100)}%`,
                background: "linear-gradient(90deg, #1a8a6e, #34d399)",
                borderRadius: "5px", transition: "width 1s ease",
              }} />
            </div>
            <div style={{ fontSize: "13px", color: "var(--gs-text-muted)", flexShrink: 0, fontWeight: "600" }}>
              {stats.benar}<span style={{ color: "var(--gs-text-hint)", fontWeight: "400" }}>/{stats.total}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
