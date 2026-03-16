import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import OverlayIntro from "../components/OverlayIntro.jsx";
import { Gamepad2, Users, ChevronRight } from "lucide-react";
import { playBgm } from "../storymode/environment/audioManager.js";

function RainCanvas({ intensity = 1 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let rafId;
    let drops = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDrops();
    };

    function initDrops() {
      const count = Math.floor((canvas.width / 4) * intensity);
      drops = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        len: Math.random() * 14 + 6,
        speed: Math.random() * 8 + 10,
        opacity: Math.random() * 0.75 + 0.05,
        width: Math.random() * 0.6 + 0.3,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of drops) {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * 0.15, d.y + d.len);
        ctx.strokeStyle = `rgba(180,210,255,${d.opacity})`;
        ctx.lineWidth = d.width;
        ctx.stroke();

        d.y += d.speed;
        d.x -= d.speed * 0.15;
        if (d.y > canvas.height) { 
          d.y = -d.len;
          d.x = Math.random() * canvas.width;
        }
      }
      rafId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0,
        pointerEvents: "none", zIndex: 1,
        opacity: 0.55,
      }}
    />
  );
}

function Glow({ multi }) {
  const blobs = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      x: (i * 67 + 13) % 100,
      y: 50 + ((i * 43 + 7) % 50),
      size: 80 + ((i * 31 + 11) % 160),
      dur: 4 + ((i * 17 + 3) % 6),
      del: (i * 0.4) % 4,
      warm: i % 3 !== 0,
    }))
  ).current;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {blobs.map((b, i) => {
        const base = b.warm
          ? multi ? "16,185,129" : "180,120,30"
          : multi ? "80,220,160" : "200,80,40";
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(${base},0.18) 0%, transparent 70%)`,
              filter: "blur(28px)",
              transform: "translate(-50%,-50%)",
              animation: `bokehFloat ${b.dur}s ease-in-out ${b.del}s infinite alternate`,
              transition: "background 0.6s ease",
            }}
          />
        );
      })}
      <style>{`
        @keyframes bokehFloat {
          from { transform: translate(-50%,-50%) scale(1);   opacity: 0.6; }
          to   { transform: translate(-50%,-50%) scale(1.2); opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
function Lightning({ multi }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let rafId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    function buildBolt(startX) {
      const points = [{ x: startX, y: 0 }];
      let x = startX;
      const steps = 12 + Math.floor(Math.random() * 8);
      for (let i = 1; i <= steps; i++) {
        x += (Math.random() - 0.5) * 120;
        points.push({ x, y: (canvas.height * i) / steps });
      }
      return points;
    }

    function drawBolt(points, alpha, width, color) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = `rgba(${color},${alpha})`;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }

    let active = false;

    function triggerLightning() {
      if (active) return;
      active = true;

      const startX = canvas.width * (0.2 + Math.random() * 0.6);
      const bolt = buildBolt(startX);
      //second branch
      const branch = Math.random() > 0.5
        ? buildBolt(startX + (Math.random() - 0.5) * 80)
        : null;

      const color = multi ? "160,240,200" : "255,240,180";
      let frame = 0;
      const frames = [
        [0.18, 1.0, 3],
        [0.08, 0.8, 2],
        [0.22, 1.0, 4],
        [0.04, 0.5, 1.5],
        [0.12, 0.7, 2],
        [0.01, 0.2, 1],
      ];
      function animateFlash() {
        if (frame >= frames.length) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          active = false;
          scheduleNext();
          return;
        }
        const [screenA, boltA, boltW] = frames[frame];

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Screen flash
        ctx.fillStyle = `rgba(${color},${screenA})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawBolt(bolt, boltA, boltW + 2, color);
        drawBolt(bolt, boltA, boltW, "255,255,255");

        if (branch) {
          drawBolt(branch, boltA * 0.6, boltW * 0.6, color);
          drawBolt(branch, boltA * 0.6, boltW * 0.4, "255,255,255");
        }

        frame++;
        rafId = setTimeout(() => requestAnimationFrame(animateFlash), 40);
      }

      requestAnimationFrame(animateFlash);
    }

    function scheduleNext() {

      const delay = 4000 + Math.random() * 7000;
      rafId = setTimeout(triggerLightning, delay);
    }

    scheduleNext();

    return () => {
      clearTimeout(rafId);
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [multi]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0,
        pointerEvents: "none", zIndex: 3,
      }}
    />
  );
}

const THEMES = {
  amber: {
    glow: "radial-gradient(circle at top, rgba(180,120,30,0.25), transparent 60%), radial-gradient(circle at bottom, rgba(120,70,10,0.15), transparent 60%)",
    glowTop: "rgba(180,130,40,0.22)",
    badge: "rgba(180,140,50,0.25)",
    badgeBg: "rgba(0,0,0,0.4)",
    badgeText: "rgba(210,170,80,0.75)",
    sparkle: "rgba(220,180,80,0.9)",
    title: "#e8d5a0",
    subtitle: "rgba(210,180,110,0.55)",
    startBorder: "rgba(200,160,70,0.35)",
    startText: "#e8d5a0",
    startHint: "rgba(210,180,110,0.35)",
    startHintEm: "rgba(210,180,110,0.6)",
    footer: "rgba(180,140,60,0.3)",
  },
  green: {
    glow: "radial-gradient(circle at top, rgba(16,185,129,0.22), transparent 60%), radial-gradient(circle at bottom, rgba(6,95,70,0.15), transparent 60%)",
    glowTop: "rgba(16,185,129,0.2)",
    badge: "rgba(16,185,129,0.25)",
    badgeBg: "rgba(0,0,0,0.4)",
    badgeText: "rgba(110,240,190,0.75)",
    sparkle: "rgba(110,240,190,0.9)",
    title: "#d0f5e8",
    subtitle: "rgba(110,220,170,0.55)",
    startBorder: "rgba(16,185,129,0.4)",
    startText: "#d0f5e8",
    startHint: "rgba(16,185,129,0.35)",
    startHintEm: "rgba(110,240,190,0.6)",
    footer: "rgba(16,185,129,0.3)",
  },
};

const TR = "0.5s ease";

const KEYFRAMES = `
  @keyframes slideFromLeft {
    0%   { opacity: 0; transform: translateX(-60px) scale(0.97); }
    60%  { transform: translateX(6px) scale(1.01); }
    100% { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes slideFromRight {
    0%   { opacity: 0; transform: translateX(60px) scale(0.97); }
    60%  { transform: translateX(-6px) scale(1.01); }
    100% { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes amberPulse {
    0%, 100% { box-shadow: 0 0 0px 0px rgba(251,191,36,0);    transform: scale(1); }
    50%       { box-shadow: 0 0 18px 2px rgba(251,191,36,0.18); transform: scale(1.004); }
  }
  @keyframes emeraldPulse {
    0%, 100% { box-shadow: 0 0 0px 0px rgba(16,185,129,0);    transform: scale(1); }
    50%       { box-shadow: 0 0 18px 2px rgba(16,185,129,0.18); transform: scale(1.004); }
  }
`;
function NeonSign({ onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
      <span style={{
        fontFamily: "'Courier Prime', 'Courier New', monospace",
        fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
        fontWeight: 700,
        letterSpacing: "0.35em",
        color: "#fde68a",
        animation: "neonFlicker 6s linear infinite",
        display: "block",
        paddingRight: "0.35em",
      }}>
        WELCOME
      </span>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(false);
  const [armed, setArmed] = useState(false);
  const [multi, setMulti] = useState(false);
  const [enterKey, setEnterKey] = useState(0);
  const theme = multi ? THEMES.green : THEMES.amber;

  useEffect(() => {
    const seen = null;
    if (!seen) setShowIntro(true);
    else setArmed(true);
  }, []);
  useEffect(() => {
    if (armed) setEnterKey(k => k + 1);
  }, [armed]);

  const handleIntroFinish = () => {
    sessionStorage.setItem("introSeen", "1");
    playBgm("main_menu");
    setShowIntro(false);
    setArmed(true);
  };

  const goSingle = () => navigate("/storyMenu");
  const goMulti = () => navigate("/multi");

  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden bg-black">
      <style>{KEYFRAMES}</style>

      <Glow multi={multi} />

      <RainCanvas intensity={0.8} />
      <Lightning multi={multi} />
      {/* Atmosphere shifts on hover */}
      <div
        aria-hidden
        style={{ background: theme.glow, transition: `background ${TR}` }}
        className="pointer-events-none absolute inset-0 z-[2]"
      />

      <div
        aria-hidden
        style={{
          background: multi
            ? "linear-gradient(to top, rgba(16,185,129,0.07) 0%, transparent 30%)"
            : "linear-gradient(to top, rgba(180,120,30,0.07) 0%, transparent 30%)",
          transition: `background ${TR}`,
        }}
        className="pointer-events-none absolute inset-0 z-[2]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] opacity-[0.025] bg-[linear-gradient(120deg,#fff_1px,transparent_1px),linear-gradient(0deg,#fff_1px,transparent_1px)] bg-[length:180px_180px]"
      />

      <div
        aria-hidden
        style={{
          background: `radial-gradient(circle, ${theme.glowTop}, transparent 60%)`,
          transition: `background ${TR}`,
        }}
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full blur-3xl opacity-30 z-[2]"
      />

      {showIntro && (
        <OverlayIntro onFinish={handleIntroFinish} message="Welcome to the Bother Arcade" onAudioStart={() => playBgm("pre_menu")} />
      )}

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center px-4 py-10">
        <div className="max-w-3xl w-full text-center space-y-8">

          <div
            style={{
              borderColor: theme.badge, background: theme.badgeBg,
              color: theme.badgeText, transition: `border-color ${TR}, color ${TR}`,
            }}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs mx-auto"
          >

            BOTHER ARCADE
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1
              style={{ color: theme.title, transition: `color ${TR}` }}
              className="text-3xl sm:text-5xl font-semibold tracking-tight drop-shadow-sm"
            >
              {multi ? "Enter the Arcade." : "Step into the case."}
            </h1>
            <p
              style={{ color: theme.subtitle, transition: `color ${TR}` }}
              className="text-sm sm:text-base"
            >
              Choose your mode.
            </p>
          </div>

          {!armed ? (
            <div className="grid place-items-center pt-6">
              <NeonSign onClick={() => setArmed(true)} />
              <div style={{ color: theme.startHint, transition: `color ${TR}` }} className="mt-6 text-[11px]">
                Tip: Press{" "}
                <span style={{ color: theme.startHintEm, transition: `color ${TR}` }}>Enter</span>{" "}
                to start · Press{" "}
                <span style={{ color: theme.startHintEm, transition: `color ${TR}` }}>Esc</span>{" "}
                for intro
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Single Player */}
              <button
                key={`single-${enterKey}`}
                onClick={goSingle}
                style={{
                  animation: `slideFromLeft 0.55s cubic-bezier(0.22,1,0.36,1) both,
                               amberPulse 3.2s ease-in-out 0.8s infinite`,
                }}
                className="group relative overflow-hidden rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5 text-left hover:bg-amber-500/10 active:translate-y-[1px]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-11 w-11 rounded-xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center">
                    <Gamepad2 className="h-5 w-5 text-amber-100" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-amber-50 tracking-wide">Single Player</div>
                    <div className="text-xs text-amber-100/55">Story mode · Voice acting · Branching outcomes</div>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-amber-100/60 mb-5">
                  {["Full story mode", "Multiple endings", "Voice acting"].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400/70 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-50">
                  Enter Story Mode
                  <ChevronRight className="h-4 w-4 opacity-80 group-hover:translate-x-0.5 transition" />
                </div>
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle,rgba(255,200,80,0.06),transparent_55%)] transition" />
              </button>

              {/* Multiplayer */}
              <button
                key={`multi-${enterKey}`}
                onClick={goMulti}
                onMouseEnter={() => setMulti(true)}
                onMouseLeave={() => setMulti(false)}
                style={{
                  animation: `slideFromRight 0.55s cubic-bezier(0.22,1,0.36,1) 0.08s both,
                               emeraldPulse 3.2s ease-in-out 1s infinite`,
                }}
                className="group relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-5 text-left hover:bg-emerald-500/10 active:translate-y-[1px]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-11 w-11 rounded-xl bg-emerald-400/15 border border-emerald-400/40 flex items-center justify-center">
                    <Users className="h-5 w-5 text-emerald-100" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-emerald-50 tracking-wide">Multiplayer</div>
                    <div className="text-xs text-emerald-100/55">Arcade games · Live lobbies</div>
                  </div>
                </div>
                <ul className="space-y-2 text-xs text-emerald-100/60 mb-5">
                  {["Browse lobbies and jump in with friends", "Quick matches", "Play classic games"].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-50">
                  Enter Multiplayer
                  <ChevronRight className="h-4 w-4 opacity-80 group-hover:translate-x-0.5 transition" />
                </div>
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle,rgba(16,185,129,0.12),transparent_60%)] transition" />
              </button>

            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 z-10 px-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between text-[10px]">
          <span style={{ color: theme.footer, transition: `color ${TR}` }}>© Bother Arcade</span>
        </div>
      </div>
    </div>
  );
}