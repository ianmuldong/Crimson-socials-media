# Crimson Media: notes for Claude Code

Remotion 4 project producing 1080×1920 vertical videos for Crimson Volleyball Club.

- Follow the official Remotion skills in `.agents/skills/` (start with `remotion-best-practices`).
- Animate only with `useCurrentFrame()` + `interpolate()`; time everything in seconds via `useVideoConfig().fps`
  so the `-30fps` and `-60fps` registrations in `src/Root.tsx` stay in sync.
- Brand tokens: `src/brand/theme.ts`. Fonts load locally from `public/brand/fonts` (no network at render time).
- Keep key text inside `SAFE` margins (Instagram UI covers the bottom ~300px).
- Footage pipeline: `npm run ingest` → `public/footage/manifest.json` → `npm run reel` → `exports/reels/`.
- After rendering, always run `npm run verify -- <file>` (FFprobe check).
- Cloud sandbox: `remotion.media` is blocked; `remotion.config.ts` falls back to the pre-installed Chromium.
  If you call the Node render APIs directly, pass `browserExecutable` yourself.
- Don't add paid services without the owner's approval. Only use licensed music.
