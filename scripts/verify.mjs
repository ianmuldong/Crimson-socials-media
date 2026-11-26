#!/usr/bin/env node
// Verify finished MP4s with FFprobe: 1080×1920, H.264, 30/60 FPS, real duration.
// Usage: npm run verify -- exports/test/crimson-test-30fps.mp4 [more files]
import { existsSync, statSync } from "node:fs";
import { ffprobe, parseArgs, parseRate } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
if (args._.length === 0) {
  console.error("Usage: npm run verify -- <file.mp4> [...]");
  process.exit(2);
}

let failed = false;
for (const file of args._) {
  if (!existsSync(file)) {
    console.error(`✗ ${file}: file not found`);
    failed = true;
    continue;
  }
  const info = ffprobe(file);
  const v = info.streams.find((s) => s.codec_type === "video");
  const a = info.streams.find((s) => s.codec_type === "audio");
  const fps = parseRate(v?.avg_frame_rate || v?.r_frame_rate);
  const duration = Number(info.format.duration);
  const checks = [
    ["video stream present", Boolean(v)],
    ["H.264 codec", v?.codec_name === "h264"],
    ["1080×1920 vertical", v?.width === 1080 && v?.height === 1920],
    ["30 or 60 FPS", Math.abs(fps - 30) < 0.01 || Math.abs(fps - 60) < 0.01],
    ["yuv420p (phone compatible)", v?.pix_fmt === "yuv420p"],
    ["duration > 0", duration > 0],
  ];
  const ok = checks.every(([, pass]) => pass);
  failed ||= !ok;
  console.log(`\n${ok ? "✓" : "✗"} ${file}`);
  console.log(
    `  ${v?.width}×${v?.height} · ${v?.codec_name} ${v?.profile ?? ""} · ${fps.toFixed(2)} fps · ${duration.toFixed(2)} s · ` +
      `${v?.nb_frames ?? "?"} frames · ${(statSync(file).size / 1e6).toFixed(1)} MB · audio: ${a ? a.codec_name : "none"}`,
  );
  for (const [name, pass] of checks)
    console.log(`  ${pass ? "✓" : "✗"} ${name}`);
}
process.exit(failed ? 1 : 0);
