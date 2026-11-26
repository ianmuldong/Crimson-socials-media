/**
 * Crimson Volleyball Club brand tokens.
 * Change values here and every template picks them up.
 */
export const colors = {
  crimson: "#C8102E",
  crimsonBright: "#E3173A",
  maroon: "#5A0A16",
  deepMaroon: "#2A0309",
  black: "#070707",
  charcoal: "#141414",
  white: "#FFFFFF",
  offWhite: "#F3EEEE",
  court: "#1B1B1B",
  courtLine: "#F3EEEE",
} as const;

export const fonts = {
  display: "Anton, Impact, 'Arial Narrow Bold', sans-serif",
  body: "Inter, 'Helvetica Neue', Arial, sans-serif",
} as const;

/** Vertical social format: Instagram Reels / TikTok / Shorts. */
export const VERTICAL = { width: 1080, height: 1920 } as const;

/** Keep key text inside this safe area (Remotion layout guidance + IG UI overlays). */
export const SAFE = { side: 80, top: 160, bottom: 320 } as const;

export const handle = "@crimson.vc";
