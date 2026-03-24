# Medidas × fontes de evidência no FPSI

Este documento registra o **cruzamento** entre medidas do framework (catálogo em `medida` / [`src/lib/services/medidas.json`](../../../src/lib/services/medidas.json)) e **dados já existentes** no sistema. A implementação correspondente está em [`src/lib/medidas/evidenciaRules.ts`](../../../src/lib/medidas/evidenciaRules.ts).

## Princípios

- As sugestões são **assistidas**: o avaliador continua responsável pela resposta oficial em `programa_medida`.
- **Nomeação no cadastro ≠ ato institucional** completo: o sistema só infere a partir do que foi modelado (ex.: responsável vinculado ao programa).
- Para medidas sem entidade equivalente no produto, a avaliação permanece **manual**.

## Controle 0 — Estruturação básica (medidas 0.1 a 0.7)

Escala de resposta no diagnóstico 1: **Sim** (id 1) / **Não** (id 2), conforme [`METODOLOGIA_AVALIACAO_FRAMEWORK.md`](./METODOLOGIA_AVALIACAO_FRAMEWORK.md).

| id_medida | Pergunta (resumo) | Tipo de fonte | Caminho / predicado | Confiança | Observações |
|-----------|-------------------|---------------|---------------------|-----------|-------------|
| 0.1 | Autoridade máxima de TI | `programa` | `responsavel_ti` numérico > 0 | média | Não valida portaria ou ato formal fora do sistema. |
| 0.2 | Gestor de SI | `programa` | `responsavel_si` > 0 | média | Idem. |
| 0.3 | Responsável controle interno | `programa` | `responsavel_controle_interno` > 0 | média | Idem. |
| 0.4 | Comitê de SI | — | — | — | **Sem fonte no sistema** (avaliação manual até existir cadastro). |
| 0.5 | ETIR | — | — | — | **Sem fonte no sistema** (avaliação manual). |
| 0.6 | POSIN | `politica_programa` | `tipo_politica = politica_seguranca_informacao` e seções com texto preenchido | média | Indício de política elaborada no FPSI; aprovação pela autoridade máxima não é inferida automaticamente. |
| 0.7 | Encarregado (DPO) | `programa` | `responsavel_privacidade` > 0 | média | Alinhado ao cadastro de responsáveis do programa. |

## Próximas fases (iteração)

- **Fase B:** incluir medidas cujo atendimento possa ser inferido de **inventário**, **ROPA**, **registro de incidentes**, etc., quando esses módulos estiverem estáveis.
- **Fase C:** cadastros ou integrações para estruturas como Comitê de SI e ETIR, ou tabela administrável `medida_fonte` se o mapeamento precisar mudar sem deploy.

## Referências

- Metodologia: [`METODOLOGIA_AVALIACAO_FRAMEWORK.md`](./METODOLOGIA_AVALIACAO_FRAMEWORK.md)
- Catálogo de medidas (espelho): [`src/lib/services/medidas.json`](../../../src/lib/services/medidas.json)
