/**
 * Category Requirements Configuration
 * Defines education requirements and document requirements per recruitment category
 */

// Base required documents for ALL categories
export const BASE_REQUIRED_DOCUMENTS = [
  { key: 'passportPhoto', label: 'Passport Photo', accept: 'image/*', required: true },
  { key: 'birthCertificate', label: 'Birth Certificate', accept: 'image/*,application/pdf', required: true },
  { key: 'beceCertificate', label: 'BECE Certificate', accept: 'image/*,application/pdf', required: true },
  { key: 'wassceCertificate', label: 'WASSCE Certificate', accept: 'image/*,application/pdf', required: true },
  { key: 'ghanaCard', label: 'Ghana Card (Front & Back)', accept: 'image/*,application/pdf', required: true },
];

// Category-specific requirements
export const CATEGORY_REQUIREMENTS = {
  GENERAL_DUTY: {
    name: 'General Duty',
    description: 'Standard police officers',
    ageRange: { min: 18, max: 30 },
    minHeight: { male: 173, female: 163 },
    educationLevels: ['BECE', 'WASSCE'],
    showTertiaryForm: false,
    additionalDocuments: [],
    optionalDocuments: [
      { key: 'driversLicense', label: "Driver's License", accept: 'image/*,application/pdf' },
    ]
  },
  
  TRADESMEN: {
    name: 'Tradesmen',
    description: 'Technical and skilled trades',
    ageRange: { min: 18, max: 35 },
    minHeight: { male: 173, female: 163 },
    educationLevels: ['BECE', 'WASSCE'],
    showTertiaryForm: false,
    additionalDocuments: [
      { key: 'tradeCertificate', label: 'Trade/Technical Certificate (NVTI, etc.)', accept: 'image/*,application/pdf', required: true },
    ],
    optionalDocuments: [
      { key: 'driversLicense', label: "Driver's License", accept: 'image/*,application/pdf' },
      { key: 'additionalTradeCert', label: 'Additional Trade Certificate', accept: 'image/*,application/pdf' },
    ],
    // Driver subcategory requires license
    subcategoryRequirements: {
      DRIVERS_RIDERS: {
        additionalDocuments: [
          { key: 'driversLicense', label: "Driver's License", accept: 'image/*,application/pdf', required: true },
        ]
      }
    }
  },
  
  GRADUATES: {
    name: 'Graduates',
    description: 'Degree/HND/Diploma holders',
    ageRange: { min: 18, max: 35 },
    minHeight: { male: 173, female: 163 },
    educationLevels: ['BECE', 'WASSCE', 'TERTIARY'],
    showTertiaryForm: true,
    additionalDocuments: [
      { key: 'tertiaryCertificate', label: 'Tertiary Certificate', accept: 'image/*,application/pdf', required: true },
      { key: 'nationalServiceCertificate', label: 'National Service Certificate', accept: 'image/*,application/pdf', required: true },
    ],
    optionalDocuments: [
      { key: 'transcript', label: 'Academic Transcript', accept: 'image/*,application/pdf' },
      { key: 'additionalCertificates', label: 'Additional Certificates', accept: 'image/*,application/pdf' },
    ]
  },
  
  MEDICAL_PROFESSIONALS: {
    name: 'Medical Professionals',
    description: 'Doctors, nurses, pharmacists',
    ageRange: { min: 18, max: 35 },
    minHeight: { male: 163, female: 163 }, // Lower height requirement for medical
    educationLevels: ['BECE', 'WASSCE', 'TERTIARY'],
    showTertiaryForm: true,
    additionalDocuments: [
      { key: 'tertiaryCertificate', label: 'Medical/Professional Degree Certificate', accept: 'image/*,application/pdf', required: true },
      { key: 'professionalLicense', label: 'Professional License/PIN Registration', accept: 'image/*,application/pdf', required: true },
      { key: 'nationalServiceCertificate', label: 'National Service Certificate', accept: 'image/*,application/pdf', required: true },
    ],
    optionalDocuments: [
      { key: 'postgraduateCert', label: 'Postgraduate/Specialty Certificate', accept: 'image/*,application/pdf' },
    ]
  },
  
  RELIGIOUS_AFFAIRS: {
    name: 'Religious Affairs',
    description: 'Chaplains and Imams',
    ageRange: { min: 18, max: 40 },
    minHeight: { male: 163, female: 163 },
    educationLevels: ['BECE', 'WASSCE', 'TERTIARY'], // May have seminary/religious education
    showTertiaryForm: true,
    additionalDocuments: [
      { key: 'ordinationCertificate', label: 'Ordination/Religious Certification', accept: 'image/*,application/pdf', required: true },
    ],
    optionalDocuments: [
      { key: 'tertiaryCertificate', label: 'Tertiary Certificate (if applicable)', accept: 'image/*,application/pdf' },
      { key: 'religiousEndorsement', label: 'Religious Body Endorsement Letter', accept: 'image/*,application/pdf' },
    ]
  },
  
  SPORTSMEN: {
    name: 'Sportsmen',
    description: 'Athletes with national achievements',
    ageRange: { min: 18, max: 30 },
    minHeight: { male: 173, female: 163 },
    educationLevels: ['BECE', 'WASSCE'],
    showTertiaryForm: false,
    additionalDocuments: [
      { key: 'sportsAchievementCert', label: 'Sports Achievement Certificate(s)', accept: 'image/*,application/pdf', required: true },
    ],
    optionalDocuments: [
      { key: 'nationalTeamLetter', label: 'National Team Selection Letter', accept: 'image/*,application/pdf' },
      { key: 'federationEndorsement', label: 'Sports Federation Endorsement', accept: 'image/*,application/pdf' },
    ]
  }
};

/**
 * Get all required documents for a given category
 * @param {string} category - The category ID
 * @param {string} subCategory - Optional subcategory ID
 * @returns {Array} Array of required document configs
 */
export function getRequiredDocuments(category, subCategory = null) {
  const categoryConfig = CATEGORY_REQUIREMENTS[category];
  if (!categoryConfig) {
    return BASE_REQUIRED_DOCUMENTS;
  }
  
  let documents = [...BASE_REQUIRED_DOCUMENTS, ...categoryConfig.additionalDocuments];
  
  // Add subcategory-specific required documents
  if (subCategory && categoryConfig.subcategoryRequirements?.[subCategory]) {
    documents = [...documents, ...categoryConfig.subcategoryRequirements[subCategory].additionalDocuments];
  }
  
  return documents;
}

/**
 * Get optional documents for a given category
 * @param {string} category - The category ID
 * @returns {Array} Array of optional document configs
 */
export function getOptionalDocuments(category) {
  const categoryConfig = CATEGORY_REQUIREMENTS[category];
  if (!categoryConfig) {
    return [];
  }
  
  return categoryConfig.optionalDocuments || [];
}

/**
 * Check if tertiary education form should be shown for a category
 * @param {string} category - The category ID
 * @returns {boolean}
 */
export function shouldShowTertiaryForm(category) {
  const categoryConfig = CATEGORY_REQUIREMENTS[category];
  return categoryConfig?.showTertiaryForm || false;
}

/**
 * Get category display info
 * @param {string} category - The category ID
 * @returns {Object} Category info
 */
export function getCategoryInfo(category) {
  return CATEGORY_REQUIREMENTS[category] || null;
}

export default CATEGORY_REQUIREMENTS;
