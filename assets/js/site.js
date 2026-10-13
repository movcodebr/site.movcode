/* -------------------------------------------------------------------------
   PARA TROCAR O WHATSAPP, MUDE SO A LINHA whatsappNumber ABAIXO.
   Todo link com data-whatsapp no HTML e reescrito a partir daqui.
   Formato: codigo do pais + DDD + numero, sem simbolos. Ex.: 5516991234567
------------------------------------------------------------------------- */
window.MOVCODE_CONFIG = Object.freeze({
    whatsappNumber: '5516982157266',
    whatsappMensagem: 'Olá! Vim pelo site da MovCode e gostaria de conversar sobre um projeto.',
    // ID do Meta Pixel (Gerenciador de Eventos da Meta). Vazio = pixel desligado.
    metaPixelId: ''
});

// Meta Pixel: so carrega quando ha um ID configurado acima
if (window.MOVCODE_CONFIG.metaPixelId) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', window.MOVCODE_CONFIG.metaPixelId);
    window.fbq('track', 'PageView');
}

// Origem da visita (utm_* / gclid / fbclid), guardada na sessao para o lead
// chegar no WhatsApp dizendo de qual anuncio veio.
window.MOVCODE_ORIGEM = (() => {
    const chaves = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'gclid', 'fbclid'];
    const params = new URLSearchParams(window.location.search);
    const atual = {};

    chaves.forEach((chave) => {
        if (params.get(chave)) {
            atual[chave] = params.get(chave);
        }
    });

    try {
        if (Object.keys(atual).length) {
            sessionStorage.setItem('movcode_origem', JSON.stringify(atual));
            return atual;
        }
        return JSON.parse(sessionStorage.getItem('movcode_origem') || '{}');
    } catch {
        return atual;
    }
})();

// Eventos do GA4 que viram eventos padrao do Meta Pixel (para anuncios)
const EVENTOS_META = { whatsapp_click: 'Contact', generate_lead: 'Lead' };

function rastrear(evento, dados = {}) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', evento, { ...window.MOVCODE_ORIGEM, ...dados });
    }
    if (typeof window.fbq === 'function' && EVENTOS_META[evento]) {
        window.fbq('track', EVENTOS_META[evento], { content_name: dados.servico || dados.local || dados.cta || '' });
    }
}

function linkWhatsapp(texto) {
    const origem = window.MOVCODE_ORIGEM || {};
    const ref = [origem.utm_source, origem.utm_campaign].filter(Boolean).join(' / ')
        || (origem.gclid ? 'google ads' : origem.fbclid ? 'meta ads' : '');
    const mensagem = ref ? `${texto}\n\n(ref: ${ref})` : texto;
    const query = mensagem ? `?text=${encodeURIComponent(mensagem)}` : '';
    return `https://wa.me/${window.MOVCODE_CONFIG.whatsappNumber}${query}`;
}

// Links de WhatsApp
document.querySelectorAll('[data-whatsapp]').forEach((link) => {
    link.href = linkWhatsapp(link.dataset.whatsapp || window.MOVCODE_CONFIG.whatsappMensagem);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
});

// Eventos do GA4. Marque whatsapp_click e generate_lead como conversao.
document.addEventListener('click', (event) => {
    const whatsapp = event.target.closest('[data-whatsapp]');
    const cta = event.target.closest('[data-cta]');

    if (whatsapp) {
        rastrear('whatsapp_click', { local: whatsapp.dataset.cta || 'link', pagina: window.location.pathname });
    } else if (cta) {
        rastrear('cta_click', { cta: cta.dataset.cta, pagina: window.location.pathname });
    }
});

// Botoes que ja escolhem o servico no formulario (ex.: cards de porte)
document.querySelectorAll('[data-servico]').forEach((link) => {
    link.addEventListener('click', () => {
        const opcao = document.querySelector(`.form input[name="servico"][value="${link.dataset.servico}"]`);
        if (opcao) {
            opcao.checked = true;
            opcao.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
});

// Cabecalho e menu
(() => {
    const topo = document.querySelector('.topo');
    const botao = document.querySelector('.menu-botao');
    const menu = document.getElementById('menu');

    // A capsula some ao rolar para baixo e volta ao rolar para cima
    let ultimoY = window.scrollY;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        const descendo = y > ultimoY && y > 240;
        const segurando = document.body.classList.contains('menu-aberto') || topo?.querySelector('.menu-item.aberto');
        topo?.classList.toggle('escondido', descendo && !segurando);
        ultimoY = y;
    }, { passive: true });

    if (!botao || !menu) {
        return;
    }

    const fechar = () => {
        document.body.classList.remove('menu-aberto');
        botao.setAttribute('aria-expanded', 'false');
        botao.setAttribute('aria-label', 'Abrir menu');
    };

    botao.addEventListener('click', () => {
        const aberto = document.body.classList.toggle('menu-aberto');
        botao.setAttribute('aria-expanded', String(aberto));
        botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', fechar));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') fechar();
    });
    document.addEventListener('click', (event) => {
        if (document.body.classList.contains('menu-aberto') && !menu.contains(event.target) && !botao.contains(event.target)) {
            fechar();
        }
    });
})();

