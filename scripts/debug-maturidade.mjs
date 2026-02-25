#!/usr/bin/env node
/**
 * Consulta views de diagnóstico no Supabase e imprime no terminal (sem psql).
 *
 * Uso: node --env-file=.env.local scripts/debug-maturidade.mjs [keys]
 * ou:  npm run db:debug   (contagens)
 *      npm run db:debug -- keys   (chaves do JOIN)
 *
 * Requer no .env.local: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

const viewKeys = process.argv[2] === 'keys';
const viewName = viewKeys ? 'debug_maturidade_join_keys' : 'debug_maturidade_contagens';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    'Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (ex.: .env.local com node --env-file=.env.local)'
  );
  process.exit(1);
}

const apiUrl = `${url.replace(/\/$/, '')}/rest/v1/${viewName}?select=*`;

let res, rows;
try {
  res = await fetch(apiUrl, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
    },
  });
} catch (err) {
  console.error('Erro ao consultar Supabase:', err.message);
  if (err.cause) console.error('Causa:', err.cause.message || err.cause);
  console.error('Verifique NEXT_PUBLIC_SUPABASE_URL no .env.local (mesmo projeto em que rodou supabase db push).');
  process.exit(1);
}

if (!res.ok) {
  console.error('Erro HTTP', res.status, res.statusText);
  const text = await res.text();
  if (text) console.error(text);
  process.exit(1);
}

rows = await res.json();
console.log(viewName + ':\n');
if (rows.length === 0) {
  console.log('(nenhuma linha)');
  process.exit(0);
}

if (viewKeys) {
  const cols = ['programa_id', 'controle_id', 'diagnostico_id', 'controle_numero', 'in_controle_soma', 'in_medida_count', 'matched', 'tipo_cs_numero', 'tipo_mc_numero'];
  const sep = '  ';
  console.log(cols.join(sep));
  console.log('-'.repeat(80));
  for (const r of rows) {
    console.log(cols.map((c) => String(r[c] ?? '')).join(sep));
  }
  const matched = rows.filter((r) => r.matched).length;
  console.log('\nResumo: total linhas =', rows.length, ', matched =', matched);
} else {
  const maxPasso = Math.max(...rows.map((r) => String(r.passo ?? '').length));
  const maxTotal = Math.max(...rows.map((r) => String(r.total ?? '').length));
  const fmt = (s, n) => String(s ?? '').padEnd(n);
  console.log(fmt('passo', maxPasso), '  ', fmt('total', maxTotal));
  console.log('-'.repeat(maxPasso + 2 + maxTotal));
  for (const r of rows) {
    console.log(fmt(r.passo, maxPasso), '  ', fmt(r.total, maxTotal));
  }
}
console.log('');
process.exit(0);
