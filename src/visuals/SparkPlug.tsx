import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../brand";
import { BODY_FONT, TITLE_FONT } from "../fonts";

const C = BRAND.colors;
const RIB = "#C3CDD6"; // creux entre les ailettes de la céramique (teinte plus foncée)
const METAL_DK = "#8797A6"; // ombre du métal

export type SparkMode = "parts" | "spark" | "gap";

// Rythme du mode "spark" : le courant descend, puis l'étincelle éclate à SPARK_AT.
export const SPARK_CYCLE = 60;
export const SPARK_AT = 40;
// Mode "parts" : une étiquette toutes les PART_STEP images (sert aussi aux bruitages).
export const PART_STEP = 40;
// SparkCheck : moments où les 3 bouts de bougie apparaissent.
export const CHECK_AT = [20, 95, 125];

const CX = 160; // axe de la bougie (les étiquettes vont à droite, hors de la zone TikTok)

// Repères verticaux de la bougie (viewBox 600x900, tout au-dessus des sous-titres).
const Y = {
  termTop: 10,
  insTop: 50,
  insBot: 230,
  hexTop: 220,
  hexBot: 295,
  washBot: 310,
  thrBot: 440,
  centerBot: 482,
  groundBot: 520,
};

const Plug: React.FC<{ glow?: number }> = ({ glow = 0 }) => (
  <g>
    {/* borne */}
    <rect
      x={CX - 24}
      y={Y.termTop}
      width={48}
      height={50}
      rx={14}
      fill={C.metal}
    />
    <rect
      x={CX - 32}
      y={Y.termTop + 30}
      width={64}
      height={14}
      rx={7}
      fill={METAL_DK}
    />
    {/* céramique isolante avec ses ailettes */}
    <rect
      x={CX - 46}
      y={Y.insTop}
      width={92}
      height={Y.insBot - Y.insTop}
      rx={24}
      fill={RIB}
    />
    {[70, 102, 134].map((y) => (
      <rect
        key={y}
        x={CX - 58}
        y={y}
        width={116}
        height={20}
        rx={10}
        fill={C.inside}
      />
    ))}
    <rect
      x={CX - 56}
      y={166}
      width={112}
      height={Y.insBot - 166}
      rx={18}
      fill={C.inside}
    />
    {/* six pans */}
    <rect
      x={CX - 85}
      y={Y.hexTop}
      width={170}
      height={Y.hexBot - Y.hexTop}
      rx={14}
      fill={C.metal}
    />
    <rect
      x={CX - 85}
      y={Y.hexTop}
      width={40}
      height={Y.hexBot - Y.hexTop}
      rx={14}
      fill={METAL_DK}
    />
    <rect
      x={CX + 45}
      y={Y.hexTop}
      width={40}
      height={Y.hexBot - Y.hexTop}
      rx={14}
      fill={METAL_DK}
    />
    {/* joint */}
    <rect
      x={CX - 72}
      y={Y.hexBot}
      width={144}
      height={Y.washBot - Y.hexBot}
      rx={6}
      fill={C.grey}
    />
    {/* filetage */}
    <rect
      x={CX - 58}
      y={Y.washBot}
      width={116}
      height={Y.thrBot - Y.washBot}
      rx={10}
      fill={C.metal}
    />
    {Array.from({ length: 6 }, (_, i) => {
      const y = Y.washBot + 10 + i * 21;
      return (
        <path
          key={i}
          d={`M ${CX - 58} ${y + 10} L ${CX + 58} ${y} L ${CX + 58} ${y + 9} L ${CX - 58} ${y + 19} Z`}
          fill={METAL_DK}
        />
      );
    })}
    {/* bout de la céramique + électrode centrale */}
    <rect
      x={CX - 16}
      y={Y.thrBot - 6}
      width={32}
      height={26}
      rx={8}
      fill={C.inside}
    />
    <rect
      x={CX - 7}
      y={Y.thrBot + 12}
      width={14}
      height={Y.centerBot - Y.thrBot - 12}
      rx={5}
      fill={glow > 0 ? C.yellow : C.metal}
    />
    {/* électrode de masse (en L) */}
    <path
      d={`M ${CX + 38} ${Y.thrBot - 4} L ${CX + 56} ${Y.thrBot - 4} L ${CX + 56} ${Y.groundBot} Q ${CX + 56} ${Y.groundBot + 4} ${CX + 50} ${Y.groundBot + 4}
          L ${CX - 22} ${Y.groundBot + 4} L ${CX - 22} ${Y.groundBot - 14} L ${CX + 38} ${Y.groundBot - 14} Z`}
      fill={C.metal}
    />
  </g>
);

