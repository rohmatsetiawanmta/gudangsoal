// src/features/admin/AdminThumbnail.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Helmet } from "react-helmet-async";
import { Download, Sparkles, Lightbulb, TrendingUp } from "lucide-react";
import useWindowWidth from "../../hooks/useWindowWidth";

const CW = 1280;
const CH = 720;

const SCHEMES = [
  { id: "red",    label: "Merah",  accent: "#e84c2b", glowA: "rgba(232,76,43,0.45)",  glowB: "rgba(232,76,43,0.18)",  dark: "#1a0805" },
  { id: "blue",   label: "Biru",   accent: "#2563eb", glowA: "rgba(37,99,235,0.45)",   glowB: "rgba(37,99,235,0.18)",   dark: "#050e1a" },
  { id: "green",  label: "Hijau",  accent: "#1a8a6e", glowA: "rgba(26,138,110,0.45)",  glowB: "rgba(26,138,110,0.18)",  dark: "#04150f" },
  { id: "purple", label: "Ungu",   accent: "#7c3aed", glowA: "rgba(124,58,237,0.45)",  glowB: "rgba(124,58,237,0.18)",  dark: "#0d0520" },
  { id: "amber",  label: "Amber",  accent: "#f5a623", glowA: "rgba(245,166,35,0.45)",  glowB: "rgba(245,166,35,0.18)",  dark: "#1a1003" },
  { id: "pink",   label: "Pink",   accent: "#ec4899", glowA: "rgba(236,72,153,0.45)",  glowB: "rgba(236,72,153,0.18)",  dark: "#1a0512" },
];

const TEMPLATES = [
  { id: "dark",  label: "Dark Glow" },
  { id: "frame", label: "Frame" },
  { id: "grid",  label: "Grid" },
  { id: "chalk", label: "Chalkboard" },
  { id: "halo",  label: "Halo" },
  { id: "paper", label: "Paper" },
  { id: "sky",   label: "Sky" },
  { id: "mint",  label: "Mint" },
];

