/**
 * Education Validation Utilities
 * Comprehensive validation for WASSCE, BECE, and tertiary qualifications
 */

// WASSCE Grade Scale (West African Examination Council)
const WASSCE_GRADES = {
  'A1': { points: 1, description: 'Excellent', passing: true },
  'B2': { points: 2, description: 'Very Good', passing: true },
  'B3': { points: 3, description: 'Good', passing: true },
  'C4': { points: 4, description: 'Credit', passing: true },
  'C5': { points: 5, description: 'Credit', passing: true },
  'C6': { points: 6, description: 'Credit', passing: true },
  'D7': { points: 7, description: 'Pass', passing: false },
  'E8': { points: 8, description: 'Weak Pass', passing: false },
  'F9': { points: 9, description: 'Fail', passing: false }
};

// BECE Grade Scale
const BECE_GRADES = {
  '1': { description: 'Highest', passing: true },
  '2': { description: 'Very High', passing: true },
  '3': { description: 'High', passing: true },
  '4': { description: 'Above Average', passing: true },
  '5': { description: 'Average', passing: true },
  '6': { description: 'Below Average', passing: true },
  '7': { description: 'Low', passing: false },
  '8': { description: 'Very Low', passing: false },
  '9': { description: 'Lowest', passing: false }
};

// Core Subjects required for all categories
const CORE_SUBJECTS = [
  'ENGLISH LANGUAGE',
  'MATHEMATICS (CORE)',
  'INTEGRATED SCIENCE',
  'SOCIAL STUDIES'
];

// All available WASSCE subjects
const WASSCE_SUBJECTS = [
  // Core
  'ENGLISH LANGUAGE',
  'MATHEMATICS (CORE)',
  'INTEGRATED SCIENCE',
  'SOCIAL STUDIES',
  // Electives - Science
  'MATHEMATICS (ELECTIVE)',
  'PHYSICS',
  'CHEMISTRY',
  'BIOLOGY',
  'AGRICULTURAL SCIENCE',
  // Electives - Arts
  'GEOGRAPHY',
  'ECONOMICS',
  'GOVERNMENT',
  'HISTORY',
  'LITERATURE IN ENGLISH',
  'FRENCH',
  'TWI',
  'GA',
  'EWE',
  'FANTE',
  // Electives - Business
  'ACCOUNTING',
  'BUSINESS MANAGEMENT',
  'COSTING',
  'TYPEWRITING',
  // Electives - Technical
  'TECHNICAL DRAWING',
  'BUILDING CONSTRUCTION',
  'METALWORK',
  'WOODWORK',
  'ELECTRONICS',
  // Electives - Home Economics
  'FOOD AND NUTRITION',
  'CLOTHING AND TEXTILES',
  'MANAGEMENT IN LIVING',
  // Electives - Visual Arts
  'GRAPHIC DESIGN',
  'PICTURE MAKING',
  'SCULPTURE',
  'LEATHERWORK',
  'TEXTILES',
  'CERAMICS',
  'GENERAL KNOWLEDGE IN ART'
];

/**
 * Validate a single WASSCE grade
 */
const isValidWassceGrade = (grade) => {
  return grade && Object.prototype.hasOwnProperty.call(WASSCE_GRADES, grade.toUpperCase());
};

/**
 * Check if a WASSCE grade is passing (C6 or better)
 */
const isPassingWassceGrade = (grade) => {
  if (!grade) return false;
  const gradeInfo = WASSCE_GRADES[grade.toUpperCase()];
  return gradeInfo ? gradeInfo.passing : false;
};

/**
 * Calculate aggregate score from WASSCE results
 */
const calculateWassceAggregate = (results) => {
  // Sort by points (best grades first)
  const sortedResults = [...results]
    .filter(r => r.grade && isValidWassceGrade(r.grade))
    .sort((a, b) => WASSCE_GRADES[a.grade].points - WASSCE_GRADES[b.grade].points);
  
  // Take best 6 subjects
  const best6 = sortedResults.slice(0, 6);
  
  if (best6.length < 6) {
    return { aggregate: null, error: 'Need at least 6 subjects' };
  }
  
  const aggregate = best6.reduce((sum, r) => sum + WASSCE_GRADES[r.grade].points, 0);
  return { aggregate, subjects: best6 };
};

/**
 * Validate WASSCE results for police recruitment
 */
