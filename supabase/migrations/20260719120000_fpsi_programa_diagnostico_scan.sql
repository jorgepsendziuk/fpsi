-- Programa FPSI (slug fpsi): criação, governança, diagnóstico auto (scan código), riscos e POSIN.
-- Idempotente. Vincula admins do sistema e usuários is_system_admin.

DO $$
DECLARE
  pid INTEGER;
  rid_alta INTEGER;
  rid_tic INTEGER;
  rid_si INTEGER;
  rid_dpo INTEGER;
  rid_int INTEGER;
  rid_sub INTEGER;
  rid INTEGER;
  mid BIGINT;
  posin_secoes JSONB;
BEGIN
  -- 1. Programa
  SELECT id INTO pid FROM public.programa WHERE slug = 'fpsi' LIMIT 1;
  IF pid IS NULL THEN
    INSERT INTO public.programa (
      nome, nome_fantasia, razao_social, slug, tipo_programa,
      descricao_escopo, atividade_principal_organizacao,
      atendimento_email, atendimento_site, setor
    ) VALUES (
      'FPSI — Programa de Privacidade do Software',
      'FPSI',
      'LGRDC Serviços de Informática',
      'fpsi',
      'software',
      'Programa de privacidade e SI da plataforma FPSI (multi-inquilino, PPSI/LGPD).',
      'Plataforma web de gestão de programas de privacidade e segurança da informação alinhada ao PPSI 2.0 e LGPD.',
      'jorgefrpsendziuk@gmail.com',
      'https://fpsi.vercel.app',
      2
    )
    RETURNING id INTO pid;
    RAISE NOTICE 'fpsi_diag: programa criado id=%', pid;
  ELSE
    RAISE NOTICE 'fpsi_diag: programa existente id=%', pid;
  END IF;

  -- 2. Responsáveis (governança mínima)
  INSERT INTO public.responsavel (programa, nome, departamento, email, cargo)
  SELECT pid, 'Jorge Psendziuk', 'LGRDC / DPO', 'jorgefrpsendziuk@gmail.com', 'Encarregado e Gestor TIC/SI'
  WHERE NOT EXISTS (SELECT 1 FROM public.responsavel r WHERE r.programa = pid AND r.email = 'jorgefrpsendziuk@gmail.com');

  SELECT id INTO rid_dpo FROM public.responsavel WHERE programa = pid AND email = 'jorgefrpsendziuk@gmail.com' LIMIT 1;

  INSERT INTO public.responsavel (programa, nome, departamento, email, cargo)
  SELECT pid, 'Representante FPSI', 'Alta administração', 'jorgefrpsendziuk@gmail.com', 'Representante da alta administração'
  WHERE NOT EXISTS (SELECT 1 FROM public.responsavel r WHERE r.programa = pid AND r.nome = 'Representante FPSI');

  SELECT id INTO rid_alta FROM public.responsavel WHERE programa = pid AND nome = 'Representante FPSI' LIMIT 1;

  rid_tic := rid_dpo;
  rid_si := rid_dpo;
  rid_int := rid_dpo;

  UPDATE public.programa SET
    representante_alta_administracao = COALESCE(representante_alta_administracao, rid_alta),
    gestor_tic = COALESCE(gestor_tic, rid_tic),
    gestor_seguranca_informacao = COALESCE(gestor_seguranca_informacao, rid_si),
    encarregado_dados_pessoais = COALESCE(encarregado_dados_pessoais, rid_dpo),
    responsavel_gestao_integridade = COALESCE(responsavel_gestao_integridade, rid_int),
    encarregado_substituto = COALESCE(encarregado_substituto, rid_dpo),
    dpo_notificacao_email = COALESCE(dpo_notificacao_email, 'jorgefrpsendziuk@gmail.com'),
    dpo_ato_designacao_data = COALESCE(dpo_ato_designacao_data, CURRENT_DATE),
    link_politica_privacidade = COALESCE(link_politica_privacidade, 'https://fpsi.vercel.app/fpsi/politica-privacidade')
  WHERE id = pid;

  -- 3. Vincular admins
  INSERT INTO public.programa_users (programa_id, user_id, role, permissions, status)
  SELECT pid, p.user_id::text, 'admin', '{}'::jsonb, 'accepted'
  FROM public.profiles p
  WHERE p.is_system_admin = true
    AND NOT EXISTS (
      SELECT 1 FROM public.programa_users pu WHERE pu.programa_id = pid AND pu.user_id = p.user_id::text
    );

  INSERT INTO public.programa_users (programa_id, user_id, role, permissions, status)
  SELECT pid, au.id::text, 'admin', '{}'::jsonb, 'accepted'
  FROM auth.users au
  WHERE au.email IN ('demo@fpsi.com.br', 'jorgefrpsendziuk@gmail.com')
    AND NOT EXISTS (
      SELECT 1 FROM public.programa_users pu WHERE pu.programa_id = pid AND pu.user_id = au.id::text
    );

  UPDATE public.profiles SET is_system_admin = true
  WHERE email IN ('jorgefrpsendziuk@gmail.com', 'demo@fpsi.com.br') AND is_system_admin IS DISTINCT FROM true;

  -- 4. POSIN (se ausente)
  posin_secoes := $json$[
    {"id":0,"secao":"Política de Segurança da Informação","titulo":"Escopo","descricao":"","texto":"<p>Esta POSIN aplica-se à <strong>plataforma FPSI</strong> (Framework de Privacidade e Segurança da Informação), operada pela LGRDC, incluindo hospedagem na Vercel, banco de dados Supabase e integrações listadas no ROPA do programa.</p>"},
    {"id":1,"secao":"Objetivo","titulo":"Objetivo","descricao":"","texto":"<p>Estabelecer diretrizes de segurança da informação para proteção de dados, disponibilidade e integridade dos serviços prestados pela aplicação FPSI.</p>"},
    {"id":2,"secao":"Controles técnicos","titulo":"Controles implementados","descricao":"","texto":"<p>Autenticação Supabase Auth; RBAC por programa; RLS no PostgreSQL; HTTPS; headers de segurança; auditoria (user_activities); rate limiting em formulários públicos; gestão de vulnerabilidades via CI (npm audit, lint, build).</p>"},
    {"id":3,"secao":"Papéis","titulo":"Responsabilidades","descricao":"","texto":"<p>Gestor TIC/SI e DPO conforme cadastro do programa; usuários administradores responsáveis pela configuração de cada instância multi-inquilino.</p>"}
  ]$json$::jsonb;

  INSERT INTO public.politica_programa (programa_id, tipo_politica, secoes, inicio_vigencia, prazo_revisao)
  VALUES (pid, 'politica_seguranca_informacao', posin_secoes, CURRENT_DATE, (CURRENT_DATE + INTERVAL '12 months')::date)
  ON CONFLICT (programa_id, tipo_politica) DO UPDATE SET
    secoes = CASE WHEN public.politica_programa.secoes IS NULL OR public.politica_programa.secoes = '[]'::jsonb
      THEN EXCLUDED.secoes ELSE public.politica_programa.secoes END;

  -- 5. programa_controle / programa_medida
  INSERT INTO public.programa_controle (controle, programa, nivel)
  SELECT c.id, pid, NULL FROM public.controle c
  WHERE NOT EXISTS (SELECT 1 FROM public.programa_controle pc WHERE pc.programa = pid AND pc.controle = c.id);

  INSERT INTO public.programa_medida (programa, medida, resposta, prioridade)
  SELECT pid, m.id, NULL, false FROM public.medida m
  WHERE NOT EXISTS (SELECT 1 FROM public.programa_medida pm WHERE pm.programa = pid AND pm.medida = m.id);

  -- 6. Respostas do diagnóstico (scan código jul/2026)
  CREATE TEMP TABLE IF NOT EXISTS _fpsi_diag (id_medida text, resposta int, justificativa text) ON COMMIT DROP;
  TRUNCATE _fpsi_diag;
  INSERT INTO _fpsi_diag (id_medida, resposta, justificativa) VALUES
  ('0.1', 1, '[Auto FPSI scan] Representante da alta administração vinculado no programa.'),
  ('0.2', 1, '[Auto FPSI scan] Gestor de TIC designado.'),
  ('0.3', 1, '[Auto FPSI scan] Gestor de SI designado.'),
  ('0.4', 1, '[Auto FPSI scan] Encarregado (DPO) designado.'),
  ('0.5', 1, '[Auto FPSI scan] Responsável pela gestão da integridade designado.'),
  ('0.6', 2, '[Auto FPSI scan] Comitê de SI não instituido (operação enxuta).'),
  ('0.7', 2, '[Auto FPSI scan] Comitê de proteção de dados não instituido formalmente.'),
  ('0.8', 2, '[Auto FPSI scan] ETIR não instituida; incidentes via módulo FPSI.'),
  ('0.9', 2, '[Auto FPSI scan] PGSI documental institucional não formalizado.'),
  ('0.10', 2, '[Auto FPSI scan] PGP formal não publicado como documento institucional.'),
  ('0.11', 1, '[Auto FPSI scan] POSIN no módulo Políticas (politica_seguranca_informacao).'),
  ('0.12', 1, '[Auto FPSI scan] Política de proteção de dados no programa.'),
  ('0.13', 2, '[Auto FPSI scan] Módulo programa_risco existe; processo IN GSI/PR Cap. III não formalizado.'),
  ('0.14', 2, '[Auto FPSI scan] Sem processo/módulo de continuidade de negócios SI.'),
  ('0.15', 2, '[Auto FPSI scan] Gestão de mudanças via Git sem processo institucional formal.'),
  ('0.16', 2, '[Auto FPSI scan] Diagnóstico e auditoria no app; plano formal de verificação ausente.'),
  ('0.17', 2, '[Auto FPSI scan] Riscos de privacidade parciais (programa_risco + RIPD); processo documentado incompleto.'),
  ('1.1', 6, '[Auto FPSI scan] N/A escopo software SaaS — ativos de rede/dispositivos são da infraestrutura.'),
  ('1.2', 6, '[Auto FPSI scan] N/A escopo software SaaS — ativos de rede/dispositivos são da infraestrutura.'),
  ('1.3', 6, '[Auto FPSI scan] N/A escopo software SaaS — ativos de rede/dispositivos são da infraestrutura.'),
  ('1.4', 6, '[Auto FPSI scan] N/A escopo software SaaS — ativos de rede/dispositivos são da infraestrutura.'),
  ('1.5', 6, '[Auto FPSI scan] N/A escopo software SaaS — ativos de rede/dispositivos são da infraestrutura.'),
  ('2.1', 1, '[Auto FPSI scan] Inventário via package.json e package-lock.json.'),
  ('2.2', 3, '[Auto FPSI scan] Dependências mantidas; sem política automatizada de EOL.'),
  ('2.3', 3, '[Auto FPSI scan] Controle via lockfile; sem bloqueio de pacotes não autorizados.'),
  ('2.4', 4, '[Auto FPSI scan] CI com npm audit; SBOM não automatizado.'),
  ('2.5', 3, '[Auto FPSI scan] Lista implícita via package.json.'),
  ('2.6', 3, '[Auto FPSI scan] Imports via npm; sem allowlist formal.'),
  ('2.7', 3, '[Auto FPSI scan] Scripts versionados; sem assinatura digital.'),
  ('3.1', 3, '[Auto FPSI scan] ROPA/mapeamento; documento formal de gestão de dados ausente.'),
  ('3.2', 1, '[Auto FPSI scan] Inventário via mapeamento_dados, ROPA e migrations SQL.'),
  ('3.3', 1, '[Auto FPSI scan] RLS Supabase + RBAC programa_users + guards em APIs.'),
  ('3.4', 3, '[Auto FPSI scan] Retenção no ROPA; purge automático parcial.'),
  ('3.5', 3, '[Auto FPSI scan] Soft delete; exclusão titular via DSAR.'),
  ('3.6', 6, '[Auto FPSI scan] N/A — sem dados em dispositivos endpoint.'),
  ('3.7', 3, '[Auto FPSI scan] Categorias no mapeamento/ROPA.'),
  ('3.8', 1, '[Auto FPSI scan] Fluxos em mapeamento_dados e ROPA.'),
  ('3.9', 6, '[Auto FPSI scan] N/A — mídia removível.'),
  ('3.10', 1, '[Auto FPSI scan] HTTPS/TLS em produção (Vercel) + HSTS.'),
  ('3.11', 1, '[Auto FPSI scan] Criptografia em repouso via Supabase/PostgreSQL.'),
  ('3.12', 3, '[Auto FPSI scan] Segregação multi-inquilino por programa_id.'),
  ('3.13', 6, '[Auto FPSI scan] N/A — DLP corporativo.'),
  ('3.14', 1, '[Auto FPSI scan] user_activities + módulo Auditoria.'),
  ('4.1', 3, '[Auto FPSI scan] Hardening parcial (headers, Supabase).'),
  ('4.2', 6, '[Auto FPSI scan] N/A — rede física/virtual.'),
  ('4.3', 6, '[Auto FPSI scan] N/A — configuração SO/rede/dispositivos.'),
  ('4.4', 6, '[Auto FPSI scan] N/A — configuração SO/rede/dispositivos.'),
  ('4.5', 6, '[Auto FPSI scan] N/A — configuração SO/rede/dispositivos.'),
  ('4.9', 6, '[Auto FPSI scan] N/A — configuração SO/rede/dispositivos.'),
  ('4.10', 6, '[Auto FPSI scan] N/A — configuração SO/rede/dispositivos.'),
  ('4.11', 6, '[Auto FPSI scan] N/A — configuração SO/rede/dispositivos.'),
  ('4.12', 6, '[Auto FPSI scan] N/A — configuração SO/rede/dispositivos.'),
  ('4.6', 3, '[Auto FPSI scan] Patches via npm.'),
  ('4.7', 1, '[Auto FPSI scan] Sem credenciais default; secrets em env.'),
  ('4.8', 3, '[Auto FPSI scan] Superfície reduzida serverless.'),
  ('5.1', 6, '[Auto FPSI scan] N/A — gestão de contas corporativa/IdP.'),
  ('5.3', 6, '[Auto FPSI scan] N/A — gestão de contas corporativa/IdP.'),
  ('5.5', 6, '[Auto FPSI scan] N/A — gestão de contas corporativa/IdP.'),
  ('5.6', 6, '[Auto FPSI scan] N/A — gestão de contas corporativa/IdP.'),
  ('5.2', 3, '[Auto FPSI scan] Senhas via Supabase Auth.'),
  ('5.4', 3, '[Auto FPSI scan] Roles admin no app.'),
  ('6.1', 6, '[Auto FPSI scan] N/A — processo corporativo de concessão.'),
  ('6.2', 6, '[Auto FPSI scan] N/A — processo corporativo de revogação.'),
  ('6.3', 5, '[Auto FPSI scan] MFA não obrigatório (gap em riscos).'),
  ('6.4', 6, '[Auto FPSI scan] N/A — VPN.'),
  ('6.5', 5, '[Auto FPSI scan] MFA admin não exigido.'),
  ('6.6', 3, '[Auto FPSI scan] Supabase Auth.'),
  ('6.7', 6, '[Auto FPSI scan] N/A — IdP central.'),
  ('6.8', 1, '[Auto FPSI scan] RBAC + RLS + APIs.'),
  ('7.1', 4, '[Auto FPSI scan] CI GitHub Actions em implantação.'),
  ('7.2', 4, '[Auto FPSI scan] Correções via npm audit/PRs.'),
  ('7.3', 6, '[Auto FPSI scan] N/A — patches SO serverless.'),
  ('7.4', 3, '[Auto FPSI scan] npm audit + CI.'),
  ('7.5', 4, '[Auto FPSI scan] Build/lint CI; SAST completo pendente.'),
  ('7.6', 5, '[Auto FPSI scan] Varredura externa não automatizada.'),
  ('7.7', 3, '[Auto FPSI scan] CVEs corrigidos ad hoc.'),
  ('8.1', 3, '[Auto FPSI scan] Logging implementado; política formal parcial.'),
  ('8.2', 1, '[Auto FPSI scan] user_activities + auditService.'),
  ('8.3', 3, '[Auto FPSI scan] Logs no PostgreSQL.'),
  ('8.4', 6, '[Auto FPSI scan] N/A — NTP infra.'),
  ('8.5', 3, '[Auto FPSI scan] Audit detalhado parcial.'),
  ('8.6', 6, '[Auto FPSI scan] N/A — logs infra corporativa.'),
  ('8.7', 6, '[Auto FPSI scan] N/A — logs infra corporativa.'),
  ('8.8', 6, '[Auto FPSI scan] N/A — logs infra corporativa.'),
  ('8.9', 3, '[Auto FPSI scan] Logs centralizados no banco.'),
  ('8.10', 3, '[Auto FPSI scan] Retenção 12-24 meses no ROPA.'),
  ('8.11', 4, '[Auto FPSI scan] Módulo auditoria; revisão manual.'),
  ('8.12', 3, '[Auto FPSI scan] Subprocessadores Supabase/Vercel.'),
  ('9.1', 6, '[Auto FPSI scan] N/A — e-mail/navegador corporativo.'),
  ('9.2', 6, '[Auto FPSI scan] N/A — e-mail/navegador corporativo.'),
  ('9.3', 6, '[Auto FPSI scan] N/A — e-mail/navegador corporativo.'),
  ('9.4', 6, '[Auto FPSI scan] N/A — e-mail/navegador corporativo.'),
  ('9.5', 6, '[Auto FPSI scan] N/A — e-mail/navegador corporativo.'),
  ('9.6', 6, '[Auto FPSI scan] N/A — e-mail/navegador corporativo.'),
  ('9.7', 6, '[Auto FPSI scan] N/A — e-mail/navegador corporativo.'),
  ('10.1', 6, '[Auto FPSI scan] N/A — antimalware endpoints.'),
  ('10.2', 6, '[Auto FPSI scan] N/A — antimalware endpoints.'),
  ('10.3', 6, '[Auto FPSI scan] N/A — antimalware endpoints.'),
  ('10.4', 6, '[Auto FPSI scan] N/A — antimalware endpoints.'),
  ('10.5', 6, '[Auto FPSI scan] N/A — antimalware endpoints.'),
  ('10.6', 6, '[Auto FPSI scan] N/A — antimalware endpoints.'),
  ('10.7', 6, '[Auto FPSI scan] N/A — antimalware endpoints.'),
  ('11.1', 3, '[Auto FPSI scan] Backup delegado Supabase.'),
  ('11.2', 3, '[Auto FPSI scan] Backups automáticos do provedor.'),
  ('11.3', 3, '[Auto FPSI scan] Proteção via cloud.'),
  ('11.4', 5, '[Auto FPSI scan] Recovery isolado não documentado.'),
  ('11.5', 5, '[Auto FPSI scan] Testes de restauração não registrados.'),
  ('12.1', 6, '[Auto FPSI scan] N/A — rede física.'),
  ('12.2', 6, '[Auto FPSI scan] N/A — rede física.'),
  ('12.3', 6, '[Auto FPSI scan] N/A — rede física.'),
  ('12.4', 6, '[Auto FPSI scan] N/A — rede física.'),
  ('12.5', 6, '[Auto FPSI scan] N/A — rede física.'),
  ('12.6', 6, '[Auto FPSI scan] N/A — rede física.'),
  ('12.7', 6, '[Auto FPSI scan] N/A — rede física.'),
  ('12.8', 6, '[Auto FPSI scan] N/A — rede física.'),
  ('13.1', 6, '[Auto FPSI scan] N/A — SOC/IDS rede.'),
  ('13.2', 6, '[Auto FPSI scan] N/A — SOC/IDS rede.'),
  ('13.3', 6, '[Auto FPSI scan] N/A — SOC/IDS rede.'),
  ('13.4', 6, '[Auto FPSI scan] N/A — SOC/IDS rede.'),
  ('13.5', 6, '[Auto FPSI scan] N/A — SOC/IDS rede.'),
  ('13.6', 6, '[Auto FPSI scan] N/A — SOC/IDS rede.'),
  ('13.7', 6, '[Auto FPSI scan] N/A — SOC/IDS rede.'),
  ('13.8', 6, '[Auto FPSI scan] N/A — SOC/IDS rede.'),
  ('13.9', 6, '[Auto FPSI scan] N/A — SOC/IDS rede.'),
  ('13.10', 6, '[Auto FPSI scan] N/A — SOC/IDS rede.'),
  ('13.11', 6, '[Auto FPSI scan] N/A — SOC/IDS rede.'),
  ('14.1', 5, '[Auto FPSI scan] Conscientização não no produto.'),
  ('14.2', 5, '[Auto FPSI scan] Conscientização não no produto.'),
  ('14.3', 5, '[Auto FPSI scan] Conscientização não no produto.'),
  ('14.4', 5, '[Auto FPSI scan] Conscientização não no produto.'),
  ('14.5', 5, '[Auto FPSI scan] Conscientização não no produto.'),
  ('14.6', 5, '[Auto FPSI scan] Conscientização não no produto.'),
  ('14.7', 5, '[Auto FPSI scan] Conscientização não no produto.'),
  ('14.8', 5, '[Auto FPSI scan] Conscientização não no produto.'),
  ('14.9', 5, '[Auto FPSI scan] Conscientização não no produto.'),
  ('15.1', 1, '[Auto FPSI scan] Subprocessadores no ROPA e package.json.'),
  ('15.2', 5, '[Auto FPSI scan] Política formal de fornecedores ausente.'),
  ('15.3', 3, '[Auto FPSI scan] Fornecedores críticos identificados.'),
  ('15.4', 3, '[Auto FPSI scan] Termos cloud; cláusulas LGPD parciais.'),
  ('15.5', 4, '[Auto FPSI scan] Avaliação ad hoc.'),
  ('15.6', 4, '[Auto FPSI scan] Monitoramento manual.'),
  ('15.7', 4, '[Auto FPSI scan] Revogação de chaves manual.'),
  ('16.1', 3, '[Auto FPSI scan] Guidelines em docs/.'),
  ('16.2', 3, '[Auto FPSI scan] Portal reportar + incidentes.'),
  ('16.3', 5, '[Auto FPSI scan] RCA formal ausente.'),
  ('16.4', 1, '[Auto FPSI scan] package-lock.json.'),
  ('16.5', 3, '[Auto FPSI scan] Deps atualizadas.'),
  ('16.6', 5, '[Auto FPSI scan] Severidade não formalizada.'),
  ('16.7', 3, '[Auto FPSI scan] Headers vercel.json + HSTS.'),
  ('16.8', 1, '[Auto FPSI scan] Separação prod/dev.'),
  ('16.9', 5, '[Auto FPSI scan] Treinamento devs não registrado.'),
  ('16.10', 3, '[Auto FPSI scan] RLS, Zod, Supabase; ropa/ripd com RLS.'),
  ('16.11', 3, '[Auto FPSI scan] Módulos auth/audit reutilizáveis.'),
  ('16.12', 4, '[Auto FPSI scan] ESLint + CI build.'),
  ('16.13', 5, '[Auto FPSI scan] Pentest não registrado.'),
  ('16.14', 4, '[Auto FPSI scan] RIPD como threat modeling parcial.'),
  ('17.1', 3, '[Auto FPSI scan] Módulo incidentes parcial.'),
  ('17.2', 3, '[Auto FPSI scan] Módulo incidentes parcial.'),
  ('17.3', 3, '[Auto FPSI scan] Módulo incidentes parcial.'),
  ('17.4', 3, '[Auto FPSI scan] Módulo incidentes parcial.'),
  ('17.5', 5, '[Auto FPSI scan] Processo IR institucional incompleto.'),
  ('17.6', 5, '[Auto FPSI scan] Processo IR institucional incompleto.'),
  ('17.7', 5, '[Auto FPSI scan] Processo IR institucional incompleto.'),
  ('17.8', 5, '[Auto FPSI scan] Processo IR institucional incompleto.'),
  ('17.9', 5, '[Auto FPSI scan] Processo IR institucional incompleto.'),
  ('18.1', 5, '[Auto FPSI scan] Pentest não formalizado.'),
  ('18.2', 5, '[Auto FPSI scan] Pentest não formalizado.'),
  ('18.3', 5, '[Auto FPSI scan] Pentest não formalizado.'),
  ('18.4', 5, '[Auto FPSI scan] Pentest não formalizado.'),
  ('18.5', 5, '[Auto FPSI scan] Pentest não formalizado.'),
  ('19.1', 1, '[Auto FPSI scan] Módulo ROPA + registro_ropa.'),
  ('19.2', 1, '[Auto FPSI scan] Fluxos em mapeamento e ROPA.'),
  ('19.3', 3, '[Auto FPSI scan] Agentes no ROPA; transferência internacional parcial.'),
  ('19.4', 1, '[Auto FPSI scan] Categorias no ROPA/mapeamento.'),
  ('20.1', 1, '[Auto FPSI scan] Módulo incidentes + reportes.'),
  ('20.2', 5, '[Auto FPSI scan] Conscientização privacidade ausente.'),
  ('20.3', 5, '[Auto FPSI scan] Capacitação não registrada.'),
  ('20.4', 3, '[Auto FPSI scan] Privacy by design parcial (RIPD, RLS).'),
  ('21.1', 1, '[Auto FPSI scan] DPO + dashboard + notificações.'),
  ('21.2', 1, '[Auto FPSI scan] Portal público contato/formulários.'),
  ('21.3', 1, '[Auto FPSI scan] pedido_titular SLA 15d.'),
  ('21.4', 1, '[Auto FPSI scan] Portal slug com dados do encarregado.'),
  ('21.5', 4, '[Auto FPSI scan] Consulta prévia ao DPO informal.'),
  ('21.6', 5, '[Auto FPSI scan] Art. 20 não implementado.'),
  ('22.1', 4, '[Auto FPSI scan] Papéis LGPD; contratos externos.'),
  ('22.2', 3, '[Auto FPSI scan] Subprocessadores listados.'),
  ('22.3', 4, '[Auto FPSI scan] Encerramento contratual manual.'),
  ('22.4', 4, '[Auto FPSI scan] Template DPA em docs.'),
  ('23.1', 1, '[Auto FPSI scan] Bases legais no ROPA.'),
  ('23.2', 1, '[Auto FPSI scan] Conformidade por operação.'),
  ('23.3', 3, '[Auto FPSI scan] RIPD módulo; cobertura parcial.'),
  ('23.4', 6, '[Auto FPSI scan] N/A — saúde pública.'),
  ('23.5', 6, '[Auto FPSI scan] N/A — crianças/adolescentes específico.'),
  ('23.6', 4, '[Auto FPSI scan] Anonimização não automatizada.'),
  ('23.7', 3, '[Auto FPSI scan] Soft delete + retenção ROPA.'),
  ('24.1', 3, '[Auto FPSI scan] Export PDF/Excel parcial.'),
  ('24.2', 3, '[Auto FPSI scan] Compartilhamentos no ROPA.'),
  ('24.3', 6, '[Auto FPSI scan] N/A — compartilhamento com PJ privada.'),
  ('24.4', 4, '[Auto FPSI scan] Comunicação a terceiros manual.'),
  ('24.5', 3, '[Auto FPSI scan] OpenAI (US) — avaliar garantias ANPD.'),
  ('25.1', 1, '[Auto FPSI scan] Finalidades no ROPA.'),
  ('25.2', 1, '[Auto FPSI scan] Compatibilidade documentada.'),
  ('25.3', 3, '[Auto FPSI scan] Minimização parcial.'),
  ('25.4', 1, '[Auto FPSI scan] Portal + protocolo DSAR.'),
  ('25.5', 3, '[Auto FPSI scan] Correção via pedidos titulares.'),
  ('25.6', 1, '[Auto FPSI scan] Política + portal.'),
  ('25.7', 3, '[Auto FPSI scan] RLS, HTTPS, auditoria; MFA pendente.'),
  ('25.8', 3, '[Auto FPSI scan] Incidentes, riscos, notificações.'),
  ('25.9', 1, '[Auto FPSI scan] Sem fins discriminatórios no produto.'),
  ('25.10', 3, '[Auto FPSI scan] Diagnóstico + auditoria.');

  UPDATE public.programa_medida pm
  SET
    resposta = d.resposta,
    justificativa = d.justificativa,
    observacao_orgao = COALESCE(pm.observacao_orgao, 'Preenchido automaticamente por scan do código-fonte FPSI (jul/2026). Revisar antes de envio oficial.')
  FROM public.medida m, _fpsi_diag d
  WHERE pm.programa = pid AND pm.medida = m.id AND m.id_medida = d.id_medida;

  -- 7. Riscos / pendências do scan
  DELETE FROM public.programa_risco WHERE programa_id = pid AND origem_tipo = 'diagnostico';

  INSERT INTO public.programa_risco (
    programa_id, titulo, descricao, categoria, origem_tipo, probabilidade, impacto,
    score_inerente, score_residual, status, estrategia_mitigacao, data_revisao
  ) VALUES
  (pid, 'MFA não obrigatório para administradores', 'Supabase Auth suporta MFA mas a aplicação não exige para contas admin.', 'seguranca', 'diagnostico', 'alto', 'alto', 16, 16, 'identificado', 'Habilitar e exigir MFA no Supabase para perfis admin e system_admin.', CURRENT_DATE + 30),
  (pid, 'Transferência internacional — OpenAI', 'Endpoint de sugestão IA pode processar metadados em servidores nos EUA.', 'privacidade', 'diagnostico', 'medio', 'alto', 12, 12, 'em_tratamento', 'Documentar no ROPA; avaliar DPA e Res. ANPD 19/2024; minimizar dados enviados.', CURRENT_DATE + 60),
  (pid, 'PGSI/PGP institucional não formalizado', 'Medidas 0.9 e 0.10 sem documento institucional equivalente.', 'conformidade', 'diagnostico', 'medio', 'medio', 9, 9, 'identificado', 'Publicar PGSI/PGP ou mapear programa FPSI como evidência parcial.', CURRENT_DATE + 90),
  (pid, 'Comitês SI/Priva e ETIR ausentes', 'Operação enxuta sem comitês formais (medidas 0.6–0.8).', 'conformidade', 'diagnostico', 'baixo', 'medio', 6, 6, 'aceito', 'Documentar aceitação de risco ou instituir comitê mínimo.', CURRENT_DATE + 90),
  (pid, 'Pentest e SAST dedicado', 'Sem pentest formal nem SAST além de lint/build CI.', 'seguranca', 'diagnostico', 'medio', 'medio', 9, 9, 'identificado', 'Agendar pentest anual e integrar CodeQL/Semgrep no CI.', CURRENT_DATE + 120);

  RAISE NOTICE 'fpsi_diag: diagnóstico e riscos aplicados para programa_id=%', pid;
END $$;
