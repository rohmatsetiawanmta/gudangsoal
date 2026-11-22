# Academy Asset Pack 03 — Environment & Decoration

**Status: Integrated — QA passed, pending visual review.**
Pack 02 diselesaikan lebih dahulu: artwork disetujui, alignment divalidasi, tiga route dan return position diuji pada runtime. Baru setelah gate itu lulus, Pack 03 diproduksi. Tidak ada bangunan/fitur gameplay baru.

## Hasil

Dua varian oak menggantikan 20 pohon placeholder pada koordinat semula. Flowering bushes, hedge perimeter, dan flowerbeds membentuk aksen taman di sekitar bangunan, plaza, serta koridor selatan. Fountain dua tingkat, empat lampu taman, tiga signpost, serta shoreline pada dua pond melengkapi komposisi. Karakter, bangku, dan struktur gerbang masih placeholder.

Menu **Academy** pada navbar desktop/mobile disembunyikan sesuai permintaan pengguna. `/academy` tetap tersedia langsung dan tetap memerlukan login. Tidak ada perubahan pada authentication, route tujuan, spawn, interaction zones atau movement speed.

## Inventory dan aset

PNG RGBA transparan: `public/assets/academy/environment/environment.png`, **1254×1254 px**, atlas dengan sembilan frame terpisah. Source asli dan prompt tersimpan di `source/`; tidak ada teks/label pada artwork. Atlas menggunakan crop metadata eksplisit, bukan asumsi ukuran cell dari preview gambar.

| ID | Frame | Canvas runtime | Origin lokal | Penggunaan |
| --- | --- | --- | --- | --- |
| ENV-001 | oak_green | 128×160 | 64,152 | Pohon hijau pada tree anchor existing |
| ENV-002 | oak_olive | 128×160 | 64,152 | Variasi olive/golden pada setiap pohon keempat |
| ENV-003 | flowering_bush | 64×40 | 32,36 | Ground cover rendah, walk-through |
| ENV-004 | hedge | 96×40 | 48,36 | Perimeter utara/selatan, gerbang tetap terbuka |
| ENV-005 | flowerbed | 96×40 | 48,36 | Aksen bangunan, plaza dan jalur selatan |
| ENV-006 | fountain | 160×160 | 80,152 | Anchor (1296,1176), depth 1168 |
| ENV-007 | lamp | 32×96 | 16,88 | Dua ujung bangku, dua pilar gerbang |
| ENV-008 | signpost | 48×72 | 24,64 | Tiga tree collider existing |
| ENV-009 | pond_patch | 128×128 | 64,120 | Sumber nine-slice shoreline; bukan ukuran pond dunia |
| WAT-001 | native water cells | 32×32 | ground | Base warna identik dan highlight pixel deterministik |

Semua sprite mempertahankan aspect ratio sumber dan di-resample sekali ke cache canvas dengan nearest-neighbor. Cache kemudian digambar pada koordinat world integer. Ukuran cluster pada zoom runtime diperiksa bersama fasad Pack 02; tidak diklaim seluruh artwork hasil ImageGen merupakan sprite native dengan pixel density yang persis seragam.

**Water refinement yang diuji:** crop air sumber menghasilkan repetisi dan sambungan shading yang terlihat saat diulang. Artwork atlas tetap disimpan utuh; renderer memakai sel air Canvas native 32 px dengan base warna yang identik pada perbatasan dan highlight tipis. Shoreline tetap memakai corner dan edge dari PNG, lebar 16 world px, di atas fill air penuh. Hasil akhirnya diperiksa pada `pond-render.jpg`; tidak ada gap transparan, namun repetisi highlight/shoreline masih bisa dipoles pada review lanjutan. Tidak diklaim semua kombinasi seamless atau production-ready.

## Metadata dan collision

`environment-metadata.json` memuat source rectangle, ukuran source/canvas, skala uniform, origin, posisi seluruh pohon/tanaman/props/pond, depth serta ID collider yang dipakai.

- Seluruh **31 collider** dan file `world.js` identik dengan baseline (SHA-256 disimpan di `invariants.json`).
- Ketiga PNG bangunan juga identik dengan artwork yang disetujui; posisi bangunan tidak berubah.
- Terrain PNG, TSJ, dan map JSON Pack 01 identik dengan baseline.
- Tanaman rendah adalah ground cover tanpa collision tambahan. Titik tanam berjarak >96 px dari seluruh entrance.
- Lampu/signpost bertumpu pada collider bangku, gerbang, atau tree existing. Tidak ada collider props baru.
- Shoreline divisualkan di dalam rectangle pond existing; collision tetap rectangle lama, termasuk area corner pond yang terlihat sedikit membulat.
- Fountain memiliki overhang visual kecil di luar footprint lama, dengan front-edge depth tetap 1168. Pemain di selatan digambar di depan fountain.
- Hedge selatan menyisakan celah gerbang dan koridor utama.

