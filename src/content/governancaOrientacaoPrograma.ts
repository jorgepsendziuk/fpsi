/**
 * Textos institucionais para a página Estrutura de Governança do programa.
 * Fundamentação alinhada à Cartilha da Estrutura de Governança do PPSI 2.0 (SGD/MGI, v. 1.0, jan/2026).
 */

export const CARTILHA_REFERENCIA_BIBLIOGRAFICA =
  "Cartilha da Estrutura de Governança do PPSI 2.0 — Programa de Privacidade e Segurança da Informação, versão 1.0 (Brasília, jan/2026). Secretaria de Governo Digital, Ministério da Gestão e da Inovação em Serviços Públicos.";

/** Texto normativo — alta administração (exibir junto ao campo correspondente). */
export const TEXTO_NORMATIVO_ALTA_ADMINISTRACAO =
  "A alta administração deve estabelecer, manter, monitorar e aprimorar o sistema de gestão de riscos e controles internos com vistas à identificação, à avaliação, ao tratamento, ao monitoramento e à análise crítica dos riscos que possam impactar a implementação da estratégia e a consecução dos objetivos da organização no cumprimento da sua missão institucional (Decreto nº 9.203/2017, art. 17), sem prejuízo das responsabilidades dos gestores dos processos organizacionais. Nesse contexto, os temas de privacidade e segurança da informação devem estar integrados ao sistema de gestão de riscos e aos controles internos. Ademais, conforme Acórdão 2.387/2024 — Plenário TCU, a alta administração da organização deve liderar o processo de gestão de riscos decorrentes de ataques cibernéticos.";

/** Orientação por campo do formulário de papéis. */
export type CampoResponsavelProgramaId =
  | "representante_alta_administracao"
  | "responsavel_gestao_integridade"
  | "gestor_seguranca_informacao"
  | "encarregado_dados_pessoais"
  | "gestor_tic";

export type OrientacaoCampoResponsavel = {
  id: CampoResponsavelProgramaId;
  /** Rótulo exibido junto às dicas (deve coincidir com o Select). */
  rotulo: string;
  instrucao: string;
  fundamentacao: string[];
  dicasCartilha: string[];
};

export const ORIENTACAO_CAMPOS_RESPONSAVEIS: OrientacaoCampoResponsavel[] = [
  {
    id: "representante_alta_administracao",
    rotulo: "Representante da alta administração",
    instrucao:
      "Indicar a pessoa que representa a alta administração neste programa para fins de governança PPSI (decisões, priorização e integração de riscos), sem substituir atos de nomeação colegiados ou decisórios do órgão.",
    fundamentacao: [
      "Decreto 9.203/2017, art. 17.",
      "Portaria SGD/MGI 9.511/2025, arts. 7º e 8º.",
      "Acórdão TCU 2.387/2024 — Plenário (riscos de ataques cibernéticos).",
    ],
    dicasCartilha: [
      "Estrutura formal de gestão de riscos com participação de TIC, SI e proteção de dados.",
      "Liderança pelo exemplo no cumprimento de políticas e normas de privacidade e SI.",
    ],
  },
  {
    id: "responsavel_gestao_integridade",
    rotulo: "Responsável pela gestão da integridade",
    instrucao:
      "Indicar a pessoa que, no âmbito do órgão, se articula com a governança de integridade, transparência e controle interno, em linha com o SITAI e com o apoio aos diagnósticos e riscos correlatos ao PPSI.",
    fundamentacao: [
      "Decreto 11.529/2023, art. 5º, II — unidades setoriais responsáveis pela gestão da integridade, da transparência e do acesso à informação.",
      "Portaria SGD/MGI 9.511/2025, arts. 7º e 12 — competências do responsável setorial pela gestão da integridade no âmbito do PPSI.",
    ],
    dicasCartilha: [
      "Articulação com encarregado, gestor de SI e gestor de TIC para apoio metodológico aos diagnósticos temáticos.",
      "Facilitar a integração entre riscos de privacidade e SI e a matriz institucional de riscos da organização.",
    ],
  },
  {
    id: "gestor_seguranca_informacao",
    rotulo: "Gestor de segurança da informação",
    instrucao:
      "Indicar o gestor de segurança da informação (titular ou quem o representa no programa), formalmente designado conforme normas de SI da administração federal.",
    fundamentacao: [
      "Instrução Normativa GSI/PR 1/2020, arts. 16 e 19 — atribuições do gestor de segurança da informação.",
      "Portaria SGD/MGI 9.511/2025, arts. 7º e 10 — condução do diagnóstico de SI e planejamento e monitoramento das medidas de SI.",
      "Decreto 12.572/2025, art. 10, III.",
    ],
    dicasCartilha: [
      "Atuar como ponto focal da alta administração para temas de SI, inclusive com apresentação de diagnósticos, riscos e necessidade de recursos.",
      "Promover capacitação e conscientização, inclusive com campanhas e materiais alinhados às normas complementares de SI.",
    ],
  },
  {
    id: "encarregado_dados_pessoais",
    rotulo: "Encarregado (dados pessoais)",
    instrucao:
      "Indicar o encarregado pelo tratamento de dados pessoais (e, quando aplicável, quem o substitui no âmbito deste programa), observando a comunicação à ANPD e requisitos da Lei 13.709/2018.",
    fundamentacao: [
      "Lei 13.709/2018, arts. 23, III e 41 — encarregado e suas atividades.",
      "Resoluções CD/ANPD 15/2024 e 18/2024 — requisitos de designação e atuação.",
      "Instrução Normativa SGD/ME 117/2020.",
      "Portaria SGD/MGI 9.511/2025, arts. 7º e 11 — diagnóstico de privacidade e orientação às medidas de privacidade.",
    ],
    dicasCartilha: [
      "Manter fluxo formal para dúvidas e orientações dos agentes de tratamento, com registro e rastreabilidade.",
      "Implantar canal institucional para direitos dos titulares, com autenticação, registro e acompanhamento das demandas.",
    ],
  },
  {
    id: "gestor_tic",
    rotulo: "Gestor de TIC",
    instrucao:
      "Indicar o gestor de tecnologia da informação e comunicação (titular ou representante no programa), nos termos da designação formal do órgão integrante do SISP.",
    fundamentacao: [
      "Portaria SGD/ME 778/2019, art. 4º, IV — planejamento, desenvolvimento, execução e monitoramento das atividades de TIC e apoio ao comitê de governança digital.",
      "Portaria SGD/MGI 9.511/2025, arts. 7º e 9º — medidas de privacidade e SI em soluções de TIC e cadeia de suprimentos correlata.",
    ],
    dicasCartilha: [
      "Inclusão em comitês de governança digital, SI e privacidade, ou estruturas equivalentes, para subsídio técnico à decisão.",
      "Elaborar e manter plano de ações com metas, prazos e responsáveis para implementação das medidas PPSI nas soluções tecnológicas.",
    ],
  },
];

