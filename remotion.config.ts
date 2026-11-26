/**
 * Remotion CLI + Studio configuration.
 * Note: when using the Node.js APIs (scripts/), pass options directly instead.
 * All options: https://remotion.dev/docs/config
 */
import { Config } from "@remotion/cli/config";
import { existsSync } from "node:fs";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// H.264 MP4 at high quality: the format Instagram Reels and TikTok expect.
Config.setCodec("h264");
Config.setCrf(16);
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");

// Remotion normally downloads its own Chrome Headless Shell. In locked-down
// cloud sandboxes that download can be blocked, so fall back to a
// pre-installed Chromium if one is available (or REMOTION_BROWSER_EXECUTABLE).
const fallbackBrowsers = [
  process.env.REMOTION_BROWSER_EXECUTABLE,
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell",
].filter((p): p is string => Boolean(p));
const remotionBrowserDownloaded = existsSync(
  "node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell",
) || process.platform !== "linux";
const fallback = fallbackBrowsers.find((p) => existsSync(p));
if (!remotionBrowserDownloaded && fallback) {
  Config.setBrowserExecutable(fallback);
}
