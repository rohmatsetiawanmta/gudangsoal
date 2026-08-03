// src/components/SEO.jsx
import { Helmet } from "react-helmet-async";

export default function SEO({ title, description, url, image }) {
  const siteName = "Gudang Soal";
  const baseUrl = "https://gudangsoal.com";
  const defImage = `${baseUrl}/og-image.png`;
  const defDesc =
    "Latihan soal matematika dari SD hingga UTBK, CPNS, dan OSN. Dilengkapi pembahasan detail, sistem XP, dan tracking progress belajarmu. Gratis selamanya.";

  const fullTitle = title
    ? `${title} | ${siteName}`
    : `${siteName} | Platform Latihan Matematika Terlengkap`;
  const finalDesc = description || defDesc;
  const finalUrl = url ? `${baseUrl}${url}` : baseUrl;
  const finalImg = image || defImage;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={finalDesc} />
      <link rel="canonical" href={finalUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:image" content={finalImg} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="id_ID" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={finalImg} />
    </Helmet>
  );
}
