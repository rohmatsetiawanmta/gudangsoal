// src/features/admin/AdminWhiteboardSession.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Pencil, Square, Circle, Minus, Eraser, Trash2, Download, Undo2, Redo2, ArrowLeft, Maximize2, Minimize2, LassoSelect,
  ChevronLeft, ChevronRight, Plus, BookOpen, X, ChevronRight as ChevronRightIcon, Highlighter, Lightbulb,
} from "lucide-react";
import api from "../../lib/api";
import useWindowWidth from "../../hooks/useWindowWidth";
import MathRenderer from "../../components/MathRenderer";
import { DifficultyBadge, AnswerPreview } from "./SoalPreviewModal";
import { TIPE_SOAL } from "./soal-form/constants";

const CANVAS_WIDTH = 4000;
const CANVAS_HEIGHT = 2500;
const ERASER_WIDTH = 26;
const SAVE_DEBOUNCE_MS = 800;

const COLORS = [
  { label: "Hitam", value: "#0f0e17" },
  { label: "Merah", value: "#e84c2b" },
  { label: "Biru", value: "#2563eb" },
  { label: "Hijau", value: "#1a8a6e" },
  { label: "Amber", value: "#f5a623" },
  { label: "Ungu", value: "#7c3aed" },
  { label: "Kuning", value: "#facc15" },
];

const WIDTHS = [2, 4, 8];

const TOOLS = [
  { id: "pen", label: "Pen", icon: Pencil },
  { id: "highlighter", label: "Stabilo", icon: Highlighter },
  { id: "line", label: "Garis", icon: Minus },
  { id: "rect", label: "Kotak", icon: Square },
  { id: "ellipse", label: "Lingkaran", icon: Circle },
  { id: "eraser", label: "Eraser", icon: Eraser },
  { id: "objectEraser", label: "Hapus Objek", icon: LassoSelect },
];

const OBJECT_ERASE_TOLERANCE = 10;

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  let t = lengthSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx, cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function hitTestElement(el, x, y, tolerance) {
  const tol = tolerance + el.lineWidth / 2;
  if (el.type === "pen" || el.type === "eraser" || el.type === "highlighter") {
    if (el.points.length < 2) {
      const p = el.points[0];
      return Math.hypot(x - p.x, y - p.y) <= tol;
    }
    for (let i = 1; i < el.points.length; i++) {
      if (distToSegment(x, y, el.points[i - 1].x, el.points[i - 1].y, el.points[i].x, el.points[i].y) <= tol) return true;
    }
    return false;
  }
  if (el.type === "line") {
    return distToSegment(x, y, el.x0, el.y0, el.x1, el.y1) <= tol;
  }
  if (el.type === "rect") {
    const { x: rx, y: ry, w, h } = el;
    const edges = [
      [rx, ry, rx + w, ry],
      [rx + w, ry, rx + w, ry + h],
      [rx + w, ry + h, rx, ry + h],
      [rx, ry + h, rx, ry],
    ];
    return edges.some(([x1, y1, x2, y2]) => distToSegment(x, y, x1, y1, x2, y2) <= tol);
  }
  if (el.type === "ellipse") {
    const cx = el.x + el.w / 2, cy = el.y + el.h / 2;
    const rx = Math.abs(el.w / 2) || 0.0001, ry = Math.abs(el.h / 2) || 0.0001;
    const norm = Math.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2);
    return Math.abs(norm - 1) * Math.min(rx, ry) <= tol;
  }
  return false;
}

const BG_SPACING = 24;
const BG_DOT_COLOR = "#c9c4ba";
const BG_LINE_COLOR = "#e2ddd5";

const BG_STYLES = [
  { id: "plain", label: "Polos" },
  { id: "dots", label: "Titik-titik" },
  { id: "grid", label: "Grid" },
];

function canvasBackgroundCss(bgStyle) {
  if (bgStyle === "dots") {
    return {
      backgroundColor: "white",
      backgroundImage: `radial-gradient(circle, ${BG_DOT_COLOR} 1.5px, transparent 1.5px)`,
      backgroundSize: `${BG_SPACING}px ${BG_SPACING}px`,
    };
  }
  if (bgStyle === "grid") {
    return {
      backgroundColor: "white",
      backgroundImage: `linear-gradient(to right, ${BG_LINE_COLOR} 1px, transparent 1px), linear-gradient(to bottom, ${BG_LINE_COLOR} 1px, transparent 1px)`,
      backgroundSize: `${BG_SPACING}px ${BG_SPACING}px`,
    };
  }
  return { backgroundColor: "white" };
}

function drawBackgroundPattern(ctx, x, y, w, h, bgStyle) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, w, h);
  const startX = Math.floor(x / BG_SPACING) * BG_SPACING;
  const startY = Math.floor(y / BG_SPACING) * BG_SPACING;
  if (bgStyle === "dots") {
    ctx.fillStyle = BG_DOT_COLOR;
    for (let gx = startX; gx < x + w; gx += BG_SPACING) {
      for (let gy = startY; gy < y + h; gy += BG_SPACING) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (bgStyle === "grid") {
    ctx.strokeStyle = BG_LINE_COLOR;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let gx = startX; gx < x + w; gx += BG_SPACING) {
      ctx.moveTo(gx + 0.5, y);
      ctx.lineTo(gx + 0.5, y + h);
    }
    for (let gy = startY; gy < y + h; gy += BG_SPACING) {
      ctx.moveTo(x, gy + 0.5);
      ctx.lineTo(x + w, gy + 0.5);
    }
    ctx.stroke();
  }
}

