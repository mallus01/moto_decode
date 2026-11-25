import { interpolate, useCurrentFrame } from "remotion";
import { BRAND } from "../brand";

const C = BRAND.colors;
const INK = C.ink;
const LIMB = C.metal; // bras/jambes : acier clair, visible sur le fond pétrole

export type Pose = "wave" | "wrench" | "think";

// Pistou le piston : seule mascotte de Moto Décode.
export const MASCOT = { name: "Pistou", part: "le piston" };

// ---------- pièces communes : visage + bras ----------
const Face: React.FC<{ cx: number; cy: number; s?: number; pose: Pose; talking: boolean; dark?: boolean }> = ({ cx, cy, s = 1, pose, talking, dark }) => {
  const f = useCurrentFrame();
  const blink = f % 90 > 84 ? 0.15 : 1;
  const mouth = talking ? interpolate(Math.abs(Math.sin(f / 2.3)), [0, 1], [6, 20]) : 12;
  const look = pose === "think" ? -6 : 3;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      {[-38, 38].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={0} rx={22} ry={26 * blink} fill={C.white} />
          <circle cx={x + look} cy={4 - (pose === "think" ? 8 : 0)} r={10 * blink} fill={INK} />
          <circle cx={x + look + 4} cy={-1 - (pose === "think" ? 8 : 0)} r={3 * blink} fill={C.white} />
        </g>
      ))}
      {pose === "think" ? (
        <path d="M -60 -36 L -20 -30 M 20 -30 L 60 -40" stroke={dark ? C.white : INK} strokeWidth={7} strokeLinecap="round" />
      ) : (
        <path d="M -58 -36 Q -38 -48 -18 -38 M 18 -38 Q 38 -48 58 -36" fill="none" stroke={dark ? C.white : INK} strokeWidth={6} strokeLinecap="round" />
      )}
      <ellipse cx={-62} cy={34} rx={14} ry={8} fill="#FF8FA3" opacity={0.7} />
      <ellipse cx={62} cy={34} rx={14} ry={8} fill="#FF8FA3" opacity={0.7} />
      <path d={`M -24 ${30} Q 0 ${30 + mouth * 2} 24 30 Z`} fill={C.red} />
    </g>
  );
};

const Arms: React.FC<{ l: [number, number]; r: [number, number]; pose: Pose }> = ({ l, r, pose }) => {
  const f = useCurrentFrame();
  const wave = pose === "wave" ? Math.sin(f / 4) * 25 : 0;
  return (
    <>
      <g transform={`rotate(${-15 + wave} ${l[0]} ${l[1]})`}>
        <path d={`M ${l[0]} ${l[1]} Q ${l[0] - 40} ${l[1] - 20} ${l[0] - 55} ${l[1] - 70}`} fill="none" stroke={LIMB} strokeWidth={14} strokeLinecap="round" />
        <circle cx={l[0] - 55} cy={l[1] - 74} r={17} fill={C.white} />
      </g>
      <g>
        <path d={`M ${r[0]} ${r[1]} Q ${r[0] + 40} ${r[1] + 10} ${r[0] + 52} ${r[1] + 50}`} fill="none" stroke={LIMB} strokeWidth={14} strokeLinecap="round" />
        {pose === "wrench" && (
          <g transform={`translate(${r[0] + 52} ${r[1] + 50}) rotate(${30 + Math.sin(f / 6) * 8})`}>
            <rect x={-10} y={-95} width={20} height={95} rx={6} fill={C.metal} />
            <path d="M -26 -95 A 26 26 0 1 1 26 -95 L 10 -95 L 10 -114 L -10 -114 L -10 -95 Z" fill={C.metal} />
          </g>
        )}
        <circle cx={r[0] + 52} cy={r[1] + 52} r={17} fill={C.white} />
      </g>
    </>
  );
};

// ---------- Pistou, la mascotte unique ----------
const Piston: React.FC<P> = ({ pose, talking }) => (
  <>
    {/* bielle = jambe sauteuse */}
    <rect x={136} y={200} width={28} height={70} rx={10} fill={C.metal} />
    <circle cx={150} cy={278} r={30} fill={C.metal} />
    <circle cx={150} cy={278} r={12} fill={C.cream} />
    <Arms l={[70, 150]} r={[230, 150]} pose={pose} />
    {/* corps du piston */}
    <path d="M 66 70 Q 66 40 100 38 L 200 38 Q 234 40 234 70 L 234 200 Q 234 214 220 214 L 80 214 Q 66 214 66 200 Z" fill={C.orange} />
    {[62, 80].map((y) => <line key={y} x1={66} y1={y} x2={234} y2={y} stroke={INK} strokeWidth={6} />)}
    <rect x={66} y={96} width={168} height={6} fill={INK} opacity={0.25} />
    <path d="M 90 50 Q 110 44 130 48" stroke={C.white} strokeWidth={7} strokeLinecap="round" opacity={0.7} />
    <Face cx={150} cy={140} s={0.95} pose={pose} talking={talking} />
  </>
);

type P = { pose: Pose; talking: boolean };

export const Pistou: React.FC<{ size?: number; pose?: Pose; talking?: boolean; bob?: boolean }> = ({
  size = 300,
  pose = "wave",
  talking = true,
  bob = true,
}) => {
  const f = useCurrentFrame();
  const dy = bob ? Math.sin(f / 6) * 8 : 0;
  return (
    <svg width={size} height={size * (330 / 320)} viewBox="-20 -30 340 330" style={{ transform: `translateY(${dy}px)`, overflow: "visible" }}>
      <Piston pose={pose} talking={talking} />
    </svg>
  );
};