// faint oversized glyphs bled off two opposite corners — subtle math motif
function drawGlyphWatermarks(ctx, scheme, glyphs) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = scheme.accent;
  glyphs.forEach(({ ch, x, y, size, rot, alpha }) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.font = `800 ${size}px ${F}`;
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

// small "plotted graph" curve with a marker dot — math/data motif
function drawPlotCurve(ctx, scheme, x1, y1, x2, y2) {
  const rgb = hexToRgb(scheme.accent);
  const midX = (x1 + x2) / 2;
  const midY = Math.min(y1, y2) - 70;
  ctx.save();
  ctx.strokeStyle = `rgba(${rgb},0.55)`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(midX, midY, x2, y2);
  ctx.stroke();
  const t = 0.5;
  const mx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
  const my = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * midY + t * t * y2;
  ctx.fillStyle = scheme.accent;
  ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(mx, my, 10, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function wrapText(ctx, text, maxWidth, font) {
  ctx.font = font;
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (cur && ctx.measureText(test).width > maxWidth) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

const F = '"Plus Jakarta Sans", Arial, sans-serif';

// Pill badge helper
function drawPill(ctx, text, x, y, { bg = "white", color = "#0f0e17", font = `700 26px ${F}`, px = 28, h = 52, r = 14 } = {}) {
  ctx.font = font;
  const tw = ctx.measureText(text).width;
  const w = tw + px * 2;
  ctx.fillStyle = bg;
  drawRoundRect(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillText(text, x + px, y + h * 0.68);
  return w;
}

// shared layout helper — pill → header → subheader
function draw3Section(ctx, { judul, mapel, kode, channel, eyebrow, scheme, bgFn, pillStyle, subStyle }) {
  const { accent } = scheme;
  const rgb = hexToRgb(accent);
  const cx = CW / 2;

  bgFn(ctx, scheme, cx);

  ctx.textAlign = "center";

  // ── PILL ─────────────────────────────────────────────────
  const pillText = (eyebrow || "BAHAS SOAL").toUpperCase();
  ctx.font = `700 28px ${F}`;
  const pillW = ctx.measureText(pillText).width + 52;
  const pillH = 54;
  const pillY = 88;
  pillStyle(ctx, cx, pillY, pillW, pillH, scheme);
  ctx.fillText(pillText, cx, pillY + 36);

  // ── HEADER ───────────────────────────────────────────────
  const hFont = `800 124px ${F}`;
  const lines = wrapText(ctx, judul || "Judul Soal", CW - 112, hFont);
  ctx.font = hFont;
  const lineH = 138;
  const nLines = Math.min(lines.length, 2);
  const blockH = nLines === 1 ? 112 : 112 + lineH;
  // Center header between pill bottom (142) and subheader area (top of sub ~490)
  const hStartY = Math.round((142 + 490 - blockH) / 2) + 104;
  lines.slice(0, 2).forEach((line, i) => {
    ctx.fillStyle = "white";
    ctx.shadowColor = `rgba(${rgb},0.55)`;
    ctx.shadowBlur = 32;
    ctx.fillText(line, cx, hStartY + i * lineH);
  });
  ctx.shadowBlur = 0;

  // ── SUBHEADER ────────────────────────────────────────────
  const sub = [mapel, kode].filter(Boolean).join("  ·  ").toUpperCase();
  if (sub) {
    ctx.font = `600 38px ${F}`;
    subStyle(ctx, sub, cx, scheme);
  }

  // channel
  ctx.font = `500 20px ${F}`;
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.fillText(channel || "Gudang Soal", cx, CH - 44);
  ctx.textAlign = "left";
}

// ── Template 1: DARK GLOW ────────────────────────────────────────────────────
function drawDark(ctx, params) {
  const { accent } = params.scheme;
  const rgb = hexToRgb(accent);

  draw3Section(ctx, {
    ...params,
    bgFn: (ctx, scheme, cx) => {
      ctx.fillStyle = "#07060e";
      ctx.fillRect(0, 0, CW, CH);
      const g = ctx.createRadialGradient(cx, CH * 0.5, 0, cx, CH * 0.5, 560);
      g.addColorStop(0, `rgba(${rgb},0.42)`);
      g.addColorStop(0.5, `rgba(${rgb},0.13)`);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
      // dot grid
      ctx.globalAlpha = 0.05; ctx.fillStyle = "white";
      for (let x = 32; x < CW; x += 40)
        for (let y = 32; y < CH; y += 40) { ctx.beginPath(); ctx.arc(x, y, 1.3, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;
      // oversized faint math glyphs bleeding off opposite corners
      drawGlyphWatermarks(ctx, scheme, [
        { ch: "√",  x: 30,       y: 150, size: 300, rot: -0.12, alpha: 0.07 },
        { ch: "π",  x: CW - 40,  y: CH - 40, size: 320, rot: 0.08, alpha: 0.07 },
      ]);
      // corner crosshair ticks
      ctx.strokeStyle = scheme.accent;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 2;
      const T = 16, P = 30;
      [[P, P], [CW - P, P], [P, CH - P], [CW - P, CH - P]].forEach(([x, y]) => {
        ctx.beginPath(); ctx.moveTo(x - T, y); ctx.lineTo(x + T, y); ctx.moveTo(x, y - T); ctx.lineTo(x, y + T); ctx.stroke();
      });
      ctx.globalAlpha = 1;
      // thin accent rule beneath subheader
      ctx.strokeStyle = scheme.accent;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx - 46, 574); ctx.lineTo(cx + 46, 574); ctx.stroke();
      ctx.globalAlpha = 1;
    },
    pillStyle: (ctx, cx, pillY, pillW, pillH, scheme) => {
      const rgb2 = hexToRgb(scheme.accent);
      ctx.fillStyle = `rgba(${rgb2},0.18)`;
      drawRoundRect(ctx, cx - pillW / 2, pillY, pillW, pillH, pillH / 2);
      ctx.fill();
      ctx.strokeStyle = scheme.accent; ctx.lineWidth = 2;
      drawRoundRect(ctx, cx - pillW / 2, pillY, pillW, pillH, pillH / 2);
      ctx.stroke();
      ctx.fillStyle = scheme.accent;
    },
    subStyle: (ctx, sub, cx, scheme) => {
      ctx.fillStyle = `rgba(255,255,255,0.52)`;
      ctx.fillText(sub, cx, 548);
    },
  });
}

// ── Template 2: FRAME ────────────────────────────────────────────────────────
function drawFrame(ctx, params) {
  draw3Section(ctx, {
    ...params,
    bgFn: (ctx, scheme, cx) => {
      const rgb = hexToRgb(scheme.accent);
      ctx.fillStyle = "#07060e";
      ctx.fillRect(0, 0, CW, CH);
      // center radial glow
      const g = ctx.createRadialGradient(cx, CH / 2, 0, cx, CH / 2, 500);
      g.addColorStop(0, `rgba(${rgb},0.16)`);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, CW, CH);
      // oversized faint math glyph bleeding off one corner
      drawGlyphWatermarks(ctx, scheme, [
        { ch: "÷", x: CW - 60, y: 130, size: 280, rot: 0.1, alpha: 0.06 },
        { ch: "×", x: 50, y: CH - 70, size: 240, rot: -0.1, alpha: 0.06 },
      ]);
      // inset accent border
      const pad = 24;
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = scheme.accent;
      ctx.lineWidth = 2;
      drawRoundRect(ctx, pad, pad, CW - pad * 2, CH - pad * 2, 10);
      ctx.stroke();
      ctx.globalAlpha = 1;
      // ruler tick marks along top & bottom edges
      ctx.strokeStyle = scheme.accent;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1.5;
      for (let x = pad + 96; x <= CW - pad - 96; x += 48) {
        const len = (Math.round((x - pad) / 48) % 3 === 0) ? 12 : 7;
        ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, pad + len); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, CH - pad); ctx.lineTo(x, CH - pad - len); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // L-shaped corner accents + corner dots
      const CL = 52, CW2 = 4, C = pad;
      ctx.fillStyle = scheme.accent;
      [[C, C, CL, CW2], [C, C, CW2, CL],
       [CW - C - CL, C, CL, CW2], [CW - C - CW2, C, CW2, CL],
       [C, CH - C - CW2, CL, CW2], [C, CH - C - CL, CW2, CL],
       [CW - C - CL, CH - C - CW2, CL, CW2], [CW - C - CW2, CH - C - CL, CW2, CL],
      ].forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));
      [[C, C], [CW - C, C], [C, CH - C], [CW - C, CH - C]].forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
      });
    },
    pillStyle: (ctx, cx, pillY, pillW, pillH, scheme) => {
      ctx.fillStyle = "white";
      drawRoundRect(ctx, cx - pillW / 2, pillY, pillW, pillH, pillH / 2);
      ctx.fill();
      ctx.fillStyle = scheme.accent;
    },
    subStyle: (ctx, sub, cx, scheme) => {
      ctx.fillStyle = scheme.accent;
      ctx.globalAlpha = 0.85;
      ctx.fillText(sub, cx, 548);
      ctx.globalAlpha = 1;
    },
  });
}