const Bolt: React.FC<{
  x: number;
  y1: number;
  y2: number;
  k: number;
  seed: number;
}> = ({ x, y1, y2, k, seed }) => {
  // zigzag déterministe (pas de Math.random)
  const n = 5;
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const y = y1 + ((y2 - y1) * i) / n;
    const dx = i === 0 || i === n ? 0 : (((i * 7 + seed * 3) % 5) - 2) * 7;
    return `${x + dx},${y}`;
  });
  return (
    <g opacity={k}>
      <circle
        cx={x}
        cy={(y1 + y2) / 2}
        r={18 + 26 * k}
        fill={C.yellow}
        opacity={0.35}
      />
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={C.white}
        strokeWidth={7}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </g>
  );
};

const Label: React.FC<{
  y: number;
  fromX: number;
  text: string;
  k: number;
}> = ({ y, fromX, text, k }) => (
  <g opacity={k} transform={`translate(${(1 - k) * 30} 0)`}>
    <rect
      x={fromX}
      y={y - 3}
      width={290 - fromX}
      height={6}
      rx={3}
      fill={C.orange}
    />
    <circle cx={fromX} cy={y} r={9} fill={C.orange} />
    <rect
      x={290}
      y={y - 30}
      width={text.length * 20 + 36}
      height={60}
      rx={18}
      fill={C.orange}
    />
    <text
      x={308}
      y={y + 12}
      fontFamily={BODY_FONT}
      fontWeight={800}
      fontSize={30}
      fill={C.ink}
    >
      {text}
    </text>
  </g>
);

