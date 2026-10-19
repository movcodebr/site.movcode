/* -------------------------------------------------------------------------
   MovCode — /produtos
   O celular do topo abre um app de cada vez (o app cresce a partir do
   ícone) e cada demonstração anda passo a passo enquanto está na tela.
   Sem JS ou com movimento reduzido: a tela inicial parada e as
   demonstrações já no último passo.
------------------------------------------------------------------------- */
(() => {
    if (!('IntersectionObserver' in window)) return;
    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const espera = (ms) => new Promise((ok) => { setTimeout(ok, ms); });

    // ---------- Topo: o celular abrindo um app de cada vez ----------
    const tela = document.querySelector('[data-pr-tela]');
    if (tela && !calmo) {
        const apps = [...tela.querySelectorAll('[data-pr-app]')];
        const splashes = [...tela.querySelectorAll('[data-pr-splash]')];
        let visivel = false;
        let vez = 0;
        // o app abre a partir do próprio ícone
        const origem = (k) => {
            const i = apps[k].querySelector('.pr-icone').getBoundingClientRect();
            const t = tela.getBoundingClientRect();
            splashes[k].style.setProperty('--ox', `${(((i.left + i.width / 2) - t.left) / t.width * 100).toFixed(1)}%`);
            splashes[k].style.setProperty('--oy', `${(((i.top + i.height / 2) - t.top) / t.height * 100).toFixed(1)}%`);
        };
        async function ciclo() {
            const minha = ++vez;
            const vivo = () => visivel && minha === vez;
            for (let k = 0; vivo(); k = (k + 1) % apps.length) {
                origem(k);
                apps[k].classList.add('tocando');
                await espera(260);
                apps[k].classList.remove('tocando');
                if (!vivo()) return;
                splashes[k].classList.add('aberto');
                await espera(2400);
                splashes[k].classList.remove('aberto');
                if (!vivo()) return;
                await espera(900);
            }
        }
        new IntersectionObserver(([item]) => {
            visivel = item.isIntersecting;
            if (visivel) {
                setTimeout(() => { if (visivel) ciclo(); }, 700);
            } else {
                vez += 1;
                splashes.forEach((s) => s.classList.remove('aberto'));
                apps.forEach((a) => a.classList.remove('tocando'));
            }
        }, { threshold: 0.4 }).observe(tela);
    }

    // ---------- As demonstrações: cada peça aparece no seu passo (data-ve) ----------
    document.querySelectorAll('[data-pr-cena]').forEach((cena) => {
        const pecas = [...cena.querySelectorAll('[data-ve]')];
        const total = Number(cena.dataset.passos);
        const mostrar = (p) => {
            cena.dataset.passo = String(p);
            pecas.forEach((el) => el.classList.toggle('ve', Number(el.dataset.ve) <= p));
        };
        if (calmo) { mostrar(total - 1); return; }
        cena.classList.add('anima');
        mostrar(0);
        let visivel = false;
        let vez = 0;
        async function ciclo() {
            const minha = ++vez;
            const vivo = () => visivel && minha === vez;
            while (vivo()) {
                for (let p = 0; p < total; p += 1) {
                    mostrar(p);
                    await espera(p === 0 ? 900 : 1500);
                    if (!vivo()) return;
                }
                await espera(2600);
                if (!vivo()) return;
                mostrar(0);
                await espera(600);
            }
        }
        new IntersectionObserver(([item]) => {
            visivel = item.isIntersecting;
            if (visivel) ciclo(); else vez += 1;
        }, { threshold: 0.35 }).observe(cena);
    });
})();
