// src/features/admin/AdminSoalBulkImportPage.jsx
import { useEffect, useState } from "react";
import api from "../../lib/api";
import AdminSoalBulkImport from "./AdminSoalBulkImport";

export default function AdminSoalBulkImportPage() {
  const [struktur, setStruktur] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/struktur")
      .then(setStruktur)
      .catch(() => setError("Gagal memuat struktur"));
  }, []);

  if (error) return <p style={{ color: "#e84c2b", padding: "24px" }}>{error}</p>;
  if (!struktur) return <p style={{ color: "#b4b2a9", padding: "24px" }}>Memuat...</p>;

  return <AdminSoalBulkImport struktur={struktur} />;
}
