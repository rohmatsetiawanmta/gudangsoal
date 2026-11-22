import test from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { BUILDINGS, getCamera, getInteraction, GUIDE, isWalkable, movePlayer, OBSTACLES, PLAYER_RADIUS, SPAWN, WORLD } from "../src/features/academy/world.js";
import { defaultState, getStorageKey, loadState, saveState, validateState } from "../src/features/academy/academyState.js";
import { getLoginDestination } from "../src/features/auth/loginDestination.js";
import { createAcademyGame } from "../src/features/academy/game.js";

test("all three entrances and the guide are reachable from spawn without crossing collision", () => {
  // Flood-fill a 16px navigation grid and validate the edges with the actual
  // movement function, including foot-radius clearance. This catches blocked
  // doors and accidental obstacles placed across the only route.
  const spacing = 16;
  const queue = [{ ...SPAWN }];
  const visited = new Set([`${SPAWN.x},${SPAWN.y}`]);
  const reached = new Set();
  for (let index = 0; index < queue.length; index++) {
    const point = queue[index];
    const target = getInteraction(point);
    if (target) reached.add(target.id);
    if (reached.size === BUILDINGS.length + 1) break;
    for (const [dx, dy] of [[spacing, 0], [-spacing, 0], [0, spacing], [0, -spacing]]) {
      const next = { x: point.x + dx, y: point.y + dy };
      const key = `${next.x},${next.y}`;
      if (visited.has(key) || !isWalkable(next)) continue;
      const moved = movePlayer(point, dx, dy);
      if (Math.hypot(moved.x - next.x, moved.y - next.y) > 0.01) continue;
      visited.add(key);
      queue.push(next);
    }
  }
  assert.deepEqual([...reached].sort(), [...BUILDINGS.map((b) => b.id), GUIDE.id].sort());
});

test("foot collision blocks buildings, trees, water, fountain, and world edges", () => {
  assert.equal(isWalkable(SPAWN), true);
  for (const obstacle of OBSTACLES) {
    assert.equal(isWalkable({ x: obstacle.x + obstacle.width / 2, y: obstacle.y + obstacle.height / 2 }), false, obstacle.id);
  }
  for (const point of [{ x: -1, y: 200 }, { x: WORLD.width, y: 200 }, { x: 200, y: -1 }, { x: 200, y: WORLD.height }, { x: NaN, y: 200 }]) {
    assert.equal(isWalkable(point), false);
  }
});

test("large movement steps cannot tunnel through a building or the fountain", () => {
  const hall = BUILDINGS[0];
  const againstHall = movePlayer({ ...hall.entrance, facing: "up" }, 0, -2000);
  assert.ok(againstHall.y >= hall.bounds.y + hall.bounds.height + PLAYER_RADIUS);
  assert.ok(isWalkable(againstHall));
  const againstFountain = movePlayer(SPAWN, 0, -900);
  assert.ok(againstFountain.y >= 1168 + PLAYER_RADIUS);
});

test("interaction has one target only, within reach, with exactly the confirmed routes", () => {
  assert.deepEqual(BUILDINGS.map((b) => b.route), ["/browse", "/profile", "/home"]);
  assert.equal(getInteraction(SPAWN), null);
  for (const building of BUILDINGS) {
    assert.equal(getInteraction(building.entrance)?.id, building.id);
    assert.equal(getInteraction({ x: building.entrance.x, y: building.entrance.y + 65 }), null);
  }
});

test("camera stays inside the world at every edge", () => {
  const width = 1024, height = 576;
  for (const player of [{ x: 0, y: 0 }, SPAWN, { x: WORLD.width, y: WORLD.height }]) {
    const camera = getCamera(player, width, height);
    assert.ok(camera.x >= 0 && camera.y >= 0);
    assert.ok(camera.x + width <= WORLD.width && camera.y + height <= WORLD.height);
  }
});

test("restoration accepts only valid, walkable, versioned state and strips extra fields", () => {
  const state = { ...defaultState(), player: { x: 1296, y: 1400, facing: "left", token: "not-player-state" }, extra: true };
  assert.deepEqual(validateState(state), { ...defaultState(), player: { x: 1296, y: 1400, facing: "left" } });
  const invalid = [null, {}, { ...state, sceneId: "old_scene" }, { ...state, version: 0 }, { ...state, player: { ...SPAWN, facing: "diagonal" } }, { ...state, player: { x: 1296, y: 1104, facing: "up" } }, { ...state, player: { ...SPAWN, x: "1296" } }];
  for (const value of invalid) assert.deepEqual(validateState(value), defaultState());
});

test("saved positions are isolated by account/session, and blocked/corrupt storage falls back safely", () => {
  const data = new Map();
  const storage = { getItem: (key) => data.get(key), setItem: (key, value) => data.set(key, value) };
  const key = getStorageKey(1, 1000);
  const state = { ...defaultState(), player: { x: 1296, y: 1400, facing: "left" } };
  saveState(key, state, storage);
  assert.deepEqual(loadState(key, storage), { state, restored: true });
  assert.equal(loadState(getStorageKey(2, 1000), storage).restored, false);
  assert.equal(loadState(getStorageKey(1, 2000), storage).restored, false);
  storage.setItem(key, "invalid json");
  assert.deepEqual(loadState(key, storage), { state: defaultState(), restored: false });
  storage.setItem(key, JSON.stringify({ ...defaultState(), version: 0 }));
  assert.equal(loadState(key, storage).restored, false);
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.doesNotThrow(() => saveState(key, state, blocked));
  assert.deepEqual(loadState(key, blocked), { state: defaultState(), restored: false });
});

