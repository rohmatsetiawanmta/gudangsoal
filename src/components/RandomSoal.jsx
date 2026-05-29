// src/components/RandomSoal.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shuffle, X, ChevronDown } from "lucide-react";
import api from "../lib/api";
import useWindowWidth from "../hooks/useWindowWidth";

const DIFFICULTY_OPTIONS = [
  { value: "", label: "Semua tingkat" },
  { value: "1", label: "Easy" },
  { value: "2", label: "Medium" },
  { value: "3", label: "Hard" },
];

function Select({ label, value, onChange, options, disabled }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: "600", color: "#0f0e17" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          style={{
            width: "100%",
            padding: "10px 36px 10px 14px",
            borderRadius: "10px",
            border: "1px solid #e2ddd5",
            fontSize: "14px",
            color: "#0f0e17",
            background: "white",
            appearance: "none",
            outline: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#6b6860",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

export default function RandomSoal({ onClose }) {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const [struktur, setStruktur] = useState({
    jenjang: [],
    subjenjang: [],
    mapel: [],
  });
  const [loading, setLoading] = useState(true);
  const [finding, setFinding] = useState(false);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState({
    jenjang_slug: "",
    subjenjang_slug: "",
    mapel_slug: "",
    difficulty: "",
  });

  useEffect(() => {
    api
      .get("/browse/jenjang")
      .then((data) => setStruktur((s) => ({ ...s, jenjang: data })))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected.jenjang_slug) {
      setStruktur((s) => ({ ...s, subjenjang: [], mapel: [] }));
      setSelected((s) => ({ ...s, subjenjang_slug: "", mapel_slug: "" }));
      return;
    }
    api
      .get(`/browse/subjenjang?jenjang_slug=${selected.jenjang_slug}`)
      .then((data) =>
        setStruktur((s) => ({ ...s, subjenjang: data, mapel: [] }))
      )
      .catch(() => {});
    setSelected((s) => ({ ...s, subjenjang_slug: "", mapel_slug: "" }));
  }, [selected.jenjang_slug]);

  useEffect(() => {
    if (!selected.subjenjang_slug) {
      setStruktur((s) => ({ ...s, mapel: [] }));
      setSelected((s) => ({ ...s, mapel_slug: "" }));
      return;
    }
    api
      .get(
        `/browse/mapel?jenjang_slug=${selected.jenjang_slug}&subjenjang_slug=${selected.subjenjang_slug}`
      )
      .then((data) => setStruktur((s) => ({ ...s, mapel: data })))
      .catch(() => {});
    setSelected((s) => ({ ...s, mapel_slug: "" }));
  }, [selected.subjenjang_slug]);

  const handleFind = async () => {
    setFinding(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (selected.jenjang_slug)
        params.append("jenjang_slug", selected.jenjang_slug);
      if (selected.subjenjang_slug)
        params.append("subjenjang_slug", selected.subjenjang_slug);
      if (selected.mapel_slug) params.append("mapel_slug", selected.mapel_slug);
      if (selected.difficulty) params.append("difficulty", selected.difficulty);
      const data = await api.get(`/browse/random?${params.toString()}`);
      onClose();
      navigate(`/soal/${data.kode}`);
    } catch (err) {
      setError(
        err.error || "Tidak ada soal yang sesuai filter. Coba filter lain!"
      );
    } finally {
      setFinding(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 300,
        padding: isMobile ? "16px" : "24px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: isMobile ? "20px" : "28px",
          maxWidth: "420px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#fff3f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shuffle size={18} color="#e84c2b" />
            </div>
            <h3
              style={{ fontSize: "17px", fontWeight: "800", color: "#0f0e17" }}
            >
              Soal Random
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b6860",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <p
          style={{
            fontSize: "14px",
            color: "#6b6860",
            marginBottom: "16px",
            lineHeight: "1.6",
          }}
        >
          Pilih filter soal yang ingin dikerjakan, atau langsung klik tombol
          untuk soal random dari semua kategori.
        </p>

        {/* Filter */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          <Select
            label="Jenjang"
            value={selected.jenjang_slug}
            onChange={(v) => setSelected((s) => ({ ...s, jenjang_slug: v }))}
            options={[
              { value: "", label: "Semua jenjang" },
              ...struktur.jenjang.map((j) => ({
                value: j.slug,
                label: j.nama,
              })),
            ]}
            disabled={loading}
          />
          <Select
            label="Subjenjang"
            value={selected.subjenjang_slug}
            onChange={(v) => setSelected((s) => ({ ...s, subjenjang_slug: v }))}
            options={[
              {
                value: "",
                label: selected.jenjang_slug
                  ? "Semua subjenjang"
                  : "Pilih jenjang dulu",
              },
              ...struktur.subjenjang.map((s) => ({
                value: s.slug,
                label: s.nama,
              })),
            ]}
            disabled={!selected.jenjang_slug}
          />
          <Select
            label="Mata Pelajaran"
            value={selected.mapel_slug}
            onChange={(v) => setSelected((s) => ({ ...s, mapel_slug: v }))}
            options={[
              {
                value: "",
                label: selected.subjenjang_slug
                  ? "Semua mapel"
                  : "Pilih subjenjang dulu",
              },
              ...struktur.mapel.map((m) => ({ value: m.slug, label: m.nama })),
            ]}
            disabled={!selected.subjenjang_slug}
          />
          <Select
            label="Tingkat Kesulitan"
            value={selected.difficulty}
            onChange={(v) => setSelected((s) => ({ ...s, difficulty: v }))}
            options={DIFFICULTY_OPTIONS}
          />
        </div>

        {error && (
          <div
            style={{
              background: "#fff3f0",
              border: "1px solid #fca5a5",
              color: "#b91c1c",
              fontSize: "13px",
              borderRadius: "10px",
              padding: "10px 14px",
              marginBottom: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "11px 20px",
              borderRadius: "10px",
              border: "1px solid #e2ddd5",
              background: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "inherit",
              color: "#0f0e17",
            }}
          >
            Batal
          </button>
          <button
            onClick={handleFind}
            disabled={finding}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "11px 20px",
              borderRadius: "10px",
              border: "none",
              background: finding ? "#f5a07a" : "#e84c2b",
              color: "white",
              fontSize: "14px",
              fontWeight: "700",
              cursor: finding ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "all .15s",
            }}
          >
            {finding ? (
              <>
                <span
                  style={{
                    width: "14px",
                    height: "14px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    display: "block",
                  }}
                />{" "}
                Mencari...
              </>
            ) : (
              <>
                <Shuffle size={16} /> Acak Soal
              </>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
