import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { campaign } from "../config";

export type SfxName =
  | "whoosh"
  | "bass-hit"
  | "whistle"
  | "ball-impact"
  | "riser"
  | "tick";

/** A sound effect placed at an absolute frame. */
export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number }> = ({
  name,
  at,
  volume = 1,
}) => (
  <Sequence
    from={Math.max(0, Math.round(at))}
    durationInFrames={60}
    layout="none"
    name={`SFX ${name}`}
  >
    <Audio
      src={staticFile(`audio/sfx/${name}.wav`)}
      volume={volume * campaign.music.sfxVolume}
    />
  </Sequence>
);

/** Licensed music bed, if one is configured. Otherwise the export stays clean for in-app music. */
export const MusicBed: React.FC<{ fadeOutFrames?: number; total: number }> = ({
  total,
  fadeOutFrames = 45,
}) => {
  if (!campaign.music.src) return null;
  return (
    <Audio
      src={staticFile(campaign.music.src)}
      volume={(f) =>
        campaign.music.volume * Math.min(1, f / 10, (total - f) / fadeOutFrames)
      }
    />
  );
};
