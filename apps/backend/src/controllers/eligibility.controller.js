const { query } = require('../config/database');
const EligibilityService = require('../services/eligibility.service');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * Check eligibility for the current applicant
 */
const getEligibilityStatus = async (req, res) => {
  try {
    // Fetch full application data
    const appResult = await query(
      'SELECT id, category, "subCategory", status FROM applications WHERE "applicantId" = $1',
      [req.user.id]
    );

    if (appResult.rows.length === 0) {
      return errorResponse(res, 'Application not found. Please start an application first.', 404);
    }

    const app = appResult.rows[0];
    const appId = app.id;

    const [personalInfo, education] = await Promise.all([
      query('SELECT * FROM personal_info WHERE "applicationId" = $1', [appId]),
      query('SELECT * FROM education WHERE "applicationId" = $1', [appId])
    ]);


    const data = {
      application: app,
      personalInfo: personalInfo.rows[0],
      education: education.rows[0]
    };


    const report = EligibilityService.check(data);

    return successResponse(res, report, 'Eligibility status retrieved');

  } catch (error) {
    logger.error('Get eligibility status error:', error);
    return errorResponse(res, 'Failed to check eligibility', 500);
  }
};

/**
 * Perform pre-checks (stateless) based on provided data
 */
const performPreCheck = async (req, res) => {
  try {
    const data = req.body;
    // This allows applicants to check eligibility BEFORE registering or filling full form
    const mockData = {
      application: { category: data.category, subCategory: data.subCategory },
      personalInfo: { 
        dateOfBirth: data.dateOfBirth, 
        gender: data.gender, 
        nationality: data.nationality,
        heightCm: data.heightCm
      },
      education: { wassceResults: data.wassceResults }
    };


    const report = EligibilityService.check(mockData);
    return successResponse(res, report, 'Pre-check completed');
  } catch (error) {
    return errorResponse(res, 'Pre-check failed', 500);
  }
};

module.exports = {
  getEligibilityStatus,
  performPreCheck
};
