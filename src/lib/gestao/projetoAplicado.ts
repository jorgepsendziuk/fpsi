/**
 * Documentação retrospectiva de gestão do projeto FPSI
 * (Canvas, CSD, POEMS, personas, backlog, sprints).
 *
 * Fonte única para a página `/gestao` e para alinhamento com
 * docs/essentials/GESTAO_PROJETO_APLICADO.md.
 */

export const GESTAO_META = {
  titulo: "Projeto aplicado — gestão do FPSI",
  subtitulo:
    "Reconstrução retrospectiva da gestão do produto, com as mesmas ferramentas de um TCC de gestão ágil, para decidir onde focar agora.",
  periodo: "2024 — 2026",
  atualizadoEm: "2026-08-28",
  status: "Documento vivo",
} as const;

export type CanvasBlocoId =
  | "parceiros"
  | "atividades"
  | "proposta"
  | "relacionamento"
  | "segmentos"
  | "recursos"
  | "canais"
  | "custos"
  | "receitas";

export type CanvasBloco = {
  id: CanvasBlocoId;
  titulo: string;
  pergunta: string;
  itens: string[];
  destaque?: boolean;
};

export const CANVAS_BLOCOS: CanvasBloco[] = [
  {
    id: "parceiros",
    titulo: "Parceiros-chave",
    pergunta: "Quem amplia o alcance sem virar o produto?",
    itens: [
      "Professores e turmas de CDPO / LGPD (já há convite implícito para apresentar)",
      "Comunidade de software livre e órgãos que possam implantar o código",
      "GeoApps (infra e autoria)",
      "Referenciais públicos: PPSI 2.0, ANPD, LGPD — como fonte, não como endosso",
    ],
  },
  {
    id: "atividades",
    titulo: "Atividades-chave",
    pergunta: "O que precisa acontecer toda semana?",
    itens: [
      "Manter o catálogo PPSI/AIGP e o ciclo do programa (diagnóstico → evidência)",
      "Expor o produto a especialistas e capturar feedback",
      "Contar a jornada em linguagem de resultado, sem esconder os módulos",
      "Operar demo, docs e implantação para o primeiro órgão/consultor real",
    ],
  },
  {
    id: "proposta",
    titulo: "Proposta de valor",
    pergunta: "Por que isto existe, e não uma planilha nem um escritório?",
    destaque: true,
    itens: [
      "Implantar e gerir o Programa de Privacidade e Segurança da Informação num único ambiente",
      "Alternativa open source à planilha oficial do PPSI 2.0: colaborativa, auditável, adaptável",
      "O trabalho do DPO fica no sistema — não numa caixa-preta chamada “plataforma”",
      "Alinhado à LGPD, ao PPSI e a práticas de governança de IA (AIGP)",
    ],
  },
  {
    id: "relacionamento",
    titulo: "Relacionamento",
    pergunta: "Como a pessoa usa e volta?",
    itens: [
      "Autoatendimento: demo, cadastro, docs, GitHub",
      "Relação de pares com especialistas (curso, evento, conversa) — não de vendedor",
      "Futuro: implantação assistida e PaaS, sem substituir o produto por horas jurídicas",
    ],
  },
  {
    id: "segmentos",
    titulo: "Segmentos",
    pergunta: "Quem é usuário, quem é formador, quem compra?",
    itens: [
      "Usuário: DPO, TI/SI, comitê, consultor (persona João)",
      "Formador: professora/curso CDPO — o público que ainda não foi abordado de frente",
      "Operador público: gestor de órgão que precisa sair do Excel",
      "Comprador: diretor que hoje compraria um pacote “compliance + plataforma”",
    ],
  },
  {
    id: "recursos",
    titulo: "Recursos-chave",
    pergunta: "O que não dá para improvisar?",
    itens: [
      "Código e arquitetura (Next.js, Supabase, catálogo de 210 medidas)",
      "Dois anos de implementação do ciclo real do programa",
      "Pesquisa de origem (CSD/POEMS) e artigo acadêmico",
      "Demo pública e portal do titular por organização",
    ],
  },
  {
    id: "canais",
    titulo: "Canais",
    pergunta: "Por onde o especialista encontra isto?",
    itens: [
      "fpsi.com.br + demo",
      "Evento/aula da professora de LGPD (canal quente, ainda não usado)",
      "Artigo, GitHub, LinkedIn, página de divulgação",
      "Não: anúncio genérico de “segurança jurídica” sem mostrar o sistema",
    ],
  },
  {
    id: "custos",
    titulo: "Estrutura de custos",
    pergunta: "O que consome o projeto hoje?",
    itens: [
      "Tempo do autor (desenvolvimento, pesquisa, alinhamento normativo)",
      "Infra (Vercel, Supabase, e-mail, IA opcional)",
      "Risco de continuar polindo sem contato com o público especializado",
    ],
  },
  {
    id: "receitas",
    titulo: "Fontes de receita",
    pergunta: "Como isto se sustenta sem virar escritório + software opaco?",
    itens: [
      "Hoje: nenhum — estudo, software livre, construção de referência",
      "Caminho natural: PaaS, implantação, capacitação para turmas CDPO",
      "Fora de escopo: vender parecer jurídico e esconder o software",
    ],
  },
];

