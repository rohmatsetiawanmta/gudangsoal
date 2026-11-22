import layout from './environmentLayout.json' with { type: 'json' };
import { OBSTACLES, PONDS, TREES, WORLD } from './world.js';

export const ENVIRONMENT_LAYOUT = layout;

// Low planting is deliberately walk-through ground cover. Solid-looking posts
// reuse existing bench/gate/tree colliders; no environment asset adds collision.
export const ENVIRONMENT_PROPS = [
  { key: 'fountain', x: 1296, y: 1176, depth: 1168, collider: 'fountain' },
  { key: 'lamp', x: 1078, y: 1080, depth: 1084, collider: 'bench_west' },
  { key: 'lamp', x: 1514, y: 1080, depth: 1084, collider: 'bench_east' },
  { key: 'lamp', x: 1204, y: 1840, depth: 1872, collider: 'gate_west' },
  { key: 'lamp', x: 1388, y: 1840, depth: 1872, collider: 'gate_east' },
  { key: 'signpost', x: 376, y: 614, depth: 620, collider: 'tree_18' },
  { key: 'signpost', x: 840, y: 1350, depth: 1356, collider: 'tree_9' },
  { key: 'signpost', x: 1704, y: 1366, depth: 1372, collider: 'tree_10' },
];

export const GROUND_PLANTING = [
  ...Array.from({ length: 24 }, (_, i) => ({ key: 'hedge', x: 112 + i * 96, y: 40 })),
  ...Array.from({ length: 24 }, (_, i) => ({ key: 'hedge', x: 112 + i * 96, y: 1900 })).filter((p)=>p.x < 1216 || p.x > 1408),
  ...[160, 352, 544, 736, 928, 1120, 1312, 1504, 1696].flatMap((y) => [
    { key: 'flowering_bush', x: 24, y }, { key: 'flowering_bush', x: 2536, y },
  ]),
  ...[
    [1008,608],[1136,608],[1456,608],[1584,608],
    [240,1120],[368,1120],[688,1120],[1872,1120],[2256,1120],[2384,1120],
    [1072,864],[1520,864],[1008,944],[1584,944],[1008,1264],[1584,1264],
    [1120,1424],[1472,1424],[1120,1552],[1472,1552],[1120,1680],[1472,1680],
  ].map(([x,y]) => ({ key: 'flowerbed', x, y })),
  ...[
    [672,352],[800,400],[1920,320],[2112,304],[2272,368],
    [256,544],[592,592],[1952,608],[2304,544],
    [240,1328],[432,1408],[624,1296],[752,1504],[960,1584],
    [1696,1552],[1888,1456],[1984,1280],[2304,1248],[2496,1376],
    [304,1648],[448,1568],[608,1824],[928,1808],[1600,1808],[1984,1856],[2272,1760],
  ].map(([x,y]) => ({ key: 'flowering_bush', x, y })),
];

export async function loadEnvironment({ signal, ImageConstructor = globalThis.Image } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException('Cancelled', 'AbortError')); return; }
    const image = new ImageConstructor();
    function cleanup() { image.onload = image.onerror = null; signal?.removeEventListener('abort', cancel); }
    function cancel() { cleanup(); image.src = ''; reject(new DOMException('Cancelled', 'AbortError')); }
    image.onload = () => {
      cleanup(); resolve(image.naturalWidth === layout.sourceSize[0] && image.naturalHeight === layout.sourceSize[1] ? image : null);
    };
    image.onerror = () => { cleanup(); resolve(null); };
    signal?.addEventListener('abort', cancel, { once: true });
    image.src = `${import.meta.env?.BASE_URL || '/'}${layout.source}?v=03.1`;
  });
}

export function cacheEnvironment(image) {
  if (!image) return null;
  const sprites = Object.fromEntries(layout.sprites.map((s) => {
    const frame = document.createElement('canvas'); frame.width = s.frame.width; frame.height = s.frame.height;
    const ctx = frame.getContext('2d'), crop = s.source, w = crop.width * s.scale, h = crop.height * s.scale;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, (frame.width-w)/2, s.origin.y-h, w, h);
    return [s.key, { frame, origin: s.origin }];
  }));
  return { image, sprites };
}

