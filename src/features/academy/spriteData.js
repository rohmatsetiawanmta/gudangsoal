// src/features/academy/spriteData.js
// Pixel-art sprite definitions (grid of letters → palette colors), no image assets.

export const STUDENT_PALETTE = {
  B: "#4a3222", // hair
  H: "#f4c9a0", // skin
  E: "#1a1a1a", // eyes
  S: "#e84c2b", // shirt (brand red)
  W: "#ffffff", // shirt stripe
  P: "#1a2a4a", // pants
  D: "#2a2a2a", // shoes
};

export const STUDENT_IDLE = [
  "..BBBBBB..",
  ".BBBBBBBB.",
  ".BHHHHHHB.",
  ".HHHHHHHH.",
  ".HHEHHEHH.",
  ".HHHHHHHH.",
  "..HHHHHH..",
  ".SSSSSSSS.",
  "SSSSSSSSSS",
  "SSSSSSSSSS",
  ".SSSSSSSS.",
  ".SSWWWWSS.",
  "..PPPPPP..",
  "..PP..PP..",
  "..PP..PP..",
  ".DD....DD.",
];

// Walk cycle: two frames with legs staggered outward.
export const STUDENT_WALK_A = [
  ...STUDENT_IDLE.slice(0, 12),
  ".PP....PP.",
  ".PP....PP.",
  "DD......DD",
  "..........",
];

export const STUDENT_WALK_B = [
  ...STUDENT_IDLE.slice(0, 12),
  "..PP..PP..",
  "...PPPP...",
  "..D....D..",
  "..........",
];

export const NPC_PALETTE = {
  B: "#9a9a9a", // grey hair
  H: "#f4c9a0", // skin
  E: "#1a1a1a", // eyes
  R: "#2d3a6b", // robe (navy)
  D: "#2a2a2a", // shoes
};

export const NPC_IDLE = [
  "..BBBBBB..",
  ".BBBBBBBB.",
  ".BHHHHHHB.",
  ".HHHHHHHH.",
  ".HHEHHEHH.",
  ".HHHHHHHH.",
  "..HHHHHH..",
  ".RRRRRRRR.",
  "RRRRRRRRRR",
  "RRRRRRRRRR",
  "RRRRRRRRRR",
  "RRRRRRRRRR",
  "RRRRRRRRRR",
  "RRRRRRRRRR",
  ".RR....RR.",
  ".DD....DD.",
];
