import React from "react";
import { Easing, interpolate } from "remotion";
import { C, ease, F } from "../theme";
import { MainCourt, spotAfter, spots, venue } from "../venue";

/* ───── Geometry (metres) ───── */
export const AREA_W = 9;
export const AREA_L = 18;
export const AREA_GAP = 2.2;
export const BLOCK_W = 3 * AREA_W + 2 * AREA_GAP; // one main court
export const BLOCK_H = AREA_L;
export const LABEL_H = 3.4;
export const BLOCK_GAP = 5;
export const MARGIN = 2.4;
export const VENUE_W = BLOCK_W + MARGIN * 2;
export const VENUE_H =
  venue.mainCourts.length * (BLOCK_H + LABEL_H) +
  (venue.mainCourts.length - 1) * BLOCK_GAP +
  MARGIN * 2;

export const blockOrigin = (ci: number) => ({
  x: MARGIN,
  y: MARGIN + LABEL_H + ci * (BLOCK_H + LABEL_H + BLOCK_GAP),
});

const spotPos = (ci: number, spotId: string) => {
  const sp = spots.find((s) => s.id === spotId)!;
  const o = blockOrigin(ci);
  return {
    x: o.x + sp.area * (AREA_W + AREA_GAP) + AREA_W / 2,
    y: o.y + (sp.side === "top" ? AREA_L * 0.25 : AREA_L * 0.75),
  };
};

type Pt = { x: number; y: number };

/**
 * Path a team walks from one spot to the next, as a sampled smooth curve.
 * Normal moves bow slightly outward; a move that skips the stationary spot
 * swings around the outside of it.
 */
export const movePath = (
  ci: number,
  court: MainCourt,
  from: string,
  to: string,
): Pt[] => {
  const a = spotPos(ci, from);
  const b = spotPos(ci, to);
  const o = blockOrigin(ci);
  const centre = { x: o.x + BLOCK_W / 2, y: o.y + BLOCK_H / 2 };
  const full = court.cycle;
  const skipped: Pt[] = [];
  let i = full.indexOf(from);
  while (full[(i + 1) % full.length] !== to) {
    i = (i + 1) % full.length;
    skipped.push(spotPos(ci, full[i]));
  }
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  let ctrl: Pt;
  if (skipped.length) {
    const s0 = skipped[0];
    const dx = s0.x - centre.x;
    const dy = s0.y - centre.y;
    const len = Math.hypot(dx, dy) || 1;
    const w = { x: s0.x + (dx / len) * 5.2, y: s0.y + (dy / len) * 5.2 };
    ctrl = { x: 2 * w.x - mid.x, y: 2 * w.y - mid.y }; // curve passes through w
  } else {
    let nx = -(b.y - a.y) * 0.16;
    let ny = (b.x - a.x) * 0.16;
    if (
      (mid.x + nx - centre.x) ** 2 + (mid.y + ny - centre.y) ** 2 <
      (mid.x - centre.x) ** 2 + (mid.y - centre.y) ** 2
    ) {
      nx = -nx;
      ny = -ny;
    }
    ctrl = { x: mid.x + nx, y: mid.y + ny };
  }
  return new Array(41).fill(0).map((_, k) => {
    const t = k / 40;
    return {
      x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * ctrl.x + t ** 2 * b.x,
      y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * ctrl.y + t ** 2 * b.y,
    };
  });
};

const along = (pts: Pt[], t: number): Pt => {
  const segs = pts
    .slice(1)
    .map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  const total = segs.reduce((x, y) => x + y, 0);
  let d = t * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) {
      const k = segs[i] ? Math.min(1, d / segs[i]) : 1;
      return {
        x: pts[i].x + (pts[i + 1].x - pts[i].x) * k,
        y: pts[i].y + (pts[i + 1].y - pts[i].y) * k,
      };
    }
    d -= segs[i];
  }
  return pts[pts.length - 1];
};

/** Sub-section of a sampled path between t0 and t1, as an SVG path string. */
const subPathD = (pts: Pt[], t0: number, t1: number) => {
  const n = 30;
  const sub = new Array(n + 1)
    .fill(0)
    .map((_, k) => along(pts, t0 + ((t1 - t0) * k) / n));
  return (
    `M ${sub[0].x} ${sub[0].y} ` +
    sub
      .slice(1)
      .map((p) => `L ${p.x} ${p.y}`)
      .join(" ")
  );
};

