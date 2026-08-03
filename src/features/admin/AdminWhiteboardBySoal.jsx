// src/features/admin/AdminWhiteboardBySoal.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";

export default function AdminWhiteboardBySoal() {
  const { kode } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/admin/whiteboard/by-soal-kode?kode=${encodeURIComponent(kode)}`)
      .then((session) => {
        navigate(`/admin/whiteboard/${session.id}`, { replace: true });
      })
      .catch(() => setError("Soal tidak ditemukan atau terjadi kesalahan."));
  }, [kode, navigate]);

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <p style={{ fontSize: "14px", color: "#e84c2b", marginBottom: "16px" }}>{error}</p>
        <button
          onClick={() => navigate("/admin/whiteboard")}
          style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}
        >
          Kembali ke Whiteboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "60px 24px", color: "#b4b2a9", fontSize: "14px" }}>
      Membuka whiteboard untuk soal <strong style={{ fontFamily: "monospace", color: "#0f0e17" }}>{kode}</strong>...
    </div>
  );
}
