import { createRenderer } from "./renderer.js";
import { getCamera, getInteraction, getLocation, movePlayer, PLAYER_SPEED, WORLD } from "./world.js";

const DIRECTIONS = {
  w: { x: 0, y: -1, facing: "up" }, arrowup: { x: 0, y: -1, facing: "up" },
  s: { x: 0, y: 1, facing: "down" }, arrowdown: { x: 0, y: 1, facing: "down" },
  a: { x: -1, y: 0, facing: "left" }, arrowleft: { x: -1, y: 0, facing: "left" },
  d: { x: 1, y: 0, facing: "right" }, arrowright: { x: 1, y: 0, facing: "right" },
};

export function createAcademyGame(canvas, { terrain, buildings, environment, debug = false, overview = false, initialState, onUpdate, onInteract, onMenu, onReady, onError }) {
  const render = createRenderer(canvas, terrain, { buildings, environment, debug });
  let player = { ...initialState.player };
  let viewport;
  let paused = true;
  let stopped = false;
  let frame;
  let previousTime = 0;
  let lastUpdate = 0;
  let lastSignature = "";
  let ready = false;
  const keys = new Set();

  function getState() { return { worldId: WORLD.id, sceneId: WORLD.sceneId, version: WORLD.version, player: { ...player } }; }

  function publish(force = false) {
    const nearby = getInteraction(player);
    const location = getLocation(player);
    const signature = `${Math.round(player.x)},${Math.round(player.y)},${player.facing},${paused},${nearby?.id}`;
    if (force || signature !== lastSignature) {
      lastSignature = signature;
      onUpdate({ player: { ...player }, nearby, location, focused: !paused });
    }
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(1, bounds.width);
    const height = Math.max(1, bounds.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Explicit QA overview only; the normal camera/zoom policy stays unchanged.
    const zoom = overview ? Math.min(width / WORLD.width, height / WORLD.height) : width < 700 ? 1 : 1.25;
    viewport = { width: Math.min(WORLD.width, width / zoom), height: Math.min(WORLD.height, height / zoom), zoom, dpr };
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  function pause() { paused = true; keys.clear(); publish(); }
  function focus() {
    if (document.hidden) return;
    paused = false;
    canvas.focus({ preventScroll: true });
    publish();
  }

  function keyDown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const key = event.key.toLowerCase();
    if (DIRECTIONS[key]) {
      event.preventDefault();
      if (!paused) { keys.delete(key); keys.add(key); }
    } else if (key === "e" && !event.repeat && !paused) {
      event.preventDefault();
      const nearby = getInteraction(player);
      if (nearby) onInteract(nearby, getState());
    } else if ((key === "m" || key === "escape") && !event.repeat) {
      event.preventDefault();
      pause();
      onMenu();
    }
  }
  function keyUp(event) { keys.delete(event.key.toLowerCase()); }
  function visibility() { if (document.hidden) pause(); }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  canvas.addEventListener("keydown", keyDown);
  canvas.addEventListener("keyup", keyUp);
  canvas.addEventListener("pointerdown", focus);
  canvas.addEventListener("focus", focus);
  canvas.addEventListener("blur", pause);
  window.addEventListener("keyup", keyUp);
  window.addEventListener("blur", pause);
  document.addEventListener("visibilitychange", visibility);
  resize();
  publish(true);

  function tick(time) {
    if (stopped) return;
    try {
      const dt = Math.min((time - (previousTime || time)) / 1000, 0.05);
      previousTime = time;
      const direction = !paused && DIRECTIONS[[...keys].at(-1)];
      const before = player;
      if (direction) {
        player = movePlayer({ ...player, facing: direction.facing }, direction.x * PLAYER_SPEED * dt, direction.y * PLAYER_SPEED * dt);
      }
      const moving = player.x !== before.x || player.y !== before.y;
      const camera = getCamera(player, viewport.width, viewport.height);
      render(player, camera, viewport, moving, time, getInteraction(player));
      if (!ready) { ready = true; onReady(); }
      if (time - lastUpdate > 100) { publish(); lastUpdate = time; }
      frame = requestAnimationFrame(tick);
    } catch (error) {
      pause();
      stopped = true;
      onError(error);
    }
  }
  frame = requestAnimationFrame(tick);

  return {
    getState, pause, focus,
    stop() {
      stopped = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("keydown", keyDown);
      canvas.removeEventListener("keyup", keyUp);
      canvas.removeEventListener("pointerdown", focus);
      canvas.removeEventListener("focus", focus);
      canvas.removeEventListener("blur", pause);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", visibility);
      keys.clear();
    },
  };
}
