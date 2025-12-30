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
   * Save full education details (Transactional)
   * Orchestrates updates across Education, BECE, WASSCE, and Tertiary tables
   */
  async saveEducationDetails(applicationId, data) {
    const { transaction } = require('../config/database');
    
    return await transaction(async (client) => {
      // 1. Upsert main education record
      await client.query(
        `INSERT INTO education (
          "applicationId", "hasWassce", "hasNovDec", "hasTertiary", 
          "hasProfessionalCert", "hasCompletedNationalService"
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT ("applicationId") DO UPDATE SET
          "hasWassce" = EXCLUDED."hasWassce",
          "hasNovDec" = EXCLUDED."hasNovDec",
          "hasTertiary" = EXCLUDED."hasTertiary",
          "hasProfessionalCert" = EXCLUDED."hasProfessionalCert",
          "hasCompletedNationalService" = EXCLUDED."hasCompletedNationalService",
          "updatedAt" = NOW()`,
        [
          applicationId, 
          data.hasWassce || false, 
          data.hasNovDec || false, 
          data.hasTertiary || false, 
          data.hasProfessionalCert || false, 
          data.hasCompletedNationalService || false
        ]
      );

      // 2. BECE Results
      if (data.bece) {
        await client.query(
          `INSERT INTO bece_results ("applicationId", "schoolName", "completionYear", "indexNumber", "certificateNumber", results)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT ("applicationId") DO UPDATE SET
             "schoolName" = EXCLUDED."schoolName",
             "completionYear" = EXCLUDED."completionYear",
             "indexNumber" = EXCLUDED."indexNumber",
             "certificateNumber" = EXCLUDED."certificateNumber",
             results = EXCLUDED.results,
             "updatedAt" = NOW()`,
          [
            applicationId, 
            data.bece.schoolName, 
            data.bece.completionYear, 
            data.bece.indexNumber, 
            data.bece.certificateNumber,
            JSON.stringify(data.bece.results)
          ]
        );
      }

      // 3. WASSCE Results
      if (data.wassce) {
        await client.query(
          `INSERT INTO wassce_results ("applicationId", "isNovdec", "schoolName", "completionYear", "indexNumber", "certificateNumber", results)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT ("applicationId", "isNovdec") DO UPDATE SET
             "schoolName" = EXCLUDED."schoolName",
             "completionYear" = EXCLUDED."completionYear",
             "indexNumber" = EXCLUDED."indexNumber",
             "certificateNumber" = EXCLUDED."certificateNumber",
             results = EXCLUDED.results,
             "updatedAt" = NOW()`,
          [
            applicationId, 
            false, 
            data.wassce.schoolName, 
            data.wassce.completionYear, 
            data.wassce.indexNumber, 
            data.wassce.certificateNumber,
            JSON.stringify(data.wassce.results)
          ]
        );
      }

      // 4. NovDec Results
      if (data.novdec) {
        await client.query(
          `INSERT INTO wassce_results ("applicationId", "isNovdec", "schoolName", "completionYear", "indexNumber", "certificateNumber", results)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT ("applicationId", "isNovdec") DO UPDATE SET
             "schoolName" = EXCLUDED."schoolName",
             "completionYear" = EXCLUDED."completionYear",
             "indexNumber" = EXCLUDED."indexNumber",
             "certificateNumber" = EXCLUDED."certificateNumber",
             results = EXCLUDED.results,
             "updatedAt" = NOW()`,
          [
            applicationId, 
            true, 
            data.novdec.schoolName, 
            data.novdec.completionYear, 
            data.novdec.indexNumber, 
            data.novdec.certificateNumber,
            JSON.stringify(data.novdec.results)
          ]
        );
      }

      // 5. Tertiary Education
      if (data.tertiary) {
        await client.query(
          `INSERT INTO tertiary_education (
            "applicationId", "institutionName", qualification, "courseOfStudy", 
            "classObtained", "completionYear", "certificateNumber", 
            "nationalServiceYear", "nationalServiceNumber"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT ("applicationId") DO UPDATE SET
            "institutionName" = EXCLUDED."institutionName",
            qualification = EXCLUDED.qualification,
            "courseOfStudy" = EXCLUDED."courseOfStudy",
            "classObtained" = EXCLUDED."classObtained",
            "completionYear" = EXCLUDED."completionYear",
            "certificateNumber" = EXCLUDED."certificateNumber",
            "nationalServiceYear" = EXCLUDED."nationalServiceYear",
            "nationalServiceNumber" = EXCLUDED."nationalServiceNumber",
            "updatedAt" = NOW()`,
          [
            applicationId, 
            data.tertiary.institutionName, 
            data.tertiary.qualification, 
            data.tertiary.courseOfStudy, 
            data.tertiary.classObtained, 
            data.tertiary.completionYear, 
            data.tertiary.certificateNumber, 
            data.tertiary.nationalServiceYear, 
            data.tertiary.nationalServiceNumber
          ]
        );
      }

      return { success: true };
    });
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
