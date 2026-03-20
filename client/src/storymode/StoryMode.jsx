import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DIALOGUE } from "./dialogue/index.js";
import { GAME, MAPS, SPRITE } from "./environment/gameConfig.js";
import { loadTMJ, loadImage, gidToDrawInfo, loadNpcImages } from "./environment/tmjLoader.js";
import ObjectivesPanel from './components/objectives.jsx';
import MobileControls from './components/MobileControls.jsx';
import { playVoice, stopVoice, getVoiceDuration, playBgm, duckBgm, stopBgm } from "./environment/audioManager.js";
import { playCutscene } from './environment/cutsceneManager.js';
import FullMap from './components/FullMap.jsx';
import { Map as MapIcon } from 'lucide-react'

const hasFlag = (f) => GAME.flags.has(f);
const hasClue = (c) => GAME.clues.has(c);
const addFlag = (f) => GAME.flags.add(f);
const addClue = (c) => GAME.clues.add(c);
GAME.metadata.set("playerName", "detective");

function canShow(choice) {
  const r = choice.requires;
  if (!r) return true;
  if (r.flagsAll && !r.flagsAll.every(hasFlag)) return false;
  if (r.flagsAny && !r.flagsAny.some(hasFlag)) return false;
  if (r.cluesAll && !r.cluesAll.every(hasClue)) return false;
  if (r.cluesAny && !r.cluesAny.some(hasClue)) return false;
  if (r.notFlags && r.notFlags.some(hasFlag)) return false;
  if (r.notClues && r.notClues.some(hasClue)) return false;
  return true;
}


const BASE_SCALE = 2;
const VIEW_COLS = 20;
const VIEW_ROWS = 15;
const MOVE_COOLDOWN_MS = 110;
const TILE_SIZE_FALLBACK = 16;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));


function useKeyboard() {
  const keysRef = useRef(new Set());

  useEffect(() => {
    const down = (e) => {
      const k = e.key.toLowerCase();
      if (
        ["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright", "e",
          "escape", "p", "m"].includes(k)
      ) {
        e.preventDefault();
      }
      keysRef.current.add(k);
    };

    const up = (e) => keysRef.current.delete(e.key.toLowerCase());
    const blur = () => keysRef.current.clear();

    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    window.addEventListener("mousedown", blur);
    window.addEventListener("mousedown", blur);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      window.removeEventListener("mousedown", blur);
    };
  }, []);

  return keysRef;
}

function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const check = () => {
      // matchMedia pointer check is more reliable than maxTouchPoints alone
      const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
      const hasTouch = "ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0;
      setIsTouch(coarsePointer && hasTouch);
    };

    check();
    const mq = window.matchMedia("(pointer: coarse)");
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, []);

  return isTouch;
}

