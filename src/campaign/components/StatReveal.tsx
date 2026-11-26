import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, ease, F } from "../theme";
import { fitSize } from "./Kinetic";

/**
 * Animated statistic. If the text contains a number it counts up
 * ("UP TO 84 PLAYERS." → 0…84), otherwise the words slam in.
 * Index badge ("01 / 04") gives a broadcast-graphics feel.
 */
export const StatReveal: React.FC<{
  text: string;
  index: number;
  total: number;
  durationSec: number;
}> = ({ text, index, total, durationSec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = text.match(/^(.*?)(\d+)(.*)$/);
  const p = interpolate(frame, [0, 0.45 * fps], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(...ease.out),
  });
  const count = interpolate(frame, [0.05 * fps, 0.7 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.9, 0.3, 1),
  });
  const out = interpolate(
    frame,
    [(durationSec - 0.25) * fps, durationSec * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const words = text.split(" ");
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 150,
        top: 760,
        opacity: 1 - out,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          marginBottom: 18,
          opacity: p,
        }}
      >
        <div
          style={{
            fontFamily: F.body,
            fontWeight: 900,
            fontSize: 30,
            color: C.accent,
            letterSpacing: "0.2em",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>
        <div style={{ width: 90 * p, height: 4, background: C.white }} />
        <div
          style={{
            fontFamily: F.body,
            fontWeight: 800,
            fontSize: 30,
            color: C.mute,
            letterSpacing: "0.2em",
          }}
        >
          {String(total).padStart(2, "0")}
        </div>
      </div>
      {m ? (
        <div
          style={{
            fontFamily: F.display,
            color: C.white,
            lineHeight: 0.95,
            translate: `0px ${(1 - p) * 60}px`,
          }}
        >
          {m[1].trim() ? (
            <div style={{ fontSize: fitSize(m[1].trim(), 110, 830) }}>
              {m[1].trim()}
            </div>
          ) : null}
          <div
            style={{
              fontSize: 380,
              lineHeight: 0.92,
              fontVariantNumeric: "tabular-nums",
              textShadow: `0 0 60px rgba(200,16,46,0.35)`,
            }}
          >
            {Math.round(Number(m[2]) * count)}
          </div>
          <div
            style={{
              fontSize: fitSize(m[3].trim().replace(/^-/, ""), 130, 830),
              whiteSpace: "nowrap",
            }}
          >
            {m[3].trim().replace(/^-/, "")}
          </div>
        </div>
      ) : (
        <div
          style={{
            fontFamily: F.display,
            color: C.white,
            lineHeight: 1,
            fontSize: words.length > 2 ? 150 : 200,
          }}
        >
          {words.map((w, i) => {
            const wp = interpolate(
              frame,
              [(0.08 + i * 0.1) * fps, (0.45 + i * 0.1) * fps],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(...ease.out),
              },
            );
            return (
              <div key={i} style={{ overflow: "hidden" }}>
                <div
                  style={{
                    translate: `0px ${(1 - wp) * 105}%`,
                    color:
                      i === words.length - 1 && words.length > 2
                        ? C.accent2
                        : C.white,
                  }}
                >
                  {w}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
