import type { VisualSpec } from "../types";
import { Engine4T } from "./Engine4T";
import { OilCheck } from "./OilCheck";
import { MotoBike } from "./MotoBike";
import { Clutch, ClutchLever } from "./Clutch";
import { Chain, ChainLink } from "./Chain";
import { Brake, BrakePads } from "./Brake";
import { Tire, TireCheck } from "./Tire";
import { Pistou } from "../components/Mascots";
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
    case "clutch":
      return <Clutch state={s.state} labels={s.labels} />;
    case "clutchlever":
      return <ClutchLever />;
    case "chain":
      return <Chain mode={s.mode} labels={s.labels} />;
    case "chainlink":
      return <ChainLink />;
    case "brake":
      return <Brake mode={s.mode} labels={s.labels} />;
    case "brakepads":
      return <BrakePads />;
    case "tire":
      return <Tire mode={s.mode} />;
    case "tirecheck":
      return <TireCheck />;
    case "oilcheck":
      return <OilCheck />;
    case "mascot":
      return <Pistou size={560} pose={s.pose} />;
    case "logo":
      return <LogoMark size={600} />;
    default:
      throw new Error(`Visuel inconnu: "${spec.kind}". Ajoute-le dans src/visuals/index.tsx`);
  }
};