export function drawEnvironmentSprite(ctx, environment, key, x, y) {
  const sprite = environment?.sprites[key];
  if (!sprite) return false;
  ctx.drawImage(sprite.frame, Math.round(x - sprite.origin.x), Math.round(y - sprite.origin.y));
  return true;
}

export function drawEnvironmentGround(ctx, environment) {
  if (!environment) return;
  for (const p of GROUND_PLANTING) drawEnvironmentSprite(ctx, environment, p.key, p.x, p.y);
}

// Nine-slice shoreline from the atlas; water uses native pixel primitives.
// The source water contains shading that produced visible seams when repeated,
// so the cached 32px water cells share one exact base color at every border.
// All rendering is cached in the ground canvas, never rebuilt per animation frame.
export function drawEnvironmentPond(ctx, environment, pond) {
  if (!environment) return false;
  const s = layout.sprites.find((v) => v.key === 'pond_patch').source;
  const {x,y,width:w,height:h} = pond, edge=16, sourceEdge=40;
  const image=environment.image, centerX=s.x+s.width/2, centerY=s.y+s.height/2;
  ctx.fillStyle='#389b9c'; ctx.fillRect(x,y,w,h);
  ctx.save(); ctx.beginPath(); ctx.rect(x+edge,y+edge,w-edge*2,h-edge*2); ctx.clip();
  for(let dy=edge;dy<h-edge;dy+=32) for(let dx=edge;dx<w-edge;dx+=32) {
    const seed=(dx*17+dy*31)>>>0;
    ctx.fillStyle='#42a3a4'; ctx.fillRect(x+dx+4+(seed%7),y+dy+8,10,1);
    if ((seed>>>5)%3===0) {
      ctx.fillStyle='#83cbc6'; ctx.fillRect(x+dx+8+(seed%9),y+dy+18,6,1);
    }
  }
  ctx.restore();
  const draw=(sx,sy,sw,sh,dx,dy,dw,dh)=>ctx.drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh);
  for(const [sx,dx] of [[s.x,x],[s.x+s.width-sourceEdge,x+w-edge]]) {
    for(const [sy,dy] of [[s.y,y],[s.y+s.height-sourceEdge,y+h-edge]]) draw(sx,sy,sourceEdge,sourceEdge,dx,dy,edge,edge);
  }
  for(let dx=edge;dx<w-edge;dx+=32) {
    const width=Math.min(32,w-edge-dx);
    draw(centerX-32,s.y,64*width/32,sourceEdge,x+dx,y,width,edge);
    draw(centerX-32,s.y+s.height-sourceEdge,64*width/32,sourceEdge,x+dx,y+h-edge,width,edge);
  }
  for(let dy=edge;dy<h-edge;dy+=32) {
    const height=Math.min(32,h-edge-dy);
    draw(s.x,centerY-32,sourceEdge,64*height/32,x,y+dy,edge,height);
    draw(s.x+s.width-sourceEdge,centerY-32,sourceEdge,64*height/32,x+w-edge,y+dy,edge,height);
  }
  return true;
}

export function drawEnvironmentDebug(ctx) {
  ctx.save(); ctx.lineWidth=1; ctx.strokeStyle='#fc69e5';
  OBSTACLES.forEach((r)=>ctx.strokeRect(r.x,r.y,r.width,r.height));
  ctx.strokeStyle='#83e997'; ctx.setLineDash([3,4]);
  GROUND_PLANTING.forEach((p)=>{
    const s=layout.sprites.find((v)=>v.key===p.key);
    ctx.strokeRect(p.x-s.origin.x,p.y-s.origin.y,s.frame.width,s.frame.height);
  });
  ctx.restore();
}

export function environmentMetadata() {
  return { ...layout, world: WORLD, water:{tileSize:32,shorelineWidth:16,sourceEdge:40,rendering:'native Canvas pixel cells with identical base-color borders; nine-slice atlas shoreline'}, trees: TREES.map(([x,y],i)=>({key:i%4===1?'oak_olive':'oak_green',x,y,depth:y,collider:`tree_${i}`})), ponds:PONDS, props:ENVIRONMENT_PROPS, groundPlanting:GROUND_PLANTING };
}
