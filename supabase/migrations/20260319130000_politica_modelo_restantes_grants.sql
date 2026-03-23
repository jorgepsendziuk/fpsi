-- Modelos faltantes (FK de politica_programa exige id em politica_modelo)
-- + GRANTs para authenticated (RLS continua aplicável)

GRANT SELECT ON public.politica_modelo TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.politica_programa TO authenticated;

-- Template mínimo (editor expande com seções genéricas se necessário)
INSERT INTO public.politica_modelo (id, nome, descricao, cor, ordem, secoes, ativo) VALUES
(
  'politica_defesas_malware',
  'Política de Defesas contra Malware',
  'Proteção contra softwares maliciosos',
  '#F44336',
  3,
  '[{"id":0,"secao":"Introdução","titulo":"Modelo","descricao":"Edite conforme o órgão ou entidade.","texto":""}]'::jsonb,
  true
),
(
  'politica_desenvolvimento_pessoas',
  'Política de Desenvolvimento de Pessoas',
  'Treinamento e conscientização em segurança',
  '#9C27B0',
  4,
  '[{"id":0,"secao":"Introdução","titulo":"Modelo","descricao":"Edite conforme o órgão ou entidade.","texto":""}]'::jsonb,
  true
),
(
  'politica_gerenciamento_vulnerabilidades',
  'Política de Gerenciamento de Vulnerabilidades',
  'Identificação e correção de vulnerabilidades',
  '#E91E63',
  5,
  '[{"id":0,"secao":"Introdução","titulo":"Modelo","descricao":"Edite conforme o órgão ou entidade.","texto":""}]'::jsonb,
  true
),
(
  'politica_gestao_ativos',
  'Política de Gestão de Ativos',
  'Inventário e gestão de ativos de TI',
  '#607D8B',
  6,
  '[{"id":0,"secao":"Introdução","titulo":"Modelo","descricao":"Edite conforme o órgão ou entidade.","texto":""}]'::jsonb,
  true
),
(
  'politica_logs_auditoria',
  'Política de Logs e Auditoria',
  'Registros de eventos e trilhas de auditoria',
  '#795548',
  7,
  '[{"id":0,"secao":"Introdução","titulo":"Modelo","descricao":"Edite conforme o órgão ou entidade.","texto":""}]'::jsonb,
  true
),
(
  'politica_provedor_servicos',
  'Política de Provedor de Serviços',
  'Gestão de fornecedores e prestadores de serviços',
  '#00BCD4',
  8,
  '[{"id":0,"secao":"Introdução","titulo":"Modelo","descricao":"Edite conforme o órgão ou entidade.","texto":""}]'::jsonb,
  true
),
(
  'politica_seguranca_informacao',
  'Política de Segurança da Informação',
  'Diretrizes gerais de segurança da informação',
  '#3F51B5',
  9,
  '[{"id":0,"secao":"Introdução","titulo":"Modelo","descricao":"Edite conforme o órgão ou entidade.","texto":""}]'::jsonb,
  true
)
ON CONFLICT (id) DO NOTHING;
