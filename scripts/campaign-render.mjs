#!/usr/bin/env node
/**
 * FINAL CAMPAIGN RENDERS (1080×1920, 30 FPS, H.264 + AAC) + QUALITY CONTROL
 *
 *   npm run campaign:render                 # refuses while footage/logos are missing
 *   npm run campaign:render -- --allow-placeholders   # render anyway (internal review only)
 *   npm run campaign:render -- main teaser  # subset
 *
 * After each render: FFprobe spec check, blank-frame scan (blackdetect),
 * loudness measurement (EBU R128) and three thumbnail options.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { ensureDir, parseArgs, PUBLIC, rel, ROOT, run } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const OUT = path.join(ROOT, "exports", "final");
ensureDir(OUT);
const videos = {
  main: { id: "friday-socials-main-promo", min: 25, max: 30.5 },
  explainer: { id: "friday-socials-full-explainer", min: 60, max: 90.5 },
  guide: { id: "friday-socials-rotation-guide", min: 20, max: 30.5 },
  teaser: { id: "friday-night-socials-teaser", min: 10, max: 15.5 },
};

// ── pre-flight: never silently ship placeholders ──
const plan = JSON.parse(
  readFileSync(path.join(ROOT, "src/campaign/footage-plan.json"), "utf8"),
);
const missingShots = Object.entries(plan.shots)
  .filter(([, s]) => !s.src || !existsSync(path.join(PUBLIC, s.src)))
  .map(([k]) => k);
const cfg = readFileSync(path.join(ROOT, "src/campaign/config.ts"), "utf8");
const logos = [...cfg.matchAll(/logo: "([^"]+)"/g)].map((m) => m[1]);
const missingLogos = logos.filter((l) => !existsSync(path.join(PUBLIC, l)));
if (
  (missingShots.length || missingLogos.length) &&
  !args["allow-placeholders"]
) {
  console.error("✗ Not rendering finals yet:");
  if (missingShots.length)
    console.error(
      `  - ${missingShots.length} footage slots have no clip (${missingShots.slice(0, 6).join(", ")}…). Run: npm run ingest && npm run campaign:analyse -- --assign`,
    );
  if (missingLogos.length)
    console.error(`  - missing logos: ${missingLogos.join(", ")}`);
  console.error("  Use --allow-placeholders for an internal review render.");
  process.exit(1);
}

const pickList = args._.length ? args._ : Object.keys(videos);
let failed = false;
for (const key of pickList) {
  const v = videos[key];
  const out = path.join(OUT, `${v.id}.mp4`);
  console.log(`\n▶ Rendering ${v.id}`);
  const r = spawnSync(
    "npx",
    [
      "remotion",
      "render",
      v.id,
      out,
      "--codec=h264",
      "--crf=16",
      "--audio-codec=aac",
      "--audio-bitrate=320k",
      "--log=error",
    ],
    { cwd: ROOT, stdio: ["ignore", "ignore", "inherit"] },
  );
  if (r.status !== 0) {
    failed = true;
    continue;
  }
  const ver = spawnSync("node", ["scripts/verify.mjs", out], {
    cwd: ROOT,
    stdio: "inherit",
  });
  failed ||= ver.status !== 0;
  // duration window
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
  const durOk = dur >= v.min && dur <= v.max;
  console.log(
    `  ${durOk ? "✓" : "✗"} duration ${dur.toFixed(2)} s (target ${v.min}–${Math.floor(v.max)} s)`,
  );
  failed ||= !durOk;
  // blank frames (fully black for > 0.25 s, ignoring the final fade)
  const bd = run(
    "ffmpeg",
    [
      "-hide_banner",
      "-nostats",
      "-i",
      out,
      "-vf",
      "blackdetect=d=0.25:pic_th=0.985",
      "-an",
      "-f",
      "null",
      "-",
    ],
    { allowFail: true },
  );
  const blacks = [
    ...(bd.stderr || "").matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g),
  ]
    .map((m) => [Number(m[1]), Number(m[2])])
    .filter(([s]) => s < dur - 0.6);
  console.log(
    `  ${blacks.length ? "✗" : "✓"} blank frames${blacks.length ? `: ${blacks.map(([a, b]) => `${a}-${b}s`).join(", ")}` : ": none"}`,
  );
  failed ||= blacks.length > 0;
  // loudness
  const lu = run(
    "ffmpeg",
    [
      "-hide_banner",
      "-nostats",
      "-i",
      out,
      "-af",
      "ebur128=peak=true",
      "-f",
      "null",
      "-",
    ],
    { allowFail: true },
  );
  const I = (lu.stderr || "").match(/I:\s+(-?[\d.]+) LUFS/g)?.pop();
  const P = (lu.stderr || "").match(/Peak:\s+(-?[\d.]+) dBFS/g)?.pop();
  console.log(
    `  • loudness ${I ?? "n/a"} · true peak ${P ?? "n/a"} (social target ≈ -14 LUFS, peak < -1 dBFS)`,
  );
}

// thumbnails
const TH = path.join(OUT, "thumbnails");
ensureDir(TH);
for (const n of [1, 2, 3]) {
  spawnSync(
    "npx",
    [
      "remotion",
      "still",
      `thumbnail-${n}`,
      path.join(TH, `friday-socials-thumbnail-${n}.jpg`),
      "--image-format=jpeg",
      "--jpeg-quality=92",
      "--log=error",
    ],
    { cwd: ROOT, stdio: "inherit" },
  );
}
console.log(`\nThumbnails → ${rel(TH)}`);
console.log(
  failed
    ? "\n✗ Some checks failed — see above."
    : `\n✓ All finals rendered and verified in ${rel(OUT)}`,
);
process.exit(failed ? 1 : 0);
