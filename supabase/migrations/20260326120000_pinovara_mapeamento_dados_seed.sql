-- Levantamentos de mapeamento de dados para o programa slug pinovara (PINOVARA / FAPEX).
-- Idempotente: remove levantamentos com estes nomes e reinsere; reatribui ropa.mapeamento_id.

DO $$
DECLARE
  pid integer;
  mid integer;
BEGIN
  SELECT id INTO pid FROM public.programa WHERE slug = 'pinovara' LIMIT 1;
  IF pid IS NULL THEN
    RAISE NOTICE 'pinovara_mapeamento_seed: programa slug pinovara não encontrado; nada feito.';
    RETURN;
  END IF;

  DELETE FROM public.mapeamento_dados
  WHERE programa_id = pid
    AND nome IN (
      'Usuários do sistema PINOVARA',
      'Organizações e representantes — Meta 12',
      'Capacitações e participantes — Meta 11',
      'Famílias em territórios — campo (planejado)'
    );

  INSERT INTO public.mapeamento_dados (
    programa_id,
    nome,
    descricao,
    sistemas_ou_fontes,
    setor_area,
    setor_outro,
    finalidade_categoria,
    finalidade_detalhe,
    meios_armazenamento,
    meios_outro,
    tipos_dados,
    tipos_outro,
    fluxo_compartilhamento,
    compartilhamento_detalhe,
    categoria_titular,
    titular_outro,
    transferencia_internacional
  )
  VALUES
  (
    pid,
    'Usuários do sistema PINOVARA',
    'Contas de acesso ao sistema web do projeto (TED 50/2023 INCRA/UFBA).',
    'Aplicação FPSI/PINOVARA; infraestrutura em Google Cloud Platform (região Brasil).',
    'ti',
    NULL,
    'execucao_contrato',
    NULL,
    '["sistema_interno","nuvem"]'::jsonb,
    NULL,
    '["identificacao","contato"]'::jsonb,
    NULL,
    'apenas_interno',
    NULL,
    'colaborador',
    NULL,
    'nao'
  ),
  (
    pid,
    'Organizações e representantes — Meta 12',
    'Perfil de Entrada e Plano de Gestão: organizações participantes, representantes legais, diagnósticos e relatórios.',
    'Módulos Meta 12 no sistema; eventual uso de planilhas auxiliares.',
    'operacoes',
    NULL,
    'execucao_contrato',
    NULL,
    '["sistema_interno","planilha","site_app"]'::jsonb,
    NULL,
    '["identificacao","contato","financeiro","preferencias"]'::jsonb,
    NULL,
    'empresa_externa',
    'UFBA (pesquisa/extensão) e INCRA (política pública do projeto), conforme TED.',
    'cliente',
    NULL,
    'nao'
  ),
  (
    pid,
    'Capacitações e participantes — Meta 11',
    'Qualificação e Formação Profissional: inscrições, presença, avaliações e certificados.',
    'Módulos Meta 11 no sistema; comunicação por e-mail com participantes.',
    'atendimento',
    NULL,
    'obrigacao_legal',
    NULL,
    '["sistema_interno","email_mensageria"]'::jsonb,
    NULL,
    '["identificacao","contato","preferencias"]'::jsonb,
    NULL,
    'empresa_externa',
    'Relatórios e comprovações compartilhados com UFBA e INCRA no âmbito do projeto.',
    'cliente',
    NULL,
    'nao'
  ),
  (
    pid,
    'Famílias em territórios — campo (planejado)',
    'Coleta em campo para suporte fundiário e RTID; ainda não implementado na aplicação (conforme registro ROPA).',
    'Planejado: tablets em campo, sincronização para ambiente seguro; possível armazenamento em nuvem (Brasil).',
    'operacoes',
    NULL,
    'obrigacao_legal',
    'Operação prevista para regularização fundiária e territórios quilombolas; dados sensíveis tratados com cautela.',
    '["site_app","papel","nuvem"]'::jsonb,
    'Coleta via tablets em campo (planejado)',
    '["identificacao","contato","saude","outros_tipos"]'::jsonb,
    'Dados socioeconômicos e ambientais; coordenadas GPS; possível origem racial/étnica em territórios quilombolas.',
    'empresa_externa',
    'INCRA, UFBA e órgãos competentes para regularização, quando aplicável.',
    'outros',
    'Famílias em assentamentos federais e territórios quilombolas',
    'nao_sei'
  );

  UPDATE public.ropa r
  SET mapeamento_id = m.id
  FROM public.mapeamento_dados m
  WHERE r.programa_id = pid
    AND m.programa_id = pid
    AND m.nome = 'Usuários do sistema PINOVARA'
    AND r.nome = 'Cadastro e gestão de usuários do sistema PINOVARA';

  UPDATE public.ropa r
  SET mapeamento_id = m.id
  FROM public.mapeamento_dados m
  WHERE r.programa_id = pid
    AND m.programa_id = pid
    AND m.nome = 'Organizações e representantes — Meta 12'
    AND r.nome = 'Perfil de Entrada e Plano de Gestão — organizações e representantes (Meta 12)';

  UPDATE public.ropa r
  SET mapeamento_id = m.id
  FROM public.mapeamento_dados m
  WHERE r.programa_id = pid
    AND m.programa_id = pid
    AND m.nome = 'Capacitações e participantes — Meta 11'
    AND r.nome = 'Qualificação e Formação Profissional — capacitações e participantes (Meta 11)';

  UPDATE public.ropa r
  SET mapeamento_id = m.id
  FROM public.mapeamento_dados m
  WHERE r.programa_id = pid
    AND m.programa_id = pid
    AND m.nome = 'Famílias em territórios — campo (planejado)'
    AND r.nome = 'Cadastro de famílias em territórios — coleta em campo (planejado; não implementado)';
END $$;

