import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../brand";
import { TITLE_FONT } from "../fonts";
import type { Scene } from "../types";
import { Visual } from "../visuals";
import { Captions } from "../components/Captions";
import { PartMascot, type MascotId } from "../components/Mascots";

const C = BRAND.colors;

export const SceneView: React.FC<{ scene: Scene; speechFrames: number; mascot?: MascotId }> = ({ scene, speechFrames, mascot }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f, fps, config: { damping: 14, stiffness: 140 } });
  const headX = interpolate(enter, [0, 1], [-900, 0]);
  const visScale = interpolate(enter, [0, 1], [0.6, 1]);
  const isTip = scene.type === "tip";
  const isHook = scene.type === "hook";

  return (
    <AbsoluteFill>
      {scene.heading && (
        <div style={{ position: "absolute", top: 330, left: 60, right: 60, display: "flex", justifyContent: "center", transform: `translateX(${headX}px)` }}>
          <div
            style={{
              fontFamily: TITLE_FONT,
              fontSize: isHook ? 100 : 84,
              lineHeight: 1,
              textAlign: "center",
              color: isTip ? C.ink : C.white,
              background: isTip ? C.yellow : isHook ? C.orange : C.ink,
              border: `${BRAND.stroke}px solid ${C.ink}`,
              borderRadius: 28,
              padding: "18px 36px 24px",
              boxShadow: `10px 10px 0 ${C.ink}`,
              transform: `rotate(${isHook ? -2 : -1}deg)`,
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
          <PartMascot id={mascot} size={300} pose={isTip ? "wrench" : "wave"} />
        </div>
      )}
      <Captions text={scene.narration} speechFrames={speechFrames} />
    </AbsoluteFill>
  );
};
