/* -------------------------------------------------------------------------
   MovCode — /sua-pagina
   Editor de landing page. A prévia é a própria página do cliente: ele toca
   num texto e edita ali mesmo; tipo, nome, cor, estilo e seções ficam nas
   ferramentas (gaveta no celular, painel no computador).
   "Quero a minha assim" abre o WhatsApp com as escolhas e o link da montagem,
   que reabre a página exatamente como ficou (textos editados vão no "t").

   Link pronto para mandar a um lead (todos os parâmetros são opcionais):
   movcode.com.br/sua-pagina?nome=Box%2004%20Barbershop&nicho=barbearia&bairro=Centro
   nicho:  barbearia | estetica | pilates | oficina | construcao | contabilidade | petshop | outro
   cor:    laranja | vermelho | rosa | roxo | azul | verde | dourado | grafite
   estilo: moderno | elegante | vibrante
   sec:    precos,galeria,diferenciais,local  (as visíveis, na ordem em que aparecem)
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
    // Barra de status do aparelho (hora, ilha da câmera, sinal, Wi-Fi e bateria)
    const STATUS = '<div class="pv-status" aria-hidden="true"><span class="pv-relogio">9:41</span><span class="pv-ilha"></span><span class="pv-sinais">'
        + '<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7.5" width="3" height="4.5" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>'
        + '<svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1.6 4.4a9.2 9.2 0 0 1 12.8 0"/><path d="M4.4 7.3a5.2 5.2 0 0 1 7.2 0"/><circle cx="8" cy="10.2" r="1.3" fill="currentColor" stroke="none"/></svg>'
        + '<svg width="27" height="13" viewBox="0 0 27 13" fill="currentColor"><rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2.4"/><path d="M25 4.4v4.2a2.2 2.2 0 0 0 0-4.2z" opacity=".45"/></svg>'
        + '</span></div>';

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
    const rastrear = (evento, dados) => { if (typeof window.rastrear === 'function') window.rastrear(evento, dados); };
    const guardado = {
        ler() { try { return JSON.parse(localStorage.getItem('sp-textos') || '{}') || {}; } catch { return {}; } },
        gravar(v) { try { localStorage.setItem('sp-textos', JSON.stringify(v)); } catch { /* segue sem guardar */ } }
    };

    // ---------- Textos editáveis ----------
    // Cada texto da página tem uma chave. O que a pessoa digita fica em estado.textos[nicho][chave].
    function padroes(N) {
        const t = {
            rotulo: N.rotulo, titulo: N.titulo, texto: N.texto, cta: N.cta,
            precosT: N.precosT, precosS: N.precosS,
            galeriaT: N.galeriaT, galeriaS: 'As fotos de vocês entram aqui.',
            difsT: 'Por que escolher a gente',
            localT: 'Onde estamos', endereco: 'Endereço completo de vocês',
            fimT: N.fimT, fimS: 'Resposta rápida pelo WhatsApp.'
        };
        N.precos.forEach((linha, i) => linha.forEach((v, j) => { t[`precos.${i}.${j}`] = v; }));
        N.difs.forEach(([, titulo, desc], i) => { t[`difs.${i}.1`] = titulo; t[`difs.${i}.2`] = desc; });
        N.hora.forEach((linha, i) => linha.forEach((v, j) => { t[`hora.${i}.${j}`] = v; }));
        return t;
    }
    const LIMITE = { nome: 36, titulo: 70, texto: 180, rotulo: 30, cta: 32, precosS: 110, galeriaS: 110, fimS: 110 };
    const limite = (k) => LIMITE[k] || (/^(precos|hora)\./.test(k) ? 40 : 90);

    // ---------- Estado (aceita link pré-preenchido) ----------
    const q = new URLSearchParams(window.location.search);
    const TODAS = Object.keys(SECOES);
    const visiveis = (q.get('sec') ?? 'precos,galeria,diferenciais,local').split(',').filter((s, i, a) => SECOES[s] && a.indexOf(s) === i);
    const estado = {
        nome: (q.get('nome') || '').slice(0, 36),
        bairro: (q.get('bairro') || '').slice(0, 28),
        nicho: NICHOS[q.get('nicho')] ? q.get('nicho') : 'barbearia',
        cor: CORES[q.get('cor')] ? q.get('cor') : 'laranja',
        estilo: ESTILOS[q.get('estilo')] ? q.get('estilo') : 'moderno',
        ordem: [...visiveis, ...TODAS.filter((s) => !visiveis.includes(s))],
        sec: new Set(visiveis),
        textos: guardado.ler()
    };
    try {
        const t = q.get('t') && JSON.parse(q.get('t'));
        if (t && typeof t === 'object') {
            const limpo = {};
            Object.entries(t).forEach(([k, v]) => { if (typeof v === 'string') limpo[k] = v.slice(0, limite(k)); });
            estado.textos[estado.nicho] = limpo;
        }
    } catch { /* link quebrado: segue com os textos padrão */ }
    const meus = () => (estado.textos[estado.nicho] ||= {});
    const veioPersonalizado = Boolean(q.get('nome'));

    // ---------- A página do cliente ----------
    // Endereço de exemplo na barra do navegador: "Barbearia do João" -> barbeariadojoao.com.br
    const dominio = (nome) => `${nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 28) || 'seunegocio'}.com.br`;
    const CADEADO = '<svg width="12" height="13" viewBox="0 0 12 13" aria-hidden="true"><rect x="1" y="5.5" width="10" height="7.5" rx="2" fill="currentColor"/><path d="M3.5 5.5V4a2.5 2.5 0 0 1 5 0v1.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
    const LINKS = { precos: 'Serviços', galeria: 'Fotos', diferenciais: 'Sobre', local: 'Onde estamos' };
    const SETA = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d > 0 ? 'M12 5v14M6 13l6 6 6-6' : 'M12 19V5M6 11l6-6 6 6'}"/></svg>`;
    const OLHO_FECHADO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.9 4.24A9 9 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-2.16 3.19M6.6 6.6A17 17 0 0 0 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5.4-1.6"/><path d="m2 2 20 20"/></svg>';

    // modo 'cel' = página no celular (390px); 'pc' = a mesma página no computador (1200px)
    // editavel = mostra as ferramentas de cada seção e deixa os textos com data-e prontos para editar
    function pagina(e, modo, editavel) {
        const N = NICHOS[e.nicho];
        const C = CORES[e.cor];
        const pc = modo === 'pc';
        const base = padroes(N);
        const ov = e.textos[e.nicho] || {};
        const nome = e.nome.trim() || N.exemplo;
        const local = e.bairro.trim() ? `${e.bairro.trim()}, Ribeirão Preto` : 'Ribeirão Preto';
        // texto editável: <tag data-e="chave">texto</tag>
        const t = (k, tag = 'span', cls = '') => `<${tag}${cls ? ` class="${cls}"` : ''} data-e="${k}">${esc(ov[k] ?? base[k])}</${tag}>`;
        const arteClara = e.estilo === 'elegante' ? ' clara' : '';
        const arte = (legenda, cls = '') => `<div class="pv-arte${arteClara}${cls}">${ic(e.nicho)}<em>${legenda}</em></div>`;
        const estilo = `--ac:${C[0]};--ac-on:${sobre(C[0])};--ac-soft:${C[2]};--ac-ink:${C[3]}`;
        const botao = (cls = '') => `<span class="pv-btn${cls}" data-pv-acao>${WHATS}${t('cta')}</span>`;
        const vis = e.ordem.filter((s) => e.sec.has(s));
        const navegador = pc ? `<div class="pv-navegador" aria-hidden="true"><span class="pv-janela"><i></i><i></i><i></i></span><span class="pv-url">${CADEADO}${esc(dominio(nome))}</span></div>` : '';
        const topoDireita = pc
            ? `<nav class="pv-links">${vis.map((s) => `<span>${LINKS[s]}</span>`).join('')}</nav>${botao(' pv-btn-topo')}`
            : `<span class="pv-menu">${ic('menu')}</span>`;
        const nomeEd = (cls) => `<span class="${cls}" data-e="nome">${esc(nome)}</span>`;

        const ferramenta = (s, i) => (editavel ? `<div class="pv-ed" data-ed="${s}">
                <span class="pv-ed-nome">${SECOES[s][0]}</span>
                <button type="button" data-mover="-1" aria-label="Subir a seção ${SECOES[s][0]}"${i === 0 ? ' disabled' : ''}>${SETA(-1)}</button>
                <button type="button" data-mover="1" aria-label="Descer a seção ${SECOES[s][0]}"${i === vis.length - 1 ? ' disabled' : ''}>${SETA(1)}</button>
                <button type="button" data-ocultar aria-label="Ocultar a seção ${SECOES[s][0]}">${OLHO_FECHADO}</button>
            </div>` : '');
        const SEC = {
            precos: () => `${t('precosT', 'h3')}${t('precosS', 'p', 'pv-sub')}
                <div class="pv-lista">${N.precos.map((_, i) => `<div class="pv-item"><div>${t(`precos.${i}.0`, 'b')}${t(`precos.${i}.1`, 'small')}</div>${t(`precos.${i}.2`, 'span', 'pv-preco')}</div>`).join('')}</div>
                <p class="pv-nota">Preços de exemplo. Na sua página entram os seus.</p>`,
            galeria: () => `${t('galeriaT', 'h3')}${t('galeriaS', 'p', 'pv-sub')}
                <div class="pv-galeria">${arte('Foto 1')}${arte('Foto 2')}${arte('Foto 3')}</div>`,
            diferenciais: () => `${t('difsT', 'h3')}
                <div class="pv-difs">${N.difs.map(([i], n) => `<div class="pv-dif"><i>${ic(i)}</i><div>${t(`difs.${n}.1`, 'b')}${t(`difs.${n}.2`)}</div></div>`).join('')}</div>`,
            local: () => `${t('localT', 'h3')}
                <div class="pv-local">
                    <div class="pv-mapa"></div>
                    <div class="pv-local-tx"><b>${esc(local)}</b>${t('endereco')}
                        ${N.hora.map((_, i) => `<div class="pv-hora">${t(`hora.${i}.0`)}${t(`hora.${i}.1`, 'strong')}</div>`).join('')}
                    </div>
                </div>`
        };
        const ocultas = TODAS.filter((s) => !e.sec.has(s));
        const adicionar = editavel && ocultas.length
            ? `<div class="pv-add"><span>Seções ocultas</span>${ocultas.map((s) => `<button type="button" data-mostrar="${s}">+ ${SECOES[s][0]}</button>`).join('')}</div>`
            : '';

        return `<div class="pv ${e.estilo}${pc ? ' pc' : ''}${editavel ? ' editando' : ''}" style="${estilo}">
            ${navegador}
            <header class="pv-top">
                ${pc ? '' : STATUS}
                <div class="pv-logo"><i>${esc(iniciais(nome))}</i>${nomeEd('pv-nome')}</div>
                ${topoDireita}
            </header>
            <section class="pv-hero">
                <div class="pv-hero-tx">
                    ${t('rotulo', 'span', 'pv-eyebrow')}
                    ${t('titulo', 'h3', 'pv-h1')}
                    ${t('texto', 'p')}
                    <div class="pv-acoes">
                        ${botao()}
                        <span class="pv-btn sec" data-pv-acao>${vis.includes('precos') ? 'Ver serviços e preços' : 'Como chegar'}</span>
                    </div>
                    <div class="pv-chips">
                        <span class="pv-chip"><span class="on"></span>Aberto hoje até ${N.ate}</span>
                        <span class="pv-chip">${ic('pin')}${esc(local)}</span>
                    </div>
                </div>
                ${arte('Sua foto aqui', ' pv-capa')}
            </section>
            ${vis.map((s, i) => `<section class="pv-sec" data-sec="${s}">${ferramenta(s, i)}${SEC[s]()}</section>`).join('')}
            ${adicionar}
            <section class="pv-final">
                ${t('fimT', 'h4')}
                ${t('fimS', 'p')}
                ${botao()}
            </section>
            <footer class="pv-rodape">
                ${nomeEd('pv-rodape-nome')}<span>${esc(local)}</span>
                <span class="pv-feito"><span class="duo" aria-hidden="true"><i><b></b><b></b></i><i><b></b><b></b></i></span>Página feita pela MovCode</span>
            </footer>
            <span class="pv-whats" data-pv-acao aria-hidden="true">${WHATS}</span>
        </div>`;
    }

    // ---------- Elementos ----------
    const montador = document.getElementById('montador');
    const tela = document.querySelector('[data-tela]');
    const escalaEl = tela.querySelector('[data-escala]');
    const preview = tela.querySelector('[data-preview]');
    const dica = document.querySelector('[data-dica]');
    const ferramentas = document.querySelector('[data-ferramentas]');
    const doca = document.querySelector('[data-doca]');
    const gavetaTitulo = document.querySelector('[data-gaveta-titulo]');
    const nomeInput = document.getElementById('spNome');
    const bairroInput = document.getElementById('spBairro');
    const corNome = document.querySelector('[data-cor-nome]');
    const restaurar = document.querySelector('[data-restaurar]');
    const telaGrande = window.matchMedia('(min-width: 1024px)');
    const cx = (sel) => document.querySelector(`[data-opcoes="${sel}"]`);
    let modo = 'cel';
    let editando = true;

    // contenteditable="plaintext-only" evita colar formatação; nem todo navegador aceita
    const SO_TEXTO = (() => { try { const d = document.createElement('div'); d.contentEditable = 'plaintext-only'; return d.contentEditable === 'plaintext-only'; } catch { return false; } })();

    // ---------- Título com o nome do negócio (link personalizado) ----------
    if (veioPersonalizado) {
        const titulo = document.querySelector('[data-titulo]');
        if (titulo) titulo.textContent = `${estado.nome}, monte a página de vocês.`;
    }

    // ---------- Escala ----------
    // Celular: a página no tamanho real. Computador: a página de 1200px encolhida para caber na largura.
    const escalaPc = () => Math.min(1, tela.clientWidth / 1200);
    function escalar() {
        if (modo !== 'pc') { tela.style.removeProperty('--k'); escalaEl.style.removeProperty('height'); return; }
        const k = escalaPc();
        tela.style.setProperty('--k', String(k));
        escalaEl.style.height = `${Math.ceil(preview.offsetHeight * k)}px`;
    }
    new ResizeObserver(escalar).observe(tela);
    new ResizeObserver(escalar).observe(preview);
    // no computador pequeno (ex.: celular no modo Computador) a página fica miúda demais para editar
    const podeEditar = () => editando && (modo === 'cel' || escalaPc() >= 0.6);

    // ---------- Opções das ferramentas ----------
    const CURTO = { estetica: 'Estética', pilates: 'Pilates', oficina: 'Oficina', construcao: 'Construção', outro: 'Outro' };
    cx('nicho').innerHTML = Object.entries(NICHOS).map(([k, n]) => `<button type="button" class="tipo" data-v="${k}" aria-pressed="false">${ic(k)}${CURTO[k] || n.rotulo}</button>`).join('');
    cx('cor').innerHTML = Object.entries(CORES).map(([k, c]) => `<button type="button" class="cor-op" data-v="${k}" aria-pressed="false" aria-label="${c[1]}" title="${c[1]}" style="background:${c[0]};color:${sobre(c[0])}">${ic('check')}</button>`).join('');
    function opcoes() {
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
        const vis = estado.ordem.filter((s) => estado.sec.has(s));
        cx('sec').innerHTML = estado.ordem.map((s) => {
            const on2 = estado.sec.has(s);
            const i = vis.indexOf(s);
            return `<div class="sec-linha${on2 ? '' : ' desligada'}" data-v="${s}">
                <button type="button" class="sec-op" data-alternar aria-pressed="${on2}"><span>${SECOES[s][0]}<small>${SECOES[s][1]}</small></span><span class="chave" aria-hidden="true"></span></button>
                <button type="button" class="sec-mover" data-mover="-1" aria-label="Subir ${SECOES[s][0]}"${!on2 || i === 0 ? ' disabled' : ''}>${SETA(-1)}</button>
                <button type="button" class="sec-mover" data-mover="1" aria-label="Descer ${SECOES[s][0]}"${!on2 || i === vis.length - 1 ? ' disabled' : ''}>${SETA(1)}</button>
            </div>`;
        }).join('');
        document.querySelectorAll('[data-opcoes="nicho"] [data-v]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === estado.nicho)));
        document.querySelectorAll('[data-opcoes="cor"] [data-v]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === estado.cor)));
        if (corNome) corNome.textContent = `· ${C[1]}`;
        nomeInput.placeholder = `Ex.: ${NICHOS[estado.nicho].exemplo}`;
        restaurar.hidden = !Object.keys(meus()).length;
    }
    nomeInput.value = estado.nome;
    bairroInput.value = estado.bairro;

    // ---------- Link da montagem e WhatsApp ----------
    function linkMontagem() {
        const p = new URLSearchParams({ nicho: estado.nicho, cor: estado.cor, estilo: estado.estilo, sec: estado.ordem.filter((s) => estado.sec.has(s)).join(',') });
        if (estado.nome.trim()) p.set('nome', estado.nome.trim());
        if (estado.bairro.trim()) p.set('bairro', estado.bairro.trim());
        if (Object.keys(meus()).length) p.set('t', JSON.stringify(meus()));
        return p;
    }
    function atualizarPedido() {
        const N = NICHOS[estado.nicho];
        const C = CORES[estado.cor];
        const nome = estado.nome.trim();
        const editados = Object.keys(meus()).length;
        const texto = [
            'Oi Kaique! Montei a minha página na prévia da MovCode:',
            `• Negócio: ${nome || '(ainda sem nome)'}${estado.bairro.trim() ? ` (${estado.bairro.trim()})` : ''}`,
            `• Tipo: ${N.rotulo}`,
            `• Cor: ${C[1]}`,
            `• Estilo: ${ESTILOS[estado.estilo][0]}`,
            `• Seções: ${estado.ordem.filter((s) => estado.sec.has(s)).map((s) => SECOES[s][0]).join(', ') || 'só o topo'}`,
            ...(editados ? [`• Textos que mudei: ${editados}`] : []),
            '',
            'Quero a minha assim!',
            `${window.location.origin}${window.location.pathname}?${linkMontagem().toString()}`
        ].join('\n');
        const url = typeof window.linkWhatsapp === 'function'
            ? window.linkWhatsapp(texto)
            : `https://wa.me/5516982157266?text=${encodeURIComponent(texto)}`;
        document.querySelectorAll('[data-quero]').forEach((a) => {
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
        });
    }
    let salvarTempo;
    function salvar() {
        clearTimeout(salvarTempo);
        salvarTempo = setTimeout(() => {
            guardado.gravar(estado.textos);
            atualizarPedido();
            try { history.replaceState(history.state, '', `?${linkMontagem().toString()}`); } catch { /* segue */ }
        }, 250);
    }

    // ---------- Desenho ----------
    function desenhar() {
        const ed = podeEditar();
        preview.innerHTML = pagina(estado, modo, ed);
        if (ed) {
            preview.querySelectorAll('[data-e]').forEach((el) => {
                el.contentEditable = SO_TEXTO ? 'plaintext-only' : 'true';
                el.spellcheck = false;
                el.setAttribute('role', 'textbox');
                el.setAttribute('aria-label', 'Texto da página (toque para editar)');
            });
        }
        tela.dataset.modo = modo;
        dica.textContent = !editando
            ? 'Assim o seu cliente vê a página. Toque nos botões para ver o que acontece.'
            : ed ? (telaGrande.matches ? 'Clique em qualquer texto para editar. Nas seções, use as setas para mudar a ordem.' : 'Toque em qualquer texto para editar. Nas seções, use as setas para mudar a ordem.')
                : 'No computador a página fica assim. Para editar os textos, volte para Celular.';
        opcoes();
        escalar();
        salvar();
    }

    // Pisca a prévia para o olho perceber a mudança; com "foco", rola até a seção que mudou
    function trocar(fn, foco) {
        preview.querySelector('.pv')?.classList.add('trocando');
        setTimeout(() => {
            fn();
            desenhar();
            if (foco) {
                const alvo = preview.querySelector(`[data-sec="${foco}"]`);
                if (alvo) {
                    alvo.classList.add('destaque');
                    if (!ferramentas.dataset.ativo || telaGrande.matches) alvo.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 120);
    }

    // ---------- Seções: mostrar, ocultar e mudar a ordem ----------
    function mover(s, d) {
        const vis = estado.ordem.filter((x) => estado.sec.has(x));
        const i = vis.indexOf(s);
        const j = i + d;
        if (i < 0 || j < 0 || j >= vis.length) return;
        [vis[i], vis[j]] = [vis[j], vis[i]];
        estado.ordem = [...vis, ...estado.ordem.filter((x) => !estado.sec.has(x))];
        trocar(() => {}, s);
        rastrear('sp_secao', { acao: 'mover', secao: s });
    }
    function alternar(s, ligar) {
        trocar(() => {
            if (ligar) {
                estado.sec.add(s);
                // a seção religada volta para o fim da lista de visíveis
                estado.ordem = [...estado.ordem.filter((x) => estado.sec.has(x) && x !== s), s, ...estado.ordem.filter((x) => !estado.sec.has(x))];
            } else estado.sec.delete(s);
        }, ligar ? s : null);
        rastrear('sp_secao', { acao: ligar ? 'mostrar' : 'ocultar', secao: s });
    }

    // ---------- Ferramentas ----------
    cx('nicho').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-v]');
        if (!b || b.dataset.v === estado.nicho) return;
        trocar(() => { estado.nicho = b.dataset.v; });
        rastrear('sp_escolha', { campo: 'nicho', valor: b.dataset.v });
    });
    cx('cor').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-v]');
        if (!b || b.dataset.v === estado.cor) return;
        trocar(() => { estado.cor = b.dataset.v; });
        rastrear('sp_escolha', { campo: 'cor', valor: b.dataset.v });
    });
    cx('estilo').addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-v]');
        if (!b || b.dataset.v === estado.estilo) return;
        trocar(() => { estado.estilo = b.dataset.v; });
        rastrear('sp_escolha', { campo: 'estilo', valor: b.dataset.v });
    });
    cx('sec').addEventListener('click', (ev) => {
        const linha = ev.target.closest('[data-v]');
        if (!linha) return;
        if (ev.target.closest('[data-alternar]')) alternar(linha.dataset.v, !estado.sec.has(linha.dataset.v));
        const m = ev.target.closest('[data-mover]');
        if (m && !m.disabled) mover(linha.dataset.v, Number(m.dataset.mover));
    });
    nomeInput.addEventListener('input', () => { estado.nome = nomeInput.value.slice(0, 36); desenhar(); });
    bairroInput.addEventListener('input', () => { estado.bairro = bairroInput.value.slice(0, 28); desenhar(); });
    [nomeInput, bairroInput].forEach((campo) => campo.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') { ev.preventDefault(); campo.blur(); }
    }));
    restaurar.addEventListener('click', () => {
        trocar(() => { delete estado.textos[estado.nicho]; });
        rastrear('sp_restaurar', { nicho: estado.nicho });
    });

    // ---------- Edição direto na página ----------
    const editado = new Set();
    function sincronizar(origem, k, v) {
        preview.querySelectorAll(`[data-e="${k}"]`).forEach((el) => { if (el !== origem) el.textContent = v; });
    }
    function cursorNoFim(el) {
        const r = document.createRange();
        r.selectNodeContents(el);
        r.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
    }
    preview.addEventListener('input', (ev) => {
        const el = ev.target.closest('[data-e]');
        if (!el) return;
        const k = el.dataset.e;
        let v = el.textContent.replace(/\s*\n\s*/g, ' ');
        if (v.length > limite(k)) { v = v.slice(0, limite(k)); el.textContent = v; cursorNoFim(el); }
        sincronizar(el, k, v);
        if (k === 'nome') {
            estado.nome = v.slice(0, 36);
            nomeInput.value = estado.nome;
            const letra = preview.querySelector('.pv-logo i');
            if (letra) letra.textContent = iniciais(estado.nome || NICHOS[estado.nicho].exemplo);
        } else {
            meus()[k] = v;
            restaurar.hidden = false;
        }
        if (!editado.has(k)) { editado.add(k); rastrear('sp_edicao_texto', { campo: k.split('.')[0] }); }
        salvar();
    });
    preview.addEventListener('focusout', (ev) => {
        const el = ev.target.closest('[data-e]');
        if (!el) return;
        const k = el.dataset.e;
        const v = el.textContent.replace(/\s+/g, ' ').trim();
        // texto apagado volta ao padrão
        if (k === 'nome') {
            estado.nome = v;
            if (!v) { el.textContent = NICHOS[estado.nicho].exemplo; sincronizar(el, k, el.textContent); }
        } else if (!v || v === padroes(NICHOS[estado.nicho])[k]) {
            delete meus()[k];
            el.textContent = padroes(NICHOS[estado.nicho])[k];
            sincronizar(el, k, el.textContent);
            restaurar.hidden = !Object.keys(meus()).length;
        } else {
            meus()[k] = v;
            if (v !== el.textContent) { el.textContent = v; sincronizar(el, k, v); }
        }
        salvar();
    });
    preview.addEventListener('keydown', (ev) => {
        if (!ev.target.closest('[data-e]')) return;
        if (ev.key === 'Enter' || ev.key === 'Escape') { ev.preventDefault(); ev.target.blur(); }
    });
    preview.addEventListener('paste', (ev) => {
        if (SO_TEXTO || !ev.target.closest('[data-e]')) return;
        ev.preventDefault();
        document.execCommand('insertText', false, (ev.clipboardData?.getData('text/plain') || '').replace(/\s+/g, ' '));
    });

    // Toque nos botões da prévia: no modo Ver, explica o que acontece na página de verdade
    const aviso = document.createElement('div');
    aviso.className = 'sp-aviso';
    aviso.setAttribute('role', 'status');
    document.body.appendChild(aviso);
    let avisoTempo;
    function mostrarAviso() {
        aviso.innerHTML = `<b>Na sua página, esse botão abre o seu WhatsApp</b>com a mensagem: “${esc(NICHOS[estado.nicho].msg)}”`;
        aviso.classList.add('on');
        clearTimeout(avisoTempo);
        avisoTempo = setTimeout(() => aviso.classList.remove('on'), 3600);
    }
    preview.addEventListener('click', (ev) => {
        const sec = ev.target.closest('[data-ed]');
        if (sec) {
            const m = ev.target.closest('[data-mover]');
            if (m && !m.disabled) mover(sec.dataset.ed, Number(m.dataset.mover));
            if (ev.target.closest('[data-ocultar]')) alternar(sec.dataset.ed, false);
            return;
        }
        const mais = ev.target.closest('[data-mostrar]');
        if (mais) { alternar(mais.dataset.mostrar, true); return; }
        const acao = ev.target.closest('[data-pv-acao]');
        if (!acao) return;
        if (!podeEditar()) { mostrarAviso(); return; }
        // editando: tocar no botão (fora do texto) já leva para o texto dele
        const texto = acao.querySelector('[data-e]');
        if (texto && !ev.target.closest('[data-e]')) { texto.focus(); cursorNoFim(texto); }
    });

    // ---------- Celular / Computador e Editar / Ver ----------
    function marcar(sel, attr, valor) {
        document.querySelectorAll(sel).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset[attr] === valor)));
    }
    document.querySelectorAll('[data-modo-btn]').forEach((b) => b.addEventListener('click', () => {
        if (b.dataset.modoBtn === modo) return;
        modo = b.dataset.modoBtn;
        marcar('[data-modo-btn]', 'modoBtn', modo);
        trocar(() => {});
        rastrear('sp_modo', { modo });
    }));
    document.querySelectorAll('[data-edicao-btn]').forEach((b) => b.addEventListener('click', () => {
        const on = b.dataset.edicaoBtn === 'on';
        if (on === editando) return;
        editando = on;
        marcar('[data-edicao-btn]', 'edicaoBtn', on ? 'on' : 'off');
        montador.classList.toggle('vendo', !on);
        desenhar();
        rastrear('sp_edicao', { editando: on });
    }));

    // ---------- Gaveta (celular) ----------
    const TITULOS = { negocio: 'Seu negócio', cor: 'Cor', estilo: 'Estilo', secoes: 'Seções' };
    function abrirGaveta(qual) {
        const atual = ferramentas.dataset.ativo;
        if (!qual || atual === qual) { delete ferramentas.dataset.ativo; }
        else {
            ferramentas.dataset.ativo = qual;
            gavetaTitulo.textContent = TITULOS[qual];
            rastrear('sp_ferramenta', { ferramenta: qual });
        }
        doca.querySelectorAll('[data-abrir]').forEach((b) => b.setAttribute('aria-expanded', String(b.dataset.abrir === ferramentas.dataset.ativo)));
        document.documentElement.classList.toggle('sp-gaveta', Boolean(ferramentas.dataset.ativo));
    }
    doca.querySelectorAll('[data-abrir]').forEach((b) => b.addEventListener('click', () => abrirGaveta(b.dataset.abrir)));
    document.querySelector('[data-fechar-gaveta]').addEventListener('click', () => abrirGaveta(null));
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && ferramentas.dataset.ativo) abrirGaveta(null); });
    // tocar na página fecha a gaveta (menos nas ferramentas de seção, que mexem nela)
    preview.addEventListener('pointerdown', (ev) => {
        if (!telaGrande.matches && ferramentas.dataset.ativo && !ev.target.closest('[data-ed], [data-mostrar]')) abrirGaveta(null);
    });
    // a barra de baixo só aparece enquanto o editor está na tela
    new IntersectionObserver(([item]) => {
        doca.classList.toggle('on', item.isIntersecting);
        if (!item.isIntersecting && ferramentas.dataset.ativo) abrirGaveta(null);
    }, { rootMargin: '-80px 0px -40% 0px' }).observe(montador);
    telaGrande.addEventListener('change', () => { abrirGaveta(null); desenhar(); });

    document.querySelectorAll('[data-quero]').forEach((a) => a.addEventListener('click', () => {
        rastrear('generate_lead', { servico: 'Landing page (sua-pagina)', nicho: estado.nicho, estilo: estado.estilo, pagina: window.location.pathname });
    }));

    desenhar();
})();
