const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const sharp = require('sharp');
const { AppError } = require('./errorHandler.middleware');
const logger = require('../utils/logger');

// Allowed file types per document category
const FILE_TYPES = {
  PASSPORT_PHOTO: {
    mimeTypes: ['image/jpeg', 'image/png'],
    extensions: ['.jpg', '.jpeg', '.png'],
    maxSize: 1 * 1024 * 1024, // 1MB
    dimensions: { minWidth: 400, minHeight: 400, maxWidth: 2000, maxHeight: 2000 }
  },
  birthCertificate: {
    mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    extensions: ['.jpg', '.jpeg', '.png', '.pdf'],
    maxSize: 1 * 1024 * 1024 // 1MB
  },
  wassceCertificate: {
    mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    extensions: ['.jpg', '.jpeg', '.png', '.pdf'],
    maxSize: 1 * 1024 * 1024
  },
  ghanaCard: {
    mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    extensions: ['.jpg', '.jpeg', '.png', '.pdf'],
    maxSize: 1 * 1024 * 1024
  },
  tertiaryCertificate: {
    mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    extensions: ['.jpg', '.jpeg', '.png', '.pdf'],
    maxSize: 1 * 1024 * 1024
  },
  professionalCert: {
    mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    extensions: ['.jpg', '.jpeg', '.png', '.pdf'],
    maxSize: 1 * 1024 * 1024
  },
  nationalService: {
    mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    extensions: ['.jpg', '.jpeg', '.png', '.pdf'],
    maxSize: 1 * 1024 * 1024
  },
  default: {
    mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    extensions: ['.jpg', '.jpeg', '.png', '.pdf'],
    maxSize: 1 * 1024 * 1024
  }
};

// Ensure upload directories exist
const UPLOAD_BASE = path.join(__dirname, '../../uploads');
const UPLOAD_DIRS = {
  documents: path.join(UPLOAD_BASE, 'documents'),
  temp: path.join(UPLOAD_BASE, 'temp'),
  processed: path.join(UPLOAD_BASE, 'processed')
};

Object.values(UPLOAD_DIRS).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Sanitize filename to only allow alphanumeric, dots, dashes, and underscores
 * This "Allowed List" approach prevents control characters, path separators, etc.
 */
const sanitizeFilename = (filename) => {
  // 1. Remove any path directory components just in case
  const name = path.basename(filename);
  
  // 2. Enforce strict allowlist: a-z, A-Z, 0-9, ., -, _
  // Everything else is replaced with nothing or a safe replacement
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '');
};

/**
 * Generate UUID filename
 */
const generateSecureFilename = (originalName) => {
  const uuid = crypto.randomUUID();
  // Sanitize the original name first to ensure the extension is safe
  const safeName = sanitizeFilename(originalName);
  const ext = path.extname(safeName).toLowerCase();
  const timestamp = Date.now();
  return `${uuid}-${timestamp}${ext}`;
};

/**
 * Validate file magic bytes (file signature)
 */
const validateMagicBytes = (buffer) => {
  const signatures = {
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    pdf: [0x25, 0x50, 0x44, 0x46] // %PDF
  };

  const bytes = [...buffer.slice(0, 8)];

  if (bytes.slice(0, 3).every((b, i) => b === signatures.jpeg[i])) {
    return 'image/jpeg';
  }
  if (bytes.slice(0, 4).every((b, i) => b === signatures.png[i])) {
    return 'image/png';
  }
  if (bytes.slice(0, 4).every((b, i) => b === signatures.pdf[i])) {
    return 'application/pdf';
  }

  return null;
};

/**
 * Multer storage configuration
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIRS.temp);
  },
  filename: (req, file, cb) => {
    cb(null, generateSecureFilename(file.originalname));
  }
});

/**
 * File filter
 */
const fileFilter = (req, file, cb) => {
  const documentType = req.body.documentType || 'default';
  const config = FILE_TYPES[documentType] || FILE_TYPES.default;

  // Check MIME type
  if (!config.mimeTypes.includes(file.mimetype)) {
    return cb(new AppError(`Invalid file type. Allowed: ${config.extensions.join(', ')}`, 400), false);
  }

  // Check extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!config.extensions.includes(ext)) {
    return cb(new AppError(`Invalid file extension. Allowed: ${config.extensions.join(', ')}`, 400), false);
  }

  cb(null, true);
};

/**
 * Create multer instance
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max (specific limits checked after)
    files: 1
  }
});

/**
 * Validate uploaded file
 */
const validateUploadedFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const documentType = req.body.documentType || 'default';
    const config = FILE_TYPES[documentType] || FILE_TYPES.default;

    // Validate file size
    if (req.file.size > config.maxSize) {
      fs.unlinkSync(req.file.path);
      throw new AppError(`File too large. Max size: ${config.maxSize / (1024 * 1024)}MB`, 400);
    }

    // SANITIZE: Enforce allowed list on original filename before any further processing
    req.file.originalname = sanitizeFilename(req.file.originalname);

    // Read file for magic byte validation
    const buffer = fs.readFileSync(req.file.path);
    const detectedType = validateMagicBytes(buffer);

    if (!detectedType || !config.mimeTypes.includes(detectedType)) {
      fs.unlinkSync(req.file.path);
      throw new AppError('File content does not match file extension', 400);
    }

    // For images, validate dimensions
    if (detectedType.startsWith('image/') && config.dimensions) {
      try {
        const metadata = await sharp(req.file.path).metadata();
        const { minWidth, minHeight, maxWidth, maxHeight } = config.dimensions;

        if (metadata.width < minWidth || metadata.height < minHeight) {
          fs.unlinkSync(req.file.path);
          throw new AppError(`Image too small. Minimum: ${minWidth}x${minHeight}px`, 400);
        }

        if (metadata.width > maxWidth || metadata.height > maxHeight) {
          fs.unlinkSync(req.file.path);
          throw new AppError(`Image too large. Maximum: ${maxWidth}x${maxHeight}px`, 400);
        }
      } catch (err) {
        if (err instanceof AppError) throw err;
        fs.unlinkSync(req.file.path);
        throw new AppError('Invalid image file', 400);
      }
    }

    // Move file to permanent location
    const finalFilename = req.file.filename;
    const finalPath = path.join(UPLOAD_DIRS.documents, finalFilename);
    fs.renameSync(req.file.path, finalPath);

    // Keep absolute path for subsequent middleware processing
    req.file.path = finalPath;
    
    // Store relative paths for database portability - use new properties to avoid confusion
    req.file.dbPath = `documents/${finalFilename}`;
    req.file.url = `/uploads/documents/${finalFilename}`;
    req.file.documentType = documentType;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Process passport photo (resize and optimize)
 */
const processPassportPhoto = async (req, res, next) => {
  try {
    if (!req.file || (req.body.documentType !== 'PASSPORT_PHOTO' && req.body.documentType !== 'passportPhoto')) {
      return next();
    }

    const inputPath = req.file.path;
    const outputFilename = `processed-${req.file.filename}`;
    const outputPath = path.join(UPLOAD_DIRS.processed, outputFilename);

    await sharp(inputPath)
      .resize(600, 600, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    // Keep original but add processed path
    req.file.processedPath = `processed/${outputFilename}`;
    req.file.processedUrl = `/uploads/processed/${outputFilename}`;

    logger.info(`Processed passport photo: ${outputFilename}`);
    next();
  } catch (error) {
    logger.error('Passport photo processing error:', error);
    next(); // Continue even if processing fails
  }
};

/**
 * Scan file for malware patterns (basic)
 */
const scanForMalware = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const buffer = fs.readFileSync(req.file.path);
    const content = buffer.toString('utf8', 0, 1000);

    // Check for suspicious patterns
    const suspiciousPatterns = [
      '<?php',
      '<script',
      'eval(',
      'base64_decode',
      'system(',
      'exec('
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => 
      content.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isSuspicious) {
      fs.unlinkSync(req.file.path);
      throw new AppError('File rejected: contains suspicious content', 400);
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next();
  }
};

/**
 * Get absolute path from relative path
 */
const getAbsolutePath = (relativePath) => {
  // 1. Resolve the path to handle .. and . segments
  const resolvedPath = path.resolve(UPLOAD_BASE, relativePath);
  
  // 2. Ensure the resolved path actually starts with our UPLOAD_BASE
  // This prevents ../../etc/passwd type attacks
  if (!resolvedPath.startsWith(path.resolve(UPLOAD_BASE))) {
    logger.warn(`Potential Path Traversal Attempt: ${relativePath} -> ${resolvedPath}`);
    throw new AppError('Invalid file path: Access denied', 403);
  }

  return resolvedPath;
};

/**
 * Delete file utility
 */
const deleteFile = (filePath) => {
  try {
    const absolutePath = getAbsolutePath(filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      return true;
    }
    return false;
  } catch (error) {
    logger.error('File deletion error:', error);
    return false;
  }
};

/**
 * Single file upload middleware chain
 */
const singleUpload = [
  upload.single('file'),
  scanForMalware,
  validateUploadedFile,
  processPassportPhoto
];

module.exports = {
  upload,
  singleUpload,
  validateUploadedFile,
  processPassportPhoto,
  scanForMalware,
  deleteFile,
  getAbsolutePath,
  FILE_TYPES,
  UPLOAD_DIRS,
  generateSecureFilename
};
