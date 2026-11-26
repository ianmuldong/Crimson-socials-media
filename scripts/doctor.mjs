#!/usr/bin/env node
// Check that everything needed to preview and render is installed.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { ffmpegHasFilter, ROOT, tool } from "./lib.mjs";

const line = (ok, label, detail = "") =>
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? `  ${detail}` : ""}`);
const ver = (cmd, a = ["--version"]) => {
  const t = tool(cmd);
  const r = spawnSync(t.cmd, [...t.pre, ...a], { encoding: "utf8" });
  return r.status === 0 ? (r.stdout || r.stderr).split("\n")[0].trim() : null;
};

const nodeOk = Number(process.versions.node.split(".")[0]) >= 20;
line(nodeOk, "Node.js", process.version);
const npm = spawnSync("npm", ["-v"], { encoding: "utf8" });
line(npm.status === 0, "npm", npm.stdout?.trim());
const pkg = path.join(ROOT, "node_modules", "remotion", "package.json");
line(
  existsSync(pkg),
  "Remotion",
  existsSync(pkg)
    ? (await import(pkg, { with: { type: "json" } })).default.version
    : "run: npm install",
);
const ff = ver("ffmpeg", ["-version"]);
line(Boolean(ff), "FFmpeg", ff ?? "");
const fp = ver("ffprobe", ["-version"]);
line(Boolean(fp), "FFprobe", fp ?? "");
line(
  ffmpegHasFilter("zscale"),
  "HDR → SDR tone mapping (zscale)",
  "needed for iPhone HDR clips",
);
const remotionBrowser = existsSync(
  path.join(ROOT, "node_modules/.remotion/chrome-headless-shell"),
);
const fallback =
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
line(
  remotionBrowser || existsSync(fallback) || process.platform !== "linux",
  "Chromium for rendering",
  remotionBrowser
    ? "Remotion headless shell"
    : existsSync(fallback)
      ? "pre-installed Chromium (fallback)"
      : "downloaded automatically on first render",
);
