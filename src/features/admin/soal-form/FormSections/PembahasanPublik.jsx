// src/features/admin/soal-form/FormSections/PembahasanPublik.jsx
import ToggleSwitch from "../../../../components/ToggleSwitch";

export default function PembahasanPublik({ form, setForm, isMobile }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "14px",
        border: "1px solid #e2ddd5",
        padding: isMobile ? "20px 16px" : "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "#0f0e17",
              marginBottom: "4px",
            }}
          >
            Pembahasan Publik
          </div>
          <div style={{ fontSize: "13px", color: "#6b6860" }}>
            User yang belum login bisa lihat pembahasan setelah jawab benar
          </div>
        </div>
        <ToggleSwitch
          checked={form.is_public_explanation == 1}
          onChange={() =>
            setForm((f) => ({
              ...f,
              is_public_explanation: f.is_public_explanation == 1 ? 0 : 1,
            }))
          }
          hideLabel
        />
      </div>
    </div>
  );
}