// Formulario de diagnostico: site estatico, entao monta a mensagem e abre o
// WhatsApp ja preenchido.
document.querySelectorAll('[data-lead-form]').forEach((form) => {
    const erro = form.querySelector('.form-erro');

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const dados = new FormData(form);
        const nome = String(dados.get('nome') || '').trim();
        const empresa = String(dados.get('empresa') || '').trim();
        const servico = String(dados.get('servico') || '').trim();
        const mensagem = String(dados.get('mensagem') || '').trim();

        if (!nome || !servico) {
            if (erro) erro.hidden = false;
            if (!nome) {
                form.querySelector('[name="nome"]')?.focus();
            } else if (form.querySelector('.opcoes-botao')) {
                form.querySelector('.opcoes-menu')?.abrirMenu();
            } else {
                form.querySelector('[name="servico"]')?.focus();
            }
            return;
        }

        if (erro) erro.hidden = true;

        const linhas = [
            `Olá! Sou ${nome}${empresa ? ` (${empresa})` : ''}.`,
            `Quero um diagnóstico gratuito sobre: ${servico}.`
        ];

        if (mensagem) {
            linhas.push(`Hoje o que mais atrapalha é: ${mensagem}`);
        }

        rastrear('generate_lead', { servico, pagina: window.location.pathname });

        const url = linkWhatsapp(linhas.join('\n'));
        // Sem 'noopener' nas features: com ele window.open sempre devolve null
        // e nao daria para detectar popup bloqueado.
        const janela = window.open(url, '_blank');

        if (janela) {
            janela.opener = null;
        } else {
            window.location.href = url;
        }
    });
});

document.querySelectorAll('[data-ano]').forEach((el) => {
    el.textContent = new Date().getFullYear();
});

const MOVCODE_MOVIMENTO_REDUZIDO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// "/" e "/index.html" sao a mesma pagina, assim como "/termo" e "/termo.html"
const normalizarCaminho = (caminho) => caminho.replace(/index\.html$/, '').replace(/\.html$/, '');
const mesmaPagina = (caminho) => normalizarCaminho(caminho) === normalizarCaminho(window.location.pathname);

// ---------- Navegacao sem "#" na URL ----------
// Links para secoes da propria pagina rolam ate a secao sem mudar o endereco.
// A home troca window.MOVCODE_ROLAR pela rolagem suave do Lenis.
window.MOVCODE_ROLAR = window.MOVCODE_ROLAR || ((alvo) => {
    alvo.scrollIntoView({ behavior: MOVCODE_MOVIMENTO_REDUZIDO ? 'auto' : 'smooth', block: 'start' });
});

document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href*="#"]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || !mesmaPagina(url.pathname) || !url.hash) return;
    const alvo = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!alvo) return;
    event.preventDefault();
    window.MOVCODE_ROLAR(alvo);
    if (alvo.tagName === 'MAIN') {
        alvo.setAttribute('tabindex', '-1');
        alvo.focus({ preventScroll: true });
    }
});

// Chegou de outra pagina com "#secao": rola ate la e limpa o endereco.
// Na home animada quem faz isso e o home.js, depois de calcular as secoes travadas.
window.addEventListener('load', () => {
    if (!window.location.hash || document.documentElement.classList.contains('anima')) return;
    const alvo = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (alvo) alvo.scrollIntoView({ block: 'start' });
    history.replaceState(null, '', window.location.pathname + window.location.search);
});

// ---------- Simbolo vivo (letreiro do rodape) ----------
(() => {
    const simbolos = [...document.querySelectorAll('.duo-vivo')];
    if (!simbolos.length || MOVCODE_MOVIMENTO_REDUZIDO) return;

    // Os olhos, dentro das cabecas, olham para o mouse
    if (window.matchMedia('(pointer: fine)').matches) {
        let mouseX = 0;
        let mouseY = 0;
        let pendente = false;
        const olhar = () => {
            pendente = false;
            simbolos.forEach((duo) => {
                const caixa = duo.getBoundingClientRect();
                if (caixa.bottom < 0 || caixa.top > window.innerHeight) return;
                const dx = mouseX - (caixa.left + caixa.width / 2);
                const dy = mouseY - (caixa.top + caixa.height * 0.25);
                const distancia = Math.hypot(dx, dy) || 1;
                const alcance = caixa.width * 0.05 * Math.min(distancia / 240, 1);
                duo.style.setProperty('--olho-x', `${(dx / distancia) * alcance}px`);
                duo.style.setProperty('--olho-y', `${(dy / distancia) * alcance}px`);
            });
        };
        window.addEventListener('pointermove', (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
            if (!pendente) {
                pendente = true;
                requestAnimationFrame(olhar);
            }
        }, { passive: true });
    }

    // Pisca de vez em quando, em momentos diferentes para cada simbolo
    simbolos.forEach((duo) => {
        const piscar = () => {
            duo.classList.add('piscando');
            setTimeout(() => duo.classList.remove('piscando'), 130);
            setTimeout(piscar, 2500 + Math.random() * 4500);
        };
        setTimeout(piscar, 1200 + Math.random() * 3000);
    });
})();