export const CSD = {
  certezas: [
    "A planilha oficial do PPSI é boa para validar medidas e calcular maturidade, e ruim para trabalho distribuído, acessibilidade e software livre.",
    "DPOs recém-formados saem do curso com teoria e sem ferramenta prática alinhada ao framework brasileiro.",
    "Há um mercado comercial que vende assessoria jurídica e menciona “a plataforma” de passagem — o produto deles é a hora do advogado.",
    "O FPSI já cobre o ciclo operacional (governança, diagnóstico, plano, políticas, ROPA/RIPD, titulares, riscos, auditoria, AIGP).",
    "A professora do curso de LGPD mencionou duas vezes o “sistema de LGPD” e sinalizou apresentação em evento — o público especializado já existe, só não foi abordado.",
  ],
  suposicoes: [
    "Especialistas preferem ver o produto e o método a um discurso de “segurança jurídica com tecnologia de ponta”.",
    "Uma camada de comunicação de resultado (jornada de implantação, porquê, para quem) aumenta adoção sem diluir a identidade técnica.",
    "O wedge correto é “PPSI que não é Excel”, não “canal de denúncias + escritório”.",
    "Apresentar agora valida mais do que mais seis meses de features.",
    "Usuário (DPO) e comprador (diretor) precisam de mensagens diferentes sobre o mesmo sistema.",
  ],
  duvidas: [
    "O especialista aponta gaps e adota mesmo assim, ou espera “produto acabado”?",
    "O primeiro cliente real é órgão público, consultor ou turma de formação?",
    "PaaS + open source convive, ou um dos dois vira o centro?",
    "Vale uma camada comercial (SLA, implantação) sem parecer escritório de advocacia?",
    "Lei 14.457 / canal de denúncias é adjacência útil ou diluição?",
  ],
} as const;

export const POEMS = {
  people: [
    "João, DPO recém-certificado, TI de origem",
    "Professora/formadora de CDPO que precisa de caso real para a turma",
    "Gestor de TI em órgão público preso à planilha",
    "Diretora que compraria um pacote “compliance + plataforma” sem abrir o sistema",
  ],
  objects: [
    "Planilha Excel do PPSI 2.0",
    "Políticas em PDF, ROPA, RIPD, evidências",
    "Dashboard de maturidade e plano de trabalho",
    "Portal do titular e pedidos art. 18",
    "Site institucional que fala de “plataforma” sem mostrar telas",
  ],
  environment: [
    "Órgão público com comitê e vários responsáveis",
    "Empresa média com DPO externo/consultor",
    "Sala de aula / evento online de LGPD",
    "Escritório de advocacia vendendo conformidade como serviço",
  ],
  messages: [
    "“Você está fazendo um sistema de LGPD” (o recorte da professora — incompleto, mas é o que o público ouve)",
    "“Plataforma” como palavra vazia (ofertas comerciais de assessoria)",
    "“Software livre alinhado ao PPSI” (o que o FPSI pode provar)",
    "Medo: assédio, fraude, multa — versus rotina: evidência, prazo, responsável",
  ],
  services: [
    "Diagnóstico de maturidade e plano de trabalho (FPSI e planilha oficial)",
    "Assessoria jurídica full service (escritório + “plataforma”)",
    "Canal de denúncias Lei 14.457 (outro produto)",
    "Consultoria de DPO e capacitação de turmas",
    "PaaS / implantação do próprio FPSI (ainda não empacotado)",
  ],
} as const;

