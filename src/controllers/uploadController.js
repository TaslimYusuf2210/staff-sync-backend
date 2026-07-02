const AppError = require('../utils/AppError');
const config = require('../config');

/**
 * POST /upload
 * Upload a file (documents, photos, or general).
 */
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.body.directory || 'general'}/${req.file.filename}`;

    res.status(201).json({
      success: true,
      data: {
        fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
