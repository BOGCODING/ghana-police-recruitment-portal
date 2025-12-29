const { query } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { calculateAge, formatDocument } = require('../utils/helpers');
const { APPLICATION_STATUS, AGE_CUTOFF_DATE, AGE_REQUIREMENTS } = require('../config/constants');

const { cacheSet, cacheGet, cacheDelete } = require('../config/redis');
const { generateQRCodeDataURL } = require('../services/qrCode.service');
const { generateApplicationPDF } = require('../services/pdf.service');
const { sendApplicationSubmissionConfirmation } = require('../services/email.service');
// WebSocket will be lazy-loaded to avoid circular dependency
// const { emitToUser, emitApplicationUpdate } = require('../websocket');
const logger = require('../utils/logger');
const EducationModel = require('../models/Education.model');
const PersonalInfoModel = require('../models/PersonalInfo.model');

/**
 * Get application status
 */
const getApplicationStatus = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, "applicationId", status, "currentStep", category, "preferredRegion",
              "submittedAt", "createdAt", "updatedAt"
       FROM applications WHERE "applicantId" = $1`,
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'Application not found', 404);
    }
    
    return successResponse(res, result.rows[0]);
    
  } catch (error) {
    logger.error('Get application status error:', error);
    return errorResponse(res, 'Failed to get application status', 500);
  }
};

/**
 * Get full application data
 */
const getFullApplication = async (req, res) => {
  try {
    const appResult = await query(
      'SELECT * FROM applications WHERE "applicantId" = $1',
      [req.user.id]
    );
    
    if (appResult.rows.length === 0) {
      return errorResponse(res, 'Application not found', 404);
    }
    
    const appId = appResult.rows[0].id;
    
    // Get related data
    const [personalInfo, contactInfo, documents] = await Promise.all([
      query('SELECT * FROM personal_info WHERE "applicationId" = $1', [appId]),
      query('SELECT * FROM contact_info WHERE "applicationId" = $1', [appId]),
      query('SELECT * FROM documents WHERE "applicationId" = $1', [appId])
    ]);


    // Get full education record (including BECE, WASSCE, Tertiary)
    const fullEducation = await EducationModel.getFullEducation(appId);
    
    return successResponse(res, {
      ...appResult.rows[0],
      personalInfo: personalInfo.rows[0] || null,
      contactInfo: contactInfo.rows[0] || null,
      education: fullEducation,
      documents: documents.rows.map(formatDocument)
    });

    
  } catch (error) {
    logger.error('Get full application error:', error);
    return errorResponse(res, 'Failed to get application', 500);
  }
};

/**
 * Save personal information (Step 1)
 */
const savePersonalInfo = async (req, res) => {
  try {
    const data = req.body;
    
    // Auto uppercase text fields
    const upperFields = ['firstName', 'lastName', 'middleName', 'hometown'];
    upperFields.forEach(field => {
      if (data[field] && typeof data[field] === 'string') {
        data[field] = data[field].toUpperCase();
      }
    });
    
    const appResult = await query(
      'SELECT id FROM applications WHERE "applicantId" = $1',
      [req.user.id]
    );
    
    if (appResult.rows.length === 0) {
      return errorResponse(res, 'Application not found', 404);
    }
    
    const appId = appResult.rows[0].id;
    
    // Upsert personal info using model
    const result = await PersonalInfoModel.upsert({
      applicationId: appId,
      ...data
    });
    
    // Update application step to 2 (Contact Details)
    await query(
      `UPDATE applications SET "currentStep" = GREATEST("currentStep", 2), "updatedAt" = NOW()
       WHERE id = $1`,
      [appId]
    );
    
    // Clear cache
    await cacheDelete(`app:${req.user.id}:autosave`);
    
    return successResponse(res, result, 'Personal information saved');
    
  } catch (error) {
    logger.error('Save personal info CRITICAL ERROR:', {
      message: error.message,
      stack: error.stack,
      userId: req.user.id,
      body: req.body
    });
    return errorResponse(res, `Failed to save personal information: ${error.message}`, 500);
  }
};

/**
 * Get personal information
 */
const getPersonalInfo = async (req, res) => {
  try {
    const result = await query(
      `SELECT pi.* FROM personal_info pi
       JOIN applications app ON pi."applicationId" = app.id
       WHERE app."applicantId" = $1`,
      [req.user.id]
    );
    
    return successResponse(res, result.rows[0] || null);
    
  } catch (error) {
    logger.error('Get personal info error:', error);
    return errorResponse(res, 'Failed to get personal information', 500);
  }
};

/**
 * Save contact information (Step 2)
 */
const saveContactInfo = async (req, res) => {
  try {
    const data = req.body;
    
    // Auto uppercase
    if (data.residentialAddress && typeof data.residentialAddress === 'string') {
      data.residentialAddress = data.residentialAddress.toUpperCase();
    }
    if (data.emergencyContactName && typeof data.emergencyContactName === 'string') {
      data.emergencyContactName = data.emergencyContactName.toUpperCase();
    }
    
    const appResult = await query(
      'SELECT id FROM applications WHERE "applicantId" = $1',
      [req.user.id]
    );
    
    const appId = appResult.rows[0].id;
    
    const result = await query(
      `INSERT INTO contact_info (
        "applicationId", email, "phoneNumber", "alternatePhone",
        "residentialAddress", "postalAddress", "digitalAddress",
        "emergencyContactName", "emergencyContactPhone", "emergencyContactRelation"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT ("applicationId") DO UPDATE SET
        email = EXCLUDED.email,
        "phoneNumber" = EXCLUDED."phoneNumber",
        "alternatePhone" = EXCLUDED."alternatePhone",
        "residentialAddress" = EXCLUDED."residentialAddress",
        "postalAddress" = EXCLUDED."postalAddress",
        "digitalAddress" = EXCLUDED."digitalAddress",
        "emergencyContactName" = EXCLUDED."emergencyContactName",
        "emergencyContactPhone" = EXCLUDED."emergencyContactPhone",
        "emergencyContactRelation" = EXCLUDED."emergencyContactRelation",
        "updatedAt" = NOW()
      RETURNING *`,
      [
        appId, data.email, data.phoneNumber, data.alternatePhone,
        data.residentialAddress, data.postalAddress, data.digitalAddress,
        data.emergencyContactName, data.emergencyContactPhone, data.emergencyContactRelation
      ]
    );
    
    await query(
      `UPDATE applications SET "currentStep" = GREATEST("currentStep", 3), "updatedAt" = NOW()
       WHERE id = $1`,
      [appId]
    );

    
    return successResponse(res, result.rows[0], 'Contact information saved');
    
  } catch (error) {
    logger.error('Save contact info error:', error);
    return errorResponse(res, 'Failed to save contact information', 500);
  }
};

/**
 * Get contact information
 */
const getContactInfo = async (req, res) => {
  try {
    const result = await query(
      `SELECT ci.* FROM contact_info ci
       JOIN applications app ON ci."applicationId" = app.id
       WHERE app."applicantId" = $1`,
      [req.user.id]
    );
    
    return successResponse(res, result.rows[0] || null);
    
  } catch (error) {
    logger.error('Get contact info error:', error);
    return errorResponse(res, 'Failed to get contact information', 500);
  }
};




/**
 * Save education (Step 4)
 */
const saveEducation = async (req, res) => {
  try {
    const data = req.body;
    
    // 1. Get Application ID
    const appResult = await query(
      'SELECT id FROM applications WHERE "applicantId" = $1',
      [req.user.id]
    );
    
    if (appResult.rows.length === 0) {
      return errorResponse(res, 'Application not found', 404);
    }
    const appId = appResult.rows[0].id;

    // 2. Transform flat frontend data into structured model format
    const educationData = {
      hasWassce: !!data.wassceSchool,
      hasNovDec: !!data.hasNovDec,
      hasTertiary: !!data.tertiaryInstitution,
      hasProfessionalCert: !!data.hasProfessionalCert,
      hasCompletedNationalService: !!data.hasCompletedNationalService,
      
      bece: {
        schoolName: data.beceSchool,
        completionYear: data.beceYear,
        indexNumber: data.beceIndexNumber,
        results: data.beceResults,
        certificateNumber: data.beceCertificateNumber
      },
      
      wassce: data.wassceSchool ? {
        schoolName: data.wassceSchool,
        completionYear: (() => {
          if (typeof data.wassceYear === 'number') return data.wassceYear;
          if (typeof data.wassceYear === 'string') {
            return parseInt(data.wassceYear.split('/')?.[1] || data.wassceYear);
          }
          return null;
        })(),
        indexNumber: data.wassceIndexNumber,
        certificateNumber: data.wassceCertificateNumber,
        results: (() => {
          logger.info('DEBUG SAVE EDUCATION:', {
            eng: data.wassceEnglish,
            math: data.wassceMath,
            keys: Object.keys(data).filter(k => k.includes('wassce')),
            fullResults: 'LOGGING_ATTEMPT'
          });
          
          const res = [
            { subject: 'CORE ENGLISH', grade: data.wassceEnglish },
            { subject: 'CORE MATHEMATICS', grade: data.wassceMath },
            { subject: data.elective1Name || 'ELECTIVE 1', grade: data.elective1Grade },
            { subject: data.elective2Name || 'ELECTIVE 2', grade: data.elective2Grade },
            { subject: data.elective3Name || 'ELECTIVE 3', grade: data.elective3Grade },
            { subject: data.elective4Name || 'ELECTIVE 4', grade: data.elective4Grade }
          ].filter(r => r.grade);
          
          logger.info('DEBUG CONSTRUCTED RESULTS:', res);
          return res;
        })()
      } : null,

      tertiary: data.tertiaryInstitution ? {
        institutionName: data.tertiaryInstitution,
        qualification: data.tertiaryQualification,
        courseOfStudy: data.tertiaryCourse,
        completionYear: data.tertiaryYear,
        classObtained: data.tertiaryClass || 'N/A',
        certificateNumber: data.certificateNumber || 'N/A',
        nationalServiceYear: data.nationalServiceYear,
        nationalServiceNumber: data.nationalServiceNumber
      } : null
    };

    // 3. Save via transactional model method
    await EducationModel.saveFullEducation(appId, educationData);
    
    // 4. Update application step progress to 5 (Documents)
    await query(
      `UPDATE applications SET "currentStep" = GREATEST("currentStep", 5), "updatedAt" = NOW()
       WHERE id = $1`,
      [appId]
    );
    
    return successResponse(res, null, 'Education saved successfully');
    
  } catch (error) {
    logger.error('Save education error:', error);
    return errorResponse(res, 'Failed to save education: ' + error.message, 500);
  }
};

/**
 * Get education
 */
const getEducation = async (req, res) => {
  try {
    const appResult = await query(
      'SELECT id FROM applications WHERE "applicantId" = $1',
      [req.user.id]
    );
    
    if (appResult.rows.length === 0) {
      return successResponse(res, null);
    }
    
    const appId = appResult.rows[0].id;
    const fullEducation = await EducationModel.getFullEducation(appId);
    
    return successResponse(res, fullEducation);
  } catch (error) {
    logger.error('Get education error:', error);
    return errorResponse(res, 'Failed to get education', 500);
  }
};

/**
 * Save category selection (Step 5)
 */
const saveCategory = async (req, res) => {
  try {
    const data = req.body;
    
    const appResult = await query(
      'SELECT id FROM applications WHERE "applicantId" = $1',
      [req.user.id]
    );
    
    const appId = appResult.rows[0].id;
    
    // 4. Age validation based on category requirements
    const personalInfo = await query(
      'SELECT "dateOfBirth" FROM personal_info WHERE "applicationId" = $1',
      [appId]
    );
    
    if (personalInfo.rows.length > 0) {
      const dob = personalInfo.rows[0].dateOfBirth;
      const age = calculateAge(dob, AGE_CUTOFF_DATE);
      const category = data.category;
      const subCategory = data.subCategory || 'DEFAULT';
      
      const reqs = AGE_REQUIREMENTS[category] || AGE_REQUIREMENTS.GENERAL_DUTY;
      let min, max;
      
      if (reqs.min !== undefined) {
        // Simple requirement (e.g. GENERAL_DUTY, TRADESMEN)
        min = reqs.min;
        max = reqs.max;
      } else {
        // Nested requirement (e.g. GRADUATES, MEDICAL_PROFESSIONALS)
        const specificReq = reqs[subCategory] || reqs.DEFAULT || { min: 18, max: 30 };
        min = specificReq.min;
        max = specificReq.max;
      }
      
      if (age < min || age > max) {
        return errorResponse(res, `Age requirement not met for ${category.replace(/_/g, ' ')}. Required: ${min}-${max} years. Current: ${age} years.`, 400);
      }
    }
    
    await query(
      `UPDATE applications SET
        category = $1,
        "subCategory" = $2,
        specialization = $3,
        "preferredRegion" = $4,
        "alternateRegion" = $5,
        "categoryDetails" = $6,
        "currentStep" = GREATEST("currentStep", 4),
        "updatedAt" = NOW()
       WHERE id = $7`,
      [
        data.category, data.subCategory, data.specialization,
        data.preferredRegion, data.alternateRegion,
        JSON.stringify(data),
        appId
      ]
    );
    
    return successResponse(res, { 
      category: data.category,
      subCategory: data.subCategory,
      specialization: data.specialization,
      preferredRegion: data.preferredRegion,
      alternateRegion: data.alternateRegion
    }, 'Category saved');
    
  } catch (error) {
    logger.error('Save category error:', error);
    return errorResponse(res, 'Failed to save category', 500);
  }
};

/**
 * Get category
 */
const getCategory = async (req, res) => {
  try {
    const result = await query(
      `SELECT category, "subCategory", specialization, "preferredRegion", 
              "alternateRegion", "categoryDetails"
       FROM applications WHERE "applicantId" = $1`,
      [req.user.id]
    );
    
    return successResponse(res, result.rows[0] || null);
    
  } catch (error) {
    logger.error('Get category error:', error);
    return errorResponse(res, 'Failed to get category', 500);
  }
};

/**
 * Save declaration (Step 6)
 */
const saveDeclaration = async (req, res) => {
  try {
    const data = req.body;
    
    const appResult = await query(
      'SELECT id FROM applications WHERE "applicantId" = $1',
      [req.user.id]
    );
    
    const appId = appResult.rows[0].id;
    
    await query(
      `UPDATE applications SET
        declaration = $1,
        "declarationDate" = NOW(),
        "currentStep" = GREATEST("currentStep", 8),
        "updatedAt" = NOW()
       WHERE id = $2`,
      [JSON.stringify(data), appId]
    );
    
    return successResponse(res, null, 'Declaration saved');
    
  } catch (error) {
    logger.error('Save declaration error:', error);
    return errorResponse(res, 'Failed to save declaration', 500);
  }
};

/**
 * Submit application
 */
const submitApplication = async (req, res) => {
  try {
    const appResult = await query(
      'SELECT * FROM applications WHERE "applicantId" = $1',
      [req.user.id]
    );
    
    if (appResult.rows.length === 0) {
      return errorResponse(res, 'Application not found', 404);
    }
    
    const app = appResult.rows[0];
    
    if (app.status !== APPLICATION_STATUS.DRAFT) {
      return errorResponse(res, 'Application already submitted', 400);
    }
    
    await query(
      `UPDATE applications SET
        status = $1,
        "submittedAt" = NOW(),
        "updatedAt" = NOW()
       WHERE id = $2`,
      [APPLICATION_STATUS.SUBMITTED, app.id]
    );
    
    // Use existing ID for logs and notifications
    const applicationId = app.applicationId;
    
    // Audit log
    await query(
      `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
       VALUES ('SUBMIT_APPLICATION', 'application', $1, $2, 'applicant', $3)`,
      [app.id, req.user.id, JSON.stringify({ applicationId })]
    );
    
    // Fetch personal info for notification
    const personalInfoResult = await query(
      'SELECT "firstName", "lastName" FROM personal_info WHERE "applicationId" = $1',
      [app.id]
    );
    const personalInfo = personalInfoResult.rows[0] || {};

    // Lazy load websocket to avoid circular dependency
    const { emitToUser, emitApplicationUpdate, emitDashboardRefresh } = require('../websocket');
    
    // Emit real-time notification to admins
    emitToUser('application:new', { // Changed from emitToAdmins
      id: app.id,
      applicationId: applicationId,
      category: app.category,
      applicantName: `${personalInfo.firstName} ${personalInfo.lastName}`,
      submittedAt: new Date()
    });

    emitApplicationUpdate({ type: 'NEW_SUBMISSION', id: app.id });
    emitDashboardRefresh();

    // Send email confirmation
    const applicantResult = await query('SELECT email FROM applicants WHERE id = $1', [req.user.id]);
    if (applicantResult.rows[0]) {
      sendApplicationSubmissionConfirmation(applicantResult.rows[0].email, {
        applicationId,
        firstName: personalInfo.firstName,
        category: app.category // Assuming category is available in app object
      });
    }

    return successResponse(res, {
      applicationId: applicationId,
      status: APPLICATION_STATUS.SUBMITTED
    }, 'Application submitted successfully');
    
  } catch (error) {
    logger.error('Submit application error:', error);
    return errorResponse(res, 'Failed to submit application', 500);
  }
};

/**
 * Get application summary
 */
const getApplicationSummary = async (req, res) => {
  try {
    const appResult = await query(
      'SELECT * FROM applications WHERE "applicantId" = $1',
      [req.user.id]
    );
    
    if (appResult.rows.length === 0) {
      return errorResponse(res, 'Application not found', 404);
    }
    
    const appId = appResult.rows[0].id;
    
    const [personalInfo, contactInfo, fullEducation, documents] = await Promise.all([
      query('SELECT * FROM personal_info WHERE "applicationId" = $1', [appId]),
      query('SELECT * FROM contact_info WHERE "applicationId" = $1', [appId]),
      EducationModel.getFullEducation(appId),
      query('SELECT * FROM documents WHERE "applicationId" = $1 AND "documentType" = $2', [appId, 'passportPhoto'])
    ]);
    
    return successResponse(res, {
      ...appResult.rows[0],
      personalInfo: personalInfo.rows[0] || null,
      contactInfo: contactInfo.rows[0] || null,
      education: fullEducation,
      passportPhoto: formatDocument(documents.rows[0])
    });

    
  } catch (error) {
    logger.error('Get application summary error:', error);
    return errorResponse(res, 'Failed to get application summary', 500);
  }
};

/**
 * Download PDF summary
 */
const downloadPDF = async (req, res) => {
  try {
    const appResult = await query(
      'SELECT * FROM applications WHERE "applicantId" = $1',
      [req.user.id]
    );

    if (appResult.rows.length === 0) {
      return errorResponse(res, 'Application not found', 404);
    }

    const app = appResult.rows[0];
    if (app.status === APPLICATION_STATUS.DRAFT) {
      return errorResponse(res, 'Please submit your application before downloading the summary', 400);
    }

    const appId = app.id;

    // Fetch all details
    // Fetch all details
    const [personalInfo, contactInfo, documents] = await Promise.all([
      query('SELECT * FROM personal_info WHERE "applicationId" = $1', [appId]),
      query('SELECT * FROM contact_info WHERE "applicationId" = $1', [appId]),
      query('SELECT * FROM documents WHERE "applicationId" = $1 AND "documentType" = $2', [appId, 'passportPhoto'])
    ]);

    const fullEducation = await EducationModel.getFullEducation(appId);

    const data = {
      application: app,
      personalInfo: personalInfo.rows[0],
      contactInfo: contactInfo.rows[0],
      education: fullEducation,
      passportPhoto: documents.rows[0]
    };


    // Generate PDF
    const pdfBuffer = await generateApplicationPDF(data);
    logger.info(`PDF generation complete, buffer size: ${pdfBuffer ? pdfBuffer.length : 'NULL'}`);

    // Send PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=GPS-Application-${app.applicationId}.pdf`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    
    logger.info('Sending PDF response...');
    return res.end(pdfBuffer);

  } catch (error) {
    logger.error('Download PDF error:', error);
    return errorResponse(res, 'Failed to generate application summary PDF', 500);
  }
};

