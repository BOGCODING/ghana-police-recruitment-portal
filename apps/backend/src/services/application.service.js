const { calculateAge, formatDocument } = require('../utils/helpers');
const { validateWassceForRecruitment } = require('../utils/educationValidator');
const { 
  AGE_REQUIREMENTS, 
  AGE_CUTOFF_DATE,
  APPLICATION_STATUS 
} = require('../config/constants');

const logger = require('../utils/logger');

// Models
const Application = require('../models/Application.model');
const PersonalInfo = require('../models/PersonalInfo.model');
const ContactInfo = require('../models/ContactInfo.model');
const Education = require('../models/Education.model');
const Documents = require('../models/Documents.model');


/**
 * Application Service - Logic for recruitment application lifecycle
 */
const ApplicationService = {
  /**
   * Get application by applicant ID, or create a draft if none exists
   * @param {string} applicantId - Applicant UUID
   * @returns {Promise<Object>} Application record
   */
  async getOrCreateApplication(applicantId) {
    try {
      let application = await Application.findByApplicantId(applicantId);
      
      if (!application) {
        logger.info(`Creating new application draft for applicant: ${applicantId}`);
        application = await Application.create({
          applicantId: applicantId,
          status: APPLICATION_STATUS.DRAFT,
          currentStep: 1
        });
      }
      
      return application;
    } catch (error) {
      logger.error(`Error in getOrCreateApplication: ${error.message}`);
      throw error;
    }
  },

  /**
   * Get full application with all details
   * @param {string} applicationId - Application UUID
   * @returns {Promise<Object>} Full application data
   */
  async getFullApplication(applicationId) {
    try {
      const application = await Application.findById(applicationId);
      if (!application) return null;

      const [personalInfo, contactInfo, education, documents] = await Promise.all([
        PersonalInfo.findByApplicationId(applicationId),
        ContactInfo.findByApplicationId(applicationId),
        Education.getFullEducation(applicationId),
        Documents.findByApplicationId(applicationId)
      ]);


      return {
        ...application,
        personalInfo,
        contactInfo,
        education,
        documents: (documents || []).map(formatDocument)
      };

    } catch (error) {
      logger.error(`Error in getFullApplication: ${error.message}`);
      throw error;
    }
  },

  /**
   * Update application section
   * @param {string} applicationId - Application UUID
   * @param {string} section - Section name (personal_info, contact_info, physical_attributes, education)
   * @param {Object} data - Section data
   * @returns {Promise<Object>} Updated section data
   */
  async updateSection(applicationId, section, data) {
    try {
      let result;
      const payload = { applicationId, ...data };

      switch (section) {
      case 'personal_info':
        result = await PersonalInfo.upsert(payload);
        break;
      case 'contact_info':
        result = await ContactInfo.upsert(applicationId, data);
        break;

      case 'education':
        // Special handling for education sections
        if (data.type === 'BECE') {
          result = await Education.upsertBece(applicationId, data);
        } else if (data.type === 'WASSCE') {
          result = await Education.upsertWassce(applicationId, data);
        } else if (data.type === 'TERTIARY') {
          result = await Education.createTertiary(payload);
        } else {
          result = await Education.upsert(applicationId, data);
        }
        break;
      default:
        throw new Error('Invalid application section');
      }

      // Update current step if needed
      const stepMap = {
        'personal_info': 2,
        'contact_info': 3,
        'category': 4,
        'education': 5,
        'documents': 6,
        'review': 7,
        'declaration': 8
      };

      
      if (stepMap[section]) {
        await Application.updateStep(applicationId, stepMap[section]);
      }

      return result;
    } catch (error) {
      logger.error(`Error updating section ${section}: ${error.message}`);
      throw error;
    }
  },

  /**
   * Check eligibility for an application
   * @param {Object} data - Full application data
   * @returns {Object} - Eligibility report
   */
  checkEligibility(data) {
    const { application, personalInfo, education } = data;

    const category = application.category;
    
    const report = {
      eligible: true,
      checks: [],
      recommendations: []
    };

    // 1. Age Check
    if (personalInfo && personalInfo.date_of_birth) {
      const age = calculateAge(personalInfo.date_of_birth, AGE_CUTOFF_DATE);
      const req = AGE_REQUIREMENTS[category] || AGE_REQUIREMENTS.GENERAL_DUTY;
      
      let min = req.min;
      let max = req.max;

      if (!min && application.sub_category) {
        const subReq = req[application.sub_category] || req.DEFAULT;
        if (subReq) {
          min = subReq.min;
          max = subReq.max;
        }
      }

      const ageCheck = {
        name: 'Age Requirement',
        value: `${age} years`,
        status: (age >= min && age <= max) ? 'passed' : 'failed',
        message: (age >= min && age <= max) 
          ? `Meets the age requirement of ${min}-${max} years` 
          : `Does not meet age requirement (${min}-${max} years for ${category})`
      };
      report.checks.push(ageCheck);
      if (ageCheck.status === 'failed') report.eligible = false;
    }


    // 3. Educational Check (WASSCE)
    if (education && education.wassce) {
      const wassceResults = education.wassce;
      // Use the first WASSCE result if multiple (usually only one unless NovDec)
      const primaryWassce = Array.isArray(wassceResults) ? wassceResults[0] : wassceResults;
      
      if (primaryWassce && primaryWassce.results) {
        const results = typeof primaryWassce.results === 'string' 
          ? JSON.parse(primaryWassce.results) 
          : primaryWassce.results;
          
        const wassceValidation = validateWassceForRecruitment(results, category);
        
        const wassceCheck = {
          name: 'Academic Requirement (WASSCE)',
          value: `Aggregate ${wassceValidation.aggregate}`,
          status: wassceValidation.eligible ? 'passed' : 'failed',
          message: wassceValidation.eligible 
            ? 'Meets academic requirements for this category' 
            : wassceValidation.errors.join('. ')
        };
        report.checks.push(wassceCheck);
        if (wassceCheck.status === 'failed') report.eligible = false;
        
        if (wassceValidation.recommendations) {
          report.recommendations.push(...wassceValidation.recommendations);
        }
      }
    }

    // 4. Nationality Check
    if (personalInfo && personalInfo.nationality) {
      const nationalityCheck = {
        name: 'Nationality',
        value: personalInfo.nationality,
        status: personalInfo.nationality.toUpperCase() === 'GHANAIAN' ? 'passed' : 'failed',
        message: personalInfo.nationality.toUpperCase() === 'GHANAIAN' 
          ? 'Applicant is a Ghanaian citizen' 
          : 'Only Ghanaian citizens are eligible'
      };
      report.checks.push(nationalityCheck);
      if (nationalityCheck.status === 'failed') report.eligible = false;
    }

    return report;
  },

  /**
   * Submit application
   * @param {string} applicationId - Application UUID
   * @returns {Promise<Object>} Submitted application
   */
  async submitApplication(applicationId) {
    try {
      const fullData = await this.getFullApplication(applicationId);
      if (!fullData) throw new Error('Application not found');

      if (fullData.status !== APPLICATION_STATUS.DRAFT) {
        throw new Error('Application has already been submitted or is in a non-draft state');
      }

      // Check for completion (basic check)
      if (!fullData.personalInfo || !fullData.contactInfo || !fullData.education.education) {
        throw new Error('Please complete all required sections before submitting');
      }

      // Check eligibility
      const eligibility = this.checkEligibility(fullData);
      // We still allow submission even if ineligible (will be auto-rejected or flagged)
      // but let's log it
      if (!eligibility.eligible) {
        logger.warn(`Ineligible application submitted: ${applicationId}`);
      }

      // Use existing human-readable application ID
      const gpsId = fullData.applicationId;

      // Update application
      const submittedApp = await Application.submit(applicationId, gpsId);

      logger.info(`Application submitted successfully: ${gpsId}`);
      return {
        ...submittedApp,
        eligibility
      };
    } catch (error) {
      logger.error(`Error submitting application: ${error.message}`);
      throw error;
    }
  },

  /**
   * Admin - Get all applications with filters
   * @param {Object} options - Filter and pagination options
   * @returns {Promise<Object>} List of applications
   */
  async getAllApplications(options) {
    try {
      return await Application.findAll(options);
    } catch (error) {
      logger.error(`Error in getAllApplications: ${error.message}`);
      throw error;
    }
  },

  /**
   * Admin - Update application status
   * @param {string} id - Application UUID
   * @param {string} status - New status
   * @param {string} adminId - Admin ID who performed the action
   * @param {Object} details - Rejection reason, comments, or requested docs
   */
  async updateStatus(id, status, adminId, details = {}) {
    try {
      let result;

      switch (status) {
      case 'APPROVED':
        result = await Application.approve(id, adminId, details.comments);
        break;
      case 'REJECTED':
        result = await Application.reject(id, adminId, details.reason);
        break;
      case 'DOCUMENTS_REQUIRED':
        result = await Application.requestDocuments(id, details.required_documents, details.message);
        break;
      default:
        result = await Application.updateStatus(id, status, adminId, details.comments);
      }

      return result;
    } catch (error) {
      logger.error(`Error updating application status: ${error.message}`);
      throw error;
    }
  }
};

module.exports = ApplicationService;
