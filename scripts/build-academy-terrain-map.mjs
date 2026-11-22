import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createTerrainLayers } from "../src/features/academy/terrainLayout.js";
import { TILE, WORLD } from "../src/features/academy/world.js";

const root = new URL("../", import.meta.url);
const tileset = JSON.parse(readFileSync(new URL("public/assets/academy/tilesets/terrain.tsj", root), "utf8"));
const map = {
  type: "map", version: "1.10", orientation: "orthogonal", renderorder: "right-down", infinite: false,
  width: WORLD.width / TILE, height: WORLD.height / TILE, tilewidth: TILE, tileheight: TILE,
  nextlayerid: 8, nextobjectid: 1,
  properties: [
    { name: "worldId", type: "string", value: WORLD.id },
    { name: "sceneId", type: "string", value: WORLD.sceneId },
    { name: "collisionSource", type: "string", value: "src/features/academy/world.js" },
    { name: "artStatus", type: "string", value: "programmatic-placeholder-under-review" },
  ],
  layers: createTerrainLayers(),
  // Embedded metadata is supported by both Tiled and Phaser's Tiled JSON loader.
  tilesets: [{ ...tileset, firstgid: 1, image: "../tilesets/terrain.png" }],
};
const destination = new URL("public/assets/academy/maps/academy_plaza_terrain.json", root);
if (process.argv.includes("--check")) {
  const stored = JSON.parse(readFileSync(destination, "utf8"));
  if (JSON.stringify(stored) !== JSON.stringify(map)) throw new Error("Committed terrain map differs from world layout; regenerate explicitly.");
} else {
  writeFileSync(destination, JSON.stringify(map) + "\n");
}
console.log(`${process.argv.includes("--check") ? "Verified" : "Generated"} ${map.width}×${map.height} map, ${map.layers.length} visual layers: ${fileURLToPath(destination)}`);
