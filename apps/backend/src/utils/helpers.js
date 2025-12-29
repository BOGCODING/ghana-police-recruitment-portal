
const { 
  HEIGHT_REQUIREMENTS 
} = require('../config/constants');

/**
 * Calculate age as of a specific reference date

 */
const calculateAge = (birthDate, referenceDate = new Date()) => {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const ref = new Date(referenceDate);
  
  let age = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

/**
 * Check if applicant meets height requirements
 */
const meetsHeightRequirement = (heightCm, gender, category = 'GENERAL_DUTY') => {
  if (!heightCm) return false;
  const limits = gender === 'MALE' ? HEIGHT_REQUIREMENTS.MALE : HEIGHT_REQUIREMENTS.FEMALE;
  const minHeight = category === 'GENERAL_DUTY' ? limits.MIN : limits.SPEC_MIN || limits.MIN;
  return heightCm >= minHeight;
};

/**
 * Sanitize and normalize phone number to 233 format
 */
const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = phone.toString().replace(/\D/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = '233' + cleaned.substring(1);
  } else if (cleaned.length === 9) {
    cleaned = '233' + cleaned;
  }
  
  return cleaned;
};

/**
 * Format date to human readable string (e.g., Nov 12, 2025)
 */
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Deep merge or clone objects
 */
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Standard pagination parser
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  return {
    limit,
    offset: (page - 1) * limit,
    page
  };
};

/**
 * Safely convert string to uppercase
 */
const toUpperCase = (str) => {
  if (!str) return '';
  return String(str).toUpperCase();
};

/**
 * Format document to include full URL
 */
const formatDocument = (doc) => {
  if (!doc) return null;
  const baseUrl = (process.env.API_URL || '').trim().replace(/\/+$/, '');
  const relativeUrl = `/uploads/${doc.filePath.replace(/\\/g, '/')}`;
  return {
    ...doc,
    url: baseUrl ? `${baseUrl}${relativeUrl}` : relativeUrl
  };
};

module.exports = {
  calculateAge,
  meetsHeightRequirement,
  normalizePhoneNumber,

  formatDate,
  deepClone,
  parsePagination,
  formatDocument,
  toUpperCase
};
