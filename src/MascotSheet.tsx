import { AbsoluteFill } from "remotion";
import { BRAND } from "./brand";
import { BODY_FONT, TITLE_FONT } from "./fonts";
import { Background } from "./components/Background";
import { MASCOTS, PartMascot, type MascotId } from "./components/Mascots";

// Planche de présentation des 5 mascottes (brand/mascottes.png).
export const MascotSheet: React.FC = () => {
  const ids = Object.keys(MASCOTS) as MascotId[];
  return (
    <AbsoluteFill>
      <Background />
      <div style={{ position: "absolute", top: 60, width: "100%", textAlign: "center", fontFamily: TITLE_FONT, fontSize: 90, color: BRAND.colors.ink }}>
        La bande de <span style={{ color: BRAND.colors.orange }}>Moto Décode</span>
      </div>
      <div style={{ position: "absolute", top: 220, left: 40, right: 40, display: "flex", justifyContent: "space-between" }}>
        {ids.map((id) => (
          <div key={id} style={{ width: 360, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <PartMascot id={id} size={330} pose="wave" talking={false} bob={false} />
            <div style={{ fontFamily: TITLE_FONT, fontSize: 64, color: BRAND.colors.ink, marginTop: 30 }}>{MASCOTS[id].name}</div>
            <div style={{ fontFamily: BODY_FONT, fontWeight: 900, fontSize: 34, color: BRAND.colors.ink, opacity: 0.7 }}>{MASCOTS[id].part}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Une mascotte seule sur fond transparent (utilisée par l'outro HyperFrames).
export const MascotStill: React.FC<{ id: MascotId }> = ({ id }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <PartMascot id={id} size={520} pose="wave" talking={false} bob={false} />
  </AbsoluteFill>
);
