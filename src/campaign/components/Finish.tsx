import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FilmGrain } from "../../components/effects/FilmGrain";
import { Vignette } from "../../components/effects/Vignette";
import { C } from "../theme";

/** Shared finishing pass: vignette + fine grain. */
export const Finish: React.FC = () => (
  <>
    <Vignette strength={0.55} />
    <FilmGrain opacity={0.06} />
  </>
);

/** Short white flash that hides a hard cut on a beat. */
export const Flash: React.FC<{ at: number; strength?: number }> = ({
  at,
  strength = 0.7,
}) => (
  <Sequence
    from={Math.max(0, at - 2)}
    durationInFrames={10}
    layout="none"
    name="Flash"
  >
    <FlashInner strength={strength} />
  </Sequence>
);
const FlashInner: React.FC<{ strength: number }> = ({ strength }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.white,
        opacity: interpolate(f, [0, 2, 9], [0, strength, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        mixBlendMode: "screen",
      }}
    />
  );
};

/** Fade from/to black at the very start/end of a video. */
export const EdgeFades: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.black,
        opacity: interpolate(
          f,
          [durationInFrames - 8, durationInFrames - 1],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
        pointerEvents: "none",
      }}
    />
  );
};

/** Text area helper: absolute block inside the Reels safe zone. */
export const TextArea: React.FC<{
  top: number;
  children: React.ReactNode;
  align?: "left" | "center";
}> = ({ top, children, align = "left" }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 90,
      right: 150,
      display: "flex",
      flexDirection: "column",
      alignItems: align === "center" ? "center" : "flex-start",
    }}
  >
    {children}
  </div>
);
