const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      mediaSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:"]
    }
  }
}));

app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configurar EJS como view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Importar rotas
const tmdbRoutes = require('./routes/tmdb');
const streamingRoutes = require('./routes/streaming');
const searchRoutes = require('./routes/search');
const apiRoutes = require('./routes/api');

// Usar rotas
app.use('/api/tmdb', tmdbRoutes);
app.use('/api/streaming', streamingRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', apiRoutes);

// Rota principal
app.get('/', (req, res) => {
  res.render('index', {
    title: 'StreamVault - Sua Biblioteca de Entretenimento',
    description: 'Assista filmes, séries, animes e muito mais'
  });
});

// Rota para página de filme/série
app.get('/watch/:type/:id', (req, res) => {
  const { type, id } = req.params;
  res.render('watch', { type, id });
});

// Rota para busca
app.get('/search', (req, res) => {
  const query = req.query.q || '';
  res.render('search', { query });
});

// Rota para categorias
app.get('/category/:category', (req, res) => {
  const { category } = req.params;
  res.render('category', { category });
});

// Socket.IO para atualizações em tempo real
io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);
  
  socket.on('join-room', (room) => {
    socket.join(room);
  });
  
  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).render('404');
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 StreamVault rodando na porta ${PORT}`);
  console.log(`📺 Acesse: http://localhost:${PORT}`);
});

module.exports = { app, io };