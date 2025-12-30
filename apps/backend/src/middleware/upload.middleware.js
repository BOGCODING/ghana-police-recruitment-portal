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

const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Configure storage based on environment
 * Production: Memory storage (for Cloudinary upload)
 * Development: Disk storage
 */
const isProduction = process.env.NODE_ENV === 'production';

const storage = isProduction 
  ? multer.memoryStorage()
  : multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOAD_DIRS.temp);
    },
    filename: (req, file, cb) => {
      cb(null, generateSecureFilename(file.originalname));
    }
  });

/**
 * Helper to upload buffer to Cloudinary
 */
const uploadToCloudinary = (buffer, folder, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `gps-portal/${folder}`,
        public_id: path.parse(filename).name, // proper public_id without extension
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

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
      if (!isProduction) fs.unlinkSync(req.file.path);
      throw new AppError(`File too large. Max size: ${config.maxSize / (1024 * 1024)}MB`, 400);
    }

    // SANITIZE: Enforce allowed list on original filename
    req.file.originalname = sanitizeFilename(req.file.originalname);
    
    // Validate Magic Bytes
    let buffer;
    if (isProduction) {
      buffer = req.file.buffer; // In memory
    } else {
      buffer = fs.readFileSync(req.file.path); // On disk
    }

    const detectedType = validateMagicBytes(buffer);

    if (!detectedType || !config.mimeTypes.includes(detectedType)) {
      if (!isProduction) fs.unlinkSync(req.file.path);
      throw new AppError('File content does not match file extension', 400);
    }

    // For images, validate dimensions
    if (detectedType.startsWith('image/') && config.dimensions) {
      try {
        const metadata = await sharp(buffer).metadata();
        const { minWidth, minHeight, maxWidth, maxHeight } = config.dimensions;

        if (metadata.width < minWidth || metadata.height < minHeight) {
          if (!isProduction) fs.unlinkSync(req.file.path);
          throw new AppError(`Image too small. Minimum: ${minWidth}x${minHeight}px`, 400);
        }

        if (metadata.width > maxWidth || metadata.height > maxHeight) {
          if (!isProduction) fs.unlinkSync(req.file.path);
          throw new AppError(`Image too large. Maximum: ${maxWidth}x${maxHeight}px`, 400);
        }
      } catch (err) {
        if (!isProduction) fs.unlinkSync(req.file.path);
        if (err instanceof AppError) throw err;
        throw new AppError('Invalid image file', 400);
      }
    }

    // File Handling Strategy
    const finalFilename = generateSecureFilename(req.file.originalname);

    if (isProduction) {
      // --- PRODUCTION: Upload to Cloudinary ---
      try {
        const result = await uploadToCloudinary(buffer, 'documents', finalFilename);
        
        // Normalize req.file properties for the controller
        req.file.filename = finalFilename; // Consistent filename
        req.file.path = result.secure_url; // Remote URL
        req.file.cloudinaryId = result.public_id; // For deletion
        req.file.dbPath = result.public_id; // Stored in DB
        req.file.url = result.secure_url; // Public URL
        
        logger.info(`Uploaded to Cloudinary: ${result.public_id}`);
      } catch (uploadErr) {
        logger.error('Cloudinary upload error:', uploadErr);
        throw new AppError('Failed to upload file to storage', 500);
      }

    } else {
      // --- DEVELOPMENT: Local Disk Storage ---
      const finalPath = path.join(UPLOAD_DIRS.documents, finalFilename);
      fs.renameSync(req.file.path, finalPath);

      req.file.path = finalPath;
      req.file.filename = finalFilename;
      req.file.dbPath = `documents/${finalFilename}`;
      req.file.url = `/uploads/documents/${finalFilename}`;
    }

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

    const outputFilename = `processed-${req.file.filename}`;
    
    // Process image buffer
    let inputBuffer;
    if (isProduction) {
      // If we already uploaded to Cloudinary, this is inefficient (uploading twice)
      // Ideally, we'd process BEFORE uploading, but for now let's use the buffer we have
      inputBuffer = req.file.buffer;
    } else {
      inputBuffer = fs.readFileSync(req.file.path);
    }

    const processedBuffer = await sharp(inputBuffer)
      .resize(600, 600, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 85 })
      .toBuffer();

    if (isProduction) {
      // Upload processed version to Cloudinary
      try {
        const result = await uploadToCloudinary(processedBuffer, 'processed', outputFilename);
        
        req.file.processedPath = result.public_id;
        req.file.processedUrl = result.secure_url;
        logger.info(`Processed passport photo uploaded: ${result.public_id}`);
      } catch (err) {
        logger.error('Failed to upload processed passport photo', err);
      }
    } else {
      // Save processed version to disk
      const outputPath = path.join(UPLOAD_DIRS.processed, outputFilename);
      fs.writeFileSync(outputPath, processedBuffer);
      
      req.file.processedPath = `processed/${outputFilename}`;
      req.file.processedUrl = `/uploads/processed/${outputFilename}`;
      logger.info(`Processed passport photo saved: ${outputFilename}`);
    }

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

    let buffer;
    if (isProduction) {
      buffer = req.file.buffer;
    } else {
      buffer = fs.readFileSync(req.file.path);
    }

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
      if (!isProduction) fs.unlinkSync(req.file.path);
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
  // If it's a Cloudinary URL or ID, return null or handle appropriately
  if (relativePath.startsWith('http') || !relativePath.includes('/') || relativePath.startsWith('gps-portal')) {
    return null; // Not a local path
  }

  // 1. Resolve the path to handle .. and . segments
  const resolvedPath = path.resolve(UPLOAD_BASE, relativePath);
  
  // 2. Ensure the resolved path actually starts with our UPLOAD_BASE
  if (!resolvedPath.startsWith(path.resolve(UPLOAD_BASE))) {
    logger.warn(`Potential Path Traversal Attempt: ${relativePath} -> ${resolvedPath}`);
    throw new AppError('Invalid file path: Access denied', 403);
  }

  return resolvedPath;
};

/**
 * Delete file utility
 */
const deleteFile = async (filePath) => {
  try {
    if (!filePath) return false;

    if (isProduction) {
      // Cloudinary deletion
      // Check if it's a full URL or public ID. We need public ID.
      // Assuming dbPath stores public_id (e.g. "gps-portal/documents/filename")
      // If filePath is a URL, extract public ID
      let publicId = filePath;
      
      if (filePath.startsWith('http')) {
        // Very basic extraction, might just use dbPath
        // Ideally we store public_id in DB. 
        // For now, let's assume filePath passed here IS the dbPath which we set to public_id
      }
      
      // If it looks like a local path but we are in prod, ignore or warn?
      if (filePath.includes('uploads/')) {
        return false; // Can't delete local files in prod
      }

      await cloudinary.uploader.destroy(publicId);
      logger.info(`Deleted file from Cloudinary: ${publicId}`);
      return true;

    } else {
      // Local deletion
      const absolutePath = getAbsolutePath(filePath);
      if (absolutePath && fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
        return true;
      }
      return false;
    }
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
