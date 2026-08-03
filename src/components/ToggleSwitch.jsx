// src/components/ToggleSwitch.jsx
export default function ToggleSwitch({
  checked,
  onChange,
  loading,
  hideLabel = false,
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
        onClick={!loading ? onChange : undefined}
        style={{
          position: "relative",
          width: "36px",
          height: "20px",
          borderRadius: "20px",
          flexShrink: 0,
          background: checked ? "#1a8a6e" : "var(--gs-border)",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background .2s",
          opacity: loading ? 0.6 : 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "white",
            top: "3px",
            left: checked ? "19px" : "3px",
            transition: "left .2s",
          }}
        />
      </div>
      {!hideLabel && (
        <span
          style={{
            fontSize: "12px",
            fontWeight: "600",
            color: checked ? "#1a8a6e" : "var(--gs-text-muted)",
            minWidth: "56px",
          }}
        >
          {loading ? "..." : checked ? "Published" : "Draft"}
        </span>
      )}
    </div>
  );
}
