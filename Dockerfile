# --- Base image with pnpm ---
FROM node:22-alpine AS base
RUN npm install -g pnpm

# --- Dependencies stage ---
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Build stage ---
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# --- Production dependencies stage ---
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# --- Development stage (hot reload) ---
FROM base AS dev
WORKDIR /app
# We don't COPY here as we use bind mount in compose.dev.yml
# But we need node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY . .
USER node
CMD ["pnpm", "run", "start:dev"]

# --- Production stage (minimal alpine) ---
FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
USER node
CMD ["node", "dist/main.js"]

# --- Production stage (distroless) ---
FROM gcr.io/distroless/nodejs22-debian12 AS prod-distroless
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist/src ./src
COPY package.json ./
USER nonroot
CMD ["src/main.js"]
