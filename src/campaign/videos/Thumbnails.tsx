import React from "react";
import { AbsoluteFill } from "remotion";
import { campaign } from "../config";
import { FootageShot, ShotKey } from "../components/FootageShot";
import { LogoLockup } from "../components/Logos";
import { C, F } from "../theme";
import { fitSize } from "../components/Kinetic";

/** Reel cover / thumbnail options. Text sits in the centre 1080×1350 so the 4:5 grid crop keeps it. */
export const Thumbnail: React.FC<{ variant: 1 | 2 | 3 }> = ({ variant }) => {
  const shot: ShotKey =
    variant === 1 ? "hook" : variant === 2 ? "wide1" : "community2";
  const lines =
    variant === 1
      ? ["FRIDAY", "NIGHT", "VOLLEYBALL"]
      : variant === 2
        ? ["6 COURTS.", "UP TO", "84 PLAYERS.", "EVERY FRIDAY", "NIGHT."]
        : ["GOOD", "VOLLEYBALL.", "GREAT", "COMPANY."];
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <FootageShot shot={shot} push={0} withSound={false} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0.5) 100%)",
        }}
      />
      <AbsoluteFill
        style={{ justifyContent: "center", padding: "0 90px", gap: 0 }}
      >
        <div
          style={{
            fontFamily: F.body,
            fontWeight: 900,
            fontSize: 36,
            letterSpacing: "0.28em",
            color: C.accent2,
            marginBottom: 16,
          }}
        >
          {variant === 1 ? campaign.event.day : campaign.event.venueShort}
        </div>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              fontFamily: F.display,
              fontSize: fitSize(l, variant === 1 ? 210 : 170, 900),
              lineHeight: 0.98,
              color:
                i === lines.length - 1 && variant !== 1 ? C.accent : C.white,
            }}
          >
            {l}
          </div>
        ))}
      </AbsoluteFill>
      <div style={{ position: "absolute", bottom: 330, left: 0, right: 0 }}>
        <LogoLockup size={150} gap={20} revealed />
      </div>
    </AbsoluteFill>
  );
};
