// src/features/admin/soal-form/FormSections/Video.jsx
import { getYouTubeId } from "../constants";

export default function Video({ form, setForm }) {
  const youtubeId = getYouTubeId(form.video_url);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f0e17" }}>
          Video Pembahasan
        </div>
        <span style={{ fontWeight: "400", color: "#6b6860", fontSize: "13px" }}>
          (opsional)
        </span>
      </div>
      <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>
        URL YouTube
      </label>
      <input
        value={form.video_url}
        onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
        placeholder="https://www.youtube.com/watch?v=..."
        style={{
          padding: "10px 14px", borderRadius: "10px",
          border: "1px solid #e2ddd5", fontSize: "14px",
          outline: "none", fontFamily: "inherit", color: "#0f0e17",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#e84c2b")}
        onBlur={(e) => (e.target.style.borderColor = "#e2ddd5")}
      />
      {form.video_url && youtubeId && (
        <div style={{ marginTop: "6px", borderRadius: "10px", overflow: "hidden", aspectRatio: "16/9" }}>
          <iframe
            width="100%" height="100%"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen style={{ display: "block" }}
          />
        </div>
      )}
    </div>
  );
}
