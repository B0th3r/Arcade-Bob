import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DIALOGUE } from "../dialogue/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function listAudioBasenamesRecursive(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const e of entries) {
    const full = path.join(dir, e.name);

    if (e.isDirectory()) {
      out.push(...listAudioBasenamesRecursive(full));
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if (ext === ".ogg" || ext === ".wav" || ext === ".mp3") {
        out.push(path.parse(e.name).name); 
      }
    }
  }
  return out;
}

function addVoiceRef(voiceToRefs, voice, ref) {
  if (!voiceToRefs.has(voice)) voiceToRefs.set(voice, []);
  voiceToRefs.get(voice).push(ref);
}

function collectVoiceRefsFromTree(dialogueKey, tree, voiceToRefs) {
  if (!tree || typeof tree !== "object" || !tree.nodes) return;

  for (const [nodeKey, node] of Object.entries(tree.nodes)) {
    const segments = node?.segments || [];
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (!seg || typeof seg !== "object") continue;

      const voice = typeof seg.voice === "string" ? seg.voice.trim() : "";
      if (!voice) continue; 

      addVoiceRef(voiceToRefs, voice, {
        dialogue: dialogueKey,
        node: nodeKey,
        segIndex: i,
        speaker: seg.speaker ?? "",
        text: (seg.text ?? "").toString().slice(0, 80), 
      });
    }
  }
}


function collectVoiceRefs(dialogueKey, entry, voiceToRefs) {
  if (!entry || typeof entry !== "object") return;

  if (entry.nodes) {
    collectVoiceRefsFromTree(dialogueKey, entry, voiceToRefs);
    return;
  }

  for (const [subKey, Tree] of Object.entries(entry)) {
    if (Tree && typeof Tree === "object" && Tree.nodes) {
      collectVoiceRefsFromTree(`${dialogueKey}.${subKey}`, Tree, voiceToRefs);
    }
  }
}

const voiceToRefs = new Map();

for (const [dialogueKey, entry] of Object.entries(DIALOGUE)) {
  collectVoiceRefs(dialogueKey, entry, voiceToRefs);
}

const referencedVoices = new Set(voiceToRefs.keys());

const audioDir = path.resolve(__dirname, "../../../public/audio"); 
const audioFiles = listAudioBasenamesRecursive(audioDir);
const audioSet = new Set(audioFiles);

const missing = [...referencedVoices].filter(v => !audioSet.has(v));

console.log("Total referenced voices:", referencedVoices.size);
console.log("Total audio files found:", audioFiles.length);
console.log("Missing voice IDs:", missing.length);

console.log("\n=== Missing voices with locations ===");
for (const voice of missing.sort()) {
  console.log(`\n[MISSING] ${voice}`);

  const refs = voiceToRefs.get(voice) || [];
  for (const r of refs) {
    const who = r.speaker ? ` (${r.speaker})` : "";
    const line = r.text ? ` - "${r.text}${r.text.length === 80 ? "…" : ""}"` : "";
    console.log(`  - ${r.dialogue} -> node "${r.node}" seg #${r.segIndex}${who}${line}`);
  }
}

if (missing.length) process.exitCode = 1;
