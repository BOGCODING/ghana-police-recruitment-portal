const { User, Applicant } = require('../models');
const { hashPassword } = require('../utils/passwordHasher');

/**
 * User Service - Handles user management and profile operations
 */
const UserService = {
  /**
   * Get full profile for an applicant
   * @param {string} userId 
   */
  async getProfile(userId) {
    return await Applicant.findById(userId);
  },

  /**
   * Update applicant profile data
   * @param {string} userId 
   * @param {Object} data 
   */
  async updateProfile(userId, data) {
    return await Applicant.update(userId, data);
  },

  /**
   * Update user status (Active/Inactive/Banned)
   * @param {string} userId 
   * @param {string} status 
   */
  async updateStatus(userId, status) {
    return await Applicant.updateStatus(userId, status);
  },

  /**
   * Change user password
   * @param {string} userId 
   * @param {string} newPassword 
   */
  async changePassword(userId, newPassword) {
    const passwordHash = await hashPassword(newPassword);
    return await User.updatePassword(userId, passwordHash);
  }
};

module.exports = UserService;
