# Organiser logos (all three are equal partners)

| Organisation | File | Supplied |
| --- | --- | --- |
| Chequers Volleyball Club | `chequers.jpg` | 26 Nov 2026 · 555×370 JPEG on black (no transparency) |
| Crimson Volleyball Club | `crimson.png` | 26 Nov 2026 · 1238×1271 transparent PNG |
| DO Volleyball | `do-volleyball.jpg` | 26 Nov 2026 · 500×500 JPEG on black (no transparency) |

- The files are used **unmodified** (byte-identical to what was supplied).
- Each logo sits on an identical pure-black panel, so the black JPEG backgrounds blend in.
- The three are sized to equal *visual* weight using each file's artwork box (`artBox` in
  `src/campaign/config.ts`) and pixel aspect (`LOGO_PIXEL_ASPECT` in `src/campaign/components/Logos.tsx`).
  Only the display window is cropped to the artwork; the file is never changed.
- **Better quality wanted:** transparent PNG or SVG versions of the Chequers and DO Volleyball logos
  (at least 1000 px). To replace one, overwrite the file (or change `logo` in the config),
  then update its `artBox` and pixel aspect.
