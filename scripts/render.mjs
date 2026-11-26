#!/usr/bin/env node
// Render any composition to exports/ and verify it with FFprobe.
// Usage: npm run render -- <CompositionId> [output.mp4] [--props=file.json]
//   e.g. npm run render -- Rotations-60fps
import { spawnSync } from "node:child_process";
import path from "node:path";
import { ensureDir, parseArgs, ROOT } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const [id, outArg] = args._;
if (!id) {
  console.error(
    "Usage: npm run render -- <CompositionId> [output.mp4] [--props=props.json]\nList IDs with: npx remotion compositions",
  );
  process.exit(2);
}
const folder = id.startsWith("CrimsonTest")
  ? "test"
  : id.startsWith("PromoReel")
    ? "reels"
    : "instructional";
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
const out =
  outArg ?? path.join("exports", folder, `${id.toLowerCase()}-${stamp}.mp4`);
ensureDir(path.dirname(path.join(ROOT, out)));

const renderArgs = ["remotion", "render", id, out];
if (args.props) renderArgs.push(`--props=${args.props}`);
const r = spawnSync("npx", renderArgs, { stdio: "inherit", cwd: ROOT });
if (r.status !== 0) process.exit(r.status ?? 1);

const v = spawnSync("node", ["scripts/verify.mjs", out], {
  stdio: "inherit",
  cwd: ROOT,
});
console.log(`\nFinished: ${out}`);
process.exit(v.status ?? 0);
