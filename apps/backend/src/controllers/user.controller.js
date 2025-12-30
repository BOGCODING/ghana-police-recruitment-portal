const { query, transaction } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/passwordHasher');
const { normalizePhoneNumber } = require('../utils/helpers');
const logger = require('../utils/logger');
const AuthDTO = require('../dtos/Auth.dto');

/**
 * Get current user profile
 */
const getMe = async (req, res) => {
  try {
    const result = await query(
      `SELECT a.id, a."serialNumber", a.email, a."phoneNumber", a.status, a."createdAt", a."lastLogin",
              app."currentStep", app.status as application_status, app."applicationId",
              pi."firstName", pi."middleName", pi."lastName"
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
    
    // Use DTO for standardized response
    const formatted = AuthDTO.toCurrentUserResponse(user, user.applicationId ? user : null);
    
    return successResponse(res, formatted);
    
  } catch (error) {
    logger.error('Get user profile error:', error);
    return errorResponse(res, 'Failed to get user profile', 500);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { phoneNumber, email } = req.body;
    
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (phoneNumber) {
      updates.push(`"phoneNumber" = $${paramCount++}`);
      values.push(normalizePhoneNumber(phoneNumber));
    }
    
    if (email) {
      // Check if email is already taken by another user
      const existing = await query(
        'SELECT id FROM applicants WHERE email = $1 AND id != $2',
        [email.toLowerCase(), req.user.id]
      );
      if (existing.rows.length > 0) {
        return errorResponse(res, 'Email already in use', 409);
      }
      updates.push(`email = $${paramCount++}`);
      values.push(email.toLowerCase());
    }
    
    if (updates.length === 0) {
      return errorResponse(res, 'No fields to update', 400);
    }
    
    values.push(req.user.id);
    
    const result = await query(
      `UPDATE applicants SET ${updates.join(', ')}, "updatedAt" = NOW()
       WHERE id = $${paramCount}
       RETURNING id, "serialNumber", email, "phoneNumber", status`,
      values
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'User not found', 404);
    }
    
    // Audit log
    await query(
      `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
       VALUES ('UPDATE_PROFILE', 'applicant', $1, $1, 'applicant', $2)`,
      [req.user.id, JSON.stringify({ phoneNumber, email })]
    );
    
    return successResponse(res, result.rows[0], 'Profile updated successfully');
    
  } catch (error) {
    logger.error('Update profile error:', error);
    return errorResponse(res, 'Failed to update profile', 500);
  }
};

/**
 * Change password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get current password hash
    const result = await query(
      'SELECT "passwordHash" FROM applicants WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'User not found', 404);
    }
    
    // Verify current password
    const isMatch = await comparePassword(currentPassword, result.rows[0].passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 401);
    }
    
    // Validate new password strength
    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      return errorResponse(res, 'Weak password', 400, validation.errors);
    }
    
    // Hash and update
    const hashedPassword = await hashPassword(newPassword);
    
    await transaction(async (client) => {
      await client.query(
        'UPDATE applicants SET "passwordHash" = $1, "updatedAt" = NOW() WHERE id = $2',
        [hashedPassword, req.user.id]
      );
      
      // Audit log
      await client.query(
        `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
         VALUES ('CHANGE_PASSWORD', 'applicant', $1, $1, 'applicant', $2)`,
        [req.user.id, JSON.stringify({ timestamp: new Date().toISOString() })]
      );
    });
    
    return successResponse(res, null, 'Password changed successfully');
    
  } catch (error) {
    logger.error('Change password error:', error);
    return errorResponse(res, 'Failed to change password', 500);
  }
};

/**
 * Delete account (soft delete - marks as inactive)
 */
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    
    // Verify password before deletion
    const result = await query(
      'SELECT "passwordHash" FROM applicants WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'User not found', 404);
    }
    
    const isMatch = await comparePassword(password, result.rows[0].passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Incorrect password', 401);
    }
    
    await transaction(async (client) => {
      // Soft delete - mark as inactive
      await client.query(
        'UPDATE applicants SET status = $1 WHERE id = $2',
        ['DELETED', req.user.id]
      );
      
      // Audit log
      await client.query(
        `INSERT INTO audit_logs (action, "entityType", "entityId", "userId", "userType", details)
         VALUES ('DELETE_ACCOUNT', 'applicant', $1, $1, 'applicant', $2)`,
        [req.user.id, JSON.stringify({ timestamp: new Date().toISOString() })]
      );
    });
    
    return successResponse(res, null, 'Account deleted successfully');
    
  } catch (error) {
    logger.error('Delete account error:', error);
    return errorResponse(res, 'Failed to delete account', 500);
  }
};

module.exports = {
  getMe,
  updateProfile,
  changePassword,
  deleteAccount
};
