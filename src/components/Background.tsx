import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "../brand";

// Fond crème avec rayures diagonales qui défilent lentement (style BD).
export const Background: React.FC<{ tint?: string }> = ({ tint = BRAND.colors.cream }) => {
  const frame = useCurrentFrame();
  const offset = (frame * 1.2) % 80;
  return (
    <AbsoluteFill style={{ backgroundColor: tint, overflow: "hidden" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="stripes" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform={`rotate(-30) translate(${offset} 0)`}>
            <rect width="40" height="80" fill={BRAND.colors.orange} opacity={0.07} />
          </pattern>
          <pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse">
            <circle cx="18" cy="18" r="4" fill={BRAND.colors.ink} opacity={0.06} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stripes)" />
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </AbsoluteFill>
  );
};
