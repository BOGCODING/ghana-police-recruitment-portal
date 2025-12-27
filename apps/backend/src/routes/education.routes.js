const express = require('express');
const router = express.Router();
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { 
  validateWassceForRecruitment, 
  validateBeceResults,
  validateExaminationYear,
  validateIndexNumber,
  getAvailableSubjects,
  getCoreSubjects,
  getWassceGrades,
  getBeceGrades
} = require('../utils/educationValidator');
const { searchSchools, getSchoolsByRegion, getAllSchools } = require('../utils/schoolsDatabase');

/**
 * GET /api/education/subjects
 * Get available WASSCE subjects
 */
router.get('/subjects', (req, res) => {
  return successResponse(res, {
    subjects: getAvailableSubjects(),
    coreSubjects: getCoreSubjects()
  });
});

/**
 * GET /api/education/grades
 * Get available grade options
 */
router.get('/grades', (req, res) => {
  return successResponse(res, {
    wassce: getWassceGrades(),
    bece: getBeceGrades()
  });
});

/**
 * POST /api/education/validate-wassce
 * Validate WASSCE results
 */
router.post('/validate-wassce', (req, res) => {
  try {
    const { results, category } = req.body;
    
    if (!results || !Array.isArray(results)) {
      return errorResponse(res, 'Results array required', 400);
    }
    
    const validation = validateWassceForRecruitment(results, category);
    return successResponse(res, validation);
  } catch (error) {
    return errorResponse(res, 'Validation failed', 500);
  }
});

/**
 * POST /api/education/validate-bece
 * Validate BECE results
 */
router.post('/validate-bece', (req, res) => {
  try {
    const { results } = req.body;
    
    if (!results || !Array.isArray(results)) {
      return errorResponse(res, 'Results array required', 400);
    }
    
    const validation = validateBeceResults(results);
    return successResponse(res, validation);
  } catch (error) {
    return errorResponse(res, 'Validation failed', 500);
  }
});

/**
 * POST /api/education/validate-year
 * Validate examination year
 */
router.post('/validate-year', (req, res) => {
  try {
    const { year, type } = req.body;
    const validation = validateExaminationYear(year, type);
    return successResponse(res, validation);
  } catch (error) {
    return errorResponse(res, 'Validation failed', 500);
  }
});

/**
 * POST /api/education/validate-index
 * Validate index number
 */
router.post('/validate-index', (req, res) => {
  try {
    const { indexNumber } = req.body;
    const validation = validateIndexNumber(indexNumber);
    return successResponse(res, validation);
  } catch (error) {
    return errorResponse(res, 'Validation failed', 500);
  }
});

/**
 * GET /api/education/schools/search
 * Search schools
 */
router.get('/schools/search', (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    const schools = searchSchools(q, parseInt(limit));
    return successResponse(res, schools);
  } catch (error) {
    return errorResponse(res, 'Search failed', 500);
  }
});

/**
 * GET /api/education/schools/region/:code
 * Get schools by region
 */
router.get('/schools/region/:code', (req, res) => {
  try {
    const schools = getSchoolsByRegion(req.params.code.toUpperCase());
    return successResponse(res, schools);
  } catch (error) {
    return errorResponse(res, 'Failed to get schools', 500);
  }
});

/**
 * GET /api/education/schools
 * Get all schools
 */
router.get('/schools', (req, res) => {
  try {
    const schools = getAllSchools();
    return successResponse(res, schools);
  } catch (error) {
    return errorResponse(res, 'Failed to get schools', 500);
  }
});

module.exports = router;
