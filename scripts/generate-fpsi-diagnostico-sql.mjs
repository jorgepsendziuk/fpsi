/**
 * Gera INSERTs SQL para respostas do diagnóstico FPSI (scan de código jul/2026).
 * Uso: node scripts/generate-fpsi-diagnostico-sql.mjs
 */
const measures = [];

function add(id, resposta, just) {
  measures.push({ id, resposta, just: `[Auto FPSI scan] ${just}` });
}

// Diagnóstico 1 — Controle 0 (Sim=1, Não=2)
add("0.1", 1, "Representante da alta administração vinculado no programa.");
add("0.2", 1, "Gestor de TIC designado.");
add("0.3", 1, "Gestor de SI designado.");
add("0.4", 1, "Encarregado (DPO) designado.");
add("0.5", 1, "Responsável pela gestão da integridade designado.");
add("0.6", 2, "Comitê de SI não instituido (operação enxuta).");
add("0.7", 2, "Comitê de proteção de dados não instituido formalmente.");
add("0.8", 2, "ETIR não instituida; incidentes via módulo FPSI.");
add("0.9", 2, "PGSI documental institucional não formalizado.");
add("0.10", 2, "PGP formal não publicado como documento institucional.");
add("0.11", 1, "POSIN no módulo Políticas (politica_seguranca_informacao).");
add("0.12", 1, "Política de proteção de dados no programa.");
add("0.13", 2, "Módulo programa_risco existe; processo IN GSI/PR Cap. III não formalizado.");
add("0.14", 2, "Sem processo/módulo de continuidade de negócios SI.");
add("0.15", 2, "Gestão de mudanças via Git sem processo institucional formal.");
add("0.16", 2, "Diagnóstico e auditoria no app; plano formal de verificação ausente.");
add("0.17", 2, "Riscos de privacidade parciais (programa_risco + RIPD); processo documentado incompleto.");

// Controle 1
for (let i = 1; i <= 5; i++) {
  add(`1.${i}`, 6, "N/A escopo software SaaS — ativos de rede/dispositivos são da infraestrutura.");
}

// Controle 2
add("2.1", 1, "Inventário via package.json e package-lock.json.");
add("2.2", 3, "Dependências mantidas; sem política automatizada de EOL.");
add("2.3", 3, "Controle via lockfile; sem bloqueio de pacotes não autorizados.");
add("2.4", 4, "CI com npm audit; SBOM não automatizado.");
add("2.5", 3, "Lista implícita via package.json.");
add("2.6", 3, "Imports via npm; sem allowlist formal.");
add("2.7", 3, "Scripts versionados; sem assinatura digital.");

// Controle 3
add("3.1", 3, "ROPA/mapeamento; documento formal de gestão de dados ausente.");
add("3.2", 1, "Inventário via mapeamento_dados, ROPA e migrations SQL.");
add("3.3", 1, "RLS Supabase + RBAC programa_users + guards em APIs.");
add("3.4", 3, "Retenção no ROPA; purge automático parcial.");
add("3.5", 3, "Soft delete; exclusão titular via DSAR.");
add("3.6", 6, "N/A — sem dados em dispositivos endpoint.");
add("3.7", 3, "Categorias no mapeamento/ROPA.");
add("3.8", 1, "Fluxos em mapeamento_dados e ROPA.");
add("3.9", 6, "N/A — mídia removível.");
add("3.10", 1, "HTTPS/TLS em produção (Vercel) + HSTS.");
add("3.11", 1, "Criptografia em repouso via Supabase/PostgreSQL.");
add("3.12", 3, "Segregação multi-inquilino por programa_id.");
add("3.13", 6, "N/A — DLP corporativo.");
add("3.14", 1, "user_activities + módulo Auditoria.");

// Controle 4
add("4.1", 3, "Hardening parcial (headers, Supabase).");
add("4.2", 6, "N/A — rede física/virtual.");
for (const i of [3, 4, 5, 9, 10, 11, 12]) add(`4.${i}`, 6, "N/A — configuração SO/rede/dispositivos.");
add("4.6", 3, "Patches via npm.");
add("4.7", 1, "Sem credenciais default; secrets em env.");
add("4.8", 3, "Superfície reduzida serverless.");

// Controle 5
for (const i of [1, 3, 5, 6]) add(`5.${i}`, 6, "N/A — gestão de contas corporativa/IdP.");
add("5.2", 3, "Senhas via Supabase Auth.");
add("5.4", 3, "Roles admin no app.");

// Controle 6
add("6.1", 6, "N/A — processo corporativo de concessão.");
add("6.2", 6, "N/A — processo corporativo de revogação.");
add("6.3", 5, "MFA não obrigatório (gap em riscos).");
add("6.4", 6, "N/A — VPN.");
add("6.5", 5, "MFA admin não exigido.");
add("6.6", 3, "Supabase Auth.");
add("6.7", 6, "N/A — IdP central.");
add("6.8", 1, "RBAC + RLS + APIs.");

// Controle 7
add("7.1", 4, "CI GitHub Actions em implantação.");
add("7.2", 4, "Correções via npm audit/PRs.");
add("7.3", 6, "N/A — patches SO serverless.");
add("7.4", 3, "npm audit + CI.");
add("7.5", 4, "Build/lint CI; SAST completo pendente.");
add("7.6", 5, "Varredura externa não automatizada.");
add("7.7", 3, "CVEs corrigidos ad hoc.");

