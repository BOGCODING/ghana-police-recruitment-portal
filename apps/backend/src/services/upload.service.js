const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { UPLOAD_CONSTRAINTS } = require('../config/constants');

/**
 * Upload Service - Handles file uploads and integration with Cloudinary
 */
const UploadService = {
  /**
   * Upload a file to Cloudinary with validation
   * @param {string} filePath - Local path to the file
   * @param {string} folder - Destination folder on Cloudinary
   */
  async upload(filePath, folder = 'recruitment') {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }

      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg'; // Simplistic check

      // Validate constraints
      if (stats.size > UPLOAD_CONSTRAINTS.MAX_SIZE) {
        throw new Error(`File size too large. Max: ${UPLOAD_CONSTRAINTS.MAX_SIZE / 1024 / 1024}MB`);
      }

      if (!UPLOAD_CONSTRAINTS.ALLOWED_TYPES.includes(mimeType)) {
        throw new Error('Invalid file type');
      }

      const result = await cloudinary.uploader.upload(filePath, {
        folder: `gps_portal/${folder}`,
        resource_type: 'auto'
      });

      // Delete local file after successful upload
      fs.unlinkSync(filePath);
      
      return result;
    } catch (error) {
      // Ensure local file is cleaned up even on failure
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      logger.error('Upload failed:', error);
      throw error;
    }
  }
};

module.exports = UploadService;
