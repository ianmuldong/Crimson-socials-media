import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { campaign } from "../config";
import { OrganiserEndCard } from "../components/EndCards";
import { FootageShot } from "../components/FootageShot";
import { EdgeFades, Finish, Flash, TextArea } from "../components/Finish";
import { Kicker, KineticHeadline } from "../components/Kinetic";
import { MusicBed, Sfx } from "../components/Sfx";
import { C } from "../theme";

/** D. FRIDAY NIGHT SOCIALS TEASER — 13 s @ 30 fps (390 frames). Evergreen; fast 1.5 s cuts on the beat. */
export const TEASER_FRAMES = 390;

const beats: {
  from: number;
  dur: number;
  shot: "teaser1" | "teaser2" | "teaser3" | "teaser4" | "teaser5" | "hook";
  lines: string[];
  size: number;
}[] = [
  {
    from: 0,
    dur: 45,
    shot: "teaser1",
    lines: ["PERTH'S", "FRIDAY NIGHTS."],
    size: 170,
  },
  { from: 45, dur: 45, shot: "teaser2", lines: ["SIX", "COURTS."], size: 250 },
  {
    from: 90,
    dur: 45,
    shot: "teaser3",
    lines: ["UP TO", "84 PLAYERS."],
    size: 200,
  },
  {
    from: 135,
    dur: 45,
    shot: "teaser4",
    lines: ["ALL SKILL", "LEVELS", "WELCOME."],
    size: 170,
  },
  {
    from: 180,
    dur: 60,
    shot: "teaser5",
    lines: ["FRIDAY NIGHT", "VOLLEYBALL", "SOCIALS."],
    size: 150,
  },
];

export const FridayNightTeaser: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.black }}>
    {beats.map((b, i) => (
      <Sequence
        key={i}
        from={b.from}
        durationInFrames={b.dur}
        name={b.lines.join(" ")}
      >
        <FootageShot shot={b.shot} push={0.1} />
        <TextArea top={720}>
          <KineticHeadline
            lines={b.lines}
            size={b.size}
            align="left"
            staggerSec={0.07}
            accentIndex={i === 0 ? 1 : null}
          />
        </TextArea>
      </Sequence>
    ))}
    <Sequence from={240} durationInFrames={45} name="Venue + day">
      <FootageShot shot="hook" push={0.1} />
      <TextArea top={760}>
        <KineticHeadline
          lines={[campaign.event.venueShort + "."]}
          size={130}
          align="left"
        />
        <div style={{ height: 16 }} />
        <Kicker
          text={campaign.event.day + "."}
          startSec={0.2}
          size={56}
          color={C.white}
        />
      </TextArea>
    </Sequence>
    <Sequence from={285} durationInFrames={105} name="End card">
      <OrganiserEndCard withEvent={false} />
    </Sequence>
    <Finish />
    {beats.map((b) => (
      <Flash key={b.from} at={b.from} strength={0.45} />
    ))}
    <Flash at={285} strength={0.5} />
    <EdgeFades />
    <MusicBed total={TEASER_FRAMES} />
    {beats.map((b) => (
      <Sfx key={b.from} name="bass-hit" at={b.from + 2} volume={0.7} />
    ))}
    <Sfx name="whoosh" at={236} />
    <Sfx name="whoosh" at={280} />
  </AbsoluteFill>
);
