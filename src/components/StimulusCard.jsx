// src/components/StimulusCard.jsx
import MathRenderer from "./MathRenderer";

export default function StimulusCard({ text, isMobile }) {
  if (!text?.trim()) return null;

  return (
    <div
      style={{
        background: "var(--gs-bg)",
        border: "1px solid var(--gs-border)",
        borderLeft: "3px solid #7c3aed",
        borderRadius: "12px",
        padding: isMobile ? "14px 16px" : "16px 20px",
        marginBottom: isMobile ? "14px" : "16px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: "700",
          letterSpacing: ".06em",
          textTransform: "uppercase",
          color: "#7c3aed",
          marginBottom: "8px",
        }}
      >
        Stimulus
      </div>
      <div
        style={{
          fontSize: isMobile ? "13.5px" : "14px",
          color: "var(--gs-text-muted)",
          lineHeight: "1.6",
        }}
      >
        <MathRenderer text={text} block />
      </div>
    </div>
  );
}
