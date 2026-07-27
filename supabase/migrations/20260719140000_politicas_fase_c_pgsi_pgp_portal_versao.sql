-- ============================================
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

-- Leitura pública de políticas publicadas (portal usa service role; grant cobre fallbacks)
GRANT SELECT ON public.politica_programa TO anon;

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



INSERT INTO public.politica_modelo (id, nome, descricao, cor, ordem, secoes, ativo) VALUES (
  'politica_pgsi',
  'Programa de Governança em Segurança da Informação (PGSI)',
  'Programa institucional de governança em SI (PPSI 2.0, medida 0.9 / IN GSI/PR nº 3/2021)',
  '#1565C0',
  10,
  '[{"id":0,"secao":"PGSI","titulo":"Introdução","descricao":"Documento-programa de governança em SI.","texto":""},{"id":1,"secao":"Fundamentação","titulo":"Base normativa","descricao":"Referências.","texto":"<p>O PGSI do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> observa a IN GSI/PR nº 3/2021 e o PPSI, instituindo ações estruturadas, políticas, normas e procedimentos de segurança da informação.</p>"},{"id":2,"secao":"Objetivos","titulo":"Objetivos do programa","descricao":"","texto":"<p>I. promover a segurança da informação de forma contínua;<br/>II. alinhar controles e medidas do PPSI à realidade institucional;<br/>III. definir papéis, prazos e indicadores (ex.: iSeg);<br/>IV. revisar o programa com base em monitoramento e avaliações periódicas.</p>"},{"id":3,"secao":"Governança","titulo":"Estrutura de governança","descricao":"","texto":"<p>Preferencialmente em instância colegiada. Descreva comitês, gestor de SI, alta administração e fluxos de decisão.</p><p style=\"color: #dc0000;\">[Mapeie a estrutura real do órgão.]</p>"},{"id":4,"secao":"Políticas e controles","titulo":"Instrumentos","descricao":"","texto":"<p>O PGSI articula a POSIN e demais políticas de SI (backup, acesso, vulnerabilidades, malware, logs, ativos, provedores etc.), além do plano de implementação dos controles do PPSI.</p>"},{"id":5,"secao":"Indicadores e revisão","titulo":"Desempenho","descricao":"","texto":"<p>Defina indicadores (ex.: iSeg), periodicidade de medição e ciclo de revisão do PGSI.</p>"},{"id":6,"secao":"Disposições finais","titulo":"Vigência","descricao":"","texto":"<p>Este PGSI entra em vigor na data de sua publicação e será revisado periodicamente.</p>"}]'::jsonb,
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


INSERT INTO public.politica_modelo (id, nome, descricao, cor, ordem, secoes, ativo) VALUES (
  'politica_pgp',
  'Programa de Governança em Privacidade (PGP)',
  'Programa institucional de governança em privacidade (PPSI 2.0, medida 0.10 / LGPD art. 50)',
  '#6A1B9A',
  11,
  '[{"id":0,"secao":"PGP","titulo":"Introdução","descricao":"Documento-programa de governança em privacidade.","texto":""},{"id":1,"secao":"Fundamentação","titulo":"Base normativa","descricao":"","texto":"<p>O PGP do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> observa o art. 50, §2º, I, da Lei nº 13.709/2018 (LGPD) e o PPSI, na forma de ações estruturadas, políticas, normas e procedimentos para o tratamento de dados pessoais.</p>"},{"id":2,"secao":"Objetivos","titulo":"Objetivos do programa","descricao":"","texto":"<p>I. assegurar conformidade e accountability no tratamento de dados;<br/>II. implementar controles e medidas de privacidade do PPSI;<br/>III. definir papéis, prazos e indicadores (ex.: iPriv);<br/>IV. revisar o programa com base em monitoramento contínuo.</p>"},{"id":3,"secao":"Governança","titulo":"Estrutura","descricao":"","texto":"<p>Preferencialmente em instância colegiada. Descreva encarregado (DPO), comitê de proteção de dados, controlador e fluxos de decisão.</p>"},{"id":4,"secao":"Instrumentos","titulo":"Políticas e registros","descricao":"","texto":"<p>O PGP articula a Política de Proteção de Dados Pessoais, ROPA, RIPD, atendimento a titulares, gestão de incidentes e demais documentos de privacidade.</p>"},{"id":5,"secao":"Indicadores e revisão","titulo":"Desempenho","descricao":"","texto":"<p>Defina indicadores (ex.: iPriv), periodicidade e ciclo de revisão do PGP.</p>"},{"id":6,"secao":"Disposições finais","titulo":"Vigência","descricao":"","texto":"<p>Este PGP entra em vigor na data de sua publicação e será revisado periodicamente.</p>"}]'::jsonb,
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


INSERT INTO public.politica_modelo (id, nome, descricao, cor, ordem, secoes, ativo) VALUES (
  'documento_portal_politica_privacidade',
  'Política de Privacidade (portal)',
  'Texto público do portal do titular — política de privacidade',
  '#0277BD',
  20,
  '[{"id":0,"secao":"Política de Privacidade do portal","titulo":"Introdução","descricao":"Modelo de referência — adeque ao órgão ou entidade.","texto":""},{"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"Objetivos do documento.","texto":"<p>Este documento estabelece diretrizes, princípios e procedimentos do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> relativos a política de privacidade do portal.</p><p style=\"color: #dc0000;\">[Acrescente objetivos específicos.]</p>"},{"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"A quem se aplica.","texto":"<p>Aplica-se a colaboradores, prestadores e terceiros do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> no âmbito das atividades descritas.</p>"},{"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"Termos-chave.","texto":"<p>Utilize as definições da LGPD, do glossário de SI do GSI/PR e termos técnicos do ambiente.</p><p style=\"color: #dc0000;\">[Inclua glossário local.]</p>"},{"id":4,"secao":"Tratamentos","titulo":"Dados e finalidades","descricao":"","texto":"<p>Descreva categorias de dados, finalidades, bases legais e prazos de retenção aplicáveis aos serviços do portal.</p>"},{"id":5,"secao":"Direitos do titular","titulo":"Canais","descricao":"","texto":"<p>Os titulares podem exercer direitos pelo portal e pelos canais oficiais do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span>.</p>"},{"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"Quem faz o quê.","texto":"<p>Art. Compete à área responsável implementar, monitorar e revisar este documento. Gestores e usuários devem observar as diretrizes e reportar desvios.</p>"},{"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"Revisão e entrada em vigor.","texto":"<p>Este documento será revisado no prazo de <span style=\"background-color: yellow;\">[prazo]</span> e entra em vigor na data de sua publicação.</p>"}]'::jsonb,
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


INSERT INTO public.politica_modelo (id, nome, descricao, cor, ordem, secoes, ativo) VALUES (
  'documento_portal_aviso_titular',
  'Aviso do Portal do Titular',
  'Aviso informativo exibido no portal do titular',
  '#00838F',
  21,
  '[{"id":0,"secao":"Aviso do Portal do Titular","titulo":"Introdução","descricao":"Modelo de referência — adeque ao órgão ou entidade.","texto":""},{"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"Objetivos do documento.","texto":"<p>Este documento estabelece diretrizes, princípios e procedimentos do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> relativos a aviso do portal do titular.</p><p style=\"color: #dc0000;\">[Acrescente objetivos específicos.]</p>"},{"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"A quem se aplica.","texto":"<p>Aplica-se a colaboradores, prestadores e terceiros do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> no âmbito das atividades descritas.</p>"},{"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"Termos-chave.","texto":"<p>Utilize as definições da LGPD, do glossário de SI do GSI/PR e termos técnicos do ambiente.</p><p style=\"color: #dc0000;\">[Inclua glossário local.]</p>"},{"id":4,"secao":"Conteúdo do aviso","titulo":"Informações ao titular","descricao":"","texto":"<p>Informe finalidade do portal, prazos de resposta, necessidade de identificação e limites do atendimento.</p>"},{"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"Quem faz o quê.","texto":"<p>Art. Compete à área responsável implementar, monitorar e revisar este documento. Gestores e usuários devem observar as diretrizes e reportar desvios.</p>"},{"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"Revisão e entrada em vigor.","texto":"<p>Este documento será revisado no prazo de <span style=\"background-color: yellow;\">[prazo]</span> e entra em vigor na data de sua publicação.</p>"}]'::jsonb,
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


INSERT INTO public.politica_modelo (id, nome, descricao, cor, ordem, secoes, ativo) VALUES (
  'documento_portal_cookies',
  'Política de Cookies (portal)',
  'Política pública de cookies do portal',
  '#EF6C00',
  22,
  '[{"id":0,"secao":"Política de Cookies","titulo":"Introdução","descricao":"Modelo de referência — adeque ao órgão ou entidade.","texto":""},{"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"Objetivos do documento.","texto":"<p>Este documento estabelece diretrizes, princípios e procedimentos do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> relativos a política de cookies.</p><p style=\"color: #dc0000;\">[Acrescente objetivos específicos.]</p>"},{"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"A quem se aplica.","texto":"<p>Aplica-se a colaboradores, prestadores e terceiros do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> no âmbito das atividades descritas.</p>"},{"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"Termos-chave.","texto":"<p>Utilize as definições da LGPD, do glossário de SI do GSI/PR e termos técnicos do ambiente.</p><p style=\"color: #dc0000;\">[Inclua glossário local.]</p>"},{"id":4,"secao":"Tipos de cookies","titulo":"Categorias","descricao":"","texto":"<p>Descreva cookies essenciais, analíticos e de preferência, bases legais e como o titular pode gerenciar preferências.</p>"},{"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"Quem faz o quê.","texto":"<p>Art. Compete à área responsável implementar, monitorar e revisar este documento. Gestores e usuários devem observar as diretrizes e reportar desvios.</p>"},{"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"Revisão e entrada em vigor.","texto":"<p>Este documento será revisado no prazo de <span style=\"background-color: yellow;\">[prazo]</span> e entra em vigor na data de sua publicação.</p>"}]'::jsonb,
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


INSERT INTO public.politica_modelo (id, nome, descricao, cor, ordem, secoes, ativo) VALUES (
  'documento_portal_declaracao_seguranca',
  'Declaração de Segurança (portal)',
  'Declaração pública de práticas de segurança',
  '#2E7D32',
  23,
  '[{"id":0,"secao":"Declaração de Segurança","titulo":"Introdução","descricao":"Modelo de referência — adeque ao órgão ou entidade.","texto":""},{"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"Objetivos do documento.","texto":"<p>Este documento estabelece diretrizes, princípios e procedimentos do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> relativos a declaração de segurança.</p><p style=\"color: #dc0000;\">[Acrescente objetivos específicos.]</p>"},{"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"A quem se aplica.","texto":"<p>Aplica-se a colaboradores, prestadores e terceiros do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> no âmbito das atividades descritas.</p>"},{"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"Termos-chave.","texto":"<p>Utilize as definições da LGPD, do glossário de SI do GSI/PR e termos técnicos do ambiente.</p><p style=\"color: #dc0000;\">[Inclua glossário local.]</p>"},{"id":4,"secao":"Medidas","titulo":"Controles adotados","descricao":"","texto":"<p>Descreva, em linguagem acessível, medidas técnicas e organizacionais de segurança adotadas pelo <span style=\"background-color: yellow;\">[Órgão ou entidade]</span>.</p>"},{"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"Quem faz o quê.","texto":"<p>Art. Compete à área responsável implementar, monitorar e revisar este documento. Gestores e usuários devem observar as diretrizes e reportar desvios.</p>"},{"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"Revisão e entrada em vigor.","texto":"<p>Este documento será revisado no prazo de <span style=\"background-color: yellow;\">[prazo]</span> e entra em vigor na data de sua publicação.</p>"}]'::jsonb,
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


INSERT INTO public.politica_modelo (id, nome, descricao, cor, ordem, secoes, ativo) VALUES (
  'politica_defesas_malware',
  'Política de Defesas contra Malware',
  'Proteção contra softwares maliciosos',
  '#F44336',
  3,
  '[{"id":0,"secao":"Política de Defesas contra Malware","titulo":"Introdução","descricao":"Modelo de referência — adeque ao órgão ou entidade.","texto":""},{"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"Objetivos do documento.","texto":"<p>Este documento estabelece diretrizes, princípios e procedimentos do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> relativos a política de defesas contra malware.</p><p style=\"color: #dc0000;\">[Acrescente objetivos específicos.]</p>"},{"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"A quem se aplica.","texto":"<p>Aplica-se a colaboradores, prestadores e terceiros do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> no âmbito das atividades descritas.</p>"},{"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"Termos-chave.","texto":"<p>Utilize as definições da LGPD, do glossário de SI do GSI/PR e termos técnicos do ambiente.</p><p style=\"color: #dc0000;\">[Inclua glossário local.]</p>"},{"id":4,"secao":"Controles","titulo":"Prevenção e resposta","descricao":"","texto":"<p>Art. Devem ser adotadas soluções antimalware atualizadas, restrição de execução de arquivos suspeitos, filtragem de e-mail/web e procedimentos de contenção e erradicação de incidentes.</p>"},{"id":5,"secao":"Uso de dispositivos","titulo":"Mídias e remotas","descricao":"","texto":"<p>Art. É vedado o uso de mídias não autorizadas. Dispositivos remotos devem cumprir requisitos mínimos de proteção.</p>"},{"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"Quem faz o quê.","texto":"<p>Art. Compete à área responsável implementar, monitorar e revisar este documento. Gestores e usuários devem observar as diretrizes e reportar desvios.</p>"},{"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"Revisão e entrada em vigor.","texto":"<p>Este documento será revisado no prazo de <span style=\"background-color: yellow;\">[prazo]</span> e entra em vigor na data de sua publicação.</p>"}]'::jsonb,
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


INSERT INTO public.politica_modelo (id, nome, descricao, cor, ordem, secoes, ativo) VALUES (
  'politica_desenvolvimento_pessoas',
  'Política de Desenvolvimento de Pessoas',
  'Treinamento e conscientização em segurança',
  '#9C27B0',
  4,
  '[{"id":0,"secao":"Política de Desenvolvimento de Pessoas","titulo":"Introdução","descricao":"Modelo de referência — adeque ao órgão ou entidade.","texto":""},{"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"Objetivos do documento.","texto":"<p>Este documento estabelece diretrizes, princípios e procedimentos do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> relativos a política de desenvolvimento de pessoas.</p><p style=\"color: #dc0000;\">[Acrescente objetivos específicos.]</p>"},{"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"A quem se aplica.","texto":"<p>Aplica-se a colaboradores, prestadores e terceiros do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> no âmbito das atividades descritas.</p>"},{"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"Termos-chave.","texto":"<p>Utilize as definições da LGPD, do glossário de SI do GSI/PR e termos técnicos do ambiente.</p><p style=\"color: #dc0000;\">[Inclua glossário local.]</p>"},{"id":4,"secao":"Capacitação","titulo":"Programa de treinamento","descricao":"","texto":"<p>Art. Todos os colaboradores com acesso a sistemas ou dados devem participar de capacitação periódica em SI e privacidade, adequada às suas funções.</p>"},{"id":5,"secao":"Conscientização","titulo":"Campanhas","descricao":"","texto":"<p>Art. Devem ser realizadas campanhas de conscientização (phishing, senhas, tratamento de dados) com registro de participação.</p>"},{"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"Quem faz o quê.","texto":"<p>Art. Compete à área responsável implementar, monitorar e revisar este documento. Gestores e usuários devem observar as diretrizes e reportar desvios.</p>"},{"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"Revisão e entrada em vigor.","texto":"<p>Este documento será revisado no prazo de <span style=\"background-color: yellow;\">[prazo]</span> e entra em vigor na data de sua publicação.</p>"}]'::jsonb,
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


INSERT INTO public.politica_modelo (id, nome, descricao, cor, ordem, secoes, ativo) VALUES (
  'politica_gerenciamento_vulnerabilidades',
  'Política de Gerenciamento de Vulnerabilidades',
  'Identificação e correção de vulnerabilidades',
  '#E91E63',
  5,
  '[{"id":0,"secao":"Política de Gerenciamento de Vulnerabilidades","titulo":"Introdução","descricao":"Modelo de referência — adeque ao órgão ou entidade.","texto":""},{"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"Objetivos do documento.","texto":"<p>Este documento estabelece diretrizes, princípios e procedimentos do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> relativos a política de gerenciamento de vulnerabilidades.</p><p style=\"color: #dc0000;\">[Acrescente objetivos específicos.]</p>"},{"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"A quem se aplica.","texto":"<p>Aplica-se a colaboradores, prestadores e terceiros do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> no âmbito das atividades descritas.</p>"},{"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"Termos-chave.","texto":"<p>Utilize as definições da LGPD, do glossário de SI do GSI/PR e termos técnicos do ambiente.</p><p style=\"color: #dc0000;\">[Inclua glossário local.]</p>"},{"id":4,"secao":"Ciclo de vida","titulo":"Identificar, priorizar, corrigir","descricao":"","texto":"<p>Art. Vulnerabilidades devem ser identificadas (scans, CVE, testes), classificadas por risco e corrigidas em prazos definidos conforme criticidade.</p>"},{"id":5,"secao":"Patching","titulo":"Atualizações","descricao":"","texto":"<p>Art. Patches de segurança críticos devem ser aplicados em prazo máximo definido pela área de TI/SI, com registro de exceções.</p>"},{"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"Quem faz o quê.","texto":"<p>Art. Compete à área responsável implementar, monitorar e revisar este documento. Gestores e usuários devem observar as diretrizes e reportar desvios.</p>"},{"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"Revisão e entrada em vigor.","texto":"<p>Este documento será revisado no prazo de <span style=\"background-color: yellow;\">[prazo]</span> e entra em vigor na data de sua publicação.</p>"}]'::jsonb,
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


INSERT INTO public.politica_modelo (id, nome, descricao, cor, ordem, secoes, ativo) VALUES (
  'politica_gestao_ativos',
  'Política de Gestão de Ativos',
  'Inventário e gestão de ativos de TI',
  '#607D8B',
  6,
  '[{"id":0,"secao":"Política de Gestão de Ativos","titulo":"Introdução","descricao":"Modelo de referência — adeque ao órgão ou entidade.","texto":""},{"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"Objetivos do documento.","texto":"<p>Este documento estabelece diretrizes, princípios e procedimentos do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> relativos a política de gestão de ativos.</p><p style=\"color: #dc0000;\">[Acrescente objetivos específicos.]</p>"},{"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"A quem se aplica.","texto":"<p>Aplica-se a colaboradores, prestadores e terceiros do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> no âmbito das atividades descritas.</p>"},{"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"Termos-chave.","texto":"<p>Utilize as definições da LGPD, do glossário de SI do GSI/PR e termos técnicos do ambiente.</p><p style=\"color: #dc0000;\">[Inclua glossário local.]</p>"},{"id":4,"secao":"Inventário","titulo":"Cadastro de ativos","descricao":"","texto":"<p>Art. Todos os ativos de informação relevantes devem constar de inventário atualizado, com responsável, classificação e localização.</p>"},{"id":5,"secao":"Ciclo de vida","titulo":"Aquisição ao descarte","descricao":"","texto":"<p>Art. Aquisição, uso, transferência e descarte seguro de ativos devem seguir procedimentos aprovados, incluindo sanitização de mídias.</p>"},{"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"Quem faz o quê.","texto":"<p>Art. Compete à área responsável implementar, monitorar e revisar este documento. Gestores e usuários devem observar as diretrizes e reportar desvios.</p>"},{"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"Revisão e entrada em vigor.","texto":"<p>Este documento será revisado no prazo de <span style=\"background-color: yellow;\">[prazo]</span> e entra em vigor na data de sua publicação.</p>"}]'::jsonb,
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


INSERT INTO public.politica_modelo (id, nome, descricao, cor, ordem, secoes, ativo) VALUES (
  'politica_logs_auditoria',
  'Política de Logs e Auditoria',
  'Registros de eventos e trilhas de auditoria',
  '#795548',
  7,
  '[{"id":0,"secao":"Política de Logs e Auditoria","titulo":"Introdução","descricao":"Modelo de referência — adeque ao órgão ou entidade.","texto":""},{"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"Objetivos do documento.","texto":"<p>Este documento estabelece diretrizes, princípios e procedimentos do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> relativos a política de logs e auditoria.</p><p style=\"color: #dc0000;\">[Acrescente objetivos específicos.]</p>"},{"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"A quem se aplica.","texto":"<p>Aplica-se a colaboradores, prestadores e terceiros do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> no âmbito das atividades descritas.</p>"},{"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"Termos-chave.","texto":"<p>Utilize as definições da LGPD, do glossário de SI do GSI/PR e termos técnicos do ambiente.</p><p style=\"color: #dc0000;\">[Inclua glossário local.]</p>"},{"id":4,"secao":"Registro","titulo":"O que registrar","descricao":"","texto":"<p>Art. Sistemas críticos devem gerar logs de autenticação, acesso a dados sensíveis, alterações privilegiadas e eventos de segurança, com proteção contra alteração indevida.</p>"},{"id":5,"secao":"Retenção e análise","titulo":"Prazo e uso","descricao":"","texto":"<p>Art. Logs devem ser retidos pelo prazo mínimo de <span style=\"background-color: yellow;\">[prazo]</span> e analisados periodicamente ou sob incidente.</p>"},{"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"Quem faz o quê.","texto":"<p>Art. Compete à área responsável implementar, monitorar e revisar este documento. Gestores e usuários devem observar as diretrizes e reportar desvios.</p>"},{"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"Revisão e entrada em vigor.","texto":"<p>Este documento será revisado no prazo de <span style=\"background-color: yellow;\">[prazo]</span> e entra em vigor na data de sua publicação.</p>"}]'::jsonb,
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


INSERT INTO public.politica_modelo (id, nome, descricao, cor, ordem, secoes, ativo) VALUES (
  'politica_provedor_servicos',
  'Política de Provedor de Serviços',
  'Gestão de fornecedores e prestadores de serviços',
  '#00BCD4',
  8,
  '[{"id":0,"secao":"Política de Provedor de Serviços","titulo":"Introdução","descricao":"Modelo de referência — adeque ao órgão ou entidade.","texto":""},{"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"Objetivos do documento.","texto":"<p>Este documento estabelece diretrizes, princípios e procedimentos do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> relativos a política de provedor de serviços.</p><p style=\"color: #dc0000;\">[Acrescente objetivos específicos.]</p>"},{"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"A quem se aplica.","texto":"<p>Aplica-se a colaboradores, prestadores e terceiros do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> no âmbito das atividades descritas.</p>"},{"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"Termos-chave.","texto":"<p>Utilize as definições da LGPD, do glossário de SI do GSI/PR e termos técnicos do ambiente.</p><p style=\"color: #dc0000;\">[Inclua glossário local.]</p>"},{"id":4,"secao":"Contratação","titulo":"Requisitos","descricao":"","texto":"<p>Art. Contratos com provedores que tratem dados ou acessem sistemas devem incluir cláusulas de SI, privacidade, confidencialidade e retorno/eliminação de dados.</p>"},{"id":5,"secao":"Monitoramento","titulo":"Acompanhamento","descricao":"","texto":"<p>Art. O desempenho e a conformidade dos provedores devem ser monitorados, com direito a auditoria quando cabível.</p>"},{"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"Quem faz o quê.","texto":"<p>Art. Compete à área responsável implementar, monitorar e revisar este documento. Gestores e usuários devem observar as diretrizes e reportar desvios.</p>"},{"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"Revisão e entrada em vigor.","texto":"<p>Este documento será revisado no prazo de <span style=\"background-color: yellow;\">[prazo]</span> e entra em vigor na data de sua publicação.</p>"}]'::jsonb,
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


INSERT INTO public.politica_modelo (id, nome, descricao, cor, ordem, secoes, ativo) VALUES (
  'politica_seguranca_informacao',
  'Política de Segurança da Informação',
  'Diretrizes gerais de segurança da informação (POSIN)',
  '#3F51B5',
  9,
  '[{"id":0,"secao":"Política de Segurança da Informação (POSIN)","titulo":"Introdução","descricao":"Modelo de referência — adeque ao órgão ou entidade.","texto":""},{"id":1,"secao":"Propósito","titulo":"Objetivo","descricao":"Objetivos do documento.","texto":"<p>Este documento estabelece diretrizes, princípios e procedimentos do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> relativos a política de segurança da informação (posin).</p><p style=\"color: #dc0000;\">[Acrescente objetivos específicos.]</p>"},{"id":2,"secao":"Escopo","titulo":"Amplitude","descricao":"A quem se aplica.","texto":"<p>Aplica-se a colaboradores, prestadores e terceiros do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span> no âmbito das atividades descritas.</p>"},{"id":3,"secao":"Termos e definições","titulo":"Glossário","descricao":"Termos-chave.","texto":"<p>Utilize as definições da LGPD, do glossário de SI do GSI/PR e termos técnicos do ambiente.</p><p style=\"color: #dc0000;\">[Inclua glossário local.]</p>"},{"id":4,"secao":"Princípios","titulo":"Confidencialidade, integridade e disponibilidade","descricao":"","texto":"<p>Art. A POSIN estabelece princípios, objetivos e responsabilidades para preservar a confidencialidade, integridade e disponibilidade das informações do <span style=\"background-color: yellow;\">[Órgão ou entidade]</span>.</p>"},{"id":5,"secao":"Controles","titulo":"Diretrizes gerais","descricao":"","texto":"<p>Art. Devem ser observadas políticas específicas de acesso, backup, vulnerabilidades, malware, logs, ativos e provedores, além de gestão de incidentes e continuidade.</p>"},{"id":90,"secao":"Responsabilidades","titulo":"Papéis","descricao":"Quem faz o quê.","texto":"<p>Art. Compete à área responsável implementar, monitorar e revisar este documento. Gestores e usuários devem observar as diretrizes e reportar desvios.</p>"},{"id":91,"secao":"Disposições finais","titulo":"Vigência e revisão","descricao":"Revisão e entrada em vigor.","texto":"<p>Este documento será revisado no prazo de <span style=\"background-color: yellow;\">[prazo]</span> e entra em vigor na data de sua publicação.</p>"}]'::jsonb,
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


-- Reordenar modelos clássicos (mantém IDs; só ordem/nome se já existirem)
UPDATE public.politica_modelo SET ordem = 0 WHERE id = 'politica_protecao_dados_pessoais';
UPDATE public.politica_modelo SET ordem = 1 WHERE id = 'politica_backup';
UPDATE public.politica_modelo SET ordem = 2 WHERE id = 'politica_controle_acesso';
