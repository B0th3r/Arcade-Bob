import { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';

const OBJECTIVES_CONFIG = {
  talk_to_ace: {
    id: 'talk_to_ace',
    title: 'Talk to Ace to begin your investigation',
    startsActive: true,
    completesWhen: { flagsAny: ['started_investigation'] },
    waypoint: { type: "npc", id: "ace" }
  },
  talk_to_officers: {
    id: "talk_to_officers",
    title: 'Talk to your fellow officers',
    description: "Chat with Lucas, Bobby, and Jack & Alex",
    optional: true,
    startsActive: true,
    completesWhen: { flagsAny: ['started_investigation'] },
    waypoints: [
      { type: "npc", id: "lucas", hideWhenFlag: "talkedToLucas" },
      { type: "npc", id: "bobby", hideWhenFlag: "talkedToBobby" },
      { type: "npc", id: "jack", hideWhenFlag: "talkedToJackAlex" },
      { type: "npc", id: "alex", hideWhenFlag: "talkedToJackAlex" },
    ],
  },
  talk_to_jim: {
    id: 'talk_to_jim',
    title: 'Talk to Jim and Donna',
    description: 'Interview the couple about the missing twenty dollars',
    appearsWhen: { flagsAll: ["debriefed"], },
    completesWhen: { flagsAny: ['talkedToJim', 'talkedToDonna'] },
    waypoints: [
      { type: "npc", id: "jim" },
      { type: "npc", id: "donna" }
    ],
  },
  talk_to_john: {
    id: 'talk_to_john',
    title: 'Talk to John',
    appearsWhen: { flagsAll: ["debriefed"], },
    description: 'Interview the other neighbor about his missing money',
    completesWhen: { flagsAny: ['talkedToJohn'] },
    waypoint: { type: "npc", id: "john" }
  },
  talk_to_sam: {
    id: 'talk_to_sam',
    title: 'Interview Sam',
    appearsWhen: { flagsAll: ["debriefed"], },
    description: 'Talk to the neighbor who found the wallet',
    completesWhen: { flagsAny: ['talkedToSam'] },
    waypoint: { type: "npc", id: "sam" }
  },
  check_on_lucas: {
    id: "check_on_lucas",
    title: "Check in on Lucas",
    description: "Looks like Lucas's poem worked! I'll check in on him later if I feel like it.",
    optional: true,
    appearsWhen: { flagsAll: ["poem_grade_good", "debriefed"], },
    completesWhen: { flagsAny: ['lucas_needs_flowers'] },
    waypoint: { type: "npc", id: "lucasCity" }
  },
  travel_to_city: {
    id: 'travel_to_city',
    title: 'Travel to the City',
    description: 'Travel to the city to find Jane',
    optional: true,
    appearsWhen: { flagsAll: ["janes_location_city"], },
    completesWhen: { flagsAny: ['arrivedInCity'] }
  },
  find_jane: {
    id: 'find_jane',
    title: 'Find Jane',
    description: "Find out where Jane ran off to",
    optional: true,
    waypoint: { type: "npc", id: "jane" },
    appearsWhen: { flagsAny: ['john_argument', 'arrivedInCity'] },
    completesWhen: { flagsAny: ['foundJane'] }
  },
  buy_flowers: {
    id: 'buy_flowers',
    title: 'Buy some flowers.',
    description: "Buy flowers for Lucas.",
    optional: true,
    appearsWhen: { flagsAny: ['lucas_needs_flowers'] },
    completesWhen: { flagsAny: ['flower_purchased'] }
  },
  give_flowers_lucas: {
    id: 'give_flowers_lucas',
    title: 'Give the flowers to Lucas.',
    optional: true,
    waypoint: { type: "npc", id: "lucas" },
    appearsWhen: { flagsAll: ['lucas_needs_flowers', 'flower_purchased'] },
    completesWhen: { flagsAll: ['flower_delivered_lucas'] }
  },
  give_flowers_maya: {
    id: 'give_flowers_maya',
    title: 'Give the flowers to Maya.',
    optional: true,
    waypoint: { type: "npc", id: "maya" },
    appearsWhen: { flagsAll: ['flower_purchased'] },
    completesWhen: { flagsAny: ['hayes_screwed_lucas', 'you_screwed_lucas'] }
  },
  talk_to_gambler: {
    id: 'talk_to_gambler',
    title: 'Talk to the person who gambled with John.',
    optional: true,
    waypoint: { type: "npc", id: "gambler" },
    appearsWhen: { flagsAll: ['gambler_location_known'] },
    completesWhen: { flagsAny: ['talkedToGambler'] }
  },
  help_bobby: {
    id: 'talk_to_bobby_bar',
    title: 'Help Bobby with his investigation in the bar.',
    optional: true,
    appearsWhen: { flagsAll: ['bobby_investigation_bar'] },
    completesWhen: { flagsAny: ['met_bobby_in_bar'] },
    waypoint: { type: "npc", id: "bobby" }
  },
  big_sneak: {
    id: 'big_sneak',
    title: 'Find the big sneak.',
    description: "Apparently, there's an item called “The Big Sneak” that everyone is looking for. The problem is I have no clue where to start looking.",
    optional: true,
    appearsWhen: { flagsAll: ['big_sneak_active'] },
    completesWhen: { flagsAny: ['secret_sneak_end', 'sneak_end'] },
    waypoint: { type: "npc", id: "sneak" }
  },
  end_investigation: {
    id: 'end_investigation',
    title: 'End Investigation',
    description: 'Talk to Detective Hayes to conclude the investigation',
    appearsWhen: { flagsAll: ['talkedToJim', 'talkedToDonna', 'talkedToJohn', 'talkedToSam'] },
    completesWhen: { flagsAny: ['investigationConcluded'] }
  }
};

function useMounted() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  return visible;
}

