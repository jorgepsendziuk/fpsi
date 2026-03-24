-- Operação ROPA + levantamento de mapeamento: dados coletados automaticamente (logs, navegação, segurança).
-- Depende de: mapeamento_dados (campos estendidos), ropa.mapeamento_id, pinovara_ropa_seed.

DO $$
DECLARE
  pid integer;
  rid integer;
  mid bigint;
BEGIN
  SELECT id INTO pid FROM public.programa WHERE slug = 'pinovara' LIMIT 1;
  IF pid IS NULL THEN
    RAISE NOTICE 'pinovara_dados_automaticos: programa slug pinovara não encontrado; nada feito.';
    RETURN;
  END IF;

  SELECT id INTO rid FROM public.registro_ropa WHERE programa_id = pid LIMIT 1;

  DELETE FROM public.mapeamento_dados
  WHERE programa_id = pid
    AND nome = 'Dados automáticos — logs e navegação (web)';

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
  VALUES (
    pid,
    'Dados automáticos — logs e navegação (web)',
    'Registros técnicos gerados pelo uso do site e da aplicação (acesso, erros, auditoria), sem perfil comercial.',
    'Servidor e aplicação FPSI/PINOVARA; Google Cloud Platform (região Brasil); possíveis cookies técnicos do navegador.',
    'ti',
    NULL,
    'seguranca',
    'Segurança da informação, prevenção a fraudes, melhoria de desempenho e cumprimento de obrigações de registro (logs).',
    '["sistema_interno","nuvem","site_app"]'::jsonb,
    NULL,
    '["outros_tipos"]'::jsonb,
    'Endereço IP, data/hora, URL/rota, user-agent, identificadores de sessão técnicos, logs de auditoria de ações no sistema.',
    'apenas_interno',
    NULL,
    'visitante',
    NULL,
    'nao'
  )
  RETURNING id INTO mid;

  IF NOT EXISTS (
    SELECT 1 FROM public.ropa
    WHERE programa_id = pid
      AND nome = 'Dados automáticos — logs, navegação e segurança'
  ) THEN
    INSERT INTO public.ropa (
      programa_id,
      registro_ropa_id,
      mapeamento_id,
      nome,
      finalidade,
      base_legal,
      categorias_dados,
      categorias_titulares,
      compartilhamento,
      retencao,
      medidas_seguranca,
      responsavel
    )
    VALUES (
      pid,
      rid,
      mid,
      'Dados automáticos — logs, navegação e segurança',
      'Registro técnico de acessos e eventos para segurança da informação, auditoria, diagnóstico de falhas e continuidade do serviço.',
      'Art. 7º, IX — legítimo interesse; art. 10 LGPD',
      'Endereço IP, identificadores de sessão, data/hora, páginas ou rotas acessadas, tipo de navegador/dispositivo (user-agent), registros de auditoria de operações no sistema',
      'Titulares em geral que acessam o sistema ou o site institucional do projeto',
      'Prestador de infraestrutura (GCP, Brasil) apenas como encarregado de meios; sem uso para fins próprios.',
      'Em regra: até 12 meses para logs de acesso correntes; períodos maiores apenas quando exigido para defesa em incidentes ou por ordem legal.',
      'HTTPS, controle de acesso, segregação de ambientes, minimização de logs, acesso restrito a administradores',
      NULL
    );
  ELSE
    UPDATE public.ropa r
    SET mapeamento_id = mid
    WHERE r.programa_id = pid
      AND r.nome = 'Dados automáticos — logs, navegação e segurança'
      AND r.mapeamento_id IS NULL;
  END IF;
END $$;
