// src/components/FloatingTools.jsx
import { useState, useRef, useEffect } from "react";
import {
  PenLine, Calculator as CalcIcon, Timer as TimerIcon, FileText,
  X, Eraser, Trash2, Play, Pause, RotateCcw, Check,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Scratchpad
// ─────────────────────────────────────────────────────────────────────────────

const PEN_COLORS = ["#0f0e17","#e84c2b","#2563eb","#1a8a6e","#f5a623"];
const PEN_SIZES  = [2, 4, 8];

function Scratchpad() {
  const canvasRef   = useRef(null);
  const isDrawing   = useRef(false);
  const lastPos     = useRef(null);
  const initialized = useRef(false);
  const [color, setColor] = useState("#0f0e17");
  const [size,  setSize]  = useState(3);
  const [tool,  setTool]  = useState("pen");

  useEffect(() => {
    if (canvasRef.current && !initialized.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      initialized.current = true;
    }
  }, []);

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width, sy = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
  }

  function startDraw(e) {
    e.preventDefault();
    isDrawing.current = true;
    const pos = getPos(e);
    lastPos.current = pos;
    const ctx = canvasRef.current.getContext("2d");
    const s = tool === "eraser" ? size * 5 : size;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, s / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === "eraser" ? "white" : color;
    ctx.fill();
  }

  function draw(e) {
    if (!isDrawing.current) return;
    e.preventDefault();
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext("2d");
    const s = tool === "eraser" ? size * 5 : size;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? "white" : color;
    ctx.lineWidth = s; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  }

  function stopDraw() { isDrawing.current = false; }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"10px 14px", borderBottom:"1px solid var(--gs-divider)", flexShrink:0 }}>
        <div style={{ display:"flex", gap:"5px" }}>
          {PEN_COLORS.map(c => (
            <button key={c} onClick={() => { setColor(c); setTool("pen"); }}
              style={{ width:"18px", height:"18px", borderRadius:"50%", background:c, border:"none", cursor:"pointer", flexShrink:0, boxShadow: color===c && tool==="pen" ? `0 0 0 2px white, 0 0 0 3.5px ${c}` : "none" }} />
          ))}
        </div>
        <div style={{ width:"1px", height:"16px", background:"var(--gs-border)" }} />
        <div style={{ display:"flex", gap:"4px" }}>
          {PEN_SIZES.map(s => (
            <button key={s} onClick={() => setSize(s)}
              style={{ width:"26px", height:"26px", borderRadius:"6px", border:`1.5px solid ${size===s?"var(--gs-text)":"var(--gs-border)"}`, background:size===s?"var(--gs-hover)":"var(--gs-surface)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:s*1.8+1, height:s*1.8+1, borderRadius:"50%", background:"#0f0e17" }} />
            </button>
          ))}
        </div>
        <div style={{ width:"1px", height:"16px", background:"var(--gs-border)" }} />
        <button onClick={() => setTool(t => t==="eraser"?"pen":"eraser")}
          style={{ width:"28px", height:"28px", borderRadius:"7px", border:`1.5px solid ${tool==="eraser"?"var(--gs-text)":"var(--gs-border)"}`, background:tool==="eraser"?"var(--gs-hover)":"var(--gs-surface)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--gs-text-muted)" }}>
          <Eraser size={13} />
        </button>
        <button onClick={clearCanvas}
          style={{ width:"28px", height:"28px", borderRadius:"7px", border:"1.5px solid #fca5a5", background:"#fff3f0", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#e84c2b", marginLeft:"auto" }}>
          <Trash2 size={12} />
        </button>
      </div>
      <div style={{ flex:1, overflow:"hidden", background:"white", cursor:tool==="eraser"?"cell":"crosshair" }}>
        <canvas ref={canvasRef} width={300} height={320}
          style={{ display:"block", width:"100%", height:"100%", touchAction:"none" }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scientific Calculator
// ─────────────────────────────────────────────────────────────────────────────

function CalcBtn({ label, onClick, variant="num", wide=false, small=false }) {
  const [hov, setHov] = useState(false);
  const bg = variant==="op"  ? (hov?"#cf4426":"#e84c2b")
           : variant==="eq"  ? (hov?"#cf4426":"#e84c2b")
           : variant==="fn"  ? (hov?"#c5c0b8":"#d4d0c8")
           : variant==="sci" ? (hov?"#ddd9f0":"#ede9f8")
           :                   (hov?"var(--gs-border)":"var(--gs-hover)");
  const fg = (variant==="op"||variant==="eq") ? "white"
           : variant==="sci" ? "#7c3aed"
           : "var(--gs-text)";
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ gridColumn:wide?"span 2":undefined, padding:small?"9px 0":"12px 0", borderRadius:"9px", border:"none", background:bg, color:fg, fontSize:small?"11px":"14px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", transition:"background .1s", textAlign:"center" }}>
      {label}
    </button>
  );
}

function Calculator() {
  const [disp,    setDisp]    = useState("0");
  const [prev,    setPrev]    = useState(null);
  const [op,      setOp]      = useState(null);
  const [waiting, setWaiting] = useState(false);

  function fmt(n) {
    if (!isFinite(n) || isNaN(n)) return "Error";
    const s = parseFloat(n.toPrecision(10)).toString();
    return s.length > 12 ? n.toExponential(4) : s;
  }
  function digit(d) {
    if (waiting) { setDisp(d); setWaiting(false); }
    else setDisp(disp === "0" ? d : disp.length >= 12 ? disp : disp + d);
  }
  function decimal() {
    if (waiting) { setDisp("0."); setWaiting(false); return; }
    if (!disp.includes(".")) setDisp(disp + ".");
  }
  function clear()   { setDisp("0"); setPrev(null); setOp(null); setWaiting(false); }
  function sign()    { if (disp === "Error") return; setDisp(fmt(-parseFloat(disp))); }
  function percent() { if (disp === "Error") return; setDisp(fmt(parseFloat(disp) / 100)); }
  function compute(a, b, o) {
    if (o === "+") return a + b; if (o === "−") return a - b;
    if (o === "×") return a * b; if (o === "÷") return b !== 0 ? a / b : "Error";
    return b;
  }
  function operator(o) {
    if (disp === "Error") return;
    const val = parseFloat(disp);
    if (prev !== null && !waiting && op) {
      const r = compute(prev, val, op);
      setDisp(r === "Error" ? "Error" : fmt(r));
      setPrev(r === "Error" ? null : r);
    } else { setPrev(val); }
    setOp(o); setWaiting(true);
  }
  function equals() {
    if (!op || prev === null || disp === "Error") return;
    const r = compute(prev, parseFloat(disp), op);
    setDisp(r === "Error" ? "Error" : fmt(r));
    setPrev(null); setOp(null); setWaiting(true);
  }

  const fs = disp.length > 10 ? "16px" : disp.length > 7 ? "22px" : "30px";

  return (
    <div style={{ padding:"12px", display:"flex", flexDirection:"column", height:"100%", gap:"6px" }}>
      {/* Display */}
      <div style={{ background:"#0f0e17", borderRadius:"12px", padding:"12px 16px", textAlign:"right", minHeight:"72px", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
        {op && <div style={{ fontSize:"12px", color:"rgba(255,255,255,.3)", marginBottom:"4px" }}>{prev} {op}</div>}
        <div style={{ fontSize:fs, fontWeight:"300", color:disp==="Error"?"#f87171":"white", letterSpacing:"-0.5px", lineHeight:1 }}>{disp}</div>
      </div>

      {/* Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"6px", flex:1 }}>
        <CalcBtn label="AC"  variant="fn" onClick={clear}               />
        <CalcBtn label="+/−" variant="fn" onClick={sign}                />
        <CalcBtn label="%"   variant="fn" onClick={percent}              />
        <CalcBtn label="÷"   variant="op" onClick={() => operator("÷")}  />
        <CalcBtn label="7"               onClick={() => digit("7")}     />
        <CalcBtn label="8"               onClick={() => digit("8")}     />
        <CalcBtn label="9"               onClick={() => digit("9")}     />
        <CalcBtn label="×"   variant="op" onClick={() => operator("×")}  />
        <CalcBtn label="4"               onClick={() => digit("4")}     />
        <CalcBtn label="5"               onClick={() => digit("5")}     />
        <CalcBtn label="6"               onClick={() => digit("6")}     />
        <CalcBtn label="−"   variant="op" onClick={() => operator("−")}  />
        <CalcBtn label="1"               onClick={() => digit("1")}     />
        <CalcBtn label="2"               onClick={() => digit("2")}     />
        <CalcBtn label="3"               onClick={() => digit("3")}     />
        <CalcBtn label="+"   variant="op" onClick={() => operator("+")}  />
        <CalcBtn label="0"   wide         onClick={() => digit("0")}     />
        <CalcBtn label="."               onClick={decimal}               />
        <CalcBtn label="="   variant="eq" onClick={equals}               />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Timer
// ─────────────────────────────────────────────────────────────────────────────

const CD_PRESETS = [5, 10, 15, 30, 45, 60, 90];

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(); osc.stop(ctx.currentTime + 0.8);
  } catch {}
}

function fmtSec(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

function fmtMs(ms) {
  const m  = Math.floor(ms / 60000);
  const s  = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${String(cs).padStart(2,"0")}`;
}

function Timer({ onRunningChange }) {
  const [mode,       setMode]      = useState("countdown");
  const [presetMin,  setPresetMin] = useState(90);
  const [presetSec,  setPresetSec] = useState(0);
  const [remaining,  setRemaining] = useState(null);
  const [cdRun,      setCdRun]     = useState(false);
  const [swElapsed,  setSwElapsed] = useState(0);
  const [swRun,      setSwRun]     = useState(false);
  const swStartRef  = useRef(null);
  const finishedRef = useRef(false);

  // Notify parent of running state
  useEffect(() => {
    onRunningChange?.(cdRun || swRun);
  }, [cdRun, swRun]);

  // Countdown interval
  useEffect(() => {
    if (!cdRun) return;
    finishedRef.current = false;
    const id = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(id);
          setCdRun(false);
          if (!finishedRef.current) { finishedRef.current = true; beep(); }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [cdRun]);

  // Stopwatch interval
  useEffect(() => {
    if (!swRun) return;
    swStartRef.current = Date.now() - swElapsed;
    const id = setInterval(() => setSwElapsed(Date.now() - swStartRef.current), 47);
    return () => clearInterval(id);
  }, [swRun]);

  const totalSecs = presetMin * 60 + presetSec;

  function cdStart() {
    if (remaining === null) setRemaining(totalSecs);
    setCdRun(true);
  }
  function cdReset() { setCdRun(false); setRemaining(null); }
  function swReset() { setSwRun(false); setSwElapsed(0); }

  const cdDisplay  = remaining === null ? fmtSec(totalSecs) : fmtSec(remaining);
  const cdFinished = remaining === 0;
  const cdColor    = cdFinished ? "#e84c2b" : remaining !== null && remaining <= 60 ? "#f5a623" : "white";

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", padding:"16px 14px", gap:"12px" }}>
      {/* Mode toggle */}
      <div style={{ display:"flex", background:"var(--gs-hover)", borderRadius:"8px", padding:"3px", gap:"3px" }}>
        {["countdown","stopwatch"].map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ flex:1, padding:"6px 0", borderRadius:"6px", border:"none", background:mode===m?"var(--gs-surface)":"transparent", color:mode===m?"var(--gs-text)":"var(--gs-text-muted)", fontSize:"12px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", boxShadow:mode===m?"0 1px 4px rgba(0,0,0,.08)":"none", transition:"all .12s" }}>
            {m==="countdown" ? "Countdown" : "Stopwatch"}
          </button>
        ))}
      </div>

      {/* Display */}
      <div style={{ background:"#0f0e17", borderRadius:"16px", padding:"24px 16px", textAlign:"center", flex:"0 0 auto" }}>
        {mode === "countdown" ? (
          <>
            <div style={{ fontSize:"44px", fontWeight:"200", color:cdColor, letterSpacing:"2px", lineHeight:1, fontVariantNumeric:"tabular-nums", transition:"color .3s" }}>
              {cdDisplay}
            </div>
            {cdFinished && (
              <div style={{ fontSize:"12px", fontWeight:"700", color:"#e84c2b", marginTop:"6px", letterSpacing:".05em" }}>WAKTU HABIS!</div>
            )}
          </>
        ) : (
          <div style={{ fontSize:"40px", fontWeight:"200", color:"white", letterSpacing:"2px", lineHeight:1, fontVariantNumeric:"tabular-nums" }}>
            {fmtMs(swElapsed)}
          </div>
        )}
      </div>

      {mode === "countdown" && (
        <>
          {/* Presets */}
          <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>
            {CD_PRESETS.map(p => {
              const active = presetMin === p && presetSec === 0;
              return (
                <button key={p} onClick={() => { setPresetMin(p); setPresetSec(0); if (!cdRun) setRemaining(null); }}
                  style={{ padding:"4px 9px", borderRadius:"7px", border:`1.5px solid ${active?"#e84c2b":"var(--gs-border)"}`, background:active?"#fff3f0":"var(--gs-surface)", color:active?"#e84c2b":"var(--gs-text-muted)", fontSize:"12px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit" }}>
                  {p}m
                </button>
              );
            })}
          </div>
          {/* Custom MM:SS input */}
          <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            <span style={{ fontSize:"12px", color:"var(--gs-text-muted)", whiteSpace:"nowrap" }}>Custom:</span>
            <input type="number" min="0" max="999" value={presetMin}
              onChange={e => { const v=Math.max(0,parseInt(e.target.value)||0); setPresetMin(v); if(!cdRun)setRemaining(null); }}
              style={{ width:"52px", padding:"5px 6px", borderRadius:"7px", border:"1px solid var(--gs-border)", fontSize:"13px", fontFamily:"inherit", outline:"none", color:"var(--gs-text)", textAlign:"center" }}
              onFocus={e=>e.target.style.borderColor="#e84c2b"}
              onBlur={e=>e.target.style.borderColor="var(--gs-border)"} />
            <span style={{ fontSize:"13px", color:"var(--gs-text-hint)", fontWeight:"700" }}>:</span>
            <input type="number" min="0" max="59" value={presetSec}
              onChange={e => { const v=Math.min(59,Math.max(0,parseInt(e.target.value)||0)); setPresetSec(v); if(!cdRun)setRemaining(null); }}
              style={{ width:"42px", padding:"5px 6px", borderRadius:"7px", border:"1px solid var(--gs-border)", fontSize:"13px", fontFamily:"inherit", outline:"none", color:"var(--gs-text)", textAlign:"center" }}
              onFocus={e=>e.target.style.borderColor="#e84c2b"}
              onBlur={e=>e.target.style.borderColor="var(--gs-border)"} />
            <span style={{ fontSize:"12px", color:"var(--gs-text-muted)" }}>mm:ss</span>
          </div>
        </>
      )}

      {/* Controls */}
      <div style={{ display:"flex", gap:"8px", marginTop:"auto" }}>
        {mode === "countdown" ? (
          <>
            <button onClick={() => cdRun ? setCdRun(false) : cdStart()}
              style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", padding:"10px 0", borderRadius:"10px", border:"none", background:cdRun?"#f5a623":"#e84c2b", color:"white", fontSize:"13px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit" }}>
              {cdRun ? <><Pause size={14}/> Jeda</> : <><Play size={14}/> {remaining===null?"Mulai":"Lanjut"}</>}
            </button>
            <button onClick={cdReset}
              style={{ width:"42px", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"10px", border:"1px solid var(--gs-border)", background:"white", cursor:"pointer", color:"var(--gs-text-muted)" }}>
              <RotateCcw size={15}/>
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setSwRun(r=>!r)}
              style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"6px", padding:"10px 0", borderRadius:"10px", border:"none", background:swRun?"#f5a623":"#e84c2b", color:"white", fontSize:"13px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit" }}>
              {swRun ? <><Pause size={14}/> Jeda</> : <><Play size={14}/> {swElapsed===0?"Mulai":"Lanjut"}</>}
            </button>
            <button onClick={swReset}
              style={{ width:"42px", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"10px", border:"1px solid var(--gs-border)", background:"white", cursor:"pointer", color:"var(--gs-text-muted)" }}>
              <RotateCcw size={15}/>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Catatan
// ─────────────────────────────────────────────────────────────────────────────

const NOTE_KEY = "ft_catatan";

function Catatan() {
  const [text,  setText]  = useState(() => localStorage.getItem(NOTE_KEY) || "");
  const [saved, setSaved] = useState(true);
  const saveTimer = useRef(null);

  function handleChange(e) {
    setText(e.target.value);
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(NOTE_KEY, e.target.value);
      setSaved(true);
    }, 600);
  }

  function handleClear() {
    setText(""); localStorage.removeItem(NOTE_KEY); setSaved(true);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 14px", borderBottom:"1px solid var(--gs-divider)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
          {saved
            ? <><Check size={12} color="#1a8a6e"/><span style={{ fontSize:"11px", color:"#1a8a6e", fontWeight:"600" }}>Tersimpan</span></>
            : <span style={{ fontSize:"11px", color:"var(--gs-text-hint)" }}>Menyimpan…</span>
          }
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <span style={{ fontSize:"11px", color:"var(--gs-text-hint)" }}>{text.length} karakter</span>
          <button onClick={handleClear}
            style={{ width:"26px", height:"26px", borderRadius:"7px", border:"1.5px solid #fca5a5", background:"#fff3f0", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#e84c2b" }}>
            <Trash2 size={11}/>
          </button>
        </div>
      </div>
      <textarea value={text} onChange={handleChange}
        placeholder="Tulis catatan, rumus, atau langkah kerja di sini…"
        style={{ flex:1, border:"none", outline:"none", padding:"14px", fontSize:"13px", fontFamily:"inherit", resize:"none", color:"var(--gs-text)", lineHeight:"1.7", background:"var(--gs-surface)" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FloatingTools — main
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id:"coretan",    label:"Coretan",  Icon:PenLine    },
  { id:"kalkulator", label:"Kalku.",   Icon:CalcIcon   },
  { id:"timer",      label:"Timer",    Icon:TimerIcon  },
  { id:"catatan",    label:"Catatan",  Icon:FileText   },
];

export default function FloatingTools() {
  const [open,      setOpen]      = useState(false);
  const [tab,       setTab]       = useState("coretan");
  const [timerRun,  setTimerRun]  = useState(false);

  return (
    <>
      {/* Panel */}
      {open && (
        <div style={{ position:"fixed", bottom:"88px", right:"24px", width:"320px", height:"500px", background:"white", borderRadius:"18px", boxShadow:"0 8px 48px rgba(0,0,0,.16), 0 2px 8px rgba(0,0,0,.06)", border:"1px solid var(--gs-border)", display:"flex", flexDirection:"column", zIndex:9000, animation:"ftIn .18s cubic-bezier(.2,.8,.3,1)", transformOrigin:"bottom right" }}>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", borderBottom:"1px solid var(--gs-divider)", flexShrink:0 }}>
            <div style={{ display:"flex", gap:"2px", background:"var(--gs-hover)", borderRadius:"8px", padding:"3px" }}>
              {TABS.map(({ id, Icon }) => (
                <button key={id} onClick={() => setTab(id)} title={id}
                  style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", width:"34px", height:"28px", borderRadius:"6px", border:"none", background:tab===id?"var(--gs-surface)":"transparent", color:tab===id?"var(--gs-text)":"var(--gs-text-muted)", cursor:"pointer", boxShadow:tab===id?"0 1px 4px rgba(0,0,0,.08)":"none", transition:"all .12s" }}>
                  <Icon size={13} />
                  {id==="timer" && timerRun && tab!=="timer" && (
                    <span style={{ position:"absolute", top:"4px", right:"4px", width:"5px", height:"5px", borderRadius:"50%", background:"#e84c2b" }} />
                  )}
                </button>
              ))}
            </div>
            <button onClick={() => setOpen(false)}
              style={{ width:"28px", height:"28px", borderRadius:"8px", border:"1px solid var(--gs-border)", background:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--gs-text-muted)" }}>
              <X size={13}/>
            </button>
          </div>

          {/* Content — all mounted to preserve canvas & timer state */}
          <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
            <div style={{ display:tab==="coretan"    ?"flex":"none", flex:1, flexDirection:"column", overflow:"hidden" }}><Scratchpad /></div>
            <div style={{ display:tab==="kalkulator" ?"flex":"none", flex:1, flexDirection:"column", overflow:"hidden" }}><Calculator /></div>
            <div style={{ display:tab==="timer"      ?"flex":"none", flex:1, flexDirection:"column", overflow:"hidden" }}><Timer onRunningChange={setTimerRun} /></div>
            <div style={{ display:tab==="catatan"    ?"flex":"none", flex:1, flexDirection:"column", overflow:"hidden" }}><Catatan /></div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setOpen(o=>!o)}
        style={{ position:"fixed", bottom:"24px", right:"24px", width:"52px", height:"52px", borderRadius:"50%", background:open?"#0f0e17":"#e84c2b", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white", zIndex:9000, boxShadow:open?"0 4px 20px rgba(0,0,0,.22)":"0 4px 20px rgba(232,76,43,.4)", transition:"background .2s, box-shadow .2s, transform .15s" }}
        onMouseEnter={e => (e.currentTarget.style.transform="scale(1.08)")}
        onMouseLeave={e => (e.currentTarget.style.transform="scale(1)")}
      >
        {open ? <X size={20}/> : <PenLine size={20}/>}
        {/* Timer running indicator on FAB */}
        {timerRun && !open && (
          <span style={{ position:"absolute", top:"4px", right:"4px", width:"8px", height:"8px", borderRadius:"50%", background:"white", border:"2px solid #e84c2b" }} />
        )}
      </button>

      <style>{`
        @keyframes ftIn {
          from { opacity:0; transform:scale(.92) translateY(10px); }
          to   { opacity:1; transform:scale(1)   translateY(0);    }
        }
      `}</style>
    </>
  );
}
