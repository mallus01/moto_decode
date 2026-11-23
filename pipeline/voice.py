"""Génère la voix off française.

Usage : python pipeline/voice.py jobs.json
jobs.json = {"engine": "piper" | "clone", "jobs": [{"text": "...", "out": "chemin.wav"}]}

Moteurs :
- piper : voix française gratuite, rapide, tourne sur CPU. Sert de voix "provisoire".
- clone : Chatterbox Multilingual (Resemble AI, licence MIT), clonage zéro-shot
          à partir de voices/mattis.wav. Gratuit, local ; un GPU NVIDIA est
          fortement conseillé (CPU possible mais lent).
"""
import json
import os
import shutil
import subprocess
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOICES = ROOT / "voices"


def run_piper(jobs):
    from piper import PiperVoice, SynthesisConfig  # pip install piper-tts

    model = VOICES / "piper" / "fr_FR-tom-medium.onnx"
    if not model.exists():
        sys.exit("Modèle Piper absent. Lance d'abord : python pipeline/setup_voice.py")
    voice = PiperVoice.load(str(model))
    # < 1 = plus rapide. 0.88 donne un rythme TikTok dynamique.
    cfg = SynthesisConfig(length_scale=float(os.environ.get("MOTO_PIPER_SPEED", "0.88")))
    for job in jobs:
        out = Path(job["out"])
        out.parent.mkdir(parents=True, exist_ok=True)
        with wave.open(str(out), "wb") as wf:
            voice.synthesize_wav(job["text"], wf, syn_config=cfg)
        print(f"  voix (piper) -> {out.name}", flush=True)


def speed_up(path: Path, tempo: float):
    """Accélère le débit avec ffmpeg (atempo garde la hauteur de la voix)."""
    if abs(tempo - 1.0) < 0.01:
        return
    if not shutil.which("ffmpeg"):
        print("  (ffmpeg introuvable : MOTO_VOICE_TEMPO ignoré)")
        return
    tmp = path.with_suffix(".tempo.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(path), "-filter:a", f"atempo={tempo}", str(tmp)], check=True)
    tmp.replace(path)


def run_clone(jobs):
    import torch
    import torchaudio as ta
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS  # pip install chatterbox-tts

    ref = Path(os.environ.get("MOTO_VOICE_REF", VOICES / "mattis.wav"))
    if not ref.exists():
        sys.exit(f"Échantillon de voix introuvable : {ref}\nEnregistre 10 à 30 s de ta voix (voir voices/README.md).")
    device = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
    print(f"  chargement Chatterbox sur {device}…", flush=True)
    model = ChatterboxMultilingualTTS.from_pretrained(device=device)
    # Style TikTok : expressivité haute, cfg bas (rythme plus libre), un peu plus de variation.
    exaggeration = float(os.environ.get("MOTO_VOICE_EXAGGERATION", "1.0"))
    cfg = float(os.environ.get("MOTO_VOICE_CFG", "0.3"))
    temperature = float(os.environ.get("MOTO_VOICE_TEMP", "0.9"))
    tempo = float(os.environ.get("MOTO_VOICE_TEMPO", "1.12"))  # accélère sans changer la hauteur (1.0 = aucun effet)
    print(f"  réglages : exaggeration={exaggeration} cfg={cfg} temp={temperature} tempo={tempo}", flush=True)
    for job in jobs:
        out = Path(job["out"])
        out.parent.mkdir(parents=True, exist_ok=True)
        wav = model.generate(job["text"], language_id="fr", audio_prompt_path=str(ref), exaggeration=exaggeration, cfg_weight=cfg, temperature=temperature)
        ta.save(str(out), wav, model.sr)
        speed_up(out, tempo)
        print(f"  voix (clone) -> {out.name}", flush=True)


def main():
    spec = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    engine = spec.get("engine", "piper")
    if engine == "piper":
        run_piper(spec["jobs"])
    elif engine == "clone":
        run_clone(spec["jobs"])
    else:
        sys.exit(f"Moteur inconnu : {engine}")


if __name__ == "__main__":
    main()