/** Quadro de referência: comitês e ETIR (texto normativo; composição na mesma tela do programa). */
export type PapelReferenciaCartilha = {
  id: string;
  titulo: string;
  /** Síntese de competências (3ª pessoa, normativo). */
  competencias: string;
  fundamentacaoNormativa: string[];
  /** Trechos da cartilha como orientação à implementação (tom de hint). */
  orientacoesPraticas: string[];
  /** O que este módulo de programa não dispensa no plano institucional. */
  lembreteInstitucional: string;
};

export const PAPEIS_REFERENCIA_CARTILHA: PapelReferenciaCartilha[] = [
  {
    id: "comite-si",
    titulo: "Comitê de segurança da informação (ou estrutura equivalente)",
    competencias:
      "Deliberar sobre a Política Nacional de Segurança da Informação e normas correlatas; no PPSI, apoiar a definição de estratégias e instrumentos fundamentais de governança de SI e avaliar propostas do gestor de SI.",
    fundamentacaoNormativa: [
      "Instrução Normativa GSI/PR 1/2020, art. 20.",
      "Lei 13.709/2018, arts. 6º, VII e VIII, 46 e 50.",
      "Decreto 12.572/2025, art. 10, II.",
    ],
    orientacoesPraticas: [
      "Definir abordagem metodológica, responsabilidades, cronogramas e critérios mínimos de conteúdo para instrumentos de SI; instituir grupos de trabalho quando necessário.",
      "Analisar diagnósticos de SI, avaliar lacunas e recomendações e deliberar sobre prioridades e encaminhamentos à alta administração.",
    ],
    lembreteInstitucional:
      "Atas, composição e deliberações do colegiado são documentação institucional à parte; os relatórios e diagnósticos do programa podem ser anexados como subsídio.",
  },
  {
    id: "comite-dados",
    titulo: "Comitê de proteção de dados pessoais (ou estrutura equivalente)",
    competencias:
      "Deliberar sobre LGPD, resoluções da ANPD e normas complementares; consolidar governança de privacidade e fortalecer o encarregado; estruturar instrumentos fundamentais de governança da privacidade.",
    fundamentacaoNormativa: [
      "Lei 13.709/2018, art. 50.",
      "Resolução CD/ANPD 18/2024, art. 10, V — acesso do encarregado às instâncias decisórias.",
    ],
    orientacoesPraticas: [
      "Submeter periodicamente o diagnóstico de privacidade à deliberação do comitê, definindo prioridades e encaminhamentos.",
      "Instituir grupos de trabalho para elaborar ou revisar políticas, normas e procedimentos conforme lacunas identificadas no PPSI.",
    ],
    lembreteInstitucional:
      "A existência e o funcionamento do comitê obedecem a ato institucional próprio; minutas e políticas elaboradas no programa devem ser submetidas às instâncias competentes para aprovação.",
  },
  {
    id: "etir",
    titulo: "ETIR — equipe de prevenção, tratamento e resposta a incidentes cibernéticos",
    competencias:
      "Deve ser instituída pelos órgãos com competência para administrar a infraestrutura de rede, com documento de constituição aprovado pela alta administração e integração à rede federal coordenada pelo órgão central.",
    fundamentacaoNormativa: [
      "Instrução Normativa GSI/PR 1/2020, art. 15, IV.",
      "Norma Complementar 05/IN01/DSIC/GSIPR.",
      "Lei 13.709/2018; Decretos 9.203/2017, 10.748/2021, 12.572/2025.",
    ],
    orientacoesPraticas: [
      "Elaborar fluxo de gestão de incidentes: notificação, classificação, contenção, erradicação, recuperação, registros e evidências; prever comunicação ao encarregado e à ANPD quando aplicável.",
      "Realizar exercícios simulados (tabletop, técnico ou híbrido) e consolidar relatório de lições aprendidas para os comitês competentes.",
    ],
    lembreteInstitucional:
      "O registro de incidentes na conformidade do programa complementa, mas não substitui, a constituição formal da ETIR e os procedimentos aprovados na instituição.",
  },
];

export function getOrientacaoCampo(id: CampoResponsavelProgramaId): OrientacaoCampoResponsavel | undefined {
  return ORIENTACAO_CAMPOS_RESPONSAVEIS.find((c) => c.id === id);
}
