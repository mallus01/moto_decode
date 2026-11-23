"""Télécharge la voix Piper française provisoire (fr_FR tom, ~60 Mo) dans voices/piper/."""
import io
import tarfile
import urllib.request
from pathlib import Path

URL = "https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-fr_FR-tom-medium.tar.bz2"
DEST = Path(__file__).resolve().parent.parent / "voices" / "piper"
DEST.mkdir(parents=True, exist_ok=True)
if (DEST / "fr_FR-tom-medium.onnx").exists():
    print("Voix Piper déjà installée.")
else:
    print("Téléchargement de la voix Piper…")
    data = urllib.request.urlopen(URL).read()
    with tarfile.open(fileobj=io.BytesIO(data), mode="r:bz2") as tar:
        for m in tar.getmembers():
            name = Path(m.name).name
            if name in ("fr_FR-tom-medium.onnx", "fr_FR-tom-medium.onnx.json"):
                (DEST / name).write_bytes(tar.extractfile(m).read())
    print(f"OK -> {DEST}")
