# Academy Asset Pack 01 — Terrain

Status: **approved with minor-to-medium visual refinements** (review pengguna,
22 November 2026). Terrain disimpan sebagai baseline untuk Asset Pack 02.
Refinement plaza, repetisi paving, transisi material, serta nuansa cozy dilakukan
setelah bangunan terpasang. Rekaman persetujuan: `artifacts/academy/asset-pack-01/approval.json`.
Aset dibuat secara programmatic dengan Python/Pillow dan seed tetap;
persetujuan baseline tidak menyatakan seluruh kombinasi visual sudah siap produksi.

Referensi gaya: `academy-world-mockup.png` dan Asset Inventory v0.1 di handoff.
Mockup hanya menjadi referensi warna/nuansa; tidak dipotong menjadi tile.

## Hasil inspeksi dan invariannya

- Sebelum integrasi: React + Canvas 2D; ground berupa rectangle dan lingkaran,
  bukan tilemap Tiled atau scene Phaser. Ground di-cache sekali pada canvas
  2560×1920; bangunan, pohon, fountain, NPC dan pemain memakai urutan depth Y.
- Grid existing **32×32 px**. Dunia tetap **80×60 tile = 2560×1920 px**.
- Sumber `world.js` tidak diubah: 31 collider, batas dunia, kecepatan 180 px/detik,
  posisi spawn, pintu, serta ketiga route tetap sama. Bukti checksum ada di
  `artifacts/academy/asset-pack-01/world-invariants.json`.
- Setelah integrasi: hanya ground menjadi tilemap JSON visual. Layer baru tidak
  dipakai sebagai collision, dan tidak menambah backend atau dependency game.
- Bangunan, karakter, pohon, pond, fountain, gate dan props masih graybox.

## Daftar aset

Semua ID tile di tabel adalah **local ID 0-based**. Map memakai GID = ID + 1;
angka 0 pada data layer berarti kosong.

| ID kebutuhan | Isi | Local ID | Banyaknya |
| --- | --- | --- | --- |
| TER-001 | Base grass | 0 | 1 |
| TER-002 | Variasi grass | 1–7 | 7 |
| TER-003 | Isi pathway batu hangat | 8–15 | 8 |
| TER-004 | Tepi/ujung/sudut luar pathway, semua mask kardinal | 16–31 | 16 |
| TER-004 | Overlay sudut dalam pathway NW/NE/SW/SE | 56–59 | 4 |
| TER-005 | Variasi flooring plaza beige/gray | 32–39 | 8 |
| TER-006 | Tepi/sudut luar plaza, semua mask kardinal | 40–55 | 16 |
| TER-006 | Overlay sudut dalam plaza NW/NE/SW/SE | 60–63 | 4 |
| TER-007 | Transisi tambahan antarmaterial/biome | Ditunda, P1 | — |
| TER-008 | Detail tanah tambahan | Ditunda, P1 | — |

`public/assets/academy/tilesets/terrain.png` adalah PNG **RGBA 256×256 px**,
8 kolom × 8 baris, 64 tile, margin 0, spacing 0. Ukuran tiap tile 32×32 px,
tanpa resampling. Palet berisi 41 kombinasi RGBA termasuk piksel transparan.
Alpha hanya 0 atau 255. Fill grass/path/plaza sepenuhnya opaque; alpha pada
edge/corner memang disengaja untuk menampilkan grass di bawahnya.

`terrain.tsj` berisi metadata tileset Tiled, nama material, jenis tile,
asset ID, serta neighbor mask. Mask memakai N=1, E=2, S=4, W=8. Mask 15
berarti terhubung ke empat arah. Sudut dalam memakai overlay terpisah.

## Map dan layer

File: `public/assets/academy/maps/academy_plaza_terrain.json`.
Format Tiled JSON orthogonal, finite, right-down, tile 32px, first GID 1.
Metadata tileset disematkan agar atlas dan JSON mudah dikonsumsi bersama.

Urutan render:

