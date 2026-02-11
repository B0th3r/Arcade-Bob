import { Howl } from "howler";

const VOICE_BASE_PATH = "/audio";
const BGM_BASE_PATH = "/audio/bgm";
let pendingStopTimeout = null;
let pendingStopHowl = null;

const voiceCache = new Map();
let currentVoice = null;
const audioDurations = new Map();

let voiceVolume = 1.0;

function getOrCreateVoice(characterId, clipId) {
  const key = `${characterId}:${clipId}`;
  if (voiceCache.has(key)) return voiceCache.get(key);

  const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const sound = new Howl({
    src: [`${VOICE_BASE_PATH}/${characterId}/${clipId}.mp3`],
    preload: true,
    html5: isiOS,
    volume: voiceVolume,
  });

  voiceCache.set(key, sound);
  return sound;
}

export function getVoiceDuration(characterId, clipId) {
  const key = `${characterId}:${clipId}`;

  if (audioDurations.has(key)) {
    return Promise.resolve(audioDurations.get(key));
  }

  const sound = getOrCreateVoice(characterId.toLowerCase(), clipId);

  return new Promise((resolve) => {
    if (sound.state() === "loaded") {
      const duration = sound.duration() * 1000;
      audioDurations.set(key, duration);
      resolve(duration);
    } else {
      sound.once("load", () => {
        const duration = sound.duration() * 1000;
        audioDurations.set(key, duration);
        resolve(duration);
      });

      sound.once("loaderror", (id, err) => {
        console.warn(`Could not load audio: ${key}`, err);
        resolve(null);
      });
    }
  });
}

export function getCachedVoiceDuration(characterId, clipId) {
  const key = `${characterId}:${clipId}`;
  return audioDurations.get(key) || null;
}

export function playVoice(characterId, clipId, { interrupt = true } = {}) {
  if (!characterId || !clipId) return;

  const sound = getOrCreateVoice(characterId.toLowerCase(), clipId);

  try {
    if (interrupt && currentVoice) currentVoice.stop();
    currentVoice = sound;
    sound.volume(voiceVolume);
    sound.play();
  } catch (err) {
    console.warn("[voice] Failed to play voice line", { characterId, clipId, err });
  }
}

export function stopVoice() {
  if (currentVoice && currentVoice.playing()) currentVoice.stop();
}

export function setVoiceVolume(volume) {
  voiceVolume = Math.min(1, Math.max(0, volume));
  if (currentVoice) currentVoice.volume(voiceVolume);
  for (const snd of voiceCache.values()) snd.volume(voiceVolume);
}

const bgmCache = new Map();
let currentBgm = null;
let currentBgmKey = null;
let bgmVolume = 0.45;

function getOrCreateBgm(trackKey) {
  if (bgmCache.has(trackKey)) return bgmCache.get(trackKey);

  const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const filename = trackKey.endsWith(".mp3") ? trackKey : `${trackKey}.mp3`;

  const sound = new Howl({
    src: [`${BGM_BASE_PATH}/${filename}`],
    preload: true,
    html5: isiOS,
    loop: true,
    volume: bgmVolume,
  });

  bgmCache.set(trackKey, sound);
  return sound;
}
let bgmBaseVolume = 0.30;
let bgmDuckVolume = 0.18;
let duckTimeout = null;

export function duckBgm({ fadeMs = 120, holdMs = 180 } = {}) {
  if (!currentBgm) return;

  if (duckTimeout) clearTimeout(duckTimeout);

  try {
    currentBgm.fade(currentBgm.volume(), bgmDuckVolume, fadeMs);
  } catch {
    currentBgm.volume(bgmDuckVolume);
  }

  // schedule unduck slightly after last voice event
  duckTimeout = setTimeout(() => {
    if (!currentBgm) return;
    try {
      currentBgm.fade(currentBgm.volume(), bgmBaseVolume, 250);
    } catch {
      currentBgm.volume(bgmBaseVolume);
    }
    duckTimeout = null;
  }, holdMs);
}

export function playBgm(trackKey, { fadeMs = 600, volume } = {}) {
  if (!trackKey) return;

  const next = getOrCreateBgm(trackKey);
  if (pendingStopHowl === next && pendingStopTimeout) {
    clearTimeout(pendingStopTimeout);
    pendingStopTimeout = null;
    pendingStopHowl = null;
  }
  const targetVol = typeof volume === "number" ? Math.min(1, Math.max(0, volume)) : bgmVolume;

  // If same track is already playing do nothing
  if (currentBgmKey === trackKey && currentBgm && currentBgm.playing()) {
    currentBgm.volume(targetVol);
    return;
  }

  // Fade out old track
  if (currentBgm) {
    try {
      const old = currentBgm;
      pendingStopHowl = old;
      pendingStopTimeout = setTimeout(() => {
        try { old.stop(); } catch { }
        if (pendingStopHowl === old) {
          pendingStopHowl = null;
          pendingStopTimeout = null;
        }
      }, fadeMs + 30);

    } catch {
      try { currentBgm.stop(); } catch { }
    }
  }

  currentBgm = next;
  currentBgmKey = trackKey;
  try {
    currentBgm.volume(0);
    currentBgm.play();
    currentBgm.fade(0, targetVol, fadeMs);
  } catch (err) {
    console.warn("[bgm] Failed to play", { trackKey, err });
  }
}

export function stopBgm({ fadeMs = 400 } = {}) {
  if (!currentBgm) return;
  try {
    const snd = currentBgm;
    snd.fade(snd.volume(), 0, fadeMs);
    setTimeout(() => {
      try { snd.stop(); } catch { }
    }, fadeMs + 30);
  } catch {
    try { currentBgm.stop(); } catch { }
  } finally {
    currentBgm = null;
    currentBgmKey = null;
  }
}

export function setBgmVolume(volume) {
  bgmVolume = Math.min(1, Math.max(0, volume));
  if (currentBgm) currentBgm.volume(bgmVolume);
  for (const snd of bgmCache.values()) snd.volume(bgmVolume);
}
