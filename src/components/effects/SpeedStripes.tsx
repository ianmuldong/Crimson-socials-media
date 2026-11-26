import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../../brand/theme";

/** Diagonal athletic stripes that streak through the frame. */
export const SpeedStripes: React.FC<{
  start: number;
  count?: number;
  color?: string;
}> = ({ start, count = 5, color = colors.crimsonBright }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {new Array(count).fill(true).map((_, i) => {
        const s = start + i * 3;
        const p = interpolate(frame, [s, s + 18], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.7, 0, 0.2, 1),
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 300 + i * 260,
              left: -400,
              width: 1900,
              height: 16 + (i % 3) * 18,
              background: i % 2 === 0 ? color : colors.white,
              boxShadow:
                i % 2 === 0 ? `0 0 30px ${colors.crimsonBright}` : "none",
              opacity: (1 - Math.abs(p - 0.5) * 2) * (i % 2 === 0 ? 0.9 : 0.35),
              rotate: "-24deg",
              translate: `${interpolate(p, [0, 1], [-1600, 1600])}px 0px`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