1. `Ground`: grass penuh untuk seluruh 4800 sel.
2. `Paths`: pathway dan ujung jalan di ketiga pintu.
3. `PlazaFloor`: paving plaza, menggantikan lingkaran berwarna rata.
4. `CornersNW`, `CornersNE`, `CornersSW`, `CornersSE`: overlay sudut dalam.
5. Placeholder pond, batas dunia, spawn marker dan penanda pintu existing.
6. Bangunan, props, NPC dan pemain existing, tetap diurutkan berdasarkan depth Y.

Koordinat jalan dan pusat/radius plaza diturunkan dari graybox sebelumnya.
Batas visual lingkaran di-snap berdasarkan pusat sel 32px, sehingga siluet plaza
menjadi bertangga dan dapat berbeda hingga sekitar setengah tile dari lingkaran
Canvas lama. Tepi paving juga memiliki inset visual 3px. Ini bukan perubahan
collision atau posisi interaksi; grass tetap bisa dilalui seperti sebelumnya.

## Loading dan pemakaian

`loadTerrain()` mengambil JSON dan PNG ketika Academy dibuka. Dimensi, nama
layer, GID, dan coverage grass divalidasi sebelum engine dibuat. Load dapat
dibatalkan saat keluar; error memakai layar retry/navigasi existing. URL asset
memakai revision `01.1`; revisi ini perlu dinaikkan saat mengganti isi pack yang
sudah pernah dipublikasikan.

Tile disalin pada koordinat integer dan ukuran native 32×32 ke ground cache.
`imageSmoothingEnabled = false` dipakai saat menyusun ground dan saat render
game. PNG/JSON tetap berada di direktori Academy yang dikecualikan dari PWA
precache. Halaman standar tidak memuatnya secara otomatis.

Untuk Tiled, buka `terrain.tsj` atau `academy_plaza_terrain.json`. Contoh alur
pemakaian Phaser berikut disiapkan untuk integrasi mendatang; runtime proyek
sekarang tetap Canvas, dan pack belum dibuka langsung di aplikasi Tiled/Phaser.

```js
// Scene.preload
this.load.image("terrain", "/assets/academy/tilesets/terrain.png");
this.load.tilemapTiledJSON("academy-terrain", "/assets/academy/maps/academy_plaza_terrain.json");

// Scene.create — gunakan nearest-neighbor / pixelArt pada konfigurasi game.
const map = this.make.tilemap({ key: "academy-terrain" });
const tiles = map.addTilesetImage("academy-terrain-01", "terrain");
for (const name of ["Ground", "Paths", "PlazaFloor", "CornersNW", "CornersNE", "CornersSW", "CornersSE"]) {
  map.createLayer(name, tiles, 0, 0);
}
```

