# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:20-bookworm AS builder

WORKDIR /app

# Build tools required by better-sqlite3 (node-gyp needs python3/make/g++)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# Placeholder so lib/db/index.ts doesn't fail during static analysis at build time
ENV DB_PATH=/tmp/build-placeholder.db

RUN npm run build

# ─── Stage 2: Runner ──────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ca-certificates \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Standalone Next.js output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Full node_modules from builder preserves compiled better-sqlite3 native binding
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Drizzle migration files needed by drizzle-kit push at startup
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/lib/db ./lib/db

COPY --chown=nextjs:nodejs start.sh ./start.sh
RUN chmod +x ./start.sh

RUN mkdir -p /data && chown nextjs:nodejs /data

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./start.sh"]
