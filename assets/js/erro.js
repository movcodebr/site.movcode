/* -------------------------------------------------------------------------
   MovCode — 404
   O depósito no escuro. Enquanto ninguém mexe, a lanterna varre o depósito
   sozinha; com o mouse (ou o toque, ou o Tab nas coisas) ela vai aonde a
   pessoa aponta. A luz faz os bonequinhos se abaixarem atrás da caixa, o
   gato fechar os olhos, o rato fugir e a aranha subir. Achar as sete coisas
   acende a luz. Com movimento reduzido a lanterna não varre nem pisca:
   fica parada no 404 e só vai aonde a pessoa apontar.
------------------------------------------------------------------------- */
(() => {
    const tela = document.querySelector('[data-l-tela]');
    if (!tela) return;
    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (seletor) => tela.querySelector(seletor);
    const limitar = (v, a, b) => Math.min(b, Math.max(a, v));

    const camadas = [$('.l-escuro'), $('.l-facho')];
    const dupla = $('[data-l-dupla]');
    const gato = $('[data-l-gato]');
    const rato = $('[data-l-rato]');
    const aranha = $('[data-l-aranha]');
    const interruptor = $('[data-l-interruptor]');
    const balao = $('[data-l-balao]');
    const aviso = $('[data-l-aviso]');
    const itens = [...tela.querySelectorAll('[data-achado]')];
    const TEXTOS = {
        pagina: 'Achou a página perdida! Estava em branco. Melhor voltar para o início.',
        dupla: 'Psiu! A gente também veio procurar essa página.',
        gato: 'Miau. Ele não viu página nenhuma por aqui.',
        cafe: 'Café de ontem. Já esfriou.',
        postit: 'Lembrete: consertar link quebrado. Se veio de um link do nosso site, avisa a gente no WhatsApp.',
        pilha: 'Pilha nova! A lanterna ficou mais forte.',
        rato: 'Pegou o rato! Ele jura que não roeu a página.',
    };

    // ---------- Medidas (relativas à seção) ----------
    let W = 0;
    let H = 0;
    let estreito = false;
    const pos = {};
    let regiao = { x0: 0, y0: 0, x1: 0, y1: 0 };
    // onde o rato pode se esconder, rente ao rodapé (em % da largura)
    const tocas = () => (estreito ? [8, 46, 92] : [22, 56, 91]);
    let toca = 1;
    const xToca = (p) => pos.fundoX + (p / 100) * pos.fundoW;
    function medir() {
        const c = tela.getBoundingClientRect();
        W = c.width;
        H = c.height;
        estreito = W <= 900;
        const rel = (el, fy = 0.5) => {
            const r = el.getBoundingClientRect();
            return { x: r.left - c.left + r.width / 2, y: r.top - c.top + r.height * fy };
        };
        const f = $('.l-fundo').getBoundingClientRect();
        pos.fundoX = f.left - c.left;
        pos.fundoW = f.width;
        pos.dupla = rel(dupla, 0.3);
        pos.gato = rel(gato, 0.55);
        pos.ratoY = rel(rato).y;
        pos.l404 = rel($('.l-404'));
        const a = aranha.getBoundingClientRect();
        pos.aranhaX = a.left - c.left;
        pos.aranhaTopo = a.top - c.top;
        pos.aranhaFio = parseFloat(getComputedStyle(aranha).getPropertyValue('--fio')) || 96;
        // a lanterna varre só a área onde estão as coisas
        const caixas = [...itens, $('.l-estante')].map((el) => el.getBoundingClientRect());
        regiao = {
            x0: Math.max(16, Math.min(...caixas.map((r) => r.left)) - c.left - 20),
            x1: Math.min(W - 16, Math.max(...caixas.map((r) => r.right)) - c.left + 20),
            y0: Math.max(0, Math.min(...caixas.map((r) => r.top)) - c.top - 20),
            y1: Math.min(H, Math.max(...caixas.map((r) => r.bottom)) - c.top + 10),
        };
        rato.style.setProperty('--rx', `${tocas()[toca]}%`);
    }

    // ---------- A lanterna ----------
    const luz = { x: 0, y: 0 };
    const alvo = { x: 0, y: 0 };
    let modo = 'varrer';
    let dentro = false;
    let ultimoToque = 0;
    let aceso = false;
    let fim = false;
    let visivel = true;
    let rodando = false;
    let ultimo = 0;
    let t = 0;
    const raio = () => (estreito ? 105 : 150) * (tela.classList.contains('l-forte') ? 1.6 : 1);

    function pintar() {
        camadas.forEach((el) => {
            el.style.setProperty('--lx', `${luz.x.toFixed(1)}px`);
            el.style.setProperty('--ly', `${luz.y.toFixed(1)}px`);
        });
        reagir();
    }

    // ---------- Quem reage à luz ----------
    let gatoAcordado = calmo;
    let correndo = false;
    let aranhaEmCima = false;
    let aranhaRelogio;
    function fugir() {
        // vai para a toca mais longe da luz
        const xs = tocas().map(xToca);
        let melhor = toca;
        xs.forEach((x, i) => { if (Math.abs(x - luz.x) > Math.abs(xs[melhor] - luz.x)) melhor = i; });
        if (melhor === toca) return;
        rato.classList.toggle('vira', melhor < toca);
        toca = melhor;
        rato.style.setProperty('--rx', `${tocas()[toca]}%`);
        correndo = true;
        rato.classList.add('correndo');
        setTimeout(() => { correndo = false; rato.classList.remove('correndo'); reagir(); }, calmo ? 0 : 750);
    }
    function reagir() {
        const r = raio();
        const perto = (x, y, k) => !aceso && Math.hypot(x - luz.x, y - luz.y) < r * k;
        // os bonequinhos se abaixam quando a luz chega; no escuro, os olhos seguem a lanterna
        const d = pos.dupla;
        const abaixa = !fim && perto(d.x, d.y, 0.85);
        dupla.classList.toggle('escondida', abaixa);
        dupla.classList.toggle('olhando', !aceso && !abaixa && !fim);
        if (!aceso) {
            const ang = Math.atan2(luz.y - d.y, luz.x - d.x);
            dupla.style.setProperty('--px', `${(50 + Math.cos(ang) * 24).toFixed(1)}%`);
            dupla.style.setProperty('--py', `${(52 + Math.sin(ang) * 24).toFixed(1)}%`);
        }
        // o gato fecha os olhos com a luz; no escuro, de vez em quando abre
        gato.classList.toggle('olhando', !aceso && gatoAcordado && !perto(pos.gato.x, pos.gato.y, 0.9));
        // o rato foge
        if (!correndo && perto(xToca(tocas()[toca]), pos.ratoY, 1.05)) fugir();
        rato.classList.toggle('olhando', !aceso && !correndo && !perto(xToca(tocas()[toca]), pos.ratoY, 0.9));
        // a aranha sobe pelo fio e só desce quando a luz sai
        const ay = pos.aranhaTopo + (aranhaEmCima ? 16 : pos.aranhaFio) + 8;
        if (perto(pos.aranhaX, ay, 0.95)) {
            aranhaEmCima = true;
            aranha.classList.add('sobe');
            clearTimeout(aranhaRelogio);
            aranhaRelogio = setTimeout(() => { aranhaEmCima = false; aranha.classList.remove('sobe'); }, 2400);
        }
    }

    // ---------- O laço (só enquanto a sala está escura e na tela) ----------
    function quadro(agora) {
        if (!visivel || aceso) { rodando = false; return; }
        const dt = Math.min(0.05, (agora - ultimo) / 1000);
        ultimo = agora;
        t += dt;
        if (modo === 'mao' && !dentro && agora - ultimoToque > 4500) modo = 'varrer';
        if (modo === 'varrer') {
            const cx = (regiao.x0 + regiao.x1) / 2;
            const cy = (regiao.y0 + regiao.y1) / 2;
            alvo.x = cx + ((regiao.x1 - regiao.x0) / 2) * Math.sin(t * 0.42);
            alvo.y = cy + ((regiao.y1 - regiao.y0) / 2) * Math.sin(t * 0.69 + 0.8);
        }
        const k = 1 - (1 - (modo === 'varrer' ? 0.05 : 0.3)) ** (dt * 60);
        luz.x += (alvo.x - luz.x) * k;
        luz.y += (alvo.y - luz.y) * k;
        pintar();
        requestAnimationFrame(quadro);
    }
    function acordar() {
        if (calmo || aceso || rodando || !visivel) return;
        rodando = true;
        ultimo = performance.now();
        requestAnimationFrame(quadro);
    }
    function apontar(x, y, segurar) {
        alvo.x = x;
        alvo.y = y;
        modo = 'mao';
        dentro = segurar;
        ultimoToque = performance.now();
        if (calmo) { luz.x = x; luz.y = y; pintar(); }
        acordar();
    }

    tela.addEventListener('pointermove', (ev) => {
        const c = tela.getBoundingClientRect();
        apontar(ev.clientX - c.left, ev.clientY - c.top, ev.pointerType !== 'touch');
    });
    tela.addEventListener('pointerdown', (ev) => {
        const c = tela.getBoundingClientRect();
        apontar(ev.clientX - c.left, ev.clientY - c.top, ev.pointerType !== 'touch');
        // no toque a luz pula direto para o dedo
        if (ev.pointerType === 'touch') { luz.x = alvo.x; luz.y = alvo.y; pintar(); }
    });
    tela.addEventListener('pointerleave', () => { dentro = false; ultimoToque = performance.now(); });
    // no teclado, a luz vai até a coisa que recebeu o foco
    tela.addEventListener('focusin', (ev) => {
        const el = ev.target.closest('[data-achado], [data-l-interruptor]');
        if (!el) return;
        const c = tela.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        apontar(r.left - c.left + r.width / 2, r.top - c.top + r.height / 2, true);
    });
    tela.addEventListener('focusout', () => { dentro = false; ultimoToque = performance.now(); });

    // ---------- Achados ----------
    const achados = new Set();
    let balaoRelogio;
    function mostrarBalao(el, texto, ms = 4800) {
        const c = tela.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        balao.textContent = texto;
        const meia = balao.offsetWidth / 2;
        const cx = r.left - c.left + r.width / 2;
        const x = limitar(cx, meia + 12, W - meia - 12);
        const embaixo = r.top - c.top < 170;
        balao.style.setProperty('--bx', `${x}px`);
        balao.style.setProperty('--by', `${embaixo ? r.bottom - c.top : r.top - c.top}px`);
        balao.style.setProperty('--cauda', `${limitar(cx - x, -meia + 18, meia - 18)}px`);
        balao.classList.toggle('baixo', embaixo);
        balao.classList.remove('on');
        void balao.offsetWidth;
        balao.classList.add('on');
        clearTimeout(balaoRelogio);
        balaoRelogio = setTimeout(() => balao.classList.remove('on'), ms);
    }
    function achar(el) {
        const id = el.dataset.achado;
        const novo = !achados.has(id);
        achados.add(id);
        if (id === 'pilha') { tela.classList.add('l-forte'); el.classList.add('pego'); }
        mostrarBalao(el, TEXTOS[id]);
        aviso.textContent = `${TEXTOS[id]} ${achados.size} de ${itens.length} coisas achadas.`;
        if (novo && achados.size === itens.length) setTimeout(final, 1800);
    }
    itens.forEach((el) => el.addEventListener('click', () => achar(el)));
    function final() {
        fim = true;
        tela.classList.add('l-fim');
        acender(true);
        setTimeout(() => {
            mostrarBalao(dupla, 'Você achou tudo! Agora sim: bora voltar?', 7000);
            aviso.textContent = 'Você achou as sete coisas. A luz acendeu.';
        }, 900);
    }

    // ---------- A luz do teto ----------
    function acender(ligar) {
        aceso = ligar;
        tela.classList.toggle('acesa', ligar);
        interruptor.setAttribute('aria-pressed', String(ligar));
        if (ligar && !calmo) {
            tela.classList.remove('piscando');
            void tela.offsetWidth;
            tela.classList.add('piscando');
            setTimeout(() => tela.classList.remove('piscando'), 1000);
        }
        reagir();
        if (!ligar) acordar();
    }
    interruptor.addEventListener('click', () => acender(!aceso));

    // o anel do cursor do site não vira bola laranja em cima das coisas do depósito (cobriria o que achou)
    const anel = document.querySelector('.cursor-anel');
    if (anel) document.addEventListener('pointerover', (ev) => { if (ev.target.closest('.l-fundo')) anel.classList.remove('ativo'); });

    // o gato abre e fecha os olhos no escuro
    if (!calmo) {
        const piscarGato = () => {
            gatoAcordado = !gatoAcordado;
            reagir();
            setTimeout(piscarGato, gatoAcordado ? 2600 : 3800);
        };
        setTimeout(piscarGato, 1200);
    }

    // ---------- Começo ----------
    medir();
    luz.x = alvo.x = pos.l404.x;
    luz.y = alvo.y = pos.l404.y;
    pintar();
    if (!calmo) {
        tela.classList.add('ligando');
        setTimeout(() => tela.classList.remove('ligando'), 1400);
    }
    new ResizeObserver(() => { medir(); reagir(); }).observe(tela);
    new IntersectionObserver(([item]) => {
        visivel = item.isIntersecting;
        if (visivel) acordar();
    }).observe(tela);
})();
