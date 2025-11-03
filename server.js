// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { startCronJobs } = require('./jobs/cronJobs');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const teamRoutes = require('./routes/teamRoutes');
const historyRoutes = require('./routes/historyRoutes');
const eventRoutes = require('./routes/eventRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const menuRoutes = require('./routes/menuRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const fileRoutes = require('./routes/fileRoutes');
const chatRoutes = require('./routes/chatRoutes'); // <<-- 1. IMPORTAMOS A NOVA ROTA DO CHAT

const app = express();
// ATENÇÃO: Havia uma duplicação de app.listen. Removi uma delas.
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

// --- Rota para o Chatbot (REMOVIDA DAQUI) ---
// O código antigo que estava aqui foi removido para ser gerenciado pelo controlador.

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
app.use('/api/chat', chatRoutes); // <<-- 2. USAMOS A NOVA ROTA DO CHAT AQUI

// --- Rota Catch-All para Aplicação Frontend ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
  });
}

// Middleware básico de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ msg: err.message || 'Algo deu errado!' });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  startCronJobs(); // Inicia o agendamento de tarefas
});