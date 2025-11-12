require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { startCronJobs } = require('./jobs/cronJobs');

// <<< 1. IMPORTAMOS O MODELO DE USUÁRIO >>>
// (Verifique se o caminho 'models/User' está correto para o seu projeto)
const User = require('./models/User'); 

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
const chatRoutes = require('./routes/chatRoutes'); 

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

// <<< 2. REMOVEMOS A ANTIGA CONEXÃO DAQUI >>>
// A conexão agora será feita na função de inicialização

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
app.use('/api/chat', chatRoutes); 

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

// <<< 3. CRIAMOS UMA FUNÇÃO DE INICIALIZAÇÃO ASYNC >>>
const startServer = async () => {
  try {
    // Conecta ao MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB conectado com sucesso');

    // --- Lógica de criação do Admin Master ---
    // <<< MODIFICADO >>> Agora lê apenas do .env
    const masterEmail = process.env.MASTER_ADMIN_EMAIL;
    const masterPassword = process.env.MASTER_ADMIN_PASSWORD;

    // <<< ADICIONADO >>> Verificação para garantir que as variáveis existem no .env
    if (!masterEmail || !masterPassword) {
      console.warn('MASTER_ADMIN_EMAIL ou MASTER_ADMIN_PASSWORD não definidos no .env');
      console.warn('O Admin Master NÃO será criado ou verificado.');
      // Você pode optar por parar o servidor aqui se o admin for crítico:
      // throw new Error('Credenciais do Admin Master não configuradas.');
    } else {
      // Verifica se o Admin Master já existe
      const adminExists = await User.findOne({ email: masterEmail });

      if (!adminExists) {
        // Se NÃO existir, cria ele
        console.log('Admin Master não encontrado. Criando...');
        
        await User.create({
          name: 'Admin Master', // Garante que 'name' existe
          email: masterEmail,
          password: masterPassword, // O hook do Mongoose vai hashar
          role: 'Admin',
          isAdmin: true,
          isSecretaria: true,
          isVerified: true,  // Já começa verificado
          isProtected: true  // Protegido contra exclusão
        });
        
        console.log('Admin Master criado com sucesso!');
      } else {
        console.log('Admin Master já existe. Inicialização normal.');
      }
    }
    // --- Fim da Lógica do Admin ---

    // Iniciar o servidor
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      startCronJobs(); // Inicia o agendamento de tarefas
    });

  } catch (err) {
    console.error('Erro de conexão com o MongoDB ou falha na inicialização:', err);
    process.exit(1); // Encerra o processo se não conseguir conectar
  }
};

// <<< 4. CHAMAMOS A FUNÇÃO DE INICIALIZAÇÃO >>>
startServer();