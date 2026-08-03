# Governança de IA / AIGP — diagnóstico complementar

Catálogo **v1.0** (sujeito a validação) que adiciona o domínio **Governança de IA** ao módulo de Diagnóstico do FPSI, sem alterar o catálogo oficial PPSI 2.0.

## O que foi aplicado

| Item | Valor |
|------|--------|
| Diagnóstico | `id = 4` · descrição `GOVERNANÇA DE IA` · índice `iAIGP` |
| Controles | 10 (ids 28–37 · números 26–35) |
| Medidas | 54 (ids 211–264) |
| Escala | Mesma de Segurança/Privacidade (1–6) |
| Score | Média dos controles (sem peso iMC0 do PPSI) |

Fonte canônica: [`catalogo_aigp_v1.json`](./catalogo_aigp_v1.json)  
Gerador: `node scripts/generate-aigp-catalog.mjs`  
Migration: `supabase/migrations/20260719230000_diagnostico_aigp_governanca_ia.sql`

## Controles

1. **Governança e accountability de IA** — papéis, comitê, reporte, integração PPSI  
2. **Inventário e classificação de sistemas de IA** — inventário, donos, risco, vínculo ROPA  
3. **Política e princípios de IA responsável** — política, GenAI, usos proibidos  
4. **Gestão de riscos de IA** — avaliação, métricas, AIPD/FRIA/RIPD, thresholds  
5. **Dados, privacidade e LGPD em sistemas de IA** — base legal, minimização, art. 20, contratos  
6. **Transparência, explicabilidade e direitos** — notice, contestação, model cards  
7. **Segurança, robustez e monitoramento de modelos** — acesso, drift, OWASP LLM, kill switch  
8. **Terceiros, fornecedores e modelos fundacionais** — due diligence, training opt-out  
9. **Viés, equidade e impacto humano** — fairness, supervisão humana significativa  
10. **Ciclo de vida, documentação e auditoria** — gates, versionamento, capacitação, KPIs  

## Integração com módulos do FPSI (evidência assistida)

Plano de produto para cruzar as **54 medidas** com governança, inventário, políticas, conformidade LGPD e demais módulos — matriz medida a medida, fases e lacunas:

→ **[SISTEMATIZACAO_EVIDENCIA_GOVERNANCA_IA.md](./SISTEMATIZACAO_EVIDENCIA_GOVERNANCA_IA.md)**

Hoje as regras de evidência assistida ([`evidenciaRules.ts`](../../src/lib/medidas/evidenciaRules.ts)) cobrem o diagnóstico **Estrutura (0.x)** e parte de **Privacidade/SI**; **nenhuma medida AIGP (`26.x`–`35.x`) está ligada ainda**.

## Referências (boas práticas)

- **IAPP AIGP** — Body of Knowledge (governança, risco e conformidade de IA)  
- **NIST AI RMF** — funções Govern / Map / Measure / Manage (mapeadas em `funcao_nist_csf` das medidas)  
- **ISO/IEC 42001** — Artificial Intelligence Management System (AIMS)  
- **OECD AI Principles** — IA confiável e centrada no humano  
- **EU AI Act** — conceito de risco e obrigações (referência internacional; não é lei brasileira)  
- **LGPD** — arts. 6º, 20, 37, 38 e contratos com operadores (interseção privacy×AI)  
- **OWASP LLM Top 10** — riscos de segurança em aplicações com LLM  

Grupos de implementação (`G1`/`G2`/`G3`) seguem a lógica do PPSI: G1 = baseline, G2 = fortalecimento, G3 = avançado.

## Consulta de referências (como a LGPD)

- Página: [`/referencias/aigp`](/referencias/aigp) (menu **Governança de IA**)
- Drawer na landing e popup nos chips **Normas de referência** das medidas AIGP
- Frameworks: AIGP/IAPP, ISO/IEC 42001, NIST AI RMF, OECD, EU AI Act, OWASP LLM, PPSI, LGPD×IA
- Código: `src/lib/normas/aigpRefs.ts` + `AigpReferenciaPanel` / `AigpReferenciaDrawer`

Nos chips da medida: LGPD abre texto dos artigos; AIGP/ISO/NIST/PPSI abrem o painel com resumo + botões para o site oficial (ISO/IAPP não têm texto integral livre no app).

## Como validar no produto

1. Abrir um programa → **Diagnóstico**  
2. Confirmar o quarto domínio **GOVERNANÇA DE IA** (ícone Psychology)  
3. Expandir controles 26–35 e responder medidas (escala 1–6)  
4. Clicar nos chips de referência (ex.: ISO/IEC 42001, AIGP) e conferir o popup  
5. Conferir maturidade no dashboard / flip card (índice iAIGP)  

## Regenerar após editar o JSON

```bash
node scripts/generate-aigp-catalog.mjs
supabase db push
```

Não reaplicar a migration destrutiva do PPSI (`20260327120000_…`) — ela apaga medidas/controles.
