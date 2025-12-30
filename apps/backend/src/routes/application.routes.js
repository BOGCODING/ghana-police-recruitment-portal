const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { authenticateToken, preventSubmittedUpdates } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validation.middleware');
const {
  personalInfoSchema,
  contactInfoSchema,
  educationSchema,
  categorySelectionSchema,
  declarationSchema
} = require('../validators/application.validator');


// Public tracking route
router.get('/track/:applicationId', applicationController.trackApplication);

// All other routes require authentication
router.use(authenticateToken);

// Get application status/summary
router.get('/status', applicationController.getApplicationStatus);

// Get application history
router.get('/history', applicationController.getApplicationHistory);

// Get complete application data
router.get('/full', applicationController.getFullApplication);
router.get('/current', applicationController.getFullApplication); // Alias for frontend

// Step 1: Personal Information
router.post('/personal-info',
  preventSubmittedUpdates,
  validateBody(personalInfoSchema),
  applicationController.savePersonalInfo
);
router.get('/personal-info', applicationController.getPersonalInfo);

// Step 2: Contact Details
router.post('/contact-info',
  preventSubmittedUpdates,
  validateBody(contactInfoSchema),
  applicationController.saveContactInfo
);
router.get('/contact-info', applicationController.getContactInfo);


// Step 4: Education
router.post('/education',
  preventSubmittedUpdates,
  validateBody(educationSchema),
  applicationController.saveEducation
);
router.get('/education', applicationController.getEducation);

// Step 5: Category Selection
router.post('/category',
  preventSubmittedUpdates,
  validateBody(categorySelectionSchema),
  applicationController.saveCategory
);
router.get('/category', applicationController.getCategory);

// Step 6: Declaration
router.post('/declaration',
  preventSubmittedUpdates,
  validateBody(declarationSchema),
  applicationController.saveDeclaration
);

// Submit application (final step)
router.post('/submit', applicationController.submitApplication);

// Get application summary for review
router.get('/summary', applicationController.getApplicationSummary);

// Download application as PDF
router.get('/download-pdf', applicationController.downloadPDF);

// Get QR code for application
router.get('/qr-code', applicationController.getQRCode);

// Auto-save draft
router.post('/auto-save', preventSubmittedUpdates, applicationController.autoSave);

// Get auto-save data
router.get('/auto-save', applicationController.getAutoSaveData);

// Update specific step tracking
router.put('/current-step', preventSubmittedUpdates, applicationController.updateCurrentStep);

// Metadata stubs for step progression
router.post('/documents', preventSubmittedUpdates, applicationController.saveDocuments);
router.post('/review', preventSubmittedUpdates, applicationController.saveReview);

module.exports = router;
