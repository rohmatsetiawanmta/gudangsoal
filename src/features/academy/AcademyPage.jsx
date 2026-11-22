import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Check, Compass, DoorOpen, HelpCircle, Home, Keyboard, Map, MapPin, MessageCircle, Navigation, UserRound, X } from "lucide-react";
import SEO from "../../components/SEO";
import { useAuthStore } from "../auth/authStore";
import { BUILDINGS, GUIDE_DIALOGUE, PLAZA, SPAWN, WORLD } from "./world.js";
import { getStorageKey, loadState, saveState } from "./academyState.js";
import { createAcademyGame } from "./game.js";
import { loadTerrain } from "./terrain.js";
import { loadBuildings } from "./buildings.js";
import { loadEnvironment } from './environment.js';
import "./academy.css";

const BUILDING_ICONS = { question_hall: BookOpen, profile_center: UserRound, dormitory: Home };

function Destinations({ onSelect }) {
  return <div className="academy-destinations">
    {BUILDINGS.map((building) => {
      const Icon = BUILDING_ICONS[building.id];
      return <button key={building.id} className="academy-destination" onClick={() => onSelect(building.id)}>
        <span className="academy-destination-icon"><Icon size={20} /></span>
        <span><strong>{building.label}</strong><small>{building.description}</small></span>
        <span className="academy-card-direction">{building.direction}</span>
      </button>;
    })}
  </div>;
}

function Minimap({ player }) {
  return <svg className="academy-minimap" viewBox={`0 0 ${WORLD.width} ${WORLD.height}`} role="img" aria-label="Peta: Question Hall di utara, Profile Center di barat, Dormitory di timur">
    <rect width={WORLD.width} height={WORLD.height} rx="64" fill="#e1e7db" />
    <path d="M1296 1880V540M480 1136H2128" stroke="#f7f4e9" strokeWidth="130" />
    <circle cx={PLAZA.x} cy={PLAZA.y} r={PLAZA.radius} fill="#f7f4e9" />
    <rect x="1232" y="1040" width="128" height="128" fill="#adc8cb" />
    {BUILDINGS.map((b) => <rect key={b.id} {...b.bounds} rx="16" fill={b.color} opacity="0.8" />)}
    <circle cx={player.x} cy={player.y} r="76" fill="var(--academy-brand)" opacity="0.16" />
    <circle cx={player.x} cy={player.y} r="33" fill="var(--academy-brand)" stroke="white" strokeWidth="15" />
    <text x="1296" y="110" textAnchor="middle" fill="var(--academy-ink-soft)" fontSize="90" fontFamily="Plus Jakarta Sans, sans-serif">U</text>
  </svg>;
}

