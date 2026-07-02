const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const AppError = require('../utils/AppError');

// Ensure upload directories exist
const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const subDir = _req.body.directory || 'general';
    const dest = path.join(config.upload.uploadDir, subDir);
    createDir(dest);
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('File type not allowed. Accepted: PDF, DOC, DOCX, PNG, JPG, JPEG, GIF', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize },
});

module.exports = upload;
