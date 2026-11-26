/**
 * ⚠ CONFIRM — VENUE + ROTATION LAYOUT (default assumption, not yet approved)
 *
 * Two main courts, each split into three playing areas (A, B, C). Every
 * playing area has a net across the middle, so each main court has six team
 * spots: three on the "top" side and three on the "bottom" side.
 *
 *     MAIN COURT 1                 Clockwise cycle (viewed from above):
 *   ┌──────┬──────┬──────┐         T1 → T2 → T3
 *   │  T1  │  T2  │  T3  │          ↑         ↓
 *   │━━━━━━│━━━━━━│━━━━━━│ ← nets   B1 ← B2 ← B3
 *   │  B1  │  B2  │  B3  │
 *   └──────┴──────┴──────┘
 *
 * One spot per main court is STATIONARY (default T1 — to be confirmed).
 * The other five teams step to the next spot clockwise after every game,
 * skipping (going around) the stationary spot.
 *
 * Everything below is data: change the spots, the cycle order, the stationary
 * spot or team names and the diagrams + rotation animations follow.
 */

export type Spot = { id: string; area: number; side: "top" | "bottom" };

export type MainCourt = {
  id: string;
  label: string;
  areaLabels: [string, string, string];
  /** Spot ids in clockwise order. */
  cycle: string[];
  stationarySpot: string;
  /** Team names in their starting spots (spot id → team label). */
  startingTeams: Record<string, string>;
};

export const spots: Spot[] = [
  { id: "T1", area: 0, side: "top" },
  { id: "T2", area: 1, side: "top" },
  { id: "T3", area: 2, side: "top" },
  { id: "B1", area: 0, side: "bottom" },
  { id: "B2", area: 1, side: "bottom" },
  { id: "B3", area: 2, side: "bottom" },
];

export const venue: {
  mainCourts: MainCourt[];
  teamsPerSpot: number;
  playersPerTeam: number;
} = {
  teamsPerSpot: 1,
  playersPerTeam: 7, // 2 main courts × 6 spots × 7 = 84 players
  mainCourts: [
    {
      id: "M1",
      label: "MAIN COURT 1",
      areaLabels: ["COURT 1", "COURT 2", "COURT 3"],
      cycle: ["T1", "T2", "T3", "B3", "B2", "B1"],
      stationarySpot: "T1",
      startingTeams: { T1: "1", T2: "2", T3: "3", B3: "4", B2: "5", B1: "6" },
    },
    {
      id: "M2",
      label: "MAIN COURT 2",
      areaLabels: ["COURT 4", "COURT 5", "COURT 6"],
      cycle: ["T1", "T2", "T3", "B3", "B2", "B1"],
      stationarySpot: "T1",
      startingTeams: {
        T1: "7",
        T2: "8",
        T3: "9",
        B3: "10",
        B2: "11",
        B1: "12",
      },
    },
  ],
};

/** Spot occupied by the team that started on `start` after `games` rotations. */
export const spotAfter = (
  court: MainCourt,
  start: string,
  games: number,
): string => {
  if (start === court.stationarySpot) return start;
  const moving = court.cycle.filter((s) => s !== court.stationarySpot);
  const i = moving.indexOf(start);
  return moving[(i + games) % moving.length];
};
