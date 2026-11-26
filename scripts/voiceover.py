#!/usr/bin/env python3
"""
Synthetic voice-over (free, offline).

  npm run voiceover              # generate + mix narration for every video
  npm run voiceover -- --only friday-socials-rotation-guide

Reads src/campaign/voiceover.json, speaks each line with Kokoro-82M (Apache 2.0),
places it at its start time and writes public/audio/voiceover/<video-id>.wav,
exactly as long as the video. Compositions pick it up automatically.

Model files (one-time download, ~340 MB) go in exports/voice-models/ and are git-ignored.
Set KOKORO_MODEL / KOKORO_VOICES to use other copies.
"""
import json, os, subprocess, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CFG = ROOT / "src/campaign/voiceover.json"
OUT = ROOT / "public/audio/voiceover"
WORK = ROOT / "exports/voice-work"
MODELS = ROOT / "exports/voice-models"
BASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
FILES = {"kokoro-v1.0.onnx": "KOKORO_MODEL", "voices-v1.0.bin": "KOKORO_VOICES"}
VIDEOS = {  # video id → rendered-length source
    "friday-socials-main-promo": "exports/final/friday-socials-main-promo.mp4",
    "friday-night-socials-teaser": "exports/final/friday-night-socials-teaser.mp4",
    "friday-socials-rotation-guide": "exports/final/friday-socials-rotation-guide.mp4",
    "friday-socials-full-explainer": "exports/final/friday-socials-full-explainer.mp4",
}


def fetch_models():
    MODELS.mkdir(parents=True, exist_ok=True)
    paths = {}
    for name, env in FILES.items():
        p = Path(os.environ.get(env, MODELS / name))
        if not p.exists():
            print(f"downloading {name} …")
            urllib.request.urlretrieve(BASE + name, p)
        paths[name] = p
    return paths


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                         capture_output=True, text=True, check=True).stdout
    return float(out.strip())


def main():
    only = sys.argv[sys.argv.index("--only") + 1] if "--only" in sys.argv else None
    cfg = json.loads(CFG.read_text())
    from kokoro_onnx import Kokoro
    import soundfile as sf

    models = fetch_models()
    kokoro = Kokoro(str(models["kokoro-v1.0.onnx"]), str(models["voices-v1.0.bin"]))
    OUT.mkdir(parents=True, exist_ok=True)
    WORK.mkdir(parents=True, exist_ok=True)

    for vid, spec in cfg["videos"].items():
        if only and vid != only:
            continue
        src = ROOT / VIDEOS[vid]
        length = duration(src) if src.exists() else None
        if length is None:
            print(f"! {vid}: rendered video not found, skipping (render it first)")
            continue

        # speak every line
        clips = []
        for i, line in enumerate(spec["lines"]):
            samples, sr = kokoro.create(line["text"], voice=cfg["voice"], speed=cfg["speed"], lang="en-us")
            f = WORK / f"{vid}-{i:02d}.wav"
            sf.write(f, samples, sr)
            clips.append((line["at"], f, len(samples) / sr))

        # check timing: no overlap, everything inside the video
        for (a, _, da), (b, _, _) in zip(clips, clips[1:]):
            if a + da > b:
                raise SystemExit(f"✗ {vid}: a line at {a}s runs {a+da-b:.2f}s into the next line at {b}s. Shorten it or move it.")
        end = clips[-1][0] + clips[-1][2]
        if end > length:
            raise SystemExit(f"✗ {vid}: last line ends at {end:.2f}s, after the {length:.2f}s video.")

        # mix with ffmpeg: delay each line, sum, pad/trim to the video length
        out = OUT / f"{vid}.wav"
        cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y"]
        for _, f, _ in clips:
            cmd += ["-i", str(f)]
        parts = []
        for i, (at, _, _) in enumerate(clips):
            ms = int(round(at * 1000))
            parts.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms}[a{i}]")
        mix = "".join(f"[a{i}]" for i in range(len(clips)))
        parts.append(f"{mix}amix=inputs={len(clips)}:normalize=0:duration=longest,apad,atrim=0:{length:.3f},loudnorm=I=-16:TP=-1.5:LRA=11[v]")
        cmd += ["-filter_complex", ";".join(parts), "-map", "[v]", "-ar", "48000", "-c:a", "pcm_s16le", str(out)]
        subprocess.run(cmd, check=True)
        print(f"✓ {vid}: {len(clips)} lines, {end:.1f}s of speech in a {length:.1f}s video → {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
