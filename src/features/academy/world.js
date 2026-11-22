// Graybox baseline from the Academy handoff. Coordinates are in world pixels;
// player x/y is the centre of the feet, independent of the sprite's height.
export const TILE = 32;
export const WORLD = { id: "academy_world", sceneId: "academy_plaza", version: 1, width: 80 * TILE, height: 60 * TILE };
export const PLAYER_RADIUS = 10;
export const PLAYER_SPEED = 180;
export const SPAWN = { x: 1296, y: 1456, facing: "up" };
export const PLAZA = { x: 1296, y: 1104, radius: 288 };

// The entrances and the HTML quick navigation share this registry. The movement
// engine knows interaction IDs, never application routes.
export const BUILDINGS = [
  {
    id: "question_hall", label: "Question Hall", description: "Jelajahi bank soal", route: "/browse", direction: "Utara", color: "#587c9a",
    bounds: { x: 928, y: 160, width: 704, height: 384 },
    entrance: { x: 1296, y: 592 },
  },
  {
    id: "profile_center", label: "Profile Center", description: "Lihat profil dan progresmu", route: "/profile", direction: "Barat", color: "#bd875f",
    bounds: { x: 160, y: 736, width: 608, height: 352 },
    entrance: { x: 496, y: 1136 },
  },
  {
    id: "dormitory", label: "Dormitory", description: "Kembali ke beranda belajar", route: "/home", direction: "Timur", color: "#8a7aa5",
    bounds: { x: 1792, y: 736, width: 608, height: 352 },
    entrance: { x: 2096, y: 1136 },
  },
];

export const GUIDE = { id: "academy_guide", label: "Kak Aksa", x: 1168, y: 1328, range: 76 };
export const GUIDE_DIALOGUE = [
  "Selamat datang di Academy! Di sini, kamu bisa menjelajahi kampus untuk membuka fitur belajar yang sudah kamu kenal.",
  "Question Hall ada di utara untuk mencari soal. Profile Center di barat untuk melihat progres, dan Dormitory di timur untuk kembali ke beranda.",
  "Dekati pintu, lalu tekan E untuk masuk. Kalau ingin langsung menuju halaman tujuan, buka Navigasi cepat dengan tombol M. Selamat menjelajah!",
];

export const TREES = [
  [112, 112], [720, 144], [1824, 112], [2400, 128], [112, 592], [768, 576], [1792, 560], [2432, 576],
  [96, 1312], [832, 1344], [1712, 1360], [2432, 1312], [144, 1648], [736, 1696], [1824, 1680], [2400, 1664],
  [512, 1760], [2048, 1776], [368, 608], [2192, 608],
];
export const PONDS = [
  { x: 176, y: 176, width: 384, height: 256 },
  { x: 2080, y: 1424, width: 288, height: 176 },
];

export const OBSTACLES = [
  ...BUILDINGS.map((b) => ({ ...b.bounds, id: b.id })),
  { id: "fountain", x: 1232, y: 1040, width: 128, height: 128 },
  ...PONDS.map((p, i) => ({ ...p, id: `pond_${i}` })),
  ...TREES.map(([x, y], i) => ({ id: `tree_${i}`, x: x - 14, y: y - 12, width: 28, height: 24 })),
  { id: "guide", x: GUIDE.x - 10, y: GUIDE.y - 12, width: 20, height: 20 },
  { id: "bench_west", x: 1064, y: 1056, width: 80, height: 28 },
  { id: "bench_east", x: 1448, y: 1056, width: 80, height: 28 },
  { id: "gate_west", x: 1192, y: 1744, width: 24, height: 128 },
  { id: "gate_east", x: 1376, y: 1744, width: 24, height: 128 },
];

export function isWalkable({ x, y }) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
  if (x < 48 || y < 48 || x > WORLD.width - 48 || y > WORLD.height - 48) return false;
  return !OBSTACLES.some((rect) => {
    const nearestX = Math.max(rect.x, Math.min(x, rect.x + rect.width));
    const nearestY = Math.max(rect.y, Math.min(y, rect.y + rect.height));
    return (x - nearestX) ** 2 + (y - nearestY) ** 2 < PLAYER_RADIUS ** 2;
  });
}

// Small substeps prevent tunnelling through narrow colliders after a slow frame.
export function movePlayer(player, dx, dy) {
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / (PLAYER_RADIUS / 2)));
  let { x, y } = player;
  for (let i = 0; i < steps; i++) {
    if (isWalkable({ x: x + dx / steps, y })) x += dx / steps;
    if (isWalkable({ x, y: y + dy / steps })) y += dy / steps;
  }
  return { ...player, x, y };
}

export function getInteraction(player) {
  const targets = [
    ...BUILDINGS.map((b) => ({ id: b.id, kind: "building", label: b.label, ...b.entrance, range: 64 })),
    { ...GUIDE, kind: "npc" },
  ];
  return targets
    .map((target) => ({ ...target, distance: Math.hypot(player.x - target.x, player.y - target.y) }))
    .filter((target) => target.distance <= target.range)
    .sort((a, b) => a.distance - b.distance)[0] ?? null;
}

export function getCamera(player, width, height) {
  return {
    x: Math.max(0, Math.min(WORLD.width - width, player.x - width / 2)),
    y: Math.max(0, Math.min(WORLD.height - height, player.y - height / 2)),
  };
}

export function getLocation(player) {
  if (player.y < 704) return "Question Hall · Utara";
  if (player.x < 896) return "Profile Center · Barat";
  if (player.x > 1696) return "Dormitory · Timur";
  if (player.y > 1392) return "Gerbang selatan";
  return "Central Plaza";
}
