"""Gera o blog da MovCode (/blog/ e os artigos) a partir de _blog/artigos.json.

Uso, na raiz do repositório:
    python3 _blog/gerar.py           # gera o índice, todos os artigos e atualiza o sitemap
    python3 _blog/gerar.py --checar  # só confere o artigos.json, sem gravar nada

Para publicar um artigo novo: acrescente um item em _blog/artigos.json e rode o gerador. Campos:
    slug        endereço do artigo (/blog/<slug>), só letras minúsculas, números e hífen
    titulo      título do artigo
    resumo      uma ou duas frases (vira a descrição da página e o texto do cartão)
    tag         assunto curto, por exemplo "Notícias", "Comércio", "Presença online"
    data        AAAA-MM-DD, dia da publicação
    ilustracao  uma das chaves de ILUSTRACOES (veja abaixo)
    corpo       o texto em HTML simples: <p>, <h2>, <ul>/<ol> com <li>, <strong>, <em>, <a href="...">
    fontes      lista de {"titulo", "veiculo", "url", "data"}; obrigatória nos artigos de notícia

O cabeçalho, o rodapé e o <head> vêm do blog/index.html atual (que o resto do site mantém em dia):
o gerador só troca título, descrição, endereço, dados estruturados e o conteúdo do <main>.
As pastas que começam com "_" não vão para o ar no GitHub Pages.
"""
import html
import json
import math
import re
import sys
import unicodedata
from datetime import date
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DADOS = Path(__file__).resolve().parent / "artigos.json"
SITE = "https://movcode.com.br"
IMAGEM = f"{SITE}/assets/images/og/movcode-og.png"
ORG = {"@type": "Organization", "@id": f"{SITE}/#empresa", "name": "MovCode", "url": f"{SITE}/",
       "logo": {"@type": "ImageObject", "url": f"{SITE}/assets/images/icons/icon-512.png"}}
MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]
SETA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'

# o tecniquês e o português de cada termo, no topo do índice
TRADUCOES = [
    ("Deploy", "colocar no ar"),
    ("Back-end", "a parte que ninguém vê"),
    ("API", "um sistema conversando com outro"),
    ("SaaS", "sistema que você assina"),
    ("MVP", "a primeira versão, enxuta"),
    ("Responsivo", "funciona bem no celular"),
]


# ---------------------------------------------------------------------------
# Quebra de linha em português (o mesmo cuidado do resto do site)
# ---------------------------------------------------------------------------
# palavra curta no comeco de palavra, seguida de espaco e de outra palavra (ou de uma tag de texto)
CURTA = re.compile(r"(?<![^\s(“\"'])([^\W\d_]{1,2}[,;:]?|R\$)\s+(?=[^\s<\x00]|\x00)")
# tag de texto logo depois do trecho (o "de" de "Antes de <em>ligar</em>" também fica preso)
EM_LINHA = re.compile(r"<(?:em|b|strong|a|span|small|i)\b")
TOKEN = re.compile(r"(<!--.*?-->|<[^>]+>)|([^<]+)", re.S)
VAZIAS = {"br", "img", "input", "meta", "link", "hr", "source", "wbr", "area", "col", "embed", "param", "track"}
PULAR = {"script", "style", "svg", "title", "textarea", "option", "template", "code", "pre"}
# só o texto corrido ganha a regra do fim do bloco (nas caixinhas das ilustrações não cabe)
TEXTO_CORRIDO = {"p", "li", "dd", "dt", "h1", "h2", "h3", "h4", "h5", "h6", "figcaption", "blockquote", "summary", "td", "th"}
BLOCOS = {"div", "p", "ul", "ol", "li", "section", "article", "aside", "h1", "h2", "h3", "h4", "h5", "h6", "dl", "dd", "dt",
          "table", "tr", "td", "th", "figure", "figcaption", "header", "footer", "nav", "form", "blockquote", "details", "summary"}
PEDACO = re.compile(r"&nbsp;| |\s+|&|[^\s&]+")


def _viuva(partes, ini):
    """Junta as duas últimas palavras do bloco que começa em partes[ini], se as duas forem curtas."""
    textos = [i for i in range(ini, len(partes)) if partes[i][0] and not partes[i][2]]
    corrido = "".join(partes[i][1] for i in textos).replace("&nbsp;", "\u00a0")
    unidades = corrido.split()  # o \u00a0 não separa: palavras já presas contam como uma só
    if sum(len(u.split("\u00a0")) for u in unidades) < 3 or len(unidades) < 2:
        return
    ultima, penultima = unidades[-1], unidades[-2]
    # palavra longa sozinha na linha não incomoda; e duas longas presas podem não caber na coluna
    if "\u00a0" in ultima or len(ultima) > 9 or len(penultima) + len(ultima) > 17:
        return
    viu_palavra = False
    for i in reversed(textos):
        s = partes[i][1]
        pedacos = list(PEDACO.finditer(s))
        for k in range(len(pedacos) - 1, -1, -1):
            p = pedacos[k].group(0)
            if p in ("&nbsp;", "\u00a0"):
                if viu_palavra:
                    return
            elif p.isspace():
                # só o espaço entre duas palavras do mesmo trecho (nunca o recuo entre tags)
                if viu_palavra and k > 0:
                    partes[i][1] = s[:pedacos[k].start()] + "&nbsp;" + s[pedacos[k].end():]
                if viu_palavra:
                    return
            else:
                viu_palavra = True


