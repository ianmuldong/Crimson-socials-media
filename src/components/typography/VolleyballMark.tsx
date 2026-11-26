import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../brand/theme";

/**
 * Line-art volleyball that draws itself on, then spins.
 * Placeholder mark until the club logo is added to public/brand/logos.
 */
export const VolleyballMark: React.FC<{
  size: number;
  startSec?: number;
  color?: string;
}> = ({ size, startSec = 0, color = colors.white }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = startSec * fps;
  const draw = interpolate(frame, [s, s + 0.9 * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });
  // Seam geometry adapted from the Lucide "volleyball" icon (ISC licence).
  const paths = [
    "M 12 2 A 10 10 0 1 1 11.99 2",
    "M 11.1 7.1 a 16.55 16.55 0 0 1 10.9 4",
    "M 12 12 a 12.6 12.6 0 0 1 -8.7 5",
    "M 16.8 13.6 a 16.55 16.55 0 0 1 -9 7.5",
    "M 20.7 17 a 12.8 12.8 0 0 0 -8.7 -5 a 13.3 13.3 0 0 1 0 -10",
    "M 6.3 3.8 a 16.55 16.55 0 0 0 1.9 11.5",
  ];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        rotate: `${interpolate(frame, [s, s + 5 * fps], [-90, 200], { extrapolateLeft: "clamp" })}deg`,
        overflow: "visible",
        filter: `drop-shadow(0 0 24px ${colors.crimson})`,
      }}
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={i === 0 ? colors.crimson : color}
          strokeWidth={i === 0 ? 1.3 : 1.05}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={draw}
          opacity={draw >= 1 ? 0 : 1}
        />
      ))}
    </svg>
  );
};
