const { query, transaction } = require('../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/passwordHasher');
const { generateResetToken, generateApplicationId, generateToken } = require('../utils/generators');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { normalizePhoneNumber, toUpperCase, formatDocument } = require('../utils/helpers');
const { cacheSet, cacheDelete } = require('../config/redis');
const { sendRegistrationConfirmation, sendPasswordReset, sendEmailVerification } = require('../services/email.service');
const logger = require('../utils/logger');

/**
 * Validate voucher before registration
 */
const validateVoucher = async (req, res) => {
  try {
    const { serialNumber, pinCode, email, phoneNumber } = req.body;
    
    const cleanSerial = serialNumber?.trim();
    const cleanPin = pinCode?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPhone = phoneNumber?.trim();
    
    // Check voucher exists and is valid
    const result = await query(
      `SELECT * FROM vouchers 
       WHERE "serialNumber" = $1 AND "pinCode" = $2 AND "isUsed" = false AND "expiresAt" > NOW()`,
      [toUpperCase(cleanSerial), toUpperCase(cleanPin)]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'Invalid or expired voucher', 400);
    }
    
    const voucher = result.rows[0];
    
    // Update voucher with email, phone, and validated_at
    await query(
      `UPDATE vouchers 
       SET email = $1, "phoneNumber" = $2, "validatedAt" = NOW()
       WHERE id = $3`,
      [cleanEmail, cleanPhone, voucher.id]
    );
    
    return successResponse(res, {
      serialNumber: cleanSerial,
      pinCode: cleanPin,
      expiresAt: voucher.expiresAt
    }, 'Voucher validated successfully. Use your credentials to register.');
    
  } catch (error) {
    logger.error('Voucher validation error:', error.message);
    logger.error('Voucher validation error stack:', error.stack);
    return errorResponse(res, 'Failed to validate voucher: ' + error.message, 500);
  }
};

/**
 * Register new applicant
 */