// ── Template 3: GRID (Blueprint) ────────────────────────────────────────────
function drawGrid(ctx, params) {
  draw3Section(ctx, {
    ...params,
    bgFn: (ctx, scheme, cx) => {
      const rgb = hexToRgb(scheme.accent);
      ctx.fillStyle = "#080b12";
      ctx.fillRect(0, 0, CW, CH);
      // fine graph-paper grid
      ctx.strokeStyle = "rgba(255,255,255,0.045)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= CW; x += 28) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke(); }
      for (let y = 0; y <= CH; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke(); }
      // bold grid every 4th line
      ctx.strokeStyle = "rgba(255,255,255,0.09)";
      for (let x = 0; x <= CW; x += 112) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke(); }
      for (let y = 0; y <= CH; y += 112) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke(); }
      // vignette
      const vg = ctx.createRadialGradient(cx, CH / 2, 200, cx, CH / 2, 760);
      vg.addColorStop(0, "transparent");
      vg.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, CW, CH);
      // plotted graph curves, tucked into the outer corners
      drawPlotCurve(ctx, scheme, 50, 660, 330, 520);
      drawPlotCurve(ctx, scheme, 950, 520, 1230, 660);
    },
    pillStyle: (ctx, cx, pillY, pillW, pillH, scheme) => {
      const rgb = hexToRgb(scheme.accent);
      ctx.fillStyle = `rgba(${rgb},0.08)`;
      drawRoundRect(ctx, cx - pillW / 2, pillY, pillW, pillH, pillH / 2);
      ctx.fill();
      ctx.strokeStyle = scheme.accent; ctx.lineWidth = 1.5;
      drawRoundRect(ctx, cx - pillW / 2, pillY, pillW, pillH, pillH / 2);
      ctx.stroke();
      const sq = 7;
      ctx.fillStyle = scheme.accent;
      ctx.fillRect(cx - pillW / 2 + 14, pillY + pillH / 2 - sq / 2, sq, sq);
      ctx.fillStyle = scheme.accent;
    },
    subStyle: (ctx, sub, cx, scheme) => {
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      const w = ctx.measureText(sub).width;
      ctx.fillText(sub, cx, 548);
      ctx.strokeStyle = scheme.accent;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      const gap = 22, len = 34, ty = 535;
      ctx.beginPath(); ctx.moveTo(cx - w / 2 - gap, ty); ctx.lineTo(cx - w / 2 - gap - len, ty); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + w / 2 + gap, ty); ctx.lineTo(cx + w / 2 + gap + len, ty); ctx.stroke();
      ctx.globalAlpha = 1;
    },
  });
}

