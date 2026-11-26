import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { campaign } from "../config";
import { Backdrop, ClosingCard } from "../components/EndCards";
import { FootageShot } from "../components/FootageShot";
import { EdgeFades, Finish, Flash, TextArea } from "../components/Finish";
import { KineticHeadline } from "../components/Kinetic";
import { OrganiserCredit } from "../components/Logos";
import { SessionTimeline } from "../components/SessionTimeline";
import { MusicBed, Sfx } from "../components/Sfx";
import {
  RotationScene,
  rotationSchedule,
  RotationSceneOptions,
} from "../scenes/RotationScene";
import { ServeScene, serveSceneSeconds } from "../scenes/ServeScene";
import { C } from "../theme";

/** B. COMPLETE PROMOTIONAL + INSTRUCTIONAL VIDEO (~75 s @ 30 fps). */
export const EXPLAINER_ROTATION: RotationSceneOptions = {
  zoomToCourt: true,
  rotations: 2,
  activeCourts: [0],
};

const T = (() => {
  const montage = 0;
  const orgs = 300;
  const newHere = orgs + 150;
  const session = newHere + 120;
  const rotation = session + 240;
  const rotFrames = Math.round(rotationSchedule(EXPLAINER_ROTATION).end * 30);
  const serve = rotation + rotFrames;
  const serveFrames = Math.round(serveSceneSeconds() * 30);
  const outro = serve + serveFrames;
  const closing = outro + 360;
  const end = closing + 210;
  return {
    montage,
    orgs,
    newHere,
    session,
    rotation,
    rotFrames,
    serve,
    serveFrames,
    outro,
    closing,
    end,
  };
})();
export const EXPLAINER_FRAMES = T.end;

