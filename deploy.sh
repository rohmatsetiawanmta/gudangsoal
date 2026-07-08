#!/bin/bash
# deploy.sh — build & upload ke Hostinger
#
# Usage:
#   ./deploy.sh              → frontend only
#   ./deploy.sh --api        → frontend + api
#   ./deploy.sh --api-only   → api only (tanpa build)
#   ./deploy.sh --all        → frontend + api
#
# API excludes: vendor/, .env, *.sql
# SMTP_PASS dibaca dari .env (tidak ikut ter-upload)

SSH_USER="u848421989"
SSH_HOST="46.202.186.157"
SSH_PORT="65002"
REMOTE_DIR="/home/u848421989/domains/gudangsoal.com/public_html"

DEPLOY_FRONTEND=true
DEPLOY_API=false

for arg in "$@"; do
  case $arg in
    --api)      DEPLOY_API=true ;;
    --all)      DEPLOY_API=true ;;
    --api-only) DEPLOY_FRONTEND=false; DEPLOY_API=true ;;
  esac
done

set -e

if $DEPLOY_FRONTEND; then
  echo "→ Building frontend..."
  npm run build

  echo "→ Uploading frontend..."
  scp -P $SSH_PORT dist/index.html                     $SSH_USER@$SSH_HOST:$REMOTE_DIR/index.html
  scp -P $SSH_PORT dist/assets/index-*.js              $SSH_USER@$SSH_HOST:$REMOTE_DIR/assets/
  scp -P $SSH_PORT dist/assets/index-*.css             $SSH_USER@$SSH_HOST:$REMOTE_DIR/assets/
  echo "✓ Frontend selesai!"
fi

if $DEPLOY_API; then
  echo "→ Uploading API..."
  rsync -az --progress -e "ssh -p $SSH_PORT" \
    --exclude 'vendor/' \
    --exclude '.env' \
    --exclude '*.sql' \
    api/ $SSH_USER@$SSH_HOST:$REMOTE_DIR/api/
  echo "✓ API selesai! (vendor/, .env, *.sql dilewati)"
fi

echo "✓ Deploy selesai!"
