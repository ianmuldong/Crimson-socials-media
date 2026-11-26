import React from "react";
import { z } from "zod";
import { Audio, Video } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fonts } from "../../brand/theme";
import { FilmGrain } from "../../components/effects/FilmGrain";
import { LightSweep } from "../../components/effects/LightSweep";
import { Vignette } from "../../components/effects/Vignette";
import { crimsonSlash } from "../../components/transitions/crimsonSlash";
import { SlamLetters } from "../../components/typography/SlamLetters";
import { TrackingReveal } from "../../components/typography/TrackingReveal";

/**
 * Data-driven promo reel. `npm run reel` writes these props from your
 * processed footage, so the same template can build a new reel every week.
 * `src` paths are relative to the public/ folder.
 */
export const promoReelSchema = z.object({
  headline: z.string(),
  subline: z.string(),
  clips: z.array(
    z.object({
      src: z.string(),
      trimStartSec: z.number().min(0),
      durationSec: z.number().min(0.5),
      caption: z.string().optional(),
    }),
  ),
  music: z.string().nullable(),
  musicVolume: z.number().min(0).max(1),
  introSec: z.number().min(0.5),
  outroSec: z.number().min(0.5),
});
export type PromoReelProps = z.infer<typeof promoReelSchema>;

const TRANSITION_SEC = 0.4;

/** Returns a calculateMetadata bound to a frame rate (so 30 and 60 FPS both work). */
export const promoMetadataFor =
  (fps: number): CalculateMetadataFunction<PromoReelProps> =>
  ({ props }) => {
    const total =
      props.introSec +
      props.outroSec +
      props.clips.reduce((a, c) => a + c.durationSec, 0) -
      (props.clips.length + 1) * TRANSITION_SEC;
    return { durationInFrames: Math.max(1, Math.round(total * fps)), fps };
  };

const Caption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [0.2 * fps, 0.6 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "flex-start",
        padding: "0 80px 380px",
      }}
    >
      <div
        style={{
          background: colors.crimson,
          padding: "10px 26px",
          opacity: p,
          translate: `${(1 - p) * -60}px 0px`,
        }}
      >
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 92,
            color: colors.white,
            lineHeight: 1.05,
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ClipShot: React.FC<{
  src: string;
  trimStartSec: number;
  caption?: string;
}> = ({ src, trimStartSec, caption }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <AbsoluteFill
        style={{
          scale: interpolate(frame, [0, durationInFrames], [1.0, 1.08]),
        }}
      >
        <Video
          src={staticFile(src)}
          trimBefore={Math.round(trimStartSec * fps)}
          muted
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      </AbsoluteFill>
      {/* crimson grade: deepen shadows, warm highlights */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(90,10,22,0.35), rgba(0,0,0,0.1) 40%, rgba(90,10,22,0.55))`,
          mixBlendMode: "multiply",
        }}
      />
      {caption ? <Caption text={caption} /> : null}
    </AbsoluteFill>
  );
};

const TitleCard: React.FC<{ headline: string; subline: string }> = ({
  headline,
  subline,
}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 45%, ${colors.crimson} 0%, ${colors.maroon} 40%, ${colors.black} 80%)`,
      justifyContent: "center",
      alignItems: "center",
      gap: 36,
      flexDirection: "column",
    }}
  >
    <SlamLetters
      text={headline}
      fontSize={headline.length > 9 ? 150 : 220}
      startSec={0.1}
    />
    <TrackingReveal text={subline} fontSize={48} startSec={0.7} />
    <LightSweep start={20} duration={24} />
  </AbsoluteFill>
);

const EndCard: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: colors.black,
      justifyContent: "center",
      alignItems: "center",
      gap: 30,
      flexDirection: "column",
    }}
  >
    <SlamLetters
      text="CRIMSON"
      fontSize={200}
      startSec={0.1}
      staggerSec={0.035}
    />
    <TrackingReveal text="@CRIMSON.VC" fontSize={52} startSec={0.6} />
  </AbsoluteFill>
);

export const PromoReel: React.FC<PromoReelProps> = ({
  headline,
  subline,
  clips,
  music,
  musicVolume,
  introSec,
  outroSec,
}) => {
  const { fps } = useVideoConfig();
  const t = Math.round(TRANSITION_SEC * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <TransitionSeries name="Reel">
        <TransitionSeries.Sequence
          name="Intro"
          durationInFrames={Math.round(introSec * fps)}
        >
          <TitleCard headline={headline} subline={subline} />
        </TransitionSeries.Sequence>
        {clips.flatMap((c, i) => [
          <TransitionSeries.Transition
            key={`t${i}`}
            presentation={crimsonSlash()}
            timing={linearTiming({ durationInFrames: t })}
          />,
          <TransitionSeries.Sequence
            key={`c${i}`}
            name={`Clip ${i + 1}`}
            durationInFrames={Math.round(c.durationSec * fps)}
          >
            <ClipShot
              src={c.src}
              trimStartSec={c.trimStartSec}
              caption={c.caption}
            />
          </TransitionSeries.Sequence>,
        ])}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: t })}
        />
        <TransitionSeries.Sequence
          name="End card"
          durationInFrames={Math.round(outroSec * fps)}
        >
          <EndCard />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      {music ? <Audio src={staticFile(music)} volume={musicVolume} /> : null}
      <Vignette strength={0.55} />
      <FilmGrain opacity={0.07} />
    </AbsoluteFill>
  );
};
