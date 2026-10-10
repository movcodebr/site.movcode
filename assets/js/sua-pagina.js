/* -------------------------------------------------------------------------
   MovCode — /sua-pagina
   Montador de landing page. O cliente escolhe tipo, nome, cor, estilo e
   seções; a prévia (dentro do celular) muda na hora. No fim, "Quero a minha
   assim" abre o WhatsApp com as escolhas e o link da montagem.

   Link pronto para mandar a um lead (todos os parâmetros são opcionais):
   movcode.com.br/sua-pagina?nome=Box%2004%20Barbershop&nicho=barbearia&bairro=Centro
   nicho:  barbearia | estetica | pilates | oficina | construcao | contabilidade | petshop | outro
   cor:    laranja | vermelho | rosa | roxo | azul | verde | dourado | grafite
   estilo: moderno | elegante | vibrante
   sec:    precos,galeria,diferenciais,local  (separados por vírgula)
------------------------------------------------------------------------- */
(() => {
    const L = 390; // largura "real" da prévia, em px

    // ---------- Ícones (traço 2px, 24×24) ----------
    const P = {
        barbearia: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/>',
        estetica: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
        pilates: '<circle cx="12" cy="4.5" r="1.8"/><path d="m9 20 3-6 3 6"/><path d="m5 8.5 7 2 7-2"/><path d="M12 10.5V14"/>',
        oficina: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
        construcao: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 9v6M16 15v6M16 3v6M3 15h18M3 9h18M8 15v6M8 3v6"/>',
        contabilidade: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14v4M8 18h.01M12 18h.01"/>',
        petshop: '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.05Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>',
        outro: '<path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>',
        check: '<path d="M20 6 9 17l-5-5"/>',
        relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
        escudo: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
        estrela: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
        pin: '<path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
        coracao: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
        caminhao: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
        menu: '<path d="M4 7h16M4 12h16M4 17h16"/>'
    };
    const WHATS = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z"/><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.25-4.38c0-4.54 3.7-8.23 8.24-8.23a8.2 8.2 0 0 1 8.22 8.24c0 4.54-3.69 8.23-8.24 8.23z"/></svg>';
    const ic = (k, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${P[k]}</svg>`;

    // ---------- Conteúdo por tipo de negócio ----------
    const NICHOS = {
        barbearia: {
            rotulo: 'Barbearia', exemplo: 'Barbearia do João',
            titulo: 'Corte e barba no seu horário.', texto: 'Ambiente tranquilo, capricho em cada detalhe e horário marcado, sem fila.',
            cta: 'Agendar pelo WhatsApp', msg: 'Olá! Quero agendar um horário.',
            precosT: 'Serviços e preços', precosS: 'Escolha o serviço e agende em 1 minuto.',
            precos: [['Corte', 'Máquina e tesoura', 'R$ 40'], ['Barba', 'Toalha quente e navalha', 'R$ 30'], ['Corte + barba', 'O combo completo', 'R$ 60'], ['Sobrancelha', 'Acabamento na navalha', 'R$ 15']],
            galeriaT: 'Nossos cortes', difs: [['relogio', 'Horário marcado', 'Chegou, sentou. Sem esperar.'], ['estrela', 'Capricho em cada corte', 'Do jeito que você pediu.'], ['escudo', 'Higiene de verdade', 'Material esterilizado a cada cliente.']],
            hora: [['Seg a sex', '9h às 20h'], ['Sábado', '8h às 18h']], ate: '20h', fimT: 'Bora marcar seu horário?'
        },
        estetica: {
            rotulo: 'Clínica de estética', exemplo: 'Clínica Bem Estar',
            titulo: 'Cuidado com você, do jeito certo.', texto: 'Procedimentos faciais e corporais, sempre com avaliação antes de começar.',
            cta: 'Agendar avaliação', msg: 'Olá! Gostaria de agendar uma avaliação.',
            precosT: 'Procedimentos', precosS: 'Toda indicação começa por uma avaliação.',
            precos: [['Limpeza de pele', 'Profunda, com extração', 'R$ 150'], ['Drenagem linfática', 'Sessão de 60 min', 'R$ 120'], ['Peeling', 'Renovação da pele', 'R$ 180'], ['Avaliação', 'Plano de cuidado', 'Grátis']],
            galeriaT: 'Nosso espaço', difs: [['check', 'Avaliação antes de tudo', 'Só indicamos o que faz sentido pra você.'], ['escudo', 'Protocolos seguros', 'Produtos registrados e equipe formada.'], ['coracao', 'Atendimento sem pressa', 'Seu horário é só seu.']],
            hora: [['Seg a sex', '9h às 19h'], ['Sábado', '9h às 13h']], ate: '19h', fimT: 'Agende a sua avaliação.'
        },
        pilates: {
            rotulo: 'Estúdio de pilates', exemplo: 'Studio Movimento',
            titulo: 'Pilates com atenção de verdade.', texto: 'Turmas pequenas, aparelhos completos e professores que acompanham cada aluno.',
            cta: 'Agendar aula experimental', msg: 'Olá! Quero agendar uma aula experimental.',
            precosT: 'Planos', precosS: 'Comece com uma aula experimental, sem compromisso.',
            precos: [['1x por semana', 'Plano mensal', 'R$ 220'], ['2x por semana', 'Plano mensal', 'R$ 320'], ['3x por semana', 'Plano mensal', 'R$ 420'], ['Aula experimental', 'Conheça o estúdio', 'Grátis']],
            galeriaT: 'O estúdio', difs: [['check', 'Turmas pequenas', 'Até 3 alunos por horário.'], ['escudo', 'Professores formados', 'Fisioterapeutas e educadores físicos.'], ['relogio', 'Reposição de aulas', 'Faltou? Remarca na mesma semana.']],
            hora: [['Seg a sex', '6h às 21h'], ['Sábado', '8h às 12h']], ate: '21h', fimT: 'Sua primeira aula é por nossa conta.'
        },
        oficina: {
            rotulo: 'Oficina mecânica', exemplo: 'Auto Center Silva',
            titulo: 'Seu carro nas mãos de quem entende.', texto: 'Mecânica geral, revisão e diagnóstico. Você aprova o orçamento antes de qualquer serviço.',
            cta: 'Pedir orçamento', msg: 'Olá! Gostaria de um orçamento para o meu carro.',
            precosT: 'Serviços', precosS: 'Orçamento sem compromisso pelo WhatsApp.',
            precos: [['Troca de óleo', 'Com filtro', 'a partir de R$ 150'], ['Revisão completa', 'Checklist de 30 itens', 'a partir de R$ 250'], ['Freios', 'Pastilhas e discos', 'sob orçamento'], ['Diagnóstico', 'Scanner automotivo', 'R$ 80']],
            galeriaT: 'Nossos trabalhos', difs: [['check', 'Orçamento antes', 'Nada é feito sem a sua aprovação.'], ['escudo', 'Garantia no serviço', 'Peças e mão de obra garantidas.'], ['relogio', 'Prazo combinado', 'Seu carro pronto no dia certo.']],
            hora: [['Seg a sex', '8h às 18h'], ['Sábado', '8h às 12h']], ate: '18h', fimT: 'Mande o modelo e o problema.'
        },
        construcao: {
            rotulo: 'Material de construção', exemplo: 'Casa da Obra',
            titulo: 'Tudo pra sua obra, perto de você.', texto: 'Básico, elétrica, hidráulica e acabamento, com orçamento rápido pelo WhatsApp.',
            cta: 'Mandar minha lista', msg: 'Olá! Quero um orçamento de materiais. Segue a lista:',
            precosT: 'O que você encontra', precosS: 'Mande a lista e a gente responde com o orçamento.',
            precos: [['Material básico', 'Cimento, areia, tijolo', 'consulte'], ['Elétrica', 'Fios, disjuntores, tomadas', 'consulte'], ['Hidráulica', 'Tubos e conexões', 'consulte'], ['Entrega', 'Na sua obra', 'consulte']],
            galeriaT: 'A loja', difs: [['check', 'Orçamento rápido', 'Mande a lista por foto mesmo.'], ['caminhao', 'Entrega na região', 'Direto na sua obra.'], ['escudo', 'Marcas confiáveis', 'Material que dura.']],
            hora: [['Seg a sex', '7h às 18h'], ['Sábado', '7h às 13h']], ate: '18h', fimT: 'Tem uma lista de material?'
        },
        contabilidade: {
            rotulo: 'Contabilidade', exemplo: 'Contábil Ribeirão',
            titulo: 'Contabilidade sem complicação.', texto: 'Abertura de empresa, impostos e folha de pagamento, explicados de um jeito simples.',
            cta: 'Falar com um contador', msg: 'Olá! Gostaria de um orçamento de contabilidade.',
            precosT: 'Serviços', precosS: 'Para MEI, microempresas e pequenas empresas.',
            precos: [['Abertura de empresa', 'CNPJ e alvarás', 'sob orçamento'], ['Contabilidade mensal', 'Impostos e obrigações', 'a partir de R$ 300'], ['Folha de pagamento', 'Admissão e holerites', 'sob orçamento'], ['Troca de contador', 'Sem dor de cabeça', 'grátis']],
            galeriaT: 'O escritório', difs: [['check', 'Atendimento próximo', 'Fale direto com quem cuida da sua empresa.'], ['relogio', 'Prazos em dia', 'Nada de multa por atraso.'], ['escudo', 'Tudo explicado', 'Sem termo difícil.']],
            hora: [['Seg a sex', '8h às 18h'], ['Sábado', 'Fechado']], ate: '18h', fimT: 'Vamos cuidar da sua empresa?'
        },
        petshop: {
            rotulo: 'Pet shop', exemplo: 'Pet Feliz',
            titulo: 'Banho e tosa com carinho.', texto: 'Seu pet bem cuidado, cheiroso e feliz. Com leva e traz na região.',
            cta: 'Agendar banho e tosa', msg: 'Olá! Quero agendar um banho e tosa.',
            precosT: 'Serviços e preços', precosS: 'Os valores mudam conforme o porte.',
            precos: [['Banho', 'Porte pequeno', 'R$ 50'], ['Banho e tosa', 'Porte pequeno', 'R$ 80'], ['Tosa higiênica', 'Patas, barriga e rosto', 'R$ 35'], ['Leva e traz', 'Na região', 'consulte']],
            galeriaT: 'Nossos clientes', difs: [['coracao', 'Carinho e paciência', 'Cada pet no seu tempo.'], ['escudo', 'Produtos seguros', 'Linha própria para cães e gatos.'], ['caminhao', 'Leva e traz', 'A gente busca e entrega.']],
            hora: [['Seg a sex', '8h às 18h'], ['Sábado', '8h às 14h']], ate: '18h', fimT: 'Seu pet merece esse cheirinho.'
        },
        outro: {
            rotulo: 'Comércio e serviços', exemplo: 'Seu Negócio',
            titulo: 'Atendimento de qualidade, perto de você.', texto: 'Conheça o que a gente faz e fale direto com a gente pelo WhatsApp.',
            cta: 'Chamar no WhatsApp', msg: 'Olá! Vi a página de vocês e quero mais informações.',
            precosT: 'O que a gente faz', precosS: 'Preços e condições pelo WhatsApp.',
            precos: [['Serviço principal', 'O carro-chefe da casa', 'R$ 00'], ['Segundo serviço', 'Descrição curta', 'R$ 00'], ['Terceiro serviço', 'Descrição curta', 'R$ 00'], ['Orçamento', 'Sem compromisso', 'grátis']],
            galeriaT: 'Fotos', difs: [['check', 'Atendimento de perto', 'Você fala com quem resolve.'], ['estrela', 'Qualidade', 'Feito com cuidado.'], ['relogio', 'Resposta rápida', 'No mesmo dia útil.']],
            hora: [['Seg a sex', '8h às 18h'], ['Sábado', '8h às 12h']], ate: '18h', fimT: 'Fale com a gente.'
        }
    };

    // [cor, nome, fundo suave, cor de texto legível sobre claro]
    const CORES = {
        laranja: ['#FF5A1F', 'Laranja', '#FFE4D8', '#B53A0A'],
        vermelho: ['#DC2626', 'Vermelho', '#FDE2E2', '#B91C1C'],
        rosa: ['#E0457B', 'Rosa', '#FCE3EC', '#B42A5C'],
        roxo: ['#7C3AED', 'Roxo', '#EDE4FD', '#6D28D9'],
        azul: ['#2563EB', 'Azul', '#DFE8FD', '#1D4ED8'],
        verde: ['#15803D', 'Verde', '#DDF1E4', '#15803D'],
        dourado: ['#C99A2E', 'Dourado', '#F6EDD5', '#8A6514'],
        grafite: ['#2B2E35', 'Grafite', '#E6E7EA', '#2B2E35']
    };
    const ESTILOS = {
        moderno: ['Moderno', 'Escuro e marcante'],
        elegante: ['Elegante', 'Claro e refinado'],
        vibrante: ['Vibrante', 'Sua cor em destaque']
    };
    const SECOES = {
        precos: ['Serviços e preços', 'O que vocês fazem e quanto custa'],
        galeria: ['Fotos', 'O trabalho e o espaço de vocês'],
        diferenciais: ['Diferenciais', 'Por que escolher vocês'],
        local: ['Endereço e horários', 'Mapa e horário de funcionamento']
    };

    // ---------- Utilidades ----------
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const lum = (hex) => {
        const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    // texto escuro ou branco sobre a cor, o que tiver mais contraste
    const sobre = (hex) => ((1.05) / (lum(hex) + 0.05) >= (lum(hex) + 0.05) / (0.0129 + 0.05) ? '#FFFFFF' : '#16181D');
    const iniciais = (nome) => (nome.trim().match(/[A-Za-zÀ-ú]/) || ['M'])[0].toUpperCase();

    // ---------- Estado (aceita link pré-preenchido) ----------
    const q = new URLSearchParams(window.location.search);
    const lerSec = (v) => new Set((v || 'precos,galeria,diferenciais,local').split(',').filter((s) => SECOES[s]));
    const estado = {
        nome: (q.get('nome') || '').slice(0, 36),
        bairro: (q.get('bairro') || '').slice(0, 28),
        nicho: NICHOS[q.get('nicho')] ? q.get('nicho') : 'barbearia',
        cor: CORES[q.get('cor')] ? q.get('cor') : 'laranja',
        estilo: ESTILOS[q.get('estilo')] ? q.get('estilo') : 'moderno',
        sec: lerSec(q.get('sec'))
    };
    const veioPersonalizado = Boolean(q.get('nome'));

    // ---------- A página do cliente ----------
    function pagina(e) {
        const N = NICHOS[e.nicho];
        const C = CORES[e.cor];
        const nome = e.nome.trim() || N.exemplo;
        const local = e.bairro.trim() ? `${e.bairro.trim()}, Ribeirão Preto` : 'Ribeirão Preto';
        const tem = (s) => (e.sec.has(s) ? '' : ' oculta');
        const arteClara = e.estilo === 'elegante' ? ' clara' : '';
        const arte = (legenda, cls = '') => `<div class="pv-arte${arteClara}${cls}">${ic(e.nicho)}<em>${legenda}</em></div>`;
        const estilo = `--ac:${C[0]};--ac-on:${sobre(C[0])};--ac-soft:${C[2]};--ac-ink:${C[3]}`;

        return `<div class="pv ${e.estilo}" style="${estilo}">
            <header class="pv-top">
                <div class="pv-logo"><i>${esc(iniciais(nome))}</i><span class="pv-nome">${esc(nome)}</span></div>
                <span class="pv-menu">${ic('menu')}</span>
            </header>
            <section class="pv-hero">
                <span class="pv-eyebrow">${esc(N.rotulo)}</span>
                <h3 class="pv-h1">${esc(N.titulo)}</h3>
                <p>${esc(N.texto)}</p>
                <div class="pv-acoes">
                    <button class="pv-btn" data-pv-acao type="button">${WHATS}${esc(N.cta)}</button>
                    <button class="pv-btn sec" data-pv-acao type="button">${e.sec.has('precos') ? 'Ver serviços e preços' : 'Como chegar'}</button>
                </div>
                <div class="pv-chips">
                    <span class="pv-chip"><span class="on"></span>Aberto hoje até ${N.ate}</span>
                    <span class="pv-chip">${ic('pin')}${esc(local)}</span>
                </div>
                ${arte('Sua foto aqui', ' pv-capa')}
            </section>
            <section class="pv-sec${tem('precos')}">
                <h3>${esc(N.precosT)}</h3>
                <p class="pv-sub">${esc(N.precosS)}</p>
                <div class="pv-lista">${N.precos.map(([t, d, p]) => `<div class="pv-item"><div><b>${esc(t)}</b><small>${esc(d)}</small></div><span class="pv-preco">${esc(p)}</span></div>`).join('')}</div>
                <p class="pv-nota">Preços de exemplo. Na sua página entram os seus.</p>
            </section>
            <section class="pv-sec${tem('galeria')}">
                <h3>${esc(N.galeriaT)}</h3>
                <p class="pv-sub">As fotos de vocês entram aqui.</p>
                <div class="pv-galeria">${arte('Foto 1')}${arte('Foto 2')}${arte('Foto 3')}</div>
            </section>
            <section class="pv-sec${tem('diferenciais')}">
                <h3>Por que escolher a gente</h3>
                <div class="pv-difs">${N.difs.map(([i, t, d]) => `<div class="pv-dif"><i>${ic(i)}</i><div><b>${esc(t)}</b><span>${esc(d)}</span></div></div>`).join('')}</div>
            </section>
            <section class="pv-sec${tem('local')}">
                <h3>Onde estamos</h3>
                <div class="pv-local">
                    <div class="pv-mapa"></div>
                    <div class="pv-local-tx"><b>${esc(local)}</b><span>Endereço completo de vocês</span>
                        ${N.hora.map(([d, h]) => `<div class="pv-hora"><span>${d}</span><strong>${h}</strong></div>`).join('')}
                    </div>
                </div>
            </section>
            <section class="pv-final">
                <h4>${esc(N.fimT)}</h4>
                <p>Resposta rápida pelo WhatsApp.</p>
                <button class="pv-btn" data-pv-acao type="button">${WHATS}${esc(N.cta)}</button>
            </section>
            <footer class="pv-rodape">
                <b>${esc(nome)}</b><span>${esc(local)}</span>
                <span class="pv-feito"><span class="duo" aria-hidden="true"><i><b></b><b></b></i><i><b></b><b></b></i></span>Página feita pela MovCode</span>
            </footer>
            <button class="pv-whats" data-pv-acao type="button" aria-label="WhatsApp">${WHATS}</button>
        </div>`;
    }

    // ---------- Escala das telas ----------
    const escala = new ResizeObserver((itens) => {
        itens.forEach((item) => {
            const { width: largura, height: altura } = item.contentRect;
            const zoom = item.target.querySelector('.zoom');
            if (!largura || !zoom) return;
            const k = largura / L;
            zoom.style.setProperty('--k', String(k));
            zoom.style.setProperty('--alt', `${Math.ceil(altura / k)}px`);
        });
    });
    document.querySelectorAll('.celular .tela').forEach((tela) => escala.observe(tela));

    // ---------- Leque da abertura: o mesmo negócio em 3 estilos (ou 3 negócios) ----------
    const leque = veioPersonalizado || q.get('nicho')
        ? [{ ...estado, estilo: 'elegante', cor: estado.cor === 'laranja' ? 'dourado' : estado.cor }, { ...estado, estilo: 'moderno' }, { ...estado, estilo: 'vibrante', cor: estado.cor === 'laranja' ? 'azul' : estado.cor }]
        : [
            { nome: 'Clínica Bem Estar', bairro: '', nicho: 'estetica', cor: 'rosa', estilo: 'elegante', sec: lerSec() },
            { nome: 'Barbearia do João', bairro: '', nicho: 'barbearia', cor: 'laranja', estilo: 'moderno', sec: lerSec() },
            { nome: 'Pet Feliz', bairro: '', nicho: 'petshop', cor: 'azul', estilo: 'vibrante', sec: lerSec() }
        ];
    document.querySelectorAll('[data-mostra]').forEach((cel) => {
        cel.querySelector('.zoom').innerHTML = pagina(leque[Number(cel.dataset.mostra)]);
    });

    // Abertura personalizada quando o link vem com nome
    if (veioPersonalizado) {
        const saudacao = document.querySelector('[data-saudacao]');
        if (saudacao) saudacao.textContent = `feita pra ${estado.nome}`;
    }

    // ---------- Montador ----------
    const preview = document.querySelector('[data-preview]');
    const rolagem = document.querySelector('[data-preview-scroll]');
    const passos = [...document.querySelectorAll('.passo-m')];
    const total = 5;
    let passo = 1;

    // Opções
    const cx = (sel) => document.querySelector(`[data-opcoes="${sel}"]`);
    cx('nicho').innerHTML = Object.entries(NICHOS).map(([k, n]) => `<button type="button" class="tipo" data-v="${k}"><span class="ic">${ic(k)}</span>${n.rotulo.replace('Clínica de estética', 'Estética').replace('Material de construção', 'Construção').replace('Estúdio de pilates', 'Pilates').replace('Oficina mecânica', 'Oficina').replace('Comércio e serviços', 'Outro')}</button>`).join('');
    cx('cor').innerHTML = Object.entries(CORES).map(([k, c]) => `<button type="button" class="cor-op" data-v="${k}"><i style="background:${c[0]};color:${sobre(c[0])}">${ic('check')}</i>${c[1]}</button>`).join('');
    cx('sec').innerHTML = Object.entries(SECOES).map(([k, s]) => `<button type="button" class="sec-op" data-v="${k}"><span>${s[0]}<small>${s[1]}</small></span><span class="chave" aria-hidden="true"></span></button>`).join('');
    const amostras = () => {
        const C = CORES[estado.cor];
        const on = sobre(C[0]);
        cx('estilo').innerHTML = Object.entries(ESTILOS).map(([k, s]) => {
            const fundo = k === 'moderno' ? '#111214' : k === 'elegante' ? '#FBF8F3' : C[0];
            const letra = k === 'moderno' ? '#fff' : k === 'elegante' ? '#1E1B17' : on;
            const fonte = k === 'moderno' ? '"Bricolage Grotesque"' : k === 'elegante' ? 'Fraunces, Georgia, serif' : 'Outfit';
            const peso = k === 'elegante' ? 500 : 800;
            const botao = k === 'vibrante' ? on : C[0];
            const borda = k === 'elegante' ? 'border:1px solid #E9E2D6;' : '';
            return `<button type="button" class="estilo-op" data-v="${k}" aria-pressed="${estado.estilo === k}"><span class="amostra" style="background:${fundo};${borda}"><b style="color:${letra};font-family:${fonte};font-weight:${peso}">Aa</b><span style="background:${botao};border-radius:${k === 'elegante' ? '3px' : '999px'}"></span></span><strong>${s[0]}</strong><small>${s[1]}</small></button>`;
        }).join('');
    };

    const nomeInput = document.getElementById('spNome');
    const bairroInput = document.getElementById('spBairro');
    nomeInput.value = estado.nome;
    bairroInput.value = estado.bairro;

    function linkMontagem() {
        const p = new URLSearchParams({ nicho: estado.nicho, cor: estado.cor, estilo: estado.estilo, sec: [...estado.sec].join(',') });
        if (estado.nome.trim()) p.set('nome', estado.nome.trim());
        if (estado.bairro.trim()) p.set('bairro', estado.bairro.trim());
        return p;
    }

    function desenhar() {
        const topo = rolagem.scrollTop;
        preview.innerHTML = pagina(estado);
        rolagem.scrollTop = topo;

        document.querySelectorAll('[data-opcoes="nicho"] [data-v]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === estado.nicho)));
        document.querySelectorAll('[data-opcoes="cor"] [data-v]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === estado.cor)));
        document.querySelectorAll('[data-opcoes="sec"] [data-v]').forEach((b) => b.setAttribute('aria-pressed', String(estado.sec.has(b.dataset.v))));
        amostras();
        nomeInput.placeholder = `Ex.: ${NICHOS[estado.nicho].exemplo}`;

        try { history.replaceState(null, '', `?${linkMontagem().toString()}`); } catch { /* segue */ }
    }

    // Pisca a prévia para o olho perceber a mudança
    function trocar(fn, rolarPara) {
        const pv = preview.querySelector('.pv');
        pv?.classList.add('trocando');
        setTimeout(() => {
            fn();
            desenhar();
            if (rolarPara === 'topo') rolagem.scrollTo({ top: 0, behavior: 'smooth' });
            else if (rolarPara) {
                const alvo = preview.querySelectorAll('.pv-sec')[Object.keys(SECOES).indexOf(rolarPara)];
                if (alvo && !alvo.classList.contains('oculta')) {
                    rolagem.scrollTo({ top: Math.max(0, alvo.offsetTop - 70), behavior: 'smooth' });
                }
            }
        }, 120);
    }

    document.querySelector('[data-opcoes="nicho"]').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-v]');
        if (b) trocar(() => { estado.nicho = b.dataset.v; }, 'topo');
    });
    document.querySelector('[data-opcoes="cor"]').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-v]');
        if (b) trocar(() => { estado.cor = b.dataset.v; });
    });
    document.querySelector('[data-opcoes="estilo"]').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-v]');
        if (b) trocar(() => { estado.estilo = b.dataset.v; }, 'topo');
    });
    document.querySelector('[data-opcoes="sec"]').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-v]');
        if (!b) return;
        const v = b.dataset.v;
        trocar(() => { if (estado.sec.has(v)) estado.sec.delete(v); else estado.sec.add(v); }, estado.sec.has(v) ? null : v);
    });
    nomeInput.addEventListener('input', () => { estado.nome = nomeInput.value.slice(0, 36); desenhar(); });
    bairroInput.addEventListener('input', () => { estado.bairro = bairroInput.value.slice(0, 28); desenhar(); });
    [nomeInput, bairroInput].forEach((campo) => campo.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') { ev.preventDefault(); irPara(passo + 1); }
    }));

    // Toque nos botões da prévia: explica o que acontece na página de verdade
    const aviso = document.createElement('div');
    aviso.className = 'sp-aviso';
    aviso.setAttribute('role', 'status');
    document.body.appendChild(aviso);
    let avisoTempo;
    preview.addEventListener('click', (ev) => {
        if (!ev.target.closest('[data-pv-acao]')) return;
        aviso.innerHTML = `<b>Na sua página, esse botão abre o seu WhatsApp</b>com a mensagem: “${esc(NICHOS[estado.nicho].msg)}”`;
        aviso.classList.add('on');
        clearTimeout(avisoTempo);
        avisoTempo = setTimeout(() => aviso.classList.remove('on'), 3600);
    });

    // Navegação entre os passos
    const btnVoltar = document.querySelector('[data-voltar]');
    const btnAvancar = document.querySelector('[data-avancar]');
    const montador = document.getElementById('montador');
    const celularPequeno = window.matchMedia('(max-width: 900px)');

    function irPara(n, rolar = true) {
        passo = Math.max(1, Math.min(total + 1, n));
        passos.forEach((el) => { el.hidden = Number(el.dataset.passo) !== passo; });
        document.querySelector('[data-passo-atual]').textContent = String(Math.min(passo, total));
        document.querySelector('[data-progresso]').style.width = `${(Math.min(passo, total + 1) / (total + 1)) * 100}%`;
        btnVoltar.hidden = passo === 1;
        btnVoltar.textContent = passo === total + 1 ? 'Mudar alguma coisa' : 'Voltar';
        btnAvancar.hidden = passo === total + 1;
        btnAvancar.firstChild.textContent = passo === total ? 'Ver como ficou ' : 'Próximo ';
        if (passo === total + 1) final();
        if (passo === 2 && !celularPequeno.matches) setTimeout(() => nomeInput.focus({ preventScroll: true }), 50);
        if (rolar && celularPequeno.matches) montador.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (typeof window.rastrear === 'function' && rolar) window.rastrear('sp_passo', { passo });
    }
    btnVoltar.addEventListener('click', () => irPara(passo === total + 1 ? 1 : passo - 1));
    btnAvancar.addEventListener('click', () => irPara(passo + 1));

    // Final: resumo, preço e WhatsApp
    function final() {
        const N = NICHOS[estado.nicho];
        const C = CORES[estado.cor];
        const nome = estado.nome.trim();
        document.querySelector('[data-nome-final]').textContent = nome || 'vocês';
        document.querySelector('[data-resumo]').innerHTML = [
            N.rotulo,
            `<i style="background:${C[0]}"></i>${C[1]}`,
            ESTILOS[estado.estilo][0],
            `${estado.sec.size} ${estado.sec.size === 1 ? 'seção' : 'seções'}`
        ].map((t) => `<li>${t}</li>`).join('');

        const linhas = [
            'Oi Kaique! Montei a minha página na prévia da MovCode:',
            `• Negócio: ${nome || '(ainda sem nome)'}${estado.bairro.trim() ? ` (${estado.bairro.trim()})` : ''}`,
            `• Tipo: ${N.rotulo}`,
            `• Cor: ${C[1]}`,
            `• Estilo: ${ESTILOS[estado.estilo][0]}`,
            `• Seções: ${[...estado.sec].map((s) => SECOES[s][0]).join(', ') || 'só o topo'}`,
            '',
            'Quero a minha assim!',
            `${window.location.origin}${window.location.pathname}?${linkMontagem().toString()}`
        ];
        const texto = linhas.join('\n');
        const url = typeof window.linkWhatsapp === 'function'
            ? window.linkWhatsapp(texto)
            : `https://wa.me/5516982157266?text=${encodeURIComponent(texto)}`;
        const quero = document.querySelector('[data-quero]');
        quero.href = url;
        quero.target = '_blank';
        quero.rel = 'noopener noreferrer';
    }
    document.querySelector('[data-quero]').addEventListener('click', () => {
        if (typeof window.rastrear === 'function') {
            window.rastrear('generate_lead', { servico: 'Landing page (sua-pagina)', nicho: estado.nicho, estilo: estado.estilo, pagina: window.location.pathname });
        }
    });

    desenhar();
    irPara(1, false);
})();
