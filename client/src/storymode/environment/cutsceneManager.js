import { resolveEnding } from "./endingResolver";

function buildNarrationLines(ending) {
  const lines = [];

  lines.push("CASE SUMMARY");

  lines.push(
    ending.accused && ending.accused !== "unknown"
      ? `Suspect accused: ${ending.accused}.`
      : "No suspect was accused."
  );

  // Main ending result
  switch (ending.endingId) {
    case "ending_failed":
      lines.push("The investigation failed.");
      break;

    case "ending_arrested":
      lines.push("Internal Affairs arrested you and Bobby.");
      break;

    case "ending_good":
      lines.push("The gambling den was shut down.");
      break;

    case "ending_evil_clean":
      lines.push("Bobby took the blame. You avoided consequences.");
      break;

    case "ending_evil":
      lines.push("Evidence was manipulated. The truth stayed hidden.");
      break;

    default:
      lines.push("The case ended.");
  }

  if (Array.isArray(ending.addendum)) {
    for (const a of ending.addendum) {
      lines.push(a.replace("Addendum — ", ""));
    }
  }

  lines.push("END.");

  return lines;
}

const DEFAULT_CREDITS = {
  title: "CREDITS",
  sections: [
    { heading: "Developer", lines: ["Keshawn Bryant"] },
    {
      heading: "Voice Cast", lines: ["Ace — Keshawn", "Alex — Henry", "Bartender — Keshawn", "Bobby — Michael", "Delivery Girl — Saisindhu", "Donna — Riana",
        "Florist — Anonymous", "Flower Promoter — Anonymous", "Gambler — Jaime", "Hayes — Garnett", "Jack — Keshawn",
        "Jane — Kiona", "Jim — Keshawn", "John — Henry", "Lieutenant — Robbie", "Lucas — Marcus", "Marcus — Eli", "Maya — Michaela", "Sam — Jewelean", "Tim — Daniel"]
    },
    { heading: "Tilesets", lines: ["35 Character Pixel Art / yigitkinis", "Farm RPG 16x16 Tileset / Emanuelle", "Pixel Cyberpunk Interior / DyLESTorm", "City Pack / NYKNCK", "Village Building Interior Tileset / ay boy", "Pixel Lands Village / Trislin"] },
  ],
  footerLines: ["Thanks for playing."],
};

