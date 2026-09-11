#!/usr/bin/env bash
# ==============================================================================
# OrchestreeAI Admin Dashboard - Manual / Scripted GKE Deployment
# ==============================================================================
set -euo pipefail

echo ">>> Memulai deployment OrchestreeAI Admin Dashboard ke GKE <<<"

# 1. Resolusi eksplisit GCP PROJECT_ID
PROJECT_ID="${PROJECT_ID:-}"
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "PROJECT_ID" ]; then
  PROJECT_ID=$(gcloud config get-value project 2>/dev/null || true)
fi
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "PROJECT_ID" ]; then
  PROJECT_ID="orchestree-ai"
fi

# 2. Validasi ketat: gagalkan proses jika PROJECT_ID kosong atau masih literal placeholder
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "PROJECT_ID" ]; then
  echo "❌ ERROR: PROJECT_ID kosong atau bernilai literal 'PROJECT_ID'!" >&2
  echo "Pastikan gcloud sudah login dan project aktif dipilih (gcloud config set project orchestree-ai)." >&2
  exit 1
fi

echo "✅ Menggunakan GCP PROJECT_ID: $PROJECT_ID"

# 3. Parameter Deployment
NAMESPACE="${NAMESPACE:-orchestreeai-admin}"
TAG="${IMAGE_TAG:-$(git rev-parse --short HEAD 2>/dev/null || echo 'latest')}"
IMAGE_URL="asia-southeast2-docker.pkg.dev/${PROJECT_ID}/orchestreeai-images/admin-dashboard:${TAG}"

SUPABASE_ANON_KEY="${VITE_SUPABASE_ANON_KEY:-}"
SUPABASE_URL="${VITE_SUPABASE_URL:-https://exfvfyiwftywqjcsofgf.supabase.co}"
BACKEND_API_URL="${VITE_BACKEND_API_URL:-https://api.orchestree.biz.id/api/v1}"

echo ">>> Building dan Pushing container image: ${IMAGE_URL} <<<"
gcloud builds submit --tag "${IMAGE_URL}" \
  --build-arg "VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}" \
  --build-arg "VITE_SUPABASE_URL=${SUPABASE_URL}" \
  --build-arg "VITE_BACKEND_API_URL=${BACKEND_API_URL}" \
  --build-arg "NEXT_PUBLIC_BACKEND_API_URL=${BACKEND_API_URL}" \
  .

echo ">>> Menerapkan image baru ke Deployment admin-dashboard di namespace ${NAMESPACE} <<<"
kubectl set image deployment/admin-dashboard \
  admin-dashboard="${IMAGE_URL}" \
  -n "${NAMESPACE}"

echo ">>> Menunggu rollout status selesai <<<"
kubectl rollout status deployment/admin-dashboard -n "${NAMESPACE}" --timeout=180s

echo "✅ Rollout selesai dengan sukses!"
