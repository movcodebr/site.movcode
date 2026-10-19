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