export const CUTSCENES = {
  intro_boot: {
    steps: [
      { type: "fade", duration: 1000, color: "#000" },
      { type: "requestName" },
      { type: "loadMap", mapName: "office", spawn: { x: 10, y: -5 }, skipSave: true },
      { type: "fade", duration: 600, color: "transparent" },
      {
        type: "startDialogue",
        npcId: "lieutenant",
        dialogueId: "lieutenant",
        nodeId: "intro"
      },
    ]
  },
  leave_office: {
    steps: [
      { type: "fade", duration: 800, color: "#000" },
      { type: "text", content: "Leaving the Lieutenant's office...", duration: 1500 },
      { type: "loadMap", mapName: "pd", spawn: { x: 3, y: 11 } },
      { type: "fade", duration: 800, color: "transparent" },
      { type: "showTutorial", id: "objectives" },
    ]
  },
  going_to_maya: {
    steps: [
      { type: "fade", duration: 600, color: "#000" },
      { type: "text", content: "Walking over to Detective Maya...", duration: 1200 },
      { type: "movePlayer", target: { x: 31, y: 6 } },
      { type: "moveNPC", npcId: "lucas", target: { x: 33, y: 6 }, direction: "up", duration: 400 },

      { type: "fade", duration: 600, color: "transparent" }
    ]
  },
  marcus_enters: {
    steps: [

      { type: "fade", duration: 250, color: "#000" },
      { type: "text", content: " ", duration: 500 },
      { type: "spawnNPC", npcId: "marcus", position: { x: 7, y: 10 }, gid: 1109, spriteId: "marcus", direction: "right" },
      { type: "fade", duration: 250, color: "transparent" },
    ]
  },

  maya_leaves: {
    steps: [
      { type: "text", content: "Maya heads out...", duration: 900 },
      { type: "despawnNPC", npcId: "maya" },
    ]
  },
  tim_leaves: {
    steps: [
      { type: "text", content: "Tim leaves", duration: 900 },
      { type: "despawnNPC", npcId: "timArgue" },
    ]
  },
  bobby_leaves: {
    steps: [
      { type: "despawnNPC", npcId: "bobby" },
    ]
  },
  invest_end: {
    steps: [
      { type: "despawnNPC", npcId: "bobbyCity" },
      { type: "despawnNPC", npcId: "delivery_girl" },
    ]
  },
  leave_pd: {
    steps: [
      { type: "fade", duration: 500, color: "#000" },
      { type: "stopBgm" },
      {
        type: "loadMap",
        mapName: "neighborhood",
        spawn: { x: 44, y: 67 },
        deferBgm: true,
        skipSave: true
      },
      { type: "wait", duration: 200 },
      { type: "fade", duration: 500, color: "transparent" },
      {
        type: "startDialogue",
        npcId: "hayes",
        dialogueId: "hayes",
        nodeId: "intro"
      },
      { type: "startBgm", bgm: "neighborhood" },
      { type: "wait", duration: 2000 },
      { type: "showTutorial", id: "map" },

    ]
  },
  accuse_sam: {
    steps: [
      { type: "fade", duration: 800, color: "#000" },
      { type: "text", content: "Hayes walks down the street...", duration: 2000 },
      { type: "text", content: "A few moments later, he returns with Sam.", duration: 2000 },
      { type: "movePlayer", target: { x: 45, y: 67 } },
      { type: "moveNPC", npcId: "sam", target: { x: 43, y: 67 }, gid: 1109, direction: "right" },
      { type: "moveNPC", npcId: "hayes", target: { x: 44, y: 66 }, gid: 1109, direction: "down" },
      {
        type: "startDialogue",
        npcId: "hayes",
        dialogueId: "hayes",
        nodeId: "sam_arrives"
      },
      { type: "fade", duration: 800, color: "transparent" },
    ]
  },

  accuse_tim: {
    steps: [
      { type: "fade", duration: 800, color: "#000" },
      { type: "text", content: "Hayes heads toward Tim's usual spot...", duration: 2000 },
      { type: "text", content: "You hear shouting in the distance.", duration: 2000 },
      { type: "text", content: "Hayes drags Tim back, who's protesting loudly.", duration: 2500 },
      { type: "movePlayer", target: { x: 45, y: 67 } },
      { type: "moveNPC", npcId: "tim", target: { x: 43, y: 67 }, gid: 1109, direction: "right" },
      { type: "moveNPC", npcId: "hayes", target: { x: 44, y: 66 }, gid: 1109, direction: "down" },
      {
        type: "startDialogue",
        npcId: "hayes",
        dialogueId: "hayes",
        nodeId: "tim_arrives"
      },
      { type: "fade", duration: 800, color: "transparent" },
    ]
  },

  accuse_john: {
    steps: [
      { type: "fade", duration: 800, color: "#000" },
      { type: "text", content: "Hayes walks to John's house...", duration: 2000 },
      { type: "text", content: "After a brief conversation, John agrees to come.", duration: 2500 },
      { type: "movePlayer", target: { x: 45, y: 67 } },
      { type: "spawnNPC", npcId: "john", position: { x: 43, y: 67 }, gid: 1109, spriteId: "john", direction: "right" },
      { type: "moveNPC", npcId: "hayes", target: { x: 44, y: 66 }, gid: 1109, direction: "down" },
      {
        type: "startDialogue",
        npcId: "hayes",
        dialogueId: "hayes",
        nodeId: "john_arrives"
      },
      { type: "fade", duration: 800, color: "transparent" }
    ]
  },

  accuse_jane: {
    steps: [
      { type: "fade", duration: 800, color: "#000" },
      { type: "text", content: "Hayes goes to find Jane...", duration: 2000 },
      { type: "text", content: "She looks resigned as she walks back with him.", duration: 2500 },
      { type: "movePlayer", target: { x: 45, y: 67 } },
      { type: "spawnNPC", npcId: "jane", position: { x: 43, y: 67 }, gid: 1109, spriteId: "jane", direction: "right" },
      { type: "moveNPC", npcId: "hayes", target: { x: 44, y: 66 }, gid: 1109, direction: "down" },
      {
        type: "startDialogue",
        npcId: "hayes",
        dialogueId: "hayes",
        nodeId: "jane_arrives"
      },
      { type: "fade", duration: 800, color: "transparent" }
    ]
  },

  accuse_donna: {
    steps: [
      { type: "fade", duration: 800, color: "#000" },
      { type: "text", content: "Hayes approaches Jim and Donna's house...", duration: 2000 },
      { type: "text", content: "Donna emerges, confused and angry.", duration: 2000 },
      { type: "text", content: "Hayes escorts her back.", duration: 2000 },
      { type: "movePlayer", target: { x: 45, y: 67 } },
      { type: "spawnNPC", npcId: "donna", position: { x: 43, y: 67 }, gid: 1109, spriteId: "donna", direction: "right" },
      { type: "moveNPC", npcId: "hayes", target: { x: 44, y: 66 }, gid: 1109, direction: "down" },
      {
        type: "startDialogue",
        npcId: "hayes",
        dialogueId: "hayes",
        nodeId: "donna_arrives"
      },
      { type: "fade", duration: 800, color: "transparent" }
    ]
  },

  accuse_florist: {
    steps: [
      { type: "fade", duration: 800, color: "#000" },
      { type: "text", content: "Hayes heads to the flower shop...", duration: 2000 },
      { type: "text", content: "The flower boy looks completely bewildered.", duration: 2500 },
      { type: "text", content: "He nervously follows Hayes back.", duration: 2000 },
      { type: "movePlayer", target: { x: 45, y: 67 } },
      { type: "spawnNPC", npcId: "florist", position: { x: 43, y: 67 }, gid: 1109, spriteId: "florist", direction: "right" },
      { type: "moveNPC", npcId: "hayes", target: { x: 44, y: 66 }, gid: 1109, direction: "down" },
      {
        type: "startDialogue",
        npcId: "hayes",
        dialogueId: "hayes",
        nodeId: "florist_arrives"
      },
      { type: "fade", duration: 800, color: "transparent" }
    ]
  },

  accuse_jim: {
    steps: [
      { type: "fade", duration: 800, color: "#000" },
      { type: "text", content: "Hayes goes to talk to Jim and Donna...", duration: 2000 },
      { type: "text", content: "They both walk back, Jim looking sheepish.", duration: 2500 },
      { type: "fade", duration: 800, color: "transparent" }
    ]
  },
  marcus_leaves: {
    steps: [
      { type: "text", content: "Marcus heads into the bar", duration: 900 },
      { type: "despawnNPC", npcId: "marcus" },
    ]
  },
  lucas_goes_to_maya: {
    steps: [
      { type: "fade", duration: 500, color: "#000" },
      {
        type: "text",
        content: "Lucas starts walking.",
        duration: 1200
      },
      {
        type: "loadMap",
        mapName: "bar",
        spawn: { x: 22, y: 22 },
        skipSave: true
      },

      {
        type: "spawnNPC",
        npcId: "lucas",
        name: "Lucas",
        gid: 3586,
        direction: "right",
        position: { x: 24, y: 22 },
      },

      {
        type: "moveNPC",
        npcId: "maya",
        target: { x: 26, y: 22 },
        direction: "left",
        duration: 400
      },
      { type: "wait", duration: 300 },
      { type: "fade", duration: 400, color: "transparent" },
      {
        type: "startDialogue",
        npcId: "lucas",
        dialogueId: "lucasCity",
        nodeId: "flowers_to_maya_01"
      },
    ]
  },
  bobby_comes: {
    steps: [
      { type: "fade", duration: 500, color: "#000" },
      {
        type: "moveNPC",
        npcId: "bobby",
        target: { x: 3, y: 22 },
        direction: "left",
        duration: 400
      },
      { type: "fade", duration: 400, color: "transparent" }
    ]
  },
  frank_comes: {
    steps: [
      { type: "fade", duration: 500, color: "#000" },
      { type: "spawnNPC", npcId: "frank", position: { x: 1, y: 70 }, gid: 1109, spriteId: "frank", direction: "right" },
      { type: "despawnNPC", npcId: "sneak" },
      { type: "fade", duration: 400, color: "transparent" }
    ]
  },
  sneak_taken: {
    steps: [
      { type: "despawnNPC", npcId: "sneak" },
    ]
  },
  lost_man_leaves: {
    steps: [
      { type: "despawnNPC", npcId: "lost_man" },
    ]
  },
  bobby_moves_to_bartender: {
    steps: [
      { type: "fade", duration: 500, color: "#000" },
      {
        type: "spawnNPC",
        npcId: "bobby",
        target: { x: 8, y: 10 },
        direction: "up",
        duration: 400
      },
      { type: "movePlayer", target: { x: 7, y: 11 } },
      { type: "fade", duration: 400, color: "transparent" }
    ]
  },
  good_end: {
    steps: [
      { type: "fade", duration: 500, color: "#000" },
      { type: "stopBgm" },
      {
        type: "loadMap",
        mapName: "office",
        spawn: { x: 10, y: -5 },
        deferBgm: true,
        skipSave: true
      },
      { type: "wait", duration: 200 },
      { type: "fade", duration: 500, color: "transparent" },
      {
        type: "startDialogue",
        npcId: "lieutenant",
        dialogueId: "lieutenant",
        nodeId: "debrief"
      },
    ]
  },
  arrest_end: {
    steps: [
      { type: "fade", duration: 500, color: "#000" },
      { type: "stopBgm" },
      {
        type: "loadMap",
        mapName: "jail",
        spawn: { x: 10, y: -5 },
        deferBgm: true,
        skipSave: true
      },
      { type: "wait", duration: 200 },
      { type: "fade", duration: 500, color: "transparent" },
      {
        type: "startDialogue",
        npcId: "ace",
        dialogueId: "ace",
        nodeId: "arrested"
      },
    ]
  },
  ending_master: {
    steps: [
      { type: "fade", duration: 700, color: "#000" },
      { type: "wait", duration: 250 },

      { type: "endingNarration", duration: 1900 },
      { type: "fade", duration: 700, color: "transparent" },
      { type: "showCredits" },
    ],
  },
};

