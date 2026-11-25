"""Google Cloud Text-to-Speech, via l'API REST et une clé API (aucune bibliothèque à installer).

Clé : variable d'environnement GOOGLE_TTS_API_KEY, ou fichier voices/google-key.txt (jamais versionné).
Offre gratuite (par mois) : 1 million de caractères pour Chirp 3 HD, Neural2 et Studio ;
4 millions pour WaveNet et Standard. Une vidéo ≈ 1 000 caractères.
Guide : docs/TUTO-GOOGLE-TTS.md
"""
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = "https://texttospeech.googleapis.com/v1"
DEFAULT_VOICE = "fr-FR-Chirp3-HD-Charon"


def api_key() -> str:
    key = os.environ.get("GOOGLE_TTS_API_KEY", "").strip()
    f = ROOT / "voices" / "google-key.txt"
    if not key and f.exists():
        key = f.read_text(encoding="utf-8").strip()
    if not key:
        sys.exit("Clé Google introuvable. Mets-la dans voices/google-key.txt (voir docs/TUTO-GOOGLE-TTS.md).")
    return key


def _call(method: str, path: str, body=None):
    req = urllib.request.Request(
        f"{API}/{path}{'&' if '?' in path else '?'}key={api_key()}",
        data=json.dumps(body).encode("utf-8") if body is not None else None,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        msg = e.read().decode("utf-8", "replace")
        raise RuntimeError(f"Google TTS a refusé la requête ({e.code}) : {msg}") from None


def list_voices(lang: str = "fr-FR"):
    return [v for v in _call("GET", f"voices?languageCode={lang}").get("voices", []) if lang in v.get("languageCodes", [])]


def synthesize(text: str, out: Path, voice: str = DEFAULT_VOICE, rate: float = 1.0):
    """Écrit un WAV 24 kHz. La langue est déduite du nom de la voix (fr-FR-…)."""
    lang = "-".join(voice.split("-")[:2])
    body = {
        "input": {"text": text},
        "voice": {"languageCode": lang, "name": voice},
        "audioConfig": {"audioEncoding": "LINEAR16", "sampleRateHertz": 24000},
    }
    if abs(rate - 1.0) > 0.001:
        body["audioConfig"]["speakingRate"] = rate
    try:
        res = _call("POST", "text:synthesize", body)
    except RuntimeError:
        if "speakingRate" not in body["audioConfig"]:
            raise
        # certaines voix n'acceptent pas speakingRate : on réessaie sans
        del body["audioConfig"]["speakingRate"]
        res = _call("POST", "text:synthesize", body)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(base64.b64decode(res["audioContent"]))  # LINEAR16 = WAV avec en-tête
