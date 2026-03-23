#!/bin/sh
set -e

echo "[start.sh] Sahha startup sequence"

if [ -z "$DB_PATH" ]; then
  echo "[start.sh] ERROR: DB_PATH env var is not set." >&2
  exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "[start.sh] ERROR: NEXTAUTH_SECRET env var is not set." >&2
  exit 1
fi

echo "[start.sh] DB_PATH=$DB_PATH"
echo "[start.sh] Running database migrations..."
npx drizzle-kit push --config=drizzle.config.ts

echo "[start.sh] Migrations complete. Starting Next.js..."
exec node server.js
