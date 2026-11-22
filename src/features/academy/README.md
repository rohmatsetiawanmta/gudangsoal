# Academy Cozy Village

Optional, login-only route: `/academy`. The Navbar entry is temporarily hidden
on desktop and mobile at the user's request; direct URLs still work. Guests
return to Academy after the existing login succeeds. No backend or
database changes are required.

## Playable scope

- One 80 × 60 map, 32px tiles. WASD/arrows move in four directions at 180px/s.
- Foot-radius collision against buildings, water, trees, benches and fountain.
- Camera follows the player within world bounds.
- E interacts with the nearest eligible entrance or guide; holding E does not
  repeatedly navigate. Dialogs and loss of canvas focus pause movement.
- M/Esc opens a modal quick menu. HTML destination buttons remain usable without
  game controls, including on small screens (touch movement is outside MVP).
- One guide with a three-part introduction. No quests, XP or multiplayer.
- Position/facing saved in sessionStorage per user + login timestamp, on exit,
  unmount and pagehide. Scene/map version, bounds and walkability are validated.
  Broken or unavailable storage falls back to the spawn point.

## Ownership

- `world.js`: world data, building registry, collision, interaction and camera.
- `game.js`: input, animation loop, resize and cleanup. Routes never enter here.
- `renderer.js`: Canvas props/buildings and four-direction placeholder character.
- `terrain.js` / `terrainLayout.js`: PNG/Tiled JSON loading, validation and visual terrain.
- `buildings.js` / `buildingLayout.json`: approved artwork, uniform cached frames, origins and entrance alignment.
- `environment.js` / `environmentLayout.json`: reusable atlas, planting, pond shoreline and visual-only placement.
- `academyState.js`: versioned player-state validation and persistence.
- `AcademyPage.jsx`: existing router/auth bridge and accessible HTML overlays.
- `../../components/AcademyRoute.jsx`: lazy import, loading and error isolation.
- Root `render.php` also recognises `/academy` and `/academy/`, so direct links
  return HTTP 200 through the existing Apache rewrite before React checks login.

Canvas is deliberately dependency-free for this prototype. Asset Pack 01 now
provides a deterministic pixel-art PNG tileset and a visual Tiled JSON map for
grass, stone paths and plaza flooring. See [ASSET_PACK_01.md](./ASSET_PACK_01.md)
for the inventory, generation commands, before/after screenshots, QA and remaining
visual issues. Pack 02's three approved building concepts are now integrated;
Pack 03 adds trees, planting, fountain, shoreline/water, lamps and signs.
Reports, inventories, metadata and actual runtime screenshots are in
`artifacts/academy/asset-pack-02/CONCEPT_REVIEW.md` and
`artifacts/academy/asset-pack-03/REPORT.md`. Character, benches and gate structures
remain placeholders. World dimensions, all 31 colliders, routes and 180px/s speed
remain unchanged. Runtime art is integrated for visual review, not declared final.

## Visual system

Academy UI follows the [matrohmatmath brand guide](https://claude.ai/artifact/FuixkUare8w53RdkehT3EE#readme):
Plus Jakarta Sans 500/700/800, orange `#E84C2B`, deep orange `#C23A1C`, paper
`#FFF8F3`, ink `#1F1A17`, strong borders and flat orange offset shadows. All CSS
tokens and heading overrides are scoped to Academy. The guide's Instagram sizes
are adapted to web controls; small primary-button text uses ink on orange for
contrast. Header, HUD, menus, dialogue and loading/error states share this style.
World artwork follows Cozy Academy Village; the HTML UI remains scoped to this brand.

The lazy `AcademyPage-*` JS/CSS and future `assets/academy/` files are excluded from
PWA precache. Normal pages do not eagerly import game modules. Offline entry into
an uncached Academy is not promised; the route provides retry and a normal exit.

## Verification

`npm run test:academy` checks reachability through collision to all three doors
and the NPC, obstacle clearance, tunnelling, interactions, camera bounds,
corrupt/blocked storage, account/session isolation, input cleanup and safe login
destinations. When PHP CLI is available it also tests the actual production
renderer with isolated dummy DB configuration, preserving unknown-route 404s.
`npm run build` also regenerates the PWA; inspect `dist/sw.js` to confirm Academy
chunks are absent from precache after changing bundling.

Browser smoke: guest → login → Academy; visit each entrance using E; return from
each normal page; use quick navigation; hold E; switch tabs while walking; open
and close guide/menu/help; reload; exit via browser Back; check module-load
failure and small viewport access. Real login requires a configured PHP API.

QA views: `/academy?academyDebug=1` shows collider/origin/entrance overlays;
`&academyOverview=1` fits the full world. These are opt-in render modes and do not
change world coordinates, saved state, interactions or the normal camera.
