#!/usr/bin/env bash
# Publica FPSI no Cloud Run (projeto Legaliza). Banco: Supabase (não Cloud SQL).
set -euo pipefail

PROJECT="${PROJECT:-gentle-habitat-247019}"
REGION="${REGION:-southamerica-east1}"
SERVICE="${SERVICE:-fpsi}"
AR_REPO="${AR_REPO:-fpsi}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT/.env.local}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERRO: $ENV_FILE não encontrado (NEXT_PUBLIC_* e SUPABASE_SERVICE_ROLE_KEY)."
  exit 1
fi

set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

upsert_secret() {
  local name=$1 value=$2
  if [[ -z "${value// }" ]]; then
    echo "ERRO: secret $name vazio."
    exit 1
  fi
  if gcloud secrets describe "$name" --project="$PROJECT" &>/dev/null; then
    printf '%s' "$value" | gcloud secrets versions add "$name" --data-file=- --project="$PROJECT" --quiet
  else
    printf '%s' "$value" | gcloud secrets create "$name" --data-file=- --project="$PROJECT" --replication-policy=automatic --quiet
  fi
}

echo "==> Projeto $PROJECT ($REGION) serviço $SERVICE"
gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
  cloudbuild.googleapis.com secretmanager.googleapis.com --project="$PROJECT" --quiet || true

upsert_secret fpsi-next-public-supabase-url "${NEXT_PUBLIC_SUPABASE_URL}"
upsert_secret fpsi-next-public-supabase-anon-key "${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
upsert_secret fpsi-next-public-app-url "${NEXT_PUBLIC_APP_URL:-https://www.fpsi.com.br}"
upsert_secret fpsi-supabase-service-role-key "${SUPABASE_SERVICE_ROLE_KEY}"
if [[ -n "${OPENAI_API_KEY:-}" ]]; then
  upsert_secret fpsi-openai-api-key "${OPENAI_API_KEY}"
fi

PROJECT_NUMBER="$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')"
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
RUN_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for name in fpsi-next-public-supabase-url fpsi-next-public-supabase-anon-key fpsi-next-public-app-url \
  fpsi-supabase-service-role-key fpsi-openai-api-key; do
  if gcloud secrets describe "$name" --project="$PROJECT" &>/dev/null; then
    gcloud secrets add-iam-policy-binding "$name" --project="$PROJECT" \
      --member="serviceAccount:${CB_SA}" --role="roles/secretmanager.secretAccessor" --quiet &>/dev/null || true
    gcloud secrets add-iam-policy-binding "$name" --project="$PROJECT" \
      --member="serviceAccount:${RUN_SA}" --role="roles/secretmanager.secretAccessor" --quiet &>/dev/null || true
  fi
done

if ! gcloud artifacts repositories describe "$AR_REPO" --location="$REGION" --project="$PROJECT" &>/dev/null; then
  gcloud artifacts repositories create "$AR_REPO" \
    --repository-format=docker --location="$REGION" --project="$PROJECT" --quiet
fi

echo "==> Cloud Build (imagem Next.js + Supabase embutido no build)"
gcloud builds submit "$ROOT" \
  --project="$PROJECT" \
  --config="$ROOT/deploy/gcp/cloudbuild.yaml" \
  --substitutions="_REGION=$REGION,_AR_REPO=$AR_REPO,_SERVICE=$SERVICE"

IMAGE="${REGION}-docker.pkg.dev/${PROJECT}/${AR_REPO}/${SERVICE}:latest"
SECRET_FLAGS=(
  "SUPABASE_SERVICE_ROLE_KEY=fpsi-supabase-service-role-key:latest"
)
if gcloud secrets describe fpsi-openai-api-key --project="$PROJECT" &>/dev/null; then
  SECRET_FLAGS+=("OPENAI_API_KEY=fpsi-openai-api-key:latest")
fi

echo "==> Cloud Run deploy (min-instances=0)"
gcloud run deploy "$SERVICE" \
  --project="$PROJECT" \
  --image="$IMAGE" \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --min-instances=0 \
  --max-instances=10 \
  --cpu=1 \
  --memory=1Gi \
  --cpu-boost \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="$(IFS=,; echo "${SECRET_FLAGS[*]}")" \
  --quiet

URL="$(gcloud run services describe "$SERVICE" --project="$PROJECT" --region="$REGION" --format='value(status.url)')"
echo ""
echo "Projeto: $PROJECT"
echo "Serviço: $SERVICE"
echo "URL: $URL"