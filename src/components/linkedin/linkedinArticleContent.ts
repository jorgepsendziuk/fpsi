export const LINKEDIN_ARTICLE = {
  title:
    "Implementação open source do Framework PPSI 2.0: compliance digital, governança de dados e IA nos fluxos de conformidade",
  subtitle:
    "Código aberto para conduzir o Programa de Privacidade e Segurança da Informação na web — diagnóstico, tratamento de dados, titulares, riscos e auditoria em ambiente multi-usuário.",
  demoUrl: "https://fpsi.com.br/demo/login",
  repoUrl: "https://github.com/jorgepsendziuk/fpsi",
  repoPath: "github.com/jorgepsendziuk/fpsi",
} as const;

export type ArticleSection =
  | { type: "paragraphs"; paragraphs: string[] }
  | { type: "showcase"; legend: string; paragraphs: string[]; showcaseId: import("./showcase/types").LinkedInShowcaseId };

export type ArticleBlock = {
  id: string;
  heading?: string;
  sections: ArticleSection[];
};

export const LINKEDIN_ARTICLE_BODY: ArticleBlock[] = [
  {
    id: "abertura",
    sections: [
      {
        type: "paragraphs",
        paragraphs: [
          "A ferramenta oficial do PPSI em Excel funciona bem metodologicamente. Mas quem conduz programas de privacidade no dia a dia sabe onde ela trava: trabalho colaborativo, acesso remoto, trilha de auditoria, portal do titular, gestão de riscos — tudo isso fica fora da planilha ou exige outras soluções.",
          "O FPSI é reimplementação open source do Framework de Privacidade e Segurança da Informação (PPSI 2.0) — base técnica colaborativa para DPOs, gestores de SI e consultores.",
          "Abaixo, quatro telas do repositório em funcionamento, para ilustrar como o ciclo do programa se organiza num único ambiente.",
        ],
      },
    ],
  },
  {
    id: "print-1",
    heading: "Tela inicial",
    sections: [
      {
        type: "showcase",
        legend: "Documentação pública do projeto e ambiente explorável.",
        showcaseId: "landing-teaser",
        paragraphs: [
          "A página inicial descreve o escopo do repositório: conduzir o Programa de Privacidade e Segurança da Informação em um só lugar — diagnóstico, plano de trabalho, políticas, tratamento de dados, titulares, riscos e assistência por IA, alinhados à LGPD e ao PPSI 2.0.",
          "Há um ambiente de exploração sem cadastro, útil para quem quer entender o código em uso antes de clonar ou implantar localmente.",
        ],
      },
    ],
  },
  {
    id: "print-2",
    heading: "Dashboard do programa",
    sections: [
      {
        type: "showcase",
        legend: "Visão operacional dos módulos já implementados.",
        showcaseId: "program-modules",
        paragraphs: [
          "Dentro de um programa, a home concentra a operação. Dá para ver o andamento do diagnóstico (Estrutura, Segurança, Privacidade + domínio AIGP), pendências, plano de trabalho, políticas, tratamento de dados e governança.",
          "Da home do programa partem diagnóstico com evidências e relatório, plano de ação, políticas versionadas (com export PDF), mapeamento → ROPA → RIPD, incidentes, estrutura de responsáveis e papéis PPSI/LGPD, usuários com permissões por perfil e histórico de auditoria.",
          "Colaboração multi-usuário, com papéis e rastreabilidade.",
        ],
      },
    ],
  },
  {
    id: "print-3",
    heading: "Portal do titular",
    sections: [
      {
        type: "showcase",
        legend: "Canal público por organização — pedidos, reportes e documentos legais.",
        showcaseId: "program-portal",
        paragraphs: [
          "Cada programa pode expor um portal público por slug (fpsi.com.br/sua-org): pedidos de direitos, reportes, contato com o encarregado e documentos legais — política de privacidade, aviso do portal, cookies, declaração de segurança, termo de uso.",
          "Para quem implanta o código, o portal evita montar um site separado só para o canal de titulares. Configura, publica e versiona junto com o restante do programa.",
        ],
      },
    ],
  },
  {
    id: "print-4",
    heading: "Gestão de riscos",
    sections: [
      {
        type: "showcase",
        legend: "Matriz de riscos, priorização e acompanhamento de mitigação.",
        showcaseId: "riscos-interactive",
        paragraphs: [
          "O módulo de riscos permite registrar, posicionar na matriz (impacto × probabilidade), calcular risco residual e vincular ações de mitigação — conectado ao plano de trabalho e ao tratamento de dados quando faz sentido.",
          "No código, faz parte do mesmo fluxo do PPSI, em vez de ficar em planilha paralela.",
        ],
      },
    ],
  },
  {
    id: "extras",
    heading: "O que mais já está no repositório",
    sections: [
      {
        type: "paragraphs",
        paragraphs: [
          "Além das telas acima: mapeamento de dados com assistência por IA (sempre com revisão humana), referências consultáveis à LGPD e ao catálogo AIGP in-app, convites e permissões granulares (admin, coordenador, analista, consultor, auditor) e trilha de auditoria das ações relevantes.",
          "Licença aberta — veja o repositório para detalhes.",
        ],
      },
    ],
  },
  {
    id: "opensource",
    heading: "O que o código aberto permite",
    sections: [
      {
        type: "paragraphs",
        paragraphs: [
          "Implantar na infraestrutura da organização ou do cliente, com dados sob controle local. Adaptar módulos, portal e fluxos à realidade de cada programa, sem ficar preso a planilha isolada ou a ferramenta fechada.",
          "Consultorias podem operar uma instância por cliente; times internos podem estender integrações e relatórios com assistentes de código sobre o repositório. O framework continua alinhado ao PPSI; a implementação pode evoluir com issues e PRs.",
        ],
      },
    ],
  },
];

/** Módulos na capa — alinhados aos módulos do programa. */
export const COVER_MODULES = [
  { label: "Diagnóstico PPSI", color: "#43A047" },
  { label: "Governança de IA", color: "#7E57C2" },
  { label: "Estrutura de governança", color: "#78909C" },
  { label: "Plano de trabalho", color: "#1E88E5" },
  { label: "Políticas e documentos", color: "#00897B" },
  { label: "Mapeamento de dados", color: "#26A69A" },
  { label: "ROPA", color: "#1565C0" },
  { label: "RIPD / AIPD", color: "#ED6C02" },
  { label: "Incidentes", color: "#EF5350" },
  { label: "Portal do titular", color: "#0288D1" },
  { label: "Gestão de riscos", color: "#E53935" },
  { label: "Multi-usuário", color: "#FFB300" },
  { label: "Auditoria", color: "#455A64" },
  { label: "Referências LGPD", color: "#5C6BC0" },
  { label: "IA assistida", color: "#AB47BC" },
] as const;
