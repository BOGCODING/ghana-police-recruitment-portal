const jwt = require('../config/jwt');
const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/passwordHasher');
const { generateResetToken, generateApplicationId, generateToken } = require('../utils/generators');
const { query, transaction } = require('../config/database');
const CacheService = require('./cache.service');
const EmailService = require('./email.service');
const logger = require('../utils/logger');
const { normalizePhoneNumber } = require('../utils/helpers');
const backoffUtils = require('../utils/backoff.utils');

/**
 * Auth Service - Handles authentication, tokens, and password flows
 */
const AuthService = {
  /**
   * Register a new applicant (Transactional)
   */
  async registerApplicant(data) {
    const { serialNumber, pinCode, email, phoneNumber, password } = data;
    const VoucherService = require('./voucher.service'); // Lazy load to avoid circular dep if any

    // 1. Password Strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new Error('Weak password: ' + passwordValidation.errors.join(', '));
    }

    // 2. Initial Checks (Read-only)
    const existingUser = await query('SELECT id FROM applicants WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) throw new Error('Email already registered');

    // 3. Voucher Check
    const voucherResult = await VoucherService.validateVoucher(serialNumber, pinCode);
    if (!voucherResult.valid) throw new Error(voucherResult.message);
    const voucher = voucherResult.voucher;

    // Check consistency if voucher was pre-assigned
    if (voucher.email && voucher.email.toLowerCase() !== email.toLowerCase()) {
      throw new Error('This voucher is assigned to a different email address');
    }
    
    if (voucher.phoneNumber && normalizePhoneNumber(voucher.phoneNumber) !== normalizePhoneNumber(phoneNumber)) {
      throw new Error('This voucher is assigned to a different phone number');
    }

    const hashedPassword = await hashPassword(password);
    const emailVerificationToken = generateToken(32);

    // 4. Transactional Creation
    return await transaction(async (client) => {
      // Create applicant
      const applicantResult = await client.query(
        `INSERT INTO applicants ("serialNumber", email, "phoneNumber", "passwordHash", status, "emailVerified", "emailVerificationToken")
         VALUES ($1, $2, $3, $4, 'REGISTERED', false, $5)
         RETURNING id, "serialNumber", email, "phoneNumber", status, "createdAt"`,
        [serialNumber, email, phoneNumber, hashedPassword, emailVerificationToken]
      );
      const applicant = applicantResult.rows[0];

      // Mark voucher used
      const { Voucher: VoucherModel } = require('../models');
      await VoucherModel.markAsUsedWithClient(client, voucher.id, applicant.id, email, phoneNumber);

      // Create Application Draft
      const genAppId = await generateApplicationId();
      const appResult = await client.query(
        `INSERT INTO applications ("applicantId", "applicationId", status, "currentStep")
         VALUES ($1, $2, 'DRAFT', 1)
         RETURNING id`,
        [applicant.id, genAppId]
      );
      const appId = appResult.rows[0].id;

      // Initialize Contact Info
      await client.query(
        `INSERT INTO contact_info ("applicationId", email, "phoneNumber")
         VALUES ($1, $2, $3)`,
        [appId, email, phoneNumber]
      );

      // Audit Log
      await client.query(
        `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
         VALUES ('REGISTER', 'applicant', $1, $1, 'applicant', $2)`,
        [applicant.id, JSON.stringify({ email, applicationId: genAppId })]
      );

      // Determine tokens
      const { accessToken, refreshToken } = await this.generateTokens(applicant, 'applicant');

      // Send emails (Async - don't block response)
      EmailService.sendEmailVerification(email, {
        token: emailVerificationToken,
        serialNumber: serialNumber
      }).catch(err => logger.error('Failed to send email verification:', err));

      EmailService.sendRegistrationConfirmation(email, {
        serialNumber: serialNumber,
        email: email
      }).catch(err => logger.error('Failed to send registration confirmation:', err));

      const application = {
        id: appId,
        applicationId: genAppId,
        status: 'DRAFT',
        currentStep: 1
      };

      return {
        applicant,
        application,
        accessToken,
        refreshToken,
        emailVerificationToken
      };
    });
  },

  /**
   * Authenticate a user
   */
  async login(email, password) {
    // 1. Find user
    const result = await query(
      `SELECT a.id, a."serialNumber", a.email, a."phoneNumber", a."passwordHash", a.status,
              a."loginAttempts", a."lockUntil",
              app."applicationId"
       FROM applicants a
       LEFT JOIN applications app ON a.id = app."applicantId"
       WHERE a.email = $1`,
      [email]
    );

    if (result.rows.length === 0) throw new Error('Invalid email or password');
    const applicant = result.rows[0];

    // Check lockout
    if (applicant.lockUntil && new Date(applicant.lockUntil) > new Date()) {
      const remainingMinutes = Math.ceil((new Date(applicant.lockUntil) - new Date()) / 60000);
      throw new Error(`Account is locked. Please try again in ${remainingMinutes} minutes.`);
    }

    // 2. Verify Password
    const isMatch = await comparePassword(password, applicant.passwordHash);
    
    if (!isMatch) {
      // Increment attempts
      const attempts = (applicant.loginAttempts || 0) + 1;
      let lockUntil = null;
      
      const lockoutDuration = backoffUtils.getLockoutDuration(attempts);
      if (lockoutDuration > 0) {
        lockUntil = new Date(Date.now() + lockoutDuration);
      }
      
      await query(
        'UPDATE applicants SET "loginAttempts" = $1, "lockUntil" = $2 WHERE id = $3',
        [attempts, lockUntil, applicant.id]
      );
      
      if (lockoutDuration > 0) {
        const minutes = Math.ceil(lockoutDuration / 60000);
        const hours = Math.floor(minutes / 60);
        const timeStr = hours >= 1 ? `${hours} hour(s)` : `${minutes} minutes`;
        throw new Error(`Too many failed attempts. Account locked for ${timeStr}.`);
      }
      throw new Error('Invalid email or password');
    }

    if (applicant.status === 'BANNED' || applicant.status === 'INACTIVE') {
      throw new Error('This account has been disabled');
    }

    // 3. Generate Tokens & Update Last Login
    const tokens = await this.generateTokens(applicant, 'applicant');
    
    // Reset attempts on success
    await query(
      'UPDATE applicants SET "lastLogin" = NOW(), "loginAttempts" = 0, "lockUntil" = NULL WHERE id = $1',
      [applicant.id]
    );

    return { applicant, ...tokens };
  },

  /**
   * Generate tokens helper
   */
  async generateTokens(user, type) {
    const payload = { id: user.id, email: user.email, type };
    const accessToken = jwt.generateAccessToken(payload);
    const refreshToken = jwt.generateRefreshToken(payload);

    await CacheService.set(`user:${user.id}:session`, refreshToken, 7 * 24 * 3600);
    return { accessToken, refreshToken };
  },

  /**
   * Refresh authentication status
   */
  async refreshToken(token) {
    if (!token) throw new Error('Refresh token required');
    const decoded = jwt.verifyRefreshToken(token);
    if (!decoded) throw new Error('Invalid refresh token');

    // Verify session in Redis
    const storedToken = await CacheService.get(`user:${decoded.id}:session`);
    if (storedToken && storedToken !== token) {
      // Possible token reuse attack or just old token
      throw new Error('Invalid refresh token'); 
    }

    // Verify user exists
    const result = await query('SELECT id, email FROM applicants WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) throw new Error('User not found');

    const newAccessToken = jwt.generateAccessToken({
      id: decoded.id,
      email: decoded.email,
      type: 'applicant'
    });

    return { accessToken: newAccessToken };
  },

  /**
   * Initiate password reset
   */
  async forgotPassword(email) {
    const result = await query('SELECT id, email FROM applicants WHERE email = $1', [email]);
    if (result.rows.length === 0) return null; // Return null to indicate no-op/silence

    const user = result.rows[0];
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query(
      'UPDATE applicants SET "resetToken" = $1, "resetTokenExpires" = $2 WHERE id = $3',
      [resetToken, expiresAt, user.id]
    );

    // Send email
    if (EmailService.sendPasswordReset) {
      EmailService.sendPasswordReset(email, resetToken)
        .catch(err => logger.error('Failed to send password reset email:', err));
    }

    return { user, resetToken };
  },

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    const result = await query(
      'SELECT id FROM applicants WHERE "resetToken" = $1 AND "resetTokenExpires" > NOW()',
      [token]
    );

    if (result.rows.length === 0) throw new Error('Invalid or expired reset token');

    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) throw new Error('Weak password');

    const hashedPassword = await hashPassword(newPassword);

    await query(
      'UPDATE applicants SET "passwordHash" = $1, "resetToken" = NULL, "resetTokenExpires" = NULL WHERE id = $2',
      [hashedPassword, result.rows[0].id]
    );

    return true;
  },
  
  /**
   * Verify email
   */
  async verifyEmail(token) {
    const result = await query(
      'SELECT id FROM applicants WHERE "emailVerificationToken" = $1',
      [token]
    );
    
    if (result.rows.length === 0) throw new Error('Invalid verification token');
    
    await query(
      'UPDATE applicants SET "emailVerified" = true, "emailVerificationToken" = NULL WHERE id = $1',
      [result.rows[0].id]
    );
    
    return true;
  }
};

module.exports = AuthService;