// ── Template 4: CHALKBOARD ───────────────────────────────────────────────────
function drawChalk(ctx, params) {
  draw3Section(ctx, {
    ...params,
    bgFn: (ctx, scheme, cx) => {
      const rgb = hexToRgb(scheme.accent);
      ctx.fillStyle = "#0e1a15";
      ctx.fillRect(0, 0, CW, CH);
      const g = ctx.createRadialGradient(cx, CH * 0.42, 0, cx, CH * 0.42, 520);
      g.addColorStop(0, `rgba(${rgb},0.22)`);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, CW, CH);
      // chalk dust specks
      ctx.fillStyle = "white";
      for (let i = 0; i < 220; i++) {
        const x = (i * 97) % CW;
        const y = (i * 53 + Math.floor(i / 13) * 31) % CH;
        const r = i % 5 === 0 ? 1.6 : 0.9;
        ctx.globalAlpha = i % 7 === 0 ? 0.12 : 0.05;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // dashed chalk frame
      ctx.save();
      ctx.setLineDash([10, 8]);
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 2;
      drawRoundRect(ctx, 30, 30, CW - 60, CH - 60, 4);
      ctx.stroke();
      ctx.restore();
      // hand-drawn underline swoosh
      ctx.save();
      ctx.strokeStyle = scheme.accent;
      ctx.globalAlpha = 0.65;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - 150, 486);
      ctx.quadraticCurveTo(cx, 500, cx + 150, 484);
      ctx.stroke();
      ctx.restore();
      // faint chalk-doodled glyphs
      drawGlyphWatermarks(ctx, scheme, [
        { ch: "+", x: 70, y: CH - 90, size: 160, rot: -0.15, alpha: 0.07 },
        { ch: "=", x: CW - 90, y: 120, size: 130, rot: 0.1, alpha: 0.07 },
      ]);
    },
    pillStyle: (ctx, cx, pillY, pillW, pillH) => {
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      drawRoundRect(ctx, cx - pillW / 2, pillY, pillW, pillH, 8);
      ctx.fill();
      ctx.save();
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 2;
      drawRoundRect(ctx, cx - pillW / 2, pillY, pillW, pillH, 8);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
    },
    subStyle: (ctx, sub, cx) => {
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText(sub, cx, 548);
    },
  });
}

