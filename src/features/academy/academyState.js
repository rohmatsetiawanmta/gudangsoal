import { WORLD, SPAWN, isWalkable } from "./world.js";

const FACINGS = new Set(["up", "down", "left", "right"]);

export function defaultState() {
  return { worldId: WORLD.id, sceneId: WORLD.sceneId, version: WORLD.version, player: { ...SPAWN } };
}

function isValidState(value) {
  return Boolean(value && value.worldId === WORLD.id && value.sceneId === WORLD.sceneId && value.version === WORLD.version
    && value.player && FACINGS.has(value.player.facing) && isWalkable(value.player));
}

export function validateState(value) {
  if (!isValidState(value)) return defaultState();
  const { x, y, facing } = value.player;
  return { worldId: WORLD.id, sceneId: WORLD.sceneId, version: WORLD.version, player: { x, y, facing } };
}

export function getStorageKey(userId, loginAt) {
  return `academy:v${WORLD.version}:${userId}:${loginAt}`;
}

function browserStorage() {
  try { return globalThis.sessionStorage; } catch { return null; }
}

export function loadState(key, storage = browserStorage()) {
  try {
    const raw = storage?.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    const state = validateState(parsed);
    return { state, restored: isValidState(parsed) };
  } catch {
    return { state: defaultState(), restored: false };
  }
}

export function saveState(key, state, storage = browserStorage()) {
  try {
    storage?.setItem(key, JSON.stringify(validateState(state)));
  } catch {
    // Storage disabled/full: exploration and route navigation still work.
  }
}
