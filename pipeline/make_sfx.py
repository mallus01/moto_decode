"""Fabrique les bruitages de Moto Décode (originaux, générés par code : libres de droits).

Usage : python pipeline/make_sfx.py   -> public/sfx/*.wav
Style jeu vidéo / TikTok : whoosh, boom, pop, ding, zap, levelup, boing, tick.
Tu peux remplacer n'importe quel fichier par ton propre son (même nom, en .wav) à condition d'en avoir les droits.
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(42)  # déterministe : mêmes sons à chaque fois


def t(d):
    return np.arange(int(SR * d)) / SR


def env(n, attack=0.005, release=None, curve=4.0):
    """Enveloppe attaque rapide + décroissance exponentielle."""
    x = np.linspace(0, 1, n)
    a = np.clip(x / max(attack * SR / n, 1e-6), 0, 1)
    return a * np.exp(-curve * x)


def lowpass(x, cutoff):
    """Passe-bas 1 pôle, cutoff fixe ou tableau (balayage)."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    alpha = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += alpha[i] * (x[i] - acc)
        y[i] = acc
    return y


def sweep(f0, f1, d, shape="sine", curve="exp"):
    tt = t(d)
    if curve == "exp":
        f = f0 * (f1 / f0) ** (tt / d)
    else:
        f = f0 + (f1 - f0) * tt / d
    ph = 2 * np.pi * np.cumsum(f) / SR
    if shape == "square":
        return np.sign(np.sin(ph))
    if shape == "tri":
        return 2 / np.pi * np.arcsin(np.sin(ph))
    return np.sin(ph)


def save(name, x, peak_db=-3.0):
    x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (peak_db / 20)
    fade = min(len(x), int(0.01 * SR))
    x[-fade:] *= np.linspace(1, 0, fade)
    data = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    stereo = np.repeat(data[:, None], 2, axis=1)
    OUT.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(stereo.tobytes())
    print(f"  {name}.wav ({len(x) / SR:.2f} s)")


def whoosh():
    d = 0.42
    n = len(t(d))
    noise = rng.standard_normal(n)
    x = np.linspace(0, 1, n)
    cutoff = 300 + 5000 * np.sin(np.pi * x) ** 2
    y = lowpass(noise, cutoff) - lowpass(noise, cutoff * 0.25)
    return y * np.sin(np.pi * x) ** 1.5


def boom():
    d = 0.9
    sub = sweep(95, 38, d) * env(len(t(d)), curve=5)
    click = lowpass(rng.standard_normal(len(t(d))), 2500) * env(len(t(d)), curve=40)
    y = np.tanh(2.5 * (sub + 0.6 * click))  # saturation = boom "gras"
    return y


def pop():
    d = 0.11
    return sweep(1400, 380, d) * env(len(t(d)), attack=0.001, curve=7)


def ding():
    d = 1.1
    tt = t(d)
    y = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-k * tt) for f, a, k in [(1568, 1.0, 3.5), (3136, 0.45, 6), (4704, 0.2, 9), (2350, 0.25, 5)])
    return y * np.clip(tt / 0.003, 0, 1)


def zap():
    d = 0.32
    n = len(t(d))
    crackle = rng.standard_normal(n) * (rng.random(n) > 0.85)
    buzz = sweep(2200, 300, d, shape="square") * 0.5
    return (lowpass(crackle, 6000) * 1.5 + buzz) * env(n, attack=0.001, curve=6)


def levelup():
    # arpège 8 bits montant (do-mi-sol-do), son « niveau réussi »
    notes = [1047, 1319, 1568, 2093]
    parts = []
    for i, f in enumerate(notes):
        d = 0.07 if i < len(notes) - 1 else 0.32
        parts.append(np.sign(np.sin(2 * np.pi * f * t(d))) * env(len(t(d)), attack=0.001, curve=2 if i == 3 else 1) * 0.6)
    return np.concatenate(parts)


def boing():
    d = 0.5
    tt = t(d)
    f = 180 + 260 * np.exp(-6 * tt) * (1 + 0.35 * np.sin(2 * np.pi * 14 * tt))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(len(tt), attack=0.002, curve=4)


def tick():
    d = 0.05
    return sweep(3000, 1800, d, shape="tri") * env(len(t(d)), attack=0.0005, curve=12)


if __name__ == "__main__":
    print("Génération des bruitages…")
    for name, fn in [("whoosh", whoosh), ("boom", boom), ("pop", pop), ("ding", ding), ("zap", zap), ("levelup", levelup), ("boing", boing), ("tick", tick)]:
        save(name, fn())
