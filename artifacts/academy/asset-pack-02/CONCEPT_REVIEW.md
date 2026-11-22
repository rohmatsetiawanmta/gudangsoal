# Academy Asset Pack 02 — Buildings

Status: **Integrated — integration QA passed; runtime visual review pending**.
Konsep dan arah visual disetujui pengguna pada 22 November 2026 dengan syarat teknis. Integrasi dilakukan setelah skala, origin, collider, dan sumbu entrance divalidasi. Pack 03 dimulai setelah gate QA Pack 02 lulus. Artwork yang disetujui tidak dibuat ulang dan tidak diedit; PNG runtime merupakan salinan lossless sumber ImageGen.

## Konsep yang disetujui

- **Question Hall /browse**: hero hall, atap navy, cupola, batu krem, pintu ganda, emblem buku dan aksen emas.
- **Profile Center /profile**: cottage administrasi, atap terracotta, plaster/timber, emblem profil, dua pot entrance.
- **Dormitory /home**: cottage tempat tinggal, atap plum, timber hangat, emblem tempat tidur, chimney dan ivy.

Terrain Pack 01 tetap baseline yang disetujui. Tidak ada perubahan PNG tileset, map, maupun collision world.

## Source → render → collider

Koordinat dalam world pixel. Frame adalah canvas cache runtime yang transparan, **bukan dimensi asli PNG**. Sumber dipotong secara visual menggunakan `drawImage` tanpa mengubah file, di-resample dengan skala seragam sekali saat inisialisasi. Frame kemudian digambar 1:1 pada posisi integer dunia. Nearest-neighbor digunakan pada cache maupun renderer. Zoom normal tetap 1 atau 1,25 sesuai viewport existing.

| Bangunan | PNG sumber | Source crop x/y/w/h | Skala seragam | Render artwork w×h | Cache frame |
| --- | --- | --- | --- | --- | --- |
| Question Hall | 1595×986 | 12 / 19 / 1571 / 911 | 0,45478036 | 714,460×414,305 | 768×544 |
| Profile Center | 1536×1024 | 52 / 106 / 1432 / 855 | 0,46115288 | 660,371×394,286 | 672×480 |
| Dormitory | 1536×1024 | 41 / 105 / 1454 / 864 | 0,46217331 | 672×399,318 | 672×480 |

Fractional source resampling diperlukan oleh ukuran artwork yang disetujui. Ini dilakukan sekali; tidak ada resampling sumber berulang tiap frame. Cache memakai grid 32 px dan footer 32 px untuk tangga/bayangan. Detail sumber belum merupakan pixel art native yang seluruh cluster pixel-nya seragam. Alpha sumber juga mengandung nilai parsial; tidak diklaim binary-alpha/production-ready. Pemeriksaan runtime tidak menunjukkan background kotak yang menempel.

| Bangunan | Frame dunia x/y | Collider dunia x/y/w/h | Origin lokal | Pintu lokal | Interaksi dunia | Depth Y |
| --- | --- | --- | --- | --- | --- | --- |
| Question Hall | 896 / 32 | 928 / 160 / 704 / 384 | 384 / 512 | 400 / 512 | 1296 / 592 | 544 |
| Profile Center | 128 / 640 | 160 / 736 / 608 / 352 | 336 / 448 | 368 / 448 | 496 / 1136 | 1088 |
| Dormitory | 1760 / 640 | 1792 / 736 / 608 / 352 | 336 / 448 | 336 / 448 | 2096 / 1136 | 1088 |

Origin = pusat sisi depan collider. Pintu Question Hall +16 px dan Profile Center +32 px dari origin; Dormitory di tengah. Threshold pintu berada 48 px di utara titik interaksi, sama dengan graybox. Source landmark pintu diukur pada (798,914), (850,942), (768,952); transform memetakannya tepat ke threshold dunia. Landmark raster adalah perkiraan visual, bukan data pintu vektor; screenshot debug menjadi bukti pemeriksaannya.

