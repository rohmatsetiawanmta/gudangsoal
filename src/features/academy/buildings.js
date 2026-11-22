import layout from './buildingLayout.json' with { type: 'json' };
import { BUILDINGS } from './world.js';

export const BUILDING_LAYOUT = layout.buildings;

// A visual-only registry: every collider and interaction remains owned by world.js.
export function validateBuildingAlignment() {
  for (const asset of BUILDING_LAYOUT) {
    const building = BUILDINGS.find((b) => b.id === asset.id);
    const p = asset.proposedSprite, c = p.collisionLocal, door = p.doorLocal;
    if (!building || building.route !== asset.route
      || p.x + c.x !== building.bounds.x || p.y + c.y !== building.bounds.y
      || c.width !== building.bounds.width || c.height !== building.bounds.height
      || p.x + door.x !== building.entrance.x || p.y + door.y !== building.bounds.y + building.bounds.height
      || building.entrance.y - (p.y + door.y) !== 48) {
      throw new Error(`Building alignment differs from the existing world: ${asset.id}`);
    }
  }
  return true;
}

export async function loadBuildings({ signal, ImageConstructor = globalThis.Image } = {}) {
  validateBuildingAlignment();
  const results = await Promise.all(BUILDING_LAYOUT.map((asset) => new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException('Cancelled', 'AbortError')); return; }
    const image = new ImageConstructor();
    function cleanup() { image.onload = image.onerror = null; signal?.removeEventListener('abort', cancel); }
    function cancel() { cleanup(); image.src = ''; reject(new DOMException('Cancelled', 'AbortError')); }
    image.onload = () => {
      cleanup();
      const valid = image.naturalWidth === asset.sourceSize[0] && image.naturalHeight === asset.sourceSize[1];
      resolve([asset.id, valid ? image : null]);
    };
    image.onerror = () => { cleanup(); resolve([asset.id, null]); };
    signal?.addEventListener('abort', cancel, { once: true });
    image.src = `${import.meta.env?.BASE_URL || '/'}${asset.source}?v=02.1`;
  })));
  return Object.fromEntries(results);
}

export function cacheBuildingFrames(images = {}) {
  return Object.fromEntries(BUILDING_LAYOUT.filter((b) => images[b.id]).map((b) => {
    const frame = document.createElement('canvas'), p = b.proposedSprite;
    frame.width = p.width; frame.height = p.height;
    const ctx = frame.getContext('2d'), s = b.sourceCrop, d = b.renderedDimensions;
    ctx.imageSmoothingEnabled = false;
    // Uniform resampling happens once. The source PNG is never rewritten.
    ctx.drawImage(images[b.id], s.x, s.y, s.width, s.height,
      d.x - p.x, d.y - p.y, d.width, d.height);
    return [b.id, frame];
  }));
}

export function drawBuildingDebug(ctx) {
  ctx.save();
  ctx.font = 'bold 13px monospace'; ctx.textAlign = 'left'; ctx.lineWidth = 2;
  for (const b of BUILDING_LAYOUT) {
    const p = b.proposedSprite, c = b.collisionWorld, e = b.interactionWorld, d = b.doorWorld;
    ctx.strokeStyle = '#f5f0ff'; ctx.setLineDash([8, 6]); ctx.strokeRect(p.x, p.y, p.width, p.height);
    ctx.setLineDash([]); ctx.strokeStyle = '#e84c2b'; ctx.strokeRect(c.x, c.y, c.width, c.height);
    ctx.strokeStyle = '#23c8ce';
    ctx.beginPath(); ctx.arc(e.x, e.y, 64, 0, Math.PI * 2); ctx.moveTo(d.x, d.y); ctx.lineTo(e.x, e.y); ctx.stroke();
    ctx.fillStyle = '#23c8ce'; ctx.fillRect(e.x - 4, e.y - 4, 8, 8);
    ctx.strokeStyle = '#ffdf55'; const o = b.originWorld;
    ctx.beginPath(); ctx.moveTo(o.x - 12, o.y); ctx.lineTo(o.x + 12, o.y); ctx.moveTo(o.x, o.y - 12); ctx.lineTo(o.x, o.y + 12); ctx.stroke();
    ctx.fillStyle = '#171521'; ctx.fillRect(c.x, c.y - 24, 290, 20);
    ctx.fillStyle = '#fff8f3'; ctx.fillText(`${b.id} · ${p.width}x${p.height}`, c.x + 4, c.y - 10);
  }
  ctx.restore();
}
