#!/usr/bin/env node
/**
 * Framework FPSI v2 — catálogo enxuto para empresa privada (≠ PPSI 27×210).
 * Gera content-packs/framework/catalogo.json e migration SQL.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT_CATALOGO = path.join(ROOT, "content-packs/framework/catalogo.json");
const OUT_SQL = path.join(
  ROOT,
  "supabase/migrations/20261122180000_framework_catalog_v2_lean.sql"
);

const MEDIDAS_POR_CONTROLE = 6;
const MEDIDA_ID_OFFSET = 10000;

const SEGMENTO_BY_DIAG = { 1: "estrutura", 2: "seguranca_informacao", 3: "privacidade" };

/** 17 controles — fusões v1 (1001–1027) documentadas nos merges. */
const LEAN_CONTROLS = [
  {
    ordem: 1,
    numero: 0,
    diagnostico_id: 1,
    titulo: "Governança, comitês (CSI, CPDP, ETIR) e instrumentos",
    merges: "PPSI/FW 1001+1002",
    visao_geral:
      "Estrutura decisória e programas formais de privacidade e SI na empresa — sem duplicar camadas do Guia público.",
    topics: [
      "diretoria aprova política integrada de SI e privacidade",
      "papéis CSI, CPDP e ETIR definidos em RACI",
      "programa de privacidade e programa de SI revisados anualmente",
      "gestão de riscos corporativa inclui riscos de SI e LGPD",
      "indicadores de maturidade reportados à alta gestão",
      "calendário de comitês e atas disponíveis como evidência",
    ],
  },
  {
    ordem: 2,
    numero: 1,
    diagnostico_id: 2,
    titulo: "Inventário e classificação (ativos, aplicações e dados)",
    merges: "1003+1004",
    visao_geral: "Visão atualizada do que a organização possui e quais dados são críticos.",
    topics: [
      "inventário de ativos críticos (nuvem, endpoint, OT se houver)",
      "catálogo de aplicações com responsável de negócio",
      "classificação de dados (público, interno, confidencial, sensível)",
      "dados pessoais mapeados por processo principal",
      "revisão trimestral ou por mudança relevante",
      "descarte de ativos e mídia documentado",
    ],
  },
  {
    ordem: 3,
    numero: 2,
    diagnostico_id: 2,
    titulo: "Proteção de dados em repouso e em trânsito",
    merges: "1005",
    visao_geral: "Controles proporcionais ao risco, não checklist federal.",
    topics: [
      "criptografia em repouso para dados sensíveis",
      "TLS/HTTPS em serviços expostos",
      "gestão de chaves e segredos",
      "mascaramento ou tokenização onde aplicável",
      "DLP ou controles de exfiltração proporcionais",
      "política de retenção e descarte seguro",
    ],
  },
  {
    ordem: 4,
    numero: 3,
    diagnostico_id: 2,
    titulo: "Configuração segura e hardening",
    merges: "1006",
    visao_geral: "Baselines de mercado (CIS/NIST) adaptadas à realidade da empresa.",
    topics: [
      "baseline documentada para servidores e endpoints",
      "MDM ou política equivalente para dispositivos móveis",
      "remoção de software não autorizado",
      "hardening de serviços de nuvem",
      "monitoramento de desvio de configuração",
      "processo de exceção aprovado e temporal",
    ],
  },
  {
    ordem: 5,
    numero: 4,
    diagnostico_id: 2,
    titulo: "Identidade, acesso e privilégios",
    merges: "1007+1008",
    visao_geral: "IAM corporativo: JML, MFA e segregação.",
    topics: [
      "joiner-mover-leaver integrado ao RH/IT",
      "MFA para acesso remoto e privilégios",
      "revisão periódica de acessos e perfis admin",
      "contas de serviço inventariadas",
      "princípio do menor privilégio documentado",
      "SSO ou federação para aplicações críticas quando viável",
    ],
  },
  {
    ordem: 6,
    numero: 5,
    diagnostico_id: 2,
    titulo: "Vulnerabilidades e patches",
    merges: "1009",
    visao_geral: "Correção priorizada por criticidade de ativo e exposição.",
    topics: [
      "processo de patch com SLA por criticidade",
      "varredura de vulnerabilidades recorrente",
      "inventário de CVEs abertas com dono",
      "testes antes de patch em produção quando necessário",
      "exposição externa reavaliada após correções",
      "métrica de tempo médio de correção",
    ],
  },
  {
    ordem: 7,
    numero: 6,
    diagnostico_id: 2,
    titulo: "Observabilidade, rede e detecção",
    merges: "1010+1014+1015",
    visao_geral: "Logs, segmentação e detecção proporcionais ao porte.",
    topics: [
      "logs centralizados de sistemas críticos",
      "retenção de log alinhada a incidentes e auditoria",
      "segmentação ou isolamento de ambientes sensíveis",
      "IDS/EDR ou monitoramento de endpoint",
      "alertas com responsável de plantão ou fornecedor",
      "correlação mínima para detectar anomalias relevantes",
    ],
  },
  {
    ordem: 8,
    numero: 7,
    diagnostico_id: 2,
    titulo: "Proteção de endpoint e comunicação",
    merges: "1011+1012",
    visao_geral: "E-mail, navegadores e malware — foco em colaboradores.",
    topics: [
      "antimalware/EDR em estações e servidores",
      "filtro de e-mail e anti-phishing",
      "política de anexos e links",
      "atualização de navegadores e plugins",
      "ferramentas de colaboração aprovadas",
      "simulação ou awareness de phishing periódica",
    ],
  },
  {
    ordem: 9,
    numero: 8,
    diagnostico_id: 2,
    titulo: "Backup e continuidade",
    merges: "1013",
    visao_geral: "Restauração testada, não só cópia.",
    topics: [
      "backup de dados e configs críticos",
      "backup imutável ou isolado quando aplicável",
      "teste de restauração documentado",
      "RTO/RPO definidos para processos críticos",
      "plano de continuidade ou DR proporcional",
      "responsáveis e runbooks acessíveis",
    ],
  },
  {
    ordem: 10,
    numero: 9,
    diagnostico_id: 2,
    titulo: "Conscientização e cultura",
    merges: "1016",
    visao_geral: "Programa de awareness contínuo, não evento único.",
    topics: [
      "programa anual de treinamento em SI e privacidade",
      "onboarding de novos colaboradores",
      "comunicação de políticas atualizada",
      "canal para reportar suspeitas",
      "métrica de adesão ao treinamento",
      "reforço após incidentes relevantes",
    ],
  },
  {
    ordem: 11,
    numero: 10,
    diagnostico_id: 2,
    titulo: "Fornecedores, nuvem e terceiros",
    merges: "1017",
    visao_geral: "Due diligence e cláusulas em contratos de processamento.",
    topics: [
      "cadastro de fornecedores críticos de TI e dados",
      "avaliação de risco antes da contratação",
      "cláusulas de segurança e privacidade em contratos",
      "revisão periódica de certificações (SOC2, ISO)",
      "acesso de terceiros controlado e temporário",
      "offboarding de fornecedor com revogação de acesso",
    ],
  },
  {
    ordem: 12,
    numero: 11,
    diagnostico_id: 2,
    titulo: "Desenvolvimento seguro e aplicações",
    merges: "1018",
    visao_geral: "Aplicável quando a organização desenvolve ou customiza software.",
    topics: [
      "SDLC com requisitos de segurança",
      "revisão de código ou SAST em projetos relevantes",
      "gestão de dependências e bibliotecas",
      "separação de ambientes dev/test/prod",
      "secrets fora do repositório",
      "teste de segurança antes de releases críticos",
    ],
  },
  {
    ordem: 13,
    numero: 12,
    diagnostico_id: 2,
    titulo: "Incidentes e validação de controles",
    merges: "1019+1020",
    visao_geral: "Resposta integrada a incidentes de SI e privacidade.",
    topics: [
      "plano de resposta a incidentes aprovado",
      "equipe ou função de resposta definida",
      "comunicação à ANPD quando aplicável (LGPD)",
      "pós-incidente e lições aprendidas",
      "exercício tabletop ou simulação periódica",
      "validação de controles (teste ou revisão) ao menos anual",
    ],
  },
  {
    ordem: 14,
    numero: 13,
    diagnostico_id: 3,
    titulo: "ROPA e prevenção (privacy by design)",
    merges: "1021+1022",
    visao_geral: "Registro de tratamentos e minimização desde o desenho.",
    topics: [
      "ROPA atualizado com bases legais e finalidades",
      "revisão quando novo tratamento ou produto",
      "privacy by design em projetos com dados pessoais",
      "minimização de coleta e retenção",
      "registro de decisões do CPDP sobre novos tratamentos",
      "integração ROPA com inventário de sistemas",
    ],
  },
  {
    ordem: 15,
    numero: 14,
    diagnostico_id: 3,
    titulo: "DPO, titulares e canal de privacidade",
    merges: "1023",
    visao_geral: "Atendimento a titulares e encarregado com autonomia.",
    topics: [
      "DPO ou encarregado formalmente designado",
      "canal de privacidade acessível",
      "SLA para atendimento a direitos dos titulares",
      "procedimento de resposta a solicitações",
      "registro de solicitações e desfechos",
      "divulgação externa do encarregado quando exigida",
    ],
  },
  {
    ordem: 16,
    numero: 15,
    diagnostico_id: 3,
    titulo: "Contratos, DPA e transferências internacionais",
    merges: "1024+1026",
    visao_geral: "Operadores, subprocessadores e fluxos transfronteiriços.",
    topics: [
      "DPA padrão com operadores de tratamento",
      "cláusulas LGPD em contratos relevantes",
      "avaliação de transferência internacional",
      "mecanismo legal documentado (cláusulas, BECs, etc.)",
      "suboperadores aprovados ou notificados",
      "revisão contratual periódica",
    ],
  },
  {
    ordem: 17,
    numero: 16,
    diagnostico_id: 3,
    titulo: "RIPD, accountability e princípios LGPD",
    merges: "1025+1027",
    visao_geral: "Impacto, demonstração de conformidade e princípios.",
    topics: [
      "critérios para elaborar RIPD",
      "RIPD aprovado quando exigido",
      "registro de compatibilidade com princípios da LGPD",
      "accountability e evidências por tratamento",
      "revisão após mudança material de risco",
      "relatório de privacidade à diretoria quando cabível",
    ],
  },
];

