const { successResponse, errorResponse } = require('../utils/responseHandler');
const { formatDocument } = require('../utils/helpers');
const logger = require('../utils/logger');
const AuthService = require('../services/auth.service');
const AuthDTO = require('../dtos/Auth.dto');

/**
 * Validate voucher before registration
 */
const validateVoucher = async (req, res) => {
  try {
    const input = AuthDTO.toVoucherInput(req.body);
    
    // Check voucher exists and is valid
    const voucher = await AuthService.validateVoucher(input.serialNumber, input.pinCode);
    
    if (!voucher) {
      return errorResponse(res, 'Invalid or expired voucher', 400);
    }
    
    // Only return non-sensitive voucher info needed for registration confirmation
    return successResponse(res, {
      serialNumber: input.serialNumber,
      pinCode: input.pinCode,
      expiresAt: voucher.expiresAt
    }, 'Voucher validated successfully. Use your credentials to register.');
    
  } catch (error) {
    logger.error('Voucher validation error:', error.message);
    return errorResponse(res, 'Failed to validate voucher: ' + error.message, 500);
  }
};

/**
 * Register new applicant
 */
const register = async (req, res) => {
  try {
    const input = AuthDTO.toRegisterInput(req.body);
    
    const result = await AuthService.registerApplicant(input);
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    };

    // Set cookies
    res.cookie('accessToken', result.accessToken, {
      ...cookieOptions
      // No maxAge = session cookie
    });
    
    res.cookie('refreshToken', result.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    return successResponse(res, {
      user: AuthDTO.toCurrentUserResponse(result.applicant, result.application),
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }, 'Registration successful', 201);
    
  } catch (error) {
    logger.error('Registration error:', error.message);
    return errorResponse(res, 'Registration failed: ' + error.message, error.message.includes('already registered') ? 409 : 500);
  }
};

/**
 * Applicant login
 */
const login = async (req, res) => {
  try {
    const input = AuthDTO.toLoginInput(req.body);
    
    const result = await AuthService.login(input.email, input.password);
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    };

    // Set cookies
    res.cookie('accessToken', result.accessToken, cookieOptions);
    res.cookie('refreshToken', result.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    return successResponse(res, {
      user: AuthDTO.toCurrentUserResponse(result.applicant, {
        applicationId: result.applicant.applicationId,
        status: result.applicant.applicationStatus || result.applicant.status // Fallback if status not in join
      }),
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }, 'Login successful');
    
  } catch (error) {
    logger.error('Login error:', error.message);
    return errorResponse(res, 'Login failed: ' + error.message, 401);
  }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res) => {
  try {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    
    const result = await AuthService.refreshToken(token);
    
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });
    
    return successResponse(res, { accessToken: result.accessToken });
    
  } catch (error) {
    logger.error('Token refresh error:', error.message);
    return errorResponse(res, 'Token refresh failed', 401);
  }
};

/**
 * Logout
 */
const logout = async (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    };
    
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    
    if (req.user?.id) {
      await AuthService.logout(req.user.id);
    }
    
    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    logger.error('Logout error:', error);
    return errorResponse(res, 'Logout failed', 500);
  }
};

/**
 * Get current user
 * Not moving to Service for now as it's a specific view query
 */
const getCurrentUser = async (req, res) => {
  const { query } = require('../config/database');
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
    
    // Format passport photo if exists
    if (user.passportPhotoPath) {
      user.passportPhotoPath = formatDocument({ filePath: user.passportPhotoPath }).url;
    }
    
    // Use DTO for standardized response
    const formatted = AuthDTO.toCurrentUserResponse(user, user.applicationId ? user : null);
    
    return successResponse(res, formatted);
    
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
    const email = AuthDTO.cleanEmail(req.body.email);
    
    await AuthService.forgotPassword(email);
    
    // Always return success to prevent email enumeration
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
    
    await AuthService.resetPassword(token, password);
    
    return successResponse(res, null, 'Password reset successful');
    
  } catch (error) {
    logger.error('Reset password error:', error.message);
    return errorResponse(res, 'Failed to reset password: ' + error.message, 400);
  }
};

/**
 * Verify email
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    await AuthService.verifyEmail(token);
    
    return successResponse(res, null, 'Email verified successfully');
    
  } catch (error) {
    logger.error('Email verification error:', error.message);
    return errorResponse(res, 'Failed to verify email', 400);
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
