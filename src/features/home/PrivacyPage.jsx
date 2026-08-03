import { Shield } from "lucide-react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";

const SUMMARY = [
  { bold: "Data yang dikumpulkan:", text: " nama, email, dan aktivitas belajar kamu di platform." },
  { bold: "Untuk apa:", text: " menjalankan fitur XP, progress, dan leaderboard. Bukan untuk iklan." },
  { bold: "Dibagikan ke siapa:", text: " penyedia layanan teknis saja. Tidak dijual ke pihak ketiga." },
  { bold: "Hak kamu:", text: " akses, koreksi, dan hapus data kapan saja via email." },
];

const SECTIONS = [
  {
    num: "1",
    title: "Ketentuan Umum",
    prose: [
      "Kebijakan Privasi ini menjelaskan bagaimana Gudang Soal (\"Platform\") mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi pengguna. Kebijakan ini berlaku bagi seluruh pengguna yang mengakses platform melalui situs web gudangsoal.com.",
      "Kami berkomitmen mematuhi Undang-Undang No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP) beserta peraturan pelaksanaannya yang berlaku di Indonesia.",
    ],
  },
  {
    num: "2",
    title: "Data Pribadi yang Kami Kumpulkan",
    intro: "Kami mengumpulkan data yang kamu berikan secara langsung, data yang dihasilkan otomatis saat menggunakan platform, serta data dari layanan pihak ketiga:",
    items: [
      { bold: "Data akun:", text: " nama lengkap dan alamat email yang kamu daftarkan." },
      { bold: "Data aktivitas belajar:", text: " soal yang dikerjakan, skor, jawaban, XP yang diperoleh, streak harian, dan progress quiz." },
      { bold: "Data teknis (otomatis):", text: " perangkat, browser, sistem operasi, dan waktu akses. Dikumpulkan secara anonim melalui Google Analytics 4." },
      { bold: "Data feedback:", text: " pertanyaan, laporan, dan permintaan soal yang kamu kirimkan secara sukarela." },
      { bold: "Data cookies:", text: " preferensi sesi dan identifikasi sementara untuk menjaga kamu tetap masuk ke akun." },
    ],
  },
  {
    num: "3",
    title: "Tujuan Penggunaan Data",
    intro: "Data pribadi yang kami kumpulkan digunakan semata-mata untuk tujuan berikut:",
    items: [
      { bold: "Operasional platform:", text: " menjalankan fitur XP, streak, progress belajar, dan leaderboard." },
      { bold: "Autentikasi:", text: " memverifikasi identitas pengguna dan menjaga keamanan akun." },
      { bold: "Komunikasi layanan:", text: " mengirimkan email verifikasi akun, notifikasi penting, dan pembaruan layanan." },
      { bold: "Peningkatan produk:", text: " menganalisis pola penggunaan secara agregat untuk memperbaiki fitur dan pengalaman pengguna." },
      { bold: "Respons permintaan:", text: " menanggapi feedback, laporan, dan permintaan soal yang masuk." },
    ],
  },
  {
    num: "4",
    title: "Pengungkapan dan Berbagi Data",
    intro: "Kami tidak menjual, menyewakan, atau memperdagangkan data pribadimu dalam kondisi apapun. Data hanya dibagikan dalam situasi terbatas berikut:",
    items: [
      { bold: "Penyedia layanan teknis:", text: " hosting server dan infrastruktur yang diperlukan untuk menjalankan platform, terikat perjanjian kerahasiaan." },
      { bold: "Google Analytics:", text: " data penggunaan anonim yang tidak mengidentifikasi individu secara langsung." },
      { bold: "Kewajiban hukum:", text: " jika diwajibkan oleh peraturan perundang-undangan atau perintah pengadilan yang sah di Indonesia." },
      { bold: "Perlindungan keamanan:", text: " jika diperlukan untuk melindungi keselamatan pengguna, platform, atau pihak lain dari tindakan yang melanggar hukum." },
    ],
  },
  {
    num: "5",
    title: "Penyimpanan Data",
    intro: "Data pribadimu kami simpan selama akun aktif dan dibutuhkan untuk keperluan layanan. Prinsip penyimpanan yang kami terapkan:",
    items: [
      { bold: "Lokasi penyimpanan:", text: " data disimpan di server dengan standar keamanan yang memadai." },
      { bold: "Durasi penyimpanan:", text: " data akun dan aktivitas belajar disimpan selama akun aktif, dan akan dihapus dalam 30 hari sejak permintaan penghapusan diterima." },
      { bold: "Data analytics:", text: " data anonim dari Google Analytics disimpan sesuai kebijakan penyimpanan Google (default 14 bulan)." },
    ],
  },
  {
    num: "6",
    title: "Penghapusan dan Pemusnahan Data",
    intro: "Sesuai UU PDP No. 27/2022, kami membedakan dua proses yang berbeda dalam menangani data yang diminta untuk dihapus:",
    items: [
      { bold: "Penghapusan:", text: " data dihapus dari sistem aktif dalam 30 hari sejak permintaan diterima. Selama masa ini, data tidak dapat diakses oleh siapapun." },
      { bold: "Pemusnahan:", text: " setelah masa retensi berakhir atau atas permintaan eksplisit, data dihapus secara permanen dari seluruh sistem termasuk cadangan (backup) sehingga tidak dapat dipulihkan kembali." },
    ],
  },
  {
    num: "7",
    title: "Keamanan Data",
    intro: "Kami menerapkan langkah-langkah teknis dan organisasi untuk melindungi data pribadimu dari akses tidak sah, kehilangan, atau penyalahgunaan:",
    items: [
      { bold: "Enkripsi password:", text: " kata sandi disimpan dalam bentuk hashed dan tidak dapat dibaca oleh siapapun, termasuk tim kami." },
      { bold: "Koneksi HTTPS:", text: " seluruh komunikasi antara browser dan server dienkripsi menggunakan TLS." },
      { bold: "Akses terbatas:", text: " hanya personel yang berwenang yang dapat mengakses data pengguna, dengan catatan akses yang terpantau." },
      { bold: "Notifikasi pelanggaran:", text: " jika terjadi kebocoran data yang berdampak pada data pribadimu, kami akan menginformasikan kepada kamu dalam waktu 14 hari kerja sejak insiden terdeteksi." },
    ],
  },
  {
    num: "8",
    title: "Kebijakan Cookies dan Analitik",
    intro: "Platform menggunakan cookies dan teknologi pelacakan terbatas untuk keperluan fungsional dan analitik:",
    items: [
      { bold: "Cookies sesi:", text: " digunakan untuk menjaga status login dan preferensi dasar pengguna selama sesi aktif." },
      { bold: "Google Analytics 4:", text: " mengumpulkan data penggunaan anonim seperti halaman yang dikunjungi, durasi kunjungan, dan jenis perangkat. Data ini tidak mengidentifikasi individu secara langsung." },
      { bold: "Opt-out:", text: " kamu dapat menonaktifkan pelacakan Google Analytics melalui ekstensi browser resmi di tools.google.com/dlpage/gaoptout." },
    ],
  },
  {
    num: "9",
    title: "Hak Kamu sebagai Pengguna",
    intro: "Sesuai UU PDP No. 27/2022, kamu memiliki hak-hak berikut atas data pribadimu:",
    items: [
      { bold: "Hak akses:", text: " meminta salinan data pribadi yang kami simpan tentang kamu." },
      { bold: "Hak koreksi:", text: " meminta perbaikan atas data yang tidak akurat atau tidak lengkap." },
      { bold: "Hak penghapusan:", text: " meminta penghapusan dan pemusnahan data pribadimu dari sistem kami." },
      { bold: "Hak penarikan persetujuan:", text: " menarik kembali persetujuan penggunaan data kapan saja, tanpa mempengaruhi pemrosesan yang telah terjadi sebelumnya." },
      { bold: "Hak pembatasan pemrosesan:", text: " meminta kami membatasi cara penggunaan data pribadimu dalam kondisi tertentu." },
      { bold: "Hak portabilitas:", text: " meminta data pribadimu dalam format yang dapat dibaca mesin untuk dipindahkan ke layanan lain." },
    ],
  },
  {
    num: "10",
    title: "Perlindungan Data Pengguna di Bawah Umur",
    intro: "Gudang Soal digunakan oleh pelajar dari berbagai jenjang, termasuk yang berusia di bawah 18 tahun. Kami menerapkan perlindungan khusus:",
    items: [
      { bold: "Persetujuan orang tua:", text: " pengguna di bawah 18 tahun disarankan mendapatkan persetujuan orang tua atau wali sebelum mendaftar." },
      { bold: "Data minimal:", text: " kami hanya mengumpulkan data yang benar-benar diperlukan untuk menjalankan layanan pendidikan." },
      { bold: "Bebas iklan:", text: " platform tidak menampilkan iklan. Data pengguna tidak digunakan untuk profiling komersial atau pemasaran bertarget dalam kondisi apapun." },
      { bold: "Leaderboard anonim:", text: " fitur peringkat hanya menampilkan nama pengguna, bukan informasi pribadi lainnya." },
    ],
  },
  {
    num: "11",
    title: "Perubahan Kebijakan",
    prose: [
      "Kebijakan ini dapat diperbarui sewaktu-waktu untuk mencerminkan perubahan layanan, regulasi, atau praktik terbaik industri. Perubahan signifikan akan diumumkan melalui notifikasi di platform atau email setidaknya 7 hari sebelum berlaku.",
      "Tanggal \"Berlaku sejak\" di bagian atas halaman ini mencerminkan versi terkini yang berlaku.",
    ],
  },
];

