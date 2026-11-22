import { TERRAIN, TERRAIN_LAYERS } from "./terrainLayout.js";
import { TILE, WORLD } from "./world.js";

const REVISION = "01.1";
const MAP_PATH = `${import.meta.env?.BASE_URL || "/"}assets/academy/maps/academy_plaza_terrain.json?v=${REVISION}`;

export function validateTerrainMap(map) {
  if (!map || map.type !== "map" || map.orientation !== "orthogonal" || map.infinite !== false
    || map.width !== WORLD.width / TILE || map.height !== WORLD.height / TILE || map.tilewidth !== TILE || map.tileheight !== TILE) {
    throw new Error("Terrain map dimensions do not match the Academy world.");
  }
  const set = map.tilesets?.[0];
  if (!Array.isArray(map.tilesets) || map.tilesets.length !== 1 || !set || set.firstgid !== 1 || set.tilewidth !== TILE || set.tileheight !== TILE
    || set.columns !== TERRAIN.columns || set.tilecount !== TERRAIN.tileCount || set.imagewidth !== TERRAIN.imageWidth
    || set.imageheight !== TERRAIN.imageHeight || set.margin !== 0 || set.spacing !== 0 || typeof set.image !== "string") {
    throw new Error("Terrain tileset does not match the 32px atlas.");
  }
  if (!Array.isArray(map.layers) || map.layers.length !== TERRAIN_LAYERS.length) throw new Error("Terrain layers are incomplete.");
  map.layers.forEach((layer, i) => {
    if (layer.name !== TERRAIN_LAYERS[i] || layer.type !== "tilelayer" || layer.width !== map.width || layer.height !== map.height
      || layer.x !== 0 || layer.y !== 0 || layer.opacity !== 1 || layer.visible !== true || !Array.isArray(layer.data)
      || layer.data.length !== map.width * map.height || layer.data.some((id) => !Number.isInteger(id) || id < 0 || id > set.tilecount)) {
      throw new Error(`Terrain layer ${i} contains invalid data.`);
    }
  });
  if (map.layers[0].data.some((id) => id < 1 || id > 8)) throw new Error("Terrain needs a complete opaque grass underlay.");
  return map;
}

function abortError() { return new DOMException("Terrain loading cancelled.", "AbortError"); }

function loadImage(url, signal, ImageConstructor) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(abortError()); return; }
    const image = new ImageConstructor();
    function cleanup() {
      image.onload = image.onerror = null;
      signal?.removeEventListener("abort", cancelled);
    }
    function cancelled() { cleanup(); image.src = ""; reject(abortError()); }
    image.onload = () => {
      cleanup();
      if (image.naturalWidth !== TERRAIN.imageWidth || image.naturalHeight !== TERRAIN.imageHeight) {
        reject(new Error("Terrain PNG dimensions do not match its tileset metadata."));
      } else resolve(image);
    };
    image.onerror = () => { cleanup(); reject(new Error("Terrain PNG could not be loaded.")); };
    signal?.addEventListener("abort", cancelled, { once: true });
    image.src = url;
  });
}

export async function loadTerrain({ signal, fetcher = globalThis.fetch, ImageConstructor = globalThis.Image } = {}) {
  if (signal?.aborted) throw abortError();
  const response = await fetcher(MAP_PATH, { signal });
  if (!response.ok) throw new Error("Terrain map could not be loaded.");
  const map = validateTerrainMap(await response.json());
  if (signal?.aborted) throw abortError();
  const mapURL = new URL(response.url || MAP_PATH, globalThis.location?.href || "http://localhost/");
  const imageURL = new URL(map.tilesets[0].image, mapURL);
  imageURL.searchParams.set("v", REVISION);
  const image = await loadImage(imageURL.href, signal, ImageConstructor);
  return { map, image };
}

export function drawTerrain(ctx, { map, image }) {
  ctx.imageSmoothingEnabled = false;
  const columns = map.tilesets[0].columns;
  for (const layer of map.layers) {
    layer.data.forEach((gid, index) => {
      if (!gid) return;
      const tileId = gid - 1;
      ctx.drawImage(image, tileId % columns * TILE, Math.floor(tileId / columns) * TILE, TILE, TILE,
        index % map.width * TILE, Math.floor(index / map.width) * TILE, TILE, TILE);
    });
  }
}
