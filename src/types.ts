import type { MascotId } from "./components/Mascots";

export type VisualSpec =
  | { kind: "engine4t"; stroke?: "admission" | "compression" | "combustion" | "echappement" | "cycle"; speed?: number; highlight?: "crank" | "valves" | "spark" }
  | { kind: "oilcheck" }
  | { kind: "mascot"; id?: MascotId; pose?: "wave" | "wrench" | "think" }
  | { kind: "logo" }
  | { kind: string; [key: string]: unknown };

export type SceneType = "hook" | "explain" | "tip" | "outro";

export type Scene = {
  type: SceneType;
  heading?: string;
  narration: string;
  visual?: VisualSpec;
  // Rempli par le pipeline :
  audio?: string; // chemin relatif à public/
  durationSec?: number;
};

export type VideoProps = {
  slug: string;
  title: string;
  // Mascotte de l'épisode (voir src/components/Mascots.tsx). Défaut : "piston".
  mascot?: MascotId;
  scenes: Scene[];
  outro?: { narration: string; next?: string };
};
