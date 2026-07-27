#!/usr/bin/env node
/**
 * Gera migration Fase C: PGSI/PGP, docs do portal, stubs ricos,
 * status/publicação e politica_programa_versao.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(
  "supabase/migrations/20260719140000_politicas_fase_c_pgsi_pgp_portal_versao.sql"
);

function sec(id, secao, titulo, descricao, texto) {
  return { id, secao, titulo, descricao: descricao || "", texto: texto || "" };
}

function modeloPadrao(nomeCurto, secoesExtras = []) {
  return [
    sec(0, nomeCurto, "Introdução", "Modelo de referência — adeque ao órgão ou entidade.", ""),
    sec(
      1,
      "Propósito",
      "Objetivo",
      "Objetivos do documento.",
      `<p>Este documento estabelece diretrizes, princípios e procedimentos do <span style="background-color: yellow;">[Órgão ou entidade]</span> relativos a ${nomeCurto.toLowerCase()}.</p><p style="color: #dc0000;">[Acrescente objetivos específicos.]</p>`
    ),
    sec(
      2,
      "Escopo",
      "Amplitude",
      "A quem se aplica.",
      `<p>Aplica-se a colaboradores, prestadores e terceiros do <span style="background-color: yellow;">[Órgão ou entidade]</span> no âmbito das atividades descritas.</p>`
    ),
    sec(
      3,
      "Termos e definições",
      "Glossário",
      "Termos-chave.",
      `<p>Utilize as definições da LGPD, do glossário de SI do GSI/PR e termos técnicos do ambiente.</p><p style="color: #dc0000;">[Inclua glossário local.]</p>`
    ),
    ...secoesExtras,
    sec(
      90,
      "Responsabilidades",
      "Papéis",
      "Quem faz o quê.",
      `<p>Art. Compete à área responsável implementar, monitorar e revisar este documento. Gestores e usuários devem observar as diretrizes e reportar desvios.</p>`
    ),
    sec(
      91,
      "Disposições finais",
      "Vigência e revisão",
      "Revisão e entrada em vigor.",
      `<p>Este documento será revisado no prazo de <span style="background-color: yellow;">[prazo]</span> e entra em vigor na data de sua publicação.</p>`
    ),
  ];
}

const MODELOS = [
  {
    id: "politica_pgsi",
    nome: "Programa de Governança em Segurança da Informação (PGSI)",
    descricao: "Programa institucional de governança em SI (PPSI 2.0, medida 0.9 / IN GSI/PR nº 3/2021)",
    cor: "#1565C0",
    ordem: 10,
    secoes: [
      sec(0, "PGSI", "Introdução", "Documento-programa de governança em SI.", ""),
      sec(
        1,
        "Fundamentação",
        "Base normativa",
        "Referências.",
        `<p>O PGSI do <span style="background-color: yellow;">[Órgão ou entidade]</span> observa a IN GSI/PR nº 3/2021 e o PPSI, instituindo ações estruturadas, políticas, normas e procedimentos de segurança da informação.</p>`
      ),
      sec(
        2,
        "Objetivos",
        "Objetivos do programa",
        "",
        `<p>I. promover a segurança da informação de forma contínua;<br/>II. alinhar controles e medidas do PPSI à realidade institucional;<br/>III. definir papéis, prazos e indicadores (ex.: iSeg);<br/>IV. revisar o programa com base em monitoramento e avaliações periódicas.</p>`
      ),
      sec(
        3,
        "Governança",
        "Estrutura de governança",
        "",
        `<p>Preferencialmente em instância colegiada. Descreva comitês, gestor de SI, alta administração e fluxos de decisão.</p><p style="color: #dc0000;">[Mapeie a estrutura real do órgão.]</p>`
      ),
      sec(
        4,
        "Políticas e controles",
        "Instrumentos",
        "",
        `<p>O PGSI articula a POSIN e demais políticas de SI (backup, acesso, vulnerabilidades, malware, logs, ativos, provedores etc.), além do plano de implementação dos controles do PPSI.</p>`
      ),
      sec(
        5,
        "Indicadores e revisão",
        "Desempenho",
        "",
        `<p>Defina indicadores (ex.: iSeg), periodicidade de medição e ciclo de revisão do PGSI.</p>`
      ),
      sec(
        6,
        "Disposições finais",
        "Vigência",
        "",
        `<p>Este PGSI entra em vigor na data de sua publicação e será revisado periodicamente.</p>`
      ),
    ],
  },
  {
    id: "politica_pgp",
    nome: "Programa de Governança em Privacidade (PGP)",
    descricao: "Programa institucional de governança em privacidade (PPSI 2.0, medida 0.10 / LGPD art. 50)",
    cor: "#6A1B9A",
    ordem: 11,
    secoes: [
      sec(0, "PGP", "Introdução", "Documento-programa de governança em privacidade.", ""),
      sec(
        1,
        "Fundamentação",
        "Base normativa",
        "",
        `<p>O PGP do <span style="background-color: yellow;">[Órgão ou entidade]</span> observa o art. 50, §2º, I, da Lei nº 13.709/2018 (LGPD) e o PPSI, na forma de ações estruturadas, políticas, normas e procedimentos para o tratamento de dados pessoais.</p>`
      ),
      sec(
        2,
        "Objetivos",
        "Objetivos do programa",
        "",
        `<p>I. assegurar conformidade e accountability no tratamento de dados;<br/>II. implementar controles e medidas de privacidade do PPSI;<br/>III. definir papéis, prazos e indicadores (ex.: iPriv);<br/>IV. revisar o programa com base em monitoramento contínuo.</p>`
      ),
      sec(
        3,
        "Governança",
        "Estrutura",
        "",
        `<p>Preferencialmente em instância colegiada. Descreva encarregado (DPO), comitê de proteção de dados, controlador e fluxos de decisão.</p>`
      ),
      sec(
        4,
        "Instrumentos",
        "Políticas e registros",
        "",
        `<p>O PGP articula a Política de Proteção de Dados Pessoais, ROPA, RIPD, atendimento a titulares, gestão de incidentes e demais documentos de privacidade.</p>`
      ),
      sec(
        5,
        "Indicadores e revisão",
        "Desempenho",
        "",
        `<p>Defina indicadores (ex.: iPriv), periodicidade e ciclo de revisão do PGP.</p>`
      ),
      sec(
        6,
        "Disposições finais",
        "Vigência",
        "",
        `<p>Este PGP entra em vigor na data de sua publicação e será revisado periodicamente.</p>`
      ),
    ],
  },
  {
    id: "documento_portal_politica_privacidade",
    nome: "Política de Privacidade (portal)",
    descricao: "Texto público do portal do titular — política de privacidade",
    cor: "#0277BD",
    ordem: 20,
    secoes: modeloPadrao("Política de Privacidade do portal", [
      sec(
        4,
        "Tratamentos",
        "Dados e finalidades",
        "",
        `<p>Descreva categorias de dados, finalidades, bases legais e prazos de retenção aplicáveis aos serviços do portal.</p>`
      ),
      sec(
        5,
        "Direitos do titular",
        "Canais",
        "",
        `<p>Os titulares podem exercer direitos pelo portal e pelos canais oficiais do <span style="background-color: yellow;">[Órgão ou entidade]</span>.</p>`
      ),
    ]),
  },
  {
    id: "documento_portal_aviso_titular",
    nome: "Aviso do Portal do Titular",
    descricao: "Aviso informativo exibido no portal do titular",
    cor: "#00838F",
    ordem: 21,
    secoes: modeloPadrao("Aviso do Portal do Titular", [
      sec(
        4,
        "Conteúdo do aviso",
        "Informações ao titular",
        "",
        `<p>Informe finalidade do portal, prazos de resposta, necessidade de identificação e limites do atendimento.</p>`
      ),
    ]),
  },
  {
    id: "documento_portal_cookies",
    nome: "Política de Cookies (portal)",
    descricao: "Política pública de cookies do portal",
    cor: "#EF6C00",
    ordem: 22,
    secoes: modeloPadrao("Política de Cookies", [
      sec(
        4,
        "Tipos de cookies",
        "Categorias",
        "",
        `<p>Descreva cookies essenciais, analíticos e de preferência, bases legais e como o titular pode gerenciar preferências.</p>`
      ),
    ]),
  },
  {
    id: "documento_portal_declaracao_seguranca",
    nome: "Declaração de Segurança (portal)",
    descricao: "Declaração pública de práticas de segurança",
    cor: "#2E7D32",
    ordem: 23,
    secoes: modeloPadrao("Declaração de Segurança", [
      sec(
        4,
        "Medidas",
        "Controles adotados",
        "",
        `<p>Descreva, em linguagem acessível, medidas técnicas e organizacionais de segurança adotadas pelo <span style="background-color: yellow;">[Órgão ou entidade]</span>.</p>`
      ),
    ]),
  },
];

const STUBS_ENRIQUECIDOS = [
  {
    id: "politica_defesas_malware",
    nome: "Política de Defesas contra Malware",
    descricao: "Proteção contra softwares maliciosos",
    cor: "#F44336",
    ordem: 3,
    secoes: modeloPadrao("Política de Defesas contra Malware", [
      sec(
        4,
        "Controles",
        "Prevenção e resposta",
        "",
        `<p>Art. Devem ser adotadas soluções antimalware atualizadas, restrição de execução de arquivos suspeitos, filtragem de e-mail/web e procedimentos de contenção e erradicação de incidentes.</p>`
      ),
      sec(
        5,
        "Uso de dispositivos",
        "Mídias e remotas",
        "",
        `<p>Art. É vedado o uso de mídias não autorizadas. Dispositivos remotos devem cumprir requisitos mínimos de proteção.</p>`
      ),
    ]),
  },
  {
    id: "politica_desenvolvimento_pessoas",
    nome: "Política de Desenvolvimento de Pessoas",
    descricao: "Treinamento e conscientização em segurança",
    cor: "#9C27B0",
    ordem: 4,
    secoes: modeloPadrao("Política de Desenvolvimento de Pessoas", [
      sec(
        4,
        "Capacitação",
        "Programa de treinamento",
        "",
        `<p>Art. Todos os colaboradores com acesso a sistemas ou dados devem participar de capacitação periódica em SI e privacidade, adequada às suas funções.</p>`
      ),
      sec(
        5,
        "Conscientização",
        "Campanhas",
        "",
        `<p>Art. Devem ser realizadas campanhas de conscientização (phishing, senhas, tratamento de dados) com registro de participação.</p>`
      ),
    ]),
  },
  {
    id: "politica_gerenciamento_vulnerabilidades",
    nome: "Política de Gerenciamento de Vulnerabilidades",
    descricao: "Identificação e correção de vulnerabilidades",
    cor: "#E91E63",
    ordem: 5,
    secoes: modeloPadrao("Política de Gerenciamento de Vulnerabilidades", [
      sec(
        4,
        "Ciclo de vida",
        "Identificar, priorizar, corrigir",
        "",
        `<p>Art. Vulnerabilidades devem ser identificadas (scans, CVE, testes), classificadas por risco e corrigidas em prazos definidos conforme criticidade.</p>`
      ),
      sec(
        5,
        "Patching",
        "Atualizações",
        "",
        `<p>Art. Patches de segurança críticos devem ser aplicados em prazo máximo definido pela área de TI/SI, com registro de exceções.</p>`
      ),
    ]),
  },
  {
    id: "politica_gestao_ativos",
    nome: "Política de Gestão de Ativos",
    descricao: "Inventário e gestão de ativos de TI",
    cor: "#607D8B",
    ordem: 6,
    secoes: modeloPadrao("Política de Gestão de Ativos", [
      sec(
        4,
        "Inventário",
        "Cadastro de ativos",
        "",
        `<p>Art. Todos os ativos de informação relevantes devem constar de inventário atualizado, com responsável, classificação e localização.</p>`
      ),
      sec(
        5,
        "Ciclo de vida",
        "Aquisição ao descarte",
        "",
        `<p>Art. Aquisição, uso, transferência e descarte seguro de ativos devem seguir procedimentos aprovados, incluindo sanitização de mídias.</p>`
      ),
    ]),
  },
  {
    id: "politica_logs_auditoria",
    nome: "Política de Logs e Auditoria",
    descricao: "Registros de eventos e trilhas de auditoria",
    cor: "#795548",
    ordem: 7,
    secoes: modeloPadrao("Política de Logs e Auditoria", [
      sec(
        4,
        "Registro",
        "O que registrar",
        "",
        `<p>Art. Sistemas críticos devem gerar logs de autenticação, acesso a dados sensíveis, alterações privilegiadas e eventos de segurança, com proteção contra alteração indevida.</p>`
      ),
      sec(
        5,
        "Retenção e análise",
        "Prazo e uso",
        "",
        `<p>Art. Logs devem ser retidos pelo prazo mínimo de <span style="background-color: yellow;">[prazo]</span> e analisados periodicamente ou sob incidente.</p>`
      ),
    ]),
  },
  {
    id: "politica_provedor_servicos",
    nome: "Política de Provedor de Serviços",
    descricao: "Gestão de fornecedores e prestadores de serviços",
    cor: "#00BCD4",
    ordem: 8,
    secoes: modeloPadrao("Política de Provedor de Serviços", [
      sec(
        4,
        "Contratação",
        "Requisitos",
        "",
        `<p>Art. Contratos com provedores que tratem dados ou acessem sistemas devem incluir cláusulas de SI, privacidade, confidencialidade e retorno/eliminação de dados.</p>`
      ),
      sec(
        5,
        "Monitoramento",
        "Acompanhamento",
        "",
        `<p>Art. O desempenho e a conformidade dos provedores devem ser monitorados, com direito a auditoria quando cabível.</p>`
      ),
    ]),
  },
  {
    id: "politica_seguranca_informacao",
    nome: "Política de Segurança da Informação",
    descricao: "Diretrizes gerais de segurança da informação (POSIN)",
    cor: "#3F51B5",
    ordem: 9,
    secoes: modeloPadrao("Política de Segurança da Informação (POSIN)", [
      sec(
        4,
        "Princípios",
        "Confidencialidade, integridade e disponibilidade",
        "",
        `<p>Art. A POSIN estabelece princípios, objetivos e responsabilidades para preservar a confidencialidade, integridade e disponibilidade das informações do <span style="background-color: yellow;">[Órgão ou entidade]</span>.</p>`
      ),
      sec(
        5,
        "Controles",
        "Diretrizes gerais",
        "",
        `<p>Art. Devem ser observadas políticas específicas de acesso, backup, vulnerabilidades, malware, logs, ativos e provedores, além de gestão de incidentes e continuidade.</p>`
      ),
    ]),
  },
];

function sqlEscape(s) {
  return s.replace(/'/g, "''");
}

function upsertModelo(m) {
  const secoes = JSON.stringify(m.secoes);
  return `
INSERT INTO public.politica_modelo (id, nome, descricao, cor, ordem, secoes, ativo) VALUES (
  '${m.id}',
  '${sqlEscape(m.nome)}',
  '${sqlEscape(m.descricao)}',
  '${m.cor}',
  ${m.ordem},
  '${sqlEscape(secoes)}'::jsonb,
  true
)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  cor = EXCLUDED.cor,
  ordem = EXCLUDED.ordem,
  secoes = EXCLUDED.secoes,
  ativo = true,
  updated_at = NOW();
`;
}

const parts = [];
parts.push(`-- ============================================
-- Fase C: PGSI/PGP, docs do portal, modelos ricos,
-- publicação/versionamento de politica_programa
-- ============================================

-- Status de publicação
ALTER TABLE public.politica_programa
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'rascunho',
  ADD COLUMN IF NOT EXISTS publicado_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS publicado_por TEXT;

DO $$ BEGIN
  ALTER TABLE public.politica_programa
    ADD CONSTRAINT politica_programa_status_check
    CHECK (status IN ('rascunho', 'publicado'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON COLUMN public.politica_programa.status IS 'rascunho | publicado — publicação gera versão imutável';
COMMENT ON COLUMN public.politica_programa.publicado_em IS 'Última publicação formal desta política no programa';
COMMENT ON COLUMN public.politica_programa.publicado_por IS 'auth.users.id de quem publicou';

-- Versionamento (espelha registro_ropa_versao)
CREATE TABLE IF NOT EXISTS public.politica_programa_versao (
    id BIGSERIAL PRIMARY KEY,
    programa_id INTEGER NOT NULL REFERENCES public.programa(id) ON DELETE CASCADE,
    tipo_politica TEXT NOT NULL REFERENCES public.politica_modelo(id) ON DELETE CASCADE,
    numero INTEGER NOT NULL,
    nota TEXT,
    secoes_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    inicio_vigencia DATE,
    prazo_revisao DATE,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT politica_programa_versao_unique UNIQUE (programa_id, tipo_politica, numero)
);

CREATE INDEX IF NOT EXISTS idx_politica_programa_versao_prog
  ON public.politica_programa_versao(programa_id, tipo_politica, numero DESC);

COMMENT ON TABLE public.politica_programa_versao IS 'Snapshot imutável de política por programa (versionamento/publicação)';

ALTER TABLE public.politica_programa_versao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS politica_programa_versao_select_member ON public.politica_programa_versao;
CREATE POLICY politica_programa_versao_select_member
  ON public.politica_programa_versao FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.programa_users pu
      WHERE pu.programa_id = politica_programa_versao.programa_id
        AND pu.user_id = auth.uid()::text
        AND pu.status = 'accepted'
    )
  );

DROP POLICY IF EXISTS politica_programa_versao_insert_member ON public.politica_programa_versao;
CREATE POLICY politica_programa_versao_insert_member
  ON public.politica_programa_versao FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.programa_users pu
      WHERE pu.programa_id = politica_programa_versao.programa_id
        AND pu.user_id = auth.uid()::text
        AND pu.status = 'accepted'
    )
  );

GRANT SELECT, INSERT ON public.politica_programa_versao TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.politica_programa_versao_id_seq TO authenticated;
GRANT ALL ON public.politica_programa_versao TO service_role;

-- Leitura pública de políticas publicadas (portal)
DROP POLICY IF EXISTS politica_programa_select_public_publicado ON public.politica_programa;
CREATE POLICY politica_programa_select_public_publicado
  ON public.politica_programa FOR SELECT
  TO anon, authenticated
  USING (
    status = 'publicado'
    AND EXISTS (
      SELECT 1 FROM public.programa p
      WHERE p.id = politica_programa.programa_id
        AND p.deleted_at IS NULL
        AND p.slug IS NOT NULL
    )
  );

`);

for (const m of [...MODELOS, ...STUBS_ENRIQUECIDOS]) {
  parts.push(upsertModelo(m));
}

parts.push(`
-- Reordenar modelos clássicos (mantém IDs; só ordem/nome se já existirem)
UPDATE public.politica_modelo SET ordem = 0 WHERE id = 'politica_protecao_dados_pessoais';
UPDATE public.politica_modelo SET ordem = 1 WHERE id = 'politica_backup';
UPDATE public.politica_modelo SET ordem = 2 WHERE id = 'politica_controle_acesso';
`);

fs.writeFileSync(OUT, parts.join("\n"), "utf8");
console.log("Wrote", OUT, "bytes", fs.statSync(OUT).size);