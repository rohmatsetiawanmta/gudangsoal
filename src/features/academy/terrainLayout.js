import { BUILDINGS, PLAZA, TILE, WORLD } from "./world.js";

export const TERRAIN = { columns: 8, tileCount: 64, imageWidth: 256, imageHeight: 256 };
export const TERRAIN_LAYERS = ["Ground", "Paths", "PlazaFloor", "CornersNW", "CornersNE", "CornersSW", "CornersSE"];

// Original graybox road coordinates. These affect appearance only. Collision,
// movement, spawn and entrances remain owned by the unchanged world.js.
const roads = [
  { x: 1216, y: 544, width: 160, height: WORLD.height - 544 },
  { x: 448, y: 1088, width: 1696, height: 96 },
  ...BUILDINGS.map((b) => ({ x: b.entrance.x - 48, y: b.bounds.y + b.bounds.height, width: 96, height: b.entrance.y - b.bounds.y - b.bounds.height + 32 })),
];

export function terrainMaterialAt(x, y) {
  if ((x - PLAZA.x) ** 2 + (y - PLAZA.y) ** 2 <= PLAZA.radius ** 2) return "plaza";
  if (roads.some((r) => x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height)) return "path";
  return "grass";
}

function variant(x, y) {
  // Stable 2D hash, independent from time, sessions or game state.
  let value = Math.imul(x + 41, 374761393) ^ Math.imul(y + 73, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return (value ^ (value >>> 16)) >>> 0;
}

export function createTerrainLayers() {
  const width = WORLD.width / TILE, height = WORLD.height / TILE;
  const material = (x, y) => x < 0 || y < 0 || x >= width || y >= height ? "grass" : terrainMaterialAt(x * TILE + TILE / 2, y * TILE + TILE / 2);
  const paved = (x, y) => material(x, y) !== "grass";
  const layers = TERRAIN_LAYERS.map((name, index) => ({ id: index + 1, name, type: "tilelayer", visible: true, opacity: 1, width, height, x: 0, y: 0, data: Array(width * height).fill(0) }));
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = y * width + x, kind = material(x, y);
    layers[0].data[i] = 1 + variant(x, y) % 8;
    if (kind === "grass") continue;
    const mask = (paved(x, y - 1) ? 1 : 0) | (paved(x + 1, y) ? 2 : 0) | (paved(x, y + 1) ? 4 : 0) | (paved(x - 1, y) ? 8 : 0);
    const fillStart = kind === "path" ? 8 : 32;
    const edgeStart = kind === "path" ? 16 : 40;
    layers[kind === "path" ? 1 : 2].data[i] = 1 + (mask === 15 ? fillStart + variant(x, y) % 8 : edgeStart + mask);
    const cornerStart = kind === "path" ? 56 : 60;
    for (const [corner, dx, dy, bits] of [[0, -1, -1, 9], [1, 1, -1, 3], [2, -1, 1, 12], [3, 1, 1, 6]]) {
      if ((mask & bits) === bits && !paved(x + dx, y + dy)) layers[3 + corner].data[i] = 1 + cornerStart + corner;
    }
  }
  return layers;
}
