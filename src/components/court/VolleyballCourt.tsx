import React from "react";
import { colors } from "../../brand/theme";

/**
 * Top-down indoor volleyball court (18 m × 9 m) drawn vertically so it suits
 * a 9:16 frame. Coordinates: 1 metre = `scale` pixels. The net is horizontal
 * across the middle. Use courtToPx() to place players and balls.
 *
 * Our team occupies the BOTTOM half; zone 1 is bottom-right (server).
 */
export const COURT = { lengthM: 18, widthM: 9, attackLineM: 3 } as const;

export const courtToPx = (xM: number, yM: number, scale: number) => ({
  x: xM * scale,
  y: yM * scale,
});

export const VolleyballCourt: React.FC<{
  scale?: number;
  showZones?: boolean;
  highlightZone?: number | null;
  children?: React.ReactNode;
}> = ({ scale = 90, showZones = false, highlightZone = null, children }) => {
  const W = COURT.widthM * scale;
  const L = COURT.lengthM * scale;
  const pad = 2 * scale; // free zone (service area) drawn around the court
  const mid = L / 2;
  const atk = COURT.attackLineM * scale;
  const line = Math.max(4, scale * 0.06);
  // Zones on OUR side (bottom half). [zone, col, row] — row 0 = front.
  const zones: Array<[number, number, number]> = [
    [4, 0, 0],
    [3, 1, 0],
    [2, 2, 0],
    [5, 0, 1],
    [6, 1, 1],
    [1, 2, 1],
  ];
  return (
    <svg
      width={W + pad * 2}
      height={L + pad * 2}
      viewBox={`${-pad} ${-pad} ${W + pad * 2} ${L + pad * 2}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="courtFloor" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2a0a10" />
          <stop offset="100%" stopColor="#3b0d16" />
        </linearGradient>
      </defs>
      <rect
        x={-pad}
        y={-pad}
        width={W + pad * 2}
        height={L + pad * 2}
        fill={colors.charcoal}
        rx={24}
      />
      <rect x={0} y={0} width={W} height={L} fill="url(#courtFloor)" />
      {showZones &&
        zones.map(([z, c, r]) => {
          const zw = W / 3;
          const zy = mid + (r === 0 ? 0 : atk);
          const zh = r === 0 ? atk : mid - atk;
          return (
            <g key={z}>
              <rect
                x={c * zw}
                y={zy}
                width={zw}
                height={zh}
                fill={highlightZone === z ? colors.crimson : "transparent"}
                opacity={highlightZone === z ? 0.45 : 1}
                stroke="rgba(255,255,255,0.12)"
                strokeDasharray="10 10"
                strokeWidth={2}
              />
              <text
                x={c * zw + zw / 2}
                y={zy + zh / 2 + scale * 0.35}
                textAnchor="middle"
                fontFamily="Anton, sans-serif"
                fontSize={scale * 1.1}
                fill="rgba(255,255,255,0.13)"
              >
                {z}
              </text>
            </g>
          );
        })}
      {/* boundary, centre line, attack lines */}
      <rect
        x={0}
        y={0}
        width={W}
        height={L}
        fill="none"
        stroke={colors.courtLine}
        strokeWidth={line}
      />
      <line
        x1={0}
        y1={mid - atk}
        x2={W}
        y2={mid - atk}
        stroke={colors.courtLine}
        strokeWidth={line}
      />
      <line
        x1={0}
        y1={mid + atk}
        x2={W}
        y2={mid + atk}
        stroke={colors.courtLine}
        strokeWidth={line}
      />
      {/* net */}
      <line
        x1={-scale * 0.6}
        y1={mid}
        x2={W + scale * 0.6}
        y2={mid}
        stroke={colors.white}
        strokeWidth={line * 2.2}
      />
      <line
        x1={-scale * 0.6}
        y1={mid}
        x2={W + scale * 0.6}
        y2={mid}
        stroke={colors.crimson}
        strokeWidth={line * 0.8}
        strokeDasharray="14 10"
      />
      <circle cx={-scale * 0.6} cy={mid} r={line * 1.6} fill={colors.white} />
      <circle
        cx={W + scale * 0.6}
        cy={mid}
        r={line * 1.6}
        fill={colors.white}
      />
      {children}
    </svg>
  );
};
