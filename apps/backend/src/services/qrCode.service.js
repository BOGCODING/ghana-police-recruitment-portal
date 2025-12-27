const QRCode = require('qrcode');
const logger = require('../utils/logger');

/**
 * Generate a QR code as a Data URL
 * @param {string} text - The content of the QR code
 * @returns {Promise<string>} - Data URL of the QR code
 */
const generateQRCodeDataURL = async (text) => {
  try {
    const dataURL = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return dataURL;
  } catch (error) {
    logger.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate a QR code and save it to a file
 * @param {string} text - The content of the QR code
 * @param {string} filePath - Path to save the QR code
 */
const generateQRCodeToFile = async (text, filePath) => {
  try {
    await QRCode.toFile(filePath, text, {
      errorCorrectionLevel: 'H',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return true;
  } catch (error) {
    logger.error('QR Code file generation error:', error);
    throw new Error('Failed to save QR code to file');
  }
};

module.exports = {
  generateQRCodeDataURL,
  generateQRCodeToFile
};
