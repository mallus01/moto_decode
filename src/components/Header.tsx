import { useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../brand";
import { BODY_FONT } from "../fonts";
import { LogoMark, Wordmark } from "./Logo";

// Bandeau du haut : logo + titre de l'épisode + barre de progression.
export const Header: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / durationInFrames;
  return (
    <div style={{ position: "absolute", top: 110, left: 60, right: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <LogoMark size={96} spin={frame * 0.6} />
        <div>
          <Wordmark fontSize={54} />
          <div style={{ fontFamily: BODY_FONT, fontWeight: 900, fontSize: 32, color: BRAND.colors.ink, opacity: 0.75, marginTop: 4 }}>{title}</div>
        </div>
      </div>
      <div style={{ marginTop: 22, height: 16, borderRadius: 10, background: BRAND.colors.white, border: `5px solid ${BRAND.colors.ink}`, overflow: "hidden" }}>
        <div style={{ width: `${p * 100}%`, height: "100%", background: BRAND.colors.orange }} />
      </div>
    </div>
  );
};
