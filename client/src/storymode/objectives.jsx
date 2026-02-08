import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Circle, ClipboardList, NotebookText, X, ChevronDown } from 'lucide-react';

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
    title: "Talk to your fellow officers",
    description: "Chat with Lucas, Bobby, and Jack & Alex",
    optional: true,
    startsActive: true,
    completesWhen: { flagsAny: ['started_investigation'] },
    waypoints: [
      { type: "npc", id: "lucas", hideWhenFlag: "talkedToLucas" },
      { type: "npc", id: "bobby", hideWhenFlag: "talkedToBobby" },
      { type: "npc", id: "jackAlex", hideWhenFlag: "talkedToJackAlex" },
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
      { type: "npc", id: "doona" }
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
  travel_to_city: {
    id: 'travel_to_city',
    title: '(OPTIONAL) Travel to the City',
    description: 'Travel to the city to find Jane',
    optional: true,
    appearsWhen: { flagsAll: ["janes_location_city"], },
    completesWhen: { flagsAny: ['arrivedInCity'] }
  },
  find_jane: {
    id: 'find_jane',
    title: '(OPTIONAL) Find Jane',
    description: "Find out where Jane ran off to",
    optional: true,
    waypoint: { type: "npc", id: "jane" },
    appearsWhen: { flagsAny: ['john_argument', 'arrivedIniCty'] },
    completesWhen: { flagsAny: ['foundJane'] }
  },
  buy_flowers: {
    id: 'buy_flowers',
    title: '(OPTIONAL) Buy some flowers.',
    description: "Buy flowers for Lucas.",
    optional: true,
    appearsWhen: { flagsAny: ['lucas_needs_flowers'] },
    completesWhen: { flagsAny: ['flower_purchased'] }
  },
  give_flowers_lucas: {
    id: 'give_flowers_lucas',
    title: '(OPTIONAL) Give the flowers to Lucas.',
    optional: true,
    waypoint: { type: "npc", id: "lucas" },
    appearsWhen: { flagsAll: ['lucas_needs_flowers', 'flower_purchased'] },
    completesWhen: { flagsAll: ['flower_delivered_lucas'] }
  },
  give_flowers_maya: {
    id: 'give_flowers_maya',
    title: '(OPTIONAL) Give the flowers to Maya.',
    optional: true,
    waypoint: { type: "npc", id: "maya" },
    appearsWhen: { flagsAll: ['flower_purchased'] },
    completesWhen: { flagsAny: ['hayes_screwed_lucas', 'you_screwed_lucas'] }
  },
  talk_to_gambler: {
    id: 'talk_to_gambler',
    title: '(OPTIONAL) Talk to person who gambled with John.',
    optional: true,
    waypoint: { type: "npc", id: "gambler" },
    appearsWhen: { flagsAll: ['gambler_location_known'] },
    completesWhen: { flagsAny: ['talkedToGambler', 'talkedToGambler'] }
  },
  help_bobby: {
    id: 'talk_to_bobby_bar',
    title: '(OPTIONAL) Help Bobby with his investigation in the bar.',
    optional: true,
    appearsWhen: { flagsAll: ['bobby_investigation_bar'] },
    completesWhen: { flagsAny: ['met_bobby_in_bar'] },
    waypoint: { type: "npc", id: "bobby" }
  },
  end_investigation: {
    id: 'end_investigation',
    title: 'End Investigation',
    description: 'Talk to Detective Hayes to conclude the investigation',
    appearsWhen: { flagsAll: ['talkedToJim', 'talkedToDonna', 'talkedToJohn', 'talkedToSam'] },
    completesWhen: { flagsAny: ['investigationConcluded'] }
  }
};

