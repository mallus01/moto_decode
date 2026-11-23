import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import { FPS } from "./brand";
import type { VideoProps } from "./types";
import { Background } from "./components/Background";
import { Header } from "./components/Header";
import { SceneView } from "./scenes/SceneView";
import { sceneFrames } from "./timing";

export const MotoVideo: React.FC<VideoProps> = ({ title, scenes }) => (
  <AbsoluteFill>
    <Background />
    <Series>
      {scenes.map((sc, i) => {
        const frames = sceneFrames(sc.durationSec, sc.narration);
        const speech = sc.durationSec ? Math.ceil(sc.durationSec * FPS) : frames;
        return (
          <Series.Sequence key={i} durationInFrames={frames}>
            {sc.audio && <Audio src={staticFile(sc.audio)} />}
            <SceneView scene={sc} speechFrames={speech} />
          </Series.Sequence>
        );
      })}
    </Series>
    <Header title={title} />
  </AbsoluteFill>
);
