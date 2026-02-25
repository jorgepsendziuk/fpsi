#!/usr/bin/env bash
# Dump do banco Supabase (projeto linkado).
# Requer: Docker Desktop rodando + projeto linkado (supabase link).
set -e
cd "$(dirname "$0")/.."
OUTPUT="database/supabase_dump_$(date +%Y%m%d_%H%M).sql"
echo "Gerando dump em $OUTPUT ..."
supabase db dump -f "$OUTPUT"
echo "Dump salvo: $OUTPUT"
