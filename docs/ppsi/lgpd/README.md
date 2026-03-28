# LGPD — texto oficial na documentação (FPSI)

## Fonte

- **Texto compilado** (consolida alterações posteriores, p.ex. Lei nº 13.853/2019), publicado no **Planalto**:
  - URL: `https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709compilado.htm`
- **Arquivo local:** `lei_13709_2018_planalto_compilado.html`
- **Download:** o HTML original é tipicamente **ISO-8859-1**; no repositório está **convertido para UTF-8** para leitura e diff estáveis.

A versão **não compilada** (`l13709.htm`) costuma repetir trechos (histórico de mudanças). Para produto e leitura, prefira o **compilado**.

## Estrutura do arquivo HTML

1. **Metadados** no `<head>` (Microsoft FrontPage, HTML antigo).
2. **Hierarquia normativa** aparece como texto corrido:
   - `CAPÍTULO I` … `CAPÍTULO X` (capítulos romanos; há quebras `<br/>` no título).
3. **Artigos** em parágrafos `<p class="MsoNormal" ...>`:
   - Artigos **1 a 9:** `Art. 1º`, `Art. 2º`, … `Art. 9º`
   - A partir do **10:** `Art. 10.`, `Art. 11.`, … `Art. 65.` (padrão com **ponto** após o número).
4. **Parágrafos e incisos:** `§`, `I -`, `II -`, alíneas `a)`, etc., no mesmo fluxo do artigo (não há um `<div id="art-18">` confiável por artigo em todo o documento).
5. **Lacunas numéricas:** no texto compilado existem artigos **(VETADO)** e saltos (ex.: após o art. 56 vão-se para 58, 59, etc.), o que é **esperado** na lei consolidada.

## Verificação em relação ao modelo proposto (`instrumentos.json` + `artigos`)

| Ideia proposta | Compatível? | Observação |
|----------------|-------------|------------|
| Um identificador estável `lei_13709_2018` | Sim | Metadado no JSON; o texto fica em arquivo ou gerado por build. |
| Mapa `artigo` → texto | **Parcial** | O conteúdo está **sequencial** no HTML, mas **não há âncoras `id` por artigo** de forma uniforme. Para montar o mapa é preciso **segmentar** o texto (regex ou parser) a partir dos marcadores `Art. Nº` / `Art. N.`. |
| Link oficial para “abrir no navegador” | Sim | Use sempre a URL do Planalto (compilado) ou LexML; deep-link por artigo depende do site (nem sempre há âncora estável). |
| Só armazenar alguns artigos “quentes” (ex.: 5–11, 18, 37, 48…) | **Recomendado** | Reduz manutenção e bate com o uso educativo (citar trecho + link para a lei inteira). |

## Recomendações para implementação no sistema

1. **Manter** este HTML (ou uma versão atualizada periodicamente) como **cópia de referência** em `docs/`, não como substituto do site oficial em produção.
2. No app, preferir **link externo** para o Planalto/LexML e, opcionalmente, **trechos** extraídos ou digitados para artigos prioritários (JSON próprio), alinhado à proposta “LGPD mapeada; demais só link”.
3. Se um dia automatizar o split por artigo, rodar um script sobre o HTML UTF-8 e **validar** a contagem (65 artigos com numeração própria no texto atual, observados vetos e alterações).

## Artigos em JSON (`lgpd_artigos.json`)

Gerado a partir do HTML compilado com:

```bash
python3 scripts/extract_lgpd_artigos.py
```

- **64 chaves** (`"1"` … `"65"`), **exceto `"57"`** — não existe no texto consolidado (saltos por vetos/alterações).
- Parágrafos `<p class="Artigo">` cobrem quase toda a lei; o **art. 65** no Planalto vem em `<p class="texto1">`, tratado por trecho extra no script.

Estrutura do arquivo: objeto `meta` + `artigos` (mapa número → texto corrido).

## Atualização

1. Substituir `lei_13709_2018_planalto_compilado.html` pela versão atual do Planalto (UTF-8).
2. Rodar `python3 scripts/extract_lgpd_artigos.py`.
3. Registrar no commit a data da fonte.