export const LockIcon: React.FC<{ x: number; y: number; s: number }> = ({
  x,
  y,
  s,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path
      d="M -0.55 -0.1 v -0.35 a 0.55 0.55 0 0 1 1.1 0 v 0.35"
      fill="none"
      stroke={C.black}
      strokeWidth={0.22}
    />
    <rect
      x={-0.8}
      y={-0.15}
      width={1.6}
      height={1.15}
      rx={0.18}
      fill={C.black}
    />
  </g>
);

export type VenueState = {
  /** Number of completed rotations before the current move. */
  rotation: number;
  /** 0 → 1 progress of the current move (teams walking). */
  move: number;
  /** 0 → 1 reveal of the clockwise arrows. */
  arrows: number;
  /** 0 → 1 emphasis on stationary teams (glow + lock). */
  stationary: number;
  /** 0 → 1 reveal of team tokens. */
  teams: number;
  /** 0 → 1 reveal of court labels / zone labels. */
  labels: number;
  /** 0 → 1 drawing of court lines. */
  draw: number;
  /** Which main courts get tokens (indices). */
  activeCourts?: number[];
  /** Per-court opacity (e.g. fade the other court when zoomed in). */
  courtOpacity?: number[];
};

/**
 * Top-down venue diagram: two main courts × three playing areas, nets,
 * labels, team tokens, stationary locks and clockwise movement arrows.
 * Pure function of `state`, so any scene can drive it.
 */
export const VenueMap: React.FC<{
  width: number;
  state: VenueState;
  showSpotIds?: boolean;
}> = ({ width, state, showSpotIds = false }) => {
  const k = width / VENUE_W;
  const line = 0.14;
  const active = state.activeCourts ?? venue.mainCourts.map((_, i) => i);
  return (
    <svg
      width={width}
      height={VENUE_H * k}
      viewBox={`0 0 ${VENUE_W} ${VENUE_H}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <marker
          id="arrowHead"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="3.2"
          markerHeight="3.2"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={C.white} />
        </marker>
        <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#17171A" />
          <stop offset="1" stopColor="#101012" />
        </linearGradient>
      </defs>
      {venue.mainCourts.map((court, ci) => {
        const o = blockOrigin(ci);
        return (
          <g key={court.id} opacity={state.courtOpacity?.[ci] ?? 1}>
            {/* main court label */}
            <text
              x={o.x}
              y={o.y - 1.1}
              fontFamily={F.display}
              fontSize={2.1}
              fill={C.white}
              opacity={state.labels}
            >
              {court.label}
            </text>
            <text
              x={o.x + BLOCK_W}
              y={o.y - 1.1}
              fontFamily={F.body}
              fontWeight={800}
              fontSize={1.05}
              letterSpacing={0.25}
              fill={C.mute}
              textAnchor="end"
              opacity={state.labels}
            >
              3 PLAYING AREAS
            </text>
            {/* hall floor */}
            <rect
              x={o.x - 1}
              y={o.y - 0.6}
              width={BLOCK_W + 2}
              height={BLOCK_H + 1.2}
              rx={0.6}
              fill="url(#floor)"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={0.08}
            />
            {[0, 1, 2].map((a) => {
              const x = o.x + a * (AREA_W + AREA_GAP);
              const per = 2 * (AREA_W + AREA_L);
              return (
                <g key={a}>
                  <rect
                    x={x}
                    y={o.y}
                    width={AREA_W}
                    height={AREA_L}
                    fill="rgba(255,255,255,0.025)"
                    stroke={C.bone}
                    strokeWidth={line}
                    strokeDasharray={per}
                    strokeDashoffset={per * (1 - state.draw)}
                  />
                  {/* attack lines (3 m from the net) */}
                  <line
                    x1={x}
                    x2={x + AREA_W}
                    y1={o.y + AREA_L / 2 - 3}
                    y2={o.y + AREA_L / 2 - 3}
                    stroke="rgba(237,234,228,0.35)"
                    strokeWidth={line * 0.7}
                    opacity={state.draw}
                  />
                  <line
                    x1={x}
                    x2={x + AREA_W}
                    y1={o.y + AREA_L / 2 + 3}
                    y2={o.y + AREA_L / 2 + 3}
                    stroke="rgba(237,234,228,0.35)"
                    strokeWidth={line * 0.7}
                    opacity={state.draw}
                  />
                  {/* net */}
                  <line
                    x1={x - 0.5}
                    x2={x + AREA_W + 0.5}
                    y1={o.y + AREA_L / 2}
                    y2={o.y + AREA_L / 2}
                    stroke={C.white}
                    strokeWidth={0.32}
                    opacity={state.draw}
                  />
                  <line
                    x1={x - 0.5}
                    x2={x + AREA_W + 0.5}
                    y1={o.y + AREA_L / 2}
                    y2={o.y + AREA_L / 2}
                    stroke={C.accent}
                    strokeWidth={0.12}
                    strokeDasharray="0.5 0.35"
                    opacity={state.draw}
                  />
                  <circle
                    cx={x - 0.5}
                    cy={o.y + AREA_L / 2}
                    r={0.28}
                    fill={C.white}
                    opacity={state.draw}
                  />
                  <circle
                    cx={x + AREA_W + 0.5}
                    cy={o.y + AREA_L / 2}
                    r={0.28}
                    fill={C.white}
                    opacity={state.draw}
                  />
                  {/* area label sits on the net line */}
                  <g opacity={state.labels}>
                    <rect
                      x={x + AREA_W / 2 - 2.6}
                      y={o.y + AREA_L / 2 - 0.75}
                      width={5.2}
                      height={1.5}
                      rx={0.3}
                      fill={C.black}
                    />
                    <text
                      x={x + AREA_W / 2}
                      y={o.y + AREA_L / 2 + 0.42}
                      textAnchor="middle"
                      fontFamily={F.body}
                      fontWeight={900}
                      fontSize={1.05}
                      letterSpacing={0.12}
                      fill={C.bone}
                    >
                      {court.areaLabels[a]}
                    </text>
                  </g>
                </g>
              );
            })}
            {showSpotIds &&
              spots.map((s) => {
                const p = spotPos(ci, s.id);
                return (
                  <text
                    key={s.id}
                    x={p.x}
                    y={p.y + 3.3}
                    textAnchor="middle"
                    fontFamily={F.body}
                    fontWeight={700}
                    fontSize={0.9}
                    fill={C.mute}
                  >
                    SPOT {s.id}
                  </text>
                );
              })}
            {active.includes(ci) && (
              <CourtTeams ci={ci} court={court} state={state} />
            )}
          </g>
        );
      })}
    </svg>
  );
};

const CourtTeams: React.FC<{
  ci: number;
  court: MainCourt;
  state: VenueState;
}> = ({ ci, court, state }) => {
  const r = 2.0;
  const entries = Object.entries(court.startingTeams);
  return (
    <g>
      {/* arrows */}
      {state.arrows > 0 &&
        entries
          .filter(([start]) => start !== court.stationarySpot)
          .map(([start]) => {
            const from = spotAfter(court, start, state.rotation);
            const to = spotAfter(court, start, state.rotation + 1);
            const pts = movePath(ci, court, from, to);
            return (
              <path
                key={start}
                d={subPathD(pts, 0.24, 0.76)}
                fill="none"
                stroke={C.white}
                strokeWidth={0.32}
                strokeLinecap="round"
                markerEnd="url(#arrowHead)"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - state.arrows}
                opacity={interpolate(state.move, [0.7, 1], [1, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })}
              />
            );
          })}
      {/* teams */}
      {entries.map(([start, label], idx) => {
        const stationary = start === court.stationarySpot;
        const from = spotAfter(court, start, state.rotation);
        const to = spotAfter(court, start, state.rotation + 1);
        const pts = stationary
          ? [spotPos(ci, start), spotPos(ci, start)]
          : movePath(ci, court, from, to);
        const p = along(
          pts,
          Easing.bezier(...ease.inOut)(Math.min(1, Math.max(0, state.move))),
        );
        const appear = interpolate(
          state.teams,
          [idx / 8, idx / 8 + 0.35],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const glow = stationary ? state.stationary : 0;
        return (
          <g
            key={start}
            transform={`translate(${p.x} ${p.y}) scale(${appear})`}
            opacity={appear}
          >
            {stationary && (
              <circle
                r={r * (1.5 + 0.15 * Math.sin(glow * Math.PI * 4))}
                fill={C.stationary}
                opacity={0.28 * glow}
              />
            )}
            <circle
              r={r}
              fill={stationary ? C.stationary : C.white}
              stroke={stationary ? C.white : C.black}
              strokeWidth={0.22}
            />
            <text
              y={0.62}
              textAnchor="middle"
              fontFamily={F.display}
              fontSize={1.75}
              fill={C.black}
            >
              {label}
            </text>
            {stationary && glow > 0 && (
              <g opacity={glow}>
                <circle cx={1.55} cy={-1.55} r={1.0} fill={C.white} />
                <LockIcon x={1.55} y={-1.7} s={0.62} />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};
