const Joi = require('joi');
const { 
  CATEGORIES, 
  WASSCE_GRADES, 
  REGIONS 
} = require('../config/constants');

// Personal Information Schema
const personalInfoSchema = Joi.object({
  firstName: Joi.string().max(50).required()
    .messages({ 'any.required': 'First name is required' }),
  lastName: Joi.string().max(50).required()
    .messages({ 'any.required': 'Last name is required' }),
  middleName: Joi.string().max(50).allow('').optional(),
  dateOfBirth: Joi.date().max('now').required()
    .messages({ 'any.required': 'Date of birth is required' }),
  gender: Joi.string().valid('MALE', 'FEMALE').required(),
  maritalStatus: Joi.string().valid('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED').required(),
  nationality: Joi.string().required(),
  hometown: Joi.string().max(100).required(),
  region: Joi.string().valid(...REGIONS.map(r => r.code)).required(),
  ghanaCardNumber: Joi.string().max(20).required()
    .messages({ 'any.required': 'Ghana Card number is required' }),
  heightCm: Joi.number().min(100).max(250).optional(),
  weightKg: Joi.number().min(30).max(200).optional()
});


// Contact Information Schema
const contactInfoSchema = Joi.object({
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().pattern(/^(\+233|233|0)\d{2}[-\s]?\d{3}[-\s]?\d{4}$/).required(),
  alternatePhone: Joi.string().pattern(/^(\+233|233|0)\d{2}[-\s]?\d{3}[-\s]?\d{4}$/).allow('').optional(),
  residentialAddress: Joi.string().max(200).required(),
  postalAddress: Joi.string().max(200).allow('').optional(),
  digitalAddress: Joi.string().pattern(/^[A-Z]{2}-\d{3,4}-\d{4}$/).allow('').optional()
    .messages({ 'string.pattern.base': 'Invalid Ghana Post GPS address format' }),
  emergencyContactName: Joi.string().max(100).required(),
  emergencyContactPhone: Joi.string().pattern(/^(\+233|233|0)\d{2}[-\s]?\d{3}[-\s]?\d{4}$/).required(),
  emergencyContactRelation: Joi.string().max(50).required()
});


// Results nested schemas are no longer used as we favor a flat structure for initial form submission

// Education Schema
const educationSchema = Joi.object({
  // BECE
  beceSchool: Joi.string().max(200).required(),
  beceYear: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  beceIndexNumber: Joi.string().max(50).required(),
  beceCertificateNumber: Joi.string().max(50).required(),
  
  // WASSCE (Required for most categories)
  educationLevel: Joi.string().optional(),
  wassceSchool: Joi.string().max(200).allow('').optional(),
  wassceYear: Joi.alternatives().try(Joi.string(), Joi.number()).allow('').optional(),
  wassceIndexNumber: Joi.string().max(50).allow('').optional(),
  wassceCertificateNumber: Joi.string().max(50).allow('').optional(),
  
  // WASSCE Grades
  wassceEnglish: Joi.string().allow('').optional(),
  wassceMath: Joi.string().allow('').optional(),
  
  // Electives
  elective1Name: Joi.string().max(100).allow('').optional(),
  elective1Grade: Joi.string().valid(...WASSCE_GRADES).allow('').optional(),
  elective2Name: Joi.string().max(100).allow('').optional(),
  elective2Grade: Joi.string().valid(...WASSCE_GRADES).allow('').optional(),
  elective3Name: Joi.string().max(100).allow('').optional(),
  elective3Grade: Joi.string().valid(...WASSCE_GRADES).allow('').optional(),
  elective4Name: Joi.string().max(100).allow('').optional(),
  elective4Grade: Joi.string().valid(...WASSCE_GRADES).allow('').optional(),
  
  // Tertiary
  tertiaryInstitution: Joi.string().max(200).allow('').optional(),
  tertiaryQualification: Joi.string().allow('').optional(),
  tertiaryCourse: Joi.string().max(200).allow('').optional(),
  tertiaryClass: Joi.string().max(50).allow('').optional(),
  tertiaryYear: Joi.alternatives().try(Joi.number(), Joi.string()).allow(null, '').optional(),
  certificateNumber: Joi.string().max(50).allow('').optional(),
  nationalServiceYear: Joi.alternatives().try(Joi.number(), Joi.string()).allow(null, '').optional(),
  nationalServiceNumber: Joi.string().max(50).allow('').optional(),
  
  // Additional Flags
  hasWassce: Joi.boolean().optional(),
  hasNovDec: Joi.boolean().optional(),
  hasTertiary: Joi.boolean().optional(),
  hasProfessionalCert: Joi.boolean().optional(),
  hasCompletedNationalService: Joi.boolean().optional()
}).options({ stripUnknown: true });

