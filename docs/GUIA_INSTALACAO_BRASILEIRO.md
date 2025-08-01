# 🚀 Guia Completo de Instalação - StreamFlix Brasil

Este guia vai te ensinar passo a passo como instalar, configurar e colocar no ar a plataforma **StreamFlix Brasil** completa. Siga todas as etapas cuidadosamente.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação do Ambiente](#instalação-do-ambiente)
3. [Configuração do Backend](#configuração-do-backend)
4. [Configuração do Frontend](#configuração-do-frontend)
5. [Configuração de Pagamentos (Mercado Pago)](#configuração-de-pagamentos)
6. [Configuração OAuth (Google/Facebook)](#configuração-oauth)
7. [Deploy em Produção](#deploy-em-produção)
8. [Configuração de Domínio](#configuração-de-domínio)
9. [Monitoramento e Manutenção](#monitoramento-e-manutenção)
10. [Solução de Problemas](#solução-de-problemas)

---

## 🛠️ Pré-requisitos

### Contas Necessárias (Todas Gratuitas)
- [ ] **MongoDB Atlas** - Banco de dados
- [ ] **Render.com** - Hospedagem do backend
- [ ] **Vercel** - Hospedagem do frontend
- [ ] **Mercado Pago** - Pagamentos brasileiros
- [ ] **Google Console** - OAuth e Analytics
- [ ] **Facebook Developers** - OAuth
- [ ] **TMDB** - Base de dados de filmes
- [ ] **SendGrid** - Envio de emails
- [ ] **Cloudflare** - CDN e DNS

### Sistema Operacional
Funciona em qualquer sistema:
- **Windows** 10/11
- **macOS** Big Sur+
- **Linux** Ubuntu/Debian/CentOS

---

## 🔧 Instalação do Ambiente

### 1. Instalar Node.js

#### Windows:
```powershell
# Baixe e instale do site oficial
# https://nodejs.org/pt-br/download/

# Ou use Chocolatey
choco install nodejs

# Verificar instalação
node --version
npm --version
```

#### macOS:
```bash
# Instalar Homebrew primeiro
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js
brew install node

# Verificar instalação
node --version
npm --version
```

#### Linux (Ubuntu/Debian):
```bash
# Atualizar repositórios
sudo apt update

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 2. Instalar Git

#### Windows:
```powershell
# Baixar do site oficial ou usar Chocolatey
choco install git

# Configurar Git
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

#### macOS:
```bash
# Git já vem instalado, mas você pode atualizar
brew install git

# Configurar Git
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

#### Linux:
```bash
# Ubuntu/Debian
sudo apt install git

# CentOS/RHEL
sudo yum install git

# Configurar Git
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

### 3. Baixar o Projeto

```bash
# Clonar o repositório
git clone https://github.com/streamflix-brasil/streamflix-plataforma.git
cd streamflix-plataforma

# Verificar estrutura
ls -la
```

---

## ⚙️ Configuração do Backend

### 1. Entrar na pasta do backend
```bash
cd backend
```

### 2. Instalar dependências
```bash
# Instalar todas as dependências
npm install

# Se der erro, tente:
npm install --force
# ou
npm install --legacy-peer-deps
```

### 3. Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar arquivo .env
nano .env  # Linux/macOS
notepad .env  # Windows
```

#### Configurações obrigatórias no `.env`:

```env
# Servidor
NODE_ENV=development
PORT=5000

# Banco de dados (configurar na próxima seção)
MONGODB_URI=sua-connection-string-mongodb

# JWT (gerar chave segura)
JWT_SECRET=streamflix-brasil-super-secret-key-2024-256-bits

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Mercado Pago (configurar na seção específica)
MERCADOPAGO_ACCESS_TOKEN=TEST-sua-chave-aqui
MERCADOPAGO_PUBLIC_KEY=TEST-sua-chave-publica
```

### 4. Configurar MongoDB Atlas

#### Passo 1: Criar conta
1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Clique em "Try Free" 
3. Faça cadastro com seu email
4. Verifique seu email

#### Passo 2: Criar cluster
1. Escolha **M0 Sandbox** (gratuito)
2. Região: **São Paulo** (sa-east-1)
3. Nome do cluster: `streamflix-brasil`
4. Clique em "Create Cluster"

#### Passo 3: Configurar acesso
1. **Database Access**:
   - Clique em "Add New Database User"
   - Username: `streamflix`
   - Password: gere uma senha forte
   - Salve a senha!

2. **Network Access**:
   - Clique em "Add IP Address"
   - Selecione "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirme

#### Passo 4: Obter connection string
1. Clique em "Connect" no seu cluster
2. Escolha "Connect your application"
3. Driver: **Node.js**
4. Copie a connection string
5. Substitua `<password>` pela sua senha
6. Cole no arquivo `.env` na variável `MONGODB_URI`

Exemplo:
```env
MONGODB_URI=mongodb+srv://streamflix:suasenha@streamflix-brasil.abc123.mongodb.net/streamflix-brasil?retryWrites=true&w=majority
```

### 5. Testar o backend

```bash
# Executar em modo desenvolvimento
npm run dev

# Você deve ver:
# [INFO] Servidor rodando na porta 5000
# [INFO] MongoDB conectado com sucesso
# [INFO] StreamFlix Brasil API iniciada
```

Se tudo funcionou, acesse: http://localhost:5000/api/health

---

## 🎨 Configuração do Frontend

### 1. Abrir novo terminal e ir para frontend
```bash
# Novo terminal/cmd
cd frontend  # ou cd ../frontend se estiver no backend
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente

```bash
# Criar arquivo de configuração
cp .env.example .env.local

# Editar arquivo
nano .env.local  # Linux/macOS
notepad .env.local  # Windows
```

Configuração do `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-sua-chave-publica
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-google-client-id
NEXT_PUBLIC_FACEBOOK_APP_ID=seu-facebook-app-id
```

### 4. Executar o frontend

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 💳 Configuração de Pagamentos (Mercado Pago)

### 1. Criar conta no Mercado Pago

1. Acesse [Mercado Pago Developers](https://developers.mercadopago.com.br)
2. Faça login com sua conta Mercado Pago (ou crie uma)
3. Clique em "Criar aplicação"

### 2. Configurar aplicação

**Informações da aplicação:**
- **Nome**: StreamFlix Brasil
- **Tipo**: Marketplace
- **Categoria**: Entretenimento
- **Website**: http://localhost:3000
- **Descrição**: Plataforma de streaming brasileira

### 3. Obter credenciais

1. Vá em **"Credenciais"**
2. **Ambiente de teste**:
   - **Access Token**: Copie e cole em `MERCADOPAGO_ACCESS_TOKEN`
   - **Public Key**: Copie e cole em `MERCADOPAGO_PUBLIC_KEY`

### 4. Configurar Webhooks

1. Em **"Webhooks"**
2. **URL de notificação**: `http://localhost:5000/api/pagamentos/webhook`
3. **Eventos**: Selecione "Payments"
4. Salvar

### 5. Testar PIX

```bash
# No terminal do backend, teste:
curl -X POST http://localhost:5000/api/pagamentos/pix \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -d '{
    "plano": "BASICO",
    "meses": 1
  }'
```

---

## 🔐 Configuração OAuth (Google/Facebook)

### Google OAuth

#### 1. Google Cloud Console
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto: "StreamFlix Brasil"
3. Ative a **Google+ API**

#### 2. Configurar OAuth
1. Vá em **"APIs e Serviços" > "Credenciais"**
2. Clique em **"Criar credenciais" > "ID do cliente OAuth 2.0"**
3. Tipo: **Aplicação da Web**
4. **URIs de origem autorizadas**:
   - `http://localhost:3000`
   - `https://streamflixbrasil.com` (futuro domínio)
5. **URIs de redirecionamento autorizadas**:
   - `http://localhost:5000/api/auth/google/callback`
   - `https://api.streamflixbrasil.com/api/auth/google/callback`

#### 3. Atualizar .env
```env
GOOGLE_CLIENT_ID=seu-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-google-client-secret
```

### Facebook Login

#### 1. Facebook Developers
1. Acesse [Facebook for Developers](https://developers.facebook.com)
2. Clique em **"Meus Apps" > "Criar App"**
3. Tipo: **Consumidor**
4. Nome: **StreamFlix Brasil**

#### 2. Configurar Facebook Login
1. Adicione produto **"Facebook Login"**
2. **Valid OAuth URIs**:
   - `http://localhost:3000`
   - `https://streamflixbrasil.com`
3. **Valid redirect URIs**:
   - `http://localhost:5000/api/auth/facebook/callback`

#### 3. Atualizar .env
```env
FACEBOOK_APP_ID=seu-facebook-app-id
FACEBOOK_APP_SECRET=seu-facebook-app-secret
```

---

## 🚀 Deploy em Produção

### 1. Deploy do Backend (Render.com)

#### Preparar repositório
```bash
# Criar repositório no GitHub
git init
git add .
git commit -m "Primeira versão StreamFlix Brasil"
git branch -M main
git remote add origin https://github.com/seuusuario/streamflix-brasil.git
git push -u origin main
```

#### Configurar Render
1. Acesse [Render.com](https://render.com)
2. Conecte sua conta GitHub
3. Clique em **"New Web Service"**
4. Selecione seu repositório
5. Configurações:
   - **Name**: streamflix-brasil-api
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Instance Type**: Free

#### Variáveis de ambiente no Render
Adicione todas as variáveis do `.env`:
```
NODE_ENV=production
MONGODB_URI=sua-connection-string
JWT_SECRET=sua-chave-jwt
MERCADOPAGO_ACCESS_TOKEN=PROD-sua-chave-producao
FRONTEND_URL=https://streamflixbrasil.vercel.app
```

### 2. Deploy do Frontend (Vercel)

#### Instalar Vercel CLI
```bash
npm i -g vercel
```

#### Deploy
```bash
cd frontend
vercel --prod
```

#### Configurar domínio
1. No dashboard da Vercel
2. Vá em **Settings > Domains**
3. Adicione: `streamflixbrasil.com`

### 3. Configurar Banco de Produção

#### MongoDB Atlas
1. Crie um novo cluster para produção
2. Configure IP whitelist para Render:
   - Adicione `0.0.0.0/0` temporariamente
3. Atualize connection string na Render

---

## 🌐 Configuração de Domínio

### 1. Registrar Domínio

**Sugestões de domínios:**
- `streamflixbrasil.com`
- `streamflix.com.br`
- `flixstream.com.br`

**Onde registrar:**
- Registro.br (domínios .com.br)
- GoDaddy
- Namecheap
- Cloudflare Registrar

### 2. Configurar DNS (Cloudflare)

#### Adicionar site no Cloudflare
1. Acesse [Cloudflare](https://cloudflare.com)
2. Adicione seu site
3. Altere nameservers no seu registrador

#### Configurar DNS Records
```
# Frontend (Vercel)
Type: CNAME
Name: @
Target: cname.vercel-dns.com

Type: CNAME  
Name: www
Target: cname.vercel-dns.com

# Backend (Render)
Type: CNAME
Name: api
Target: streamflix-brasil-api.onrender.com

# CDN (Opcional)
Type: CNAME
Name: cdn
Target: streamflix-brasil-api.onrender.com
```

### 3. Configurar SSL

No Cloudflare:
1. **SSL/TLS** > **Overview**
2. Modo: **Full (strict)**
3. **Edge Certificates**: Ativar "Always Use HTTPS"

---

## 📊 Monitoramento e Manutenção

### 1. Configurar Analytics

#### Google Analytics 4
1. Acesse [Google Analytics](https://analytics.google.com)
2. Crie uma propriedade: "StreamFlix Brasil"
3. Obtenha o Measurement ID
4. Adicione no frontend:

```env
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 2. Monitoramento de Erros

#### Sentry
1. Acesse [Sentry.io](https://sentry.io)
2. Crie um projeto Node.js
3. Obtenha o DSN
4. Adicione no backend:

```env
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 3. Logs e Performance

#### Configurar Winston (já incluído)
```javascript
// backend/src/utils/logger.js já configurado
// Logs salvos em ./logs/streamflix.log
```

### 4. Backup Automático

#### Script de backup do MongoDB
```javascript
// Já incluído em backend/src/scripts/backup.js
// Executa diariamente via cron job
```

---

## 🔧 Solução de Problemas

### Problemas Comuns

#### 1. Erro de conexão MongoDB
```bash
# Verificar se IP está liberado
# Verificar se senha está correta
# Testar connection string
```

#### 2. Erro no Mercado Pago
```bash
# Verificar se credenciais estão corretas
# Verificar se webhook URL está acessível
# Verificar se está usando credenciais de test/prod corretas
```

#### 3. Erro de CORS
```bash
# Verificar se FRONTEND_URL está correto no backend
# Verificar configuração de CORS
```

#### 4. Build do frontend falha
```bash
# Limpar cache
rm -rf .next node_modules
npm install
npm run build
```

### Comandos Úteis

```bash
# Verificar logs do backend
npm run logs

# Verificar status do banco
npm run db:status

# Testar pagamentos
npm run test:payments

# Backup manual
npm run backup

# Verificar performance
npm run performance:check
```

### Contatos de Suporte

- **Email**: suporte@streamflixbrasil.com
- **WhatsApp**: +55 11 99999-9999
- **Discord**: StreamFlix Brasil Community
- **GitHub Issues**: [github.com/streamflix-brasil/issues](https://github.com/streamflix-brasil/issues)

---

## ✅ Checklist Final

Antes de colocar no ar, verifique:

### Backend
- [ ] MongoDB conectado
- [ ] JWT funcionando
- [ ] Mercado Pago configurado
- [ ] OAuth configurado
- [ ] Emails funcionando
- [ ] Logs configurados
- [ ] Deploy no Render funcionando

### Frontend
- [ ] Build sem erros
- [ ] APIs conectadas
- [ ] OAuth funcionando
- [ ] Pagamentos funcionando
- [ ] Responsivo
- [ ] Deploy na Vercel funcionando

### Produção
- [ ] Domínio apontado
- [ ] SSL ativo
- [ ] CDN configurado
- [ ] Analytics configurado
- [ ] Backup configurado
- [ ] Monitoramento ativo

### Legal/Compliance
- [ ] Política de privacidade
- [ ] Termos de uso
- [ ] LGPD compliance
- [ ] Classificação indicativa

---

## 🎉 Parabéns!

Sua plataforma **StreamFlix Brasil** está agora completamente configurada e pronta para usar! 

**Próximos passos:**
1. Teste todas as funcionalidades
2. Convide beta testers
3. Configure analytics
4. Planeje estratégia de marketing
5. Lance oficialmente!

**Sucesso com sua plataforma! 🇧🇷🍿📺**