export type PersonaId = "joao" | "ana" | "carlos" | "helena";

export type Persona = {
  id: PersonaId;
  nome: string;
  papel: string;
  recorte: string;
  dores: string[];
  oQueQuer: string[];
  oQueNaoQuer: string[];
  relacaoFpsi: string;
};

export const PERSONAS: Persona[] = [
  {
    id: "joao",
    nome: "João",
    papel: "DPO / consultor — usuário do dia a dia",
    recorte:
      "Profissional de TI que se especializou em gestão e concluiu formação de DPO. Tem teoria e pouca prática. Testou ferramentas comerciais que não se parecem entre si e a planilha do governo, que dá o roteiro mas não a gestão.",
    dores: [
      "Não sabe por onde começar o programa depois do curso",
      "Planilha não escala para vários responsáveis",
      "Ferramentas pagas não seguem o PPSI e não se adaptam",
    ],
    oQueQuer: [
      "Um roteiro que também seja sistema de trabalho",
      "Evidências, responsáveis e maturidade no mesmo lugar",
      "Poder mostrar o programa a um gestor ou auditor",
    ],
    oQueNaoQuer: [
      "Outra caixa-preta comercial",
      "Reescrever a metodologia do zero",
    ],
    relacaoFpsi: "Persona original da pesquisa. O produto já foi desenhado para ele.",
  },
  {
    id: "ana",
    nome: "Ana",
    papel: "Professora / formadora CDPO — público ainda não abordado",
    recorte:
      "Ministra LGPD/CDPO, cita na aula que um aluno “está fazendo um sistema de LGPD”, e já pediu apresentação em evento online. Precisa de objeto concreto para a turma ver o que a teoria vira no operacional.",
    dores: [
      "Alunos saem certificados sem ter tocado num programa real",
      "Material de aula é lei + slides; a ferramenta oficial é Excel",
      "Soluções comerciais não se prestam a demonstração pedagógica aberta",
    ],
    oQueQuer: [
      "Um sistema que a turma possa abrir, clicar e criticar",
      "Alinhamento explícito com LGPD e PPSI — não “plataforma” genérica",
      "História honesta de um projeto em construção, não um pitch de vendas",
    ],
    oQueNaoQuer: [
      "Propaganda de escritório",
      "Produto que esconde as telas",
    ],
    relacaoFpsi:
      "Canal quente e de menor custo de validação. O medo de “falhar tarde” aponta para ela, não para um lançamento comercial amplo.",
  },
  {
    id: "carlos",
    nome: "Carlos",
    papel: "Gestor de TI em órgão público",
    recorte:
      "Precisa implantar o PPSI de verdade, com vários departamentos. A planilha oficial é o que a portaria aponta; o Excel não aguenta o comitê.",
    dores: [
      "Arquivo único, versões conflitantes, pouco rastro de quem alterou o quê",
      "Acessibilidade e software proprietário no setor público",
      "Auditoria pede evidência, não uma célula amarela",
    ],
    oQueQuer: [
      "Implementação alinhada ao guia oficial, em software livre",
      "Multi-usuário, papéis, histórico",
      "Relatório de maturidade apresentável à chefia",
    ],
    oQueNaoQuer: [
      "Dependência de escritório privado para “operar a plataforma”",
      "Trocar o PPSI por um framework estrangeiro genérico",
    ],
    relacaoFpsi: "Melhor fit institucional do open source. Ainda não há caso de implantação documentado.",
  },
  {
    id: "helena",
    nome: "Helena",
    papel: "Diretora — compradora de pacote jurídico + plataforma",
    recorte:
      "Quer “proteger o negócio”, conformidade com LGPD e leis do setor, e não quer gerir software. Compra confiança institucional (escritório, certificações, SLA) e aceita não ver a plataforma.",
    dores: [
      "Risco reputacional e multa",
      "Não tem DPO interno maduro",
      "Não distingue canal de denúncias de programa de privacidade",
    ],
    oQueQuer: [
      "Alguém que assuma o problema",
      "Pacote com prazo e responsável jurídico",
      "Selo de “estamos adequados”",
    ],
    oQueNaoQuer: [
      "Aprender PPSI",
      "Avaliar catálogo de controles",
    ],
    relacaoFpsi:
      "Não é o cliente-núcleo do produto atual. A comunicação pode falar a língua dela (resultado, prazo, evidência); o produto não deve ser redesenhado para ela — isso é o caminho da assessoria opaca.",
  },
];

