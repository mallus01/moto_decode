"""Test rapide de la voix clonée.

Usage : python pipeline/try_voice.py "Salut les motards !"
Écrit out/test-voix.wav. Options via variables d'environnement (voir voices/README.md).
"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
text = sys.argv[1] if len(sys.argv) > 1 else "Salut les motards ! Aujourd'hui, on décode le moteur quatre temps."
engine = sys.argv[2] if len(sys.argv) > 2 else "clone"
out = ROOT / "out" / "test-voix.wav"
out.parent.mkdir(exist_ok=True)
with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as f:
    json.dump({"engine": engine, "jobs": [{"text": text, "out": str(out)}]}, f, ensure_ascii=False)
subprocess.run([sys.executable, str(ROOT / "pipeline" / "voice.py"), f.name], check=True)
print(f"\nÉcoute le résultat : {out}")
