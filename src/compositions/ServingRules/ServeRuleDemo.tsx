import React from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fonts } from "../../brand/theme";
import { PlayerToken } from "../../components/court/PlayerToken";
import { COURT, VolleyballCourt } from "../../components/court/VolleyballCourt";
import { FilmGrain } from "../../components/effects/FilmGrain";
import { Vignette } from "../../components/effects/Vignette";
import { SceneTitle } from "../../components/typography/SceneTitle";

export const serveRuleSchema = z.object({
  rules: z
    .array(z.object({ heading: z.string(), body: z.string() }))
    .min(1)
    .max(5),
  secondsPerRule: z.number().min(2).max(8),
});
export type ServeRuleProps = z.infer<typeof serveRuleSchema>;

const SCALE = 70;

/** Animated ball flight from behind the end line over the net. */
const ServeFlight: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = COURT.lengthM * SCALE;
  const W = COURT.widthM * SCALE;
  const serverX = W * 0.8;
  const serverY = L + SCALE * 1.1;
  const toss = interpolate(frame, [0.3 * fps, 0.9 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flight = interpolate(frame, [1.0 * fps, 2.2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.3, 0, 0.6, 1),
  });
  // Ball follows the same quadratic curve that is drawn as the trajectory.
  const p0 = { x: serverX, y: serverY - 30 };
  const p1 = { x: (serverX + W * 0.3) / 2, y: L * 0.45 };
  const p2 = { x: W * 0.3, y: L * 0.2 };
  const q = (a: number, b: number, c: number) =>
    (1 - flight) ** 2 * a + 2 * (1 - flight) * flight * b + flight ** 2 * c;
  const bx = q(p0.x, p1.x, p2.x);
  const tossLift = flight === 0 ? Math.sin(toss * Math.PI) * 60 : 0;
  const by = q(p0.y, p1.y, p2.y) - tossLift;
  const ballR = 22 + Math.sin(flight * Math.PI) * 12; // grows at the apex to suggest height
  const path = `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`;
  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={colors.crimsonBright}
        strokeWidth={6}
        pathLength={1}
        opacity={0.9}
        style={{ strokeDasharray: 1, strokeDashoffset: 1 - flight }}
      />
      <line
        x1={-SCALE * 2}
        y1={L}
        x2={W + SCALE * 2}
        y2={L}
        stroke={colors.crimsonBright}
        strokeWidth={10}
        opacity={0.6 + 0.4 * Math.sin(frame / 4)}
      />
      <PlayerToken
        x={serverX}
        y={serverY + 40}
        label="S"
        sublabel="Server"
        radius={44}
        highlight
      />
      <circle
        cx={bx}
        cy={by}
        r={ballR}
        fill={colors.white}
        stroke={colors.crimson}
        strokeWidth={6}
      />
    </g>
  );
};

const RuleCard: React.FC<{ index: number; heading: string; body: string }> = ({
  index,
  heading,
  body,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        bottom: 200,
        opacity: p,
        translate: `${(1 - p) * 80}px 0px`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 120,
            color: colors.crimsonBright,
            lineHeight: 1,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: 72,
            color: colors.white,
            lineHeight: 1,
          }}
        >
          {heading}
        </div>
      </div>
      <div
        style={{
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize: 44,
          color: colors.offWhite,
          marginTop: 18,
          lineHeight: 1.25,
        }}
      >
        {body}
      </div>
    </div>
  );
};

/** Serving-rule explainer: animated court + one rule card at a time. */
export const ServeRuleDemo: React.FC<ServeRuleProps> = ({
  rules,
  secondsPerRule,
}) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{ backgroundColor: colors.black, alignItems: "center" }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${colors.maroon} 0%, ${colors.black} 70%)`,
        }}
      />
      <div style={{ position: "absolute", top: 160 }}>
        <SceneTitle kicker="RULES" title="THE SERVE" />
      </div>
      <div
        style={{
          position: "absolute",
          top: 370,
          scale: 0.66,
          transformOrigin: "top center",
        }}
      >
        <VolleyballCourt scale={SCALE}>
          {rules.map((_, i) => (
            <Sequence
              key={i}
              from={Math.round((1 + i * secondsPerRule) * fps)}
              durationInFrames={Math.round(secondsPerRule * fps)}
              layout="none"
            >
              <ServeFlight />
            </Sequence>
          ))}
        </VolleyballCourt>
      </div>
      {rules.map((rule, i) => (
        <Sequence
          key={i}
          from={Math.round((1 + i * secondsPerRule) * fps)}
          durationInFrames={Math.round(secondsPerRule * fps)}
          name={`Rule ${i + 1}`}
        >
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 30%, transparent 48%)",
            }}
          />
          <RuleCard index={i} heading={rule.heading} body={rule.body} />
        </Sequence>
      ))}
      <Vignette strength={0.5} />
      <FilmGrain opacity={0.06} />
    </AbsoluteFill>
  );
};
