import { Component, lazy, Suspense } from "react";
import { Link } from "react-router-dom";

const AcademyPage = lazy(() => import("../features/academy/AcademyPage.jsx"));

function AcademyStatus({ failed = false }) {
  return <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: "32px", background: "#fff8f3", color: "#1f1a17", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
    <div style={{ textAlign: "center", maxWidth: "440px", padding: "32px", background: "#ffffff", border: "2px solid #1f1a17", borderRadius: "16px", boxShadow: "6px 6px 0 #e84c2b" }} role={failed ? "alert" : "status"}>
      <h1 style={{ fontFamily: "inherit", fontWeight: 800, fontSize: "24px", marginBottom: "14px" }}>{failed ? "Academy belum dapat dibuka" : "Menyiapkan Academy…"}</h1>
      <p style={{ color: "#6b5f58", fontSize: "16px", lineHeight: 1.8, marginBottom: "24px" }}>{failed ? "Modul Academy gagal dimuat. Coba muat ulang; kamu juga tetap bisa membuka halaman belajar." : "Sebentar, kampusmu sedang dimuat."}</p>
      {failed && <button onClick={() => window.location.reload()} style={{ padding: "10px 16px", borderRadius: "10px", border: "2px solid #1f1a17", background: "#e84c2b", color: "#1f1a17", cursor: "pointer", font: "inherit", fontWeight: 700, marginRight: "16px", marginBottom: "16px" }}>Coba lagi</button>}
      <Link to="/home" style={{ color: "#c23a1c", fontSize: "14px", fontWeight: 700 }}>Kembali ke beranda</Link>
    </div>
  </main>;
}

class AcademyBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <AcademyStatus failed /> : this.props.children; }
}

export default function AcademyRoute() {
  return <AcademyBoundary><Suspense fallback={<AcademyStatus />}><AcademyPage /></Suspense></AcademyBoundary>;
}
