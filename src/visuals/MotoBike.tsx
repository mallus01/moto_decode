import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../brand";
import { TITLE_FONT } from "../fonts";

const C = BRAND.colors;
const INK = C.ink;
const S = BRAND.stroke;
const TIRE = "#2B2D42";

export type BikeFocus = "engine" | "spark" | "brake" | "tire" | "chain" | "none";

// Position (viewBox 1000x640) de chaque pièce mise en avant.
const FOCUS: Record<Exclude<BikeFocus, "none">, { x: number; y: number; r: number }> = {
  engine: { x: 470, y: 370, r: 120 },
  spark: { x: 492, y: 268, r: 60 },
  brake: { x: 790, y: 455, r: 85 },
  tire: { x: 230, y: 455, r: 150 },
  chain: { x: 335, y: 455, r: 115 },
};

const Wheel: React.FC<{ cx: number; cy: number; spin: number; disc?: boolean }> = ({ cx, cy, spin, disc }) => (
  <g>
    <circle cx={cx} cy={cy} r={125} fill={TIRE} stroke={INK} strokeWidth={S} />
    <g transform={`rotate(${spin} ${cx} ${cy})`}>
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={cx - 9} y={cy - 128} width={18} height={14} rx={4} fill="#3D405B" transform={`rotate(${i * 18} ${cx} ${cy})`} />
      ))}
    </g>
    <circle cx={cx} cy={cy} r={92} fill={C.cream} stroke={INK} strokeWidth={6} />
    <circle cx={cx} cy={cy} r={84} fill="none" stroke={C.orange} strokeWidth={12} />
    <g transform={`rotate(${spin} ${cx} ${cy})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <rect key={a} x={cx - 7} y={cy - 80} width={14} height={80} rx={6} fill={C.orange} stroke={INK} strokeWidth={4} transform={`rotate(${a} ${cx} ${cy})`} />
      ))}
    </g>
    {disc && (
      <g>
        <circle cx={cx} cy={cy} r={56} fill={C.metal} stroke={INK} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * 45 * Math.PI) / 180;
          return <circle key={i} cx={cx + Math.cos(a) * 42} cy={cy + Math.sin(a) * 42} r={5} fill={C.grey} />;
        })}
        <path d={`M ${cx + 20} ${cy - 66} Q ${cx + 62} ${cy - 60} ${cx + 66} ${cy - 18} L ${cx + 46} ${cy - 14} Q ${cx + 44} ${cy - 42} ${cx + 18} ${cy - 46} Z`} fill={C.red} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      </g>
    )}
    <circle cx={cx} cy={cy} r={16} fill={C.yellow} stroke={INK} strokeWidth={5} />
  </g>
);

/**
 * Moto cartoon vue de profil, avec une pièce mise en avant (projecteur + anneau qui pulse).
 * Sert d'image d'accroche : on montre où se trouve la pièce dont parle l'épisode.
 * - focus : engine | spark | brake | tire | chain | none
 * - boom : petites explosions "BOUM" au moteur (sujet moteur)
 * - label : étiquette affichée près de la pièce
 */
export const MotoBike: React.FC<{ focus?: BikeFocus; boom?: boolean; label?: string }> = ({ focus = "none", boom = false, label }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spin = f * 3;
  const vib = boom ? Math.sin(f * 2.1) * 2 : 0; // le moteur fait vibrer la moto
  const spot = focus !== "none" ? FOCUS[focus] : null;
  const spotIn = spring({ frame: f - 12, fps, config: { damping: 16 } });
  const pulse = 1 + Math.sin(f / 4) * 0.06;
  const booms = boom ? [0, 1, 2].map((i) => ((f + i * 11) % 33) / 33) : [];

  return (
    <svg viewBox="90 80 840 530" width="100%" height="100%" style={{ overflow: "visible" }}>
      {/* sol + vitesse */}
      <ellipse cx={510} cy={585} rx={440} ry={22} fill={INK} opacity={0.15} />
      {[0, 1, 2].map((i) => {
        const x = 960 - (((f * 18 + i * 330) % 1000));
        return <line key={i} x1={x} y1={520 + i * 22} x2={x + 120} y2={520 + i * 22} stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={0.25} />;
      })}
      <g transform={`translate(0 ${vib})`}>
        {/* fourche + guidon */}
        <line x1={655} y1={170} x2={790} y2={455} stroke={C.metal} strokeWidth={26} strokeLinecap="round" />
        <line x1={655} y1={170} x2={790} y2={455} stroke={INK} strokeWidth={26} strokeLinecap="round" opacity={0} />
        <path d="M 655 170 L 790 455" stroke={INK} strokeWidth={6} fill="none" />
        <path d="M 640 150 L 600 120 L 570 122" stroke={INK} strokeWidth={14} strokeLinecap="round" fill="none" />
        <rect x={548} y={110} width={40} height={22} rx={10} fill={INK} />
        {/* bras oscillant + chaîne */}
        <path d="M 440 430 L 230 455" stroke={C.grey} strokeWidth={28} strokeLinecap="round" />
        <path d="M 440 410 L 230 425 M 440 452 L 230 485" stroke={INK} strokeWidth={6} strokeDasharray="10 7" strokeDashoffset={-f * 2} fill="none" />
        <circle cx={440} cy={430} r={24} fill={C.grey} stroke={INK} strokeWidth={5} />
        {/* roues */}
        <Wheel cx={230} cy={455} spin={spin} />
        <Wheel cx={790} cy={455} spin={spin} disc />
        {/* échappement */}
        <path d="M 520 420 Q 470 500 330 505 L 140 470" stroke={C.metal} strokeWidth={26} strokeLinecap="round" fill="none" />
        <path d="M 520 420 Q 470 500 330 505 L 140 470" stroke={INK} strokeWidth={5} fill="none" opacity={0.5} />
        <rect x={110} y={452} width={110} height={40} rx={16} fill={C.metal} stroke={INK} strokeWidth={6} transform="rotate(10 165 472)" />
        {/* moteur */}
        <path d="M 380 320 L 560 320 L 575 430 L 395 440 Z" fill={C.grey} stroke={INK} strokeWidth={S} strokeLinejoin="round" />
        <g transform="rotate(-12 480 290)">
          <rect x={440} y={230} width={90} height={100} rx={8} fill={C.metal} stroke={INK} strokeWidth={6} />
          {[248, 268, 288, 308].map((y) => (
            <rect key={y} x={428} y={y} width={114} height={10} rx={4} fill={C.metal} stroke={INK} strokeWidth={4} />
          ))}
          <rect x={478} y={208} width={16} height={26} rx={4} fill={C.white} stroke={INK} strokeWidth={4} />
        </g>
        <circle cx={470} cy={395} r={30} fill={C.metal} stroke={INK} strokeWidth={6} />
        {/* cadre + réservoir + selle */}
        <path d="M 655 170 L 560 330 M 655 175 L 430 230 L 300 260" stroke={C.ink} strokeWidth={16} strokeLinecap="round" fill="none" />
        <path d="M 440 215 Q 470 165 560 165 Q 640 168 655 205 L 640 250 Q 540 262 450 250 Z" fill={C.orange} stroke={INK} strokeWidth={S} strokeLinejoin="round" />
        <path d="M 480 190 Q 520 178 570 182" stroke={C.white} strokeWidth={9} strokeLinecap="round" opacity={0.7} fill="none" />
        <path d="M 250 225 Q 330 205 450 222 L 445 252 Q 340 250 245 258 Z" fill={INK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 250 228 L 170 215 L 160 250 L 270 262 Z" fill={C.orange} stroke={INK} strokeWidth={S} strokeLinejoin="round" />
        <circle cx={168} cy={238} r={10} fill={C.red} stroke={INK} strokeWidth={4} />
        {/* phare + garde-boue */}
        <circle cx={700} cy={215} r={34} fill={C.yellow} stroke={INK} strokeWidth={S} />
        <path d="M 710 350 Q 790 300 870 350" stroke={C.orange} strokeWidth={18} strokeLinecap="round" fill="none" />
        <path d="M 710 350 Q 790 300 870 350" stroke={INK} strokeWidth={5} fill="none" />
        {/* BOUM au moteur */}
        {booms.map((p, i) => (
          <g key={i} transform={`translate(${470 + (i - 1) * 110} ${250 - p * 110}) scale(${interpolate(p, [0, 0.2, 1], [0.3, 1.7, 1.3])})`} opacity={interpolate(p, [0, 0.7, 1], [1, 1, 0])}>
            <path d="M 0 -42 L 12 -14 L 44 -18 L 18 4 L 34 36 L 0 18 L -34 36 L -18 4 L -44 -18 L -12 -14 Z" fill={i === 1 ? C.yellow : C.orange} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <text y={8} textAnchor="middle" fontFamily={TITLE_FONT} fontSize={22} fill={INK}>BOUM</text>
          </g>
        ))}
      </g>
      {/* projecteur sur la pièce */}
      {spot && (
        <g opacity={spotIn}>
          <circle cx={spot.x} cy={spot.y + vib} r={spot.r * pulse} fill="none" stroke={C.yellow} strokeWidth={12} />
          <circle cx={spot.x} cy={spot.y + vib} r={spot.r * pulse + 14} fill="none" stroke={INK} strokeWidth={4} strokeDasharray="14 10" strokeDashoffset={f * 2} />
          {label && (
            <g transform={`translate(${Math.min(820, spot.x + spot.r + 20)} ${Math.max(60, spot.y - spot.r - 10)}) scale(${spotIn})`}>
              <rect x={-110} y={-42} width={220} height={66} rx={18} fill={C.yellow} stroke={INK} strokeWidth={6} />
              <text y={6} textAnchor="middle" fontFamily={TITLE_FONT} fontSize={40} fill={INK}>{label}</text>
            </g>
          )}
        </g>
      )}
    </svg>
  );
};
