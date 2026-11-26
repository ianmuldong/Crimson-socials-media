import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../../brand/theme";

/**
 * Bold athletic headline: each letter slams in with scale, blur and a crimson
 * glow, staggered. Timing is in seconds so it works at 30 or 60 FPS.
 */
export const SlamLetters: React.FC<{
  text: string;
  fontSize: number;
  startSec?: number;
  staggerSec?: number;
  color?: string;
  glow?: string;
  style?: React.CSSProperties;
}> = ({
  text,
  fontSize,
  startSec = 0,
  staggerSec = 0.05,
  color = colors.white,
  glow = colors.crimson,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        fontFamily: fonts.display,
        lineHeight: 0.9,
        ...style,
      }}
    >
      {text.split("").map((ch, i) => {
        const s = (startSec + i * staggerSec) * fps;
        const p = interpolate(frame, [s, s + 0.42 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontSize,
              color,
              whiteSpace: "pre",
              opacity: interpolate(p, [0, 0.25, 1], [0, 1, 1]),
              scale: interpolate(p, [0, 1], [2.1, 1]),
              translate: `0px ${interpolate(p, [0, 1], [-40, 0])}px`,
              filter: `blur(${interpolate(p, [0, 0.7, 1], [18, 1, 0])}px)`,
              textShadow: `0 0 ${interpolate(p, [0, 1], [80, 28])}px ${glow}, 0 8px 0 ${colors.maroon}`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};
