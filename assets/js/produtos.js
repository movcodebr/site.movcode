/* -------------------------------------------------------------------------
   MovCode — /produtos
   O palco preso na tela: cada tela de rolagem é um estado (0 é a abertura,
   1 a 5 são os produtos). Da tela inicial o app abre de dentro do ícone;
   de um produto para o outro o celular gira; voltando para a abertura o
   app fecha de volta no ícone. Dentro de cada app um dedo vai tocando e a
   demonstração anda passo a passo, sem parar, enquanto ele está na tela.
   Com movimento reduzido tudo troca na hora e cada app já mostra o último
   passo.
------------------------------------------------------------------------- */
(() => {
    const show = document.querySelector('[data-pr-show]');
    if (!show) return;
    const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const espera = (ms) => new Promise((ok) => { setTimeout(ok, ms); });
    const lista = (texto) => String(texto).split(',').map(Number);

    const palco = show.querySelector('[data-pr-palco]');
    const cena = show.querySelector('[data-pr-cena]');
    const tel = show.querySelector('[data-pr-tel]');
    const caixa = show.querySelector('[data-pr-telas]');
    const telas = [...show.querySelectorAll('[data-pr-tela]')];
    const textos = [...show.querySelectorAll('[data-pr-texto]')];
    const gigantes = [...show.querySelectorAll('[data-pr-gigante]')];
    const cartoes = [...show.querySelectorAll('[data-pr-cartoes]')];
    const doca = [...show.querySelectorAll('[data-pr-doca]')];
    const passos = [...show.querySelectorAll('[data-pr-passo]')];
    const icones = [...show.querySelectorAll('[data-pr-icone]')];
    const dedo = show.querySelector('[data-pr-toque]');

    // posição de um elemento dentro da tela do celular, sem contar giros e inclinações
    const centro = (el) => {
        let x = el.offsetWidth / 2;
        let y = el.offsetHeight / 2;
        for (let no = el; no && no !== caixa; no = no.offsetParent) {
            x += no.offsetLeft;
            y += no.offsetTop;
        }
        return { x, y };
    };
    const tocar = (el) => {
        const { x, y } = centro(el);
        dedo.style.left = `${x}px`;
        dedo.style.top = `${y}px`;
        dedo.classList.remove('toca');
        void dedo.offsetWidth;
        dedo.classList.add('toca');
        el.classList.add('apertado');
        setTimeout(() => el.classList.remove('apertado'), 200);
    };

    // ---------- Cada app anda sozinho, passo a passo ----------
    function motor(tela) {
        const total = Number(tela.dataset.passos);
        const ve = [...tela.querySelectorAll('[data-ve]')];
        const ate = [...tela.querySelectorAll('[data-ate]')];
        const sel = [...tela.querySelectorAll('[data-sel]')];
        const so = [...tela.querySelectorAll('[data-so]')];
        const toques = [...tela.querySelectorAll('[data-toque]')];
        let vez = 0;
        const mostrar = (p) => {
            tela.dataset.passo = String(p);
            ve.forEach((el) => el.classList.toggle('ve', Number(el.dataset.ve) <= p));
            ate.forEach((el) => el.classList.toggle('passou', p > Number(el.dataset.ate)));
            sel.forEach((el) => el.classList.toggle('sel', p >= Number(el.dataset.sel)));
            so.forEach((el) => el.classList.toggle('sel', lista(el.dataset.so).includes(p)));
        };
        const alvo = (p) => toques.find((el) => lista(el.dataset.toque).includes(p));
        async function rodar(minha) {
            const vivo = () => minha === vez;
            await espera(900);
            while (vivo()) {
                for (let p = 1; p < total; p += 1) {
                    const el = alvo(p);
                    if (el) {
                        tocar(el);
                        await espera(260);
                        if (!vivo()) return;
                    }
                    mostrar(p);
                    await espera(1500);
                    if (!vivo()) return;
                }
                await espera(1800);
                if (!vivo()) return;
                // recomeça com uma piscada, para não parecer que voltou sozinho
                tela.classList.add('reinicia');
                await espera(330);
                mostrar(0);
                await espera(370);
                tela.classList.remove('reinicia');
                if (!vivo()) return;
                await espera(700);
            }
        }
        return {
            zerar() { vez += 1; tela.classList.remove('reinicia'); mostrar(calmo ? total - 1 : 0); },
            ligar() { if (!calmo) rodar(++vez); },
            desligar() { vez += 1; },
        };
    }
    const motores = telas.map((t) => (t.dataset.passos ? motor(t) : null));

    // ---------- Na tela inicial as notificações dos apps vão chegando ----------
    const avisos = show.querySelector('[data-pr-avisos]');
    if (avisos) {
        let vez = 0;
        const rodar = async (minha) => {
            while (minha === vez) {
                await espera(2600);
                if (minha !== vez) return;
                const chegou = avisos.lastElementChild;
                avisos.prepend(chegou);
                chegou.classList.remove('novo');
                void chegou.offsetWidth;
                chegou.classList.add('novo');
            }
        };
        motores[0] = { zerar() { vez += 1; }, ligar() { if (!calmo) rodar(++vez); }, desligar() { vez += 1; } };
    }

    // ---------- A troca de tela: abrir, girar ou fechar ----------
    let atual = 0;
    let desejado = 0;
    let ocupado = false;
    let visivel = false;

    const mostrarTela = (k) => {
        telas.forEach((t, i) => t.classList.toggle('ativa', i === k));
        caixa.dataset.tela = String(k);
        motores[k]?.zerar();
    };
    async function abrir(k) {
        const icone = icones[k - 1];
        const desenho = icone.querySelector('.pr-icone');
        tocar(desenho);
        icone.classList.add('tocando');
        await espera(240);
        icone.classList.remove('tocando');
        const t = telas[k];
        const { x, y } = centro(desenho);
        t.style.setProperty('--ox', `${x}px`);
        t.style.setProperty('--oy', `${y}px`);
        motores[k].zerar();
        t.classList.add('ativa', 'abrindo');
        telas[0].classList.add('saindo');
        caixa.dataset.tela = String(k);
        await espera(620);
        t.classList.remove('abrindo');
        telas[0].classList.remove('ativa', 'saindo');
    }
    async function fechar(k) {
        const t = telas[k];
        telas[0].classList.add('ativa', 'voltando');
        t.classList.add('fechando');
        caixa.dataset.tela = '0';
        await espera(500);
        t.classList.remove('ativa', 'fechando');
        telas[0].classList.remove('voltando');
    }
    async function virar(de, para) {
        const classe = para > de ? 'virando' : 'virando-volta';
        tel.classList.remove('virando', 'virando-volta');
        void tel.offsetWidth;
        tel.classList.add(classe);
        await espera(450);
        mostrarTela(para);
        await espera(470);
        tel.classList.remove(classe);
    }
    async function trocarTela() {
        if (ocupado) return;
        ocupado = true;
        while (atual !== desejado) {
            const de = atual;
            const para = desejado;
            motores[de]?.desligar();
            if (calmo) mostrarTela(para);
            else if (de === 0) await abrir(para);
            else if (para === 0) await fechar(de);
            else await virar(de, para);
            atual = para;
        }
        ocupado = false;
        if (visivel) motores[atual]?.ligar();
    }

    // ---------- O estado do palco ----------
    let ativo = -1;
    function ir(k, sem_animar) {
        if (k === ativo) return;
        const antes = ativo;
        ativo = k;
        palco.dataset.ativo = String(k);
        textos.forEach((t, i) => {
            const era = i === antes;
            t.classList.toggle('ativo', i === k);
            t.classList.toggle('saindo', era && i !== k && !sem_animar);
            if (era && i !== k) setTimeout(() => t.classList.remove('saindo'), 700);
        });
        gigantes.forEach((g, i) => {
            g.classList.toggle('ativo', i === k);
            g.classList.toggle('antes', i < k);
        });
        cartoes.forEach((c, i) => c.classList.toggle('ativo', i + 1 === k));
        doca.forEach((d, i) => {
            d.classList.toggle('ativo', i + 1 === k);
            if (i + 1 === k) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
        });
        desejado = k;
        if (sem_animar) {
            motores[atual]?.desligar();
            atual = k;
            mostrarTela(k);
            if (visivel) motores[k]?.ligar();
        } else {
            trocarTela();
        }
    }

    // qual passagem está no meio da tela
    let pedido = false;
    function medir() {
        pedido = false;
        const meio = window.innerHeight / 2;
        let k = 0;
        passos.forEach((p, i) => { if (p.getBoundingClientRect().top <= meio) k = i; });
        const caixaShow = show.getBoundingClientRect();
        const curso = caixaShow.height - window.innerHeight;
        palco.style.setProperty('--pr-prog', Math.min(1, Math.max(0, -caixaShow.top / curso)).toFixed(3));
        ir(k, ativo === -1);
    }
    const pedir = () => { if (!pedido) { pedido = true; requestAnimationFrame(medir); } };
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);

    // os ícones da lateral levam direto ao produto, sem passar pelos do meio
    doca.forEach((d) => d.addEventListener('click', (e) => {
        const alvo = document.getElementById(d.getAttribute('href').slice(1));
        if (!alvo) return;
        e.preventDefault();
        window.scrollTo({ top: alvo.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
        medir();
    }));
    // quem navega pelo teclado e cai num link de outro produto vai até ele
    textos.forEach((t, i) => t.addEventListener('focusin', () => {
        if (i === ativo || !passos[i]) return;
        window.scrollTo({ top: passos[i].getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
        medir();
    }));

    // o app só anda enquanto o palco está na tela
    new IntersectionObserver(([item]) => {
        visivel = item.isIntersecting;
        if (!visivel) motores[atual]?.desligar();
        else if (!ocupado) motores[atual]?.ligar();
    }).observe(palco);

    // o celular, o nome e os cartões acompanham o mouse
    if (!calmo && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        let mx = 0;
        let my = 0;
        let ax = 0;
        let ay = 0;
        let rodando = false;
        const passo = () => {
            ax += (mx - ax) * 0.08;
            ay += (my - ay) * 0.08;
            palco.style.setProperty('--mx', ax.toFixed(3));
            palco.style.setProperty('--my', ay.toFixed(3));
            if (Math.abs(mx - ax) > 0.001 || Math.abs(my - ay) > 0.001) requestAnimationFrame(passo);
            else rodando = false;
        };
        palco.addEventListener('pointermove', (e) => {
            const r = palco.getBoundingClientRect();
            mx = ((e.clientX - r.left) / r.width) * 2 - 1;
            my = ((e.clientY - r.top) / r.height) * 2 - 1;
            if (!rodando) { rodando = true; requestAnimationFrame(passo); }
        });
        palco.addEventListener('pointerleave', () => {
            mx = 0;
            my = 0;
            if (!rodando) { rodando = true; requestAnimationFrame(passo); }
        });
    }

    medir();
})();
