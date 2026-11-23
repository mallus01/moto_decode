import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../brand";
import { BODY_FONT, TITLE_FONT } from "../fonts";

const C = BRAND.colors;
const OIL = "#E9A23B";

// Hublot de niveau d'huile (repères MIN/MAX) + bidon qui verse.
export const OilCheck: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fill = spring({ frame: f - 20, fps, config: { damping: 18, mass: 2 } });
  const level = interpolate(fill, [0, 1], [0.12, 0.55]); // 0 = bas du hublot, 1 = haut
  const wobble = Math.sin(f / 5) * 4 * (1 - fill * 0.7);
  const ok = fill > 0.9;
  const drops = Array.from({ length: 4 }, (_, i) => (f * 0.05 + i / 4) % 1);
  const R = 170;
  const cy = 520;
  const surfaceY = cy + R - level * 2 * R;
  return (
    <svg viewBox="0 0 600 900" width="100%" height="100%" style={{ overflow: "visible" }}>
      {/* carter moteur */}
      <rect x={40} y={300} width={520} height={460} rx={60} fill={C.metal} stroke={C.ink} strokeWidth={BRAND.stroke} />
      {[90, 510].map((x) => [350, 710].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={14} fill={C.grey} stroke={C.ink} strokeWidth={5} />))}
      {/* hublot */}
      <defs>
        <clipPath id="glass">
          <circle cx={300} cy={cy} r={R} />
        </clipPath>
      </defs>
      <circle cx={300} cy={cy} r={R + 22} fill={C.grey} stroke={C.ink} strokeWidth={BRAND.stroke} />
      <circle cx={300} cy={cy} r={R} fill={C.white} />
      <g clipPath="url(#glass)">
        <path d={`M 100 ${surfaceY + wobble} Q 200 ${surfaceY - 14 - wobble} 300 ${surfaceY + wobble} T 500 ${surfaceY} L 500 800 L 100 800 Z`} fill={OIL} stroke={C.ink} strokeWidth={6} />
        <circle cx={240} cy={surfaceY + 60} r={10} fill={C.white} opacity={0.5} />
      </g>
      <circle cx={300} cy={cy} r={R} fill="none" stroke={C.ink} strokeWidth={BRAND.stroke} />
      {/* repères */}
      {[
        { t: "MAX", y: cy - R * 0.4 },
        { t: "MIN", y: cy + R * 0.4 },
      ].map((m) => (
        <g key={m.t}>
          <line x1={175} y1={m.y} x2={425} y2={m.y} stroke={C.red} strokeWidth={7} strokeDasharray="18 12" />
          <rect x={440} y={m.y - 26} width={100} height={52} rx={12} fill={C.white} stroke={C.ink} strokeWidth={5} />
          <text x={490} y={m.y + 13} textAnchor="middle" fontFamily={TITLE_FONT} fontSize={36} fill={C.ink}>
            {m.t}
          </text>
        </g>
      ))}
      {/* bidon */}
      <g transform={`translate(470 190) rotate(${interpolate(fill, [0, 1], [-35, -5])})`}>
        <rect x={-70} y={-60} width={150} height={170} rx={24} fill={C.orange} stroke={C.ink} strokeWidth={BRAND.stroke} />
        <rect x={-110} y={-40} width={50} height={36} rx={8} fill={C.ink} />
        <text x={5} y={45} textAnchor="middle" fontFamily={BODY_FONT} fontWeight={900} fontSize={34} fill={C.white}>
          HUILE
        </text>
      </g>
      {!ok &&
        drops.map((d, i) => (
          <path key={i} transform={`translate(${355 - d * 10} ${190 + d * 150})`} d="M 0 -18 Q 14 4 0 14 Q -14 4 0 -18 Z" fill={OIL} stroke={C.ink} strokeWidth={4} />
        ))}
      {ok && (
        <g transform={`translate(300 830) scale(${spring({ frame: f - 60, fps })})`}>
          <circle r={58} fill={"#2BB673"} stroke={C.ink} strokeWidth={BRAND.stroke} />
          <path d="M -26 0 L -6 20 L 28 -18" fill="none" stroke={C.white} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
};
