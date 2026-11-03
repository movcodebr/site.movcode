# Reels semanal da MovCode

Ferramentas para transformar o artigo da semana do blog num Reels (1080x1920, uns 30 segundos) com narração, trilha, efeitos e legenda palavra por palavra. A pasta começa com "_", então não vai para o ar no GitHub Pages.

## Como funciona

1. `roteiro.json`: as falas (o que a voz diz em `tts` e o que aparece escrito em `legenda`), o ritmo da trilha (`bpm`) e os efeitos sonoros presos a palavras.
2. `audio.py`: gera a narração com a voz Piper `pt_BR-faber-medium` (licença CC0), sintetiza a trilha e os efeitos (nada de terceiros) e grava `audio.wav` e `tempo.json`, com o início e o fim de cada fala e palavra.
3. `index.html`: as cenas animadas. Cada `<section class="cena" data-fala="id">` aparece enquanto a fala de mesmo id toca, e `cenaFn[id](t)` anima as peças usando os tempos de `tempo.json` (`W(id, n)` é o momento da palavra n da legenda).
4. `render.js`: abre a página no Chromium, desenha quadro a quadro e junta com o áudio no ffmpeg.

`exemplo-nfse/` é o Reels de 2 de novembro de 2026 (nota fiscal de serviço no Simples): use como modelo para as cenas, os ícones e as animações.

## Preparar (uma vez por máquina)

```sh
python3 -m venv ~/reels-venv && ~/reels-venv/bin/pip install piper-tts faster-whisper
mkdir -p ~/vozes && cd ~/vozes && for f in pt_BR-faber-medium.onnx pt_BR-faber-medium.onnx.json; do
  curl -sL -o $f "https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium/$f"; done
```

Precisa também de `ffmpeg` e do pacote `playwright` do Node com Chromium.

## Fazer um Reels

```sh
cp -r _reels/exemplo-nfse /tmp/reels/<slug>          # pasta de trabalho, fora do repositório
cp assets/images/logos/movcode-simbolo-branco.svg /tmp/reels/<slug>/logo.svg
# edite roteiro.json e as cenas do index.html
~/reels-venv/bin/python _reels/audio.py /tmp/reels/<slug> ~/vozes/pt_BR-faber-medium.onnx
NODE_PATH=$(npm root -g) node _reels/render.js /tmp/reels/<slug> --previa 1,5,10   # confira os quadros
NODE_PATH=$(npm root -g) node _reels/render.js /tmp/reels/<slug> /tmp/reels/bruto.mp4 30
ffmpeg -i /tmp/reels/bruto.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k -movflags +faststart /tmp/reels/reels-<data>-<slug>.mp4
```

Dicas que já funcionaram:

- Fala curta e direta, uns 30 segundos no total. Uma ideia por cena e pouco texto na tela: a legenda de baixo já mostra o que a voz diz.
- Números e siglas por extenso no `tts` ("primeiro de novembro", "dois mil e vinte e sete"); na `legenda`, do jeito que se escreve.
- A marca vai no `tts` como "Mov Code".
- Efeitos sonoros fora das palavras: whoosh uns 0,38 s antes da fala, pop uns 0,06 s antes da palavra.
- Para conferir a voz sem ouvir, transcreva `audio.wav` com o faster-whisper (modelo "small") e compare com o roteiro.
- Deixe as bordas livres: o Instagram cobre o topo, a lateral direita e a parte de baixo. As peças ficam entre y 300 e 1200, e a legenda em y 1290.
