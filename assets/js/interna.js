/* -------------------------------------------------------------------------
   Paginas internas no estilo da home. O home.js (carregado antes) cuida
   do que e comum: titulos, faixa, conversa, cartoes, passos, contato,
   cursor e rolagem suave. Aqui ficam so as pecas proprias das internas.
   Sem GSAP ou com movimento reduzido, nada roda e tudo fica estatico.
------------------------------------------------------------------------- */
(() => {
    const html = document.documentElement;
    if (!html.classList.contains('anima') || !window.gsap || !window.ScrollTrigger) {
        html.classList.remove('anima-pre');
        return;
    }
    const { gsap, ScrollTrigger } = window;

    // ---------- Topo: rotulo, texto, botoes e visual entram em sequencia ----------
    const pecas = gsap.utils.toArray('.i-entra');
    if (pecas.length) {
        gsap.fromTo(pecas, { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', stagger: 0.1, delay: 0.25 });
    }

    // Diagnostico: o jeito em destaque troca sozinho (chamada, presencial, mensagem)
    // e a pauta do convite se marca item por item
    const convite = document.querySelector('.i-convite');
    if (convite) {
        const itens = convite.querySelectorAll('.i-convite-pauta li');
        itens.forEach((li) => li.classList.add('pendente'));
        const tl = gsap.timeline({ delay: 1.1 });
        itens.forEach((li, i) => tl.call(() => li.classList.remove('pendente'), null, 0.4 + i * 0.7));
        const jeitos = convite.querySelectorAll('.i-convite-formatos span');
        let atual = 0;
        jeitos[0].classList.add('ativo');
        setInterval(() => {
            if (document.hidden) return;
            jeitos[atual].classList.remove('ativo');
            atual = (atual + 1) % jeitos.length;
            jeitos[atual].classList.add('ativo');
        }, 1600);
    }
    const entregas = gsap.utils.toArray('.i-entrega');
    if (entregas.length) {
        gsap.from(entregas, { y: 40, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, clearProps: 'transform', scrollTrigger: { trigger: '.i-entregas-grade', start: 'top 82%' } });
    }

    // Avisos do painel laranja chegando um por um, como notificacoes
    const avisos = gsap.utils.toArray('.i-fluxo .i-aviso');
    if (avisos.length) {
        gsap.fromTo(avisos, { x: -28, autoAlpha: 0, scale: 0.96 }, {
            x: 0, autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)', stagger: 0.45, delay: 0.9
        });
    }

    // Barras do painel subindo
    const barras = gsap.utils.toArray('.i-barras span');
    if (barras.length) {
        gsap.fromTo(barras, { scaleY: 0 }, { scaleY: 1, duration: 1, ease: 'power3.out', stagger: 0.08, delay: 0.8 });
        gsap.fromTo('.i-meta-linha', { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: 1, ease: 'power2.inOut', delay: 1.4 });
    }

    // Simbolo grande do Sobre: as duas pessoas se montam, como na abertura da home
    const simbolo = document.querySelector('.i-simbolo .duo');
    if (simbolo) {
        gsap.timeline({ delay: 0.3 })
            .from(simbolo.querySelectorAll('b:last-child'), { yPercent: 160, autoAlpha: 0, duration: 0.7, ease: 'back.out(1.7)', stagger: 0.12 })
            .from(simbolo.querySelectorAll('b:first-child'), { yPercent: -260, autoAlpha: 0, duration: 0.8, ease: 'bounce.out', stagger: 0.12 }, 0.3);
    }

    // ---------- Listas grandes e pontos de seguranca entram ao rolar ----------
    gsap.utils.toArray('.i-lista .h-lista, .i-trio-grade').forEach((grupo) => {
        gsap.from(grupo.children, {
            y: 40, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
            scrollTrigger: { trigger: grupo, start: 'top 82%' }
        });
    });

    // ---------- Sobre: "movii" vira "MovCode." enquanto a historia passa ----------
    const origem = document.querySelector('.i-origem-palco');
    if (origem) {
        const legendas = gsap.utils.toArray('.i-origem-legendas li');
        const contador = origem.querySelector('.i-origem-num b');
        // Mesmo efeito das palavras da escala na home: sobe saindo do desfoque
        // (as duas palavras ficam centradas com xPercent/yPercent -50)
        gsap.set(['.i-origem-antes', '.i-origem-depois'], { xPercent: -50, yPercent: -50 });
        gsap.set('.i-origem-depois', { yPercent: -15, autoAlpha: 0, filter: 'blur(14px)' });
        gsap.set(legendas.slice(1), { autoAlpha: 0, y: 28 });
        const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: origem, start: 'top top', end: '+=' + legendas.length * 90 + '%', pin: true, scrub: 0.8, anticipatePin: 1,
                // O contador acompanha a frase que esta na tela
                onUpdate: (st) => {
                    const agora = st.progress * tl.duration();
                    contador.textContent = String(1 + entradas.filter((t) => agora >= t).length).padStart(2, '0');
                }
            }
        });
        // Uma frase sai subindo e a proxima entra por baixo, nunca as duas juntas
        const entradas = [];
        const troca = (i, em) => entradas.push(em + 0.14) && tl
            .to(legendas[i - 1], { autoAlpha: 0, y: -28, duration: 0.18, ease: 'power1.in' }, em)
            .fromTo(legendas[i], { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.22, ease: 'power2.out', immediateRender: false }, em + 0.14);
        troca(1, 0.75);
        // O "ii" cai, "movii" se desfaz e "MovCode." sobe no lugar
        tl.to('.i-origem-ii', { yPercent: 160, rotation: 28, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 1.55)
            .to('.i-origem-antes', { yPercent: -85, autoAlpha: 0, filter: 'blur(14px)', duration: 0.24, ease: 'power2.in' }, 1.95)
            .to('.i-origem-depois', { yPercent: -50, autoAlpha: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power3.out' }, 2.15);
        troca(2, 1.95);
        troca(3, 2.95);
        tl.to('.i-origem-progresso i', { scaleX: 1, duration: 3.6 }, 0);
    }

    // Quem faz: os paineis entram e as figuras sobem de baixo do cartao
    const pessoas = gsap.utils.toArray('.i-pessoa');
    if (pessoas.length) {
        const gatilho = { trigger: '.i-pessoas-grade', start: 'top 80%' };
        gsap.from(pessoas, { y: 48, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.15, scrollTrigger: gatilho });
        gsap.from('.i-pessoa .i-figura', { yPercent: 70, duration: 1.1, ease: 'back.out(1.5)', stagger: 0.15, delay: 0.25, clearProps: 'transform', scrollTrigger: gatilho });
    }

    // No que a gente acredita: a frase grande sai do desfoque
    const frase = document.querySelector('.i-acredita-frase');
    if (frase) {
        gsap.from(frase, { yPercent: 16, autoAlpha: 0, filter: 'blur(12px)', duration: 1.1, ease: 'power3.out', clearProps: 'filter', scrollTrigger: { trigger: frase, start: 'top 80%' } });
        gsap.from('.i-acredita-texto p', { y: 32, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: '.i-acredita-texto', start: 'top 85%' } });
    }

    // ---------- Faixa final laranja: titulo letra por letra ----------
    const chamada = document.querySelector('.i-chamada-titulo');
    if (chamada) {
        gsap.from(chamada, { yPercent: 30, autoAlpha: 0, filter: 'blur(12px)', duration: 1.1, ease: 'power3.out', clearProps: 'filter', scrollTrigger: { trigger: chamada.closest('section'), start: 'top 75%' } });
    }

    // ---------- Artigo: barra de leitura e intertitulos ----------
    const artigo = document.querySelector('.i-artigo article');
    const barra = document.querySelector('.i-progresso');
    if (artigo && barra) {
        gsap.to(barra, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: artigo, start: 'top 30%', end: 'bottom 70%', scrub: true } });
    }
    gsap.utils.toArray('.i-artigo h2').forEach((titulo) => {
        gsap.from(titulo, { y: 24, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: titulo, start: 'top 88%' } });
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();

// Politica e Termos: o indice "Nesta pagina" marca a secao que esta sendo lida
// (fora do bloco acima: funciona tambem sem animacao)
(() => {
    const links = [...document.querySelectorAll('.i-legal-indice a')];
    if (!links.length) return;
    const secoes = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
    let atual = null;
    let pedido = false;
    const medir = () => {
        pedido = false;
        let id = secoes[0]?.id;
        secoes.forEach((s) => { if (s.getBoundingClientRect().top < window.innerHeight * 0.35) id = s.id; });
        if (id === atual) return;
        atual = id;
        links.forEach((a) => {
            const lendo = a.hash === `#${id}`;
            a.classList.toggle('ativo', lendo);
            if (lendo) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
    };
    window.addEventListener('scroll', () => { if (!pedido) { pedido = true; requestAnimationFrame(medir); } }, { passive: true });
    medir();
})();
