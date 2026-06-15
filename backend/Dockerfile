# Build stage
FROM node:22-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

# Production stage
FROM node:22-slim

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY prisma ./prisma/
COPY src ./src/

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "src/server.js"]