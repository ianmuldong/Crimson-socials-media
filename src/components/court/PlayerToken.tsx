import React from "react";
import { colors, fonts } from "../../brand/theme";

/** A player marker for court diagrams. Render inside <VolleyballCourt>. */
export const PlayerToken: React.FC<{
  x: number;
  y: number;
  label: string;
  sublabel?: string;
  radius?: number;
  highlight?: boolean;
  opponent?: boolean;
}> = ({
  x,
  y,
  label,
  sublabel,
  radius = 52,
  highlight = false,
  opponent = false,
}) => (
  <g transform={`translate(${x} ${y})`}>
    {highlight && (
      <circle r={radius * 1.45} fill={colors.crimson} opacity={0.35} />
    )}
    <circle
      r={radius}
      fill={opponent ? colors.charcoal : colors.crimson}
      stroke={opponent ? "rgba(255,255,255,0.5)" : colors.white}
      strokeWidth={6}
    />
    <text
      y={radius * 0.28}
      textAnchor="middle"
      fontFamily={fonts.display}
      fontSize={radius * 0.85}
      fill={colors.white}
    >
      {label}
    </text>
    {sublabel && (
      <text
        y={radius + 40}
        textAnchor="middle"
        fontFamily={fonts.body}
        fontWeight={800}
        fontSize={28}
        fill={colors.offWhite}
      >
        {sublabel}
      </text>
    )}
  </g>
);
