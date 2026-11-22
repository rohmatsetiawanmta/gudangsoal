import { BUILDINGS, GUIDE, PONDS, TREES, WORLD } from "./world.js";
import { drawTerrain } from "./terrain.js";
import { BUILDING_LAYOUT, cacheBuildingFrames, drawBuildingDebug } from "./buildings.js";
import { cacheEnvironment, drawEnvironmentDebug, drawEnvironmentGround, drawEnvironmentPond, drawEnvironmentSprite, ENVIRONMENT_PROPS } from './environment.js';

const COLORS = { ink: "#1f1a17" };

function rect(ctx, x, y, width, height, fill, stroke) {
  ctx.fillStyle = fill;
  ctx.fillRect(Math.round(x), Math.round(y), width, height);
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(Math.round(x) + 1, Math.round(y) + 1, width - 2, height - 2);
  }
}

function label(ctx, text, x, y, size = 16, color = COLORS.ink) {
  ctx.font = `700 ${size}px "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function circle(ctx, x, y, radius, fill, stroke) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawGround(ctx, terrain, environment) {
  drawTerrain(ctx, terrain);
  BUILDINGS.forEach((b) => {
    rect(ctx, b.entrance.x - 46, b.entrance.y - 22, 92, 44, "#d8e3d0", "#b6c6ac");
  });
  PONDS.forEach((p) => {
    if (drawEnvironmentPond(ctx, environment, p)) return;
    rect(ctx, p.x - 8, p.y - 8, p.width + 16, p.height + 16, "#bac9ba");
    rect(ctx, p.x, p.y, p.width, p.height, "#adcbd0");
    for (let i = 0; i < 5; i++) rect(ctx, p.x + 28 + i * 50, p.y + 48 + (i % 2) * 80, 24, 3, "#d1e3e0");
  });
  // World edge with a visible southern gate. Collision is owned by world.js.
  rect(ctx, 24, 24, WORLD.width - 48, 16, "#a7b69f");
  rect(ctx, 24, 24, 16, WORLD.height - 48, "#a7b69f");
  rect(ctx, WORLD.width - 40, 24, 16, WORLD.height - 48, "#a7b69f");
  rect(ctx, 24, WORLD.height - 40, 1192, 16, "#a7b69f");
  rect(ctx, 1376, WORLD.height - 40, WORLD.width - 1400, 16, "#a7b69f");
  rect(ctx, 1192, 1744, 24, 128, "#9ba69c", "#758276");
  rect(ctx, 1376, 1744, 24, 128, "#9ba69c", "#758276");
  label(ctx, "ACADEMY", 1296, 1792, 18);
  label(ctx, "GERBANG SELATAN", 1296, 1820, 12, "#6b5f58");
  circle(ctx, 1296, 1456, 27, "#e9eddf", "#abbca0");
  label(ctx, "TITIK AWAL", 1296, 1510, 12, "#6b5f58");
  drawEnvironmentGround(ctx, environment);
}

function drawBuilding(ctx, building) {
  const { x, y, width, height } = building.bounds;
  rect(ctx, x + 12, y + 16, width, height, "#bdc7b5");
  rect(ctx, x, y, width, height, "#e4e5df", "#8e9891");
  rect(ctx, x, y, width, height - 96, "#c8ceca", "#8e9891");
  rect(ctx, x + 12, y + 12, width - 24, 12, building.color);
  // Roof grid and front wall are placeholders, deliberately not final art.
  for (let lineY = y + 56; lineY < y + height - 96; lineY += 40) rect(ctx, x + 16, lineY, width - 32, 1, "#b7c0b9");
  label(ctx, building.label, x + width / 2, y + height / 2 - 24, 26);
  label(ctx, building.description, x + width / 2, y + height / 2 + 8, 16, "#6b5f58");
  for (const offset of [80, width - 120]) {
    rect(ctx, x + offset, y + height - 76, 40, 40, "#c0d0cd", "#8e9891");
    rect(ctx, x + offset + 19, y + height - 74, 2, 36, "#8e9891");
  }
  rect(ctx, building.entrance.x - 28, y + height - 72, 56, 72, building.color, "#53635b");
  rect(ctx, building.entrance.x + 14, y + height - 36, 4, 4, "#f5e9c6");
  label(ctx, "MASUK", building.entrance.x, building.entrance.y + 7, 12);
}

function drawTree(ctx, x, y) {
  rect(ctx, x - 12, y - 28, 24, 28, "#a49b88", "#858a77");
  rect(ctx, x - 42, y - 104, 84, 72, "#a5b99c", "#829b7d");
  rect(ctx, x - 28, y - 120, 56, 24, "#b1c2a8");
  rect(ctx, x + 12, y - 82, 30, 50, "#97ae90");
}

function drawFountain(ctx) {
  rect(ctx, 1240, 1056, 128, 128, "#c2c8ba");
  rect(ctx, 1232, 1040, 128, 128, "#c5ceca", "#879c95");
  rect(ctx, 1244, 1052, 104, 104, "#abc9cc", "#90adb2");
  rect(ctx, 1280, 1064, 32, 64, "#dde4df", "#8daba8");
  rect(ctx, 1264, 1060, 64, 16, "#dde4df", "#8daba8");
}

function drawBench(ctx, x) {
  rect(ctx, x + 8, 1072, 8, 20, "#8b9487");
  rect(ctx, x + 64, 1072, 8, 20, "#8b9487");
  rect(ctx, x, 1056, 80, 24, "#b7aa8d", "#968f7b");
  rect(ctx, x, 1044, 80, 8, "#c5b99d");
}

export function drawCharacter(ctx, player, moving, time, npc = false) {
  const { x, y, facing } = player;
  const step = moving ? Math.floor(time / 140) % 2 : 0;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.fillStyle = "#66756330";
  ctx.beginPath(); ctx.ellipse(0, -2, 15, 5, 0, 0, Math.PI * 2); ctx.fill();
  rect(ctx, -10, -22, 20, 14, npc ? "#7f92a8" : "#e84c2b");
  rect(ctx, -14, -22, 4, 12, "#ddbd9e");
  rect(ctx, 10, -22, 4, 12, "#ddbd9e");
  rect(ctx, -8, -8, 6, 7 - step * 2, "#455463");
  rect(ctx, 2, -8, 6, 5 + step * 2, "#455463");
  rect(ctx, -8, -2 - step * 2, 6, 3, "#344345");
  rect(ctx, 2, -4 + step * 2, 6, 3, "#344345");
  rect(ctx, -10, -42, 20, 20, "#ddbd9e");
  rect(ctx, -12, -46, 24, 8, npc ? "#d5d6c7" : "#3b464c");
  if (facing === "up") rect(ctx, -10, -40, 20, 16, npc ? "#c6cabd" : "#3b464c");
  else {
    rect(ctx, -12, -40, 4, 10, npc ? "#d5d6c7" : "#3b464c");
    rect(ctx, 8, -40, 4, 10, npc ? "#d5d6c7" : "#3b464c");
    if (facing !== "right") rect(ctx, -6, -33, 3, 3, "#394743");
    if (facing !== "left") rect(ctx, 3, -33, 3, 3, "#394743");
  }
  if (!npc) {
    ctx.strokeStyle = "#fff8f3";
    ctx.lineWidth = 2;
    ctx.strokeRect(-17, -50, 34, 54);
  }
  ctx.restore();
}

export function createRenderer(canvas, terrain, { buildings, environment: environmentImage, debug = false } = {}) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D tidak tersedia di browser ini.");
  const background = document.createElement("canvas");
  background.width = WORLD.width;
  background.height = WORLD.height;
  const ground = background.getContext("2d");
  if (!ground) throw new Error("Peta tidak dapat dibuat.");
  const environment = cacheEnvironment(environmentImage);
  drawGround(ground, terrain, environment);
  const frames = cacheBuildingFrames(buildings);
  const scenery = [
    ...BUILDINGS.map((b) => ({ depth: b.bounds.y + b.bounds.height, draw: () => {
      const frame = frames[b.id];
      if (!frame) { drawBuilding(ctx, b); return; }
      const p = BUILDING_LAYOUT.find((a) => a.id === b.id).proposedSprite;
      ctx.drawImage(frame, p.x, p.y);
      label(ctx, 'MASUK', b.entrance.x, b.entrance.y + 7, 12);
    } })),
    ...TREES.map(([x, y], i) => ({ depth: y, draw: () => {
      if (!drawEnvironmentSprite(ctx, environment, i % 4 === 1 ? 'oak_olive' : 'oak_green', x, y)) drawTree(ctx, x, y);
    } })),
    { depth: 1168, draw: () => { if (!drawEnvironmentSprite(ctx, environment, 'fountain', 1296, 1176)) drawFountain(ctx); } },
    { depth: 1084, draw: () => drawBench(ctx, 1064) },
    { depth: 1084, draw: () => drawBench(ctx, 1448) },
    ...ENVIRONMENT_PROPS.filter((p) => p.key !== 'fountain').map((p) => ({depth:p.depth, draw:()=>drawEnvironmentSprite(ctx,environment,p.key,p.x,p.y)})),
    { depth: GUIDE.y, draw: () => { drawCharacter(ctx, { ...GUIDE, facing: "down" }, false, 0, true); label(ctx, "Kak Aksa", GUIDE.x, GUIDE.y - 64, 14); } },
  ];

  return (player, camera, viewport, moving, time, nearby) => {
    const scale = viewport.dpr * viewport.zoom;
    ctx.setTransform(scale, 0, 0, scale, -camera.x * scale, -camera.y * scale);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(background, 0, 0);
    if (nearby) {
      ctx.strokeStyle = "#e84c2b";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(nearby.x, nearby.y, 38, 20, 0, 0, Math.PI * 2); ctx.stroke();
    }
    [...scenery, { depth: player.y, draw: () => drawCharacter(ctx, player, moving, time) }]
      .sort((a, b) => a.depth - b.depth).forEach((object) => object.draw());
    if (debug) { drawEnvironmentDebug(ctx); drawBuildingDebug(ctx); }
  };
}
