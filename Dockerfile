# Estágio 1: Builder
FROM node:20-slim AS builder

WORKDIR /app

# Em imagens Debian/slim, usamos apt-get em vez de apk
RUN apt-get update && apt-get install -y git python3 make g++ && rm -rf /var/lib/apt/lists/*

# Instala o pnpm
RUN npm install -g pnpm@9.15.0

# Copia os manifestos
COPY package.json pnpm-lock.yaml* ./

# Instala as dependências
RUN pnpm install --no-frozen-lockfile

# Copia o resto e compila
COPY . .
RUN pnpm build

# Estágio 2: Runner (Produção)
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Instala o pnpm para rodar o projeto
RUN npm install -g pnpm@9.15.0

# Copia os arquivos do builder
COPY --from=builder /app ./

EXPOSE 3000

CMD ["pnpm", "start"]
