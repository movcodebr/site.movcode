/* -------------------------------------------------------------------------
   MovCode — /criacao-de-sites
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
    const celular = window.matchMedia('(max-width: 1080px)');

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
        // no computador vale a faixa do meio da tela; no celular, a faixa logo abaixo do aparelho preso no alto
        const faixa = celular.matches ? '-62% 0px -22% 0px' : '-45% 0px -45% 0px';
        observador = new IntersectionObserver((itens) => {
            itens.forEach((item) => { if (item.isIntersecting) ativar(item.target.dataset.passo); });
        }, { rootMargin: faixa });
        passos.forEach((p) => observador.observe(p));
    }
    observar();
    celular.addEventListener('change', observar);
    ativar('1');
})();
