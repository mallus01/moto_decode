import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../brand";
import { BODY_FONT, TITLE_FONT } from "../fonts";

const C = BRAND.colors;
const INK = C.ink;
const S = BRAND.stroke;
const GREEN = "#2BB673";

export type ChainMode = "parts" | "ratio" | "drive" | "slack";

// Pignon de sortie de boîte (15 dents) et couronne (45 dents) : rapport de 3.
const FRONT = { x: 135, y: 470, r: 50, teeth: 15 };
const REAR = { x: 410, y: 470, r: 150, teeth: 45 };
// Image(s) par tour de pignon en mode "ratio" (sert aussi aux bruitages).
export const CHAIN_FRONT_TURN = 40;

type Pt = { x: number; y: number; a: number };

// Parcours fermé de la chaîne : brin du haut → tour de la couronne → brin du bas (avec flèche) → tour du pignon.
function chainPath(sag: number) {
  const d = REAR.x - FRONT.x;
  const phi = Math.asin((REAR.r - FRONT.r) / d);
  const top = (c: typeof FRONT) => ({
    x: c.x - Math.sin(phi) * c.r,
    y: c.y - Math.cos(phi) * c.r,
  });
  const bot = (c: typeof FRONT) => ({
    x: c.x - Math.sin(phi) * c.r,
    y: c.y + Math.cos(phi) * c.r,
  });
  const fT = top(FRONT),
    rT = top(REAR),
    fB = bot(FRONT),
    rB = bot(REAR);
  const lineLen = Math.hypot(rT.x - fT.x, rT.y - fT.y);
  const aTop = Math.atan2(-Math.cos(phi), -Math.sin(phi)); // angle du point haut
  const aBot = Math.atan2(Math.cos(phi), -Math.sin(phi));
  const rearSweep = Math.PI + 2 * phi;
  const frontSweep = Math.PI - 2 * phi;
  const segs = [lineLen, REAR.r * rearSweep, lineLen, FRONT.r * frontSweep];
  const total = segs.reduce((a, b) => a + b, 0);
  const at = (s0: number): Pt => {
    let s = ((s0 % total) + total) % total;
    if (s < segs[0]) {
      const t = s / segs[0];
      return {
        x: fT.x + (rT.x - fT.x) * t,
        y: fT.y + (rT.y - fT.y) * t,
        a: Math.atan2(rT.y - fT.y, rT.x - fT.x),
      };
    }
    s -= segs[0];
    if (s < segs[1]) {
      const a = aTop + s / REAR.r;
      return {
        x: REAR.x + Math.cos(a) * REAR.r,
        y: REAR.y + Math.sin(a) * REAR.r,
        a: a + Math.PI / 2,
      };
    }
    s -= segs[1];
    if (s < segs[2]) {
      const t = s / segs[2];
      const sagY = sag * 4 * t * (1 - t);
      return {
        x: rB.x + (fB.x - rB.x) * t,
        y: rB.y + (fB.y - rB.y) * t + sagY,
        a:
          Math.atan2(fB.y - rB.y, fB.x - rB.x) +
          Math.atan((sag * 4 * (1 - 2 * t)) / segs[2]),
      };
    }
    s -= segs[2];
    const a = aBot + s / FRONT.r;
    return {
      x: FRONT.x + Math.cos(a) * FRONT.r,
      y: FRONT.y + Math.sin(a) * FRONT.r,
      a: a + Math.PI / 2,
    };
  };
  return { at, total, mid: { x: (rB.x + fB.x) / 2, y: (rB.y + fB.y) / 2 } };
}

