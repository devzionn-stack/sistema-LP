# 🍕 De Gusta Pizzas — Guia de Deploy no VPS

## ✅ O que foi corrigido para o deploy

| Item | Problema | Correção |
|------|----------|----------|
| `vite.config.ts` | Plugins `manus-runtime` e `jsx-loc` exclusivos da plataforma Manus | Removidos |
| `package.json` | Dependências `vite-plugin-manus-runtime` e `@builder.io/vite-plugin-jsx-loc` | Removidas |
| `.env.example` | Não existia arquivo de referência de variáveis | Criado |
| `deploy.sh` | Nenhum script de deploy automatizado | Criado |
| `nginx.conf` | Sem configuração de proxy reverso | Criado |

---

## ⚠️ Pendências que você deve resolver manualmente

### 1. 🔑 Variáveis de ambiente obrigatórias

Crie o arquivo `.env` na raiz do projeto (baseado no `.env.example`):

```bash
cp .env.example .env
nano .env
```

Preencha:

| Variável | Como obter |
|----------|-----------|
| `ASAAS_API_KEY` | [asaas.com](https://www.asaas.com) → Integrações → Chave de API |
| `WHATSAPP_PHONE` | Seu número com DDI+DDD (ex: `5585912345678`) |
| `VITE_FRONTEND_FORGE_API_KEY` | [console.cloud.google.com](https://console.cloud.google.com) → APIs → Maps JavaScript API |

> ⚠️ **Atenção:** O mapa (`Map.tsx`) usa um proxy chamado `forge.butterfly-effect.dev` em vez da API do Google Maps diretamente. Se você **não tiver essa chave**, o mapa simplesmente não vai carregar, mas o restante do sistema funciona normalmente.

### 2. 🗺️ Google Maps / Forge API (componente de Mapa)

O componente `Map.tsx` usa um serviço intermediário (`VITE_FRONTEND_FORGE_API_KEY`). Você tem duas opções:

**Opção A** — Usar diretamente a Google Maps API (recomendado):
Substitua em `client/src/components/Map.tsx`:
```js
// Trocar esta linha:
script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}...`;

// Por esta:
script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
```
E mude a variável de ambiente para `VITE_GOOGLE_MAPS_API_KEY`.

**Opção B** — Remover o mapa se não precisar dele.

### 3. 📦 Cálculo de frete (coordenadas da pizzaria)

Em `server/routes/delivery.ts`, as coordenadas estão fixas para Vila Carmosina - SP:
```ts
const PIZZARIA = { lat: -23.5108, lng: -46.4089 };
```
**Atualize para a localização real da sua pizzaria.**

### 4. 📱 Número do WhatsApp

Em `server/index.ts`:
```ts
const WHATSAPP_PHONE = process.env.WHATSAPP_PHONE || '5511934195908';
```
Configure via variável de ambiente no `.env`.

### 5. 🔗 Webhook Asaas

A rota `/api/webhook/asaas` está implementada mas **não salva dados em banco** (só loga no console). Se quiser persistir confirmações de pagamento, implemente um banco de dados.

---

## 🚀 Passo a Passo de Deploy

### Pré-requisitos no VPS (Ubuntu 22.04+)

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar PM2
npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx
```

### Subir o projeto

```bash
# 1. Enviar arquivos para o VPS (do seu computador local)
scp -r ./sistema-LP-deploy usuario@SEU_IP:/home/usuario/de-gusta-pizzas

# 2. Acessar o VPS
ssh usuario@SEU_IP

# 3. Entrar na pasta
cd /home/usuario/de-gusta-pizzas

# 4. Configurar variáveis de ambiente
cp .env.example .env
nano .env   # Preencha os valores

# 5. Executar o script de deploy
chmod +x deploy.sh
bash deploy.sh
```

### Configurar Nginx

```bash
# Editar o nginx.conf substituindo SEU_DOMINIO.COM
sudo nano /etc/nginx/sites-available/de-gusta-pizzas
# Cole o conteúdo do arquivo nginx.conf deste projeto

# Ativar o site
sudo ln -s /etc/nginx/sites-available/de-gusta-pizzas /etc/nginx/sites-enabled/

# Remover o default se não precisar
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Recarregar
sudo systemctl reload nginx
```

### SSL com Let's Encrypt (HTTPS)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d SEU_DOMINIO.COM -d www.SEU_DOMINIO.COM
```

---

## 🔧 Comandos PM2 úteis

```bash
pm2 status                      # Ver status
pm2 logs de-gusta-pizzas        # Logs em tempo real
pm2 restart de-gusta-pizzas     # Reiniciar
pm2 stop de-gusta-pizzas        # Parar
pm2 monit                       # Monitor visual
```

---

## 🌐 Portas e Firewall

```bash
# Liberar portas necessárias
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

> A porta `3000` (Node.js) **não deve** ser exposta publicamente — o Nginx faz o proxy.

---

## 📋 Checklist Final

- [ ] `.env` preenchido com todas as credenciais
- [ ] Coordenadas da pizzaria atualizadas em `server/routes/delivery.ts`
- [ ] Número do WhatsApp configurado
- [ ] Chave Asaas configurada (para pagamentos PIX)
- [ ] Google Maps API key configurada (ou componente removido)
- [ ] Deploy executado com `bash deploy.sh`
- [ ] Nginx configurado e rodando
- [ ] SSL configurado com Certbot
- [ ] Domínio apontando para o IP do VPS (DNS)
