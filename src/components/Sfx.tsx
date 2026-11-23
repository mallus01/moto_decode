import { Audio, Sequence, staticFile } from "remotion";

export type SfxName = "whoosh" | "boom" | "pop" | "ding" | "zap" | "levelup" | "boing" | "tick";

// Volume de chaque bruitage par rapport à la voix (normalisée à -14 LUFS).
const VOLUME: Record<SfxName, number> = {
  whoosh: 0.35,
  boom: 0.4,
  pop: 0.4,
  ding: 0.3,
  zap: 0.35,
  levelup: 0.3,
  boing: 0.35,
  tick: 0.25,
};

/** Joue un bruitage de public/sfx/ à une image donnée de la scène. */
export const Sfx: React.FC<{ name: SfxName; at?: number; volume?: number }> = ({ name, at = 0, volume }) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={45} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume ?? VOLUME[name]} />
  </Sequence>
);
