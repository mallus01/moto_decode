"""Génère la voix off française.

Usage : python pipeline/voice.py jobs.json
jobs.json = {"engine": "piper" | "clone" | "google", "jobs": [{"text": "...", "out": "chemin.wav"}]}

Moteurs :
- piper : voix française gratuite, rapide, tourne sur CPU. Sert de voix "provisoire".
- clone : Chatterbox Multilingual (Resemble AI, licence MIT), clonage zéro-shot
          à partir de voices/mattis.wav. Gratuit, local ; un GPU NVIDIA est
          fortement conseillé (CPU possible mais lent).
- google : Google Cloud Text-to-Speech (offre gratuite mensuelle, clé API) : voir docs/TUTO-GOOGLE-TTS.md.
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


def default_ref() -> Path:
    """Échantillon de voix : MOTO_VOICE_REF, sinon voices/mattis2.wav, sinon voices/mattis.wav."""
    if os.environ.get("MOTO_VOICE_REF"):
        return Path(os.environ["MOTO_VOICE_REF"])
    for name in ("mattis2.wav", "mattis.wav"):
        if (VOICES / name).exists():
            return VOICES / name
    return VOICES / "mattis2.wav"


# Préréglages Chatterbox. "naturel" (défaut) : expressif sans artefacts robotiques.
# "tiktok" : les anciens réglages, très énergiques (exaggeration 1.0 + accélération 1.12 : plus de risque de voix métallique).
PRESETS = {
    "naturel": {"exaggeration": 0.7, "cfg": 0.35, "temp": 0.8, "tempo": 1.0},
    "tiktok": {"exaggeration": 1.0, "cfg": 0.3, "temp": 0.9, "tempo": 1.12},
}


def split_sentences(text: str):
    """Coupe le texte en phrases (Chatterbox est plus naturel sur des phrases courtes)."""
    parts, cur = [], ""
    for ch in text:
        cur += ch
        if ch in ".!?…":
            if cur.strip():
                parts.append(cur.strip())
            cur = ""
    if cur.strip():
        parts.append(cur.strip())
    # recolle les bouts trop courts (« Oui ! ») à la phrase suivante
    merged = []
    for p in parts:
        if merged and len(merged[-1]) < 12:
            merged[-1] += " " + p
        else:
            merged.append(p)
    return merged or [text]


def finish(path: Path, tempo: float, polish: bool):
    """Finition ffmpeg : débit (atempo garde la hauteur) + EQ/compression légère pour une voix plus chaude."""
    filters = []
    if abs(tempo - 1.0) >= 0.01:
        filters.append(f"atempo={tempo}")
    if polish:
        filters += [
            "highpass=f=80",  # coupe les grondements
            "equalizer=f=250:t=q:w=1:g=-2",  # moins de « carton »
            "equalizer=f=3500:t=q:w=1.2:g=2.5",  # présence, articulation
            "deesser=i=0.3",  # adoucit les « s »
            "acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2",  # voix plus pleine et régulière
        ]
    if not filters:
        return
    if not shutil.which("ffmpeg"):
        print("  (ffmpeg introuvable : finition ignorée)")
        return
    tmp = path.with_suffix(".fx.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(path), "-af", ",".join(filters), str(tmp)], check=True)
    tmp.replace(path)


def run_clone(jobs):
    import torch
    import torchaudio as ta
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS  # pip install chatterbox-tts

    ref = default_ref()
    if not ref.exists():
        sys.exit(f"Échantillon de voix introuvable : {ref}\nEnregistre 10 à 20 s de ta voix (voir docs/ENREGISTRER-SA-VOIX.md).")
    device = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
    print(f"  chargement Chatterbox Multilingual sur {device}…", flush=True)
    model = ChatterboxMultilingualTTS.from_pretrained(device=device)
    preset_name = os.environ.get("MOTO_VOICE_PRESET", "naturel")
    preset = PRESETS.get(preset_name)
    if preset is None:
        sys.exit(f"Préréglage inconnu : {preset_name} (choix : {', '.join(PRESETS)})")
    exaggeration = float(os.environ.get("MOTO_VOICE_EXAGGERATION", preset["exaggeration"]))
    cfg = float(os.environ.get("MOTO_VOICE_CFG", preset["cfg"]))
    temperature = float(os.environ.get("MOTO_VOICE_TEMP", preset["temp"]))
    tempo = float(os.environ.get("MOTO_VOICE_TEMPO", preset["tempo"]))
    polish = os.environ.get("MOTO_VOICE_POLISH", "1") != "0"
    pause = float(os.environ.get("MOTO_VOICE_PAUSE", "0.18"))  # silence entre deux phrases (s)
    seed = os.environ.get("MOTO_VOICE_SEED")
    print(f"  échantillon : {ref.name}", flush=True)
    print(f"  préréglage {preset_name} : exaggeration={exaggeration} cfg={cfg} temp={temperature} tempo={tempo} finition={'oui' if polish else 'non'}", flush=True)
    for job in jobs:
        out = Path(job["out"])
        out.parent.mkdir(parents=True, exist_ok=True)
        if seed is not None:
            torch.manual_seed(int(seed))
        pieces = []
        for sentence in split_sentences(job["text"]):
            wav = model.generate(sentence, language_id="fr", audio_prompt_path=str(ref), exaggeration=exaggeration, cfg_weight=cfg, temperature=temperature)
            wav = wav.reshape(1, -1).cpu()
            # retire le silence de fin de chaque phrase pour garder un débit vif
            env = wav.abs()[0]
            idx = (env > 0.01).nonzero()
            if len(idx):
                wav = wav[:, : int(idx[-1]) + int(0.05 * model.sr)]
            pieces += [wav, torch.zeros(1, int(pause * model.sr))]
        ta.save(str(out), torch.cat(pieces[:-1], dim=1), model.sr)
        finish(out, tempo, polish)
        print(f"  voix (clone) -> {out.name}", flush=True)


def run_google(jobs):
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from google_tts import DEFAULT_VOICE, synthesize

    voice = os.environ.get("MOTO_GOOGLE_VOICE", DEFAULT_VOICE)
    rate = float(os.environ.get("MOTO_GOOGLE_RATE", "1.1"))  # un peu plus rapide = plus dynamique
    total = sum(len(j["text"]) for j in jobs)
    print(f"  voix Google : {voice} (vitesse {rate}), {total} caractères", flush=True)
    for job in jobs:
        out = Path(job["out"])
        synthesize(job["text"], out, voice, rate)
        print(f"  voix (google) -> {out.name}", flush=True)


def main():
    spec = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    engine = spec.get("engine", "piper")
    if engine == "piper":
        run_piper(spec["jobs"])
    elif engine == "clone":
        run_clone(spec["jobs"])
    elif engine == "google":
        run_google(spec["jobs"])
    else:
        sys.exit(f"Moteur inconnu : {engine}")


if __name__ == "__main__":
    main()
