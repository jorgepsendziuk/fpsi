-- Legaliza (slug legaliza): respostas do diagnóstico PPSI + iAIGP com base no
-- código do SIGET/site (Projetos/legaliza) e no que já está no programa FPSI
-- (portal, DPO GeoApps, ROPA/RIPD, políticas). Idempotente.
-- Escala iMC0: 1=Sim, 2=Não. iSeg/iPriv/iAIGP: 1..5 maturidade, 6=Não se aplica.

DO $$
DECLARE
  pid integer;
BEGIN
  SELECT id INTO pid FROM public.programa WHERE slug = 'legaliza' LIMIT 1;
  IF pid IS NULL THEN
    RAISE NOTICE 'legaliza_diag: programa não encontrado';
    RETURN;
  END IF;

  INSERT INTO public.programa_controle (controle, programa, nivel)
  SELECT c.id, pid, NULL FROM public.controle c
  WHERE NOT EXISTS (
    SELECT 1 FROM public.programa_controle pc
    WHERE pc.programa = pid AND pc.controle = c.id
  );

  INSERT INTO public.programa_medida (programa, medida, controle, resposta, prioridade)
  SELECT pid, m.id, m.id_controle, NULL, false
  FROM public.medida m
  WHERE NOT EXISTS (
    SELECT 1 FROM public.programa_medida pm
    WHERE pm.programa = pid AND pm.medida = m.id
  );

  -- Defaults: iMC0=Não; iSeg/iPriv=não adota; iAIGP=N/A (SIGET não opera IA)
  UPDATE public.programa_medida pm
  SET
    resposta = CASE c.diagnostico
      WHEN 1 THEN '2'
      WHEN 4 THEN '6'
      ELSE '5'
    END,
    justificativa = CASE c.diagnostico
      WHEN 1 THEN '[Scan código SIGET/site ago/2026] Não evidenciado no código nem no cadastro do programa.'
      WHEN 4 THEN '[Scan código SIGET/site ago/2026] Não se aplica: o SIGET e o site não operam sistema de IA (sem modelo, copiloto ou decisão automatizada). Embed YouTube só após consentimento, não é sistema de IA da Legaliza.'
      ELSE '[Scan código SIGET/site ago/2026] Não implementado no SIGET/site analisados; sem evidência de processo institucional no repositório.'
    END,
    observacao_orgao = 'Preenchido automaticamente pela análise do código SIGET/site Legaliza (ago/2026). Revisar antes de envio oficial.'
  FROM public.medida m
  JOIN public.controle c ON c.id = m.id_controle
  WHERE pm.programa = pid AND pm.medida = m.id;

  CREATE TEMP TABLE _legaliza_diag (id_medida text PRIMARY KEY, resposta int, justificativa text) ON COMMIT DROP;
  INSERT INTO _legaliza_diag (id_medida, resposta, justificativa) VALUES
    ('0.2', 1, 'Gestor de TIC designado no programa (consultoria/reconstrução do SIGET — Jorge Psendziuk).'),
    ('0.4', 1, 'Encarregado PJ GEOAPPS (DPO as a Service), Res. CD/ANPD 18/2024 art. 12 II; pessoa natural Jorge Psendziuk (jimxxx@gmail.com).'),
    ('0.10', 1, 'Programa de privacidade no FPSI (slug legaliza) com ROPA, RIPD, políticas do portal e canal do titular.'),
    ('0.12', 1, 'Política de Privacidade publicada no portal FPSI /legaliza/politica-de-privacidade (10 seções, modelo PPSI).'),
    ('0.16', 1, 'Este diagnóstico PPSI no FPSI é o processo de avaliação de conformidade em andamento.'),
    ('0.17', 1, 'RIPD do cadastro REURB (fotos, GPS, documentos, composição familiar) registrado no FPSI; dual controlador/operadora.'),
    ('2.1', 3, 'Inventário do SIGET via repositório (package.json/lock do web/backend e frontend). Não cobre o parque institucional inteiro.'),
    ('2.2', 3, 'Stack web Node/React/Postgres em manutenção; legado Adianti/PHP ainda coexiste (reconstrução).'),
    ('2.5', 4, 'Allowlist implícita pelo repositório Git; sem política formal de software autorizado.'),
    ('2.6', 3, 'Dependências pinadas em package-lock.json do backend/frontend.'),
    ('3.1', 3, 'Gestão de dados do SIGET: schema REURB + ROPA/mapeamento no FPSI. Sem política institucional de dados além disso.'),
    ('3.2', 3, 'Inventário no mapeamento FPSI (cadastro REURB, contas SIGET, cookies, mapa agregado) e no schema Postgres.'),
    ('3.3', 1, 'RBAC por feature (admin/reurb/…) + escopo por unidade/município/projeto (scope.service). Rotas com authenticate/requireFeature.'),
    ('3.7', 3, 'Separação prática: PII no cadastro autenticado vs mapa público só agregado por município.'),
    ('3.8', 3, 'Fluxos documentados no ROPA/mapeamento FPSI (site, SIGET, prefeitura, cartório, YouTube).'),
    ('3.10', 1, 'HTTPS no site/app; cookie de sessão httpOnly + SameSite=strict; Helmet no Express.'),
    ('3.12', 3, 'Postgres operacional vs arquivos de evidência (fotos) vs mapa público agregado.'),
    ('3.14', 1, 'system_access_log + auditoria de alterações (audit.service); admin:audit.'),
    ('4.1', 3, 'Helmet, CORS com credentials, rate-limit global e no login; CSP desligado (contentSecurityPolicy: false).'),
    ('4.6', 3, 'Código versionado em Git; dependências npm.'),
    ('4.7', 3, 'Sem senhas default na app; bcrypt (10 rounds). Ainda aceita hash MD5 legado (compat Adianti) — gap.'),
    ('4.8', 3, 'API enxuta Express; serviços desnecessários não expostos na API web, mas CSP off.'),
    ('5.1', 3, 'Contas em system_users (login, ativo Y/N, grupos, unidades).'),
    ('5.2', 3, 'Política de senha forte opcional; bcrypt; sem bloqueio de reutilização de senha.'),
    ('5.3', 3, 'Campo active; desativação manual na admin. Sem job de contas inativas.'),
    ('5.4', 3, 'Grupo Administration / user.id===1 vs features por programa. Admin não usa MFA.'),
    ('5.6', 3, 'Identidade centralizada no SIGET (system_users), não IdP corporativo.'),
    ('6.1', 3, 'Admin de usuários, papéis e system_program (features).'),
    ('6.2', 3, 'Desativação de usuário (active=N) e remoção de grupos/unidades.'),
    ('6.6', 3, 'JWT em cookie legaliza_token (httpOnly, SameSite strict, TTL 8h).'),
    ('6.7', 3, 'Autorização no próprio SIGET (grupos + programs), sem IdP.'),
    ('6.8', 1, 'RBAC por feature e filtro de dados por projeto/município (buildScopeSql).'),
    ('7.4', 4, 'Atualização de libs via npm no rebuild; sem pipeline automático de patch.'),
    ('7.7', 4, 'Correções ad hoc no rebuild; sem processo formal de vuln management.'),
    ('8.1', 3, 'Módulo de auditoria (acessos e mudanças) na administração web.'),
    ('8.2', 1, 'logAccess/logLogout no login; change log de tabelas REURB/admin (audit.service).'),
    ('8.3', 3, 'Logs no PostgreSQL do SIGET.'),
    ('8.5', 3, 'Registro de login, IP, sessão; change log omite colunas sensíveis (password/token).'),
    ('8.9', 3, 'Logs na mesma base operacional — não SIEM.'),
    ('8.10', 4, 'Sem política de retenção/expurgo de logs no código.'),
    ('8.11', 3, 'Tela admin de auditoria para consulta.'),
    ('12.6', 3, 'HTTPS e cookie Secure em produção; SSH tunnel como fallback de DB no config.'),
    ('15.1', 3, 'Operadores no ROPA FPSI: hospedagem SIGET, e-mail, YouTube, prefeituras, GeoApps DPO.'),
    ('15.3', 4, 'Categorias no ROPA (operador/controlador); sem política formal de fornecedores.'),
    ('16.1', 3, 'Rebuild TypeScript/Express/React com auth middleware; sem SDLC documentado.'),
    ('16.2', 3, 'Canal de reporte no portal FPSI /legaliza (vulnerabilidade/incidente).'),
    ('16.4', 1, 'Inventário de componentes no package.json/lock.'),
    ('16.5', 3, 'Dependências npm do rebuild; legado PHP não inventariado da mesma forma.'),
    ('16.7', 3, 'Helmet + rate-limit; CSP desabilitado.'),
    ('16.8', 3, 'Ambiente local (.env) vs produção; DB próprio (bd.minhaterralegal.com.br).'),
    ('16.10', 3, 'Auth, RBAC, escopo, TermsGate, consentimento de cookies/YouTube.'),
    ('16.11', 3, 'authenticate/requireFeature reutilizados nas rotas.'),
    ('16.12', 4, 'TypeScript no rebuild; sem SAST/CI evidenciado no repositório analisado.'),
    ('16.14', 3, 'RIPD REURB no FPSI como modelagem de ameaças parcial.'),
    ('17.2', 3, 'Contato do encarregado no portal (jimxxx@gmail.com) e SAC Legaliza.'),
    ('19.1', 1, 'ROPA no FPSI: cadastro REURB, contas SIGET, cookies, mapa, comercial.'),
    ('19.2', 1, 'Fluxos descritos no ROPA/mapeamento (campo, SIGET, prefeitura, cartório).'),
    ('19.3', 3, 'Agentes e compartilhamentos no ROPA; transferência internacional (YouTube) condicionada a consentimento.'),
    ('19.4', 1, 'Categorias de titulares e dados no mapeamento FPSI (titulares, moradores, operadores, cookies).'),
    ('20.1', 3, 'Canal de incidente no portal FPSI; sem playbook institucional no SIGET.'),
    ('20.4', 3, 'Privacy by design no rebuild: TermsGate, cookie banner, YouTube-nocookie, mapa sem PII.'),
    ('21.1', 1, 'DPO as a Service GeoApps vinculada ao login jimxxx@gmail.com no programa.'),
    ('21.2', 1, 'Portal do titular FPSI /legaliza com formulários art. 18 e e-mail do encarregado.'),
    ('21.3', 1, 'Pedidos de titulares no FPSI com protocolo; REURB municipal pode ir à prefeitura controladora.'),
    ('21.4', 1, 'Identidade PJ + pessoa natural do encarregado no portal público.'),
    ('21.5', 4, 'Consultoria DPO em curso (este programa); sem rito formal de consulta prévia documentado no SIGET.'),
    ('21.6', 6, 'SIGET não toma decisão unicamente automatizada sobre o titular (REURB é processo humano).'),
    ('22.1', 4, 'Papel dual documentado (Legaliza operadora / prefeitura controladora); contratos municipais fora do código.'),
    ('22.4', 4, 'Cláusulas LGPD não evidenciadas no repositório; a formalizar nos contratos de REURB.'),
    ('23.1', 3, 'Finalidades REURB/Lei 13.465 no ROPA e na política; Legaliza é operadora do município.'),
    ('23.2', 3, 'Bases legais na política (contrato, obrigação legal/política pública, legítimo interesse, consentimento cookies).'),
    ('23.3', 3, 'RIPD do cadastro REURB no FPSI (alto volume, geolocalização, documentos, possíveis crianças).'),
    ('23.4', 6, 'Não há tratamento de saúde pública no SIGET/site.'),
    ('23.5', 4, 'Cadastro familiar pode incluir crianças/adolescentes; sem fluxo específico no código — pendente no RIPD.'),
    ('23.6', 3, 'Mapa público apenas com agregados municipais (sem PII). Cadastro operacional identificável.'),
    ('23.7', 5, 'Sem expurgo/anonimização automática ao término; retenção descrita no ROPA como contratual/legal.'),
    ('24.1', 3, 'Interoperabilidade operacional com prefeitura/cartório via processo REURB, não API aberta.'),
    ('24.2', 3, 'Compartilhamento com municípios (controladores) previsto no ROPA.'),
    ('24.5', 3, 'YouTube (possível transferência) só após consentimento; sem outras APIs de IA/cloud US no código.'),
    ('25.1', 1, 'Finalidades explícitas na Política de Privacidade e no ROPA.'),
    ('25.2', 1, 'Adequação finalidade × tratamento descrita na política (site vs REURB vs cookies).'),
    ('25.3', 3, 'Minimização parcial: mapa público agregado; cadastro REURB ainda amplo (documentos, fotos, família).'),
    ('25.4', 1, 'Portal do titular + política + aviso do portal.'),
    ('25.5', 3, 'Correção via pedido no portal / prefeitura; edição no SIGET por perfil autorizado.'),
    ('25.6', 1, 'Política, cookies, termos e aviso publicados no portal FPSI.'),
    ('25.7', 3, 'HTTPS, httpOnly, RBAC, escopo, auditoria, aceite; MFA e crypto-at-rest não evidenciados.'),
    ('25.8', 3, 'Canal de incidente/vulnerabilidade no portal; sem IR institucional testado.'),
    ('25.9', 1, 'Tratamento para regularização fundiária, não para perfilamento discriminatório.'),
    ('25.10', 3, 'Programa FPSI (diagnóstico, ROPA, RIPD, auditoria de código) como evidência de accountability.');

  UPDATE public.programa_medida pm
  SET
    resposta = d.resposta::text,
    justificativa = '[Scan código SIGET/site ago/2026] ' || d.justificativa,
    observacao_orgao = 'Preenchido automaticamente pela análise do código SIGET/site Legaliza (ago/2026). Revisar antes de envio oficial.'
  FROM public.medida m, _legaliza_diag d
  WHERE pm.programa = pid AND pm.medida = m.id AND m.id_medida = d.id_medida;

  DELETE FROM public.programa_risco
  WHERE programa_id = pid AND origem_tipo = 'diagnostico'
    AND titulo IN (
      'MFA ausente no SIGET',
      'Hash MD5 legado ainda aceito',
      'Criptografia em repouso não evidenciada',
      'Backup e teste de restauração não evidenciados',
      'Cadastro familiar sem salvaguardas específicas para crianças'
    );

  INSERT INTO public.programa_risco (
    programa_id, titulo, descricao, categoria, origem_tipo,
    probabilidade, impacto, score_inerente, score_residual, status,
    estrategia_mitigacao, data_revisao
  ) VALUES
  (pid, 'MFA ausente no SIGET',
   'Autenticação é login/senha + JWT em cookie httpOnly. Não há MFA para usuários nem para administradores (medidas 6.3–6.5).',
   'seguranca', 'diagnostico', 'alto', 'alto', 16, 16, 'identificado',
   'Exigir MFA (TOTP/WebAuthn) ao menos para admin:access e contas privilegiadas.', CURRENT_DATE + 30),
  (pid, 'Hash MD5 legado ainda aceito',
   'verifyPassword aceita bcrypt e MD5 (compat Adianti). Contas não migradas permanecem com hash fraco.',
   'seguranca', 'diagnostico', 'alto', 'medio', 12, 12, 'em_tratamento',
   'Forçar recrypt no próximo login e desativar verificação MD5 após janela de migração.', CURRENT_DATE + 45),
  (pid, 'Criptografia em repouso não evidenciada',
   'Postgres e arquivos de fotos/evidências em servidor próprio; o código não demonstra TDE/disk encryption (medida 3.11).',
   'seguranca', 'diagnostico', 'medio', 'alto', 12, 12, 'identificado',
   'Confirmar cifrado de volume no host e backups; documentar no POSIN.', CURRENT_DATE + 60),
  (pid, 'Backup e teste de restauração não evidenciados',
   'Nenhum job de backup/restore no repositório web analisado (controle 11).',
   'seguranca', 'diagnostico', 'alto', 'alto', 16, 16, 'identificado',
   'Documentar backup do Postgres e do repositório de fotos; testar restore trimestral.', CURRENT_DATE + 30),
  (pid, 'Cadastro familiar sem salvaguardas específicas para crianças',
   'REURB coleta composição familiar (possível criança/adolescente). Medida 23.5 sem fluxo específico no SIGET.',
   'privacidade', 'diagnostico', 'medio', 'alto', 12, 12, 'identificado',
   'Minimizar dados de menores; base legal e retenção no RIPD; treinar equipe de campo.', CURRENT_DATE + 60);

  RAISE NOTICE 'legaliza_diag: respostas aplicadas no programa_id=%', pid;
END $$;