// Category Selection Schema
const categorySelectionSchema = Joi.object({
  category: Joi.string().valid(...Object.values(CATEGORIES)).required(),
  subCategory: Joi.string().max(50).allow('').optional(),
  specialization: Joi.string().max(100).allow('').optional(),
  preferredRegion: Joi.string().valid(...REGIONS.map(r => r.code)).required(),
  alternateRegion: Joi.string().valid(...REGIONS.map(r => r.code)).allow('').optional(),
  
  // For Tradesmen
  tradeQualification: Joi.when('category', {
    is: CATEGORIES.TRADESMEN,
    then: Joi.string().max(100).required(),
    otherwise: Joi.string().allow('').optional()
  }),
  tradeExperienceYears: Joi.when('category', {
    is: CATEGORIES.TRADESMEN,
    then: Joi.number().min(0).max(50).required(),
    otherwise: Joi.number().allow(null, '').optional()
  }),
  
  // For Drivers
  hasDriversLicense: Joi.boolean().default(false),
  driversLicenseClass: Joi.when('hasDriversLicense', {
    is: true,
    then: Joi.string().valid('B', 'C', 'D', 'E', 'F').required(),
    otherwise: Joi.string().allow('').optional()
  }),
  driversLicenseNumber: Joi.when('hasDriversLicense', {
    is: true,
    then: Joi.string().max(50).required(),
    otherwise: Joi.string().allow('').optional()
  }),
  driversLicenseExpiry: Joi.alternatives().try(
    Joi.date().min('1990-01-01'),
    Joi.string().allow('', null)
  ).optional(),
  
  // For Sportsmen
  sportsDiscipline: Joi.when('category', {
    is: CATEGORIES.SPORTSMEN,
    then: Joi.string().max(50).required(),
    otherwise: Joi.string().allow('').optional()
  }),
  sportsAchievements: Joi.when('category', {
    is: CATEGORIES.SPORTSMEN,
    then: Joi.string().max(1000).required(),
    otherwise: Joi.string().allow('').optional()
  }),
  
  // For Medical Professionals
  professionalRegistrationNumber: Joi.when('category', {
    is: CATEGORIES.MEDICAL_PROFESSIONALS,
    then: Joi.string().max(50).required(),
    otherwise: Joi.string().allow('').optional()
  }),
  medicalQualification: Joi.when('category', {
    is: CATEGORIES.MEDICAL_PROFESSIONALS,
    then: Joi.string().max(100).required(),
    otherwise: Joi.string().allow('').optional()
  }),
  professionalRegistrationBody: Joi.string().max(100).allow('').optional(),
  postQualificationExperience: Joi.number().min(0).max(50).allow(null, '').optional(),
  
  // For Religious Affairs
  ordinationDetails: Joi.when('category', {
    is: CATEGORIES.RELIGIOUS_AFFAIRS,
    then: Joi.string().max(500).required(),
    otherwise: Joi.string().allow('').optional()
  }),
  religiousQualification: Joi.when('category', {
    is: CATEGORIES.RELIGIOUS_AFFAIRS,
    then: Joi.string().max(100).required(),
    otherwise: Joi.string().allow('').optional()
  }),
  religiousDenomination: Joi.string().max(100).allow('').optional()
});

// Declaration Schema
const declarationSchema = Joi.object({
  hasNoCriminalRecord: Joi.boolean().required(),
  hasNotBeenDismissed: Joi.boolean().required(),
  isGhanaianByBirth: Joi.boolean().required(),
  isOfGoodCharacter: Joi.boolean().required(),
  isPhysicallyFit: Joi.boolean().required(),
  acceptsTerms: Joi.boolean().required(),
  declarationDate: Joi.date().default(Date.now)
});

module.exports = {
  personalInfoSchema,
  contactInfoSchema,
  educationSchema,
  categorySelectionSchema,
  declarationSchema
};

