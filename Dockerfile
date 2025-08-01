FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    ffmpeg \
    && rm -rf /var/cache/apk/*

# Criar diretório da aplicação
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código da aplicação
COPY . .

# Criar diretórios necessários
RUN mkdir -p /app/uploads /app/cache /app/logs

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]