Rujukan format/API: [Tiled JSON](https://doc.mapeditor.org/en/stable/reference/json-map-format/),
[Phaser tilemap](https://docs.phaser.io/api-documentation/3.90.0/class/tilemaps-tilemap),
[Phaser loader](https://phaser.io/oss/docs/phaser/concepts/loader).
Jangan mengaktifkan collision pada layer visual ini sebagai pengganti collider
existing. Atlas tanpa gutter ini membutuhkan nearest filtering, khususnya jika
kelak dipakai pada renderer WebGL.

## Generate dan verifikasi

Tooling pembuatan aset membutuhkan Python 3 + Pillow (diuji dengan Pillow 11.3).
Menjalankan aplikasi dan build Vite tidak membutuhkan Pillow; PNG/JSON yang
dihasilkan sudah disimpan di repository.

```sh
npm run assets:academy        # PNG, TSJ, map, serta lembar review
npm run check:academy-assets  # bandingkan dengan generator; cek tepi dan alpha
npm run test:academy          # regression movement/routing + loader/map/atlas
npm run build
```

Pemeriksaan yang sudah dilakukan:

- 384 perbandingan tepi horizontal/vertikal antarvarian tile fill.
- 1024 perbandingan core edge paving yang terhubung; 32 mask kardinal.
- Alpha biner pada atlas, dan alpha penuh 255 pada komposit seluruh dunia.
- Map visual konsisten dengan generator dan koordinat existing.
- 18 tes otomatis, termasuk movement, collision, camera, state, asset failure,
  abort cleanup, ukuran atlas, grid render, serta route server.
- Browser: ketiga pintu dicapai dengan berjalan dan E membuka `/browse`,
  `/profile`, `/home`; kembali ke Academy memulihkan posisi.
- PNG hilang menampilkan error. Mengembalikan aset memulihkan game melalui
  reload development; recovery lewat klik tombol retry belum diverifikasi
  terpisah di browser karena Vite lebih dulu melakukan reload otomatis.
- Screenshot before/after memakai viewport **1440×900** dan posisi identik
  **(1296, 1255.012)**. Akun/API browser adalah simulasi lokal, bukan akun asli.

## Bukti review dan batasan visual

Di `artifacts/academy/asset-pack-01/`:

- `before.jpg`, `after.jpg`: screenshot langsung dari game.
- `comparison.json`: ukuran viewport dan koordinat pembanding.
- `repeat-review.png`: mosaic 8×8 per material pada skala nearest 2×.
- `tileset-review.png`: seluruh tile dengan gutter khusus lembar review.
- `terrain-map-review.png`: komposit terrain penuh tanpa props/bangunan.
- `tile-qa.json`, `browser-qa.json`, `world-invariants.json`: hasil pemeriksaan.

Sisa pekerjaan untuk review visual:

- Siluet plaza masih mengikuti tangga grid 32px; kelengkungan dan curb perlu
  dinilai secara visual sebelum dianggap final.
- Pola paving masih cukup teratur; variasi artistik/moss/wear belum dibuat.
- Peralihan warna pathway–plaza masih langsung; transisi tambahan TER-007
  dan detail TER-008 ditunda.
- Bangunan, pohon, pond, fountain, marker dan karakter masih graybox sehingga
  warnanya belum sepenuhnya menyatu dengan terrain.
- Zoom desktop existing 1.25× tetap dipertahankan; nearest filtering mencegah
  blur interpolasi, tetapi ketebalan pixel bisa tidak seragam pada skala pecahan.
- Format ekspor dan load di Canvas telah diuji; import native Tiled/Phaser dan
  WebGL belum diuji. Tidak ada klaim production-ready lintas engine.

Bangunan/karakter/dekorasi final menunggu review terrain ini.

## Perubahan file

| File | Perubahan |
| --- | --- |
| `public/assets/academy/tilesets/terrain.png` | Atlas pixel art baru |
| `public/assets/academy/tilesets/terrain.tsj` | Metadata tileset baru |
| `public/assets/academy/maps/academy_plaza_terrain.json` | Map visual Tiled JSON baru |
| `scripts/build_academy_terrain.py` | Generator deterministik dan pemeriksaan piksel |
| `scripts/build-academy-terrain-map.mjs` | Generator map dari layout existing |
| `src/features/academy/terrainLayout.js` | Layout visual, mask tepi dan sudut |
| `src/features/academy/terrain.js` | Loader, validasi dan renderer tile |
| `src/features/academy/renderer.js` | Ground membaca tileset; props tetap placeholder |
| `src/features/academy/game.js` | Menerima terrain yang sudah dimuat; movement tetap |
| `src/features/academy/AcademyPage.jsx` | Async asset loading dan pembatalan saat keluar |
| `tests/academy-terrain.test.mjs` | Tes format/loader/map/grid baru |
| `tests/academy.test.mjs` | Fixture terrain untuk tes input existing |
| `package.json` | Perintah asset pipeline dan tes Academy |
| `README.md`, `ASSET_PACK_01.md` di folder Academy | Catatan integrasi dan review |
| `artifacts/academy/asset-pack-01/*` | Screenshot dan laporan QA |