function ObjectivesPanel({
  gameState,
  refreshToken = 0,
  onActiveObjectives,
  isMinimized,
  onToggle,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeObjectives, setActiveObjectives] = useState([]);
  const [completedObjectives, setCompletedObjectives] = useState([]);

  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (typeof isMinimized === "boolean") setOpen(!isMinimized);
  }, [isMinimized]);

  useEffect(() => {
    const active = [];
    const completed = [];

    Object.values(OBJECTIVES_CONFIG).forEach((objective) => {
      const shouldAppear = checkObjectiveAppears(objective, gameState);
      if (!shouldAppear) return;

      const isComplete = checkObjectiveComplete(objective, gameState);

      if (isComplete) completed.push(objective);
      else active.push(objective);
    });

    // Sort: required first, then optional; keep stable by id
    active.sort((a, b) => {
      const ao = a.optional ? 1 : 0;
      const bo = b.optional ? 1 : 0;
      if (ao !== bo) return ao - bo;
      return a.id.localeCompare(b.id);
    });

    setActiveObjectives(active);
    setCompletedObjectives(completed);
    onActiveObjectives?.(active);
  }, [gameState, refreshToken]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    // Focus close button for keyboard users
    queueMicrotask(() => closeBtnRef.current?.focus());

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function checkObjectiveAppears(objective, state) {
    // Always appear if startsActive is true
    if (objective.startsActive) return true;

    const cond = objective.appearsWhen;
    if (!cond) return true;

    if (cond.flagsAll && !cond.flagsAll.every((f) => state.flags.has(f))) return false;
    if (cond.flagsAny && !cond.flagsAny.some((f) => state.flags.has(f))) return false;

    if (cond.cluesAll && !cond.cluesAll.every((c) => state.clues.has(c))) return false;
    if (cond.cluesAny && !cond.cluesAny.some((c) => state.clues.has(c))) return false;

    if (cond.metadataAll) {
      for (const [k, v] of Object.entries(cond.metadataAll)) {
        if (state.metadata.get(k) !== v) return false;
      }
    }

    return true;
  }

  function checkObjectiveComplete(objective, state) {
    const cond = objective.completesWhen;
    if (!cond) return false;

    if (cond.flagsAll && !cond.flagsAll.every((f) => state.flags.has(f))) return false;
    if (cond.flagsAny && !cond.flagsAny.some((f) => state.flags.has(f))) return false;

    if (cond.cluesAll && !cond.cluesAll.every((c) => state.clues.has(c))) return false;
    if (cond.cluesAny && !cond.cluesAny.some((c) => state.clues.has(c))) return false;

    if (cond.metadataAll) {
      for (const [k, v] of Object.entries(cond.metadataAll)) {
        if (state.metadata.get(k) !== v) return false;
      }
    }

    return true;
  }

  const activeCount = activeObjectives.length;

  return (
    <>
      {/* Objectives button */}
      <div className="absolute pointer-events-none inset-0 z-50">
        <button
          onClick={() => {
            if (typeof onToggle === "function") onToggle();
            setOpen(true);
          }}
          className="pointer-events-auto absolute hidden lg:flex items-center gap-2 rounded-full bg-slate-900/90 backdrop-blur px-3 py-2 ring-1 ring-white/10 shadow-lg hover:bg-slate-800/90 active:scale-[0.99] bottom-4 right-4"
          aria-label="Open objectives"
        >
          <NotebookText className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium text-slate-100"> Open Notebook</span>
          <span className="ml-0.5 inline-flex items-center justify-center min-w-[1.4rem] h-5 px-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-500/30">
            {activeObjectives.length}
          </span>
        </button>

        {/* Mobile: middle-right */}
        <button
          onClick={() => {
            if (typeof onToggle === "function") onToggle();
            setOpen(true);
          }}
          className=" pointer-events-auto absolute lg:hidden flex items-center gap-2 rounded-full bg-slate-900/90 backdrop-blur
                    px-3 py-2 ring-1 ring-white/10 shadow-lg active:scale-[0.99] right-4 bottom-[calc(env(safe-area-inset-bottom)+5.25rem)]"
          aria-label="Open objectives"
        >
          <NotebookText className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium text-slate-100">Notebook</span>
          <span className="ml-0.5 inline-flex items-center justify-center min-w-[1.4rem] h-5 px-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-500/30">
            {activeObjectives.length}
          </span>
        </button>
      </div>
      {/* Overlay (mobile bottom-sheet / desktop side-panel) */}
      {open && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close objectives"
            onClick={() => setOpen(false)}
          />

          <div className="absolute inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto md:w-[420px] p-3 md:p-4">
            <div className="bg-slate-800/95 backdrop-blur rounded-2xl ring-1 ring-white/10 shadow-2xl overflow-hidden max-h-[75vh] md:max-h-[calc(100vh-2rem)] flex flex-col">
              <div className="flex items-center justify-between p-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold">Objectives</h3>
                  <span className="text-xs text-slate-400">({activeCount} active)</span>
                </div>

                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg text-slate-300 hover:bg-white/5"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 overflow-y-auto space-y-3">
                {/* Active Objectives */}
                {activeObjectives.length === 0 ? (
                  <div className="text-sm text-slate-300">
                    No active objectives right now.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeObjectives.map((obj) => {
                      const isOptional = !!obj.optional;
                      return (
                        <div
                          key={obj.id}
                          className={[
                            "flex gap-2 p-2 rounded-xl bg-slate-900/50 ring-1 transition-colors",
                            isOptional ? "ring-amber-400/30" : "ring-emerald-500/20",
                          ].join(" ")}
                        >
                          <Circle
                            className={[
                              "w-5 h-5 mt-0.5 flex-shrink-0",
                              isOptional ? "text-amber-300" : "text-emerald-400",
                            ].join(" ")}
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-sm text-slate-100">
                              {obj.title}
                              {isOptional ? (
                                <span className="ml-2 text-[10px] uppercase tracking-wide text-amber-300/90">
                                  Optional
                                </span>
                              ) : null}
                            </div>
                            {obj.description ? (
                              <div className="text-xs text-slate-400 mt-0.5">
                                {obj.description}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Completed Objectives */}
                {completedObjectives.length > 0 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCompleted((v) => !v)}
                      className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wide"
                      aria-expanded={showCompleted}
                    >
                      <span>Completed ({completedObjectives.length})</span>
                      <ChevronDown
                        className={[
                          "w-4 h-4 transition-transform",
                          showCompleted ? "rotate-180" : "",
                        ].join(" ")}
                      />
                    </button>

                    {showCompleted && (
                      <div className="space-y-2 mt-2">
                        {completedObjectives.map((obj) => (
                          <div
                            key={obj.id}
                            className="flex gap-2 p-2 rounded-xl bg-slate-900/30 ring-1 ring-white/5 opacity-70"
                          >
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium text-sm text-slate-300 line-through">
                                {obj.title}
                              </div>
                              {obj.description ? (
                                <div className="text-xs text-slate-500 mt-0.5">
                                  {obj.description}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-[11px] text-slate-500 pt-2">
                  Tip: Hit <span className="text-slate-300">Esc</span> to close.
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