// ---------- Menu com painel (Solucoes) ----------
// No computador abre ao passar o mouse; no toque e no teclado, ao clicar.
// Esc ou um clique fora fecha.
(() => {
    const itens = [...document.querySelectorAll('.menu-item')];
    if (!itens.length) return;
    const mouseNoComputador = window.matchMedia('(min-width: 1081px) and (hover: hover) and (pointer: fine)');

    const abrir = (item, aberto) => {
        item.classList.toggle('aberto', aberto);
        item.querySelector('.menu-gatilho')?.setAttribute('aria-expanded', String(aberto));
    };

    itens.forEach((item) => {
        const gatilho = item.querySelector('.menu-gatilho');
        let espera = null;
        gatilho?.addEventListener('click', (event) => {
            // Com o mouse o painel ja abriu no hover: o clique so confirma
            const pelaPassagem = mouseNoComputador.matches && event.pointerType === 'mouse';
            abrir(item, pelaPassagem ? true : !item.classList.contains('aberto'));
        });
        item.addEventListener('pointerenter', (event) => {
            if (!mouseNoComputador.matches || event.pointerType !== 'mouse') return;
            clearTimeout(espera);
            abrir(item, true);
        });
        item.addEventListener('pointerleave', (event) => {
            if (!mouseNoComputador.matches || event.pointerType !== 'mouse') return;
            espera = setTimeout(() => abrir(item, false), 180);
        });
        item.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => abrir(item, false)));
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        itens.filter((item) => item.classList.contains('aberto')).forEach((item) => {
            abrir(item, false);
            item.querySelector('.menu-gatilho')?.focus();
        });
    });
    document.addEventListener('click', (event) => {
        itens.forEach((item) => {
            if (!item.contains(event.target)) abrir(item, false);
        });
    });
})();

// ---------- "O que você precisa?": menu de escolha ----------
// Os radios continuam no formulario (o envio e a pre-selecao usam eles).
// O script troca os botoes lado a lado por um menu que abre uma lista vertical.
(() => {
    const seta = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
    document.querySelectorAll('.form .opcoes').forEach((grupo, n) => {
        const legenda = grupo.querySelector('legend');
        const radios = [...grupo.querySelectorAll('input[type="radio"]')];
        if (!legenda || !radios.length) return;

        legenda.id = legenda.id || `opcoes-legenda-${n}`;
        const lista = document.createElement('div');
        lista.className = 'opcoes-lista';
        lista.id = `opcoes-lista-${n}`;
        radios.forEach((radio) => lista.appendChild(radio.closest('label')));

        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'opcoes-botao';
        botao.setAttribute('aria-expanded', 'false');
        botao.setAttribute('aria-controls', lista.id);
        botao.innerHTML = `<span class="opcoes-valor" id="opcoes-valor-${n}"></span>${seta}`;
        botao.setAttribute('aria-labelledby', `${legenda.id} opcoes-valor-${n}`);
        legenda.after(botao);
        botao.after(lista);
        grupo.classList.add('opcoes-menu');

        const valor = botao.querySelector('.opcoes-valor');
        const atualizar = () => {
            const marcado = radios.find((radio) => radio.checked);
            valor.textContent = marcado ? marcado.value : 'Escolha uma opção';
            botao.classList.toggle('vazio', !marcado);
        };
        const abrir = (aberto) => {
            grupo.classList.toggle('aberto', aberto);
            botao.setAttribute('aria-expanded', String(aberto));
            if (aberto) (radios.find((radio) => radio.checked) || radios[0]).focus();
        };
        const fecharEVoltar = () => {
            abrir(false);
            botao.focus();
        };
        grupo.abrirMenu = () => abrir(true);

        botao.addEventListener('click', () => abrir(!grupo.classList.contains('aberto')));
        radios.forEach((radio) => radio.addEventListener('change', atualizar));
        // Com o mouse ou o dedo, escolher ja fecha; no teclado as setas trocam
        // a opcao e Enter, espaco ou Esc confirmam
        lista.addEventListener('pointerup', (event) => {
            if (event.target.closest('label')) setTimeout(fecharEVoltar, 0);
        });
        lista.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                fecharEVoltar();
            } else if (event.key === ' ') {
                setTimeout(fecharEVoltar, 0);
            }
        });
        document.addEventListener('click', (event) => {
            if (!grupo.contains(event.target)) abrir(false);
        });
        grupo.addEventListener('focusout', (event) => {
            if (!grupo.contains(event.relatedTarget)) {
                grupo.classList.remove('aberto');
                botao.setAttribute('aria-expanded', 'false');
            }
        });
        atualizar();
    });
})();