export const BENEFICIOS = [
  {
    titulo: "Para o DPO e a equipe",
    texto: "Um ambiente só para o ciclo do programa: da estrutura de governança à evidência. Substitui a planilha sem abandonar o método oficial.",
  },
  {
    titulo: "Para o formador e a turma",
    texto: "Objeto pedagógico real: demo, código aberto, catálogo visível. A aula deixa de ser só a lei e passa a ser o programa em operação.",
  },
  {
    titulo: "Para o órgão e a empresa",
    texto: "Trabalho colaborativo, trilha de auditoria, portal do titular, políticas versionadas. Conformidade como operação, não como teatro.",
  },
  {
    titulo: "Para o projeto",
    texto: "Documentar a gestão (este canvas) reduz o risco de dois anos de construção sem tese de foco — e prepara a conversa com o público especializado.",
  },
] as const;

export type HipoteseStatus = "a-testar" | "em-curso" | "validada" | "invalidada";

export type Hipotese = {
  id: string;
  enunciado: string;
  comoTestar: string;
  criterio: string;
  status: HipoteseStatus;
};

export const HIPOTESES: Hipotese[] = [
  {
    id: "H1",
    enunciado:
      "Apresentar o FPSI no canal da professora (aula ou evento online) gera feedback utilizável de especialistas em 30 dias — e não “fracasso público”.",
    comoTestar: "Aceitar o convite, demonstrar o ciclo do programa (não um tour de 40 telas), coletar 5 conversas.",
    criterio: "≥5 especialistas usam a demo ou enviam crítica concreta; nenhuma crítica central é “faltou parecer jurídico”.",
    status: "a-testar",
  },
  {
    id: "H2",
    enunciado:
      "Especialistas criticam gaps de UX/catálogo/onboarding, não a ausência de canal de denúncias ou de escritório parceiro.",
    comoTestar: "Pergunta aberta após a demo: “o que falta para você usar isto na próxima semana?”",
    criterio: "Agrupar pedidos; se 14.457/advocacia não aparecer no topo, o wedge técnico se confirma.",
    status: "a-testar",
  },
  {
    id: "H3",
    enunciado:
      "Uma jornada de implantação em linguagem de resultado (diagnóstico → operação → evidência) aumenta o entendimento do comprador sem esconder o produto.",
    comoTestar: "Ajustar landing/sobre com processo visível, mantendo módulos e demo.",
    criterio: "Pessoas descrevem o FPSI como “programa”, não só como “sistema de LGPD” ou “plataforma”.",
    status: "em-curso",
  },
  {
    id: "H4",
    enunciado:
      "Copiar o modelo assessoria-na-frente / software-opaco destrói a vantagem de dois anos e não acelera adoção entre especialistas.",
    comoTestar: "Não executar esse modelo; observar se o público Ana/João pede transparência ou “pacote jurídico”.",
    criterio: "Demanda dominante por ver o sistema e adaptar o código/método — não por SLA jurídico.",
    status: "em-curso",
  },
  {
    id: "H5",
    enunciado:
      "Tornar a gestão do projeto visível (esta página) aumenta credibilidade acadêmica e de especialistas mais do que um site institucional genérico.",
    comoTestar: "Usar /gestao como material de apoio na apresentação.",
    criterio: "Pelo menos um formador ou aluno usa o canvas/backlog como referência, não só a landing.",
    status: "a-testar",
  },
];

