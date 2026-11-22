import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTerrainLayers, TERRAIN_LAYERS, terrainMaterialAt } from "../src/features/academy/terrainLayout.js";
import { drawTerrain, loadTerrain, validateTerrainMap } from "../src/features/academy/terrain.js";
import { BUILDINGS, PLAZA, TILE, WORLD } from "../src/features/academy/world.js";

const map = JSON.parse(readFileSync(new URL("../public/assets/academy/maps/academy_plaza_terrain.json", import.meta.url), "utf8"));
const tileset = JSON.parse(readFileSync(new URL("../public/assets/academy/tilesets/terrain.tsj", import.meta.url), "utf8"));
const response = () => ({ ok: true, url: "http://localhost/assets/academy/maps/academy_plaza_terrain.json", json: async () => structuredClone(map) });
class GoodImage {
  naturalWidth = 256;
  naturalHeight = 256;
  set src(value) { this.url = value; if (value) queueMicrotask(() => this.onload?.()); }
}

test("PNG and embedded/external tileset metadata agree on the exact 32px RGBA grid", () => {
  const png = readFileSync(new URL("../public/assets/academy/tilesets/terrain.png", import.meta.url));
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.readUInt32BE(16), 256);
  assert.equal(png.readUInt32BE(20), 256);
  assert.equal(png[24], 8);
  assert.equal(png[25], 6, "PNG must be RGBA, not indexed RGB");
  const { firstgid, image, ...embedded } = map.tilesets[0];
  const { image: externalImage, ...external } = tileset;
  assert.deepEqual(embedded, external);
  assert.equal(externalImage, "terrain.png");
  assert.equal(firstgid, 1);
  assert.equal(image, "../tilesets/terrain.png");
  assert.equal(tileset.tilecount, 64);
  assert.equal(tileset.margin, 0);
  assert.equal(tileset.spacing, 0);
});

test("Tiled map stays 80×60 and its visual layers match the existing road/plaza layout", () => {
  assert.equal(TILE, 32);
  assert.equal(map.width * TILE, WORLD.width);
  assert.equal(map.height * TILE, WORLD.height);
  assert.deepEqual(map.layers.map((layer) => layer.name), TERRAIN_LAYERS);
  assert.deepEqual(map.layers, createTerrainLayers());
  assert.equal(terrainMaterialAt(PLAZA.x, PLAZA.y), "plaza");
  assert.equal(terrainMaterialAt(64, 1000), "grass");
  for (const building of BUILDINGS) assert.equal(terrainMaterialAt(building.entrance.x, building.entrance.y), "path");
  assert.ok(map.layers[0].data.every((gid) => gid >= 1 && gid <= 8));
  assert.ok(map.layers.slice(3).every((layer) => layer.data.some(Boolean)), "all four concave corner orientations must be exercised");
});

test("all cardinal edge combinations and four inner corners have named atlas tiles", () => {
  for (const material of ["path", "plaza"]) {
    const properties = tileset.tiles.map((tile) => Object.fromEntries(tile.properties.map((p) => [p.name, p.value]))).filter((p) => p.material === material);
    assert.deepEqual(properties.filter((p) => p.role === "edge").map((p) => p.neighborMask), Array.from({ length: 16 }, (_, i) => i));
    assert.deepEqual(properties.filter((p) => p.role === "inner-corner").map((p) => p.corner), ["nw", "ne", "sw", "se"]);
  }
});

test("invalid dimensions, layer/GID data or missing grass coverage are rejected", () => {
  assert.equal(validateTerrainMap(map), map);
  for (const mutate of [
    (m) => { m.tilewidth = 16; }, (m) => { m.width = 81; }, (m) => { delete m.tilesets; },
    (m) => { m.tilesets[0].spacing = 1; }, (m) => { m.layers[1].data[0] = 65; },
    (m) => { m.layers[0].data[0] = 0; }, (m) => { m.layers[2].data.pop(); },
    (m) => { m.layers[0].type = "objectgroup"; },
  ]) {
    const changed = structuredClone(map);
    mutate(changed);
    assert.throws(() => validateTerrainMap(changed));
  }
});

test("terrain waits for the real image and resolves image paths relative to the Tiled map", async () => {
  let request;
  const loaded = await loadTerrain({ fetcher: async (url) => { request = url; return response(); }, ImageConstructor: GoodImage });
  assert.match(request, /assets\/academy\/maps\/academy_plaza_terrain\.json/);
  assert.equal(loaded.image.url, "http://localhost/assets/academy/tilesets/terrain.png?v=01.1");
  assert.deepEqual(loaded.map, map);
});

test("map/image failures and wrong atlas dimensions surface for the retry UI", async () => {
  await assert.rejects(loadTerrain({ fetcher: async () => ({ ok: false }), ImageConstructor: GoodImage }), /map could not/);
  class BrokenImage { set src(value) { if (value) queueMicrotask(() => this.onerror?.()); } }
  await assert.rejects(loadTerrain({ fetcher: async () => response(), ImageConstructor: BrokenImage }), /PNG could not/);
  class WrongImage extends GoodImage { naturalWidth = 512; }
  await assert.rejects(loadTerrain({ fetcher: async () => response(), ImageConstructor: WrongImage }), /PNG dimensions/);
});

test("leaving while an image loads cancels it and releases the image callbacks", async () => {
  const controller = new AbortController();
  let image, started;
  const created = new Promise((resolve) => { started = resolve; });
  class WaitingImage {
    constructor() { image = this; }
    set src(value) { this.url = value; if (value) started(); }
  }
  const loading = loadTerrain({ signal: controller.signal, fetcher: async () => response(), ImageConstructor: WaitingImage });
  await created;
  controller.abort();
  await assert.rejects(loading, { name: "AbortError" });
  assert.equal(image.onload, null);
  assert.equal(image.onerror, null);
  assert.equal(image.url, "");
});

test("renderer copies atlas tiles at native integer coordinates with smoothing disabled", () => {
  let calls = 0;
  const ctx = { imageSmoothingEnabled: true, drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh) {
    assert.equal(image, "atlas");
    assert.ok(sx >= 0 && sx < 256 && sy >= 0 && sy < 256);
    assert.ok([sx, sy, dx, dy].every((n) => Number.isInteger(n) && n % TILE === 0));
    assert.deepEqual([sw, sh, dw, dh], [32, 32, 32, 32]);
    calls++;
  } };
  drawTerrain(ctx, { map, image: "atlas" });
  assert.equal(ctx.imageSmoothingEnabled, false);
  assert.equal(calls, map.layers.reduce((total, layer) => total + layer.data.filter(Boolean).length, 0));
});
