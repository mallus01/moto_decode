import { interpolate, useCurrentFrame } from "remotion";
import { BRAND } from "../brand";

const C = BRAND.colors;

// "Boulon", la mascotte : un écrou hexagonal avec des yeux.
export const Mascot: React.FC<{ size?: number; pose?: "wave" | "wrench" | "think"; talking?: boolean }> = ({ size = 300, pose = "wave", talking = true }) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 6) * 8;
  const blink = f % 90 > 84 ? 0.15 : 1;
  const mouth = talking ? 10 + Math.abs(Math.sin(f / 2.3)) * 16 : 8;
  const wave = pose === "wave" ? Math.sin(f / 4) * 25 : 0;
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    return `${150 + 110 * Math.cos(a)},${160 + 110 * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg width={size} height={size} viewBox="0 0 300 320" style={{ transform: `translateY(${bob}px)`, overflow: "visible" }}>
      {/* bras */}
      <g transform={`rotate(${-20 + wave} 60 170)`}>
        <line x1="60" y1="170" x2="0" y2="110" stroke={C.ink} strokeWidth="14" strokeLinecap="round" />
        <circle cx="0" cy="108" r="16" fill={C.white} stroke={C.ink} strokeWidth="7" />
      </g>
      <g>
        <line x1="240" y1="170" x2="295" y2="215" stroke={C.ink} strokeWidth="14" strokeLinecap="round" />
        {pose === "wrench" && (
          <g transform="translate(295 215) rotate(-50)">
            <rect x="-10" y="-90" width="20" height="90" rx="6" fill={C.metal} stroke={C.ink} strokeWidth="6" />
            <path d="M -26 -95 A 26 26 0 1 1 26 -95 L 10 -95 L 10 -112 L -10 -112 L -10 -95 Z" fill={C.metal} stroke={C.ink} strokeWidth="6" />
          </g>
        )}
        <circle cx="295" cy="215" r="16" fill={C.white} stroke={C.ink} strokeWidth="7" />
      </g>
      <polygon points={hex} fill={C.yellow} stroke={C.ink} strokeWidth="9" strokeLinejoin="round" />
      <circle cx="150" cy="160" r="34" fill={C.cream} stroke={C.ink} strokeWidth="7" opacity={0.6} />
      {/* yeux */}
      {[110, 190].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={110} rx={22} ry={26 * blink} fill={C.white} stroke={C.ink} strokeWidth="6" />
          <circle cx={x + 4} cy={114} r={10 * blink} fill={C.ink} />
        </g>
      ))}
      {pose === "think" && <path d="M 90 72 L 130 80 M 170 80 L 210 72" stroke={C.ink} strokeWidth="7" strokeLinecap="round" />}
      {/* bouche */}
      <ellipse cx="150" cy="222" rx={30} ry={interpolate(mouth, [0, 30], [2, 22])} fill={C.red} stroke={C.ink} strokeWidth="6" />
    </svg>
  );
};
