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
 * Equal visual weight: every logo's artwork is scaled to cover the same
 * on-screen area (ART_AREA × slot²), constrained to the slot. This stops a
 * wide logo looking bigger than a tall one, or a logo with wide empty
 * margins looking smaller.
 */
const ART_AREA = 0.6;

const artSize = (org: Org, slot: number) => {
  const [l, t, r, b] = org.artBox;
  // natural aspect of the artwork needs the image's pixel aspect; store it per id
  const imgAspect = LOGO_PIXEL_ASPECT[org.id] ?? 1;
  const aspect = ((r - l) / (b - t)) * imgAspect;
  let h = Math.sqrt((ART_AREA * slot * slot) / aspect);
  let w = h * aspect;
  const maxW = slot * 0.96;
  const maxH = slot * 0.92;
  if (w > maxW) {
    w = maxW;
    h = w / aspect;
  }
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }
  return { w, h };
};

/** Pixel width ÷ height of each supplied file (update if a logo file is replaced). */
const LOGO_PIXEL_ASPECT: Record<Org["id"], number> = {
  chequers: 555 / 370,
  crimson: 1238 / 1271,
  do: 500 / 500,
};

/**
 * The official logo, unmodified. The display window shows only the artwork
 * area (artBox); the file's own pixels, colours and proportions are untouched.
 */
export const LogoArt: React.FC<{ org: Org; slot: number }> = ({
  org,
  slot,
}) => {
  const { w, h } = artSize(org, slot);
  const [l, t, r, b] = org.artBox;
  const imgW = w / (r - l);
  const imgH = h / (b - t);
  return (
    <div
      style={{ width: w, height: h, overflow: "hidden", position: "relative" }}
    >
      <Img
        src={staticFile(org.logo)}
        style={{
          position: "absolute",
          width: imgW,
          height: imgH,
          left: -l * imgW,
          top: -t * imgH,
        }}
      />
    </div>
  );
};

/**
 * One organiser panel: pure-black plate (so logos supplied on black blend
 * seamlessly) with a hairline frame. Missing files show "LOGO PENDING".
 */
