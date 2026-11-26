import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../../brand/theme";

/** Kicker + headline block used at the top of instructional videos. */
export const SceneTitle: React.FC<{
  kicker: string;
  title: string;
  startSec?: number;
}> = ({ kicker, title, startSec = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = startSec * fps;
  const p = interpolate(frame, [s, s + 0.6 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return (
    <div
      style={{
        opacity: p,
        translate: `0px ${(1 - p) * 40}px`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: fonts.body,
          fontWeight: 900,
          fontSize: 40,
          letterSpacing: "0.3em",
          color: colors.crimsonBright,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          fontFamily: fonts.display,
          fontSize: 110,
          lineHeight: 1,
          color: colors.white,
          marginTop: 10,
        }}
      >
        {title}
      </div>
    </div>
  );
};
