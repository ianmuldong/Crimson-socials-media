// Shared helpers for the Crimson video scripts. Plain Node.js, no extra deps.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const PUBLIC = path.join(ROOT, "public");
export const RAW_DIR = path.join(PUBLIC, "footage", "raw");
export const PROCESSED_DIR = path.join(PUBLIC, "footage", "processed");
export const MANIFEST = path.join(PUBLIC, "footage", "manifest.json");
export const MUSIC_DIR = path.join(PUBLIC, "audio", "music");
export const EXPORTS = path.join(ROOT, "exports");

export const VIDEO_EXTS = new Set([
  ".mov",
  ".mp4",
  ".m4v",
  ".hevc",
  ".mkv",
  ".avi",
  ".webm",
]);
export const AUDIO_EXTS = new Set([".mp3", ".m4a", ".wav", ".aac", ".ogg"]);

export const ensureDir = (d) => mkdirSync(d, { recursive: true });

const has = (cmd) =>
  spawnSync(cmd, ["-version"], { stdio: "ignore" }).status === 0;

/**
 * Prefer a system FFmpeg/FFprobe (full-featured, includes HDR tone mapping);
 * fall back to the copy bundled with Remotion (`npx remotion ffmpeg`).
 */
export const tool = (name) => {
  if (has(name)) return { cmd: name, pre: [] };
  return { cmd: "npx", pre: ["remotion", name] };
};

export const run = (name, args, opts = {}) => {
  const t = tool(name);
  const res = spawnSync(t.cmd, [...t.pre, ...args], {
    encoding: "utf8",
    maxBuffer: 1 << 28,
    cwd: ROOT,
    ...opts,
  });
  if (res.status !== 0 && !opts.allowFail) {
    throw new Error(
      `${name} failed (exit ${res.status}):\n${(res.stderr || "").slice(-2000)}`,
    );
  }
  return res;
};

export const ffprobe = (file) => {
  const res = run("ffprobe", [
    "-v",
    "error",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    file,
  ]);
  return JSON.parse(res.stdout);
};

export const parseRate = (r) => {
  if (!r || r === "0/0") return 0;
  const [a, b] = r.split("/").map(Number);
  return b ? a / b : a;
};

export const ffmpegHasFilter = (filter) => {
  const res = run("ffmpeg", ["-hide_banner", "-filters"], { allowFail: true });
  return new RegExp(`\\s${filter}\\s`).test(res.stdout || "");
};

export const parseArgs = (argv) => {
  const out = { _: [] };
  for (const a of argv) {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    if (m) out[m[1]] = m[2] ?? true;
    else out._.push(a);
  }
  return out;
};

export const rel = (p) => path.relative(ROOT, p);
export { existsSync };
