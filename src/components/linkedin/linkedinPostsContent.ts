export type LinkedInPostPrint = {
  label: string;
  /** Rota ou tela sugerida para captura */
  hint: string;
};

export type LinkedInPost = {
  id: string;
  title: string;
  status: "ready" | "idea";
  summary: string;
  feedText: string;
  commentHint?: string;
  prints: LinkedInPostPrint[];
  hashtags?: string;
};

/** Rascunhos para posts diários no LinkedIn — tom open source, não comercial. */
export const LINKEDIN_POSTS: LinkedInPost[] = [
  {
    id: "post-opensource",
    title: "Código aberto: implantação, fork e IA de produtividade",
    status: "ready",
    summary: "Implantar na empresa, rodar localmente, estender com agentes de código.",
    feedText: `Software de privacidade costuma fechar três caminhos: planilha oficial, SaaS mensal ou montar um quebra-cabeça de ferramentas.

Com código aberto no FPSI, o repositório vira base técnica: clone na infra da organização, ambiente local com Supabase, ou instância por cliente na consultoria.

O interessante na prática — além do deploy — é a extensibilidade. O código é TypeScript legível; dá para acelerar adaptações com Cursor, Copilot ou agentes sobre o repo: novos campos no mapeamento, relatórios, integrações com ticket ou GRC, automações no plano de trabalho.

Implantação típica: fork → variáveis de ambiente → Supabase (Auth + Postgres) → deploy (Vercel ou on-prem). Multi-usuário, papéis e auditoria já vêm no núcleo.

Repositório: github.com/jorgepsendziuk/fpsi`,
    commentHint: "Demo: fpsi.com.br/demo/login",
    prints: [
      { label: "README / estrutura do repositório", hint: "GitHub — README e docs/essentials/setup" },
      { label: "Home do programa (módulos)", hint: "/programas/[id] — grid de módulos" },
      { label: "Usuários e permissões", hint: "/programas/[id]/usuarios" },
    ],
    hashtags: "#opensource #PPSI #LGPD #privacidade",
  },
  {
    id: "post-ia-mapeamento",
    title: "IA como assistente — não como DPO automático",
    status: "ready",
    summary: "Sugestões de levantamentos com revisão humana obrigatória.",
    feedText: `Mapeamento de dados pessoais é trabalho repetitivo: setor, finalidade, categorias, titular, retenção — linha após linha.

No FPSI, a função "Sugerir levantamentos com IA" gera rascunhos a partir de metadados institucionais do programa (nome, escopo, atividade) — sem enviar dados pessoais de titulares para o modelo.

O fluxo: a API valida cada sugestão contra listas fechadas do inventário → o analista pré-visualiza → seleciona o que faz sentido → grava. Assistência operacional, revisão humana obrigatória.

A mesma lógica pode evoluir para apoiar operações no ROPA a partir de levantamentos já validados — sempre com limite de taxa e sem substituir parecer jurídico.

Print do painel de mapeamento + modal de sugestões costuma comunicar bem a ideia.`,
    commentHint: "Código da API: src/app/api/.../suggest-mapeamentos",
    prints: [
      { label: "Lista de mapeamentos", hint: "/programas/[id]/conformidade/mapeamento" },
      { label: "Modal / painel de sugestões IA", hint: "Botão 'Sugerir levantamentos com IA' no mapeamento" },
      { label: "Aviso de revisão humana", hint: "Texto de disclaimer na UI após sugestão" },
    ],
    hashtags: "#LGPD #IA #privacidade #ROPA",
  },
  {
    id: "post-ppsi-aigp",
    title: "PPSI 2.0 + Governança de IA no mesmo diagnóstico",
    status: "ready",
    summary: "Catálogo AIGP integrado — além da planilha Excel oficial.",
    feedText: `O PPSI 2.0 organiza privacidade e segurança da informação em Estrutura, Segurança e Privacidade. Organizações que usam IA precisam de um eixo a mais.

O FPSI mantém o catálogo oficial PPSI e acrescenta o domínio Governança de IA (AIGP): 10 controles, 54 medidas, mesma escala de maturidade — inventário de sistemas de IA, riscos, LGPD×IA, fornecedores, viés, ciclo de vida.

Na planilha Excel, o foco é o roteiro PPSI clássico. Aqui, diagnóstico web colaborativo com referências in-app (LGPD, NIST AI RMF, ISO 42001, OECD) nos chips de cada medida — sem trocar de aba a cada dúvida.

Para quem conduz programa de privacidade e governança de IA no mesmo comitê, um índice de maturidade unificado faz diferença operacional.

Demo: fpsi.com.br/demo/login — módulo Diagnóstico → domínio Governança de IA.`,
    prints: [
      { label: "Diagnóstico — domínios PPSI + AIGP", hint: "/programas/[id]/diagnostico — sidebar" },
      { label: "Medida AIGP com referências", hint: "Expandir medida → chips Normas de referência" },
      { label: "Referências AIGP in-app", hint: "/referencias/aigp" },
    ],
    hashtags: "#PPSI #AIGP #governançadeIA #LGPD",
  },
  {
    id: "post-diagnostico",
    title: "Diagnóstico de maturidade e normas de referência",
    status: "ready",
    summary: "Controles, medidas, evidências e ligação com LGPD, CIS, NIST, ISO.",
    feedText: `Diagnóstico de maturidade no PPSI não é checklist decorativo — é a fotografia do programa: controles, medidas, nível de implementação (INCC), evidências e responsáveis.

No FPSI, cada medida traz normas de referência mapeadas. Citação à LGPD abre o artigo in-app; CIS, NIST, ISO e demais referências têm atalho conforme o mapeamento — o analista consulta sem sair do fluxo.

O relatório consolida índices por domínio (Estrutura, Segurança, Privacidade, Governança de IA) e alimenta o plano de trabalho: lacunas viram ações com prazo e responsável.

Comparado à planilha oficial: mesma metodologia PPSI 2.0, com multi-usuário, trilha de auditoria e relatório exportável num ambiente web.

Print sugerido: árvore diagnóstico → controle → medida com chip LGPD + trecho do relatório.`,
    prints: [
      { label: "Árvore diagnóstico → medida", hint: "/programas/[id]/diagnostico" },
      { label: "Popup artigo LGPD", hint: "Chip LGPD em medida → drawer/dialog" },
      { label: "Relatório de maturidade", hint: "/programas/[id]/diagnostico/relatorio" },
    ],
    hashtags: "#PPSI #diagnóstico #LGPD #maturidade",
  },
];

