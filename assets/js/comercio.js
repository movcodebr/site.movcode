/* -------------------------------------------------------------------------
   MovCode — /sistema-para-mercadinho
   Sem JS (ou com movimento reduzido) tudo aparece pronto e parado.
------------------------------------------------------------------------- */
(() => {
    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calmo || !('IntersectionObserver' in window)) return;

    // ---------- Topo: a leitura passa pelo caderno e cada linha vira uma peça do sistema ----------
    const palco = document.querySelector('[data-palco]');
    if (palco) {
        const leitura = palco.querySelector('.c-leitura');
        const linhas = [...palco.querySelectorAll('[data-linha]')];
        const total = palco.querySelector('[data-total]');
        const valorTotal = total ? parseFloat(total.textContent.replace(/[^\d,]/g, '').replace(',', '.')) : 0;
        const real = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        palco.classList.add('c-anima');
        let passo = 0;
        let espera;
        let rodando = false;

        // o "a receber" sobe até o valor quando a última conta do fiado entra
        function contar() {
            const t0 = performance.now();
            const quadro = (agora) => {
                const p = Math.min(1, (agora - t0) / 700);
                total.textContent = real(valorTotal * (1 - (1 - p) ** 3));
                if (p < 1 && rodando) requestAnimationFrame(quadro);
            };
            requestAnimationFrame(quadro);
        }
        function limpar() {
            palco.querySelectorAll('.on').forEach((el) => el.classList.remove('on'));
            linhas.forEach((li) => li.classList.remove('lido'));
            passo = 0;
        }
        function proximo() {
            if (!rodando) return;
            if (passo >= linhas.length) {
                // fim da folha: segura um pouco e recomeça do zero
                espera = setTimeout(() => { leitura.classList.remove('on'); limpar(); espera = setTimeout(proximo, 900); }, 3200);
                return;
            }
            const li = linhas[passo];
            leitura.classList.add('on');
            leitura.style.top = `${li.offsetTop + li.offsetHeight * 0.62}px`;
            espera = setTimeout(() => {
                li.classList.add('lido');
                palco.querySelectorAll(`[data-peca="${li.dataset.linha}"]`).forEach((el) => el.classList.add('on'));
                if (total && li.dataset.linha === total.closest('[data-peca]')?.dataset.peca) contar();
                passo += 1;
                espera = setTimeout(proximo, 750);
            }, 420);
        }
        // só roda com o topo na tela; ao sair, para e volta para o começo da folha
        new IntersectionObserver(([item]) => {
            if (item.isIntersecting && !rodando) { rodando = true; espera = setTimeout(proximo, 700); }
            if (!item.isIntersecting && rodando) { rodando = false; clearTimeout(espera); leitura.classList.remove('on'); limpar(); }
        }).observe(palco);
    }

    // ---------- Um dia no balcão: o momento no meio da tela muda o relógio e o céu ----------
    const dia = document.querySelector('[data-dia]');
    if (dia) {
        const momentos = [...dia.querySelectorAll('.c-momento')];
        const relogio = dia.querySelector('.c-relogio');
        const hora = dia.querySelector('[data-hora-grande]');
        const rotulo = dia.querySelector('[data-rotulo-grande]');
        dia.classList.add('anima');
        let atual;
        let vez = 0;
        function ativar(m) {
            if (m === atual) return;
            atual = m;
            dia.dataset.ceu = m.dataset.ceu;
            momentos.forEach((x) => x.classList.toggle('ativo', x === m));
            const minha = ++vez;
            relogio.classList.remove('entrando');
            relogio.classList.add('trocando');
            setTimeout(() => {
                if (minha !== vez) return;
                hora.textContent = m.dataset.hora;
                rotulo.textContent = m.dataset.rotulo;
                relogio.classList.replace('trocando', 'entrando');
                void relogio.offsetWidth;
                relogio.classList.remove('entrando');
            }, 180);
        }
        const faixa = window.matchMedia('(max-width: 1080px)').matches ? '-35% 0px -55% 0px' : '-45% 0px -45% 0px';
        const observador = new IntersectionObserver((itens) => {
            itens.forEach((item) => { if (item.isIntersecting) ativar(item.target); });
        }, { rootMargin: faixa });
        momentos.forEach((m) => observador.observe(m));
        ativar(momentos[0]);
    }

    // ---------- Comece pelo que mais dói: os módulos caem na prateleira quando ela aparece ----------
    const prateleira = document.querySelector('.c-prateleira');
    if (prateleira) {
        prateleira.classList.add('c-anima');
        const observador = new IntersectionObserver(([item]) => {
            if (!item.isIntersecting) return;
            prateleira.classList.add('visto');
            observador.disconnect();
        }, { threshold: 0.35 });
        observador.observe(prateleira);
    }
})();
