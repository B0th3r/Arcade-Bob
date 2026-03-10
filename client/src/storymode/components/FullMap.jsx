import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const MAP_LABELS = {
    neighborhood: "Neighborhood",
    city: "City",
};

const EXIT_LABELS = {
    bar: "BAR",
    shop: "FLOWER SHOP",
    neighborhood: "NEIGHBORHOOD",
    city: "CITY",
    jimDonnasHouse: "JIM & DONNA'S",
    johnsHouse: "JOHN'S HOUSE",
};

const SHOW_EXIT_LABELS_ON = new Set(["city", "neighborhood"]);

function rectsOverlap(a, b) {
    return !(
        a.x + a.w < b.x ||
        b.x + b.w < a.x ||
        a.y + a.h < b.y ||
        b.y + b.h < a.y
    );
}
function roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
}

const isMobile = window.innerWidth < 640;

function drawLabelPill(ctx, text, x, y, opts = {}) {
    const fontSize = isMobile ? 12 : 10;
    const padX = isMobile ? 9 : 7;
    const h = isMobile ? 24 : 20;
    const radius = isMobile ? 8 : 7;
    const bg = opts.bg ?? "rgba(18,12,8,0.92)";
    const border = opts.border ?? "rgba(180,140,80,0.4)";
    const color = opts.color ?? "#d4b896";
    ctx.save();
    ctx.font = `${fontSize}px 'Courier New', monospace`;
    ctx.textBaseline = "middle";
    const textW = ctx.measureText(text).width;
    const w = Math.round(textW + padX * 2);
    roundRect(ctx, x, y, w, h, radius);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = border;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fillText(text, x + padX, y + h / 2 + 0.5);
    ctx.restore();
    return { w, h };
}

function drawExitMarker(ctx, x, y, elapsed, dpr = 1) {
    const pulse = (Math.sin(elapsed / 700) + 1) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, (3 + pulse * 0.4) * dpr, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(220,180,80,0.95)";
    ctx.fill();
    ctx.restore();
}
function useBlink(ms = 900) {
    const [on, setOn] = useState(true);
    useEffect(() => {
        const id = setInterval(() => setOn(v => !v), ms);
        return () => clearInterval(id);
    }, [ms]);
    return on;
}

function LegendItem({color, label}) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <circle cx="4" cy="4" r="3.5" fill={color} opacity="0.85" />
                </svg>
            <span style={{
                fontFamily: "'Courier Prime', 'Courier New', monospace",
                fontSize: 9, color: "rgba(160,130,90,0.65)", letterSpacing: "0.1em",
            }}>
                {label}
            </span>
        </div>
    );
}

