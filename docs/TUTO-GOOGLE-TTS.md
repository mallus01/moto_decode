# Voix Google (Cloud Text-to-Speech) : installation pas à pas

Les voix Google (surtout **Chirp 3 HD**) sont parmi les plus naturelles en français.
L'offre est **gratuite chaque mois** jusqu'à un certain volume. Une vidéo Moto Décode fait environ **1 000 caractères** :

| Type de voix | Gratuit par mois | Soit environ | Au-delà |
|---|---|---|---|
| **Chirp 3 HD** (conseillé) | 1 million de caractères | ~1 000 vidéos | 30 $ / million |
| Neural2, Studio | 1 million de caractères | ~1 000 vidéos | 16 $ et 160 $ / million |
| WaveNet, Standard | 4 millions de caractères | ~4 000 vidéos | 4 $ / million |

(Tarifs lus sur cloud.google.com/text-to-speech/pricing le 25/11/2026. Les voix « Gemini-TTS » n'ont **pas** d'offre gratuite : ne les utilise pas.)

⚠️ Google demande quand même une **carte bancaire** (compte de facturation), même pour rester dans le gratuit.
Tu ne paies rien tant que tu restes sous ces quotas, et l'étape 4 ajoute une alerte au cas où.

---

## 1. Créer le projet Google Cloud

1. Va sur **https://console.cloud.google.com** et connecte-toi avec ton compte Google.
2. Accepte les conditions. Si Google te propose l'**essai gratuit** (crédit offert), tu peux l'accepter : il ajoute la carte bancaire.
3. En haut à gauche, clique sur le sélecteur de projet → **Nouveau projet** → nom : `moto-decode` → **Créer**.
4. Vérifie que `moto-decode` est bien sélectionné en haut.

## 2. Activer l'API Text-to-Speech

1. Dans la barre de recherche en haut, tape **Cloud Text-to-Speech API**.
2. Ouvre-la et clique sur **Activer**.
3. Si Google demande un **compte de facturation**, crée-le (c'est là que va la carte bancaire) et associe-le au projet.

## 3. Créer la clé API

1. Menu ☰ → **API et services** → **Identifiants**.
2. **+ Créer des identifiants** → **Clé API**. Copie la clé (elle commence par `AIza…`).
3. Clique sur **Modifier la clé API** (ou sur son nom) :
   - **Restrictions relatives aux API** → **Restreindre la clé** → coche seulement **Cloud Text-to-Speech API** → **Enregistrer**.
   (Comme ça, même si la clé fuit, elle ne sert qu'à la synthèse vocale.)
4. Sur ton PC, crée le fichier `voices\google-key.txt` dans le dossier du projet et colle la clé dedans (une seule ligne) :
   ```bat
   cd C:\Users\matti\Documents\moto_decode
   notepad voices\google-key.txt
   ```
   Ce fichier n'est **jamais** envoyé sur GitHub (le dossier `voices\` est ignoré). Ne partage jamais ta clé.

## 4. Mettre une alerte de budget (sécurité)

1. Menu ☰ → **Facturation** → **Budgets et alertes** → **Créer un budget**.
2. Nom : `moto-decode`, montant : **1 €**.
3. Laisse les seuils d'alerte (50 %, 90 %, 100 %) : tu recevras un e-mail si tu commences à dépenser.

> Une alerte **prévient** mais ne **bloque** pas. Pour être tranquille : reste sur les voix Chirp 3 HD, Neural2 ou WaveNet,
> et n'utilise pas les voix Gemini-TTS ni « Instant custom voice ».

## 5. Écouter toutes les voix françaises

Dans Anaconda Prompt :

```bat
cd C:\Users\matti\Documents\moto_decode
git checkout main
git pull
conda activate motovoice
python pipeline\google_voices.py
```

Le script fait dire la même phrase à chaque voix française (Chirp 3 HD, Neural2, Studio, WaveNet) et range les fichiers dans
`out\voix-google\<type>\`. Ça utilise environ 10 000 caractères, soit 1 % de l'offre gratuite.

Pour un seul type : `python pipeline\google_voices.py Chirp3-HD`
Avec ta phrase : `python pipeline\google_voices.py all "Salut les motards !"`

## 6. Choisir ta voix et faire une vidéo

Quand tu as choisi (par ex. `fr-FR-Chirp3-HD-Enceladus`) :

```bat
setx MOTO_GOOGLE_VOICE fr-FR-Chirp3-HD-Charon
setx MOTO_VOICE google
```

Ferme et rouvre Anaconda Prompt, puis :

```bat
npm run make -- chaine
```

`setx MOTO_VOICE google` rend la voix Google **par défaut** ; tu peux aussi l'indiquer à chaque fois avec `--voice google`.

Réglages :

| Variable | Effet | Défaut |
|---|---|---|
| `MOTO_GOOGLE_VOICE` | nom exact de la voix | `fr-FR-Chirp3-HD-Enceladus` |
| `MOTO_GOOGLE_RATE` | vitesse (1.0 = normal, 1.2 = rapide) | 1.1 |

Les voix sont gardées en cache : refaire une vidéo sans changer le texte ne consomme **aucun** caractère.

## Problèmes fréquents

| Message | Solution |
|---|---|
| `Clé Google introuvable` | Le fichier `voices\google-key.txt` n'existe pas ou est vide. Vérifie avec `dir voices`. Pour le créer sans le Bloc-notes : `echo AIza...ta_cle...> voices\google-key.txt` (pas d'espace avant `>`). |
| `API key not valid` | Clé mal copiée (espace, guillemets ?). Recolle-la. |
| `… has not been used in project … or it is disabled` | L'API n'est pas activée (étape 2), ou attends 2-3 minutes après l'activation. |
| `billing` / `BILLING_DISABLED` | Le compte de facturation n'est pas associé au projet (étape 2.3). |
| `API_KEY_SERVICE_BLOCKED` | La restriction de la clé ne contient pas Cloud Text-to-Speech API (étape 3.3). |
