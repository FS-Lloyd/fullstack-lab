# syntax=docker/dockerfile:1

# ---- Stage 1: builder — full devDependencies + TS source, compiles to dist/ ----
FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Stage 2: production — prod deps only + compiled JS, nothing else survives ----
FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node .env.shared .env.production ./

USER node
EXPOSE 3000
CMD ["sh", "-c", "npm run migration:run:prod && node dist/main"]