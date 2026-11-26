# Friday Night Volleyball Socials: Summer Campaign

The campaign is jointly run by **Chequers Volleyball Club**, **Crimson Volleyball Club** and **DO Volleyball**, as equal partners.
This repository is called "Crimson Media", but all public-facing material represents the collaborative event.

## The four videos

All four are 1080×1920 (9:16), 30 FPS, H.264 + AAC.

| File | Length | Remotion ID |
| --- | --- | --- |
| `friday-socials-main-promo.mp4` | 30 s | `friday-socials-main-promo` |
| `friday-socials-full-explainer.mp4` | ~76 s | `friday-socials-full-explainer` |
| `friday-socials-rotation-guide.mp4` | ~24 s | `friday-socials-rotation-guide` |
| `friday-socials-summer-teaser.mp4` | 13 s | `friday-socials-summer-teaser` |

Final files go to `exports/final/`. 540×960 previews and storyboards go to `exports/previews/`.

## Workflow

```bash
# 1. footage → public/footage/raw/      logos → public/brand/logos/      music → public/audio/music/
npm run ingest                        # normalise iPhone clips (rotation, HDR→SDR, 1080×1920, 30 fps)
npm run campaign:analyse -- --assign  # analyse footage, write contact sheets, auto-fill the shot plan
npm run campaign:preview              # 540×960 previews + storyboards + approval stills
npm run campaign:render               # final MP4s + QC + 3 thumbnails (refuses while assets are missing)
```

Preview live with `npm run dev`, then open **FridaySocials** in the sidebar.

## What you can change, and where

| What | File |
| --- | --- |
| Event name, day, venue, times, dates, courts, capacity, booking link/CTA, the "PERTH'S BIGGEST" switch | `src/campaign/config.ts` → `event` |
| Organisation names, logo files, handles | `src/campaign/config.ts` → `orgs` |
| Session timeline (warm-up, first game, game length, break, finish, total games) | `src/campaign/config.ts` → `session` |
| Brand colours | `src/campaign/config.ts` → `colors` |
| Every headline and caption | `src/campaign/config.ts` → `text` |
| Serving rules | `src/campaign/config.ts` → `serving` |
| Music track, BPM grid, music/footage/SFX volume | `src/campaign/config.ts` → `music` |
| Court layout, stationary spots, clockwise order, team labels | `src/campaign/venue.ts` |
| Which clip plays in each shot (and trim, speed ramp) | `src/campaign/footage-plan.json` |
| Sound effects | `public/audio/sfx/*.wav` (replace a file, keep its name) |

**Weekly refresh:** drop the new footage in `raw/`, run `ingest`, then `campaign:analyse -- --assign`, then `campaign:render`. There's nothing to rebuild.

## Reusable building blocks (`src/campaign/`)

- `components/Kinetic.tsx`: kinetic headlines (mask reveal + motion blur, auto-fit to the safe area), kicker labels, rules
- `components/StatReveal.tsx`: animated statistics (number count-up / word slam, broadcast index badge)
- `components/Logos.tsx`: `LogoTile` / `LogoLockup` (three identical slots, identical timing, original files untouched)
- `components/EndCards.tsx`: `EventInfoCard`, `OrganiserEndCard`, `ClosingCard`, `Backdrop`
- `components/FootageShot.tsx`: graded footage shot with an optional speed ramp and a labelled placeholder while no footage is assigned
- `components/SessionTimeline.tsx`, `components/Clock.tsx`: session timeline, analogue clock, game countdown ring, whistle
- `components/VenueMap.tsx`: top-down venue diagram (two main courts × three playing areas, nets, labels, team tokens, lock, arrows)
- `scenes/RotationScene.tsx`: configurable rotation demonstration (timer → whistle → arrows → move → NEXT GAME…)
- `scenes/ServeScene.tsx`: serving-rule demonstration (pictograms, trajectories, ✓/✕, service transfer)
- `components/Sfx.tsx`, `components/Finish.tsx`: SFX, music bed, flashes, grain/vignette finishing

## Sound

- The sound effects were synthesised in-house with FFmpeg, so they're royalty-free. Footage audio (crowd, squeaks, ball contact) is kept at 35%.
- No music is included, because none has been supplied or licensed. Exports are "clean" so music can be added in Instagram/TikTok.
  To bake in a licensed track, set `music.src` and `music.bpm` in the config. Cuts sit on a 120 BPM grid by default.

