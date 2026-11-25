import { AbsoluteFill } from "remotion";
import { BRAND } from "./brand";
import { BODY_FONT, TITLE_FONT } from "./fonts";
import { Background } from "./components/Background";
import { MASCOT, Pistou, type Pose } from "./components/Mascots";

const POSES: { pose: Pose; label: string }[] = [
  { pose: "wave", label: "salue (accroche, outro)" },
  { pose: "wrench", label: "clé en main (astuce)" },
  { pose: "think", label: "réfléchit" },
];

// Planche de présentation de Pistou (brand/mascottes.png).
export const MascotSheet: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <div style={{ position: "absolute", top: 60, width: "100%", textAlign: "center", fontFamily: TITLE_FONT, fontWeight: 800, fontSize: 90, color: BRAND.colors.text }}>
      {MASCOT.name}, la mascotte de <span style={{ color: BRAND.colors.orange }}>Moto Décode</span>{" "}
      <span style={{ fontSize: 50 }}>by {BRAND.author}</span>
    </div>
    <div style={{ position: "absolute", top: 230, left: 160, right: 160, display: "flex", justifyContent: "space-between" }}>
      {POSES.map(({ pose, label }) => (
        <div key={pose} style={{ width: 440, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Pistou size={360} pose={pose} talking={false} bob={false} />
          <div style={{ fontFamily: BODY_FONT, fontWeight: 800, fontSize: 38, color: BRAND.colors.text, opacity: 0.8, marginTop: 30 }}>{label}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// Pistou seul sur fond transparent (utilisé par l'outro HyperFrames).
export const MascotStill: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <Pistou size={520} pose="wave" talking={false} bob={false} />
  </AbsoluteFill>
);