// ── Template 5: HALO (glass card) ───────────────────────────────────────────
function drawHalo(ctx, params) {
  draw3Section(ctx, {
    ...params,
    bgFn: (ctx, scheme, cx) => {
      const rgb = hexToRgb(scheme.accent);
      ctx.fillStyle = "#06070c";
      ctx.fillRect(0, 0, CW, CH);
      const blobs = [
        { x: cx - 420, y: 120, r: 420, color: `rgba(${rgb},0.5)` },
        { x: cx + 460, y: CH - 80, r: 460, color: `rgba(${rgb},0.32)` },
        { x: cx + 60, y: CH + 40, r: 380, color: "rgba(255,255,255,0.10)" },
      ];
      blobs.forEach(b => {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.color);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, CW, CH);
      });
      // frosted glass panel behind the text block
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.045)";
      drawRoundRect(ctx, 56, 50, CW - 112, 560, 28);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.lineWidth = 1.5;
      drawRoundRect(ctx, 56, 50, CW - 112, 560, 28);
      ctx.stroke();
      ctx.restore();
    },
    pillStyle: (ctx, cx, pillY, pillW, pillH) => {
      ctx.fillStyle = "rgba(255,255,255,0.14)";
      drawRoundRect(ctx, cx - pillW / 2, pillY, pillW, pillH, pillH / 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.lineWidth = 1.5;
      drawRoundRect(ctx, cx - pillW / 2, pillY, pillW, pillH, pillH / 2);
      ctx.stroke();
      ctx.fillStyle = "white";
    },
    subStyle: (ctx, sub, cx) => {
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText(sub, cx, 548);
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Editorial (light, no-face) templates — flat pastel bg, left-aligned headline
// ═══════════════════════════════════════════════════════════════════════════

// draws text char-by-char with manual letter-spacing; returns end x
function drawTracked(ctx, text, x, y, spacing) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
  return cx - spacing;
}

function drawArrowRight(ctx, x, y, len, color, lw) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + len - 8, y - 7);
  ctx.lineTo(x + len, y);
  ctx.lineTo(x + len - 8, y + 7);
  ctx.stroke();
  ctx.restore();
}

// renders an actual lucide-react icon offscreen and rasterizes it, cached per icon+color
const iconImageCache = new Map();

function renderIconSvgMarkup(IconComponent, props) {
  return renderToStaticMarkup(<IconComponent {...props} />);
}

function getLucideIcon(IconComponent, name, color, onLoaded) {
  const key = `${name}:${color}`;
  const cached = iconImageCache.get(key);
  if (cached === "loading") return null;
  if (cached) return cached;
  iconImageCache.set(key, "loading");
  const svg = renderIconSvgMarkup(IconComponent, { color, strokeWidth: 1.75, size: 128 });
  const dataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  const img = new window.Image();
  img.onload = () => { iconImageCache.set(key, img); onLoaded?.(); };
  img.onerror = () => { iconImageCache.delete(key); };
  img.src = dataUri;
  return null;
}

function makeLucideIconFn(IconComponent, name) {
  return (ctx, cx, cy, r, color, onLoaded) => {
    const img = getLucideIcon(IconComponent, name, color, onLoaded);
    if (img) ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
  };
}

// shared editorial layout: tag → icon → left-aligned headline → caption+arrow → credit
function drawEditorialBase(ctx, { judul, mapel, kode, channel, eyebrow, scheme, bg, ink, iconFn, lastLineFn, decorFn, requestRedraw }) {
  const inkRgb = hexToRgb(ink);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CW, CH);

  if (decorFn) decorFn(ctx, scheme, requestRedraw);

  const marginX = 72;

  const tag = [mapel, kode].filter(Boolean).join("   ·   ").toUpperCase();
  if (tag) {
    ctx.font = `700 13px ${F}`;
    ctx.fillStyle = `rgba(${inkRgb},0.42)`;
    drawTracked(ctx, tag, marginX, 68, 1.4);
  }

  if (iconFn) iconFn(ctx, CW - 100, 84, 32, scheme.accent, requestRedraw);

  const hFont = `800 76px ${F}`;
  ctx.font = hFont;
  const lines = wrapText(ctx, judul || "Judul Video", 760, hFont).slice(0, 3);
  const lineH = 84;
  const startY = 216;
  const lastIdx = lines.length - 1;
  lines.forEach((line, i) => {
    ctx.font = hFont;
    const y = startY + i * lineH;
    if (i === lastIdx && lastLineFn) {
      lastLineFn(ctx, line, marginX, y, scheme, ink);
    } else {
      ctx.fillStyle = ink;
      ctx.fillText(line, marginX, y);
    }
  });

  const capY = startY + lastIdx * lineH + 66;
  if (eyebrow) {
    ctx.font = `800 15px ${F}`;
    ctx.fillStyle = `rgba(${inkRgb},0.62)`;
    const endX = drawTracked(ctx, eyebrow.toUpperCase(), marginX, capY, 1.6);
    drawArrowRight(ctx, endX + 16, capY - 5, 26, scheme.accent, 2.5);
  }

  ctx.font = `500 14px ${F}`;
  ctx.fillStyle = `rgba(${inkRgb},0.32)`;
  ctx.fillText(channel || "Gudang Soal", marginX, CH - 40);
}