/** Temas para posts futuros — ainda sem texto completo. */
export const LINKEDIN_POST_BACKLOG: Array<{ id: string; title: string; note: string }> = [
  {
    id: "portal-titular",
    title: "Portal do titular e art. 18 LGPD",
    note: "Pedidos, reportes, docs legais (cookies, aviso, política) por slug.",
  },
  {
    id: "ropa-fluxo",
    title: "Do mapeamento ao ROPA",
    note: "Levantamento → operação de tratamento → vínculo no registro art. 37.",
  },
  {
    id: "plano-trabalho",
    title: "Plano de trabalho a partir do diagnóstico",
    note: "Lacunas de maturidade viram ações com prazo e responsável.",
  },
  {
    id: "riscos-matriz",
    title: "Gestão de riscos integrada ao programa",
    note: "Matriz 5×5, risco residual, mitigação ligada ao plano.",
  },
  {
    id: "auditoria",
    title: "Trilha de auditoria multi-usuário",
    note: "Papéis (admin, coordenador, analista, consultor, auditor) e histórico.",
  },
  {
    id: "politicas-portal",
    title: "Políticas versionadas e portal público",
    note: "Editor, PDF, publicação de textos legais no canal do titular.",
  },
  {
    id: "ripd-incidentes",
    title: "RIPD e incidentes no mesmo hub",
    note: "Tratamento de dados: impacto, registro e resposta.",
  },
  {
    id: "referencias-lgpd",
    title: "LGPD consultável dentro do fluxo",
    note: "Artigos indexados — consulta sem trocar de ferramenta.",
  },
];
