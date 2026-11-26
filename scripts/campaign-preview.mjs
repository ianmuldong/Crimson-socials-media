#!/usr/bin/env node
/**
 * LOW-RES PREVIEWS FOR APPROVAL (540×960)
 *   npm run campaign:preview             # all four videos + approval stills + storyboards
 *   npm run campaign:preview -- main     # just one (main | explainer | guide | teaser)
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { ensureDir, parseArgs, rel, ROOT, run } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const OUT = path.join(ROOT, "exports", "previews");
ensureDir(path.join(OUT, "storyboards"));
const videos = {
  main: "friday-socials-main-promo",
  explainer: "friday-socials-full-explainer",
  guide: "friday-socials-rotation-guide",
  teaser: "friday-socials-summer-teaser",
};
const pickList = args._.length ? args._ : Object.keys(videos);
const rx = (cmd) => {
  const r = spawnSync("npx", cmd, {
    cwd: ROOT,
    stdio: ["ignore", "ignore", "inherit"],
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

for (const key of pickList) {
  const id = videos[key];
  const out = path.join(OUT, `${id}-preview.mp4`);
  console.log(`▶ ${id} → ${rel(out)}`);
  rx(["remotion", "render", id, out, "--scale=0.5", "--crf=26", "--log=error"]);
  // storyboard: one frame per second with timestamps
  const sheet = path.join(OUT, "storyboards", `${id}-storyboard.jpg`);
  const dur = Number(
    run("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "csv=p=0",
      out,
    ]).stdout,
  );
  const step = dur > 40 ? 2 : 1;
  const rows = Math.ceil(dur / step / 10);
  run(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      out,
      "-vf",
      `fps=1/${step},scale=180:320,drawtext=text='%{pts\\:hms}':x=6:y=h-28:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf,tile=10x${rows}:padding=4:color=black`,
      "-frames:v",
      "1",
      "-q:v",
      "3",
      sheet,
    ],
    { allowFail: true },
  );
  console.log(`  storyboard → ${rel(sheet)}`);
}

if (!args._.length) {
  rx([
    "remotion",
    "still",
    "approval-venue-layout",
    path.join(OUT, "approval-venue-layout.png"),
    "--scale=0.5",
    "--log=error",
  ]);
  rx([
    "remotion",
    "still",
    "approval-logo-arrangement",
    path.join(OUT, "approval-logo-arrangement.png"),
    "--frame=100",
    "--scale=0.5",
    "--log=error",
  ]);
  console.log(`▶ approval stills → ${rel(OUT)}/approval-*.png`);
}
spawnSync(
  "node",
  [
    "scripts/verify.mjs",
    "--preview",
    ...pickList.map((k) => path.join(OUT, `${videos[k]}-preview.mp4`)),
  ],
  { cwd: ROOT, stdio: "inherit" },
);