export const SMART = {
  especifico:
    "Validar o FPSI com o público especializado (formadores e praticantes de LGPD/CDPO/PPSI) e decidir o wedge comercial com evidência.",
  mensuravel:
    "1 apresentação em evento ou aula + 5 conversas documentadas + decisão escrita do wedge (formação, órgão, PaaS ou recorte).",
  atingivel:
    "O produto já opera o ciclo; o convite da professora já existe; a demo já está no ar.",
  relevante:
    "Dois anos de construção sem esse contato é o verdadeiro risco de falhar tarde — não o risco de mostrar o que já existe.",
  temporal: "Até 30 de novembro de 2026.",
  frase:
    "Até 30/11/2026, apresentar o FPSI a especialistas (aula ou evento), obter feedback documentado de pelo menos cinco praticantes e decidir, por escrito, o recorte de foco dos 90 dias seguintes — sem abrir frente de canal de denúncias nem de escritório jurídico.",
} as const;

export const PREMISSAS = [
  "O referencial normativo âncora continua sendo LGPD + PPSI 2.0 (+ AIGP como extensão, não como substituto).",
  "O código permanece aberto; eventual PaaS é camada, não reescrita do modelo.",
  "O usuário-núcleo é quem opera o programa (João/Carlos), não quem só compra um selo (Helena).",
  "Comunicação de resultado é complemento da honestidade técnica, não um verniz que esconde telas.",
] as const;

export const RESTRICOES = [
  "Um autor, tempo finito: cada frente nova (14.457, pareceres, multi-tenant enterprise) atrasa o contato com especialistas.",
  "Não apagar dados de produção; mudanças de schema só por migration.",
  "Não se apresentar como produto oficial do governo, ANPD ou IAPP.",
  "Não competir com escritório de advocacia no terreno deles (hora jurídica, canal de denúncias como produto-pai).",
] as const;

export type BacklogStatus = "feito" | "agora" | "seguinte" | "depois" | "nao-fazer";
export type BacklogPrioridade = "P0" | "P1" | "P2";

export type BacklogItem = {
  id: string;
  titulo: string;
  motivo: string;
  status: BacklogStatus;
  prioridade: BacklogPrioridade;
  persona: PersonaId | "todas";
};

