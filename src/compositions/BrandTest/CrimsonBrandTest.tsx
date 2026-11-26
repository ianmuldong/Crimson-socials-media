import React from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fonts } from "../../brand/theme";
import { FilmGrain } from "../../components/effects/FilmGrain";
import { LightSweep } from "../../components/effects/LightSweep";
import { SpeedStripes } from "../../components/effects/SpeedStripes";
import { Vignette } from "../../components/effects/Vignette";
import { SlamLetters } from "../../components/typography/SlamLetters";
import { TrackingReveal } from "../../components/typography/TrackingReveal";
import { VolleyballMark } from "../../components/typography/VolleyballMark";

/**
 * Five-second brand test. Timeline (seconds):
 * 0.0  black → crimson glow blooms, stripes streak through
 * 0.3  volleyball mark draws on
 * 0.9  "CRIMSON" slams in letter by letter
 * 1.9  "VOLLEYBALL CLUB" bar reveal
 * 2.8  handle + light sweep
 * 4.3  flash out to crimson / black
 */

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 55% at 50% 45%, ${colors.crimson} 0%, ${colors.maroon} 38%, ${colors.black} 75%)`,
          opacity: interpolate(
            frame,
            [0, 0.8 * fps, durationInFrames],
            [0, 0.9, 0.75],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
          scale: interpolate(frame, [0, durationInFrames], [1.25, 1]),
        }}
      />
      {/* giant outlined monogram drifting behind everything */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 980,
            lineHeight: 1,
            color: "transparent",
            WebkitTextStroke: `4px rgba(255,255,255,0.09)`,
            translate: `${interpolate(frame, [0, durationInFrames], [120, -120])}px 0px`,
            opacity: interpolate(frame, [0.2 * fps, 1.2 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          CVC
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CameraPush: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{ scale: interpolate(frame, [0, durationInFrames], [1, 1.07]) }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Handle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Interactive.Div
      name="Handle"
      style={{
        fontFamily: fonts.body,
        fontWeight: 800,
        fontSize: 46,
        color: colors.offWhite,
        letterSpacing: "0.12em",
        opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame, [0, 0.6 * fps], ["0px 40px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      @crimson.vc
    </Interactive.Div>
  );
};

const Underline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        width: 620,
        height: 12,
        background: `linear-gradient(90deg, ${colors.maroon}, ${colors.crimsonBright}, ${colors.maroon})`,
        scale: `${interpolate(frame, [0, 0.6 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.65, 0, 0.35, 1),
        })} 1`,
        boxShadow: `0 0 40px ${colors.crimson}`,
      }}
    />
  );
};

const FlashOut: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <AbsoluteFill
        style={{
          backgroundColor: colors.white,
          opacity: interpolate(
            frame,
            [0, 0.07 * fps, 0.25 * fps],
            [0, 0.85, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: colors.black,
          opacity: interpolate(frame, [0.35 * fps, 0.7 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </>
  );
};

export const CrimsonBrandTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // subtle impact shake as the headline lands
  const shake = interpolate(frame, [1.25 * fps, 1.6 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shakeOn = frame >= 1.25 * fps;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.black, overflow: "hidden" }}>
      <Backdrop />
      <SpeedStripes start={0.1 * fps} />
      <CameraPush>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: 40,
            translate: shakeOn
              ? `${Math.sin(frame * 2.3) * 14 * shake}px ${Math.cos(frame * 1.7) * 10 * shake}px`
              : "0px 0px",
          }}
        >
          <VolleyballMark size={260} startSec={0.3} />
          <SlamLetters
            text="CRIMSON"
            fontSize={250}
            startSec={0.9}
            staggerSec={0.045}
          />
          <Sequence
            from={Math.round(1.9 * fps)}
            layout="none"
            name="Volleyball Club"
          >
            <TrackingReveal text="VOLLEYBALL CLUB" fontSize={58} startSec={0} />
          </Sequence>
          <Sequence from={Math.round(2.4 * fps)} layout="none" name="Underline">
            <Underline />
          </Sequence>
          <div style={{ height: 30 }} />
          <Sequence from={Math.round(2.8 * fps)} layout="none" name="Handle">
            <Handle />
          </Sequence>
        </AbsoluteFill>
      </CameraPush>
      <LightSweep start={2.9 * fps} duration={0.9 * fps} />
      <Vignette />
      <FilmGrain />
      <Sequence from={Math.round(4.3 * fps)} name="Flash out">
        <FlashOut />
      </Sequence>
    </AbsoluteFill>
  );
};
