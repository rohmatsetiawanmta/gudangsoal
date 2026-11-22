// src/features/academy/PixelCharacter.jsx
// Simple CSS-only pixel-art sprite (one div + box-shadow per pixel, no images).

const PALETTE = {
  B: "#4a3222", // hair
  H: "#f4c9a0", // skin
  E: "#1a1a1a", // eyes
  S: "#e84c2b", // shirt (brand red)
  W: "#ffffff", // shirt stripe
  P: "#1a2a4a", // pants
  D: "#2a2a2a", // shoes
};

const ROWS = [
  "..BBBBBB..",
  ".BBBBBBBB.",
  ".BHHHHHHB.",
  ".HHHHHHHH.",
  ".HHEHHEHH.",
  ".HHHHHHHH.",
  "..HHHHHH..",
  ".SSSSSSSS.",
  "SSSSSSSSSS",
  "SSSSSSSSSS",
  ".SSSSSSSS.",
  ".SSWWWWSS.",
  "..PPPPPP..",
  "..PP..PP..",
  "..PP..PP..",
  ".DD....DD.",
];

function buildShadow(size) {
  const shadows = [];
  ROWS.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      const color = PALETTE[ch];
      if (color) shadows.push(`${x * size}px ${y * size}px 0 ${color}`);
    }
  });
  return shadows.join(",");
}

export default function PixelCharacter({ size = 5, style = {} }) {
  const cols = ROWS[0].length;
  const rows = ROWS.length;

  return (
    <div style={{ position: "relative", width: cols * size, height: rows * size + size * 2, ...style }}>
      {/* Ground shadow */}
      <div style={{
        position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)",
        width: cols * size * 0.8, height: size * 1.4, borderRadius: "50%",
        background: "rgba(0,0,0,.2)", filter: "blur(1px)",
      }} />
      {/* Sprite (idle bob) */}
      <div style={{
        position: "absolute", left: 0, top: 0,
        animation: "pixel-char-bob 1.6s steps(2) infinite",
      }}>
        <div style={{ position: "relative", width: size, height: size, boxShadow: buildShadow(size) }} />
      </div>
    </div>
  );
}
