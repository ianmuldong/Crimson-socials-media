import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../../brand/theme";

/** Wide-tracked subtitle that reveals from behind a moving crimson bar. */
export const TrackingReveal: React.FC<{
  text: string;
  fontSize: number;
  startSec: number;
  color?: string;
  barColor?: string;
}> = ({
  text,
  fontSize,
  startSec,
  color = colors.white,
  barColor = colors.crimson,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = startSec * fps;
  const bar = interpolate(
    frame,
    [s, s + 0.35 * fps, s + 0.7 * fps],
    [0, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.65, 0, 0.35, 1),
    },
  );
  const barOrigin = frame < s + 0.35 * fps ? "left" : "right";
  const textOn = frame >= s + 0.35 * fps;
  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        padding: "6px 18px",
      }}
    >
      <div
        style={{
          fontFamily: fonts.body,
          fontWeight: 900,
          fontSize,
          color,
          opacity: textOn ? 1 : 0,
          letterSpacing: `${interpolate(
            frame,
            [s + 0.35 * fps, s + 1.8 * fps],
            [0.55, 0.32],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          )}em`,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: barColor,
          scale: `${bar} 1`,
          transformOrigin: barOrigin,
        }}
      />
    </div>
  );
};
