import { campaign } from "./config";

export const C = campaign.colors;
export const F = {
  display: "Anton, Impact, 'Arial Narrow Bold', sans-serif",
  body: "Inter, 'Helvetica Neue', Arial, sans-serif",
};
/** Instagram Reels / TikTok safe area for 1080×1920 (UI covers top, bottom and right edge). */
export const SAFE = { top: 220, bottom: 400, left: 90, right: 150 } as const;
export const W = 1080;
export const H = 1920;
export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  snap: [0.85, 0, 0.15, 1] as const,
};
export const beatFrames = (fps: number) => (fps * 60) / campaign.music.bpm;
