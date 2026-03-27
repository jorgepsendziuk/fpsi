-- ============================================
-- Dados fictícios do programa de demonstração: escopo, tipo, identificação e organização
-- (tabela programa + empresa vinculada quando aplicável).
-- Alvo: slug demo/demonstracao ou programa id = 1.
-- ============================================

DO $$
DECLARE
  eid INTEGER;
BEGIN
  -- Empresa institucional demo (reutilizada se já existir pelo mesmo CNPJ numérico)
  SELECT id INTO eid FROM public.empresa WHERE cnpj = 12345678000199 LIMIT 1;

  IF eid IS NULL THEN
    INSERT INTO public.empresa (
      cnpj,
      razao_social,
      nome_fantasia,
      endereco,
      atividade_principal,
      gestor_responsavel,
      email,
      telefone
    ) VALUES (
      12345678000199,
      'DemTech Soluções em Software e Serviços Ltda.',
      'Empresa Demo Tech Ltda',
      'Av. Paulista, 1000, Bela Vista — São Paulo/SP — CEP 01310-100',
      'Desenvolvimento de software, integração de sistemas, consultoria em governança de dados e conformidade com a LGPD; operações meramente ilustrativas no ambiente FPSI de demonstração.',
      'Encarregado Demo FPSI',
      'privacidade.demo@fpsi.local',
      '(11) 3000-0000'
    )
    RETURNING id INTO eid;
  ELSE
    UPDATE public.empresa
    SET
      razao_social = 'DemTech Soluções em Software e Serviços Ltda.',
      nome_fantasia = 'Empresa Demo Tech Ltda',
      endereco = 'Av. Paulista, 1000, Bela Vista — São Paulo/SP — CEP 01310-100',
      atividade_principal = 'Desenvolvimento de software, integração de sistemas, consultoria em governança de dados e conformidade com a LGPD; operações meramente ilustrativas no ambiente FPSI de demonstração.',
      gestor_responsavel = 'Encarregado Demo FPSI',
      email = 'privacidade.demo@fpsi.local',
      telefone = '(11) 3000-0000'
    WHERE id = eid;
  END IF;

  UPDATE public.programa p
  SET
    nome = 'Programa de Demonstração - FPSI',
    tipo_programa = 'empresa_organizacao',
    descricao_escopo = $txt$
Este programa de privacidade tem caráter exclusivamente didático: simula a governança de dados de uma empresa de tecnologia com operações de RH, comercial, suporte e infraestrutura, para exercício das telas do FPSI (diagnóstico, planos, ROPA, RIPD, pedidos de titulares e portal).

O escopo abrange o tratamento de dados pessoais no ciclo de vida fictício "Demo Tech": cadastros de colaboradores e terceiros, relacionamento com clientes e leads, atendimento e incidentes simulados. Nenhum dado real de titulares deve ser inserido; use apenas informações inventadas ou fornecidas pelo próprio FPSI para treinamento.
$txt$,
    atividade_principal_organizacao = $txt$
Prestação de serviços de desenvolvimento de software sob encomenda, licenciamento de soluções em nuvem (região Brasil), suporte técnico níveis 1 a 3 e consultoria em privacidade aplicada a produtos digitais. Porte médio, atuação B2B, sem operação de saúde ou scoring de crédito em produção neste ambiente de demonstração.
$txt$,
    nome_fantasia = 'Empresa Demo Tech Ltda',
    razao_social = 'DemTech Soluções em Software e Serviços Ltda.',
    cnpj = 12345678000199,
    endereco = 'Av. Paulista, 1000, Bela Vista — São Paulo/SP — CEP 01310-100',
    atendimento_email = 'privacidade.demo@fpsi.local',
    atendimento_fone = '(11) 3000-0000',
    atendimento_site = 'https://demo.fpsi.local',
    sigla = 'EDT',
    unidade = 'Matriz (demo) — Operações digitais',
    empresa_id = eid,
    politica_inicio_vigencia = COALESCE(p.politica_inicio_vigencia, DATE '2025-01-15'),
    politica_prazo_revisao = COALESCE(p.politica_prazo_revisao, DATE '2026-07-15')
  WHERE p.slug IN ('demonstracao', 'demo')
     OR p.id = 1;

  RAISE NOTICE 'seed_demo_programa_org_escopo: atualizado(s) programa(s) demo e empresa_id=%', eid;
END $$;
