import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { campaign } from "../config";
import { Backdrop } from "../components/EndCards";
import { fitSize, Kicker } from "../components/Kinetic";
import { Sfx } from "../components/Sfx";
import { C, ease, F } from "../theme";

/* ── side-view mapping: x metres along the court (0 = server's end line, 18 = far end line), y metres height ── */
const GROUND = 1180;
const mx = (x: number) => 110 + (x + 2.6) * 36;
const my = (y: number) => GROUND - y * 78;
const NET_X = 9;
const NET_H = 2.43;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Pose = "serve" | "ready" | "toss";
/** Minimal sports-pictogram figure (Olympic-style), 1 unit = 1 m, drawn at 78 px/m. */
const Figure: React.FC<{
  x: number;
  pose: Pose;
  flip?: boolean;
  color?: string;
  o?: number;
}> = ({ x, pose, flip = false, color = C.white, o = 1 }) => {
  const P: Record<
    Pose,
    { head: [number, number]; lines: [number, number][][] }
  > = {
    ready: {
      head: [0.05, 1.62],
      lines: [
        [
          [0, 1.38],
          [0, 0.85],
        ],
        [
          [0, 0.85],
          [-0.28, 0.45],
          [-0.3, 0],
        ],
        [
          [0, 0.85],
          [0.3, 0.45],
          [0.35, 0],
        ],
        [
          [0, 1.3],
          [0.35, 1.0],
          [0.6, 0.95],
        ],
      ],
    },
    toss: {
      head: [0, 1.74],
      lines: [
        [
          [0, 1.5],
          [0, 0.9],
        ],
        [
          [0, 0.9],
          [-0.12, 0.45],
          [-0.2, 0],
        ],
        [
          [0, 0.9],
          [0.18, 0.45],
          [0.3, 0],
        ],
        [
          [0, 1.42],
          [0.35, 1.8],
          [0.45, 2.1],
        ],
        [
          [0, 1.42],
          [-0.3, 1.2],
          [-0.2, 0.95],
        ],
      ],
    },
    serve: {
      head: [0.05, 1.74],
      lines: [
        [
          [0, 1.5],
          [0.05, 0.9],
        ],
        [
          [0.05, 0.9],
          [-0.1, 0.45],
          [-0.25, 0],
        ],
        [
          [0.05, 0.9],
          [0.25, 0.45],
          [0.35, 0],
        ],
        [
          [0, 1.42],
          [0.05, 1.95],
          [0.3, 2.25],
        ],
        [
          [0, 1.42],
          [0.4, 1.3],
          [0.6, 1.45],
        ],
      ],
    },
  };
  const p = P[pose];
  const k = 78;
  return (
    <g
      transform={`translate(${mx(x)} ${GROUND}) scale(${flip ? -1 : 1} 1)`}
      opacity={o}
    >
      {p.lines.map((l, i) => (
        <polyline
          key={i}
          points={l.map(([a, b]) => `${a * k},${-b * k}`).join(" ")}
          fill="none"
          stroke={color}
          strokeWidth={22}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      <circle cx={p.head[0] * k} cy={-p.head[1] * k} r={17} fill={color} />
    </g>
  );
};

const Mark: React.FC<{ x: number; y: number; ok: boolean; s: number }> = ({
  x,
  y,
  ok,
  s,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={s > 0 ? 1 : 0}>
    <circle r={44} fill={ok ? C.success : C.fail} />
    {ok ? (
      <path
        d="M -20 2 L -6 16 L 22 -14"
        fill="none"
        stroke={C.black}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="M -16 -16 L 16 16 M 16 -16 L -16 16"
        stroke={C.black}
        strokeWidth={10}
        strokeLinecap="round"
      />
    )}
  </g>
);

/** Quadratic ball path in metres. */
const arc = (
  t: number,
  a: [number, number],
  ctrl: [number, number],
  b: [number, number],
) => [
  (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * ctrl[0] + t ** 2 * b[0],
  (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * ctrl[1] + t ** 2 * b[1],
];

export const SERVE_BEAT = 4.4;
export const serveSceneSeconds = () =>
  1.0 + campaign.serving.length * SERVE_BEAT + 0.6;

/**
 * Serving rules: three beats (missed first serve → second attempt,
 * missed second → free ball, service transfers). ⚠ Mechanics pending confirmation.
 */
export const ServeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const beat = Math.min(
    campaign.serving.length - 1,
    Math.max(0, Math.floor((sec - 1) / SERVE_BEAT)),
  );
  const t = sec - 1 - beat * SERVE_BEAT; // seconds into beat
  const rule = campaign.serving[beat];
  const intro = interpolate(sec, [0, 0.4], [0, 1], clamp);

  // ball flight (0.5 → 1.6 s into beat)
  const fl = interpolate(t, [0.55, 1.6], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.33, 0, 0.67, 1),
  });
  let ball: number[] = [0, 0];
  let markPos = [0, 0];
  const serverX = -1.4;
  if (beat === 0) {
    // into the net, then drops
    if (fl < 0.85)
      ball = arc(
        fl / 0.85,
        [serverX + 0.3, 2.6],
        [4.5, 3.6],
        [NET_X - 0.15, NET_H - 0.35],
      );
    else
      ball = [
        NET_X - 0.15 - (fl - 0.85) * 3,
        NET_H - 0.35 - ((fl - 0.85) / 0.15) * (NET_H - 0.5),
      ];
    markPos = [mx(NET_X), my(NET_H + 1.4)];
  } else if (beat === 1) {
    // long — lands beyond the far end line
    ball = arc(fl, [serverX + 0.3, 2.6], [9, 6.2], [19.6, 0.12]);
    markPos = [mx(19.6), my(1.6)];
  } else {
    ball = [serverX + 0.3, 2.6];
  }
  const tossLift =
    beat < 2 ? interpolate(t, [0.1, 0.5, 0.55], [0, 1.1, 0.2], clamp) : 0;
  const showBall = beat < 2 ? t < 2.6 : false;
  const markS =
    beat < 2
      ? interpolate(t, [1.6, 1.85], [0, 1], {
          ...clamp,
          easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        })
      : 0;
  const pose: Pose =
    beat < 2 ? (t < 0.5 ? "toss" : t < 0.9 ? "serve" : "ready") : "ready";

  // beat 0: ball returns to server → "2ND ATTEMPT"; beat 1: free ball fed to opposition; beat 2: service badge crosses
  const retP =
    beat === 0
      ? interpolate(t, [2.4, 3.4], [0, 1], {
          ...clamp,
          easing: Easing.bezier(...ease.inOut),
        })
      : 0;
  const freeP =
    beat === 1
      ? interpolate(t, [2.5, 3.6], [0, 1], {
          ...clamp,
          easing: Easing.bezier(0.33, 0, 0.67, 1),
        })
      : 0;
  const freeBall = arc(freeP, [20.4, 2.2], [17, 4.2], [14.2, 1.9]);
  const xferP =
    beat === 2
      ? interpolate(t, [0.8, 2.2], [0, 1], {
          ...clamp,
          easing: Easing.bezier(...ease.inOut),
        })
      : 0;
  const badgeX = interpolate(xferP, [0, 1], [serverX, 18 + 1.4]);
  const badgeY = my(3.6) - Math.sin(xferP * Math.PI) * 140;

  // caption
  const capO =
    interpolate(
      t,
      [
        beat < 2 ? 1.75 : 0.2,
        (beat < 2 ? 1.75 : 0.2) + 0.35,
        SERVE_BEAT - 0.3,
        SERVE_BEAT,
      ],
      [0, 1, 1, 0],
      clamp,
    ) * (sec > 1 ? 1 : 0);
  const misses = beat === 0 ? (t > 1.6 ? 1 : 0) : 2;
  const chipsO = beat < 2 ? 1 : interpolate(t, [0, 0.3], [1, 0.5], clamp);

  return (
    <AbsoluteFill>
      <Backdrop intensity={0.5} />
      <div style={{ position: "absolute", top: 230, left: 90, opacity: intro }}>
        <Kicker text="SERVING RULES" size={30} color={C.accent} />
      </div>
      {/* caption */}
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 90,
          right: 150,
          opacity: capO,
          translate: `0px ${(1 - capO) * 24}px`,
        }}
      >
        <div
          style={{
            fontFamily: F.display,
            fontSize: fitSize(rule.title[0], 100, 830),
            color: C.white,
            lineHeight: 1.0,
            whiteSpace: "nowrap",
          }}
        >
          {rule.title[0]}
        </div>
        <div
          style={{
            fontFamily: F.display,
            fontSize: fitSize(rule.title[1], 80, 830),
            color: C.accent2,
            lineHeight: 1.05,
            marginTop: 10,
            whiteSpace: "nowrap",
          }}
        >
          {rule.title[1]}
        </div>
      </div>

      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0, opacity: intro }}
      >
        {/* floor + court */}
        <line
          x1={mx(-2.6)}
          x2={mx(21)}
          y1={GROUND}
          y2={GROUND}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={4}
        />
        <line
          x1={mx(0)}
          x2={mx(18)}
          y1={GROUND}
          y2={GROUND}
          stroke={C.bone}
          strokeWidth={8}
        />
        {[0, 18].map((x) => (
          <g key={x}>
            <line
              x1={mx(x)}
              x2={mx(x)}
              y1={GROUND - 16}
              y2={GROUND + 16}
              stroke={C.bone}
              strokeWidth={6}
            />
            <text
              x={mx(x)}
              y={GROUND + 60}
              textAnchor="middle"
              fontFamily={F.body}
              fontWeight={800}
              fontSize={22}
              letterSpacing={3}
              fill={C.mute}
            >
              END LINE
            </text>
          </g>
        ))}
        {/* net */}
        <line
          x1={mx(NET_X)}
          x2={mx(NET_X)}
          y1={GROUND}
          y2={my(NET_H)}
          stroke={C.mute}
          strokeWidth={8}
        />
        <rect
          x={mx(NET_X) - 7}
          y={my(NET_H)}
          width={14}
          height={(NET_H - 1.43) * 78}
          fill="rgba(255,255,255,0.18)"
          stroke={C.white}
          strokeWidth={3}
        />
        <rect
          x={mx(NET_X) - 7}
          y={my(NET_H)}
          width={14}
          height={9}
          fill={C.white}
        />
        <text
          x={mx(4.5)}
          y={GROUND + 110}
          textAnchor="middle"
          fontFamily={F.display}
          fontSize={38}
          fill={beat === 2 ? C.mute : C.white}
        >
          SERVING TEAM
        </text>
        <text
          x={mx(13.5)}
          y={GROUND + 110}
          textAnchor="middle"
          fontFamily={F.display}
          fontSize={38}
          fill={beat === 2 ? C.white : C.mute}
        >
          OPPOSITION
        </text>

        {/* players */}
        <Figure x={serverX} pose={pose} color={beat === 2 ? C.mute : C.white} />
        <Figure x={3.6} pose="ready" color="rgba(255,255,255,0.45)" />
        <Figure x={6.6} pose="ready" color="rgba(255,255,255,0.45)" />
        <Figure
          x={11.4}
          pose="ready"
          flip
          color={
            beat === 1 && freeP > 0.95 ? C.white : "rgba(255,255,255,0.45)"
          }
        />
        <Figure x={14.4} pose="ready" flip color="rgba(255,255,255,0.45)" />
        <Figure
          x={beat === 2 ? interpolate(xferP, [0, 1], [17, 19.4]) : 17}
          pose="ready"
          flip
          color={beat === 2 ? C.white : "rgba(255,255,255,0.45)"}
        />

        {/* trajectory trail */}
        {beat < 2 && fl > 0 && (
          <polyline
            points={new Array(24)
              .fill(0)
              .map((_, i) => {
                const tt = (i / 23) * fl;
                const b =
                  beat === 0
                    ? tt < 0.85
                      ? arc(
                          tt / 0.85,
                          [serverX + 0.3, 2.6],
                          [4.5, 3.6],
                          [NET_X - 0.15, NET_H - 0.35],
                        )
                      : [NET_X - 0.15, NET_H - 0.35]
                    : arc(tt, [serverX + 0.3, 2.6], [9, 6.2], [19.6, 0.12]);
                return `${mx(b[0])},${my(b[1])}`;
              })
              .join(" ")}
            fill="none"
            stroke={C.white}
            strokeWidth={4}
            strokeDasharray="10 12"
            opacity={0.6}
          />
        )}
        {/* ball */}
        {showBall && (
          <circle
            cx={mx(ball[0])}
            cy={my(ball[1] + tossLift)}
            r={16}
            fill={C.white}
            stroke={C.accent}
            strokeWidth={5}
          />
        )}
        {/* outcome marks */}
        {beat < 2 && (
          <Mark x={markPos[0]} y={markPos[1]} ok={false} s={markS} />
        )}

        {/* beat 0: second attempt — ball returns to the server */}
        {beat === 0 && retP > 0 && (
          <g>
            <path
              d={`M ${mx(NET_X - 1)} ${my(0.3)} Q ${mx(4)} ${my(3.2)} ${mx(serverX + 0.3)} ${my(2.6)}`}
              fill="none"
              stroke={C.success}
              strokeWidth={6}
              strokeDasharray="1"
              pathLength={1}
              strokeDashoffset={1 - retP}
            />
            <circle
              cx={mx(serverX + 0.3)}
              cy={my(2.6)}
              r={16 * retP}
              fill={C.white}
              stroke={C.success}
              strokeWidth={5}
            />
            <text
              x={mx(serverX) + 10}
              y={my(3.6)}
              fontFamily={F.display}
              fontSize={44}
              fill={C.success}
              opacity={retP}
            >
              2ND ATTEMPT
            </text>
          </g>
        )}
        {/* beat 1: free ball to the opposition */}
        {beat === 1 && freeP > 0 && (
          <g>
            <circle
              cx={mx(freeBall[0])}
              cy={my(freeBall[1])}
              r={16}
              fill={C.white}
              stroke={C.success}
              strokeWidth={5}
            />
            <text
              x={mx(13.5)}
              y={my(4.6)}
              textAnchor="middle"
              fontFamily={F.display}
              fontSize={50}
              fill={C.success}
              opacity={freeP}
            >
              FREE BALL
            </text>
            <Mark
              x={mx(13.5)}
              y={my(6.0)}
              ok
              s={interpolate(freeP, [0.85, 1], [0, 1], clamp)}
            />
          </g>
        )}
        {/* beat 2: service passes across */}
        {beat === 2 && (
          <g>
            <path
              d={`M ${mx(serverX)} ${my(3.6)} Q ${mx(9)} ${my(3.6) - 280} ${mx(19.4)} ${my(3.6)}`}
              fill="none"
              stroke={C.white}
              strokeWidth={6}
              strokeDasharray="1"
              pathLength={1}
              strokeDashoffset={1 - xferP}
            />
            <g transform={`translate(${mx(badgeX)} ${badgeY})`}>
              <rect
                x={-80}
                y={-34}
                width={160}
                height={68}
                rx={34}
                fill={C.white}
              />
              <text
                y={14}
                textAnchor="middle"
                fontFamily={F.display}
                fontSize={40}
                fill={C.black}
              >
                SERVE
              </text>
            </g>
          </g>
        )}
      </svg>

      {/* serve attempt chips */}
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 1440,
          display: "flex",
          gap: 18,
          alignItems: "center",
          opacity: chipsO * intro,
        }}
      >
        <div
          style={{
            fontFamily: F.body,
            fontWeight: 900,
            fontSize: 26,
            letterSpacing: "0.2em",
            color: C.bone,
          }}
        >
          SERVES
        </div>
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: i < misses ? C.fail : "transparent",
              border: `3px solid ${i < misses ? C.fail : C.steel}`,
              fontFamily: F.display,
              fontSize: 30,
              color: i < misses ? C.black : C.mute,
            }}
          >
            {i < misses ? "✕" : i + 1}
          </div>
        ))}
      </div>

      {campaign.serving.map((_, i) => (
        <React.Fragment key={i}>
          {i < 2 ? (
            <Sfx
              name="ball-impact"
              at={(1 + i * SERVE_BEAT + 0.9) * fps}
              volume={0.8}
            />
          ) : null}
          {i < 2 ? (
            <Sfx
              name="bass-hit"
              at={(1 + i * SERVE_BEAT + 1.6) * fps}
              volume={0.5}
            />
          ) : null}
          {i === 2 ? (
            <Sfx
              name="whoosh"
              at={(1 + i * SERVE_BEAT + 0.75) * fps}
              volume={0.6}
            />
          ) : null}
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};