const Sprocket: React.FC<{ c: typeof FRONT; angle: number; color: string }> = ({
  c,
  angle,
  color,
}) => {
  const step = 360 / c.teeth;
  return (
    <g transform={`rotate(${angle} ${c.x} ${c.y})`}>
      {Array.from({ length: c.teeth }, (_, i) => (
        <rect
          key={i}
          x={c.x - 7}
          y={c.y - c.r - 12}
          width={14}
          height={22}
          rx={5}
          fill={color}
          stroke={INK}
          strokeWidth={4}
          transform={`rotate(${i * step} ${c.x} ${c.y})`}
        />
      ))}
      <circle
        cx={c.x}
        cy={c.y}
        r={c.r - 4}
        fill={color}
        stroke={INK}
        strokeWidth={S}
      />
      {c.r > 80 &&
        [0, 72, 144, 216, 288].map((a) => (
          <ellipse
            key={a}
            cx={c.x}
            cy={c.y - c.r * 0.52}
            rx={c.r * 0.16}
            ry={c.r * 0.22}
            fill={C.cream}
            stroke={INK}
            strokeWidth={5}
            transform={`rotate(${a} ${c.x} ${c.y})`}
          />
        ))}
      <circle
        cx={c.x}
        cy={c.y}
        r={c.r * 0.28}
        fill={C.metal}
        stroke={INK}
        strokeWidth={5}
      />
      {/* repère pour compter les tours */}
      <circle
        cx={c.x}
        cy={c.y - c.r + 18}
        r={9}
        fill={C.red}
        stroke={INK}
        strokeWidth={3}
      />
      <circle cx={c.x} cy={c.y} r={8} fill={INK} />
    </g>
  );
};

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
        x={-text.length * 10 - 16}
        y={-27}
        width={text.length * 20 + 32}
        height={50}
        rx={12}
        fill={C.yellow}
        stroke={INK}
        strokeWidth={5}
      />
      <text
        y={10}
        textAnchor="middle"
        fontFamily={TITLE_FONT}
        fontSize={32}
        fill={INK}
      >
        {text}
      </text>
    </g>
  </g>
);

const Counter: React.FC<{
  x: number;
  y: number;
  title: string;
  n: number;
  color: string;
}> = ({ x, y, title, n, color }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect
      x={-120}
      y={-50}
      width={240}
      height={110}
      rx={20}
      fill={C.white}
      stroke={INK}
      strokeWidth={S}
    />
    <rect
      x={-120}
      y={-50}
      width={240}
      height={40}
      rx={18}
      fill={color}
      stroke={INK}
      strokeWidth={5}
    />
    <text
      y={-21}
      textAnchor="middle"
      fontFamily={TITLE_FONT}
      fontSize={28}
      fill={INK}
    >
      {title}
    </text>
    <text
      y={45}
      textAnchor="middle"
      fontFamily={TITLE_FONT}
      fontSize={50}
      fill={INK}
    >
      {n} {n > 1 ? "tours" : "tour"}
    </text>
  </g>
);