// ── Template 6: PAPER ────────────────────────────────────────────────────────
function drawPaper(ctx, params) {
  drawEditorialBase(ctx, {
    ...params,
    bg: "#f5f1e8",
    ink: "#18140f",
    iconFn: makeLucideIconFn(Sparkles, "sparkles"),
    decorFn: (ctx, scheme, requestRedraw) => {
      const img = getLucideIcon(Sparkles, "sparkles", scheme.accent, requestRedraw);
      if (!img) return;
      const sparks = [[880, 190, 13], [1040, 150, 19], [960, 330, 9], [1140, 310, 15], [890, 440, 8], [1190, 470, 11], [1030, 560, 14]];
      ctx.save();
      sparks.forEach(([x, y, r], i) => {
        ctx.globalAlpha = 0.1 + (i % 3) * 0.03;
        ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
      });
      ctx.restore();
    },
    lastLineFn: (ctx, line, x, y, scheme) => {
      ctx.fillStyle = scheme.accent;
      ctx.fillText(line, x, y);
      const w = ctx.measureText(line).width;
      ctx.save();
      ctx.strokeStyle = scheme.accent;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      const uy = y + 14;
      ctx.beginPath();
      ctx.moveTo(x, uy);
      ctx.quadraticCurveTo(x + w * 0.25, uy + 8, x + w * 0.5, uy);
      ctx.quadraticCurveTo(x + w * 0.75, uy - 8, x + w, uy);
      ctx.stroke();
      ctx.restore();
    },
  });
}

// ── Template 7: SKY ──────────────────────────────────────────────────────────
function drawSky(ctx, params) {
  drawEditorialBase(ctx, {
    ...params,
    bg: "#e6eef8",
    ink: "#12181f",
    iconFn: makeLucideIconFn(Lightbulb, "lightbulb"),
    decorFn: (ctx, scheme) => {
      const rgb = hexToRgb(scheme.accent);
      const g = ctx.createRadialGradient(1000, 380, 0, 1000, 380, 420);
      g.addColorStop(0, `rgba(${rgb},0.18)`);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, CW, CH);
      ctx.save();
      ctx.strokeStyle = `rgba(${rgb},0.25)`;
      ctx.lineWidth = 1.5;
      [130, 210].forEach(r => { ctx.beginPath(); ctx.arc(1000, 380, r, 0, Math.PI * 2); ctx.stroke(); });
      ctx.restore();
    },
    lastLineFn: (ctx, line, x, y, scheme, ink) => {
      ctx.fillStyle = ink;
      ctx.fillText(line, x, y);
      const w = ctx.measureText(line).width;
      ctx.save();
      ctx.strokeStyle = scheme.accent;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x, y + 12);
      ctx.lineTo(x + w, y + 12);
      ctx.stroke();
      ctx.restore();
    },
  });
}

// ── Template 8: MINT ─────────────────────────────────────────────────────────
function drawMint(ctx, params) {
  drawEditorialBase(ctx, {
    ...params,
    bg: "#eef4ea",
    ink: "#141a12",
    iconFn: makeLucideIconFn(TrendingUp, "trendingUp"),
    decorFn: (ctx, scheme) => {
      const rgb = hexToRgb(scheme.accent);
      ctx.save();
      ctx.fillStyle = `rgba(${rgb},0.16)`;
      const baseY = 560, barW = 54, gap = 22, startX = 880;
      [90, 150, 210, 270].forEach((h, i) => {
        const x = startX + i * (barW + gap);
        drawRoundRect(ctx, x, baseY - h, barW, h, 10);
        ctx.fill();
      });
      ctx.restore();
    },
    lastLineFn: (ctx, line, x, y, scheme, ink) => {
      const w = ctx.measureText(line).width;
      const rgb = hexToRgb(scheme.accent);
      ctx.save();
      ctx.fillStyle = `rgba(${rgb},0.32)`;
      drawRoundRect(ctx, x - 8, y - 56, w + 16, 68, 10);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = ink;
      ctx.fillText(line, x, y);
    },
  });
}