const register = async (req, res) => {
  try {
    const { serialNumber, pinCode, email, phoneNumber, password } = req.body;
    
    // Trim inputs to prevent whitespace errors
    const cleanSerial = serialNumber?.trim();
    const cleanPin = pinCode?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPhone = phoneNumber?.trim();
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return errorResponse(res, 'Weak password', 400, passwordValidation.errors);
    }
    
    // Verify serial number and PIN from voucher
    const voucherResult = await query(
      `SELECT * FROM vouchers 
       WHERE "serialNumber" = $1 AND "pinCode" = $2 AND "isUsed" = false AND "expiresAt" > NOW()`,
      [toUpperCase(cleanSerial), toUpperCase(cleanPin)]
    );
    
    if (voucherResult.rows.length === 0) {
      return errorResponse(res, 'Invalid serial number or PIN code', 400);
    }
    
    const voucher = voucherResult.rows[0];
    
    // Verify email and phone match the voucher IF they are already set on the voucher
    // This allows pre-assigned vouchers to be restricted, while bulk vouchers can be claimed by anyone
    if (voucher.email && voucher.email !== cleanEmail) {
      return errorResponse(res, 'Email does not match the validated voucher', 400);
    }
    
    if (voucher.phoneNumber && normalizePhoneNumber(voucher.phoneNumber) !== normalizePhoneNumber(cleanPhone)) {
      return errorResponse(res, 'Phone number does not match the validated voucher', 400);
    }
    
    // Check if email already registered
    const existingUser = await query(
      'SELECT id FROM applicants WHERE email = $1',
      [cleanEmail]
    );
    
    if (existingUser.rows.length > 0) {
      return errorResponse(res, 'Email already registered', 409);
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Generate email verification token
    const emailVerificationToken = generateToken(32);
    
    // Create applicant in transaction
    const applicant = await transaction(async (client) => {
      // Create applicant with verification token
      const applicantResult = await client.query(
        `INSERT INTO applicants ("serialNumber", email, "phoneNumber", "passwordHash", status, "emailVerified", "emailVerificationToken")
         VALUES ($1, $2, $3, $4, 'REGISTERED', false, $5)
         RETURNING id, "serialNumber", email, "phoneNumber", status, "createdAt"`,
        [toUpperCase(cleanSerial), cleanEmail, normalizePhoneNumber(cleanPhone), hashedPassword, emailVerificationToken]
      );
      
      // Mark voucher as used and ensure contact details are saved
      await client.query(
        `UPDATE vouchers 
         SET "isUsed" = true, "usedAt" = NOW(), "applicantId" = $1, email = $3, "phoneNumber" = $4 
         WHERE id = $2`,
        [applicantResult.rows[0].id, voucher.id, cleanEmail, normalizePhoneNumber(cleanPhone)]
      );
      
      // Generate application ID
      const applicationId = await generateApplicationId();
      
      // Create empty application record
      const appResult = await client.query(
        `INSERT INTO applications ("applicantId", "applicationId", status, "currentStep")
         VALUES ($1, $2, 'DRAFT', 1)
         RETURNING id`,
        [applicantResult.rows[0].id, applicationId]
      );

      const appId = appResult.rows[0].id;

      // Initialize contact_info with registration details
      await client.query(
        `INSERT INTO contact_info ("applicationId", email, "phoneNumber")
         VALUES ($1, $2, $3)`,
        [appId, cleanEmail, normalizePhoneNumber(cleanPhone)]
      );
      
      // Log audit
      await client.query(
        `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
         VALUES ('REGISTER', 'applicant', $1, $1, 'applicant', $2)`,
        [applicantResult.rows[0].id, JSON.stringify({ email: email.toLowerCase(), applicationId })]
      );
      
      return {
        ...applicantResult.rows[0],
        applicationId
      };
    });
    
    // Generate tokens
    const accessToken = generateAccessToken({
      id: applicant.id,
      email: applicant.email,
      type: 'applicant'
    });
    
    const refreshToken = generateRefreshToken({
      id: applicant.id,
      email: applicant.email,
      type: 'applicant'
    });
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    };

    // Set cookies
    res.cookie('accessToken', accessToken, {
      ...cookieOptions
      // No maxAge = session cookie (cleared when browser closes)
    });
    
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Cache session in Redis
    await cacheSet(`user:${applicant.id}:session`, refreshToken, 60 * 60 * 24 * 7); // 7 days

    // Send email verification link (async)
    sendEmailVerification(applicant.email, {
      token: emailVerificationToken,
      serialNumber: applicant.serialNumber
    }).catch(err => logger.error('Failed to send email verification:', err));
    
    // Send registration confirmation email (async)
    sendRegistrationConfirmation(applicant.email, {
      serialNumber: applicant.serialNumber,
      email: applicant.email
    }).catch(err => logger.error('Failed to send registration confirmation email:', err));
    
    return successResponse(res, {
      user: {
        id: applicant.id,
        serialNumber: applicant.serialNumber,
        email: applicant.email,
        phoneNumber: applicant.phoneNumber,
        status: applicant.status,
        applicationId: applicant.applicationId
      },
      accessToken,
      refreshToken
    }, 'Registration successful', 201);
    
  } catch (error) {
    logger.error('Registration error:', error.message);
    logger.error('Registration error stack:', error.stack);
    return errorResponse(res, 'Registration failed: ' + error.message, 500);
  }
};

/**
 * Applicant login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find applicant with application info
    const result = await query(
      `SELECT a.id, a."serialNumber", a.email, a."phoneNumber", a."passwordHash", a.status,
              app."applicationId"
       FROM applicants a
       LEFT JOIN applications app ON a.id = app."applicantId"
       WHERE a.email = $1`,
      [email.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'Invalid email or password', 401);
    }
    
    const applicant = result.rows[0];
    
    // Verify password
    const isValidPassword = await comparePassword(password, applicant.passwordHash);
    if (!isValidPassword) {
      return errorResponse(res, 'Invalid email or password', 401);
    }
    
    // Generate tokens
    const accessToken = generateAccessToken({
      id: applicant.id,
      email: applicant.email,
      type: 'applicant'
    });
    
    const refreshToken = generateRefreshToken({
      id: applicant.id,
      email: applicant.email,
      type: 'applicant'
    });
    
    // Update last login
    await query(
      'UPDATE applicants SET "lastLogin" = NOW() WHERE id = $1',
      [applicant.id]
    );
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    };

    // Set cookies
    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Cache session in Redis
    await cacheSet(`user:${applicant.id}:session`, refreshToken, 60 * 60 * 24 * 7); // 7 days
    
    return successResponse(res, {
      user: applicant,
      accessToken,
      refreshToken
    }, 'Login successful');
    
  } catch (error) {
    logger.error('Login error:', error);
    return errorResponse(res, 'Login failed', 500);
  }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    const cookieToken = req.cookies?.refreshToken;
    const finalToken = token || cookieToken;
    
    if (!finalToken) {
      return errorResponse(res, 'Refresh token required', 401);
    }
    
    const decoded = verifyRefreshToken(finalToken);
    if (!decoded) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }
    
    // Verify user still exists
    const result = await query(
      'SELECT id, email FROM applicants WHERE id = $1',
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'User not found', 401);
    }
    
    // Generate new access token
    const newAccessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
      type: 'applicant'
    });
    
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });
    
    return successResponse(res, { accessToken: newAccessToken });
    
  } catch (error) {
    logger.error('Token refresh error:', error);
    return errorResponse(res, 'Token refresh failed', 500);
  }
};

/**
 * Logout
 */
