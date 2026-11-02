#!/bin/bash

set -e

export NVM_DIR="/root/.nvm"
export PATH="$NVM_DIR/versions/node/v22.19.0/bin:$PATH"

# Prevent Node.js Out of Memory crashes on small EC2 instances (t2/t3.micro)
export NODE_OPTIONS="--max-old-space-size=2048"

APP_DIR="/root/nutri_solutions"
CLIENT_DIR="$APP_DIR/client"
SERVER_DIR="$APP_DIR/server"
WEB_DIR="/var/www/nutrisolutions"

echo "=========================================="
echo "   Nutri Solutions Deployment Started"
echo "=========================================="

# Ensure swap space exists on EC2 (prevents OOM kills when compiling frontend)
if [ -f /proc/swaps ]; then
  TOTAL_SWAP=$(free -m | awk '/^Swap:/ {print $2}')
  if [ -z "$TOTAL_SWAP" ] || [ "$TOTAL_SWAP" -lt 1024 ]; then
    echo "==> Ensuring 2GB swap space for build..."
    if [ ! -f /swapfile ]; then
      fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048
      chmod 600 /swapfile
      mkswap /swapfile
    fi
    swapon /swapfile 2>/dev/null || true
  fi
fi

echo ""
echo "==> Updating source code..."

cd "$APP_DIR"

if [ -n "$GITHUB_TOKEN" ]; then
  echo "https://x-access-token:${GITHUB_TOKEN}@github.com" > /root/.git-credentials
  git config --global credential.helper store
fi

git fetch origin main
git reset --hard origin/main

# Remove ephemeral credentials after fetch
rm -f /root/.git-credentials

echo ""
echo "==> Current commit:"
git log -1 --oneline

echo ""
echo "==> Installing frontend dependencies..."

cd "$CLIENT_DIR"
npm ci

echo ""
echo "==> Building frontend..."

npm run build

echo ""
echo "==> Deploying frontend..."

rsync -a --delete "$CLIENT_DIR/dist/" "$WEB_DIR/"

echo ""
echo "==> Installing backend dependencies..."

cd "$SERVER_DIR"
npm ci

echo ""
echo "==> Restarting backend..."

pm2 restart nutri-backend

echo ""
echo "==> PM2 status..."

pm2 status

echo ""
echo "=========================================="
echo "   Nutri Solutions Deployment Successful"
echo "=========================================="