function sqlEscape(s) {
  if (s == null) return "";
  return String(s).replace(/'/g, "''");
}

function buildCatalog() {
  const controlesJson = LEAN_CONTROLS.map((c) => {
    const id = 1000 + c.ordem;
    return {
      ordem_no_guia: c.ordem,
      controle_numero: c.numero,
      diagnostico_id: c.diagnostico_id,
      titulo: c.titulo,
      segmento: SEGMENTO_BY_DIAG[c.diagnostico_id],
      merges_from_v1: c.merges,
      visao_geral: c.visao_geral,
      por_que_controle_critico:
        "Controle essencial do Framework enxuto FPSI — proporcional ao risco, distinto do catálogo integral PPSI 2.0.",
      procedimentos_e_ferramentas:
        "Evidências no FPSI, atas de CSI/CPDP/ETIR, políticas e indicadores. PPSI completo permanece opção separada no wizard.",
    };
  });

  const medidasJson = [];
  let medidaSeq = 0;
  for (const c of LEAN_CONTROLS) {
    const idControle = 1000 + c.ordem;
    const prefix = `F${c.ordem}`;
    c.topics.forEach((topic, i) => {
      medidaSeq++;
      const idMedida = `${prefix}.${i + 1}`;
      medidasJson.push({
        id_medida: idMedida,
        controle_numero: c.numero,
        id_controle: idControle,
        pergunta: `A organização demonstra evidência atualizada de: ${topic}?`,
        descricao: `${c.titulo}: ${topic}. Documentar responsável, periodicidade e artefato na Ferramenta FPSI. Não substitui parecer jurídico.`,
        normas_referencia: "LGPD; ISO/IEC 27001/27701 (indicativo); boas práticas de mercado.",
        grupo_imple: null,
        id_cisv8: null,
        funcao_nist_csf: null,
      });
    });
  }

  return {
    meta: {
      id: "framework",
      versao: "2.0.0",
      schema: "framework-v2-lean",
      nota: "Catálogo enxuto FPSI — 17 controles, 102 medidas. Distinto do PPSI 2.0 (27×210); opt-in PPSI no wizard.",
      controles: LEAN_CONTROLS.length,
      medidas: medidasJson.length,
    },
    controles: controlesJson,
    medidas: medidasJson,
  };
}

/** Mapa controle v1 → v2 (1001–1017). */
const CTRL_V1_TO_V2 = {
  1001: 1001, 1002: 1001, 1003: 1002, 1004: 1002, 1005: 1003, 1006: 1004,
  1007: 1005, 1008: 1005, 1009: 1006, 1010: 1007, 1011: 1008, 1012: 1008,
  1013: 1009, 1014: 1007, 1015: 1007, 1016: 1010, 1017: 1011, 1018: 1012,
  1019: 1013, 1020: 1013, 1021: 1014, 1022: 1014, 1023: 1015, 1024: 1016,
  1025: 1017, 1026: 1016, 1027: 1017,
};

function buildSql(catalogo) {
  const lines = [];
  lines.push("-- Framework FPSI v2 lean — substitui catálogo framework 27×210 no remoto");
  lines.push("-- Controles ativos: 1001–1017. Remove 1018–1027 e medidas 10001–10210 legadas.");
  lines.push("");

  lines.push(`DELETE FROM public.programa_controle pc
WHERE pc.controle IN (
  SELECT id FROM public.controle WHERE pack_id = 'framework' AND id BETWEEN 1018 AND 1027
);`);

  lines.push(
    "-- programa_medida: migrar antes com scripts/repair-framework-v2-linkages.mjs"
  );
  lines.push(`DELETE FROM public.medida WHERE pack_id = 'framework' AND id BETWEEN 10103 AND 10210;`);
  lines.push(`DELETE FROM public.controle WHERE pack_id = 'framework' AND id BETWEEN 1018 AND 1027;`);
  lines.push("");

  for (const c of catalogo.controles) {
    const id = 1000 + c.ordem_no_guia;
    const def = LEAN_CONTROLS[c.ordem_no_guia - 1];
    lines.push(
      `INSERT INTO public.controle (id, numero, diagnostico, nome, pack_id, codigo_origem) VALUES (${id}, ${def.numero}, ${def.diagnostico_id}, '${sqlEscape(c.titulo)}', 'framework', 'FV2-C${def.numero}-D${def.diagnostico_id}-${c.ordem_no_guia}') ON CONFLICT (id) DO UPDATE SET numero = EXCLUDED.numero, diagnostico = EXCLUDED.diagnostico, nome = EXCLUDED.nome, pack_id = EXCLUDED.pack_id, codigo_origem = EXCLUDED.codigo_origem;`
    );
  }
  lines.push("");

  catalogo.medidas.forEach((m, idx) => {
    const id = MEDIDA_ID_OFFSET + idx + 1;
    lines.push(
      `INSERT INTO public.medida (id, id_medida, id_controle, id_cisv8, grupo_imple, funcao_nist_csf, medida, descricao, pack_id, codigo_origem) VALUES (${id}, '${sqlEscape(m.id_medida)}', ${m.id_controle}, NULL, NULL, NULL, '${sqlEscape(m.pergunta)}', '${sqlEscape(m.descricao)}', 'framework', '${sqlEscape(m.id_medida)}') ON CONFLICT (id) DO UPDATE SET id_medida = EXCLUDED.id_medida, id_controle = EXCLUDED.id_controle, medida = EXCLUDED.medida, descricao = EXCLUDED.descricao, pack_id = EXCLUDED.pack_id, codigo_origem = EXCLUDED.codigo_origem;`
    );
  });

  lines.push("");
  lines.push(`UPDATE public.content_pack SET versao = '2.0.0', descricao = 'Catálogo enxuto FPSI (17 controles, 102 medidas)' WHERE id = 'framework';`);

  return lines.join("\n");
}

function main() {
  const catalogo = buildCatalog();
  fs.writeFileSync(OUT_CATALOGO, JSON.stringify(catalogo, null, 2) + "\n");
  fs.writeFileSync(OUT_SQL, buildSql(catalogo) + "\n");
  console.log("Wrote", OUT_CATALOGO, `(${catalogo.meta.controles} ctrl, ${catalogo.meta.medidas} med)`);
  console.log("Wrote", OUT_SQL);
}

main();