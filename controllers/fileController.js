// controllers/fileController.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER || 'uploads';

// Assegura que o diretório de uploads existe
const uploadsDir = path.join(__dirname, '..', UPLOAD_FOLDER);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configura o armazenamento para os arquivos enviados
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Gera um nome de arquivo único para evitar sobreposições
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Filtro de arquivo para permitir apenas tipos específicos
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
  ];
  const allowedExtensions = [
    '.jpeg', '.jpg', '.png', '.gif', '.pdf', '.xlsx', '.xls',
  ];
  const mimetypeTest = allowedMimeTypes.includes(file.mimetype);
  const extnameTest = allowedExtensions.includes(path.extname(file.originalname).toLowerCase());

  if (mimetypeTest && extnameTest) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas imagens, PDFs e arquivos do Excel são permitidos!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter,
});

module.exports = {
  upload,
  uploadFile: (req, res) => {
    if (!req.file) {
      console.error('Nenhum arquivo enviado pelo Multer.');
      return res.status(400).json({ msg: 'Nenhum arquivo enviado.' });
    }
    console.log('Arquivo enviado com sucesso pelo Multer:', req.file.filename);
    res.status(200).json({
      msg: 'Arquivo enviado com sucesso.',
      filePath: `/${UPLOAD_FOLDER}/${req.file.filename}`,
    });
  },
};
