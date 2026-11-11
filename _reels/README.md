# Reels semanal da MovCode

Ferramentas para transformar o artigo da semana do blog num Reels (1080x1920, uns 30 segundos) com narração, trilha, efeitos e legenda palavra por palavra. A pasta começa com "_", então não vai para o ar no GitHub Pages.

## Como funciona

1. `roteiro.json`: as falas (o que a voz diz em `tts` e o que aparece escrito em `legenda`), o ritmo da trilha (`bpm`) e os efeitos sonoros presos a palavras.
2. `audio.py`: gera a narração com a voz `pm_alex` do Kokoro (licença Apache 2.0; a voz Piper `pt_BR-faber-medium` soou de Portugal para o Kaique e fica só como reserva), sintetiza a trilha e os efeitos (nada de terceiros) e grava `audio.wav` e `tempo.json`, com o início e o fim de cada fala e palavra.
3. `index.html`: as cenas animadas. Cada `<section class="cena" data-cena="id">` começa na fala de mesmo id e vai até a próxima cena (uma cena pode cobrir várias falas), e `anima[id](t)` anima as peças usando os tempos de `tempo.json` (`W(id, n)` é o momento da palavra n da legenda daquela fala).
4. `render.js`: abre a página no Chromium, desenha quadro a quadro e junta com o áudio no ffmpeg.

`exemplo-nfse/` é o Reels de 2 de novembro de 2026 (nota fiscal de serviço no Simples): use como modelo para as cenas, os ícones e as animações.

## Preparar (uma vez por máquina)

```sh
python3 -m venv ~/reels-venv && ~/reels-venv/bin/pip install piper-tts faster-whisper soundfile scipy
# Kokoro sem o spaCy (só o inglês usa, e ele não compila no Python 3.13)
~/reels-venv/bin/pip install --extra-index-url https://download.pytorch.org/whl/cpu torch
~/reels-venv/bin/pip install --no-deps kokoro misaki
~/reels-venv/bin/pip install loguru transformers huggingface_hub phonemizer-fork espeakng-loader num2words regex
# voz Piper de reserva
mkdir -p ~/vozes && cd ~/vozes && for f in pt_BR-faber-medium.onnx pt_BR-faber-medium.onnx.json; do
  curl -sL -o $f "https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium/$f"; done
```

Precisa também de `ffmpeg` e do pacote `playwright` do Node com Chromium.

## Fazer um Reels

```sh
cp -r _reels/exemplo-nfse /tmp/reels/<slug>          # pasta de trabalho, fora do repositório
cp assets/images/logos/movcode-simbolo-branco.svg /tmp/reels/<slug>/logo.svg
# edite roteiro.json e as cenas do index.html
~/reels-venv/bin/python _reels/audio.py /tmp/reels/<slug> kokoro:pm_alex
NODE_PATH=$(npm root -g) node _reels/render.js /tmp/reels/<slug> --previa 1,5,10   # confira os quadros
NODE_PATH=$(npm root -g) node _reels/render.js /tmp/reels/<slug> /tmp/reels/bruto.mp4 30
ffmpeg -i /tmp/reels/bruto.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k -movflags +faststart /tmp/reels/reels-<data>-<slug>.mp4
```

Dicas que já funcionaram (o Kaique achou a primeira versão rápida demais e as animações simples e tortas):

- Ritmo calmo: `"velocidade_kokoro": 0.95` no roteiro (com Piper, `"velocidade": 1.3`) e pausas de 0,35 a 0,6 s entre as falas. Quebre frases longas em falas separadas (uma ideia por fala, até umas 12 palavras). O total fica entre 35 e 50 segundos, perto de 2,7 palavras por segundo.
- A legenda mostra no máximo 3 palavras por vez, com a palavra falada em destaque.
- Animação caprichada, nada torto: tudo alinhado, sem rotação. Texto sobe de trás de uma máscara (`mostra`), desenhos de linha se traçam na tela (`desenha`), cartões entram com mola (`mola`), troca de cena com a faixa laranja que atravessa a tela, partículas e uma tremida curta só no ponto alto. Um ícone ou desenho por cena, pouco texto grande.
- Números e siglas por extenso no `tts` ("primeiro de novembro", "dois mil e vinte e sete"); na `legenda`, do jeito que se escreve.
- A marca vai no `tts` como "Mov Code".
- Efeitos sonoros fora das palavras: whoosh uns 0,4 s antes da fala, pop uns 0,06 s antes da palavra.
- Para conferir a voz sem ouvir, transcreva `audio.wav` com o faster-whisper (modelo "small") e compare com o roteiro.
- Deixe as bordas livres: o Instagram cobre o topo, a lateral direita e a parte de baixo. As peças ficam entre y 340 e 1200, e a legenda em y 1300.
- O render leva uns 10 minutos para 45 segundos de vídeo: rode em segundo plano.
