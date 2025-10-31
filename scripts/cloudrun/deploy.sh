#!/usr/bin/env bash
set -euo pipefail

# Usage: PROJECT_ID=your-project REGION=asia-southeast1 ./scripts/cloudrun/deploy.sh
: "${PROJECT_ID:?set PROJECT_ID}"
REGION="${REGION:-asia-southeast1}"
IMAGE="gcr.io/${PROJECT_ID}/pumpp-worker:latest"
SERVICE="pumpp-worker"

# Build & push
gcloud builds submit --tag "$IMAGE" .

# Deploy
gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars MONGODB_URI="${MONGODB_URI:-}" \
  --set-env-vars MONGODB_DB="${MONGODB_DB:-pump}" \
  --set-env-vars ADMIN_TOKEN="${ADMIN_TOKEN:-}" \
  --set-env-vars ADMIN_JWT_SECRET="${ADMIN_JWT_SECRET:-}" \
  --set-env-vars SOLANA_RPC_URL="${SOLANA_RPC_URL:-}" \
  --set-env-vars SOLANA_SIGNER_SECRET="${SOLANA_SIGNER_SECRET:-}" \
  --set-env-vars IMG_PROXY_WHITELIST="${IMG_PROXY_WHITELIST:-i.imgur.com,images.unsplash.com,cdn.jsdelivr.net}"

URL=$(gcloud run services describe "$SERVICE" --region "$REGION" --platform managed --format='value(status.url)')
echo "Cloud Run URL: $URL"
