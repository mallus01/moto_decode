import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../brand";
import { BODY_FONT } from "../fonts";

// Sous-titres façon TikTok : 2 à 4 mots à la fois, le groupe courant "pop".
// Le timing est réparti selon la longueur de chaque groupe sur la durée de la voix.
const chunk = (text: string) => {
  const words = text.split(/\s+/).filter(Boolean);
  const groups: string[] = [];
  let cur: string[] = [];
  for (const w of words) {
    cur.push(w);
    const len = cur.join(" ").length;
    if (len >= 14 || /[.,!?;:]$/.test(w) || cur.length >= 4) {
      groups.push(cur.join(" "));
      cur = [];
    }
  }
  if (cur.length) groups.push(cur.join(" "));
  return groups;
};

export const Captions: React.FC<{ text: string; speechFrames: number }> = ({ text, speechFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const groups = chunk(text);
  const weights = groups.map((g) => g.length + 4);
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  let idx = groups.length - 1;
  let start = 0;
  for (let i = 0; i < groups.length; i++) {
    const end = acc + (weights[i] / total) * speechFrames;
    if (frame < end) {
      idx = i;
      start = acc;
      break;
    }
    acc = end;
  }
  const pop = spring({ frame: frame - start, fps, config: { damping: 12, stiffness: 220 } });
  const scale = interpolate(pop, [0, 1], [0.7, 1]);
  return (
    <div style={{ position: "absolute", left: 70, right: 150, top: 1420, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: BODY_FONT,
          fontWeight: 800,
          fontSize: 74,
          lineHeight: 1.05,
          textAlign: "center",
          color: BRAND.colors.bg,
          background: BRAND.colors.text,
          borderRadius: 26,
          padding: "10px 34px 16px",
          boxShadow: `0 10px 0 ${BRAND.colors.metal}`,
          transform: `scale(${scale}) rotate(0deg)`,
          textTransform: "uppercase",
        }}
      >
        {groups[idx]}
      </div>
    </div>
  );
};
