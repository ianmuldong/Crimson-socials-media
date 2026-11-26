import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { campaign } from "../config";
import { Backdrop, OrganiserEndCard } from "../components/EndCards";
import { EdgeFades, Finish, TextArea } from "../components/Finish";
import { KineticHeadline } from "../components/Kinetic";
import { MusicBed, Sfx } from "../components/Sfx";
import {
  RotationScene,
  rotationSchedule,
  RotationSceneOptions,
} from "../scenes/RotationScene";
import { C } from "../theme";

/** C. STANDALONE ROTATION GUIDE — understandable without audio. */
export const GUIDE_OPTIONS: RotationSceneOptions = {
  zoomToCourt: false,
  rotations: 3,
  activeCourts: [0, 1],
};
const INTRO = 75;
const END = 105;
export const guideFrames = (fps: number) =>
  INTRO + Math.round(rotationSchedule(GUIDE_OPTIONS).end * fps) + END;

export const RotationGuide: React.FC = () => {
  const sceneFrames = Math.round(rotationSchedule(GUIDE_OPTIONS).end * 30);
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <Sequence durationInFrames={INTRO} name="Intro">
        <Backdrop />
        <TextArea top={700}>
          <KineticHeadline
            lines={[campaign.text.newHereRotate[0]]}
            styles={[
              { size: 64, font: "body", tracking: "0.06em", color: C.accent2 },
            ]}
            align="left"
          />
          <div style={{ height: 20 }} />
          <KineticHeadline
            lines={["HERE'S HOW", "TO ROTATE."]}
            size={190}
            align="left"
            startSec={0.3}
            exitSec={2.2}
          />
        </TextArea>
      </Sequence>
      <Sequence
        from={INTRO}
        durationInFrames={sceneFrames}
        name="Rotation demo"
      >
        <RotationScene
          options={GUIDE_OPTIONS}
          overviewCaption={`${campaign.event.mainCourts} MAIN COURTS · ${campaign.event.courts} PLAYING AREAS`}
        />
      </Sequence>
      <Sequence
        from={INTRO + sceneFrames}
        durationInFrames={END}
        name="End card"
      >
        <OrganiserEndCard />
      </Sequence>
      <Finish />
      <EdgeFades />
      <MusicBed total={guideFrames(30)} />
      <Sfx name="bass-hit" at={10} volume={0.6} />
      <Sfx name="whoosh" at={INTRO - 6} volume={0.6} />
      <Sfx name="whoosh" at={INTRO + sceneFrames - 6} volume={0.6} />
    </AbsoluteFill>
  );
};
