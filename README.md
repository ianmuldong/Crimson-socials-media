# Crimson Media

AI-assisted video editing and motion graphics system for **Crimson Volleyball Club** (Instagram: [@crimson.vc](https://instagram.com/crimson.vc)).

Built with [Remotion](https://www.remotion.dev) (videos written in React + TypeScript) and FFmpeg.
Every template exports **1080 × 1920 vertical MP4s** at **30 or 60 FPS**, ready for Instagram Reels and TikTok.

**Status:** the system is set up and tested. A 5-second brand test animation renders and passes FFprobe checks.
The promotional campaign hasn't started yet.

---

## What's included

| Part | What it does |
| --- | --- |
| **Brand test animation** | 5-second premium intro: crimson glow, speed stripes, volleyball mark, "CRIMSON" slam-in, light sweep |
| **Footage importer** (`npm run ingest`) | Turns iPhone clips (any orientation, HDR, variable frame rate) into clean 1080×1920 H.264 files |
| **Automatic promo reels** (`npm run reel`) | Finds the most action-packed moment in each clip and cuts a branded reel with transitions, captions and music |
| **Animated team rotations** | Court diagram with all 6 rotations; players glide clockwise and the server is highlighted |
| **Serving-rule demonstrations** | Animated serve over the net plus rule cards (behind the end line, foot faults, 8 seconds) |
| **Reusable building blocks** | Court diagrams, player tokens, kinetic typography, crimson slash transition, film grain, vignette, light sweeps |
| **Video checker** (`npm run verify`) | Uses FFprobe to confirm resolution, codec, frame rate and duration |

---

## Quick start (on your own computer)

You need **Node.js 20 or newer** ([download](https://nodejs.org)). FFmpeg is optional because Remotion bundles its own,
but install it for iPhone HDR support (`brew install ffmpeg` on a Mac).

```bash
git clone https://github.com/ianmuldong/Crimson-socials-media.git
cd Crimson-socials-media
npm install          # installs Remotion, React, TypeScript…
npm run doctor       # checks Node, FFmpeg, FFprobe and the renderer browser
npm run dev          # opens Remotion Studio in your browser
```

The first render downloads a small headless Chrome automatically (about 100 MB, one time only).

---

## Preview the test animation

1. Run `npm run dev`. Remotion Studio opens at **http://localhost:3000**.
2. In the left sidebar open **Test → CrimsonTest-30fps** (or `-60fps`).
3. Press **Space** to play. Drag the red playhead to scrub. Use **Render** (bottom right) to export from the browser.

Or watch the finished file directly: **[`exports/test/crimson-test-30fps.mp4`](exports/test/crimson-test-30fps.mp4)**
(and [`crimson-test-60fps.mp4`](exports/test/crimson-test-60fps.mp4)). On GitHub, open the file and tap **View raw** or the download button.

---

## Everyday commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Open Remotion Studio (live preview) |
| `npm run render:test` | Render the 30 FPS test animation to `exports/test/` and verify it |
| `npm run render:test60` | Same, at 60 FPS |
| `npm run ingest` | Prepare footage in `public/footage/raw/` (add `-- --fps=60` for 60 FPS) |
| `npm run reel` | Build a promo reel from your prepared footage |
| `npm run render -- Rotations-30fps` | Render any video by its ID (see the list below) |
| `npm run verify -- path/to/video.mp4` | Check a video with FFprobe |
| `npm run compositions` | List every video ID |
| `npm run doctor` | Check the installation |

**Video IDs:** `CrimsonTest-30fps`, `CrimsonTest-60fps`, `Rotations-30fps`, `Rotations-60fps`,
`ServingRules-30fps`, `ServingRules-60fps`, `PromoReel-30fps`, `PromoReel-60fps`.

---

## From iPhone footage to a finished reel

### 1. Get the clips into the project

Copy your clips into **`public/footage/raw/`**. Choose whichever way suits you:

- **Mac (easiest):** AirDrop the videos from Photos to your Mac and drag them into `public/footage/raw/`.
- **Windows:** plug in the iPhone, open it in File Explorer (`DCIM` folder) and copy the clips.
- **Straight from the iPhone, no computer (GitHub upload):** open the repository on github.com in Safari,
  go to `public/footage/raw/`, tap **Add file → Upload files**, pick videos from Photos, and commit.
  GitHub's website accepts files **up to 25 MB**. Trim long clips in the Photos app first.
  Settings → Camera → Record Video → **1080p at 30 or 60 fps** keeps files small. 4K is about 4× bigger.
  Claude Code can then process them in a cloud session.

Originals are never modified. Large files in `raw/` are git-ignored, so they won't be committed by accident from your computer.

### 2. Prepare the footage

```bash
npm run ingest              # or: npm run ingest -- --fps=60
```

For each clip this:
- applies the iPhone rotation
- converts HDR (HLG / Dolby Vision) to normal colour so it doesn't look washed out
- fits it to 1080×1920 (vertical clips are cropped, landscape clips get a blurred background; use `--fit=crop` to always crop)
- converts to a constant frame rate

The results go to `public/footage/processed/` and are listed in `public/footage/manifest.json`.
Add a short `"caption"` (e.g. `"BIG SERVE"`) to any clip in the manifest to show it in the reel.

### 3. Generate a promo reel

```bash
npm run reel -- --name=friday-socials --headline=FRIDAY --subline="CRIMSON SOCIALS"
```

Options: `--fps=60`, `--clip-seconds=2.5`, `--max-clips=8`, `--music=audio/music/track.mp3` (or `--music=none`),
`--dry-run` (writes the edit plan without rendering).
Put a music track you have rights to in `public/audio/music/` and it's used automatically.

The reel is saved to `exports/reels/friday-socials-30fps.mp4`, along with a `.props.json` edit plan.
You can open **Reels → PromoReel-30fps** in Studio and paste that JSON into the props panel to fine-tune it.

### 4. Get the finished MP4 onto your phone

- **Local:** the file is in `exports/`. AirDrop it to your iPhone and post it.
- **Cloud (Claude Code on the web / app):** ask Claude to *commit and push the exports*.
  Then on your phone open the repository on github.com → `exports/…` → the MP4 → **download**, and save it to Photos.
  Claude can also send the file to you directly in the chat.
  (GitHub allows files up to 100 MB. A 30-second 1080p reel is usually 15–40 MB.)

---

## Instructional videos

- **Rotations:** edit the players in Studio (Instructional → Rotations-30fps → props panel) or in `src/Root.tsx`.
  The rotation rules live in `src/data/rotations.ts`.
- **Serving rules:** edit the rule text in the same way. Up to 5 rules, each with a heading and a sentence.

```bash
npm run render -- Rotations-60fps
npm run render -- ServingRules-30fps
```

---

## Project structure

```
public/                     ← assets Remotion can load (staticFile)
  footage/raw/              ← your original iPhone clips
  footage/processed/        ← clean 1080×1920 copies made by `npm run ingest`
  footage/manifest.json     ← clip list + captions (created by ingest)
  brand/logos/              ← club logo files
  brand/fonts/              ← Anton + Inter (bundled, works offline)
  audio/music/  audio/sfx/  ← music and sound effects
src/
  Root.tsx                  ← registers every video (30 & 60 FPS versions)
  brand/                    ← colours, fonts, safe areas
  components/typography/    ← animated text: SlamLetters, TrackingReveal, SceneTitle, VolleyballMark
  components/court/         ← VolleyballCourt diagram, PlayerToken
  components/transitions/   ← crimsonSlash cinematic transition
  components/effects/       ← FilmGrain, Vignette, LightSweep, SpeedStripes
  compositions/BrandTest/   ← the 5-second test animation
  compositions/PromoReel/   ← data-driven highlight reel template
  compositions/Rotations/   ← animated team rotations
  compositions/ServingRules/← serving rule demonstrations
  data/rotations.ts         ← rotation logic and default line-up
scripts/                    ← ingest, reel generator, render, FFprobe verification, doctor
exports/                    ← finished MP4s (test/, reels/, instructional/)
.agents/skills/             ← official Remotion Agent Skills (used by Claude Code)
```

---

## Brand

Crimson `#C8102E` · Deep maroon `#5A0A16` · Black `#070707` · White.
Headlines in **Anton**, body text in **Inter**. Change them once in `src/brand/theme.ts`.
Add the official logo to `public/brand/logos/` so templates can use it instead of the drawn volleyball mark.

## Licensing and costs

- Everything used is free: Remotion, FFmpeg, React, the fonts (SIL OFL) and GitHub.
  No paid services are used.
- Remotion is free for individuals, non-profits and organisations with up to 3 people.
  A community club normally qualifies, but check the [Remotion licence](https://www.remotion.dev/docs/license) to confirm.
- Only use music you have the rights to.

## Notes for the cloud environment (Claude Code on the web)

- Remotion's own browser download (`remotion.media`) is blocked by this environment's network policy.
  `remotion.config.ts` therefore falls back to the pre-installed Chromium automatically. On your own computer, Remotion uses its own browser.
- The cloud container is temporary. Anything not committed and pushed is lost when the session ends.
- Rendering runs on CPU (4 cores): about 25 s for the 5-second test, roughly 1–2 minutes per 30-second reel.
- `localhost:3000` (Studio) inside the cloud container can't be opened from your phone. Preview there by downloading the rendered MP4, or run `npm run dev` on a computer.
