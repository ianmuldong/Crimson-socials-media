import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, ease, F } from "../theme";

/**
 * Conservative width estimate for Anton (condensed display face), in em.
 * Used to shrink any headline line that would overflow the safe area.
 */
const antonEm = (text: string) =>
  [...text].reduce(
    (w, ch) =>
      w +
      (/[MW]/.test(ch)
        ? 0.64
        : /[I1J]/.test(ch)
          ? 0.27
          : /[ .,'’:]/.test(ch)
            ? 0.22
            : /[×]/.test(ch)
              ? 0.5
              : 0.5),
    0,
  );
export const fitSize = (
  text: string,
  desired: number,
  maxWidth = 830,
  font: "display" | "body" = "display",
  tracking = 0,
) =>
  Math.min(
    desired,
    Math.floor(
      maxWidth /
        ((font === "display" ? antonEm(text) : text.length * 0.72) +
          text.length * tracking),
    ),
  );

type LineStyle = {
  size: number;
  color?: string;
  font?: "display" | "body";
  tracking?: string;
  outline?: boolean;
};

/**
 * Kinetic headline: each line rises out of a mask with a short vertical
 * motion-blur, staggered. Optional exit pushes lines up and out.
 * All timing in seconds, relative to the parent Sequence.
 */
export const KineticHeadline: React.FC<{
  lines: string[];
  styles?: LineStyle[];
  size?: number;
  startSec?: number;
  staggerSec?: number;
  exitSec?: number | null;
  align?: "left" | "center";
  gap?: number;
  accentIndex?: number | null;
  /** Max line width in px; longer lines shrink to fit (safe area = 840). */
  maxWidth?: number;
}> = ({
  lines,
  styles,
  size = 150,
  startSec = 0,
  staggerSec = 0.12,
  exitSec = null,
  align = "center",
  gap = 0,
  accentIndex = null,
  maxWidth = 830,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        gap,
      }}
    >
      {lines.map((line, i) => {
        const raw = styles?.[i] ?? { size };
        const st = {
          ...raw,
          size:
            raw.font === "body" ? raw.size : fitSize(line, raw.size, maxWidth),
        };
        const s = (startSec + i * staggerSec) * fps;
        const p = interpolate(frame, [s, s + 0.5 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(...ease.out),
        });
        const v = interpolate(
          frame,
          [s, s + 0.12 * fps, s + 0.35 * fps],
          [0, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const e =
          exitSec === null
            ? 0
            : interpolate(
                frame,
                [(exitSec + i * 0.04) * fps, (exitSec + i * 0.04 + 0.3) * fps],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(...ease.inOut),
                },
              );
        const accent = accentIndex === i;
        const color = st.color ?? (accent ? C.accent : C.white);
        return (
          <div
            key={i}
            style={{
              overflow: "hidden",
              padding: "0 6px",
              marginBottom: -st.size * 0.06,
            }}
          >
            <div
              style={{
                fontFamily: st.font === "body" ? F.body : F.display,
                fontWeight: st.font === "body" ? 900 : 400,
                fontSize: st.size,
                lineHeight: 1.04,
                letterSpacing:
                  st.tracking ?? (st.font === "body" ? "0.18em" : "0.005em"),
                color: st.outline ? "transparent" : color,
                WebkitTextStroke: st.outline ? `3px ${C.white}` : undefined,
                whiteSpace: "nowrap",
                translate: `0px ${(1 - p) * 110 - e * 110}%`,
                filter: `blur(${v * 6 + e * 4}px)`,
                textShadow: st.outline
                  ? undefined
                  : "0 6px 30px rgba(0,0,0,0.45)",
              }}
            >
              {line}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Thin animated rule used to separate editorial text blocks. */
export const Rule: React.FC<{
  startSec: number;
  width?: number;
  color?: string;
}> = ({ startSec, width = 220, color = C.accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(
    frame,
    [startSec * fps, (startSec + 0.45) * fps],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(...ease.inOut),
    },
  );
  return (
    <div
      style={{
        width,
        height: 8,
        background: color,
        scale: `${p} 1`,
        transformOrigin: "left",
      }}
    />
  );
};

/** Small spaced-out label (kicker) above a headline. */
export const Kicker: React.FC<{
  text: string;
  startSec?: number;
  color?: string;
  size?: number;
  tracking?: number;
}> = ({ text, startSec = 0, color = C.bone, size = 34, tracking = 0.3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(
    frame,
    [startSec * fps, (startSec + 0.4) * fps],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(...ease.out),
    },
  );
  return (
    <div
      style={{
        fontFamily: F.body,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: `${tracking + 0.2 - p * 0.2}em`,
        color,
        opacity: p,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};
