import React from "react";
import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import plan from "../footage-plan.json";
import { campaign } from "../config";
import { C, F } from "../theme";
import { hasAsset } from "./assets";

export type ShotKey = keyof typeof plan.shots;
type Shot = {
  label: string;
  src: string | null;
  trimStartSec: number;
  rampAtSec?: number;
  slowRate?: number;
};

/** High-contrast commercial grade: deep blacks, slightly desaturated, warm-maroon shadows. */
const Grade: React.FC = () => (
  <>
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.75) 100%)`,
      }}
    />
    <AbsoluteFill
      style={{
        background: C.accentDeep,
        mixBlendMode: "soft-light",
        opacity: 0.35,
      }}
    />
  </>
);

/** Shown until real footage is assigned — clearly labelled, never fake footage. */
const Placeholder: React.FC<{ label: string; name: string }> = ({
  label,
  name,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.graphite, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 46px)`,
          translate: `${(frame * 1.5) % 65}px 0px`,
          width: "120%",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${C.steel} 0%, ${C.ink} 75%)`,
          opacity: 0.85,
        }}
      />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", padding: 120 }}
      >
        <div
          style={{
            border: "3px dashed rgba(255,255,255,0.22)",
            padding: "26px 34px",
            textAlign: "center",
            top: 330,
            position: "absolute",
          }}
        >
          <div
            style={{
              fontFamily: F.body,
              fontWeight: 800,
              fontSize: 26,
              letterSpacing: "0.3em",
              color: C.mute,
            }}
          >
            FOOTAGE SLOT · {name.toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: F.body,
              fontWeight: 600,
              fontSize: 30,
              color: "rgba(255,255,255,0.55)",
              marginTop: 10,
            }}
          >
            {label}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * A graded footage shot that fills the 9:16 frame. Uses the clip assigned in
 * footage-plan.json; optional controlled speed ramp (normal → slow motion).
 */
export const FootageShot: React.FC<{
  shot: ShotKey;
  push?: number;
  withSound?: boolean;
}> = ({ shot, push = 0.06, withSound = true }) => {
  const s = plan.shots[shot] as Shot;
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const scale = interpolate(
    frame,
    [0, Math.max(1, durationInFrames)],
    [1 + push, 1],
    { extrapolateRight: "clamp" },
  );
  const available = hasAsset(s.src);
  const vol = withSound ? campaign.music.footageVolume : 0;

  let body: React.ReactNode;
  if (!available || !s.src) {
    body = <Placeholder label={s.label} name={shot} />;
  } else if (s.rampAtSec !== undefined && s.slowRate) {
    const rampFrame = Math.round(s.rampAtSec * fps);
    body = (
      <>
        <Sequence durationInFrames={rampFrame} layout="none">
          <Video
            src={staticFile(s.src)}
            trimBefore={Math.round(s.trimStartSec * fps)}
            objectFit="cover"
            volume={vol}
            style={{ width: "100%", height: "100%" }}
          />
        </Sequence>
        <Sequence from={rampFrame} layout="none">
          <Video
            src={staticFile(s.src)}
            trimBefore={Math.round((s.trimStartSec + s.rampAtSec) * fps)}
            playbackRate={s.slowRate}
            objectFit="cover"
            volume={vol * 0.6}
            style={{ width: "100%", height: "100%" }}
          />
        </Sequence>
      </>
    );
  } else {
    body = (
      <Video
        src={staticFile(s.src)}
        trimBefore={Math.round(s.trimStartSec * fps)}
        objectFit="cover"
        volume={vol}
        style={{ width: "100%", height: "100%" }}
      />
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: C.black, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          scale,
          filter: available
            ? "contrast(1.18) saturate(0.8) brightness(0.92)"
            : undefined,
        }}
      >
        {body}
      </AbsoluteFill>
      <Grade />
    </AbsoluteFill>
  );
};