export async function playCutscene(cutsceneId, context) {
  const cutscene = CUTSCENES[cutsceneId];
  if (!cutscene) {
    console.error(`Cutscene not found: ${cutsceneId}`);
    return;
  }

  for (const step of cutscene.steps) {
    await executeStep(step, context);
  }
}

async function executeStep(step, context) {
  switch (step.type) {
    case "fade":
      return new Promise((resolve) => {
        if (typeof context.setFadeOverlay !== "function") {
          console.warn("fade: setFadeOverlay missing from cutscene context");
          resolve();
          return;
        }

        const isTransparent = step.color === "transparent" || step.color === "rgba(0,0,0,0)";

        context.setFadeOverlay({
          color: isTransparent ? "#000" : step.color,
          visible: !isTransparent,
          duration: step.duration ?? 400,
        });

        setTimeout(resolve, step.duration ?? 400);
      });


    case "text":
      context.setTransitionMessage(step.content);
      return new Promise((resolve) => {
        setTimeout(() => {
          context.setTransitionMessage(null);
          resolve();
        }, step.duration);
      });

    case "loadMap":
      await context.loadNamedMap(step.mapName, {
        deferBgm: !!step.deferBgm,
        skipSave: !!step.skipSave, 
      });
      if (step.spawn) {
        context.playerRef.current.x = step.spawn.x;
        context.playerRef.current.y = step.spawn.y;
      }
      return;

    case "movePlayer":
      if (!step.target) return;
      context.playerRef.current.x = step.target.x;
      context.playerRef.current.y = step.target.y;
      return;

    case "moveNPC":
      return moveNpc(step, context);

    case "spawnNPC":
      return spawnNpc(step, context);
    case "despawnNPC": {
      if (!step.npcId) return;
      if (typeof context.setNpcs !== "function") return;
      context.setNpcs(prev => prev.filter(n => n.id !== step.npcId));
      return;
    }
    case "startDialogue": {
      const { npcId, dialogueId, nodeId } = step;

      context.setDialogue({
        npcId,
        npcName: npcId,
        dlgId: dialogueId,
        nodeId: nodeId || "start",
      });

      if (typeof context.waitForDialogueToEnd === "function") {
        await context.waitForDialogueToEnd();
      }
      return;
    }
    case "startBgm": {
      context.playBgm(step.bgm);
      return;
    }
    case "stopBgm": {
      context.stopBgm(step.bgm);
      return;
    }
    case "branch": {
      const picked = typeof step.pick === "function" ? step.pick(context) : step.next;
      if (!picked) return;
      await playCutscene(picked, context);
      return;
    }

    case "endingNarration": {
      if (!context.ending) {
        d
        context.ending = resolveEnding(context.flags);
        console.log([...context.flags].filter(f => f.startsWith("accused_")));

      }

      const lines = buildNarrationLines(context.ending);

      for (const line of lines) {
        context.setTransitionMessage(line);
        await new Promise((r) => setTimeout(r, step.duration ?? 1800));
        context.setTransitionMessage(null);
        await new Promise((r) => setTimeout(r, 150));
      }
      return;
    }
    case "showCredits": {
      if (typeof context.setCreditsOverlay !== "function") {
        console.warn("showCredits: setCreditsOverlay missing from cutscene context");
        return;
      }

      const credits = step.credits ?? DEFAULT_CREDITS;

      context.setCreditsOverlay({
        visible: true,
        credits,
        onContinue: () => {
          if (context.flags instanceof Set) context.flags.clear();
          if (context.GAME?.metadata?.clear) context.GAME.metadata.clear();
          if (typeof context.goToMainMenu === "function") {
            context.goToMainMenu();
          } else {
            console.warn("showCredits: goToMainMenu missing from cutscene context");
          }
        },
      });

      return;
    }
    case "showTutorial": {
      if (typeof context.showTutorial === "function") {
        context.showTutorial(step.id);
      }
      return;
    }
    case "wait":
      return new Promise(resolve => setTimeout(resolve, step.duration));
    case "requestName":
      return new Promise(resolve => {
        context.flags.clear();
        context.GAME.metadata.clear();
        const name = prompt("Detective, enter your name:");
        context.flags.add("named_player");
        context.GAME.metadata.set("playerName", name || "Detective");
        resolve();
      });

    default:
      console.warn(`Unknown cutscene step type: ${step.type}`, step);
      return;
  }
}

