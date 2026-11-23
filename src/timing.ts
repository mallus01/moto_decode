import { FPS } from "./brand";

export const SCENE_PAD_SEC = 0.35;

// Durée de chaque scène = durée de la voix + petite respiration.
export const sceneFrames = (durationSec: number | undefined, narration: string) => {
  // Sans audio (aperçu Studio), on estime ~14 caractères / seconde.
  const sec = durationSec ?? Math.max(2.5, narration.length / 14);
  return Math.ceil((sec + SCENE_PAD_SEC) * FPS);
};