// Bougie d'allumage : les pièces, l'étincelle, l'écartement des électrodes.
export const SparkPlug: React.FC<{ mode?: SparkMode }> = ({
  mode = "parts",
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (mode === "parts") {
    const parts = [
      { y: Y.termTop + 25, fromX: CX + 30, text: "BORNE" },
      { y: 150, fromX: CX + 62, text: "CÉRAMIQUE" },
      { y: 375, fromX: CX + 62, text: "FILETAGE" },
      { y: Y.groundBot - 10, fromX: CX + 60, text: "ÉLECTRODES" },
    ];
    return (
      <svg
        viewBox="0 0 600 900"
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        <Plug />
        {parts.map((p, i) => (
          <Label
            key={p.text}
            {...p}
            k={spring({
              frame: f - 10 - i * PART_STEP,
              fps,
              config: { damping: 14 },
            })}
          />
        ))}
      </svg>
    );
  }

  if (mode === "spark") {
    const t = f % SPARK_CYCLE;
    const n = Math.floor(f / SPARK_CYCLE);
    const down = interpolate(t, [0, SPARK_AT], [0, 1], {
      extrapolateRight: "clamp",
    });
    const flash = interpolate(
      t,
      [SPARK_AT, SPARK_AT + 3, SPARK_AT + 14],
      [0, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const curY = interpolate(down, [0, 1], [Y.termTop - 60, Y.centerBot]);
    const volts =
      Math.round(interpolate(down, [0, 1], [0, 30000]) / 1000) * 1000;
    return (
      <svg
        viewBox="0 0 600 900"
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        {/* câble de la bobine */}
        <rect
          x={CX - 10}
          y={-25}
          width={20}
          height={Y.termTop + 35}
          rx={10}
          fill={C.red}
        />
        <Plug glow={flash} />
        {/* le courant descend au cœur de la bougie */}
        {t < SPARK_AT && (
          <>
            <rect
              x={CX - 6}
              y={Y.termTop - 60}
              width={12}
              height={Math.max(0, curY - Y.termTop + 60)}
              rx={6}
              fill={C.yellow}
              opacity={0.85}
            />
            <circle cx={CX} cy={curY} r={16} fill={C.yellow} />
          </>
        )}
        <Bolt
          x={CX}
          y1={Y.centerBot}
          y2={Y.groundBot - 14}
          k={flash}
          seed={n}
        />
        {/* compteur de tension */}
        <g transform="translate(300 120)">
          <rect
            x={0}
            y={-50}
            width={230}
            height={100}
            rx={24}
            fill={flash > 0.1 ? C.yellow : C.blue}
          />
          <text
            x={115}
            y={18}
            textAnchor="middle"
            fontFamily={TITLE_FONT}
            fontWeight={800}
            fontSize={46}
            fill={flash > 0.1 ? C.ink : C.text}
          >
            {String(volts).replace(/\B(?=(\d{3})+$)/g, " ")} V
          </text>
        </g>
        <g
          transform="translate(300 330)"
          opacity={interpolate(f, [SPARK_AT, SPARK_AT + 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        >
          <text
            x={0}
            y={0}
            fontFamily={BODY_FONT}
            fontWeight={800}
            fontSize={32}
            fill={C.text}
          >
            ÇA SAUTE
          </text>
          <text
            x={0}
            y={42}
            fontFamily={BODY_FONT}
            fontWeight={800}
            fontSize={32}
            fill={C.yellow}
          >
            ENTRE LES
          </text>
          <text
            x={0}
            y={84}
            fontFamily={BODY_FONT}
            fontWeight={800}
            fontSize={32}
            fill={C.yellow}
          >
            ÉLECTRODES
          </text>
        </g>
      </svg>
    );
  }

  // mode "gap" : zoom sur le bout, une cale d'épaisseur glisse entre les électrodes
  const zx = 280;
  const slide = spring({
    frame: f - 15,
    fps,
    config: { damping: 16, mass: 1.2 },
  });
  const tag = spring({ frame: f - 45, fps, config: { damping: 12 } });
  const gapTop = 300;
  const gapBot = 380;
  const pulse = 0.5 + 0.5 * Math.sin(f / 6);
  return (
    <svg
      viewBox="0 0 600 900"
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
    >
      {/* bas du filetage, vu en gros plan */}
      <rect
        x={zx - 190}
        y={0}
        width={380}
        height={170}
        rx={24}
        fill={C.metal}
      />
      {Array.from({ length: 4 }, (_, i) => (
        <path
          key={i}
          d={`M ${zx - 190} ${30 + i * 40} L ${zx + 190} ${i * 40} L ${zx + 190} ${i * 40 + 18} L ${zx - 190} ${48 + i * 40} Z`}
          fill={METAL_DK}
        />
      ))}
      <path
        d={`M ${zx - 60} 170 L ${zx + 60} 170 L ${zx + 36} 230 L ${zx - 36} 230 Z`}
        fill={C.inside}
      />
      {/* électrode centrale */}
      <rect
        x={zx - 24}
        y={210}
        width={48}
        height={gapTop - 210}
        rx={10}
        fill={C.metal}
      />
      {/* électrode de masse */}
      <path
        d={`M ${zx + 120} 170 L ${zx + 170} 170 L ${zx + 170} ${gapBot + 60} Q ${zx + 170} ${gapBot + 70} ${zx + 160} ${gapBot + 70}
            L ${zx - 70} ${gapBot + 70} L ${zx - 70} ${gapBot} L ${zx + 120} ${gapBot} Z`}
        fill={C.metal}
      />
      {/* cale d'épaisseur */}
      <g transform={`translate(${interpolate(slide, [0, 1], [-420, 0])} 0)`}>
        <rect
          x={zx - 330}
          y={gapTop + 8}
          width={340}
          height={gapBot - gapTop - 16}
          rx={10}
          fill={C.yellow}
        />
        <text
          x={zx - 300}
          y={gapTop + 54}
          fontFamily={BODY_FONT}
          fontWeight={800}
          fontSize={26}
          fill={C.ink}
        >
          CALE
        </text>
      </g>
      {/* cote */}
      <g opacity={tag}>
        <rect
          x={zx + 205}
          y={gapTop}
          width={10}
          height={gapBot - gapTop}
          rx={5}
          fill={C.orange}
        />
        <rect
          x={zx + 190}
          y={gapTop - 5}
          width={40}
          height={10}
          rx={5}
          fill={C.orange}
        />
        <rect
          x={zx + 190}
          y={gapBot - 5}
          width={40}
          height={10}
          rx={5}
          fill={C.orange}
        />
      </g>
      <g
        transform={`translate(300 520) scale(${0.85 + 0.15 * tag})`}
        opacity={tag}
      >
        <rect
          x={-250}
          y={-55}
          width={500}
          height={110}
          rx={28}
          fill={C.orange}
        />
        <text
          y={-8}
          textAnchor="middle"
          fontFamily={BODY_FONT}
          fontWeight={800}
          fontSize={30}
          fill={C.ink}
        >
          ÉCARTEMENT
        </text>
        <text
          y={38}
          textAnchor="middle"
          fontFamily={TITLE_FONT}
          fontWeight={800}
          fontSize={42}
          fill={C.ink}
        >
          {"< 1 mm (voir manuel)"}
        </text>
      </g>
      <circle
        cx={zx}
        cy={(gapTop + gapBot) / 2}
        r={10 + 6 * pulse}
        fill={C.yellow}
        opacity={slide > 0.9 ? 0 : 0.6}
      />
    </svg>
  );
};

const TIPS = [
  { nose: "#C8925A", name: "BRUN CLAIR", ok: true },
  { nose: C.ink, name: "NOIRE", ok: false },
  { nose: C.white, name: "BLANCHE", ok: false },
];

// Astuce : lire la couleur du bout de la bougie.
export const SparkCheck: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cols = [95, 265, 435];
  return (
    <svg
      viewBox="0 0 600 900"
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
    >
      {TIPS.map((t, i) => {
        const k = spring({
          frame: f - CHECK_AT[i],
          fps,
          config: { damping: 12 },
        });
        const x = cols[i];
        return (
          <g
            key={t.name}
            opacity={k}
            transform={`translate(${x} ${60 + (1 - k) * 40}) scale(1.05)`}
          >
            <rect
              x={-62}
              y={0}
              width={124}
              height={130}
              rx={14}
              fill={C.metal}
            />
            {[0, 1, 2].map((j) => (
              <path
                key={j}
                d={`M -62 ${28 + j * 36} L 62 ${12 + j * 36} L 62 ${26 + j * 36} L -62 ${42 + j * 36} Z`}
                fill={METAL_DK}
              />
            ))}
            <path d="M -30 130 L 30 130 L 18 175 L -18 175 Z" fill={t.nose} />
            <rect x={-7} y={170} width={14} height={30} rx={5} fill={C.metal} />
            <path
              d="M 40 126 L 54 126 L 54 228 L -18 228 L -18 214 L 40 214 Z"
              fill={C.metal}
            />
            <g transform="translate(0 290)">
              <circle r={34} fill={t.ok ? C.green : C.red} />
              {t.ok ? (
                <path
                  d="M -15 0 L -4 12 L 17 -11"
                  fill="none"
                  stroke={C.white}
                  strokeWidth={9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M -12 -12 L 12 12 M 12 -12 L -12 12"
                  fill="none"
                  stroke={C.white}
                  strokeWidth={9}
                  strokeLinecap="round"
                />
              )}
            </g>
            <text
              y={365}
              textAnchor="middle"
              fontFamily={BODY_FONT}
              fontWeight={800}
              fontSize={30}
              fill={C.text}
            >
              {t.name}
            </text>
          </g>
        );
      })}
      <g
        transform="translate(20 470)"
        opacity={interpolate(f, [170, 185], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}
      >
        <rect x={0} y={0} width={400} height={80} rx={22} fill={C.blue} />
        <text
          x={200}
          y={52}
          textAnchor="middle"
          fontFamily={BODY_FONT}
          fontWeight={800}
          fontSize={28}
          fill={C.text}
        >
          À changer : km du manuel
        </text>
      </g>
    </svg>
  );
};
