# Gudang Soal — Admin Design Standards

## Stack
- React + Vite (JSX, inline styles throughout — no CSS modules, no Tailwind)
- PHP backend API (`api/routes/admin.php`)
- Lucide React icons
- `react-helmet-async` for page titles
- `useWindowWidth` hook → `isMobile = width <= 480`

---

## Admin Page Design System

### 1. Hero Header (WAJIB untuk semua admin page)

Setiap admin page harus pakai dark gradient hero header ini sebagai bagian paling atas:

```jsx
<div style={{
  borderRadius: "18px",
  background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, <accent> 100%)",
  padding: isMobile ? "24px 20px" : "28px 32px",
  marginBottom: "24px",
  position: "relative",
  overflow: "hidden",
}}>
  {/* Watermark — teks besar sangat transparan di kanan */}
  <div style={{
    position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%",
    transform: "translateY(-50%)",
    fontSize: isMobile ? "72px" : "100px",
    fontWeight: "900", color: "rgba(255,255,255,.03)",
    letterSpacing: "-4px", userSelect: "none", lineHeight: 1,
    pointerEvents: "none",
  }}>KEYWORD</div>

  <div style={{
    display: "flex",
    alignItems: isMobile ? "flex-start" : "center",
    justifyContent: "space-between",
    flexDirection: isMobile ? "column" : "row",
    gap: "16px", position: "relative", zIndex: 1,
  }}>
    <div>
      {/* Eyebrow label */}
      <div style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "6px" }}>
        Kelola XYZ
      </div>
      {/* Main title */}
      <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 12px" }}>
        Judul Halaman
      </h1>
      {/* Stat chips (jika relevan) */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {chips.map(c => (
          <span key={c.label} style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: c.color, background: c.bg }}>
            {c.label}
          </span>
        ))}
      </div>
    </div>

    {/* CTA buttons */}
    <div style={{ display: "flex", gap: "8px", width: isMobile ? "100%" : "auto", flexShrink: 0 }}>
      {/* Secondary button — glass style */}
      <button style={{ ..., background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.85)", border: "1px solid rgba(255,255,255,.15)", borderRadius: "10px", padding: "10px 16px", fontSize: "13.5px", fontWeight: "600" }}>
        Secondary Action
      </button>
      {/* Primary button — merah */}
      <button style={{ ..., background: "#e84c2b", color: "white", border: "none", borderRadius: "10px", padding: "10px 16px", fontSize: "13.5px", fontWeight: "700", boxShadow: "0 4px 16px rgba(232,76,43,.35)" }}>
        Primary Action
      </button>
    </div>
  </div>
</div>
```

**Accent warna per section** (ujung kanan gradient `#0f0e17 → #1a1830 → <accent>`):
| Halaman | Accent | Watermark |
|---|---|---|
| Kelola Soal | `#0c1a2e` (biru gelap) | `SOAL` |
| Kelola Latihan | `#0d2210` (hijau gelap) | `QUIZ` |
| Kelola Struktur | `#1a0e2c` (ungu gelap) | `TREE` |
| Tambah/Edit Soal | `#2c1810` (merah gelap) | `NEW` / `EDIT` |
| Tambah/Edit Quiz | `#0d2210` (hijau gelap) | `NEW` / `EDIT` |
| Halaman baru | pilih accent warna sesuai tema | kata singkat CAPS |

**Stat chip colors** (di atas background gelap):
```js
{ label: "X Total",     color: "rgba(255,255,255,.8)", bg: "rgba(255,255,255,.1)" }
{ label: "X Published", color: "#6ee7b7",              bg: "rgba(110,231,183,.12)" }
{ label: "X Draft",     color: "#fcd34d",              bg: "rgba(252,211,77,.12)" }
```

**Back button** (halaman detail/form):
```jsx
<button style={{
  display: "flex", alignItems: "center", justifyContent: "center",
  width: "36px", height: "36px", borderRadius: "10px",
  border: "1px solid rgba(255,255,255,.15)",
  background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.7)", cursor: "pointer",
}}
  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.15)"; e.currentTarget.style.color = "white"; }}
  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.08)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}
>
  <ArrowLeft size={16} />
</button>
```

---

### 2. Section Cards (form / detail sections)

Kartu section dengan colored left-border accent:

```jsx
<div style={{
  background: "white", borderRadius: "14px",
  border: "1px solid #e2ddd5",
  borderLeft: "3px solid <accent-color>",
  overflow: "hidden",
}}>
  {/* Optional header bar */}
  <div style={{
    padding: "14px 20px", borderBottom: "1px solid #f0ede6",
    fontSize: "13px", fontWeight: "700", color: "#0f0e17",
    background: "linear-gradient(to right, #faf9f6, white)",
    display: "flex", alignItems: "center", gap: "8px",
  }}>
    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "<accent-color>", flexShrink: 0 }} />
    Label Section
  </div>
  <div style={{ padding: "20px" }}>
    {children}
  </div>
</div>
```