## Quality control (`npm run campaign:render`)

- FFprobe check: 1080×1920, H.264, yuv420p, 30 fps, AAC, and duration within the brief's range.
- Blank-frame scan (`blackdetect`) and EBU R128 loudness report (social target ≈ −14 LUFS).
- All text is auto-fitted to the Reels/TikTok safe zone (`SAFE` in `src/campaign/theme.ts`). You can view the overlay in the `approval-logo-arrangement` still.
- Final renders are refused while any footage slot or logo is missing, unless you pass `--allow-placeholders`.

## Asset checklist

| Asset | Where | Status |
| --- | --- | --- |
| Friday Socials footage | `public/footage/raw/friday-socials-compilation.mp4` (git-ignored) | ✅ 54.7 s compilation from Google Drive, 26 Nov |
| Chequers logo | `public/brand/logos/chequers.jpg` | ✅ supplied (JPEG on black; transparent PNG preferred) |
| Crimson logo | `public/brand/logos/crimson.png` | ✅ supplied (transparent PNG) |
| DO Volleyball logo | `public/brand/logos/do-volleyball.jpg` | ✅ supplied (JPEG on black; transparent PNG preferred) |
| Licensed music (optional) | `public/audio/music/` | optional |
| Booking link | `config.ts → event.bookingUrl` | ⏳ needed |
| Chequers / DO Volleyball social handles | `config.ts → orgs[].handle` | optional |

### Sending assets from an iPhone

1. **Logos:** save each logo to Files. Then on github.com in Safari, open `public/brand/logos/` on the campaign branch, tap **Add file → Upload files**, and rename to the names above. You can also simply attach the images in the Claude chat.
2. **Footage:** GitHub's website accepts files up to **25 MB each**. Trim clips in Photos (5–20 s each is ideal), or record at 1080p 30/60. Upload to `public/footage/raw/` the same way.
   For many or large clips, use a computer: AirDrop to a Mac, then `git add -f public/footage/raw/*` (raw footage is git-ignored by default to keep the repo small and private) or run the whole project locally.
3. **Privacy:** this GitHub repository is **public**. Footage and anything rendered from it (previews,
   storyboards, contact sheets, thumbnails, finals) is git-ignored and never pushed. Finished videos are
   delivered directly in the Claude chat. If you make the repository private, they can be committed too.

## Footage review (26 Nov compilation)

Visually reviewed from timestamped contact sheets (`exports/analysis/`). 12 existing cuts were detected.

| Time | Content | Used for |
| --- | --- | --- |
| 0–4 s | Wide shots of the whole hall, several courts in play | stats, wide, teaser, closing |
| 4–7 s | Close rally action | montage, community |
| 7.6–9.5 s | Block at the net | hook (slow-mo), teaser |
| 10–12 s | Rally, many players | wide, teaser |
| 13–17 s | Diving dig + recovery | stat, finale |
| 18–20 s | Double block jump | community, finale (slow-mo) |
| 20–22 s | Player laughing | community, teaser |
| **22.2–24.9 s** | **Existing third-party promo flyer: excluded** | — |
| 25.8–27 s | Close-up attack jump | community (slow-mo) |
| 27–33 s | Rallies | reveal, finale, teaser |
| 35–37 s | Serve: preparation and contact | reveal |
| 39–42 s | Rally with several courts behind | wide |
| **43.5 s–end** | **Black frames: excluded** | — |

The excluded ranges live in `footage-plan.json → excludeRanges`. A render fails if any shot overlaps them.
The footage audio is muted (`music.footageVolume: 0`) until it's confirmed whether the music in the compilation is licensed.

## Open questions (awaiting organiser confirmation)

See `exports/previews/` for the approval stills, then answer these:
1. Venue layout: are the three playing areas side by side within each main court, as drawn?
2. Which spot is the stationary team on each main court (currently assumed **T1**, top-left)?
3. Is the clockwise order T1 → T2 → T3 → B3 → B2 → B1 (crossing the nets at the ends)?
4. Serving: after a missed second serve, is the free ball fed to the opposition **and** service passes to them, or are these two separate situations?
5. Can "PERTH'S BIGGEST" be substantiated? (Until then: "ONE OF PERTH'S BIGGEST".)
6. Total number of games per night, the booking link, and the season dates.
