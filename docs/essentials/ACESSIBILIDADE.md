# Acessibilidade (e-MAG / WCAG 2.1)

O FPSI busca alinhamento ao **e-MAG** (Modelo de Acessibilidade em Governo Eletrônico), derivado das **WCAG 2.1** nível **AA**, e à **LBI** (Lei 13.146/2015).

## O que já está no produto

- **Contraste**: tokens `landing.text`, `landing.muted`, `landing.heroText` e `landing.heroMuted` calibrados para texto em fundo claro e barra/menu navy.
- **Foco visível**: anel de foco (`:focus-visible`) em botões, links, itens de menu e dias do calendário (tema MUI global).
- **Pular conteúdo**: link “Ir para o conteúdo principal” na área logada e no portal público (`#main-content`).
- **Teclado**: componentes MUI e links nativos; matriz de riscos com células focáveis e tooltip descritivo.
- **Movimento**: `prefers-reduced-motion` reduz animações no tema global.
- **Tipografia**: corpo ≥ 15px base; legendas/caption ≥ ~13px (`0.8125rem`) no tema.

## Matriz e calendário

- Matriz P×I: rótulos numéricos e nomes dos níveis (não depende só da cor); contagem nas células.
- Calendário de pendências: dias da semana por extenso abreviado; indicadores com legenda textual (Crítico / Atenção / Info).

## Limitações conhecidas / próximos passos

- Auditoria formal e-MAG (checklist completo + testes com leitor de tela NVDA/VoiceOver) ainda recomendada antes de declarar conformidade institucional.
- Mapa de calor: reforçar padrões não visuais em telas internas adicionais conforme feedback de usuários.
- Landing/marketing: revisar seções com fontes menores em CSS isolado.

## Referências

- [e-MAG 3.1](https://www.gov.br/governodigital/pt-br/acessibilidade-digital/emag)
- [WCAG 2.1 (W3C)](https://www.w3.org/TR/WCAG21/)
- Decreto nº 5.296/2004 (acessibilidade web no serviço público federal)
