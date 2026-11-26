import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { campaign } from "../config";
import { C, ease, F } from "../theme";
import { ClockFace, CountdownRing } from "./Clock";
import { Backdrop } from "./EndCards";
import { Kicker, KineticHeadline } from "./Kinetic";

const toMinutes = (t: string) => {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2]);
};

/**
 * Animated session structure: a clock that runs through the evening while
 * a vertical timeline fills in. Uses campaign.session — the total number of
 * games is only shown if configured.
 */
export const SessionTimeline: React.FC<{ durationSec: number }> = ({
  durationSec,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = campaign.session;
  const rows = [
    { at: 0.6, time: s.warmup, title: "WARM-UP BEGINS" },
    { at: 1.6, time: s.firstGame, title: "FIRST GAME BEGINS" },
    {
      at: 2.8,
      time: null,
      title: `${s.gameMinutes}-MINUTE GAMES`,
      games: true,
    },
    {
      at: 4.6,
      time: null,
      title: `${s.breakMinutes}-MINUTE BREAK AFTER GAME ${s.breakAfterGame}`,
      brk: true,
    },
    {
      at: 6.0,
      time: s.finish,
      title: s.totalGames
        ? `SESSION FINISH · ${s.totalGames} GAMES`
        : "APPROX. SESSION FINISH",
    },
  ];
  const start = toMinutes(s.warmup);
  const end = toMinutes(s.finish);
  const clockMin = interpolate(frame, [0.4 * fps, 6.2 * fps], [start, end], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.55, 1),
  });
  const line = interpolate(frame, [0.5 * fps, 6.2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gameP = interpolate(frame, [3.0 * fps, 4.4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const out = interpolate(
    frame,
    [(durationSec - 0.3) * fps, durationSec * fps],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const hh = Math.floor(clockMin / 60) % 12 || 12;
  const mm = Math.floor(clockMin % 60);
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Backdrop intensity={0.6} />
      <AbsoluteFill style={{ padding: "230px 150px 0 90px" }}>
        <Kicker text="THE NIGHT" size={32} color={C.accent} />
        <KineticHeadline
          lines={["SESSION", "STRUCTURE"]}
          size={120}
          align="left"
          startSec={0.05}
        />
        <div
          style={{
            position: "absolute",
            right: 120,
            top: 250,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <ClockFace size={220} minutes={clockMin} />
          <div
            style={{
              fontFamily: F.display,
              fontSize: 54,
              color: C.white,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {hh}:{String(mm).padStart(2, "0")} PM
          </div>
        </div>
        <div style={{ position: "relative", marginTop: 110, paddingLeft: 70 }}>
          <div
            style={{
              position: "absolute",
              left: 18,
              top: 10,
              width: 6,
              height: 940,
              background: "rgba(255,255,255,0.12)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 18,
              top: 10,
              width: 6,
              height: 940 * line,
              background: C.white,
            }}
          />
          {rows.map((r, i) => {
            const p = interpolate(
              frame,
              [r.at * fps, (r.at + 0.45) * fps],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(...ease.out),
              },
            );
            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  height: 190,
                  opacity: p,
                  translate: `${(1 - p) * 50}px 0px`,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: -66,
                    top: 6,
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    background: r.brk ? C.accent2 : C.white,
                    border: `6px solid ${C.black}`,
                  }}
                />
                {r.time ? (
                  <div
                    style={{
                      fontFamily: F.display,
                      fontSize: 64,
                      color: C.accent2,
                      lineHeight: 1,
                    }}
                  >
                    {r.time}
                  </div>
                ) : null}
                <div
                  style={{
                    fontFamily: F.display,
                    fontSize: r.time ? 54 : 64,
                    color: C.white,
                    lineHeight: 1.1,
                  }}
                >
                  {r.title}
                </div>
                {r.games ? (
                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      marginTop: 14,
                      alignItems: "center",
                    }}
                  >
                    {new Array(s.breakAfterGame).fill(0).map((_, g) => {
                      const filled = gameP * s.breakAfterGame > g;
                      return (
                        <div
                          key={g}
                          style={{
                            fontFamily: F.body,
                            fontWeight: 900,
                            fontSize: 26,
                            padding: "8px 16px",
                            borderRadius: 30,
                            background: filled ? C.white : "transparent",
                            color: filled ? C.black : C.mute,
                            border: `2px solid ${filled ? C.white : C.steel}`,
                          }}
                        >
                          G{g + 1}
                        </div>
                      );
                    })}
                    <div
                      style={{
                        fontFamily: F.body,
                        fontWeight: 900,
                        fontSize: 26,
                        color: C.mute,
                      }}
                    >
                      …
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", right: 130, top: 1010 }}>
          <CountdownRing
            size={190}
            progress={gameP}
            totalMinutes={s.gameMinutes}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
