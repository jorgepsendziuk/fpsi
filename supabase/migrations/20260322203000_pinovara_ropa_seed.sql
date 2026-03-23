-- ROPA (registro ANPD + operações) para o programa slug pinovara — alinhado a docs/pinovara/ROPA.md
-- Idempotente: substitui linhas em public.ropa para esse programa; atualiza registro_ropa.

DO $$
DECLARE
  pid integer;
  rid integer;
BEGIN
  SELECT id INTO pid FROM public.programa WHERE slug = 'pinovara' LIMIT 1;
  IF pid IS NULL THEN
    RAISE NOTICE 'pinovara_ropa_seed: programa slug pinovara não encontrado; nada feito.';
    RETURN;
  END IF;

  INSERT INTO public.registro_ropa (
    programa_id,
    organizacao,
    cnpj,
    endereco,
    atividade_principal,
    gestor_responsavel,
    email,
    telefone,
    data_registro,
    categorias_titulares,
    medidas_seguranca,
    tipos_dados_pessoais,
    outros_dados_pessoais,
    compartilhamento,
    periodo_armazenamento,
    observacoes
  ) VALUES (
    pid,
    'Fundação de Apoio à Pesquisa e à Extensão (FAPEX)',
    '10.490.525/0001-06',
    NULL,
    'Projeto PINOVARA (Pesquisa Inovadora em Gestão do PNRA), parceria INCRA/UFBA via TED 50/2023',
    NULL,
    'ouvidoria@fapex.org.br',
    '(71) 3183-8400',
    CURRENT_DATE,
    '["titulares_em_geral"]'::jsonb,
    'Autenticação JWT, senha com bcrypt, HTTPS, controle de acesso por papéis, logs de auditoria, backups; infraestrutura em Google Cloud Platform (região Brasil).',
    '["nome","endereco","rg","email","cpf","telefone"]'::jsonb,
    'Dados socioeconômicos e ambientais; coordenadas GPS; registros de presença e avaliações; fotos de documentos e propriedades apenas na operação planejada (cadastro de famílias).',
    'UFBA e INCRA (pesquisa/extensão e política pública do projeto); prestador de hospedagem (GCP, Brasil).',
    'Em regra: vigência do projeto + 5 anos após encerramento, conforme exigências legais; usuários inativos até 5 anos.',
    'Sem transferência internacional de dados. Operação 4 (cadastro de famílias) ainda não implementada no sistema — apenas planejada.'
  )
  ON CONFLICT (programa_id) DO UPDATE SET
    organizacao = EXCLUDED.organizacao,
    cnpj = EXCLUDED.cnpj,
    endereco = EXCLUDED.endereco,
    atividade_principal = EXCLUDED.atividade_principal,
    gestor_responsavel = EXCLUDED.gestor_responsavel,
    email = EXCLUDED.email,
    telefone = EXCLUDED.telefone,
    data_registro = COALESCE(public.registro_ropa.data_registro, EXCLUDED.data_registro),
    categorias_titulares = EXCLUDED.categorias_titulares,
    medidas_seguranca = EXCLUDED.medidas_seguranca,
    tipos_dados_pessoais = EXCLUDED.tipos_dados_pessoais,
    outros_dados_pessoais = EXCLUDED.outros_dados_pessoais,
    compartilhamento = EXCLUDED.compartilhamento,
    periodo_armazenamento = EXCLUDED.periodo_armazenamento,
    observacoes = EXCLUDED.observacoes
  RETURNING id INTO rid;

  DELETE FROM public.ropa WHERE programa_id = pid;

  INSERT INTO public.ropa (
    programa_id,
    registro_ropa_id,
    nome,
    finalidade,
    base_legal,
    categorias_dados,
    categorias_titulares,
    compartilhamento,
    retencao,
    medidas_seguranca,
    responsavel
  ) VALUES
  (
    pid,
    rid,
    'Cadastro e gestão de usuários do sistema PINOVARA',
    'Autenticação, controle de acesso e identificação de técnicos, gestores e administradores que utilizam o sistema.',
    'Art. 7º, III — política pública (TED 50/2023 INCRA/UFBA)',
    'Nome completo, e-mail, senha (criptografada), permissões/papéis, data de registro',
    'Técnicos, gestores e administradores do projeto',
    'Não há compartilhamento com terceiros além da operação do sistema e da infraestrutura em GCP (Brasil).',
    'Até exclusão da conta ou 5 anos de inatividade',
    'Autenticação JWT, criptografia bcrypt, HTTPS, controle de acesso por papéis, logs de auditoria',
    NULL
  ),
  (
    pid,
    rid,
    'Perfil de Entrada e Plano de Gestão — organizações e representantes (Meta 12)',
    'Cadastro e gestão de organizações participantes; registro de representantes legais; elaboração de diagnósticos e relatórios técnicos.',
    'Art. 7º, III e V — política pública e contrato',
    'Organizações: nome, CNPJ, endereço, telefone, e-mail institucional, coordenadas GPS, dados socioeconômicos e ambientais. Representantes: nome, CPF, RG, endereço residencial, telefone, e-mail, função na organização.',
    'Organizações participantes e seus representantes legais',
    'UFBA (pesquisa/extensão), INCRA (projeto), prestadores de infraestrutura (hospedagem GCP, Brasil).',
    'Vigência do projeto + 5 anos após encerramento, conforme exigências legais',
    'Controle de acesso, backups, HTTPS, logs de auditoria',
    NULL
  ),
  (
    pid,
    rid,
    'Qualificação e Formação Profissional — capacitações e participantes (Meta 11)',
    'Cadastro de capacitações; gestão de participantes; registro de presença; avaliações; geração de certificados e relatórios.',
    'Art. 7º, II e III — obrigação legal e política pública',
    'Participantes: nome, CPF, RG (opcional), e-mail, telefone, instituição vinculada, data de inscrição, registros de presença, avaliações e feedback',
    'Participantes das capacitações',
    'UFBA, INCRA, prestadores de infraestrutura (GCP, Brasil).',
    'Vigência do projeto + 5 anos (certificação e comprovação de participação)',
    'Controle de acesso, backups, HTTPS, logs de auditoria',
    NULL
  ),
  (
    pid,
    rid,
    'Cadastro de famílias em territórios — coleta em campo (planejado; não implementado)',
    'Coleta de dados pessoais de famílias para suporte fundiário, elaboração de RTID e eventual regularização; georreferenciamento de lotes e perímetros. Ainda não disponível na aplicação.',
    'Art. 7º, III e 11, II — planejado (não implementado)',
    'Membros: nome, CPF, RG, endereço, telefone, data de nascimento. Documentos: fotos de identificação. Propriedade: fotos, coordenadas GPS, dados socioeconômicos e ambientais. Territórios quilombolas: possível dado sensível (origem racial/étnica).',
    'Famílias em assentamentos federais e territórios quilombolas',
    'INCRA, UFBA, órgãos competentes para regularização fundiária (quando aplicável).',
    'Vigência do projeto + 5 anos (conforme legislação fundiária) — quando implementado',
    'Coleta via tablets com armazenamento seguro; sincronização criptografada; controle de acesso; backups; treinamento de técnicos — planejado',
    NULL
  );
END $$;
