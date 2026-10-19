/* -------------------------------------------------------------------------
   MovCode — telas de Em breve (ForBarber, ForCondom e Pratuca)
   A cena acompanha o mouse, cada peça na sua profundidade (data-eb-fundo),
   e cada app tem um toque escondido: o poste gira mais rápido, a janela
   acende e apaga, a tampa da marmita pula e solta vapor.
------------------------------------------------------------------------- */
(() => {
    const tela = document.querySelector('[data-eb]');
    if (!tela) return;
    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    tela.querySelectorAll('[data-eb-fundo]').forEach((el) => el.style.setProperty('--f', el.dataset.ebFundo));

    if (!calmo && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        let mx = 0;
        let my = 0;
        let ax = 0;
        let ay = 0;
        let rodando = false;
        const passo = () => {
            ax += (mx - ax) * 0.08;
            ay += (my - ay) * 0.08;
            tela.style.setProperty('--mx', ax.toFixed(3));
            tela.style.setProperty('--my', ay.toFixed(3));
            if (Math.abs(mx - ax) > 0.001 || Math.abs(my - ay) > 0.001) requestAnimationFrame(passo);
            else rodando = false;
        };
        const mexer = () => { if (!rodando) { rodando = true; requestAnimationFrame(passo); } };
        tela.addEventListener('pointermove', (e) => {
            const r = tela.getBoundingClientRect();
            mx = ((e.clientX - r.left) / r.width) * 2 - 1;
            my = ((e.clientY - r.top) / r.height) * 2 - 1;
            mexer();
        });
        tela.addEventListener('pointerleave', () => { mx = 0; my = 0; mexer(); });
    }

    // ForBarber: o poste gira mais rápido por um tempo
    const poste = tela.querySelector('[data-eb-poste]');
    let parar;
    poste?.addEventListener('click', () => {
        poste.classList.add('rapido');
        clearTimeout(parar);
        parar = setTimeout(() => poste.classList.remove('rapido'), 2400);
    });

    // ForCondom: a janela acende e apaga
    tela.querySelectorAll('.eb-janela').forEach((janela) => janela.addEventListener('click', () => janela.classList.toggle('acesa')));

    // Pratuca: a tampa pula e sai uma nuvem de vapor
    const panela = tela.querySelector('[data-eb-panela]');
    let fechar;
    panela?.addEventListener('click', () => {
        panela.classList.remove('puf');
        void panela.offsetWidth;
        panela.classList.add('puf');
        clearTimeout(fechar);
        fechar = setTimeout(() => panela.classList.remove('puf'), 1000);
    });
})();
