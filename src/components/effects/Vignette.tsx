import React from "react";
import { AbsoluteFill } from "remotion";

/** Cinematic edge darkening. */
export const Vignette: React.FC<{ strength?: number }> = ({
  strength = 0.75,
}) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);
