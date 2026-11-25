"""Fait parler toutes les voix françaises de Google sur la même phrase, pour choisir à l'oreille.

Usage : python pipeline/google_voices.py              (Chirp 3 HD + Neural2 + Studio + WaveNet)
        python pipeline/google_voices.py Chirp3-HD    (un seul type)
        python pipeline/google_voices.py all "Ta phrase de test"
Résultat : out/voix-google/<type>/<voix>.wav (~150 caractères par voix, largement dans l'offre gratuite).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from google_tts import ROOT, list_voices, synthesize  # noqa: E402

TYPES = ["Chirp3-HD", "Neural2", "Studio", "Wavenet"]
which = sys.argv[1] if len(sys.argv) > 1 else "all"
text = sys.argv[2] if len(sys.argv) > 2 else (
    "Plus de cent maillons d'acier tirent ta moto à chaque seconde ! On décode la chaîne. "
    "Et à la fin, je te donne une astuce pour la faire durer deux fois plus longtemps."
)
types = TYPES if which == "all" else [which]
voices = [v for v in list_voices("fr-FR") if any(f"-{t}-" in v["name"] for t in types)]
if not voices:
    sys.exit(f"Aucune voix trouvée pour : {', '.join(types)}")
out = ROOT / "out" / "voix-google"
print(f"{len(voices)} voix, environ {len(voices) * len(text)} caractères utilisés.")
for v in sorted(voices, key=lambda v: v["name"]):
    t = next(t for t in types if f"-{t}-" in v["name"])
    genre = {"MALE": "homme", "FEMALE": "femme"}.get(v.get("ssmlGender"), "?")
    dest = out / t / f"{v['name']} ({genre}).wav"
    try:
        synthesize(text, dest, v["name"])
        print(f"  {v['name']:32} {genre}")
    except RuntimeError as e:
        print(f"  {v['name']:32} ÉCHEC : {str(e)[:120]}")
print(f"\nÉcoute les fichiers dans : {out}")
print("Puis choisis ta voix :  setx MOTO_GOOGLE_VOICE fr-FR-Chirp3-HD-XXX")
