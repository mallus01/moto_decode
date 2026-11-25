import { interpolate, useCurrentFrame } from "remotion";
import { BRAND } from "../brand";

const C = BRAND.colors;
const INK = C.ink;
const TIRE = C.ink;
const LIMB = C.metal; // bras/jambes : acier clair, visible sur le fond pétrole

export type MascotId = "piston" | "bougie" | "pneu" | "frein" | "pignon";
export type Pose = "wave" | "wrench" | "think";

export const MASCOTS: Record<MascotId, { name: string; part: string }> = {
  piston: { name: "Pistou", part: "le piston" },
  bougie: { name: "Zap", part: "la bougie d'allumage" },
  pneu: { name: "Gomme", part: "le pneu" },
  frein: { name: "Disco", part: "le disque de frein" },
  pignon: { name: "Maillon", part: "le pignon et la chaîne" },
};

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

const Feet: React.FC<{ y: number; spread?: number }> = ({ y, spread = 40 }) => (
  <>
    {[-spread, spread].map((x) => (
      <ellipse key={x} cx={150 + x} cy={y} rx={30} ry={14} fill={C.grey} />
    ))}
  </>
);

// ---------- les 5 mascottes ----------
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

const Bougie: React.FC<P> = ({ pose, talking }) => {
  const f = useCurrentFrame();
  const sparkOn = Math.floor(f / 5) % 3 !== 2;
  return (
    <>
      {/* étincelle sur la tête */}
      {sparkOn && (
        <path transform="translate(150 6) scale(0.9)" d="M 0 -30 L 9 -9 L 32 -12 L 13 4 L 26 26 L 0 12 L -26 26 L -13 4 L -32 -12 L -9 -9 Z" fill={C.yellow} />
      )}
      <rect x={132} y={22} width={36} height={30} rx={8} fill={C.metal} />
      <Arms l={[90, 200]} r={[210, 200]} pose={pose} />
      {/* filetage + électrode = jambes */}
      <rect x={118} y={226} width={64} height={48} fill={C.metal} />
      {[236, 250, 264].map((y) => <line key={y} x1={118} y1={y} x2={182} y2={y - 8} stroke={INK} strokeWidth={4} />)}
      <path d="M 150 274 L 150 296 L 176 296" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
      {/* écrou hexagonal */}
      <path d="M 84 184 L 104 168 L 196 168 L 216 184 L 216 214 L 196 230 L 104 230 L 84 214 Z" fill={C.grey} />
      {/* isolant céramique */}
      <path d="M 104 168 L 104 70 Q 104 48 130 48 L 170 48 Q 196 48 196 70 L 196 168 Z" fill={C.white} />
      <path d="M 104 154 L 196 154" stroke={INK} strokeWidth={5} opacity={0.3} />
      <Face cx={150} cy={104} s={0.72} pose={pose} talking={talking} />
    </>
  );
};

const Pneu: React.FC<P> = ({ pose, talking }) => {
  const f = useCurrentFrame();
  const rot = Math.sin(f / 10) * 8;
  return (
    <>
      <Arms l={[45, 160]} r={[255, 160]} pose={pose} />
      <Feet y={290} spread={55} />
      <g transform={`rotate(${rot} 150 160)`}>
        <circle cx={150} cy={160} r={125} fill={TIRE} />
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={i} x={140} y={30} width={20} height={20} rx={4} fill="#24465E" transform={`rotate(${i * 22.5} 150 160)`} />
        ))}
        <circle cx={150} cy={160} r={86} fill={C.orange} />
      </g>
      <circle cx={150} cy={160} r={70} fill={C.metal} />
      <Face cx={150} cy={150} s={0.72} pose={pose} talking={talking} />
    </>
  );
};

const Frein: React.FC<P> = ({ pose, talking }) => (
  <>
    <Arms l={[45, 170]} r={[255, 170]} pose={pose} />
    <Feet y={292} spread={50} />
    <circle cx={150} cy={170} r={120} fill={C.metal} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * 30 * Math.PI) / 180;
      return <circle key={i} cx={150 + Math.cos(a) * 100} cy={170 + Math.sin(a) * 100} r={8} fill={C.grey} />;
    })}
    <circle cx={150} cy={170} r={82} fill={C.yellow} />
    {/* étrier = béret rouge */}
    <path d="M 70 70 Q 150 -10 230 70 L 210 92 Q 150 40 90 92 Z" fill={C.red} />
    <rect x={136} y={20} width={28} height={18} rx={6} fill={C.red} />
    <Face cx={150} cy={165} s={0.8} pose={pose} talking={talking} />
  </>
);

const Pignon: React.FC<P> = ({ pose, talking }) => {
  const f = useCurrentFrame();
  return (
    <>
      <Arms l={[40, 160]} r={[260, 160]} pose={pose} />
      <Feet y={292} spread={50} />
      <g transform={`rotate(${f * 1.2} 150 160)`}>
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d="M 136 44 L 142 22 L 158 22 L 164 44 Z" fill={C.grey} transform={`rotate(${(i * 360) / 14} 150 160)`} />
        ))}
        <circle cx={150} cy={160} r={118} fill={C.grey} />
      </g>
      <circle cx={150} cy={160} r={92} fill={C.sky} />
      {/* chaîne en écharpe */}
      {Array.from({ length: 7 }, (_, i) => {
        const a = ((200 + i * 23) * Math.PI) / 180;
        const x = 150 - Math.cos(a) * 96;
        const y = 175 - Math.sin(a) * 70;
        return <rect key={i} x={x - 17} y={y - 10} width={34} height={20} rx={10} fill={i % 2 ? C.ink : C.yellow} transform={`rotate(${(i - 3) * 18} ${x} ${y})`} />;
      })}
      <Face cx={150} cy={140} s={0.78} pose={pose} talking={talking} />
    </>
  );
};

type P = { pose: Pose; talking: boolean };
const BODIES: Record<MascotId, React.FC<P>> = { piston: Piston, bougie: Bougie, pneu: Pneu, frein: Frein, pignon: Pignon };

export const PartMascot: React.FC<{ id?: MascotId; size?: number; pose?: Pose; talking?: boolean; bob?: boolean }> = ({
  id = "piston",
  size = 300,
  pose = "wave",
  talking = true,
  bob = true,
}) => {
  const f = useCurrentFrame();
  const Body = BODIES[id] ?? Piston;
  const dy = bob ? Math.sin(f / 6) * 8 : 0;
  return (
    <svg width={size} height={size * (330 / 320)} viewBox="-20 -30 340 330" style={{ transform: `translateY(${dy}px)`, overflow: "visible" }}>
      <Body pose={pose} talking={talking} />
    </svg>
  );
};
