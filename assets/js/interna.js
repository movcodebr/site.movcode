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

    // ---------- Manifesto: cada palavra acende conforme a rolagem ----------
    gsap.utils.toArray('.i-manifesto p').forEach((paragrafo) => {
        paragrafo.setAttribute('aria-label', paragrafo.textContent.trim());
        const palavras = paragrafo.textContent.trim().split(/\s+/);
        paragrafo.innerHTML = '';
        palavras.forEach((palavra, i) => {
            const span = document.createElement('span');
            span.className = 'i-palavra';
            span.setAttribute('aria-hidden', 'true');
            span.textContent = palavra;
            paragrafo.appendChild(span);
            if (i < palavras.length - 1) paragrafo.appendChild(document.createTextNode(' '));
        });
        gsap.fromTo(paragrafo.querySelectorAll('.i-palavra'), { opacity: 0.14 }, {
            opacity: 1,
            ease: 'none',
            stagger: 0.1,
            scrollTrigger: { trigger: paragrafo, start: 'top 80%', end: 'bottom 45%', scrub: true }
        });
    });

    // ---------- Listas grandes e pontos de seguranca entram ao rolar ----------
    gsap.utils.toArray('.i-lista .h-lista, .i-trio-grade').forEach((grupo) => {
        gsap.from(grupo.children, {
            y: 40, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
            scrollTrigger: { trigger: grupo, start: 'top 82%' }
        });
    });

    // ---------- Sobre: linha do tempo, pessoas e o nome ----------
    const trilho = document.querySelector('.i-tempo-trilho i');
    if (trilho) {
        gsap.fromTo(trilho, { scaleY: 0 }, {
            scaleY: 1, ease: 'none',
            scrollTrigger: { trigger: '.i-tempo-caixa', start: 'top 70%', end: 'bottom 70%', scrub: true }
        });
    }
    gsap.utils.toArray('.i-marco, .i-historia-texto p').forEach((item) => {
        gsap.from(item, { y: 32, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 86%' } });
    });
    const pessoas = gsap.utils.toArray('.i-pessoa');
    if (pessoas.length) {
        gsap.from(pessoas, { y: 48, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.15, scrollTrigger: { trigger: '.i-pessoas-grade', start: 'top 82%' } });
    }
    // movii perde o "ii" e vira MovCode
    const nomeVisual = document.querySelector('.i-nome-visual');
    if (nomeVisual) {
        gsap.timeline({ scrollTrigger: { trigger: nomeVisual, start: 'top 78%' } })
            .from('.i-nome-antes', { y: 30, autoAlpha: 0, duration: 0.7, ease: 'power3.out' })
            .from('.i-nome-antes s', { textDecorationColor: 'rgba(255, 90, 31, 0)', duration: 0.5 }, '+=0.15')
            .from('.i-nome-depois', { y: 40, autoAlpha: 0, filter: 'blur(10px)', duration: 0.9, ease: 'power3.out', clearProps: 'filter' }, '-=0.1');
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
