import React from "react";
import { z } from "zod";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fonts } from "../../brand/theme";
import { PlayerToken } from "../../components/court/PlayerToken";
import { VolleyballCourt } from "../../components/court/VolleyballCourt";
import { FilmGrain } from "../../components/effects/FilmGrain";
import { Vignette } from "../../components/effects/Vignette";
import { SceneTitle } from "../../components/typography/SceneTitle";
import {
  startingZones,
  zoneAfterRotations,
  zoneCentreM,
} from "../../data/rotations";

export const rotationSchema = z.object({
  title: z.string(),
  players: z.array(z.object({ label: z.string(), role: z.string() })).length(6),
  secondsPerRotation: z.number().min(1).max(6),
});

export type RotationProps = z.infer<typeof rotationSchema>;

const SCALE = 76;
const HALF_TOP_M = 8.2; // crop to show a little of the opponent side + our half

/**
 * Animated six-rotation explainer. Every player glides clockwise to the next
 * zone; the player in zone 1 is highlighted as the server.
 */
export const RotationDemo: React.FC<RotationProps> = ({
  title,
  players,
  secondsPerRotation,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = Math.max(0, frame - 1 * fps);
  const per = secondsPerRotation * fps;
  const r = Math.min(5, Math.floor(t / per));
  const local = t - r * per;
  // hold 60% of each rotation, move during the last 40%
  const move =
    r < 5
      ? interpolate(local, [per * 0.6, per], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.65, 0, 0.35, 1),
        })
      : 0;

  return (
    <AbsoluteFill
      style={{ backgroundColor: colors.black, alignItems: "center" }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${colors.maroon} 0%, ${colors.black} 70%)`,
        }}
      />
      <div style={{ position: "absolute", top: 170 }}>
        <SceneTitle kicker="ROTATIONS" title={title} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 440,
          height: 1200,
          overflow: "hidden",
          borderRadius: 24,
        }}
      >
        <div style={{ translate: `0px ${-HALF_TOP_M * SCALE}px` }}>
          <VolleyballCourt scale={SCALE} showZones highlightZone={1}>
            {players.map((p, i) => {
              const from = zoneCentreM[zoneAfterRotations(startingZones[i], r)];
              const to =
                zoneCentreM[zoneAfterRotations(startingZones[i], r + 1)];
              const x = interpolate(move, [0, 1], [from.x, to.x]) * SCALE;
              const y = interpolate(move, [0, 1], [from.y, to.y]) * SCALE;
              const isServer =
                zoneAfterRotations(startingZones[i], r) === 1 && move === 0;
              return (
                <PlayerToken
                  key={i}
                  x={x}
                  y={y}
                  label={p.label}
                  sublabel={p.role}
                  highlight={isServer}
                />
              );
            })}
          </VolleyballCourt>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 210,
          fontFamily: fonts.display,
          fontSize: 96,
          color: colors.white,
        }}
      >
        ROTATION <span style={{ color: colors.crimsonBright }}>{r + 1}</span>
        <span style={{ color: "rgba(255,255,255,0.35)" }}> / 6</span>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 150,
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize: 34,
          color: colors.offWhite,
        }}
      >
        Players rotate clockwise · Zone 1 serves
      </div>
      <Vignette strength={0.5} />
      <FilmGrain opacity={0.06} />
    </AbsoluteFill>
  );
};