export const BACKLOG: BacklogItem[] = [
  {
    id: "B01",
    titulo: "Ciclo PPSI no sistema (diagnóstico, maturidade, plano)",
    motivo: "Substituir a planilha no que ela já faz bem, em ambiente web.",
    status: "feito",
    prioridade: "P0",
    persona: "joao",
  },
  {
    id: "B02",
    titulo: "Multi-usuário, papéis e trilha de auditoria",
    motivo: "A limitação nº 1 da planilha é trabalho distribuído.",
    status: "feito",
    prioridade: "P0",
    persona: "carlos",
  },
  {
    id: "B03",
    titulo: "Políticas, ROPA, RIPD, incidentes, portal do titular",
    motivo: "O programa não é só questionário: é operação LGPD.",
    status: "feito",
    prioridade: "P0",
    persona: "joao",
  },
  {
    id: "B04",
    titulo: "Riscos, AIGP, assistência por IA, demo e landing",
    motivo: "Completar o ambiente e tornar o produto apresentável.",
    status: "feito",
    prioridade: "P1",
    persona: "todas",
  },
  {
    id: "B05",
    titulo: "Documentação de gestão do projeto (canvas, CSD, backlog)",
    motivo: "Tese de foco explícita antes de mais features.",
    status: "agora",
    prioridade: "P0",
    persona: "ana",
  },
  {
    id: "B06",
    titulo: "Apresentar a especialistas (professora / evento online)",
    motivo: "Canal quente; barato; único experimento que desfaz o medo de falhar tarde.",
    status: "agora",
    prioridade: "P0",
    persona: "ana",
  },
  {
    id: "B07",
    titulo: "Roteiro de demo de 12 minutos (ciclo, não catálogo de telas)",
    motivo: "Especialista precisa ver o programa andar, não um inventário de módulos.",
    status: "agora",
    prioridade: "P0",
    persona: "ana",
  },
  {
    id: "B08",
    titulo: "Jornada de implantação na comunicação (sem esconder o produto)",
    motivo: "Absorver a gramática comercial (processo, prazo, porquê) e recusar a opacidade.",
    status: "seguinte",
    prioridade: "P1",
    persona: "helena",
  },
  {
    id: "B09",
    titulo: "Kit para turma CDPO (demo guiada + exercício no programa)",
    motivo: "Transformar o formador em canal permanente.",
    status: "seguinte",
    prioridade: "P1",
    persona: "ana",
  },
  {
    id: "B10",
    titulo: "Primeira implantação acompanhada (órgão ou consultor)",
    motivo: "Evidência de uso real; alimenta o wedge.",
    status: "seguinte",
    prioridade: "P1",
    persona: "carlos",
  },
  {
    id: "B11",
    titulo: "Empacotar PaaS / onboarding de organização",
    motivo: "Sustentação futura; só depois de haver demanda observada.",
    status: "depois",
    prioridade: "P2",
    persona: "carlos",
  },
  {
    id: "B12",
    titulo: "Canal de denúncias Lei 14.457 como produto-pai",
    motivo: "É o centro de outra categoria (canal de denúncias), não do FPSI. Dilui o wedge PPSI.",
    status: "nao-fazer",
    prioridade: "P2",
    persona: "helena",
  },
  {
    id: "B13",
    titulo: "Reposicionar o FPSI como escritório + plataforma opaca",
    motivo: "Destrói a vantagem técnica e encaixa o FPSI num mercado cujo ativo é a banca, não o sistema.",
    status: "nao-fazer",
    prioridade: "P2",
    persona: "helena",
  },
];

export type SprintLicao = {
  titulo: string;
  texto: string;
};

export type Sprint = {
  id: string;
  nome: string;
  periodo: string;
  objetivo: string;
  planejamento: string[];
  execucao: string[];
  resultados: string[];
  licoes: SprintLicao[];
  retrospectiva: boolean;
};