/**
 * Get QR code data URL
 */
const getQRCode = async (req, res) => {
  try {
    const appResult = await query(
      'SELECT "applicationId" FROM applications WHERE "applicantId" = $1',
      [req.user.id]
    );

    if (appResult.rows.length === 0 || !appResult.rows[0].applicationId) {
      return errorResponse(res, 'Application not submitted yet', 400);
    }

    const dataURL = await generateQRCodeDataURL(appResult.rows[0].applicationId);
    return successResponse(res, { qrCode: dataURL });
  } catch (error) {
    logger.error('Get QR Code error:', error);
    return errorResponse(res, 'Failed to generate QR code', 500);
  }
};

/**
 * Update current application step
 */
const updateCurrentStep = async (req, res) => {
  try {
    const { currentStep } = req.body;
    
    await query(
      'UPDATE applications SET "currentStep" = GREATEST("currentStep", $1), "updatedAt" = NOW() WHERE "applicantId" = $2',
      [currentStep, req.user.id]
    );

    return successResponse(res, { currentStep: currentStep }, 'Step updated');
  } catch (error) {
    logger.error('Update current step error:', error);
    return errorResponse(res, 'Failed to update step', 500);
  }
};

/**
 * Save documents step
 */
const saveDocuments = async (req, res) => {
  try {
    await query(
      `UPDATE applications SET 
        "currentStep" = GREATEST("currentStep", 6),
        "updatedAt" = NOW() 
       WHERE "applicantId" = $1`,
      [req.user.id]
    );
    
    return successResponse(res, null, 'Documents step saved');
  } catch (error) {
    logger.error('Save documents step error:', error);
    return errorResponse(res, 'Failed to save documents step', 500);
  }
};

