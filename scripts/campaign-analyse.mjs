#!/usr/bin/env node
/**
 * FOOTAGE ANALYSIS + AUTO SHOT PLAN
 *
 *   npm run campaign:analyse            # analyse processed footage, write report + contact sheets
 *   npm run campaign:analyse -- --assign  # also fill src/campaign/footage-plan.json automatically
 *
 * For each processed clip (run `npm run ingest` first) this measures:
 *  - duration, resolution, frame rate (FFprobe)
 *  - scene changes / existing cuts (FFmpeg scene detector) → usable segments,
 *    so a single pre-edited compilation is split into its individual shots
 *  - motion energy per second (frame differencing) → high-motion moments and
 *    slow-motion candidates
 *  - brightness + audio loudness peaks (crowd reactions / big moments)
 * and writes timestamped thumbnail contact sheets for visual review.
 *
 * Labels such as "spike" or "celebration" cannot be detected reliably from
 * numbers alone: the report ranks segments by motion/audio energy and a
 * person (or Claude, looking at the contact sheets) confirms what each shows.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  ensureDir,
  ffprobe,
  MANIFEST,
  parseArgs,
  parseRate,
  PUBLIC,
  rel,
  ROOT,
  run,
} from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const OUT = path.join(ROOT, "exports", "analysis");
ensureDir(OUT);
if (!existsSync(MANIFEST)) {
  console.error(
    "No footage yet. Copy clips to public/footage/raw/ and run: npm run ingest",
  );
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const clips = manifest.clips.filter((c) => c.fps === 30);
if (!clips.length) {
  console.error("No 30 FPS clips. Run: npm run ingest");
  process.exit(1);
}

const sceneCuts = (file, threshold = 0.32) => {
  const r = run(
    "ffmpeg",
    [
      "-hide_banner",
      "-nostats",
      "-i",
      file,
      "-an",
      "-vf",
      `scale=320:-2,select='gt(scene,${threshold})',metadata=print:file=-`,
      "-f",
      "null",
      "-",
    ],
    { allowFail: true },
  );
  return [...(r.stdout || "").matchAll(/pts_time:([\d.]+)/g)].map((m) =>
    Number(m[1]),
  );
};

const motionPerSecond = (file) => {
  // mean absolute frame difference via tblend → signalstats YAVG, sampled at 10 fps
  const r = run(
    "ffmpeg",
    [
      "-hide_banner",
      "-nostats",
      "-i",
      file,
      "-an",
      "-vf",
      "fps=10,scale=160:-2,format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-",
      "-f",
      "null",
      "-",
    ],
    { allowFail: true },
  );
  const vals = [];
  let t = 0;
  for (const line of (r.stdout || "").split("\n")) {
    const pt = line.match(/pts_time:([\d.]+)/);
    if (pt) t = Number(pt[1]);
    const v = line.match(/YAVG=([\d.]+)/);
    if (v) vals.push([t, Number(v[1])]);
  }
  const perSec = [];
  for (const [tt, v] of vals) {
    const s = Math.floor(tt);
    perSec[s] = Math.max(perSec[s] ?? 0, v);
  }
  return perSec.map((v) => Number((v ?? 0).toFixed(2)));
};

const loudnessPerSecond = (file) => {
  const r = run(
    "ffmpeg",
    [
      "-hide_banner",
      "-nostats",
      "-i",
      file,
      "-vn",
      "-af",
      "astats=metadata=1:reset=48000,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-",
      "-f",
      "null",
      "-",
    ],
    { allowFail: true },
  );
  return [...(r.stdout || "").matchAll(/RMS_level=(-?[\d.inf]+)/g)].map((m) =>
    m[1].includes("inf") ? -90 : Number(Number(m[1]).toFixed(1)),
  );
};

const contactSheet = (file, duration, outFile) => {
  const every = Math.max(0.5, duration / 24);
  run(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      file,
      "-vf",
      `fps=1/${every},scale=216:384,drawtext=text='%{pts\\:hms}':x=8:y=h-34:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf,tile=6x4:padding=6:color=black`,
      "-frames:v",
      "1",
      "-q:v",
      "3",
      outFile,
    ],
    { allowFail: true },
  );
};

const report = { generatedAt: new Date().toISOString(), clips: [] };
const segments = [];
for (const c of clips) {
  const file = path.join(PUBLIC, c.src);
  const info = ffprobe(file);
  const v = info.streams.find((s) => s.codec_type === "video");
  const dur = Number(info.format.duration);
  const cuts = sceneCuts(file);
  const motion = motionPerSecond(file);
  const loud = c.hasAudio ? loudnessPerSecond(file) : [];
  const bounds = [0, ...cuts.filter((t) => t > 0.4 && t < dur - 0.4), dur];
  const segs = bounds.slice(1).map((end, i) => {
    const start = bounds[i];
    const secs = motion.slice(Math.floor(start), Math.ceil(end));
    const m = secs.length ? secs.reduce((a, b) => a + b, 0) / secs.length : 0;
    const peak = secs.length ? Math.max(...secs) : 0;
    const l = loud.slice(Math.floor(start), Math.ceil(end));
    return {
      clip: c.src,
      source: c.source,
      start: Number(start.toFixed(2)),
      end: Number(end.toFixed(2)),
      length: Number((end - start).toFixed(2)),
      motion: Number(m.toFixed(2)),
      motionPeak: peak,
      loudPeak: l.length ? Math.max(...l) : null,
    };
  });
  segments.push(...segs.filter((s) => s.length >= 0.8));
  const sheet = path.join(OUT, `${path.parse(c.src).name}-contact.jpg`);
  contactSheet(file, dur, sheet);
  report.clips.push({
    src: c.src,
    source: c.source,
    duration: dur,
    width: v.width,
    height: v.height,
    fps: parseRate(v.avg_frame_rate),
    original: c.original,
    existingCuts: cuts,
    segments: segs,
    motionPerSecond: motion,
    loudnessPerSecond: loud,
    contactSheet: rel(sheet),
  });
  console.log(
    `• ${c.source}: ${dur.toFixed(1)}s ${v.width}×${v.height} · ${cuts.length} cuts → ${segs.length} segments · peak motion ${Math.max(0, ...motion)}`,
  );
}

// rank: high motion = action (spikes/rallies), high loudness = reactions; long + low cut density = wide/atmosphere
const byMotion = [...segments].sort((a, b) => b.motionPeak - a.motionPeak);
const byLoud = [...segments]
  .filter((s) => s.loudPeak !== null)
  .sort((a, b) => b.loudPeak - a.loudPeak);
const byCalm = [...segments].sort(
  (a, b) => b.length - a.length || a.motion - b.motion,
);
report.suggestions = {
  highMotion: byMotion.slice(0, 10),
  slowMotionCandidates: byMotion.filter((s) => s.length >= 1.5).slice(0, 6),
  loudMoments: byLoud.slice(0, 6),
  longCalmShots: byCalm.slice(0, 6),
};
const reportFile = path.join(OUT, "footage-report.json");
writeFileSync(reportFile, JSON.stringify(report, null, 2) + "\n");
console.log(
  `\nReport: ${rel(reportFile)}\nContact sheets: ${rel(OUT)}/*-contact.jpg`,
);

if (args.assign) {
  const planFile = path.join(ROOT, "src", "campaign", "footage-plan.json");
  const plan = JSON.parse(readFileSync(planFile, "utf8"));
  const used = new Map();
  const pick = (pool, key) => {
    // prefer unused segments, then least-used
    const sorted = [...pool].sort(
      (a, b) =>
        (used.get(`${a.clip}@${a.start}`) ?? 0) -
        (used.get(`${b.clip}@${b.start}`) ?? 0),
    );
    const s = sorted[0] ?? segments[0];
    used.set(
      `${s.clip}@${s.start}`,
      (used.get(`${s.clip}@${s.start}`) ?? 0) + 1,
    );
    // start inside the segment, a little before its motion peak
    const offset = Math.max(0, Math.min(s.length - 2, 0.3));
    plan.shots[key].src = s.clip;
    plan.shots[key].trimStartSec = Number((s.start + offset).toFixed(2));
    return s;
  };
  const action = [
    "hook",
    "reveal1",
    "teaser1",
    "community1",
    "finale2",
    "stat3",
    "teaser4",
    "reveal2",
    "finale1",
  ];
  const wide = ["wide1", "stat1", "teaser2", "closing", "wide2", "stat2"];
  const people = [
    "community2",
    "community3",
    "community4",
    "stat4",
    "finale3",
    "teaser3",
    "teaser5",
  ];
  action.forEach((k) => pick(byMotion, k));
  wide.forEach((k) => pick(byCalm, k));
  people.forEach((k) => pick(byLoud.length ? byLoud : byMotion, k));
  writeFileSync(planFile, JSON.stringify(plan, null, 2) + "\n");
  console.log(
    `Assigned clips → ${rel(planFile)} (review it, then npm run campaign:preview)`,
  );
}