export const SPRINTS: Sprint[] = [
  {
    id: "S1",
    nome: "Sprint 1 — Núcleo metodológico",
    periodo: "Origem (pesquisa → primeiro sistema de diagnóstico)",
    objetivo:
      "Provar que o framework oficial cabe numa aplicação web colaborativa, sem perder o cálculo de maturidade.",
    planejamento: [
      "Pesquisa com praticantes do curso CDPO/BR (Matriz CSD e POEMS originais).",
      "Persona João e problema da planilha (acessibilidade, arquivo único, software proprietário).",
      "Escopo: cadastros, controles/medidas, INCC, relatório, plano de trabalho.",
    ],
    execucao: [
      "Implementação web do diagnóstico PPSI (controles, medidas, evidências).",
      "Cálculo de maturidade alinhado à ferramenta oficial.",
      "Plano de trabalho derivado de gaps.",
      "Base multi-tenant inicial (programa como unidade).",
    ],
    resultados: [
      "Há um sistema, não só um estudo, que reproduz o roteiro oficial.",
      "A tese “Excel é o método certo na tecnologia errada” ficou demonstrável.",
    ],
    licoes: [
      {
        titulo: "Método primeiro",
        texto: "Fidelidade ao catálogo e ao cálculo importa mais, no início, do que visual de mercado.",
      },
      {
        titulo: "Pesquisa pequena, sinal claro",
        texto: "Três conversas no CDPO já bastaram para não construir um GRC genérico.",
      },
    ],
    retrospectiva: true,
  },
  {
    id: "S2",
    nome: "Sprint 2 — O programa além do questionário",
    periodo: "Expansão do ciclo LGPD",
    objetivo:
      "Cobrir a rotina do DPO que a planilha não cobre: documentos, tratamentos, titulares, colaboração.",
    planejamento: [
      "Mapear arts. 18, 37, 38, 41 da LGPD para módulos.",
      "Multi-usuário e papéis como requisito de órgão/consultoria.",
    ],
    execucao: [
      "Políticas com editor, versão e PDF.",
      "Mapeamento, ROPA, RIPD/AIPD, incidentes.",
      "Portal público por slug, pedidos dos titulares, reportes.",
      "Convites, papéis, histórico de atividades.",
    ],
    resultados: [
      "O produto deixou de ser “ferramenta de diagnóstico” e passou a ser ambiente do programa — alinhado ao PRD atual.",
      "Surgiu o risco de amplitude: muitos módulos, pouca narrativa única.",
    ],
    licoes: [
      {
        titulo: "Completude vs. recorte",
        texto: "Cada módulo novo é correto e, somado, dificulta explicar o produto em uma frase. O recorte da professora (“sistema de LGPD”) é sintoma disso.",
      },
      {
        titulo: "Colaboração é o diferencial real",
        texto: "Papéis e auditoria atacam a dor da planilha melhor do que mais um questionário.",
      },
    ],
    retrospectiva: true,
  },
  {
    id: "S3",
    nome: "Sprint 3 — Superfície pública e programa completo",
    periodo: "Até 2026 (estado atual do produto)",
    objetivo:
      "Tornar o sistema apresentável e cobrir riscos, IA e a face pública (landing, demo, artigo).",
    planejamento: [
      "Landing e demo como canal, não só o app autenticado.",
      "AIGP e riscos como extensão do mesmo programa, não como produto separado.",
    ],
    execucao: [
      "Gestão de riscos 5×5, escritório de governança, cultura.",
      "Domínio AIGP, inventário de IA, assistência por IA no mapeamento.",
      "Landing, demo, artigo, página Sobre, materiais de divulgação.",
      "Selo, portal, fluxos de auditoria externa.",
    ],
    resultados: [
      "Há o que mostrar a um especialista sem desculpa de “ainda é só o diagnóstico”.",
      "A comunicação ainda é mais técnica do que a do mercado de assessoria — e isso é ativo, se houver um processo visível por cima.",
      "O medo de divulgar ficou desproporcional ao estado do produto.",
    ],
    licoes: [
      {
        titulo: "Produto à frente da narrativa",
        texto: "Dois anos construíram substância. O gargalo agora é contato com o público Ana, não mais um módulo.",
      },
      {
        titulo: "Não competir em opacidade",
        texto: "Sites que escondem a plataforma existem porque o software não é o negócio. O nosso é. Mostrar telas é o moat.",
      },
    ],
    retrospectiva: true,
  },
  {
    id: "S4",
    nome: "Sprint 4 — Foco e validação (atual)",
    periodo: "Ago — Nov 2026",
    objetivo: SMART.frase,
    planejamento: [
      "Reconstruir Canvas, CSD, POEMS, personas e backlog (este documento).",
      "Roteiro de demo de 12 minutos.",
      "Aceitar o canal da professora.",
    ],
    execucao: [
      "Página /gestao e documentação em docs/essentials.",
      "Hipóteses H1–H5 explícitas.",
      "Lista explícita do que não fazer (assessoria opaca, 14.457 como produto-pai).",
    ],
    resultados: [
      "Tese de foco escrita: absorver gramática comercial, recusar o modelo escritório + plataforma opaca.",
      "Próximo resultado a evidenciar: a apresentação, não mais um módulo.",
    ],
    licoes: [
      {
        titulo: "Ferramentas de gestão servem agora",
        texto: "Usar Canvas/CSD retrospectivamente não é burocracia: é o antídoto contra continuar construindo sem wedge.",
      },
    ],
    retrospectiva: false,
  },
];