function useBlink(ms = 900) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setOn(v => !v), ms);
    return () => clearInterval(id);
  }, [ms]);
  return on;
}

function NotebookIcon({ size = 18, color = "#c8a84a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="4" y="2" width="12" height="16" rx="1" stroke={color} strokeWidth="1.2" fill="none" opacity="0.9" />
      <line x1="4" y1="6" x2="16" y2="6" stroke={color} strokeWidth="0.75" opacity="0.5" />
      <line x1="4" y1="9" x2="16" y2="9" stroke={color} strokeWidth="0.75" opacity="0.5" />
      <line x1="4" y1="12" x2="16" y2="12" stroke={color} strokeWidth="0.75" opacity="0.5" />
      <line x1="4" y1="15" x2="12" y2="15" stroke={color} strokeWidth="0.75" opacity="0.5" />
      <circle cx="4" cy="6" r="1" fill={color} opacity="0.6" />
      <circle cx="4" cy="10" r="1" fill={color} opacity="0.6" />
      <circle cx="4" cy="14" r="1" fill={color} opacity="0.6" />
    </svg>
  );
}

function ObjectiveCard({ obj, completed = false, dotBlink }) {
  const isOptional = !!obj.optional;
  const dotColor = completed ? "rgba(100,80,40,0.5)" : isOptional ? "#c8980a" : "#c43030";
  const titleColor = completed ? "rgba(110,90,55,0.7)" : isOptional ? "rgba(210,180,100,0.9)" : "rgba(225,200,155,0.95)";
  const borderColor = completed ? "rgba(80,65,35,0.2)" : isOptional ? "rgba(180,140,50,0.25)" : "rgba(160,40,40,0.3)";
  const bgColor = completed ? "rgba(12,9,5,0.3)" : isOptional ? "rgba(30,22,5,0.45)" : "rgba(28,8,8,0.45)";

  return (
    <div style={{ display: "flex", gap: 10, padding: "9px 11px", background: bgColor, border: `1px solid ${borderColor}`, position: "relative", opacity: completed ? 0.65 : 1 }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: completed ? "rgba(80,65,35,0.3)" : isOptional ? "rgba(180,140,50,0.5)" : "rgba(180,40,40,0.6)" }} />
      <div style={{ flexShrink: 0, paddingTop: 2 }}>
        {completed ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="12" height="12" stroke="rgba(100,80,40,0.4)" strokeWidth="1" fill="none" />
            <line x1="3" y1="7" x2="6" y2="10" stroke="rgba(100,80,40,0.55)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="6" y1="10" x2="11" y2="4" stroke="rgba(100,80,40,0.55)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        ) : (
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: dotColor,
            boxShadow: `0 0 5px ${dotColor}`,
            marginTop: 3,
            opacity: (!isOptional && !completed) ? (dotBlink ? 1 : 0.25) : 1,
            transition: "opacity 0.3s ease",
          }} />
        )}
      </div>

      {/* Content */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 7, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Courier Prime', 'Courier New', monospace", fontSize: 12, fontWeight: 700, color: titleColor, letterSpacing: "0.02em", lineHeight: 1.4, textDecoration: completed ? "line-through" : "none", textDecorationColor: "rgba(100,80,40,0.4)" }}>
            {obj.title}
          </span>
          {isOptional && !completed && (
            <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, letterSpacing: "0.18em", color: "rgba(170,130,40,0.6)", textTransform: "uppercase", border: "1px solid rgba(160,120,40,0.25)", padding: "0 4px", lineHeight: "16px", flexShrink: 0 }}>
              OPTIONAL
            </span>
          )}
        </div>
        {obj.description && (
          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, color: completed ? "rgba(90,72,42,0.55)" : "rgba(150,120,70,0.75)", marginTop: 3, lineHeight: 1.5, fontStyle: "italic" }}>
            {obj.description}
          </div>
        )}
      </div>
    </div>
  );
}

