const { Notification } = require('../models');
const { emitToUser } = require('../websocket');

/**
 * Notification Service - Handles system and real-time notifications
 */
const NotificationService = {
  /**
   * Send a notification to a user
   */
  async send(userId, userType, title, message, type = 'info', data = {}) {
    const notification = await Notification.create({
      userId: userId,
      userType: userType,
      title,
      message,
      type,
      data
    });

    // Emit real-time notification
    emitToUser(userId, 'notification:new', notification);
    
    return notification;
  },

  /**
   * Get notification history for a user
   */
  async getHistory(userId, userType, limit = 50) {
    return await Notification.findByUser(userId, userType, { limit });
  },

  /**
   * Get count of unread notifications
   */
  async getUnreadCount(userId, userType) {
    return await Notification.countUnread(userId, userType);
  },

  /**
   * Mark a specific notification as read
   */
  async markAsRead(id) {
    return await Notification.markAsRead(id);
  },

  /**
   * Mark all notifications for a user as read
   */
  async markAllAsRead(userId, userType) {
    return await Notification.markAllAsRead(userId, userType);
  }
};

module.exports = NotificationService;