/**
 * Save review step
 */
const saveReview = async (req, res) => {
  try {
    await query(
      `UPDATE applications SET 
       "currentStep" = GREATEST("currentStep", 7),
       "updatedAt" = NOW() 
       WHERE "applicantId" = $1`,
      [req.user.id]
    );
    return successResponse(res, null, 'Review step processed');
  } catch (error) {
    logger.error('Save review step error:', error);
    return errorResponse(res, 'Failed to save review step', 500);
  }
};

/**
 * Auto-save form data
 * Uses Redis cache when available, falls back to database storage
 */
const autoSave = async (req, res) => {
  try {
    const { step, data } = req.body;
    const cacheKey = `app:${req.user.id}:autosave`;
    
    // Get existing draft from Redis or database
    let existingDraft = await cacheGet(cacheKey);
    
    // If Redis unavailable or no cache, try database
    if (!existingDraft) {
      const dbResult = await query(
        'SELECT "draftData" FROM applications WHERE "applicantId" = $1',
        [req.user.id]
      );
      existingDraft = dbResult.rows[0]?.draftData || {};
    }
    
    // Merge new data for this step
    const updatedDraft = {
      ...existingDraft,
      [step]: {
        ...(existingDraft[step] || {}),
        ...data
      }
    };
    
    // Try to save to Redis first (if available)
    await cacheSet(cacheKey, updatedDraft, 86400); // 24 hours
    
    // Always save to database as well for reliability
    await query(
      'UPDATE applications SET "draftData" = $1, "updatedAt" = NOW() WHERE "applicantId" = $2',
      [JSON.stringify(updatedDraft), req.user.id]
    );
    
    return successResponse(res, null, 'Auto-saved');
  } catch (error) {
    logger.error('Auto-save error:', error);
    return errorResponse(res, 'Failed to auto-save', 500);
  }
};

