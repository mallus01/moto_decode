import { interpolate, useCurrentFrame } from "remotion";
import { BRAND } from "../brand";
import { BODY_FONT, TITLE_FONT } from "../fonts";

const C = BRAND.colors;
const S = BRAND.stroke;

type Stroke = "admission" | "compression" | "combustion" | "echappement" | "cycle";

const STROKES: { key: Exclude<Stroke, "cycle">; label: string; start: number }[] = [
  { key: "admission", label: "1 · ADMISSION", start: 0 },
  { key: "compression", label: "2 · COMPRESSION", start: 180 },
  { key: "combustion", label: "3 · COMBUSTION", start: 360 },
  { key: "echappement", label: "4 · ÉCHAPPEMENT", start: 540 },
];

// Géométrie (viewBox 600x900)
const CX = 300;
const CY = 700; // centre du vilebrequin
const R = 75; // rayon de manivelle
const L = 230; // longueur de bielle
const CHAMBER_TOP = 270;
const PIN_OFFSET = 55; // haut du piston -> axe de piston

const pinY = (deg: number) => {
  const t = (deg * Math.PI) / 180;
  return CY - (R * Math.cos(t) + Math.sqrt(L * L - R * R * Math.sin(t) ** 2));
};

/**
 * Coupe cartoon d'un moteur 4 temps monocylindre.
 * - stroke: un temps précis (boucle sur ce demi-tour) ou "cycle" (les 4 temps).
 * - speed: degrés de vilebrequin par image.
 * - labels: affiche le nom des pièces.
 * - highlight: met une pièce en évidence.
 */
