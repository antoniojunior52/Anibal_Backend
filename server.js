// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); // Caminho corrigido
const newsRoutes = require('./routes/newsRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const teamRoutes = require('./routes/teamRoutes');
const historyRoutes = require('./routes/historyRoutes');
const eventRoutes = require('./routes/eventRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const menuRoutes = require('./routes/menuRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const fileRoutes = require('./routes/fileRoutes'); // Para uploads de arquivos gerais

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER || 'uploads';

// Middleware
app.use(cors());
app.use(express.json()); // Para parsing de application/json
app.use(express.urlencoded({ extended: true })); // Para parsing de application/x-www-form-urlencoded

// Servir arquivos estáticos do diretório 'uploads'
app.use(`/${UPLOAD_FOLDER}`, express.static(path.join(__dirname, UPLOAD_FOLDER)));

// Conectar ao MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB conectado com sucesso'))
  .catch(err => console.error('Erro de conexão com o MongoDB:', err));

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/files', fileRoutes);

// --- Rota Catch-All para Aplicação Frontend ---
// Esta parte é crucial para que as rotas do React Router funcionem ao recarregar a página ou aceder diretamente.
if (process.env.NODE_ENV === 'production') {
  // Em produção, servir a pasta 'build' gerada pelo React
  // Ajuste o caminho 'build' se a sua pasta de build tiver outro nome
  app.use(express.static(path.join(__dirname, '..', 'build'))); 

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
  });
} else {
  // EM DESENVOLVIMENTO:
  // Removida a rota 'app.get('*')' para o ambiente de desenvolvimento.
  // Em um setup típico de React + Express, o servidor de desenvolvimento do React (npm start)
  // lida com todas as rotas do frontend (ex: /reset-password/:token).
  // O servidor Express só precisa lidar com as rotas da API (/api/*) e servir seus próprios arquivos estáticos (uploads).
  // A presença de um 'app.get('*')' no Express em desenvolvimento pode causar conflitos
  // e o 'TypeError: Missing parameter name' que está a ver.
  // Se você precisa que o Express sirva o index.html em desenvolvimento,
  // isso geralmente é feito com um proxy no setup do frontend (ex: src/setupProxy.js)
  // ou configurando o Express para servir a pasta 'public' antes das rotas da API,
  // mas o 'app.get('*')' no final é problemático aqui.
  // Ao remover este bloco, o Express irá simplesmente ignorar requisições para rotas de frontend,
  // e o seu servidor de desenvolvimento do React deverá tratá-las.
}


// Middleware básico de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ msg: err.message || 'Algo deu errado!' });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
