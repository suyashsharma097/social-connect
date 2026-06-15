# =========================
# Build Stage
# =========================
FROM node:22-slim AS builder

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma/

# Force clean Prisma generation
RUN rm -rf node_modules/.prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

# Debug: show generated Prisma engine
RUN ls -la node_modules/.prisma/client

# =========================
# Production Stage
# =========================
FROM node:22-slim

WORKDIR /usr/src/app

# Copy dependencies from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy application files
COPY package*.json ./
COPY prisma ./prisma/
COPY src ./src/

ENV NODE_ENV=production
ENV FORCE_REBUILD=2
ENV PORT=5000

EXPOSE 5000

CMD ["node", "src/server.js"]