export const Engine4T: React.FC<{ stroke?: Stroke; speed?: number; labels?: boolean; highlight?: "crank" | "valves" | "spark" | "piston" }> = ({
  stroke = "cycle",
  speed,
  labels = false,
  highlight,
}) => {
  const f = useCurrentFrame();
  const spd = speed ?? (stroke === "cycle" ? 8 : 2.6);
  let deg: number;
  if (stroke === "cycle") {
    deg = (f * spd) % 720;
  } else {
    const s = STROKES.find((x) => x.key === stroke)!;
    // un demi-tour, petite pause en fin de course pour bien lire
    const local = (f * spd) % 220;
    deg = s.start + Math.min(179.5, local);
  }
  const phase = STROKES[Math.floor(deg / 180) % 4];
  const inPhase = (deg % 180) / 180; // 0..1

  const pY = pinY(deg);
  const pistonTop = pY - PIN_OFFSET;
  const crankX = CX + R * Math.sin((deg * Math.PI) / 180);
  const crankY = CY - R * Math.cos((deg * Math.PI) / 180);

  const intakeLift = deg < 180 ? Math.sin((deg * Math.PI) / 180) * 32 : 0;
  const exhaustLift = deg >= 540 ? Math.sin(((deg - 540) * Math.PI) / 180) * 32 : 0;

  // Couleur des gaz dans le cylindre
  let gas = C.sky;
  let gasOpacity = 0.45;
  if (phase.key === "compression") gasOpacity = 0.45 + inPhase * 0.4;
  if (phase.key === "combustion") {
    gas = inPhase < 0.25 ? C.yellow : C.orange;
    gasOpacity = interpolate(inPhase, [0, 0.15, 1], [1, 0.95, 0.55]);
  }
  if (phase.key === "echappement") {
    gas = C.grey;
    gasOpacity = interpolate(inPhase, [0, 1], [0.7, 0.25]);
  }
  const spark = phase.key === "combustion" && inPhase < 0.18;
  const pulse = 0.5 + 0.5 * Math.sin(f / 4);

  // Particules : air/essence qui entre, fumée qui sort
  const particles = Array.from({ length: 6 }, (_, i) => ((f * 0.04 + i / 6) % 1));

  return (
    <svg viewBox="0 0 600 900" width="100%" height="100%" style={{ overflow: "visible" }}>
      {/* --- carter --- */}
      <circle cx={CX} cy={CY} r={135} fill={C.white} stroke={C.ink} strokeWidth={S} />
      {/* --- cylindre --- */}
      <rect x={180} y={CHAMBER_TOP - 10} width={240} height={420} rx={14} fill={C.metal} stroke={C.ink} strokeWidth={S} />
      <rect x={200} y={CHAMBER_TOP} width={200} height={380} fill={C.white} />
      {/* ailettes de refroidissement */}
      {[300, 350, 400, 450, 500].map((y) => (
        <g key={y}>
          <rect x={140} y={y} width={44} height={18} rx={6} fill={C.metal} stroke={C.ink} strokeWidth={5} />
          <rect x={416} y={y} width={44} height={18} rx={6} fill={C.metal} stroke={C.ink} strokeWidth={5} />
        </g>
      ))}
      {/* gaz */}
      <rect x={200} y={CHAMBER_TOP} width={200} height={Math.max(0, pistonTop - CHAMBER_TOP)} fill={gas} opacity={gasOpacity} />
      {phase.key === "compression" &&
        [0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={225 + i * 38} cy={CHAMBER_TOP + (pistonTop - CHAMBER_TOP) * (0.3 + 0.4 * ((i * 37) % 10) / 10)} r={6 + inPhase * 5} fill={C.sky} stroke={C.ink} strokeWidth={3} />
        ))}

      {/* --- culasse + conduits --- */}
      <path d={`M 150 ${CHAMBER_TOP - 10} L 150 150 L 450 150 L 450 ${CHAMBER_TOP - 10} Z`} fill={C.metal} stroke={C.ink} strokeWidth={S} strokeLinejoin="round" />
      {/* conduit d'admission (gauche) */}
      <path d={`M 40 175 L 215 175 L 265 ${CHAMBER_TOP} L 225 ${CHAMBER_TOP} L 195 215 L 40 215 Z`} fill={phase.key === "admission" ? C.sky : C.white} opacity={phase.key === "admission" ? 0.9 : 1} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      {/* conduit d'échappement (droite) */}
      <path d={`M 560 175 L 385 175 L 335 ${CHAMBER_TOP} L 375 ${CHAMBER_TOP} L 405 215 L 560 215 Z`} fill={phase.key === "echappement" ? C.grey : C.white} opacity={phase.key === "echappement" ? 0.9 : 1} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      {phase.key === "admission" &&
        particles.map((p, i) => <circle key={i} cx={50 + p * 190} cy={195 + p * p * 60} r={8} fill={C.white} stroke={C.ink} strokeWidth={3} />)}
      {phase.key === "echappement" &&
        particles.map((p, i) => <circle key={i} cx={360 + p * 220} cy={240 - p * 45 + Math.sin(p * 12) * 6} r={10 + p * 12} fill={C.grey} stroke={C.ink} strokeWidth={3} opacity={1 - p * 0.7} />)}

      {/* soupapes */}
      {[
        { x: 245, lift: intakeLift, color: C.sky },
        { x: 355, lift: exhaustLift, color: C.grey },
      ].map((v) => (
        <g key={v.x} transform={`translate(0 ${v.lift})`}>
          <rect x={v.x - 7} y={110} width={14} height={CHAMBER_TOP - 118} fill={C.white} stroke={C.ink} strokeWidth={5} />
          <path d={`M ${v.x - 38} ${CHAMBER_TOP} L ${v.x - 10} ${CHAMBER_TOP - 18} L ${v.x + 10} ${CHAMBER_TOP - 18} L ${v.x + 38} ${CHAMBER_TOP} Z`} fill={C.white} stroke={highlight === "valves" ? C.red : C.ink} strokeWidth={highlight === "valves" ? 8 + pulse * 4 : 6} strokeLinejoin="round" />
          <rect x={v.x - 22} y={100} width={44} height={16} rx={5} fill={v.color} stroke={C.ink} strokeWidth={5} />
        </g>
      ))}

      {/* bougie */}
      <g stroke={C.ink} strokeWidth={6} strokeLinejoin="round">
        <rect x={286} y={CHAMBER_TOP - 40} width={28} height={40} fill={C.metal} />
        <rect x={272} y={CHAMBER_TOP - 85} width={56} height={46} fill={C.grey} />
        <rect x={282} y={50} width={36} height={CHAMBER_TOP - 135} rx={10} fill={C.white} />
        <rect x={290} y={28} width={20} height={26} rx={5} fill={C.metal} />
      </g>
      {(spark || highlight === "spark") && (
        <g transform={`translate(300 ${CHAMBER_TOP + 8}) scale(${spark ? 1.2 : 0.6 + pulse * 0.3})`}>
          <path d="M 0 -30 L 9 -9 L 32 -12 L 13 4 L 26 26 L 0 12 L -26 26 L -13 4 L -32 -12 L -9 -9 Z" fill={C.yellow} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        </g>
      )}
      {phase.key === "combustion" && inPhase < 0.5 && (
        <g opacity={1 - inPhase * 2}>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <line key={a} x1={300} y1={CHAMBER_TOP + 30} x2={300 + Math.cos((a * Math.PI) / 180) * (40 + inPhase * 120)} y2={CHAMBER_TOP + 30 + Math.sin((a * Math.PI) / 180) * (20 + inPhase * 50)} stroke={C.red} strokeWidth={8} strokeLinecap="round" />
          ))}
        </g>
      )}

      {/* --- bielle --- */}
      <line x1={CX} y1={pY} x2={crankX} y2={crankY} stroke={C.ink} strokeWidth={34} strokeLinecap="round" />
      <line x1={CX} y1={pY} x2={crankX} y2={crankY} stroke={C.metal} strokeWidth={20} strokeLinecap="round" />

      {/* --- piston --- */}
      <g stroke={highlight === "piston" ? C.red : C.ink} strokeWidth={highlight === "piston" ? S + pulse * 4 : S}>
        <rect x={203} y={pistonTop} width={194} height={120} rx={10} fill={C.orange} />
      </g>
      <line x1={203} y1={pistonTop + 20} x2={397} y2={pistonTop + 20} stroke={C.ink} strokeWidth={5} />
      <line x1={203} y1={pistonTop + 36} x2={397} y2={pistonTop + 36} stroke={C.ink} strokeWidth={5} />
      <circle cx={CX} cy={pY} r={16} fill={C.yellow} stroke={C.ink} strokeWidth={6} />

      {/* --- vilebrequin --- */}
      <g transform={`rotate(${deg} ${CX} ${CY})`}>
        <path d={`M ${CX - 95} ${CY + 30} A 100 100 0 0 0 ${CX + 95} ${CY + 30} L ${CX + 40} ${CY - 20} L ${CX - 40} ${CY - 20} Z`} fill={C.grey} stroke={highlight === "crank" ? C.red : C.ink} strokeWidth={highlight === "crank" ? S + pulse * 5 : S} strokeLinejoin="round" />
        <rect x={CX - 26} y={CY - R - 20} width={52} height={R + 30} rx={20} fill={C.metal} stroke={C.ink} strokeWidth={6} />
      </g>
      <circle cx={CX} cy={CY} r={22} fill={C.yellow} stroke={C.ink} strokeWidth={6} />
      <circle cx={crankX} cy={crankY} r={14} fill={C.yellow} stroke={C.ink} strokeWidth={5} />
      {highlight === "crank" && (
        <path d={`M ${CX + 150} ${CY - 40} A 155 155 0 0 1 ${CX + 60} ${CY + 145}`} fill="none" stroke={C.red} strokeWidth={12} strokeLinecap="round" markerEnd="url(#arrow)" />
      )}
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={C.red} />
        </marker>
      </defs>

      {labels && (
        <g fontFamily={BODY_FONT} fontWeight={900} fontSize={30} fill={C.ink}>
          <Tag x={0} y={250} text="Admission" />
          <Tag x={400} y={250} text="Échappement" />
          <Tag x={330} y={40} text="Bougie" />
          <Tag x={430} y={pistonTop + 70} text="Piston" />
          <Tag x={40} y={CY - 150} text="Bielle" />
          <Tag x={445} y={CY + 40} text="Vilebrequin" />
        </g>
      )}

      {/* badge du temps en cours */}
      <g transform="translate(300 875)">
        <rect x={-210} y={-44} width={420} height={80} rx={40} fill={phase.key === "combustion" ? C.red : C.ink} />
        <text textAnchor="middle" y={14} fontFamily={TITLE_FONT} fontSize={46} fill={C.white} letterSpacing={2}>
          {phase.label}
        </text>
      </g>
    </svg>
  );
};

const Tag: React.FC<{ x: number; y: number; text: string }> = ({ x, y, text }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-8} y={-30} width={text.length * 17 + 20} height={42} rx={12} fill={BRAND.colors.yellow} stroke={BRAND.colors.ink} strokeWidth={4} />
    <text x={2} y={0}>{text}</text>
  </g>
);
