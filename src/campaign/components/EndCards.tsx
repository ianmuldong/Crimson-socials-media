import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { campaign } from "../config";
import { C, ease, F } from "../theme";
import { Kicker, KineticHeadline, Rule } from "./Kinetic";
import { OrganiserCredit } from "./Logos";

/** Premium dark backdrop with a slow light drift. */
export const Backdrop: React.FC<{ intensity?: number }> = ({
  intensity = 1,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 90% 50% at 50% ${interpolate(frame, [0, durationInFrames], [38, 46])}%, ${C.accentDeep} 0%, rgba(20,6,9,0.9) 45%, ${C.black} 80%)`,
          opacity: 0.85 * intensity,
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)`,
          translate: `${interpolate(frame, [0, durationInFrames], [-400, 400])}px 0px`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Event details block: day, venue, time, welcome line, sign-off, CTA. */
export const EventInfoCard: React.FC<{ short?: boolean }> = ({
  short = false,
}) => {
  const e = campaign.event;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cta = interpolate(frame, [1.4 * fps, 1.8 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...ease.out),
  });
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ padding: "260px 150px 0 90px", gap: 26 }}>
        <KineticHeadline
          lines={e.nameLines as unknown as string[]}
          size={118}
          align="left"
          staggerSec={0.08}
        />
        <Rule startSec={0.35} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            marginTop: 10,
          }}
        >
          <Kicker text={e.day} startSec={0.45} size={52} color={C.white} />
          <Kicker
            text={short ? e.venueShort : e.venue}
            startSec={0.6}
            size={46}
          />
          {!short ? <Kicker text={e.suburb} startSec={0.7} size={46} /> : null}
          <Kicker
            text={e.timeRange}
            startSec={0.85}
            size={46}
            color={C.accent2}
          />
          <Kicker text={e.welcome} startSec={0.95} size={40} color={C.bone} />
          <Kicker text={e.signOff} startSec={1.05} size={40} color={C.white} />
        </div>
        <div
          style={{
            marginTop: 34,
            alignSelf: "flex-start",
            background: C.white,
            padding: "18px 34px",
            opacity: cta,
            scale: 0.9 + 0.1 * cta,
            transformOrigin: "left",
          }}
        >
          <div
            style={{
              fontFamily: F.display,
              fontSize: 72,
              color: C.black,
              lineHeight: 1,
            }}
          >
            {e.bookingCta}
          </div>
        </div>
        {e.bookingUrl ? (
          <Kicker text={e.bookingUrl} startSec={1.7} size={34} />
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Collaborative end card: event name, PROUDLY HOSTED BY, three equal logos,
 * the three-way name line and the booking CTA.
 */
export const OrganiserEndCard: React.FC<{
  withCta?: boolean;
  withEvent?: boolean;
}> = ({ withCta = true, withEvent = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ctaP = interpolate(frame, [1.2 * fps, 1.6 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...ease.out),
  });
  return (
    <AbsoluteFill>
      <Backdrop intensity={0.7} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          paddingTop: 300,
          gap: 34,
          paddingLeft: 90,
          paddingRight: 150,
        }}
      >
        {withEvent ? (
          <KineticHeadline
            lines={campaign.event.nameLines as unknown as string[]}
            size={96}
            staggerSec={0.08}
          />
        ) : null}
        <div style={{ height: 30 }} />
        <OrganiserCredit startSec={0.3} size={260} gap={30} />
        {withCta ? (
          <div
            style={{
              marginTop: 50,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              opacity: ctaP,
              translate: `0px ${(1 - ctaP) * 30}px`,
            }}
          >
            <div
              style={{
                fontFamily: F.display,
                fontSize: 72,
                color: C.white,
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {campaign.event.signOff}
            </div>
            <div style={{ background: C.white, padding: "14px 36px" }}>
              <div
                style={{
                  fontFamily: F.display,
                  fontSize: 56,
                  color: C.black,
                  lineHeight: 1,
                }}
              >
                {campaign.event.bookingCta}
              </div>
            </div>
            {campaign.event.bookingUrl ? (
              <div
                style={{
                  fontFamily: F.body,
                  fontWeight: 700,
                  fontSize: 32,
                  color: C.bone,
                }}
              >
                {campaign.event.bookingUrl}
              </div>
            ) : null}
            <div
              style={{
                fontFamily: F.body,
                fontWeight: 700,
                fontSize: 28,
                color: C.mute,
                letterSpacing: "0.12em",
                whiteSpace: "nowrap",
              }}
            >
              {campaign.event.day} · {campaign.event.timeRange}
            </div>
            <div
              style={{
                fontFamily: F.body,
                fontWeight: 700,
                fontSize: 28,
                color: C.mute,
                letterSpacing: "0.12em",
                whiteSpace: "nowrap",
              }}
            >
              {campaign.event.venue}, {campaign.event.suburb}
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Closing card used by the main promo and the explainer: event details at
 * the top, three equal organiser logos below, held long enough to read.
 */
export const ClosingCard: React.FC<{ venueLines?: "full" | "short" }> = ({
  venueLines = "full",
}) => {
  const e = campaign.event;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cta = interpolate(frame, [1.1 * fps, 1.45 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(...ease.out),
  });
  return (
    <AbsoluteFill>
      <Backdrop intensity={0.7} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          paddingTop: 230,
          paddingLeft: 90,
          paddingRight: 150,
        }}
      >
        <KineticHeadline
          lines={e.nameLines as unknown as string[]}
          size={96}
          staggerSec={0.08}
        />
        <div style={{ height: 22 }} />
        <Kicker text={e.day + "."} startSec={0.3} size={48} color={C.white} />
        <div style={{ height: 10 }} />
        <Kicker
          text={e.timeRange + "."}
          startSec={0.42}
          size={44}
          color={C.accent2}
        />
        <div style={{ height: 10 }} />
        {venueLines === "full" ? (
          <>
            <Kicker text={e.venue + ","} startSec={0.52} size={40} />
            <Kicker text={e.suburb + "."} startSec={0.6} size={40} />
          </>
        ) : (
          <Kicker text={e.venueShort + "."} startSec={0.52} size={40} />
        )}
        <div style={{ height: 26 }} />
        <div
          style={{
            fontFamily: F.display,
            fontSize: 72,
            color: C.white,
            lineHeight: 1,
            opacity: cta,
            translate: `0px ${(1 - cta) * 20}px`,
            whiteSpace: "nowrap",
          }}
        >
          {e.signOff}
        </div>
        <div
          style={{
            marginTop: 20,
            background: C.white,
            padding: "12px 34px",
            opacity: cta,
            scale: 0.9 + 0.1 * cta,
          }}
        >
          <div
            style={{
              fontFamily: F.display,
              fontSize: 50,
              color: C.black,
              lineHeight: 1,
            }}
          >
            {e.bookingCta}
          </div>
        </div>
        {e.bookingUrl ? (
          <div style={{ marginTop: 12 }}>
            <Kicker text={e.bookingUrl} startSec={1.3} size={30} />
          </div>
        ) : null}
        <div style={{ height: 46 }} />
        <OrganiserCredit startSec={1.4} size={250} gap={30} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
