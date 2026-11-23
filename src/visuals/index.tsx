import type { VisualSpec } from "../types";
import { Engine4T } from "./Engine4T";
import { OilCheck } from "./OilCheck";
import { MotoBike } from "./MotoBike";
import { PartMascot } from "../components/Mascots";
import { LogoMark } from "../components/Logo";

// Registre des visuels. Pour un nouveau sujet, ajoute un composant SVG ici
// (ex. "chain", "brakes", "sparkplug") et référence-le dans script.json.
export const Visual: React.FC<{ spec?: VisualSpec }> = ({ spec }) => {
  if (!spec) return null;
  const s = spec as Record<string, any>;
  switch (spec.kind) {
    case "engine4t":
      return <Engine4T stroke={s.stroke} speed={s.speed} labels={s.labels} highlight={s.highlight} />;
    case "bike":
      return <MotoBike focus={s.focus} boom={s.boom} label={s.label} />;
    case "oilcheck":
      return <OilCheck />;
    case "mascot":
      return <PartMascot id={s.id} size={560} pose={s.pose} />;
    case "logo":
      return <LogoMark size={600} />;
    default:
      throw new Error(`Visuel inconnu: "${spec.kind}". Ajoute-le dans src/visuals/index.tsx`);
  }
};