function TutorialHint({ anchorRef, anchorMobileRef, steps = [], onDismiss }) {
  const [index, setIndex] = useState(0);
  const [btnRect, setBtnRect] = useState(null);
  const cardRef = useRef(null);
  const [cardRect, setCardRect] = useState(null);
  const isLast = index === steps.length - 1;
  function getActiveRect() {
    // A hidden element returns width:0 height:0
    const desktop = anchorRef?.current?.getBoundingClientRect();
    if (desktop && desktop.width > 0) return desktop;
    return anchorMobileRef?.current?.getBoundingClientRect() ?? null;
  }
  useEffect(() => {
    const measure = () => {
      setBtnRect(getActiveRect());
      if (cardRef?.current) setCardRect(cardRef.current.getBoundingClientRect());
    };
    measure();
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", measure); };
  }, [anchorRef, anchorMobileRef, index]);

  function buildArrow() {
    if (!btnRect || !cardRect) return null;

    const btnCx = btnRect.left + btnRect.width / 2;
    const btnCy = btnRect.top + btnRect.height / 2;
    const cardCx = cardRect.left + cardRect.width / 2;
    const cardCy = cardRect.top + cardRect.height / 2;

    const startX = btnCx < cardCx ? cardRect.left : cardRect.right;
    const startY = btnCy < cardCy ? cardRect.top : cardRect.bottom;

    // End point
    const dx = btnCx - startX;
    const dy = btnCy - startY;
    const dist = Math.hypot(dx, dy);
    const endX = btnCx - (dx / dist) * (btnRect.width / 2 + 6);
    const endY = btnCy - (dy / dist) * (btnRect.height / 2 + 6);

    // Cubic bezier 
    const cpX = (startX + endX) / 2;
    const cpY = (startY + endY) / 2 - 40;

    return { path: `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`, endX, endY, dx, dy, dist };
  }

  function buildArrowhead(endX, endY, dx, dy, dist) {
    const ux = dx / dist, uy = dy / dist;
    const size = 8;
    const lx = endX - ux * size + uy * (size / 2);
    const ly = endY - uy * size - ux * (size / 2);
    const rx = endX - ux * size - uy * (size / 2);
    const ry = endY - uy * size + ux * (size / 2);
    return `${endX},${endY} ${lx},${ly} ${rx},${ry}`;
  }

  const arrow = buildArrow();

  return (
    <div className="fixed inset-0 z-[9000] pointer-events-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      {arrow && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <path
            d={arrow.path}
            fill="none"
            stroke="rgba(56,189,248,0.3)"
            strokeWidth={6}
            strokeLinecap="round"
          />
          <path
            d={arrow.path}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="6 4"
          >
            <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="0.6s" repeatCount="indefinite" />
          </path>
          <polygon
            points={buildArrowhead(arrow.endX, arrow.endY, arrow.dx, arrow.dy, arrow.dist)}
            fill="#38bdf8"
          />
        </svg>
      )}

      {/* card */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div
          ref={cardRef}
          className="pointer-events-auto w-full max-w-sm mx-6 bg-slate-900 ring-1 ring-sky-400/50 rounded-2xl shadow-2xl p-5 flex flex-col gap-4"
        >
          {steps.length > 1 && (
            <div className="flex gap-1.5 justify-center">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? "bg-sky-400" : "bg-slate-600"}`}
                />
              ))}
            </div>
          )}

          <p className="text-slate-100 text-sm text-center leading-relaxed">
            {steps[index]}
          </p>

          <div className="flex justify-between items-center">
            <button
              onClick={onDismiss}
              className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
            >
              Skip
            </button>
            <button
              onClick={() => isLast ? onDismiss() : setIndex(i => i + 1)}
              className="px-4 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 ring-1 ring-sky-400/50 text-sky-300 text-xs font-medium transition-colors"
            >
              {isLast ? "Got it ✓" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function NameInputField({ onSubmit }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    onSubmit?.(trimmed || "Detective");
  };

  return (
    <div>
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
        maxLength={20}
        placeholder="Detective"
        style={{
          width: "100%", background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(120,95,50,0.4)", borderBottom: "1px solid rgba(200,168,74,0.4)",
          color: "#e8d5a0", fontFamily: "'Courier Prime', monospace",
          fontSize: "1rem", padding: "10px 12px", letterSpacing: "0.06em",
          outline: "none", marginBottom: "1rem", boxSizing: "border-box",
        }}
      />
      <button
        onClick={handleSubmit}
        style={{
          width: "100%", background: "rgba(160,118,40,0.08)",
          border: "1px solid rgba(160,118,40,0.4)", color: "rgba(200,168,74,0.85)",
          fontFamily: "'Courier Prime', monospace", fontSize: "11px",
          letterSpacing: "0.2em", padding: "10px", cursor: "pointer",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(160,118,40,0.16)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(160,118,40,0.08)"}
      >
        BEGIN INVESTIGATION
      </button>
      <div style={{
        marginTop: "0.75rem", fontSize: 10, letterSpacing: "0.14em",
        color: "rgba(120,95,50,0.4)", textAlign: "center"
      }}>
        PRESS ENTER OR CLICK TO CONTINUE
      </div>
    </div>
  );
}
function createNpc({ id, name, x, y, gid, dialogueId, spriteId, direction = "down", staticDirection = false }) {
  return { id, name, x, y, gid, dialogueId, spriteId, direction, defaultDirection: direction, staticDirection, cooldownMs: 400, _lastTalkAt: 0, };
}
function getFacingToward(fromX, fromY, toX, toY) {
  const dx = toX - fromX;
  const dy = toY - fromY;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }

  return dy > 0 ? "down" : "up";
}

function facingToRender(direction) {
  if (direction === "down") return { row: SPRITE.rows.down, flipX: false };
  if (direction === "up") return { row: SPRITE.rows.up, flipX: false };
  if (direction === "left") return { row: SPRITE.rows.side, flipX: true };
  return { row: SPRITE.rows.side, flipX: false }; // right
}
export default function App() {
  const currentMapNameRef = useRef("neighborhood");
  const [transitionMessage, setTransitionMessage] = useState(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const [npcs, setNpcs] = useState([]);
  const [dialogue, setDialogue] = useState(null);
  const [presenting, setPresenting] = useState(false);
  const visitedNodesRef = useRef(new Set());
  const playerRef = useRef({ x: 3, y: 3 });
  const lastStepRef = useRef(0);
  const cameraRef = useRef({ x: 0, y: 0 });
  const [objectivesMinimized, setObjectivesMinimized] = useState(true);
  const viewColsRef = useRef(VIEW_COLS);
  const viewRowsRef = useRef(VIEW_ROWS);
  const [nameInput, setNameInput] = useState({ visible: false, onSubmit: null });
  const [activeTutorial, setActiveTutorial] = useState(null);
  const [creditsOverlay, setCreditsOverlay] = useState({
    visible: false,
    credits: null,
    onContinue: null,
  });
  const [endingScreen, setEndingScreen] = useState({
    visible: false,
    currentEnding: null,
    endings: [],
    onContinue: null,
  });
  const talkBtnRef = useRef(null);
  const [mapOpen, setMapOpen] = useState(false);
  const dialogueDoneResolverRef = useRef(null);
  const [objectivesRefresh, setObjectivesRefresh] = useState(0);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const keysRef = useKeyboard();
  const isTouch = useIsTouch();
  const dialogueOpenedAtRef = useRef(0);
  const LARGE_MAPS = new Set(["neighborhood", "city"]);
  const isLargeMap = LARGE_MAPS.has(currentMapNameRef.current);
  const showMapButton = !!map && isLargeMap;
  // Debug
  useEffect(() => {
    const checkDebugKey = () => {
      if (keysRef.current.has('p')) {
        const p = playerRef.current;
        console.log(`Player coordinates: x=${p.x}, y=${p.y}`);
        keysRef.current.delete('p');
      }

      if (keysRef.current.has('0')) {
        localStorage.removeItem("detective_save");
        window.location.reload();
        keysRef.current.clear();
      }
    };

    const interval = setInterval(checkDebugKey, 100);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => { mapOpenRef.current = mapOpen; }, [mapOpen]);
  useEffect(() => { tutorialActiveRef.current = !!activeTutorial; }, [activeTutorial]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === "m" && showMapButton) setMapOpen(v => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showMapButton]);
  const viewportRef = useRef(null);
  const [viewportPx, setViewportPx] = useState({ w: 0, h: 0 });
  const [isShortHeight, setIsShortHeight] = useState(false);
  const worldBufferRef = useRef(null);
  const worldBufferMetaRef = useRef({ mapName: null, w: 0, h: 0 });
  const [fadeOverlay, setFadeOverlay] = useState({ visible: false, color: "#000", duration: 0 });
  const [isAutoDialogue, setIsAutoDialogue] = useState(true);
  const [autoSpeed] = useState(1.0);
  const autoGenRef = useRef(0);
  const autoTimerRef = useRef(null);
  const objMobileBtnRef = useRef(null);
  const mapBtnRef = useRef(null);
  const objBtnRef = useRef(null);
  const mapBufferRef = useRef(null);
  const mapBufferInfoRef = useRef({ name: null, w: 0, h: 0 });
  const autoSaveTimerRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const mapOpenRef = useRef(false);
  const tutorialActiveRef = useRef(false);
  function debouncedSave() {
    if (dialogue) return;
    clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(saveGame, 1000);
  }
  function drawTileWithFlips(ctx, info, dx, dy, dw, dh) {
    ctx.save();
    ctx.translate(dx + dw / 2, dy + dh / 2);

    if (info.flipD) ctx.rotate(Math.PI / 2);

    ctx.scale(info.flipH ? -1 : 1, info.flipV ? -1 : 1);

    ctx.drawImage(info.img, info.sx, info.sy, info.sw, info.sh, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  }
  function buildWorldBuffer({ map, mapName }) {
    if (!map) return;

    const tw = map.tilewidth;
    const th = map.tileheight;
    const w = map.width * tw;
    const h = map.height * th;

    const buf =
      typeof OffscreenCanvas !== "undefined"
        ? new OffscreenCanvas(w, h)
        : Object.assign(document.createElement("canvas"), { width: w, height: h });

    const bctx = buf.getContext("2d");
    bctx.imageSmoothingEnabled = false;
    bctx.clearRect(0, 0, w, h);

    for (const layer of map.layers) {
      if (layer?.visible === false) continue;

      const lname = (layer?.name || "").toLowerCase();
      if (lname.includes("collision")) continue;

      for (let my = 0; my < map.height; my++) {
        for (let mx = 0; mx < map.width; mx++) {
          const rawGid = layer.grid?.[my]?.[mx] ?? 0;
          if (!rawGid) continue;

          const info = gidToDrawInfo(rawGid, map.tilesets);
          if (!info) continue;

          drawTileWithFlips(bctx, info, mx * tw, my * th, tw, th);

        }
      }
    }

    worldBufferRef.current = buf;
    worldBufferMetaRef.current = { mapName, w, h };
  }
  const NO_SAVE_MAPS = new Set(["office", "jail", "tutorial"]);
  function saveGame() {
    if (!currentMapNameRef.current) return;
    if (NO_SAVE_MAPS.has(currentMapNameRef.current)) return;
    const state = {
      flags: [...GAME.flags],
      clues: [...GAME.clues],
      metadata: [...GAME.metadata.entries()],
      claims: Object.fromEntries(
        Object.entries(GAME.claims).map(([k, v]) => [k, [...v]])
      ),
      map: currentMapNameRef.current,
      player: { x: playerRef.current.x, y: playerRef.current.y },
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem("detective_save", JSON.stringify(state));
    } catch (e) {
      console.warn("Save failed:", e);
    }
  }

  function loadSave() {
    try {
      const raw = localStorage.getItem("detective_save");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function applySaveToGame(save) {
    GAME.flags = new Set(save.flags);
    GAME.clues = new Set(save.clues);
    GAME.metadata = new Map(save.metadata);
    GAME.claims = Object.fromEntries(
      Object.entries(save.claims).map(([k, v]) => [k, new Set(v)])
    );
  }
  function toggleObjectives() {
    setObjectivesMinimized((v) => !v);
  }
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const landscape = w > h;
      const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

      setIsShortHeight(isTouch && landscape && h < 520);
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const cr = entries?.[0]?.contentRect;
      if (!cr) return;
      setViewportPx({ w: Math.floor(cr.width), h: Math.floor(cr.height) });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const press = (k) => keysRef.current.add(k);
  const release = (k) => keysRef.current.delete(k);
  const suppressNextVoiceRef = useRef(false);
  const skipNextSegmentResetRef = useRef(false);
  const pendingSegmentRestoreRef = useRef(null);
  const playedSegmentCutscenesRef = useRef(new Set());
  const [activeObjectives, setActiveObjectives] = useState([]);


  function resolveWaypointTile(waypoint, npcs, mapName, mapDef) {
    if (!waypoint) return null;

    if (waypoint.type === "npc") {
      const npc = npcs.find(n => n.id === waypoint.id);
      if (!npc) return null;
      return { x: npc.x, y: npc.y };
    }

    if (waypoint.type === "exit") {
      const ex = (mapDef?.exits ?? []).find(e => e.to === waypoint.to);
      if (!ex) return null;
      return { x: ex.x, y: ex.y };
    }

    if (waypoint.type === "tile") {
      if (waypoint.map && waypoint.map !== mapName) return null;
      return { x: waypoint.x, y: waypoint.y };
    }

    return null;
  }

  function drawWaypointMarker(ctx, px, py, tileSize, isOptional) {
    const spriteTopY = py - tileSize;
    const cx = px + tileSize / 2;
    const cy = spriteTopY - tileSize * 0.2;

    ctx.save();
    ctx.font = `${Math.floor(tileSize * 0.9)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.lineWidth = 4;
    ctx.strokeStyle = "black";
    ctx.strokeText("!", cx, cy);

    ctx.fillStyle = isOptional ? "#fbbf24" : "white";
    ctx.fillText("!", cx, cy);

    ctx.restore();
  }
  // Sprite images and animation state
  const spriteRef = useRef({ sheet: null });

  const animRef = useRef({
    dir: "down",
    state: "idle",
    frame: 0,
    lastFrameAt: 0,
    flipX: false,
    _prevState: "idle",
    _prevDir: "down",
  });
  function getPlayerFacingRadians(anim) {
    if (!anim) return 0;
    if (anim.dir === "up") return -Math.PI / 2;
    if (anim.dir === "down") return Math.PI / 2;
    if (anim.dir === "left") return anim.flipX ? Math.PI : 0;
    return 0;
  }

  const playerFacing = getPlayerFacingRadians(animRef.current);
  function goToMainMenu() {
    navigate("/");
  }
  useEffect(() => {
    const save = loadSave();
    if (save && save.map) {
      applySaveToGame(save);
      loadNamedMap(save.map).then(() => {
        playerRef.current.x = save.player.x;
        playerRef.current.y = save.player.y;
        setObjectivesRefresh(n => n + 1);
      }).catch(console.error);
    } else {
      playCutscene("intro_boot", {
        loadNamedMap,
        playerRef,
        setTransitionMessage,
        setDialogue,
        npcs,
        setNpcs,
        DIALOGUE,
        flags: GAME.flags,
        GAME,
        setFadeOverlay,
        stopBgm,
        setEndingScreen,
        setCreditsOverlay,
        goToMainMenu,
        setNameInput,
        waitForDialogueToEnd: () =>
          new Promise((resolve) => {
            dialogueDoneResolverRef.current = resolve;
          }),
        __resolveCreditsClose: null,
        showTutorial: (id) => {
          if (id === "movement" && !GAME.flags.has("hint_movement_seen")) {
            setActiveTutorial({
              hintId: "movement",
              anchorRef: null,
              anchorMobileRef: null,
              steps: [
                isTouch
                  ? "Use the D-pad in the bottom left to move around."
                  : "Use WASD or arrow keys to move around.",
                "Walk over to Ace to continue.",
              ]
            });
          }
        },
      });
    }
  }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const img = await loadImage(SPRITE.src);
        if (!cancelled) spriteRef.current = { sheet: img };
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {

    const cutsceneTriggers = [
      { flag: "cutscene_intro_office", cutsceneId: "intro_office" },
      { flag: "cutscene_leave_office", cutsceneId: "leave_office" },
      { flag: "cutscene_going_to_maya", cutsceneId: "going_to_maya" },
      { flag: "cutscene_marcus_enters", cutsceneId: "marcus_enters" },
      { flag: "cutscene_maya_leaves", cutsceneId: "maya_leaves" },
      { flag: "cutscene_leave_pd", cutsceneId: "leave_pd" },
      { flag: "cutscene_accuse_sam", cutsceneId: "accuse_sam" },
      { flag: "cutscene_accuse_tim", cutsceneId: "accuse_tim" },
      { flag: "cutscene_accuse_john", cutsceneId: "accuse_john" },
      { flag: "cutscene_accuse_jane", cutsceneId: "accuse_jane" },
      { flag: "cutscene_accuse_florist", cutsceneId: "accuse_florist" },
      { flag: "cutscene_accuse_jim", cutsceneId: "accuse_jim" },
      { flag: "cutscene_accuse_donna", cutsceneId: "accuse_donna" },
      { flag: "cutscene_lucas_goes_to_maya", cutsceneId: "lucas_goes_to_maya" },
      { flag: "cutscene_marcus_leaves", cutsceneId: "marcus_leaves" },
      { flag: "cutscene_bobby_comes", cutsceneId: "bobby_comes" },
      { flag: "cutscene_frank_comes", cutsceneId: "frank_comes" },
      { flag: "cutscene_sneak_taken", cutsceneId: "sneak_taken" },
      { flag: "cutscene_bobby_moves_to_bartender", cutsceneId: "bobby_moves_to_bartender" },
      { flag: "cutscene_bobby_leaves", cutsceneId: "bobby_leaves" },
      { flag: "cutscene_lost_man_leaves", cutsceneId: "lost_man_leaves" },
      { flag: "cutscene_invest_end", cutsceneId: "invest_end" },
      { flag: "cutscene_tim_leaves", cutsceneId: "tim_leaves" },
      { flag: "cutscene_good_end", cutsceneId: "good_end" },
      { flag: "cutscene_arrest_end", cutsceneId: "arrest_end" },
      { flag: "cutscene_ending_master", cutsceneId: "ending_master" },

    ];

    const context = {
      loadNamedMap,
      playerRef,
      setTransitionMessage,
      setDialogue,
      npcs,
      setNpcs,
      DIALOGUE,
      flags: GAME.flags,
      setFadeOverlay,
      setCreditsOverlay,
      setEndingScreen,
      __resolveCreditsClose: null,
      goToMainMenu,
      waitForDialogueToEnd: () =>
        new Promise((resolve) => {
          dialogueDoneResolverRef.current = resolve;
        }),
      playBgm,
      stopBgm,
      showTutorial: (id) => {
        if (id === "map" && !GAME.flags.has("hint_map_seen")) {
          setActiveTutorial({
            hintId: "map",
            anchorRef: mapBtnRef,
            steps: [
              "Press M or click here to open the map.",
              "The map only appears in larger areas like the neighborhood and city.",
            ]
          });
        }
        if (id === "objectives" && !GAME.flags.has("hint_obj_seen")) {
          setActiveTutorial({
            hintId: "objectives",
            anchorRef: objBtnRef,
            anchorMobileRef: objMobileBtnRef,
            steps: [
              "Press O or click here to open your Case Notes.",
              "All active objectives appear here — check back as you progress.",
              "You can also save your progress to continue later.",
            ]
          });
        }
      },
    };

    for (const { flag, cutsceneId } of cutsceneTriggers) {
      if (GAME.flags.has(flag)) {
        GAME.flags.delete(flag);
        playCutscene(cutsceneId, context);
        break;
      }
    }
  }, [dialogue]);
  useEffect(() => {
    if (!dialogue) return;
    if (pendingSegmentRestoreRef.current == null) return;

    setSegmentIndex(pendingSegmentRestoreRef.current);
    pendingSegmentRestoreRef.current = null;
  }, [dialogue?.dlgId, dialogue?.nodeId]);

  function applySet(set) {
    if (!set) return;
    set.flagsAdd?.forEach(addFlag);
    set.cluesAdd?.forEach(addClue);
    set.flagsRemove?.forEach(f => GAME.flags.delete(f));
    if (set.claimAdd) {
      const { npcId, claimId } = set.claimAdd;
      (GAME.claims[npcId] ??= new Set()).add(claimId);
    }
    if (set.metadataAdd) {
      GAME.metadata.set(set.metadataAdd.key, set.metadataAdd.value);
    }
    setObjectivesRefresh(prev => prev + 1);
    debouncedSave();
  }

  const PROVOKE_TOKEN = "__PROVOKE__";
  const PROVOKE_RETURN_TOKEN = "__PROVOKE_RETURN__";

  function runChoice(choice) {
    if (!dialogue) return;

    const dlg = DIALOGUE[dialogue.dlgId];
    if (!dlg) return;

    if (choice.present) {
      setPresenting(true);
      return;
    }

    if (choice.set) applySet(choice.set);
    if (choice.cutscene) {
      playCutscene(choice.cutscene, {
        loadNamedMap,
        playerRef,
        setTransitionMessage,
        setDialogue,
        npcs,
        setNpcs,
        flags: GAME.flags,
        setFadeOverlay,
        playBgm,
        stopBgm,
        setEndingScreen,
        setCreditsOverlay,
        goToMainMenu,
        __resolveCreditsClose: null,
        showTutorial: (id) => {
          if (id === "map" && !GAME.flags.has("hint_map_seen")) {
            setActiveTutorial({
              hintId: "map",
              anchorRef: mapBtnRef,
              steps: [
                "Press M or click here to open the map.",
                "The map only appears in larger areas like the neighborhood and city.",
              ]
            });
          }
          if (id === "objectives" && !GAME.flags.has("hint_obj_seen")) {
            setActiveTutorial({
              hintId: "objectives",
              anchorRef: objBtnRef,
              anchorMobileRef: objMobileBtnRef,
              steps: [
                "Press O or click here to open your Case Notes.",
                "All active objectives appear here — check back as you progress.",
                "You can also save your progress to continue later.",
              ]
            });
          }
        },
      });
    }

    if (choice.next === PROVOKE_RETURN_TOKEN) {
      const returnNodeKey = `provokeReturnNode_${dialogue.npcId}`;
      const returnSegKey = `provokeReturnSeg_${dialogue.npcId}`;

      const savedNodeId = GAME.metadata.get(returnNodeKey) ?? dlg.start;
      const savedSegIndex = GAME.metadata.get(returnSegKey) ?? 0;

      skipNextSegmentResetRef.current = true;
      suppressNextVoiceRef.current = true;
      pendingSegmentRestoreRef.current = savedSegIndex;

      setDialogue(d => ({ ...d, nodeId: savedNodeId }));
      return;
    }

    if (choice.provoke || choice.next === PROVOKE_TOKEN) {
      const returnNodeKey = `provokeReturnNode_${dialogue.npcId}`;
      const returnSegKey = `provokeReturnSeg_${dialogue.npcId}`;

      GAME.metadata.set(returnNodeKey, dialogue.nodeId);
      GAME.metadata.set(returnSegKey, segmentIndex);

      const strikesKey = `provokeStrikes_${dialogue.npcId}`;
      const strikes = (GAME.metadata.get(strikesKey) ?? 0) + 1;
      GAME.metadata.set(strikesKey, strikes);

      if (dialogue.npcId === "tim") {
        const provokeNode =
          strikes >= 3 ? "tim_provoke_done" :
            strikes === 1 ? "tim_provoke_warn1" : "tim_provoke_warn2";

        setDialogue(d => ({ ...d, nodeId: provokeNode }));
        return;
      }
    }
    const nextId = choice.next;
    const next = dlg.nodes[nextId];
    if (next?.end) {
      if (next.endCutscene) {
        playCutscene(next.endCutscene, {
          loadNamedMap,
          playerRef,
          setTransitionMessage,
          setDialogue,
          npcs,
          setNpcs,
          DIALOGUE,
          flags: GAME.flags,
          setFadeOverlay,
          playBgm,
          stopBgm,
          setEndingScreen,
          setCreditsOverlay,
          goToMainMenu,
          __resolveCreditsClose: null,
          showTutorial: (id) => {
            if (id === "map" && !GAME.flags.has("hint_map_seen")) setShowMapHint(true);
            if (id === "objectives" && !GAME.flags.has("hint_obj_seen")) setShowObjectivesHint(true);
          },
        });
      }
      setDialogue(null);
      if (dialogueDoneResolverRef.current) {
        dialogueDoneResolverRef.current();
        dialogueDoneResolverRef.current = null;
      }
    } else {
      setDialogue((d) => ({ ...d, nodeId: nextId }));
    }
  }

  function DialogueOverlay({ dialogue, setDialogue }) {
    if (!dialogue) return null;

    const dlg = DIALOGUE[dialogue.dlgId];
    const node = dlg?.nodes[dialogue.nodeId];

    const segments = node?.segments;
    const choices = (node?.choices || []).filter(canShow);

    const hasSegments = Array.isArray(segments) && segments.length > 0;

    const visibleSegments = hasSegments
      ? segments.filter(seg => {
        if (!seg.requires) return true;
        return canShow({ requires: seg.requires });
      })
      : [];

    const totalSegments = visibleSegments.length;
    const atLastSegment = totalSegments <= 0 ? true : segmentIndex >= totalSegments - 1;

    function formatText(text) {
      if (!text) return text;
      return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        return GAME.metadata.get(key) ?? "";
      });
    }

    let currentSeg = null;
    if (visibleSegments.length > 0) {
      const idx = Math.min(segmentIndex, visibleSegments.length - 1);
      currentSeg = visibleSegments[idx];
    } else if (node?.text) {
      currentSeg = { speaker: dialogue.npcName, text: node.text };
    }

    const currentText = formatText(currentSeg?.text ?? "");


    function clearAutoTimer() {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    }

    function advanceSegment() {
      clearAutoTimer();
      if (hasSegments && !atLastSegment) {
        setSegmentIndex((i) => Math.min(i + 1, totalSegments - 1));
        return;
      }

      if (!choices.length) {
        setDialogue(null);
        if (dialogueDoneResolverRef.current) {
          dialogueDoneResolverRef.current();
          dialogueDoneResolverRef.current = null;
        }
      }
    }

    return (
      <div className="absolute inset-0 pointer-events-none z-[60]">
        <div className="absolute left-0 right-0 bottom-3 flex justify-center">
          <div
            className="pointer-events-auto w-full max-w-3xl mx-4 p-4 rounded-xl bg-slate-900/95 ring-1 ring-white/10"
            onClick={() => {
              if (choices.length) return;
              advanceSegment();
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-1">

              {/* Auto controls */}
              <div className="flex items-center gap-2">
                <button
                  className="px-2 py-1 rounded bg-slate-800/70 hover:bg-slate-700/70 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAutoTimer();
                    setIsAutoDialogue(v => !v);
                  }}
                  title="Toggle Auto"
                >
                  {isAutoDialogue ? "Auto: ON" : "Auto: OFF"}
                </button>
              </div>
            </div>

            {/* Single current segment */}
            <div className="mb-3 space-y-1">
              {currentSeg && (
                <div className="text-slate-100 leading-snug">
                  {currentSeg.speaker && (
                    <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {currentSeg.speaker}
                    </span>
                  )}
                  <span>{currentText}</span>
                </div>
              )}
            </div>

            {/* Next / Choices */}
            {hasSegments && !atLastSegment ? (
              <div className="flex justify-between items-center">
                <button
                  className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    advanceSegment();
                  }}
                >
                  Next
                </button>
                <div className="text-xs opacity-50">
                  Click/Tap to advance
                </div>
              </div>
            ) : choices.length ? (
              <div className="grid gap-2">
                {choices.map((c, i) => (
                  <button
                    key={i}
                    className="text-left px-3 py-2 rounded-lg bg-slate-800/70 hover:bg-slate-700/70 ring-1 ring-white/10"
                    onPointerUp={(e) => {
                      e.stopPropagation();
                      if (performance.now() - dialogueOpenedAtRef.current < 1500) return;
                      clearAutoTimer();
                      runChoice(c);
                    }}
                  >
                    <span className="opacity-60 mr-2">{i + 1}.</span>
                    {c.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-xs opacity-60">Click to close • Press Esc to close</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  async function loadNamedMap(name, options = {}) {
    const def = MAPS[name];
    if (!def) throw new Error(`Unknown map: ${name}`);
    setMap(null);
    mapBufferRef.current = null;
    mapBufferInfoRef.current = { name: null, w: 0, h: 0 };

    const loaded = await loadTMJ(def.path);

    buildWorldBuffer({ map: loaded, mapName: name });


    setMap(loaded);
    if (!options.deferBgm) {
      const bgmTrack = typeof def.bgm === "function" ? def.bgm(GAME) : def.bgm;
      playBgm(bgmTrack ?? "default");
    }

    if (def.autoStartDialogue) {
      const ok =
        !def.autoStartRequires ||
        (def.autoStartRequires.flagsAny &&
          def.autoStartRequires.flagsAny.some((f) => GAME.flags.has(f))) ||
        (def.autoStartRequires.flagsAll &&
          def.autoStartRequires.flagsAll.every((f) => GAME.flags.has(f)));

      if (ok) {
        let npcToStart = null;
        if (GAME.flags.has("poem_passed") && !GAME.flags.has("maya_scene_complete")) {
          npcToStart = def.npcs.find((n) => n.id === "maya");
        } else if ((GAME.flags.has("BobbyDirty") && !GAME.flags.has("marcus_sent_away") || GAME.flags.has("BobbyGood")) && !GAME.flags.has("marcus_comforts_bobby_bar")) {
          npcToStart = def.npcs.find((n) => n.id === "marcus");
        }

        if (npcToStart && DIALOGUE[npcToStart.dialogueId]) {
          setDialogue({
            npcId: npcToStart.id,
            dlgId: npcToStart.dialogueId,
            nodeId: DIALOGUE[npcToStart.dialogueId].start,
          });
        }
      }

    }
    let spawnList = [...(def.npcs ?? [])];

    const marcusActive =
      (GAME.flags.has("BobbyDirty") && !GAME.flags.has("marcus_sent_away") || GAME.flags.has("BobbyGood")) &&
      !GAME.flags.has("marcus_comforts_bobby_bar");
    const movedToBar = GAME.flags.has("bobby_investigation_bar");
    const johnTimActive = GAME.flags.has("talkedToJane");
    const lostManActive = GAME.flags.has("mislead_lost_man") || GAME.flags.has("helped_lost_man");
    const sneakActive = GAME.flags.has("found_sneak") || GAME.flags.has("sneak_end");
    const comfortScene = GAME.flags.has("marcus_comforts_bobby_bar");
    const mayaActive = GAME.flags.has("poem_passed") && !GAME.flags.has("maya_scene_complete");
    const lucasActive = GAME.flags.has("poem_passed") || GAME.flags.has("poem_failed");
    const bobbyActive = GAME.flags.has("HasMetBobby");
    const timActive = !GAME.flags.has("tim_left");


    if (name === "bar") {
      if (GAME.flags.has("lucas_maya_reject")) {
        spawnList = spawnList.filter(npc => npc.id !== "maya");
      }

    }
    if (name === "pd") {
      if (lucasActive) {
        spawnList = spawnList.filter(npc => npc.id !== "lucas");
      }
      if (bobbyActive) {
        spawnList = spawnList.filter(npc => npc.id !== "bobby")
      }
    }

    if (name === "city") {
      if (lostManActive) {
        spawnList = spawnList.filter(npc => npc.id !== "lost_man");
      }
      if (marcusActive) {
        spawnList = spawnList.filter(n => n.id !== "marcus");
        spawnList.push({
          id: "marcus",
          name: "Marcus",
          x: 25, y: 20,
          gid: 106,
          dialogueId: "marcus",
          direction: "right",
        });
      }
      if (mayaActive) {
        spawnList = spawnList.filter(n => n.id !== "maya");
        spawnList.push({
          id: "maya",
          name: "maya",
          x: 5, y: 27,
          gid: 106,
          dialogueId: "maya",
          direction: "left",
        });
      }
      if (GAME.flags.has("flower_delivered_lucas")) {
        spawnList = spawnList.filter(npc => npc.id !== "lucasCity");
      }
    }

    if (johnTimActive && name == "neighborhood") {

      spawnList = spawnList.filter(n => n.id !== "john" && n.id !== "tim");

      spawnList.push(
        { id: "johnArgue", name: "John", x: 32, y: 12, gid: 451, dialogueId: "johnTim", spriteId: "john", direction: "right", });

      if (timActive) {
        spawnList.push(
          { id: "timArgue", name: "Tim", x: 33, y: 12, gid: 451, spriteId: "tim", direction: "left", });
      }
    }
    if (johnTimActive && name == "johnsHouse") {
      spawnList = spawnList.filter(npc => npc.id !== "john");
    }
    if (sneakActive && name == "neighborhood") {
      spawnList = spawnList.filter(npc => npc.id !== "sneak");
    }

    if (movedToBar) {
      if (name === "bar") {
        spawnList = spawnList.filter(n => n.id !== "bobby");
        spawnList.push({
          id: "bobby",
          x: 7,
          y: 10,
          gid: 106,
          dialogueId: "bobbyBartender",
          direction: "up",
        });
        if (comfortScene) {
          spawnList = spawnList.filter(n => n.id !== "bobby" && n.id !== "marcus");
          spawnList.push({
            id: "bobby",
            x: 9,
            y: 11,
            gid: 3586,
            dialogueId: "marcusBar",
            direction: "right",
          },
            {
              id: "marcus",
              x: 11,
              y: 11,
              gid: 3586,
              dialogueId: "marcusBar",
              direction: "left",
            });
        }
      }

      if (name === "neighborhood") {
        spawnList = spawnList.filter(n => n.id !== "delivery_girl");
        spawnList.push({
          id: "delivery_girl",
          x: 23,
          y: 38,
          gid: 106,
          dialogueId: "delivery_girl",
        });
      }
      if (name === "city") {
        spawnList = spawnList.filter(n => n.id !== "bobbyCity" && n.id !== "delivery_girl");
      }
    }
    const npcObjs = spawnList.map(n =>
      createNpc({
        id: n.id,
        name: n.name,
        x: n.x,
        y: n.y,
        gid: n.gid,
        spriteId: n.spriteId,
        dialogueId: n.dialogueId,
        direction: n.direction ?? "down",
        staticDirection: n.staticDirection
      })
    );
    await loadNpcImages(npcObjs);

    setNpcs(npcObjs);

    playerRef.current.x = def.start.x;
    playerRef.current.y = def.start.y;

    currentMapNameRef.current = name;
    updateCamera();
    if (GAME.flags.size > 0 && !options.skipSave) saveGame();
  }


  function updateCamera() {
    if (!map) return;

    const p = playerRef.current;
    const effCols = Math.min(viewColsRef.current, map.width);
    const effRows = Math.min(viewRowsRef.current, map.height);

    cameraRef.current.x = clamp(
      p.x - Math.floor(effCols / 2),
      0,
      map.width - effCols
    );
    cameraRef.current.y = clamp(
      p.y - Math.floor(effRows / 2),
      0,
      map.height - effRows
    );
  }

  function MapButton({ isTouch, show, onOpen, btnRef }) {
    if (!show) return null;

    return (
      <div className="absolute inset-0 z-50 pointer-events-none">
        <button
          ref={btnRef}
          type="button"
          onClick={onOpen}
          aria-label="Open map"
          className={[
            "pointer-events-auto absolute flex items-center justify-center",
            "rounded-full bg-[rgba(28,21,7,0.8)] backdrop-blur ring-1 ring-white/10 shadow-lg",
            "hover:bg-slate-800/90 active:scale-[0.98] transition",
            isTouch
              ? "top-3 right-3 h-11 w-11"
              : "top-3 right-3 gap-2 px-3 py-2"
          ].join(" ")}
        >
          <MapIcon className="w-5 h-5 text-[rgba(200,168,74,0.9)]" />
          {!isTouch && (
            <>
              <span className="text-sm font-medium text-slate-100">Map</span>
            </>
          )}
        </button>
      </div>
    );
  }
  function TopObjectiveBanner({ objective }) {
    if (!objective) return null;

    return (
      <div className="fixed z-[150] left-0 right-0 pointer-events-none"
        style={{ top: "calc(env(safe-area-inset-top) + 0.5rem)" }}
      >
        <div className="mx-auto w-fit max-w-[92vw]">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-brown-900/90 backdrop-blur px-4 py-2 ring-1 ring-white/10 shadow-lg">
            <span className="text-xs uppercase tracking-wide text-emerald-300/90">
              Objective
            </span>
            <span className="text-sm text-[rgba(200,168,74,0.9)] font-medium truncate">
              {objective.title}
            </span>
            {objective.optional ? (
              <span className="text-[10px] uppercase tracking-wide text-[rgba(200,168,74,0.9)]">
                Optional
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  function getObjectiveWaypoints(obj, gameState) {
    const list = [];

    if (obj.waypoint) list.push(obj.waypoint);
    if (Array.isArray(obj.waypoints)) list.push(...obj.waypoints);

    return list.filter((wp) => {
      if (!wp) return false;
      if (wp.hideWhenFlag && gameState.flags.has(wp.hideWhenFlag)) return false;
      return true;
    });
  }


  function checkMapExit() {
    const def = MAPS[currentMapNameRef.current];
    if (!def?.exits) return;

    const p = playerRef.current;
    for (const ex of def.exits) {
      if (p.x === ex.x && p.y === ex.y) {
        setTransitionMessage("Traveling...");
        document.body.style.setProperty(
          "transition",
          "background-color 400ms ease-in-out"
        );
        setTransitionMessage("Traveling...");
        setFadeOverlay({ visible: true, color: "#000", duration: 400 });

        setTimeout(async () => {
          try {
            await loadNamedMap(ex.to);
            playerRef.current.x = ex.toStart.x;
            playerRef.current.y = ex.toStart.y;

            setTimeout(() => {
              setTransitionMessage(null);
              setFadeOverlay({ visible: false, color: "#000", duration: 300 });
            }, 300);

          } catch (e) {
            console.error("[map-exit]", e);
            alert("Failed to load area. Try again.");
            setTransitionMessage(null);
            setFadeOverlay({ visible: false, color: "#000", duration: 300 });
          }
        }, 400);

      }
    }
  }

  function isBlocked(nx, ny) {
    if (!map) return true;
    if (ny < 0 || nx < 0 || ny >= map.height || nx >= map.width) return true;

    const collisionLayers = map.layers.slice(1);

    for (const layer of collisionLayers) {
      if (layer.grid?.[ny]?.[nx] !== 0) return true;
    }

    // NPCs block player
    for (const npc of npcs) {
      if (npc.x === nx && npc.y === ny) return true;
    }

    return false;
  }

  function tryStep(dx, dy) {
    if (!map) return;
    const p = playerRef.current;
    const nx = clamp(p.x + dx, 0, map.width - 1);
    const ny = clamp(p.y + dy, 0, map.height - 1);
    if (!isBlocked(nx, ny)) {
      p.x = nx;
      p.y = ny;
    }
  }

  function handleMovement(now) {
    const anim = animRef.current;

    if (dialogue || presenting || mapOpenRef.current || tutorialActiveRef.current) {
      return;
    }

    // reset animation if state or direction changed
    if (anim.state !== anim._prevState || anim.dir !== anim._prevDir) {
      anim.frame = 0;
      anim.lastFrameAt = now;
      anim._prevState = anim.state;
      anim._prevDir = anim.dir;
    }

    const k = keysRef.current;
    const up = k.has("w") || k.has("arrowup");
    const left = k.has("a") || k.has("arrowleft");
    const down = k.has("s") || k.has("arrowdown");
    const right = k.has("d") || k.has("arrowright");

    // set facing regardless of cooldown
    if (up && !down) {
      anim.dir = "up";
      anim.flipX = false;
    } else if (down && !up) {
      anim.dir = "down";
      anim.flipX = false;
    } else if (left && !right) {
      anim.dir = "left";
      anim.flipX = true;
    } else if (right && !left) {
      anim.dir = "left";
      anim.flipX = false;
    }

    anim.state = up || down || left || right ? "walk" : "idle";

    if (now - lastStepRef.current < MOVE_COOLDOWN_MS) return;

    const p = playerRef.current;
    const ox = p.x;
    const oy = p.y;

    if (up && !down) tryStep(0, -1);
    else if (down && !up) tryStep(0, 1);
    else if (left && !right) tryStep(-1, 0);
    else if (right && !left) tryStep(1, 0);
    else return;
    if (p.x !== ox || p.y !== oy) {
      lastStepRef.current = now;
      checkMapExit();
    }
    if (
      currentMapNameRef.current === "tutorial" &&
      !GAME.flags.has("hint_talk_seen") &&
      !tutorialActiveRef.current
    ) {
      const ace = npcs.find(n => n.id === "ace");
      if (ace && isAdjacentToPlayer(ace.x, ace.y)) {
        setActiveTutorial({
          hintId: "talk",
          anchorRef: null,
          anchorMobileRef: isTouch ? talkBtnRef : null,
          steps: [isTouch ? "Tap the Talk button to talk to Ace." : "Press E to talk to Ace."],
        });
      }
    }
  }
  useEffect(() => {
    if (!dialogue) {
      stopVoice();
      return;
    }
    const dlg = DIALOGUE[dialogue.dlgId];
    if (!dlg) return;
    const node = dlg.nodes[dialogue.nodeId];
    if (!node) return;

    const key = `${dialogue.dlgId}:${dialogue.nodeId}`;
    if (!visitedNodesRef.current.has(key)) {
      visitedNodesRef.current.add(key);
      applySet(node.set);
    }
    if (node.onEnter) {
      node.onEnter(GAME);
    }
    if (node.gate) {
      const g = node.gate;

      const ok =
        (!g.flagsAll || g.flagsAll.every(hasFlag)) &&
        (!g.flagsAny || g.flagsAny.some(hasFlag)) &&
        (!g.notFlags || !g.notFlags.some(hasFlag)) &&
        (!g.cluesAll || g.cluesAll.every(hasClue)) &&
        (!g.cluesAny || g.cluesAny.some(hasClue)) &&
        (!g.notClues || !g.notClues.some(hasClue));

      if (!ok) {
        setDialogue(d => ({ ...d, nodeId: node.nextFail || "root" }));
        return;
      }
    }


    let played = false;

    const segs = node.segments;
    if (Array.isArray(segs) && segs.length > 0) {
      const visible = segs.filter(seg => !seg.requires || canShow({ requires: seg.requires }));
      const total = visible.length;
      const idx = Math.min(segmentIndex, Math.max(total - 1, 0));
      const seg = total > 0 ? visible[idx] : null;
      if (seg?.cutscene) {
        const key = `${dialogue.dlgId}:${dialogue.nodeId}:${idx}:${seg.cutscene}`;
        if (!playedSegmentCutscenesRef.current.has(key)) {
          playedSegmentCutscenesRef.current.add(key);

          playCutscene(seg.cutscene, {
            loadNamedMap,
            playerRef,
            setTransitionMessage,
            setDialogue,
            npcs,
            setNpcs,
            DIALOGUE,
            flags: GAME.flags,
            setFadeOverlay,
            playBgm,
            stopBgm,
            setEndingScreen,
            setCreditsOverlay,
            goToMainMenu,
            __resolveCreditsClose: null,
            showTutorial: (id) => {
              if (id === "map" && !GAME.flags.has("hint_map_seen")) {
                setActiveTutorial({
                  hintId: "map",
                  anchorRef: mapBtnRef,
                  steps: [
                    "Press M or click here to open the map.",
                    "The map only appears in larger areas like the neighborhood and city.",
                  ]
                });
              }
              if (id === "objectives" && !GAME.flags.has("hint_obj_seen")) {
                setActiveTutorial({
                  hintId: "objectives",
                  anchorRef: objBtnRef,
                  anchorMobileRef: objMobileBtnRef,
                  steps: [
                    "Press O or click here to open your Case Notes.",
                    "All active objectives appear here — check back as you progress.",
                    "You can also save your progress to continue later.",
                  ]
                });
              }
            },
          });
        }
      }
      if (seg?.voice && seg?.speaker) {
        if (suppressNextVoiceRef.current) {
          suppressNextVoiceRef.current = false;
          stopVoice();
          return;
        }
        duckBgm();
        playVoice(seg.speaker.toLowerCase(), seg.voice, { interrupt: true });
        played = true;
      }
    }

    if (!played) stopVoice();

  }, [dialogue, segmentIndex]);

  useEffect(() => {
    const dlg = dialogue ? DIALOGUE[dialogue.dlgId] : null;
    const node = dlg ? dlg.nodes[dialogue.nodeId] : null;
    const segs = node?.segments;
    const hasSegments = Array.isArray(segs) && segs.length > 0;

    if (!hasSegments) return;

    const visible = segs.filter(seg => !seg.requires || canShow({ requires: seg.requires }));
    const total = visible.length;

    setSegmentIndex(i => Math.min(i, Math.max(total - 1, 0)));
  }, [dialogue, objectivesRefresh]);
  useEffect(() => {
    if (skipNextSegmentResetRef.current) {
      skipNextSegmentResetRef.current = false;
      return;
    }
    setSegmentIndex(0);
  }, [dialogue?.dlgId, dialogue?.nodeId]);

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();

      if (k === "o") {
        toggleObjectives();
        return;
      }

      // dialogue numeric shortcuts
      if (dialogue && /^[1-9]$/.test(k)) {
        const dlg = DIALOGUE[dialogue.dlgId];
        const node = dlg?.nodes[dialogue.nodeId];
        if (!node) return;
        const visible = (node.choices || []).filter(canShow);
        const idx = Number(k) - 1;
        const choice = visible[idx];
        if (choice) runChoice(choice);
        return;
      }

      if (k !== "e") return;

      if (dialogue) return;
      for (const npc of npcs) {
        if (isAdjacentToPlayer(npc.x, npc.y)) {
          const now = performance.now();
          if (now - npc._lastTalkAt < npc.cooldownMs) return;
          npc._lastTalkAt = now;

          const player = playerRef.current;
          const facing = getFacingToward(npc.x, npc.y, player.x, player.y);

          setNpcs(prev =>
            prev.map(n =>
              n.id === npc.id && !npc.staticDirection ? { ...n, direction: facing, _lastTalkAt: now } : n
            )
          );

          if (npc.dialogueId && DIALOGUE[npc.dialogueId]) {
            const dlg = DIALOGUE[npc.dialogueId];

            const resumeFlag = `resume_${npc.id}`;
            const resumeNode = GAME.metadata.get(resumeFlag);

            if (resumeNode && dlg.nodes[resumeNode]) {
              GAME.metadata.delete(resumeFlag);
              setDialogue({
                npcId: npc.id,
                npcName: npc.name,
                dlgId: npc.dialogueId,
                nodeId: resumeNode,
              });
              return;
            }

            const metFlag = `met_${npc.id}`;
            const hasMetBefore = GAME.flags.has(metFlag);

            let startNode = dlg.start;
            if (hasMetBefore && dlg.nodes.return_visit) {
              startNode = "return_visit";
            } else {
              GAME.flags.add(metFlag);
            }

            if (npc.id === "tim" && GAME.flags.has("tim_shutdown") && dlg.nodes.shutdown) {
              startNode = "shutdown";
            }
            if (npc.dialogueId === "marcusBar") {
              if (GAME.flags.has("GainedMarcusTrust") && GAME.flags.has("BobbyDirty") && dlg.nodes.bar_dirty_pass) {
                startNode = "bar_dirty_pass";
              } else if (GAME.flags.has("BobbyDirty") && dlg.nodes.bar_dirty_failed) {
                startNode = "bar_dirty_failed";
              } else if (GAME.flags.has("BobbyGood") && dlg.nodes.bar_clean_praise) {
                startNode = "bar_clean_praise";
              }
            }

            setDialogue({
              npcId: npc.id,
              npcName: npc.name,
              dlgId: npc.dialogueId,
              nodeId: startNode,
            });
          }
          return;
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [npcs, dialogue]);
  function computeDialogueDelayMs(text, speed = 1.0) {
    const t = (text ?? "").trim();

    const base = 650;

    const perChar = 26;

    const punct = (t.match(/[.!?]/g)?.length ?? 0) * 180
      + (t.match(/[,;]/g)?.length ?? 0) * 90;

    const raw = base + t.length * perChar + punct;

    const clamped = Math.max(450, Math.min(raw, 6500));

    return Math.round(clamped / Math.max(0.25, speed));
  }

  useEffect(() => {
    if (!dialogue) {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
      return;
    }

    const dlg = DIALOGUE[dialogue.dlgId];
    const node = dlg?.nodes[dialogue.nodeId];
    const segments = node?.segments;
    const hasChoices = (node?.choices || []).filter(canShow).length > 0;

    const hasSegments = Array.isArray(segments) && segments.length > 0;
    const visibleSegments = hasSegments
      ? segments.filter(seg => !seg.requires || canShow({ requires: seg.requires }))
      : [];
    if (hasChoices && !hasSegments) {
      dialogueOpenedAtRef.current = performance.now();
    } else {
      dialogueOpenedAtRef.current = 0;
    }
    const totalSegments = visibleSegments.length;
    const atLastSegment = totalSegments <= 0 || segmentIndex >= totalSegments - 1;

    const canAutoAdvance =
      isAutoDialogue &&
      hasSegments &&
      !atLastSegment;

    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }

    if (!canAutoAdvance) {
      return;
    }
    autoGenRef.current += 1;
    const myGen = autoGenRef.current;
    let cancelled = false;
    let currentSeg = null;

    if (visibleSegments.length > 0) {
      const idx = Math.min(segmentIndex, visibleSegments.length - 1);
      currentSeg = visibleSegments[idx];
    }

    const currentText = currentSeg?.text ?? "";


    async function scheduleAdvance() {
      let delay;

      if (currentSeg?.speaker && currentSeg?.voice) {
        try {
          const audioDuration = await getVoiceDuration(
            currentSeg.speaker.toLowerCase(),
            currentSeg.voice
          );
          if (cancelled || autoGenRef.current !== myGen) return;
          if (audioDuration && audioDuration > 0) {
            delay = Math.round((audioDuration + 300) / autoSpeed);
          } else {
            console.warn('Audio duration invalid, using text timing');
          }
        } catch (err) {
          console.warn('Failed to get audio duration, using text timing', err);
        }
      }

      if (!delay) {
        delay = computeDialogueDelayMs(currentText, autoSpeed, currentSeg?.speaker);
      }

      autoTimerRef.current = setTimeout(() => {
        if (autoGenRef.current !== myGen) return;
        setSegmentIndex((i) => Math.min(i + 1, totalSegments - 1));
      }, delay);
    }

    scheduleAdvance();
    return () => {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
  }, [dialogue?.dlgId, dialogue?.nodeId, segmentIndex, isAutoDialogue, autoSpeed]);
  function getExitDirection(exit, map) {
    if (exit.y <= 1) return "up";
    if (exit.y >= map.height - 2) return "down";
    if (exit.x <= 1) return "left";
    if (exit.x >= map.width - 2) return "right";
    return "up";
  }

  const ARROW = { up: "↑", down: "↓", left: "←", right: "→" };
  function isAdjacentToPlayer(tx, ty) {
    const p = playerRef.current;
    if (currentMapNameRef.current === "shop") {
      if (p.x === tx && Math.abs(p.y - ty) === 3) return true;
    }
    return Math.abs(p.x - tx) + Math.abs(p.y - ty) === 1;
  }

  const tileW = map?.tilewidth ?? TILE_SIZE_FALLBACK;
  const tileH = map?.tileheight ?? TILE_SIZE_FALLBACK;

  const maxCols = map?.width ?? VIEW_COLS;
  const maxRows = map?.height ?? VIEW_ROWS;

  // Available screen space
  const availW = viewportPx.w || VIEW_COLS * tileW * BASE_SCALE;
  const availH = viewportPx.h || VIEW_ROWS * tileH * BASE_SCALE;

  const isDesktop = viewportPx.w >= 1024;

  const effCols = isDesktop
    ? Math.min(VIEW_COLS, maxCols)
    : Math.max(10, Math.min(maxCols, Math.floor(availW / (tileW * BASE_SCALE))));

  const effRows = isDesktop
    ? Math.min(VIEW_ROWS, maxRows)
    : Math.max(8, Math.min(maxRows, Math.floor(availH / (tileH * BASE_SCALE))));

  const scaleW = Math.floor(availW / (effCols * tileW));
  const scaleH = Math.floor(availH / (effRows * tileH));
  const renderScale = Math.max(1, Math.min(scaleW, scaleH));
  useEffect(() => {
    if (!map) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    let rafId;
    const draw = (now) => {
      handleMovement(now);
      updateCamera();

      const tw = map.tilewidth;
      const th = map.tileheight;

      ctx.save();
      ctx.scale(renderScale, renderScale);
      ctx.fillStyle = "#202c39";
      ctx.fillRect(0, 0, c.width / renderScale, c.height / renderScale);


      let markerIndex = 0;
      const mapName = currentMapNameRef.current;
      const mapDef = MAPS[mapName];
      const cam = cameraRef.current;
      const buf = worldBufferRef.current;

      if (buf && worldBufferMetaRef.current.mapName === mapName) {
        const sx = cam.x * tw;
        const sy = cam.y * th;
        const sw = effCols * tw;
        const sh = effRows * th;

        ctx.drawImage(buf, sx, sy, sw, sh, 0, 0, sw, sh);
      }

      if (mapDef?.exits) {
        for (const exit of mapDef.exits) {
          const rx = (exit.x - cam.x) * tw;
          const ry = (exit.y - cam.y) * th;
          const cx = rx + tw / 2;
          const cy = ry + th / 2;
          const pulse = Math.sin(now * 0.002) * 0.3 + 0.7;
          const dir = getExitDirection(exit, map);
          const arrow = ARROW[dir];

          ctx.save();

          // square glow
          const glowSize = tw * 1.6;
          const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize);
          grd.addColorStop(0, `rgba(200,160,70,${0.22 * pulse})`);
          grd.addColorStop(0.5, `rgba(180,130,40,${0.10 * pulse})`);
          grd.addColorStop(1, "rgba(180,130,40,0)");
          ctx.fillStyle = grd;
          ctx.fillRect(cx - glowSize, cy - glowSize, glowSize * 2, glowSize * 2);

          // Arrow
          ctx.font = `${Math.floor(tw * 0.9)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.lineWidth = 3;
          ctx.strokeStyle = "rgba(0,0,0,0.6)";
          ctx.strokeText(arrow, cx, cy);
          ctx.fillStyle = `rgba(200,160,70,${pulse})`;
          ctx.fillText(arrow, cx, cy);

          ctx.restore();
        }
      }
      const npcIdsWithWaypoints = new Set(
        activeObjectives.flatMap(obj => getObjectiveWaypoints(obj, GAME))
          .filter(wp => wp.type === "npc")
          .map(wp => wp.id)
      );
      // Draw NPCs with proximity glow
      for (const npc of npcs) {
        const rx = (npc.x - cam.x) * tw;
        const ry = (npc.y - cam.y) * th;
        const close = isAdjacentToPlayer(npc.x, npc.y);

        ctx.save();
        if (npc.dialogueId && !npcIdsWithWaypoints.has(npc.id) && !dialogue) {
          const bx = rx + tw / 2;
          const by = ry - th * 1.8;
          const bw = tw * 1.4;
          const bh = th * 0.7;

          ctx.fillStyle = "rgba(255,255,255,0.92)";
          ctx.beginPath();
          ctx.roundRect(bx - bw / 2, by - bh / 2, bw, bh, 3);
          ctx.fill();

          // tail
          ctx.beginPath();
          ctx.moveTo(bx - 3, by + bh / 2);
          ctx.lineTo(bx + 3, by + bh / 2);
          ctx.lineTo(bx, by + bh / 2 + 4);
          ctx.fill();

          ctx.fillStyle = "#1e293b";
          ctx.font = `bold ${Math.floor(tw * 0.5)}px monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("...", bx, by);
        }
        if (close) {
          ctx.filter = "brightness(1.35)";
          ctx.shadowColor = "rgba(255,255,255,0.35)";
          ctx.shadowBlur = 6;
        }
        if (npc._img) {
          const { row, flipX } = facingToRender(npc.direction ?? "down");
          const sx = 0;
          const sy = row * SPRITE.fh;

          if (flipX) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(npc._img, sx, sy, SPRITE.fw, SPRITE.fh, -rx - tw, ry - th, tw, th * 2);
            ctx.restore();
          } else {
            ctx.drawImage(npc._img, sx, sy, SPRITE.fw, SPRITE.fh, rx, ry - th, tw, th * 2);
          }
        }
        ctx.restore();
      }
      for (const obj of activeObjectives) {
        const waypoints = getObjectiveWaypoints(obj, GAME);

        for (const wp of waypoints) {
          const tile = resolveWaypointTile(wp, npcs, mapName, mapDef);
          if (!tile) continue;

          const screenX = (tile.x - cam.x) * tw;
          const screenY = (tile.y - cam.y) * th;

          drawWaypointMarker(
            ctx,
            screenX,
            screenY - (markerIndex % 3) * 8,
            tw,
            obj.optional
          );

          markerIndex++;
        }
      }

      // Draw player
      const p = playerRef.current;
      const px = (p.x - cam.x) * tw;
      const py = (p.y - cam.y) * th;

      const sprites = spriteRef.current;
      const anim = animRef.current;
      const sheet = sprites.sheet;
      const cols = anim.state === "walk" ? SPRITE.walkCols : SPRITE.idleCols;

      const row =
        anim.dir === "down"
          ? SPRITE.rows.down
          : anim.dir === "up"
            ? SPRITE.rows.up
            : SPRITE.rows.side;

      if (sheet) {
        const period = SPRITE.msPerFrame[anim.state];
        if (now - anim.lastFrameAt >= period) {
          anim.frame = (anim.frame + 1) % cols;
          anim.lastFrameAt = now;
        }

        const frame = anim.state === "idle" ? 0 : anim.frame; // idle freezes on frame 0
        const sx = frame * SPRITE.fw;
        const sy = row * SPRITE.fh;

        ctx.save();
        if (anim.flipX) {
          ctx.scale(-1, 1);
          ctx.drawImage(sheet, sx, sy, SPRITE.fw, SPRITE.fh, -px - tw, py - th, tw, th * 2);
        } else {
          ctx.drawImage(sheet, sx, sy, SPRITE.fw, SPRITE.fh, px, py - th, tw, th * 2);
        }
        ctx.restore();
      }


      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.font = "16px ui-sans-serif, system-ui, -apple-system";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(
        "WASD: Move • E: Talk",
        12,
        22
      );

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [map, npcs, dialogue, presenting, viewportPx.w, viewportPx.h, effCols, effRows, renderScale]);
  // Keep camera math consistent everywhere
  useEffect(() => {
    viewColsRef.current = effCols;
    viewRowsRef.current = effRows;
  }, [effCols, effRows]);

  const width = effCols * tileW * renderScale;
  const height = effRows * tileH * renderScale;

  useEffect(() => {
    const bg = bgCanvasRef.current;
    const world = worldBufferRef.current;
    if (!bg || !world) return;
    const ctx = bg.getContext("2d");
    bg.width = window.innerWidth;
    bg.height = window.innerHeight;
    ctx.fillStyle = "#0a0806";
    ctx.fillRect(0, 0, bg.width, bg.height);
    ctx.drawImage(world, 0, 0, bg.width, bg.height);
  }, [map]);

  return (
    <div className="fixed inset-0 text-slate-100 overflow-hidden">
      <canvas
        ref={bgCanvasRef}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          filter: "blur(14px) brightness(0.28) saturate(1.6)",
          transform: "scale(1.06)",
          transformOrigin: "center",
          zIndex: 0,
        }}
      />
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.75) 100%)",
        pointerEvents: "none",
      }} />
      <TopObjectiveBanner objective={activeObjectives?.[0]} />
      <div
        ref={viewportRef}
        className="absolute inset-0"
        style={{
          paddingTop: isShortHeight
            ? "env(safe-area-inset-top)"
            : "calc(3.25rem + env(safe-area-inset-top))",
          zIndex: 2,
        }}
      >
        <div className="w-full h-full grid place-items-center">
          <div className="relative">
            <div className="rounded-2xl shadow-xl ring-1 ring-white/10 overflow-hidden relative">
              <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ width, height }}
                className="block"
              />
              {!map && (
                <div className="absolute inset-0 grid place-items-center text-sm text-slate-300">
                  Loading…
                </div>
              )}
              {isTouch && (
                <MobileControls
                  onPress={press}
                  onRelease={release}
                  show={!presenting}
                  talkBtnRef={talkBtnRef}
                />
              )}
              <ObjectivesPanel
                gameState={GAME}
                refreshToken={objectivesRefresh}
                isMinimized={objectivesMinimized}
                onToggle={toggleObjectives}
                defaultOpen={false}
                onActiveObjectives={setActiveObjectives}
                btnRef={objBtnRef}
                mobileBtnRef={objMobileBtnRef}
                onSave={saveGame}
              />
              <div className="absolute pointer-events-none inset-0 z-50">
                <MapButton
                  isTouch={isTouch}
                  show={showMapButton}
                  onOpen={() => setMapOpen(true)}
                  btnRef={mapBtnRef}
                />
              </div>
              {activeTutorial && (
                <TutorialHint
                  anchorRef={activeTutorial.anchorRef}
                  anchorMobileRef={activeTutorial.anchorMobileRef}
                  steps={activeTutorial.steps}
                  onDismiss={() => {
                    GAME.flags.add(`hint_${activeTutorial.hintId}_seen`);
                    setActiveTutorial(null);
                  }}
                />
              )}
              {mapOpen && (
                <FullMap
                  worldBufferRef={worldBufferRef}
                  playerRef={playerRef}
                  playerFacing={playerFacing}
                  npcs={npcs}
                  activeObjectives={activeObjectives}
                  mapName={currentMapNameRef.current}
                  exits={MAPS[currentMapNameRef.current]?.exits ?? []}
                  map={map}
                  onClose={() => setMapOpen(false)}
                />
              )}
              {transitionMessage && (
                <div className="absolute inset-0 z-[1000] pointer-events-none grid place-items-center">
                  <div className="max-w-xl mx-4 rounded-2xl bg-slate-900/80 ring-1 ring-white/10 px-5 py-3 text-center">
                    <div className="text-sm text-slate-100 whitespace-pre-line">
                      {transitionMessage}
                    </div>
                  </div>
                </div>
              )}

              <DialogueOverlay dialogue={dialogue} setDialogue={setDialogue} />
              {nameInput.visible && (
                <div style={{
                  position: "fixed", inset: 0, zIndex: 9999,
                  background: "rgba(2,1,0,0.85)", backdropFilter: "blur(4px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "1rem",
                  fontFamily: "'Courier Prime', 'Courier New', monospace",
                }}>
                  <div style={{
                    background: "linear-gradient(175deg, #141008 0%, #0e0b06 100%)",
                    border: "1px solid rgba(120,95,50,0.35)",
                    boxShadow: "0 0 60px rgba(0,0,0,0.9)",
                    padding: "2rem", width: "100%", maxWidth: "400px",
                    position: "relative",
                  }}>
                    {/* Red bar */}
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: 2,
                      background: "linear-gradient(90deg, transparent, rgba(160,35,35,0.65), transparent)"
                    }} />

                    <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(140,108,48,0.45)", marginBottom: 12 }}>
                      DETECTIVE'S FIELD NOTES
                    </div>
                    <div style={{
                      fontFamily: "'Special Elite', monospace", fontSize: "1.4rem",
                      color: "#c8a84a", marginBottom: "1.5rem", letterSpacing: "0.06em"
                    }}>
                      What's your name, Detective?
                    </div>

                    <NameInputField onSubmit={nameInput.onSubmit} />
                  </div>
                </div>
              )}
              {endingScreen.visible && (
                <div className="fixed inset-0 z-[9998] text-white flex items-center justify-center p-6"
                  style={{ background: "linear-gradient(175deg, #141008 0%, #0e0b06 50%, #0a0806 100%)", fontFamily: "'Courier Prime', 'Courier New', monospace" }}
                >
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 2,
                    background: "linear-gradient(90deg, transparent, rgba(160,35,35,0.65) 25%, rgba(160,35,35,0.65) 75%, transparent)"
                  }} />

                  <div className="w-full max-w-2xl relative z-10">
                    {/* Header */}
                    <div className="mb-8 text-center">
                      <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(140,108,48,0.5)", marginBottom: 8 }}>
                        CASE CLOSED
                      </div>
                      <h1 style={{ fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "#c8a84a", letterSpacing: "0.08em", margin: 0 }}>
                        Case Files
                      </h1>
                      {endingScreen.currentEnding && (
                        <div style={{ marginTop: 8, fontSize: 12, color: "rgba(160,130,70,0.55)", letterSpacing: "0.12em" }}>
                          YOU REACHED — <span style={{ color: "rgba(200,168,74,0.85)" }}>{endingScreen.currentEnding.title.toUpperCase()}</span>
                        </div>
                      )}
                    </div>

                    {/* Endings grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                      {endingScreen.endings.map((e) => (
                        <div key={e.id} style={{
                          padding: "14px 16px",
                          border: e.isCurrent
                            ? "1px solid rgba(200,168,74,0.55)"
                            : "1px solid rgba(120,95,50,0.2)",
                          background: e.isCurrent
                            ? "rgba(160,118,40,0.08)"
                            : "rgba(0,0,0,0.2)",
                          position: "relative",
                          opacity: e.seen || e.isCurrent ? 1 : 0.5,
                        }}>
                          {e.isCurrent && (
                            <div style={{
                              position: "absolute", top: -1, left: 0, right: 0, height: 2,
                              background: "linear-gradient(90deg, transparent, rgba(200,168,74,0.5), transparent)"
                            }} />
                          )}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                            <div style={{ fontFamily: "'Special Elite', monospace", fontSize: 14, color: e.seen || e.isCurrent ? "#c8a84a" : "rgba(160,130,70,0.5)", letterSpacing: "0.06em" }}>
                              {e.title}
                            </div>
                            {e.isCurrent && (
                              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(200,168,74,0.7)", border: "1px solid rgba(200,168,74,0.3)", padding: "2px 6px" }}>
                                REACHED
                              </div>
                            )}
                            {e.seen && !e.isCurrent && (
                              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(120,95,50,0.5)" }}>
                                SEEN
                              </div>
                            )}
                          </div>
                          <div style={{ fontSize: 11, lineHeight: 1.6, color: e.seen || e.isCurrent ? "rgba(185,155,90,0.75)" : "rgba(120,95,50,0.45)", fontStyle: e.seen || e.isCurrent ? "normal" : "italic" }}>
                            {e.seen || e.isCurrent ? e.description : "Complete this ending to unlock."}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Progress */}
                    <div style={{ marginBottom: 24, textAlign: "center", fontSize: 10, letterSpacing: "0.2em", color: "rgba(120,95,50,0.45)" }}>
                      {endingScreen.endings.filter(e => e.seen || e.isCurrent).length} / {endingScreen.endings.length} ENDINGS DISCOVERED
                    </div>

                    <div className="flex justify-center">
                      <button
                        style={{
                          background: "transparent", border: "1px solid rgba(160,118,40,0.4)", color: "rgba(200,168,74,0.8)",
                          padding: "10px 32px", fontFamily: "'Courier Prime', monospace", fontSize: 11, letterSpacing: "0.2em", cursor: "pointer"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(160,118,40,0.08)"; e.currentTarget.style.borderColor = "rgba(200,168,74,0.65)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(160,118,40,0.4)"; }}
                        onClick={() => endingScreen.onContinue?.()}
                      >
                        VIEW CREDITS
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {creditsOverlay.visible && (
                <div className="fixed inset-0 z-[9999] bg-black/95 text-white flex items-center justify-center p-6">
                  <div className="w-full max-w-xl">
                    <div className="text-center text-2xl font-bold mb-6">
                      {creditsOverlay.credits?.title ?? "CREDITS"}
                    </div>
                    <div className="space-y-5 max-h-[65vh] overflow-auto px-2">
                      {(creditsOverlay.credits?.sections ?? []).map((sec, i) => (
                        <div key={i} className="text-sm opacity-90 space-y-2">
                          {sec.lines.map((line, j) => (
                            <div key={j}>
                              <div>{typeof line === "string" ? line : line.main}</div>
                              {typeof line !== "string" && line.sub && (
                                <div className="text-xs opacity-70 ml-3">{line.sub}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}

                      <div className="pt-4 text-center text-sm opacity-80">
                        {(creditsOverlay.credits?.footerLines ?? ["Thanks for playing."]).map((l, i) => (
                          <div key={i}>{l}</div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                      <button
                        className="px-4 py-2 rounded bg-white/10 hover:bg-white/20"
                        onClick={() => {
                          const cb = creditsOverlay.onContinue;
                          setCreditsOverlay({ visible: false, credits: null, onContinue: null });
                          if (typeof cb === "function") cb();
                        }}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div
                className="absolute inset-0 pointer-events-none z-[999]"
                style={{
                  backgroundColor: fadeOverlay.color,
                  opacity: fadeOverlay.visible ? 1 : 0,
                  transition: `opacity ${fadeOverlay.duration}ms linear`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}