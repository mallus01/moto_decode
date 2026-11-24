import type { MascotId } from "./components/Mascots";

export type VisualSpec =
  | { kind: "engine4t"; stroke?: "admission" | "compression" | "combustion" | "echappement" | "cycle"; speed?: number; highlight?: "crank" | "valves" | "spark" }
  | { kind: "bike"; focus?: "engine" | "spark" | "brake" | "tire" | "chain" | "clutch" | "none"; boom?: boolean; label?: string }
  | { kind: "clutch"; state?: "engaged" | "disengaged" | "slip" | "cycle"; labels?: boolean }
  | { kind: "clutchlever" }
  | { kind: "oilcheck" }
  | { kind: "mascot"; id?: MascotId; pose?: "wave" | "wrench" | "think" }
  | { kind: "logo" }
  | { kind: string; [key: string]: unknown };

export type SceneType = "hook" | "explain" | "tip" | "outro";

export type Scene = {
  type: SceneType;
  heading?: string; // pour le hook : phrase choc, *mots* surlignés
  kicker?: string; // hook : petite étiquette du sujet sous la phrase
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