export default function AcademyPage() {
  const user = useAuthStore((state) => state.user);
  const loginAt = useAuthStore((state) => state.loginAt);
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const dialogRef = useRef(null);
  const leavingRef = useRef(false);
  const storageKey = getStorageKey(user?.id, loginAt);
  const [status, setStatus] = useState({ player: SPAWN, nearby: null, location: "Gerbang selatan", focused: false });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [panel, setPanel] = useState(null);
  const [notice, setNotice] = useState("");
  const [attempt, setAttempt] = useState(0);

  const openPanel = useCallback((kind) => {
    gameRef.current?.pause();
    setPanel({ kind, line: 0 });
  }, []);
  const openMenu = useCallback(() => openPanel("menu"), [openPanel]);

  const goToBuilding = useCallback((id) => {
    const building = BUILDINGS.find((item) => item.id === id);
    if (!building || leavingRef.current) return;
    leavingRef.current = true;
    const game = gameRef.current;
    game?.pause();
    if (game) saveState(storageKey, game.getState());
    navigate(building.route);
  }, [navigate, storageKey]);

  const interact = useCallback((target) => {
    if (target.kind === "npc") openPanel("guide");
    else goToBuilding(target.id);
  }, [goToBuilding, openPanel]);

  useEffect(() => {
    if (error) return;
    const saved = loadState(storageKey);
    let game;
    let didRender = false;
    let active = true;
    const controller = new AbortController();
    function persist() { if (game && didRender) saveState(storageKey, game.getState()); }
    async function start() {
      try {
        const [terrain, buildings, environment] = await Promise.all([
          loadTerrain({ signal: controller.signal }), loadBuildings({ signal: controller.signal }),
          loadEnvironment({ signal: controller.signal }),
        ]);
        if (!active) return;
        game = createAcademyGame(canvasRef.current, {
          terrain,
          buildings,
          environment,
          debug: new URLSearchParams(window.location.search).get('academyDebug') === '1',
          overview: new URLSearchParams(window.location.search).get('academyOverview') === '1',
          initialState: saved.state,
          onUpdate: setStatus,
          onInteract: interact,
          onMenu: openMenu,
          onReady: () => { didRender = true; setReady(true); if (saved.restored) setNotice("Posisi terakhir dipulihkan"); },
          onError: () => setError("Peta Academy tidak dapat ditampilkan. Coba muat ulang atau kembali ke beranda."),
        });
        gameRef.current = game;
        if (!dialogRef.current?.open) game.focus();
        window.addEventListener("pagehide", persist);
        document.addEventListener("visibilitychange", persist);
      } catch (failure) {
        if (active && failure.name !== "AbortError") setError("Peta Academy belum dapat dimuat. Coba lagi atau gunakan navigasi cepat.");
      }
    }
    start();
    return () => {
      active = false;
      controller.abort();
      persist();
      game?.stop();
      gameRef.current = null;
      window.removeEventListener("pagehide", persist);
      document.removeEventListener("visibilitychange", persist);
    };
  }, [storageKey, interact, openMenu, attempt, error]);

  useEffect(() => {
    if (panel && !dialogRef.current.open) dialogRef.current.showModal();
  }, [panel]);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timeout);
  }, [notice]);

  function closePanel() { dialogRef.current.close(); }
  function panelClosed() {
    setPanel(null);
    if (!error) gameRef.current?.focus();
  }
  function leave() {
    if (leavingRef.current) return;
    leavingRef.current = true;
    const game = gameRef.current;
    game?.pause();
    if (game) saveState(storageKey, game.getState());
    navigate("/home");
  }
  function retry() { setReady(false); setError(""); setAttempt((value) => value + 1); }

  const nearby = status.nearby;
  const panelTitle = panel?.kind === "guide" ? "Kenalan dengan Kak Aksa" : panel?.kind === "help" ? "Cara menjelajah" : "Mau ke mana?";

  return <main className="academy-app">
    <SEO title="Academy" description="Jelajahi Academy dan temukan bank soal, profil, serta beranda belajarmu." url="/academy" />
    <header className="academy-header">
      <Link to="/home" className="academy-brand" onClick={() => { if (gameRef.current) saveState(storageKey, gameRef.current.getState()); }}>
        <span className="academy-brand-icon"><Compass size={23} /></span>
        <span><strong>Academy</strong><small>matrohmatmath</small></span>
      </Link>
      <span className="academy-build-tag">COZY VILLAGE <span>v0.3</span></span>
      <button className="academy-button academy-exit" onClick={leave} aria-label="Kembali ke beranda"><DoorOpen size={17} /><span>Kembali ke beranda</span></button>
    </header>

    <div className="academy-workspace">
      <section className="academy-play-area" aria-label="Dunia Academy">
        <canvas ref={canvasRef} className="academy-canvas" data-player-x={Math.round(status.player.x)} data-player-y={Math.round(status.player.y)} tabIndex={0} aria-label="Peta Academy interaktif. Gunakan WASD atau panah untuk berjalan, E untuk interaksi, M untuk navigasi cepat." aria-describedby="academy-controls">
          Gunakan tombol Navigasi cepat untuk membuka Question Hall, Profile Center, atau Dormitory.
        </canvas>
        <div className="academy-map-heading"><span className="academy-map-pin"><MapPin size={18} /></span><div><strong>Academy Plaza</strong><small>{status.location}</small></div></div>
        <div className="academy-world-actions">
          <button className="academy-button academy-button-primary" onClick={openMenu} aria-label="Navigasi cepat"><Navigation size={16} /><span>Navigasi cepat</span><kbd>M</kbd></button>
          <button className="academy-icon-button" onClick={() => openPanel("help")} aria-label="Bantuan kontrol"><HelpCircle size={20} /></button>
        </div>

        {notice && <div className="academy-notice" role="status"><Check size={15} />{notice}</div>}
        {!ready && !error && <div className="academy-state-screen" role="status"><Compass size={32} /><strong>Menyiapkan kampus…</strong><span>Peta dan avatar sedang dimuat.</span></div>}
        {error && <div className="academy-state-screen" role="alert"><Map size={32} /><strong>Academy belum dapat dibuka</strong><p>{error}</p><div className="academy-state-actions"><button className="academy-button academy-button-primary" onClick={retry}>Coba lagi</button><button className="academy-button" onClick={openMenu}>Navigasi cepat</button></div></div>}

        {ready && !error && <div className="academy-interaction" aria-live="polite">
          {nearby ? <button className="academy-interact-button" onClick={() => interact(nearby)}><kbd>E</kbd><span>{nearby.kind === "npc" ? "Bicara dengan" : "Masuk"} <strong>{nearby.label}</strong></span></button>
            : !status.focused ? <button className="academy-resume" onClick={() => gameRef.current?.focus()}><Keyboard size={18} />Klik untuk melanjutkan perjalanan</button>
              : <div className="academy-walk-hint"><MapPin size={15} />Dekati pintu bangunan atau sapa Kak Aksa.</div>}
        </div>}
        <div className="academy-player-card"><span className="academy-avatar">{(user?.name || "P").slice(0, 1).toUpperCase()}</span><span><strong>{user?.name || "Penjelajah"}</strong><small>Penjelajah Academy</small></span></div>
      </section>

      <aside className="academy-sidebar" aria-label="Panduan Academy">
        <div className="academy-sidebar-heading"><span className="academy-eyebrow">SELAMAT DATANG</span><h1>Kampus kecil,<br />banyak kemungkinan.</h1><p>Jalan sebentar, temukan tempat belajarmu.</p></div>
        <div className="academy-map-card"><div className="academy-section-label"><Map size={16} /><strong>Peta kampus</strong><span>1 area</span></div><Minimap player={status.player} /><div className="academy-map-legend"><span><i />Posisimu</span><span>Utara di bagian atas</span></div></div>
        <div className="academy-places"><div className="academy-section-label"><strong>Tempat tujuan</strong><span>Akses langsung</span></div><Destinations onSelect={goToBuilding} /></div>
        <div className="academy-sidebar-note"><MessageCircle size={17} /><p>Butuh petunjuk? Temui <strong>Kak Aksa</strong> di dekat jalan menuju plaza.</p></div>
        <div className="academy-prototype-note">Versi awal · Bentuk dan tata letak masih dalam pengujian.</div>
      </aside>
    </div>

    <footer className="academy-controls" id="academy-controls"><span><Keyboard size={16} /><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span>atau panah untuk berjalan</span></span><span><kbd>E</kbd>Interaksi</span><span><kbd>M</kbd>Navigasi</span><span><kbd>Esc</kbd>Menu / tutup dialog</span><button onClick={() => openPanel("help")}>Lihat panduan</button></footer>

    <dialog ref={dialogRef} className="academy-dialog" onClose={panelClosed} aria-labelledby="academy-dialog-title">
      <div className="academy-dialog-heading"><span className="academy-eyebrow">ACADEMY</span><button className="academy-icon-button" onClick={closePanel} aria-label="Tutup dialog"><X size={20} /></button></div>
      <h2 id="academy-dialog-title">{panelTitle}</h2>
      {panel?.kind === "guide" ? <div className="academy-guide-dialog"><div className="academy-guide-name"><span>A</span><div><strong>Kak Aksa</strong><small>Pemandu Academy</small></div></div><p>{GUIDE_DIALOGUE[panel.line]}</p><div className="academy-dialog-footer"><span>{panel.line + 1} / {GUIDE_DIALOGUE.length}</span><button className="academy-button academy-button-primary" onClick={() => panel.line < GUIDE_DIALOGUE.length - 1 ? setPanel({ ...panel, line: panel.line + 1 }) : closePanel()}>{panel.line < GUIDE_DIALOGUE.length - 1 ? "Lanjut" : "Siap menjelajah"}</button></div></div>
        : panel?.kind === "help" ? <div className="academy-help"><p>Klik peta untuk mengaktifkan kontrol. Avatar hanya bergerak saat area peta mendapat fokus.</p><dl><div><dt>WASD / panah</dt><dd>Berjalan ke empat arah.</dd></div><div><dt>E</dt><dd>Masuk bangunan atau bicara dengan NPC ketika berada di dekatnya.</dd></div><div><dt>M / Esc</dt><dd>Buka menu. Gunakan Esc untuk menutup dialog.</dd></div><div><dt>Navigasi cepat</dt><dd>Buka halaman tujuan tanpa berjalan. Bisa diakses dengan Tab dan Enter.</dd></div></dl><p>Posisi disimpan untuk akun dan sesi login ini di tab yang sama. Jika posisi tidak valid, kamu kembali ke titik awal.</p><button className="academy-button academy-button-primary" onClick={closePanel}>Mengerti</button></div>
          : <><p className="academy-dialog-intro">Buka halaman tujuan tanpa perlu berjalan.</p><Destinations onSelect={goToBuilding} /><button className="academy-button academy-dialog-exit" onClick={leave}><DoorOpen size={17} />Keluar ke beranda</button></>}
    </dialog>
  </main>;
}
