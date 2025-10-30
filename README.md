# Pumpp Web (Prod Guide)

## Environment
Wajib set via secret manager/env hosting (jangan commit file env):
- `MONGODB_URI`
- `MONGODB_DB`
- `SOLANA_RPC_URL` (contoh: https://api.mainnet-beta.solana.com atau Helius)
- `SOLANA_SIGNER_SECRET` (format: angka-angka Uint8Array, contoh: `12,34,56,...`)
- `ADMIN_TOKEN`
- `ADMIN_JWT_SECRET`
- (opsional) `SOLANA_RPC_URL`, `BNB_RPC_URL`, `SENTRY_DSN`

## Menjalankan lokal
```bash
npm ci --include=dev
npm run dev
```

## Build produksi
```bash
npm run build
npm start -p 3000
```

## Init Indexes (sekali)
```bash
curl -X POST \
  -H "x-admin-token: <ADMIN_TOKEN>" \
  https://<host>/api/admin/init-indexes
```

## Keamanan
- Simpan rahasia di Secret Manager (GCP) / Secrets (GitHub) / env hosting.
- Ganti `ADMIN_TOKEN` dan `ADMIN_JWT_SECRET` di produksi.
- CSP ketat sudah di `middleware.ts`. Sesuaikan jika menambah provider script/gambar.

## Deploy Cloud Run (contoh)
- Build & push image ke Artifact Registry: `gcloud builds submit --tag gcr.io/PROJECT_ID/pumpp-web:latest`.
- Deploy: `gcloud run services replace cloudrun.yaml` (set `PROJECT_ID`).
- Set secrets: `mongodb-uri`, `admin-token`, `admin-jwt-secret`.

## Worker Launch (Cloud Scheduler)
- Buat Cloud Scheduler (setiap 1 menit) yang melakukan HTTP POST ke:
  `https://<host>/api/launch/process` dengan header `x-admin-token: <ADMIN_TOKEN>`
- Pastikan service memiliki akses ke secret/env yang sama.
