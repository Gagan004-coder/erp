# Multi-stage Dockerfile for Backend (Node.js + Express + Prisma)
FROM node:18-alpine AS builder

WORKDIR /app

# Install OpenSSL and build utilities for Alpine Linux
RUN apk add --no-cache openssl ca-certificates

# Copy dependency definitions
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript and generate Prisma Client
RUN npm run build

# Production Stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install OpenSSL in runner stage for Prisma Query Engine
RUN apk add --no-cache openssl ca-certificates

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma/

# Copy compiled files and complete node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push && npm run db:seed && npm start"]
