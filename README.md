# 🎬 StreamFlix Brasil - Plataforma de Streaming Completa

## 📋 Visão Geral
StreamFlix Brasil é uma plataforma de streaming completa e moderna, desenvolvida especificamente para o mercado brasileiro. Unifica filmes, séries, animes, desenhos e jogos em uma única experiência, inspirada nas melhores práticas do Netflix, Amazon Prime, Disney+ e HBO Max.

## 🌟 Características Principais

### 🎯 Conteúdo Diversificado
- **Filmes**: Lançamentos, clássicos, nacionais e internacionais
- **Séries**: Temporadas completas, episódios semanais
- **Animes**: Catálogo completo com dublagem e legendas
- **Desenhos**: Animações para toda família
- **Jogos**: Streaming de jogos integrado

### 👥 Sistema de Usuários
- **Autenticação Múltipla**: Email, telefone, Google, Facebook
- **Perfis Familiares**: Até 5 perfis por conta
- **Controle Parental**: Classificação indicativa brasileira
- **Histórico Personalizado**: Continue assistindo de onde parou

### 💰 Planos de Assinatura (em Reais)
- **Gratuito**: Conteúdo limitado com anúncios
- **Básico**: R$ 14,90/mês - 1 tela, HD
- **Padrão**: R$ 22,90/mês - 2 telas, Full HD
- **Premium**: R$ 29,90/mês - 4 telas, 4K, sem anúncios
- **Família**: R$ 39,90/mês - 5 perfis, 4 telas simultâneas

### 💳 Pagamentos Brasileiros
- **PIX**: Pagamento instantâneo
- **Cartão de Crédito**: Todas as bandeiras
- **Cartão de Débito**: Visa, Mastercard
- **Boleto Bancário**: Para planos anuais
- **Mercado Pago**: Integração completa

## 🏗️ Arquitetura Técnica

### 📱 Plataformas Suportadas
- **Web**: Responsivo (Desktop, Tablet, Mobile)
- **Android**: Smartphone e Tablet
- **Android TV**: Smart TVs e TV Box
- **Roku TV**: Aplicativo nativo

### ⚡ Stack Tecnológico
- **Backend**: Node.js + Express.js
- **Banco de Dados**: MongoDB Atlas
- **Frontend Web**: React.js + Next.js
- **Mobile**: React Native
- **TV Apps**: Android TV (Java/Kotlin) + Roku (BrightScript)
- **Hospedagem**: Render.com (gratuito inicial)
- **CDN**: Cloudflare (gratuito)
- **Pagamentos**: Mercado Pago API

## 🚀 Guia de Instalação Completo

### 1. Pré-requisitos
```bash
# Instalar Node.js (versão 18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version

# Instalar Git
sudo apt-get install git
```

### 2. Configuração do Projeto
```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/streamflix-brasil
cd streamflix-brasil

# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install

# Voltar para raiz
cd ..
```

### 3. Variáveis de Ambiente
Criar arquivo `.env` na pasta backend:
```env
# Configurações do Servidor
PORT=5000
NODE_ENV=development

# Banco de Dados MongoDB
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/streamflix-brasil

# JWT Secret
JWT_SECRET=sua-chave-super-secreta-aqui-256-bits

# APIs Externas
TMDB_API_KEY=sua-chave-tmdb
MERCADOPAGO_ACCESS_TOKEN=seu-token-mercadopago
MERCADOPAGO_PUBLIC_KEY=sua-chave-publica-mercadopago

# OAuth Configurações
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
FACEBOOK_APP_ID=seu-facebook-app-id
FACEBOOK_APP_SECRET=seu-facebook-app-secret

# Email (SendGrid)
SENDGRID_API_KEY=sua-chave-sendgrid
FROM_EMAIL=naoresponder@streamflixbrasil.com

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

### 4. Executar o Projeto
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📚 Guias Detalhados

### 🔐 Configurar Autenticação

#### Google OAuth
1. Acesse [Google Console](https://console.cloud.google.com)
2. Crie um novo projeto "StreamFlix Brasil"
3. Ative a API Google+ 
4. Configure OAuth consent screen
5. Crie credenciais OAuth 2.0
6. Adicione URLs autorizadas:
   - `http://localhost:3000` (desenvolvimento)
   - `https://streamflixbrasil.com` (produção)

