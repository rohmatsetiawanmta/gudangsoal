// src/features/academy/PixelCharacter.jsx
// Generic CSS-only pixel-art sprite renderer (one div + box-shadow per pixel, no images).

function buildShadow(rows, palette, size) {
  const shadows = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = palette[row[x]];
      if (color) shadows.push(`${x * size}px ${y * size}px 0 ${color}`);
    }
  });
  return shadows.join(",");
}

export default function PixelSprite({ rows, palette, size = 5, flip = false, style = {} }) {
  const cols = rows[0].length;
  const numRows = rows.length;

  return (
    <div style={{
      position: "relative", width: cols * size, height: numRows * size,
      transform: flip ? "scaleX(-1)" : "none",
      ...style,
    }}>
      <div style={{ position: "relative", width: size, height: size, boxShadow: buildShadow(rows, palette, size) }} />
    </div>
  );
}