function drawElement(ctx, el) {
  ctx.save();
  ctx.globalCompositeOperation = el.type === "eraser" ? "destination-out" : "source-over";
  ctx.globalAlpha = el.type === "highlighter" ? 0.4 : 1;
  ctx.strokeStyle = el.color;
  ctx.fillStyle = el.color;
  ctx.lineWidth = el.lineWidth;
  ctx.lineCap = el.type === "highlighter" ? "square" : "round";
  ctx.lineJoin = "round";

  if (el.type === "pen" || el.type === "eraser" || el.type === "highlighter") {
    if (el.points.length < 2) {
      const p = el.points[0];
      ctx.beginPath();
      ctx.arc(p.x, p.y, el.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(el.points[0].x, el.points[0].y);
    for (let i = 1; i < el.points.length; i++) ctx.lineTo(el.points[i].x, el.points[i].y);
    ctx.stroke();
  } else if (el.type === "line") {
    ctx.beginPath();
    ctx.moveTo(el.x0, el.y0);
    ctx.lineTo(el.x1, el.y1);
    ctx.stroke();
  } else if (el.type === "rect") {
    ctx.strokeRect(el.x, el.y, el.w, el.h);
  } else if (el.type === "ellipse") {
    ctx.beginPath();
    ctx.ellipse(el.x + el.w / 2, el.y + el.h / 2, Math.abs(el.w / 2), Math.abs(el.h / 2), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function redrawAll(ctx, elements) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  elements.forEach((el) => drawElement(ctx, el));
}

function normalizeShape(d) {
  if (d.type === "pen" || d.type === "eraser" || d.type === "highlighter") return d;
  if (d.type === "line") return { type: "line", x0: d.x0, y0: d.y0, x1: d.x1, y1: d.y1, color: d.color, lineWidth: d.lineWidth };
  const x = Math.min(d.x0, d.x1);
  const y = Math.min(d.y0, d.y1);
  const w = Math.abs(d.x1 - d.x0);
  const h = Math.abs(d.y1 - d.y0);
  return { type: d.type, x, y, w, h, color: d.color, lineWidth: d.lineWidth };
}

const EXPORT_PADDING = 24;

function getContentBounds(elements) {
  if (elements.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  elements.forEach((el) => {
    const half = el.lineWidth / 2;
    if (el.type === "pen" || el.type === "eraser" || el.type === "highlighter") {
      el.points.forEach((p) => {
        minX = Math.min(minX, p.x - half); minY = Math.min(minY, p.y - half);
        maxX = Math.max(maxX, p.x + half); maxY = Math.max(maxY, p.y + half);
      });
    } else if (el.type === "line") {
      minX = Math.min(minX, el.x0 - half, el.x1 - half);
      minY = Math.min(minY, el.y0 - half, el.y1 - half);
      maxX = Math.max(maxX, el.x0 + half, el.x1 + half);
      maxY = Math.max(maxY, el.y0 + half, el.y1 + half);
    } else {
      minX = Math.min(minX, el.x - half);
      minY = Math.min(minY, el.y - half);
      maxX = Math.max(maxX, el.x + el.w + half);
      maxY = Math.max(maxY, el.y + el.h + half);
    }
  });
  return { minX, minY, maxX, maxY };
}

// content used to be saved as a flat elements[] (single page). Wrap old data into pages[] transparently.
function normalizeContent(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return [{ elements: [], soalId: null }];
  const first = raw[0];
  if (first && typeof first === "object" && !Array.isArray(first) && "elements" in first) {
    // current format: array of { elements, soalId }
    return raw.map((p) => ({ elements: Array.isArray(p.elements) ? p.elements : [], soalId: p.soalId ?? null }));
  }
  if (Array.isArray(first)) {
    // older multi-page format: array of elements[]
    return raw.map((elements) => ({ elements, soalId: null }));
  }
  // oldest single-page format: flat elements[]
  return [{ elements: raw, soalId: null }];
}

const SAVE_STATUS_CFG = {
  saving: { label: "Menyimpan...", color: "#fcd34d", bg: "rgba(252,211,77,.12)" },
  saved:  { label: "Tersimpan",    color: "#6ee7b7", bg: "rgba(110,231,183,.12)" },
  error:  { label: "Gagal menyimpan", color: "#fca5a5", bg: "rgba(252,165,165,.12)" },
};

export default function AdminWhiteboardSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 480;

  const pageRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef(null);
  const [baseCanvas] = useState(() => {
    const c = document.createElement("canvas");
    c.width = CANVAS_WIDTH;
    c.height = CANVAS_HEIGHT;
    return c;
  });
  const drawingRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState("saved");
  const [history, setHistory] = useState({ pages: [{ elements: [], soalId: null }], past: [], future: [] });
  const { pages, past, future } = history;
  const [activePageIndex, setActivePageIndex] = useState(0);
  const safeActiveIndex = Math.min(activePageIndex, pages.length - 1);
  const activePage = pages[safeActiveIndex] || { elements: [], soalId: null };
  const elements = activePage.elements;
  const activeSoalId = activePage.soalId;

  const commitPages = useCallback((nextPages) => {
    setHistory((prev) => ({ pages: nextPages, past: [...prev.past, prev.pages], future: [] }));
  }, []);

  const commitElements = useCallback((nextElements) => {
    setHistory((prev) => {
      const nextPages = prev.pages.map((p, i) => (i === safeActiveIndex ? { ...p, elements: nextElements } : p));
      return { pages: nextPages, past: [...prev.past, prev.pages], future: [] };
    });
  }, [safeActiveIndex]);

  const handleAddPage = () => {
    const insertAt = safeActiveIndex + 1;
    commitPages([...pages.slice(0, insertAt), { elements: [], soalId: null }, ...pages.slice(insertAt)]);
    setActivePageIndex(insertAt);
  };

  const handleDeletePage = () => {
    if (pages.length <= 1) return;
    commitPages(pages.filter((_, i) => i !== safeActiveIndex));
    setActivePageIndex(Math.max(0, safeActiveIndex - 1));
    setSoalError("");
  };

  const goToPage = (idx) => {
    if (idx < 0 || idx >= pages.length) return;
    setActivePageIndex(idx);
    setSoalKodeInput("");
    setSoalError("");
  };

  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState(COLORS[0].value);
  const [lineWidth, setLineWidth] = useState(WIDTHS[1]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [bgStyle, setBgStyle] = useState("plain");
  const [showSoalPanel, setShowSoalPanel] = useState(false);
  const [showPembahasan, setShowPembahasan] = useState(false);
  const [hoverDetach, setHoverDetach] = useState(false);
  const [soalCache, setSoalCache] = useState({});
  const [soalKodeInput, setSoalKodeInput] = useState("");
  const [soalLoading, setSoalLoading] = useState(false);
  const [soalError, setSoalError] = useState("");

  const loadedRef = useRef(false);
  const pagesRef = useRef([[]]);
  const titleRef = useRef("");
  const savedTitleRef = useRef("");
  const skipNextSaveRef = useRef(false);

  useEffect(() => {
    api.get(`/admin/whiteboard/${sessionId}`)
      .then((data) => {
        setTitle(data.title);
        savedTitleRef.current = data.title;
        titleRef.current = data.title;
        setBgStyle(data.background || "plain");
        skipNextSaveRef.current = true;
        setHistory({ pages: normalizeContent(data.content), past: [], future: [] });
        setActivePageIndex(0);
        loadedRef.current = true;
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => { pagesRef.current = pages; }, [pages]);
  useEffect(() => { titleRef.current = title; }, [title]);

  // Debounced content autosave
  useEffect(() => {
    if (!loadedRef.current) return;
    if (skipNextSaveRef.current) { skipNextSaveRef.current = false; return; }
    setSaveStatus("saving");
    const t = setTimeout(() => {
      api.put(`/admin/whiteboard/${sessionId}`, { content: pagesRef.current })
        .then(() => setSaveStatus("saved"))
        .catch(() => setSaveStatus("error"));
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [pages, sessionId]);

  // Flush latest content on unmount so a fast navigate-away doesn't lose the last stroke
  useEffect(() => {
    return () => {
      if (loadedRef.current) {
        api.put(`/admin/whiteboard/${sessionId}`, { content: pagesRef.current }).catch(() => {});
      }
    };
  }, [sessionId]);

  const blitToVisible = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.drawImage(baseCanvas, 0, 0);
  }, [baseCanvas]);

  useEffect(() => {
    redrawAll(baseCanvas.getContext("2d"), elements);
    blitToVisible();
  }, [elements, baseCanvas, blitToVisible]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const pos = getPos(e);

    if (tool === "objectEraser") {
      const toRemove = new Set();
      elements.forEach((el, i) => { if (hitTestElement(el, pos.x, pos.y, OBJECT_ERASE_TOLERANCE)) toRemove.add(i); });
      drawingRef.current = { type: "objectEraser", toRemove };
      if (toRemove.size > 0) {
        redrawAll(canvasRef.current.getContext("2d"), elements.filter((_, i) => !toRemove.has(i)));
      }
      return;
    }

    if (tool === "pen" || tool === "eraser" || tool === "highlighter") {
      drawingRef.current = {
        type: tool,
        points: [pos],
        color: tool === "eraser" ? "#ffffff" : color,
        lineWidth: tool === "eraser" ? ERASER_WIDTH : tool === "highlighter" ? Math.max(lineWidth * 4, 20) : lineWidth,
      };
    } else {
      drawingRef.current = { type: tool, x0: pos.x, y0: pos.y, x1: pos.x, y1: pos.y, color, lineWidth };
    }
  };

  const handlePointerMove = (e) => {
    if (!drawingRef.current) return;
    const pos = getPos(e);
    const d = drawingRef.current;

    if (d.type === "objectEraser") {
      let changed = false;
      elements.forEach((el, i) => {
        if (!d.toRemove.has(i) && hitTestElement(el, pos.x, pos.y, OBJECT_ERASE_TOLERANCE)) { d.toRemove.add(i); changed = true; }
      });
      if (changed) redrawAll(canvasRef.current.getContext("2d"), elements.filter((_, i) => !d.toRemove.has(i)));
      return;
    }

    if (d.type === "pen" || d.type === "eraser" || d.type === "highlighter") d.points.push(pos);
    else { d.x1 = pos.x; d.y1 = pos.y; }

    blitToVisible();
    drawElement(canvasRef.current.getContext("2d"), normalizeShape(d));
  };

  const handlePointerUp = () => {
    if (!drawingRef.current) return;
    const d = drawingRef.current;
    drawingRef.current = null;

    if (d.type === "objectEraser") {
      if (d.toRemove.size > 0) commitElements(elements.filter((_, i) => !d.toRemove.has(i)));
      else blitToVisible();
      return;
    }

    const finalEl = normalizeShape(d);
    commitElements([...elements, finalEl]);
  };

  const handleUndo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      return { pages: previous, past: prev.past.slice(0, -1), future: [prev.pages, ...prev.future] };
    });
  }, []);

  const handleRedo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      return { pages: next, past: [...prev.past, prev.pages], future: prev.future.slice(1) };
    });
  }, []);

  const handleClear = () => {
    commitElements([]);
    setConfirmClear(false);
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (!isMod || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      if (e.shiftKey) handleRedo();
      else handleUndo();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleUndo, handleRedo]);

  const handleTitleBlur = () => {
    const trimmed = title.trim();
    if (!trimmed) { setTitle(savedTitleRef.current); return; }
    if (trimmed === savedTitleRef.current) return;
    savedTitleRef.current = trimmed;
    setTitle(trimmed);
    api.put(`/admin/whiteboard/${sessionId}`, { title: trimmed }).catch(() => {});
  };

  const handleBgStyleChange = (next) => {
    setBgStyle(next);
    api.put(`/admin/whiteboard/${sessionId}`, { background: next }).catch(() => {});
  };

  const setActivePageSoalId = (nextSoalId) => {
    setHistory((prev) => {
      const nextPages = prev.pages.map((p, i) => (i === safeActiveIndex ? { ...p, soalId: nextSoalId } : p));
      return { pages: nextPages, past: [...prev.past, prev.pages], future: [] };
    });
  };

  const handleAttachSoal = () => {
    const kode = soalKodeInput.trim();
    if (!kode) return;
    setSoalLoading(true);
    setSoalError("");
    api.get(`/admin/soal/detail?kode=${encodeURIComponent(kode)}`)
      .then((data) => {
        setSoalCache((prev) => ({ ...prev, [data.id]: data }));
        setActivePageSoalId(data.id);
        setSoalKodeInput("");
      })
      .catch(() => setSoalError("Soal dengan kode itu tidak ditemukan"))
      .finally(() => setSoalLoading(false));
  };

  const handleDetachSoal = () => setActivePageSoalId(null);

  // Fetch soal detail for the active page if it's attached but not cached yet
  useEffect(() => {
    if (!activeSoalId || soalCache[activeSoalId]) return;
    let cancelled = false;
    api.get(`/admin/soal/detail?id=${activeSoalId}`)
      .then((data) => { if (!cancelled) setSoalCache((prev) => ({ ...prev, [activeSoalId]: data })); })
      .catch(() => { if (!cancelled) setSoalError("Gagal memuat soal"); });
    return () => { cancelled = true; };
  }, [activeSoalId, soalCache]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const bounds = getContentBounds(elements) || { minX: 0, minY: 0, maxX: 400, maxY: 300 };

    const sx = Math.max(0, Math.floor(bounds.minX - EXPORT_PADDING));
    const sy = Math.max(0, Math.floor(bounds.minY - EXPORT_PADDING));
    const ex = Math.min(CANVAS_WIDTH, Math.ceil(bounds.maxX + EXPORT_PADDING));
    const ey = Math.min(CANVAS_HEIGHT, Math.ceil(bounds.maxY + EXPORT_PADDING));
    const sw = ex - sx;
    const sh = ey - sy;

    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = sw;
    cropCanvas.height = sh;
    const cropCtx = cropCanvas.getContext("2d");
    drawBackgroundPattern(cropCtx, 0, 0, sw, sh, bgStyle);
    cropCtx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);

    const url = cropCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "whiteboard").replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
  };

  useEffect(() => {
    const el = pageRef.current;
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      if (document.fullscreenElement === el) document.exitFullscreen();
    };
  }, []);

  const handleToggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      pageRef.current?.requestFullscreen().catch(() => {});
    }
  };

  const containerHeight = isFullscreen ? "100vh" : "calc(100vh - 56px)";
  const bleedMargin = isFullscreen ? 0 : (isMobile ? "-20px -16px" : "-40px");

  if (loading) {
    return <div style={{ textAlign: "center", padding: "60px 0", color: "#b4b2a9", fontSize: "14px" }}>Memuat...</div>;
  }

  if (notFound) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#e84c2b" }}>
        Sesi whiteboard tidak ditemukan.
        <div style={{ marginTop: "16px" }}>
          <button onClick={() => navigate("/admin/whiteboard")} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  const statusCfg = SAVE_STATUS_CFG[saveStatus] || SAVE_STATUS_CFG.saved;

  // Shared canvas inner content
  const canvasBodyJSX = (
    <div style={{ position: "relative", width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0, ...canvasBackgroundCss(bgStyle) }} />
      {showSoalPanel && activeSoalId && soalCache[activeSoalId] && (
        <div style={{
          position: "absolute", top: 20, left: 20, width: 560, zIndex: 1, pointerEvents: "none",
          background: "rgba(255,255,255,0.92)", borderRadius: "16px", border: "1px solid #e2ddd5",
          boxShadow: "0 4px 24px rgba(0,0,0,.08)", padding: "20px 24px",
          display: "flex", flexDirection: "column", gap: "14px",
        }}>
          <div style={{ fontSize: "15px", color: "#0f0e17", fontWeight: "500", lineHeight: "1.75" }}>
            <MathRenderer text={soalCache[activeSoalId].body} block />
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".08em", textTransform: "uppercase", color: "#b4b2a9", marginBottom: "10px" }}>Pilihan Jawaban</div>
            <AnswerPreview soal={soalCache[activeSoalId]} hideAnswer />
          </div>
        </div>
      )}
      {showPembahasan && activeSoalId && soalCache[activeSoalId]?.pembahasan && (
        <div style={{
          position: "absolute", top: 20, left: 600, width: 560, zIndex: 1, pointerEvents: "none",
          background: "rgba(228,245,240,0.95)", borderRadius: "16px", border: "1px solid #a7f3d0",
          boxShadow: "0 4px 24px rgba(0,0,0,.08)", padding: "20px 24px",
          display: "flex", flexDirection: "column", gap: "10px",
        }}>
          <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".08em", textTransform: "uppercase", color: "#1a8a6e" }}>Pembahasan</div>
          <div style={{ fontSize: "15px", color: "#0f0e17", fontWeight: "500", lineHeight: "1.75" }}>
            <MathRenderer text={soalCache[activeSoalId].pembahasan} block />
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ position: "absolute", inset: 0, zIndex: 2, display: "block", cursor: tool === "eraser" || tool === "objectEraser" ? "cell" : "crosshair", touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );

  // Shared drawing toolbar
  const toolbarJSX = (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "nowrap", gap: "10px", background: "white", borderRadius: "12px", padding: "8px 10px", boxShadow: "0 8px 24px rgba(0,0,0,.12)", border: "1px solid #e2ddd5", overflowX: "auto", maxWidth: "calc(100vw - 32px)" }}>
      <div style={{ display: "flex", gap: "4px" }}>
        {TOOLS.map(({ id, label, icon: Icon }) => {
          const active = tool === id;
          return (
            <button key={id} title={label} onClick={() => setTool(id)}
              style={{ width: "30px", height: "30px", borderRadius: "8px", border: active ? "1px solid #e84c2b" : "1px solid #e2ddd5", background: active ? "#fff3f0" : "white", color: active ? "#e84c2b" : "#6b6860", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
              <Icon size={15} />
            </button>
          );
        })}
      </div>
      <div style={{ width: "1px", height: "20px", background: "#e2ddd5" }} />
      <div style={{ display: "flex", gap: "4px" }}>
        <button title="Urungkan (Ctrl+Z)" onClick={handleUndo} disabled={past.length === 0}
          style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1px solid #e2ddd5", background: "white", color: past.length === 0 ? "#d4d0c8" : "#6b6860", cursor: past.length === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Undo2 size={15} />
        </button>
        <button title="Ulangi (Ctrl+Shift+Z)" onClick={handleRedo} disabled={future.length === 0}
          style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1px solid #e2ddd5", background: "white", color: future.length === 0 ? "#d4d0c8" : "#6b6860", cursor: future.length === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Redo2 size={15} />
        </button>
      </div>
      <div style={{ width: "1px", height: "20px", background: "#e2ddd5" }} />
      <div style={{ display: "flex", gap: "6px" }}>
        {COLORS.map((c) => (
          <button key={c.value} title={c.label} onClick={() => setColor(c.value)}
            style={{ width: "20px", height: "20px", borderRadius: "50%", background: c.value, cursor: "pointer", border: color === c.value ? "2px solid #0f0e17" : "1px solid #e2ddd5", boxShadow: color === c.value ? "0 0 0 2px white inset" : "none", padding: 0 }} />
        ))}
      </div>
      <div style={{ width: "1px", height: "20px", background: "#e2ddd5" }} />
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        {WIDTHS.map((w) => (
          <button key={w} title={`${w}px`} onClick={() => setLineWidth(w)}
            style={{ width: "26px", height: "26px", borderRadius: "8px", border: lineWidth === w ? "1px solid #e84c2b" : "1px solid #e2ddd5", background: lineWidth === w ? "#fff3f0" : "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ width: `${w}px`, height: `${w}px`, borderRadius: "50%", background: lineWidth === w ? "#e84c2b" : "#6b6860" }} />
          </button>
        ))}
      </div>
      <div style={{ width: "1px", height: "20px", background: "#e2ddd5", flexShrink: 0 }} />
      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
        {BG_STYLES.map((b) => (
          <button key={b.id} title={b.label} onClick={() => handleBgStyleChange(b.id)}
            style={{ width: "26px", height: "26px", borderRadius: "8px", border: bgStyle === b.id ? "1px solid #e84c2b" : "1px solid #e2ddd5", cursor: "pointer", padding: 0, flexShrink: 0, ...canvasBackgroundCss(b.id), backgroundSize: b.id === "plain" ? undefined : "8px 8px" }} />
        ))}
      </div>
    </div>
  );

  // Shared page navigator buttons
  const pageNavBtns = (
    <>
      <button title="Halaman sebelumnya" onClick={() => goToPage(safeActiveIndex - 1)} disabled={safeActiveIndex === 0}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "8px", border: "1px solid #e2ddd5", background: "white", color: safeActiveIndex === 0 ? "#d4d0c8" : "#6b6860", cursor: safeActiveIndex === 0 ? "not-allowed" : "pointer" }}>
        <ChevronLeft size={15} />
      </button>
      <span style={{ fontSize: "12px", fontWeight: "700", color: "#0f0e17", padding: "0 6px", minWidth: "48px", textAlign: "center", whiteSpace: "nowrap" }}>
        {safeActiveIndex + 1} / {pages.length}
      </span>
      <button title="Halaman berikutnya" onClick={() => goToPage(safeActiveIndex + 1)} disabled={safeActiveIndex === pages.length - 1}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "8px", border: "1px solid #e2ddd5", background: "white", color: safeActiveIndex === pages.length - 1 ? "#d4d0c8" : "#6b6860", cursor: safeActiveIndex === pages.length - 1 ? "not-allowed" : "pointer" }}>
        <ChevronRight size={15} />
      </button>
      <div style={{ width: "1px", height: "18px", background: "#e2ddd5", margin: "0 2px" }} />
      <button title="Tambah halaman" onClick={handleAddPage}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "8px", border: "1px solid #e2ddd5", background: "white", color: "#6b6860", cursor: "pointer" }}>
        <Plus size={15} />
      </button>
      <button title="Hapus halaman ini" onClick={handleDeletePage} disabled={pages.length <= 1}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "8px", border: pages.length <= 1 ? "1px solid #e2ddd5" : "1px solid #fca5a5", background: pages.length <= 1 ? "white" : "#fff3f0", color: pages.length <= 1 ? "#d4d0c8" : "#e84c2b", cursor: pages.length <= 1 ? "not-allowed" : "pointer" }}>
        <Trash2 size={13} />
      </button>
    </>
  );

  // Shared soal action button
  const soalBtnJSX = (
    <button onClick={() => setShowSoalPanel((v) => !v)} title="Soal" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", background: showSoalPanel ? "#0f0e17" : "white", color: showSoalPanel ? "white" : "#6b6860", border: "1px solid #e2ddd5", boxShadow: "0 4px 12px rgba(0,0,0,.1)", cursor: "pointer" }}>
      <BookOpen size={15} />
      {activeSoalId && <span style={{ position: "absolute", top: "-3px", right: "-3px", width: "8px", height: "8px", borderRadius: "50%", background: "#e84c2b", border: "1.5px solid white" }} />}
    </button>
  );

  const pembahasanBtnJSX = activeSoalId && soalCache[activeSoalId]?.pembahasan ? (
    <button onClick={() => setShowPembahasan((v) => !v)} title="Pembahasan" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", background: showPembahasan ? "#1a8a6e" : "white", color: showPembahasan ? "white" : "#6b6860", border: showPembahasan ? "1px solid #1a8a6e" : "1px solid #e2ddd5", boxShadow: "0 4px 12px rgba(0,0,0,.1)", cursor: "pointer" }}>
      <Lightbulb size={15} />
    </button>
  ) : null;

  // Shared soal overlays (attach / loading / error / detach)
  const soalOverlaysJSX = (posStyle) => (
    <>
      {showSoalPanel && !activeSoalId && (
        <div style={{ position: "absolute", ...posStyle, width: "280px", zIndex: 20, background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", boxShadow: "0 12px 40px rgba(0,0,0,.18)", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "#0f0e17" }}>Pasang Soal</span>
            <button onClick={() => setShowSoalPanel(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6860", display: "flex", padding: "2px" }}><X size={15} /></button>
          </div>
          <p style={{ fontSize: "12px", color: "#6b6860", lineHeight: "1.6", margin: 0 }}>Masukkan kode soal — akan muncul di kiri canvas.</p>
          <input autoFocus value={soalKodeInput} onChange={(e) => setSoalKodeInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAttachSoal(); }} placeholder="Contoh: A6E5M9"
            style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #e2ddd5", fontSize: "14px", fontFamily: "monospace", color: "#0f0e17", outline: "none", boxSizing: "border-box" }} />
          {soalError && <p style={{ fontSize: "12px", color: "#e84c2b", margin: 0 }}>{soalError}</p>}
          <button onClick={handleAttachSoal} disabled={soalLoading || !soalKodeInput.trim()}
            style={{ padding: "9px 14px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "13px", fontWeight: "700", cursor: soalLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: soalLoading || !soalKodeInput.trim() ? 0.6 : 1 }}>
            {soalLoading ? "Memuat..." : "Tampilkan Soal"}
          </button>
        </div>
      )}
      {showSoalPanel && activeSoalId && !soalCache[activeSoalId] && !soalError && (
        <div style={{ position: "absolute", ...posStyle, width: "180px", zIndex: 20, background: "white", borderRadius: "12px", border: "1px solid #e2ddd5", boxShadow: "0 8px 24px rgba(0,0,0,.12)", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ height: "14px", borderRadius: "6px", background: "#f2efe8", animation: "pulse 1.5s infinite" }} />)}
        </div>
      )}
      {showSoalPanel && activeSoalId && soalError && !soalCache[activeSoalId] && (
        <div style={{ position: "absolute", ...posStyle, zIndex: 20, background: "white", borderRadius: "12px", border: "1px solid #fca5a5", padding: "12px 14px", fontSize: "12px", color: "#e84c2b" }}>{soalError}</div>
      )}
      {showSoalPanel && activeSoalId && soalCache[activeSoalId] && (
        <div onMouseEnter={() => setHoverDetach(true)} onMouseLeave={() => setHoverDetach(false)} style={{ position: "absolute", ...posStyle, zIndex: 20 }}>
          <button onClick={handleDetachSoal}
            style={{ padding: "8px 14px", borderRadius: "10px", border: "1px solid #fca5a5", background: "#fff3f0", color: "#e84c2b", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(0,0,0,.08)", opacity: hoverDetach ? 1 : 0, transition: "opacity .2s" }}>
            Lepas Soal
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      <Helmet><title>{`${title} | Whiteboard | Admin Gudang Soal`}</title></Helmet>

      <div ref={pageRef} style={isFullscreen ? {
        position: "relative", height: "100vh", background: "#0f0e17",
        display: "flex", flexDirection: "column", overflow: "hidden",
      } : {
        position: "relative", margin: bleedMargin, height: containerHeight,
        overflow: "hidden", background: "#f2efe8",
      }}>

        {isFullscreen ? (
          /* ── FULLSCREEN LAYOUT ─────────────────────────────── */
          <>
            {/* Controls bar — single row above the 16:9 canvas */}
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px 8px", overflowX: "auto" }}>
              {/* Drawing toolbar (tools, undo, colors, widths, bg) */}
              {toolbarJSX}
              {/* Page nav pill */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "white", borderRadius: "12px", padding: "6px", boxShadow: "0 4px 12px rgba(0,0,0,.12)", border: "1px solid #e2ddd5", flexShrink: 0 }}>
                {pageNavBtns}
              </div>
              {/* Soal toggle + Pembahasan + Lepas (visible when soal attached) */}
              {soalBtnJSX}
              {pembahasanBtnJSX}
              {activeSoalId && soalCache[activeSoalId] && (
                <button onClick={handleDetachSoal} title="Lepas soal dari halaman ini"
                  style={{ padding: "0 12px", height: "36px", borderRadius: "10px", border: "1px solid #fca5a5", background: "#fff3f0", color: "#e84c2b", fontSize: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                  Lepas Soal
                </button>
              )}
              {/* Soal attach popup */}
              {showSoalPanel && !activeSoalId && (
                <div style={{ position: "absolute", top: "12px", right: "12px", width: "280px", zIndex: 20, background: "white", borderRadius: "14px", border: "1px solid #e2ddd5", boxShadow: "0 12px 40px rgba(0,0,0,.18)", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", fontWeight: "800", color: "#0f0e17" }}>Pasang Soal</span>
                    <button onClick={() => setShowSoalPanel(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b6860", display: "flex", padding: "2px" }}><X size={15} /></button>
                  </div>
                  <p style={{ fontSize: "12px", color: "#6b6860", lineHeight: "1.6", margin: 0 }}>Masukkan kode soal — akan muncul di kiri canvas.</p>
                  <input autoFocus value={soalKodeInput} onChange={(e) => setSoalKodeInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAttachSoal(); }} placeholder="Contoh: A6E5M9"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1px solid #e2ddd5", fontSize: "14px", fontFamily: "monospace", color: "#0f0e17", outline: "none", boxSizing: "border-box" }} />
                  {soalError && <p style={{ fontSize: "12px", color: "#e84c2b", margin: 0 }}>{soalError}</p>}
                  <button onClick={handleAttachSoal} disabled={soalLoading || !soalKodeInput.trim()}
                    style={{ padding: "9px 14px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "13px", fontWeight: "700", cursor: soalLoading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: soalLoading || !soalKodeInput.trim() ? 0.6 : 1 }}>
                    {soalLoading ? "Memuat..." : "Tampilkan Soal"}
                  </button>
                </div>
              )}
              <button onClick={handleToggleFullscreen} title="Keluar Fullscreen" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", background: "white", color: "#6b6860", border: "1px solid #e2ddd5", boxShadow: "0 4px 12px rgba(0,0,0,.1)", cursor: "pointer", flexShrink: 0 }}>
                <Minimize2 size={15} />
              </button>
              <button onClick={handleDownload} title="Unduh PNG" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", background: "white", color: "#6b6860", border: "1px solid #e2ddd5", boxShadow: "0 4px 12px rgba(0,0,0,.1)", cursor: "pointer", flexShrink: 0 }}>
                <Download size={15} />
              </button>
              <button onClick={() => setConfirmClear(true)} title="Bersihkan" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", background: "#e84c2b", color: "white", border: "none", boxShadow: "0 4px 12px rgba(232,76,43,.25)", cursor: "pointer", flexShrink: 0 }}>
                <Trash2 size={15} />
              </button>
            </div>

            {/* 16:9 canvas — takes remaining height, centered */}
            <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px 16px" }}>
              <div style={{
                width: "100%", maxHeight: "100%",
                aspectRatio: "16 / 9",
                position: "relative", overflow: "auto",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,.08)",
              }}>
                {canvasBodyJSX}
              </div>
            </div>
          </>
        ) : (
          /* ── NORMAL LAYOUT ─────────────────────────────────── */
          <>
            {/* Full-bleed canvas scroll */}
            <div style={{ position: "absolute", inset: 0, overflow: "auto", background: "#f2efe8" }}>
              {canvasBodyJSX}
            </div>

            {/* Floating controls: left group + right group */}
            <div style={{ position: "absolute", top: isMobile ? "10px" : "16px", left: isMobile ? "10px" : "16px", right: isMobile ? "10px" : "16px", zIndex: 10, display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
              {/* Left: back + title + toolbar */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0, maxWidth: isMobile ? "100%" : "none", flex: isMobile ? "1 1 100%" : "0 1 auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(15,14,23,.92)", backdropFilter: "blur(8px)", borderRadius: "12px", padding: "8px 10px", boxShadow: "0 8px 24px rgba(0,0,0,.18)", maxWidth: isMobile ? "100%" : "360px" }}>
                  <button onClick={() => navigate("/admin/whiteboard")} title="Kembali"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", borderRadius: "8px", flexShrink: 0, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.8)", cursor: "pointer" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.18)"; e.currentTarget.style.color = "white"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.color = "rgba(255,255,255,.8)"; }}>
                    <ArrowLeft size={15} />
                  </button>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleTitleBlur} onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                    style={{ fontSize: "14px", fontWeight: "700", color: "white", background: "transparent", border: "none", outline: "none", fontFamily: "inherit", padding: "2px 0", minWidth: 0, flex: 1 }} />
                  <span style={{ fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "99px", color: statusCfg.color, background: statusCfg.bg, flexShrink: 0, whiteSpace: "nowrap" }}>
                    {statusCfg.label}
                  </span>
                </div>
                {toolbarJSX}
              </div>

              {/* Right: object count + action buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <span style={{ fontSize: "11px", fontWeight: "700", padding: "6px 10px", borderRadius: "99px", color: "rgba(255,255,255,.85)", background: "rgba(15,14,23,.92)", backdropFilter: "blur(8px)", boxShadow: "0 8px 24px rgba(0,0,0,.18)", whiteSpace: "nowrap" }}>
                  {elements.length} Objek
                </span>
                {soalBtnJSX}
                {pembahasanBtnJSX}
                <button onClick={handleToggleFullscreen} title="Fullscreen" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", background: "white", color: "#6b6860", border: "1px solid #e2ddd5", boxShadow: "0 8px 24px rgba(0,0,0,.12)", cursor: "pointer" }}>
                  <Maximize2 size={15} />
                </button>
                <button onClick={handleDownload} title="Unduh PNG" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", background: "white", color: "#6b6860", border: "1px solid #e2ddd5", boxShadow: "0 8px 24px rgba(0,0,0,.12)", cursor: "pointer" }}>
                  <Download size={15} />
                </button>
                <button onClick={() => setConfirmClear(true)} title="Bersihkan" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", background: "#e84c2b", color: "white", border: "none", boxShadow: "0 8px 24px rgba(232,76,43,.35)", cursor: "pointer" }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Bottom-center: page navigator */}
            <div style={{ position: "absolute", bottom: isMobile ? "10px" : "16px", left: "50%", transform: "translateX(-50%)", zIndex: 10, display: "flex", alignItems: "center", gap: "4px", background: "white", borderRadius: "12px", padding: "6px", boxShadow: "0 8px 24px rgba(0,0,0,.12)", border: "1px solid #e2ddd5" }}>
              {pageNavBtns}
            </div>

            {/* Soal overlays */}
            {soalOverlaysJSX({ bottom: isMobile ? "60px" : "72px", right: isMobile ? "8px" : "16px" })}
          </>
        )}
      </div>

      {confirmClear && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: "16px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmClear(false); }}
        >
          <div style={{ background: "white", borderRadius: "18px", padding: "28px", maxWidth: "400px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <Trash2 size={22} color="#e84c2b" />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f0e17", marginBottom: "8px" }}>Bersihkan Halaman Ini?</h3>
            <p style={{ fontSize: "14px", color: "#6b6860", marginBottom: "20px", lineHeight: "1.6" }}>
              Semua coretan ({elements.length} objek) di halaman {safeActiveIndex + 1} akan dihapus. Halaman lain tidak terpengaruh.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmClear(false)} style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2ddd5", background: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", color: "#0f0e17" }}>Batal</button>
              <button onClick={handleClear} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#e84c2b", color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}>Bersihkan</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }`}</style>
    </>
  );
}
