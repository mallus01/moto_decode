import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "../brand";

const C = BRAND.colors;

// Fond flat : aplat bleu pétrole + deux grandes formes géométriques d'une teinte au-dessus,
// qui dérivent lentement (pas de dégradé, pas de texture).
export const Background: React.FC<{ tint?: string }> = ({ tint = C.bg }) => {
  const f = useCurrentFrame();
  const drift = Math.sin(f / 90) * 30;
  return (
    <AbsoluteFill style={{ backgroundColor: tint, overflow: "hidden" }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <circle cx={540 + drift} cy={930} r={470} fill={C.deco} />
        <circle cx={930 - drift} cy={420} r={110} fill={C.deco} />
        <rect x={-60} y={1530 + drift * 0.5} width={520} height={60} rx={30} fill={C.deco} transform="rotate(-8 200 1560)" />
      </svg>
    </AbsoluteFill>
  );
};
