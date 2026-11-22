# Academy Asset Pack 02 — Buildings
## Production & Visual Review Brief

**Version:** 0.1  
**Status:** Ready for Development  
**Project:** Academy Exploration Hub  
**Art Direction:** Cozy Academy Village  
**Reference:** Academy World Mockup + Asset Pack 01 Terrain  
**Current Engine:** React + Canvas 2D  
**Base Tile Size:** 32 × 32 px

---

## 1. Objective

Mengganti tiga bangunan graybox pada Academy World dengan aset bangunan pixel art yang konsisten dengan visual Cozy Academy Village.

Bangunan berfungsi sebagai landmark visual sekaligus titik interaksi untuk membuka fitur existing.

Asset Pack 02 harus mempertahankan:
- World layout.
- Building interaction positions.
- Collision behavior.
- Player movement.
- Existing navigation.
- Camera behavior.
- Position restoration.

Tidak ada perubahan pada business logic aplikasi.

## 2. Building Inventory

### BLD-001 — Question Hall

**Route:** `/browse`  
**Priority:** P0  
**Position:** North of Central Plaza

**Visual Identity**

Question Hall merupakan bangunan akademik utama dan landmark paling dominan di Academy.

Design requirements:
- Bangunan paling besar dibandingkan dua bangunan lainnya.
- Gaya fantasy academic hall.
- Atap biru kerajaan atau navy.
- Dinding batu krem atau beige.
- Pintu utama ganda.
- Jendela simetris.
- Emblem buku atau simbol akademik.
- Ornamen emas secukupnya.
- Entrance terlihat jelas dari arah selatan.

**Visual Hierarchy**

Question Hall harus mudah dikenali sebagai bangunan utama meskipun pengguna melihatnya dari kejauhan.

**Interaction**

Saat pemain mendekati entrance:

`E — Enter Question Hall`

Saat diaktifkan, aplikasi membuka `/browse`.

### BLD-002 — Profile Center

**Route:** `/profile`  
**Priority:** P0  
**Position:** West of Central Plaza

**Visual Identity**

Profile Center merepresentasikan ruang administrasi dan identitas pengguna.

Design requirements:
- Ukuran medium.
- Gaya cottage akademik.
- Atap terracotta / orange.
- Dinding krem.
- Pintu tunggal.
- Jendela dengan cahaya hangat.
- Emblem profil atau identitas.
- Pot tanaman di sekitar entrance.
- Bentuk bangunan sederhana dan mudah dikenali.

**Interaction**

`E — Enter Profile Center`

Saat diaktifkan, aplikasi membuka `/profile`.

### BLD-003 — Dormitory

**Route:** `/home`  
**Priority:** P0  
**Position:** East of Central Plaza

**Visual Identity**

Dormitory merupakan bangunan tempat tinggal dengan suasana hangat dan nyaman.

Design requirements:
- Ukuran medium.
- Gaya student cottage.
- Atap ungu atau plum.
- Dinding warm beige.
- Pintu tunggal.
- Beberapa jendela kecil.
- Emblem tempat tidur atau rumah.
- Dekorasi bunga, chimney, atau tanaman rambat.
- Suasana homey.

**Interaction**

`E — Enter Dormitory`

Saat diaktifkan, aplikasi membuka `/home`.

---

## 3. Shared Art Direction

Ketiga bangunan harus memiliki kesamaan:

- Perspektif top-down 3/4, sesuai visual game.
- Pixel size dan tingkat detail yang konsisten.
- Arah pencahayaan dari kiri atas.
- Outline dan shadow yang konsisten.
- Palet warna yang harmonis dengan terrain.
- Tidak menggunakan blur atau smooth anti-aliasing.
- Struktur pintu dan jendela dengan proporsi yang masuk akal.
- Bangunan terlihat jelas pada zoom aktual aplikasi.

**Important:** Jangan membuat tiga bangunan dengan style yang berbeda-beda.

## 4. Technical Asset Requirements

### File Format

- PNG RGBA.
- Transparent background.
- Lossless export.
- Nearest-neighbor rendering.
- Tidak mengandung label atau teks yang menyatu dengan artwork.
- Source asset disimpan terpisah dari aset runtime.

### Asset Composition

Idealnya setiap gedung dapat dipisahkan menjadi:

1. Building body.
2. Roof / upper overlay.
3. Door.
4. Optional foreground decoration.
5. Optional door interaction animation.

Namun, pemisahan hanya dilakukan apabila diperlukan untuk depth sorting dan animasi. Tidak perlu memecah aset secara berlebihan.

### Coordinate Alignment

- Building sprite menggunakan origin yang konsisten.
- Entrance visual diselaraskan dengan interaction zone existing.
- Bounding box dan collision footprint didokumentasikan.
- Visual footprint tidak boleh mengubah jalur navigasi tanpa persetujuan.
- Ukuran final mengikuti footprint dan koordinat graybox aktual.

### Scaling