#### Facebook Login
1. Acesse [Facebook Developers](https://developers.facebook.com)
2. Crie um novo app "StreamFlix Brasil"
3. Adicione produto "Facebook Login"
4. Configure Valid OAuth URIs
5. Obtenha App ID e App Secret

### 💳 Configurar Mercado Pago

#### 1. Criar Conta de Desenvolvedor
```bash
# Acesse https://developers.mercadopago.com.br
# Crie uma conta e uma aplicação
# Obtenha as credenciais de teste e produção
```

#### 2. Configurar Webhooks
```javascript
// Endpoint para receber notificações do Mercado Pago
// backend/src/routes/webhooks.js
app.post('/webhooks/mercadopago', (req, res) => {
  const payment = req.body;
  
  if (payment.type === 'payment') {
    // Processar pagamento aprovado
    // Ativar assinatura do usuário
  }
  
  res.status(200).send('OK');
});
```

### 🎬 Configurar Base de Dados de Filmes

#### TMDB (The Movie Database)
1. Acesse [TMDB](https://www.themoviedb.org/settings/api)
2. Solicite uma API key gratuita
3. Configure no arquivo `.env`

```javascript
// Exemplo de busca de filmes
const axios = require('axios');

const buscarFilmes = async (query) => {
  const response = await axios.get(
    `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${query}&language=pt-BR`
  );
  return response.data.results;
};
```

## 🎨 Design System Brasileiro

### 🎨 Paleta de Cores
```css
:root {
  /* Cores Principais */
  --primary: #E50914;        /* Vermelho Netflix */
  --secondary: #00D4AA;      /* Verde Brasil */
  --accent: #FFD700;         /* Dourado */
  
  /* Cores Neutras */
  --dark-bg: #141414;        /* Fundo escuro */
  --card-bg: #2F2F2F;        /* Cards */
  --text-primary: #FFFFFF;   /* Texto principal */
  --text-secondary: #B3B3B3; /* Texto secundário */
  
  /* Cores de Status */
  --success: #46D369;        /* Sucesso */
  --warning: #FFB020;        /* Aviso */
  --error: #E87C03;          /* Erro */
}
```

### 📱 Componentes Responsivos
```css
/* Breakpoints Brasileiros */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 10px;
  }
}
```

## 🚀 Deploy em Produção

### 1. Render.com (Backend)
```yaml
# render.yaml
services:
  - type: web
    name: streamflix-brasil-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        fromDatabase:
          name: streamflix-db
          property: connectionString
```

### 2. Vercel (Frontend)
```json
{
  "name": "streamflix-brasil",
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://streamflix-brasil-api.onrender.com"
  }
}
```

### 3. MongoDB Atlas
1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie cluster gratuito (512MB)
3. Configure IP whitelist
4. Crie usuário de banco
5. Obtenha connection string

## 📊 Métricas e Analytics

### Google Analytics 4
```javascript
// components/Analytics.js
import { gtag } from 'ga-gtag';

export const trackEvent = (action, category, label, value) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value
  });
};

// Exemplos de uso
trackEvent('play_video', 'content', 'filme-nome', 1);
trackEvent('subscription', 'payment', 'plano-premium', 29.90);
```

## 🛡️ Segurança e Compliance

### LGPD (Lei Geral de Proteção de Dados)
```javascript
// middleware/lgpd.js
const lgpdCompliance = (req, res, next) => {
  // Verificar consentimento do usuário
  // Permitir exportação de dados
  // Implementar direito ao esquecimento
  next();
};
```

### Rate Limiting
```javascript
// Limites específicos para APIs brasileiras
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Muitas tentativas. Tente novamente em 15 minutos.'
});
```

## 🔄 Roadmap de Desenvolvimento

### Fase 1: MVP Web (4 semanas)
- [ ] Backend API completo
- [ ] Frontend responsivo
- [ ] Sistema de autenticação
- [ ] Catálogo básico de filmes
- [ ] Player de vídeo
- [ ] Pagamentos com Mercado Pago

### Fase 2: Apps Mobile (4 semanas)
- [ ] App Android (React Native)
- [ ] Sistema de download offline
- [ ] Notificações push
- [ ] Chromecast integration

### Fase 3: Apps TV (4 semanas)
- [ ] Android TV app
- [ ] Roku TV app
- [ ] Interface otimizada para TV
- [ ] Controle remoto navigation

### Fase 4: Recursos Avançados (4 semanas)
- [ ] Recomendações com IA
- [ ] Live streaming
- [ ] Conteúdo original
- [ ] Analytics avançado

## 📞 Suporte

### Documentação Completa
- API Reference: `/docs/api`
- Components: `/docs/components`
- Deployment: `/docs/deployment`

### Contato
- Email: suporte@streamflixbrasil.com
- WhatsApp: +55 11 99999-9999
- Telegram: @StreamFlixBrasil

---

## 🏆 Licença
MIT License - Livre para uso comercial

**StreamFlix Brasil** - A próxima geração de streaming brasileiro! 🇧🇷