/**
 * Get auto-save data
 * Tries Redis first, falls back to database
 */
const getAutoSaveData = async (req, res) => {
  try {
    const cacheKey = `app:${req.user.id}:autosave`;
    
    // Try Redis first
    let data = await cacheGet(cacheKey);
    
    // Fallback to database if Redis unavailable
    if (!data) {
      const dbResult = await query(
        'SELECT "draftData" FROM applications WHERE "applicantId" = $1',
        [req.user.id]
      );
      data = dbResult.rows[0]?.draftData || null;
    }
    
    return successResponse(res, data);
    
  } catch (error) {
    logger.error('Get auto-save error:', error);
    return errorResponse(res, 'Failed to get auto-save data', 500);
  }
};

/**
 * Get application history (audit logs)
 */
const getApplicationHistory = async (req, res) => {
  try {
    const appResult = await query(
      'SELECT id FROM applications WHERE "applicantId" = $1',
      [req.user.id]
    );

    if (appResult.rows.length === 0) {
      return errorResponse(res, 'Application not found', 404);
    }

    const appId = appResult.rows[0].id;

    const result = await query(
      `SELECT action, "entityType", "entityId", "userType", details, "createdAt"
       FROM audit_logs 
       WHERE "entityType" = 'application' AND "entityId" = $1
       ORDER BY "createdAt" DESC`,
      [appId]
    );

    return successResponse(res, result.rows);

  } catch (error) {
    logger.error('Get application history error:', error);
    return errorResponse(res, 'Failed to get application history', 500);
  }
};

