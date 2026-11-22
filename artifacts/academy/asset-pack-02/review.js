import { createRenderer, drawCharacter } from "/src/features/academy/renderer.js";
import { loadTerrain, drawTerrain } from "/src/features/academy/terrain.js";
import { SPAWN, WORLD } from "/src/features/academy/world.js";

const byId = (id) => document.getElementById(id);
const mode = byId("mode"), guides = byId("guides");
function canvas(width = WORLD.width, height = WORLD.height) {
  const result = document.createElement("canvas");
  result.width = width; result.height = height;
  return result;
}
function image(path) {
  return new Promise((resolve, reject) => {
    const value = new Image(); value.onload = () => resolve(value);
    value.onerror = () => reject(new Error(`Concept image failed to load: ${path}`));
    value.src = new URL(path, import.meta.url).href;
  });
}

try {
  const [layout, terrain] = await Promise.all([
    fetch(new URL("concept-layout.json", import.meta.url)).then((r) => r.json()), loadTerrain(),
  ]);
  const images = await Promise.all(layout.buildings.map((b) => image(b.source)));
  await document.fonts.ready;
  const before = canvas(), after = canvas(), ground = canvas();
  const render = createRenderer(before, terrain);
  render(SPAWN, { x: 0, y: 0 }, { width: WORLD.width, height: WORLD.height, dpr: 1, zoom: 1 }, false, 0, null);
  drawTerrain(ground.getContext("2d"), terrain);
  const afterCtx = after.getContext("2d"); afterCtx.imageSmoothingEnabled = false;
  afterCtx.drawImage(before, 0, 0);
  // Clear only the old graybox building and its shadow with the SAME ground.
  // All source files and the actual /academy renderer remain untouched.
  layout.buildings.forEach((b) => {
    const r = b.collisionWorld;
    afterCtx.drawImage(ground, r.x - 2, r.y - 2, r.width + 20, r.height + 22,
      r.x - 2, r.y - 2, r.width + 20, r.height + 22);
  });
  layout.buildings.forEach((b, i) => {
    const s = b.sourceCrop, d = b.conceptPlacement.destination;
    afterCtx.drawImage(images[i], s.x, s.y, s.width, s.height, d.x, d.y, d.width, d.height);
  });

  function drawGuides(ctx, building) {
    const { collisionWorld: r, proposedSprite: p, interactionWorld: e, doorWorld: d } = building;
    ctx.save();
    ctx.setLineDash([9, 7]); ctx.lineWidth = 2; ctx.strokeStyle = "#6b5f58";
    ctx.strokeRect(p.x, p.y, p.width, p.height);
    ctx.setLineDash([]); ctx.strokeStyle = "#e84c2b"; ctx.lineWidth = 3;
    ctx.strokeRect(r.x, r.y, r.width, r.height);
    ctx.beginPath(); ctx.moveTo(d.x - 14, d.y); ctx.lineTo(d.x + 14, d.y); ctx.moveTo(d.x, d.y - 16); ctx.lineTo(d.x, e.y + 12); ctx.stroke();
    ctx.strokeStyle = "#2b5be3"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(e.x, e.y, 64, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#2b5be3"; ctx.fillRect(e.x - 4, e.y - 4, 8, 8);
    ctx.restore();
  }

  function currentWorld(showGuides = guides.checked) {
    const output = canvas(), ctx = output.getContext("2d"); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(mode.value === "before" ? before : after, 0, 0);
    if (showGuides) layout.buildings.forEach((b) => drawGuides(ctx, b));
    return output;
  }

  function redraw() {
    const scene = currentWorld();
    const main = byId("map-preview").getContext("2d"); main.imageSmoothingEnabled = false;
    main.clearRect(0, 0, WORLD.width, WORLD.height); main.drawImage(scene, 0, 0);
    layout.buildings.forEach((b) => {
      const target = byId(`${b.id.replaceAll("_", "-")}-preview`);
      const r = b.collisionWorld;
      const view = { x: r.x - 64, y: Math.max(0, r.y - 160), width: r.width + 128, height: r.height + 224 };
      const zoom = 1.25;
      target.width = view.width * zoom; target.height = view.height * zoom;
      const ctx = target.getContext("2d"); ctx.imageSmoothingEnabled = false;
      ctx.setTransform(zoom, 0, 0, zoom, -view.x * zoom, -view.y * zoom);
      ctx.drawImage(scene, 0, 0);
      drawCharacter(ctx, { ...b.interactionWorld, y: b.interactionWorld.y + 12, facing: "up" }, false, 0);
    });
  }

  const sheet = byId("concept-sheet"), sheetCtx = sheet.getContext("2d");
  sheetCtx.imageSmoothingEnabled = false;
  sheetCtx.fillStyle = "#fff8f3"; sheetCtx.fillRect(0, 0, sheet.width, sheet.height);
  layout.buildings.forEach((b, i) => {
    const s = b.sourceCrop;
    const scale = b.conceptPlacement.uniformScale * 0.67;
    const w = s.width * scale, h = s.height * scale;
    const x = i * 512 + (512 - w) / 2, y = 530 - h;
    sheetCtx.drawImage(images[i], s.x, s.y, s.width, s.height, x, y, w, h);
    sheetCtx.fillStyle = "#1f1a17"; sheetCtx.font = "800 25px 'Plus Jakarta Sans'"; sheetCtx.textAlign = "center";
    sheetCtx.fillText(b.label, i * 512 + 256, 585);
    sheetCtx.fillStyle = "#6b5f58"; sheetCtx.font = "500 19px 'Plus Jakarta Sans'";
    sheetCtx.fillText(`${b.proposedSprite.width} × ${b.proposedSprite.height} · ${b.route}`, i * 512 + 256, 623);
  });
  mode.addEventListener("change", redraw); guides.addEventListener("change", redraw);
  redraw();
  document.body.dataset.ready = "true";
  byId("loading").textContent = "Preview konsep siap";
} catch (error) {
  byId("loading").textContent = error.message;
  document.body.dataset.ready = "error";
}