// Transmission secondaire : pignon de sortie de boîte, chaîne, couronne de la roue arrière.
export const Chain: React.FC<{ mode?: ChainMode; labels?: boolean }> = ({
  mode = "parts",
  labels,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pushing = mode === "slack" ? Math.max(0, Math.sin(f / 9)) : 0;
  const sag = mode === "slack" ? 30 - pushing * 55 : 0;
  const path = chainPath(sag);
  const frontTurnPx = 2 * Math.PI * FRONT.r;
  const speed =
    mode === "slack"
      ? 0
      : mode === "ratio"
        ? frontTurnPx / CHAIN_FRONT_TURN
        : mode === "drive"
          ? 9
          : 4;
  const s = f * speed;
  const fAng = (s / FRONT.r) * (180 / Math.PI);
  const rAng = (s / REAR.r) * (180 / Math.PI);
  const n = Math.round(path.total / 21);
  const pitch = path.total / n;
  const show = spring({ frame: f - 15, fps, config: { damping: 14 } });
  const spray =
    mode === "slack"
      ? spring({ frame: f - 60, fps, config: { damping: 16 } })
      : 0;

  return (
    <svg
      viewBox="0 0 600 900"
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
    >
      {/* roue arrière derrière la couronne */}
      {mode === "drive" && (
        <g>
          <circle
            cx={REAR.x}
            cy={REAR.y}
            r={192}
            fill="#2B2D42"
            stroke={INK}
            strokeWidth={S}
          />
          <circle
            cx={REAR.x}
            cy={REAR.y}
            r={165}
            fill={C.cream}
            stroke={INK}
            strokeWidth={5}
          />
          <rect
            x={20}
            y={FRONT.y - 85}
            width={150}
            height={170}
            rx={26}
            fill={C.grey}
            stroke={INK}
            strokeWidth={S}
          />
          <text
            x={95}
            y={FRONT.y - 95}
            textAnchor="middle"
            fontFamily={TITLE_FONT}
            fontSize={34}
            fill={INK}
          >
            BOÎTE
          </text>
        </g>
      )}
      <Sprocket c={REAR} angle={rAng} color={C.orange} />
      <Sprocket c={FRONT} angle={fAng} color={C.sky} />
      {/* maillons */}
      {Array.from({ length: n }, (_, i) => {
        const p = path.at(i * pitch + s);
        return (
          <g
            key={i}
            transform={`translate(${p.x} ${p.y}) rotate(${(p.a * 180) / Math.PI})`}
          >
            <rect
              x={-pitch / 2 - 3}
              y={-10}
              width={pitch + 6}
              height={20}
              rx={10}
              fill={i % 2 ? C.metal : C.grey}
              stroke={INK}
              strokeWidth={4}
            />
            <circle r={4.5} fill={INK} />
          </g>
        );
      })}
      {/* force qui passe par le brin du haut */}
      {mode === "drive" &&
        [0, 1, 2].map((i) => {
          const t = (f / 40 + i / 3) % 1;
          const p = path.at(t * (REAR.x - FRONT.x));
          return (
            <g
              key={i}
              transform={`translate(${p.x} ${p.y - 44}) rotate(${(p.a * 180) / Math.PI})`}
              opacity={interpolate(t, [0, 0.15, 0.85, 1], [0, 1, 1, 0])}
            >
              <path
                d="M -22 -14 L 4 -14 L 4 -26 L 28 0 L 4 26 L 4 14 L -22 14 Z"
                fill={C.yellow}
                stroke={INK}
                strokeWidth={5}
                strokeLinejoin="round"
              />
            </g>
          );
        })}
      {mode === "drive" && (
        <g transform="translate(300 160) rotate(-3)">
          <rect
            x={-190}
            y={-46}
            width={380}
            height={92}
            rx={22}
            fill={C.yellow}
            stroke={INK}
            strokeWidth={S}
          />
          <text
            y={18}
            textAnchor="middle"
            fontFamily={TITLE_FONT}
            fontSize={48}
            fill={INK}
          >
            BOÎTE → ROUE
          </text>
        </g>
      )}

      {/* étiquettes */}
      {(labels || mode === "parts") && (
        <g>
          <Tag x={150} y={250} text="CHAÎNE" tx={230} ty={378} show={show} />
          <Tag
            x={120}
            y={720}
            text="PIGNON"
            tx={FRONT.x}
            ty={FRONT.y + 40}
            show={show}
          />
          <Tag
            x={430}
            y={740}
            text="COURONNE"
            tx={REAR.x + 40}
            ty={REAR.y + 110}
            show={show}
          />
        </g>
      )}

      {/* rapport : on compte les tours */}
      {mode === "ratio" && (
        <g>
          <text
            x={FRONT.x}
            y={FRONT.y - 85}
            textAnchor="middle"
            fontFamily={TITLE_FONT}
            fontSize={34}
            fill={INK}
          >
            15 dents
          </text>
          <text
            x={REAR.x}
            y={REAR.y - 180}
            textAnchor="middle"
            fontFamily={TITLE_FONT}
            fontSize={34}
            fill={INK}
          >
            45 dents
          </text>
          <Counter
            x={150}
            y={790}
            title="PIGNON"
            n={Math.floor(f / CHAIN_FRONT_TURN)}
            color={C.sky}
          />
          <Counter
            x={450}
            y={790}
            title="ROUE"
            n={Math.floor(f / (CHAIN_FRONT_TURN * 3))}
            color={C.orange}
          />
        </g>
      )}

      {/* astuce : flèche (jeu) au milieu du brin du bas + graissage */}
      {mode === "slack" && (
        <g>
          <g
            transform={`translate(${path.mid.x} ${path.mid.y + 30 + 70 - pushing * 55})`}
          >
            <rect
              x={-22}
              y={0}
              width={44}
              height={110}
              rx={20}
              fill={C.cream}
              stroke={INK}
              strokeWidth={S}
            />
            <rect
              x={-14}
              y={8}
              width={28}
              height={22}
              rx={8}
              fill={C.white}
              stroke={INK}
              strokeWidth={4}
            />
          </g>
          <g transform={`translate(${path.mid.x - 60} ${path.mid.y + 15})`}>
            <path
              d="M 0 0 L 0 90"
              stroke={C.red}
              strokeWidth={8}
              strokeLinecap="round"
            />
            <path
              d="M -14 16 L 0 0 L 14 16 M -14 74 L 0 90 L 14 74"
              fill="none"
              stroke={C.red}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x={-130}
              y={105}
              width={170}
              height={56}
              rx={14}
              fill={C.yellow}
              stroke={INK}
              strokeWidth={5}
            />
            <text
              x={-45}
              y={144}
              textAnchor="middle"
              fontFamily={TITLE_FONT}
              fontSize={36}
              fill={INK}
            >
              FLÈCHE
            </text>
          </g>
          <text
            x={240}
            y={870}
            textAnchor="middle"
            fontFamily={BODY_FONT}
            fontWeight={900}
            fontSize={34}
            fill={INK}
          >
            Valeur : voir ton manuel
          </text>
          {/* bombe de graisse */}
          <g
            transform={`translate(${interpolate(spray, [0, 1], [700, 470])} 220) rotate(-25)`}
          >
            <rect
              x={-40}
              y={-80}
              width={80}
              height={160}
              rx={18}
              fill={GREEN}
              stroke={INK}
              strokeWidth={S}
            />
            <rect
              x={-18}
              y={-110}
              width={36}
              height={34}
              rx={8}
              fill={C.white}
              stroke={INK}
              strokeWidth={5}
            />
            <text
              y={14}
              textAnchor="middle"
              fontFamily={TITLE_FONT}
              fontSize={26}
              fill={C.white}
              transform="rotate(-90)"
            >
              GRAISSE
            </text>
          </g>
          {spray > 0.9 &&
            Array.from({ length: 6 }, (_, i) => {
              const k = (f * 0.06 + i / 6) % 1;
              return (
                <circle
                  key={i}
                  cx={430 - k * 60 + (i % 2) * 14}
                  cy={170 + k * 110}
                  r={7 - k * 3}
                  fill={GREEN}
                  stroke={INK}
                  strokeWidth={2}
                  opacity={1 - k}
                />
              );
            })}
        </g>
      )}
    </svg>
  );
};

// Zoom sur la chaîne : plaques, axes, rouleaux et joints toriques qui gardent la graisse.
export const ChainLink: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const P = 220;
  const off = (f * 1.5) % (2 * P);
  const pins = Array.from({ length: 6 }, (_, k) => -2 * P + k * P + off);
  const show = spring({ frame: f - 15, fps, config: { damping: 14 } });
  const CY = 470;
  return (
    <svg
      viewBox="0 0 600 900"
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
    >
      <defs>
        <clipPath id="linkzoom">
          <rect x={0} y={250} width={600} height={440} rx={40} />
        </clipPath>
        <clipPath id="linktop"><rect x={0} y={0} width={600} height={CY} /></clipPath>
      </defs>
      <rect
        x={0}
        y={250}
        width={600}
        height={440}
        rx={40}
        fill={C.white}
        stroke={INK}
        strokeWidth={S}
      />
      <g clipPath="url(#linkzoom)">
        {/* rouleaux (visibles dans la moitié du bas, en coupe) */}
        {pins.map((x, k) => (
          <circle key={`rb${k}`} cx={x} cy={CY} r={60} fill={C.orange} stroke={INK} strokeWidth={6} />
        ))}
        <g clipPath="url(#linktop)">
        {/* plaques intérieures puis extérieures, en alternance */}
        {pins.slice(0, -1).map((x, k) => {
          const outer = k % 2 === 0;
          return outer ? null : (
            <rect
              key={`i${k}`}
              x={x - 78}
              y={CY - 78}
              width={P + 156}
              height={156}
              rx={78}
              fill={C.metal}
              stroke={INK}
              strokeWidth={6}
            />
          );
        })}
        
        {pins.slice(0, -1).map((x, k) => {
          const outer = k % 2 === 0;
          return outer ? (
            <g key={`o${k}`}>
              <path
                d={`M ${x - 90} ${CY} a 90 90 0 0 1 90 -90 L ${x + P} ${CY - 90} a 90 90 0 0 1 0 180 L ${x} ${CY + 90} a 90 90 0 0 1 -90 -90 Z`}
                fill={C.grey}
                stroke={INK}
                strokeWidth={6}
                opacity={0.92}
              />
            </g>
          ) : null;
        })}
        </g>
        <line x1={0} y1={CY} x2={600} y2={CY} stroke={INK} strokeWidth={4} strokeDasharray="14 10" />
        {pins.map((x, k) => (
          <g key={`p${k}`}>
            <circle
              cx={x}
              cy={CY}
              r={40}
              fill="none"
              stroke={C.red}
              strokeWidth={7}
            />
            <circle
              cx={x}
              cy={CY}
              r={24}
              fill={C.metal}
              stroke={INK}
              strokeWidth={5}
            />
          </g>
        ))}
      </g>
      <Tag x={130} y={190} text="PLAQUES" tx={200} ty={CY - 55} show={show} />
      <Tag
        x={440}
        y={190}
        text="AXE"
        tx={pins[3]}
        ty={CY - 10}
        show={show}
      />
      <Tag x={150} y={770} text="ROULEAU" tx={pins[2] - 10} ty={CY + 50} show={show} />
      <Tag
        x={420}
        y={770}
        text="JOINT TORIQUE"
        tx={pins[3] + 20}
        ty={CY + 20}
        show={show}
      />
    </svg>
  );
};
