FROM node:20-alpine AS builder

WORKDIR /app

# Dependências básicas que às vezes são necessárias (git + build tools)
RUN apk add --no-cache git python3 make g++

# Ativa pnpm via Corepack (mais confiável que npm i -g)
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copia manifests primeiro (melhor cache)
COPY package.json ./
COPY pnpm-lock.yaml* ./

# Instala deps (sem travar por lockfile ausente)
RUN pnpm install --no-frozen-lockfile

# Copia o resto e builda
COPY . .
RUN pnpm build


FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY --from=builder /app ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["pnpm", "start"]
