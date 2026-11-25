import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../brand";
import { BODY_FONT, TITLE_FONT } from "../fonts";

const C = BRAND.colors;
const TIRE = "#34444F"; // gomme (assez claire pour ressortir sur le fond pétrole)
const TREAD = "#24323C"; // sculptures
const WATER = C.sky;

export type TireMode = "marking" | "water" | "lean";

// Durée d'affichage de chaque partie du marquage (mode "marking"), sert aussi aux bruitages.
export const TIRE_MARK_STEP = 55;

const MARKS = [
  { part: "180", title: "LARGEUR", text: "180 mm" },
  { part: "55", title: "HAUTEUR DU FLANC", text: "55 % de la largeur" },
  { part: "17", title: "JANTE", text: "17 pouces" },
];

const Wheel: React.FC<{
  cx: number;
  cy: number;
  r: number;
  spin: number;
  marking?: boolean;
}> = ({ cx, cy, r, spin, marking }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={TIRE} />
    <g transform={`rotate(${spin} ${cx} ${cy})`}>
      {Array.from({ length: 36 }, (_, i) => (
        <rect
          key={i}
          x={cx - 9}
          y={cy - r}
          width={18}
          height={20}
          rx={5}
          fill={TREAD}
          transform={`rotate(${i * 10} ${cx} ${cy})`}
        />
      ))}
      {marking && (
        <>
          <defs>
            <path
              id="sidewall"
              d={`M ${cx - r * 0.8} ${cy} A ${r * 0.8} ${r * 0.8} 0 0 1 ${cx + r * 0.8} ${cy}`}
            />
          </defs>
          <text
            fontFamily={TITLE_FONT}
            fontWeight={800}
            fontSize={r * 0.17}
            fill={C.text}
            letterSpacing={3}
          >
            <textPath href="#sidewall" startOffset="50%" textAnchor="middle">
              180/55 ZR17
            </textPath>
          </text>
        </>
      )}
    </g>
    <circle cx={cx} cy={cy} r={r * 0.62} fill={C.orange} />
    <circle cx={cx} cy={cy} r={r * 0.52} fill={C.bg} />
    <g transform={`rotate(${spin} ${cx} ${cy})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <rect
          key={a}
          x={cx - 9}
          y={cy - r * 0.55}
          width={18}
          height={r * 0.55}
          rx={8}
          fill={C.orange}
          transform={`rotate(${a} ${cx} ${cy})`}
        />
      ))}
    </g>
    <circle cx={cx} cy={cy} r={r * 0.14} fill={C.metal} />
  </g>
);

// Pneu moto : marquage du flanc, évacuation de l'eau, profil rond à l'inclinaison.
export const Tire: React.FC<{ mode?: TireMode }> = ({ mode = "marking" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (mode === "marking") {
    const step = Math.min(
      MARKS.length - 1,
      Math.floor(Math.max(0, f - 20) / TIRE_MARK_STEP),
    );
    const card = spring({
      frame: f - 20 - step * TIRE_MARK_STEP,
      fps,
      config: { damping: 14 },
    });
    const m = MARKS[step];
    const parts = ["180", "/", "55", " ZR", "17"];
    return (
      <svg
        viewBox="0 0 600 900"
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        <text
          x={300}
          y={110}
          textAnchor="middle"
          fontFamily={TITLE_FONT}
          fontWeight={800}
          fontSize={78}
          fill={C.text}
        >
          {parts.map((p, i) => (
            <tspan key={i} fill={p === m.part ? C.orange : C.text}>
              {p}
            </tspan>
          ))}
        </text>
        <Wheel cx={300} cy={430} r={230} spin={f * 0.6} marking />
        <g
          transform={`translate(300 780) scale(${0.85 + 0.15 * card})`}
          opacity={card}
        >
          <rect
            x={-280}
            y={-80}
            width={560}
            height={160}
            rx={28}
            fill={C.orange}
          />
          <text
            y={-22}
            textAnchor="middle"
            fontFamily={BODY_FONT}
            fontWeight={800}
            fontSize={34}
            fill={C.ink}
          >
            {m.part} = {m.title}
          </text>
          <text
            y={48}
            textAnchor="middle"
            fontFamily={TITLE_FONT}
            fontWeight={800}
            fontSize={50}
            fill={C.ink}
          >
            {m.text}
          </text>
        </g>
      </svg>
    );
  }

  if (mode === "water") {
    const roadY = 700;
    const r = 210;
    const cx = 300,
      cy = roadY - r;
    return (
      <svg
        viewBox="0 0 600 900"
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        <rect x={0} y={roadY} width={600} height={140} rx={20} fill={C.grey} />
        <rect
          x={0}
          y={roadY - 8}
          width={600}
          height={16}
          rx={8}
          fill={WATER}
          opacity={0.8}
        />
        {Array.from({ length: 6 }, (_, i) => {
          const x = 600 - ((f * 9 + i * 110) % 660);
          return (
            <rect
              key={i}
              x={x}
              y={roadY + 60}
              width={60}
              height={12}
              rx={6}
              fill={C.text}
              opacity={0.5}
            />
          );
        })}
        <Wheel cx={cx} cy={cy} r={r} spin={f * 4} />
        {/* l'eau chassée par les rainures, vers l'arrière et les côtés */}
        {Array.from({ length: 14 }, (_, i) => {
          const k = (f * 0.04 + i / 14) % 1;
          const side = i % 2 ? 1 : -1;
          const x = cx + side * (40 + k * 230);
          const y = roadY - 10 - Math.sin(k * Math.PI) * (90 + (i % 3) * 30);
          return (
            <path
              key={i}
              transform={`translate(${x} ${y}) scale(${1 - k * 0.5})`}
              d="M 0 -16 Q 12 2 0 12 Q -12 2 0 -16 Z"
              fill={WATER}
              opacity={1 - k * 0.7}
            />
          );
        })}
        {/* empreinte vue de dessus : les rainures guident l'eau */}
        <g transform="translate(300 160)">
          <text
            y={-70}
            textAnchor="middle"
            fontFamily={BODY_FONT}
            fontWeight={800}
            fontSize={26}
            fill={C.text}
            opacity={0.85}
          >
            VU DE DESSOUS
          </text>
          <rect x={-130} y={-50} width={260} height={100} rx={50} fill={TIRE} />
          {[-80, -30, 20, 70].map((x, i) => (
            <path
              key={x}
              d={`M ${x} -40 l 30 40 l -30 40`}
              fill="none"
              stroke={WATER}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray="10 12"
              strokeDashoffset={-f * 3 + i * 5}
            />
          ))}
        </g>
      </svg>
    );
  }

  // mode "lean" : profil rond vu de face, qui s'incline ; l'empreinte se déplace sur le flanc
  const roadY = 700;
  const lean = 45 * Math.sin(f / 30);
  const R = 95; // rayon du profil
  const pcx = 300,
    pcy = roadY - R;
  return (
    <svg
      viewBox="0 0 600 900"
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
    >
      <rect x={0} y={roadY} width={600} height={120} rx={20} fill={C.grey} />
      <g transform={`rotate(${lean} ${pcx} ${pcy})`}>
        {/* jante + bras de fourche, pour voir l'inclinaison */}
        <rect
          x={pcx - 12}
          y={pcy - 470}
          width={24}
          height={330}
          rx={12}
          fill={C.metal}
        />
        <path
          d={`M ${pcx - R} ${pcy} L ${pcx - R} ${pcy - 250} A ${R} ${R} 0 0 1 ${pcx + R} ${pcy - 250} L ${pcx + R} ${pcy} A ${R} ${R} 0 0 1 ${pcx - R} ${pcy} Z`}
          fill={TIRE}
        />
        <rect
          x={pcx - 40}
          y={pcy - 300}
          width={80}
          height={240}
          rx={20}
          fill={C.orange}
        />
        {/* bande de roulement */}
        <path
          d={`M ${pcx - R} ${pcy} A ${R} ${R} 0 0 0 ${pcx + R} ${pcy}`}
          fill="none"
          stroke={TREAD}
          strokeWidth={14}
        />
      </g>
      {/* empreinte au sol */}
      <ellipse cx={pcx} cy={roadY} rx={46} ry={10} fill={C.yellow} />
      <g transform="translate(470 180)">
        <rect
          x={-95}
          y={-50}
          width={190}
          height={100}
          rx={24}
          fill={C.orange}
        />
        <text
          y={20}
          textAnchor="middle"
          fontFamily={TITLE_FONT}
          fontWeight={800}
          fontSize={56}
          fill={C.ink}
        >
          {Math.round(Math.abs(lean))}°
        </text>
      </g>
      <text
        x={300}
        y={870}
        textAnchor="middle"
        fontFamily={BODY_FONT}
        fontWeight={800}
        fontSize={30}
        fill={C.text}
      >
        Profil rond = même contact en virage
      </text>
    </svg>
  );
};

// Astuce : pression à froid (manomètre) + témoin d'usure des sculptures.
export const TireCheck: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const needle = spring({
    frame: f - 10,
    fps,
    config: { damping: 10, mass: 1.5 },
  });
  const ang = interpolate(needle, [0, 1], [-120, 20]);
  const wear = interpolate(f, [70, 160], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ok = spring({ frame: f - 45, fps, config: { damping: 12 } });
  const blockH = interpolate(wear, [0, 1], [90, 22]);
  return (
    <svg
      viewBox="0 0 600 900"
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
    >
      {/* manomètre */}
      <g transform="translate(300 260)">
        <circle r={170} fill={C.metal} />
        <circle r={145} fill={C.inside} />
        <path
          d="M -125 72 A 145 145 0 0 1 -72 -126"
          fill="none"
          stroke={C.red}
          strokeWidth={22}
        />
        <path
          d="M -72 -126 A 145 145 0 0 1 108 -97"
          fill="none"
          stroke={C.green}
          strokeWidth={22}
        />
        <path
          d="M 108 -97 A 145 145 0 0 1 125 72"
          fill="none"
          stroke={C.red}
          strokeWidth={22}
        />
        <g transform={`rotate(${ang})`}>
          <rect x={-7} y={-125} width={14} height={135} rx={7} fill={C.ink} />
        </g>
        <circle r={20} fill={C.ink} />
        <text
          y={95}
          textAnchor="middle"
          fontFamily={TITLE_FONT}
          fontWeight={800}
          fontSize={40}
          fill={C.ink}
        >
          À FROID
        </text>
        <g transform={`translate(150 -130) scale(${ok})`}>
          <circle r={38} fill={C.green} />
          <path
            d="M -17 0 L -4 13 L 19 -12"
            fill="none"
            stroke={C.white}
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
      {/* sculptures qui s'usent jusqu'au témoin */}
      <g transform="translate(0 0)">
        <rect x={60} y={700} width={480} height={50} rx={10} fill={TIRE} />
        {[60, 180, 300, 420].map((x, i) =>
          i === 2 ? (
            <g key={x}>
              <rect
                x={x + 10}
                y={700 - 22}
                width={100}
                height={22}
                rx={4}
                fill={C.yellow}
              />
            </g>
          ) : (
            <rect
              key={x}
              x={x + 10}
              y={700 - blockH}
              width={100}
              height={blockH}
              rx={8}
              fill={TIRE}
            />
          ),
        )}
        <text
          x={360}
          y={640}
          textAnchor="middle"
          fontFamily={BODY_FONT}
          fontWeight={800}
          fontSize={26}
          fill={C.yellow}
        >
          TÉMOIN
        </text>
        <text
          x={300}
          y={800}
          textAnchor="middle"
          fontFamily={TITLE_FONT}
          fontWeight={800}
          fontSize={40}
          fill={wear > 0.95 ? C.red : C.text}
        >
          {wear > 0.95 ? "À CHANGER !" : "Sculptures"}
        </text>
      </g>
      <text
        x={300}
        y={870}
        textAnchor="middle"
        fontFamily={BODY_FONT}
        fontWeight={800}
        fontSize={30}
        fill={C.text}
      >
        Pression : voir ton manuel
      </text>
    </svg>
  );
};