Tidak perlu memindahkan bangunan atau collider untuk memusatkan pintu. Perkiraan pergeseran sisi alas fasad terhadap collider: Question Hall +15/+15 px; Profile Center −4,3/−7,3 px; Dormitory +0,8/−0,8 px. Collider tetap volume bangunan existing; massa atap/dekorasi boleh overhang. Tidak ada gap navigasi baru, dan mismatch minor ini tidak diselesaikan dengan mengedit artwork yang sudah disetujui.

## Integrasi dan fallback

- `src/features/academy/buildingLayout.json`: metadata alignment penuh.
- `buildings.js`: validasi alignment, PNG loading/abort, cache frame, debug overlay.
- `renderer.js`: sprite menggantikan graybox; depth tetap sisi depan collider.
- `game.js`: meneruskan aset dan menyediakan overview/debug opt-in untuk QA. Kebijakan kamera normal tetap.
- `AcademyPage.jsx`: preload paralel terrain/buildings dan tag Cozy Village.
- `public/assets/academy/buildings/{question_hall,profile_center,dormitory}.png`: tiga file RGBA sumber yang disetujui, 1.383.272 / 1.635.575 / 1.821.243 byte.
- Jika PNG hilang atau salah dimensi, bangunan tersebut kembali ke graybox; movement dan route tetap berfungsi. Abort membebaskan callback image.

Seluruh bangunan cukup satu sprite: pemain tidak dapat masuk volume collider, dan urutan Y menempatkan pemain di depan fasad saat di selatan, serta di belakang atap saat di utara. Tidak ditambahkan overlay/animasi pintu yang belum diperlukan.

## Debug dan screenshot

Buka `/academy?academyDebug=1`; tambah `&academyOverview=1` untuk full world. Overlay: putih putus-putus = cache frame; oranye = collider; silang kuning = origin; cyan = sumbu threshold/pintu ke entrance dan radius interaksi 64 px. Query hanya mengubah visual QA, bukan world/state/interaksi.

Bukti aktual runtime game (akun simulasi lokal):

- `runtime-full-map.jpg`, `runtime-full-map-debug.jpg`.
- `runtime-question-hall-entrance.jpg` dan `runtime-question-hall-debug.jpg`.
- `runtime-profile-center-entrance.jpg` dan `runtime-profile-center-debug.jpg`.
- `runtime-dormitory-entrance.jpg` dan `runtime-dormitory-debug.jpg`.
- `before-graybox.jpg` adalah renderer existing sebelum integrasi; `concept-placement.jpg` dan `review-page.jpg` adalah komposit tahap konsep, **bukan bukti integrasi runtime**.

Halaman konsep bisa dibuka dengan `npm run dev`, kemudian `/artifacts/academy/asset-pack-02/review.html`. Source dan prompt/provenance tersimpan di `source/`. Brief disalin ke `brief-v0.1.md`; instruksi pengguna tentang review bertahap menjadi batas tahap produksi.

## QA

21 tes Academy lulus: jalur spawn ke semua entrance/NPC melalui movement engine, collider dan world edges, anti-tunnelling, route dan jangkauan interaksi, kamera, state restore, pause/cleanup input, tileset, alignment, loader fallback/abort, nearest-neighbor cache, dan urutan depan/belakang. Build lulus (peringatan ukuran bundle existing), lint file Academy yang berubah lulus.

Browser: tombol **E** pada canvas membuka `/browse`, `/profile`, `/home`; kembali melalui link Academy memulihkan posisi persis (1296,604), (496,1148), (2096,1148). Posisi awal QA disiapkan sebagai saved-state fixture, bukan diklaim berjalan manual dari spawn. Konten bank soal tidak diuji: endpoint konten memang tidak dimock. Tidak ada penulisan ke backend asli. Laporan dan checksum: `qa-report.json`.

Sisa visual: detail raster sumber lebih rapat daripada terrain, halo alpha tipis perlu dipantau pada background berbeda, paving masih repetitif sesuai review terrain. Artwork tetap dipertahankan. Tidak ada klaim siap produksi sebelum review screenshot runtime ini.
