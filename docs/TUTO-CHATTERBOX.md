# Tuto : cloner ta voix avec Chatterbox (Windows)

Objectif : que `npm run make -- <sujet> --voice clone` fasse parler **ta** voix dans les vidéos.
Tout tourne sur ton PC, gratuitement. Chatterbox Multilingual est un modèle open source (licence MIT) de Resemble AI qui parle français.

Durée : environ 30 à 45 min la première fois (surtout des téléchargements).

---

## 0. Ce qu'il te faut

| | Minimum | Conseillé |
|---|---|---|
| Carte graphique | aucune (CPU, mais **lent** : plusieurs minutes par phrase) | NVIDIA avec 6 Go de VRAM ou plus |
| Espace disque | 10 Go | 15 Go |
| Logiciels | Git, Node.js 22+, FFmpeg, Anaconda (tu l'as déjà) | |

**Vérifie ta carte graphique** : ouvre *PowerShell* et tape :

```powershell
nvidia-smi
```

Si un tableau s'affiche avec le nom de ta carte (ex. « RTX 3060 »), c'est parfait.
Si la commande est inconnue, tu n'as pas de carte NVIDIA (ou pas le pilote) : ça marchera quand même, mais lentement.
Dans ce cas, installe d'abord le dernier pilote sur https://www.nvidia.com/fr-fr/drivers/ si tu as bien une carte NVIDIA.

## 1. Installer les outils de base (une seule fois)

Dans PowerShell :

```powershell
winget install Git.Git
winget install OpenJS.NodeJS.LTS
winget install Gyan.FFmpeg
```

Ferme puis rouvre PowerShell, et vérifie :

```powershell
git --version
node --version     # doit afficher v22 ou plus
ffmpeg -version
```

## 2. Récupérer le projet

```powershell
cd $HOME\Documents
git clone https://github.com/mallus01/moto_decode.git
cd moto_decode
npm install
```

> Si PowerShell refuse `npm` (« l'exécution de scripts est désactivée sur ce système »), lance une fois
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, réponds O, puis rouvre PowerShell.

## 3. Créer un environnement Python dédié

Ouvre **Anaconda Prompt** (menu Démarrer, pas PowerShell : `conda` n'y est pas reconnu par défaut), puis :

```bat
conda create -n motovoice python=3.11 -y
conda activate motovoice
cd %USERPROFILE%\Documents\moto_decode
```

> Python 3.11 est important : Chatterbox 0.1.7 demande PyTorch 2.6, qui n'existe pas pour les Python plus récents.
> À chaque nouvelle session, refais `conda activate motovoice` avant de lancer le pipeline.

## 4. Installer PyTorch puis Chatterbox

**Avec une carte NVIDIA** :

```bat
pip install torch==2.6.0 torchaudio==2.6.0 --index-url https://download.pytorch.org/whl/cu124
pip install -r pipeline\requirements-clone.txt
```

**Sans carte NVIDIA** (CPU) :

```bat
pip install torch==2.6.0 torchaudio==2.6.0
pip install -r pipeline\requirements-clone.txt
```

Vérifie que PyTorch voit ta carte :

```bat
python -c "import torch; print('GPU OK :', torch.cuda.is_available())"
```

`GPU OK : True` = parfait. `False` alors que tu as une carte NVIDIA : voir *Dépannage*.

Installe aussi la voix provisoire (utile pour comparer) :

```bat
python pipeline\setup_voice.py
```

## 5. Enregistrer ta voix

C'est l'étape qui fait toute la qualité. Le modèle copie **le timbre et le ton** de ton échantillon.

1. Installe Audacity (gratuit) : `winget install Audacity.Audacity`
2. Pièce calme, micro (ou casque-micro) à 15-20 cm, pas de musique ni de ventilateur.
3. Lis ce texte **avec l'énergie de tes vidéos**, comme si tu parlais à un pote motard (20 à 25 secondes) :

   > Salut les motards ! Aujourd'hui on va voir comment fonctionne ta moto, pièce par pièce.
   > Le piston monte, la bougie fait une étincelle, et boum, le moteur tourne !
   > Franchement, c'est pas si compliqué. Et avec deux ou trois astuces d'entretien,
   > ta bécane va te remercier pendant des années. Allez, on y va !

4. Dans Audacity : sélectionne tout (**Ctrl+A**), puis *Effet → Volume et compression → Normaliser…* (pic à -1 dB) ; étape facultative.
   Coupe ensuite les blancs au début et à la fin.
5. *Fichier → Exporter → Exporter en WAV*, enregistre sous :
   `Documents\moto_decode\voices\mattis.wav`

Conseils : une seule voix, pas d'écho, 10 s minimum, 30 s maximum. Mieux vaut 20 s propres que 30 s bruitées.

## 6. Premier test

Toujours dans Anaconda Prompt (environnement `motovoice` activé) :

```bat
python pipeline\try_voice.py "Salut les motards ! Aujourd'hui, on décode le moteur quatre temps."
```

- Au **premier lancement**, le modèle (~3 Go) se télécharge depuis Hugging Face : patiente.
- Le résultat est dans `out\test-voix.wav`. Écoute-le.

Les réglages par défaut visent déjà un style **TikTok dynamique**. Pour ajuster, change une variable puis relance le test :

```bat
set MOTO_VOICE_EXAGGERATION=1.2
set MOTO_VOICE_CFG=0.3
set MOTO_VOICE_TEMP=0.9
set MOTO_VOICE_TEMPO=1.15
```

| Réglage | Effet | Calme → très dynamique | Défaut |
|---|---|---|---|
| `MOTO_VOICE_EXAGGERATION` | énergie, émotion, intonation | 0.5 → 1.5 (au-delà : risque de voix qui déraille) | 1.0 |
| `MOTO_VOICE_CFG` | plus **bas** = rythme plus libre et vivant | 0.6 → 0.2 | 0.3 |
| `MOTO_VOICE_TEMP` | variation, naturel | 0.7 → 1.0 | 0.9 |
| `MOTO_VOICE_TEMPO` | vitesse de parole (sans changer la hauteur) | 1.0 → 1.2 | 1.12 |

**Le plus important reste ton échantillon** : le modèle copie le ton de `voices\mattis.wav`. Pour une voix TikTok, enregistre-le
comme tu parles en vidéo : debout, souriant, rythme rapide, en appuyant sur les mots clés. Un échantillon calme donnera une voix calme,
quels que soient les réglages.

### Plusieurs échantillons de voix

Tu peux garder plusieurs enregistrements dans `voices\` (ex. `mattis-calme.wav`, `mattis-energique.wav`) et choisir lequel utiliser :

```bat
set MOTO_VOICE_REF=voices\mattis-energique.wav
```

Sans cette variable, c'est `voices\mattis.wav` qui est utilisé. Pour garder un choix par défaut : `setx MOTO_VOICE_REF voices\mattis-energique.wav`.

## 7. Faire une vidéo avec ta voix

```bat
npm run make -- moteur-4-temps --voice clone
```

La vidéo finale sort dans `out\moteur-4-temps.mp4`.
Les voix déjà générées sont gardées en cache : si tu changes une seule phrase du script, seule cette phrase est régénérée.
Si tu changes d'échantillon ou de réglages, les voix sont régénérées automatiquement. Pour forcer quand même : `--force-voice`.

Pour que ta voix soit utilisée **par défaut** :

```bat
setx MOTO_VOICE clone
```

(rouvre ensuite Anaconda Prompt).

## 8. Créer une nouvelle vidéo

Ouvre Claude Code dans le dossier `moto_decode` et demande simplement :
« Fais une vidéo sur les plaquettes de frein, avec ma voix clonée ».
Claude écrit le script, dessine ce qui manque et lance le rendu.

---

## Dépannage

| Problème | Solution |
|---|---|
| `TypeError: 'NoneType' object is not callable` | Le paquet de filigrane de Chatterbox ne trouve pas `pkg_resources` (supprimé de setuptools 81). `pip install "setuptools<81"` puis relance. |
| `conda` n'est pas reconnu | Normal dans PowerShell : utilise **Anaconda Prompt** (menu Démarrer). Ou une fois : `& "$HOME\anaconda3\Scripts\conda.exe" init powershell` (ou `C:\ProgramData\anaconda3\...`), puis rouvre PowerShell. Pas d'Anaconda Prompt du tout ? `winget install Anaconda.Miniconda3`. |
| `npm.ps1 ne peut pas être chargé… l'exécution de scripts est désactivée` (PowerShell) | Une fois : `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`, réponds O, puis rouvre PowerShell. Ou tape `npm.cmd install`, ou utilise Anaconda Prompt / cmd. |
| `GPU OK : False` avec une carte NVIDIA | Mets à jour le pilote NVIDIA, puis réinstalle PyTorch avec la commande `--index-url .../cu124` de l'étape 4 (`pip uninstall torch torchaudio -y` avant). |
| `CUDA out of memory` | Ferme les jeux et logiciels 3D (Blender…), puis relance. Avec moins de 6 Go de VRAM, essaie quand même : ça passe souvent pour des phrases courtes. |
| `No module named 'chatterbox'` | Tu n'as pas activé l'environnement : `conda activate motovoice`. |
| `npm run make` lance le mauvais Python | Indique-le explicitement : `set MOTO_PYTHON=%CONDA_PREFIX%\python.exe` |
| Téléchargement Hugging Face très lent ou bloqué | Relance : il reprend où il s'est arrêté. Les fichiers sont dans `%USERPROFILE%\.cache\huggingface`. |
| La voix prononce mal un mot technique ou un sigle | Dans le script, écris-le comme il se prononce (ex. « A B S » au lieu de « ABS », « deux temps » au lieu de « 2T »). |
| La voix ne te ressemble pas assez | Réenregistre `voices\mattis.wav` plus proche du micro, avec plus d'énergie, sans bruit de fond. C'est presque toujours l'échantillon. |

## À savoir

- **100 % local** : ta voix et ton échantillon ne quittent jamais ton PC (`voices/` n'est pas envoyé sur GitHub).
- **Filigrane** : Chatterbox ajoute à chaque fichier généré un filigrane audio inaudible (« Perth ») qui permet de détecter que la voix a été générée par IA. Ça n'altère pas le son.
- **Mentionne l'IA** : TikTok demande d'étiqueter les contenus réalistes générés par IA. Coche « Contenu généré par l'IA » à la publication, c'est plus sûr.
- **Licence** : Chatterbox est sous licence MIT, utilisable aussi pour des vidéos monétisées.
