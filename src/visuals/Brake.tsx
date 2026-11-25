import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../brand";
import { BODY_FONT, TITLE_FONT } from "../fonts";

const C = BRAND.colors;
const FLUID = C.yellow;
const PAD = "#4A3B2F"; // garniture des plaquettes
const DISC_SPEED = 12; // degrés par image, frein relâché

export type BrakeMode = "parts" | "squeeze" | "heat";

// Période d'un coup de frein en mode "squeeze" (sert aussi aux bruitages).
export const BRAKE_CYCLE = 90;

// p = pression sur le levier (0 → 1)
function pressAt(mode: BrakeMode, f: number) {
  if (mode === "heat")
    return interpolate(f, [5, 20], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  if (mode === "squeeze") {
    const t = (f % BRAKE_CYCLE) / BRAKE_CYCLE;
    return interpolate(t, [0, 0.15, 0.6, 0.75, 1], [0, 1, 1, 0, 0], {
      easing: (x) => x * x * (3 - 2 * x),
    });
  }
  return 0.5 + 0.5 * Math.sin(f / 14);
}

const Tag: React.FC<{
  x: number;
  y: number;
  text: string;
  tx: number;
  ty: number;
  show: number;
}> = ({ x, y, text, tx, ty, show }) => (
  <g opacity={show}>
    <line x1={x} y1={y} x2={tx} y2={ty} stroke={C.text} strokeWidth={4} />
    <circle cx={tx} cy={ty} r={7} fill={C.text} />
    <g transform={`translate(${x} ${y}) scale(${show})`}>
      <rect
        x={-text.length * 9.5 - 14}
        y={-25}
        width={text.length * 19 + 28}
        height={46}
        rx={12}
        fill={C.yellow}
      />
      <text
        y={9}
        textAnchor="middle"
        fontFamily={TITLE_FONT}
        fontWeight={800}
        fontSize={28}
        fill={C.ink}
      >
        {text}
      </text>
    </g>
  </g>
);

// Frein à disque : vue de côté (levier, maître-cylindre, durite, étrier, disque) + coupe de l'étrier en bas.
export const Brake: React.FC<{ mode?: BrakeMode; labels?: boolean }> = ({
  mode = "parts",
  labels,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pressAt(mode, f);
  // angle du disque = somme des vitesses passées (ralentit quand on freine)
  let angle = 0;
  for (let i = 0; i < f; i++)
    angle +=
      DISC_SPEED *
      (1 - 0.85 * pressAt(mode, i)) *
      (mode === "heat" ? Math.max(0, 1 - i / 120) : 1);
  const heat =
    mode === "heat"
      ? interpolate(f, [20, 140], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;
  const temp = Math.round(interpolate(heat, [0, 1], [20, 320]));
  const show =
    labels || mode === "parts"
      ? spring({ frame: f - 15, fps, config: { damping: 14 } })
      : 0;
  const discColor = heat > 0 ? mix(C.metal, C.red, heat * 0.85) : C.metal;

  // vue de côté
  const DX = 235,
    DY = 340,
    R = 165;
  // coupe
  const SY = 720,
    gap = 26 * (1 - p);

  return (
    <svg
      viewBox="0 0 600 900"
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
    >
      {/* disque */}
      {heat > 0 && (
        <circle
          cx={DX}
          cy={DY}
          r={R + 26 + Math.sin(f / 3) * 4}
          fill={C.red}
          opacity={0.25 * heat}
        />
      )}
      <g transform={`rotate(${angle} ${DX} ${DY})`}>
        <circle cx={DX} cy={DY} r={R} fill={discColor} />
        <circle
          cx={DX}
          cy={DY}
          r={R - 14}
          fill="none"
          stroke={C.grey}
          strokeWidth={3}
          opacity={0.6}
        />
        {Array.from({ length: 18 }, (_, i) =>
          [R - 40, R - 72].map((rr, k) => {
            const a = ((i * 20 + k * 10) * Math.PI) / 180;
            return (
              <circle
                key={`${i}-${k}`}
                cx={DX + Math.cos(a) * rr}
                cy={DY + Math.sin(a) * rr}
                r={8}
                fill={C.bg}
              />
            );
          }),
        )}
        <circle cx={DX} cy={DY} r={R - 98} fill={C.grey} />
        {Array.from({ length: 5 }, (_, i) => {
          const a = (i * 72 * Math.PI) / 180;
          return (
            <circle
              key={i}
              cx={DX + Math.cos(a) * (R - 98)}
              cy={DY + Math.sin(a) * (R - 98)}
              r={11}
              fill={C.yellow}
            />
          );
        })}
        <circle cx={DX} cy={DY} r={42} fill={C.blue} />
        <circle cx={DX} cy={DY} r={14} fill={C.ink} />
      </g>
      {/* vagues de chaleur */}
      {heat > 0.2 &&
        [0, 1, 2].map((i) => {
          const k = (f * 0.025 + i / 3) % 1;
          const hx = DX - 80 + i * 80;
          return (
            <path
              key={i}
              d={`M ${hx} ${DY - R - 10 - k * 70} q 14 -18 0 -36 q -14 -18 0 -36`}
              fill="none"
              stroke={C.red}
              strokeWidth={7}
              strokeLinecap="round"
              opacity={(1 - k) * heat}
            />
          );
        })}

      {/* durite : du maître-cylindre à l'étrier */}
      <path
        d={`M 470 150 C 560 200 560 300 ${DX + R + 30} ${DY - 60}`}
        fill="none"
        stroke={C.ink}
        strokeWidth={16}
        strokeLinecap="round"
      />
      <path
        d={`M 470 150 C 560 200 560 300 ${DX + R + 30} ${DY - 60}`}
        fill="none"
        stroke={FLUID}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray="14 16"
        strokeDashoffset={-f * 4 * p}
        opacity={0.4 + 0.6 * p}
      />
      {/* étrier, à cheval sur le bord du disque */}
      <rect
        x={DX + R - 40}
        y={DY - 85}
        width={86}
        height={170}
        rx={24}
        fill={C.orange}
      />
      <rect
        x={DX + R - 40}
        y={DY - 85}
        width={20}
        height={170}
        rx={10}
        fill="#C98608"
      />
      {[DY - 55, DY + 55].map((y) => (
        <circle key={y} cx={DX + R + 22} cy={y} r={9} fill={C.ink} />
      ))}

      {/* levier + maître-cylindre sur le guidon */}
      <rect x={330} y={70} width={260} height={46} rx={22} fill={C.ink} />
      <rect x={410} y={120} width={110} height={52} rx={14} fill={C.metal} />
      <rect x={420} y={88} width={60} height={34} rx={8} fill={FLUID} />
      <g transform={`rotate(${interpolate(p, [0, 1], [0, -12])} 520 150)`}>
        <path
          d="M 520 150 L 330 196"
          stroke={C.metal}
          strokeWidth={22}
          strokeLinecap="round"
        />
      </g>

      {heat > 0 && (
        <g transform="translate(470 470)">
          <rect
            x={-100}
            y={-40}
            width={200}
            height={80}
            rx={20}
            fill={heat > 0.6 ? C.red : C.orange}
          />
          <text
            y={18}
            textAnchor="middle"
            fontFamily={TITLE_FONT}
            fontWeight={800}
            fontSize={50}
            fill={C.white}
          >
            {temp} °C
          </text>
        </g>
      )}

      {/* coupe de l'étrier : pistons → plaquettes → disque */}
      <text
        x={115}
        y={SY - 160}
        textAnchor="start"
        fontFamily={BODY_FONT}
        fontWeight={800}
        fontSize={26}
        fill={C.text}
        opacity={0.8}
      >
        VUE EN COUPE
      </text>
      <rect
        x={110}
        y={SY - 110}
        width={380}
        height={220}
        rx={30}
        fill={C.orange}
      />
      <rect
        x={180}
        y={SY - 70}
        width={240}
        height={140}
        rx={16}
        fill={C.inside}
      />
      {/* liquide qui pousse les pistons */}
      <rect
        x={140}
        y={SY - 40}
        width={40 + 26 - gap}
        height={80}
        rx={10}
        fill={FLUID}
      />
      <rect
        x={420 - 26 + gap}
        y={SY - 40}
        width={40 + 26 - gap}
        height={80}
        rx={10}
        fill={FLUID}
      />
      {/* pistons */}
      <rect
        x={180 + 26 - gap}
        y={SY - 45}
        width={34}
        height={90}
        rx={8}
        fill={C.metal}
      />
      <rect
        x={386 - 26 + gap}
        y={SY - 45}
        width={34}
        height={90}
        rx={8}
        fill={C.metal}
      />
      {/* plaquettes : support + garniture */}
      <rect
        x={214 + 26 - gap}
        y={SY - 60}
        width={12}
        height={120}
        rx={4}
        fill={C.grey}
      />
      <rect
        x={226 + 26 - gap}
        y={SY - 56}
        width={22}
        height={112}
        rx={4}
        fill={PAD}
      />
      <rect
        x={374 - 26 + gap}
        y={SY - 60}
        width={12}
        height={120}
        rx={4}
        fill={C.grey}
      />
      <rect
        x={352 - 26 + gap}
        y={SY - 56}
        width={22}
        height={112}
        rx={4}
        fill={PAD}
      />
      {/* disque, vu par la tranche */}
      <rect
        x={282}
        y={SY - 150}
        width={36}
        height={300}
        rx={8}
        fill={discColor}
      />
      {[SY - 120, SY - 80, SY + 80, SY + 120].map((y) => (
        <rect
          key={y}
          x={286}
          y={y}
          width={28}
          height={10}
          rx={4}
          fill={C.bg}
          opacity={0.5}
        />
      ))}
      {p > 0.85 &&
        heat < 0.1 &&
        [-1, 1].map((s) => (
          <path
            key={s}
            d={`M ${300 + s * 18} ${SY - 80} l ${s * 22} -24 m ${-s * 22} 24 l ${s * 30} 0`}
            stroke={C.yellow}
            strokeWidth={6}
            strokeLinecap="round"
            opacity={0.6 + 0.4 * Math.sin(f)}
          />
        ))}

      {/* étiquettes */}
      {show > 0 && (
        <g>
          <Tag x={120} y={40} text="LEVIER" tx={360} ty={190} show={show} />
          <Tag
            x={470}
            y={30}
            text="MAÎTRE-CYLINDRE"
            tx={455}
            ty={110}
            show={show}
          />
          <Tag x={540} y={300} text="DURITE" tx={538} ty={250} show={show} />
          <Tag
            x={520}
            y={420}
            text="ÉTRIER"
            tx={DX + R + 20}
            ty={DY + 60}
            show={show}
          />
          <Tag
            x={95}
            y={555}
            text="DISQUE"
            tx={DX - 90}
            ty={DY + 110}
            show={show}
          />
          <Tag
            x={300}
            y={880}
            text="PLAQUETTES"
            tx={240}
            ty={SY + 50}
            show={show}
          />
        </g>
      )}
    </svg>
  );
};

// Astuce : usure des plaquettes (rainure témoin) + liquide de frein.
export const BrakePads: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f - 5, fps, config: { damping: 14 } });
  const b = spring({ frame: f - 25, fps, config: { damping: 14 } });
  const c = spring({ frame: f - 60, fps, config: { damping: 12 } });
  const Pad: React.FC<{ x: number; thick: number; groove: boolean }> = ({
    x,
    thick,
    groove,
  }) => (
    <g>
      <rect x={x} y={250} width={200} height={40} rx={10} fill={C.grey} />
      <rect x={x + 8} y={290} width={184} height={thick} rx={8} fill={PAD} />
      {groove && (
        <rect x={x + 94} y={290} width={12} height={thick} fill={C.bg} />
      )}
    </g>
  );
  return (
    <svg
      viewBox="0 0 600 900"
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
    >
      <g opacity={a} transform={`translate(0 ${(1 - a) * 40})`}>
        <Pad x={40} thick={110} groove />
        <text
          x={140}
          y={225}
          textAnchor="middle"
          fontFamily={TITLE_FONT}
          fontWeight={800}
          fontSize={42}
          fill={C.green}
        >
          NEUVE
        </text>
        <text
          x={140}
          y={450}
          textAnchor="middle"
          fontFamily={BODY_FONT}
          fontWeight={800}
          fontSize={26}
          fill={C.text}
        >
          rainure visible
        </text>
      </g>
      <g opacity={b} transform={`translate(0 ${(1 - b) * 40})`}>
        <Pad x={360} thick={18} groove={false} />
        <text
          x={460}
          y={225}
          textAnchor="middle"
          fontFamily={TITLE_FONT}
          fontWeight={800}
          fontSize={42}
          fill={C.red}
        >
          À CHANGER
        </text>
        <text
          x={460}
          y={360}
          textAnchor="middle"
          fontFamily={BODY_FONT}
          fontWeight={800}
          fontSize={26}
          fill={C.text}
        >
          plus de rainure
        </text>
        <g transform="translate(560 270)">
          <circle r={30} fill={C.red} />
          <path
            d="M -12 -12 L 12 12 M 12 -12 L -12 12"
            stroke={C.white}
            strokeWidth={8}
            strokeLinecap="round"
          />
        </g>
      </g>
      {/* liquide de frein */}
      <g opacity={c} transform={`translate(0 ${(1 - c) * 40})`}>
        <rect x={110} y={540} width={140} height={200} rx={26} fill={C.metal} />
        <rect x={150} y={505} width={60} height={42} rx={10} fill={C.ink} />
        <rect x={110} y={600} width={140} height={140} rx={26} fill={FLUID} />
        <text
          x={180}
          y={685}
          textAnchor="middle"
          fontFamily={TITLE_FONT}
          fontWeight={800}
          fontSize={26}
          fill={C.ink}
        >
          LIQUIDE
        </text>
        <g transform="translate(410 640)">
          <rect
            x={-110}
            y={-90}
            width={220}
            height={180}
            rx={24}
            fill={C.text}
          />
          <rect x={-110} y={-90} width={220} height={50} rx={24} fill={C.red} />
          <rect x={-110} y={-60} width={220} height={20} fill={C.red} />
          <text
            y={50}
            textAnchor="middle"
            fontFamily={TITLE_FONT}
            fontWeight={800}
            fontSize={50}
            fill={C.ink}
          >
            ~2 ANS
          </text>
        </g>
      </g>
      <text
        x={300}
        y={830}
        textAnchor="middle"
        fontFamily={BODY_FONT}
        fontWeight={800}
        fontSize={32}
        fill={C.text}
      >
        Valeurs exactes : ton manuel
      </text>
    </svg>
  );
};

function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return (
    "#" +
    pa
      .map((v, i) =>
        Math.round(v + (pb[i] - v) * t)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
