-- Remove prefixo "Demo FPSI —" dos nomes de responsáveis (UI mais limpa; seeds legados).
UPDATE public.responsavel
SET nome = trim(regexp_replace(nome, '^Demo FPSI\s*[—–-]\s*', '', 'i'))
WHERE nome ~* '^Demo FPSI\s*[—–-]';