function ObjectivesPanel({
  gameState,
  refreshToken = 0,
  onActiveObjectives,
  isMinimized,
  onToggle,
  defaultOpen = false,
  btnRef,
  mobileBtnRef,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeObjectives, setActiveObjectives] = useState([]);
  const [completedObjectives, setCompletedObjectives] = useState([]);
  const [closeHovered, setCloseHovered] = useState(false);

  const closeBtnRef = useRef(null);
  const panelVisible = useMounted();
  const dotBlink = useBlink(900);

  useEffect(() => {
    if (typeof isMinimized === "boolean") setOpen(!isMinimized);
  }, [isMinimized]);

  useEffect(() => {
    const active = [], completed = [];
    Object.values(OBJECTIVES_CONFIG).forEach((objective) => {
      if (!checkObjectiveAppears(objective, gameState)) return;
      (checkObjectiveComplete(objective, gameState) ? completed : active).push(objective);
    });
    active.sort((a, b) => {
      const ao = a.optional ? 1 : 0, bo = b.optional ? 1 : 0;
      if (ao !== bo) return ao - bo;
      return a.id.localeCompare(b.id);
    });
    setActiveObjectives(active);
    setCompletedObjectives(completed);
    onActiveObjectives?.(active);
  }, [gameState, refreshToken]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    queueMicrotask(() => closeBtnRef.current?.focus());
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function checkObjectiveAppears(objective, state) {
    if (objective.startsActive) return true;
    const cond = objective.appearsWhen;
    if (!cond) return false;
    if (cond.flagsAll && !cond.flagsAll.every((f) => state.flags.has(f))) return false;
    if (cond.flagsAny && !cond.flagsAny.some((f) => state.flags.has(f))) return false;
    if (cond.cluesAll && !cond.cluesAll.every((c) => state.clues.has(c))) return false;
    if (cond.cluesAny && !cond.cluesAny.some((c) => state.clues.has(c))) return false;
    if (cond.metadataAll) { for (const [k, v] of Object.entries(cond.metadataAll)) { if (state.metadata.get(k) !== v) return false; } }
    return true;
  }

  function checkObjectiveComplete(objective, state) {
    const cond = objective.completesWhen;
    if (!cond) return false;
    if (cond.flagsAll && !cond.flagsAll.every((f) => state.flags.has(f))) return false;
    if (cond.flagsAny && !cond.flagsAny.some((f) => state.flags.has(f))) return false;
    if (cond.cluesAll && !cond.cluesAll.every((c) => state.clues.has(c))) return false;
    if (cond.cluesAny && !cond.cluesAny.some((c) => state.clues.has(c))) return false;
    if (cond.metadataAll) { for (const [k, v] of Object.entries(cond.metadataAll)) { if (state.metadata.get(k) !== v) return false; } }
    return true;
  }

  const requiredCount = activeObjectives.filter(o => !o.optional).length;
  const optionalCount = activeObjectives.filter(o => o.optional).length;

  const triggerStyle = {
    background: "linear-gradient(135deg, #141008 0%, #0e0b06 100%)",
    border: "1px solid rgba(120,95,50,0.4)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(180,140,60,0.07)",
    cursor: "pointer",
  };

  return (
    <>
      {/* Objectives button */}
      <div className="absolute pointer-events-none inset-0 z-50">
        {/* Desktop */}
        <button
          ref={btnRef}
          onClick={() => { onToggle?.(); setOpen(true); }}
          className="pointer-events-auto absolute hidden lg:flex items-center gap-2.5 bottom-4 right-4"
          aria-label="Open case notes"
          style={{ ...triggerStyle, padding: "8px 14px 8px 11px", opacity: 0.95 }}
        >
          <NotebookIcon size={17} />
          <span style={{ fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 13, color: "rgba(200,168,74,0.9)", letterSpacing: "0.07em" }}>
            Case Notes
          </span>
          {activeObjectives.length > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "1.3rem", height: "1.3rem", padding: "0 4px", background: requiredCount > 0 ? "rgba(160,40,40,0.18)" : "rgba(160,120,40,0.15)", border: `1px solid ${requiredCount > 0 ? "rgba(160,40,40,0.35)" : "rgba(160,120,40,0.3)"}`, fontFamily: "'Courier Prime', monospace", fontSize: 10, fontWeight: 700, color: requiredCount > 0 ? "rgba(200,80,80,0.9)" : "rgba(200,160,60,0.85)", letterSpacing: "0.04em" }}>
              {activeObjectives.length}
            </span>
          )}
        </button>

        {/* Mobile */}
        <button
          ref={mobileBtnRef}
          onClick={() => { onToggle?.(); setOpen(true); }}
          className="pointer-events-auto absolute lg:hidden flex items-center gap-2 right-4 bottom-[calc(env(safe-area-inset-bottom)+5.25rem)]"
          aria-label="Open case notes"
          style={{ ...triggerStyle, padding: "8px 12px 8px 10px", opacity: 0.95 }}
        >
          <NotebookIcon size={16} />
          <span style={{ fontFamily: "'Special Elite', monospace", fontSize: 13, color: "rgba(200,168,74,0.9)", letterSpacing: "0.06em" }}>Notes</span>
          {activeObjectives.length > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "1.2rem", height: "1.2rem", padding: "0 3px", background: "rgba(160,40,40,0.18)", border: "1px solid rgba(160,40,40,0.35)", fontFamily: "'Courier Prime', monospace", fontSize: 9, fontWeight: 700, color: "rgba(200,80,80,0.9)" }}>
              {activeObjectives.length}
            </span>
          )}
        </button>
      </div>

      {/* Panel overlay */}
      {open && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(2,1,0,0.65)", backdropFilter: "blur(3px)", border: "none", cursor: "pointer" }}
            aria-label="Close case notes"
          />

          <div className="absolute inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto md:w-[400px]" style={{ padding: 12 }}>

            <div
              ref={closeBtnRef}
              style={{
                position: "relative", display: "flex", flexDirection: "column", overflow: "hidden",
                background: "linear-gradient(175deg, #141008 0%, #0e0b06 50%, #0a0806 100%)",
                border: "1px solid rgba(120,95,50,0.32)",
                boxShadow: "0 0 60px rgba(0,0,0,0.9), -4px 0 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(180,140,60,0.06)",
                maxHeight: "75vh",
                opacity: panelVisible ? 1 : 0,
                transform: panelVisible ? "translateX(0)" : "translateX(18px)",
                transition: "opacity 0.22s cubic-bezier(0.16,1,0.3,1), transform 0.22s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <div style={{ position: "absolute", inset: -2, border: "1px solid rgba(100,78,38,0.12)", pointerEvents: "none", zIndex: 3 }} />

              {/* Header */}
              <div style={{ position: "relative", flexShrink: 0, padding: "10px 14px", borderBottom: "1px solid rgba(120,95,50,0.22)", background: "linear-gradient(180deg, rgba(30,22,8,0.5) 0%, transparent 100%)" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent 0%, rgba(160,35,35,0.65) 25%, rgba(160,35,35,0.65) 75%, transparent 100%)" }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <NotebookIcon size={22} />
                    <div>
                      <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 8, color: "rgba(140,108,48,0.55)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 2 }}>
                        DETECTIVE'S FIELD NOTES
                      </div>
                      <div style={{ fontFamily: "'Special Elite', 'Courier New', monospace", fontSize: 16, color: "#c8a84a", letterSpacing: "0.06em", textShadow: "0 0 16px rgba(200,168,74,0.25)", lineHeight: 1 }}>
                        Active Leads
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                      {requiredCount > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#c43030", boxShadow: "0 0 4px rgba(196,48,48,0.7)", opacity: dotBlink ? 1 : 0.25, transition: "opacity 0.3s ease" }} />
                          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: "rgba(180,70,70,0.7)", letterSpacing: "0.12em" }}>{requiredCount} MAIN</span>
                        </div>
                      )}
                      {optionalCount > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#b8860b", opacity: 0.7 }} />
                          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: "rgba(170,130,40,0.6)", letterSpacing: "0.12em" }}>{optionalCount} SIDE{optionalCount !== 1 ? "S" : ""}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ width: 1, height: 20, background: "rgba(120,95,50,0.22)" }} />

                    <button
                      ref={closeBtnRef}
                      type="button"
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setCloseHovered(true)}
                      onMouseLeave={() => setCloseHovered(false)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 30, height: 30,
                        background: closeHovered ? "rgba(180,140,60,0.06)" : "transparent",
                        border: `1px solid ${closeHovered ? "rgba(180,140,60,0.45)" : "rgba(120,95,50,0.22)"}`,
                        cursor: "pointer",
                        color: closeHovered ? "#c8a84a" : "rgba(115,90,48,0.6)",
                        transition: "all 0.15s ease",
                      }}
                      aria-label="Close"
                    >
                      <X style={{ width: 13, height: 13 }} />
                    </button>
                  </div>
                </div>
              </div>

              <div
                style={{
                  flex: 1, overflowY: "auto",
                  padding: "12px 14px",
                  display: "flex", flexDirection: "column", gap: 0,
                  position: "relative",
                  backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, rgba(120,95,50,0.07) 31px, rgba(120,95,50,0.07) 32px)",
                  backgroundAttachment: "local",
                }}
              >
                <div style={{ position: "absolute", top: 0, bottom: 0, left: 28, width: 1, background: "rgba(160,40,40,0.12)", pointerEvents: "none" }} />
                {/* Active objectives */}
                {activeObjectives.length === 0 ? (
                  <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, color: "rgba(120,95,50,0.5)", fontStyle: "italic", letterSpacing: "0.05em", padding: "8px 0" }}>
                    No active leads at this time.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {activeObjectives.map((obj) => (
                      <ObjectiveCard key={obj.id} obj={obj} dotBlink={dotBlink} />
                    ))}
                  </div>
                )}

                {/* Completed Objectives */}
                {completedObjectives.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      onClick={() => setShowCompleted(v => !v)}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", borderTop: "1px solid rgba(100,78,38,0.2)", padding: "10px 0 8px", cursor: "pointer" }}
                      aria-expanded={showCompleted}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                          <rect x="1" y="1" width="9" height="9" stroke="rgba(100,80,40,0.45)" strokeWidth="1" fill="none" />
                          <line x1="2.5" y1="5.5" x2="4.5" y2="8" stroke="rgba(100,80,40,0.5)" strokeWidth="1.2" strokeLinecap="round" />
                          <line x1="4.5" y1="8" x2="8.5" y2="3" stroke="rgba(100,80,40,0.5)" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 9, color: "rgba(110,88,45,0.6)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                          Closed Leads ({completedObjectives.length})
                        </span>
                      </div>
                      <ChevronDown style={{ width: 13, height: 13, color: "rgba(110,88,45,0.5)", transform: showCompleted ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.18s ease" }} />
                    </button>

                    {showCompleted && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 5, paddingTop: 4 }}>
                        {completedObjectives.map((obj) => (
                          <ObjectiveCard key={obj.id} obj={obj} completed dotBlink={dotBlink} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer note */}
                <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid rgba(100,78,38,0.15)", fontFamily: "'Courier Prime', monospace", fontSize: 9, color: "rgba(90,70,38,0.5)", letterSpacing: "0.12em", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontStyle: "italic" }}>Press <span style={{ color: "rgba(150,118,55,0.65)", fontStyle: "normal" }}>ESC</span> to close</span>
                  <span style={{ opacity: 0.6 }}>— CONFIDENTIAL —</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ObjectivesPanel;