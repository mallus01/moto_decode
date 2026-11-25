import { Composition, CalculateMetadataFunction } from "remotion";
import { MotoVideo } from "./MotoVideo";
import { MascotSheet, MascotStill } from "./MascotSheet";
import { FPS, HEIGHT, WIDTH } from "./brand";
import type { VideoProps } from "./types";
import { sceneFrames } from "./timing";
import sample from "../content/moteur-4-temps/script.json";

const calculateMetadata: CalculateMetadataFunction<VideoProps> = ({ props }) => {
  const total = props.scenes.reduce((s, sc) => s + sceneFrames(sc.durationSec, sc.narration), 0);
  return { durationInFrames: total };
};

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="MotoVideo"
    component={MotoVideo}
    width={WIDTH}
    height={HEIGHT}
    fps={FPS}
    durationInFrames={FPS * 60}
    defaultProps={sample as VideoProps}
    calculateMetadata={calculateMetadata}
  />
  <Composition id="MascotSheet" component={MascotSheet} width={1920} height={800} fps={FPS} durationInFrames={90} />
  <Composition id="MascotStill" component={MascotStill} width={600} height={620} fps={FPS} durationInFrames={1} />
  </>
);
