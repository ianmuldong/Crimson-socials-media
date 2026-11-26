/**
 * Six-player rotation data. Positions are zones 1–6 on our side of the court
 * (1 = right back / server, 2 = right front, 3 = middle front, 4 = left front,
 * 5 = left back, 6 = middle back). Each rotation moves every player one zone
 * clockwise: 2→1, 1→6, 6→5, 5→4, 4→3, 3→2.
 *
 * Edit the roster to your own line-up; the RotationDemo animates it.
 */
export type Player = { id: string; label: string; role: string };

export const defaultRoster: Player[] = [
  { id: "S", label: "S", role: "Setter" },
  { id: "OH1", label: "OH", role: "Outside" },
  { id: "MB1", label: "MB", role: "Middle" },
  { id: "OPP", label: "OP", role: "Opposite" },
  { id: "OH2", label: "OH", role: "Outside" },
  { id: "MB2", label: "MB", role: "Middle" },
];

/** Zone centres in metres on our (bottom) half of an 18 × 9 m court. */
export const zoneCentreM: Record<number, { x: number; y: number }> = {
  4: { x: 1.5, y: 10.5 },
  3: { x: 4.5, y: 10.5 },
  2: { x: 7.5, y: 10.5 },
  5: { x: 1.5, y: 15 },
  6: { x: 4.5, y: 15 },
  1: { x: 7.5, y: 15 },
};

/** Zone each roster index starts in for rotation 1 (setter serving from zone 1). */
export const startingZones = [1, 2, 3, 4, 5, 6];

/** Zone of roster index `i` after `r` clockwise rotations. */
export const zoneAfterRotations = (startZone: number, r: number) => {
  // Clockwise order a player travels through: 1 → 6 → 5 → 4 → 3 → 2 → 1
  const order = [1, 6, 5, 4, 3, 2];
  const idx = order.indexOf(startZone);
  return order[(idx + r) % 6];
};