**Accent warna section card** (konsisten lintas pages):
| Section | Color |
|---|---|
| Lokasi / Navigasi | `#7c3aed` (ungu) |
| Teks / Konten utama | `#2563eb` (biru) |
| Jawaban / Input utama | `#e84c2b` (merah) |
| Pembahasan / Penjelasan | `#1a8a6e` (hijau) |
| Waktu / Reward | `#f5a623` (amber) |
| Attempt / Pengaturan | `#7c3aed` (ungu) |
| Mode / Toggle | `#1a8a6e` (hijau) |
| Video / Media | `#b4b2a9` (abu) |

---

### 3. Delete / Confirm Modal

```jsx
<div
  style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "16px" }}
  onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }} // backdrop-click dismiss
>
  <div style={{ background: "white", borderRadius: "18px", padding: "28px", maxWidth: "400px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
    {/* Ikon */}
    <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
      <Trash2 size={22} color="#e84c2b" />
    </div>
    <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f0e17", marginBottom: "8px" }}>Hapus X?</h3>
    <p style={{ fontSize: "14px", color: "#6b6860", marginBottom: "12px", lineHeight: "1.6" }}>Pesan konfirmasi...</p>
    {/* Confirmation pill — tampilkan nama item */}
    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", background: "#fff3f0", border: "1px solid #fca5a5", fontSize: "13px", fontWeight: "600", color: "#b91c1c", marginBottom: "20px" }}>
      <Icon size={13} /> {itemName}
    </div>
    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
      <button onClick={onCancel} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#0f0e17" }}>Batal</button>
      <button onClick={onConfirm} disabled={deleting} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "14px", fontWeight: "600", cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: deleting ? 0.7 : 1 }}>
        {deleting ? "Menghapus..." : "Hapus"}
      </button>
    </div>
  </div>
</div>
```

---

### 4. Empty State

```jsx
<div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2ddd5", padding: "60px 48px", textAlign: "center" }}>
  <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
    <Icon size={26} color="#e84c2b" />
  </div>
  <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f0e17", marginBottom: "6px" }}>Headline</div>
  <p style={{ fontSize: "13px", color: "#6b6860", marginBottom: "20px" }}>Subtext.</p>
  <button style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
    <Plus size={15} /> CTA
  </button>
</div>
```

---

### 5. Color Tokens

```js
// Background
"#0f0e17"  // near-black (primary dark)
"#f2efe8"  // warm off-white (page bg)
"#faf9f6"  // card subtle bg
"white"

// Text
"#0f0e17"  // heading
"#6b6860"  // body muted
"#b4b2a9"  // placeholder / hint
"#d4d0c8"  // divider

// Brand
"#e84c2b"  // red (primary CTA)
"#f5a07a"  // red disabled

// Level colors (AdminStruktur)
"#e84c2b"  // Jenjang
"#f5a623"  // Subjenjang
"#2563eb"  // Mapel
"#1a8a6e"  // Topik
"#7c3aed"  // Subtopik

// Difficulty
"#1a8a6e"  // Easy
"#854F0B"  // Medium
"#e84c2b"  // Hard

// Status
"#1a8a6e" / "#e4f5f0"  // published
"#f5a623" / "#fef9ee"  // draft/amber
"#e84c2b" / "#fff3f0"  // error/red
```

---

### 6. List Item Card

List item standar (published/draft aware):

```jsx
<div style={{
  background: "white", borderRadius: "14px",
  border: "1px solid #e2ddd5",
  borderLeft: `3px solid ${isPublished ? "#1a8a6e" : "#f5a623"}`,
  padding: isMobile ? "14px 16px" : "16px 20px",
  display: "flex", alignItems: "center", gap: "14px",
  transition: "box-shadow .15s",
}}
  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.06)"}
  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
>
```

---

### 7. Action Buttons (icon-only, 32×32)

```jsx
// Normal
<button style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #e2ddd5", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b6860", transition: "all .15s" }}
  onMouseEnter={e => { e.currentTarget.style.background = "#f2efe8"; e.currentTarget.style.borderColor = "#0f0e17"; }}
  onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e2ddd5"; }}
>

// Danger
<button style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #fca5a5", background: "#fff3f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#e84c2b", transition: "all .15s" }}
  onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
  onMouseLeave={e => e.currentTarget.style.background = "#fff3f0"}
>
```

---

### 8. Pages yang sudah dielevate

- ✅ AdminDashboard
- ✅ AdminStruktur
- ✅ AdminSoal (list)
- ✅ AdminSoalBulkImport
- ✅ soal-form/index.jsx (Tambah & Edit Soal)
- ✅ AdminQuiz (list latihan)
- ✅ AdminQuizDetail (isi set soal)
- ✅ AdminQuizForm (buat/edit set soal)

### Pages yang belum dielevate

- ⬜ AdminUsers
- ⬜ AdminFeedback
- ⬜ AdminReports
- ⬜ AdminChangelog
- ⬜ AdminSoalRequests
- ⬜ AdminQuizSoalForm (tambah/edit soal di dalam set)