/**
 * Public track application status
 */
const trackApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const result = await query(
      `SELECT app."applicationId", app.status, app."submittedAt", 
              pi."firstName", pi."lastName", pi."middleName"
       FROM applications app
       LEFT JOIN personal_info pi ON app.id = pi."applicationId"
       WHERE app."applicationId" = $1`,
      [applicationId]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'Application not found. Please check your Application ID.', 404);
    }
    
    const app = result.rows[0];
    
    return successResponse(res, {
      applicationId: app.applicationId,
      status: app.status,
      submittedAt: app.submittedAt,
      applicantName: `${app.firstName} ${app.middleName ? app.middleName + ' ' : ''}${app.lastName}`.trim(),
    });
    
  } catch (error) {
    logger.error('Track application error:', error);
    return errorResponse(res, 'Failed to track application', 500);
  }
};

module.exports = {
  getApplicationStatus,
  getFullApplication,
  savePersonalInfo,
  getPersonalInfo,
  saveContactInfo,
  getContactInfo,

  saveEducation,
  getEducation,
  saveCategory,
  getCategory,
  saveDeclaration,
  submitApplication,
  getApplicationSummary,
  downloadPDF,
  getQRCode,
  autoSave,
  getAutoSaveData,
  getApplicationHistory,
  trackApplication,
  updateCurrentStep,
  saveDocuments,
  saveReview
};
