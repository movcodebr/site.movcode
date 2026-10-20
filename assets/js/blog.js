/* -------------------------------------------------------------------------
   MovCode — blog: o sumário "Neste guia" marca o trecho que está sendo lido
------------------------------------------------------------------------- */
(() => {
    const links = [...document.querySelectorAll('.bl-indice a')];
    if (!links.length) return;
    const titulos = links.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);
    let atual = null;
    let pedido = false;
    const medir = () => {
        pedido = false;
        let id = titulos[0]?.id;
        titulos.forEach((h) => { if (h.getBoundingClientRect().top < window.innerHeight * 0.35) id = h.id; });
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
