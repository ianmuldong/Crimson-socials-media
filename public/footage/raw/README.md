# Raw footage

Put your original volleyball clips here: iPhone `.MOV` or `.MP4` files, any orientation, HDR or not.

Then run:

```bash
npm run ingest            # 30 FPS versions
npm run ingest -- --fps=60
```

Ready-to-edit copies go to `public/footage/processed/` and get listed in
`public/footage/manifest.json`. Your originals are never changed.

Large video files in this folder are git-ignored, so they aren't committed by accident.
Files uploaded through the GitHub website are still committed.
