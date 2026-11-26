import React from "react";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { AbsoluteFill, interpolate } from "remotion";
import { colors } from "../../brand/theme";

type Props = { color?: string };

/**
 * Cinematic transition: a crimson diagonal slash sweeps across, hiding the cut,
 * and the next scene is revealed behind it. Use with <TransitionSeries.Transition>.
 */
const CrimsonSlashPresentation: React.FC<
  TransitionPresentationComponentProps<Props>
> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps,
}) => {
  const color = passedProps.color ?? colors.crimson;
  const p = presentationProgress;
  // The slash crosses the frame; the cut happens at the midpoint.
  const slashX = interpolate(p, [0, 1], [-130, 130]);
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill
        style={{
          opacity: p < 0.5 ? 1 : 0,
          scale: interpolate(p, [0, 0.5], [1, 1.08], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: p >= 0.5 ? 1 : 0,
          scale: interpolate(p, [0.5, 1], [1.08, 1], {
            extrapolateLeft: "clamp",
          }),
        }}
      >
        {children}
      </AbsoluteFill>
      <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: "-40%",
            left: "-20%",
            width: "140%",
            height: "180%",
            rotate: "-18deg",
            translate: `${slashX}% 0%`,
            background: `linear-gradient(90deg, transparent 0%, ${colors.maroon} 30%, ${color} 42%, ${colors.white} 50%, ${color} 58%, ${colors.maroon} 70%, transparent 100%)`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const crimsonSlash = (
  props: Props = {},
): TransitionPresentation<Props> => ({
  component: CrimsonSlashPresentation,
  props,
});