const logout = async (req, res) => {
  try {
    // Cookie options must match those used when setting the cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    };
    
    // Clear cookies with matching options
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    
    // Clear from cache if using Redis sessions
    if (req.user?.id) {
      await cacheDelete(`user:${req.user.id}:session`);
    }
    
    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    logger.error('Logout error:', error);
    return errorResponse(res, 'Logout failed', 500);
  }
};

/**
 * Get current user
 */
const getCurrentUser = async (req, res) => {
  try {
    const result = await query(
      `SELECT a.id, a."serialNumber", a.email, a."phoneNumber", a.status, a."createdAt",
              app."currentStep", app.status as "applicationStatus", app."applicationId",
              app."requiredDocuments", app."documentRequestMessage", app."rejectionReason", app."reviewComments",
              pi."firstName", pi."middleName", pi."lastName",
              (SELECT "filePath" FROM documents WHERE "applicationId" = app.id AND "documentType" IN ('PASSPORT_PHOTO', 'passportPhoto') LIMIT 1) as "passportPhotoPath"
       FROM applicants a
       LEFT JOIN applications app ON a.id = app."applicantId"
       LEFT JOIN personal_info pi ON app.id = pi."applicationId"
       WHERE a.id = $1`,
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'User not found', 404);
    }
    
    const user = result.rows[0];
    
    // Construct full name if personal info exists
    let fullName = null;
    if (user.firstName) {
      fullName = [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(' ');
    }
    
    return successResponse(res, {
      ...user,
      fullName: fullName,
      profileImage: user.passportPhotoPath ? formatDocument({ filePath: user.passportPhotoPath }).url : null
    });
    
  } catch (error) {
    logger.error('Get current user error:', error);
    return errorResponse(res, 'Failed to get user info', 500);
  }
};

/**
 * Forgot password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const result = await query(
      'SELECT id, email FROM applicants WHERE email = $1',
      [email.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      // Don't reveal if email exists
      return successResponse(res, null, 'If this email exists, a reset link has been sent');
    }
    
    const user = result.rows[0];
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Store reset token
    await query(
      `UPDATE applicants 
       SET "resetToken" = $1, "resetTokenExpires" = $2 
       WHERE id = $3`,
      [resetToken, expiresAt, user.id]
    );
    
    // Send email with reset link
    await sendPasswordReset(user.email, resetToken);
    
    logger.info(`Password reset requested for ${email}`);
    
    return successResponse(res, null, 'If this email exists, a reset link has been sent');
    
  } catch (error) {
    logger.error('Forgot password error:', error);
    return errorResponse(res, 'Failed to process request', 500);
  }
};

/**
 * Reset password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const result = await query(
      `SELECT id FROM applicants 
       WHERE "resetToken" = $1 AND "resetTokenExpires" > NOW()`,
      [token]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'Invalid or expired reset token', 400);
    }
    
    const hashedPassword = await hashPassword(password);
    
    await query(
      `UPDATE applicants 
       SET "passwordHash" = $1, "resetToken" = NULL, "resetTokenExpires" = NULL
       WHERE id = $2`,
      [hashedPassword, result.rows[0].id]
    );
    
    return successResponse(res, null, 'Password reset successful');
    
  } catch (error) {
    logger.error('Reset password error:', error);
    return errorResponse(res, 'Failed to reset password', 500);
  }
};

/**
 * Verify email
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const result = await query(
      'SELECT id FROM applicants WHERE "emailVerificationToken" = $1',
      [token]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'Invalid verification token', 400);
    }
    
    await query(
      `UPDATE applicants 
       SET "emailVerified" = true, "emailVerificationToken" = NULL
       WHERE id = $1`,
      [result.rows[0].id]
    );
    
    return successResponse(res, null, 'Email verified successfully');
    
  } catch (error) {
    logger.error('Email verification error:', error);
    return errorResponse(res, 'Failed to verify email', 500);
  }
};

module.exports = {
  validateVoucher,
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  verifyEmail
};
