/**
 * Textos da página Governança avançada — accountability PPSI / LGPD / ISO 27001.
 * Distinto da Estrutura de Governança (`/responsabilidades`) e da trilha (`/auditoria`).
 */

export const GOVERNANCA_AVANCADA_INTRO = {
  titulo: "Governança avançada",
  lead:
    "Registro institucional de decisões, linha do tempo de eventos de GRC e acesso temporário somente leitura para auditoria. Não substitui a estrutura de papéis e comitês nem o log de atividades dos usuários.",
  normas: [
    "PPSI 2.0 — decisão formal da alta administração (critério de maturidade INCC)",
    "LGPD — accountability e demonstração de conformidade (arts. 37, 41 e 50)",
    "ISO/IEC 27001:2022 — cl. 5 (liderança), 9.2 (auditoria interna) e 9.3 (análise crítica pela direção)",
  ],
  naoConfundir: [
    {
      nome: "Estrutura de Governança",
      rota: "responsabilidades",
      texto: "Papéis, comitês e nomeações (PPSI / art. 41 LGPD).",
    },
    {
      nome: "Histórico de atividades",
      rota: "auditoria",
      texto: "Trilha de quem alterou o quê no sistema (Controle 8 / art. 37).",
    },
  ],
} as const;

export const ABA_DECISOES = {
  titulo: "Decisões",
  oQueE:
    "Decision log (ata de decisão): contexto, problema, alternativas consideradas, decisão tomada, justificativa e responsáveis. Serve de evidência de que a direção decidiu — o PPSI chama isso de “decisão formal”; a ISO 27001 usa o mesmo insumo na análise crítica pela direção (9.3).",
  normas: "PPSI (decisão formal) · ISO 27001 cl. 5 e 9.3 · LGPD accountability",
} as const;

export const ABA_TIMELINE = {
  titulo: "Timeline",
  oQueE:
    "Linha do tempo unificada: decisões aprovadas, mudanças de workflow (planos e políticas) e ciência em documentos. Demonstra continuidade da governança — quem aprovou, quando e o que mudou.",
  normas: "ISO 27001 7.5 (informação documentada) · PPSI rastreabilidade · LGPD art. 37",
} as const;

export const ABA_AUDITOR = {
  titulo: "Acesso temporário de auditor",
  oQueE:
    "Link somente leitura, com prazo (1–90 dias) e revogação. Destina-se a auditoria interna ou externa (ISO 27001 9.2) e a due diligence de terceiros. Não é o papel “auditor” logado no programa: o visitante não autentica e não altera dados. Pedidos de titulares (PII) não entram no portal — só contagens.",
  normas: "ISO 27001 9.2 · PPSI evidências de controle · LGPD minimização (art. 6º III)",
} as const;

export const PORTAL_AUDITOR_INTRO = {
  titulo: "Portal do auditor",
  lead:
    "Visão somente leitura do programa de privacidade e segurança da informação, para auditoria interna, certificação ou due diligence. Os números e listas abaixo correspondem a evidências e registros que PPSI, LGPD e ISO 27001 pedem para demonstrar o SGSI/programa — não constituem certificado ISO nem selo da ANPD.",
  secoesNorma: [
    { secao: "Identificação e DPO", norma: "LGPD art. 41 · Res. CD/ANPD nº 18/2024" },
    { secao: "Maturidade", norma: "PPSI 2.0 (iMC / iPriv)" },
    { secao: "Evidências", norma: "ISO 27001 9.2 · PPSI anexos de medida" },
    { secao: "Políticas publicadas", norma: "PPSI medidas 0.9–0.12" },
    { secao: "ROPA e mapeamento", norma: "LGPD art. 37" },
    { secao: "RIPD", norma: "LGPD art. 38" },
    { secao: "Riscos e incidentes", norma: "ISO 27001 9.3 · ANPD incidentes" },
    { secao: "Decisões e timeline", norma: "Accountability · ISO 27001 9.3" },
    { secao: "Planos de ação", norma: "PPSI plano de trabalho" },
    { secao: "Ciência em documentos", norma: "Demonstração de conformidade" },
  ],
} as const;