function SectionCard({ section }) {
  return (
    <div style={{ background: "var(--gs-surface)", borderRadius: "14px", border: "1px solid var(--gs-border)", overflow: "hidden" }}>
      <div style={{
        padding: "14px 20px", borderBottom: "1px solid var(--gs-divider)",
        background: "linear-gradient(to right, var(--gs-surface-subtle), var(--gs-surface))",
        display: "flex", alignItems: "center", gap: "10px",
      }}>
        <span style={{
          fontSize: "11px", fontWeight: "800", color: "#e84c2b",
          background: "#fff3f0", borderRadius: "6px",
          padding: "2px 7px", flexShrink: 0,
        }}>
          {section.num}
        </span>
        <h2 style={{ fontSize: "13px", fontWeight: "700", color: "var(--gs-text)", margin: 0 }}>
          {section.title}
        </h2>
      </div>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {section.prose && section.prose.map((p, i) => (
          <p key={i} style={{ fontSize: "14px", color: "var(--gs-text-muted)", lineHeight: "1.7", margin: 0 }}>{p}</p>
        ))}
        {section.intro && (
          <p style={{ fontSize: "14px", color: "var(--gs-text-muted)", lineHeight: "1.7", margin: 0 }}>{section.intro}</p>
        )}
        {section.items && section.items.map((item, j) => (
          <div key={j} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <span style={{
              fontSize: "12px", fontWeight: "700", color: "#e84c2b",
              minWidth: "18px", paddingTop: "2px", flexShrink: 0,
            }}>
              {j + 1}.
            </span>
            <p style={{ fontSize: "14px", color: "var(--gs-text-muted)", lineHeight: "1.65", margin: 0 }}>
              <strong style={{ color: "var(--gs-text)", fontWeight: "600" }}>{item.bold}</strong>
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  const width = useWindowWidth();
  const isMobile = width <= 480;

  return (
    <div style={{ minHeight: "100vh", background: "var(--gs-bg)", display: "flex", flexDirection: "column" }}>
      <SEO
        title="Kebijakan Privasi"
        description="Kebijakan privasi Gudang Soal: informasi tentang data yang dikumpulkan, cara penggunaannya, hak pengguna, dan perlindungan data sesuai UU PDP No. 27/2022."
        url="/privacy"
      />
      <Navbar />

      <div style={{ flex: 1, maxWidth: "760px", margin: "0 auto", width: "100%", padding: isMobile ? "24px 16px" : "40px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "14px", background: "#fff3f0",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px",
          }}>
            <Shield size={24} color="#e84c2b" />
          </div>
          <h1 style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: "800", color: "var(--gs-text)", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
            Kebijakan Privasi
          </h1>
          <p style={{ fontSize: "13px", color: "var(--gs-text-hint)", margin: 0 }}>Berlaku sejak 8 Juli 2026 · UU PDP No. 27/2022</p>
        </div>

        {/* TL;DR summary — intentionally always dark */}
        <div style={{
          background: "#0f0e17", borderRadius: "14px",
          padding: isMobile ? "18px 20px" : "20px 24px",
          marginBottom: "16px",
        }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "14px" }}>
            Ringkasan Singkat
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {SUMMARY.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#e84c2b", minWidth: "16px", paddingTop: "2px", flexShrink: 0 }}>
                  {i + 1}.
                </span>
                <p style={{ fontSize: "13.5px", color: "rgba(255,255,255,.7)", lineHeight: "1.6", margin: 0 }}>
                  <strong style={{ color: "white", fontWeight: "600" }}>{item.bold}</strong>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {SECTIONS.map((section) => (
            <SectionCard key={section.num} section={section} />
          ))}
        </div>

        {/* Contact */}
        <div style={{
          background: "var(--gs-surface)", borderRadius: "14px",
          border: "1px solid var(--gs-border)", borderLeft: "3px solid #1a8a6e",
          padding: "20px", marginTop: "10px",
        }}>
          <h2 style={{ fontSize: "13px", fontWeight: "700", color: "var(--gs-text)", margin: "0 0 8px" }}>Cara Menghubungi Kami</h2>
          <p style={{ fontSize: "14px", color: "var(--gs-text-muted)", margin: "0 0 4px", lineHeight: "1.65" }}>
            Untuk pertanyaan seputar privasi, permintaan akses data, atau pengajuan penghapusan akun:
          </p>
          <a href="mailto:admin@gudangsoal.com" style={{ fontSize: "14px", fontWeight: "600", color: "#e84c2b", textDecoration: "none" }}>
            admin@gudangsoal.com
          </a>
          <p style={{ fontSize: "13px", color: "var(--gs-text-hint)", margin: "8px 0 0", lineHeight: "1.6" }}>
            Kami berkomitmen merespons setiap pertanyaan seputar privasi dalam waktu 5 hari kerja.
          </p>
        </div>

      </div>

      <Footer />
    </div>
  );
}
