# Etapa de build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .

RUN pnpm build


# Etapa de produção
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "start"]
