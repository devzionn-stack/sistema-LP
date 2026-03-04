#!/bin/bash
# ============================================================
#  deploy.sh — Script de deploy para VPS (Ubuntu/Debian)
#  Execute na raiz do projeto: bash deploy.sh
# ============================================================

set -e

VERDE='\033[0;32m'
AMARELO='\033[1;33m'
VERMELHO='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${VERDE}[✔] $1${NC}"; }
warn() { echo -e "${AMARELO}[!] $1${NC}"; }
err()  { echo -e "${VERMELHO}[✘] $1${NC}"; exit 1; }

echo ""
echo "🍕 De Gusta Pizzas — Deploy VPS"
echo "================================"
echo ""

# 1. Verificar Node.js
if ! command -v node &> /dev/null; then
  err "Node.js não encontrado. Instale com: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs"
fi
NODE_VERSION=$(node -v)
log "Node.js encontrado: $NODE_VERSION"

# 2. Verificar pnpm
if ! command -v pnpm &> /dev/null; then
  warn "pnpm não encontrado. Instalando..."
  npm install -g pnpm
fi
log "pnpm disponível: $(pnpm -v)"

# 3. Verificar .env
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    warn "Arquivo .env não encontrado. Copiando .env.example para .env..."
    cp .env.example .env
    warn "ATENÇÃO: Edite o arquivo .env com suas credenciais antes de continuar!"
    warn "Execute: nano .env"
    echo ""
    read -p "Pressione ENTER após editar o .env para continuar o deploy..."
  else
    err "Arquivo .env não encontrado. Crie um baseado no .env.example"
  fi
fi
log "Arquivo .env encontrado"

# 4. Instalar dependências
log "Instalando dependências..."
pnpm install --frozen-lockfile

# 5. Build do projeto
log "Fazendo build do projeto..."
pnpm build

# 6. Verificar build
if [ ! -f "dist/index.js" ]; then
  err "Build falhou: dist/index.js não encontrado"
fi
if [ ! -d "dist/public" ]; then
  err "Build falhou: dist/public não encontrado"
fi
log "Build concluído com sucesso!"

# 7. Instalar/atualizar PM2
if ! command -v pm2 &> /dev/null; then
  warn "PM2 não encontrado. Instalando..."
  npm install -g pm2
fi
log "PM2 disponível"

# 8. Iniciar/Reiniciar com PM2
APP_NAME="de-gusta-pizzas"
if pm2 list | grep -q "$APP_NAME"; then
  log "Reiniciando aplicação existente no PM2..."
  pm2 reload "$APP_NAME" --update-env
else
  log "Iniciando aplicação no PM2..."
  pm2 start dist/index.js \
    --name "$APP_NAME" \
    --env production \
    --max-memory-restart 300M \
    --restart-delay 3000
fi

# 9. Salvar configuração PM2
pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || warn "Configure o startup do PM2 manualmente: pm2 startup"

echo ""
log "Deploy finalizado com sucesso! 🚀"
echo ""
echo "📋 Comandos úteis:"
echo "   pm2 status              → Ver status da aplicação"
echo "   pm2 logs $APP_NAME      → Ver logs em tempo real"
echo "   pm2 restart $APP_NAME   → Reiniciar a aplicação"
echo "   pm2 stop $APP_NAME      → Parar a aplicação"
echo ""
PORT_VAL=$(grep '^PORT=' .env | cut -d'=' -f2)
PORT_VAL=${PORT_VAL:-3000}
echo "🌐 Aplicação rodando na porta: $PORT_VAL"
echo ""
