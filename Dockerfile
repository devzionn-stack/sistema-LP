# Estágio 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Dependências básicas para compilação de pacotes nativos
RUN apk add --no-cache git python3 make g++

# Instala o pnpm globalmente via npm (Evita o erro 254 no Alpine)
RUN npm install -g pnpm@9.15.0

# Copia os manifestos primeiro (Otimiza o cache do Docker)
COPY package.json pnpm-lock.yaml* ./

# Instala as dependências
RUN pnpm install --no-frozen-lockfile

# Copia o resto do código e faz o build
COPY . .
RUN pnpm build

# Estágio 2: Runner (Produção)
FROM node:20-alpine AS runner

WORKDIR /app

# Variáveis de ambiente de produção
ENV NODE_ENV=production
ENV PORT=3000

# Instala o pnpm no estágio final
RUN npm install -g pnpm@9.15.0

# Copia os arquivos do builder para a imagem final
# Dica: Se for um app Next.js ou NestJS, otimize copiando apenas as pastas compiladas (ex: dist, .next) 
# e o node_modules, em vez de copiar todo o /app para não pesar a imagem.
COPY --from=builder /app ./

EXPOSE 3000

CMD ["pnpm", "start"]