function FullMap({
    worldBufferRef,
    playerRef,
    playerFacing = 0,
    npcs,
    activeObjectives = [],
    map,
    mapName,
    exits = [],
    onClose,
}) {
    const canvasRef = useRef(null);
    const pulseRef = useRef(0);
    const dotBlink = useBlink(900);
    const [closeHovered, setCloseHovered] = useState(false);

    const chromeH = 52 + 37;
    const maxModalH = window.innerHeight * 0.9;
    const usableMapH = maxModalH - chromeH;
    const idealMapW = map ? usableMapH * (map.width / map.height) : 0;
    const modalW = map
        ? Math.min(window.innerWidth * 0.92, idealMapW)
        : Math.min(window.innerWidth * 0.92, 820);
    const shouldDrawExitLabels = SHOW_EXIT_LABELS_ON.has(mapName);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !map) return;
        const dpr = window.devicePixelRatio || 1;
        const containerW = canvas.parentElement.offsetWidth;
        const containerH = canvas.parentElement.offsetHeight;
        const mapAspect = map.width / map.height;
        const containerAspect = containerW / containerH;
        let displayW, displayH;
        if (mapAspect > containerAspect) {
            displayW = containerW;
            displayH = containerW / mapAspect;
        } else {
            displayH = containerH;
            displayW = containerH * mapAspect;
        }
        canvas.style.width = `${displayW}px`;
        canvas.style.height = `${displayH}px`;
        canvas.width = Math.round(displayW * dpr);
        canvas.height = Math.round(displayH * dpr);
        const W = canvas.width;
        const H = canvas.height;
        const ctx = canvas.getContext("2d");
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        let rafId;
        let start = null;

        function draw(ts) {
            if (!start) start = ts;
            const elapsed = ts - start;
            pulseRef.current = elapsed;
            ctx.clearRect(0, 0, W, H);
            const src = worldBufferRef.current;
            if (src) {
                ctx.save();
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(src, 0, 0, W, H);
                ctx.restore();
            }
            ctx.fillStyle = "rgba(30,18,6,0.22)";
            ctx.fillRect(0, 0, W, H);
            const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.9);
            vignette.addColorStop(0, "rgba(0,0,0,0)");
            vignette.addColorStop(1, "rgba(0,0,0,0.72)");
            ctx.fillStyle = vignette;
            ctx.fillRect(0, 0, W, H);
            if (!map?.width || !map?.height) { rafId = requestAnimationFrame(draw); return; }
            const placedLabels = [];
            const sx = W / map.width;
            const sy = H / map.height;
            if (shouldDrawExitLabels) {
                for (const ex of exits) {
                    const exx = ex.x * sx;
                    const exy = ex.y * sy;
                    const label = EXIT_LABELS[ex.to];
                    drawExitMarker(ctx, exx, exy, elapsed, dpr);
                    let labelX = exx + 10 * dpr;
                    let labelY = exy - 11 * dpr;
                    const estimatedW = ctx.measureText(label).width + 16;
                    if (labelX + estimatedW > W - 8) labelX = exx - estimatedW - 10 * dpr;
                    labelY = Math.max(8, Math.min(H - 30, labelY));
                    const candidate = { x: labelX, y: labelY, w: estimatedW, h: 22 };
                    const collides = placedLabels.some(r => rectsOverlap(r, candidate));
                    if (!collides) {
                        drawLabelPill(ctx, label, labelX, labelY, { border: "rgba(180,140,60,0.4)", color: "#d4b870" });
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(exx + 5 * dpr, exy);
                        ctx.lineTo(labelX, labelY + 11);
                        ctx.strokeStyle = "rgba(180,140,60,0.22)";
                        ctx.lineWidth = 1;
                        ctx.setLineDash([3, 4]);
                        ctx.stroke();
                        ctx.restore();
                        placedLabels.push(candidate);
                    }
                }
            }
            for (const obj of activeObjectives) {
                const waypoints = [...(obj.waypoint ? [obj.waypoint] : []), ...(obj.waypoints ?? [])];
                for (const wp of waypoints) {
                    if (wp.hideWhenFlag) continue;
                    const isOptional = !!obj.optional;
                    const color = isOptional ? [220, 160, 40] : [200, 60, 60];
                    const [r, g, b] = color;
                    if (wp.type === "exit") {
                        const ex = exits.find((e) => e.to === wp.to);
                        if (!ex) continue;
                        const wx = ex.x * sx; const wy = ex.y * sy;
                        const pulse = (Math.sin(elapsed / 600) + 1) / 2;
                        ctx.beginPath();
                        ctx.arc(wx, wy, 12 + pulse * 6, 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(${r},${g},${b},${0.3 + pulse * 0.2})`;
                        ctx.lineWidth = 1.5 * dpr;
                        ctx.stroke();
                        continue;
                    }
                    const npc = npcs.find((n) => n.id === wp.id);
                    if (!npc) continue;
                    const wx = npc.x * sx; const wy = npc.y * sy;
                    const pulse = (Math.sin(elapsed / 600) + 1) / 2;
                    ctx.beginPath();
                    ctx.arc(wx, wy, 10 + pulse * 6, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(${r},${g},${b},${0.25 + pulse * 0.2})`;
                    ctx.lineWidth = 1.5 * dpr;
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(wx, wy, 5 * dpr, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${r},${g},${b},0.95)`;
                    ctx.shadowColor = `rgb(${r},${g},${b})`;
                    ctx.shadowBlur = 10 * dpr;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.arc(wx, wy, 5 * dpr, 0, Math.PI * 2);
                    ctx.strokeStyle = "rgba(255,255,255,0.35)";
                    ctx.lineWidth = 1 * dpr;
                    ctx.stroke();
                }
            }
            const baseScale = Math.min(displayW / 700, displayH / 450);
            const markerScale = isMobile ? Math.max(1.7, Math.min(1.6, baseScale)) : Math.max(0.9, Math.min(1.1, baseScale));
            const p = playerRef.current;
            const px = p.x * sx; const py = p.y * sy;
            const s = markerScale;
            const pulse = (Math.sin(elapsed / 1200) + 1) / 2;
            ctx.beginPath();
            ctx.arc(px, py, (10 + pulse * 5) * s, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(220,180,80,${0.15 + pulse * 0.18})`;
            ctx.lineWidth = 1.5 * s;
            ctx.stroke();
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(playerFacing);
            ctx.beginPath();
            ctx.moveTo(8 * s, 0);
            ctx.lineTo(-5 * s, -4 * s);
            ctx.lineTo(-5 * s, 4 * s);
            ctx.closePath();
            ctx.fillStyle = "#dbb84a";
            ctx.shadowColor = "rgba(220,180,80,0.8)";
            ctx.shadowBlur = 6 * s;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
            rafId = requestAnimationFrame(draw);
        }

        rafId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(rafId);
    }, [map, mapName, npcs, activeObjectives, exits]);

    const mapLabel = MAP_LABELS[mapName] ?? mapName ?? "Map";
    const hasObjectives = activeObjectives.length > 0;

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center"
            style={{ backgroundColor: "rgba(4,2,1,0.90)", backdropFilter: "blur(5px)" }}
        >
            <button type="button" className="absolute inset-0" aria-label="Close map" onClick={onClose} />
            <div
                style={{
                    width: `${modalW}px`, maxHeight: "90vh", zIndex: 1,
                    position: "relative"
                }}
            >
                <div style={{ position: "absolute", inset: -2, border: "1px solid rgba(140,110,60,0.18)", pointerEvents: "none" }} />

                <div
                    style={{
                        position: "relative",
                        display: "flex", flexDirection: "column", overflow: "hidden",
                        background: "linear-gradient(175deg, #141008 0%, #0e0b06 40%, #0a0806 100%)",
                        border: "1px solid rgba(120,95,50,0.3)",
                        boxShadow: "0 0 70px rgba(0,0,0,0.95), inset 0 1px 0 rgba(180,140,60,0.07)",
                    }}
                >

                    {/*Header */}
                    <div style={{
                        position: "relative", flexShrink: 0,
                        borderBottom: "1px solid rgba(120,95,50,0.22)",
                        background: "linear-gradient(180deg, rgba(30,22,8,0.55) 0%, transparent 100%)",
                        padding: "10px 16px",
                    }}>
                        <div style={{
                            position: "absolute", top: 0, left: 0, right: 0, height: 2,
                            background: "linear-gradient(90deg, transparent 0%, rgba(170,35,35,0.65) 20%, rgba(170,35,35,0.65) 80%, transparent 100%)",
                        }} />

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <svg width="32" height="36" viewBox="0 0 32 36" fill="none" style={{ flexShrink: 0 }}>
                                    <path d="M16 2 L30 7 L30 20 C30 28 16 34 16 34 C16 34 2 28 2 20 L2 7 Z" fill="rgba(30,22,8,0.9)" stroke="rgba(180,140,60,0.5)" strokeWidth="1.2" />
                                    <path d="M16 5 L27 9 L27 20 C27 26.5 16 31.5 16 31.5 C16 31.5 5 26.5 5 20 L5 9 Z" fill="none" stroke="rgba(180,140,60,0.18)" strokeWidth="0.75" />
                                    {[0,1,2,3,4].map(i => {
                                        const a = (i * 72 - 90) * Math.PI / 180;
                                        const b = (i * 72 - 54) * Math.PI / 180;
                                        return <line key={i} x1={16 + 7 * Math.cos(a)} y1={18 + 7 * Math.sin(a)} x2={16 + 3.2 * Math.cos(b)} y2={18 + 3.2 * Math.sin(b)} stroke="rgba(200,160,60,0.65)" strokeWidth="1" />;
                                    })}
                                    <circle cx="16" cy="18" r="2.5" fill="rgba(8,6,3,1)" stroke="rgba(180,140,60,0.45)" strokeWidth="0.75" />
                                </svg>
                                <div style={{ width: 1, height: 28, background: "rgba(120,95,50,0.28)" }} />
                                <div>
                                    <div style={{ fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 17, color: "#c8a84a", letterSpacing: "0.07em", textTransform: "uppercase", textShadow: "0 0 20px rgba(200,168,74,0.28)", lineHeight: 1 }}>
                                        {mapLabel}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                {hasObjectives && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(150,25,25,0.1)", border: "1px solid rgba(155,35,35,0.32)", padding: "3px 8px" }}>
                                        <div style={{
                                            width: 5, height: 5, borderRadius: "50%",
                                            background: "#c43030",
                                            boxShadow: "0 0 5px rgba(196,48,48,0.7)",
                                            opacity: dotBlink ? 1 : 0.35,
                                            transition: "opacity 0.3s ease",
                                        }} />
                                        <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: "rgba(195,75,75,0.85)", letterSpacing: "0.12em" }}>
                                            {activeObjectives.length} OPEN {activeObjectives.length === 1 ? "LEAD" : "LEADS"}
                                        </span>
                                    </div>
                                )}

                                <div style={{ width: 1, height: 20, background: "rgba(120,95,50,0.22)" }} />

                                <button
                                    onClick={onClose}
                                    onMouseEnter={() => setCloseHovered(true)}
                                    onMouseLeave={() => setCloseHovered(false)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 5,
                                        padding: "5px 10px",
                                        background: closeHovered ? "rgba(180,140,60,0.06)" : "transparent",
                                        border: `1px solid ${closeHovered ? "rgba(180,140,60,0.45)" : "rgba(120,95,50,0.22)"}`,
                                        cursor: "pointer",
                                        color: closeHovered ? "#c8a84a" : "rgba(115,90,48,0.6)",
                                        fontFamily: "'Courier Prime', monospace",
                                        fontSize: 10, letterSpacing: "0.12em",
                                        transition: "all 0.15s ease",
                                    }}
                                >
                                    <X style={{ width: 11, height: 11 }} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Canvas */}
                    <div
                        className="relative w-full shrink-0"
                        style={{ aspectRatio: map ? `${map.width} / ${map.height}` : "16 / 9", maxHeight: "calc(90vh - 92px)" }}>
                        <canvas ref={canvasRef} className="block w-full h-full" style={{ imageRendering: "pixelated" }} />
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 24, background: "linear-gradient(to bottom, rgba(10,8,5,0.5), transparent)", pointerEvents: "none" }} />
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 24, background: "linear-gradient(to top, rgba(10,8,5,0.5), transparent)", pointerEvents: "none" }} />

                        {!map && (
                            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: "'Courier Prime', monospace", fontSize: 11, color: "rgba(160,125,60,0.4)", letterSpacing: "0.25em" }}>
                                Loading Map…
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 37, padding: "0 16px", borderTop: "1px solid rgba(120,95,50,0.18)", background: "linear-gradient(180deg, transparent, rgba(18,12,5,0.4))", flexShrink: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <LegendItem color="#c43030" label="MAIN CASE"/>
                            <LegendItem color="#dca028" label="SIDE CASE" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FullMap;