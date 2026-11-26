import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { campaign, headline } from "../config";
import { ClosingCard } from "../components/EndCards";
import { FootageShot } from "../components/FootageShot";
import { EdgeFades, Finish, Flash, TextArea } from "../components/Finish";
import { Kicker, KineticHeadline } from "../components/Kinetic";
import { MusicBed, Sfx } from "../components/Sfx";
import { StatReveal } from "../components/StatReveal";
import { C } from "../theme";

/** A. MAIN PROMOTIONAL REEL — 30 s @ 30 fps (900 frames). Cuts sit on a 120 BPM grid (15 frames = 1 beat). */
export const MAIN_PROMO_FRAMES = 900;

export const MainPromo: React.FC = () => {
  const stats = campaign.text.stats;
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      {/* 0–3 s HOOK */}
      <Sequence durationInFrames={90} name="Hook">
        <FootageShot shot="hook" />
        <TextArea top={640}>
          <KineticHeadline
            lines={headline().hook as unknown as string[]}
            size={230}
            align="left"
            startSec={0.15}
            staggerSec={0.14}
            accentIndex={headline().hook.length - 1}
            exitSec={2.6}
          />
        </TextArea>
      </Sequence>

      {/* 3–6 s EVENT REVEAL across two clips */}
      <Sequence from={90} durationInFrames={45} name="Reveal clip 1">
        <FootageShot shot="reveal1" />
      </Sequence>
      <Sequence from={135} durationInFrames={45} name="Reveal clip 2">
        <FootageShot shot="reveal2" />
      </Sequence>
      <Sequence from={90} durationInFrames={90} name="Reveal text">
        <TextArea top={700}>
          <KineticHeadline
            lines={headline().reveal as unknown as string[]}
            size={250}
            align="left"
            staggerSec={0.1}
            exitSec={2.65}
          />
          <div style={{ height: 24 }} />
          <Kicker
            text={headline().revealKicker}
            startSec={0.7}
            size={40}
            color={C.white}
          />
        </TextArea>
      </Sequence>

      {/* 6–10 s EVERY FRIDAY NIGHT (evergreen — no season or dates) */}
      <Sequence from={180} durationInFrames={60} name="Wide 1">
        <FootageShot shot="wide1" />
      </Sequence>
      <Sequence from={240} durationInFrames={60} name="Wide 2">
        <FootageShot shot="wide2" />
      </Sequence>
      <Sequence from={180} durationInFrames={120} name="Every Friday night">
        <TextArea top={720}>
          <KineticHeadline
            lines={["EVERY"]}
            styles={[{ size: 120, font: "display", color: C.accent2 }]}
            align="left"
          />
          <KineticHeadline
            lines={["FRIDAY", "NIGHT."]}
            size={250}
            align="left"
            startSec={0.4}
            staggerSec={0.12}
            exitSec={3.65}
          />
        </TextArea>
      </Sequence>

      {/* 10–18 s STATS (one per 2 s / 4 beats) */}
      {stats.map((s, i) => (
        <Sequence
          key={s}
          from={300 + i * 60}
          durationInFrames={60}
          name={`Stat ${i + 1}`}
        >
          <FootageShot
            shot={(["stat1", "stat2", "stat3", "stat4"] as const)[i]}
            push={0.1}
          />
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 75%)",
            }}
          />
          <StatReveal text={s} index={i} total={stats.length} durationSec={2} />
        </Sequence>
      ))}

      {/* 18–24 s COMMUNITY */}
      {(["community1", "community2", "community3", "community4"] as const).map(
        (k, i) => (
          <Sequence
            key={k}
            from={540 + i * 45}
            durationInFrames={45}
            name={`Community ${i + 1}`}
          >
            <FootageShot shot={k} />
          </Sequence>
        ),
      )}
      <Sequence from={540} durationInFrames={90} name="Good volleyball">
        <TextArea top={760}>
          <KineticHeadline
            lines={["GOOD", "VOLLEYBALL."]}
            size={200}
            align="left"
            staggerSec={0.12}
            exitSec={2.65}
          />
        </TextArea>
      </Sequence>
      <Sequence from={630} durationInFrames={90} name="Great company">
        <TextArea top={760}>
          <KineticHeadline
            lines={["GREAT", "COMPANY."]}
            size={220}
            align="left"
            staggerSec={0.12}
            accentIndex={1}
            exitSec={2.65}
          />
        </TextArea>
      </Sequence>

      {/* 24–30 s CLOSING + LOGOS */}
      <Sequence from={720} durationInFrames={180} name="Closing card">
        <ClosingCard />
      </Sequence>

      <Finish />
      <Flash at={90} />
      <Flash at={180} strength={0.4} />
      <Flash at={300} />
      <Flash at={540} strength={0.5} />
      <EdgeFades />

      {/* sound design */}
      <MusicBed total={MAIN_PROMO_FRAMES} />
      <Sfx name="bass-hit" at={4} />
      <Sfx name="whoosh" at={84} />
      <Sfx name="bass-hit" at={92} volume={0.7} />
      <Sfx name="whoosh" at={174} />
      <Sfx name="riser" at={252} volume={0.6} />
      {stats.map((_, i) => (
        <Sfx key={i} name="bass-hit" at={300 + i * 60 + 2} volume={0.75} />
      ))}
      <Sfx name="whoosh" at={534} />
      <Sfx name="bass-hit" at={632} volume={0.6} />
      <Sfx name="whoosh" at={714} />
      <Sfx name="bass-hit" at={765} volume={0.6} />
    </AbsoluteFill>
  );
};
