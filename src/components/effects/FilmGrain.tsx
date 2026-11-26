import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";

/** Animated film grain. Deterministic per frame, so renders are reproducible. */
export const FilmGrain: React.FC<{ opacity?: number }> = ({
  opacity = 0.09,
}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(random(`grain-${frame}`) * 1000);
  return (
    <AbsoluteFill
      style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity }}
    >
      <svg width="100%" height="100%">
        <filter id={`grain-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
