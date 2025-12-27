// Application Constants
const APP_NAME = 'Ghana Police Service Recruitment Portal';
const APP_VERSION = '1.0.0';

// Voucher Configuration
const VOUCHER_PREFIX = 'GPS';
const VOUCHER_EXPIRY_DAYS = 31;

// Age Cutoff Date (1st November 2025)
const AGE_CUTOFF_DATE = new Date('2025-11-01');

// Recruitment Categories
const CATEGORIES = {
  GENERAL_DUTY: 'GENERAL_DUTY',
  TRADESMEN: 'TRADESMEN',
  GRADUATES: 'GRADUATES',
  MEDICAL_PROFESSIONALS: 'MEDICAL_PROFESSIONALS',
  RELIGIOUS_AFFAIRS: 'RELIGIOUS_AFFAIRS',
  SPORTSMEN: 'SPORTSMEN'
};

// Tradesmen Subcategories
const TRADESMEN_SUBCATEGORIES = {
  MOTOR_MECHANICS: 'MOTOR_MECHANICS',
  DRIVERS_RIDERS: 'DRIVERS_RIDERS',
  ELECTRICIANS: 'ELECTRICIANS',
  PLUMBERS_MASONS: 'PLUMBERS_MASONS',
  PAINTERS: 'PAINTERS',
  TAILORS: 'TAILORS',
  CARPENTERS: 'CARPENTERS',
  WELDERS: 'WELDERS',
  REFRIGERATION: 'REFRIGERATION'
};

// Medical Subcategories
const MEDICAL_SUBCATEGORIES = {
  DOCTORS: 'DOCTORS',
  SPECIALISTS: 'SPECIALISTS',
  PHARMACISTS: 'PHARMACISTS',
  NURSES: 'NURSES',
  SPECIALIZED_NURSES: 'SPECIALIZED_NURSES',
  LABORATORY_SCIENTISTS: 'LABORATORY_SCIENTISTS',
  PHYSICIAN_ASSISTANTS: 'PHYSICIAN_ASSISTANTS',
  ANAESTHETISTS: 'ANAESTHETISTS',
  HEALTH_INFORMATICS: 'HEALTH_INFORMATICS',
  NUTRITIONISTS: 'NUTRITIONISTS',
  PHYSIOTHERAPISTS: 'PHYSIOTHERAPISTS',
  PUBLIC_HEALTH: 'PUBLIC_HEALTH',
  HISTOPATHOLOGISTS: 'HISTOPATHOLOGISTS',
  PHARMACY_TECHNOLOGISTS: 'PHARMACY_TECHNOLOGISTS',
  SONOGRAPHERS: 'SONOGRAPHERS'
};

// Graduate Subcategories
const GRADUATE_SUBCATEGORIES = {
  DEGREE_HOLDERS: 'DEGREE_HOLDERS',
  HND_HOLDERS: 'HND_HOLDERS',
  DIPLOMA_HOLDERS: 'DIPLOMA_HOLDERS'
};

// Religious Subcategories
const RELIGIOUS_SUBCATEGORIES = {
  CHAPLAIN: 'CHAPLAIN',
  IMAM: 'IMAM'
};

// Sports Disciplines
const SPORTS_DISCIPLINES = [
  'BOXING', 'FOOTBALL', 'HANDBALL', 'BASKETBALL', 'HOCKEY',
  'TENNIS', 'TABLE_TENNIS', 'VOLLEYBALL', 'ATHLETICS',
  'BADMINTON', 'ARM_WRESTLING', 'MARTIAL_ARTS'
];

// Application Status
const APPLICATION_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  DOCUMENTS_REQUIRED: 'DOCUMENTS_REQUIRED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SHORTLISTED: 'SHORTLISTED'
};

// Admin Roles
const ADMIN_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  MODERATOR: 'MODERATOR',
  VIEWER: 'VIEWER',
  REGIONAL_ADMIN: 'REGIONAL_ADMIN',
  VOUCHER_MANAGER: 'VOUCHER_MANAGER'
};

