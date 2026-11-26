import React from "react";
import { AbsoluteFill } from "remotion";
import { campaign } from "../config";
import { Backdrop, OrganiserEndCard } from "../components/EndCards";
import { VenueMap } from "../components/VenueMap";
import { C, F, SAFE } from "../theme";
import { venue } from "../venue";

/** Approval still: the proposed venue layout with spot ids, stationary spots and clockwise order. */
export const VenueLayoutPreview: React.FC = () => {
  const c = venue.mainCourts[0];
  return (
    <AbsoluteFill>
      <Backdrop intensity={0.4} />
      <div style={{ position: "absolute", top: 120, left: 70, right: 70 }}>
        <div
          style={{
            fontFamily: F.body,
            fontWeight: 900,
            fontSize: 30,
            letterSpacing: "0.25em",
            color: C.accent,
          }}
        >
          FOR APPROVAL · PROPOSED LAYOUT
        </div>
        <div
          style={{
            fontFamily: F.display,
            fontSize: 84,
            color: C.white,
            lineHeight: 1.05,
          }}
        >
          VENUE + ROTATION
        </div>
        <div
          style={{
            fontFamily: F.body,
            fontWeight: 600,
            fontSize: 30,
            color: C.bone,
            marginTop: 10,
            lineHeight: 1.35,
          }}
        >
          {campaign.event.mainCourts} main courts × 3 playing areas ={" "}
          {campaign.event.courts} courts · 12 team spots ·{" "}
          {venue.playersPerTeam} players per team = {campaign.event.maxPlayers}
        </div>
      </div>
      <div style={{ position: "absolute", top: 400, left: 130 }}>
        <VenueMap
          width={820}
          showSpotIds
          state={{
            rotation: 0,
            move: 0,
            arrows: 1,
            stationary: 1,
            teams: 1,
            labels: 1,
            draw: 1,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          bottom: 80,
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 28,
          color: C.bone,
          lineHeight: 1.45,
        }}
      >
        <div>
          <span style={{ color: C.stationary }}>●</span> Stationary spot
          (assumed): <b>{c.stationarySpot}</b> on each main court
        </div>
        <div>
          ➜ Clockwise order (assumed):{" "}
          <b>
            {c.cycle.join(" → ")} → {c.cycle[0]}
          </b>
          , skipping the stationary spot
        </div>
        <div style={{ color: C.mute }}>
          Arrows show where each team goes after game 1. Orientation in the hall
          is not to scale.
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Approval still: closing logo arrangement with Reels safe-zone guides. */
export const LogoArrangementPreview: React.FC<{ guides?: boolean }> = ({
  guides = true,
}) => (
  <AbsoluteFill>
    <OrganiserEndCard />
    {guides ? <SafeZoneGuides /> : null}
  </AbsoluteFill>
);

/** Instagram Reels / TikTok UI safe-zone overlay for QC stills. */
export const SafeZoneGuides: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: SAFE.top,
        background: "rgba(0,160,255,0.18)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: SAFE.bottom,
        background: "rgba(0,160,255,0.18)",
      }}
    />
    <div
      style={{
        position: "absolute",
        right: 0,
        top: SAFE.top,
        bottom: SAFE.bottom,
        width: SAFE.right,
        background: "rgba(0,160,255,0.12)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        right: SAFE.right,
        top: SAFE.top,
        bottom: SAFE.bottom,
        border: "3px dashed rgba(0,200,255,0.8)",
      }}
    />
  </AbsoluteFill>
);
