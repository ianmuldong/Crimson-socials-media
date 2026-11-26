import React from "react";
import { C } from "../theme";

/** Analogue clock face; `minutes` since midnight drives the hands. */
export const ClockFace: React.FC<{
  size: number;
  minutes: number;
  accent?: string;
}> = ({ size, minutes, accent = C.accent }) => {
  const h = ((minutes / 60) % 12) * 30;
  const m = (minutes % 60) * 6;
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100">
      <circle r={46} fill={C.ink} stroke={C.white} strokeWidth={3} />
      {new Array(12).fill(0).map((_, i) => (
        <line
          key={i}
          x1={0}
          y1={-40}
          x2={0}
          y2={i % 3 === 0 ? -33 : -36}
          stroke={i % 3 === 0 ? C.white : C.mute}
          strokeWidth={i % 3 === 0 ? 3 : 1.5}
          transform={`rotate(${i * 30})`}
        />
      ))}
      <line
        x1={0}
        y1={4}
        x2={0}
        y2={-22}
        stroke={C.white}
        strokeWidth={5}
        strokeLinecap="round"
        transform={`rotate(${h})`}
      />
      <line
        x1={0}
        y1={6}
        x2={0}
        y2={-34}
        stroke={accent}
        strokeWidth={3}
        strokeLinecap="round"
        transform={`rotate(${m})`}
      />
      <circle r={4} fill={accent} />
    </svg>
  );
};

/** Ring countdown, e.g. a 15:00 game compressed into a few seconds. */
export const CountdownRing: React.FC<{
  size: number;
  progress: number;
  totalMinutes: number;
  label?: string;
}> = ({ size, progress, totalMinutes, label = "GAME" }) => {
  const remaining = Math.max(0, totalMinutes * 60 * (1 - progress));
  const mm = Math.floor(remaining / 60);
  const ss = Math.floor(remaining % 60);
  const r = 44;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100">
      <circle
        r={r}
        fill="rgba(0,0,0,0.55)"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={5}
      />
      <circle
        r={r}
        fill="none"
        stroke={progress >= 1 ? C.accent : C.white}
        strokeWidth={5}
        strokeDasharray={circ}
        strokeDashoffset={circ * progress}
        transform="rotate(-90)"
        strokeLinecap="round"
      />
      <text
        y={-12}
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontWeight={800}
        fontSize={8}
        letterSpacing={2}
        fill={C.mute}
      >
        {label}
      </text>
      <text
        y={14}
        textAnchor="middle"
        fontFamily="Anton, sans-serif"
        fontSize={26}
        fill={C.white}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {`${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`}
      </text>
    </svg>
  );
};

/** Simple whistle pictogram. */
export const WhistleIcon: React.FC<{ size: number; color?: string }> = ({
  size,
  color = C.white,
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path
      d="M18 46 h34 a24 24 0 1 1 -14 22 l-20 0 z"
      fill="none"
      stroke={color}
      strokeWidth={6}
      strokeLinejoin="round"
    />
    <circle cx={60} cy={66} r={7} fill={color} />
    <path
      d="M70 26 l8 -12 M82 36 l12 -6 M56 22 l0 -14"
      stroke={color}
      strokeWidth={5}
      strokeLinecap="round"
    />
  </svg>
);
