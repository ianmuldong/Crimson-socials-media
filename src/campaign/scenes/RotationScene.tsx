import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { campaign } from "../config";
import { CountdownRing, WhistleIcon } from "../components/Clock";
import { Backdrop } from "../components/EndCards";
import { Kicker } from "../components/Kinetic";
import { Sfx } from "../components/Sfx";
import {
  blockOrigin,
  BLOCK_H,
  VenueMap,
  VENUE_W,
} from "../components/VenueMap";
import { C, ease, F } from "../theme";
import { fitSize } from "../components/Kinetic";

export type RotationSceneOptions = {
  /** Zoom from the full venue into main court 1 before demonstrating. */
  zoomToCourt: boolean;
  /** How many consecutive rotations to show (≥ 2). */
  rotations: number;
  /** Which main courts show teams (indices). */
  activeCourts: number[];
};

/** Builds the timing (in seconds) for the rotation demonstration. */
export const rotationSchedule = (o: RotationSceneOptions) => {
  const zoomStart = 1.9;
  const zoomEnd = o.zoomToCourt ? 3.0 : 1.9;
  const stationary = zoomEnd + 0.2;
  const cycles: {
    timer: [number, number];
    whistle: number;
    arrows: [number, number];
    move: [number, number];
    nextGame: number | null;
  }[] = [];
  let t = stationary + 1.3;
  for (let i = 0; i < o.rotations; i++) {
    const timerLen = i === 0 ? 1.7 : 1.0;
    const timer: [number, number] = [t, t + timerLen];
    const whistle = timer[1];
    const arrows: [number, number] = [
      whistle + 0.25,
      whistle + (i === 0 ? 1.0 : 0.65),
    ];
    const move: [number, number] = [arrows[1] + 0.05, arrows[1] + 1.35];
    const nextGame = i < o.rotations - 1 ? move[1] + 0.7 : null;
    cycles.push({ timer, whistle, arrows, move, nextGame });
    t = (nextGame ?? move[1]) + (nextGame ? 0.8 : 0);
  }
  const end = cycles[cycles.length - 1].move[1] + 1.8;
  return { zoomStart, zoomEnd, stationary, cycles, end };
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * Animated rotation demonstration, following the brief's sequence:
 * start positions → stationary team + lock → labels → 15-min timer →
 * whistle → clockwise arrows → teams move (stationary fixed) → pause →
 * NEXT GAME → another rotation. Fully driven by src/campaign/venue.ts.
 */
export const RotationScene: React.FC<{
  options: RotationSceneOptions;
  title?: string[];
  overviewCaption?: string;
}> = ({ options, title, overviewCaption }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const sec = frame / fps;
  const sch = rotationSchedule(options);

  // venue state
  let rotation = 0;
  let move = 0;
  let arrows = 0;
  sch.cycles.forEach((c, i) => {
    if (sec >= c.move[1]) rotation = i + 1;
    else if (sec >= c.arrows[0]) {
      rotation = i;
      move = interpolate(sec, c.move, [0, 1], clamp);
      arrows = interpolate(sec, c.arrows, [0, 1], clamp);
    }
  });
  const state = {
    rotation,
    move,
    arrows,
    draw: interpolate(sec, [0.1, 0.9], [0, 1], {
      ...clamp,
      easing: Easing.bezier(...ease.inOut),
    }),
    labels: interpolate(sec, [0.6, 1.1], [0, 1], clamp),
    teams: interpolate(sec, [1.0, 1.8], [0, 1], clamp),
    stationary: interpolate(
      sec,
      [sch.stationary, sch.stationary + 0.5],
      [0, 1],
      clamp,
    ),
    activeCourts: options.activeCourts,
    courtOpacity: [1, 1],
  };

  // camera
  const mapW = 700;
  const k = mapW / VENUE_W;
  const mapTop = 400;
  const zoom = options.zoomToCourt
    ? interpolate(sec, [sch.zoomStart, sch.zoomEnd], [0, 1], {
        ...clamp,
        easing: Easing.bezier(...ease.inOut),
      })
    : 0;
  const z = 1 + 0.55 * zoom;
  const courtCy = (blockOrigin(0).y + BLOCK_H / 2) * k;
  const targetCy = 520; // where court 1 centre should land (relative to mapTop)
  const ty = interpolate(zoom, [0, 1], [0, targetCy - courtCy * z]);
  state.courtOpacity = [1, 1 - zoom];

  // captions
  const cap = campaign.text.rotationCaptions;
  const c0 = sch.cycles[0];
  const last = sch.cycles[sch.cycles.length - 1];
  const captionAt = (start: number, end: number) =>
    interpolate(
      sec,
      [start, start + 0.35, end - 0.25, end],
      [0, 1, 1, 0],
      clamp,
    );
  const captions = [
    ...(overviewCaption
      ? [{ text: overviewCaption, o: captionAt(0.5, sch.stationary) }]
      : []),
    { text: cap[0], o: captionAt(sch.stationary, c0.arrows[0]) },
    { text: cap[1], o: captionAt(c0.arrows[0], c0.move[1] + 0.6) },
    {
      text: "NEXT GAME",
      o: sch.cycles.reduce(
        (m, c) =>
          c.nextGame
            ? Math.max(m, captionAt(c.nextGame, c.nextGame + 0.85))
            : m,
        0,
      ),
    },
    { text: cap[2], o: captionAt(last.move[1] - 0.2, sch.end) },
  ];

  // timer + whistle
  const activeCycle = sch.cycles.find(
    (c) => sec >= c.timer[0] - 0.2 && sec < c.whistle + 0.4,
  );
  const timerP = activeCycle
    ? interpolate(sec, activeCycle.timer, [0, 1], clamp)
    : 0;
  const timerO = activeCycle
    ? interpolate(
        sec,
        [
          activeCycle.timer[0] - 0.2,
          activeCycle.timer[0],
          activeCycle.whistle + 0.2,
          activeCycle.whistle + 0.4,
        ],
        [0, 1, 1, 0],
        clamp,
      )
    : 0;
  const whistleFlash = sch.cycles.reduce(
    (m, c) =>
      Math.max(
        m,
        interpolate(
          sec,
          [c.whistle, c.whistle + 0.05, c.whistle + 0.45],
          [0, 1, 0],
          clamp,
        ),
      ),
    0,
  );
  const gameNo = rotation + 1;

  const introO = title
    ? interpolate(sec, [0, 0.3, 1.6, 1.9], [0, 1, 1, 0], clamp)
    : 0;

  return (
    <AbsoluteFill>
      <Backdrop intensity={0.45} />
      <div
        style={{
          position: "absolute",
          left: (width - mapW) / 2,
          top: mapTop,
          scale: z,
          translate: `${(-(z - 1) * mapW) / 2}px ${ty}px`,
          transformOrigin: "0 0",
        }}
      >
        <VenueMap width={mapW} state={state} />
      </div>

      {/* title before captions start */}
      {title ? (
        <div
          style={{
            position: "absolute",
            top: 240,
            left: 90,
            right: 150,
            opacity: introO,
          }}
        >
          <Kicker text={title[0]} size={30} color={C.accent} />
          <div
            style={{
              fontFamily: F.display,
              fontSize: 92,
              color: C.white,
              lineHeight: 1.02,
            }}
          >
            {title[1]}
          </div>
        </div>
      ) : null}

      {/* captions */}
      {captions.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 250,
            left: 90,
            right: 150,
            opacity: c.o,
            translate: `0px ${(1 - c.o) * 24}px`,
          }}
        >
          <div
            style={{
              fontFamily: F.display,
              fontSize: fitSize(c.text, 108, 830),
              color: c.text === "NEXT GAME" ? C.accent2 : C.white,
              lineHeight: 1.0,
            }}
          >
            {c.text}
          </div>
        </div>
      ))}

      {/* game timer */}
      <div
        style={{
          position: "absolute",
          right: 150,
          top: 1418,
          opacity: timerO,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            fontFamily: F.body,
            fontWeight: 900,
            fontSize: 28,
            letterSpacing: "0.2em",
            color: C.bone,
            textAlign: "right",
          }}
        >
          GAME {gameNo}
          <br />
          <span style={{ color: C.mute }}>
            {campaign.session.gameMinutes} MIN
          </span>
        </div>
        <CountdownRing
          size={120}
          progress={timerP}
          totalMinutes={campaign.session.gameMinutes}
        />
      </div>

      {/* legend */}
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 1440,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          opacity: state.stationary,
        }}
      >
        <Legend color={C.stationary} text="STATIONARY TEAM" />
        <Legend color={C.white} text="ROTATING TEAMS" />
      </div>

      {/* whistle */}
      <AbsoluteFill
        style={{ backgroundColor: C.white, opacity: whistleFlash * 0.18 }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: whistleFlash,
        }}
      >
        <div
          style={{
            background: C.black,
            borderRadius: 999,
            padding: 30,
            scale: 0.8 + 0.3 * whistleFlash,
          }}
        >
          <WhistleIcon size={140} />
        </div>
      </AbsoluteFill>

      {sch.cycles.map((c, i) => (
        <React.Fragment key={i}>
          <Sfx name="whistle" at={c.whistle * fps} volume={0.9} />
          <Sfx name="whoosh" at={(c.move[0] - 0.15) * fps} volume={0.5} />
        </React.Fragment>
      ))}
      {sch.cycles.map((c, i) =>
        c.nextGame ? (
          <Sfx key={`n${i}`} name="tick" at={c.nextGame * fps} />
        ) : null,
      )}
    </AbsoluteFill>
  );
};

const Legend: React.FC<{ color: string; text: string }> = ({ color, text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        background: color,
        border: `3px solid ${C.white}`,
      }}
    />
    <div
      style={{
        fontFamily: F.body,
        fontWeight: 800,
        fontSize: 26,
        letterSpacing: "0.14em",
        color: C.bone,
      }}
    >
      {text}
    </div>
  </div>
);