def amarrar(html):
    """Aplica as duas regras no texto de dentro do <main> e devolve o HTML."""
    ini = html.index("<main")
    fim = html.index("</main>")
    trecho = html[ini:fim]
    partes = []  # [é texto, conteúdo, dentro de svg/script]
    pilha = []  # [nome, índice da primeira parte, tem bloco dentro]
    pular = 0
    tokens = list(TOKEN.finditer(trecho))
    for n, m in enumerate(tokens):
        tag, texto = m.group(1), m.group(2)
        if texto is not None:
            if not pular:
                seguinte = tokens[n + 1].group(1) if n + 1 < len(tokens) else None
                marca = "\x00" if seguinte and EM_LINHA.match(seguinte) else ""
                texto = CURTA.sub(r"\1&nbsp;", texto + marca).replace("\x00", "")
            partes.append([True, texto, bool(pular)])
            continue
        partes.append([False, tag, bool(pular)])
        nome = re.match(r"</?\s*([a-zA-Z0-9-]+)", tag)
        if tag.startswith("<!") or not nome:
            continue
        nome = nome.group(1).lower()
        if tag.startswith("</"):
            while pilha:
                t, comeco, tem_bloco = pilha.pop()
                if t in PULAR:
                    pular -= 1
                if t == nome:
                    if not pular and t in TEXTO_CORRIDO and not tem_bloco:
                        _viuva(partes, comeco)
                    break
        elif nome not in VAZIAS and not tag.endswith("/>"):
            if nome in BLOCOS and pilha:
                pilha[-1][2] = True
            pilha.append([nome, len(partes), False])
            if nome in PULAR:
                pular += 1
    return html[:ini] + "".join(p[1] for p in partes) + html[fim:]


# ---------------------------------------------------------------------------
# As ilustrações (viewBox 400x300). As três primeiras são dos guias; as outras servem para qualquer
# notícia, conforme o assunto.
# ---------------------------------------------------------------------------
def ilustra_fiado():
    linhas = "".join(f'<path d="M84 {y}h176"/>' for y in range(104, 262, 26))
    argolas = "".join(f'<circle cx="{x}" cy="46" r="6"/>' for x in range(96, 262, 22))
    anotacoes = [("Dona Márcia", "R$ 32", 124, False), ("Seu Jorge", "R$ 18,50", 150, True),
                 ("Ana, torre B", "R$ 47", 176, False), ("Zé do gás", "R$ 25", 202, True), ("Lúcia", "R$ 12", 228, False)]
    escrito = "".join(f'<text x="104" y="{y}">{nome}</text><text x="250" y="{y}" text-anchor="end">{valor}</text>'
                      + (f'<path class="bl-risco" d="M100 {y - 6}h156" style="--d:{0.6 if y == 150 else 1.4}s"/>' if riscado else "")
                      for nome, valor, y, riscado in anotacoes)
    itens = "".join(f'<g class="bl-item" style="--d:{0.3 + i * 0.25:.2f}s"><circle cx="{286}" cy="{y}" r="7"/><path d="M282.5 {y}l2.5 2.5 4.5-4.5"/><rect x="298" y="{y - 4}" width="{w}" height="8" rx="4"/><rect x="{336}" y="{y - 4}" width="14" height="8" rx="4" class="bl-item-valor"/></g>'
                    for i, (y, w) in enumerate([(176, 30), (200, 24), (224, 32), (248, 26)]))
    return f'''<svg class="bl-ilustra bl-ilustra-fiado" viewBox="0 0 400 300" aria-hidden="true">
                            <g class="bl-caderno" transform="rotate(-5 172 160)">
                                <rect class="bl-folha" x="70" y="40" width="204" height="234" rx="10"/>
                                <g class="bl-pauta">{linhas}</g>
                                <path class="bl-margem" d="M96 64v204"/>
                                <g class="bl-argolas">{argolas}</g>
                                <text class="bl-caderno-titulo" x="104" y="92">Fiado</text>
                                <g class="bl-mao">{escrito}</g>
                            </g>
                            <g transform="translate(270 98) rotate(-50)"><g class="bl-lapis"><rect x="0" y="-5" width="86" height="10" rx="2" fill="#FF5A1F"/><rect x="70" y="-5" width="16" height="10" fill="#FFB08A"/><path d="M0 -5l-14 5 14 5z" fill="#F5D3B0"/><path d="M-9 -1.8L-14 0l5 1.8z" fill="#2A2D34"/></g></g>
                            <g class="bl-celular">
                                <rect x="262" y="128" width="104" height="160" rx="16" fill="#111214"/>
                                <rect x="268" y="134" width="92" height="148" rx="11" fill="#FFFFFF"/>
                                <text class="bl-celular-titulo" x="278" y="156">A receber</text>
                                {itens}
                            </g>
                        </svg>'''