function moveNpc(step, context) {
  const { npcId, target, direction } = step;
  if (!npcId || !target) {
    console.warn("moveNPC missing npcId/target", step);
    return;
  }
  if (typeof context.setNpcs !== "function") {
    console.warn("moveNPC needs setNpcs in cutscene context");
    return;
  }

  context.setNpcs((prev) => {
    const idx = prev.findIndex((n) => n.id === npcId);
    if (idx === -1) {
      console.warn(`moveNPC: npc "${npcId}" not found in npcs[]`);
      return prev;
    }
    const next = prev.slice();
    next[idx] = { ...next[idx], x: target.x, y: target.y, ...(direction ? { direction } : null), };
    return next;
  });
}

async function spawnNpc(step, context) {
  const { npcId, position, gid, name, dialogueId, spriteId, direction } = step;
  if (!npcId || !position) {
    console.warn("spawnNPC missing npcId/position", step);
    return;
  }
  if (typeof context.setNpcs !== "function") {
    console.warn("spawnNPC needs setNpcs in cutscene context");
    return;
  }

  if (!gid) {
    console.warn(
      `spawnNPC: missing gid for "${npcId}".`,
      step
    );
  }

  const { loadNpcImages } = await import("./tmjLoader.js");

  const npc = {
    id: npcId,
    name: name ?? npcId,
    x: position.x,
    y: position.y,
    gid: gid ?? 0,
    dialogueId,
    spriteId: spriteId ?? npcId,
    direction: direction ?? "down",
    cooldownMs: 400,
  };

  await loadNpcImages([npc]);

  context.setNpcs((prev) => {
    if (prev.some((n) => n.id === npcId)) return prev;
    return [...prev, npc];
  });
}