import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../brand";
import { BODY_FONT, TITLE_FONT } from "../fonts";
import type { Scene } from "../types";
import { Visual } from "../visuals";
import { Captions } from "../components/Captions";
import { Sfx } from "../components/Sfx";

const C = BRAND.colors;

// Découpe "*50 explosions* par seconde !" en mots, ceux entre * sont mis en valeur.
const parsePunch = (text: string) => {
  const words: { w: string; hot: boolean }[] = [];
  text.split(/(\*[^*]+\*)/).forEach((part) => {
    const hot = part.startsWith("*") && part.endsWith("*");
    part.replace(/\*/g, "").split(/\s+/).filter(Boolean).forEach((w) => words.push({ w, hot }));
  });
  return words;
};

/**
 * Accroche : une phrase choc en très gros (mots qui tombent un par un, mot clé surligné)
 * + une grande image cartoon qui illustre le sujet, avec un petit tremblement d'impact.
 */
export const HookView: React.FC<{ scene: Scene; speechFrames: number }> = ({ scene, speechFrames }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = parsePunch(scene.heading ?? "");
  const imgIn = spring({ frame: f, fps, config: { damping: 11, stiffness: 120 } });
  const shake = f < 14 ? Math.sin(f * 3.3) * (14 - f) * 1.4 : 0;
  const kickerIn = spring({ frame: f - words.length * 2 - 4, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
      <Sfx name="boom" at={0} />
      {words.map((w, i) => (w.hot && i > 0 ? <Sfx key={`p${i}`} name="pop" at={i * 2} /> : null))}
      {scene.kicker && <Sfx name="whoosh" at={words.length * 2 + 2} volume={0.25} />}
      {/* phrase choc */}
      <div style={{ position: "absolute", top: 320, left: 50, right: 50, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 22px" }}>
        {words.map(({ w, hot }, i) => {
          const s = interpolate(spring({ frame: f - i * 2, fps, config: { damping: 9, stiffness: 220 } }), [0, 1], [0.55, 1]);
          return (
            <span
              key={i}
              style={{
                fontFamily: TITLE_FONT,
                fontSize: 118,
                lineHeight: 1.05,
                color: hot ? C.ink : C.white,
                background: hot ? C.yellow : "transparent",
                padding: hot ? "0 18px 8px" : 0,
                borderRadius: 18,
                border: hot ? `${BRAND.stroke}px solid ${C.ink}` : "none",
                WebkitTextStroke: hot ? undefined : `16px ${C.ink}`,
                paintOrder: "stroke fill",
                textTransform: "uppercase",
                display: "inline-block",
                transform: `scale(${s}) rotate(${hot ? -3 : 0}deg)`,
                
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      {/* image du sujet */}
      <div style={{ position: "absolute", top: 690, left: 30, right: 30, height: 690, transform: `scale(${interpolate(imgIn, [0, 1], [1.25, 1])})` }}>
        <Visual spec={scene.visual} />
      </div>
      {scene.kicker && (
        <div style={{ position: "absolute", top: 625, width: "100%", zIndex: 2, display: "flex", justifyContent: "center", transform: `scale(${kickerIn})` }}>
          <div style={{ fontFamily: BODY_FONT, fontWeight: 900, fontSize: 44, color: C.white, background: C.orange, border: `6px solid ${C.ink}`, borderRadius: 40, padding: "6px 30px", boxShadow: `6px 6px 0 ${C.ink}` }}>
            {scene.kicker}
          </div>
        </div>
      )}
      <Captions text={scene.narration} speechFrames={speechFrames} />
    </AbsoluteFill>
  );
};