export const OFERTA_COMERCIAL = {
  oQueE:
    "Ofertas de compliance em que o produto real é a assessoria jurídica: gestão de riscos e canal de denúncias (Lei 14.457/2022), com uma “plataforma” mencionada de passagem. O software é veículo; o negócio é a hora do advogado.",
  absorver: [
    {
      item: "Falar com quem compra, não só com quem opera",
      detalhe:
        "“Proteger seu negócio”, prazo de implantação, porquê. O DPO ainda precisa das telas; o diretor precisa da jornada.",
    },
    {
      item: "Processo visível com tempo",
      detalhe:
        "Diagnóstico → proposta → implementação → acompanhamento. O FPSI já tem o ciclo; falta desenhá-lo como implementação, não só como mapa de módulos.",
    },
    {
      item: "CTA para o especialista",
      detalhe:
        "O mercado de assessoria costuma repetir “falar com um especialista”. Nós já temos o especialista pedindo para ver o sistema. O CTA nosso é demonstrar, não agendar parecer.",
    },
    {
      item: "Bloco “por que escolher”",
      detalhe:
        "Três razões honestas: alinhado ao PPSI, código aberto, o programa inteiro no mesmo ambiente. Sem criptografia-ponta-a-ponta de marketing.",
    },
  ],
  recusar: [
    {
      item: "Produto invisível",
      detalhe:
        "Chamar de “plataforma” e não mostrar o trabalho é o oposto do moat do FPSI. Especialista cheira vaporware.",
    },
    {
      item: "O negócio ser a banca",
      detalhe:
        "Não há uma banca consolidada aqui — há dois anos de sistema. Competir em hora jurídica é escolher o campo onde o escritório ganha.",
    },
    {
      item: "Medo como proposta de valor",
      detalhe:
        "Assédio, fraude, corrupção e Lei 14.457 são outro produto (canal de denúncias). O FPSI é o sistema operacional do programa de privacidade.",
    },
    {
      item: "Claims sem evidência",
      detalhe:
        "“Criptografia de ponta a ponta”, “24h SLA”, “100% LGPD” sem demonstração. O público Ana/João pune isso.",
    },
  ],
  veredito:
    "Absorver a gramática (jornada, comprador, porquê). Recusar o modelo (escritório na frente, software opaco, 14.457 no centro). A forma final do FPSI não é uma assessoria com software de fachada — é o contrário: o programa visível, operável, ensinável.",
} as const;

export const DIRECIONAMENTO = {
  wedge:
    "O sistema operacional do programa de privacidade — alinhado ao PPSI, aberto, usável por quem faz o trabalho.",
  naoE: [
    "Canal de denúncias + banca de advocacia",
    "Mais um GRC genérico “LGPD-ready”",
    "Só a planilha no navegador, sem o resto do ciclo",
  ],
  noventaDias: [
    "Marcar e realizar a apresentação com a professora / evento",
    "Demo de 12 minutos: governança → diagnóstico → plano → evidência/portal",
    "Cinco conversas com praticantes; atualizar CSD com o que ouvir",
    "Só então decidir PaaS vs. kit de formação vs. implantação em órgão",
  ],
  medo:
    "Falhar tarde não é mostrar o sistema agora. É continuar desenvolvendo em silêncio até o mercado (ou a turma) adotar outra coisa — inclusive uma “plataforma” que ninguém vê. O convite da professora é o experimento mais barato dos últimos dois anos.",
} as const;

export const BACKLOG_STATUS_LABEL: Record<BacklogStatus, string> = {
  feito: "Feito",
  agora: "Agora",
  seguinte: "Seguinte",
  depois: "Depois",
  "nao-fazer": "Não fazer",
};

export const HIPOTESE_STATUS_LABEL: Record<HipoteseStatus, string> = {
  "a-testar": "A testar",
  "em-curso": "Em curso",
  validada: "Validada",
  invalidada: "Invalidada",
};
