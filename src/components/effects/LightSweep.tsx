import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

/**
 * A diagonal beam of light that sweeps across the frame.
 * `start` and `duration` are in frames relative to the parent Sequence.
 */
export const LightSweep: React.FC<{
  start: number;
  duration: number;
  color?: string;
  width?: number;
  angle?: number;
}> = ({
  start,
  duration,
  color = "rgba(255,255,255,0.55)",
  width = 260,
  angle = 22,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });
  if (progress <= 0 || progress >= 1) return null;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        overflow: "hidden",
        mixBlendMode: "screen",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: 0,
          width,
          height: "200%",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          rotate: `${angle}deg`,
          translate: `${interpolate(progress, [0, 1], [-600, 1700])}px 0px`,
          filter: "blur(18px)",
        }}
      />
    </AbsoluteFill>
  );
};
