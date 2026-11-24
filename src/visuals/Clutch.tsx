import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../brand";
import { BODY_FONT, TITLE_FONT } from "../fonts";

const C = BRAND.colors;
const INK = C.ink;
const S = BRAND.stroke;
const GREEN = "#2BB673";
const ENGINE_SPEED = 14; // degrés par image

export type ClutchState = "engaged" | "disengaged" | "slip" | "cycle";

// Période d'un cycle « tirer / relâcher » (state = "cycle"), utilisée aussi pour les bruitages.
export const CLUTCH_CYCLE = 100;

// p = levier tiré (0 relâché → 1 tiré à fond), ratio = vitesse roue / vitesse moteur, heat = échauffement.
export function clutchAt(state: ClutchState, f: number, fps: number) {
  if (state === "disengaged") {
    const p = spring({ frame: f - 10, fps, config: { damping: 15 } });
    return { p, ratio: 1 - Math.min(1, p), heat: 0 };
  }
  if (state === "slip") {
    const p =
      interpolate(
        spring({ frame: f - 15, fps, config: { damping: 20, mass: 2 } }),
        [0, 1],
        [1, 0.5],
      ) +
      Math.sin(f / 6) * 0.03;
    const ratio = interpolate(f, [25, 220], [0, 0.75], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const heat = interpolate(f, [35, 160], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { p, ratio, heat };
  }
  if (state === "cycle") {
    const t = (f % CLUTCH_CYCLE) / CLUTCH_CYCLE;
    const p = interpolate(t, [0, 0.15, 0.5, 0.7, 1], [0, 1, 1, 0, 0], {
      easing: (x) => x * x * (3 - 2 * x),
    });
    return { p, ratio: 1 - p, heat: 0 };
  }
  return { p: 0, ratio: 1, heat: 0 };
}

const Spinner: React.FC<{
  cx: number;
  cy: number;
  angle: number;
  color: string;
  label: string;
}> = ({ cx, cy, angle, color, label }) => (
  <g>
    <g transform={`rotate(${angle} ${cx} ${cy})`}>
      {Array.from({ length: 10 }, (_, i) => (
        <rect
          key={i}
          x={cx - 13}
          y={cy - 92}
          width={26}
          height={24}
          rx={6}
          fill={color}
          stroke={INK}
          strokeWidth={5}
          transform={`rotate(${i * 36} ${cx} ${cy})`}
        />
      ))}
      <circle
        cx={cx}
        cy={cy}
        r={74}
        fill={color}
        stroke={INK}
        strokeWidth={S}
      />
      <circle
        cx={cx}
        cy={cy}
        r={50}
        fill={C.cream}
        stroke={INK}
        strokeWidth={5}
      />
      <rect x={cx - 8} y={cy - 48} width={16} height={40} rx={6} fill={INK} />
      <circle cx={cx} cy={cy} r={14} fill={INK} />
    </g>
    <rect
      x={cx - 78}
      y={cy + 100}
      width={156}
      height={48}
      rx={14}
      fill={C.white}
      stroke={INK}
      strokeWidth={5}
    />
    <text
      x={cx}
      y={cy + 135}
      textAnchor="middle"
      fontFamily={TITLE_FONT}
      fontSize={32}
      fill={INK}
    >
      {label}
    </text>
  </g>
);

const Tag: React.FC<{
  x: number;
  y: number;
  text: string;
  tx: number;
  ty: number;
  show: number;
}> = ({ x, y, text, tx, ty, show }) => (
  <g opacity={show}>
    <line x1={x} y1={y} x2={tx} y2={ty} stroke={INK} strokeWidth={4} />
    <circle cx={tx} cy={ty} r={7} fill={INK} />
    <g transform={`translate(${x} ${y}) scale(${show})`}>
      <rect
        x={-text.length * 9 - 14}
        y={-24}
        width={text.length * 18 + 28}
        height={44}
        rx={12}
        fill={C.yellow}
        stroke={INK}
        strokeWidth={5}
      />
      <text
        y={9}
        textAnchor="middle"
        fontFamily={TITLE_FONT}
        fontSize={28}
        fill={INK}
      >
        {text}
      </text>
    </g>
  </g>
);

// Embrayage multidisque en coupe : cloche (moteur, orange), noix (boîte, bleu), disques garnis/lisses,
// plateau de pression et ressorts. En haut, la vitesse du moteur et celle de la roue.
export const Clutch: React.FC<{ state?: ClutchState; labels?: boolean }> = ({
  state = "engaged",
  labels,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, ratio, heat } = clutchAt(state, f, fps);
  // angle de la roue = somme des vitesses passées (pas de saut quand le ratio change)
  let wheelAngle = 0;
  for (let i = 0; i < f; i++)
    wheelAngle += ENGINE_SPEED * clutchAt(state, i, fps).ratio;
  const pp = Math.max(0, Math.min(1, p));
  const gap = pp * 14;
  const CY = 520;

  // pile de disques : garni (F) / lisse (S) en alternance
  const plates: { kind: "F" | "S"; x: number; w: number }[] = [];
  let x = 165;
  for (let i = 0; i < 8; i++) {
    const kind = i % 2 === 0 ? "F" : "S";
    const w = kind === "F" ? 18 : 12;
    plates.push({ kind, x, w });
    x += w + gap;
  }
  const ppX = x; // plateau de pression
  const retainer = 470;
  const show = labels
    ? spring({ frame: f - 20, fps, config: { damping: 14 } })
    : 0;
  const status =
    pp < 0.15
      ? { t: "EMBRAYÉ", c: GREEN }
      : pp > 0.85
        ? { t: "DÉBRAYÉ", c: C.red }
        : { t: "PATINAGE", c: C.yellow };
  const shake = heat > 0 ? Math.sin(f * 1.7) * 2 * heat : 0;

  const spring3d = (y: number) => {
    const len = retainer - (ppX + 26);
    const n = 7;
    let d = `M ${ppX + 26} ${y}`;
    for (let i = 1; i <= n; i++)
      d += ` L ${ppX + 26 + (len * (i - 0.5)) / n} ${y + (i % 2 ? -22 : 22)}`;
    return d + ` L ${retainer} ${y}`;
  };

  return (
    <svg
      viewBox="0 0 600 900"
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
    >
      {/* moteur → roue */}
      <Spinner
        cx={130}
        cy={130}
        angle={f * ENGINE_SPEED}
        color={C.orange}
        label="MOTEUR"
      />
      <Spinner
        cx={470}
        cy={130}
        angle={wheelAngle}
        color={C.sky}
        label="ROUE"
      />
      <g opacity={0.25 + 0.75 * ratio}>
        <path
          d="M 240 130 L 340 130"
          stroke={INK}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={ratio > 0.05 ? "1 26" : "0 999"}
          strokeDashoffset={-f * 3}
        />
        <path
          d="M 335 100 L 365 130 L 335 160"
          fill="none"
          stroke={INK}
          strokeWidth={12}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <text
        x={300}
        y={215}
        textAnchor="middle"
        fontFamily={TITLE_FONT}
        fontSize={34}
        fill={INK}
      >
        {Math.round(ratio * 100)} %
      </text>

      {/* coupe de l'embrayage */}
      <g transform={`translate(${shake} 0)`}>
        {/* arbre de boîte */}
        <rect
          x={30}
          y={CY - 18}
          width={540}
          height={36}
          rx={14}
          fill={C.grey}
          stroke={INK}
          strokeWidth={6}
        />
        {/* noix (côté boîte) */}
        <rect
          x={150}
          y={CY - 62}
          width={330}
          height={124}
          rx={18}
          fill={C.sky}
          stroke={INK}
          strokeWidth={S}
        />
        {/* cloche (côté moteur) */}
        <path
          d={`M 140 ${CY - 190} L 370 ${CY - 190} L 370 ${CY - 168} L 140 ${CY - 168} Z M 140 ${CY + 168} L 370 ${CY + 168} L 370 ${CY + 190} L 140 ${CY + 190} Z`}
          fill={C.orange}
          stroke={INK}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        <rect
          x={112}
          y={CY - 190}
          width={32}
          height={380}
          rx={10}
          fill={C.orange}
          stroke={INK}
          strokeWidth={S}
        />
        {/* pignon primaire de la cloche, entraîné par le moteur */}
        <g transform={`rotate(${f * 6} 70 ${CY - 120})`}>
          {Array.from({ length: 8 }, (_, i) => (
            <rect
              key={i}
              x={62}
              y={CY - 168}
              width={16}
              height={18}
              rx={4}
              fill={C.orange}
              stroke={INK}
              strokeWidth={4}
              transform={`rotate(${i * 45} 70 ${CY - 120})`}
            />
          ))}
          <circle
            cx={70}
            cy={CY - 120}
            r={34}
            fill={C.orange}
            stroke={INK}
            strokeWidth={6}
          />
          <circle cx={70} cy={CY - 120} r={9} fill={INK} />
        </g>
        {/* chaleur du patinage */}
        {heat > 0 && (
          <g opacity={heat * (0.55 + 0.25 * Math.sin(f / 3))}>
            <rect
              x={150}
              y={CY - 175}
              width={ppX - 140}
              height={350}
              rx={30}
              fill={C.red}
              opacity={0.35}
            />
            {[0, 1, 2].map((i) => {
              const k = (f * 0.03 + i / 3) % 1;
              const hx = 190 + i * 45;
              return (
                <path
                  key={i}
                  d={`M ${hx} ${CY - 200 - k * 60} q 12 -16 0 -32 q -12 -16 0 -32`}
                  fill="none"
                  stroke={C.red}
                  strokeWidth={6}
                  strokeLinecap="round"
                  opacity={1 - k}
                />
              );
            })}
          </g>
        )}
        {/* disques : garnis (liés à la cloche), lisses (liés à la noix) */}
        {plates.map((pl, i) =>
          pl.kind === "F" ? (
            <g key={i}>
              {[
                [CY - 172, CY - 66],
                [CY + 66, CY + 172],
              ].map(([a, b]) => (
                <g key={a}>
                  <rect
                    x={pl.x}
                    y={a}
                    width={pl.w}
                    height={b - a}
                    rx={5}
                    fill={heat > 0.5 ? "#F28C28" : C.yellow}
                    stroke={INK}
                    strokeWidth={5}
                  />
                  {[0.25, 0.5, 0.75].map((t) => (
                    <line
                      key={t}
                      x1={pl.x + 4}
                      x2={pl.x + pl.w - 4}
                      y1={a + (b - a) * t}
                      y2={a + (b - a) * t}
                      stroke={INK}
                      strokeWidth={3}
                      opacity={0.5}
                    />
                  ))}
                </g>
              ))}
            </g>
          ) : (
            <g key={i}>
              <rect
                x={pl.x}
                y={CY - 158}
                width={pl.w}
                height={96}
                rx={4}
                fill={C.metal}
                stroke={INK}
                strokeWidth={5}
              />
              <rect
                x={pl.x}
                y={CY + 62}
                width={pl.w}
                height={96}
                rx={4}
                fill={C.metal}
                stroke={INK}
                strokeWidth={5}
              />
            </g>
          ),
        )}
        {/* plateau de pression + ressorts + butée */}
        <rect
          x={ppX}
          y={CY - 175}
          width={26}
          height={350}
          rx={8}
          fill={C.grey}
          stroke={INK}
          strokeWidth={S}
        />
        {[CY - 120, CY + 120].map((y) => (
          <path
            key={y}
            d={spring3d(y)}
            fill="none"
            stroke={INK}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        <rect
          x={retainer}
          y={CY - 160}
          width={20}
          height={320}
          rx={8}
          fill={C.sky}
          stroke={INK}
          strokeWidth={6}
        />
        {/* tige de commande poussée par le levier */}
        <rect
          x={ppX + 26}
          y={CY - 9}
          width={570 - ppX - 26}
          height={18}
          rx={8}
          fill={C.white}
          stroke={INK}
          strokeWidth={4}
        />
        {pp > 0.2 && (
          <path d={`M ${ppX + 40} ${CY + 45} l 50 0 m -16 -16 l 16 16 l -16 16`} fill="none" stroke={C.red} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={pp} />
        )}
      </g>

      {/* étiquettes des pièces */}
      {labels && (
        <g>
          <Tag x={100} y={770} text="CLOCHE" tx={130} ty={CY + 185} show={show} />
          <Tag x={250} y={290} text="DISQUES" tx={230} ty={CY - 150} show={show} />
          <Tag x={490} y={770} text="RESSORTS" tx={440} ty={CY + 120} show={show} />
          <Tag x={295} y={850} text="NOIX (BOÎTE)" tx={300} ty={CY + 40} show={show} />
        </g>
      )}

      {/* levier + état */}
      {!labels && (
        <g>
          <g transform="translate(30 740)">
            <rect x={0} y={20} width={210} height={44} rx={20} fill={INK} />
            <rect
              x={150}
              y={8}
              width={34}
              height={68}
              rx={10}
              fill={C.grey}
              stroke={INK}
              strokeWidth={5}
            />
            <g
              transform={`rotate(${interpolate(pp, [0, 1], [0, -14])} 175 70)`}
            >
              <path
                d="M 175 70 L 20 112"
                stroke={C.metal}
                strokeWidth={22}
                strokeLinecap="round"
              />
              <path
                d="M 175 70 L 20 112"
                stroke={INK}
                strokeWidth={4}
                strokeLinecap="round"
                fill="none"
                opacity={0.6}
              />
            </g>
            <text
              x={105}
              y={160}
              textAnchor="middle"
              fontFamily={BODY_FONT}
              fontWeight={900}
              fontSize={28}
              fill={INK}
            >
              LEVIER
            </text>
          </g>
          <g transform={`translate(430 800) rotate(-3)`}>
            <rect
              x={-150}
              y={-46}
              width={300}
              height={92}
              rx={22}
              fill={status.c}
              stroke={INK}
              strokeWidth={S}
            />
            <text
              y={18}
              textAnchor="middle"
              fontFamily={TITLE_FONT}
              fontSize={50}
              fill={status.c === C.yellow ? INK : C.white}
            >
              {status.t}
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};

// Astuce : la garde du levier d'embrayage (petit jeu libre avant que le levier ne durcisse).
export const ClutchLever: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // le levier fait sa garde (0 → 1), marque une pause, puis revient
  const t = f % 90;
  const play = interpolate(t, [10, 30, 60, 80], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ok = spring({ frame: f - 40, fps, config: { damping: 12 } });
  const ang = -play * 6;
  return (
    <svg
      viewBox="0 0 600 900"
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
    >
      {/* guidon + poignée */}
      <rect
        x={20}
        y={300}
        width={560}
        height={70}
        rx={32}
        fill={C.grey}
        stroke={INK}
        strokeWidth={S}
      />
      <rect x={20} y={290} width={250} height={90} rx={40} fill={INK} />
      {[60, 100, 140, 180, 220].map((x) => (
        <line
          key={x}
          x1={x}
          y1={298}
          x2={x}
          y2={372}
          stroke={C.grey}
          strokeWidth={6}
          opacity={0.6}
        />
      ))}
      {/* support de levier + molette de réglage */}
      <rect
        x={330}
        y={270}
        width={90}
        height={130}
        rx={20}
        fill={C.metal}
        stroke={INK}
        strokeWidth={S}
      />
      <g transform={`rotate(${f * 4} 470 300)`}>
        <circle
          cx={470}
          cy={300}
          r={36}
          fill={C.orange}
          stroke={INK}
          strokeWidth={6}
        />
        {[0, 60, 120].map((a) => (
          <rect
            key={a}
            x={464}
            y={266}
            width={12}
            height={68}
            rx={5}
            fill={INK}
            transform={`rotate(${a} 470 300)`}
          />
        ))}
      </g>
      <text
        x={470}
        y={240}
        textAnchor="middle"
        fontFamily={BODY_FONT}
        fontWeight={900}
        fontSize={28}
        fill={INK}
      >
        MOLETTE
      </text>
      {/* câble */}
      <path
        d="M 420 360 Q 520 420 560 560"
        fill="none"
        stroke={INK}
        strokeWidth={12}
        strokeLinecap="round"
      />
      {/* levier */}
      <g transform={`rotate(${ang} 380 400)`}>
        <path
          d="M 380 400 L 60 500"
          stroke={C.metal}
          strokeWidth={40}
          strokeLinecap="round"
        />
        <path
          d="M 380 400 L 60 500"
          stroke={INK}
          strokeWidth={6}
          strokeLinecap="round"
          fill="none"
          opacity={0.5}
        />
        <circle
          cx={380}
          cy={400}
          r={20}
          fill={C.grey}
          stroke={INK}
          strokeWidth={6}
        />
      </g>
      {/* zone de garde */}
      
      <g transform="translate(40 560)">
        <path
          d="M 30 0 L 30 60"
          stroke={C.red}
          strokeWidth={8}
          strokeLinecap="round"
        />
        <path
          d="M 14 16 L 30 0 L 46 16 M 14 44 L 30 60 L 46 44"
          fill="none"
          stroke={C.red}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x={70}
          y={-6}
          width={200}
          height={72}
          rx={18}
          fill={C.yellow}
          stroke={INK}
          strokeWidth={6}
        />
        <text
          x={170}
          y={44}
          textAnchor="middle"
          fontFamily={TITLE_FONT}
          fontSize={44}
          fill={INK}
        >
          GARDE
        </text>
      </g>
      <text
        x={300}
        y={720}
        textAnchor="middle"
        fontFamily={BODY_FONT}
        fontWeight={900}
        fontSize={34}
        fill={INK}
      >
        Valeur : voir ton manuel
      </text>
      <g transform={`translate(470 600) scale(${ok})`}>
        <circle r={52} fill={GREEN} stroke={INK} strokeWidth={S} />
        <path
          d="M -24 0 L -6 18 L 26 -16"
          fill="none"
          stroke={C.white}
          strokeWidth={13}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
