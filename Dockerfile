# Unified Full-Stack Dockerfile (Frontend React + Backend Express + Prisma)

# Stage 1: Build Frontend React Assets
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend Node/TypeScript API
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
RUN apk add --no-cache openssl ca-certificates
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm ci
COPY backend/ ./
RUN npm run build

# Stage 3: Production Runner
FROM node:18-alpine AS runner
WORKDIR /app/backend
RUN apk add --no-cache openssl ca-certificates

ENV NODE_ENV=production

COPY backend/package*.json ./
COPY backend/prisma ./prisma/
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push && npm run db:seed && npm start"]