export const LogoTile: React.FC<{ org: Org; size: number }> = ({
  org,
  size,
}) => {
  const present = hasAsset(org.logo);
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000000",
        border: present
          ? "1px solid rgba(255,255,255,0.14)"
          : "3px dashed rgba(255,255,255,0.3)",
        borderRadius: 10,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {present ? (
        <LogoArt org={org} slot={size} />
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
 * Premium logo reveal. All three panels animate with IDENTICAL timing (no
 * organiser enters first): plates rise, a hairline frame draws on, each logo
 * is unmasked bottom-up out of a soft blur, then one light sweep crosses all
 * three together. "×" separators land last.
 */
export const LogoLockup: React.FC<{
  startSec?: number;
  size?: number;
  gap?: number;
  showNames?: boolean;
}> = ({ startSec = 0, size = 250, gap = 36, showNames = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = startSec * fps;
  const k = (
    a: number,
    b: number,
    e: readonly [number, number, number, number] = ease.out,
  ) =>
    interpolate(frame, [s + a * fps, s + b * fps], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(...e),
    });
  const rise = k(0, 0.55);
  const frameDraw = k(0.1, 0.7, ease.inOut);
  const unmask = k(0.25, 0.85);
  const sweep = k(0.7, 1.35, ease.inOut);
  const sep = k(0.75, 1.05);
  const totalW = size * 3 + gap * 2;
  const per = size * 4;
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        gap,
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      {campaign.orgs.map((o, i) => (
        <React.Fragment key={o.id}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              opacity: rise,
              translate: `0px ${(1 - rise) * 60}px`,
            }}
          >
            <div style={{ position: "relative", width: size, height: size }}>
              <div
                style={{
                  clipPath: `inset(${(1 - unmask) * 100}% 0% 0% 0%)`,
                  filter: `blur(${(1 - unmask) * 10}px)`,
                  scale: 1.06 - 0.06 * unmask,
                }}
              >
                <LogoTile org={o} size={size} />
              </div>
              <svg
                width={size}
                height={size}
                style={{ position: "absolute", inset: 0, overflow: "visible" }}
              >
                <rect
                  x={0.5}
                  y={0.5}
                  width={size - 1}
                  height={size - 1}
                  rx={10}
                  fill="none"
                  stroke={C.white}
                  strokeWidth={2}
                  strokeDasharray={per}
                  strokeDashoffset={per * (1 - frameDraw)}
                  opacity={0.9 - 0.65 * sweep}
                />
              </svg>
            </div>
            {showNames ? (
              <div
                style={{
                  fontFamily: F.body,
                  fontWeight: 800,
                  fontSize: 22,
                  color: C.bone,
                  letterSpacing: "0.12em",
                  whiteSpace: "nowrap",
                }}
              >
                {o.short}
              </div>
            ) : null}
          </div>
          {i < campaign.orgs.length - 1 ? (
            <div
              style={{
                position: "absolute",
                left: `calc(50% - ${totalW / 2}px + ${(i + 1) * size + i * gap + gap / 2}px)`,
                top: size / 2,
                translate: "-50% -50%",
                fontFamily: F.body,
                fontWeight: 300,
                fontSize: Math.max(34, gap * 1.2),
                color: C.white,
                opacity: sep * 0.8,
              }}
            >
              ×
            </div>
          ) : null}
        </React.Fragment>
      ))}
      {/* single light sweep across all three panels at once */}
      <div
        style={{
          position: "absolute",
          left: `calc(50% - ${totalW / 2}px)`,
          top: 0,
          width: totalW,
          height: size,
          overflow: "hidden",
          pointerEvents: "none",
          mixBlendMode: "screen",
          opacity: sweep > 0 && sweep < 1 ? 1 : 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-60%",
            width: 140,
            height: "220%",
            rotate: "20deg",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)",
            translate: `${-200 + sweep * (totalW + 400)}px 0px`,
            filter: "blur(10px)",
          }}
        />
      </div>
    </div>
  );
};

/**
 * Closing credit: "PROUDLY RUN BY / CHEQUERS × CRIMSON × DO VOLLEYBALL"
 * read as one statement, directly above the three equal logo panels.
 */
export const OrganiserCredit: React.FC<{
  startSec?: number;
  size?: number;
  gap?: number;
  showNames?: boolean;
}> = ({ startSec = 0, size = 240, gap = 28, showNames = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (d: number) =>
    interpolate(
      frame,
      [(startSec + d) * fps, (startSec + d + 0.45) * fps],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.bezier(...ease.out),
      },
    );
  const a = t(0);
  const b = t(0.1);
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div
        style={{
          fontFamily: F.body,
          fontWeight: 800,
          fontSize: 28,
          letterSpacing: `${0.42 - 0.12 * a}em`,
          color: C.mute,
          opacity: a,
          whiteSpace: "nowrap",
        }}
      >
        {campaign.text.proudlyRunBy}
      </div>
      <div
        style={{
          fontFamily: F.display,
          fontSize: 50,
          letterSpacing: "0.04em",
          color: C.white,
          marginTop: 8,
          opacity: b,
          translate: `0px ${(1 - b) * 16}px`,
          whiteSpace: "nowrap",
        }}
      >
        {campaign.text.orgLine.split("×").map((part, i, all) => (
          <React.Fragment key={i}>
            {part.trim()}
            {i < all.length - 1 ? (
              <span
                style={{
                  fontFamily: F.body,
                  fontWeight: 300,
                  fontSize: 44,
                  margin: "0 18px",
                  color: C.accent2,
                  position: "relative",
                  top: -3,
                }}
              >
                ×
              </span>
            ) : null}
          </React.Fragment>
        ))}
      </div>
      <div style={{ height: 30 }} />
      <LogoLockup
        startSec={startSec + 0.15}
        size={size}
        gap={gap}
        showNames={showNames}
      />
    </div>
  );
};
