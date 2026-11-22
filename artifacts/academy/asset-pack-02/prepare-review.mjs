// Concept-review metadata only. Never writes to src/ or public/.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { BUILDINGS, WORLD, TILE } from "../../../src/features/academy/world.js";

const root = new URL("../../../", import.meta.url);
const here = new URL("./", import.meta.url);
const inspection = JSON.parse(readFileSync(new URL("source-inspection.json", here), "utf8"));
const samples = {
  question_hall: { anchor: { x: 798, y: 914 }, base: [22, 1570], identity: "Hero academic hall · navy, cream stone, cupola, double door, book emblem", proposedSize: [768, 544], roofAllowance: 128 },
  profile_center: { anchor: { x: 850, y: 942 }, base: [112, 1424], identity: "Academic administration cottage · terracotta, plaster/timber, profile plaque", proposedSize: [672, 480], roofAllowance: 96 },
  dormitory: { anchor: { x: 768, y: 952 }, base: [112, 1424], identity: "Student cottage · plum, warm timber, bed plaque, chimney, restrained ivy", proposedSize: [672, 480], roofAllowance: 96 },
};
const buildings = BUILDINGS.map((building) => {
  const source = inspection[building.id];
  const sample = samples[building.id];
  const { bounds, entrance } = building;
  const [width, height] = sample.proposedSize;
  const frame = { x: bounds.x - 32, y: bounds.y - sample.roofAllowance, width, height };
  const origin = { x: width / 2, y: height - 32 };
  const doorWorld = { x: entrance.x, y: bounds.y + bounds.height };
  const doorLocal = { x: doorWorld.x - frame.x, y: doorWorld.y - frame.y };
  const [left, top, right, bottom] = source.displayCropAlpha128;
  // Uniform scaling for the REVIEW image: preserve aspect ratio, align the
  // manually estimated door threshold and fit the proposed sprite envelope.
  const scale = Math.min(
    bounds.width / (sample.base[1] - sample.base[0]),
    (doorWorld.x - frame.x) / (sample.anchor.x - left),
    (frame.x + width - doorWorld.x) / (right - sample.anchor.x),
    (doorWorld.y - frame.y) / (sample.anchor.y - top),
    (frame.y + height - doorWorld.y) / (bottom - sample.anchor.y),
  );
  const destination = {
    x: doorWorld.x + (left - sample.anchor.x) * scale,
    y: doorWorld.y + (top - sample.anchor.y) * scale,
    width: (right - left) * scale,
    height: (bottom - top) * scale,
  };
  const baseLeftWorld = doorWorld.x + (sample.base[0] - sample.anchor.x) * scale;
  const baseRightWorld = doorWorld.x + (sample.base[1] - sample.anchor.x) * scale;
  if (frame.x < 0 || frame.y < 0 || frame.x + width > WORLD.width || frame.y + height > WORLD.height) throw new Error(`${building.id} envelope outside world`);
  return {
    id: building.id, label: building.label, route: building.route, identity: sample.identity,
    source: `source/${building.id}_concept.png`, sourceSize: source.size,
    sourceCrop: { x: left, y: top, width: right - left, height: bottom - top },
    sourceDoorEstimate: sample.anchor,
    proposedSprite: {
      ...frame, origin, originRule: "centre of collision front edge; 32px transparent footer",
      collisionLocal: { x: 32, y: sample.roofAllowance, width: bounds.width, height: bounds.height },
      doorLocal, doorOffsetFromOrigin: { x: doorLocal.x - origin.x, y: 0 },
    },
    collisionWorld: bounds, interactionWorld: entrance, doorWorld,
    depthY: bounds.y + bounds.height, doorToInteractionDistance: entrance.y - doorWorld.y,
    conceptPlacement: { uniformScale: scale, destination, visibleBaseDelta: { left: baseLeftWorld - bounds.x, right: baseRightWorld - (bounds.x + bounds.width) }, warning: "Concept framing only: source door/base points are estimates; final sprite needs native pixel alignment and alpha cleanup." },
  };
});
writeFileSync(new URL("concept-layout.json", here), JSON.stringify({ stage: "concept-review-only-not-integrated", world: WORLD, tileSize: TILE, buildings }, null, 2) + "\n");

const frozenPaths = ["public/assets/academy/tilesets/terrain.png", "public/assets/academy/tilesets/terrain.tsj", "public/assets/academy/maps/academy_plaza_terrain.json"];
const hashes = Object.fromEntries(frozenPaths.map((path) => [path, createHash("sha256").update(readFileSync(new URL(path, root))).digest("hex")]));
const approval = {
  date: "2026-11-22", status: "approved-with-minor-to-medium-visual-refinements", reviewedBy: "user",
  nextStage: "Asset Pack 02 — Buildings concepts",
  refinementsAfterBuildings: ["Reduce tile/grid appearance of plaza", "Reduce paving repetition", "Soften grass/path/plaza transitions", "Add restrained color and small-detail variation"],
  frozenAssets: hashes,
};
writeFileSync(new URL("artifacts/academy/asset-pack-01/approval.json", root), JSON.stringify(approval, null, 2) + "\n");
writeFileSync(new URL("terrain-baseline.json", here), JSON.stringify(approval, null, 2) + "\n");
console.log(buildings.map((b) => ({ id: b.id, proposed: [b.proposedSprite.width, b.proposedSprite.height], origin: b.proposedSprite.origin, doorLocal: b.proposedSprite.doorLocal, threshold: b.doorWorld, interaction: b.interactionWorld, conceptBaseMismatch: b.conceptPlacement.visibleBaseDelta })));
