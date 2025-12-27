const jwt = require('../config/jwt');
const { hashPassword, comparePassword } = require('../utils/passwordHasher');
const { User, Applicant, Admin } = require('../models');
const CacheService = require('./cache.service');
const EmailService = require('./email.service');
const crypto = require('crypto');

/**
 * Auth Service - Handles authentication, tokens, and password flows
 */
const AuthService = {
  /**
   * Generate access and refresh tokens for a user
   * @param {Object} user - User record
   * @param {string} type - User type (admin/applicant)
   */
  async generateTokens(user, type) {
    const payload = { id: user.id, type, email: user.email };
    const accessToken = jwt.generateAccessToken(payload);
    const refreshToken = jwt.generateRefreshToken(payload);

    // Store refresh token in cache with user identity
    await CacheService.set(`ref_token:${user.id}`, refreshToken, 7 * 24 * 3600); // 7 days

    return { accessToken, refreshToken };
  },

  /**
   * Register a new applicant
   * @param {Object} data - Registration data
   */
  async registerApplicant(data) {
    const { email, password, serialNumber, phoneNumber } = data;
    const passwordHash = await hashPassword(password);
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) throw new Error('Email already registered');

    // Create base user and applicant profile in a unified flow (ideally a transaction)
    // For now using the model methods which handle their own queries
    const user = await User.create({ email, passwordHash, userType: 'applicant' });
    
    const applicant = await Applicant.create({ 
      id: user.id, 
      serialNumber: serialNumber, 
      email, 
      phoneNumber: phoneNumber, 
      passwordHash: passwordHash 
    });

    // Send confirmation email
    await EmailService.sendRegistrationConfirmation(email, { serialNumber: serialNumber, email });

    return applicant;
  },

  /**
   * Authenticate a user
   * @param {string} email 
   * @param {string} password 
   * @param {string} type - user type
   */
  async login(email, password, type = 'applicant') {
    const model = type === 'admin' ? Admin : Applicant;
    const user = await model.findByEmail(email);
    
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      throw new Error('Invalid email or password');
    }

    if (user.status === 'BANNED' || user.status === 'INACTIVE') {
      throw new Error('This account has been disabled');
    }
    
    const tokens = await this.generateTokens(user, type);
    return { user, ...tokens };
  },

  /**
   * Refresh authentication status using a refresh token
   * @param {string} refreshToken 
   */
  async refreshTokens(refreshToken) {
    const decoded = jwt.verifyRefreshToken(refreshToken);
    if (!decoded) throw new Error('Invalid or expired refresh token');

    // Verify token exists in cache (not revoked)
    const storedToken = await CacheService.get(`ref_token:${decoded.id}`);
    if (storedToken !== refreshToken) throw new Error('Refresh token revoked');

    const model = decoded.type === 'admin' ? Admin : Applicant;
    const user = await model.findById(decoded.id);
    if (!user) throw new Error('User no longer exists');

    return await this.generateTokens(user, decoded.type);
  },

  /**
   * Revoke refresh tokens (Logout)
   * @param {string} userId 
   */
  async logout(userId) {
    await CacheService.del(`ref_token:${userId}`);
    return true;
  },

  /**
   * Initiate password reset flow
   * @param {string} email 
   */
  async forgotPassword(email) {
    const user = await User.findByEmail(email);
    if (!user) return true; // Silence for security

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store in cache for 1 hour
    await CacheService.set(`reset_pwd:${hashedToken}`, user.id, 3600);

    // Send email (we need a reset password method in email service)
    if (EmailService.sendPasswordReset) {
      await EmailService.sendPasswordReset(email, resetToken);
    }
    
    return true;
  }
};

module.exports = AuthService;