def ilustra_site():
    grade = "".join(f'<rect x="{262 + c * 32}" y="{150 + l * 32}" width="30" height="30" rx="3" fill="{cor}"/>'
                    for i, cor in enumerate(["#FFE4D8", "#E3E7EE", "#FFD3BE", "#DCE9DF", "#FFB08A", "#E3E7EE", "#F4E3C7", "#FFE4D8", "#DCE9DF"])
                    for c, l in [(i % 3, i // 3)])
    return f'''<svg class="bl-ilustra bl-ilustra-site" viewBox="0 0 400 300" aria-hidden="true">
                            <g class="bl-janela">
                                <rect x="24" y="52" width="228" height="178" rx="12" fill="#FFFFFF" stroke="#E3E0DA" stroke-width="2"/>
                                <path d="M24 64a12 12 0 0 1 12-12h204a12 12 0 0 1 12 12v14H24z" fill="#F1EEE8"/>
                                <circle cx="40" cy="65" r="4" fill="#FF5F57"/><circle cx="53" cy="65" r="4" fill="#FEBC2E"/><circle cx="66" cy="65" r="4" fill="#28C840"/>
                                <rect x="84" y="59" width="132" height="12" rx="6" fill="#FFFFFF"/>
                                <rect x="42" y="96" width="112" height="12" rx="6" fill="#111214"/>
                                <rect x="42" y="114" width="84" height="12" rx="6" fill="#111214"/>
                                <rect x="42" y="136" width="104" height="6" rx="3" fill="#C9CCD3"/>
                                <rect x="42" y="148" width="92" height="6" rx="3" fill="#C9CCD3"/>
                                <rect class="bl-botao" x="42" y="166" width="72" height="22" rx="11" fill="#FF5A1F"/>
                                <rect x="168" y="94" width="66" height="94" rx="9" fill="#FFE4D8"/>
                                <circle cx="190" cy="118" r="8" fill="#FFB08A"/><path d="M172 176l18-24 14 16 10-10 16 18z" fill="#FF8A5B"/>
                            </g>
                            <g class="bl-telefone">
                                <rect x="250" y="84" width="112" height="200" rx="18" fill="#111214"/>
                                <rect x="256" y="92" width="100" height="184" rx="13" fill="#FFFFFF"/>
                                <circle cx="276" cy="116" r="11" fill="none" stroke="#FF5A1F" stroke-width="3"/><circle cx="276" cy="116" r="6.5" fill="#FFB08A"/>
                                <rect x="294" y="108" width="44" height="7" rx="3.5" fill="#111214"/><rect x="294" y="120" width="30" height="6" rx="3" fill="#C9CCD3"/>
                                <g class="bl-fotos">{grade}</g>
                            </g>
                            <g class="bl-ou"><circle cx="252" cy="58" r="24" fill="#FF5A1F"/><text x="252" y="65" text-anchor="middle">ou</text></g>
                        </svg>'''


def ilustra_custo():
    itens = "".join(f'<text x="102" y="{y}">{nome}</text><path class="bl-pontilhado" d="M{x0} {y - 4}H232"/>'
                    for nome, y, x0 in [("O sistema", 112, 166), ("Hospedagem", 138, 180), ("Manutenção", 164, 182), ("Ajustes", 190, 152)])
    return f'''<svg class="bl-ilustra bl-ilustra-custo" viewBox="0 0 400 300" aria-hidden="true">
                            <g class="bl-nota" transform="rotate(-3 170 160)">
                                <path class="bl-papel" d="M86 40h164v226l-10 8-10-8-10 8-10-8-10 8-10-8-10 8-10-8-10 8-10-8-10 8-10-8-10 8-10-8-10 8-10-8-10 8-10-8z"/>
                                <text class="bl-nota-titulo" x="102" y="76">Orçamento</text>
                                <path class="bl-pontilhado" d="M102 88H234"/>
                                <g class="bl-nota-itens">{itens}</g>
                                <path d="M102 210H234" stroke="#111214" stroke-width="2"/>
                                <text class="bl-nota-total" x="102" y="236">Total</text>
                                <text class="bl-depende" x="234" y="240" text-anchor="end">depende</text>
                            </g>
                            <g class="bl-etiqueta">
                                <path d="M300 30v42" stroke="#9AA1B0" stroke-width="2"/>
                                <path d="M276 72h48l10 16v70a8 8 0 0 1-8 8h-52a8 8 0 0 1-8-8V88z" fill="#FF5A1F"/>
                                <circle cx="300" cy="86" r="5" fill="#FFF3E5"/>
                                <text x="300" y="140" text-anchor="middle">?</text>
                            </g>
                            <g class="bl-moedas"><ellipse cx="318" cy="262" rx="30" ry="9" fill="#C9962F"/><rect x="288" y="244" width="60" height="18" fill="#E5B44A"/><ellipse cx="318" cy="244" rx="30" ry="9" fill="#F2C46D"/><ellipse cx="318" cy="234" rx="30" ry="9" fill="#C9962F"/><rect x="288" y="216" width="60" height="18" fill="#E5B44A"/><ellipse cx="318" cy="216" rx="30" ry="9" fill="#F2C46D"/></g>
                        </svg>'''


def ilustra_noticia():
    linhas = "".join(f'<rect x="60" y="{y}" width="{w}" height="6" rx="3" fill="#C9CCD3"/>' for y, w in [(150, 120), (162, 132), (174, 96), (196, 128), (208, 110), (220, 124)])
    return f'''<svg class="bl-ilustra bl-ilustra-noticia" viewBox="0 0 400 300" aria-hidden="true">
                            <g transform="rotate(-4 160 160)">
                                <rect x="40" y="56" width="236" height="204" rx="10" fill="#FFFFFF" stroke="#E3E0DA" stroke-width="2"/>
                                <rect x="60" y="74" width="196" height="16" rx="4" fill="#111214"/>
                                <path d="M60 100H256" stroke="#111214" stroke-width="2"/>
                                <rect x="60" y="112" width="150" height="10" rx="5" fill="#111214"/>
                                <rect x="60" y="128" width="104" height="10" rx="5" fill="#111214"/>
                                {linhas}
                                <rect x="200" y="148" width="56" height="84" rx="6" fill="#FFE4D8"/>
                                <circle cx="216" cy="166" r="7" fill="#FFB08A"/><path d="M204 222l16-22 12 14 8-8 12 16z" fill="#FF8A5B"/>
                            </g>
                            <g>
                                <rect x="270" y="96" width="98" height="176" rx="16" fill="#111214"/>
                                <rect x="276" y="104" width="86" height="160" rx="11" fill="#FFFFFF"/>
                                <g class="bl-aviso-novo"><rect x="282" y="124" width="74" height="40" rx="9" fill="#F4F4F2"/><circle cx="294" cy="144" r="7" fill="#FF5A1F"/><rect x="306" y="136" width="42" height="6" rx="3" fill="#111214"/><rect x="306" y="148" width="30" height="5" rx="2.5" fill="#C9CCD3"/></g>
                                <rect x="282" y="172" width="74" height="34" rx="9" fill="#F4F4F2"/><rect x="290" y="182" width="50" height="5" rx="2.5" fill="#C9CCD3"/><rect x="290" y="192" width="36" height="5" rx="2.5" fill="#C9CCD3"/>
                                <circle class="bl-sino" cx="356" cy="104" r="12" fill="#FF5A1F"/><text class="bl-sino-numero" x="356" y="109" text-anchor="middle">1</text>
                            </g>
                        </svg>'''


def ilustra_ia():
    return f'''<svg class="bl-ilustra bl-ilustra-ia" viewBox="0 0 400 300" aria-hidden="true">
                            <rect x="56" y="40" width="250" height="220" rx="16" fill="#FFFFFF" stroke="#E3E0DA" stroke-width="2"/>
                            <path d="M56 56a16 16 0 0 1 16-16h218a16 16 0 0 1 16 16v14H56z" fill="#F1EEE8"/>
                            <circle cx="74" cy="55" r="4" fill="#FF5F57"/><circle cx="87" cy="55" r="4" fill="#FEBC2E"/><circle cx="100" cy="55" r="4" fill="#28C840"/>
                            <rect x="150" y="88" width="136" height="34" rx="14" fill="#FF5A1F"/><rect x="164" y="102" width="100" height="6" rx="3" fill="#FFE4D8"/>
                            <rect x="76" y="136" width="170" height="54" rx="14" fill="#F1EEF8"/>
                            <rect x="90" y="150" width="130" height="6" rx="3" fill="#8B7FC7"/><rect x="90" y="164" width="104" height="6" rx="3" fill="#B7AEE0"/>
                            <rect x="76" y="202" width="70" height="34" rx="14" fill="#F1EEF8"/>
                            <circle class="bl-digita" cx="96" cy="219" r="4" fill="#8B7FC7" style="--d:0s"/><circle class="bl-digita" cx="111" cy="219" r="4" fill="#8B7FC7" style="--d:0.2s"/><circle class="bl-digita" cx="126" cy="219" r="4" fill="#8B7FC7" style="--d:0.4s"/>
                            <path class="bl-brilho" d="M334 92l8 22 22 8-22 8-8 22-8-22-22-8 22-8z" fill="#FF5A1F"/>
                            <path class="bl-brilho bl-brilho-2" d="M330 186l5 13 13 5-13 5-5 13-5-13-13-5 13-5z" fill="#8B7FC7"/>
                        </svg>'''


def ilustra_seguranca():
    return f'''<svg class="bl-ilustra bl-ilustra-seguranca" viewBox="0 0 400 300" aria-hidden="true">
                            <rect x="40" y="70" width="190" height="150" rx="12" fill="#FFFFFF" stroke="#E3E0DA" stroke-width="2"/>
                            <rect x="58" y="92" width="80" height="8" rx="4" fill="#111214"/>
                            <rect x="58" y="114" width="154" height="24" rx="6" fill="#F4F4F2"/><text x="68" y="131" class="bl-senha">• • • • • • • •</text>
                            <rect x="58" y="148" width="154" height="24" rx="6" fill="#F4F4F2"/><rect x="68" y="158" width="58" height="6" rx="3" fill="#C9CCD3"/>
                            <rect x="58" y="184" width="70" height="20" rx="10" fill="#111214"/>
                            <g class="bl-escudo">
                                <path d="M290 54l70 24v54c0 46-30 78-70 94-40-16-70-48-70-94V78z" fill="#1F8A5B"/>
                                <path d="M290 72l52 18v42c0 34-22 58-52 72z" fill="#25A36C"/>
                                <rect x="268" y="128" width="44" height="36" rx="6" fill="#FFFFFF"/>
                                <path d="M278 128v-10a12 12 0 0 1 24 0v10" fill="none" stroke="#FFFFFF" stroke-width="6"/>
                                <circle cx="290" cy="144" r="5" fill="#1F8A5B"/><rect x="288" y="146" width="4" height="10" rx="2" fill="#1F8A5B"/>
                            </g>
                            <g class="bl-alerta"><path d="M200 230l22-38 22 38z" fill="#FFB547"/><rect x="220" y="204" width="4" height="12" rx="2" fill="#111214"/><circle cx="222" cy="222" r="2.5" fill="#111214"/></g>
                        </svg>'''


def ilustra_pagamento():
    qr = "".join(f'<rect x="{292 + c * 10}" y="{120 + l * 10}" width="9" height="9" fill="#111214"/>'
                 for c in range(6) for l in range(6) if (c * 7 + l * 3 + c * l) % 3 != 0)
    return f'''<svg class="bl-ilustra bl-ilustra-pagamento" viewBox="0 0 400 300" aria-hidden="true">
                            <g transform="rotate(-3 140 170)">
                                <path d="M58 60h150v188l-10 8-10-8-10 8-10-8-10 8-10-8-10 8-10-8-10 8-10-8-10 8-10-8-10 8-10-8-10 8z" fill="#FFFFFF" stroke="#E3E0DA" stroke-width="1.5"/>
                                <rect x="76" y="82" width="70" height="10" rx="5" fill="#111214"/>
                                <rect x="76" y="108" width="80" height="6" rx="3" fill="#C9CCD3"/><rect x="170" y="108" width="20" height="6" rx="3" fill="#C9CCD3"/>
                                <rect x="76" y="124" width="64" height="6" rx="3" fill="#C9CCD3"/><rect x="170" y="124" width="20" height="6" rx="3" fill="#C9CCD3"/>
                                <rect x="76" y="140" width="72" height="6" rx="3" fill="#C9CCD3"/><rect x="170" y="140" width="20" height="6" rx="3" fill="#C9CCD3"/>
                                <circle class="bl-pago" cx="133" cy="196" r="22" fill="#1F8A5B"/><path d="M122 196l8 8 14-14" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                            </g>
                            <rect x="262" y="70" width="120" height="206" rx="18" fill="#111214"/>
                            <rect x="269" y="78" width="106" height="190" rx="12" fill="#FFFFFF"/>
                            <rect x="284" y="98" width="76" height="8" rx="4" fill="#111214"/>
                            <rect x="286" y="114" width="72" height="72" rx="6" fill="#F4F4F2"/>
                            {qr}
                            <rect x="284" y="200" width="76" height="24" rx="12" fill="#FF5A1F"/>
                            <g class="bl-moedas-pg"><ellipse cx="226" cy="262" rx="24" ry="7" fill="#C9962F"/><rect x="202" y="248" width="48" height="14" fill="#E5B44A"/><ellipse cx="226" cy="248" rx="24" ry="7" fill="#F2C46D"/></g>
                        </svg>'''


def ilustra_conversa():
    return f'''<svg class="bl-ilustra bl-ilustra-conversa" viewBox="0 0 400 300" aria-hidden="true">
                            <rect x="110" y="30" width="180" height="250" rx="22" fill="#111214"/>
                            <rect x="118" y="40" width="164" height="230" rx="15" fill="#EFEAE2"/>
                            <path d="M118 55a15 15 0 0 1 15-15h134a15 15 0 0 1 15 15v17H118z" fill="#1F7A5A"/>
                            <circle cx="138" cy="56" r="9" fill="#FFB08A"/><rect x="154" y="51" width="60" height="7" rx="3.5" fill="#FFFFFF"/>
                            <g class="bl-msg" style="--d:0s"><rect x="128" y="88" width="104" height="30" rx="10" fill="#FFFFFF"/><rect x="138" y="100" width="76" height="6" rx="3" fill="#C9CCD3"/></g>
                            <g class="bl-msg" style="--d:0.8s"><rect x="168" y="128" width="104" height="44" rx="10" fill="#D9FDD3"/><rect x="178" y="140" width="80" height="6" rx="3" fill="#7FB98A"/><rect x="178" y="152" width="56" height="6" rx="3" fill="#7FB98A"/><path d="M246 162l3 3 5-5M252 162l3 3 5-5" fill="none" stroke="#34B7F1" stroke-width="1.8" stroke-linecap="round"/></g>
                            <g class="bl-msg" style="--d:1.6s"><rect x="128" y="182" width="90" height="30" rx="10" fill="#FFFFFF"/><rect x="138" y="194" width="62" height="6" rx="3" fill="#C9CCD3"/></g>
                            <rect x="126" y="236" width="148" height="24" rx="12" fill="#FFFFFF"/>
                            <g class="bl-balao-solto"><rect x="300" y="70" width="80" height="54" rx="14" fill="#FF5A1F"/><path d="M312 124l-6 14 18-14z" fill="#FF5A1F"/><rect x="314" y="86" width="52" height="6" rx="3" fill="#FFE4D8"/><rect x="314" y="100" width="36" height="6" rx="3" fill="#FFE4D8"/></g>
                            <g class="bl-balao-solto bl-balao-solto-2"><rect x="20" y="150" width="76" height="48" rx="14" fill="#FFFFFF" stroke="#E3E0DA" stroke-width="2"/><path d="M84 198l8 12 0-12z" fill="#FFFFFF"/><rect x="32" y="166" width="48" height="6" rx="3" fill="#C9CCD3"/><rect x="32" y="178" width="32" height="6" rx="3" fill="#C9CCD3"/></g>
                        </svg>'''


def ilustra_busca():
    return f'''<svg class="bl-ilustra bl-ilustra-busca" viewBox="0 0 400 300" aria-hidden="true">
                            <rect x="36" y="44" width="250" height="44" rx="22" fill="#FFFFFF" stroke="#E3E0DA" stroke-width="2"/>
                            <circle cx="64" cy="66" r="9" fill="none" stroke="#111214" stroke-width="3"/><path d="M71 73l7 7" stroke="#111214" stroke-width="3" stroke-linecap="round"/>
                            <rect x="88" y="62" width="120" height="8" rx="4" fill="#C9CCD3"/><rect class="bl-cursor" x="212" y="56" width="2.5" height="20" fill="#FF5A1F"/>
                            <g transform="translate(36 108)"><rect width="250" height="56" rx="12" fill="#FFFFFF"/><rect x="16" y="14" width="140" height="8" rx="4" fill="#1A55C9"/><rect x="16" y="30" width="200" height="6" rx="3" fill="#C9CCD3"/><rect x="16" y="41" width="160" height="6" rx="3" fill="#C9CCD3"/></g>
                            <g transform="translate(36 176)"><rect width="250" height="56" rx="12" fill="#FFFFFF"/><rect x="16" y="14" width="120" height="8" rx="4" fill="#1A55C9"/><rect x="16" y="30" width="190" height="6" rx="3" fill="#C9CCD3"/><rect x="16" y="41" width="140" height="6" rx="3" fill="#C9CCD3"/></g>
                            <rect x="300" y="108" width="80" height="124" rx="12" fill="#DCE9DF"/>
                            <path d="M300 160h80M336 108v124" stroke="#FFFFFF" stroke-width="5"/>
                            <g class="bl-pino"><path d="M340 112c-14 0-24 10-24 24 0 18 24 40 24 40s24-22 24-40c0-14-10-24-24-24z" fill="#FF5A1F"/><circle cx="340" cy="136" r="9" fill="#FFFFFF"/></g>
                        </svg>'''


def ilustra_lei():
    return f'''<svg class="bl-ilustra bl-ilustra-lei" viewBox="0 0 400 300" aria-hidden="true">
                            <g transform="rotate(-3 150 160)">
                                <rect x="60" y="40" width="180" height="232" rx="8" fill="#FFFFFF" stroke="#E3E0DA" stroke-width="2"/>
                                <rect x="82" y="66" width="110" height="10" rx="5" fill="#111214"/>
                                <rect x="82" y="96" width="136" height="6" rx="3" fill="#C9CCD3"/><rect x="82" y="108" width="128" height="6" rx="3" fill="#C9CCD3"/><rect x="82" y="120" width="136" height="6" rx="3" fill="#C9CCD3"/>
                                <rect x="82" y="140" width="120" height="6" rx="3" fill="#C9CCD3"/><rect x="82" y="152" width="136" height="6" rx="3" fill="#C9CCD3"/><rect x="82" y="164" width="96" height="6" rx="3" fill="#C9CCD3"/>
                                <path d="M82 238c10-12 18 6 28-4s14-8 22 2" fill="none" stroke="#111214" stroke-width="2" stroke-linecap="round"/>
                                <g class="bl-carimbo"><circle cx="196" cy="226" r="26" fill="none" stroke="#C2410C" stroke-width="4"/><circle cx="196" cy="226" r="18" fill="none" stroke="#C2410C" stroke-width="2"/><path d="M186 226l7 7 13-13" fill="none" stroke="#C2410C" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>
                            </g>
                            <g class="bl-balanca-lei">
                                <path d="M318 70v150M282 230h72" stroke="#111214" stroke-width="5" stroke-linecap="round"/>
                                <g class="bl-braco"><path d="M276 92h84" stroke="#111214" stroke-width="5" stroke-linecap="round"/>
                                <path d="M282 92l-16 40h32zM354 92l-16 40h32z" fill="none" stroke="#111214" stroke-width="2"/>
                                <path d="M262 132a20 8 0 0 0 40 0z" fill="#F2C46D"/><path d="M334 132a20 8 0 0 0 40 0z" fill="#F2C46D"/></g>
                                <circle cx="318" cy="68" r="7" fill="#111214"/>
                            </g>
                        </svg>'''


ILUSTRACOES = {
    "fiado": ilustra_fiado,
    "site": ilustra_site,
    "custo": ilustra_custo,
    "noticia": ilustra_noticia,
    "ia": ilustra_ia,
    "seguranca": ilustra_seguranca,
    "pagamento": ilustra_pagamento,
    "conversa": ilustra_conversa,
    "busca": ilustra_busca,
    "lei": ilustra_lei,
}


# ---------------------------------------------------------------------------
# Leitura e conferência do artigos.json
# ---------------------------------------------------------------------------
def texto_puro(trecho):
    return html.unescape(re.sub(r"<[^>]+>", " ", trecho))


def minutos(corpo):
    return max(1, math.ceil(len(texto_puro(corpo).split()) / 200))


def data_extenso(iso):
    d = date.fromisoformat(iso)
    return f"{d.day} de {MESES[d.month - 1]} de {d.year}"


def ancora(texto):
    texto = unicodedata.normalize("NFD", texto_puro(texto)).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", texto.lower()).strip("-")


def carregar():
    artigos = json.loads(DADOS.read_text(encoding="utf-8"))
    erros = []
    vistos = set()
    for i, a in enumerate(artigos):
        nome = a.get("slug") or f"item {i + 1}"
        for campo in ("slug", "titulo", "resumo", "tag", "data", "ilustracao", "corpo"):
            if not str(a.get(campo, "")).strip():
                erros.append(f"{nome}: falta o campo {campo}")
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", a.get("slug", "")):
            erros.append(f"{nome}: slug só com letras minúsculas, números e hífen")
        if a.get("slug") in vistos:
            erros.append(f"{nome}: slug repetido")
        vistos.add(a.get("slug"))
        try:
            date.fromisoformat(a.get("data", ""))
        except ValueError:
            erros.append(f"{nome}: data no formato AAAA-MM-DD")
        if a.get("ilustracao") not in ILUSTRACOES:
            erros.append(f"{nome}: ilustracao precisa ser uma de {', '.join(ILUSTRACOES)}")
        textos = " ".join(str(a.get(c, "")) for c in ("titulo", "resumo", "corpo"))
        if "—" in textos or "–" in textos:
            erros.append(f"{nome}: sem travessão no texto (troque por vírgula, ponto ou dois-pontos)")
        if re.search(r"<(?!/?(?:p|h2|h3|ul|ol|li|strong|em|a|br|blockquote)\b)[^>]+>", a.get("corpo", "")):
            erros.append(f"{nome}: o corpo só aceita p, h2, h3, ul, ol, li, strong, em, a, br e blockquote")
        if a.get("tag") == "Notícias" and not a.get("fontes"):
            erros.append(f"{nome}: artigo de notícia precisa das fontes")
        for f in a.get("fontes", []):
            if not str(f.get("url", "")).startswith("https://") or not f.get("titulo") or not f.get("veiculo"):
                erros.append(f"{nome}: cada fonte precisa de titulo, veiculo e url com https://")
    if erros:
        sys.exit("artigos.json com problemas:\n- " + "\n- ".join(erros))
    # mais novo primeiro; no mesmo dia, a ordem do arquivo
    return sorted(artigos, key=lambda a: a["data"], reverse=True)


# ---------------------------------------------------------------------------
# As peças das páginas
# ---------------------------------------------------------------------------
def corpo_formatado(corpo):
    """Um bloco por linha, com o recuo da página (os itens de lista um nível para dentro)."""
    texto = re.sub(r"\s*\n\s*", " ", corpo.strip())
    texto = re.sub(r"\s*(<(?:p|h2|h3|ul|ol|li|blockquote)\b[^>]*>|</(?:ul|ol|blockquote)>)", r"\n\1", texto)
    linhas = []
    for linha in texto.split("\n"):
        linha = linha.strip()
        if not linha:
            continue
        linhas.append(" " * (24 if linha.startswith("<li") else 20) + linha)
    return "\n".join(linhas)


def cartao(a, grande=False, nivel="h2"):
    chave = a["ilustracao"]
    return f'''                    <a class="bl-cartao bl-cartao-{chave}{" bl-cartao-grande" if grande else ""}" href="/blog/{a['slug']}" data-cta="blog_artigo_{a['slug']}">
                        <span class="bl-capa">
                        {ILUSTRACOES[chave]()}
                        </span>
                        <span class="bl-cartao-texto">
                            <{nivel} class="bl-cartao-titulo">{a["titulo"]}</{nivel}>
                            <span class="bl-cartao-resumo">{a["resumo"]}</span>
                            <span class="bl-cartao-pe"><span>{a["tag"]} · {minutos(a["corpo"])} min de leitura</span><span class="bl-ler">Ler {SETA}</span></span>
                        </span>
                    </a>'''


def chamada(titulo, texto, botao, href, cta):
    return f'''        <section class="i-chamada" aria-labelledby="chamada-titulo">
            <div class="wrap">
                <h2 id="chamada-titulo" class="i-chamada-titulo gigante">{titulo}</h2>
                <div class="i-chamada-texto">
                    <p>{texto}</p>
                    <a href="{href}" class="btn btn-acao" data-cta="{cta}" data-magnetico data-cursor="bora">{botao} {SETA}</a>
                </div>
            </div>
        </section>
'''


def main_indice(artigos):
    traducoes = "\n".join(f'''                        <li style="--i:{i}"><s>{termo}</s><span aria-hidden="true">→</span><b>{pt}</b></li>'''
                          for i, (termo, pt) in enumerate(TRADUCOES))
    destaque = "\n".join(cartao(a, grande=(i == 0)) for i, a in enumerate(artigos[:3]))
    mais = ""
    if len(artigos) > 3:
        mais = '''
                <div class="bl-grade bl-grade-mais">
''' + "\n".join(cartao(a) for a in artigos[3:]) + '''
                </div>'''
    return f'''        <section class="i-hero escuro bl-topo">
            <div class="wrap">
                <div class="i-hero-texto">
                    <h1 class="h-grande gigante i-titulo">Guias <em>sem&nbsp;tecniquês.</em></h1>
                    <p class="i-hero-sub i-entra">Textos curtos para quem toca um negócio e quer usar a tecnologia a favor.</p>
                </div>
                <div class="bl-tradutor i-entra">
                    <p class="bl-tradutor-cabeca"><span>Tecniquês</span><span>Português</span></p>
                    <ul>
{traducoes}
                    </ul>
                </div>
            </div>
        </section>

        <section class="bl-guias" aria-label="Os artigos">
            <div class="wrap">
                <div class="bl-grade">
{destaque}
                </div>{mais}
            </div>
        </section>

{chamada("Ficou com dúvida?", "Pergunte direto para quem desenvolve. A gente responde no mesmo dia útil.", "Falar com a MovCode", "/#contato", "blog_indice")}'''


def main_artigo(a, artigos):
    tempo = minutos(a["corpo"])
    chave = a["ilustracao"]
    corpo = corpo_formatado(a["corpo"])
    titulos = re.findall(r"<h2>(.*?)</h2>", corpo)
    corpo = re.sub(r"<h2>(.*?)</h2>", lambda m: f'<h2 id="{ancora(m.group(1))}">{m.group(1)}</h2>', corpo)
    fontes = ""
    if a.get("fontes"):
        itens = "\n".join(
            f'''                        <li><a href="{html.escape(f["url"])}" target="_blank" rel="noopener">{f["titulo"]}</a>, {f["veiculo"]}{", " + data_extenso(f["data"]) if f.get("data") else ""}</li>'''
            for f in a["fontes"])
        fontes = f'''
                    <h2 id="fontes">Fontes</h2>
                    <ol class="bl-fontes">
{itens}
                    </ol>'''
        titulos.append("Fontes")
    # o sumário já numera: sai o "1. " que alguns títulos trazem
    indice = "\n".join(f'                        <li><a href="#{ancora(t)}">{re.sub(r"^[0-9]+[.] *", "", t)}</a></li>' for t in titulos)
    outros = "\n".join(cartao(o, nivel="h3") for o in [o for o in artigos if o["slug"] != a["slug"]][:2])
    publicado = data_extenso(a["data"])
    return f'''        <section class="i-hero escuro i-hero-compacto bl-guia-topo">
            <div class="wrap">
                <div class="i-hero-texto">
                    <a class="bl-voltar i-entra" href="/blog/" data-cta="blog_voltar"><span aria-hidden="true">←</span> Voltar ao blog</a>
                    <h1 class="h-grande gigante i-titulo">{a["titulo"]}</h1>
                    <p class="i-hero-sub i-entra">{a["resumo"]}</p>
                    <p class="bl-meta i-entra">{a["tag"]} · Publicado em <time datetime="{a["data"]}">{publicado}</time> · {tempo} min de leitura</p>
                </div>
                <div class="bl-guia-capa bl-cartao-{chave} i-entra">
                        {ILUSTRACOES[chave]()}
                </div>
            </div>
        </section>

        <section class="i-artigo bl-leitura">
            <div class="wrap bl-leitura-grade">
                <nav class="bl-indice" aria-label="Neste texto">
                    <p>Neste texto</p>
                    <ol>
{indice}
                    </ol>
                </nav>
                <article>
{corpo}{fontes}
                </article>
            </div>
        </section>

        <section class="bl-guias bl-outros escuro" aria-labelledby="leia-tambem">
            <div class="wrap">
                <h2 id="leia-tambem" class="h-grande gigante">Leia <em>também.</em></h2>
                <div class="bl-grade bl-grade-dois">
{outros}
                </div>
            </div>
        </section>

{chamada("Bora resolver?", "Conte o seu caso. O diagnóstico é gratuito, sem compromisso, e pode ser por chamada ou por mensagem.", "Pedir diagnóstico grátis", "/diagnostico", "blog_" + a["slug"])}'''


# ---------------------------------------------------------------------------
# A página inteira: a casca do blog/index.html com o <head> e o <main> trocados
# ---------------------------------------------------------------------------
def jsonld(dados):
    corpo = json.dumps(dados, ensure_ascii=False, indent=4)
    corpo = "\n".join("    " + linha for linha in corpo.split("\n"))
    return f'<script type="application/ld+json">\n{corpo}\n    </script>'


def montar(casca, titulo, descricao, caminho, tipo, dados, conteudo, progresso):
    url = f"{SITE}{caminho}"
    t = html.escape(titulo, quote=True)
    d = html.escape(descricao, quote=True)
    trocas = [
        (r"<title>.*?</title>", f"<title>{t}</title>"),
        (r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{d}">'),
        (r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">'),
        (r'<meta property="og:type" content="[^"]*">', f'<meta property="og:type" content="{tipo}">'),
        (r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{t}">'),
        (r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{d}">'),
        (r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">'),
        (r'<script type="application/ld\+json">.*?</script>', jsonld(dados)),
        (r'<main id="conteudo">.*?</main>', f'<main id="conteudo">\n{conteudo}    </main>'),
    ]
    pagina = casca
    for padrao, novo in trocas:
        pagina, n = re.subn(padrao, lambda m: novo, pagina, count=1, flags=re.S)
        if n != 1:
            sys.exit(f"não achei {padrao!r} no blog/index.html")
    pagina = re.sub(r'\n    <div class="i-progresso" aria-hidden="true"></div>\n', "\n", pagina)
    if progresso:
        pagina = pagina.replace('\n    <main id="conteudo">', '\n    <div class="i-progresso" aria-hidden="true"></div>\n\n    <main id="conteudo">', 1)
    return amarrar(pagina)


def atualizar_sitemap(artigos):
    arquivo = RAIZ / "sitemap.xml"
    texto = arquivo.read_text(encoding="utf-8")
    texto = re.sub(r"\s*<url>\s*<loc>https://movcode\.com\.br/blog/[^<]*</loc>.*?</url>", "", texto, flags=re.S)
    novos = [("/blog/", artigos[0]["data"])] + [(f"/blog/{a['slug']}", a["data"]) for a in artigos]
    blocos = "".join(f'''
    <url>
        <loc>{SITE}{c}</loc>
        <lastmod>{d}</lastmod>
        <priority>0.6</priority>
    </url>''' for c, d in novos)
    texto = texto.replace("\n</urlset>", blocos + "\n</urlset>")
    arquivo.write_text(texto, encoding="utf-8")


def gerar():
    artigos = carregar()
    if "--checar" in sys.argv:
        print(f"artigos.json ok: {len(artigos)} artigos")
        return
    casca = (RAIZ / "blog" / "index.html").read_text(encoding="utf-8")
    descricao = "Guias práticos, sem tecniquês, para quem toca um negócio e quer usar a tecnologia a favor: notícias, fiado, site, sistema e mais."
    dados = {"@context": "https://schema.org", "@type": "Blog", "name": "Blog da MovCode", "url": f"{SITE}/blog/", "description": descricao,
             "inLanguage": "pt-BR", "publisher": ORG,
             "blogPost": [{"@type": "BlogPosting", "headline": a["titulo"], "url": f"{SITE}/blog/{a['slug']}", "datePublished": a["data"]} for a in artigos]}
    paginas = {"blog/index.html": montar(casca, "Blog da MovCode | Guias práticos para o seu negócio", descricao, "/blog/", "website", dados, main_indice(artigos), False)}
    for a in artigos:
        caminho = f"/blog/{a['slug']}"
        dados = {"@context": "https://schema.org", "@type": "BlogPosting", "headline": a["titulo"], "description": a["resumo"],
                 "url": f"{SITE}{caminho}", "mainEntityOfPage": f"{SITE}{caminho}", "datePublished": a["data"], "dateModified": a["data"],
                 "inLanguage": "pt-BR", "image": IMAGEM, "author": ORG, "publisher": ORG}
        paginas[f"blog/{a['slug']}.html"] = montar(casca, f"{a['titulo']} | Blog da MovCode", a["resumo"], caminho, "article", dados, main_artigo(a, artigos), True)
    for nome, conteudo in paginas.items():
        (RAIZ / nome).write_text(conteudo, encoding="utf-8")
    atualizar_sitemap(artigos)
    print(f"blog gerado: índice e {len(artigos)} artigos; sitemap atualizado")


if __name__ == "__main__":
    gerar()