test("login returns to Academy only when requested and never accepts an external redirect", () => {
  assert.equal(getLoginDestination("/academy"), "/academy");
  for (const value of [undefined, "/home", "//example.com", "https://example.com", "/academy/../admin"]) {
    assert.equal(getLoginDestination(value), "/home");
  }
});

test("game input pauses on focus loss/dialogs, ignores held E, and cleans up on leave", () => {
  function eventTarget() {
    const listeners = new Map();
    return {
      addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn); },
      removeEventListener(type, fn) { listeners.get(type)?.delete(fn); },
      dispatch(type, extra = {}) { for (const fn of listeners.get(type) ?? []) fn({ key: "", preventDefault() {}, ...extra }); },
      count() { return [...listeners.values()].reduce((total, set) => total + set.size, 0); },
    };
  }
  const ctx = new Proxy({}, { get: () => () => {} });
  const fakeDocument = { ...eventTarget(), hidden: false, createElement: () => ({ getContext: () => ctx }) };
  const fakeWindow = { ...eventTarget(), devicePixelRatio: 1 };
  const canvas = { ...eventTarget(), getContext: () => ctx, getBoundingClientRect: () => ({ width: 1000, height: 700 }), focus() {} };
  const frames = new Map();
  let nextFrame = 0, disconnected = false;
  const globals = {
    window: fakeWindow, document: fakeDocument,
    ResizeObserver: class { observe() {} disconnect() { disconnected = true; } },
    requestAnimationFrame: (fn) => { frames.set(++nextFrame, fn); return nextFrame; },
    cancelAnimationFrame: (id) => frames.delete(id),
  };
  const originals = new Map(Object.keys(globals).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(globalThis, globals);
  function frame(time) { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach((fn) => fn(time)); }
  let interactions = 0, menus = 0, ready = 0, game;
  try {
    game = createAcademyGame(canvas, {
      terrain: { map: JSON.parse(readFileSync(new URL("../public/assets/academy/maps/academy_plaza_terrain.json", import.meta.url), "utf8")), image: {} },
      initialState: { ...defaultState(), player: { ...BUILDINGS[0].entrance, facing: "up" } },
      onUpdate() {}, onInteract: () => { interactions++; }, onMenu: () => { menus++; }, onReady: () => { ready++; }, onError: (error) => { throw error; },
    });
    game.focus();
    frame(1000);
    assert.equal(ready, 1);
    canvas.dispatch("keydown", { key: "e", repeat: false });
    canvas.dispatch("keydown", { key: "e", repeat: true });
    assert.equal(interactions, 1);
    canvas.dispatch("keydown", { key: "s" });
    frame(1050);
    assert.equal(game.getState().player.y, BUILDINGS[0].entrance.y + 9);
    // Key releases still arrive if browser focus has moved outside the canvas.
    fakeWindow.dispatch("keyup", { key: "s" });
    const stoppedY = game.getState().player.y;
    frame(1100);
    assert.equal(game.getState().player.y, stoppedY);
    canvas.dispatch("keydown", { key: "s" });
    fakeWindow.dispatch("blur");
    frame(1150);
    assert.equal(game.getState().player.y, stoppedY);
    game.focus();
    canvas.dispatch("keydown", { key: "s" });
    canvas.dispatch("keydown", { key: "m", repeat: false });
    frame(1200);
    assert.equal(menus, 1);
    assert.equal(game.getState().player.y, stoppedY);
    game.focus();
    canvas.dispatch("keydown", { key: "s" });
    fakeDocument.hidden = true;
    fakeDocument.dispatch("visibilitychange");
    frame(1250);
    assert.equal(game.getState().player.y, stoppedY);
    game.stop();
    assert.equal(canvas.count() + fakeWindow.count() + fakeDocument.count(), 0);
    assert.equal(frames.size, 0);
    assert.equal(disconnected, true);
  } finally {
    game?.stop();
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});

test("production PHP renderer serves direct Academy URLs without changing unknown-route 404s", { skip: spawnSync("php", ["-v"]).error ? "PHP CLI is unavailable" : false }, () => {
  const fixture = mkdtempSync(join(tmpdir(), "academy-render-"));
  try {
    // Run the actual renderer with an isolated config. Never read real database
    // credentials: port 1 prevents a connection to a running local MySQL server.
    mkdirSync(join(fixture, "api"));
    writeFileSync(join(fixture, "api", ".env"), 'DB_HOST="127.0.0.1;port=1"\nDB_NAME="academy_qa"\nDB_USER="academy_qa"\nDB_PASS="local_qa_only"\n');
    copyFileSync(new URL("../render.php", import.meta.url), join(fixture, "render.php"));
    copyFileSync(new URL("../index.html", import.meta.url), join(fixture, "index.html"));
    const runner = '$_SERVER["REQUEST_URI"]=$argv[1]; ob_start(); require $argv[2]; $html=ob_get_clean(); echo json_encode(["status"=>http_response_code(),"hasRoot"=>str_contains($html, "id=\\\"root\\\"")]);';
    for (const [route, expected] of [["/academy", 200], ["/academy/", 200], ["/browse", 200], ["/does-not-exist", 404]]) {
      const result = spawnSync("php", ["-r", runner, route, join(fixture, "render.php")], { encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr);
      assert.deepEqual(JSON.parse(result.stdout), { status: expected, hasRoot: true }, route);
    }
  } finally { rmSync(fixture, { recursive: true, force: true }); }
});
