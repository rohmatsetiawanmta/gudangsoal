// src/features/home/FAQPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import SEO from "../../components/SEO";
import useWindowWidth from "../../hooks/useWindowWidth";

const FAQ_DATA = [
  {
    kategori: "Umum",
    items: [
      {
        q: "Apa itu Gudang Soal?",
        a: "Gudang Soal adalah platform latihan soal matematika dari SD hingga persiapan UTBK, CPNS, dan OSN. Semua soal dilengkapi pembahasan langkah per langkah dengan rumus matematika yang rapi.",
      },
      {
        q: "Apakah Gudang Soal gratis?",
        a: "Ya, sepenuhnya gratis. Tidak ada biaya langganan atau kartu kredit yang dibutuhkan.",
      },
      {
        q: "Siapa yang bisa menggunakan Gudang Soal?",
        a: "Semua pelajar, mahasiswa, dan siapapun yang ingin berlatih matematika — dari siswa SD hingga yang sedang mempersiapkan seleksi nasional.",
      },
    ],
  },
  {
    kategori: "Akun & Fitur",
    items: [
      {
        q: "Apakah saya harus daftar untuk mengerjakan soal?",
        a: "Tidak, kamu bisa langsung browse dan mengerjakan soal tanpa login. Tapi dengan mendaftar, kamu bisa menyimpan progress, mendapatkan XP, dan melihat riwayat soal yang sudah dikerjakan.",
      },
      {
        q: "Apa itu XP dan streak?",
        a: "XP adalah poin yang didapat setiap kali kamu berhasil menjawab soal dengan benar. Streak adalah jumlah hari berturut-turut kamu aktif belajar — semakin panjang streak, semakin besar bonus XP yang kamu dapatkan.",
      },
      {
        q: "Apakah pembahasan bisa dilihat tanpa login?",
        a: "Sebagian soal memiliki pembahasan yang terbuka untuk umum (bisa dilihat tanpa login setelah jawab benar). Sebagian lagi memerlukan login untuk mengakses pembahasan lengkapnya.",
      },
      {
        q: "Apakah XP bisa berkurang?",
        a: "Tidak, XP hanya bisa bertambah. Menjawab salah pun tidak mengurangi XP yang sudah kamu kumpulkan.",
      },
      {
        q: "Apa yang terjadi kalau streak terputus?",
        a: "Streak hari kembali ke 0 jika kamu tidak aktif sehari penuh. Streak soal juga reset jika kamu menjawab soal dengan salah. Bonus XP dari streak akan hilang, tapi XP yang sudah terkumpul tetap aman.",
      },
    ],
  },
  {
    kategori: "Mekanisme XP & Bonus",
    items: [
      {
        q: "Berapa XP yang didapat per soal?",
        a: "XP base tergantung tingkat kesulitan soal:\n• Easy: +10 XP\n• Medium: +20 XP\n• Hard: +30 XP",
      },
      {
        q: "Apakah XP dihitung setiap kali jawab benar?",
        a: "Tidak. XP hanya dihitung pada attempt pertama yang benar. Jika soal yang sama dijawab benar lagi setelah pernah benar sebelumnya, tidak ada XP tambahan.",
      },
      {
        q: "Bagaimana bonus streak hari bekerja?",
        a: "Bonus dihitung berdasarkan berapa hari berturut-turut kamu aktif belajar:\n• 3–5 hari: +10%\n• 6–10 hari: +20%\n• 11–20 hari: +30%\n• 21–30 hari: +40%\n• 30+ hari: +50%",
      },
      {
        q: "Bagaimana bonus streak soal bekerja?",
        a: "Bonus dihitung berdasarkan berapa soal berturut-turut kamu jawab benar tanpa salah:\n• 6–15 soal: +10%\n• 16–30 soal: +20%\n• 31–50 soal: +30%\n• 51–75 soal: +40%\n• 75+ soal: +50%",
      },
      {
        q: "Apakah bonus streak hari dan streak soal bisa digabung?",
        a: "Ya! Keduanya dijumlahkan. Contoh: soal Hard (30 XP) + streak hari 20% + streak soal 10% = 30 + (30 × 30%) = 30 + 9 = 39 XP.",
      },
    ],
  },
  {
    kategori: "Soal & Konten",
    items: [
      {
        q: "Apakah saya harus daftar untuk mengerjakan soal?",
        a: "Tidak, kamu bisa langsung browse dan mengerjakan soal tanpa login.",
      },
      {
        q: "Bisakah saya mengerjakan soal yang sama berkali-kali?",
        a: "Jika sudah pernah menjawab benar, soal akan terkunci dan langsung menampilkan pembahasan. Jika belum pernah benar, kamu bisa terus mencoba.",
      },
      {
        q: "Bagaimana cara request soal?",
        a: 'Login terlebih dahulu, lalu buka menu "Request Soal" di navbar. Tulis soal yang ingin kamu tanyakan, bisa dilengkapi foto dan catatan tambahan. Admin akan mereview dan menjawab.',
      },
      {
        q: "Berapa lama soal request diproses?",
        a: 'Tidak ada jaminan waktu pasti, tergantung ketersediaan admin. Kamu bisa memantau status request di halaman "Request Soal".',
      },
      {
        q: "Bagaimana kalau menemukan soal yang salah?",
        a: 'Klik tombol "Laporkan soal" di bagian bawah halaman detail soal. Pilih kategori laporan (soal salah, jawaban salah, typo, dll) dan tambahkan deskripsi jika perlu.',
      },
      {
        q: "Dari mana soal-soal di Gudang Soal berasal?",
        a: "Soal dikurasi dan dibuat oleh tim Gudang Soal, dengan sebagian berasal dari kontribusi pengguna yang telah diverifikasi oleh admin.",
      },
      {
        q: "Apakah ada soal untuk persiapan SNBT/UTBK?",
        a: "Ada! Tersedia di jenjang UTBK dengan berbagai topik Penalaran Matematika dan Pengetahuan Kuantitatif.",
      },
      {
        q: "Apakah soal bisa diunduh atau dicetak?",
        a: "Belum tersedia untuk saat ini.",
      },
    ],
  },
  {
    kategori: "Teknis",
    items: [
      {
        q: "Kenapa rumus matematika tidak tampil dengan benar?",
        a: "Coba refresh halaman. Pastikan koneksi internet stabil. Jika masalah berlanjut, coba gunakan browser lain atau laporkan ke kami.",
      },
      {
        q: "Browser apa yang direkomendasikan?",
        a: "Chrome, Firefox, Safari, atau Edge versi terbaru untuk pengalaman terbaik.",
      },
      {
        q: "Apakah Gudang Soal bisa diakses di HP?",
        a: "Bisa, Gudang Soal dapat diakses melalui browser di HP. Belum ada aplikasi mobile khusus saat ini.",
      },
      {
        q: "Bagaimana cara menghubungi tim Gudang Soal?",
        a: "Gunakan fitur Request Soal untuk pertanyaan seputar konten soal. Untuk hal lain, kamu bisa menghubungi kami melalui email yang tertera di footer.",
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #f2efe8" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "18px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontSize: "15px",
            fontWeight: "600",
            color: "#0f0e17",
            lineHeight: "1.5",
          }}
        >
          {q}
        </span>
        <div style={{ flexShrink: 0, color: "#6b6860" }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>
      {open && (
        <div style={{ paddingBottom: "18px" }}>
          {a.split("\n").map((line, i) => (
            <p
              key={i}
              style={{
                fontSize: "14px",
                color: "#6b6860",
                lineHeight: "1.7",
                margin: 0,
                marginTop: i > 0 ? "4px" : 0,
              }}
            >
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 480;
  const [activeKategori, setActiveKategori] = useState("Semua");

  const kategoriList = ["Semua", ...FAQ_DATA.map((f) => f.kategori)];
  const filtered =
    activeKategori === "Semua"
      ? FAQ_DATA
      : FAQ_DATA.filter((f) => f.kategori === activeKategori);

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f6" }}>
      <SEO
        title="FAQ"
        description="Pertanyaan yang sering ditanyakan seputar Gudang Soal — platform latihan soal matematika gratis."
        url="/faq"
      />
      <Navbar />

      <main
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: isMobile ? "40px 20px" : "60px 40px",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: isMobile ? "32px" : "48px",
          }}
        >
          <h1
            style={{
              fontSize: isMobile ? "26px" : "clamp(28px, 4vw, 40px)",
              fontWeight: "800",
              color: "#0f0e17",
              letterSpacing: "-0.5px",
              marginBottom: "12px",
            }}
          >
            Pertanyaan yang Sering Ditanyakan
          </h1>
          <p
            style={{
              fontSize: isMobile ? "14px" : "16px",
              color: "#6b6860",
              lineHeight: "1.7",
            }}
          >
            Tidak menemukan jawaban yang kamu cari? Gunakan fitur{" "}
            <button
              onClick={() => navigate("/request-soal")}
              style={{
                background: "none",
                border: "none",
                color: "#e84c2b",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: isMobile ? "14px" : "16px",
                padding: 0,
              }}
            >
              Request Soal
            </button>{" "}
            untuk menghubungi kami.
          </p>
        </div>

        {/* Filter kategori */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "32px",
            justifyContent: isMobile ? "flex-start" : "center",
          }}
        >
          {kategoriList.map((k) => (
            <button
              key={k}
              onClick={() => setActiveKategori(k)}
              style={{
                padding: isMobile ? "6px 12px" : "7px 16px",
                borderRadius: "100px",
                border: `1.5px solid ${
                  activeKategori === k ? "#e84c2b" : "#e2ddd5"
                }`,
                background: activeKategori === k ? "#fff3f0" : "white",
                color: activeKategori === k ? "#e84c2b" : "#6b6860",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .15s",
              }}
            >
              {k}
            </button>
          ))}
        </div>

        {/* FAQ list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {filtered.map((section) => (
            <div key={section.kategori}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#0f0e17",
                  marginBottom: "4px",
                  paddingBottom: "12px",
                  borderBottom: "2px solid #e84c2b",
                  display: "inline-block",
                }}
              >
                {section.kategori}
              </h2>
              <div
                style={{
                  background: "white",
                  borderRadius: "14px",
                  border: "1px solid #e2ddd5",
                  padding: isMobile ? "0 16px" : "0 24px",
                  marginTop: "16px",
                }}
              >
                {section.items.map((item, i) => (
                  <FAQItem key={i} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA bottom */}
        <div
          style={{
            marginTop: "48px",
            background: "#0f0e17",
            borderRadius: "16px",
            padding: isMobile ? "32px 20px" : "40px",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              fontSize: isMobile ? "18px" : "20px",
              fontWeight: "800",
              color: "white",
              marginBottom: "8px",
            }}
          >
            Siap mulai belajar?
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.6)",
              marginBottom: "20px",
            }}
          >
            Bergabung gratis dan mulai kerjakan ribuan soal matematika.
          </p>
          <button
            onClick={() => navigate("/register")}
            style={{
              padding: "12px 28px",
              borderRadius: "10px",
              border: "none",
              background: "#e84c2b",
              color: "white",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Daftar Gratis
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
