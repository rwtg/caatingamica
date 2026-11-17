# Caatinga em Foco

Guia educativo interativo sobre queimadas na Caatinga, desenvolvido com React, Vite e Leaflet. O conteúdo é estático e funciona sem backend; o mapa usa dados oficiais pré-carregados do Programa Queimadas do INPE e tiles públicos do OpenStreetMap.

## Como instalar e rodar

Requer Node.js 20.19+ (ou LTS mais recente).

```bash
npm install
npm run dev
npm run build
```

## Seções do trabalho (bioma: Caatinga)

- Cadeia alimentar, teia alimentar e fluxo de energia: `src/components/FoodSections.jsx` (dados em `src/data/cadeias.json`). O simulador de fogo é um modelo didático.
- Sucessão ecológica: `src/components/SuccessionSection.jsx`.
- Ciclos biogeoquímicos e gráficos: `src/components/DataSection.jsx` (números verificados e fontes em `src/data/dados.json`).
- Série anual de focos: sem o arquivo gerado, o gráfico mostra só 3 anos publicados (2010, 2022 derivado e 2023). Para a série oficial completa (2003 até hoje, mais a sazonalidade por mês), rode na pasta do projeto, com internet e Python 3:

  ```bash
  python scripts/gerar_serie_focos.py
  ```

  O script baixa os arquivos anuais do INPE, conta os focos da Caatinga e grava `src/data/serie-focos-inpe.json`. Depois é só `npm run dev`. (No Windows, se `python` não funcionar, tente `py scripts/gerar_serie_focos.py`.)

## Estrutura principal

```text
public/assets/               Ilustrações SVG originais
src/components/              Seções educativas e mapa Leaflet
src/data/                    Dados do conteúdo e dados geográficos
src/styles/tokens.css        Cores, fontes, textura e espaçamentos
src/App.jsx                  Composição e navegação do site
src/App.css                  Layout responsivo
```

## Dados do mapa

- `src/data/focos-inpe.json`: recorte real do mês da coleta, fornecido pelo WFS do Programa Queimadas do INPE. O arquivo registra a data da consulta, a camada de origem, a quantidade recebida e os atributos originais usados no mapa. A captura contém 1.162 focos na Caatinga e foi consultada em 9 de novembro de 2026.
- `src/data/caatinga.json`: geometria oficial do bioma fornecida pela camada `bdqueimadas:biomas_brasileiros` do GeoServer do INPE.

O mapa permite alternar entre as detecções de focos, o risco de fogo (escala de 0 a 1), a potência radiativa (FRP, MW) e o limite do bioma. O recorte de 48 horas é calculado em relação ao horário de atualização gravado no conjunto, e não ao relógio do visitante. Assim, a idade dos dados fica explícita e o recorte não é apresentado como tempo real.

Os focos de calor são detecções por satélite. Não representam diretamente a área queimada e não confirmam, por si sós, que um incêndio continua ativo.

### Atualizar o conjunto de focos

Consulte a camada `dados_abertos:focos_mesatual_br_satref` no serviço WFS do INPE:

```text
https://terrabrasilis.dpi.inpe.br/queimadas/geoserver/ows
```

Use `service=WFS`, `version=2.0.0`, `request=GetFeature`, `outputFormat=application/json`, `count=2000` e o filtro CQL `bioma='Caatinga'`. Verifique se todos os itens retornaram, atualize `atualizadoEm`, `totalFonte` e os campos de cada foco em `src/data/focos-inpe.json`. Preserve a fonte e a data de coleta ao publicar a atualização.

## Outros dados editáveis

- `src/data/impactos.json`: textos e categorias de impacto.
- `src/data/quiz.json`: perguntas, alternativas, respostas e feedback.
- `src/data/mitos.json` e `src/data/glossario.json`: conteúdo das seções interativas.
- `src/components/BeforeAfterSlider.jsx`: pares de imagens em `public/assets/`; substitua os SVGs mantendo os nomes dos arquivos, ou altere os caminhos. As imagens existentes são ilustrações esquemáticas, não fotografias de locais reais.

## Linguagem visual

O site mantém a identidade inspirada na xilogravura e na literatura de cordel: títulos expressivos, molduras, alto contraste, hachuras e textura sutil. A paleta combina papel envelhecido, terracota, ocre, verde-cinza e marrom sertão. Rye dá personalidade aos títulos, enquanto Lora mantém os textos longos legíveis. As ilustrações e os ícones SVG foram desenhados para o projeto.

Edite primeiro `src/styles/tokens.css` para ajustar cores, fontes, textura e espaçamentos. Em telas pequenas, a navegação recolhe em um menu e as colunas viram pilhas; teste também a 320 px de largura.

## Fontes

- [Programa Queimadas do INPE](https://terrabrasilis.dpi.inpe.br/queimadas/portal/)
- [Dados abertos e serviços geográficos do INPE](https://terrabrasilis.dpi.inpe.br/queimadas/portal/pages/secao_downloads/dados-abertos/)
- [IBGE — Biomas do Brasil](https://www.ibge.gov.br/geociencias/informacoes-ambientais/vegetacao/15842-biomas.html)
- [MMA — Caatinga](https://www.gov.br/mma/pt-br/assuntos/biodiversidade-e-biomas/biomas-e-ecossistemas/biomas/caatinga)
- [Embrapa Semiárido](https://www.embrapa.br/semiarido)
