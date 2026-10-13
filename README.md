# MovCode

Site institucional da **MovCode**, em [movcode.com.br](https://movcode.com.br).

> Tecnologia do tamanho do seu negócio.

Sites, lojas virtuais, sistemas de gestão e automações sob medida, do mercadinho à indústria. Ribeirão Preto/SP, com atendimento para todo o Brasil.

## Páginas

| URL | Arquivo | Conteúdo |
| --- | --- | --- |
| `/` | `index.html` | Página inicial: soluções, como funciona, produtos, dúvidas e contato |
| `/diagnostico` | `diagnostico.html` | Landing page do diagnóstico gratuito de 30 minutos |
| `/criacao-de-sites` | `criacao-de-sites.html` | Sites e landing pages |
| `/loja-virtual` | `loja-virtual.html` | Redireciona para o site da Lojinha Pronta (lojinhapronta.vercel.app) |
| `/sistema-para-mercadinho` | `sistema-para-mercadinho.html` | Sistema de gestão para comércio |
| `/sistema-para-laboratorio` | `sistema-para-laboratorio.html` | Redireciona para o site do ForLabs (www.forlabs.com.br) |
| `/sistema-para-condominio` | `sistema-para-condominio.html` | ForCondom (em breve), economia do condomínio |
| `/sistema-para-barbearia` | `sistema-para-barbearia.html` | ForBarber (em breve), agendamento para barbearias |
| `/cardapio-digital` | `cardapio-digital.html` | Pratuca (em breve), cardápio digital com pedido no WhatsApp |
| `/automacoes` | `automacoes.html` | Automação de processos |
| `/integracoes` | `integracoes.html` | Integração de sistemas |
| `/paineis` | `paineis.html` | Painéis de gestão |
| `/consultoria` | `consultoria.html` | Consultoria em tecnologia |
| `/sobre` | `sobre.html` | Sobre a MovCode: como trabalhamos, produtos e segurança |
| `/projetos` | `projetos.html` | Projetos no ar (Cordeirinhos de Cristo, ForLabs e Lojinha Pronta), cada um com a identidade do próprio site, e os produtos em construção |
| `/sua-pagina` | `sua-pagina.html` | Prévia editável da página do negócio (não indexada) |
| `/blog/` | `blog/index.html` | Índice do blog |
| `/blog/<guia>` | `blog/<guia>.html` | Guias do blog (fiado, site ou Instagram, custo de um sistema) |
| `/politica` | `politica.html` | Política de Privacidade |
| `/termo` | `termo.html` | Termos de Uso |
| — | `404.html` | Página de erro |

`processo.html`, `servicos.html`, `loja-virtual.html` e `sistema-para-laboratorio.html` são endereços antigos: só redirecionam (para a seção certa da página inicial ou, no caso da Lojinha Pronta e do ForLabs, para o site próprio de cada um) e não são indexados.

## Estrutura

```
.
├── *.html                 páginas do site (uma por URL)
├── blog/                  índice e guias do blog (caminhos absolutos: /assets/...)
├── assets/
│   ├── css/
│   │   ├── site.css       estilos compartilhados por todas as páginas (cabeçalho com menu, rodapé)
│   │   ├── home.css       componentes da página inicial, reaproveitados pelas internas
│   │   └── interna.css    peças próprias das páginas internas no estilo da home
│   ├── js/
│   │   ├── site.js        WhatsApp, formulários, Analytics/Meta Pixel e transições
│   │   ├── home.js        animações da página inicial (também usado pelas internas)
│   │   ├── interna.js     animações próprias das páginas internas
│   │   └── vendor/        GSAP, ScrollTrigger e Lenis (versões minificadas)
│   └── images/
│       ├── icons/         favicon e ícones do app
│       ├── logos/         símbolo da marca em SVG
│       ├── marcas/        logos das marcas dos projetos (ForLabs, Cordeirinhos de Cristo)
│       ├── og/            imagem de compartilhamento (1200×630)
│       └── projects/      imagens dos projetos
├── site.webmanifest
├── sitemap.xml
├── robots.txt
└── CNAME                  domínio do GitHub Pages
```

Não há build nem dependências: é HTML, CSS e JavaScript puros.

## Rodando localmente

Qualquer servidor estático serve. Por exemplo:

```bash
python3 -m http.server 8000
```

Depois é só abrir [http://localhost:8000](http://localhost:8000). Localmente, os links sem `.html` (como `/diagnostico`) podem não abrir; acesse `/diagnostico.html` nesse caso.

## Configurações rápidas

As configurações ficam no topo de `assets/js/site.js`, em `MOVCODE_CONFIG`:

- **`whatsappNumber`**: número do WhatsApp (código do país + DDD + número, sem símbolos). Todo link com `data-whatsapp` é reescrito a partir dele.
- **`whatsappMensagem`**: mensagem padrão que abre no WhatsApp.
- **`metaPixelId`**: ID do Meta Pixel. Vazio, o pixel fica desligado.

O ID do Google Analytics (GA4) fica no `<head>` de cada página.

## Publicação

O site é publicado pelo **GitHub Pages** a partir da branch `main`, no domínio definido em `CNAME`. Um merge na `main` já coloca a alteração no ar.

Ao criar ou remover uma página, atualize também:

- `sitemap.xml`;
- os links do rodapé (presentes em todas as páginas) e da página `404.html`;
- o `<title>`, a `description`, o `canonical` e as tags `og:*` da própria página.

## Convenções

- Textos em português do Brasil, com títulos em caixa normal (só a primeira letra maiúscula).
- Links internos sem `.html` (`/diagnostico`, não `/diagnostico.html`).
- As perguntas de cada página aparecem também nos dados estruturados (`FAQPage`); ao mudar uma, mude a outra.
- Formatação definida em `.editorconfig`: UTF-8, quebra de linha CRLF e 4 espaços de indentação.

## Licença

[MIT](LICENSE) © MovCode