export const FullExplainer: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.black }}>
    {/* 1 — promotional montage */}
    <Sequence durationInFrames={75} name="Montage hook">
      <FootageShot shot="hook" />
    </Sequence>
    <Sequence from={75} durationInFrames={45} name="Montage 2">
      <FootageShot shot="reveal1" />
    </Sequence>
    <Sequence from={120} durationInFrames={45} name="Montage 3">
      <FootageShot shot="reveal2" />
    </Sequence>
    <Sequence from={165} durationInFrames={60} name="Montage 4">
      <FootageShot shot="wide1" />
    </Sequence>
    <Sequence from={225} durationInFrames={75} name="Montage 5">
      <FootageShot shot="montage5" />
    </Sequence>
    <Sequence durationInFrames={120} name="Montage text 1">
      <TextArea top={700}>
        <KineticHeadline
          lines={["FRIDAY", "NIGHT"]}
          size={250}
          align="left"
          startSec={0.2}
          exitSec={3.6}
        />
      </TextArea>
    </Sequence>
    <Sequence from={120} durationInFrames={105} name="Montage text 2">
      <TextArea top={760}>
        <KineticHeadline
          lines={["INDOOR", "VOLLEYBALL", "SOCIALS."]}
          size={170}
          align="left"
          exitSec={3.2}
        />
      </TextArea>
    </Sequence>
    <Sequence from={225} durationInFrames={75} name="Montage text 3">
      <TextArea top={760}>
        <KineticHeadline
          lines={["ONE VOLLEYBALL", "COMMUNITY."]}
          size={150}
          align="left"
          accentIndex={1}
        />
      </TextArea>
    </Sequence>

    {/* 2 — organisers */}
    <Sequence from={T.orgs} durationInFrames={150} name="Organisers">
      <Backdrop />
      <AbsoluteFill
        style={{
          alignItems: "center",
          paddingTop: 420,
          gap: 40,
          paddingLeft: 90,
          paddingRight: 150,
        }}
      >
        <KineticHeadline
          lines={campaign.event.nameLines as unknown as string[]}
          size={96}
          staggerSec={0.08}
        />
        <OrganiserCredit startSec={0.4} size={260} gap={30} showNames />
      </AbsoluteFill>
    </Sequence>

    {/* 3 — new here? */}
    <Sequence from={T.newHere} durationInFrames={120} name="New here">
      <FootageShot shot="newhere" />
      <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,0.55)" }} />
      <TextArea top={720}>
        <KineticHeadline
          lines={["NEW TO", "FRIDAY SOCIALS?"]}
          size={150}
          align="left"
          staggerSec={0.1}
        />
        <div style={{ height: 30 }} />
        <KineticHeadline
          lines={["HERE'S HOW IT WORKS."]}
          styles={[
            { size: 64, font: "body", tracking: "0.04em", color: C.accent2 },
          ]}
          align="left"
          startSec={0.8}
        />
      </TextArea>
    </Sequence>

    {/* 4 — session structure */}
    <Sequence from={T.session} durationInFrames={240} name="Session timeline">
      <SessionTimeline durationSec={8} />
    </Sequence>

    {/* 5 — venue layout + rotations */}
    <Sequence
      from={T.rotation}
      durationInFrames={T.rotFrames}
      name="Court layout + rotations"
    >
      <RotationScene
        options={EXPLAINER_ROTATION}
        title={[
          "THE VENUE",
          `${campaign.event.mainCourts} MAIN COURTS · ${campaign.event.courts} PLAYING AREAS`,
        ]}
      />
    </Sequence>

    {/* 6 — serving rules */}
    <Sequence
      from={T.serve}
      durationInFrames={T.serveFrames}
      name="Serving rules"
    >
      <ServeScene />
    </Sequence>

    {/* 7 — back to real footage */}
    <Sequence from={T.outro} durationInFrames={90} name="Outro 1">
      <FootageShot shot="finale1" />
    </Sequence>
    <Sequence from={T.outro + 90} durationInFrames={90} name="Outro 2">
      <FootageShot shot="finale2" />
    </Sequence>
    <Sequence from={T.outro + 180} durationInFrames={90} name="Outro 3">
      <FootageShot shot="finale3" />
    </Sequence>
    <Sequence from={T.outro + 270} durationInFrames={90} name="Outro 4">
      <FootageShot shot="closing" />
    </Sequence>
    <Sequence from={T.outro} durationInFrames={90} name="Outro text 1">
      <TextArea top={760}>
        <KineticHeadline
          lines={["NOW YOU KNOW", "HOW IT WORKS."]}
          size={150}
          align="left"
          exitSec={2.65}
        />
      </TextArea>
    </Sequence>
    <Sequence from={T.outro + 90} durationInFrames={90} name="Outro text 2">
      <TextArea top={760}>
        <KineticHeadline
          lines={["IT'S YOUR", "TURN."]}
          size={230}
          align="left"
          accentIndex={1}
          exitSec={2.65}
        />
      </TextArea>
    </Sequence>
    <Sequence from={T.outro + 180} durationInFrames={90} name="Outro text 3">
      <TextArea top={760}>
        <KineticHeadline
          lines={["YOUR FRIDAY", "NIGHTS."]}
          size={170}
          align="left"
        />
        <KineticHeadline
          lines={["REDEFINED."]}
          size={170}
          align="left"
          startSec={0.55}
          accentIndex={0}
          exitSec={2.65}
        />
      </TextArea>
    </Sequence>
    <Sequence from={T.outro + 270} durationInFrames={90} name="Outro text 4">
      <TextArea top={780}>
        <KineticHeadline
          lines={["RUNNING", "ALL SUMMER LONG."]}
          size={150}
          align="left"
        />
      </TextArea>
    </Sequence>

    {/* 8 — closing */}
    <Sequence from={T.closing} durationInFrames={210} name="Closing card">
      <ClosingCard venueLines="short" />
    </Sequence>

    <Finish />
    {[
      75,
      120,
      165,
      225,
      T.newHere,
      T.outro + 90,
      T.outro + 180,
      T.outro + 270,
    ].map((f) => (
      <Flash key={f} at={f} strength={0.4} />
    ))}
    <EdgeFades />

    <MusicBed total={EXPLAINER_FRAMES} />
    <Sfx name="bass-hit" at={8} />
    {[75, 120, 165, 225].map((f) => (
      <Sfx key={f} name="whoosh" at={f - 6} volume={0.5} />
    ))}
    <Sfx name="bass-hit" at={T.orgs + 16} volume={0.6} />
    <Sfx name="whistle" at={T.session - 4} volume={0.8} />
    {[0.6, 1.6, 2.8, 4.6, 6.0].map((s) => (
      <Sfx key={s} name="tick" at={T.session + s * 30} />
    ))}
    <Sfx name="whoosh" at={T.rotation - 6} volume={0.6} />
    <Sfx name="whoosh" at={T.serve - 6} volume={0.6} />
    <Sfx name="riser" at={T.outro - 48} volume={0.6} />
    {[0, 90, 180].map((f) => (
      <Sfx key={f} name="bass-hit" at={T.outro + f + 2} volume={0.6} />
    ))}
    <Sfx name="whoosh" at={T.closing - 6} />
  </AbsoluteFill>
);
