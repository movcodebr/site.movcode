// Uso: node render.js <pasta-da-cena> <saida.mp4> [fps]   ou   node render.js <pasta> --previa t1,t2,...
// Se a pasta tiver tempo.json (de audio.py), ele vira window.TEMPO; se tiver audio.wav, ele vira o som do vídeo.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  const [pasta, saida, extra] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('erro na página:', e.message));
  const tempo = path.resolve(pasta, 'tempo.json');
  const roteiro = path.resolve(pasta, 'roteiro.json');
  if (fs.existsSync(tempo)) {
    const bpm = fs.existsSync(roteiro) ? JSON.parse(fs.readFileSync(roteiro, 'utf8')).bpm : undefined;
    await page.addInitScript(`window.TEMPO = ${fs.readFileSync(tempo, 'utf8')}; window.BPM = ${bpm || 118};`);
  }
  await page.goto('file://' + path.resolve(pasta, 'index.html'));
  await page.evaluate(() => Promise.all(['500 40px Figtree','600 40px Figtree','700 40px Figtree','800 40px Figtree','700 40px "Bricolage Grotesque"','800 40px "Bricolage Grotesque"','700 40px "JetBrains Mono"'].map(f => document.fonts.load(f))));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const faltando = await page.evaluate(() => ['Bricolage Grotesque', 'Figtree', 'JetBrains Mono'].filter(f => !document.fonts.check(`700 40px "${f}"`)));
  if (faltando.length) console.error('fontes não carregadas:', faltando);

  if (saida === '--previa') {
    for (const t of extra.split(',').map(Number)) {
      await page.evaluate(t => render(t), t);
      await page.screenshot({ path: path.resolve(pasta, `previa-${t}.png`) });
    }
    await browser.close();
    return;
  }

  const fps = Number(extra || 30);
  const duracao = await page.evaluate(() => window.DURACAO);
  const total = Math.round(duracao * fps);
  const audio = path.resolve(pasta, 'audio.wav');
  const som = fs.existsSync(audio) ? ['-i', audio] : ['-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000'];
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-', ...som,
    '-map', '0:v', '-map', '1:a', '-shortest', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-r', String(fps), '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', saida],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < total; i++) {
    await page.evaluate(t => render(t), i / fps);
    const png = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 300 === 0) console.log(`quadro ${i}/${total}`);
  }
  ff.stdin.end();
  await new Promise((ok, erro) => ff.on('close', c => (c === 0 ? ok() : erro(new Error('ffmpeg saiu com ' + c)))));
  await browser.close();
  console.log('pronto:', saida);
})();
