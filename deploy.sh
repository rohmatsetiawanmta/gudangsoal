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
#
# Server config dibaca dari deploy.env (gitignored) — lihat deploy.env.example

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/deploy.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "✗ $ENV_FILE tidak ditemukan. Copy deploy.env.example ke deploy.env dan isi dengan nilai asli." >&2
  exit 1
fi
source "$ENV_FILE"

SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=no -o BatchMode=yes"

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
  scp $SSH_OPTS -P $SSH_PORT dist/index.html                     $SSH_USER@$SSH_HOST:$REMOTE_DIR/index.html
  rsync -az -e "ssh -p $SSH_PORT $SSH_OPTS" dist/assets/         $SSH_USER@$SSH_HOST:$REMOTE_DIR/assets/
  scp $SSH_OPTS -P $SSH_PORT dist/robots.txt                     $SSH_USER@$SSH_HOST:$REMOTE_DIR/robots.txt
  scp $SSH_OPTS -P $SSH_PORT dist/.htaccess                      $SSH_USER@$SSH_HOST:$REMOTE_DIR/.htaccess
  scp $SSH_OPTS -P $SSH_PORT sitemap.php                         $SSH_USER@$SSH_HOST:$REMOTE_DIR/sitemap.php
  scp $SSH_OPTS -P $SSH_PORT render.php                          $SSH_USER@$SSH_HOST:$REMOTE_DIR/render.php
  echo "→ Fixing permissions..."
  ssh $SSH_OPTS -p $SSH_PORT $SSH_USER@$SSH_HOST "chmod 644 $REMOTE_DIR/index.html $REMOTE_DIR/robots.txt $REMOTE_DIR/.htaccess $REMOTE_DIR/sitemap.php $REMOTE_DIR/render.php && find $REMOTE_DIR/assets -type f -exec chmod 644 {} + && find $REMOTE_DIR/assets -type d -exec chmod 755 {} +"
  echo "✓ Frontend selesai!"
fi

if $DEPLOY_API; then
  echo "→ Uploading API..."
  rsync -az --progress -e "ssh -p $SSH_PORT $SSH_OPTS" \
    --exclude 'vendor/' \
    --exclude '.env' \
    --exclude '*.sql' \
    api/ $SSH_USER@$SSH_HOST:$REMOTE_DIR/api/
  echo "→ Fixing permissions..."
  ssh $SSH_OPTS -p $SSH_PORT $SSH_USER@$SSH_HOST "find $REMOTE_DIR/api -type f -exec chmod 644 {} + && find $REMOTE_DIR/api -type d -exec chmod 755 {} +"
  echo "✓ API selesai! (vendor/, .env, *.sql dilewati)"
fi

echo "✓ Deploy selesai!"
