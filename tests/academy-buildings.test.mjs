import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BUILDING_LAYOUT, validateBuildingAlignment, loadBuildings } from '../src/features/academy/buildings.js';
import { BUILDINGS, WORLD } from '../src/features/academy/world.js';
import { createRenderer } from '../src/features/academy/renderer.js';

test('approved building frames preserve colliders, route, front-edge origin and door-to-interaction axes', () => {
  assert.equal(validateBuildingAlignment(), true);
  for (const b of BUILDING_LAYOUT) {
    const p = b.proposedSprite, d = b.renderedDimensions, s = b.sourceCrop;
    assert.equal(p.width % 32, 0); assert.equal(p.height % 32, 0);
    assert.ok(p.x >= 0 && p.y >= 0 && p.x + p.width <= WORLD.width && p.y + p.height <= WORLD.height);
    assert.ok(d.x >= p.x && d.y >= p.y && d.x + d.width <= p.x + p.width && d.y + d.height <= p.y + p.height);
    assert.ok(Math.abs(d.width / s.width - d.height / s.height) < 1e-12, 'no aspect-ratio distortion');
    const scale = d.width / s.width;
    assert.ok(Math.abs(d.x + (b.sourceDoorEstimate.x - s.x) * scale - b.doorWorld.x) < 1e-9);
    assert.ok(Math.abs(d.y + (b.sourceDoorEstimate.y - s.y) * scale - b.doorWorld.y) < 1e-9);
    assert.equal(p.x + p.origin.x, b.collisionWorld.x + b.collisionWorld.width / 2);
    assert.equal(p.y + p.origin.y, b.depthY);
    const png = readFileSync(new URL('../public/' + b.source, import.meta.url));
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], b.sourceSize);
    assert.equal(png[25], 6, 'PNG RGBA');
  }
});

test('a failed or wrong-sized building falls back individually; cancellation releases image handlers', async () => {
  const created = [];
  class FakeImage {
    constructor() { created.push(this); }
    set src(value) { this.path = value; }
  }
  const pending = loadBuildings({ ImageConstructor: FakeImage });
  created[0].naturalWidth = BUILDING_LAYOUT[0].sourceSize[0]; created[0].naturalHeight = BUILDING_LAYOUT[0].sourceSize[1]; created[0].onload();
  created[1].onerror();
  created[2].naturalWidth = 1; created[2].naturalHeight = 1; created[2].onload();
  const loaded = await pending;
  assert.equal(loaded.question_hall, created[0]); assert.equal(loaded.profile_center, null); assert.equal(loaded.dormitory, null);
  const controller = new AbortController();
  const cancelled = loadBuildings({ signal: controller.signal, ImageConstructor: FakeImage });
  controller.abort(); await assert.rejects(cancelled, { name: 'AbortError' });
  for (const image of created) { assert.equal(image.onload, null); assert.equal(image.onerror, null); }
});

test('cached integer frames use nearest-neighbor once and depth-sort players in front/behind the hall', () => {
  const events = [], rasterDraws = [];
  const main = new Proxy({}, { get: (_, key) => (...args) => {
    if (key === 'drawImage' && args[0].assetId) events.push(args[0].assetId);
    if (key === 'translate') events.push('actor');
  } });
  let canvasIndex = 0;
  const contexts = [];
  const old = Object.getOwnPropertyDescriptor(globalThis, 'document');
  globalThis.document = { createElement: () => {
    const index = canvasIndex++, ctx = new Proxy({}, { get: (target, key) => key in target ? target[key] : (...args) => { if (key === 'drawImage' && index > 0) rasterDraws.push(args); } });
    contexts.push(ctx);
    return { assetId: index > 0 ? BUILDING_LAYOUT[index - 1].id : null, getContext: () => ctx };
  } };
  try {
    const terrain = { map: JSON.parse(readFileSync(new URL('../public/assets/academy/maps/academy_plaza_terrain.json', import.meta.url))), image: {} };
    const render = createRenderer({ getContext: () => main }, terrain, { buildings: Object.fromEntries(BUILDING_LAYOUT.map((b) => [b.id, {}])) });
    assert.equal(rasterDraws.length, 3);
    contexts.slice(1).forEach((ctx) => assert.equal(ctx.imageSmoothingEnabled, false));
    function drawAt(y) {
      events.length = 0;
      render({ x: 1296, y, facing: 'up' }, {x:0,y:0}, {dpr:1,zoom:1}, false, 0, null);
      return { hall: events.indexOf('question_hall'), player: events.lastIndexOf('actor') };
    }
    const front = drawAt(BUILDINGS[0].entrance.y); assert.ok(front.hall < front.player);
    // The guide is drawn much later; inspect the first actor when player is north.
    events.length = 0; render({ x:1296,y:140,facing:'down' }, {x:0,y:0}, {dpr:1,zoom:1}, false, 0, null);
    assert.ok(events.indexOf('actor') < events.indexOf('question_hall'));
    assert.equal(rasterDraws.length, 3, 'no per-frame source resampling');
  } finally { if (old) Object.defineProperty(globalThis, 'document', old); else delete globalThis.document; }
});