- Jangan memaksakan aset 32 × 32 px untuk satu gedung.
- Ukuran sprite gedung boleh mencakup banyak tile.
- Pertahankan rasio dan perspektif artwork.
- Hindari fractional scaling jika memungkinkan.
- Evaluasi rendering pada zoom aplikasi yang digunakan.

---

## 5. Implementation Constraints

AI Developer harus:

1. Menginspeksi koordinat building existing.
2. Mengukur building footprint dan collision area.
3. Membuat atau memproses asset bangunan sesuai dimensi.
4. Mengintegrasikan artwork tanpa mengubah movement dan route.
5. Mempertahankan entrance interaction zone.
6. Memastikan sprite tidak menutupi prompt atau UI penting.
7. Mengatur depth sorting yang benar.
8. Menambahkan asset loading dan fallback.
9. Melakukan regression testing pada interaksi ketiga bangunan.

**Jangan mengubah world layout hanya untuk menyesuaikan aset gambar.**

Jika artwork tidak cocok dengan footprint existing, laporkan mismatch dan berikan opsi penyesuaian.

---

## 6. Visual Review Criteria

### VR-001 — Art Style Consistency

Ketiga bangunan terlihat berasal dari dunia yang sama.

### VR-002 — Pixel Art Quality

Tidak terdapat blur, anti-aliasing tidak disengaja, atau pixel scaling yang tidak konsisten.

### VR-003 — Architectural Readability

Bangunan dapat dibedakan melalui bentuk, warna atap, dan emblem.

### VR-004 — Scale & Proportion

Ukuran bangunan terasa sesuai dengan ukuran karakter dan lingkungan.

### VR-005 — Terrain Compatibility

Warna, shading, dan detail bangunan harmonis dengan grass, pathway, dan plaza.

### VR-006 — Entrance Visibility

Pintu setiap bangunan mudah ditemukan oleh pemain.

### VR-007 — Depth & Occlusion

Karakter dapat berjalan di depan bangunan tanpa layering yang salah.

### VR-008 — Functional Integrity

Collision, interaksi, dan routing tetap berjalan.

---

## 7. Acceptance Criteria

### Visual

- [ ] Tiga bangunan memiliki gaya pixel art yang konsisten.
- [ ] Question Hall menjadi landmark paling dominan.
- [ ] Profile Center mudah dibedakan dari Dormitory.
- [ ] Semua entrance terlihat jelas.
- [ ] Tidak ada background yang menempel pada sprite.
- [ ] Tidak ada blur atau anti-aliasing yang tidak disengaja.
- [ ] Bangunan selaras dengan terrain.

### Technical

- [ ] Ukuran file dan dimensi didokumentasikan.
- [ ] Sprite origin konsisten.
- [ ] Building footprint sesuai world.
- [ ] Collision tidak berubah.
- [ ] Depth sorting bekerja.
- [ ] Tidak ada visual gap saat rendering.
- [ ] Tidak ada frame loading yang hilang.

### Functional

- [ ] Question Hall → `/browse`.
- [ ] Profile Center → `/profile`.
- [ ] Dormitory → `/home`.
- [ ] Interaction prompt muncul dengan benar.
- [ ] Player dapat kembali ke Academy.
- [ ] Saved player position tetap valid.

---

## 8. Required Deliverables

### A. Asset Files

```text
assets/academy/buildings/
├── question_hall.png
├── profile_center.png
└── dormitory.png
```

Jika ada sprite tambahan:

```text
assets/academy/buildings/
├── overlays/
├── doors/
└── decorations/
```

### B. Documentation

- Asset metadata.
- Sprite dimensions.
- Anchor/origin definitions.
- Building footprint.
- Interaction position.
- Asset source information.
- Visual QA notes.

### C. Screenshots

Wajib menyediakan:

1. Full Academy map.
2. Close-up Question Hall.
3. Close-up Profile Center.
4. Close-up Dormitory.
5. Before/after comparison.
6. Screenshot karakter berada di depan pintu.

### D. Regression Report

Laporkan:
- Build result.
- Asset loading test.
- Collision regression.
- Navigation regression.
- Player state restoration.
- Visual issues yang masih tersisa.

---

## 9. Production Workflow

**Step 1 — Inspect**

Verifikasi struktur game dan footprint graybox.

**Step 2 — Concept Approval**

Buat tiga konsep bangunan dengan visual language konsisten.

**Step 3 — Asset Preparation**

Siapkan sprite transparan, koordinat origin, dan metadata.

**Step 4 — Integration**

Masukkan bangunan ke Academy World.

**Step 5 — QA**

Uji tampilan, collision, interaction, dan routing.

**Step 6 — Review**

Sajikan screenshot untuk review visual sebelum menyatakan aset final.

---

## 10. Definition of Done

Asset Pack 02 dinyatakan selesai apabila tiga bangunan sudah terintegrasi, memenuhi acceptance criteria visual dan teknis, serta tidak menyebabkan regresi gameplay.

**Status hasil yang diharapkan:** Integrated — Pending Visual Review.

Jangan menyatakan production-ready sebelum visual approval diberikan.

---

**End of Asset Pack 02 — Buildings Brief v0.1**