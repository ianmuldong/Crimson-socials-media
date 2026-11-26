import React from "react";
import {
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { campaign, Org } from "../config";
import { C, ease, F } from "../theme";
import { hasAsset } from "./assets";

/**
 * One organiser logo inside a fixed square. The supplied file is shown
 * untouched (objectFit: contain keeps its proportions and colours).
 * If the file hasn't been supplied yet, a labelled empty tile is shown.
 */
export const LogoTile: React.FC<{
  org: Org;
  size: number;
  plate?: boolean;
}> = ({ org, size, plate = true }) => {
  const present = hasAsset(org.logo);
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: plate ? "rgba(255,255,255,0.04)" : "transparent",
        border: present
          ? "1px solid rgba(255,255,255,0.10)"
          : "3px dashed rgba(255,255,255,0.3)",
        borderRadius: 12,
        padding: size * 0.1,
        boxSizing: "border-box",
      }}
    >
      {present ? (
        <Img
          src={staticFile(org.logo)}
          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        />
      ) : (
        <div style={{ textAlign: "center", fontFamily: F.body, color: C.mute }}>
          <div
            style={{
              fontWeight: 900,
              fontSize: size * 0.1,
              letterSpacing: "0.08em",
              color: C.bone,
            }}
          >
            {org.short}
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: size * 0.065,
              marginTop: 8,
              letterSpacing: "0.12em",
            }}
          >
            LOGO PENDING
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Three logos side by side at identical size and identical timing, so no
 * organiser is visually ranked above another.
 */
export const LogoLockup: React.FC<{
  startSec?: number;
  size?: number;
  gap?: number;
  showNames?: boolean;
}> = ({ startSec = 0, size = 250, gap = 36, showNames = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(
    frame,
    [startSec * fps, (startSec + 0.6) * fps],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(...ease.out),
    },
  );
  return (
    <div
      style={{
        display: "flex",
        gap,
        justifyContent: "center",
        opacity: p,
        translate: `0px ${(1 - p) * 40}px`,
        scale: 0.94 + 0.06 * p,
      }}
    >
      {campaign.orgs.map((o) => (
        <div
          key={o.id}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <LogoTile org={o} size={size} />
          {showNames ? (
            <div
              style={{
                fontFamily: F.body,
                fontWeight: 800,
                fontSize: 24,
                color: C.bone,
                letterSpacing: "0.14em",
              }}
            >
              {o.short}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};
