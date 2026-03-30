# Medidas × fontes de evidência no FPSI

Este documento registra o **cruzamento** entre medidas do framework (catálogo em `medida` / [`src/lib/services/medidas.json`](../../../src/lib/services/medidas.json)) e **dados já existentes** no sistema. A implementação correspondente está em [`src/lib/medidas/evidenciaRules.ts`](../../../src/lib/medidas/evidenciaRules.ts).

## Princípios

- As sugestões são **assistidas**: o avaliador continua responsável pela resposta oficial em `programa_medida`.
- **Nomeação no cadastro ≠ ato institucional** completo: o sistema só infere a partir do que foi modelado (ex.: pessoa vinculada ao papel no programa; membros listados nos grupos).
- Para medidas sem entidade equivalente no produto, a avaliação permanece **manual**.

## Diagnóstico 1 — medidas `0.1` … `0.12` (PPSI 2.0, Controle 0)

Escala de resposta: **Sim** (id 1) / **Não** (id 2), conforme [`METODOLOGIA_AVALIACAO_FRAMEWORK.md`](./METODOLOGIA_AVALIACAO_FRAMEWORK.md).

As medidas **0.1 a 0.8** estão alinhadas à página **Programa → Estrutura de Governança** (`/programas/[id]/responsabilidades`), com abas **Papéis e equipe**, **Comitê SI**, **Comitê priva** e **ETIR**. A UI do diagnóstico oferece link direto com `?aba=equipe|si|priva|etir`.

| id_medida | Pergunta (resumo) | Tipo de fonte | Caminho / predicado | Confiança | Onde no FPSI |
|-----------|-------------------|---------------|---------------------|-----------|----------------|
| 0.1 | Alta administração / SGRC | `programa` | `representante_alta_administracao` numérico > 0 | média | Aba **Papéis e equipe** — representante da alta administração. |
| 0.2 | Gestor de TIC (Port. 778) | `programa` | `gestor_tic` > 0 | média | Aba **Papéis e equipe** — gestor de TIC. |
| 0.3 | Gestor de SI | `programa` | `gestor_seguranca_informacao` > 0 | média | Aba **Papéis e equipe** — gestor de SI. |
| 0.4 | Encarregado (DPO) | `programa` | `encarregado_dados_pessoais` > 0 | média | Aba **Papéis e equipe** — encarregado. |
| 0.5 | Gestão da integridade | `programa` | `responsavel_gestao_integridade` > 0 | média | Aba **Papéis e equipe** — responsável pela gestão da integridade. |
| 0.6 | Comitê de SI | `programa_grupo_governanca` | ≥1 membro em `comite_seguranca_informacao` | média | Aba **Comitê SI**. |
| 0.7 | Comitê de proteção de dados | `programa_grupo_governanca` | ≥1 membro em `comite_protecao_dados` | média | Aba **Comitê priva**. |
| 0.8 | ETIR | `programa_grupo_governanca` | ≥1 membro em `etir` | média | Aba **ETIR**. |
| 0.9 | PGSI | — | — | baixa | **Sem modelo** equivalente no FPSI (manual). |
| 0.10 | PGP | — | — | baixa | **Sem modelo** equivalente no FPSI (manual). |
| 0.11 | POSIN | `politica_programa` | `tipo_politica = politica_seguranca_informacao` e seções com texto | média | Módulo **Políticas** do programa. |
| 0.12 | Política de Proteção de Dados Pessoais | `politica_programa` | `tipo_politica = politica_protecao_dados_pessoais` e seções com texto | média | Idem. |

## Próximas fases (iteração)

- **Fase B:** incluir medidas cujo atendimento possa ser inferido de **inventário**, **ROPA**, **registro de incidentes**, etc., quando esses módulos estiverem estáveis.
- **Fase C:** modelos ou integrações para **PGSI/PGP** (0.9–0.10), ou tabela administrável `medida_fonte` se o mapeamento precisar mudar sem deploy.

## Referências

- Metodologia: [`METODOLOGIA_AVALIACAO_FRAMEWORK.md`](./METODOLOGIA_AVALIACAO_FRAMEWORK.md)
- Catálogo de medidas (espelho): [`src/lib/services/medidas.json`](../../../src/lib/services/medidas.json)
- Abas da governança: [`src/lib/governanca/abaGovernanca.ts`](../../../src/lib/governanca/abaGovernanca.ts)
