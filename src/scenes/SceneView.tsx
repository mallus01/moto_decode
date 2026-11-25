import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../brand";
import { TITLE_FONT } from "../fonts";
import type { Scene } from "../types";
import { Visual } from "../visuals";
import { Captions } from "../components/Captions";
import { Pistou } from "../components/Mascots";
import { HookView } from "./HookView";
import { Sfx } from "../components/Sfx";
import { CLUTCH_CYCLE } from "../visuals/Clutch";
import { CHAIN_FRONT_TURN } from "../visuals/Chain";

const C = BRAND.colors;

export const SceneView: React.FC<{ scene: Scene; speechFrames: number }> = ({ scene, speechFrames }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f, fps, config: { damping: 14, stiffness: 140 } });
  const headX = interpolate(enter, [0, 1], [-900, 0]);
  const visScale = interpolate(enter, [0, 1], [0.6, 1]);
  const isTip = scene.type === "tip";
  const isHook = scene.type === "hook";
  if (isHook) return <HookView scene={scene} speechFrames={speechFrames} />;
  const v = (scene.visual ?? {}) as Record<string, unknown>;
  // Combustion : un « zap » à chaque étincelle de la bougie (même rythme que l'animation Engine4T).
  const zapEvery = v.kind === "engine4t" && v.stroke === "combustion" ? Math.ceil(220 / ((v.speed as number) ?? 2.6)) : 0;
  const zaps = zapEvery ? Array.from({ length: Math.ceil(speechFrames / zapEvery) }, (_, i) => i * zapEvery) : [];

  // Embrayage : un « pop » quand le levier est tiré.
  const clutchPops =
    v.kind === "clutch" && v.state === "disengaged" ? [14]
    : v.kind === "clutch" && v.state === "cycle" ? Array.from({ length: Math.ceil(speechFrames / CLUTCH_CYCLE) }, (_, i) => i * CLUTCH_CYCLE + 8)
    : [];

  // Chaîne (rapport) : un tick à chaque tour de pignon, un pop à chaque tour de roue.
  const chainTicks = v.kind === "chain" && v.mode === "ratio" ? Array.from({ length: Math.floor(speechFrames / CHAIN_FRONT_TURN) }, (_, i) => (i + 1) * CHAIN_FRONT_TURN) : [];

  return (
    <AbsoluteFill>
      {/* bruitages */}
      <Sfx name="whoosh" at={0} />
      {isTip && <Sfx name="ding" at={6} />}
      {isTip && <Sfx name="boing" at={10} volume={0.25} />}
      {zaps.map((z) => <Sfx key={z} name="zap" at={z} />)}
      {v.kind === "oilcheck" && <Sfx name="levelup" at={60} />}
      {clutchPops.map((z) => <Sfx key={`c${z}`} name="pop" at={z} />)}
      {v.kind === "clutchlever" && <Sfx name="levelup" at={42} />}
      {chainTicks.map((z, i) => <Sfx key={`t${z}`} name={(i + 1) % 3 === 0 ? "pop" : "tick"} at={z} />)}
      {scene.heading && (
        <div style={{ position: "absolute", top: 330, left: 60, right: 60, display: "flex", justifyContent: "center", transform: `translateX(${headX}px)` }}>
          <div
            style={{
              fontFamily: TITLE_FONT,
              fontWeight: 800,
              fontSize: isHook ? 100 : 84,
              lineHeight: 1,
              textAlign: "center",
              color: isTip ? C.ink : C.text,
              background: isTip ? C.orange : isHook ? C.orange : C.blue,
              borderRadius: 28,
              padding: "18px 36px 24px",
              boxShadow: `0 12px 0 ${isTip ? "#B87A06" : C.blueDk}`,
              transform: `rotate(0deg)`,
            }}
          >
            {isTip && <div style={{ fontSize: 44, letterSpacing: 3, marginBottom: 6 }}>ASTUCE ENTRETIEN</div>}
            {scene.heading}
          </div>
        </div>
      )}
      <div style={{ position: "absolute", top: isHook ? 590 : 480, left: 60, right: 60, height: isHook ? 800 : 900, transform: `scale(${visScale})` }}>
        <Visual spec={scene.visual} />
      </div>
      {(isHook || isTip) && (
        <div style={{ position: "absolute", left: isTip ? 760 : 20, top: isTip ? 1130 : 1080, transform: `scale(${enter})` }}>
          <Pistou size={300} pose={isTip ? "wrench" : "wave"} />
        </div>
      )}
      <Captions text={scene.narration} speechFrames={speechFrames} />
    </AbsoluteFill>
  );
};
