# Estágio 1: Builder
FROM node:20-slim AS builder

WORKDIR /app

# Instala dependências do sistema operacional que podem ser necessárias
RUN apt-get update && apt-get install -y git python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copia os arquivos de dependência
COPY package.json ./

# Usa o NPM padrão (mais estável para evitar o erro 254)
RUN npm install

# Copia o restante do código fonte
COPY . .

# Executa o build
RUN npm run build

# Estágio 2: Runner (Produção)
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copia os arquivos processados do estágio anterior
COPY --from=builder /app ./

EXPOSE 3000

# Inicia o projeto
CMD ["npm", "start"]
