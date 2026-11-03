"""Gera a narração (Piper), a trilha e os efeitos de um Reels a partir de roteiro.json.

Uso: ~/reels-venv/bin/python _reels/audio.py <pasta-do-reels> <voz.onnx>
Lê <pasta>/roteiro.json e grava <pasta>/audio.wav e <pasta>/tempo.json (início e fim de cada fala e palavra).

roteiro.json: {"bpm": 118, "falas": [{"id": "gancho", "tts": "...", "legenda": "...", "pausa": 0.2}], "efeitos": [{"fala": "gancho", "tipo": "impacto", "palavra": 3}]}
Tipos de efeito: whoosh, pop, impacto, tique. "palavra" é o índice da palavra da legenda (opcional; sem ele, o efeito cai no início da fala).
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np
from piper import PiperVoice, SynthesisConfig

SR = 48000
pasta = Path(sys.argv[1])
voz = PiperVoice.load(sys.argv[2])
roteiro = json.loads((pasta / "roteiro.json").read_text(encoding="utf-8"))
rng = np.random.default_rng(7)


def reamostrar(x, de, para):
    n = int(len(x) * para / de)
    return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x)


def falar(texto):
    caminho = pasta / "_fala.wav"
    with wave.open(str(caminho), "wb") as w:
        voz.synthesize_wav(texto, w, SynthesisConfig(length_scale=roteiro.get("velocidade", 1.0), noise_scale=0.6, noise_w_scale=0.7))
    with wave.open(str(caminho), "rb") as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    caminho.unlink()
    x = reamostrar(x, sr, SR)
    # corta o silêncio das pontas
    vivo = np.where(np.abs(x) > 0.02)[0]
    if len(vivo):
        x = x[max(0, vivo[0] - int(0.03 * SR)): vivo[-1] + int(0.06 * SR)]
    return x


# ---------------------------------------------------------------- narração e tempos
inicio = 0.45
trechos, tempo = [], {"falas": []}
for f in roteiro["falas"]:
    x = falar(f["tts"])
    dur = len(x) / SR
    palavras = f["legenda"].split()
    falado = {"1º": "primeiro", "2027": "dois mil e vinte e sete", "2027.": "dois mil e vinte e sete."}
    pesos = np.array([len(falado.get(p, p)) + 2 for p in palavras], dtype=float)
    cortes = np.concatenate([[0], np.cumsum(pesos) / pesos.sum()]) * dur
    tempo["falas"].append({
        "id": f["id"], "de": round(inicio, 3), "ate": round(inicio + dur, 3), "legenda": f["legenda"],
        "palavras": [{"t": p, "de": round(inicio + cortes[i], 3), "ate": round(inicio + cortes[i + 1], 3)} for i, p in enumerate(palavras)],
    })
    trechos.append((inicio, x))
    inicio += dur + f.get("pausa", 0.25)
duracao = round(inicio + roteiro.get("final", 2.4), 2)
tempo["duracao"] = duracao
n = int(duracao * SR)
t = np.arange(n) / SR

voz_trilha = np.zeros(n, np.float32)
for de, x in trechos:
    i = int(de * SR)
    voz_trilha[i:i + len(x)] += x[: n - i]
voz_trilha /= max(1e-6, np.abs(voz_trilha).max()) / 0.9

# ---------------------------------------------------------------- trilha (sintetizada aqui, sem direitos de terceiros)
bpm = roteiro.get("bpm", 118)
batida = 60 / bpm
musica = np.zeros(n, np.float32)


def soma(sinal, em):
    i = int(em * SR)
    if i >= n:
        return
    k = min(len(sinal), n - i)
    musica[i:i + k] += sinal[:k]


def env(dur, ataque=0.005, queda=None):
    m = int(dur * SR)
    e = np.ones(m)
    a = max(1, int(ataque * SR))
    e[:a] = np.linspace(0, 1, a)
    e *= np.exp(-np.arange(m) / SR / (queda or dur / 3))
    return e


def bumbo():
    d = 0.32
    tt = np.arange(int(d * SR)) / SR
    f = 50 + 110 * np.exp(-tt * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.002, 0.11) * 0.9


def palma():
    d = 0.18
    r = rng.standard_normal(int(d * SR))
    r = np.convolve(r, np.ones(6) / 6, "same") - np.convolve(r, np.ones(40) / 40, "same")
    return r * env(d, 0.002, 0.05) * 0.45


def chimbal(aberto=False):
    d = 0.2 if aberto else 0.05
    r = rng.standard_normal(int(d * SR))
    r = r - np.convolve(r, np.ones(4) / 4, "same")
    return r * env(d, 0.001, d / 3) * 0.18


def nota(freq, dur, onda="pluck", vol=0.2):
    tt = np.arange(int(dur * SR)) / SR
    if onda == "baixo":
        s = np.sin(2 * np.pi * freq * tt) + 0.3 * np.sin(4 * np.pi * freq * tt)
        return s * env(dur, 0.005, dur / 1.5) * vol
    s = sum(np.sin(2 * np.pi * freq * k * tt) / k for k in (1, 2, 3, 4)) * 0.5
    s += 0.4 * np.sin(2 * np.pi * freq * 1.005 * tt)
    return s * env(dur, 0.004, 0.18) * vol


hz = lambda m: 440 * 2 ** ((m - 69) / 12)
# Lá menor, Fá, Dó, Sol: cada acorde dura um compasso
acordes = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
baixos = [45, 41, 48, 43]
compasso = 4 * batida
c = 0
while c * compasso < duracao:
    base = c * compasso
    ac, bx = acordes[c % 4], baixos[c % 4]
    for b in range(4):
        em = base + b * batida
        soma(bumbo(), em)
        if b in (1, 3):
            soma(palma(), em)
        soma(chimbal(), em + batida / 2)
        soma(chimbal(b == 3), em + batida * 0.75 if b == 3 else em + batida / 4 * 3)
        soma(nota(hz(bx - 12), batida * 0.9, "baixo", 0.32), em)
        soma(nota(hz(bx - 12), batida * 0.4, "baixo", 0.22), em + batida / 2)
    # arpejo em colcheias
    for k in range(8):
        soma(nota(hz(ac[k % 3] + 12 * (k % 2)), batida * 0.6, vol=0.09), base + k * batida / 2)
    c += 1
musica /= max(1e-6, np.abs(musica).max())

# a música abaixa enquanto a voz fala
falando = np.convolve(np.abs(voz_trilha), np.ones(int(0.12 * SR)) / (0.12 * SR), "same")
alvo = np.where(falando > 0.015, 0.11, 0.42)
duck = np.convolve(alvo, np.ones(int(0.18 * SR)) / (0.18 * SR), "same")
musica *= duck
# entra e sai suave
musica[: int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR))
musica[-int(1.6 * SR):] *= np.linspace(1, 0, int(1.6 * SR))

# ---------------------------------------------------------------- efeitos
efeitos = np.zeros(n, np.float32)


def efeito(tipo):
    if tipo == "whoosh":
        d = 0.42
        r = rng.standard_normal(int(d * SR))
        tt = np.linspace(0, 1, len(r))
        larg = (2 + 30 * (1 - np.abs(tt - 0.55) * 1.8).clip(0)).astype(int)
        y = np.array([r[max(0, i - L):i + 1].mean() for i, L in enumerate(larg)])
        return y * np.sin(np.pi * tt) ** 2 * 0.55
    if tipo == "pop":
        d = 0.09
        tt = np.arange(int(d * SR)) / SR
        f = 900 - 500 * tt / d
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.002, 0.03) * 0.5
    if tipo == "impacto":
        d = 0.7
        tt = np.arange(int(d * SR)) / SR
        f = 40 + 90 * np.exp(-tt * 9)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.002, 0.25)
        r = rng.standard_normal(len(tt)) * env(d, 0.001, 0.06) * 0.5
        return (s + r) * 0.8
    if tipo == "tique":
        d = 0.03
        r = rng.standard_normal(int(d * SR))
        return (r - np.convolve(r, np.ones(3) / 3, "same")) * env(d, 0.001, 0.008) * 0.6
    raise ValueError(tipo)


falas_por_id = {f["id"]: f for f in tempo["falas"]}
tempo["efeitos"] = []
for e in roteiro.get("efeitos", []):
    f = falas_por_id[e["fala"]]
    em = f["palavras"][e["palavra"]]["de"] if "palavra" in e else f["de"]
    em += e.get("desloca", 0)
    s = efeito(e["tipo"])
    i = int(max(0, em) * SR)
    k = min(len(s), n - i)
    efeitos[i:i + k] += s[:k]
    tempo["efeitos"].append({"tipo": e["tipo"], "t": round(em, 3)})

mix = voz_trilha * 1.0 + musica * 0.55 + efeitos * 0.35
mix /= max(1e-6, np.abs(mix).max()) / 0.95
estereo = np.stack([mix, mix], axis=1)
with wave.open(str(pasta / "audio.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((estereo * 32767).astype(np.int16).tobytes())
(pasta / "tempo.json").write_text(json.dumps(tempo, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"duração {duracao}s, {len(tempo['falas'])} falas")
for f in tempo["falas"]:
    print(f"  {f['de']:6.2f}-{f['ate']:6.2f} {f['id']}")
