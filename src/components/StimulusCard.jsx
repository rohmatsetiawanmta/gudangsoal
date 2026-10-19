// src/components/StimulusCard.jsx
import MathRenderer from "./MathRenderer";

export default function StimulusCard({ text, isMobile }) {
  if (!text?.trim()) return null;

  return (
    <div
      style={{
        background: "var(--gs-bg)",
        borderLeft: "3px solid #7c3aed",
        borderRadius: "0 12px 12px 0",
        padding: isMobile ? "14px 16px" : "16px 20px",
        marginBottom: isMobile ? "14px" : "16px",
        fontSize: isMobile ? "13.5px" : "14px",
        color: "var(--gs-text-muted)",
        lineHeight: "1.6",
      }}
    >
      <MathRenderer text={text} block />
    </div>
  );
}