const validateWassceForRecruitment = (results, category = 'GENERAL_DUTY') => {
  const errors = [];
  const warnings = [];
  
  // Check for core subjects
  const coreResults = [];
  CORE_SUBJECTS.forEach(subject => {
    const result = results.find(r => r.subject?.toUpperCase() === subject);
    if (!result) {
      errors.push(`Missing core subject: ${subject}`);
    } else if (!result.grade) {
      errors.push(`No grade for ${subject}`);
    } else {
      coreResults.push(result);
    }
  });
  
  // Validate English Language (mandatory pass)
  const englishResult = results.find(r => r.subject === 'ENGLISH LANGUAGE');
  if (englishResult && !isPassingWassceGrade(englishResult.grade)) {
    errors.push('English Language must be C6 or better');
  }
  
  // Validate Core Mathematics (mandatory pass)
  const mathResult = results.find(r => r.subject === 'MATHEMATICS (CORE)');
  if (mathResult && !isPassingWassceGrade(mathResult.grade)) {
    errors.push('Core Mathematics must be C6 or better');
  }
  
  // Count total passes
  const passingResults = results.filter(r => isPassingWassceGrade(r.grade));
  if (passingResults.length < 6) {
    errors.push(`Minimum 6 passes required (you have ${passingResults.length})`);
  }
  
  // Category-specific requirements
  if (category === 'GRADUATES') {
    // Graduates may have relaxed WASSCE requirements
    // Still need basic passes
  } else if (category === 'TRADESMEN') {
    // Check for technical subjects for tradesmen
    const technicalSubjects = ['TECHNICAL DRAWING', 'METALWORK', 'WOODWORK', 'ELECTRONICS'];
    const hasTechnical = results.some(r => technicalSubjects.includes(r.subject));
    if (!hasTechnical) {
      warnings.push('Technical subjects recommended for Tradesmen category');
    }
  }
  
  // Calculate aggregate
  const aggregateResult = calculateWassceAggregate(results);
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    aggregate: aggregateResult.aggregate,
    passingCount: passingResults.length,
    totalSubjects: results.filter(r => r.subject && r.grade).length
  };
};

/**
 * Validate BECE results
 */
const validateBeceResults = (results) => {
  const errors = [];
  
  if (!results || results.length === 0) {
    return { isValid: false, errors: ['BECE results required'] };
  }
  
  // Check for minimum subjects (usually 8 or 9)
  const validResults = results.filter(r => r.subject && r.grade);
  if (validResults.length < 4) {
    errors.push('At least 4 BECE subjects required');
  }
  
  // Calculate aggregate (best 6 subjects)
  const sortedResults = [...validResults]
    .sort((a, b) => parseInt(a.grade) - parseInt(b.grade))
    .slice(0, 6);
  
  const aggregate = sortedResults.reduce((sum, r) => sum + parseInt(r.grade), 0);
  
  return {
    isValid: errors.length === 0,
    errors,
    aggregate,
    subjectCount: validResults.length
  };
};

/**
 * Validate examination year
 */
const validateExaminationYear = (year) => {
  const currentYear = new Date().getFullYear();
  const yearNum = parseInt(year);
  
  if (isNaN(yearNum)) {
    return { isValid: false, error: 'Invalid year' };
  }
  
  if (yearNum < 1990) {
    return { isValid: false, error: 'Year must be 1990 or later' };
  }
  
  if (yearNum > currentYear) {
    return { isValid: false, error: 'Year cannot be in the future' };
  }
  
  // Calculate years since examination
  const yearsSince = currentYear - yearNum;
  
  // For police recruitment, results shouldn't be too old
  const warnings = [];
  if (yearsSince > 10) {
    warnings.push('Results are over 10 years old');
  }
  
  return { isValid: true, yearsSince, warnings };
};

/**
 * Validate index number format
 */
const validateIndexNumber = (indexNumber) => {
  if (!indexNumber) {
    return { isValid: false, error: 'Index number required' };
  }
  
  // WAEC index numbers typically follow patterns like:
  // 0123456789 or similar numeric/alphanumeric formats
  const cleaned = indexNumber.toString().replace(/[\s-]/g, '').toUpperCase();
  
  if (cleaned.length < 5) {
    return { isValid: false, error: 'Index number too short' };
  }
  
  if (cleaned.length > 20) {
    return { isValid: false, error: 'Index number too long' };
  }
  
  return { isValid: true, normalized: cleaned };
};

/**
 * Get all available subjects
 */
const getAvailableSubjects = () => {
  return WASSCE_SUBJECTS;
};

/**
 * Get core subjects
 */
const getCoreSubjects = () => {
  return CORE_SUBJECTS;
};

/**
 * Get grade options
 */
const getWassceGrades = () => {
  return Object.keys(WASSCE_GRADES);
};

const getBeceGrades = () => {
  return Object.keys(BECE_GRADES);
};

module.exports = {
  WASSCE_GRADES,
  BECE_GRADES,
  CORE_SUBJECTS,
  WASSCE_SUBJECTS,
  isValidWassceGrade,
  isPassingWassceGrade,
  calculateWassceAggregate,
  validateWassceForRecruitment,
  validateBeceResults,
  validateExaminationYear,
  validateIndexNumber,
  getAvailableSubjects,
  getCoreSubjects,
  getWassceGrades,
  getBeceGrades
};
