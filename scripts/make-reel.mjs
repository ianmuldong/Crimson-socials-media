#!/usr/bin/env node
/**
 * Automatically build a branded promo reel from your processed footage.
 *
 *   npm run reel
 *   npm run reel -- --name=friday-socials --headline=FRIDAY --subline="CRIMSON SOCIALS"
 *   npm run reel -- --fps=60 --clip-seconds=2 --max-clips=10 --music=audio/music/track.mp3
 *   npm run reel -- --dry-run      # only write the props JSON, don't render
 *
 * How it chooses moments: every clip is sampled with FFmpeg's scene-change
 * detector and the window with the most on-screen movement (spikes, digs,
 * celebrations) is picked. Clips are ordered as they appear in the manifest.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import {
  AUDIO_EXTS,
  ensureDir,
  EXPORTS,
  MANIFEST,
  MUSIC_DIR,
  parseArgs,
  PUBLIC,
  rel,
  ROOT,
  run,
} from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const fps = Number(args.fps ?? 30);
const clipSec = Number(args["clip-seconds"] ?? 2.5);
const maxClips = Number(args["max-clips"] ?? 8);
const name = String(
  args.name ?? `promo-${new Date().toISOString().slice(0, 10)}`,
);

if (!existsSync(MANIFEST)) {
  console.error(
    "No footage manifest yet. Put clips in public/footage/raw and run: npm run ingest",
  );
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const clips = manifest.clips.filter((c) => c.fps === fps).slice(0, maxClips);
if (clips.length === 0) {
  console.error(
    `No ${fps} FPS clips in the manifest. Run: npm run ingest -- --fps=${fps}`,
  );
  process.exit(1);
}

/** Find the most "active" window of `len` seconds using scene-change scores. */
const bestWindow = (file, duration, len) => {
  if (duration <= len + 0.2) return 0;
  const res = run(
    "ffmpeg",
    [
      "-hide_banner",
      "-nostats",
      "-i",
      path.join(PUBLIC, file),
      "-an",
      "-vf",
      "fps=6,scale=240:-2,select='gte(scene,0)',metadata=print:file=-",
      "-f",
      "null",
      "-",
    ],
    { allowFail: true },
  );
  const samples = [];
  let t = null;
  for (const line of (res.stdout || "").split("\n")) {
    const pt = line.match(/pts_time:([\d.]+)/);
    if (pt) t = Number(pt[1]);
    const sc = line.match(/lavfi\.scene_score=([\d.]+)/);
    if (sc && t !== null) samples.push([t, Number(sc[1])]);
  }
  if (samples.length === 0) return Math.max(0, duration * 0.2);
  let best = 0;
  let bestScore = -1;
  for (let start = 0; start + len <= duration; start += 0.25) {
    const score = samples
      .filter(([st]) => st >= start && st < start + len)
      .reduce((a, [, s]) => a + s, 0);
    if (score > bestScore) {
      bestScore = score;
      best = start;
    }
  }
  return Number(best.toFixed(2));
};

const chosen = clips.map((c) => {
  const len = Math.min(clipSec, Math.max(0.6, c.durationSec - 0.1));
  const start = bestWindow(c.src, c.durationSec, len);
  console.log(
    `• ${c.source}: ${start.toFixed(2)}s → ${(start + len).toFixed(2)}s`,
  );
  return {
    src: c.src,
    trimStartSec: start,
    durationSec: Number(len.toFixed(2)),
    ...(c.caption ? { caption: c.caption } : {}),
  };
});

let music = null;
if (args.music && args.music !== "none") music = String(args.music);
else if (!args.music && existsSync(MUSIC_DIR)) {
  const track = readdirSync(MUSIC_DIR).find((f) =>
    AUDIO_EXTS.has(path.extname(f).toLowerCase()),
  );
  if (track) music = `audio/music/${track}`;
}

const props = {
  headline: String(args.headline ?? "FRIDAY"),
  subline: String(args.subline ?? "CRIMSON SOCIALS"),
  clips: chosen,
  music,
  musicVolume: Number(args["music-volume"] ?? 0.8),
  introSec: 2,
  outroSec: 2,
};

const outDir = path.join(EXPORTS, "reels");
ensureDir(outDir);
const propsFile = path.join(outDir, `${name}.props.json`);
writeFileSync(propsFile, JSON.stringify(props, null, 2) + "\n");
console.log(
  `\nProps: ${rel(propsFile)}${music ? ` · music: ${music}` : " · no music (add a track to public/audio/music)"}`,
);

if (args["dry-run"]) process.exit(0);

const out = path.join("exports", "reels", `${name}-${fps}fps.mp4`);
const r = spawnSync(
  "npx",
  [
    "remotion",
    "render",
    `PromoReel-${fps}fps`,
    out,
    `--props=${rel(propsFile)}`,
  ],
  { stdio: "inherit", cwd: ROOT },
);
if (r.status !== 0) process.exit(r.status ?? 1);
const v = spawnSync("node", ["scripts/verify.mjs", out], {
  stdio: "inherit",
  cwd: ROOT,
});
console.log(`\nFinished reel: ${out}`);
process.exit(v.status ?? 0);