// Controle 8
add("8.1", 3, "Logging implementado; política formal parcial.");
add("8.2", 1, "user_activities + auditService.");
add("8.3", 3, "Logs no PostgreSQL.");
add("8.4", 6, "N/A — NTP infra.");
add("8.5", 3, "Audit detalhado parcial.");
for (const i of [6, 7, 8]) add(`8.${i}`, 6, "N/A — logs infra corporativa.");
add("8.9", 3, "Logs centralizados no banco.");
add("8.10", 3, "Retenção 12-24 meses no ROPA.");
add("8.11", 4, "Módulo auditoria; revisão manual.");
add("8.12", 3, "Subprocessadores Supabase/Vercel.");

// 9-14
for (let i = 1; i <= 7; i++) add(`9.${i}`, 6, "N/A — e-mail/navegador corporativo.");
for (let i = 1; i <= 7; i++) add(`10.${i}`, 6, "N/A — antimalware endpoints.");
add("11.1", 3, "Backup delegado Supabase.");
add("11.2", 3, "Backups automáticos do provedor.");
add("11.3", 3, "Proteção via cloud.");
add("11.4", 5, "Recovery isolado não documentado.");
add("11.5", 5, "Testes de restauração não registrados.");
for (let i = 1; i <= 8; i++) add(`12.${i}`, 6, "N/A — rede física.");
for (let i = 1; i <= 11; i++) add(`13.${i}`, 6, "N/A — SOC/IDS rede.");
for (let i = 1; i <= 9; i++) add(`14.${i}`, 5, "Conscientização não no produto.");

// 15
add("15.1", 1, "Subprocessadores no ROPA e package.json.");
add("15.2", 5, "Política formal de fornecedores ausente.");
add("15.3", 3, "Fornecedores críticos identificados.");
add("15.4", 3, "Termos cloud; cláusulas LGPD parciais.");
add("15.5", 4, "Avaliação ad hoc.");
add("15.6", 4, "Monitoramento manual.");
add("15.7", 4, "Revogação de chaves manual.");

// 16
add("16.1", 3, "Guidelines em docs/.");
add("16.2", 3, "Portal reportar + incidentes.");
add("16.3", 5, "RCA formal ausente.");
add("16.4", 1, "package-lock.json.");
add("16.5", 3, "Deps atualizadas.");
add("16.6", 5, "Severidade não formalizada.");
add("16.7", 3, "Headers vercel.json + HSTS.");
add("16.8", 1, "Separação prod/dev.");
add("16.9", 5, "Treinamento devs não registrado.");
add("16.10", 3, "RLS, Zod, Supabase; ropa/ripd com RLS.");
add("16.11", 3, "Módulos auth/audit reutilizáveis.");
add("16.12", 4, "ESLint + CI build.");
add("16.13", 5, "Pentest não registrado.");
add("16.14", 4, "RIPD como threat modeling parcial.");

// 17-18
for (let i = 1; i <= 9; i++) {
  add(`17.${i}`, i <= 4 ? 3 : 5, i <= 4 ? "Módulo incidentes parcial." : "Processo IR institucional incompleto.");
}
for (let i = 1; i <= 5; i++) add(`18.${i}`, 5, "Pentest não formalizado.");

// 19-25
add("19.1", 1, "Módulo ROPA + registro_ropa.");
add("19.2", 1, "Fluxos em mapeamento e ROPA.");
add("19.3", 3, "Agentes no ROPA; transferência internacional parcial.");
add("19.4", 1, "Categorias no ROPA/mapeamento.");
add("20.1", 1, "Módulo incidentes + reportes.");
add("20.2", 5, "Conscientização privacidade ausente.");
add("20.3", 5, "Capacitação não registrada.");
add("20.4", 3, "Privacy by design parcial (RIPD, RLS).");
add("21.1", 1, "DPO + dashboard + notificações.");
add("21.2", 1, "Portal público contato/formulários.");
add("21.3", 1, "pedido_titular SLA 15d.");
add("21.4", 1, "Portal slug com dados do encarregado.");
add("21.5", 4, "Consulta prévia ao DPO informal.");
add("21.6", 5, "Art. 20 não implementado.");
add("22.1", 4, "Papéis LGPD; contratos externos.");
add("22.2", 3, "Subprocessadores listados.");
add("22.3", 4, "Encerramento contratual manual.");
add("22.4", 4, "Template DPA em docs.");
add("23.1", 1, "Bases legais no ROPA.");
add("23.2", 1, "Conformidade por operação.");
add("23.3", 3, "RIPD módulo; cobertura parcial.");
add("23.4", 6, "N/A — saúde pública.");
add("23.5", 6, "N/A — crianças/adolescentes específico.");
add("23.6", 4, "Anonimização não automatizada.");
add("23.7", 3, "Soft delete + retenção ROPA.");
add("24.1", 3, "Export PDF/Excel parcial.");
add("24.2", 3, "Compartilhamentos no ROPA.");
add("24.3", 6, "N/A — compartilhamento com PJ privada.");
add("24.4", 4, "Comunicação a terceiros manual.");
add("24.5", 3, "OpenAI (US) — avaliar garantias ANPD.");
add("25.1", 1, "Finalidades no ROPA.");
add("25.2", 1, "Compatibilidade documentada.");
add("25.3", 3, "Minimização parcial.");
add("25.4", 1, "Portal + protocolo DSAR.");
add("25.5", 3, "Correção via pedidos titulares.");
add("25.6", 1, "Política + portal.");
add("25.7", 3, "RLS, HTTPS, auditoria; MFA pendente.");
add("25.8", 3, "Incidentes, riscos, notificações.");
add("25.9", 1, "Sem fins discriminatórios no produto.");
add("25.10", 3, "Diagnóstico + auditoria.");

function esc(s) {
  return s.replace(/'/g, "''");
}

console.log(`-- ${measures.length} medidas`);
for (const m of measures) {
  console.log(`  ('${m.id}', ${m.resposta}, '${esc(m.just)}'),`);
}
