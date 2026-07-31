export type LinkedInPostPrint = {
  label: string;
  /** Rota ou tela sugerida para captura */
  hint?: string;
  showcaseId: import("./showcase/types").LinkedInShowcaseId;
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

/** Rascunhos para posts diários no LinkedIn — tom direto, open source. */
export const LINKEDIN_POSTS: LinkedInPost[] = [
  {
    id: "post-opensource",
    title: "Com o código do framework de privacidade, sua organização escolhe onde e como rodar",
    status: "ready",
    summary:
      "Clonar o repositório, hospedar na infra própria, manter instância por cliente ou adaptar fluxos — sem ficar preso a fornecedor fechado.",
    feedText: `O FPSI é código aberto. Quem quiser pode clonar o repositório, rodar na infraestrutura da organização ou manter uma instância por cliente na consultoria.

O repositório cobre o ciclo do programa PPSI em ambiente web: diagnóstico, plano de trabalho, tratamento de dados, portal do titular, riscos, papéis e auditoria.

Também dá para adaptar fluxos com assistentes de código sobre o repositório — estender campos no mapeamento, relatórios ou integrações internas, conforme a necessidade de cada organização.

Instruções de instalação no README do projeto.

Repositório: github.com/jorgepsendziuk/fpsi`,
    commentHint: "Demo: fpsi.com.br/demo/login",
    prints: [
      { label: "Implantação open source", showcaseId: "opensource-hub" },
      { label: "Home do programa (módulos)", showcaseId: "program-modules" },
      { label: "Painel operacional", showcaseId: "program-dashboard" },
    ],
    hashtags: "#opensource #PPSI #LGPD #privacidade",
  },
  {
    id: "post-ia-mapeamento",
    title: "Mapeamento de dados pessoais: sugestões por IA, decisão sempre humana",
    status: "ready",
    summary:
      "Em um programa de privacidade web, rascunhos de levantamentos saem do contexto da organização; o analista revisa e valida antes de gravar.",
    feedText: `No mapeamento de dados pessoais entram setor, finalidade, categorias, titular, retenção — muitas linhas parecidas.

O FPSI tem a função "Sugerir levantamentos com IA". Ela usa metadados institucionais do programa (nome, escopo, atividade) e devolve rascunhos em formato estruturado. Dados pessoais de titulares não saem para o modelo.

Cada sugestão passa por listas fechadas do inventário. O analista pré-visualiza, escolhe o que vale e grava. A decisão final é sempre humana.

Serve para aliviar o preenchimento inicial. O parecer jurídico continua com a equipe.`,
    commentHint: "Demo: fpsi.com.br/demo/login → mapeamento de dados",
    prints: [
      { label: "Lista de mapeamentos", showcaseId: "conformidade", hint: "ROPA e tratamentos" },
      { label: "Painel de sugestões IA", showcaseId: "ai-mapeamento" },
      { label: "Revisão humana", showcaseId: "ai-mapeamento" },
    ],
    hashtags: "#LGPD #IA #privacidade #ROPA",
  },
  {
    id: "post-ppsi-aigp",
    title: "Programa PPSI 2.0 e Governança de IA no mesmo painel de maturidade",
    status: "ready",
    summary:
      "Estrutura, Segurança, Privacidade e domínio AIGP na mesma escala — normas como NIST AI RMF e ISO 42001 consultáveis em cada medida.",
    feedText: `O PPSI 2.0 organiza o programa em Estrutura, Segurança e Privacidade. Quem também precisa tratar governança de IA encontra no FPSI um domínio adicional: Governança de IA (AIGP), com controles e medidas na mesma escala de maturidade.

Inventário de sistemas de IA, riscos, LGPD×IA, fornecedores, viés, ciclo de vida — com referências como NIST AI RMF, ISO 42001 e OECD consultáveis nos chips de cada medida.

Diagnóstico colaborativo, índices por domínio num só relatório.

Demo: fpsi.com.br/demo/login → Diagnóstico → Governança de IA`,
    prints: [
      { label: "Diagnóstico — domínios PPSI + AIGP", showcaseId: "diagnostico" },
      { label: "Medida AIGP com referências", showcaseId: "aigp" },
      { label: "Normas consultáveis", showcaseId: "diagnostico-normas" },
    ],
    hashtags: "#PPSI #AIGP #governançadeIA #LGPD",
  },
  {
    id: "post-diagnostico",
    title: "Diagnóstico de maturidade em privacidade: controles, evidências e normas no fluxo",
    status: "ready",
    summary:
      "Medidas do PPSI com LGPD, CIS, NIST e ISO acessíveis na tela; relatório e plano de trabalho saem do mesmo ambiente colaborativo.",
    feedText: `O diagnóstico de maturidade no PPSI registra controles, medidas, nível de implementação (INCC), evidências e responsáveis. A partir daí saem o relatório e o plano de trabalho.

No FPSI, cada medida pode trazer normas de referência. Citação à LGPD abre o artigo dentro do sistema; CIS, NIST, ISO e outras referências têm atalho conforme o mapeamento da medida.

O relatório consolida índices por domínio — Estrutura, Segurança, Privacidade, Governança de IA — e as lacunas podem virar ações no plano de trabalho, com prazo e responsável.

Metodologia PPSI 2.0 alinhada à ferramenta oficial, com trabalho multi-usuário e histórico de alterações.`,
    prints: [
      { label: "Árvore diagnóstico → medida", showcaseId: "diagnostico" },
      { label: "Normas LGPD / CIS / NIST", showcaseId: "diagnostico-normas" },
      { label: "Relatório de maturidade", showcaseId: "diagnostico" },
    ],
    hashtags: "#PPSI #diagnóstico #LGPD #maturidade",
  },
  {
    id: "post-riscos",
    title: "Programa de privacidade e segurança: mapa de riscos com prioridade visual",
    status: "ready",
    summary:
      "Probabilidade × impacto em matriz 5×5, categorias (privacidade, segurança, conformidade…), mitigação e acompanhamento de status — no mesmo ambiente do PPSI.",
    feedText: `Risco de privacidade, segurança, conformidade ou reputação costuma ficar espalhado: planilha aqui, e-mail ali, ata de comitê em outro lugar. Sem mapa comum, a equipe trata o urgente e esquece o importante.

No FPSI, a gestão de riscos fica no mesmo programa do diagnóstico PPSI e do tratamento de dados. Cada risco tem título, categoria, probabilidade e impacto (escala 1–5), score de prioridade e estratégia de mitigação.

A matriz de calor mostra onde concentrar esforço: clique numa célula e filtre a lista. Status como identificado, em tratamento, mitigado ou aceito acompanham o ciclo de vida — útil para comitês, auditorias e revisões periódicas.

Privacidade, segurança, direitos dos titulares e operacional no mesmo registro, acessível à equipe multi-usuário do programa.

Demo: fpsi.com.br/demo/login → Gestão de riscos`,
    commentHint: "Demo: fpsi.com.br/demo/login → /programas/[id]/riscos",
    prints: [
      { label: "Mapa de calor 5×5 (clique)", showcaseId: "riscos-interactive" },
      { label: "Matriz animada", showcaseId: "riscos-matrix" },
      { label: "Priorização visual", showcaseId: "riscos-interactive" },
    ],
    hashtags: "#gestãoderiscos #PPSI #LGPD #privacidade #segurança",
  },
];

/** Temas para posts futuros — ainda sem texto completo. */
export const LINKEDIN_POST_BACKLOG: Array<{ id: string; title: string; note: string }> = [
  {
    id: "portal-titular",
    title: "Canal público da organização para pedidos dos titulares (LGPD art. 18)",
    note: "Portal por slug: pedidos, reportes, cookies, aviso e política de privacidade.",
  },
  {
    id: "ropa-fluxo",
    title: "Do levantamento de tratamentos ao ROPA (art. 37) em fluxo contínuo",
    note: "Inventário de dados → operação de tratamento → registro formal no mesmo sistema.",
  },
  {
    id: "plano-trabalho",
    title: "Do diagnóstico ao plano de ação: lacunas de maturidade viram tarefas",
    note: "Gaps identificados no PPSI convertidos em ações com prazo e responsável.",
  },
  {
    id: "auditoria",
    title: "Equipe multi-usuário no mesmo programa, com papéis e trilha de alterações",
    note: "Admin, coordenador, analista, consultor e auditor — histórico do que mudou.",
  },
  {
    id: "politicas-portal",
    title: "Políticas internas editáveis, versionadas e publicadas no portal do titular",
    note: "Editor, PDF e textos legais no canal público da organização.",
  },
  {
    id: "ripd-incidentes",
    title: "RIPD e gestão de incidentes no mesmo módulo de tratamento de dados",
    note: "Análise de impacto, registro e resposta a incidentes em um hub.",
  },
  {
    id: "referencias-lgpd",
    title: "Artigos da LGPD consultáveis dentro do fluxo de conformidade",
    note: "Referência normativa na medida, sem trocar de ferramenta.",
  },
];