// ---------- Perguntas: abrem e fecham com animacao ----------
(() => {
    if (MOVCODE_MOVIMENTO_REDUZIDO) return;
    document.querySelectorAll('details.pergunta').forEach((pergunta) => {
        const resumo = pergunta.querySelector('summary');
        if (!resumo) return;
        let animacao = null;
        const alturaFechada = () => resumo.offsetHeight + (pergunta.offsetHeight - pergunta.clientHeight);

        resumo.addEventListener('click', (event) => {
            event.preventDefault();
            const inicio = pergunta.offsetHeight;
            animacao?.cancel();
            pergunta.style.overflow = 'hidden';
            const abrindo = !pergunta.open || pergunta.classList.contains('fechando');
            pergunta.classList.toggle('fechando', !abrindo);
            if (abrindo) pergunta.open = true;
            const fim = abrindo ? pergunta.offsetHeight : alturaFechada();
            animacao = pergunta.animate(
                { height: [`${inicio}px`, `${fim}px`] },
                { duration: abrindo ? 380 : 300, easing: 'cubic-bezier(.2, .7, .2, 1)' }
            );
            const resposta = [...pergunta.children].filter((filho) => filho !== resumo);
            if (abrindo) {
                resposta.forEach((parte) => parte.animate(
                    { opacity: [0, 1], transform: ['translateY(-8px)', 'none'] },
                    { duration: 380, easing: 'ease-out' }
                ));
            }
            animacao.onfinish = () => {
                if (!abrindo) pergunta.open = false;
                pergunta.classList.remove('fechando');
                pergunta.style.overflow = '';
                animacao = null;
            };
        });
    });
})();

// ---------- Rodape a vista ----------
// O rodape tem o proprio WhatsApp; enquanto ele aparece, o botao flutuante
// some para nao cobrir as redes sociais.
(() => {
    const partes = document.querySelectorAll('.rodape-links, .rodape-base');
    if (!partes.length || !('IntersectionObserver' in window)) return;
    const visiveis = new Set();
    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) visiveis.add(entrada.target);
            else visiveis.delete(entrada.target);
        });
        document.body.classList.toggle('rodape-a-vista', visiveis.size > 0);
    });
    partes.forEach((parte) => observador.observe(parte));
})();

// ---------- Transicao entre paginas ----------
(() => {
    if (MOVCODE_MOVIMENTO_REDUZIDO) {
        document.documentElement.classList.remove('chegando');
        return;
    }

    const cortina = document.createElement('div');
    cortina.className = 'transicao';
    cortina.setAttribute('aria-hidden', 'true');
    cortina.innerHTML = '<span class="duo"><i><b></b><b></b></i><i><b></b><b></b></i></span>';
    document.body.appendChild(cortina);

    // Chegando: a pagina nasce coberta de laranja e o circulo se fecha no centro
    let chegou = false;
    try {
        chegou = sessionStorage.getItem('movcode_transicao') === '1';
        sessionStorage.removeItem('movcode_transicao');
    } catch {
        // sem sessionStorage a pagina abre normalmente
    }
    if (chegou) {
        cortina.classList.add('cobrindo', 'sem-animacao');
        document.documentElement.classList.remove('chegando');
        requestAnimationFrame(() => requestAnimationFrame(() => {
            cortina.classList.remove('sem-animacao', 'cobrindo');
        }));
    } else {
        document.documentElement.classList.remove('chegando');
    }

    // Saindo: o circulo cresce a partir do clique e cobre a tela
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href]');
        if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (link.target === '_blank' || link.hasAttribute('download') || link.dataset.whatsapp !== undefined) return;
        const url = new URL(link.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (mesmaPagina(url.pathname)) return; // mesma pagina: so rola
        event.preventDefault();
        cortina.style.setProperty('--tx', `${event.clientX}px`);
        cortina.style.setProperty('--ty', `${event.clientY}px`);
        cortina.classList.add('cobrindo');
        try {
            sessionStorage.setItem('movcode_transicao', '1');
        } catch {
            // segue sem a animacao de chegada
        }
        setTimeout(() => { window.location.href = url.href; }, 650);
    });

    // Voltar pelo navegador (cache de pagina): tira a cortina
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) cortina.classList.remove('cobrindo');
    });
})();
