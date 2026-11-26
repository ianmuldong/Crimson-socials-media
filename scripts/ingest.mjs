#!/usr/bin/env node
/**
 * Prepare raw footage (e.g. straight off an iPhone) for editing.
 *
 *   npm run ingest                 # process new clips in public/footage/raw
 *   npm run ingest -- --fps=60     # 60 FPS output
 *   npm run ingest -- --fit=blur   # landscape clips: blurred fill instead of crop
 *   npm run ingest -- --force      # re-process everything
 *
 * For every clip it:
 *  - reads metadata with FFprobe (resolution, rotation, frame rate, HDR)
 *  - applies iPhone rotation, converts HDR (HLG / Dolby Vision) to SDR
 *  - fits to 1080×1920 vertical (crop, or blurred background for landscape)
 *  - converts variable frame rate to constant 30 or 60 FPS
 *  - encodes H.264 + AAC with a keyframe every second (fast seeking in Remotion)
 *  - writes public/footage/manifest.json, which the reel generator reads
 */
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {
  ensureDir,
  ffmpegHasFilter,
  ffprobe,
  MANIFEST,
  parseArgs,
  parseRate,
  PROCESSED_DIR,
  PUBLIC,
  RAW_DIR,
  rel,
  run,
  VIDEO_EXTS,
} from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const fps = Number(args.fps ?? 30);
if (![30, 60].includes(fps)) {
  console.error("--fps must be 30 or 60");
  process.exit(2);
}
const fitMode = String(args.fit ?? "auto"); // auto | crop | blur
ensureDir(RAW_DIR);
ensureDir(PROCESSED_DIR);

const manifest = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf8"))
  : { clips: [] };
// one entry per source file AND frame rate (30 and 60 FPS versions can coexist)
const byName = new Map(manifest.clips.map((c) => [`${c.source}@${c.fps}`, c]));

const files = readdirSync(RAW_DIR)
  .filter(
    (f) => VIDEO_EXTS.has(path.extname(f).toLowerCase()) && !f.startsWith("."),
  )
  .sort();

if (files.length === 0) {
  console.log(
    `No videos found in ${rel(RAW_DIR)}.\nCopy your iPhone clips there (MOV or MP4), then run: npm run ingest`,
  );
  process.exit(0);
}

const canToneMap = ffmpegHasFilter("zscale") && ffmpegHasFilter("tonemap");

const rotationOf = (v) => {
  const sd = (v.side_data_list || []).find((d) => d.rotation !== undefined);
  return Math.abs(Number(sd?.rotation ?? v.tags?.rotate ?? 0)) % 180;
};

for (const file of files) {
  const src = path.join(RAW_DIR, file);
  const base = path.parse(file).name.replace(/[^a-zA-Z0-9-_]+/g, "-");
  const outName = `${base}-${fps}fps.mp4`;
  const out = path.join(PROCESSED_DIR, outName);
  const prev = byName.get(`${file}@${fps}`);
  const upToDate =
    !args.force &&
    existsSync(out) &&
    statSync(out).mtimeMs > statSync(src).mtimeMs;
  if (upToDate && prev) {
    console.log(`• ${file} already processed → ${rel(out)}`);
    continue;
  }

  const info = ffprobe(src);
  const v = info.streams.find((s) => s.codec_type === "video");
  const a = info.streams.find((s) => s.codec_type === "audio");
  if (!v) {
    console.warn(`! ${file}: no video stream, skipped`);
    continue;
  }
  const rotated = rotationOf(v) === 90;
  const w = rotated ? v.height : v.width;
  const h = rotated ? v.width : v.height;
  const landscape = w > h;
  const hdr = ["arib-std-b67", "smpte2084"].includes(v.color_transfer);
  const srcFps = parseRate(v.avg_frame_rate);
  const mode = fitMode === "auto" ? (landscape ? "blur" : "crop") : fitMode;

  const toneMap =
    hdr && canToneMap
      ? ",zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p"
      : "";
  const fill =
    "scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920";
  const fit =
    "scale=1080:1920:force_original_aspect_ratio=decrease:flags=lanczos";
  const filter =
    mode === "blur"
      ? `[0:v]fps=${fps}${toneMap},split[bg][fg];[bg]${fill},gblur=sigma=45,eq=brightness=-0.18:saturation=1.2[b];[fg]${fit}[f];[b][f]overlay=(W-w)/2:(H-h)/2,setsar=1,format=yuv420p[v]`
      : `[0:v]fps=${fps}${toneMap},${fill},setsar=1,format=yuv420p[v]`;

  console.log(
    `▶ ${file}: ${w}×${h} ${srcFps.toFixed(2)}fps ${v.codec_name}${hdr ? " HDR" : ""}${rotated ? " (rotated)" : ""} → 1080×1920 ${fps}fps (${mode})`,
  );
  if (hdr && !canToneMap)
    console.warn(
      "  ! HDR clip but this FFmpeg lacks zscale/tonemap; colours may look washed out.",
    );

  const ffArgs = [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    src,
    "-filter_complex",
    filter,
    "-map",
    "[v]",
    ...(a
      ? ["-map", "0:a:0", "-c:a", "aac", "-b:a", "192k", "-ar", "48000"]
      : ["-an"]),
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "18",
    "-profile:v",
    "high",
    "-color_primaries",
    "bt709",
    "-color_trc",
    "bt709",
    "-colorspace",
    "bt709",
    "-g",
    String(fps),
    "-movflags",
    "+faststart",
    out,
  ];
  if (upToDate) console.log("  (re-using existing processed file)");
  else run("ffmpeg", ffArgs);

  const outInfo = ffprobe(out);
  const entry = {
    source: file,
    src: path.relative(PUBLIC, out).split(path.sep).join("/"),
    durationSec: Number(Number(outInfo.format.duration).toFixed(3)),
    fps,
    original: {
      width: w,
      height: h,
      fps: Number(srcFps.toFixed(3)),
      codec: v.codec_name,
      hdr,
    },
    fit: mode,
    hasAudio: Boolean(a),
    caption: prev?.caption ?? "",
    processedAt: new Date().toISOString(),
  };
  byName.set(`${file}@${fps}`, entry);
  console.log(`  ✓ ${rel(out)} (${entry.durationSec}s)`);
}

const clips = [...byName.values()].filter((c) =>
  existsSync(path.join(PUBLIC, c.src)),
);
writeFileSync(
  MANIFEST,
  JSON.stringify({ updatedAt: new Date().toISOString(), clips }, null, 2) +
    "\n",
);
console.log(
  `\nManifest: ${rel(MANIFEST)} (${clips.length} clip${clips.length === 1 ? "" : "s"})`,
);
console.log(
  'Tip: add a short "caption" to any clip in the manifest, then run: npm run reel',
);