function drawThumbnail(ctx, params) {
  ctx.clearRect(0, 0, CW, CH);
  ctx.save();
  ctx.textBaseline = "alphabetic";
  if (params.template === "frame") drawFrame(ctx, params);
  else if (params.template === "grid") drawGrid(ctx, params);
  else if (params.template === "chalk") drawChalk(ctx, params);
  else if (params.template === "halo") drawHalo(ctx, params);
  else if (params.template === "paper") drawPaper(ctx, params);
  else if (params.template === "sky") drawSky(ctx, params);
  else if (params.template === "mint") drawMint(ctx, params);
  else drawDark(ctx, params);
  ctx.restore();
}

export default function AdminThumbnail() {
  const width = useWindowWidth();
  const isMobile = width <= 480;
  const canvasRef = useRef(null);

  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    const id = "plus-jakarta-sans";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
      document.head.appendChild(link);
    }
    document.fonts.load('800 16px "Plus Jakarta Sans"').then(() => setFontReady(true));
  }, []);

  const [judul, setJudul] = useState("Persamaan Garis Singgung Lingkaran");
  const [mapel, setMapel] = useState("Matematika");
  const [kode, setKode] = useState("");
  const [channel, setChannel] = useState("Gudang Soal");
  const [eyebrow, setEyebrow] = useState("PEMBAHASAN");
  const [schemeId, setSchemeId] = useState("red");
  const [template, setTemplate] = useState("dark");

  const scheme = SCHEMES.find((s) => s.id === schemeId) || SCHEMES[0];

  const redrawRef = useRef(() => {});

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    drawThumbnail(ctx, { judul, mapel, kode, channel, eyebrow, scheme, template, requestRedraw: () => redrawRef.current() });
  }, [judul, mapel, kode, channel, eyebrow, scheme, template]);

  useEffect(() => { redrawRef.current = redraw; }, [redraw]);
  useEffect(() => { if (fontReady) redraw(); }, [redraw, fontReady]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    const slug = judul.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    a.download = `thumbnail-${slug}.png`;
    a.click();
  };

  const previewW = isMobile ? Math.min(width - 32, CW) : Math.min(680, CW);
  const scale = previewW / CW;

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: "10px",
    border: "1px solid #e2ddd5", fontSize: "14px", fontFamily: "inherit",
    color: "#0f0e17", outline: "none", boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block", fontSize: "11px", fontWeight: "700", color: "#b4b2a9",
    textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "6px",
  };

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: isMobile ? "0 0 40px" : "0 0 60px" }}>
      <Helmet><title>Thumbnail YouTube | Admin</title></Helmet>

      {/* Hero header */}
      <div style={{ borderRadius: "18px", background: "linear-gradient(135deg, #0f0e17 0%, #1a1830 55%, #1a0c05 100%)", padding: isMobile ? "24px 20px" : "28px 32px", marginBottom: "24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: isMobile ? "-10px" : "24px", top: "50%", transform: "translateY(-50%)", fontSize: isMobile ? "64px" : "90px", fontWeight: "900", color: "rgba(255,255,255,.03)", userSelect: "none", lineHeight: 1, pointerEvents: "none", letterSpacing: "-3px" }}>THUMB</div>
        <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", gap: "16px", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "rgba(255,255,255,.45)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "6px" }}>Tools Admin</div>
            <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "white", letterSpacing: "-0.5px", margin: "0 0 12px" }}>Thumbnail YouTube</h1>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "rgba(255,255,255,.8)", background: "rgba(255,255,255,.1)" }}>1280 × 720 px</span>
              <span style={{ fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", color: "#6ee7b7", background: "rgba(110,231,183,.12)" }}>PNG HD</span>
            </div>
          </div>
          <button onClick={handleDownload}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "#e84c2b", color: "white", border: "none", borderRadius: "10px", padding: "10px 20px", fontSize: "13.5px", fontWeight: "700", boxShadow: "0 4px 16px rgba(232,76,43,.35)", cursor: "pointer", fontFamily: "inherit", width: isMobile ? "100%" : "auto", justifyContent: "center" }}>
            <Download size={15} /> Download PNG
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "24px", flexDirection: isMobile ? "column" : "row", alignItems: "flex-start" }}>

        {/* Left: Controls */}
        <div style={{ width: isMobile ? "100%" : "260px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Template */}
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", borderLeft: "3px solid #7c3aed", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0ede6", fontSize: "13px", fontWeight: "700", color: "#0f0e17", background: "linear-gradient(to right, #faf9f6, white)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
              Template
            </div>
            <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => setTemplate(t.id)}
                  style={{ padding: "9px 14px", borderRadius: "10px", border: template === t.id ? "1.5px solid #7c3aed" : "1px solid #e2ddd5", background: template === t.id ? "#f5f0ff" : "white", color: template === t.id ? "#7c3aed" : "#6b6860", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text */}
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", borderLeft: "3px solid #2563eb", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0ede6", fontSize: "13px", fontWeight: "700", color: "#0f0e17", background: "linear-gradient(to right, #faf9f6, white)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2563eb", flexShrink: 0 }} />
              Teks
            </div>
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Pill <span style={{ color: "#d4d0c8", textTransform: "none", fontWeight: 400 }}>— label kecil di atas</span></label>
                <input value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} placeholder="BAHAS SOAL" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Header <span style={{ color: "#d4d0c8", textTransform: "none", fontWeight: 400 }}>— judul besar</span></label>
                <textarea value={judul} onChange={(e) => setJudul(e.target.value)} rows={2}
                  style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div>
                <label style={labelStyle}>Subheader <span style={{ color: "#d4d0c8", textTransform: "none", fontWeight: 400 }}>— di bawah judul</span></label>
                <input value={mapel} onChange={(e) => setMapel(e.target.value)} placeholder="Mata Pelajaran" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Subheader 2 <span style={{ color: "#d4d0c8", textTransform: "none", fontWeight: 400 }}>— opsional, misal SOAL 1</span></label>
                <input value={kode} onChange={(e) => setKode(e.target.value)} placeholder="SOAL 1"
                  style={{ ...inputStyle, textTransform: "uppercase" }} />
              </div>
              <div>
                <label style={labelStyle}>Nama Channel</label>
                <input value={channel} onChange={(e) => setChannel(e.target.value)} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Color scheme */}
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", borderLeft: "3px solid #e84c2b", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0ede6", fontSize: "13px", fontWeight: "700", color: "#0f0e17", background: "linear-gradient(to right, #faf9f6, white)", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#e84c2b", flexShrink: 0 }} />
              Warna Aksen
            </div>
            <div style={{ padding: "16px 20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {SCHEMES.map((s) => (
                <button key={s.id} onClick={() => setSchemeId(s.id)} title={s.label}
                  style={{ width: "38px", height: "38px", borderRadius: "10px", background: s.accent, cursor: "pointer", border: "none", outline: schemeId === s.id ? `3px solid ${s.accent}` : "none", outlineOffset: "3px", transition: "outline .1s", boxShadow: schemeId === s.id ? `0 0 0 2px white` : "none" }} />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ borderRadius: "14px", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,.15)", border: "1px solid #e2ddd5" }}>
            <div style={{ width: `${previewW}px`, height: `${Math.round(CH * scale)}px`, overflow: "hidden", position: "relative" }}>
              <canvas ref={canvasRef} width={CW} height={CH}
                style={{ width: `${CW}px`, height: `${CH}px`, transformOrigin: "top left", transform: `scale(${scale})`, display: "block" }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
            <p style={{ fontSize: "12px", color: "#b4b2a9", margin: 0 }}>Preview diperkecil — download full 1280×720</p>
            <button onClick={handleDownload}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(232,76,43,.3)" }}>
              <Download size={14} /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
