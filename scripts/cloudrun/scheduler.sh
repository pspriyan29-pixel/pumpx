#!/usr/bin/env bash
set -euo pipefail

# Usage: REGION=asia-southeast1 URL=https://... TOKEN=adm_xxx ./scripts/cloudrun/scheduler.sh
REGION="${REGION:-asia-southeast1}"
: "${URL:?set URL to your Cloud Run URL}"
: "${TOKEN:?set TOKEN to your ADMIN_TOKEN}"

JOB="process-launch"

# Create or update Scheduler job
gcloud scheduler jobs delete "$JOB" --location="$REGION" --quiet || true

gcloud scheduler jobs create http "$JOB" \
  --schedule="* * * * *" \
  --location="$REGION" \
  --uri="$URL/api/launch/process" \
  --http-method=POST \
  --headers="x-admin-token: $TOKEN" \
  --time-zone="Asia/Jakarta"

echo "Scheduler job '$JOB' created targeting $URL/api/launch/process"
