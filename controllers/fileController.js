// controllers/fileController.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER || 'uploads';

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '..', UPLOAD_FOLDER);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
  console.log('--- File Filter Debug ---');
  console.log('Original filename:', file.originalname);
  console.log('MIME type:', file.mimetype);
  console.log('File extension:', path.extname(file.originalname).toLowerCase());

  // Updated allowedTypes regex to include specific MIME types for Excel files
  // Note: The regex should match the full MIME type for application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  // and application/vnd.ms-excel. Also, ensure the file extension matches.
  const allowedTypesRegex = /jpeg|jpg|png|gif|pdf|xlsx|xls|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|application\/vnd\.ms-excel/;
  const mimetypeTest = allowedTypesRegex.test(file.mimetype);
  // For extension, ensure it matches exactly one of the allowed extensions
  const extnameTest = ['.jpeg', '.jpg', '.png', '.gif', '.pdf', '.xlsx', '.xls'].includes(path.extname(file.originalname).toLowerCase());

  console.log('MIME type test result:', mimetypeTest);
  console.log('Extension test result:', extnameTest);

  if (mimetypeTest && extnameTest) {
    console.log('File accepted by filter.');
    return cb(null, true);
  }
  console.log('File rejected by filter: Invalid type or extension.');
  cb(new Error('Only images, PDFs, and Excel files are allowed!'), false);
};

// Multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
  fileFilter: fileFilter,
}).single('file'); // 'file' is the name of the input field in the form

// @desc    Handle file upload
// @route   POST /api/files/upload
// @access  Private (Admin/Secretaria) - This endpoint is generic
const uploadFile = (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.error('Multer Error:', err.message); // Added log
      return res.status(400).json({ msg: err.message });
    } else if (err) {
      // An unknown error occurred when uploading.
      console.error('Unknown Upload Error:', err.message); // Added log
      return res.status(400).json({ msg: err.message });
    }

    if (!req.file) {
      console.error('No file uploaded by Multer.'); // Added log
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // File uploaded successfully
    console.log('File uploaded successfully by Multer:', req.file.filename); // Added log
    res.status(200).json({
      msg: 'File uploaded successfully',
      filePath: `/${UPLOAD_FOLDER}/${req.file.filename}`,
    });
  });
};

module.exports = {
  upload, // Export the multer middleware for use in specific routes
  uploadFile, // Export the controller for the generic file upload route
};
