/* -------------------------------------------------------------------------
   MovCode — páginas de serviço com estrutura própria
   (/automacoes, /integracoes, /paineis, /consultoria). Cada bloco só roda
   na página que tem as peças dele. Sem JS ou com movimento reduzido, o HTML
   já mostra tudo pronto e parado; o que segue a rolagem (mapa do metrô,
   planilhas de segunda-feira) funciona sempre, porque anda com a pessoa.
------------------------------------------------------------------------- */
(() => {
    if (!('IntersectionObserver' in window)) return;
    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const espera = (ms) => new Promise((ok) => { setTimeout(ok, ms); });
    // roda uma vez quando o elemento aparece
    const aoAparecer = (el, fn, limiar = 0.3) => {
        const obs = new IntersectionObserver(([item]) => {
            if (!item.isIntersecting) return;
            obs.disconnect();
            fn();
        }, { threshold: limiar });
        obs.observe(el);
    };
    // liga enquanto o elemento está na tela e desliga quando sai
    const naTela = (el, liga, desliga) => new IntersectionObserver(([item]) => (item.isIntersecting ? liga() : desliga())).observe(el);
    const real = (v) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`;

    // ---------- Automações: a planilha que se preenche sozinha ----------
    const au = document.querySelector('[data-au-palco]');
    if (au && !calmo) {
        au.classList.add('au-anima');
        const linhas = [...au.querySelectorAll('[data-au-linha]')];
        const avisos = [...au.querySelectorAll('[data-au-aviso]')];
        const fio = au.querySelector('.au-fio');
        const pedido = au.querySelector('[data-au-pedido]');
        let rodando = false;
        let vez = 0;
        const limpar = () => {
            linhas.forEach((l) => l.classList.remove('on', 'assentou'));
            avisos.forEach((a) => a.classList.remove('on'));
        };
        async function ciclo() {
            const minha = ++vez;
            const vivo = () => rodando && minha === vez;
            for (const l of linhas) {
                pedido.textContent = l.dataset.pedido;
                fio.classList.remove('vai');
                void fio.offsetWidth;
                fio.classList.add('vai');
                await espera(560);
                if (!vivo()) return;
                l.classList.add('on');
                setTimeout(() => l.classList.add('assentou'), 900);
                await espera(700);
                if (!vivo()) return;
            }
            for (const a of avisos) {
                a.classList.add('on');
                await espera(850);
                if (!vivo()) return;
            }
            await espera(2600);
            if (!vivo()) return;
            limpar();
            await espera(800);
            if (vivo()) ciclo();
        }
        naTela(au, () => { if (!rodando) { rodando = true; ciclo(); } }, () => { rodando = false; vez += 1; limpar(); });
    }

    // ---------- Automações: a semana passando para o automático ----------
    const semana = document.querySelector('[data-au-semana]');
    if (semana && !calmo) {
        const tarefas = [...semana.querySelectorAll('.au-tarefa')].sort((a, b) => a.style.getPropertyValue('--k') - b.style.getPropertyValue('--k'));
        const contador = semana.querySelector('[data-au-feitas]');
        tarefas.forEach((t) => t.classList.remove('auto', 'assentou'));
        contador.textContent = '0';
        aoAparecer(semana.querySelector('.au-quadro'), () => {
            tarefas.forEach((t, i) => setTimeout(() => {
                t.classList.add('auto');
                setTimeout(() => t.classList.add('assentou'), 380);
                contador.textContent = String(i + 1);
            }, 300 + i * 170));
        }, 0.4);
    }

    // ---------- Fechamentos: a chave do automático e os dois sistemas se ligando ----------
    document.querySelectorAll('[data-au-chave], [data-in-tomada]').forEach((el) => {
        if (calmo) return;
        el.classList.remove('ligado');
        aoAparecer(el, () => setTimeout(() => el.classList.add('ligado'), 350), 0.8);
    });

    // ---------- Integrações: os dados correndo pelos fios ----------
    const rede = document.querySelector('[data-in-palco]');
    if (rede && !calmo) {
        rede.classList.add('in-anima');
        const pacote = rede.querySelector('[data-in-pacote]');
        const fios = [...rede.querySelectorAll('[data-in-fio]')];
        const ativos = [...rede.querySelectorAll('[data-in-aviso]')].map((a) => Number(a.dataset.inAviso));
        let rodando = false;
        let vez = 0;
        const limpar = () => {
            rede.querySelectorAll('.on, .ativo, .recebe').forEach((el) => el.classList.remove('on', 'ativo', 'recebe'));
            pacote.setAttribute('cx', '-10');
        };
        const viajar = (caminho, ms, vivo) => new Promise((ok) => {
            const total = caminho.getTotalLength();
            const t0 = performance.now();
            const quadro = (agora) => {
                if (!vivo()) { ok(); return; }
                const p = Math.min(1, (agora - t0) / ms);
                const e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
                const ponto = caminho.getPointAtLength(total * e);
                pacote.setAttribute('cx', ponto.x.toFixed(2));
                pacote.setAttribute('cy', ponto.y.toFixed(2));
                if (p < 1) requestAnimationFrame(quadro); else ok();
            };
            requestAnimationFrame(quadro);
        });
        async function ciclo() {
            const minha = ++vez;
            const vivo = () => rodando && minha === vez;
            for (const k of ativos) {
                const fio = fios[k];
                const evento = rede.querySelector(`[data-in-evento="${k}"]`);
                const aviso = rede.querySelector(`[data-in-aviso="${k}"]`);
                const destino = rede.querySelector(`[data-in-no="${fio.dataset.destino}"]`);
                evento.classList.add('on');
                fio.classList.add('ativo');
                await espera(450);
                if (!vivo()) return;
                await viajar(fio, 1100, vivo);
                if (!vivo()) return;
                pacote.setAttribute('cx', '-10');
                evento.classList.remove('on');
                destino.classList.add('recebe');
                aviso.classList.add('on');
                await espera(1500);
                if (!vivo()) return;
                fio.classList.remove('ativo');
                destino.classList.remove('recebe');
                aviso.classList.remove('on');
                await espera(350);
                if (!vivo()) return;
            }
            ciclo();
        }
        naTela(rede, () => { if (!rodando) { rodando = true; ciclo(); } }, () => { rodando = false; vez += 1; limpar(); });
    }

    // ---------- Integrações: a venda descendo o mapa do metrô (segue a rolagem) ----------
    const mapa = document.querySelector('[data-in-linha]');
    if (mapa) {
        mapa.classList.add('in-vivo');
        const estacoes = [...mapa.querySelectorAll('[data-in-estacao]')];
        let pedido = false;
        const centro = (el) => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; };
        const medir = () => {
            pedido = false;
            // o trilho vai do centro da primeira parada ao centro da última
            const topo = mapa.getBoundingClientRect().top;
            const ini = centro(estacoes[0].querySelector('.in-parada'));
            const fim = centro(estacoes[estacoes.length - 1].querySelector('.in-parada'));
            const alvo = innerHeight * 0.55;
            const p = Math.min(1, Math.max(0, (alvo - ini) / (fim - ini)));
            mapa.style.setProperty('--ini', `${(ini - topo).toFixed(1)}px`);
            mapa.style.setProperty('--alt', `${(fim - ini).toFixed(1)}px`);
            mapa.style.setProperty('--p', p.toFixed(4));
            estacoes.forEach((e) => {
                const pr = e.querySelector('.in-parada').getBoundingClientRect();
                e.classList.toggle('passou', pr.top + pr.height / 2 <= alvo + 1);
            });
        };
        window.addEventListener('scroll', () => { if (!pedido) { pedido = true; requestAnimationFrame(medir); } }, { passive: true });
        window.addEventListener('resize', medir);
        medir();
    }

    // ---------- Painéis: os números contando, o gráfico se desenhando e o painel se atualizando ----------
    const painel = document.querySelector('[data-pa-palco]');
    if (painel && !calmo) {
        painel.classList.add('pa-anima');
        const numeros = [...painel.querySelectorAll('[data-pa-num]')];
        const escrever = (el, v) => { el.textContent = 'paPct' in el.dataset ? `${Math.round(v)}%` : real(v); };
        const contar = (el, de, ate, ms) => {
            const t0 = performance.now();
            const quadro = (agora) => {
                const p = Math.min(1, (agora - t0) / ms);
                escrever(el, de + (ate - de) * (1 - (1 - p) ** 3));
                if (p < 1) requestAnimationFrame(quadro);
            };
            requestAnimationFrame(quadro);
        };
        aoAparecer(painel, () => {
            numeros.forEach((el) => contar(el, 0, Number(el.dataset.paNum), 1300));
            requestAnimationFrame(() => painel.classList.add('pronto'));
        }, 0.2);
        // de tempos em tempos chega uma venda nova: as vendas e o lucro sobem um pouco e piscam
        const vendas = numeros[0];
        const lucro = numeros[1];
        let relogio;
        naTela(painel, () => {
            clearInterval(relogio);
            relogio = setInterval(() => {
                const venda = 40 + Math.round(Math.random() * 180);
                [[vendas, venda], [lucro, Math.round(venda * 0.2)]].forEach(([el, mais]) => {
                    const antes = Number(el.dataset.paNum);
                    el.dataset.paNum = String(antes + mais);
                    contar(el, antes, antes + mais, 600);
                    el.classList.add('pisca');
                    setTimeout(() => el.classList.remove('pisca'), 900);
                });
            }, 4200);
        }, () => clearInterval(relogio));
    }

    // ---------- Painéis: segunda-feira de manhã (o passo no meio da tela muda a mesa) ----------
    const segunda = document.querySelector('[data-pa-segunda]');
    if (segunda) {
        const mesa = segunda.querySelector('[data-pa-mesa]');
        const passos = [...segunda.querySelectorAll('[data-pa-passo]')];
        const ativar = (passo) => {
            mesa.dataset.passo = passo.dataset.paPasso;
            passos.forEach((p) => p.classList.toggle('ativo', p === passo));
        };
        const faixa = window.matchMedia('(max-width: 1080px)').matches ? '-62% 0px -22% 0px' : '-45% 0px -45% 0px';
        const obs = new IntersectionObserver((itens) => {
            itens.forEach((item) => { if (item.isIntersecting) ativar(item.target); });
        }, { rootMargin: faixa });
        passos.forEach((p) => obs.observe(p));
        ativar(passos[0]);
        // no celular, enquanto a mesa está presa no alto (o título já passou), o fundo dela cobre até a borda da tela
        let pedido = false;
        const presa = () => {
            pedido = false;
            mesa.classList.toggle('presa', mesa.getBoundingClientRect().top <= parseFloat(getComputedStyle(mesa).top) + 1);
        };
        window.addEventListener('scroll', () => { if (!pedido) { pedido = true; requestAnimationFrame(presa); } }, { passive: true });
        presa();
    }

    // ---------- Painéis: a linha do mês no fechamento ----------
    const finalPainel = document.querySelector('.pa-final');
    if (finalPainel && !calmo) {
        finalPainel.classList.add('pa-anima');
        aoAparecer(finalPainel, () => finalPainel.classList.add('pronto'), 0.4);
    }

    // ---------- Consultoria: a planta se desenhando ----------
    if (!calmo) {
        document.querySelectorAll('[data-co-palco], [data-co-mapa]').forEach((el) => {
            el.classList.add('co-anima');
            aoAparecer(el, () => el.classList.add('visto'), el.matches('[data-co-mapa]') ? 0.2 : 0.3);
        });
    }
})();
