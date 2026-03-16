import { useEffect, useRef, useState, useCallback } from "react";

function Rain() {
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
            const count = Math.floor(canvas.width / 14);
            drops = Array.from({ length: count }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                len: Math.random() * 10 + 5,
                speed: Math.random() * 4 + 5,
                opacity: Math.random() * 0.12 + 0.03,
                width: Math.random() * 0.5 + 0.2,
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
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            style={{
                position: "absolute", inset: 0,
                pointerEvents: "none",
                opacity: 0.7,
            }}
        />
    );
}

const isMobile = /iPad|iPhone|iPod|Android/i.test(
    typeof navigator !== "undefined" ? navigator.userAgent : ""
);

export default function OverlayIntro({ onFinish, message, onAudioStart }) {
    const [text, setText] = useState("");
    const [done, setDone] = useState(false);
    const [skipVisible, setSkipVisible] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const [tapped, setTapped] = useState(!isMobile);
    const intervalRef = useRef(null);
    const full = message ?? "Welcome";

    const handleTap = useCallback(() => {
        onAudioStart?.();
        setTapped(true);
    }, [onAudioStart]);

    // only starts after tap on mobile
    useEffect(() => {
        if (!tapped) return;
        if (!isMobile) onAudioStart?.();
        let i = 0;
        const startDelay = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                i += 1;
                setText(full.slice(0, i));
                if (i >= full.length) {
                    clearInterval(intervalRef.current);
                    setDone(true);
                }
            }, 55);
        }, 800);
        return () => {
            clearTimeout(startDelay);
            clearInterval(intervalRef.current);
        };
    }, [tapped, full]);

    useEffect(() => {
        if (!tapped) return;
        const t = setTimeout(() => setSkipVisible(true), 3000);
        return () => clearTimeout(t);
    }, [tapped]);

    const finish = useCallback(() => {
        setFadeOut(true);
        setTimeout(() => onFinish?.(), 600);
    }, [onFinish]);

    const interact = useCallback(() => {
        if (!tapped) return;
        if (!done) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setText(full);
            setDone(true);
            return;
        }
        finish();
    }, [tapped, done, full, finish]);

    useEffect(() => {
        const key = () => interact();
        window.addEventListener("keydown", key);
        return () => window.removeEventListener("keydown", key);
    }, [interact]);

    if (!tapped) {
        return (
            <div
                onPointerDown={handleTap}
                style={{
                    position: "fixed", inset: 0, zIndex: 100,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    cursor: "pointer", userSelect: "none",
                    fontFamily: "'Courier Prime', 'Courier New', monospace",
                }}
            >
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(175deg, #0d0b07 0%, #080604 50%, #060402 100%)" }} />
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.85) 100%)" }} />
                <Rain />
                <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1.2rem", textAlign: "center", padding: "2rem" }}>
                    <h1 style={{
                        fontFamily: "'Courier Prime', monospace",
                        fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 700,
                        color: "rgba(210,175,90,0.9)", letterSpacing: "0.12em",
                        margin: 0, textShadow: "0 0 40px rgba(180,130,40,0.2)", lineHeight: 1.1,
                    }}>
                        BOTHER'S<br />
                        <span style={{ fontWeight: 400, fontStyle: "italic", color: "rgba(180,140,60,0.55)", fontSize: "0.7em", letterSpacing: "0.08em" }}>
                            arcade
                        </span>
                    </h1>
                    <div style={{ width: "clamp(40px,10vw,80px)", height: "1px", background: "linear-gradient(90deg, transparent, rgba(160,100,30,0.4), transparent)" }} />
                    <div style={{
                        fontSize: "11px", letterSpacing: "0.28em",
                        color: "rgba(200,160,70,0.55)",
                        animation: "cursorBlink 1.8s ease-in-out infinite",
                        marginTop: "0.5rem",
                    }}>
                        — TAP TO ENTER —
                    </div>
                </div>
                <style>{`@keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0.2} }`}</style>
            </div>
        );
    }

    return (
        <div
            onClick={interact}
            style={{
                position: "fixed", inset: 0, zIndex: 100,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                background: "#07050302",
                cursor: "pointer",
                userSelect: "none",
                opacity: fadeOut ? 0 : 1,
                transition: fadeOut ? "opacity 0.6s ease" : "none",
                fontFamily: "'Courier Prime', 'Courier New', monospace",
            }}
        >
            <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(175deg, #0d0b07 0%, #080604 50%, #060402 100%)",
            }} />

            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.85) 100%)",
            }} />

            <div style={{
                position: "absolute", bottom: 0, left: "50%",
                transform: "translateX(-50%)",
                width: "70vw", height: "40vh",
                background: "radial-gradient(ellipse at bottom, rgba(160,100,20,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            <Rain />

            {/* Content */}
            <div style={{
                position: "relative", zIndex: 1,
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: "1.5rem",
                padding: "2rem",
                textAlign: "center",
            }}>

                <div style={{
                    fontSize: "10px", letterSpacing: "0.35em",
                    color: "rgba(160,120,50,0.4)",
                    textTransform: "uppercase",
                }}>
                    KESHAWN BRYANT PRESENTS
                </div>

                {/* Main title */}
                <h1 style={{
                    fontFamily: "'Courier Prime', monospace",
                    fontSize: "clamp(2rem, 6vw, 3.5rem)",
                    fontWeight: 700,
                    color: "rgba(210,175,90,0.9)",
                    letterSpacing: "0.12em",
                    margin: 0,
                    textShadow: "0 0 40px rgba(180,130,40,0.2)",
                    lineHeight: 1.1,
                }}>
                    BOTHER'S<br />
                    <span style={{
                        fontWeight: 400,
                        fontStyle: "italic",
                        color: "rgba(180,140,60,0.55)",
                        fontSize: "0.7em",
                        letterSpacing: "0.08em",
                    }}>
                        arcade
                    </span>
                </h1>

                {/* Divider */}
                <div style={{
                    width: "clamp(40px, 10vw, 80px)", height: "1px",
                    background: "linear-gradient(90deg, transparent, rgba(160,100,30,0.4), transparent)",
                }} />

                <div style={{
                    fontSize: "clamp(13px, 2vw, 16px)",
                    color: "rgba(190,160,90,0.7)",
                    letterSpacing: "0.06em",
                    minHeight: "1.5em",
                    lineHeight: 1.6,
                }}>
                    {text}
                    {!done && (
                        <span style={{
                            marginLeft: "2px",
                            color: "rgba(200,160,70,0.8)",
                            animation: "cursorBlink 0.9s step-end infinite",
                        }}>
                            █
                        </span>
                    )}
                </div>
                <div style={{
                    fontSize: "11px",
                    letterSpacing: "0.2em",
                    color: "rgba(140,110,50,0.4)",
                    marginTop: "1rem",
                    opacity: skipVisible ? 1 : 0,
                    transition: "opacity 1.2s ease",
                }}>
                    {done ? "— PRESS ANY KEY TO CONTINUE —" : " "}
                </div>
            </div>
            <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
        </div>
    );
}