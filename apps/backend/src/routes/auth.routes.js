const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateBody } = require('../middleware/validation.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');
const { 
  authLimiter, 
  voucherLimiter, 
  passwordResetLimiter 
} = require('../middleware/rateLimiter.middleware');
const { 
  registerSchema, 
  loginSchema, 
  voucherValidationSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('../validators/auth.validator');

// Voucher validation (before registration)
router.post('/validate-voucher', 
  voucherLimiter,
  validateBody(voucherValidationSchema),
  authController.validateVoucher
);

// Applicant Registration
router.post('/register',
  authLimiter,
  validateBody(registerSchema),
  authController.register
);

// Applicant Login
router.post('/login',
  authLimiter,
  validateBody(loginSchema),
  authController.login
);

// Refresh Token
router.post('/refresh-token',
  authLimiter,
  validateBody(refreshTokenSchema),
  authController.refreshToken
);

// Logout
router.post('/logout', 
  authenticateToken,
  authController.logout
);

// Forgot Password
router.post('/forgot-password',
  passwordResetLimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword
);

// Reset Password
router.post('/reset-password',
  passwordResetLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword
);

// Get current user
router.get('/me',
  authenticateToken,
  authController.getCurrentUser
);

// Verify email
router.get('/verify-email/:token',
  authController.verifyEmail
);

module.exports = router;