## Rendering dan performa

Canvas 2D existing tetap dipakai. Ground cover, pond, shoreline dan air masuk ke background canvas cache dunia yang sudah ada. Sprite environment di-cache satu kali; loop frame hanya menggambar frame pohon/props dan melakukan depth sort existing. Tidak ada shader, animasi air tambahan, library game, atau query backend baru. Background tidak digambar ulang per frame.

PNG Academy dan lazy chunk tetap dikecualikan dari PWA precache, sehingga pengunjung mode biasa tidak mengunduh semua artwork Academy. Jika atlas gagal dimuat/salah ukuran, renderer kembali ke pohon/fountain/pond graybox; navigation tetap berfungsi. Tidak ada klaim benchmark FPS lintas perangkat; pengujian visual dilakukan pada browser lokal.

## QA

- **25/25 tes Academy lulus**, termasuk reachability spawn→semua pintu/NPC, anti-tunnelling, seluruh obstacle, camera bounds, input pause/cleanup, routing, session restore, terrain, asset alignment/loader/abort, depth sorting, crop/frame bounds, clearance entrance/gerbang dan shoreline non-square.
- Build production lulus. Peringatan ukuran bundle existing masih ada; bukan kegagalan build.
- ESLint file Academy yang berubah dan Navbar lulus.
- Runtime browser: input keyboard bertahan 3 detik ke utara berhenti pada y556 di depan collider Question Hall; 0,5 detik ke selatan bergerak 90 px, dari y556 ke y646. Bukti `runtime-movement.json`; pengujian memakai fixture UI lokal yang mengirim keyboard events ke game asli, bukan engine alternatif.
- Pack 02: tombol E membuka `/browse`, `/profile`, `/home`; return melalui navbar sebelumnya memulihkan koordinat persis. Navbar Academy kemudian disembunyikan sesuai permintaan terbaru. Tes route/state tetap lulus sesudah Pack 03.
- Akun/API QA disimulasikan lokal, tidak ada penulisan ke backend asli. Konten bank soal/aktivitas pengguna bukan cakupan mock ini.

Screenshot aktual runtime:

1. `before-full-map.jpg` — Pack 02, sebelum environment.
2. `after-full-map.jpg` — Pack 03.
3. `central-plaza.jpg` — fountain, lampu, flowerbeds, pemain dan NPC.
4. `pond-render.jpg` — shoreline, air, pohon dan signpost.
5. `debug-overview.jpg` — semua collider magenta, ground-cover bounds hijau, serta overlay alignment bangunan.

Overview memakai opsi render `/academy?academyOverview=1`; kamera normal tetap existing. Tambahkan `&academyDebug=1` untuk overlay. Screenshot bukan komposit konsep.

## Perubahan file

- `environment.js`, `environmentLayout.json`: loading, cache, inventory dan placement visual.
- `renderer.js`: environment ground dan props dengan depth sorting.
- `game.js`, `AcademyPage.jsx`: meneruskan environment yang di-preload; tag Cozy Village v0.3.
- `public/assets/academy/environment/environment.png`: atlas transparan.
- `tests/academy-environment.test.mjs`: regression gate environment.
- `Navbar.jsx`: menyembunyikan entry Academy pada menu bersama desktop/mobile.
- `README.md`: dokumentasi status dan QA views.

Sisa visual: paving/plaza masih repetitif, beberapa alpha edge sumber bersifat parsial, bangku/gerbang/karakter masih graybox, dan ground cover masih tahap awal penataan taman. Perubahan terrain baseline tidak dilakukan pada paket ini. Artwork bangunan yang disetujui dipertahankan.

## Deployment

Frontend sudah dideploy ke **https://matrohmatmath.com/academy** pada 22 November 2026. Backup rilis sebelumnya tersedia di server; API dan database tidak diubah. Sebelas pemeriksaan HTTP lulus. CDN mengubah encoding PNG, namun dimensi dan seluruh pixel RGBA (termasuk alpha) sama persis dengan file lokal. Browser live memverifikasi guest redirect ke login dan tidak adanya link Academy di navbar. Gameplay dengan akun produksi belum diuji; bukti movement, collision, interaksi dan restore berasal dari runtime lokal dengan akun simulasi. Rincian: `../deployment-report.json` dan `../live-browser-check.json`.
