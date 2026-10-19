/* -------------------------------------------------------------------------
   MovCode — /criacao-de-sites
   Topo: o nome e o tipo do negócio montam o site de exemplo na hora, no
   navegador e no celular, com a cor do tipo e o endereço se digitando.
   Enquanto ninguém mexe, os tipos se revezam sozinhos; ao mexer, param.
   Sem JS fica a barbearia, que é o exemplo padrão da /sua-pagina.
------------------------------------------------------------------------- */
(() => {
    const topo = document.querySelector('[data-topo]');
    if (!topo) return;
    const ICONE = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
    // nomes, títulos, botões e preços de exemplo são os mesmos da /sua-pagina; cor = nome da cor lá
    const TIPOS = {
        barbearia: {
            cor: 'laranja', ac: '#FF5A1F', suave: '#FFE4D8', texto: '#B53A0A', on: '#1A0800',
            nome: 'Barbearia do João', titulo: 'Corte e barba no seu horário.', cta: 'Agendar pelo WhatsApp', curto: 'Agendar',
            precos: [['Corte', 'R$ 40'], ['Barba', 'R$ 30'], ['Corte + barba', 'R$ 60']],
            icone: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/>'
        },
        petshop: {
            cor: 'verde', ac: '#15803D', suave: '#DDF1E4', texto: '#15803D', on: '#FFFFFF',
            nome: 'Pet Feliz', titulo: 'Banho e tosa com carinho.', cta: 'Agendar banho e tosa', curto: 'Agendar',
            precos: [['Banho', 'R$ 50'], ['Banho e tosa', 'R$ 80'], ['Tosa higiênica', 'R$ 35']],
            icone: '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>'
        },
        estetica: {
            cor: 'rosa', ac: '#E0457B', suave: '#FCE3EC', texto: '#B42A5C', on: '#FFFFFF',
            nome: 'Clínica Bem Estar', titulo: 'Cuidado com você, do jeito certo.', cta: 'Agendar avaliação', curto: 'Agendar',
            precos: [['Limpeza de pele', 'R$ 150'], ['Drenagem', 'R$ 120'], ['Peeling', 'R$ 180']],
            icone: '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96l-6.14 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/>'
        },
        oficina: {
            cor: 'azul', ac: '#2563EB', suave: '#DFE8FD', texto: '#1D4ED8', on: '#FFFFFF',
            nome: 'Auto Center Silva', titulo: 'Seu carro nas mãos de quem entende.', cta: 'Pedir orçamento', curto: 'Orçamento',
            precos: [['Troca de óleo', 'R$ 150'], ['Revisão', 'R$ 250'], ['Diagnóstico', 'R$ 80']],
            icone: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'
        },
        pilates: {
            cor: 'roxo', ac: '#7C3AED', suave: '#EDE4FD', texto: '#6D28D9', on: '#FFFFFF',
            nome: 'Studio Movimento', titulo: 'Pilates com atenção de verdade.', cta: 'Agendar aula experimental', curto: 'Agendar',
            precos: [['1x por semana', 'R$ 220'], ['2x por semana', 'R$ 320'], ['3x por semana', 'R$ 420']],
            icone: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'
        }
    };
    const ORDEM = Object.keys(TIPOS);
    const campo = topo.querySelector('[data-nome]');
    const botoes = [...topo.querySelectorAll('[data-tipo]')];
    const montar = topo.querySelector('[data-montar]');
    const whats = topo.querySelector('[data-whatsapp]');
    const msgWhats = whats?.dataset.whatsapp || '';
    const todos = (sel, fn) => topo.querySelectorAll(sel).forEach(fn);
    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let tipo = 'barbearia';

    const digitado = () => campo.value.trim();
    const nomeAtual = () => digitado() || TIPOS[tipo].nome;
    // "Barbearia do João" vira barbeariadojoao.com.br
    const dominio = (n) => (n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '') || 'seunegocio') + '.com.br';

    let digitando;
    function escreverEndereco(animar) {
        const texto = dominio(nomeAtual());
        clearInterval(digitando);
        if (!animar || calmo) { todos('[data-dominio]', (b) => { b.textContent = texto; b.classList.remove('s-digitando'); }); return; }
        let n = 0;
        todos('[data-dominio]', (b) => { b.textContent = ''; b.classList.add('s-digitando'); });
        digitando = setInterval(() => {
            n += 1;
            todos('[data-dominio]', (b) => { b.textContent = texto.slice(0, n); });
            if (n >= texto.length) {
                clearInterval(digitando);
                digitando = setTimeout(() => todos('[data-dominio]', (b) => b.classList.remove('s-digitando')), 1200);
            }
        }, 45);
    }

    function escreverNome() {
        const n = nomeAtual();
        todos('[data-nome-site]', (el) => { el.textContent = n; });
        const letra = (n.match(/[\p{L}\p{N}]/u) || ['S'])[0].toUpperCase();
        todos('[data-letra]', (el) => { el.textContent = letra; });
        // os botões já levam o que a pessoa escolheu: o montador abre com o tipo, a cor e o nome
        const q = new URLSearchParams({ nicho: tipo, cor: TIPOS[tipo].cor });
        if (digitado()) q.set('nome', digitado());
        montar.href = `/sua-pagina?${q}`;
        if (whats && typeof window.linkWhatsapp === 'function') {
            whats.href = window.linkWhatsapp(digitado() ? `${msgWhats} O negócio se chama ${digitado()}.` : msgWhats);
        }
    }

    function aplicar(novo, animar) {
        tipo = novo;
        const t = TIPOS[tipo];
        botoes.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tipo === tipo)));
        campo.placeholder = t.nome;
        // a cor passa suave (as variáveis são registradas no CSS); os textos somem e voltam já trocados
        [['--s-ac', t.ac], ['--s-ac-suave', t.suave], ['--s-ac-texto', t.texto], ['--s-ac-on', t.on]].forEach(([k, v]) => topo.style.setProperty(k, v));
        const trocar = () => {
            todos('[data-titulo]', (el) => { el.textContent = t.titulo; });
            todos('[data-botao-site]', (el) => { el.textContent = t.cta; });
            todos('[data-curto]', (el) => { el.textContent = t.curto; });
            todos('[data-preco]', (el) => { const [nome, valor] = t.precos[+el.dataset.preco]; el.children[0].textContent = nome; el.children[1].textContent = valor; });
            todos('[data-icone]', (el) => { el.innerHTML = ICONE(t.icone); });
            escreverNome();
            topo.classList.remove('trocando');
        };
        escreverEndereco(animar);
        if (animar && !calmo) { topo.classList.add('trocando'); setTimeout(trocar, 200); } else trocar();
    }

    // revezamento sozinho enquanto o topo está na tela e ninguém mexeu
    let roda;
    let parado = calmo;
    let visivel = true;
    function girar() {
        clearInterval(roda);
        if (parado || !visivel || document.hidden) return;
        roda = setInterval(() => aplicar(ORDEM[(ORDEM.indexOf(tipo) + 1) % ORDEM.length], true), 3800);
    }
    const parar = () => { parado = true; clearInterval(roda); };
    new IntersectionObserver(([item]) => { visivel = item.isIntersecting; girar(); }).observe(topo);
    document.addEventListener('visibilitychange', girar);

    campo.addEventListener('focus', parar);
    campo.addEventListener('input', () => { parar(); escreverNome(); escreverEndereco(false); });
    campo.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') campo.blur(); });
    botoes.forEach((b) => b.addEventListener('click', () => { parar(); if (b.dataset.tipo !== tipo) aplicar(b.dataset.tipo, true); }));

    // a cena inclina de leve para o lado do mouse
    const cena = topo.querySelector('.s-cena');
    if (cena && !calmo && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        topo.addEventListener('pointermove', (ev) => {
            const r = topo.getBoundingClientRect();
            cena.style.setProperty('--mx', (((ev.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
            cena.style.setProperty('--my', (((ev.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
        });
        topo.addEventListener('pointerleave', () => { cena.style.setProperty('--mx', '0'); cena.style.setProperty('--my', '0'); });
    }

    escreverNome();
    setTimeout(() => escreverEndereco(true), 500);
})();

/* -------------------------------------------------------------------------
   Anatomia de um site que vende: o passo que está no meio da tela acende a
   parte correspondente do site de exemplo no celular, e a tela do celular
   rola até ela. Sem JS (ou sem IntersectionObserver), tudo fica visível.
------------------------------------------------------------------------- */
(() => {
    const mock = document.querySelector('[data-mock]');
    const passos = [...document.querySelectorAll('.s-passo')];
    if (!mock || !passos.length || !('IntersectionObserver' in window)) return;
    const rola = mock.querySelector('[data-rola]');
    const tela = mock.querySelector('.s-tel-tela');
    const palco = mock.closest('.s-anatomia-palco');
    const grade = mock.closest('.s-anatomia-grade');
    const topo = document.querySelector('.topo');
    // mesma regra do CSS: em tela em pé o aparelho fica preso no alto e os passos passam embaixo
    const empilhado = window.matchMedia('(max-width: 1080px) and (orientation: portrait)');

    function ativar(n) {
        mock.dataset.ativo = n;
        passos.forEach((p) => p.classList.toggle('ativo', p.dataset.passo === n));
        // leva a parte acesa para dentro da tela (o WhatsApp e a busca não pedem rolagem)
        const parte = rola.querySelector(`[data-parte="${n}"]`);
        if (!parte) return;
        const max = Math.max(0, rola.offsetHeight - tela.clientHeight);
        const y = Math.min(max, Math.max(0, parte.offsetTop - tela.clientHeight * 0.16));
        rola.style.transform = `translateY(${-y}px)`;
    }

    let observador;
    function observar() {
        observador?.disconnect();
        // lado a lado vale a faixa do meio da tela; empilhado, uma faixa logo abaixo do aparelho preso no alto
        let faixa = '-45% 0px -45% 0px';
        if (empilhado.matches) {
            // uma linha no meio do espaço que sobra abaixo do aparelho: acende o passo que passa por ela
            const meio = Math.round(palco.offsetHeight + (innerHeight - palco.offsetHeight) / 2);
            faixa = `-${meio}px 0px -${Math.max(0, innerHeight - meio - 1)}px 0px`;
        }
        observador = new IntersectionObserver((itens) => {
            itens.forEach((item) => { if (item.isIntersecting) ativar(item.target.dataset.passo); });
        }, { rootMargin: faixa });
        passos.forEach((p) => observador.observe(p));
    }
    // empilhado: marca quando o aparelho está preso no alto, para ele descer junto quando a cápsula do menu volta
    function prender() {
        const g = grade.getBoundingClientRect();
        palco.classList.toggle('preso', empilhado.matches && g.top < 0 && g.bottom > palco.offsetHeight + 100);
        if (topo) palco.style.setProperty('--desce', `${topo.offsetTop + topo.offsetHeight - 6}px`);
    }
    let quadro;
    window.addEventListener('scroll', () => { quadro ||= requestAnimationFrame(() => { quadro = 0; prender(); }); }, { passive: true });

    observar();
    prender();
    empilhado.addEventListener('change', () => { observar(); prender(); });
    // a altura do aparelho segue a da tela: refaz a faixa quando a janela muda de tamanho
    let espera;
    window.addEventListener('resize', () => { clearTimeout(espera); espera = setTimeout(() => { observar(); prender(); }, 200); });
    ativar('1');
})();
