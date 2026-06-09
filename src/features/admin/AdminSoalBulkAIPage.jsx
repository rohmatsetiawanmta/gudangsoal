// src/features/admin/AdminSoalBulkAIPage.jsx
import { useState, useEffect } from "react";
import api from "../../lib/api";
import AdminSoalBulkAI from "./AdminSoalBulkAI";

const EMPTY = { jenjang: [], subjenjang: [], mapel: [], topik: [], subtopik: [] };

export default function AdminSoalBulkAIPage() {
  const [struktur, setStruktur] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/struktur")
      .then(setStruktur)
      .catch(() => setError("Gagal memuat struktur"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#6b6860", fontSize: "14px" }}>
        <span style={{ width: "18px", height: "18px", border: "2px solid #e2ddd5", borderTopColor: "#e84c2b", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
        Memuat struktur...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "#fff3f0", border: "1px solid #fca5a5", color: "#b91c1c", borderRadius: "10px", padding: "14px 16px", fontSize: "14px" }}>
        {error}
      </div>
    );
  }

  return <AdminSoalBulkAI struktur={struktur} />;
}