// Regional Screening Centers (16 Regions)
const REGIONS = [
  { code: 'ASH', name: 'Ashanti Region', capital: 'Kumasi' },
  { code: 'BAR', name: 'Brong Ahafo Region', capital: 'Sunyani' },
  { code: 'CEN', name: 'Central Region', capital: 'Cape Coast' },
  { code: 'EAS', name: 'Eastern Region', capital: 'Koforidua' },
  { code: 'GAR', name: 'Greater Accra Region', capital: 'Accra' },
  { code: 'NOR', name: 'Northern Region', capital: 'Tamale' },
  { code: 'SAV', name: 'Savannah Region', capital: 'Damongo' },
  { code: 'UEA', name: 'Upper East Region', capital: 'Bolgatanga' },
  { code: 'UWE', name: 'Upper West Region', capital: 'Wa' },
  { code: 'VOL', name: 'Volta Region', capital: 'Ho' },
  { code: 'WES', name: 'Western Region', capital: 'Sekondi-Takoradi' },
  { code: 'WNO', name: 'Western North Region', capital: 'Sefwi Wiawso' },
  { code: 'OTI', name: 'Oti Region', capital: 'Dambai' },
  { code: 'NEA', name: 'North East Region', capital: 'Nalerigu' },
  { code: 'BOE', name: 'Bono East Region', capital: 'Techiman' },
  { code: 'AHA', name: 'Ahafo Region', capital: 'Goaso' }
];

// Height Requirements (in cm)
const HEIGHT_REQUIREMENTS = {
  MALE: { MIN: 173 },
  FEMALE: { MIN: 163 }
};

// Age Requirements
const AGE_REQUIREMENTS = {
  GENERAL_DUTY: { min: 18, max: 30 },
  TRADESMEN: { min: 18, max: 35 },
  SPORTSMEN: { min: 18, max: 30 },
  GRADUATES: {
    DEGREE: { min: 18, max: 35 },
    HND: { min: 18, max: 32 },
    DIPLOMA: { min: 18, max: 32 }
  },
  MEDICAL_PROFESSIONALS: {
    DEFAULT: { min: 18, max: 35 },
    SPECIALISTS: { min: 18, max: 40 },
    NURSES_HND: { min: 18, max: 32 }
  },
  RELIGIOUS_AFFAIRS: { min: 18, max: 40 }
};

// WASSCE Grade Scale
const WASSCE_GRADES = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];
const WASSCE_PASSING_GRADES = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8'];

// BECE Grade Scale
const BECE_GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const BECE_PASSING_GRADES = ['1', '2', '3', '4', '5', '6', '7', '8'];

// Core Subjects
const CORE_SUBJECTS = ['CORE MATHEMATICS', 'CORE ENGLISH'];
const REQUIRED_SUBJECTS_COUNT = 5; // Core Math + Core English + 3 additional

// Phone Number Patterns
const PHONE_PATTERNS = [
  /^\+233-\d{2}-\d{3}-\d{4}$/,
  /^233-\d{2}-\d{3}-\d{4}$/,
  /^0\d{2}-\d{3}-\d{4}$/
];

// Document Types
const DOCUMENT_TYPES = {
  PASSPORT_PHOTO: 'PASSPORT_PHOTO',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  NATIONAL_ID: 'NATIONAL_ID',
  WASSCE_CERTIFICATE: 'WASSCE_CERTIFICATE',
  BECE_CERTIFICATE: 'BECE_CERTIFICATE',
  DEGREE_CERTIFICATE: 'DEGREE_CERTIFICATE',
  HND_CERTIFICATE: 'HND_CERTIFICATE',
  PROFESSIONAL_LICENSE: 'PROFESSIONAL_LICENSE',
  DRIVER_LICENSE: 'DRIVER_LICENSE',
  NATIONAL_SERVICE_CERTIFICATE: 'NATIONAL_SERVICE_CERTIFICATE'
};

// Upload Constraints
const UPLOAD_CONSTRAINTS = {
  MAX_SIZE: 1048576, // 1MB
  MIN_DIMENSION: 300,
  MAX_DIMENSION: 600,
  ALLOWED_TYPES: ['image/jpeg', 'image/png']
};

module.exports = {
  APP_NAME,
  APP_VERSION,
  VOUCHER_PREFIX,
  VOUCHER_EXPIRY_DAYS,
  AGE_CUTOFF_DATE,
  CATEGORIES,
  TRADESMEN_SUBCATEGORIES,
  MEDICAL_SUBCATEGORIES,
  GRADUATE_SUBCATEGORIES,
  RELIGIOUS_SUBCATEGORIES,
  SPORTS_DISCIPLINES,
  APPLICATION_STATUS,
  ADMIN_ROLES,
  REGIONS,
  HEIGHT_REQUIREMENTS,
  AGE_REQUIREMENTS,
  WASSCE_GRADES,
  WASSCE_PASSING_GRADES,
  BECE_GRADES,
  BECE_PASSING_GRADES,
  CORE_SUBJECTS,
  REQUIRED_SUBJECTS_COUNT,
  PHONE_PATTERNS,
  DOCUMENT_TYPES,
  UPLOAD_CONSTRAINTS
};
