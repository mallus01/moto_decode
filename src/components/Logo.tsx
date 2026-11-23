import { BRAND } from "../brand";
import { BODY_FONT, TITLE_FONT } from "../fonts";

const C = BRAND.colors;

// Pictogramme : un piston dans un engrenage. Même dessin que brand/logo.svg.
export const LogoMark: React.FC<{ size?: number; spin?: number }> = ({ size = 120, spin = 0 }) => {
  const teeth = Array.from({ length: 10 }, (_, i) => i * 36);
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <g transform={`rotate(${spin} 100 100)`}>
        {teeth.map((a) => (
          <rect key={a} x="86" y="6" width="28" height="34" rx="6" fill={C.orange} stroke={C.ink} strokeWidth="7" transform={`rotate(${a} 100 100)`} />
        ))}
        <circle cx="100" cy="100" r="70" fill={C.orange} stroke={C.ink} strokeWidth="8" />
      </g>
      <circle cx="100" cy="100" r="52" fill={C.cream} stroke={C.ink} strokeWidth="7" />
      {/* piston */}
      <rect x="72" y="62" width="56" height="44" rx="8" fill={C.metal} stroke={C.ink} strokeWidth="6" />
      <line x1="72" y1="76" x2="128" y2="76" stroke={C.ink} strokeWidth="5" />
      <line x1="100" y1="106" x2="100" y2="138" stroke={C.ink} strokeWidth="10" strokeLinecap="round" />
      <circle cx="100" cy="140" r="9" fill={C.yellow} stroke={C.ink} strokeWidth="5" />
    </svg>
  );
};

export const Wordmark: React.FC<{ fontSize?: number; by?: boolean }> = ({ fontSize = 64, by = true }) => (
  <div style={{ display: "flex", alignItems: "center", gap: fontSize * 0.25 }}>
    <div style={{ fontFamily: TITLE_FONT, fontSize, lineHeight: 0.95, color: C.ink, letterSpacing: 1 }}>
      <span style={{ color: C.ink }}>MOTO </span>
      <span style={{ color: C.orange, WebkitTextStroke: `${Math.max(2, fontSize / 22)}px ${C.ink}`, paintOrder: "stroke fill" }}>DÉCODE</span>
    </div>
    {by && <ByTag fontSize={fontSize * 0.5} />}
  </div>
);

// Signature « by Fazerr » (nom de la chaîne TikTok).
export const ByTag: React.FC<{ fontSize?: number }> = ({ fontSize = 30 }) => (
  <div
    style={{
      fontFamily: BODY_FONT,
      fontWeight: 900,
      fontSize,
      color: C.white,
      background: C.ink,
      borderRadius: fontSize,
      padding: `${fontSize * 0.1}px ${fontSize * 0.5}px ${fontSize * 0.18}px`,
      transform: "rotate(-4deg)",
      whiteSpace: "nowrap",
    }}
  >
    by <span style={{ color: C.yellow }}>{BRAND.author}</span>
  </div>
);
